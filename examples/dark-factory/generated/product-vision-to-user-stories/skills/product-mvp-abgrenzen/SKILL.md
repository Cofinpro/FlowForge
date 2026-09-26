---
name: product-mvp-abgrenzen
description: >-
  Fixes the final sliced story map with release roadmap and MVP-candidate section, sets `slice` on every epic file, and proves the MVP fits the budget and timebox from the idea brief. Use when the
  dark-factory workflow reaches step 4.2.5 "MVP & Release-Roadmap abgrenzen".
bpmn:
  file: product-vision-to-user-stories.bpmn
  elements: [S4.2.5]
---

# MVP & Release-Roadmap abgrenzen (step 4.2.5)

Generated from `product-vision-to-user-stories.bpmn`'s "MVP & Release-Roadmap abgrenzen" (serviceTask, lane "Stratege") by `bpmn2agent-generate`. The story map is the input S5.1.1 turns into stories; the Workflow iterates `EP[slice=1]` in SP5.1, and the MVP-candidate section is what G-P3 (rubric `gate-mvp`) and the panel vote on. It is its own skill because it produces an independently versioned artifact with its own contract (body + sidecar), template and rubric (mapping-rubric.md's serviceTask rule; one skill per business step, docs/dark-factory/implementation.md §2).

Executed by the `product-stratege` agent. Binding rules: `${CLAUDE_PLUGIN_ROOT}/knowledge/process-rules.md` — evidence §6, item IDs §10, artifact contract §11.2, iterations §15.

## Run context

The Workflow passes `runDir`, `runId`, `iteration` and `changeRequests` (from the last gate record of this phase).

| Input | Required | Path pattern |
|---|---|---|
| `slice-scoring` | yes | `runs/{runId}/artifacts/p4-story-map/4.2.4_slice-scoring.md` |
| `idea-brief` | yes | `runs/{runId}/00_idea-brief.md` |

| Output | Item prefix | Cardinality | Path pattern |
|---|---|---|---|
| `story-map` | — | one | `runs/{runId}/artifacts/p4-story-map/4.2.5_story-map.md` |


## Procedure

0. **Resume / iterate.** Read the output's sidecar (`<file>.meta.json`) if it exists. If it has `status: passed`/`passed-with-risk`, or `iteration > 1` and no change request concerns this artifact or an upstream artifact it consumes, return it unchanged (idempotent resume). Otherwise work every change request into the body and keep item IDs stable when the item is materially the same. Do not copy files to `history/` or touch `version` — `commit-artifact.mjs` does both (Gedächtnis §15).
1. Take the ranking and proposed moves from slice-scoring; accept or reject each move with a reason and fix the final release lines.
2. Define slice 1 (MVP) as a balanced vertical slice: walking skeleton + highest-priority/risky cards, feasible, valuable, usable and delightful; it must reach release goal 1's learning hypothesis.
3. Prove fit against `budget`/`timebox` from idea-brief: effort sum of slice 1 (size-class points) converted with a disclosed rate (e.g. points per week for the assumed team) versus the timebox; if it does not fit, cut cards and repeat; flag 🧠 if budget/timebox were derived in step 0.
4. Write the final story map: Markdown grid, columns = ACTV/EP in narrative order, rows = cards, horizontal release lines labelled slice 1 / 2 / 3 with their release goals.
5. Write the `## MVP candidate` section (anchor `#mvp-candidate`): value proposition for the primary persona, included EP ids and cards, learning goal + success/kill signal, GOAL/OMTM link, crutches, known risks and unvalidated ASM.
6. Update every epic file `runs/<runId>/backlog/epics/EP-<nnn>_<slug>.md`: set `slice` (1 for every epic with at least one card in the MVP, else the earliest slice it appears in) and `releaseGoal`; do not create or rename EP ids.
7. Write the roadmap for slices 2+ as outcomes (goal, metric, learning hypothesis), and set `slice` on every epic with `commit-artifact.mjs attrs <runDir> <epic.md> '{"slice":1}'` (2+ for later slices) so the Workflow collection `EP[slice=1]` (commit-artifact.mjs query --type epic --attr slice=1) is non-empty and matches the files.
8. Write the output **body** from `assets/template.md`: Markdown only, no frontmatter (the product-artifact-contract-guard hook rejects a Write that starts with `---`).
9. Run the self-check below and fix what fails. Never set `passed` yourself — only the critic gate does (Gedächtnis §2.2).
10. **Commit** every output file with its authored block (see "Artifact contract" below): `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/commit-artifact.mjs commit <runDir> <file.md> --step S4.2.5 <<'JSON'` … `JSON`. The script computes id, version, status, derivedFrom, evidence mix and history; fix every rejection it prints and commit again. Re-committing an unchanged file is a no-op.
11. Log: `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/run-state.mjs event <runDir> '{"event":"step-done","element":"S4.2.5"}'`.

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

Set each epic's release slice without re-committing its body: `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/commit-artifact.mjs attrs <runDir> backlog/epics/EP-<nnn>_<slug>.md '{"slice": 1}'`.

## Self-check (rubric `story-map`, `mvp` — judged by `product-kritiker-pruefung`)

- [ ] Rubric `mvp`: slice 1 fits budget/timebox from idea-brief with the calculation shown; every slice has a learning goal; each slice references a GOAL.
- [ ] Rubric `story-map`: 2D structure (narrative horizontal, priority vertical); no orphaned cards; release line explicit.
- [ ] Rubric `roadmap`: later slices phrased as outcomes with GOAL/IMP references.
- [ ] Every EP file has a non-null `slice`; the set with `slice: 1` equals the epics listed in the MVP-candidate section and is non-empty.
- [ ] MVP is a vertical slice across all backbone activities, not one layer.
- [ ] Accepted/rejected moves from slice-scoring are all accounted for.

## Pitfalls

- An MVP that silently exceeds the timebox because the effort-to-time conversion is not shown.
- Epic files left at `slice: null`, so the SP5.1 iteration over EP[slice=1] runs empty.
- An MVP that is a technical layer or a feature bundle without a learning goal.

## Return

Reply with JSON only: `{"status": "done|blocked|partial", "artifacts": ["<committed .md paths>"], "items": ["<item ids created or changed>"], "riskFlags": [], "summary": "<one sentence>"}`.

## Domain knowledge

See `references/domain-knowledge.md` (cited from notebook "The Product - Business Design"; phase brief `knowledge/phase-3-4-journey-story-map.md`).
