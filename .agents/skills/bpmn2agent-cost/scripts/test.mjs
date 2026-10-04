// node --test .agents/skills/bpmn2agent-cost/scripts/test.mjs
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { buildReport, attribute } from './cost-report.mjs'
import { HAUS_COST, MAP, OPUS_COST, makeFixture } from './fixture.mjs'
import { costOf, loadPrices, readSession, sumUsage } from './read-usage.mjs'

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
  assert.match(rep.checks.map((c) => c.text).join('\n'), /fortgesetzt oder geleert/)
})

test('a transcript with more tokens than cost-state fails', () => {
  const s = readSession(makeFixture(tmp(), { dropSubagent: true }).transcript)
  const full = readSession(makeFixture(tmp()).transcript)
  const rep = buildReport({ ...s, requests: full.requests, map: MAP, prices })
  assert.equal(rep.ok, false)
  assert.match(rep.checks.find((c) => c.level === 'fail').text, /mehr Tokens als cost-state/)
})

test('claude -p total is compared within 1 percent', () => {
  const s = readSession(makeFixture(tmp()).transcript)
  const total = 5 * OPUS_COST + HAUS_COST
  assert.equal(buildReport({ ...s, map: MAP, prices, claudeTotal: total * 1.005 }).ok, true)
  assert.equal(buildReport({ ...s, map: MAP, prices, claudeTotal: total * 1.05 }).ok, false)
})
