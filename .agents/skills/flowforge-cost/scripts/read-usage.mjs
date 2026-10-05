#!/usr/bin/env node
// Reads token usage out of a Claude Code session: the main transcript plus every subagent
// transcript next to it. No model involved, Node built-ins only.
//
// Usage: node read-usage.mjs <session.jsonl | session-dir | ledger.jsonl> [--json]
//
// Layout it understands (internal Claude Code format, see docs/plans/laufkosten/spike.md):
//   <dir>/<sessionId>.jsonl                     main thread, also holds the one `cost-state` entry
//   <dir>/<sessionId>/subagents/agent-<id>.jsonl (+ .meta.json with agentType and description)
//   <dir>/<sessionId>/subagents/workflows/<workflowRun>/agent-<id>.jsonl   agents of the Workflow tool;
//       their meta.json also carries `workflowPhase`. Any depth below subagents/ is scanned.
//
// One API request spans several lines (one per content block). Only the last one carries the final
// output_tokens, so each requestId keeps the line with the highest output_tokens. Input and cache
// tokens are exact on every line. A request whose best line has no stop_reason is `final: false`: its
// output_tokens is only a streaming snapshot (the agents of the Workflow tool never get the final
// value written back). It is kept, flagged, and cost-report decides how to complete it.
// A line that looks like a request but lacks requestId/usage/model is a format change: fail loudly.

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const PRICES_PATH = path.join(path.dirname(fileURLToPath(import.meta.url)), 'prices.json')

export function loadPrices(file = PRICES_PATH) {
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

/** claude-haiku-4-5-20251001 -> claude-haiku-4-5 (longest known prefix); null when unknown. */
export function priceKey(model, prices) {
  return Object.keys(prices.models).sort((a, b) => b.length - a.length).find((k) => model.startsWith(k)) ?? null
}

function* jsonLines(file) {
  const lines = fs.readFileSync(file, 'utf8').split('\n')
  for (let i = 0; i < lines.length; i++) {
    if (!lines[i].trim()) continue
    try {
      yield { line: i + 1, entry: JSON.parse(lines[i]) }
    } catch {
      throw new Error(`${file}:${i + 1}: not valid JSON (transcript format changed?)`)
    }
  }
}

function toUsage(u, where) {
  for (const k of ['input_tokens', 'output_tokens', 'cache_read_input_tokens', 'cache_creation_input_tokens']) {
    if (typeof u[k] !== 'number') throw new Error(`${where}: usage.${k} missing (transcript format changed?)`)
  }
  const cc = u.cache_creation
  const w1h = cc?.ephemeral_1h_input_tokens ?? 0
  return {
    input: u.input_tokens,
    output: u.output_tokens,
    cacheRead: u.cache_read_input_tokens,
    // without the TTL split every write is billed as 5 minutes
    cacheWrite5m: cc ? (cc.ephemeral_5m_input_tokens ?? 0) : u.cache_creation_input_tokens,
    cacheWrite1h: w1h,
    webSearch: u.server_tool_use?.web_search_requests ?? 0,
  }
}

/** Every agent-<id>.jsonl below dir, at any depth (Workflow tool agents sit in workflows/<run>/). */
function agentTranscripts(dir) {
  if (!fs.existsSync(dir)) return []
  const out = []
  for (const e of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) out.push(...agentTranscripts(p))
    else if (/^agent-.*\.jsonl$/.test(e.name)) out.push(p)
  }
  return out
}

function readThread(file, meta, requests, stats) {
  for (const { line, entry } of jsonLines(file)) {
    if (entry.type !== 'assistant') continue
    const where = `${file}:${line}`
    const msg = entry.message
    // client-generated lines (API error text, "No response requested") carry no requestId and no cost
    if (msg?.model === '<synthetic>') { stats.synthetic++; continue }
    if (!entry.requestId || !msg?.usage || !msg.model) {
      throw new Error(`${where}: assistant entry without requestId/usage/model (transcript format changed?)`)
    }
    const usage = toUsage(msg.usage, where)
    const chars = (stats.chars ??= new Map())
    chars.set(entry.requestId, (chars.get(entry.requestId) ?? 0) + JSON.stringify(msg.content ?? '').length)
    const cur = requests.get(entry.requestId)
    if (!cur || usage.output >= cur.usage.output) {
      requests.set(entry.requestId, {
        requestId: entry.requestId,
        source: meta.source,
        agentId: meta.agentId,
        agentType: meta.agentType,
        description: meta.description,
        parentAgentId: meta.parentAgentId,
        phase: meta.phase ?? null,
        attributionSkill: entry.attributionSkill ?? null,
        attributionMcpServer: entry.attributionMcpServer ?? null,
        attributionMcpTool: entry.attributionMcpTool ?? null,
        model: msg.model,
        stopReason: msg.stop_reason ?? null,
        usage,
      })
    }
  }
}

/**
 * @param {string} transcript  path to <sessionId>.jsonl (main thread)
 * @returns {{sessionId, version, requests, incomplete, costState, synthetic, files}}
 */
export function readSession(transcript) {
  const sessionId = path.basename(transcript, '.jsonl')
  const requests = new Map()
  const stats = { synthetic: 0 }
  let costState = null
  let version = null
  for (const { entry } of jsonLines(transcript)) {
    if (entry.type === 'cost-state') costState = entry
    if (!version && entry.version) version = entry.version
  }
  readThread(transcript, { source: 'main' }, requests, stats)

  const subDir = path.join(path.dirname(transcript), sessionId, 'subagents')
  let files = 1
  for (const file of agentTranscripts(subDir)) {
    const f = path.basename(file)
    const agentId = f.slice('agent-'.length, -'.jsonl'.length)
    const metaFile = path.join(path.dirname(file), `agent-${agentId}.meta.json`)
    const m = fs.existsSync(metaFile) ? JSON.parse(fs.readFileSync(metaFile, 'utf8')) : {}
    readThread(file, {
      source: 'subagent', agentId, agentType: m.agentType ?? null, description: m.description ?? null,
      parentAgentId: m.parentAgentId ?? null, phase: m.workflowPhase ?? null,
    }, requests, stats)
    files++
  }
  const all = [...requests.values()].map((r) => ({ ...r, final: !!r.stopReason, chars: stats.chars?.get(r.requestId) ?? 0 }))
  return {
    sessionId,
    version,
    requests: all,
    incomplete: all.filter((r) => !r.final).length,
    costState: costState && {
      totalCostUSD: costState.totalCostUSD,
      hasUnknownModelCost: !!costState.hasUnknownModelCost,
      modelUsage: costState.modelUsage,
    },
    synthetic: stats.synthetic,
    files,
  }
}

/**
 * Reads the `api_request` log events of an OTLP/JSON telemetry dump (one {path, body} per line, as the
 * pilot sink writes it) into Map<request_id, exact per-request usage and cost>. Only events of
 * `sessionId` count. `cost_usd` is Claude Code's own estimate, so it is kept as a cross-check.
 */
export function readOtel(file, sessionId) {
  const out = new Map()
  for (const { entry } of jsonLines(file)) {
    for (const rl of entry.body?.resourceLogs ?? []) for (const sl of rl.scopeLogs ?? []) for (const lr of sl.logRecords ?? []) {
      const a = Object.fromEntries((lr.attributes ?? []).map((x) => [x.key, Object.values(x.value)[0]]))
      if (a['event.name'] !== 'api_request' || !a.request_id || (sessionId && a['session.id'] !== sessionId)) continue
      out.set(a.request_id, {
        requestId: a.request_id, model: a.model, querySource: a.query_source ?? null,
        usage: {
          input: Number(a.input_tokens), output: Number(a.output_tokens), cacheRead: Number(a.cache_read_tokens),
          cacheWriteTotal: Number(a.cache_creation_tokens), webSearch: 0,
        },
        costUsd: Number(a.cost_usd),
      })
    }
  }
  return out
}

/** Reads ledger.jsonl lines written by the generated cost-ledger hook. */
export function readLedger(file) {
  const requests = new Map() // keyed by requestId: the latest line wins (a request may be re-written once final)
  const costStates = new Map()
  for (const { entry } of jsonLines(file)) {
    if (entry.kind === 'cost-state') costStates.set(entry.sessionId, entry)
    else if (entry.kind === 'request') requests.set(`${entry.sessionId}/${entry.requestId}`, { ...entry, final: entry.final ?? true }) // the first hook version wrote only final rows
  }
  return { requests: [...requests.values()], costStates }
}

/** Cost of one usage record in USD; throws for a model without a price. */
export function costOf(model, usage, prices) {
  const key = priceKey(model, prices)
  if (!key) throw new Error(`no price for model "${model}" in prices.json (version ${prices.version}); add it, do not estimate`)
  const p = prices.models[key]
  return (
    usage.input * p.input + usage.output * p.output + usage.cacheRead * p.cacheRead +
    usage.cacheWrite5m * p.cacheWrite5m + usage.cacheWrite1h * p.cacheWrite1h
  ) / 1e6 + usage.webSearch * (prices.webSearchPerRequestUsd ?? 0)
}

export function sumUsage(list) {
  const t = { input: 0, output: 0, cacheRead: 0, cacheWrite5m: 0, cacheWrite1h: 0, webSearch: 0 }
  for (const u of list) for (const k of Object.keys(t)) t[k] += u[k] ?? 0
  return t
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])
if (isMain) {
  const arg = process.argv[2]
  if (!arg) { console.error('usage: read-usage.mjs <session.jsonl> [--json]'); process.exit(2) }
  const s = readSession(arg)
  if (process.argv.includes('--json')) console.log(JSON.stringify(s, null, 2))
  else {
    const byModel = new Map()
    for (const r of s.requests) byModel.set(r.model, [...(byModel.get(r.model) ?? []), r.usage])
    console.log(`session ${s.sessionId}: ${s.requests.length} requests from ${s.files} transcript(s), ${s.incomplete} incomplete`)
    for (const [m, us] of byModel) console.log(`  ${m}`, sumUsage(us))
  }
}
