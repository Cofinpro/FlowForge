---
name: product-walking-skeleton-schneiden
description: >-
  Cuts the walking skeleton (walking-skeleton): the thinnest end-to-end slice across every backbone activity and every service-blueprint layer, crutches allowed. Use when the dark-factory workflow
  reaches step 4.2.2 "Walking Skeleton schneiden".
bpmn:
  file: product-vision-to-user-stories.bpmn
  elements: [S4.2.2]
---

# Walking Skeleton schneiden (step 4.2.2)

Generated from `product-vision-to-user-stories.bpmn`'s "Walking Skeleton schneiden" (serviceTask, lane "Architekt") by `flowforge-generate`. Defines the steel thread that S4.2.3 places in the opening game and that anchors the MVP scope in S4.2.5. It is its own skill because it produces an independently versioned artifact with its own contract (body + sidecar), template and rubric (mapping-rubric.md's serviceTask rule; one skill per business step, docs/dark-factory/implementation.md §2).

Executed by the `product-architekt` agent. Binding rules: `${CLAUDE_PLUGIN_ROOT}/knowledge/process-rules.md` — evidence §6, item IDs §10, artifact contract §11.2, iterations §15.

## Run context

The Workflow passes `runDir`, `runId`, `iteration` and `changeRequests` (from the last gate record of this phase).

| Input | Required | Path pattern |
|---|---|---|
| `release-goals` | yes | `runs/{runId}/artifacts/p4-story-map/4.2.1_release-goals.md` |
| `service-blueprint` | yes | `runs/{runId}/artifacts/p3-journey/3.1.4_service-blueprint.md` |

| Output | Item prefix | Cardinality | Path pattern |
|---|---|---|---|
| `walking-skeleton` | — | one | `runs/{runId}/artifacts/p4-story-map/4.2.2_walking-skeleton.md` |


## Procedure

0. **Resume / iterate.** Read the output's sidecar (`<file>.meta.json`) if it exists. If it has `status: passed`/`passed-with-risk`, or `iteration > 1` and no change request concerns this artifact or an upstream artifact it consumes, return it unchanged (idempotent resume). Otherwise work every change request into the body and keep item IDs stable when the item is materially the same. Do not copy files to `history/` or touch `version` — `commit-artifact.mjs` does both (Gedächtnis §15).
1. For each ACTV-… in backbone order, pick the single minimal card (or UT happy path) the persona needs to get from trigger to outcome under release goal 1.
2. For each pick, trace it through the service-blueprint layers (frontstage → backstage → support system) and name the minimal implementation per layer.
3. Where a layer is expensive or unproven, allow a "crutch" (manual backstage, stub, concierge step) — mark it explicitly with what it replaces and when it must be removed.
4. Check blocking dependencies from the gap-dependency-list via story-map-details: include every card the skeleton cannot run without.
5. Describe the resulting end-to-end run in 5–10 lines as the persona experiences it; any screen sketch is text/Mermaid only.
6. Produce a coverage matrix ACTV × layer showing the skeleton touches every activity and every layer.
7. Write the output **body** from `assets/template.md`: Markdown only, no frontmatter (the product-artifact-contract-guard hook rejects a Write that starts with `---`).
8. Run the self-check below and fix what fails. Never set `passed` yourself — only the critic gate does (Gedächtnis §2.2).
9. **Commit** every output file with its authored block (see "Artifact contract" below): `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/commit-artifact.mjs commit <runDir> <file.md> --step S4.2.2 <<'JSON'` … `JSON`. The script computes id, version, status, derivedFrom, evidence mix and history; fix every rejection it prints and commit again. Re-committing an unchanged file is a no-op.
10. Log: `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/run-state.mjs event <runDir> '{"event":"step-done","element":"S4.2.2"}'`.

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

## Self-check (rubric `walking-skeleton` — judged by `product-kritiker-pruefung`)

- [ ] Rubric `walking-skeleton`: steel thread through all layers; minimal; end-to-end usable.
- [ ] Every ACTV in the backbone is touched by exactly the minimum needed (no activity skipped).
- [ ] Every chosen card traces to a blueprint column and all its layers.
- [ ] Every crutch is labelled with what it fakes and a removal release.
- [ ] Serves release goal 1 (named).

## Pitfalls

- Horizontal slicing: building one layer (e.g. backend only) instead of a thin vertical thread.
- Gold-plating the skeleton with nice-to-have variants.
- Skipping an activity because it looks trivial, breaking end-to-end usability.

## Return

Reply with JSON only: `{"status": "done|blocked|partial", "artifacts": ["<committed .md paths>"], "items": ["<item ids created or changed>"], "riskFlags": [], "summary": "<one sentence>"}`.

## Domain knowledge

See `references/domain-knowledge.md` (cited from notebook "The Product - Business Design"; phase brief `knowledge/phase-3-4-journey-story-map.md`).
