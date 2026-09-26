---
id: vpc
version: 1
threshold: 0.8
criteria:
  - {id: linked, text: Jobs/Pains/Gains ↔ Products/Pain Relievers/Gain Creators fully linked, weight: 2, source: Gedächtnis §13}
  - {id: panel-fit, text: Fit rating of the panel present (🤖 marked), weight: 1, source: Gedächtnis §13}
  - {id: dimensions, text: 'Jobs cover functional, social and emotional dimensions', weight: 1, source: Design Thinking Playbook}
bpmn:
  file: product-vision-to-user-stories.bpmn
  elements: [S1.1.5, K_1]
---
# Rubric `vpc`

Seed rubric (Gedächtnis §13 core criteria + adopted notebook criteria, 2026-09-25). Loaded by `scripts/load-rubric.mjs`; the full extraction from the notebook with calibration examples is still open (docs/dark-factory/roadmap.md §2).

| Criterion | Weight | Kill | Source |
|---|---|---|---|
| `linked` Jobs/Pains/Gains ↔ Products/Pain Relievers/Gain Creators fully linked | 2 |  | Gedächtnis §13 |
| `panel-fit` Fit rating of the panel present (🤖 marked) | 1 |  | Gedächtnis §13 |
| `dimensions` Jobs cover functional, social and emotional dimensions | 1 |  | Design Thinking Playbook |

Each criterion is scored `pass | partial | fail` with a reason (K.2); score = weighted share of pass, partial = 0.5 (Gedächtnis §9.1).
