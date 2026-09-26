---
id: story-map
version: 1
threshold: 0.8
criteria:
  - {id: 2d, text: '2D structure (narrative horizontal, priority vertical)', weight: 1, source: Gedächtnis §13 (Patton)}
  - {id: no-orphans, text: No orphaned cards, weight: 1, source: Gedächtnis §13}
  - {id: release-line, text: Release line explicit, weight: 1, source: Gedächtnis §13}
  - {id: neutral-backbone, text: Backbone is solution-independent, weight: 1, source: Fifty Quick Ideas}
bpmn:
  file: product-vision-to-user-stories.bpmn
  elements: [S4.1.1, S4.1.2, S4.1.3, S4.1.4, S4.1.5, S4.2.5, K_1]
---
# Rubric `story-map`

Seed rubric (Gedächtnis §13 core criteria + adopted notebook criteria, 2026-09-25). Loaded by `scripts/load-rubric.mjs`; the full extraction from the notebook with calibration examples is still open (docs/dark-factory/roadmap.md §2).

| Criterion | Weight | Kill | Source |
|---|---|---|---|
| `2d` 2D structure (narrative horizontal, priority vertical) | 1 |  | Gedächtnis §13 (Patton) |
| `no-orphans` No orphaned cards | 1 |  | Gedächtnis §13 |
| `release-line` Release line explicit | 1 |  | Gedächtnis §13 |
| `neutral-backbone` Backbone is solution-independent | 1 |  | Fifty Quick Ideas |

Each criterion is scored `pass | partial | fail` with a reason (K.2); score = weighted share of pass, partial = 0.5 (Gedächtnis §9.1).
