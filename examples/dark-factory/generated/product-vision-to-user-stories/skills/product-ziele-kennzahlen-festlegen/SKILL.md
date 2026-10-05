---
name: product-ziele-kennzahlen-festlegen
description: >-
  Sets the business-goals artifact: GOAL items as measurable business outcomes, with one One Metric That Matters placed on the AARRR funnel for the current stage. Use when the dark-factory workflow
  reaches step S1.2.1 "Ziel & Kennzahlen festlegen (Why)".
bpmn:
  file: product-vision-to-user-stories.bpmn
  elements: [S1.2.1]
---

# Ziel & Kennzahlen festlegen (Why) (step 1.2.1)

Generated from `product-vision-to-user-stories.bpmn`'s "Ziel & Kennzahlen festlegen (Why)" (serviceTask, lane "Stratege") by `flowforge-generate`. GOAL items are the "Why" level of the impact map and a mandatory link of the trace chain (IMP → GOAL → VIS); S1.2.2 derives actors from them and S1.2.6 states roadmap milestones as movements of the OMTM. It is its own skill because it produces an independently versioned artifact with its own contract (body + sidecar), template and rubric (mapping-rubric.md's serviceTask rule; one skill per business step, docs/dark-factory/implementation.md §2).

Executed by the `product-stratege` agent. Binding rules: `${CLAUDE_PLUGIN_ROOT}/knowledge/process-rules.md` — evidence §6, item IDs §10, artifact contract §11.2, iterations §15.

## Run context

The Workflow passes `runDir`, `runId`, `iteration` and `changeRequests` (from the last gate record of this phase).

| Input | Required | Path pattern |
|---|---|---|
| `vision-statement` | yes | `runs/{runId}/artifacts/p1-strategie/1.1.2_vision-statement.md` |

| Output | Item prefix | Cardinality | Path pattern |
|---|---|---|---|
| `business-goals` | GOAL | many | `runs/{runId}/artifacts/p1-strategie/1.2.1_business-goals.md` |


## Procedure

0. **Resume / iterate.** Read the output's sidecar (`<file>.meta.json`) if it exists. If it has `status: passed`/`passed-with-risk`, or `iteration > 1` and no change request concerns this artifact or an upstream artifact it consumes, return it unchanged (idempotent resume). Otherwise work every change request into the body and keep item IDs stable when the item is materially the same. Do not copy files to `history/` or touch `version` — `commit-artifact.mjs` does both (Gedächtnis §15).
1. Read vision-statement (VIS-001) and determine the product's current stage (e.g. problem/solution fit, early traction).
2. Place the stage on the AARRR funnel (Acquisition, Activation, Retention, Revenue, Referral) and choose exactly one One Metric That Matters for it; state why this funnel stage is the bottleneck now.
3. Define the OMTM precisely: name, formula, unit, measurement window, baseline (or "unknown, 🧠 assumed" with reason) and target value with a time frame.
4. Create GOAL-<nnn> items as business outcomes (not solution mandates). The first GOAL carries the OMTM; add at most 1–2 supporting goals, each on its own AARRR stage, clearly subordinate to the OMTM.
5. Give each GOAL `derivedFrom: [VIS-001]` (plus SRC ids used for baselines) and an evidence level.
6. Reject any goal that names a feature or technology ("launch an app") and rewrite it as the outcome that feature was supposed to cause.
7. Write the output **body** from `assets/template.md`: Markdown only, no frontmatter (the product-artifact-contract-guard hook rejects a Write that starts with `---`); one file per instance, following the path pattern.
8. Run the self-check below and fix what fails. Never set `passed` yourself — only the critic gate does (Gedächtnis §2.2).
9. **Commit** every output file with its authored block (see "Artifact contract" below): `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/commit-artifact.mjs commit <runDir> <file.md> --step S1.2.1 <<'JSON'` … `JSON`. The script computes id, version, status, derivedFrom, evidence mix and history; fix every rejection it prints and commit again. Re-committing an unchanged file is a no-op.
10. Log: `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/run-state.mjs event <runDir> '{"event":"step-done","element":"S1.2.1"}'`.

## Artifact contract (Gedächtnis §11.2)

Every output is two files: `<file>.md` (the body you write; its frontmatter is rendered read-only from the sidecar) and `<file>.meta.json` (the sidecar, written only by `commit-artifact.mjs`). Read upstream metadata from sidecars, never from rendered frontmatter.

**You supply** the authored block on stdin (`node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/commit-artifact.mjs schema` prints its JSON Schema):

```json
{
  "itemIndex": [
    {
      "id": "GOAL-001",
      "derivedFrom": [
        "<parent item id>"
      ],
      "evidence": "cited|inferred|synthetic",
      "refs": [
        "SRC-0001"
      ]
    }
  ],
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

## Self-check (rubric `impact-map` — judged by `product-kritiker-pruefung`)

- [ ] Exactly one OMTM is defined, placed on an AARRR stage, with the reason for that stage.
- [ ] Rubric impact-map (goal level): every GOAL is a measurable business outcome with metric, baseline and target, not a solution mandate.
- [ ] Every GOAL has derivedFrom VIS-001 and an evidence level; unknown baselines are marked 🧠.
- [ ] Supporting goals do not compete with the OMTM (at most 1–2, clearly subordinate).
- [ ] No GOAL contains a feature, deliverable or technology.

## Pitfalls

- A loose list of KPIs instead of one OMTM, so later prioritization has no single yardstick.
- Vanity metrics (downloads, page views) instead of a metric that reflects the bottleneck stage.
- A goal phrased as a feature ("build a mobile app").

## Return

Reply with JSON only: `{"status": "done|blocked|partial", "artifacts": ["<committed .md paths>"], "items": ["<item ids created or changed>"], "riskFlags": [], "summary": "<one sentence>"}`.

## Domain knowledge

See `references/domain-knowledge.md` (cited from notebook "The Product - Business Design"; phase brief `knowledge/phase-1-strategie.md`).
