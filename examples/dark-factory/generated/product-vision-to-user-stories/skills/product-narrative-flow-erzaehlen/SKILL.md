---
name: product-narrative-flow-erzaehlen
description: >-
  Tells the big picture as a left-to-right narrative flow of the primary persona through the future-state journey (narrative-flow). Use when the dark-factory workflow reaches step 4.1.2 "Big Picture &
  Narrative Flow erzaehlen".
bpmn:
  file: product-vision-to-user-stories.bpmn
  elements: [S4.1.2]
---

# Big Picture & Narrative Flow erzaehlen (step 4.1.2)

Generated from `product-vision-to-user-stories.bpmn`'s "Big Picture & Narrative Flow erzaehlen" (serviceTask, lane "UX-/Journey-Designer") by `flowforge-generate`. Provides the ordered, user-voiced story from which S4.1.3 distils backbone activities and tasks. It is its own skill because it produces an independently versioned artifact with its own contract (body + sidecar), template and rubric (mapping-rubric.md's serviceTask rule; one skill per business step, docs/dark-factory/implementation.md §2).

Executed by the `product-ux` agent. Binding rules: `${CLAUDE_PLUGIN_ROOT}/knowledge/process-rules.md` — evidence §6, item IDs §10, artifact contract §11.2, iterations §15.

## Run context

The Workflow passes `runDir`, `runId`, `iteration` and `changeRequests` (from the last gate record of this phase).

| Input | Required | Path pattern |
|---|---|---|
| `journey-future` | yes | `runs/{runId}/artifacts/p3-journey/3.1.3_journey-future.md` |
| `story-map-framing` | yes | `runs/{runId}/artifacts/p4-story-map/4.1.1_story-map-framing.md` |

| Output | Item prefix | Cardinality | Path pattern |
|---|---|---|---|
| `narrative-flow` | — | one | `runs/{runId}/artifacts/p4-story-map/4.1.2_narrative-flow.md` |


## Procedure

0. **Resume / iterate.** Read the output's sidecar (`<file>.meta.json`) if it exists. If it has `status: passed`/`passed-with-risk`, or `iteration > 1` and no change request concerns this artifact or an upstream artifact it consumes, return it unchanged (idempotent resume). Otherwise work every change request into the body and keep item IDs stable when the item is materially the same. Do not copy files to `history/` or touch `version` — `commit-artifact.mjs` does both (Gedächtnis §15).
1. Read story-map-framing (primary persona, problem, goals) and journey-future (anchors, touchpoints).
2. Retell the journey as a sequence of short beats in the persona's voice ("First I …, then I …"), left to right, from trigger to job outcome, including before/after beats outside the product.
3. Tag every beat with its journey-future anchor and the HS/OPP it serves; beats without an anchor are allowed only as marked gaps.
4. Keep beats solution-independent: user intent and outcome, not screens or buttons.
5. Note branches (alternative paths, secondary persona variants) as side notes; do not expand details — that is S4.1.4.
6. End with a Mermaid flowchart (LR) of the beats as a one-glance big picture.
7. Write the output **body** from `assets/template.md`: Markdown only, no frontmatter (the product-artifact-contract-guard hook rejects a Write that starts with `---`).
8. Run the self-check below and fix what fails. Never set `passed` yourself — only the critic gate does (Gedächtnis §2.2).
9. **Commit** every output file with its authored block (see "Artifact contract" below): `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/commit-artifact.mjs commit <runDir> <file.md> --step S4.1.2 <<'JSON'` … `JSON`. The script computes id, version, status, derivedFrom, evidence mix and history; fix every rejection it prints and commit again. Re-committing an unchanged file is a no-op.
10. Log: `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/run-state.mjs event <runDir> '{"event":"step-done","element":"S4.1.2"}'`.

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

- [ ] Narrative runs strictly left to right from trigger to outcome and is end to end.
- [ ] Every beat references a journey-future anchor or is marked as a gap.
- [ ] Beats are solution-independent (no UI or technology terms).
- [ ] The primary persona from story-map-framing is the narrator throughout.

## Pitfalls

- Listing features instead of telling what the user does.
- Diving into edge cases and alternatives too early, losing the big picture.

## Return

Reply with JSON only: `{"status": "done|blocked|partial", "artifacts": ["<committed .md paths>"], "items": ["<item ids created or changed>"], "riskFlags": [], "summary": "<one sentence>"}`.

## Domain knowledge

See `references/domain-knowledge.md` (cited from notebook "The Product - Business Design"; phase brief `knowledge/phase-3-4-journey-story-map.md`).
