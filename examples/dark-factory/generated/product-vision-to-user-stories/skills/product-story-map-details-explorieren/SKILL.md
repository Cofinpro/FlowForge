---
name: product-story-map-details-explorieren
description: >-
  Explores details, alternatives, edge cases and error paths below each user task (story-map-details), including a "What-About" pass and hot-spot coverage, from the QA perspective. Use when the
  dark-factory workflow reaches step 4.1.4 "Details, Alternativen & Randfaelle explorieren".
bpmn:
  file: product-vision-to-user-stories.bpmn
  elements: [S4.1.4]
---

# Details, Alternativen & Randfaelle explorieren (step 4.1.4)

Generated from `product-vision-to-user-stories.bpmn`'s "Details, Alternativen & Randfaelle explorieren" (serviceTask, lane "QA-Perspektive") by `bpmn2agent-generate`. Fills the vertical axis of the map with detail cards that S4.1.5 walks for gaps and dependencies and that S4.2.1–4.2.5 slice into releases; later S5.1.1 turns cards into stories. It is its own skill because it produces an independently versioned artifact with its own contract (body + sidecar), template and rubric (mapping-rubric.md's serviceTask rule; one skill per business step, docs/dark-factory/implementation.md §2).

Executed by the `product-qa` agent. Binding rules: `${CLAUDE_PLUGIN_ROOT}/knowledge/process-rules.md` — evidence §6, item IDs §10, artifact contract §11.2, iterations §15.

## Run context

The Workflow passes `runDir`, `runId`, `iteration` and `changeRequests` (from the last gate record of this phase).

| Input | Required | Path pattern |
|---|---|---|
| `backbone` | yes | `runs/{runId}/artifacts/p4-story-map/4.1.3_backbone.md` |
| `hot-spots` | yes | `runs/{runId}/artifacts/p3-journey/3.1.2_hot-spots.md` |

| Output | Item prefix | Cardinality | Path pattern |
|---|---|---|---|
| `story-map-details` | — | one | `runs/{runId}/artifacts/p4-story-map/4.1.4_story-map-details.md` |


## Procedure

0. **Resume / iterate.** Read the output's sidecar (`<file>.meta.json`) if it exists. If it has `status: passed`/`passed-with-risk`, or `iteration > 1` and no change request concerns this artifact or an upstream artifact it consumes, return it unchanged (idempotent resume). Otherwise work every change request into the body and keep item IDs stable when the item is materially the same. Do not copy files to `history/` or touch `version` — `commit-artifact.mjs` does both (Gedächtnis §15).
1. For every UT-… in backbone, add detail cards below it: happy-path variant, alternatives, edge cases, error/exception paths, business rules; give each a local card ref `<UT-id>.c<n>` (cards are not items; stories get ST ids in 5.1.1).
2. Play "What-About" per task: what about no data, wrong input, interruption, offline, second device, permission denied, regulated data, the Contrarian's objection, the Verweigerer's workaround?
3. Map every HS-… from hot-spots to at least one card (card cites the HS) or list it as "not covered here" with reason (e.g. resolved in journey design only).
4. Mark each card type (variant, alternative, edge, error, rule) and a testability note (observable outcome) — the QA view that 6.1.x will build on.
5. Keep cards user-facing and solution-neutral; flag cards that are purely technical as candidates for S4.1.5 dependencies instead.
6. Render the map as a Markdown grid: columns = ACTV → UT, rows = cards; add a per-UT count of cards.
7. Write the output **body** from `assets/template.md`: Markdown only, no frontmatter (the product-artifact-contract-guard hook rejects a Write that starts with `---`).
8. Run the self-check below and fix what fails. Never set `passed` yourself — only the critic gate does (Gedächtnis §2.2).
9. **Commit** every output file with its authored block (see "Artifact contract" below): `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/commit-artifact.mjs commit <runDir> <file.md> --step S4.1.4 <<'JSON'` … `JSON`. The script computes id, version, status, derivedFrom, evidence mix and history; fix every rejection it prints and commit again. Re-committing an unchanged file is a no-op.
10. Log: `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/run-state.mjs event <runDir> '{"event":"step-done","element":"S4.1.4"}'`.

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

- [ ] Rubric `story-map`: no orphaned cards — every card hangs under exactly one UT.
- [ ] Every UT has ≥ 1 detail card beyond the happy path, or a stated reason why not.
- [ ] Every HS is covered by a card or explicitly marked not covered with reason.
- [ ] Each card has a type and an observable outcome (testable).
- [ ] No new ACTV/UT/EP ids are invented; missing tasks are noted for S4.1.5.

## Pitfalls

- Only listing happy paths; edge and error cards are the point of this step.
- Writing implementation tasks ("add DB index") as cards.
- Silently adding new tasks instead of noting them as gaps.

## Return

Reply with JSON only: `{"status": "done|blocked|partial", "artifacts": ["<committed .md paths>"], "items": ["<item ids created or changed>"], "riskFlags": [], "summary": "<one sentence>"}`.

## Domain knowledge

See `references/domain-knowledge.md` (cited from notebook "The Product - Business Design"; phase brief `knowledge/phase-3-4-journey-story-map.md`).
