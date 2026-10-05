---
name: product-impacts-priorisieren
description: >-
  Produces the impact-scoring artifact: a disclosed, recomputable leverage × risk scoring of every IMP (and its DEL options) using the OMTM and the linked ASM items. Use when the dark-factory workflow
  reaches step S1.2.5 "Impacts nach Hebel & Risiko priorisieren".
bpmn:
  file: product-vision-to-user-stories.bpmn
  elements: [S1.2.5]
---

# Impacts nach Hebel & Risiko priorisieren (step 1.2.5)

Generated from `product-vision-to-user-stories.bpmn`'s "Impacts nach Hebel & Risiko priorisieren" (serviceTask, lane "Stratege") by `flowforge-generate`. The ranking tells S1.2.6 which outcomes to pursue first and which risky impacts to test early; the critic recomputes it from the disclosed inputs. It is its own skill because it produces an independently versioned artifact with its own contract (body + sidecar), template and rubric (mapping-rubric.md's serviceTask rule; one skill per business step, docs/dark-factory/implementation.md §2).

Executed by the `product-stratege` agent. Binding rules: `${CLAUDE_PLUGIN_ROOT}/knowledge/process-rules.md` — evidence §6, item IDs §10, artifact contract §11.2, iterations §15.

## Run context

The Workflow passes `runDir`, `runId`, `iteration` and `changeRequests` (from the last gate record of this phase).

| Input | Required | Path pattern |
|---|---|---|
| `impact-map` | yes | `runs/{runId}/artifacts/p1-strategie/1.2.4_impact-map.md` |
| `assumptions-map` | yes | `runs/{runId}/artifacts/p1-strategie/1.1.6_assumptions-map.md` |

| Output | Item prefix | Cardinality | Path pattern |
|---|---|---|---|
| `impact-scoring` | — | one | `runs/{runId}/artifacts/p1-strategie/1.2.5_impact-scoring.md` |


## Procedure

0. **Resume / iterate.** Read the output's sidecar (`<file>.meta.json`) if it exists. If it has `status: passed`/`passed-with-risk`, or `iteration > 1` and no change request concerns this artifact or an upstream artifact it consumes, return it unchanged (idempotent resume). Otherwise work every change request into the body and keep item IDs stable when the item is materially the same. Do not copy files to `history/` or touch `version` — `commit-artifact.mjs` does both (Gedächtnis §15).
1. Read impact-map (GOAL/ACT/IMP/DEL) and assumptions-map (ASM items with importance, evidence, kill flag).
2. Link each IMP to the ASM items its hypothesis depends on (derive the links from derivedFrom chains and content; list them).
3. Rate Leverage L (1–5): expected effect of the impact on the OMTM, with a one-line reason.
4. Derive Risk R (1–5) from the linked ASM: R = max over linked ASM of round((Importance + (6 − Evidence)) / 2); R = 1 if no ASM is linked. Flag the IMP "kill-risk" if any linked ASM is a kill assumption.
5. Compute Priority = L × (6 − R) and a Learning flag "test first" for L ≥ 4 and R ≥ 4 (high leverage, high risk). Disclose the formula and every input value in the table.
6. Rank IMPs by Priority desc (ties: higher L first); within each IMP order its DEL options by the cheapest plausible test of the impact.
7. Recompute the table once from the listed inputs and confirm the ranking matches the values.
8. Write the output **body** from `assets/template.md`: Markdown only, no frontmatter (the product-artifact-contract-guard hook rejects a Write that starts with `---`).
9. Run the self-check below and fix what fails. Never set `passed` yourself — only the critic gate does (Gedächtnis §2.2).
10. **Commit** every output file with its authored block (see "Artifact contract" below): `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/commit-artifact.mjs commit <runDir> <file.md> --step S1.2.5 <<'JSON'` … `JSON`. The script computes id, version, status, derivedFrom, evidence mix and history; fix every rejection it prints and commit again. Re-committing an unchanged file is a no-op.
11. Log: `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/run-state.mjs event <runDir> '{"event":"step-done","element":"S1.2.5"}'`.

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

- [ ] Rubric scoring: formula and all input values (L, linked ASM with importance/evidence, R) are disclosed.
- [ ] Rubric scoring: the scoring is recomputable by the critic from the table alone.
- [ ] Rubric scoring: the ranking is consistent with the computed values and the stated tie-break.
- [ ] Every IMP of the impact map is scored; each L has a reason tied to the OMTM.
- [ ] Kill-risk and "test first" flags are set exactly where the rules say.

## Pitfalls

- Gut-feel ranking with numbers added afterwards that do not reproduce it.
- Ignoring the assumptions map, so risky impacts look as safe as proven ones.
- Scoring deliverables instead of impacts, which re-opens feature prioritization too early.

## Return

Reply with JSON only: `{"status": "done|blocked|partial", "artifacts": ["<committed .md paths>"], "items": ["<item ids created or changed>"], "riskFlags": [], "summary": "<one sentence>"}`.

## Domain knowledge

See `references/domain-knowledge.md` (cited from notebook "The Product - Business Design"; phase brief `knowledge/phase-1-strategie.md`).
