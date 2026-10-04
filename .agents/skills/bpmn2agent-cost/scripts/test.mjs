// node --test .agents/skills/bpmn2agent-cost/scripts/test.mjs
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { buildReport, attribute, completeRequests, elementIdOf } from './cost-report.mjs'
import { HAUS_COST, MAP, OPUS_COST, makeFixture } from './fixture.mjs'
import { costOf, loadPrices, readSession, sumUsage } from './read-usage.mjs'

const here = path.dirname(fileURLToPath(import.meta.url))
const prices = loadPrices()
const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'cost-test-'))
const near = (a, b, msg) => assert.ok(Math.abs(a - b) < 1e-9, `${msg}: ${a} != ${b}`)

test('one request spanning several lines is counted once with the final output tokens', () => {
  const s = readSession(makeFixture(tmp()).transcript)
  assert.equal(s.requests.length, 5)
  assert.equal(s.incomplete, 0)
  assert.equal(s.synthetic, 1)
  const t = sumUsage(s.requests.map((r) => r.usage))
  assert.deepEqual([t.input, t.output, t.cacheRead, t.cacheWrite5m, t.cacheWrite1h], [5000, 10000, 500000, 50000, 25000])
})

test('price table reproduces the hand-computed cost', () => {
  const r = readSession(makeFixture(tmp()).transcript).requests[0]
  near(costOf(r.model, r.usage, prices), OPUS_COST, 'opus request')
})

test('unknown model fails instead of being estimated', () => {
  assert.throws(() => costOf('claude-unknown-9', { input: 1, output: 1, cacheRead: 0, cacheWrite5m: 0, cacheWrite1h: 0, webSearch: 0 }, prices), /no price for model/)
})

test('a transcript line without requestId is a format change and fails loudly', () => {
  const d = tmp()
  fs.writeFileSync(path.join(d, 's.jsonl'), JSON.stringify({ type: 'assistant', message: { model: 'claude-opus-5-5', usage: {} } }) + '\n')
  assert.throws(() => readSession(path.join(d, 's.jsonl')), /without requestId/)
})

test('attribution order: description id, skill, lane, main, unassigned', () => {
  const s = readSession(makeFixture(tmp()).transcript)
  const by = Object.fromEntries(s.requests.map((r) => [r.requestId, attribute(r, MAP)]))
  assert.deepEqual(by.req_main_1, { type: 'orchestration', id: 'Orchestrierung' })
  assert.deepEqual(by.req_main_2, { type: 'element', id: 'C1' })
  assert.deepEqual(by.req_a1, { type: 'element', id: 'K2' })
  assert.deepEqual(by.req_a2, { type: 'lane', id: 'qa' })
  assert.deepEqual(by.req_a3, { type: 'unassigned', id: 'nicht zugeordnet' })
})

test('agents of the Workflow tool (subagents/workflows/<run>/) are read, with their phase', () => {
  const s = readSession(makeFixture(tmp()).transcript)
  const a3 = s.requests.find((r) => r.requestId === 'req_a3')
  assert.equal(a3.source, 'subagent')
  assert.equal(a3.phase, 'Eingang')
  assert.equal(s.files, 4) // main + three agents, one of them nested
})

test('a composite dispatch label resolves to the inner element, an unknown one to nothing', () => {
  assert.equal(elementIdOf('K2 Story prüfen', MAP), 'K2')
  assert.equal(elementIdOf('Call_X/C1 Einordnen', MAP), 'C1')
  assert.equal(elementIdOf('Call_X/ZZ nope', MAP), null)
  assert.equal(elementIdOf(null, MAP), null)
})

test('phase: the map wins, else the agent\'s own workflowPhase, else none', () => {
  const s = readSession(makeFixture(tmp()).transcript)
  const rep = buildReport({ ...s, map: MAP, prices })
  const by = Object.fromEntries(rep.byPhase.map((p) => [p.name, p.requests]))
  assert.deepEqual(by, { 'Prüfung': 1, 'Eingang': 2, '(ohne Phase)': 2 }) // K2 by map; C1 by map + a3 by meta; main + QA lane agent
})

test('workflow agents with snapshot-only output: total stays exact, the missing output is an estimate', () => {
  const s = readSession(makeFixture(tmp(), { snapshotWorkflowAgents: true }).transcript)
  assert.equal(s.incomplete, 1)
  const rep = buildReport({ ...s, map: MAP, prices })
  assert.equal(rep.ok, true, JSON.stringify(rep.checks))
  near(rep.totals.sessionUsd, 5 * OPUS_COST + HAUS_COST, 'exact total from cost-state')
  assert.equal(rep.estimate.requests, 1)
  near(rep.estimate.outputTokens, 2000 - 3, 'the exact gap')
  near(rep.totals.estimatedUsd, (1997 * 20) / 1e6, 'only the missing output is estimated')
  assert.match(rep.checks.map((c) => c.text).join('\n'), /sind geschätzt/)
})

test('without cost-state an incomplete request stays a flagged lower bound', () => {
  const s = readSession(makeFixture(tmp(), { snapshotWorkflowAgents: true }).transcript)
  const rep = buildReport({ ...s, costState: null, map: MAP, prices })
  assert.equal(rep.estimate, null)
  assert.match(rep.checks.map((c) => c.text).join('\n'), /nur eine Untergrenze/)
})

test('no estimate when tokens do not match (resumed session): lower bound instead of a wrong split', () => {
  const s = readSession(makeFixture(tmp(), { snapshotWorkflowAgents: true }).transcript)
  const requests = s.requests.filter((r) => r.requestId !== 'req_a1') // an earlier process is missing
  const rep = buildReport({ ...s, requests, map: MAP, prices })
  assert.equal(rep.estimate, null)
  assert.match(rep.checks.map((c) => c.text).join('\n'), /Untergrenze/)
})

test('telemetry api_request events make it exact: output per request and the helper call', () => {
  const s = readSession(makeFixture(tmp(), { snapshotWorkflowAgents: true }).transcript)
  const otel = new Map([
    ['req_a3', { requestId: 'req_a3', model: 'claude-opus-5-5', querySource: 'repl', usage: { input: 1000, output: 2000, cacheRead: 100000, cacheWriteTotal: 15000 }, costUsd: OPUS_COST }],
    ['aux1', { requestId: 'aux1', model: 'claude-haiku-4-5-20251001', querySource: 'web_search_tool', usage: { input: 10000, output: 1000, cacheRead: 0, cacheWriteTotal: 0 }, costUsd: HAUS_COST }],
  ])
  const rep = buildReport({ ...s, otel, map: MAP, prices })
  assert.equal(rep.ok, true, JSON.stringify(rep.checks))
  assert.equal(rep.estimate, null)
  near(rep.totals.sessionUsd, 5 * OPUS_COST + HAUS_COST, 'total')
  near(rep.totals.auxiliaryUsd, 0, 'nothing left only in cost-state')
  const aux = rep.byUnit.find((u) => u.type === 'auxiliary')
  near(aux.costUsd, HAUS_COST, 'helper call priced as OpenTelemetry reports it')
  assert.equal(completeRequests({ requests: s.requests, costState: null, otel, prices }).info.otel.matched, 1)
})

test('a skill shared by several elements is attributed to the skill, not guessed', () => {
  const r = { source: 'main', attributionSkill: 'story-check', description: null, agentType: null }
  assert.deepEqual(attribute(r, MAP), { type: 'skill', id: 'story-check' })
  assert.deepEqual(attribute({ ...r, attributionSkill: 'plugin:story-writing' }, MAP), { type: 'element', id: 'C1' })
})

test('report reconciles: parts add up, the auxiliary call is its own bucket', () => {
  const s = readSession(makeFixture(tmp()).transcript)
  const rep = buildReport({ ...s, map: MAP, prices })
  assert.equal(rep.ok, true, JSON.stringify(rep.checks))
  near(rep.totals.transcriptUsd, 5 * OPUS_COST, 'transcript total')
  near(rep.totals.auxiliaryUsd, HAUS_COST, 'auxiliary')
  near(rep.totals.sessionUsd, 5 * OPUS_COST + HAUS_COST, 'session total')
  near(rep.byUnit.reduce((n, r) => n + r.costUsd, 0), rep.totals.transcriptUsd, 'sum of units')
  near(rep.byLane.reduce((n, r) => n + r.costUsd, 0), rep.totals.transcriptUsd, 'sum of lanes')
})

test('a stale price table is caught by the token-exact cost check', () => {
  const s = readSession(makeFixture(tmp()).transcript)
  const stale = structuredClone(prices)
  stale.models['claude-opus-5-5'].output = 25
  const rep = buildReport({ ...s, map: MAP, prices: stale })
  assert.equal(rep.ok, false)
  assert.match(rep.checks.find((c) => c.level === 'fail').text, /prices\.json/)
})

test('a missing subagent transcript (resumed session) is a warning with the reason', () => {
  const s = readSession(makeFixture(tmp(), { dropSubagent: true }).transcript)
  const full = readSession(makeFixture(tmp()).transcript)
  // cost-state of the full session against only the main thread: tokens missing, not exceeding
  const rep = buildReport({ ...full, requests: s.requests, map: MAP, prices })
  assert.equal(rep.ok, true)
  assert.match(rep.checks.map((c) => c.text).join('\n'), /fortgesetzte bzw\. geleerte Session/)
})

test('cost-state behind the transcript (resumed session) warns and the transcript sum counts', () => {
  const s = readSession(makeFixture(tmp(), { dropSubagent: true }).transcript)
  const full = readSession(makeFixture(tmp()).transcript)
  const rep = buildReport({ ...s, requests: full.requests, map: MAP, prices })
  assert.equal(rep.ok, true)
  assert.match(rep.checks.map((c) => c.text).join('\n'), /steht hinter dem Transkript zurück/)
  near(rep.totals.sessionUsd, 5 * OPUS_COST + HAUS_COST, 'transcript sum plus the auxiliary call, never the smaller cost-state')
})

test('cost-state keys with a context variant ([1m]) are summed per priced model', () => {
  const s = readSession(makeFixture(tmp()).transcript)
  const half = (v) => ({ ...v, inputTokens: v.inputTokens / 2, outputTokens: v.outputTokens / 2, cacheReadInputTokens: v.cacheReadInputTokens / 2, cacheCreationInputTokens: v.cacheCreationInputTokens / 2, costUSD: v.costUSD / 2 })
  const opus = s.costState.modelUsage['claude-opus-5-5']
  const split = { ...s.costState, modelUsage: { ...s.costState.modelUsage, 'claude-opus-5-5': half(opus), 'claude-opus-5-5[1m]': half(opus) } }
  const rep = buildReport({ ...s, costState: split, map: MAP, prices })
  assert.equal(rep.ok, true, JSON.stringify(rep.checks))
  assert.ok(!rep.checks.some((c) => /zurück|nicht in cost-state/.test(c.text)), JSON.stringify(rep.checks)) // the two [1m]/plain halves add up exactly
})

test('client-generated synthetic lines without requestId are skipped, not a format error', () => {
  const fx = makeFixture(tmp())
  fs.appendFileSync(fx.transcript, JSON.stringify({ type: 'assistant', isApiErrorMessage: true, message: { model: '<synthetic>', content: [], usage: {} } }) + '\n')
  assert.equal(readSession(fx.transcript).synthetic, 2)
})

test('claude -p total is compared within 1 percent', () => {
  const s = readSession(makeFixture(tmp()).transcript)
  const total = 5 * OPUS_COST + HAUS_COST
  assert.equal(buildReport({ ...s, map: MAP, prices, claudeTotal: total * 1.005 }).ok, true)
  assert.equal(buildReport({ ...s, map: MAP, prices, claudeTotal: total * 1.05 }).ok, false)
})

// ---- the generated ledger hook ---------------------------------------------------------------
import { spawnSync } from 'node:child_process'
import { installCostLedger } from '../../bpmn2agent-generate/scripts/install-cost-ledger.mjs'
import { readLedger } from './read-usage.mjs'

const SPEC = {
  meta: { workflowName: 'wf', outputLayout: 'claude-dir', sourceBpmn: { path: 'wf.bpmn' }, generatorVersion: '0.1.0' },
  pattern: { chosen: 'orchestrator-agent' },
  roles: { po: { label: 'Product Owner', agentName: 'wf-po' }, qa: { label: 'QA', agentName: 'wf-qa' } },
  elements: {
    C1: { kind: 'skill', label: 'Story einordnen', lane: 'po', generatedPaths: ['generated/wf/.claude/skills/story-writing/SKILL.md'] },
    K2: { kind: 'skill', label: 'Story prüfen', lane: 'qa', generatedPaths: ['generated/wf/.claude/skills/story-check/SKILL.md'] },
    K3: { kind: 'skill', label: 'Story freigeben', lane: 'qa', generatedPaths: ['generated/wf/.claude/skills/story-check/SKILL.md'] },
    Start: { kind: 'orchestrator', generatedPaths: ['generated/wf/.claude/skills/wf/SKILL.md'] },
  },
}

function runHook(project, transcript, payload = {}) {
  const hook = path.join(project, '.claude', 'hooks', 'wf-cost-ledger.mjs')
  return spawnSync('node', [hook], { input: JSON.stringify({ transcript_path: transcript, ...payload }), env: { ...process.env, CLAUDE_PROJECT_DIR: project }, encoding: 'utf8' })
}

test('install writes hook, map and settings; re-running changes nothing', () => {
  const dir = tmp()
  installCostLedger(SPEC, dir)
  const first = fs.readFileSync(path.join(dir, '.claude', 'settings.json'), 'utf8')
  installCostLedger(SPEC, dir)
  assert.equal(fs.readFileSync(path.join(dir, '.claude', 'settings.json'), 'utf8'), first)
  const settings = JSON.parse(first)
  for (const ev of ['SubagentStop', 'Stop', 'SessionEnd']) assert.equal(settings.hooks[ev].length, 1)
  const map = JSON.parse(fs.readFileSync(path.join(dir, '.claude', 'hooks', 'wf-cost-map.json'), 'utf8'))
  assert.deepEqual(map.skills['story-check'], ['K2', 'K3'])
  assert.deepEqual(map.orchestration.skills, ['wf'])
  assert.equal(installCostLedger({ ...SPEC, meta: { ...SPEC.meta, outputLayout: undefined } }, tmp()).skipped, 'legacy output layout')
})

test('hook ledger matches the reader, is idempotent and records cost-state', () => {
  const project = tmp()
  installCostLedger(SPEC, project)
  const fx = makeFixture(path.join(project, 'transcripts'))
  const r1 = runHook(project, fx.transcript)
  assert.equal(r1.status, 0, r1.stderr)
  const ledger = path.join(project, '.claude', 'runs', 'wf', 'ledger.jsonl')
  const lines1 = fs.readFileSync(ledger, 'utf8').trim().split('\n')
  assert.equal(lines1.length, 6) // 5 requests + cost-state
  // second event (and one handed the subagent's own transcript path) adds nothing
  runHook(project, fx.transcript)
  runHook(project, path.join(fx.dir, 'sess-1', 'subagents', 'agent-a1.jsonl'))
  assert.equal(fs.readFileSync(ledger, 'utf8').trim().split('\n').length, 6)

  const fromLedger = readLedger(ledger)
  const fromTranscript = readSession(fx.transcript)
  const key = (rs) => rs.map((r) => [r.requestId, r.model, JSON.stringify(r.usage), r.agentType ?? null, r.description ?? null]).sort()
  assert.deepEqual(key(fromLedger.requests), key(fromTranscript.requests))
  const rep = buildReport({ requests: fromLedger.requests, costState: fromLedger.costStates.get('sess-1').costState, map: MAP, prices, sessionId: 'sess-1' })
  assert.equal(rep.ok, true, JSON.stringify(rep.checks))
})

test('hook never fails the run: bad payload and missing transcript exit 0', () => {
  const project = tmp()
  installCostLedger(SPEC, project)
  const hook = path.join(project, '.claude', 'hooks', 'wf-cost-ledger.mjs')
  assert.equal(spawnSync('node', [hook], { input: 'not json', encoding: 'utf8' }).status, 0)
  assert.equal(runHook(project, '/nonexistent/x.jsonl').status, 0)
})

// ---- cost-bench ------------------------------------------------------------------------------
import { aggregate, quantile, stats } from './cost-bench.mjs'

test('stats: median, spread and IQR by linear interpolation', () => {
  const s = stats([10, 1, 3, 2, 4])
  assert.deepEqual([s.n, s.median, s.min, s.max, s.iqr], [5, 3, 1, 10, 2])
  assert.equal(quantile([], 0.5), 0)
})

test('aggregate: a unit missing from a run counts as zero in that run', () => {
  const mk = (cost, withK2) => ({
    totals: { sessionUsd: cost },
    byUnit: [{ type: 'element', id: 'C1', label: 'a', lane: 'po', costUsd: cost }, ...(withK2 ? [{ type: 'element', id: 'K2', label: 'b', lane: 'qa', costUsd: 1 }] : [])],
    byLane: [{ name: 'po', costUsd: cost }], byPhase: [{ name: '(ohne Phase)', costUsd: cost }],
  })
  const agg = aggregate([mk(1, true), mk(2, false), mk(3, true)])
  const k2 = agg.units.find((u) => u.id === 'K2')
  assert.deepEqual(k2.perRun, [1, 0, 1])
  assert.equal(agg.total.median, 2)
})

function fakeClaude(dir) {
  const f = path.join(dir, 'fake-claude.mjs')
  fs.writeFileSync(f, `
import fs from 'node:fs'; import path from 'node:path'
import { makeFixture, OPUS_COST, HAUS_COST } from ${JSON.stringify(path.join(here, 'fixture.mjs'))}
const c = process.env.FAKE_COUNTER; const n = (fs.existsSync(c) ? Number(fs.readFileSync(c, 'utf8')) : 0) + 1
fs.writeFileSync(c, String(n))
fs.writeFileSync(path.join(process.cwd(), 'ran.txt'), 'x')
makeFixture(path.join(process.env.CLAUDE_CONFIG_DIR, 'projects', 'p'), { sessionId: 'sess-' + n })
console.log(JSON.stringify({ session_id: 'sess-' + n, total_cost_usd: 5 * OPUS_COST + HAUS_COST }))
`)
  return f
}

const bench = (args, env) => spawnSync('node', [path.join(here, 'cost-bench.mjs'), ...args], { encoding: 'utf8', env: { ...process.env, ...env } })

test('cost-bench runs the fake claude N times in fresh copies and reports the spread', () => {
  const d = tmp()
  const template = path.join(d, 'template'); fs.mkdirSync(template); fs.writeFileSync(path.join(template, 'CLAUDE.md'), 'x')
  const mapFile = path.join(d, 'map.json'); fs.writeFileSync(mapFile, JSON.stringify({ ...MAP, humanCheckpoints: [] }))
  const out = path.join(d, 'out'); const counter = path.join(d, 'counter')
  const r = bench(['--map', mapFile, '--prompt', 'go', '--template', template, '--runs', '3', '--drop-first', '--confirm', '--claude-bin', fakeClaude(d), '--out', out],
    { CLAUDE_CONFIG_DIR: path.join(d, 'cfg'), FAKE_COUNTER: counter })
  assert.equal(r.status, 0, r.stdout + r.stderr)
  assert.equal(fs.readFileSync(counter, 'utf8'), '3')
  assert.equal(fs.existsSync(path.join(template, 'ran.txt')), false) // the template itself stays untouched
  const md = fs.readFileSync(path.join(out, 'bench.md'), 'utf8')
  assert.match(md, /2 Läufe \(erster Lauf verworfen\)/)
  const json = JSON.parse(fs.readFileSync(path.join(out, 'bench.json'), 'utf8'))
  near(json.aggregate.total.median, 5 * OPUS_COST + HAUS_COST, 'median per run')
  assert.equal(json.runs.length, 3)
})

test('cost-bench refuses human checkpoints and does not spend without --confirm', () => {
  const d = tmp()
  const mapFile = path.join(d, 'map.json'); const counter = path.join(d, 'counter')
  const env = { CLAUDE_CONFIG_DIR: path.join(d, 'cfg'), FAKE_COUNTER: counter }
  fs.writeFileSync(mapFile, JSON.stringify({ ...MAP, humanCheckpoints: [{ id: 'I3', label: 'freigeben' }] }))
  const refused = bench(['--map', mapFile, '--prompt', 'go', '--confirm', '--claude-bin', fakeClaude(d)], env)
  assert.equal(refused.status, 2)
  assert.match(refused.stderr, /human checkpoints/)
  fs.writeFileSync(mapFile, JSON.stringify({ ...MAP, humanCheckpoints: [] }))
  const dry = bench(['--map', mapFile, '--prompt', 'go', '--claude-bin', fakeClaude(d)], env)
  assert.equal(dry.status, 0)
  assert.match(dry.stdout, /Re-run with --confirm/)
  assert.equal(fs.existsSync(counter), false)
})
