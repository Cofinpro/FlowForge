#!/usr/bin/env node
// bpmn: {"file":"product-vision-to-user-stories.bpmn","elements":["K_4"]}
//
// Generated from "Verdikt bilden & Loop-Cap anwenden" (scriptTask, Process_K) in
// product-vision-to-user-stories.bpmn by flowforge-generate. Deterministic step — no LLM call
// (Gedächtnis §9.1).
//
// Usage: node verdict.mjs <evaluation.json>
//   evaluation.json: { "threshold": 0.8, "iteration": 1, "maxLoops": 3,
//     "criteria": [{ "id", "weight"?: 1, "kill"?: false, "result": "pass|partial|fail", "reason" }],
//     "factchecks": [{ "claim", "criterion", "result": "confirmed|refuted|unclear", "source"? }] }
// Rules: a refuted factcheck turns its criterion into fail. Score = weighted share of pass
// (partial = 0.5). score >= threshold -> pass. Otherwise iteration < maxLoops -> fail (loop back);
// iteration >= maxLoops -> pass-with-risk and every non-pass criterion becomes a risk flag.
// Prints { score, verdict, openCriteria, riskFlags, killCriteriaFailed }.
import { readJson, die } from './lib/df.mjs';

const [, , file] = process.argv;
if (!file) die('Usage: node verdict.mjs <evaluation.json>');
const ev = readJson(file);
const threshold = ev.threshold ?? 0.8;
const iteration = ev.iteration ?? 1;
const maxLoops = ev.maxLoops ?? 3;
if (!Array.isArray(ev.criteria) || ev.criteria.length === 0) die('evaluation.json has no criteria');

const criteria = ev.criteria.map((c) => ({ ...c }));
for (const fc of ev.factchecks || []) {
  if (fc.result === 'refuted') {
    const c = criteria.find((x) => x.id === fc.criterion);
    if (c) { c.result = 'fail'; c.reason = `${c.reason || ''} [refuted by factcheck: ${fc.claim}]`.trim(); }
  }
}
const value = { pass: 1, partial: 0.5, fail: 0 };
let total = 0;
let got = 0;
for (const c of criteria) {
  const w = Number(c.weight ?? 1);
  if (!(c.result in value)) die(`criterion ${c.id} has invalid result "${c.result}"`);
  total += w;
  got += w * value[c.result];
}
const score = Math.round((got / total) * 1000) / 1000;
const openCriteria = criteria.filter((c) => c.result !== 'pass').map((c) => c.id);
const killCriteriaFailed = criteria.filter((c) => c.kill && c.result === 'fail').map((c) => c.id);

let verdict;
let riskFlags = [...(ev.riskFlags || [])];
if (score >= threshold && killCriteriaFailed.length === 0) verdict = 'pass';
else if (iteration < maxLoops) verdict = 'fail';
else {
  verdict = 'pass-with-risk';
  riskFlags = [...riskFlags, 'loop-cap-reached', ...openCriteria.map((id) => `open-criterion:${id}`)];
}
console.log(JSON.stringify({ score, threshold, iteration, maxLoops, verdict, openCriteria, killCriteriaFailed, riskFlags }));
process.exit(0);
