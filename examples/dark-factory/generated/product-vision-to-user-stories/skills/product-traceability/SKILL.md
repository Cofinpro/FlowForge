---
name: product-traceability
description: Deterministic scripts of the dark factory's "Traceability-Pruefer" lane — run workspace bookkeeping (run.json, events log, the artifact commit that writes every *.meta.json sidecar) plus "Story -> Epic-Traceability pruefen", "Epic -> Impact / Vision-Traceability pruefen" and "Traceability-Matrix erzeugen" (graph traversal over item derivedFrom links, no LLM). Use when the product-vision-to-user-stories workflow starts a run, when any step commits an artifact, or when it reaches step 6.2.1, 6.2.2 or 6.2.5.
bpmn:
  file: product-vision-to-user-stories.bpmn
  elements: [Start_Geschaeftsidee, S6.2.1, S6.2.2, S6.2.5]
---

# Traceability-Pruefer (lane skill)

Generated from the "Traceability-Pruefer" lane of `product-vision-to-user-stories.bpmn` (SP6.2).
This lane skill bundles the lane's script tasks. Every step here is deterministic, with no LLM
judgement (Gedächtnis §10.2: orphans are found by graph traversal). Executed by `product-traceability`.

| Step | Command |
|---|---|
| Run start ("Geschaeftsidee / Marktbedarf erkannt") | `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/run-state.mjs init runs <runId> <idea.md or "text"> --ensure-project` (creates `.dark-factory/project.json` and ignores `runs/` if missing) |
| Event / position | `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/run-state.mjs event <runDir> '<json>'` |
| "Story -> Epic-Traceability pruefen" (6.2.1) | `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/trace-story-epic.mjs <runDir>` |
| Commit an artifact (every producing step) | `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/commit-artifact.mjs commit <runDir> <file.md> --step <element> [--type t] [--from path] <<'JSON' {authored} JSON` |
| Set type attributes (e.g. epic slice) | `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/commit-artifact.mjs attrs <runDir> <file.md> '{"slice":1}'` |
| List committed artifacts (e.g. `EP[slice=1]`) | `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/commit-artifact.mjs query <runDir> --type epic --attr slice=1` |
| Check that every run Markdown is committed | `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/commit-artifact.mjs check <runDir>` |
| Print the authored JSON Schema | `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/commit-artifact.mjs schema` |
| Create / replace a story record (5.1.1, 5.1.3) | `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/story.mjs put <runDir> --step <element> <<'JSON' {"story": {…}} JSON` |
| Change a story (5.1.3 parent, 5.1.4, 5.2.x, 6.1.x, 6.2.4) | `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/story.mjs patch <runDir> <ST-id> --step <element> <<'JSON' {"story": {<fields>}} JSON` |
| Read / list stories, new ids, schema | `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/story.mjs show|list|next-id|schema <runDir> …` |
| Create / change a spike record (5.1.4; 5.1.3 re-point, 6.2.4 discard) | `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/spike.mjs put <runDir> --step <element>` / `patch <runDir> <SPK-id> --step <element>` with `{"spike": {…}}` on stdin; `show|list|next-id|schema` as for stories |
| Export backlog.json (7, partial: `--partial`) | `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/export-backlog.mjs <runDir> [--partial]` |
| "Epic -> Impact / Vision-Traceability pruefen" (6.2.2) | `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/trace-epic-vision.mjs <runDir>` |
| "Traceability-Matrix erzeugen" (6.2.5) | `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/traceability-matrix.mjs <runDir>` |

## Artifact commit (Gedächtnis §11.2)

Every run document is a Markdown body plus a `<file>.meta.json` sidecar. Producing agents write the
body and pass their authored block (`itemIndex`, `sources`, `riskFlags`, `attributes`,
`openQuestions`, `notesForNext`) to `commit-artifact.mjs commit`. The script rejects unknown keys,
`cited` items without an SRC ref and SRC ids that are not normalized sources. It computes everything
else: id, version, status `draft`, runId, producedBy (from `scripts/lib/contracts.mjs`, generated from
the BPMN), derivedFrom with version + sha256 of the declared inputs, the evidence mix and item list.
It re-renders the read-only frontmatter and snapshots both files to `history/<id>/v<n>.*`.
Re-committing unchanged content is a no-op. A step that changes a file another step produced
(ACs appended to a story) commits it with its own `--step`; the file is amended and the step is
recorded in `amendedBy`.

## Story and spike records (Gedächtnis §11.3)

Stories are JSON-first. The record (`df.story/v1`) lives in the story file's sidecar under
`authored.attributes`; `story.mjs` validates it (unknown fields, `cited` without SRC, size L on an
active story, superseded without `splitInto`, discarded without a reason, AC ids that are not
committed items, duplicate ids), renders `backlog/stories/ST-<nnn>_<slug>.md` and commits both
through the shared commit core (`lib/commit.mjs`). The story file's itemIndex is the ST item,
derived from the record. `export-backlog.mjs` builds `backlog/backlog.json` (`df.backlog/v1`) from
the epic, story and spike records, with the trace chain to VIS per story, `excluded`
(superseded/discarded) and a `problems` list; in full mode problems exit 1.

Spikes (`df.spike/v1`, `spike.mjs`, file `backlog/spikes/SPK-<nnn>_<slug>.md`) work the same
way: one question, `why` sizing is blocked, `blocks` (ST ids), a bounded `timebox` (≤ 2 days /
16 hours), `acceptanceCriteria` defined in advance, `decisionEnabled`. Links are checked both
ways — a spike's `blocks` must be story records, a story's `spikes` must be spike records that
block it — and the export reports one-sided links. Both CLIs share `lib/record-cli.mjs`.

## Traceability checks

The scripts read the `authored.itemIndex` entries (`id`, `derivedFrom`, `evidence`, `refs`, optional
`status`) from every artifact sidecar. They check the required chain
AC → ST → UT → EP/ACTV → (OPP | JOB) → IMP → GOAL → VIS and write:
- `artifacts/p6-akzeptanz/6.2.1_trace-findings.md`
- `artifacts/p6-akzeptanz/6.2.2_trace-findings.md`
- `backlog/traceability.md`

Items that 6.2.4 marked `discarded` are skipped.

Return: the script's JSON output wrapped as
`{"status": "done", "artifacts": [...], "items": [], "riskFlags": [], "summary": "<n> orphans"}`.
