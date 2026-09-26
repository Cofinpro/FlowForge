---
id: run-report
version: 1
threshold: 0.8
criteria:
  - {id: evidence-mix, text: Evidence mix, weight: 1, source: Gedächtnis §13}
  - {id: risk-flags, text: Risk flags and forced loop exits, weight: 1, source: Gedächtnis §13}
  - {id: top5, text: Top-5 risk assumptions, weight: 1, source: Gedächtnis §13}
  - {id: cost, text: Cost, weight: 1, source: Gedächtnis §13}
bpmn:
  file: product-vision-to-user-stories.bpmn
  elements: [S7, K_1]
---
# Rubric `run-report`

Seed rubric (Gedächtnis §13 core criteria + adopted notebook criteria, 2026-09-25). Loaded by `scripts/load-rubric.mjs`; the full extraction from the notebook with calibration examples is still open (docs/dark-factory/roadmap.md §2).

| Criterion | Weight | Kill | Source |
|---|---|---|---|
| `evidence-mix` Evidence mix | 1 |  | Gedächtnis §13 |
| `risk-flags` Risk flags and forced loop exits | 1 |  | Gedächtnis §13 |
| `top5` Top-5 risk assumptions | 1 |  | Gedächtnis §13 |
| `cost` Cost | 1 |  | Gedächtnis §13 |

Each criterion is scored `pass | partial | fail` with a reason (K.2); score = weighted share of pass, partial = 0.5 (Gedächtnis §9.1).
