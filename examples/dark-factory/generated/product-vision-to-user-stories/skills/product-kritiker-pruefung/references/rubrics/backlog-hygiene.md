---
id: backlog-hygiene
version: 1
threshold: 0.8
criteria:
  - {id: no-orphans, text: No orphans, weight: 2, source: Gedächtnis §13 / §10.2}
  - {id: no-fake, text: No fake stories, weight: 2, source: Gedächtnis §13}
  - {id: no-duplicates, text: No duplicates, weight: 1, source: Gedächtnis §13}
bpmn:
  file: product-vision-to-user-stories.bpmn
  elements: [S6.2.4, K_1]
---
# Rubric `backlog-hygiene`

Seed rubric (Gedächtnis §13 core criteria + adopted notebook criteria, 2026-09-25). Loaded by `scripts/load-rubric.mjs`; the full extraction from the notebook with calibration examples is still open (docs/dark-factory/roadmap.md §2).

| Criterion | Weight | Kill | Source |
|---|---|---|---|
| `no-orphans` No orphans | 2 |  | Gedächtnis §13 / §10.2 |
| `no-fake` No fake stories | 2 |  | Gedächtnis §13 |
| `no-duplicates` No duplicates | 1 |  | Gedächtnis §13 |

Each criterion is scored `pass | partial | fail` with a reason (K.2); score = weighted share of pass, partial = 0.5 (Gedächtnis §9.1).
