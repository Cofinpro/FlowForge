#!/usr/bin/env node
// Runs the same input through a generated workflow N times with `claude -p` and reports the cost
// per BPMN element as median and spread. Measuring is deterministic, the runs are not: one run says
// little, the spread over several says what a step really costs.
//
// Usage:
//   node cost-bench.mjs --map <cost-map.json> --prompt "<what to run>" --template <project dir> --confirm [options]
// Options:
//   --prompt-file <f>     read the prompt from a file instead
//   --template <dir>      project directory (with the installed workflow); each run gets a fresh copy.
//                         Without it the runs share --cwd (default .) and see each other's results.
//   --runs <n>            default 5
//   --drop-first          leave the first run out of the statistics (cache writes make it dearer)
//   --max-usd <x>         stop starting new runs once the runs so far cost more than x
//   --claude-args "<..>"  extra arguments for claude, split on spaces (e.g. "--permission-mode acceptEdits")
//   --claude-bin <path>   default: claude (a .mjs path is run with node)
//   --allow-checkpoints   the prompt already answers every human checkpoint of the workflow
//   --out <dir>           default: ./cost-bench ; writes bench.json and bench.md
//   --confirm             required: every run spends real money. Without it only the plan is printed.
//
// A workflow with human checkpoints on its path cannot run headless; it is refused unless
// --allow-checkpoints says the prompt carries the answers.

import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildReport } from './cost-report.mjs'
import { loadPrices, readSession } from './read-usage.mjs'

export function quantile(sorted, q) {
  if (!sorted.length) return 0
  const pos = (sorted.length - 1) * q
  const lo = Math.floor(pos)
  const hi = Math.ceil(pos)
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo)
}

export function stats(values) {
  const s = [...values].sort((a, b) => a - b)
  return { n: s.length, median: quantile(s, 0.5), min: s[0] ?? 0, max: s.at(-1) ?? 0, iqr: quantile(s, 0.75) - quantile(s, 0.25) }
}

/** reports: buildReport results of the kept runs -> per-unit statistics (a run without the unit counts as 0). */
export function aggregate(reports) {
  const units = new Map()
  for (const rep of reports) for (const u of rep.byUnit) {
    const key = `${u.type}:${u.id}`
    if (!units.has(key)) units.set(key, { type: u.type, id: u.id, label: u.label, lane: u.lane, perRun: new Array(reports.length).fill(0) })
  }
  reports.forEach((rep, i) => {
    for (const u of rep.byUnit) units.get(`${u.type}:${u.id}`).perRun[i] = u.costUsd
  })
  const rows = [...units.values()].map((u) => ({ ...u, ...stats(u.perRun) })).sort((a, b) => b.median - a.median)
  return {
    runs: reports.length,
    total: stats(reports.map((r) => r.totals.sessionUsd)),
    lanes: aggregateBy(reports, (r) => r.byLane),
    phases: aggregateBy(reports, (r) => r.byPhase),
    units: rows,
  }
}

function aggregateBy(reports, pick) {
  const names = new Set(reports.flatMap((r) => pick(r).map((x) => x.name)))
  return [...names].map((name) => ({
    name, ...stats(reports.map((r) => pick(r).find((x) => x.name === name)?.costUsd ?? 0)),
  })).sort((a, b) => b.median - a.median)
}

const usd = (n) => n.toFixed(4)

export function renderBenchMarkdown(workflow, agg, runInfo) {
  const t = (head, rows) => [`| ${head.join(' | ')} |`, `| ${head.map(() => '---').join(' | ')} |`, ...rows.map((r) => `| ${r.join(' | ')} |`), '']
  const L = [`# Kostenstreuung ${workflow}`, '', `${agg.runs} Läufe${runInfo.dropped ? ` (erster Lauf verworfen)` : ''}, Preise \`prices.json\` ${runInfo.pricesVersion}.`, '']
  L.push(`**Gesamt je Lauf:** Median ${usd(agg.total.median)} USD, Spanne ${usd(agg.total.min)}–${usd(agg.total.max)} USD, IQR ${usd(agg.total.iqr)} USD.`, '')
  if (agg.runs < 3) L.push('Hinweis: unter 3 Läufen sind Median und IQR nicht aussagekräftig.', '')
  const row = (x) => [x.name ?? x.label, usd(x.median), usd(x.min), usd(x.max), usd(x.iqr), x.n]
  L.push('## Je Lane', '', ...t(['Lane', 'Median', 'Min', 'Max', 'IQR', 'Läufe'], agg.lanes.map(row)))
  L.push('## Je Phase', '', ...t(['Phase', 'Median', 'Min', 'Max', 'IQR', 'Läufe'], agg.phases.map(row)))
  L.push('## Je Element', '', ...t(['Element', 'Label', 'Median', 'Min', 'Max', 'IQR'], agg.units.map((u) => [u.type === 'element' ? `\`${u.id}\`` : u.type, u.label.replace(/\|/g, '/'), usd(u.median), usd(u.min), usd(u.max), usd(u.iqr)])))
  L.push('## Läufe', '', ...t(['Lauf', 'Session', 'USD', 'Abgleich'], runInfo.runs.map((r, i) => [i + 1, r.sessionId, usd(r.totalUsd), r.ok ? 'ok' : 'FEHLER'])))
  return L.join('\n')
}

function findTranscript(sessionId) {
  const root = path.join(process.env.CLAUDE_CONFIG_DIR ?? path.join(os.homedir(), '.claude'), 'projects')
  for (const d of fs.existsSync(root) ? fs.readdirSync(root) : []) {
    const f = path.join(root, d, `${sessionId}.jsonl`)
    if (fs.existsSync(f)) return f
  }
  return null
}

function parseArgs(argv) {
  const flags = new Set(['--confirm', '--drop-first', '--allow-checkpoints'])
  const o = {}
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (!a.startsWith('--')) continue
    o[a.slice(2)] = flags.has(a) ? true : argv[++i]
  }
  return o
}

function main() {
  const o = parseArgs(process.argv.slice(2))
  const prompt = o['prompt-file'] ? fs.readFileSync(o['prompt-file'], 'utf8') : o.prompt
  if (!o.map || !prompt) {
    console.error('usage: cost-bench.mjs --map <cost-map.json> --prompt "<text>" --template <dir> --confirm [--runs 5] [--drop-first] [--max-usd x]')
    process.exit(2)
  }
  const map = JSON.parse(fs.readFileSync(o.map, 'utf8'))
  const runs = Number(o.runs ?? 5)
  if ((map.humanCheckpoints ?? []).length && !o['allow-checkpoints']) {
    console.error(`${map.workflow} has human checkpoints (${map.humanCheckpoints.map((c) => c.id).join(', ')}); claude -p cannot answer them.\n` +
      'Put the answers into the prompt and pass --allow-checkpoints, or benchmark a workflow without checkpoints on its path.')
    process.exit(2)
  }
  console.log(`plan: ${runs} run(s) of ${map.workflow} with claude -p${o.template ? `, each in a fresh copy of ${o.template}` : `, all in ${o.cwd ?? '.'} (they share state)`}${o['max-usd'] ? `, stop above ${o['max-usd']} USD` : ''}.`)
  if (!o.confirm) {
    console.log('Every run spends real money. Re-run with --confirm to start.')
    process.exit(0)
  }
  const prices = loadPrices()
  const bin = o['claude-bin'] ?? 'claude'
  const extra = (o['claude-args'] ?? '').split(/\s+/).filter(Boolean)
  const results = []
  let spent = 0
  for (let i = 0; i < runs; i++) {
    if (o['max-usd'] && spent > Number(o['max-usd'])) { console.log(`budget ${o['max-usd']} USD exceeded after ${i} run(s), stopping`); break }
    let cwd = path.resolve(o.cwd ?? '.')
    if (o.template) {
      cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'cost-bench-'))
      fs.cpSync(o.template, cwd, { recursive: true })
    }
    const cmd = bin.endsWith('.mjs') ? ['node', [bin, '-p', prompt, '--output-format', 'json', ...extra]] : [bin, ['-p', prompt, '--output-format', 'json', ...extra]]
    const r = spawnSync(cmd[0], cmd[1], { cwd, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 })
    if (r.status !== 0) { console.error(`run ${i + 1} failed (exit ${r.status}): ${(r.stderr || r.stdout).slice(0, 400)}`); process.exit(1) }
    const result = JSON.parse(r.stdout.trim().split('\n').at(-1))
    const transcript = findTranscript(result.session_id)
    if (!transcript) { console.error(`run ${i + 1}: no transcript found for session ${result.session_id}`); process.exit(1) }
    const s = readSession(transcript)
    const report = buildReport({ ...s, map, prices, claudeTotal: result.total_cost_usd })
    spent += report.totals.sessionUsd
    results.push({ sessionId: s.sessionId, totalUsd: report.totals.sessionUsd, ok: report.ok, report })
    console.log(`run ${i + 1}/${runs}: ${usd(report.totals.sessionUsd)} USD${report.ok ? '' : ' (reconciliation failed)'}`)
  }
  const kept = o['drop-first'] ? results.slice(1) : results
  if (!kept.length) { console.error('no run left to report'); process.exit(1) }
  const agg = aggregate(kept.map((r) => r.report))
  const out = path.resolve(o.out ?? 'cost-bench')
  fs.mkdirSync(out, { recursive: true })
  const runInfo = { dropped: !!o['drop-first'], pricesVersion: prices.version, runs: results.map(({ sessionId, totalUsd, ok }) => ({ sessionId, totalUsd, ok })) }
  fs.writeFileSync(path.join(out, 'bench.json'), JSON.stringify({ workflow: map.workflow, ...runInfo, aggregate: agg }, null, 2) + '\n')
  fs.writeFileSync(path.join(out, 'bench.md'), renderBenchMarkdown(map.workflow, agg, runInfo))
  console.log(`median ${usd(agg.total.median)} USD per run over ${agg.runs} run(s) -> ${out}/bench.md`)
  process.exit(results.every((r) => r.ok) ? 0 : 1)
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) main()
