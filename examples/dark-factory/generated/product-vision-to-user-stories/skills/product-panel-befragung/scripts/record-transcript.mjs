#!/usr/bin/env node
// bpmn: {"file":"product-vision-to-user-stories.bpmn","elements":["P_3"]}
//
// Generated from "Transkript / Antworten erfassen" (scriptTask, Process_P) in
// product-vision-to-user-stories.bpmn by flowforge-generate. Deterministic step — no LLM call
// (Gedächtnis §7.4: one transcript per persona, T-<nn>_P-<nn>, with guide version and model role).
//
// Usage: node record-transcript.mjs <runDir> <session.json>
//   session.json: { mode: "interview|walkthrough|rating|vote", panelSet: "proto|full", stepId,
//     stimulus: "path.md", guideVersion?, answers: [{ personaId: "P-01", personaRole:
//     "target|contrarian|refuser", turns: [{ q, a }]?, ratings: [{ item, importance?, satisfaction?, fit? }]?,
//     vote: { score, reason }?, comments: [{ step, comment }]? }] }
// Effect: writes panel/transcripts/T-<nn>_<personaId>_<mode>-<stepId>.md + .meta.json (evidence: synthetic 🤖)
// per persona and panel/sessions/<stepId>_<mode>.json with the merged raw answers. Prints
// { transcripts: [ids], session: path }.
import path from 'node:path';
import { mkdirSync, writeFileSync } from 'node:fs';
import { readJson, writeRecord, nextId, loadRun, logEvent, die, SCHEMA } from './lib/df.mjs';

const [, , runDir, sessFile] = process.argv;
if (!runDir || !sessFile) die('Usage: node record-transcript.mjs <runDir> <session.json>');
const s = readJson(sessFile);
if (!['interview', 'walkthrough', 'rating', 'vote'].includes(s.mode)) die(`invalid mode "${s.mode}"`);
const run = loadRun(runDir);
const tDir = path.join(runDir, 'panel', 'transcripts');
const ids = [];

for (const a of s.answers || []) {
  const id = nextId(tDir, 'T', 2);
  const now = new Date().toISOString();
  const data = {
    schema: SCHEMA.artifact,
    id,
    type: 'interview-transcripts',
    bpmnElement: 'P_3',
    runId: run.runId || path.basename(runDir),
    version: 1,
    status: 'draft',
    language: run.language || 'de',
    producedBy: { agentRole: 'interviewer', modelRole: 'persona', model: 'script' },
    createdAt: now,
    committedAt: now,
    body: null,
    derivedFrom: [{ artifact: null, version: s.guideVersion ?? null, path: s.stimulus }, { artifact: a.personaId, version: null, path: null }].filter((d) => d.path || d.artifact),
    authored: {
      itemIndex: [{ id, derivedFrom: [a.personaId], evidence: 'synthetic', refs: [a.personaId] }],
      sources: [a.personaId],
      attributes: { persona: a.personaId, personaRole: a.personaRole || 'target', mode: s.mode, panelSet: s.panelSet, forStep: s.stepId, guideVersion: s.guideVersion ?? null },
    },
    derived: { items: [id], evidence: { cited: 0, inferred: 0, synthetic: 1, validated: 0, n: 1 } },
    gate: null,
    riskFlags: [],
    history: [],
  };
  const parts = [`# Transcript ${id} — ${a.personaId} (${s.mode}, step ${s.stepId})`, '', '> 🤖 synthetic — answers of a synthetic persona, never real user evidence (Gedächtnis §6).', ''];
  if (a.turns?.length) parts.push('## Dialogue', '', ...a.turns.flatMap((t) => [`**Q:** ${t.q}`, '', `**A:** ${t.a}`, '']));
  if (a.comments?.length) parts.push('## Walkthrough comments', '', ...a.comments.map((c) => `- **${c.step}:** ${c.comment}`), '');
  if (a.ratings?.length) parts.push('## Ratings', '', '| Item | Importance | Satisfaction | Fit |', '|---|---|---|---|', ...a.ratings.map((r) => `| ${r.item} | ${r.importance ?? ''} | ${r.satisfaction ?? ''} | ${r.fit ?? ''} |`), '');
  if (a.vote) parts.push('## Vote', '', `**${a.vote.score}/5** — ${a.vote.reason}`, '');
  writeRecord(path.join(tDir, `${id}_${a.personaId}_${s.mode}-${s.stepId}.md`), data, parts.join('\n'));
  ids.push(id);
}

const sessDir = path.join(runDir, 'panel', 'sessions');
mkdirSync(sessDir, { recursive: true });
const sessionPath = path.join(sessDir, `${s.stepId}_${s.mode}.json`);
writeFileSync(sessionPath, JSON.stringify({ ...s, transcripts: ids }, null, 2));
logEvent(runDir, { event: 'panel-recorded', element: 'P_3', step: s.stepId, mode: s.mode, personas: ids.length });
console.log(JSON.stringify({ transcripts: ids, session: sessionPath }));
process.exit(0);
