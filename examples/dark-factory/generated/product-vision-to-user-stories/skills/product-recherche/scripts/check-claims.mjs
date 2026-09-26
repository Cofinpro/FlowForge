#!/usr/bin/env node
// bpmn: {"file":"product-vision-to-user-stories.bpmn","elements":["R_3b"]}
//
// Deterministic part of "Claims extrahieren & Abdeckung pruefen" (R_3b, Process_R) and the citation
// check of R_4 (docs/dark-factory/process-rules.md §8.2–§8.5). The agent extracts the claims; this
// script decides — without an LLM — which ones are triangulated, which scope points are missing and
// what gets downgraded.
//
// Usage:
//   node check-claims.mjs <runDir> <callId> <draft.json> [--round 0|1] [--final]
//   node check-claims.mjs <runDir> <callId> --verify-report <report.md>
//
// draft.json (written by the agent, e.g. research/claims/<callId>.draft.json):
//   { "claims": [ { "id"?: "CLM-004", "text": "...", "scopePoint": "competitors-direct",
//                   "category": "market|number|competitor|regulation|voc|process|other",
//                   "key": true, "sources": ["SRC-0002", "SRC-0009"],
//                   "tierOverride"?: { "SRC-0002": { "tier": "T1", "reason": "..." } } } ] }
// Rules (§8.3/§8.4):
//   - a source counts only if it exists, has content (raw or summary) and its tier may carry the
//     category (T3 never carries market/number/competitor/regulation claims alone; regulation needs a T1);
//   - market/number/competitor sources older than research.yaml freshness.maxAgeYears do not count;
//   - key claim triangulated = >= 2 counted sources from different sites, >= 1 of them contentKind raw;
//   - non-key claim supported = >= 1 counted source;
//   - --round 1 or --final: untriangulated key claims / unsupported claims -> evidence inferred +
//     riskFlag untriangulated-key-claim / unsupported-claim. Nothing is deleted.
// Writes research/claims/<callId>.json (schema df.claim-ledger/v1, the ledger R_4 cites from) and a
// rendered <callId>.md. Prints {status, ledger, stats, gaps, riskFlags}.
import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { readJson, walkMeta, logEvent, die } from './lib/df.mjs';
import { loadConfig } from './lib/research-config.mjs';

const argv = process.argv.slice(2);
const [runDir, callId, draftFile] = argv;
const opt = (n) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : undefined; };
if (!runDir || !callId) die('Usage: check-claims.mjs <runDir> <callId> <draft.json> [--round 0|1] [--final] | --verify-report <report.md>');

const cfg = loadConfig();
const claimsDir = path.join(runDir, 'research', 'claims');
const ledgerFile = path.join(claimsDir, `${callId}.json`);
const srcById = new Map(walkMeta(path.join(runDir, 'research', 'sources')).map((f) => readJson(f)).map((m) => [m.id, m]));

// ------------------------------------------------------------------ R_4: verify a report against the ledger
if (opt('--verify-report')) {
  if (!existsSync(ledgerFile)) die(`no ledger ${ledgerFile} — run R_3b first`);
  const ledger = readJson(ledgerFile);
  const body = readFileSync(opt('--verify-report'), 'utf8');
  const allowedSrc = new Set(ledger.claims.flatMap((c) => c.sources));
  const known = new Set(ledger.claims.map((c) => c.id));
  const usedSrc = [...new Set(body.match(/SRC-\d{4}/g) || [])];
  const usedClm = [...new Set(body.match(/CLM-\d{3,}/g) || [])];
  const problems = [
    ...usedSrc.filter((s) => !allowedSrc.has(s)).map((s) => `${s} is cited but backs no ledger claim`),
    ...usedClm.filter((c) => !known.has(c)).map((c) => `${c} is not in the ledger`),
  ];
  const missingKey = ledger.claims.filter((c) => c.key && !usedClm.includes(c.id)).map((c) => c.id);
  console.log(JSON.stringify({ status: problems.length ? 'fail' : 'ok', problems, keyClaimsNotInReport: missingKey }));
  process.exit(problems.length ? 1 : 0);
}

// ------------------------------------------------------------------ R_3b: evaluate the draft
if (!draftFile || !existsSync(draftFile)) die('draft.json missing');
const draft = readJson(draftFile);
const round = Number(opt('--round') ?? 0);
const final = argv.includes('--final') || round >= 1;
const maxAge = cfg.freshness?.maxAgeYears || {};
const now = Date.now();
const CARRY = { // which tiers may carry a category (§8.3)
  market: ['T1', 'T2'], number: ['T1', 'T2'], competitor: ['T1', 'T2'], regulation: ['T1', 'T2'],
  voc: ['T1', 'T2', 'T3'], process: ['T1', 'T2', 'T3'], other: ['T1', 'T2', 'T3'],
};

// IDs are stable per run (Gedächtnis §10.1): a claim seen in an earlier round of this call keeps its id.
const norm = (s) => String(s || '').toLowerCase().replace(/\s+/g, ' ').trim();
const prevIds = new Map(existsSync(ledgerFile) ? (readJson(ledgerFile).claims || []).map((c) => [norm(c.text), c.id]) : []);
let next = nextClaimNumber();
const problems = [];
const claims = (draft.claims || []).map((c) => {
  const cat = CARRY[c.category] ? c.category : 'other';
  const flags = [];
  const srcs = [...new Set(c.sources || [])].map((id) => {
    const m = srcById.get(id);
    if (!m) { problems.push(`${c.id || c.text.slice(0, 40)}: unknown source ${id}`); return { id, counts: false, why: 'unknown' }; }
    const tier = c.tierOverride?.[id]?.tier || m.tier || 'T2';
    const date = m.publishedAt || null;
    const ageY = date ? (now - Date.parse(date)) / 3.156e10 : null;
    let why = null;
    if (m.contentKind === 'none') why = 'no content';
    else if (!CARRY[cat].includes(tier)) why = `tier ${tier} cannot carry ${cat}`;
    else if (maxAge[cat] && ageY !== null && ageY > maxAge[cat]) why = `older than ${maxAge[cat]} years`;
    if (maxAge[cat] && !date) flags.push('undated-source');
    return { id, site: m.site || m.url, tier, contentKind: m.contentKind || 'summary', date, counts: !why, why };
  });
  const counted = srcs.filter((s) => s.counts);
  const sites = new Set(counted.map((s) => s.site));
  const hasRaw = counted.some((s) => s.contentKind === 'raw');
  const regOk = cat !== 'regulation' || counted.some((s) => s.tier === 'T1');
  const triangulated = sites.size >= 2 && hasRaw && regOk;
  const supported = counted.length >= 1 && regOk;
  const ok = c.key ? triangulated : supported;
  if (!ok && final) flags.push(c.key ? 'untriangulated-key-claim' : 'unsupported-claim');
  return {
    id: c.id && /^CLM-\d{3,}$/.test(c.id) ? c.id : prevIds.get(norm(c.text)) || `CLM-${String(next++).padStart(3, '0')}`,
    text: c.text, scopePoint: c.scopePoint || null, category: cat, key: Boolean(c.key),
    sources: srcs.map((s) => s.id), sourceCheck: srcs,
    triangulated, supported, evidence: ok ? 'cited' : final ? 'inferred' : 'pending',
    riskFlags: [...new Set(flags)],
    ...(c.tierOverride ? { tierOverride: c.tierOverride } : {}),
  };
});

const scope = cfg.scope?.[callId] || [];
const gaps = [
  ...scope.filter((p) => !claims.some((c) => c.scopePoint === p && (c.key ? c.triangulated : c.supported)))
    .map((p) => ({ kind: 'scope', ref: p, query: `${p.replace(/-/g, ' ')} (${callId})` })),
  ...claims.filter((c) => c.key && !c.triangulated).map((c) => ({ kind: 'claim', ref: c.id, query: c.text.slice(0, 160) })),
  ...claims.filter((c) => !c.key && !c.supported).map((c) => ({ kind: 'claim', ref: c.id, query: c.text.slice(0, 160) })),
];
const stats = {
  claims: claims.length, key: claims.filter((c) => c.key).length,
  triangulated: claims.filter((c) => c.key && c.triangulated).length,
  downgraded: claims.filter((c) => c.evidence === 'inferred').length,
  scopeCovered: scope.length - gaps.filter((g) => g.kind === 'scope').length, scopeTotal: scope.length,
};
const ledger = { schema: 'df.claim-ledger/v1', callId, round, final, generatedAt: new Date().toISOString(), scope, stats, gaps, problems, claims };
mkdirSync(claimsDir, { recursive: true });
writeFileSync(ledgerFile, JSON.stringify(ledger, null, 2) + '\n');
writeFileSync(ledgerFile.replace(/\.json$/, '.md'), render(ledger));
logEvent(runDir, { event: 'claims-checked', element: 'R_3b', callId, round, ...stats, gaps: gaps.length });
const riskFlags = [...new Set(claims.flatMap((c) => c.riskFlags))];
if (final && gaps.some((g) => g.kind === 'scope')) riskFlags.push('scope-gap');
console.log(JSON.stringify({ status: problems.length ? 'partial' : 'done', ledger: ledgerFile, stats, gaps: final ? [] : gaps.slice(0, 20), openGaps: gaps.length, problems, riskFlags }));

// ------------------------------------------------------------------ helpers
function nextClaimNumber() {
  let max = 0;
  if (existsSync(claimsDir)) for (const f of readdirSync(claimsDir).filter((x) => /^[^.]+\.json$/.test(x))) {
    try { for (const c of readJson(path.join(claimsDir, f)).claims || []) max = Math.max(max, Number(c.id.slice(4)) || 0); } catch { /* ignore */ }
  }
  for (const c of draft.claims || []) if (/^CLM-\d+$/.test(c.id || '')) max = Math.max(max, Number(c.id.slice(4)));
  return max + 1;
}
function render(l) {
  const esc = (s) => String(s ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
  const rows = l.claims.map((c) => `| ${c.id} | ${c.key ? '★' : ''} | ${esc(c.scopePoint)} | ${esc(c.text)} | ${c.sources.join(', ')} | ${c.key ? (c.triangulated ? '✔' : '✘') : (c.supported ? '✔' : '✘')} | ${c.evidence === 'cited' ? '🔗' : c.evidence === 'inferred' ? '🧠' : '…'} |`);
  return `# Claim-Ledger ${l.callId} (Runde ${l.round}${l.final ? ', final' : ''})\n\n` +
    `Generiert von \`check-claims.mjs\` — nicht von Hand bearbeiten. Regeln: Gedächtnis §8.3/§8.4.\n\n` +
    `Claims: ${l.stats.claims} · Kern-Claims: ${l.stats.key} (trianguliert ${l.stats.triangulated}) · herabgestuft: ${l.stats.downgraded} · Scope: ${l.stats.scopeCovered}/${l.stats.scopeTotal}\n\n` +
    `| ID | Kern | Scope | Claim | Quellen | Beleg | Evidenz |\n|---|---|---|---|---|---|---|\n${rows.join('\n')}\n\n` +
    (l.gaps.length ? `## Lücken\n\n${l.gaps.map((g) => `- ${g.kind}: ${g.ref}`).join('\n')}\n` : '## Lücken\n\nkeine\n');
}
