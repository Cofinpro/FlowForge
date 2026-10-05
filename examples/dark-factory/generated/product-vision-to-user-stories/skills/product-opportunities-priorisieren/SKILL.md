---
name: product-opportunities-priorisieren
description: >-
  Produces the opportunity-backlog: every OPP scored with Opportunity = Importance + max(Importance − Satisfaction, 0) from the full-panel rating (1–5), inputs and aggregation disclosed, ranked with
  dissent from Contrarian and Verweigerer shown. Use when the dark-factory workflow reaches step S2.2.5 "Opportunities priorisieren".
bpmn:
  file: product-vision-to-user-stories.bpmn
  elements: [S2.2.5]
---

# Opportunities priorisieren (step 2.2.5)

Generated from `product-vision-to-user-stories.bpmn`'s "Opportunities priorisieren" (callActivity, lane "Stratege") by `flowforge-generate`. Tells S3.1.3 and S4.2.4 which opportunities the journeys, MVP and release cut should serve first; the SP2.2 critic recomputes the scores (rubric scoring). It is its own skill because it produces an independently versioned artifact with its own contract (body + sidecar), template and rubric (mapping-rubric.md's serviceTask rule; one skill per business step, docs/dark-factory/implementation.md §2).

Executed by the `product-stratege` agent. Binding rules: `${CLAUDE_PLUGIN_ROOT}/knowledge/process-rules.md` — evidence §6, item IDs §10, artifact contract §11.2, iterations §15.

## Run context

The Workflow passes `runDir`, `runId`, `iteration` and `changeRequests` (from the last gate record of this phase), `panelResult`.

| Input | Required | Path pattern |
|---|---|---|
| `opportunity-solution-tree` | yes | `runs/{runId}/artifacts/p2-research/2.2.4_opportunity-solution-tree.md` |

| Output | Item prefix | Cardinality | Path pattern |
|---|---|---|---|
| `opportunity-backlog` | — | one | `runs/{runId}/artifacts/p2-research/2.2.5_opportunity-backlog.md` |

- **Panel** (`rating`, panel set `full`): the Workflow has already run `product-panel-befragung` for this step and passes `panelResult` (the session JSON under `panel/sessions/`). Mark everything taken from it 🤖 synthetic.

## Procedure

0. **Resume / iterate.** Read the output's sidecar (`<file>.meta.json`) if it exists. If it has `status: passed`/`passed-with-risk`, or `iteration > 1` and no change request concerns this artifact or an upstream artifact it consumes, return it unchanged (idempotent resume). Otherwise work every change request into the body and keep item IDs stable when the item is materially the same. Do not copy files to `history/` or touch `version` — `commit-artifact.mjs` does both (Gedächtnis §15).
1. Read opportunity-solution-tree (OPP items) and the panel result the Workflow passed (product-panel-befragung, mode rating, panelSet full): per OPP × persona an Importance and a Satisfaction rating 1–5 with a short reason.
2. Validate the rating table: every OPP rated by all 6 personas; record missing cells as "n/a" and never impute them.
3. Aggregate per OPP over the 4 target-user personas only: Importance = mean, Satisfaction = mean (rounded to 1 decimal; state the rule); report Contrarian and Verweigerer ratings in separate columns, not in the aggregate.
4. Compute Opportunity = Importance + max(Importance − Satisfaction, 0) per OPP and show the arithmetic in the table; also compute the score from the Contrarian and Verweigerer ratings as a dissent indicator.
5. Rank by score (tie-break: higher Importance, then lower Satisfaction); flag OPPs with rating spread ≥ 2 points among target users as "panel disagrees".
6. Mark the top opportunities selected for phase 3 with a one-line rationale each and the risks from dissent; mark all rating-derived values 🤖 synthetic and cite T/P ids of the raters.
7. Write the output **body** from `assets/template.md`: Markdown only, no frontmatter (the product-artifact-contract-guard hook rejects a Write that starts with `---`).
8. Run the self-check below and fix what fails. Never set `passed` yourself — only the critic gate does (Gedächtnis §2.2).
9. **Commit** every output file with its authored block (see "Artifact contract" below): `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/commit-artifact.mjs commit <runDir> <file.md> --step S2.2.5 --from <panelResult> <<'JSON'` … `JSON`. The script computes id, version, status, derivedFrom, evidence mix and history; fix every rejection it prints and commit again. Re-committing an unchanged file is a no-op.
10. Log: `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/run-state.mjs event <runDir> '{"event":"step-done","element":"S2.2.5"}'`.

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

- [ ] The formula Opportunity = Importance + max(Importance − Satisfaction, 0) and the aggregation rule are stated (rubric scoring: formula and inputs disclosed).
- [ ] Every score can be recomputed from the displayed per-persona inputs (rubric scoring: recomputable).
- [ ] The ranking order matches the scores and the stated tie-break (rubric scoring: consistent).
- [ ] Only the 4 target users enter the aggregate; Contrarian and Verweigerer are shown separately.
- [ ] Missing ratings are shown as n/a, not imputed; spread ≥ 2 is flagged.
- [ ] All panel-derived values are marked 🤖 synthetic.

## Pitfalls

- Adjusting ratings or the formula so the favoured solution's opportunity wins.
- Using max(Satisfaction − Importance, 0) or dropping the max, which rewards over-served needs.
- Hiding a high Verweigerer satisfaction that signals the workaround already solves the need.

## Return

Reply with JSON only: `{"status": "done|blocked|partial", "artifacts": ["<committed .md paths>"], "items": ["<item ids created or changed>"], "riskFlags": [], "summary": "<one sentence>"}`.

## Domain knowledge

See `references/domain-knowledge.md` (cited from notebook "The Product - Business Design"; phase brief `knowledge/phase-2-discovery.md`).
