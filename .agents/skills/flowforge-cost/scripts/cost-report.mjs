#!/usr/bin/env node
// Attributes the cost of one workflow run to BPMN elements, lanes and phases and reconciles the
// parts against the session total. Deterministic: tokens come from the transcripts, prices from
// prices.json, the element lookup from the generated <workflow>-cost-map.json. No model involved.
//
// Usage:
//   node cost-report.mjs --map <cost-map.json> --session <session.jsonl> [options]
//   node cost-report.mjs --map <cost-map.json> --ledger <ledger.jsonl> [--session-id <id>] [options]
// Options:
//   --otel <file>         telemetry dump of the run (OTLP/JSON, one {path, body} per line): exact output tokens
//                         per request and the helper calls that have no transcript; see SKILL.md
//   --claude-json <file>  result of `claude -p --output-format json`; its total_cost_usd is compared
//   --prices <file>       default: prices.json next to this script
//   --out <dir>           default: <ledger dir>/<sessionId>/ or ./cost/<sessionId>/
//   --json                print cost.json to stdout as well
//
// Exit 0: reconciled (warnings allowed). Exit 1: a reconciliation check failed. Exit 2: bad usage.
// Attribution order per API request (first match wins):
//   1. subagent description starts with an element id of the map     -> that element
//   2. subagent agent type is the orchestrator agent                  -> Orchestrierung
//   3. attributionSkill names a skill of the map                      -> its element, or the skill group
//   4. subagent agent type is a lane agent                            -> that lane (element unknown)
//   5. main thread                                                    -> Orchestrierung
//   6. anything else                                                  -> nicht zugeordnet (never spread)

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { costOf, loadPrices, priceKey, readLedger, readOtel, readSession, sumUsage } from './read-usage.mjs'

const stripPlugin = (s) => (s ?? '').replace(/^[^:]+:/, '')

/** First word of a dispatch label; a composite id "Call_R1/R_4" (inner step of a call activity) falls back to "R_4". */
export function elementIdOf(description, map) {
  const first = (description ?? '').split(/\s+/)[0].replace(/[:,]$/, '')
  return [first, first.split('/').at(-1)].find((c) => c && map.elements[c]) ?? null
}

export function attribute(req, map) {
  if (req.source === 'auxiliary') return { type: 'auxiliary', id: req.description ?? 'Hilfsaufruf' }
  const dispatched = req.source === 'subagent' ? elementIdOf(req.description, map) : null
  if (dispatched) return { type: 'element', id: dispatched }
  const agent = stripPlugin(req.agentType)
  if (req.source === 'subagent' && map.orchestration.agentTypes.includes(agent)) return { type: 'orchestration', id: 'Orchestrierung' }
  const skill = stripPlugin(req.attributionSkill)
  if (skill && map.orchestration.skills.includes(skill)) return { type: 'orchestration', id: 'Orchestrierung' }
  if (skill && map.skills[skill]) {
    const ids = map.skills[skill]
    return ids.length === 1 ? { type: 'element', id: ids[0] } : { type: 'skill', id: skill }
  }
  if (req.source === 'subagent' && map.agentTypes[agent]) return { type: 'lane', id: map.agentTypes[agent] }
  if (req.source === 'main') return { type: 'orchestration', id: 'Orchestrierung' }
  return { type: 'unassigned', id: 'nicht zugeordnet' }
}

/** cost-state names carry context variants (claude-opus-5-5[1m]); sum them per priced model. */
export function sumCostState(costState, prices) {
  const by = new Map()
  for (const [model, v] of Object.entries(costState.modelUsage)) {
    const key = priceKey(model, prices) ?? model
    const cur = by.get(key) ?? { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, webSearch: 0, costUSD: 0 }
    cur.input += v.inputTokens; cur.output += v.outputTokens; cur.cacheRead += v.cacheReadInputTokens
    cur.cacheWrite += v.cacheCreationInputTokens; cur.webSearch += v.webSearchRequests ?? 0; cur.costUSD += v.costUSD
    by.set(key, cur)
  }
  return by
}

/**
 * The transcripts of Workflow-tool agents hold input and cache tokens exactly, but output_tokens only as a
 * streaming snapshot (`final: false`). Two ways to complete them, exact first:
 *   - otel: the run's own api_request events, joined on request id, give the exact output and also
 *     the helper calls (web search/fetch) that have no transcript at all;
 *   - cost-state: when everything else matches token for token, the output still missing per model is known
 *     exactly in total; it is distributed over the incomplete requests by text length. The total stays
 *     exact, the split per element is an estimate and reported as such (`estimatedOutput`).
 */
export function completeRequests({ requests, costState, otel, prices }) {
  let reqs = requests.map((r) => ({ ...r, usage: { ...r.usage } }))
  const info = { otel: null, estimate: null, lowerBound: [] }
  if (otel && otel.size) {
    const seen = new Set()
    let mismatch = 0
    reqs = reqs.map((r) => {
      const o = otel.get(r.requestId)
      if (!o) return r
      seen.add(r.requestId)
      if (o.usage.input !== r.usage.input || o.usage.cacheRead !== r.usage.cacheRead || o.usage.cacheWriteTotal !== r.usage.cacheWrite5m + r.usage.cacheWrite1h) mismatch++
      return { ...r, final: true, usage: { ...r.usage, output: o.usage.output } }
    })
    const aux = [...otel.values()].filter((o) => !seen.has(o.requestId)).map((o) => ({
      requestId: o.requestId, source: 'auxiliary', agentType: null, description: `Hilfsaufruf ${o.querySource ?? 'unbekannt'}`,
      model: o.model, final: true, costUsd: o.costUsd,
      usage: { input: o.usage.input, output: o.usage.output, cacheRead: o.usage.cacheRead, cacheWrite5m: o.usage.cacheWriteTotal, cacheWrite1h: 0, webSearch: 0 },
    }))
    reqs.push(...aux)
    info.otel = { matched: seen.size, auxiliary: aux.length, mismatch, events: otel.size }
    return { requests: reqs, info }
  }
  if (!costState) {
    const n = reqs.filter((r) => !r.final).length
    if (n) info.lowerBound.push({ model: null, requests: n, reason: 'kein cost-state' })
    return { requests: reqs, info }
  }
  const csBy = sumCostState(costState, prices)
  const groups = new Map()
  reqs.forEach((r, i) => groups.set(priceKey(r.model, prices) ?? r.model, [...(groups.get(priceKey(r.model, prices) ?? r.model) ?? []), i]))
  let estTokens = 0
  let estReqs = 0
  for (const [key, idxs] of groups) {
    const inc = idxs.filter((i) => !reqs[i].final)
    if (!inc.length) continue
    const cs = csBy.get(key)
    const have = sumUsage(idxs.map((i) => reqs[i].usage))
    const exact = cs && cs.input === have.input && cs.cacheRead === have.cacheRead && cs.cacheWrite === have.cacheWrite5m + have.cacheWrite1h
    const gap = cs ? cs.output - have.output : 0
    if (!exact || gap <= 0) { info.lowerBound.push({ model: key, requests: inc.length, reason: exact ? 'cost-state hat nicht mehr Ausgabe' : 'Tokens stimmen nicht überein' }); continue }
    const w = inc.map((i) => Math.max(reqs[i].chars || 0, 1))
    const W = w.reduce((a, b) => a + b, 0)
    inc.forEach((i, k) => {
      const e = (gap * w[k]) / W
      reqs[i] = { ...reqs[i], usage: { ...reqs[i].usage, output: reqs[i].usage.output + e }, estimatedOutput: e }
    })
    estTokens += gap
    estReqs += inc.length
  }
  if (estReqs) info.estimate = { outputTokens: estTokens, requests: estReqs, method: 'Textlänge' }
  return { requests: reqs, info }
}

export function buildReport({ requests: rawRequests, costState, otel = null, map, prices, claudeTotal, sessionId, version }) {
  const completed = completeRequests({ requests: rawRequests, costState, otel, prices })
  const requests = completed.requests
  const rows = new Map()
  const phaseCost = new Map() // phase -> {requests, costUsd}, per request: an agent's own workflowPhase fills what the map lacks
  const mcp = new Map()
  const byModel = new Map()
  let total = 0
  let estimatedUsd = 0
  for (const r of requests) {
    const cost = r.costUsd ?? costOf(r.model, r.usage, prices)
    const estUsd = r.estimatedOutput ? (r.estimatedOutput * prices.models[priceKey(r.model, prices)].output) / 1e6 : 0
    total += cost
    estimatedUsd += estUsd
    const a = attribute(r, map)
    const key = `${a.type}:${a.id}`
    if (!rows.has(key)) {
      const el = a.type === 'element' ? map.elements[a.id] : null
      const lane = el ? el.lane : a.type === 'lane' ? a.id : a.type === 'skill'
        ? [...new Set(map.skills[a.id].map((i) => map.elements[i]?.lane))].filter(Boolean)[0] ?? null : null
      rows.set(key, {
        type: a.type, id: a.id,
        label: el?.label ?? (a.type === 'lane' ? (map.lanes[a.id] ?? a.id) : a.type === 'skill' ? `Skill ${a.id}` : a.id),
        elements: a.type === 'skill' ? map.skills[a.id] : a.type === 'element' ? [a.id] : [],
        lane, phase: el?.phase ?? null, requests: 0, usage: [], costUsd: 0, estimatedUsd: 0,
        unassignedFrom: a.type === 'unassigned' ? new Set() : null,
      })
    }
    const row = rows.get(key)
    const phase = (a.type === 'element' ? map.elements[a.id]?.phase : null) ?? r.phase ?? null
    row.phase ??= phase
    const pc = phaseCost.get(phase ?? '(ohne Phase)') ?? { requests: 0, costUsd: 0 }
    phaseCost.set(phase ?? '(ohne Phase)', { requests: pc.requests + 1, costUsd: pc.costUsd + cost })
    row.requests++
    row.usage.push(r.usage)
    row.costUsd += cost
    row.estimatedUsd += estUsd
    row.unassignedFrom?.add(`${r.agentType ?? 'main'} | ${r.description ?? ''}`.slice(0, 80))
    if (r.attributionMcpServer) mcp.set(r.attributionMcpServer, (mcp.get(r.attributionMcpServer) ?? 0) + 1)
    const m = priceKey(r.model, prices) ?? r.model
    byModel.set(m, [...(byModel.get(m) ?? []), { usage: r.usage, cost }])
  }
  const outRows = [...rows.values()].map((r) => ({
    ...r, usage: sumUsage(r.usage), unassignedFrom: r.unassignedFrom ? [...r.unassignedFrom].slice(0, 10) : undefined,
  })).sort((a, b) => b.costUsd - a.costUsd)

  const rollup = (keyFn) => {
    const m = new Map()
    for (const r of outRows) {
      const k = keyFn(r)
      m.set(k, { requests: (m.get(k)?.requests ?? 0) + r.requests, costUsd: (m.get(k)?.costUsd ?? 0) + r.costUsd })
    }
    return [...m.entries()].map(([name, v]) => ({ name, ...v })).sort((a, b) => b.costUsd - a.costUsd)
  }
  const laneName = (r) => r.type === 'auxiliary' ? 'Hilfsaufrufe' : r.type === 'orchestration' || r.type === 'unassigned' ? r.id : (r.lane ? (map.lanes[r.lane] ?? r.lane) : '(Lane unbekannt)')
  const models = [...byModel.entries()].map(([model, list]) => ({
    model, requests: list.length, usage: sumUsage(list.map((x) => x.usage)), costUsd: list.reduce((s, x) => s + x.cost, 0),
  })).sort((a, b) => b.costUsd - a.costUsd)

  // ---- reconciliation ---------------------------------------------------------------------
  // cost-state is Claude Code's own running total of the PROCESS. It is the hard reference only when
  // it matches the transcripts token for token (a single uninterrupted run, e.g. `claude -p`). For a
  // resumed or cleared session it can hold less (earlier process) or lag behind (snapshot), which says
  // nothing about our attribution, so that is a warning and never a failure. Failures are what this
  // code can be blamed for: an unpriced model, a price table that does not reproduce costUSD on an
  // exact match, a claude -p total that does not match.
  const checks = []
  let aux = null
  if (!costState) {
    checks.push({ level: 'warn', text: 'Kein cost-state im Transkript: Summe der Teile kann nicht gegen die Session-Summe geprüft werden.' })
  } else {
    aux = { costUsd: 0, models: [] }
    // cost-state names carry context variants (claude-opus-5-5[1m]); sum them per priced model
    const csBy = sumCostState(costState, prices)
    for (const [key, cs] of csBy) {
      const mine = models.find((x) => x.model === key)
      const have = mine?.usage ?? sumUsage([])
      const diff = {
        input: cs.input - have.input, output: Math.round(cs.output - have.output), cacheRead: cs.cacheRead - have.cacheRead,
        cacheWrite: cs.cacheWrite - (have.cacheWrite5m + have.cacheWrite1h),
      }
      const lagging = Object.entries(diff).filter(([, d]) => d < 0).map(([k]) => k)
      const tokenExact = Object.values(diff).every((d) => d === 0) && (cs.webSearch === have.webSearch || have.webSearch === 0)
      if (lagging.length) {
        checks.push({
          level: 'warn',
          text: `${key}: cost-state steht hinter dem Transkript zurück (${lagging.join(', ')}). Die Session wurde fortgesetzt oder geleert, oder cost-state ist ein älterer Zwischenstand; die Transkriptsumme gilt.`,
        })
        continue
      }
      if (tokenExact && mine) {
        const drift = Math.abs(mine.costUsd - cs.costUSD)
        if (drift > Math.max(0.005, cs.costUSD * 0.005)) {
          checks.push({ level: 'fail', text: `${key}: Tokens stimmen exakt, aber der berechnete Preis (${mine.costUsd.toFixed(4)} USD) weicht von cost-state (${cs.costUSD.toFixed(4)} USD) ab. prices.json ${prices.version} ist veraltet oder falsch.` })
        }
      }
      const auxCost = cs.costUSD - (mine?.costUsd ?? 0)
      if (!tokenExact || auxCost > 0.0001) aux.models.push({ model: key, tokens: diff, costUsd: auxCost, inTranscript: !!mine })
      aux.costUsd += Math.max(0, auxCost)
    }
    for (const m of models) {
      if (!csBy.has(m.model)) checks.push({ level: 'warn', text: `${m.model}: im Transkript, aber nicht in cost-state (frühere Session oder anderer Prozess); die Transkriptsumme gilt.` })
    }
    const share = (total + aux.costUsd) > 0 ? aux.costUsd / (total + aux.costUsd) : 0
    if (share > 0.01) {
      const partial = aux.models.filter((x) => x.inTranscript)
      checks.push({
        level: 'warn',
        text: `${(share * 100).toFixed(1)} % der Kosten (${aux.costUsd.toFixed(4)} USD) stehen nur in cost-state. ` +
          (partial.length
            ? `Für ${partial.map((x) => x.model).join(', ')} fehlen Tokens im Transkript: Hilfsaufrufe ohne Transkript (WebSearch/WebFetch) oder eine fortgesetzte bzw. geleerte Session.`
            : 'Das sind Hilfsaufrufe (z. B. WebSearch-Hilfsmodell), die kein Transkript haben.'),
      })
    }
  }
  const grand = total + (aux?.costUsd ?? 0)
  if (claudeTotal != null) {
    const d = Math.abs(claudeTotal - grand)
    if (d > Math.max(0.005, claudeTotal * 0.01)) {
      checks.push({ level: 'fail', text: `total_cost_usd aus claude -p (${claudeTotal.toFixed(4)} USD) weicht um ${d.toFixed(4)} USD von der Summe aus Transkripten und Hilfsaufrufen (${grand.toFixed(4)} USD) ab.` })
    }
  }
  const { otel: otelInfo, estimate, lowerBound } = completed.info
  if (otelInfo) {
    checks.push({ level: 'info', text: `OpenTelemetry: ${otelInfo.matched} Anfragen exakt aus api_request-Ereignissen, ${otelInfo.auxiliary} Hilfsaufrufe ohne Transkript.` })
    if (otelInfo.mismatch) checks.push({ level: 'warn', text: `${otelInfo.mismatch} Anfrage(n): Eingabe-/Cache-Tokens aus Transkript und OpenTelemetry weichen ab.` })
  }
  if (estimate && total > 0) {
    checks.push({
      level: 'warn',
      text: `${((estimatedUsd / total) * 100).toFixed(1)} % der Kosten (${estimatedUsd.toFixed(4)} USD) sind geschätzt: bei ${estimate.requests} Anfragen steht im Transkript nur ein Zwischenstand der Ausgabe-Tokens (so schreibt Claude Code die Agents des Workflow-Tools). ` +
        `Die Gesamtsumme ist exakt (cost-state), die Verteilung der fehlenden ${Math.round(estimate.outputTokens).toLocaleString('en-US')} Ausgabe-Tokens folgt der ${estimate.method}. Exakt wird es mit --otel (Telemetrie des Laufs).`,
    })
  }
  for (const lb of lowerBound) {
    checks.push({ level: 'warn', text: `${lb.requests} Anfrage(n)${lb.model ? ` (${lb.model})` : ''} ohne endgültige Ausgabe-Tokens (${lb.reason}): die Ausgabe ist nur eine Untergrenze.` })
  }
  const unassigned = outRows.find((r) => r.type === 'unassigned')
  if (unassigned && total > 0 && unassigned.costUsd / total > 0.05) {
    checks.push({ level: 'warn', text: `${((unassigned.costUsd / total) * 100).toFixed(1)} % der Kosten sind keinem Element zugeordnet: Label-Konvention oder Kostenkarte prüfen.` })
  }

  return {
    workflow: map.workflow, sessionId, claudeCodeVersion: version, pricesVersion: prices.version,
    totals: { transcriptUsd: total, auxiliaryUsd: aux?.costUsd ?? null, sessionUsd: grand, requests: requests.length, estimatedUsd },
    estimate: estimate ? { ...estimate, usd: estimatedUsd } : null, otel: otelInfo,
    byUnit: outRows, byLane: rollup(laneName), byPhase: [...phaseCost.entries()].map(([name, v]) => ({ name, ...v })).sort((a, b) => b.costUsd - a.costUsd), byModel: models,
    auxiliary: aux, mcpCalls: Object.fromEntries(mcp),
    checks, ok: !checks.some((c) => c.level === 'fail'),
  }
}

const usd = (n) => (n == null ? '–' : n.toFixed(4))
const tok = (n) => n.toLocaleString('en-US')

export function renderMarkdown(r) {
  const L = []
  L.push(`# Laufkosten ${r.workflow}`, '')
  L.push(`Session \`${r.sessionId}\` · Preise \`prices.json\` ${r.pricesVersion} · Claude Code ${r.claudeCodeVersion ?? 'unbekannt'}`, '')
  L.push(`**Gesamt ${usd(r.totals.sessionUsd)} USD** (Transkripte ${usd(r.totals.transcriptUsd)} USD${r.totals.auxiliaryUsd ? `, Hilfsaufrufe/nicht im Transkript ${usd(r.totals.auxiliaryUsd)} USD` : ''}), ${r.totals.requests} API-Anfragen.`, '')
  if (r.estimate) L.push(`Davon **geschätzt ${usd(r.totals.estimatedUsd)} USD** (${((r.totals.estimatedUsd / (r.totals.transcriptUsd || 1)) * 100).toFixed(1)} %): Ausgabe-Tokens von ${r.estimate.requests} Anfragen, siehe Abgleich. Mit \`--otel\` wird daraus ein exakter Wert.`, '')
  L.push('## Abgleich', '')
  if (!r.checks.length) L.push('Alle Prüfungen bestanden: Tokens je Modell stimmen mit cost-state überein, der Preis reproduziert cost-state.', '')
  for (const c of r.checks) L.push(`- ${c.level === 'fail' ? '**FEHLER**' : 'Hinweis'}: ${c.text}`)
  if (r.checks.length) L.push('')
  const table = (head, rows) => [head.join(' | ').replace(/^/, '| ').replace(/$/, ' |'), head.map(() => '---').join(' | ').replace(/^/, '| ').replace(/$/, ' |'), ...rows.map((x) => `| ${x.join(' | ')} |`), '']
  L.push('## Je Lane', '', ...table(['Lane', 'Anfragen', 'USD', 'Anteil'], r.byLane.map((x) => [x.name, x.requests, usd(x.costUsd), `${((x.costUsd / (r.totals.transcriptUsd || 1)) * 100).toFixed(1)} %`])))
  L.push('## Je Phase', '', ...table(['Phase', 'Anfragen', 'USD'], r.byPhase.map((x) => [x.name, x.requests, usd(x.costUsd)])))
  L.push('## Je Element', '', ...table(['Element', 'Label', 'Lane', 'Anfragen', 'Input', 'Output', 'Cache-Read', 'Cache-Write', 'USD', 'davon geschätzt'],
    r.byUnit.map((x) => [x.type === 'element' ? `\`${x.id}\`` : x.type, x.label.replace(/\|/g, '/'), x.lane ?? '', x.requests, tok(x.usage.input), tok(Math.round(x.usage.output)), tok(x.usage.cacheRead), tok(x.usage.cacheWrite5m + x.usage.cacheWrite1h), usd(x.costUsd), x.estimatedUsd ? usd(x.estimatedUsd) : ''])))
  const un = r.byUnit.find((x) => x.type === 'unassigned')
  if (un?.unassignedFrom?.length) L.push('Nicht zugeordnet kommt von:', '', ...un.unassignedFrom.map((s) => `- ${s}`), '')
  L.push('## Je Modell', '', ...table(['Modell', 'Anfragen', 'Input', 'Output', 'Cache-Read', 'Cache-Write 5 min', 'Cache-Write 1 h', 'USD'],
    r.byModel.map((x) => [x.model, x.requests, tok(x.usage.input), tok(Math.round(x.usage.output)), tok(x.usage.cacheRead), tok(x.usage.cacheWrite5m), tok(x.usage.cacheWrite1h), usd(x.costUsd)])))
  if (Object.keys(r.mcpCalls).length) L.push('## MCP-Aufrufe (ohne Preis, außerhalb von Claude)', '', ...Object.entries(r.mcpCalls).map(([k, v]) => `- ${k}: ${v}`), '')
  return L.join('\n')
}

function parseArgs(argv) {
  const o = {}
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--json') o.json = true
    else if (a.startsWith('--')) o[a.slice(2)] = argv[++i]
    else o._ = [...(o._ ?? []), a]
  }
  return o
}

function main() {
  const o = parseArgs(process.argv.slice(2))
  if (!o.map || (!o.session && !o.ledger)) {
    console.error('usage: cost-report.mjs --map <cost-map.json> (--session <session.jsonl> | --ledger <ledger.jsonl>) [--claude-json f] [--out dir] [--json]')
    process.exit(2)
  }
  const map = JSON.parse(fs.readFileSync(o.map, 'utf8'))
  const prices = loadPrices(o.prices)
  let requests, costState, sessionId, version = null, defaultOut
  if (o.session) {
    const s = readSession(o.session)
    ;({ requests, costState, sessionId, version } = s)
    defaultOut = path.join('cost', sessionId)
  } else {
    const { requests: all, costStates } = readLedger(o.ledger)
    sessionId = o['session-id'] ?? all.at(-1)?.sessionId
    if (!sessionId) { console.error('ledger has no requests'); process.exit(2) }
    requests = all.filter((r) => r.sessionId === sessionId)
    costState = costStates.get(sessionId)?.costState ?? null
    version = costStates.get(sessionId)?.version ?? null
    defaultOut = path.join(path.dirname(o.ledger), sessionId)
  }
  const otel = o.otel ? readOtel(o.otel, sessionId) : null
  const claudeTotal = o['claude-json'] ? JSON.parse(fs.readFileSync(o['claude-json'], 'utf8')).total_cost_usd : null
  const report = buildReport({ requests, costState, otel, map, prices, claudeTotal, sessionId, version })
  const out = o.out ?? defaultOut
  fs.mkdirSync(out, { recursive: true })
  fs.writeFileSync(path.join(out, 'cost.json'), JSON.stringify(report, null, 2) + '\n')
  fs.writeFileSync(path.join(out, 'cost.md'), renderMarkdown(report))
  if (o.json) console.log(JSON.stringify(report, null, 2))
  console.log(`session ${sessionId}: ${usd(report.totals.sessionUsd)} USD, ${report.byUnit.length} cost units -> ${out}/cost.md`)
  for (const c of report.checks) console.log(`${c.level === 'fail' ? 'FAIL' : c.level === 'info' ? 'info' : 'warn'}: ${c.text}`)
  console.log(report.ok ? 'reconciliation ok' : 'RECONCILIATION FAILED')
  process.exit(report.ok ? 0 : 1)
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) main()
