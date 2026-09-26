---
name: product-orphan-fake-stories-aussortieren
description: >-
  Sorts out orphan, fake and duplicate stories from the backlog — consuming the deterministic orphan findings of 6.2.1/6.2.2 and judging fake stories and duplicates — as the critic-owned business rule
  step. Use when the dark-factory workflow reaches step 6.2.4 "Orphan- & Fake-Stories aussortieren".
bpmn:
  file: product-vision-to-user-stories.bpmn
  elements: [S6.2.4]
---

# Orphan- & Fake-Stories aussortieren (step 6.2.4)

Generated from `product-vision-to-user-stories.bpmn`'s "Orphan- & Fake-Stories aussortieren" (businessRuleTask, lane "Kritiker") by `bpmn2agent-generate`. Produces backlog-cleaned, the input of 6.2.5 (traceability matrix), the traceability critic at SP6.2_Gw and step 7 export; rubric backlog-hygiene requires no orphans, no fake stories, no duplicates. It is its own skill because it produces an independently versioned artifact with its own contract (body + sidecar), template and rubric (mapping-rubric.md's serviceTask rule; one skill per business step, docs/dark-factory/implementation.md §2).

Executed by the `product-kritiker` agent. Binding rules: `${CLAUDE_PLUGIN_ROOT}/knowledge/process-rules.md` — evidence §6, item IDs §10, artifact contract §11.2, iterations §15.

## Run context

The Workflow passes `runDir`, `runId`, `iteration` and `changeRequests` (from the last gate record of this phase).

| Input | Required | Path pattern |
|---|---|---|
| `trace-findings` | yes | `runs/{runId}/artifacts/p6-akzeptanz/{step}_trace-findings.md` |

| Output | Item prefix | Cardinality | Path pattern |
|---|---|---|---|
| `backlog-cleaned` | — | one | `runs/{runId}/artifacts/p6-akzeptanz/6.2.4_backlog-cleaned.md` |


## Procedure

0. **Resume / iterate.** Read the output's sidecar (`<file>.meta.json`) if it exists. If it has `status: passed`/`passed-with-risk`, or `iteration > 1` and no change request concerns this artifact or an upstream artifact it consumes, return it unchanged (idempotent resume). Otherwise work every change request into the body and keep item IDs stable when the item is materially the same. Do not copy files to `history/` or touch `version` — `commit-artifact.mjs` does both (Gedächtnis §15).
1. Read trace-findings from 6.2.1 (story → epic) and 6.2.2 (epic → impact/vision); take the orphan list as given — do not recompute graph paths.
2. For each orphan record the break in the chain (missing UT/EP/OPP|JOB/IMP/GOAL/VIS link) and decide: discard, or re-attach request to the producer when the story is valuable but mislinked.
3. Judge every remaining story for fake-story signals: role is the delivery team or the system ("As a developer/QA …"), purely technical "so that", need inside the team's own zone of control, or a misleading story that describes a solution instead of the need.
4. Judge duplicates: compare stories semantically (same role, goal and outcome, possibly different wording or epic); keep the better-traced one and mark the other duplicateOf.
5. Discard removed stories with `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/story.mjs patch <runDir> <ST id> --step S6.2.4` → {"story": {"status": "discarded", "discard": {"reason": "orphan|fake|duplicate", "duplicateOf"?: "ST-nnn", "justification": "…"}}} — never delete files or reuse ids; their ACs drop out of the export with the story. List micro-stories that are fine because their hierarchy is tracked. Discard every spike whose blocked stories are all discarded (`node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/spike.mjs patch <runDir> <SPK id> --step S6.2.4` → {"spike": {"status": "discarded"}}); export-backlog.mjs reports spikes that only block excluded stories.
6. Write backlog-cleaned to artifacts/p6-akzeptanz/: remaining stories by epic, discarded list with reasons, re-attach change requests, and a rubric backlog-hygiene assessment per criterion (pass/partial/fail); never set status passed.
7. Write the output **body** from `assets/template.md`: Markdown only, no frontmatter (the product-artifact-contract-guard hook rejects a Write that starts with `---`).
8. Run the self-check below and fix what fails. Never set `passed` yourself — only the critic gate does (Gedächtnis §2.2).
9. **Commit** every output file with its authored block (see "Artifact contract" below): `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/commit-artifact.mjs commit <runDir> <file.md> --step S6.2.4 <<'JSON'` … `JSON`. The script computes id, version, status, derivedFrom, evidence mix and history; fix every rejection it prints and commit again. Re-committing an unchanged file is a no-op. Then apply the story changes with `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/story.mjs patch <runDir> <storyId> --step S6.2.4` (see "Story records" below).
10. Log: `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/run-state.mjs event <runDir> '{"event":"step-done","element":"S6.2.4"}'`.

## Backlog records (Gedächtnis §11.3)

Stories and spikes are JSON-first: the record in the file's sidecar (`authored.attributes`, schema `df.story/v1` / `df.spike/v1`) is the story or spike; `backlog/stories/ST-*.md`, `SPK-*.md` and `backlog.json` are generated from it. Read one with `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/story.mjs show <runDir> <ST-id>` (or `spike.mjs show <SPK-id>`), list them with `list <runDir> [--epic EP-nnn]` (spikes: `[--blocks ST-nnn]`), get new ids with `next-id <runDir> [--count n]`.

**This step patches:** status discarded + discard {reason, duplicateOf?, justification}. `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/story.mjs patch <runDir> <ST-id> --step S6.2.4 <<'JSON'` {"story": {<only the fields you change>}} `JSON` — top-level fields replace, `connextra`/`size`/`scope` merge one level, the id is fixed. Never edit the story Markdown.

## Artifact contract (Gedächtnis §11.2)

Every output is two files: `<file>.md` (the body you write; its frontmatter is rendered read-only from the sidecar) and `<file>.meta.json` (the sidecar, written only by `commit-artifact.mjs`). Read upstream metadata from sidecars, never from rendered frontmatter.

**You supply** the authored block on stdin (`node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/commit-artifact.mjs schema` prints its JSON Schema):

```json
{
  "itemIndex": [],
  "sources": [
    "SRC-0001"
  ],
  "riskFlags": [],
  "openQuestions": [],
  "notesForNext": "<one or two sentences for the next step>"
}
```

- `authored.itemIndex` (required) — Per item: {id, derivedFrom[], evidence, refs[], title?, status?} — read by the traceability scripts (6.2.1/6.2.2/6.2.5)
- `authored.sources` — SRC-/T-/P- ids used in the body; every SRC must exist in research/sources/
- `authored.riskFlags` — e.g. missing-input, assumption-heavy
- `authored.attributes` — Type-specific structured fields (e.g. epic {title, actv, tasks, goal, slice})
- `authored.openQuestions` — Questions the step could not resolve
- `authored.notesForNext` — Short handoff note for the consuming step(s)

**Computed by the script** — never write these yourself: `schema`, `id`, `type`, `bpmnElement`, `runId`, `version`, `status`, `producedBy`, `derivedFrom`, `body`, `derived`, `gate`, `riskFlags`, `history`.

## Self-check (rubric `backlog-hygiene` — judged by `product-kritiker-pruefung`)

- [ ] No orphans remain in the cleaned backlog; every orphan from trace-findings is discarded or has a re-attach change request (backlog-hygiene).
- [ ] No fake stories remain: every remaining story has a user/customer role and a user or business outcome.
- [ ] No duplicates remain; each duplicate names its duplicateOf story.
- [ ] Orphan status comes only from trace-findings; no orphan was added or removed by LLM judgment.
- [ ] Discarded items keep their ids with status discarded and reason; their ACs leave the export with them.
- [ ] Each fake/duplicate verdict has a one-line justification citing the story text.

## Pitfalls

- Recomputing or overriding the deterministic orphan result from 6.2.1/6.2.2 by LLM judgment.
- Discarding legitimate enabler stories that do have a user outcome just because they sound technical.
- Deleting story files instead of marking them discarded, breaking stable ids and history.

## Return

Reply with JSON only: `{"status": "done|blocked|partial", "artifacts": ["<committed .md paths>"], "items": ["<item ids created or changed>"], "riskFlags": [], "summary": "<one sentence>"}`.

## Domain knowledge

See `references/domain-knowledge.md` (cited from notebook "The Product - Business Design"; phase brief `knowledge/phase-5-6-stories-akzeptanz.md`).
