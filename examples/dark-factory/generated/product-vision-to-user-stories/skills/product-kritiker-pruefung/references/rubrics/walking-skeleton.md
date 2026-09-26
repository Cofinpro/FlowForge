---
id: walking-skeleton
version: 1
threshold: 0.8
criteria:
  - {id: steel-thread, text: Steel thread through all layers, weight: 1, source: Gedächtnis §13}
  - {id: minimal, text: Minimal, weight: 1, source: Gedächtnis §13}
  - {id: usable, text: End-to-end usable, weight: 1, source: Gedächtnis §13}
bpmn:
  file: product-vision-to-user-stories.bpmn
  elements: [S4.2.2, S4.2.3, K_1]
---
# Rubric `walking-skeleton`

Seed rubric (Gedächtnis §13 core criteria + adopted notebook criteria, 2026-09-25). Loaded by `scripts/load-rubric.mjs`; the full extraction from the notebook with calibration examples is still open (docs/dark-factory/roadmap.md §2).

| Criterion | Weight | Kill | Source |
|---|---|---|---|
| `steel-thread` Steel thread through all layers | 1 |  | Gedächtnis §13 |
| `minimal` Minimal | 1 |  | Gedächtnis §13 |
| `usable` End-to-end usable | 1 |  | Gedächtnis §13 |

Each criterion is scored `pass | partial | fail` with a reason (K.2); score = weighted share of pass, partial = 0.5 (Gedächtnis §9.1).
