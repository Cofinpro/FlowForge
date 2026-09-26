// bpmn: {"file":"product-vision-to-user-stories.bpmn","elements":["R_1"]}
//
// Research configuration and budget guard for the paid research adapters of process R
// (docs/dark-factory/process-rules.md §8.0, §8.3, §9.4). Deterministic — no LLM call.
//
// The caps are checked and the call is reserved in run.json BEFORE any network request, so a crash
// or a parallel agent can never issue an uncounted paid call.
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { yaml, loadRun, saveRun, logEvent } from './df.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const CONFIG_FILE = process.env.DF_RESEARCH_CONFIG || path.resolve(HERE, '../../research.yaml');

// A released call never ran (or was cancelled before it produced anything); a cancelled call was stopped
// on purpose. Neither is resumed, and neither uses up the one Deep Research call a corpus is allowed.
const VOID = ['released', 'cancelled'];
const FINAL = ['completed', 'failed', ...VOID];

/** True if the call has a live interaction that a re-run should poll instead of issuing a new one. */
export const isResumable = (c) => Boolean(c.interactionId) && !FINAL.includes(c.status);

let cached;
export function loadConfig() {
  if (!cached) cached = yaml().load(readFileSync(CONFIG_FILE, 'utf8')) || {};
  return cached;
}

/** The run directory must be a real, initialised run (run.json present). Paid calls need one. */
export function requireRun(runDir) {
  if (!runDir || !existsSync(path.join(runDir, 'run.json'))) {
    throw new Error(`no initialised run at "${runDir}" (run.json missing) — paid research calls only run inside a dark-factory run; use --replay otherwise`);
  }
  return loadRun(runDir);
}

export function limits(run, cfg = loadConfig()) {
  return {
    deepResearchHardCap: run.limits?.deepResearchHardCap ?? cfg.limits?.deepResearchHardCap ?? 3,
    moneyCapUsd: run.limits?.moneyCapUsd ?? cfg.limits?.moneyCapUsd ?? 15,
    deepResearchPerCorpus: cfg.limits?.deepResearchPerCorpus ?? 1,
  };
}

/**
 * Check every cap for one paid call and, if allowed, reserve it in run.json right away.
 * Returns { ok: true } or { ok: false, reason }. `deepResearch` marks a Deep Research call.
 */
export function reserve(runDir, { provider, callId, estimateUsd, deepResearch = false }) {
  const run = requireRun(runDir);
  const cfg = loadConfig();
  const lim = limits(run, cfg);
  const r = (run.research ||= {});
  r.deepResearchCalls ??= 0;
  r.costUsd ??= 0;
  r.calls ??= [];
  if (run.budget?.status === 'exhausted') return { ok: false, reason: 'run budget exhausted (run.json budget.status)' };
  if (deepResearch) {
    if (r.deepResearchCalls >= lim.deepResearchHardCap) return { ok: false, reason: `Deep-Research hard cap reached (${r.deepResearchCalls}/${lim.deepResearchHardCap})` };
    const same = r.calls.filter((c) => c.deepResearch && c.callId === callId && !VOID.includes(c.status)).length;
    if (same >= lim.deepResearchPerCorpus) return { ok: false, reason: `${callId} already had its Deep Research call — use gap-fill via websearch (Gedächtnis §8.5)` };
  }
  if (r.costUsd + estimateUsd > lim.moneyCapUsd) return { ok: false, reason: `money cap would be exceeded (${r.costUsd.toFixed(2)} + ~${estimateUsd.toFixed(2)} > ${lim.moneyCapUsd} USD)` };
  const entry = { provider, callId, deepResearch, status: 'reserved', reservedUsd: estimateUsd, at: new Date().toISOString() };
  r.calls.push(entry);
  if (deepResearch) r.deepResearchCalls += 1;
  r.costUsd = round(r.costUsd + estimateUsd);
  saveRun(runDir, run);
  logEvent(runDir, { event: 'research-call-reserved', provider, callId, estimateUsd });
  return { ok: true, index: r.calls.length - 1 };
}

/** Update a reserved call (interaction id, status) without touching the booked cost. */
export function updateCall(runDir, index, patch) {
  const run = loadRun(runDir);
  Object.assign(run.research.calls[index], patch);
  saveRun(runDir, run);
}

/** Replace the reserved estimate with the booked cost (never below zero). */
export function book(runDir, index, { usd, usage, status = 'completed', extra = {} }) {
  const run = loadRun(runDir);
  const c = run.research.calls[index];
  run.research.costUsd = round(Math.max(0, run.research.costUsd - (c.reservedUsd || 0) + usd));
  Object.assign(c, { status, bookedUsd: round(usd), usage, ...extra, bookedAt: new Date().toISOString() });
  saveRun(runDir, run);
  logEvent(runDir, { event: 'research-call-booked', provider: c.provider, callId: c.callId, usd: round(usd), status });
  return run.research.costUsd;
}

/** Undo a reservation for a request that never reached the provider (connection refused, HTTP 4xx on create) or was cancelled with no usage reported. */
export function release(runDir, index, reason) {
  const run = loadRun(runDir);
  const c = run.research.calls[index];
  if (c.status === 'released') return;
  run.research.costUsd = round(Math.max(0, run.research.costUsd - (c.reservedUsd || 0)));
  if (c.deepResearch) run.research.deepResearchCalls = Math.max(0, run.research.deepResearchCalls - 1);
  Object.assign(c, { status: 'released', reason, releasedAt: new Date().toISOString() });
  saveRun(runDir, run);
  logEvent(runDir, { event: 'research-call-released', provider: c.provider, callId: c.callId, reason });
}

/** Find an earlier, unfinished call of this provider + callId (to resume instead of re-issuing). */
export function pendingCall(runDir, provider, callId) {
  const run = loadRun(runDir);
  const calls = run.research?.calls || [];
  const i = calls.findIndex((c) => c.provider === provider && c.callId === callId && isResumable(c));
  return i >= 0 ? { index: i, call: calls[i] } : null;
}

export function tierOf(url, cfg = loadConfig()) {
  let host = '';
  try { host = new URL(url).hostname.replace(/^www\./, ''); } catch { return cfg.tiers?.default || 'T2'; }
  for (const t of ['T1', 'T3']) if ((cfg.tiers?.[t] || []).some((rx) => new RegExp(rx, 'i').test(host))) return t;
  return cfg.tiers?.default || 'T2';
}

/** Registrable-ish domain for independence checks (example.co.uk -> example.co.uk, a.b.example.com -> example.com). */
export function siteOf(url) {
  try {
    const parts = new URL(url).hostname.replace(/^www\./, '').split('.');
    const n = /^(co|com|org|net|gov|ac)$/.test(parts.at(-2) || '') && parts.length > 2 ? 3 : 2;
    return parts.slice(-n).join('.');
  } catch { return String(url); }
}

export const round = (x) => Math.round(x * 10000) / 10000;
