---
name: product-story-map-rahmen-setzen
description: >-
  Sets the story-map frame (story-map-framing): focal personas, problem statement and business goals written above the map. Use when the dark-factory workflow reaches step 4.1.1 "Rahmen setzen
  (Personas, Ziele, Problem)".
bpmn:
  file: product-vision-to-user-stories.bpmn
  elements: [S4.1.1]
---

# Rahmen setzen (Personas, Ziele, Problem) (step 4.1.1)

Generated from `product-vision-to-user-stories.bpmn`'s "Rahmen setzen (Personas, Ziele, Problem)" (serviceTask, lane "Backlog-Autor") by `flowforge-generate`. Fixes for whom, for which problem and toward which goals the map is built, so S4.1.2 tells one coherent narrative and S4.2.1 can set outcome-based release goals. It is its own skill because it produces an independently versioned artifact with its own contract (body + sidecar), template and rubric (mapping-rubric.md's serviceTask rule; one skill per business step, docs/dark-factory/implementation.md §2).

Executed by the `product-backlog-autor` agent. Binding rules: `${CLAUDE_PLUGIN_ROOT}/knowledge/process-rules.md` — evidence §6, item IDs §10, artifact contract §11.2, iterations §15.

## Run context

The Workflow passes `runDir`, `runId`, `iteration` and `changeRequests` (from the last gate record of this phase).

| Input | Required | Path pattern |
|---|---|---|
| `personas` | yes | `runs/{runId}/artifacts/p2-research/2.1.5_personas.md` |
| `business-goals` | yes | `runs/{runId}/artifacts/p1-strategie/1.2.1_business-goals.md` |
| `pov-hmw` | yes | `runs/{runId}/artifacts/p2-research/2.2.3_pov-hmw.md` |

| Output | Item prefix | Cardinality | Path pattern |
|---|---|---|---|
| `story-map-framing` | — | one | `runs/{runId}/artifacts/p4-story-map/4.1.1_story-map-framing.md` |


## Procedure

0. **Resume / iterate.** Read the output's sidecar (`<file>.meta.json`) if it exists. If it has `status: passed`/`passed-with-risk`, or `iteration > 1` and no change request concerns this artifact or an upstream artifact it consumes, return it unchanged (idempotent resume). Otherwise work every change request into the body and keep item IDs stable when the item is materially the same. Do not copy files to `history/` or touch `version` — `commit-artifact.mjs` does both (Gedächtnis §15).
1. Select the primary persona (PER-…) and at most two secondary personas from personas; state why the primary one leads the map.
2. State the problem as one POV sentence taken from pov-hmw, citing the POV/HMW-… ids it builds on; keep it solution-neutral.
3. Copy the goals from business-goals: the One Metric That Matters (with its AARRR stage) and the supporting GOAL-… items, each with its target value.
4. Write scope boundaries: in-scope jobs (JOB-…), explicitly out-of-scope personas/jobs, known constraints from the brief.
5. List the open questions and riskiest ASM-… items the map must help answer.
6. Keep it one page; everything here is the "top of the map" header the later steps repeat.
7. Write the output **body** from `assets/template.md`: Markdown only, no frontmatter (the product-artifact-contract-guard hook rejects a Write that starts with `---`).
8. Run the self-check below and fix what fails. Never set `passed` yourself — only the critic gate does (Gedächtnis §2.2).
9. **Commit** every output file with its authored block (see "Artifact contract" below): `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/commit-artifact.mjs commit <runDir> <file.md> --step S4.1.1 <<'JSON'` … `JSON`. The script computes id, version, status, derivedFrom, evidence mix and history; fix every rejection it prints and commit again. Re-committing an unchanged file is a no-op.
10. Log: `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/run-state.mjs event <runDir> '{"event":"step-done","element":"S4.1.1"}'`.

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

## Self-check (rubric `story-map` — judged by `product-kritiker-pruefung`)

- [ ] Exactly one primary persona, referenced by PER id.
- [ ] Problem statement is solution-neutral and traceable to a POV/HMW id (rubric `pov-hmw`).
- [ ] OMTM and GOAL ids are present with target values and AARRR stage.
- [ ] Out-of-scope section is non-empty.
- [ ] Every reference is an existing item id; no new items are created.

## Pitfalls

- Framing the map for "all users", which makes the narrative incoherent.
- Restating a feature idea as the problem.

## Return

Reply with JSON only: `{"status": "done|blocked|partial", "artifacts": ["<committed .md paths>"], "items": ["<item ids created or changed>"], "riskFlags": [], "summary": "<one sentence>"}`.

## Domain knowledge

See `references/domain-knowledge.md` (cited from notebook "The Product - Business Design"; phase brief `knowledge/phase-3-4-journey-story-map.md`).
