#!/usr/bin/env node
// bpmn: {"file":"product-vision-to-user-stories.bpmn","elements":["S7","SP_Budget_S1"]}
//
// Deterministic part of "7 Abschluss: Backlog exportieren & Run-Report erstellen" (and of
// "Teilergebnis sichern" in partial mode): builds backlog/backlog.json (df.backlog/v1) from the
// epic and story records (Gedächtnis §11.3). No LLM — the model only writes REPORT.md.
//
// Usage: node export-backlog.mjs <runDir> [--partial]
// Stories come from the story sidecars (authored.attributes, df.story/v1), spikes from the spike
// sidecars (df.spike/v1); discarded and superseded stories and discarded spikes are listed under
// `excluded`, never exported. Each story carries its trace chain up to VIS
// (lib/trace.mjs), its artifact version/status/gate and risk flags. Consistency problems (AC ids
// not in the item graph, stories without a complete chain, epic missing, story ↔ spike links that
// do not match in both directions, spikes blocking only excluded stories) are collected in
// `problems` — in full mode the script exits 1 when there are any. Prints {file, epics, stories, problems}.
import path from 'node:path';
import { readJson, writeJson, loadRun, walkMeta, logEvent, die, SCHEMA } from './lib/df.mjs';
import { committed, rel } from './lib/commit.mjs';
import { loadGraph, walkUp } from './lib/trace.mjs';

const [, , runDir, ...flags] = process.argv;
if (!runDir) die('Usage: node export-backlog.mjs <runDir> [--partial]');
const partial = flags.includes('--partial');
const run = loadRun(runDir);
const all = committed(runDir);
const items = loadGraph(runDir);
const problems = [];

const epics = all.filter((a) => a.meta.type === 'epic').map(({ md, meta }) => {
  const at = meta.authored?.attributes || {};
  return { id: meta.derived?.items?.[0] || at.id || meta.id, title: at.title || null, slice: at.slice ?? null, goal: at.goal || null, actv: at.actv || null, tasks: at.tasks || [], version: meta.version, status: meta.status, path: rel(runDir, md), stories: [] };
}).sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
const epicById = Object.fromEntries(epics.map((e) => [e.id, e]));

const exported = [];
const excluded = [];
for (const { md, meta } of all.filter((a) => a.meta.type === 'story-cards' && a.meta.authored?.attributes?.id)) {
  const st = meta.authored.attributes;
  const status = st.status || 'active';
  if (status === 'discarded' || status === 'superseded') { excluded.push({ id: st.id, status, splitFrom: st.splitFrom || null }); continue; }
  const chain = walkUp(items, st.id, ['VIS']);
  if (!chain.ok) problems.push(`${st.id}: trace chain incomplete — ${chain.problem || 'no path to VIS'}`);
  for (const ac of st.acceptanceCriteria || []) {
    const it = items.get(ac.id);
    if (!it) problems.push(`${st.id}: ${ac.id} is not an item in the run`);
    else if (!(it.derivedFrom || []).includes(st.id)) problems.push(`${st.id}: ${ac.id} does not derive from ${st.id}`);
  }
  if (!(st.acceptanceCriteria || []).length) problems.push(`${st.id}: no acceptance criteria`);
  if (!epicById[st.epic]) problems.push(`${st.id}: epic ${st.epic} has no committed epic file`);
  else epicById[st.epic].stories.push(st.id);
  exported.push({
    ...st, status,
    trace: chain.path,
    traceComplete: chain.ok,
    artifact: { id: meta.id, version: meta.version, status: meta.status, gate: meta.gate, path: rel(runDir, md) },
    riskFlags: meta.riskFlags || [],
  });
}
exported.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));

// spikes: exported with their state; links must match both ways (story.spikes <-> spike.blocks)
const storyById = Object.fromEntries(exported.map((s) => [s.id, s]));
const excludedIds = new Set(excluded.map((x) => x.id));
const spikes = [];
for (const { md, meta } of all.filter((a) => a.meta.type === 'spikes' && a.meta.authored?.attributes?.id)) {
  const sp = meta.authored.attributes;
  const status = sp.status || 'open';
  if (status === 'discarded') { excluded.push({ id: sp.id, status, blocks: sp.blocks }); continue; }
  const live = (sp.blocks || []).filter((st) => !excludedIds.has(st));
  if (!live.length) problems.push(`${sp.id}: blocks only excluded stories (${sp.blocks.join(', ')}) — discard it`);
  for (const st of live) {
    if (!storyById[st]) problems.push(`${sp.id}: blocked story ${st} is not in the run`);
    else if (!(storyById[st].spikes || []).includes(sp.id)) problems.push(`${sp.id}: ${st} does not list it in spikes`);
  }
  spikes.push({ ...sp, status, artifact: { id: meta.id, version: meta.version, status: meta.status, gate: meta.gate, path: rel(runDir, md) }, riskFlags: meta.riskFlags || [] });
}
spikes.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
const spikeById = Object.fromEntries(spikes.map((s) => [s.id, s]));
for (const st of exported) for (const spk of st.spikes || []) {
  if (!spikeById[spk]) problems.push(`${st.id}: spike ${spk} is not an exported spike record`);
  else if (!spikeById[spk].blocks.includes(st.id)) problems.push(`${st.id}: ${spk} does not list it in blocks`);
}

const gates = walkMeta(path.join(runDir, 'gates')).map((f) => readJson(f)).filter((g) => g.schema === SCHEMA.gate);
const n = exported.length;
const share = (l) => (n ? Math.round((exported.filter((s) => s.evidence === l).length / n) * 100) / 100 : 0);
const backlog = {
  schema: 'df.backlog/v1',
  runId: run.runId || path.basename(runDir),
  status: partial ? 'partial' : 'complete',
  generatedAt: new Date().toISOString(),
  bpmn: run.bpmn || null,
  language: run.language || 'de',
  epics,
  stories: exported,
  spikes,
  excluded,
  stats: {
    epics: epics.length, stories: n, acceptanceCriteria: exported.reduce((s, x) => s + (x.acceptanceCriteria || []).length, 0),
    sizes: Object.fromEntries(['S', 'M', 'L', 'unsized'].map((c) => [c, exported.filter((s) => (s.size?.class || 'unsized') === c).length])),
    spikes: { open: spikes.filter((x) => x.status === 'open').length, done: spikes.filter((x) => x.status === 'done').length,
      timeboxDays: Math.round(spikes.reduce((t, x) => t + (x.timebox.unit === 'days' ? x.timebox.amount : x.timebox.amount / 8), 0) * 10) / 10 },
    evidence: { cited: share('cited'), inferred: share('inferred'), synthetic: share('synthetic'), n },
    passWithRiskGates: gates.filter((g) => g.verdict === 'pass-with-risk').map((g) => g.id),
  },
  problems,
};
const file = path.join(runDir, 'backlog', 'backlog.json');
writeJson(file, backlog);
logEvent(runDir, { event: 'backlog-exported', element: partial ? 'SP_Budget_S1' : 'S7', stories: n, spikes: spikes.length, problems: problems.length, partial });
console.log(JSON.stringify({ file, epics: epics.length, stories: n, spikes: spikes.length, excluded: excluded.length, problems }));
process.exit(problems.length && !partial ? 1 : 0);
