#!/usr/bin/env node
// bpmn: {"file":"product-vision-to-user-stories.bpmn","elements":["S5.1.4"]}
//
// Spike records (Gedächtnis §11.3): spikes are JSON-first like stories. The agent of 5.1.4 "Technische
// Unsicherheit als Spike auslagern" hands over the structured spike (df.spike/v1); this script
// validates it, renders backlog/spikes/SPK-<nnn>_<slug>.md and commits both files through the shared
// commit core. Agents never write a spike Markdown file (product-artifact-contract-guard). Deterministic.
//
// Usage (JSON on stdin: {"spike": {...}, "riskFlags"?, "sources"?, "openQuestions"?, "notesForNext"?}):
//   node spike.mjs put     <runDir> --step S5.1.4                         # create / fully replace
//   node spike.mjs patch   <runDir> <SPK-id> --step <element>             # e.g. status done + outcome, or discarded (6.2.4)
//   node spike.mjs show    <runDir> <SPK-id>
//   node spike.mjs list    <runDir> [--blocks ST-001] [--status open]
//   node spike.mjs next-id <runDir> [--count n]
//   node spike.mjs schema                                                  # df.spike/v1 JSON Schema
// Cross-check: every story in `blocks` is a committed story record. After the put, add the spike to
// each blocked story with story.mjs patch … {"story": {"spikes": [...]}} (story.mjs checks the link back).
import { readMeta } from './lib/df.mjs';
import { rel } from './lib/commit.mjs';
import { runRecordCli, fileOf, recordIds } from './lib/record-cli.mjs';
import { SPIKE_SCHEMA, validateSpike, renderSpike, itemIndexOf } from './lib/spike.mjs';

runRecordCli({
  key: 'spike', type: 'spikes', prefix: 'SPK', script: 'spike.mjs', schema: SPIKE_SCHEMA,
  validate: validateSpike, render: renderSpike, itemIndexOf, defaults: { status: 'open' },
  crossCheck(runDir, sp) {
    const stories = recordIds(runDir, 'story-cards');
    return (sp.blocks || []).filter((st) => !stories.has(st)).map((st) => `${st} in blocks is not a committed story record`);
  },
  // artifact lineage = the files of the stories it blocks
  lineage(runDir, sp) {
    return (sp.blocks || []).map((st) => fileOf(runDir, st)).filter(Boolean).map((f) => { const m = readMeta(f); return { artifact: m.id, version: m.version, sha256: m.body?.sha256, path: rel(runDir, f) }; });
  },
  listRow: (sp) => ({ id: sp.id, title: sp.title, blocks: sp.blocks, timebox: `${sp.timebox?.amount} ${sp.timebox?.unit}`, spikeStatus: sp.status || 'open' }),
  listFilters: { '--blocks': 'blocks', '--status': 'spikeStatus' },
}, process.argv.slice(2));
