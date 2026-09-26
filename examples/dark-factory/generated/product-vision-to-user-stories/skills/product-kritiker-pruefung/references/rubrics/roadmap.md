---
id: roadmap
version: 1
threshold: 0.8
criteria:
  - {id: outcomes, text: Outcome instead of feature phrasing, weight: 1, source: Gedächtnis §13}
  - {id: links, text: Every milestone references GOAL/IMP items, weight: 1, source: Gedächtnis §13}
bpmn:
  file: product-vision-to-user-stories.bpmn
  elements: [S1.2.6, K_1]
---
# Rubric `roadmap`

Seed rubric (Gedächtnis §13 core criteria + adopted notebook criteria, 2026-09-25). Loaded by `scripts/load-rubric.mjs`; the full extraction from the notebook with calibration examples is still open (docs/dark-factory/roadmap.md §2).

| Criterion | Weight | Kill | Source |
|---|---|---|---|
| `outcomes` Outcome instead of feature phrasing | 1 |  | Gedächtnis §13 |
| `links` Every milestone references GOAL/IMP items | 1 |  | Gedächtnis §13 |

Each criterion is scored `pass | partial | fail` with a reason (K.2); score = weighted share of pass, partial = 0.5 (Gedächtnis §9.1).
