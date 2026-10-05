#!/usr/bin/env node
// bpmn: {"file":"product-vision-to-user-stories.bpmn","elements":["K_5"]}
//
// Generated from "Gate-Record schreiben" (scriptTask, Process_K) in
// product-vision-to-user-stories.bpmn by flowforge-generate. Deterministic step — no LLM call
// (Gedächtnis §12). Also used by product-phasen-gate for phase-gate records.
//
// Usage: node write-gate-record.mjs <runDir> <record.json>
//   record.json: { gateway, iteration, pivotCount?, artifacts: ["path.md", ...], rubric, rubricVersion,
//     threshold, score, criteria[], factchecks[], panelVotes[]?, objections[]?, verdict, pathTaken,
//     changeRequests[], riskFlags[], model }
// Effect: allocates the next G-<nnn>, writes gates/G-<nnn>_<gateway>_iter<k>.meta.json (the record,
// schema df.gate-record/v1) plus the rendered .md, then stamps every judged artifact's sidecar with
// gate {record, verdict, score, iteration} and its status (pass -> passed, pass-with-risk ->
// passed-with-risk, no-go -> discarded, otherwise unchanged), merges risk flags, re-renders the
// artifact's read-only frontmatter (body untouched), bumps run.json loop counters and logs an event.
// The critic itself never edits artifacts (product-critic-readonly-guard hook); this script is the one
// sanctioned writer of status and gate, per Gedächtnis §2.2. Prints { id, file }.
import path from 'node:path';
import { existsSync } from 'node:fs';
import { readJson, readMeta, writeRecord, rerender, checkCommitted, nextId, loadRun, saveRun, logEvent, die, SCHEMA } from './lib/df.mjs';

const [, , runDir, recFile] = process.argv;
if (!runDir || !recFile) die('Usage: node write-gate-record.mjs <runDir> <record.json>');
const rec = readJson(recFile);
for (const f of ['gateway', 'iteration', 'verdict', 'pathTaken']) if (rec[f] === undefined) die(`record.json missing "${f}"`);
const verdicts = ['pass', 'fail', 'pass-with-risk', 'pivot', 'more-research', 'no-go'];
if (!verdicts.includes(rec.verdict)) die(`verdict "${rec.verdict}" not in ${verdicts.join('|')}`);

const run = loadRun(runDir);
const gatesDir = path.join(runDir, 'gates');
const id = nextId(gatesDir, 'G', 3);
const riskFlags = [...new Set([...(rec.riskFlags || []), ...(run.modelFamilies?.criticEqualsProducer !== false ? ['same-model-review'] : [])])];

const artifactRefs = [];
for (const p of rec.artifacts || []) {
  if (!existsSync(p)) { artifactRefs.push(`${p} (missing)`); continue; }
  const meta = readMeta(p);
  if (!meta || checkCommitted(p).length) { artifactRefs.push(`${path.basename(p)} (uncommitted)`); continue; }
  artifactRefs.push(`${meta.id}@${meta.version}`);
}

const data = {
  schema: SCHEMA.gate,
  id,
  gateway: rec.gateway,
  iteration: rec.iteration,
  ...(rec.pivotCount !== undefined ? { pivotCount: rec.pivotCount } : {}),
  artifacts: artifactRefs,
  rubric: rec.rubric,
  rubricVersion: rec.rubricVersion ?? 1,
  threshold: rec.threshold ?? 0.8,
  score: rec.score ?? null,
  verdict: rec.verdict,
  pathTaken: rec.pathTaken,
  riskFlags,
  model: rec.model || 'session-default',
  timestamp: new Date().toISOString(),
  criteria: rec.criteria || [],
  factchecks: rec.factchecks || [],
  ...(rec.panelVotes ? { panelVotes: rec.panelVotes } : {}),
  ...(rec.objections ? { objections: rec.objections } : {}),
  changeRequests: rec.changeRequests || [],
};
const table = (rows, cols) => rows?.length
  ? `| ${cols.join(' | ')} |\n|${cols.map(() => '---').join('|')}|\n` + rows.map((r) => `| ${cols.map((c) => String(r[c] ?? '').replace(/\|/g, '\\|')).join(' | ')} |`).join('\n') + '\n'
  : '_none_\n';
const body = `# Gate-Record ${id} — ${rec.gateway} (iteration ${rec.iteration})

**Verdict:** \`${rec.verdict}\` · score ${rec.score ?? '—'} / threshold ${data.threshold} · path taken: ${rec.pathTaken}

## Criteria
${table(rec.criteria, ['id', 'result', 'weight', 'reason'])}
## Factchecks
${table(rec.factchecks, ['claim', 'result', 'source'])}
## Panel votes
${table(rec.panelVotes, ['persona', 'role', 'vote', 'reason'])}
## Objections (Contrarian / Verweigerer)
${table(rec.objections, ['persona', 'objection', 'response', 'riskFlag'])}
## Change requests
${rec.changeRequests?.length ? rec.changeRequests.map((c) => `- ${typeof c === 'string' ? c : `**${c.artifact || ''}**: ${c.request}`}`).join('\n') : '_none_'}
`;
const file = path.join(gatesDir, `${id}_${rec.gateway}_iter${rec.iteration}.md`);
writeRecord(file, data, body);

const statusFor = { pass: 'passed', 'pass-with-risk': 'passed-with-risk', 'no-go': 'discarded' };
for (const p of rec.artifacts || []) {
  const meta = existsSync(p) ? readMeta(p) : null;
  if (!meta) continue;
  meta.gate = { record: id, verdict: rec.verdict, score: rec.score ?? null, iteration: rec.iteration };
  if (statusFor[rec.verdict]) meta.status = statusFor[rec.verdict];
  meta.riskFlags = [...new Set([...(meta.riskFlags || []), ...(rec.verdict === 'pass-with-risk' ? riskFlags : [])])];
  rerender(p, meta);
}

run.loopCounters = { ...(run.loopCounters || {}), [rec.gateway]: rec.iteration };
if (rec.pivotCount !== undefined) run.pivotCount = rec.pivotCount;
run.lastGate = { id, gateway: rec.gateway, verdict: rec.verdict };
saveRun(runDir, run);
logEvent(runDir, { event: 'gate-record', element: 'K_5', id, gateway: rec.gateway, iteration: rec.iteration, verdict: rec.verdict, score: rec.score ?? null });
console.log(JSON.stringify({ id, file }));
process.exit(0);
