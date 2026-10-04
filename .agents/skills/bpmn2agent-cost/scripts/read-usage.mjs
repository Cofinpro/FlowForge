#!/usr/bin/env node
// Reads token usage out of a Claude Code session: the main transcript plus every subagent
// transcript next to it. No model involved, Node built-ins only.
//
// Usage: node read-usage.mjs <session.jsonl | session-dir | ledger.jsonl> [--json]
//
// Layout it understands (internal Claude Code format, see docs/plans/laufkosten/spike.md):
//   <dir>/<sessionId>.jsonl                     main thread, also holds the one `cost-state` entry
//   <dir>/<sessionId>/subagents/agent-<id>.jsonl (+ .meta.json with agentType and description)
//
// One API request spans several lines (one per content block). Only the last one carries the final
// output_tokens, so each requestId keeps the line with the highest output_tokens. A request whose
// final line has no stop_reason is incomplete: it is counted and reported, never silently summed.
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

function readThread(file, meta, requests, stats) {
  for (const { line, entry } of jsonLines(file)) {
    if (entry.type !== 'assistant') continue
    const where = `${file}:${line}`
    const msg = entry.message
    if (!entry.requestId || !msg?.usage || !msg.model) {
      throw new Error(`${where}: assistant entry without requestId/usage/model (transcript format changed?)`)
    }
    if (msg.model === '<synthetic>') { stats.synthetic++; continue }
    const usage = toUsage(msg.usage, where)
    const cur = requests.get(entry.requestId)
    if (!cur || usage.output >= cur.usage.output) {
      requests.set(entry.requestId, {
        requestId: entry.requestId,
        source: meta.source,
        agentId: meta.agentId,
        agentType: meta.agentType,
        description: meta.description,
        parentAgentId: meta.parentAgentId,
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
  if (fs.existsSync(subDir)) {
    for (const f of fs.readdirSync(subDir).filter((n) => /^agent-.*\.jsonl$/.test(n)).sort()) {
      const agentId = f.slice('agent-'.length, -'.jsonl'.length)
      const metaFile = path.join(subDir, `agent-${agentId}.meta.json`)
      const m = fs.existsSync(metaFile) ? JSON.parse(fs.readFileSync(metaFile, 'utf8')) : {}
      readThread(path.join(subDir, f), {
        source: 'subagent', agentId, agentType: m.agentType ?? null, description: m.description ?? null,
        parentAgentId: m.parentAgentId ?? null,
      }, requests, stats)
      files++
    }
  }
  const all = [...requests.values()]
  return {
    sessionId,
    version,
    requests: all.filter((r) => r.stopReason),
    incomplete: all.filter((r) => !r.stopReason).length,
    costState: costState && {
      totalCostUSD: costState.totalCostUSD,
      hasUnknownModelCost: !!costState.hasUnknownModelCost,
      modelUsage: costState.modelUsage,
    },
    synthetic: stats.synthetic,
    files,
  }
}

/** Reads ledger.jsonl lines written by the generated cost-ledger hook. */
export function readLedger(file) {
  const requests = []
  const costStates = new Map()
  for (const { entry } of jsonLines(file)) {
    if (entry.kind === 'cost-state') costStates.set(entry.sessionId, entry)
    else if (entry.kind === 'request') requests.push(entry)
  }
  return { requests, costStates }
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
