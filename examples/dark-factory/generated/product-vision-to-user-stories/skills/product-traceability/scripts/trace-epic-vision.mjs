#!/usr/bin/env node
// bpmn: {"file":"product-vision-to-user-stories.bpmn","elements":["S6.2.2"]}
//
// Generated from "Epic -> Impact / Vision-Traceability pruefen" (scriptTask, lane "Traceability-Pruefer") in
// product-vision-to-user-stories.bpmn by bpmn2agent-generate. Deterministic graph traversal — no
// LLM (Gedächtnis §10.2: orphans are found deterministically).
//
// Usage: node trace-epic-vision.mjs <runDir>
// Checks every active EP/ACTV item for a complete path up to VIS and writes
// artifacts/p6-akzeptanz/6.2.2_trace-findings.md. Prints {checked, orphans, file}.
import path from 'node:path';
import { writeScriptArtifact, inputsOfType, logEvent, die } from './lib/df.mjs';
import { STEPS } from './lib/contracts.mjs';
import { loadGraph, walkUp, prefixOf, findingsDoc, INACTIVE } from './lib/trace.mjs';

const [, , runDir] = process.argv;
if (!runDir) die('Usage: node trace-epic-vision.mjs <runDir>');
const FROM = 'EP,ACTV'.split(',');
const TO = 'VIS'.split(',');
const items = loadGraph(runDir);
const subjects = [...items.values()].filter((it) => FROM.includes(prefixOf(it.id)) && !INACTIVE.includes(it.status));
const findings = [];
for (const it of subjects) {
  const r = walkUp(items, it.id, TO);
  if (!r.ok) findings.push({ id: it.id, path: r.path, problem: r.problem || 'incomplete chain' });
}
const { meta, body } = findingsDoc({ key: '6.2.2', element: 'S6.2.2', checked: subjects.length, findings, derivedFrom: inputsOfType(runDir, STEPS['S6.2.2'].inputs.map((i) => i.artifact)) });
const file = path.join(runDir, 'artifacts', 'p6-akzeptanz', '6.2.2_trace-findings.md');
writeScriptArtifact(runDir, file, meta, body);
logEvent(runDir, { event: 'trace-check', element: 'S6.2.2', checked: subjects.length, orphans: findings.length });
console.log(JSON.stringify({ checked: subjects.length, orphans: findings.map((f) => f.id), file }));
process.exit(0);
