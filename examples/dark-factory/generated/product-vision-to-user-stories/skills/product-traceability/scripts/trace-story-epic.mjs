#!/usr/bin/env node
// bpmn: {"file":"product-vision-to-user-stories.bpmn","elements":["S6.2.1"]}
//
// Generated from "Story -> Epic-Traceability pruefen" (scriptTask, lane "Traceability-Pruefer") in
// product-vision-to-user-stories.bpmn by flowforge-generate. Deterministic graph traversal — no
// LLM (Gedächtnis §10.2: orphans are found deterministically).
//
// Usage: node trace-story-epic.mjs <runDir>
// Checks every active ST item for a complete path up to EP/ACTV and writes
// artifacts/p6-akzeptanz/6.2.1_trace-findings.md. Prints {checked, orphans, file}.
import path from 'node:path';
import { writeScriptArtifact, inputsOfType, logEvent, die } from './lib/df.mjs';
import { STEPS } from './lib/contracts.mjs';
import { loadGraph, walkUp, prefixOf, findingsDoc, INACTIVE } from './lib/trace.mjs';

const [, , runDir] = process.argv;
if (!runDir) die('Usage: node trace-story-epic.mjs <runDir>');
const FROM = 'ST'.split(',');
const TO = 'EP,ACTV'.split(',');
const items = loadGraph(runDir);
const subjects = [...items.values()].filter((it) => FROM.includes(prefixOf(it.id)) && !INACTIVE.includes(it.status));
const findings = [];
for (const it of subjects) {
  const r = walkUp(items, it.id, TO);
  if (!r.ok) findings.push({ id: it.id, path: r.path, problem: r.problem || 'incomplete chain' });
}
const { meta, body } = findingsDoc({ key: '6.2.1', element: 'S6.2.1', checked: subjects.length, findings, derivedFrom: inputsOfType(runDir, STEPS['S6.2.1'].inputs.map((i) => i.artifact)) });
const file = path.join(runDir, 'artifacts', 'p6-akzeptanz', '6.2.1_trace-findings.md');
writeScriptArtifact(runDir, file, meta, body);
logEvent(runDir, { event: 'trace-check', element: 'S6.2.1', checked: subjects.length, orphans: findings.length });
console.log(JSON.stringify({ checked: subjects.length, orphans: findings.map((f) => f.id), file }));
process.exit(0);
