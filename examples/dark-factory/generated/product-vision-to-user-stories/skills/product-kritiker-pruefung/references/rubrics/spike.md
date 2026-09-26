---
id: spike
version: 1
threshold: 0.8
criteria:
  - {id: timebox, text: Timebox, weight: 1, source: Gedächtnis §13}
  - {id: question, text: Explicit question, weight: 1, source: Gedächtnis §13}
  - {id: ac, text: Acceptance criteria of the spike, weight: 1, source: Gedächtnis §13}
bpmn:
  file: product-vision-to-user-stories.bpmn
  elements: [S5.1.4, K_1]
---
# Rubric `spike`

Seed rubric (Gedächtnis §13 core criteria + adopted notebook criteria, 2026-09-25). Loaded by `scripts/load-rubric.mjs`; the full extraction from the notebook with calibration examples is still open (docs/dark-factory/roadmap.md §2).

| Criterion | Weight | Kill | Source |
|---|---|---|---|
| `timebox` Timebox | 1 |  | Gedächtnis §13 |
| `question` Explicit question | 1 |  | Gedächtnis §13 |
| `ac` Acceptance criteria of the spike | 1 |  | Gedächtnis §13 |

Each criterion is scored `pass | partial | fail` with a reason (K.2); score = weighted share of pass, partial = 0.5 (Gedächtnis §9.1).
