---
name: product-value-effort-priorisieren
description: >-
  Scores the release slices and their epics by value vs. effort (slice-scoring) with disclosed inputs and formula, using opportunity scores and blueprint complexity. Use when the dark-factory workflow
  reaches step 4.2.4 "Nach Value vs. Effort priorisieren".
bpmn:
  file: product-vision-to-user-stories.bpmn
  elements: [S4.2.4]
---

# Nach Value vs. Effort priorisieren (step 4.2.4)

Generated from `product-vision-to-user-stories.bpmn`'s "Nach Value vs. Effort priorisieren" (serviceTask, lane "Stratege") by `flowforge-generate`. Gives S4.2.5 a recomputable ranking to fix the MVP cut and roadmap order, and lets the critic verify the prioritisation. It is its own skill because it produces an independently versioned artifact with its own contract (body + sidecar), template and rubric (mapping-rubric.md's serviceTask rule; one skill per business step, docs/dark-factory/implementation.md §2).

Executed by the `product-stratege` agent. Binding rules: `${CLAUDE_PLUGIN_ROOT}/knowledge/process-rules.md` — evidence §6, item IDs §10, artifact contract §11.2, iterations §15.

## Run context

The Workflow passes `runDir`, `runId`, `iteration` and `changeRequests` (from the last gate record of this phase).

| Input | Required | Path pattern |
|---|---|---|
| `release-sequencing` | yes | `runs/{runId}/artifacts/p4-story-map/4.2.3_release-sequencing.md` |
| `opportunity-backlog` | yes | `runs/{runId}/artifacts/p2-research/2.2.5_opportunity-backlog.md` |

| Output | Item prefix | Cardinality | Path pattern |
|---|---|---|---|
| `slice-scoring` | — | one | `runs/{runId}/artifacts/p4-story-map/4.2.4_slice-scoring.md` |


## Procedure

0. **Resume / iterate.** Read the output's sidecar (`<file>.meta.json`) if it exists. If it has `status: passed`/`passed-with-risk`, or `iteration > 1` and no change request concerns this artifact or an upstream artifact it consumes, return it unchanged (idempotent resume). Otherwise work every change request into the body and keep item IDs stable when the item is materially the same. Do not copy files to `history/` or touch `version` — `commit-artifact.mjs` does both (Gedächtnis §15).
1. For each release and for each EP-… with cards in that release, collect value inputs: opportunity score of the linked OPP-… from opportunity-backlog (Importance + max(Importance − Satisfaction, 0)), contribution to the OMTM/GOAL (0–2), and HS severity resolved.
2. Collect effort inputs: size class S/M/L per card (S=1, M=2, L=3) justified from backstage complexity and dependencies in release-sequencing; effort = sum over the epic's cards in that release.
3. Compute value = opportunity score + 2 × goal contribution (state any other weight explicitly) and priority = value / effort; show every input in a table so it can be recomputed.
4. Place epics/slices in a value-vs-effort quadrant (quick win, big bet, fill-in, money pit) as a text table or Mermaid quadrantChart.
5. Check consistency: does the opening game contain the top-priority or deliberately risky items? Flag cards whose score contradicts their release and propose a move with reason.
6. Report sensitivity: which ranking changes if a single weight or size class changes by one step.
7. Write the output **body** from `assets/template.md`: Markdown only, no frontmatter (the product-artifact-contract-guard hook rejects a Write that starts with `---`).
8. Run the self-check below and fix what fails. Never set `passed` yourself — only the critic gate does (Gedächtnis §2.2).
9. **Commit** every output file with its authored block (see "Artifact contract" below): `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/commit-artifact.mjs commit <runDir> <file.md> --step S4.2.4 <<'JSON'` … `JSON`. The script computes id, version, status, derivedFrom, evidence mix and history; fix every rejection it prints and commit again. Re-committing an unchanged file is a no-op.
10. Log: `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/run-state.mjs event <runDir> '{"event":"step-done","element":"S4.2.4"}'`.

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

## Self-check (rubric `scoring` — judged by `product-kritiker-pruefung`)

- [ ] Rubric `scoring`: formula and input values disclosed; recomputable; ranking consistent with values.
- [ ] Every OPP score quoted matches opportunity-backlog and its formula Importance + max(Importance − Satisfaction, 0).
- [ ] Every size class has a one-line reason.
- [ ] Not everything is top priority: the distribution shows a real cut.
- [ ] Proposed release moves are listed, not silently applied.

## Pitfalls

- Using gut ratings for value instead of the panel-derived opportunity scores.
- Priority-one paradox: every epic rated maximum value.
- Changing the release sequence without recording the move proposal.

## Return

Reply with JSON only: `{"status": "done|blocked|partial", "artifacts": ["<committed .md paths>"], "items": ["<item ids created or changed>"], "riskFlags": [], "summary": "<one sentence>"}`.

## Domain knowledge

See `references/domain-knowledge.md` (cited from notebook "The Product - Business Design"; phase brief `knowledge/phase-3-4-journey-story-map.md`).
