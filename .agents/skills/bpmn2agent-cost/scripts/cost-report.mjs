#!/usr/bin/env node
// Attributes the cost of one workflow run to BPMN elements, lanes and phases and reconciles the
// parts against the session total. Deterministic: tokens come from the transcripts, prices from
// prices.json, the element lookup from the generated <workflow>-cost-map.json. No model involved.
//
// Usage:
//   node cost-report.mjs --map <cost-map.json> --session <session.jsonl> [options]
//   node cost-report.mjs --map <cost-map.json> --ledger <ledger.jsonl> [--session-id <id>] [options]
// Options:
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
import { costOf, loadPrices, priceKey, readLedger, readSession, sumUsage } from './read-usage.mjs'

const stripPlugin = (s) => (s ?? '').replace(/^[^:]+:/, '')

export function attribute(req, map) {
  const first = (req.description ?? '').split(/\s+/)[0].replace(/[:,]$/, '')
  if (req.source === 'subagent' && map.elements[first]) return { type: 'element', id: first }
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

const MODEL_TOKEN_FIELDS = [
  ['input', 'inputTokens'], ['output', 'outputTokens'], ['cacheRead', 'cacheReadInputTokens'],
]

export function buildReport({ requests, costState, map, prices, claudeTotal, sessionId, version, incomplete = 0 }) {
  const rows = new Map()
  const mcp = new Map()
  const byModel = new Map()
  let total = 0
  for (const r of requests) {
    const cost = costOf(r.model, r.usage, prices)
    total += cost
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
        lane, phase: el?.phase ?? null, requests: 0, usage: [], costUsd: 0,
        unassignedFrom: a.type === 'unassigned' ? new Set() : null,
      })
    }
    const row = rows.get(key)
    row.requests++
    row.usage.push(r.usage)
    row.costUsd += cost
    row.unassignedFrom?.add(`${r.agentType ?? 'main'} | ${r.description ?? ''}`.slice(0, 80))
    if (r.attributionMcpServer) mcp.set(r.attributionMcpServer, (mcp.get(r.attributionMcpServer) ?? 0) + 1)
    const m = priceKey(r.model, prices)
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
  const laneName = (r) => r.type === 'orchestration' || r.type === 'unassigned' ? r.id : (r.lane ? (map.lanes[r.lane] ?? r.lane) : '(Lane unbekannt)')
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
    const csBy = new Map()
    for (const [model, v] of Object.entries(costState.modelUsage)) {
      const key = priceKey(model, prices) ?? model
      const cur = csBy.get(key) ?? { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, webSearch: 0, costUSD: 0, names: [] }
      cur.input += v.inputTokens; cur.output += v.outputTokens; cur.cacheRead += v.cacheReadInputTokens
      cur.cacheWrite += v.cacheCreationInputTokens; cur.webSearch += v.webSearchRequests ?? 0; cur.costUSD += v.costUSD
      cur.names.push(model)
      csBy.set(key, cur)
    }
    for (const [key, cs] of csBy) {
      const mine = models.find((x) => x.model === key)
      const have = mine?.usage ?? sumUsage([])
      const diff = {
        input: cs.input - have.input, output: cs.output - have.output, cacheRead: cs.cacheRead - have.cacheRead,
        cacheWrite: cs.cacheWrite - (have.cacheWrite5m + have.cacheWrite1h),
      }
      const lagging = Object.entries(diff).filter(([, d]) => d < 0).map(([k]) => k)
      const tokenExact = Object.values(diff).every((d) => d === 0) && cs.webSearch === have.webSearch
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
            ? `Für ${partial.map((x) => x.model).join(', ')} fehlen Tokens im Transkript: die Session wurde vermutlich fortgesetzt oder geleert.`
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
  if (incomplete) checks.push({ level: 'warn', text: `${incomplete} Anfrage(n) ohne stop_reason (noch nicht abgeschlossen) wurden nicht mitgezählt.` })
  const unassigned = outRows.find((r) => r.type === 'unassigned')
  if (unassigned && total > 0 && unassigned.costUsd / total > 0.05) {
    checks.push({ level: 'warn', text: `${((unassigned.costUsd / total) * 100).toFixed(1)} % der Kosten sind keinem Element zugeordnet: Label-Konvention oder Kostenkarte prüfen.` })
  }

  return {
    workflow: map.workflow, sessionId, claudeCodeVersion: version, pricesVersion: prices.version,
    totals: { transcriptUsd: total, auxiliaryUsd: aux?.costUsd ?? null, sessionUsd: grand, requests: requests.length },
    byUnit: outRows, byLane: rollup(laneName), byPhase: rollup((r) => r.phase ?? '(ohne Phase)'), byModel: models,
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
  L.push('## Abgleich', '')
  if (!r.checks.length) L.push('Alle Prüfungen bestanden: Tokens je Modell stimmen mit cost-state überein, der Preis reproduziert cost-state.', '')
  for (const c of r.checks) L.push(`- ${c.level === 'fail' ? '**FEHLER**' : 'Hinweis'}: ${c.text}`)
  if (r.checks.length) L.push('')
  const table = (head, rows) => [head.join(' | ').replace(/^/, '| ').replace(/$/, ' |'), head.map(() => '---').join(' | ').replace(/^/, '| ').replace(/$/, ' |'), ...rows.map((x) => `| ${x.join(' | ')} |`), '']
  L.push('## Je Lane', '', ...table(['Lane', 'Anfragen', 'USD', 'Anteil'], r.byLane.map((x) => [x.name, x.requests, usd(x.costUsd), `${((x.costUsd / (r.totals.transcriptUsd || 1)) * 100).toFixed(1)} %`])))
  L.push('## Je Phase', '', ...table(['Phase', 'Anfragen', 'USD'], r.byPhase.map((x) => [x.name, x.requests, usd(x.costUsd)])))
  L.push('## Je Element', '', ...table(['Element', 'Label', 'Lane', 'Anfragen', 'Input', 'Output', 'Cache-Read', 'Cache-Write', 'USD'],
    r.byUnit.map((x) => [x.type === 'element' ? `\`${x.id}\`` : x.type, x.label.replace(/\|/g, '/'), x.lane ?? '', x.requests, tok(x.usage.input), tok(x.usage.output), tok(x.usage.cacheRead), tok(x.usage.cacheWrite5m + x.usage.cacheWrite1h), usd(x.costUsd)])))
  const un = r.byUnit.find((x) => x.type === 'unassigned')
  if (un?.unassignedFrom?.length) L.push('Nicht zugeordnet kommt von:', '', ...un.unassignedFrom.map((s) => `- ${s}`), '')
  L.push('## Je Modell', '', ...table(['Modell', 'Anfragen', 'Input', 'Output', 'Cache-Read', 'Cache-Write 5 min', 'Cache-Write 1 h', 'USD'],
    r.byModel.map((x) => [x.model, x.requests, tok(x.usage.input), tok(x.usage.output), tok(x.usage.cacheRead), tok(x.usage.cacheWrite5m), tok(x.usage.cacheWrite1h), usd(x.costUsd)])))
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
  let requests, costState, sessionId, version = null, incomplete = 0, defaultOut
  if (o.session) {
    const s = readSession(o.session)
    ;({ requests, costState, sessionId, version, incomplete } = s)
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
  const claudeTotal = o['claude-json'] ? JSON.parse(fs.readFileSync(o['claude-json'], 'utf8')).total_cost_usd : null
  const report = buildReport({ requests, costState, map, prices, claudeTotal, sessionId, version, incomplete })
  const out = o.out ?? defaultOut
  fs.mkdirSync(out, { recursive: true })
  fs.writeFileSync(path.join(out, 'cost.json'), JSON.stringify(report, null, 2) + '\n')
  fs.writeFileSync(path.join(out, 'cost.md'), renderMarkdown(report))
  if (o.json) console.log(JSON.stringify(report, null, 2))
  console.log(`session ${sessionId}: ${usd(report.totals.sessionUsd)} USD, ${report.byUnit.length} cost units -> ${out}/cost.md`)
  for (const c of report.checks) console.log(`${c.level === 'fail' ? 'FAIL' : 'warn'}: ${c.text}`)
  console.log(report.ok ? 'reconciliation ok' : 'RECONCILIATION FAILED')
  process.exit(report.ok ? 0 : 1)
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) main()
