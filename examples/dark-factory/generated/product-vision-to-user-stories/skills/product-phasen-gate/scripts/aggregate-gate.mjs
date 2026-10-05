#!/usr/bin/env node
// bpmn: {"file":"product-vision-to-user-stories.bpmn","elements":["PG_1"]}
//
// Generated from "Verdikt aggregieren" (businessRuleTask, Process_PG) in
// product-vision-to-user-stories.bpmn by flowforge-generate. The counting rules of Gedächtnis
// §9.2/§9.3 are deterministic and live here; the kritiker only supplies the judgement inputs
// (critic verdict, whether objections were addressed, whether a kill assumption is refuted,
// whether viability failed).
//
// Usage: node aggregate-gate.mjs <input.json>
//   input.json: { gate: "G-P1|G-P2|G-P3", criticVerdict: "pass|fail|pass-with-risk", iteration, maxLoops: 3,
//     pivotCount: 0, pivotCap: 2,
//     votes: [{ persona, role: "target|contrarian|refuser", vote: 1-5, wouldUse?: 1-5, paysAtPrice?: bool }],
//     objectionsAddressed: bool, killAssumptionRefuted: bool, viabilityFailed?: bool,
//     citedShare?: 0..1 (G-P2: share of 🔗 in personas/jtbd), problemRankingKill?: bool }
// Prints { verdict, reasons[], riskFlags[], stats }.
import { readJson, die } from './lib/df.mjs';

const [, , file] = process.argv;
if (!file) die('Usage: node aggregate-gate.mjs <input.json>');
const x = readJson(file);
const gate = x.gate;
if (!['G-P1', 'G-P2', 'G-P3'].includes(gate)) die(`unknown gate "${gate}"`);
const iteration = x.iteration ?? 1;
const maxLoops = x.maxLoops ?? 3;
const pivotCount = x.pivotCount ?? 0;
const pivotCap = x.pivotCap ?? 2;
const votes = x.votes || [];
const targets = votes.filter((v) => (v.role || 'target') === 'target'); // Contrarian/Verweigerer never count (§9.2)
const criticOk = x.criticVerdict === 'pass' || x.criticVerdict === 'pass-with-risk';
const reasons = [];
const riskFlags = [];
if (x.criticVerdict === 'pass-with-risk') riskFlags.push('critic-pass-with-risk');

let panelOk;
if (gate === 'G-P1') {
  panelOk = targets.filter((v) => v.vote >= 3).length >= 2; // proto panel: >= 2 of 3 with >= 3/5
  reasons.push(`proto panel: ${targets.filter((v) => v.vote >= 3).length}/${targets.length} voted >= 3`);
} else if (gate === 'G-P2') {
  panelOk = targets.filter((v) => v.vote >= 4).length >= 3 && x.objectionsAddressed === true;
  reasons.push(`target users with desirability >= 4: ${targets.filter((v) => v.vote >= 4).length}/4; objections addressed: ${x.objectionsAddressed}`);
} else {
  const use = targets.filter((v) => (v.wouldUse ?? v.vote) >= 4).length;
  const pay = targets.filter((v) => v.paysAtPrice === true).length;
  panelOk = use >= 3 && pay >= 2;
  reasons.push(`would use >= 4: ${use}/4; pays at lean-canvas price: ${pay}/4`);
}
const scores = targets.map((v) => v.vote);
const spread = scores.length ? Math.max(...scores) - Math.min(...scores) : 0;

let verdict;
if ((gate === 'G-P1' || gate === 'G-P2') && x.killAssumptionRefuted) {
  verdict = 'no-go'; reasons.push('a kill assumption is actively refuted by 🔗 evidence (§9.3)');
} else if (gate === 'G-P2' && x.problemRankingKill) {
  verdict = 'no-go'; reasons.push('core problem not ranked in the top 3 by the target personas (adopted problem-ranking rule)');
} else if (criticOk && panelOk) {
  verdict = 'pass';
} else if (gate === 'G-P2' && ((x.citedShare ?? 1) < 0.5 || spread >= 2)) {
  verdict = 'more-research'; reasons.push(`cited share ${x.citedShare ?? 'n/a'}, vote spread ${spread} (§9.3)`);
} else if (gate === 'G-P2' && x.viabilityFailed && targets.filter((v) => v.vote >= 4).length >= 3) {
  if (pivotCount < pivotCap) { verdict = 'pivot'; reasons.push(`desirability ok, viability fail; pivot ${pivotCount + 1}/${pivotCap}`); }
  else { verdict = 'no-go'; reasons.push('pivot cap reached (§9.3)'); }
} else if (gate === 'G-P2') {
  // G-P2 has no "Nachschaerfen" branch in the BPMN: a plain failure goes back for more research.
  verdict = iteration < maxLoops ? 'more-research' : 'pass';
  if (verdict === 'pass') { riskFlags.push('loop-cap-reached'); reasons.push('loop cap reached — proceeding with risk'); }
} else {
  verdict = iteration < maxLoops ? 'fail' : 'pass';
  if (verdict === 'pass') { riskFlags.push('loop-cap-reached'); reasons.push('loop cap reached — proceeding with risk'); }
  else reasons.push('Nachschaerfen');
}
console.log(JSON.stringify({ verdict, reasons, riskFlags, stats: { targets: targets.length, spread, criticVerdict: x.criticVerdict, iteration, pivotCount } }));
process.exit(0);
