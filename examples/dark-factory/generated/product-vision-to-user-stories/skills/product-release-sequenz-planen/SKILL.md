---
name: product-release-sequenz-planen
description: >-
  Plans opening game, midgame and endgame (release-sequencing) by assigning every story-map card to a release with the walking skeleton and risky items first. Use when the dark-factory workflow
  reaches step 4.2.3 "Opening / Mid / Endgame planen".
bpmn:
  file: product-vision-to-user-stories.bpmn
  elements: [S4.2.3]
---

# Opening / Mid / Endgame planen (step 4.2.3)

Generated from `product-vision-to-user-stories.bpmn`'s "Opening / Mid / Endgame planen" (serviceTask, lane "Architekt") by `flowforge-generate`. Produces the release lines on the map that S4.2.4 scores and S4.2.5 fixes as MVP and roadmap. It is its own skill because it produces an independently versioned artifact with its own contract (body + sidecar), template and rubric (mapping-rubric.md's serviceTask rule; one skill per business step, docs/dark-factory/implementation.md §2).

Executed by the `product-architekt` agent. Binding rules: `${CLAUDE_PLUGIN_ROOT}/knowledge/process-rules.md` — evidence §6, item IDs §10, artifact contract §11.2, iterations §15.

## Run context

The Workflow passes `runDir`, `runId`, `iteration` and `changeRequests` (from the last gate record of this phase).

| Input | Required | Path pattern |
|---|---|---|
| `walking-skeleton` | yes | `runs/{runId}/artifacts/p4-story-map/4.2.2_walking-skeleton.md` |

| Output | Item prefix | Cardinality | Path pattern |
|---|---|---|---|
| `release-sequencing` | — | one | `runs/{runId}/artifacts/p4-story-map/4.2.3_release-sequencing.md` |


## Procedure

0. **Resume / iterate.** Read the output's sidecar (`<file>.meta.json`) if it exists. If it has `status: passed`/`passed-with-risk`, or `iteration > 1` and no change request concerns this artifact or an upstream artifact it consumes, return it unchanged (idempotent resume). Otherwise work every change request into the body and keep item IDs stable when the item is materially the same. Do not copy files to `history/` or touch `version` — `commit-artifact.mjs` does both (Gedächtnis §15).
1. Put the walking-skeleton cards into the opening game, then add risky items: cards whose path relies on a high-importance/low-evidence ASM, high backstage complexity, or an unverified external dependency.
2. Assign optional steps, alternatives and business rules to the midgame; refinement, efficiency, polish and crutch removal to the endgame (or name the release that removes each crutch).
3. Respect blocking dependencies: no card precedes a card it depends on; list any violation you had to accept and why.
4. Map each game/release to a release goal from S4.2.1 and show which ACTV columns each release thickens.
5. Render the map with explicit release lines: Markdown grid, columns = ACTV, row bands = opening / mid / end, cards in cells.
6. List cards deliberately left unassigned (parked) with reason.
7. Write the output **body** from `assets/template.md`: Markdown only, no frontmatter (the product-artifact-contract-guard hook rejects a Write that starts with `---`).
8. Run the self-check below and fix what fails. Never set `passed` yourself — only the critic gate does (Gedächtnis §2.2).
9. **Commit** every output file with its authored block (see "Artifact contract" below): `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/commit-artifact.mjs commit <runDir> <file.md> --step S4.2.3 <<'JSON'` … `JSON`. The script computes id, version, status, derivedFrom, evidence mix and history; fix every rejection it prints and commit again. Re-committing an unchanged file is a no-op.
10. Log: `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/run-state.mjs event <runDir> '{"event":"step-done","element":"S4.2.3"}'`.

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

- [ ] Rubric `story-map`: 2D structure with narrative horizontal and priority vertical; release lines explicit; no orphaned cards.
- [ ] Opening game contains the full walking skeleton plus identified risky items, each with its risk reason.
- [ ] Every card is in exactly one release or listed as parked.
- [ ] No dependency order violation, or each is justified.
- [ ] Every release references a release goal.

## Pitfalls

- Front-loading all "must-haves" into the opening game so it stops being thin.
- Deferring risky items to the endgame, postponing the learning.

## Return

Reply with JSON only: `{"status": "done|blocked|partial", "artifacts": ["<committed .md paths>"], "items": ["<item ids created or changed>"], "riskFlags": [], "summary": "<one sentence>"}`.

## Domain knowledge

See `references/domain-knowledge.md` (cited from notebook "The Product - Business Design"; phase brief `knowledge/phase-3-4-journey-story-map.md`).
