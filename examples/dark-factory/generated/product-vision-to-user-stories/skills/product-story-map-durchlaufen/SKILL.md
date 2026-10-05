---
name: product-story-map-durchlaufen
description: >-
  Walks the detailed story map end to end to find missing steps, admin tasks and system/ordering dependencies, producing a gap-dependency-list. Use when the dark-factory workflow reaches step 4.1.5
  "Map durchlaufen: Luecken & Abhaengigkeiten finden".
bpmn:
  file: product-vision-to-user-stories.bpmn
  elements: [S4.1.5]
---

# Map durchlaufen: Luecken & Abhaengigkeiten finden (step 4.1.5)

Generated from `product-vision-to-user-stories.bpmn`'s "Map durchlaufen: Luecken & Abhaengigkeiten finden" (serviceTask, lane "Architekt") by `flowforge-generate`. Gives the SP4.1 critic and the release-slicing steps (S4.2.2/S4.2.3) an explicit list of gaps and dependencies so slices are buildable in order. It is its own skill because it produces an independently versioned artifact with its own contract (body + sidecar), template and rubric (mapping-rubric.md's serviceTask rule; one skill per business step, docs/dark-factory/implementation.md §2).

Executed by the `product-architekt` agent. Binding rules: `${CLAUDE_PLUGIN_ROOT}/knowledge/process-rules.md` — evidence §6, item IDs §10, artifact contract §11.2, iterations §15.

## Run context

The Workflow passes `runDir`, `runId`, `iteration` and `changeRequests` (from the last gate record of this phase).

| Input | Required | Path pattern |
|---|---|---|
| `story-map-details` | yes | `runs/{runId}/artifacts/p4-story-map/4.1.4_story-map-details.md` |

| Output | Item prefix | Cardinality | Path pattern |
|---|---|---|---|
| `gap-dependency-list` | — | one | `runs/{runId}/artifacts/p4-story-map/4.1.5_gap-dependency-list.md` |


## Procedure

0. **Resume / iterate.** Read the output's sidecar (`<file>.meta.json`) if it exists. If it has `status: passed`/`passed-with-risk`, or `iteration > 1` and no change request concerns this artifact or an upstream artifact it consumes, return it unchanged (idempotent resume). Otherwise work every change request into the body and keep item IDs stable when the item is materially the same. Do not copy files to `history/` or touch `version` — `commit-artifact.mjs` does both (Gedächtnis §15).
1. Walk story-map-details left to right as the primary persona and again as an admin/operator: at each UT ask what must have happened before and what happens after.
2. Record gaps: missing user steps, admin/back-office tasks (setup, moderation, support, data correction), onboarding/offboarding, notifications; each gap names where it belongs (after which UT/ACTV) and proposes a card or task title — do not mint ACTV/UT ids here.
3. Record dependencies between cards/UTs: type (data, technical, ordering, external system, regulatory), from → to, blocking yes/no, with the reason.
4. Cross-check external systems and shared components against the service-blueprint support lane where visible in the details; mark unknowns as spike candidates.
5. Draw the dependency graph as Mermaid (flowchart LR) and check it for cycles; list any cycle as a must-resolve finding.
6. Summarise which gaps the backlog author must add (change request for S4.1.3/S4.1.4 on the next iteration) and which are deliberately out of scope.
7. Write the output **body** from `assets/template.md`: Markdown only, no frontmatter (the product-artifact-contract-guard hook rejects a Write that starts with `---`).
8. Run the self-check below and fix what fails. Never set `passed` yourself — only the critic gate does (Gedächtnis §2.2).
9. **Commit** every output file with its authored block (see "Artifact contract" below): `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/commit-artifact.mjs commit <runDir> <file.md> --step S4.1.5 <<'JSON'` … `JSON`. The script computes id, version, status, derivedFrom, evidence mix and history; fix every rejection it prints and commit again. Re-committing an unchanged file is a no-op.
10. Log: `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/run-state.mjs event <runDir> '{"event":"step-done","element":"S4.1.5"}'`.

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

- [ ] Rubric `story-map`: the map has no hidden gaps between consecutive tasks; each gap is located in the grid.
- [ ] Every dependency has type, direction, blocking flag and reason.
- [ ] Dependency graph is acyclic or cycles are listed as findings.
- [ ] Admin/operator tasks were explicitly considered (section present even if empty with reason).
- [ ] No new item ids created; proposals reference existing UT/card refs.

## Pitfalls

- Walking only the happy path and missing admin/support tasks.
- Recording dependencies without direction, making sequencing impossible.

## Return

Reply with JSON only: `{"status": "done|blocked|partial", "artifacts": ["<committed .md paths>"], "items": ["<item ids created or changed>"], "riskFlags": [], "summary": "<one sentence>"}`.

## Domain knowledge

See `references/domain-knowledge.md` (cited from notebook "The Product - Business Design"; phase brief `knowledge/phase-3-4-journey-story-map.md`).
