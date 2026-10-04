// Builds a synthetic Claude Code session in the on-disk format the readers expect (see
// docs/plans/laufkosten/spike.md). Only metadata and usage, no message content, so the tests carry
// no real transcript text. Round numbers keep the expected costs checkable by hand.

import fs from 'node:fs'
import path from 'node:path'

export const OPUS_USAGE = { input: 1000, output: 2000, cacheRead: 100000, w5m: 10000, w1h: 5000 }
// opus-5-5: 1000*4 + 2000*20 + 100000*0.2 + 10000*5 + 5000*8 = 154000 / 1e6
export const OPUS_COST = 0.154
// haiku-4-5 aux call (only in cost-state): 10000 in * 1 + 1000 out * 5 + 2 web searches * 0.01 USD
export const HAUS_COST = 10000 / 1e6 + 5000 / 1e6 + 0.02

export const MAP = {
  bpmn: { file: 'wf.bpmn', elements: ['C1', 'K2'] },
  workflow: 'wf',
  pattern: 'orchestrator-agent',
  generatorVersion: '0.1.0',
  orchestration: { skills: ['wf'], agentTypes: ['wf-orchestrator'] },
  elements: {
    C1: { label: 'Story einordnen', lane: 'po', phase: 'Eingang', kind: 'skill', skills: ['story-writing'] },
    K2: { label: 'Story prüfen', lane: 'qa', phase: 'Prüfung', kind: 'skill', skills: ['story-check'] },
    K3: { label: 'Story freigeben', lane: 'qa', phase: 'Prüfung', kind: 'skill', skills: ['story-check'] },
  },
  skills: { 'story-writing': ['C1'], 'story-check': ['K2', 'K3'] },
  agentTypes: { 'wf-po': 'po', 'wf-qa': 'qa' },
  lanes: { po: 'Product Owner', qa: 'QA' },
}

const u = (c, o = {}) => ({
  input_tokens: c.input, output_tokens: o.output ?? c.output,
  cache_read_input_tokens: c.cacheRead, cache_creation_input_tokens: c.w5m + c.w1h,
  cache_creation: { ephemeral_5m_input_tokens: c.w5m, ephemeral_1h_input_tokens: c.w1h },
})

/** One API request = a thinking line with a streaming snapshot, then the final line. */
function request(id, model, extra = {}, c = OPUS_USAGE) {
  const base = { type: 'assistant', requestId: id, ...extra }
  return [
    { ...base, message: { model, content: [{ type: 'thinking' }], stop_reason: null, usage: u(c, { output: 2 }) } },
    { ...base, message: { model, content: [{ type: 'text' }], stop_reason: 'end_turn', usage: u(c) } },
  ]
}

const write = (file, lines) => {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, lines.map((l) => JSON.stringify(l)).join('\n') + '\n')
}

/**
 * @returns {{dir, transcript, map}} session `sess-1`: 2 main requests (orchestration skill, element C1),
 * 3 subagent requests (element K2 by description, lane QA by agent type, unassigned) and a cost-state
 * that also holds a haiku auxiliary call which no transcript has.
 */
export function makeFixture(dir, { dropSubagent = false } = {}) {
  const S = 'sess-1'
  const OPUS = 'claude-opus-5-5'
  write(path.join(dir, `${S}.jsonl`), [
    { type: 'user', version: '2.1.283' },
    ...request('req_main_1', OPUS, { attributionSkill: 'wf' }),
    ...request('req_main_2', OPUS, { attributionSkill: 'story-writing' }),
    { type: 'assistant', requestId: 'req_syn', message: { model: '<synthetic>', usage: u({ input: 0, output: 0, cacheRead: 0, w5m: 0, w1h: 0 }), stop_reason: 'stop_sequence' } },
    {
      type: 'cost-state', sessionId: S, totalCostUSD: (dropSubagent ? 2 : 5) * OPUS_COST + HAUS_COST,
      modelUsage: {
        [OPUS]: {
          inputTokens: (dropSubagent ? 2 : 5) * 1000, outputTokens: (dropSubagent ? 2 : 5) * 2000,
          cacheReadInputTokens: (dropSubagent ? 2 : 5) * 100000, cacheCreationInputTokens: (dropSubagent ? 2 : 5) * 15000,
          webSearchRequests: 0, costUSD: (dropSubagent ? 2 : 5) * OPUS_COST,
        },
        'claude-haiku-4-5-20251001': {
          inputTokens: 10000, outputTokens: 1000, cacheReadInputTokens: 0, cacheCreationInputTokens: 0,
          webSearchRequests: 2, costUSD: HAUS_COST,
        },
      },
    },
  ])
  const subs = [
    ['a1', { agentType: 'wf-qa', description: 'K2 Story prüfen' }],
    ['a2', { agentType: 'wf-qa', description: 'Nachfrage klären' }],
    ['a3', { agentType: 'general-purpose', description: 'irgendwas' }],
  ]
  for (const [id, meta] of dropSubagent ? [] : subs) {
    write(path.join(dir, S, 'subagents', `agent-${id}.jsonl`), request(`req_${id}`, OPUS))
    fs.writeFileSync(path.join(dir, S, 'subagents', `agent-${id}.meta.json`), JSON.stringify({ ...meta, spawnDepth: 1 }))
  }
  return { dir, transcript: path.join(dir, `${S}.jsonl`), map: MAP }
}
