#!/usr/bin/env node
// bpmn: {"file":"product-vision-to-user-stories.bpmn","elements":["S6.2.5"]}
//
// Generated from "Traceability-Matrix erzeugen" (scriptTask, lane "Traceability-Pruefer") in
// product-vision-to-user-stories.bpmn by bpmn2agent-generate. Deterministic — no LLM.
//
// Usage: node traceability-matrix.mjs <runDir>
// Builds the matrix Vision → Goal → Impact → Epic → Story → AC (docs/dark-factory/implementation.md §6) for
// every active story of the cleaned backlog (items discarded in 6.2.4 are skipped) and writes
// backlog/traceability.md. Prints {stories, complete, incomplete, file}.
import path from 'node:path';
import { writeScriptArtifact, inputsOfType, logEvent, die } from './lib/df.mjs';
import { STEPS } from './lib/contracts.mjs';
import { loadGraph, walkUp, prefixOf, INACTIVE } from './lib/trace.mjs';

const [, , runDir] = process.argv;
if (!runDir) die('Usage: node traceability-matrix.mjs <runDir>');
const items = loadGraph(runDir);
const active = [...items.values()].filter((it) => !INACTIVE.includes(it.status));
const stories = active.filter((it) => prefixOf(it.id) === 'ST').sort((a, b) => a.id.localeCompare(b.id));
const acsOf = (st) => active.filter((it) => prefixOf(it.id) === 'AC' && (it.derivedFrom || []).includes(st)).map((a) => a.id);

let complete = 0;
const rows = stories.map((st) => {
  const r = walkUp(items, st.id, ['VIS']);
  const pick = (...p) => r.path.filter((x) => p.includes(prefixOf(x))).join(', ') || '—';
  const acs = acsOf(st.id);
  const ok = r.ok && acs.length > 0;
  if (ok) complete++;
  return `| ${pick('VIS')} | ${pick('GOAL')} | ${pick('IMP')} | ${pick('EP', 'ACTV')} | ${st.id} | ${acs.join(', ') || '—'} | ${ok ? '✅' : '❌ ' + (r.problem || 'no AC')} |`;
});

const meta = {
  id: '6.2.5_traceability-matrix', type: 'traceability-matrix', bpmnElement: 'S6.2.5', agentRole: 'traceability',
  derivedFrom: inputsOfType(runDir, [...STEPS['S6.2.5'].inputs.map((i) => i.artifact), 'trace-findings']), attributes: { stories: stories.length, complete },
};
const body = `# Traceability matrix\n\n${complete}/${stories.length} stories have the complete chain AC → ST → UT → EP/ACTV → (OPP|JOB) → IMP → GOAL → VIS.\n\n| Vision | Goal | Impact | Epic | Story | AC | Complete |\n|---|---|---|---|---|---|---|\n${rows.join('\n') || '| — | — | — | — | — | — | — |'}\n`;
const file = path.join(runDir, 'backlog', 'traceability.md');
writeScriptArtifact(runDir, file, meta, body);
logEvent(runDir, { event: 'traceability-matrix', element: 'S6.2.5', stories: stories.length, complete });
console.log(JSON.stringify({ stories: stories.length, complete, incomplete: stories.length - complete, file }));
process.exit(0);
