#!/usr/bin/env node
// bpmn: {"file":"product-vision-to-user-stories.bpmn","elements":["R_2a"]}
//
// Adapter for "Deep-Research-Auftrag stellen" (R_2a, Process_R): one Gemini Deep Research task via
// the Interactions API (docs/dark-factory/process-rules.md §8.0, §9.4). Deterministic wrapper — the
// research itself runs at Google.
//
// Usage:
//   node gemini-deep-research.mjs <runDir> --call DR-01 --query-file <order.md> --live [--variant standard|max]
//   node gemini-deep-research.mjs <runDir> --call DR-01 --replay <interaction.json>     # no network, no cost
//   node gemini-deep-research.mjs <runDir> --call DR-01 --cancel                         # stop a stuck call
//
// Safety (never overuse the paid API):
//   - Without --live nothing is sent. --live needs an initialised run (run.json) and GEMINI_API_KEY.
//   - Before the request: hard cap (3/run), one call per corpus (DR-0n) and the money cap are checked
//     and the call is reserved in run.json (lib/research-config.mjs). Refused -> exit 3 with a JSON
//     {status:"refused"} so R routes the questions to websearch.
//   - An earlier unfinished call of the same corpus is RESUMED (polled), never issued a second time.
//   - A call still unfinished stallMinutes after it was issued counts as stuck: at the next timeout it
//     is cancelled at Google and voided in run.json (released if Google reports no usage, else booked
//     as cancelled), so one more --live run issues a fresh call. --cancel does the same on demand.
//   - Cost is booked from the response's usage; until research.yaml pricingVerified is true, the
//     conservative estimate is booked instead.
// Output: research/raw/gemini-dr/<callId>_<interaction>.json in the normalize-sources.mjs format
// (tool "deep-research", one result per cited URL, contentKind "summary", redirects resolved) plus
// the report text next to it (<...>.report.md). Prints a JSON summary.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { loadConfig, reserve, updateCall, book, release, pendingCall, round } from '../lib/research-config.mjs';
import { logEvent, die } from '../lib/df.mjs';

const argv = process.argv.slice(2);
const runDir = argv[0];
const opt = (n) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : undefined; };
const has = (n) => argv.includes(n);
const callId = opt('--call');
if (!runDir || !callId || (!has('--live') && !opt('--replay') && !has('--cancel'))) {
  die('Usage: gemini-deep-research.mjs <runDir> --call DR-0n (--query-file <order.md> --live [--variant standard|max] | --replay <interaction.json> | --cancel)');
}

const cfg = loadConfig();
const P = cfg.providers['gemini-deep-research'];
const variant = opt('--variant') || P.variantByCall?.[callId] || 'standard';
const agentId = P.agents[variant];
if (!agentId) die(`unknown variant "${variant}"`);
const out = (o, code = 0) => { console.log(JSON.stringify(o)); process.exit(code); };

// ------------------------------------------------------------------ replay (no network, no cost)
if (opt('--replay')) {
  const interaction = JSON.parse(readFileSync(opt('--replay'), 'utf8'));
  const res = await writeRaw(interaction, opt('--query-file') ? readFileSync(opt('--query-file'), 'utf8') : '(replay)', { replay: true });
  out({ status: 'done', mode: 'replay', ...res, costUsd: 0 });
}

// ------------------------------------------------------------------ cancel (stop a stuck call)
if (has('--cancel')) {
  const pending = pendingCall(runDir, 'gemini-deep-research', callId);
  if (!pending) out({ status: 'done', mode: 'cancel', reason: `no unfinished Deep Research call for ${callId}` });
  const key = process.env[P.apiKeyEnv];
  if (!key) out({ status: 'refused', reason: `${P.apiKeyEnv} is not set`, riskFlags: ['deep-research-unavailable'] }, 3);
  out({ status: 'done', mode: 'cancel', ...(await cancelCall(pending, { 'content-type': 'application/json', 'x-goog-api-key': key }, 'cancelled on request')) });
}

// ------------------------------------------------------------------ live
if (cfg.channels?.['deep-research']?.enabled === false) out({ status: 'refused', reason: 'deep-research channel disabled in research.yaml', riskFlags: ['deep-research-disabled'] }, 3);
const key = process.env[P.apiKeyEnv];
if (!key) out({ status: 'refused', reason: `${P.apiKeyEnv} is not set`, riskFlags: ['deep-research-unavailable'] }, 3);
const queryFile = opt('--query-file');
if (!queryFile || !existsSync(queryFile)) die('--live needs --query-file <order.md>');
const query = readFileSync(queryFile, 'utf8').trim();
const H = { 'content-type': 'application/json', 'x-goog-api-key': key };

let slot = pendingCall(runDir, 'gemini-deep-research', callId);
let id;
let issuedAt = Date.now();
if (slot) {
  issuedAt = Date.parse(slot.call.at) || issuedAt;
  id = slot.call.interactionId; // resume — do not pay twice
  logEvent(runDir, { event: 'deep-research-resume', callId, interactionId: id });
} else {
  const r = reserve(runDir, { provider: 'gemini-deep-research', callId, estimateUsd: P.estimateUsd?.[variant] ?? 7, deepResearch: true });
  if (!r.ok) out({ status: 'refused', reason: r.reason, riskFlags: ['budget-cap-reached'] }, 3);
  slot = { index: r.index };
  let res;
  try {
    res = await fetch(P.endpoint, { method: 'POST', headers: H, body: JSON.stringify({ agent: agentId, input: query, background: true }), signal: AbortSignal.timeout(60_000) });
  } catch (e) {
    const code = e.cause?.code || e.cause?.errors?.[0]?.code || (/bad port|invalid url/i.test(e.cause?.message || '') ? 'LOCAL_REFUSED' : e.code || e.name);
    if (['ECONNREFUSED', 'ENOTFOUND', 'EAI_AGAIN', 'LOCAL_REFUSED'].includes(code)) {
      release(runDir, slot.index, `create: ${code}`); // no connection -> nothing started, nothing to pay
    } else {
      book(runDir, slot.index, { usd: P.estimateUsd?.[variant] ?? 7, status: 'failed', extra: { error: `create: ${code}` } }); // may have reached Google -> stay conservative
    }
    out({ status: 'blocked', reason: `create failed: ${code}`, riskFlags: ['deep-research-unavailable'] }, 1);
  }
  const j = await res.json().catch(() => ({}));
  if (!res.ok || !j.id) {
    // Google answered with an error -> nothing was started, release the reservation.
    release(runDir, slot.index, `create: HTTP ${res.status} ${JSON.stringify(j).slice(0, 200)}`);
    out({ status: 'blocked', reason: `create failed: HTTP ${res.status}`, riskFlags: ['deep-research-unavailable'] }, 1);
  }
  id = j.id;
  updateCall(runDir, slot.index, { interactionId: id, status: 'running', agent: agentId });
}

const deadline = Date.now() + (P.timeoutMinutes || 30) * 60_000;
let interaction;
for (;;) {
  await new Promise((s) => setTimeout(s, (P.pollSeconds || 15) * 1000));
  try {
    const res = await fetch(`${P.endpoint}/${encodeURIComponent(id)}`, { headers: H, signal: AbortSignal.timeout(60_000) });
    interaction = await res.json().catch(() => ({}));
    if (res.ok && ['completed', 'failed', 'cancelled'].includes(interaction.status)) break;
  } catch { /* transient network error: keep polling until the deadline */ }
  if (Date.now() > deadline) {
    const ageMin = Math.round((Date.now() - issuedAt) / 60_000);
    if (ageMin >= (P.stallMinutes || 60)) { // stuck at Google: void it so the next --live issues a fresh call
      const c = await cancelCall({ index: slot.index, call: { interactionId: id } }, H, `stalled: no result ${ageMin} min after it was issued`);
      out({ status: 'blocked', reason: `interaction ${id} stalled (${ageMin} min, no result) — cancelled; re-run --live once for a fresh call, else use websearch`, ...c, riskFlags: ['deep-research-stalled'] }, 1);
    }
    updateCall(runDir, slot.index, { status: 'timeout' }); // stays reserved; a re-run resumes it
    out({ status: 'partial', reason: `timeout after ${P.timeoutMinutes} min — re-run to resume ${id}`, riskFlags: ['deep-research-timeout'] }, 1);
  }
}

const usd = costOf(interaction.usage, variant);
if (interaction.status !== 'completed') {
  book(runDir, slot.index, { usd, usage: interaction.usage, status: 'failed' });
  out({ status: 'blocked', reason: `interaction ${interaction.status}`, riskFlags: ['deep-research-failed'] }, 1);
}
const res = await writeRaw(interaction, query, {});
const total = book(runDir, slot.index, { usd, usage: interaction.usage, extra: { rawFile: res.rawFile } });
out({ status: 'done', mode: 'live', ...res, costUsd: round(usd), runCostUsd: total });

// ------------------------------------------------------------------ helpers
// Cancel an interaction at Google and void it in run.json. The interaction id moves to
// cancelledInteractionId so no later run resumes it. No usage reported -> release (nothing consumed,
// the corpus may issue a fresh call); usage reported -> book it with status cancelled.
async function cancelCall({ index, call }, headers, why) {
  const iid = call.interactionId;
  let ia = {};
  try {
    const res = await fetch(`${P.endpoint}/${encodeURIComponent(iid)}/cancel`, { method: 'POST', headers, body: '{}', signal: AbortSignal.timeout(60_000) });
    ia = await res.json().catch(() => ({}));
  } catch { /* unreachable: void it locally anyway, the id is kept for the record */ }
  updateCall(runDir, index, { interactionId: undefined, cancelledInteractionId: iid });
  logEvent(runDir, { event: 'deep-research-cancel', callId, interactionId: iid, remoteStatus: ia.status || null, reason: why });
  if (ia.usage?.total_tokens) {
    const usd = costOf(ia.usage, variant);
    book(runDir, index, { usd, usage: ia.usage, status: 'cancelled', extra: { reason: why } });
    return { cancelled: iid, remoteStatus: ia.status || null, costUsd: round(usd) };
  }
  release(runDir, index, why);
  return { cancelled: iid, remoteStatus: ia.status || null, costUsd: 0 };
}

function costOf(u = {}, v) {
  if (!P.pricingVerified) return P.estimateUsd?.[v] ?? 7; // conservative until prices are confirmed
  const pr = P.pricing;
  const cached = u.total_cached_tokens || 0;
  const input = (u.total_input_tokens || 0) - cached + (u.total_tool_use_tokens || 0);
  const output = (u.total_output_tokens || 0) + (u.total_thought_tokens || 0);
  const searches = (u.grounding_tool_count || []).reduce((s, g) => s + (g.search_query_count || g.count || 0), 0);
  return (input * pr.inputPerM + cached * pr.cachedInputPerM + output * pr.outputPerM) / 1e6 + (searches * pr.searchPerThousand) / 1000;
}

async function resolve(url) {
  if (!P.resolveRedirects || !/grounding-api-redirect/.test(url)) return url;
  for (const method of ['HEAD', 'GET']) {
    try {
      const r = await fetch(url, { method, redirect: 'manual', signal: AbortSignal.timeout(10_000) });
      const loc = r.headers.get('location');
      if (loc) return new URL(loc, url).href;
    } catch { /* try next */ }
  }
  return url; // unresolved: normalize keeps it, R_3b sees contentKind summary + unresolved flag
}

async function writeRaw(ia, q, { replay }) {
  const step = (ia.steps || []).filter((s) => s.type === 'model_output').at(-1) || (ia.steps || []).at(-1) || {};
  const content = (step.content || []).find((c) => c.type === 'text') || {};
  const text = content.text || '';
  const anns = (content.annotations || []).filter((a) => a.type === 'url_citation' && a.url);
  // Numbered source list at the end of the report: "7. [biallo.de](<redirect>)" -> title per URL
  const titles = new Map([...text.matchAll(/^\s*\d+\.\s*\[([^\]]+)\]\((\S+?)\)\s*$/gm)].map((m) => [m[2], m[1]]));
  const byUrl = new Map();
  for (const a of anns) {
    const e = byUrl.get(a.url) || { spans: [] };
    e.spans.push(sentenceAround(text, a.start_index, a.end_index));
    byUrl.set(a.url, e);
  }
  const results = [];
  const unresolved = [];
  const urls = [...byUrl.keys()];
  for (let i = 0; i < urls.length; i += 6) { // small parallelism for redirect resolution
    const batch = await Promise.all(urls.slice(i, i + 6).map(async (u) => [u, await resolve(u)]));
    for (const [u, real] of batch) {
      if (real === u && /grounding-api-redirect/.test(u)) unresolved.push(u);
      const spans = [...new Set(byUrl.get(u).spans)].filter(Boolean);
      results.push({ url: real, title: titles.get(u) || hostOf(real), content: '', summary: spans.join(' … ').slice(0, 1500), contentKind: 'summary', sourceType: 'unknown', citedBy: 'deep-research' });
    }
  }
  const dir = path.join(runDir, 'research', 'raw', 'gemini-dr');
  mkdirSync(dir, { recursive: true });
  const base = `${callId}_${String(ia.id || 'replay').slice(-12).replace(/[^A-Za-z0-9_-]/g, '')}`;
  const rawFile = path.join(dir, `${base}.json`);
  writeFileSync(path.join(dir, `${base}.report.md`), text);
  writeFileSync(rawFile, JSON.stringify({ tool: 'deep-research', query: q, callId, provider: 'gemini-deep-research', agent: ia.agent || agentId, interactionId: ia.id || null, replay: Boolean(replay), usage: ia.usage || null, reportFile: `${base}.report.md`, results }, null, 2) + '\n');
  logEvent(runDir, { event: 'deep-research-raw', element: 'R_2a', callId, sources: results.length, unresolved: unresolved.length, replay: Boolean(replay) });
  return { rawFile, reportFile: path.join(dir, `${base}.report.md`), sources: results.length, unresolvedRedirects: unresolved.length, riskFlags: unresolved.length ? ['unresolved-citation-redirects'] : [] };
}

function sentenceAround(text, s = 0, e = s) {
  const start = Math.max(text.lastIndexOf('. ', s) + 2, text.lastIndexOf('\n', s) + 1, 0);
  const endDot = text.indexOf('. ', e);
  const endNl = text.indexOf('\n', e);
  const end = Math.min(...[endDot < 0 ? text.length : endDot + 1, endNl < 0 ? text.length : endNl]);
  return text.slice(start, end).replace(/\s*\[cite:[^\]]*\]/g, '').trim();
}
function hostOf(u) { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return u; } }
