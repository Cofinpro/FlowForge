#!/usr/bin/env node
// bpmn: {"file":"product-vision-to-user-stories.bpmn","elements":["S5.1.1"]}
//
// Story records (Gedächtnis §11.3): stories are JSON-first. The agent hands over the structured story
// (df.story/v1); this script validates it, renders backlog/stories/ST-<nnn>_<slug>.md from it and
// commits both files through the shared commit core (same sidecar, versioning and history as every
// artifact). Agents never write a story Markdown file (product-artifact-contract-guard). Deterministic.
//
// Usage (JSON on stdin: {"story": {...}, "riskFlags"?, "sources"?, "openQuestions"?, "notesForNext"?}):
//   node story.mjs put     <runDir> --step <element> [--from <path>]...   # create / fully replace (5.1.1, 5.1.3 children)
//   node story.mjs patch   <runDir> <ST-id> --step <element>              # merge fields into an existing story (5.1.3 parent, 5.1.4, 5.2.x, 6.1.x, 6.2.4)
//   node story.mjs show    <runDir> <ST-id>                               # {path, version, status, story}
//   node story.mjs list    <runDir> [--epic EP-001] [--status active]     # index rows
//   node story.mjs next-id <runDir> [--count n]                           # next free ST ids
//   node story.mjs schema                                                  # df.story/v1 JSON Schema
// Patch semantics: top-level fields replace, objects (connextra, size, scope) merge one level; `id` is fixed.
// Cross-checks: every AC id is an item of a committed acceptance-criteria artifact; every SPK id in
// `spikes` is a committed spike record (spike.mjs) that lists this story in its `blocks` (not checked
// once the story is superseded or discarded — 5.1.3 re-points the spike to a child first).
import { readMeta } from './lib/df.mjs';
import { committed, rel } from './lib/commit.mjs';
import { runRecordCli, fileOf, recordsOf } from './lib/record-cli.mjs';
import { STORY_SCHEMA, validateStory, renderStory, itemIndexOf } from './lib/story.mjs';

runRecordCli({
  key: 'story', type: 'story-cards', prefix: 'ST', script: 'story.mjs', schema: STORY_SCHEMA,
  validate: validateStory, render: renderStory, itemIndexOf, defaults: { status: 'active' },
  crossCheck(runDir, st) {
    const p = [];
    const known = new Set(committed(runDir).flatMap((a) => (['story-cards', 'spikes'].includes(a.meta.type) ? [] : (a.meta.authored?.itemIndex || []).map((i) => i.id))));
    for (const ac of st.acceptanceCriteria || []) if (ac?.id && !known.has(ac.id)) p.push(`${ac.id} is not an item of any committed acceptance-criteria artifact — commit that first (6.1.3)`);
    const spikes = Object.fromEntries(recordsOf(runDir, 'spikes').map((a) => [a.meta.authored.attributes.id, a.meta.authored.attributes]));
    const live = !['superseded', 'discarded'].includes(st.status); // out of the backlog: links no longer checked
    for (const spk of live ? st.spikes || [] : []) {
      if (!spikes[spk]) p.push(`${spk} is not a committed spike record — create it with spike.mjs put first (5.1.4)`);
      else if (!(spikes[spk].blocks || []).includes(st.id)) p.push(`${spk} does not list ${st.id} in its blocks`);
    }
    return p;
  },
  // a split child derives from its parent story file; a re-put keeps the previous lineage;
  // a new story resolves the step's declared inputs (story-map), never its sibling stories
  lineage(runDir, st, existing) {
    const parent = st.splitFrom && fileOf(runDir, st.splitFrom);
    const pm = parent && readMeta(parent);
    if (pm) return [{ artifact: pm.id, version: pm.version, sha256: pm.body?.sha256, path: rel(runDir, parent) }];
    return existing ? readMeta(existing)?.derivedFrom : undefined;
  },
  listRow: (st) => ({ id: st.id, title: st.title, epic: st.epic, userTask: st.userTask, size: st.size?.class || null, storyStatus: st.status || 'active', acs: (st.acceptanceCriteria || []).length, spikes: st.spikes || [] }),
  listFilters: { '--epic': 'epic', '--status': 'storyStatus' },
}, process.argv.slice(2));
