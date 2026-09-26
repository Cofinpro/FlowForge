---
id: lean-canvas
version: 1
threshold: 0.8
criteria:
  - {id: complete, text: All building blocks filled, weight: 1, source: Gedächtnis §13}
  - {id: evidence-per-cell, text: Every cell carries an evidence level, weight: 1, source: Gedächtnis §13}
  - {id: pricing, text: Pricing model explicit, weight: 2, source: Gedächtnis §13}
  - {id: alternatives, text: Problem box names existing alternatives/workarounds; ≤4 entries per box, weight: 1, source: Running Lean}
bpmn:
  file: product-vision-to-user-stories.bpmn
  elements: [S1.1.3, K_1]
---
# Rubric `lean-canvas`

Seed rubric (Gedächtnis §13 core criteria + adopted notebook criteria, 2026-09-25). Loaded by `scripts/load-rubric.mjs`; the full extraction from the notebook with calibration examples is still open (docs/dark-factory/roadmap.md §2).

| Criterion | Weight | Kill | Source |
|---|---|---|---|
| `complete` All building blocks filled | 1 |  | Gedächtnis §13 |
| `evidence-per-cell` Every cell carries an evidence level | 1 |  | Gedächtnis §13 |
| `pricing` Pricing model explicit | 2 |  | Gedächtnis §13 |
| `alternatives` Problem box names existing alternatives/workarounds; ≤4 entries per box | 1 |  | Running Lean |

Each criterion is scored `pass | partial | fail` with a reason (K.2); score = weighted share of pass, partial = 0.5 (Gedächtnis §9.1).
