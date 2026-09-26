---
id: scoring
version: 1
threshold: 0.8
criteria:
  - {id: disclosed, text: Formula and input values disclosed, weight: 2, source: Gedächtnis §13}
  - {id: recomputable, text: 'Recomputable: the critic reproduces the ranking from the inputs', weight: 2, source: Gedächtnis §13}
  - {id: consistent, text: Ranking consistent with the values, weight: 1, source: Gedächtnis §13}
bpmn:
  file: product-vision-to-user-stories.bpmn
  elements: [S1.2.5, S2.2.5, S4.2.4, K_1]
---
# Rubric `scoring`

Seed rubric (Gedächtnis §13 core criteria + adopted notebook criteria, 2026-09-25). Loaded by `scripts/load-rubric.mjs`; the full extraction from the notebook with calibration examples is still open (docs/dark-factory/roadmap.md §2).

| Criterion | Weight | Kill | Source |
|---|---|---|---|
| `disclosed` Formula and input values disclosed | 2 |  | Gedächtnis §13 |
| `recomputable` Recomputable: the critic reproduces the ranking from the inputs | 2 |  | Gedächtnis §13 |
| `consistent` Ranking consistent with the values | 1 |  | Gedächtnis §13 |

Each criterion is scored `pass | partial | fail` with a reason (K.2); score = weighted share of pass, partial = 0.5 (Gedächtnis §9.1).
