---
id: ost
version: 1
threshold: 0.8
criteria:
  - {id: levels, text: Outcome → Opportunities → Solutions → Experiments, weight: 2, source: Gedächtnis §13 (Torres)}
  - {id: user-view, text: Opportunities phrased from the user perspective, weight: 1, source: Gedächtnis §13}
  - {id: multiple-solutions, text: Several competing solutions per opportunity; no solution directly under the outcome, weight: 1, source: The Product Manager's Playbook}
bpmn:
  file: product-vision-to-user-stories.bpmn
  elements: [S2.2.4, K_1]
---
# Rubric `ost`

Seed rubric (Gedächtnis §13 core criteria + adopted notebook criteria, 2026-09-25). Loaded by `scripts/load-rubric.mjs`; the full extraction from the notebook with calibration examples is still open (docs/dark-factory/roadmap.md §2).

| Criterion | Weight | Kill | Source |
|---|---|---|---|
| `levels` Outcome → Opportunities → Solutions → Experiments | 2 |  | Gedächtnis §13 (Torres) |
| `user-view` Opportunities phrased from the user perspective | 1 |  | Gedächtnis §13 |
| `multiple-solutions` Several competing solutions per opportunity; no solution directly under the outcome | 1 |  | The Product Manager's Playbook |

Each criterion is scored `pass | partial | fail` with a reason (K.2); score = weighted share of pass, partial = 0.5 (Gedächtnis §9.1).
