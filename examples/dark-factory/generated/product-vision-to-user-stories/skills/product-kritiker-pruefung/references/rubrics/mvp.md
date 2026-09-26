---
id: mvp
version: 1
threshold: 0.8
criteria:
  - {id: fits-budget, text: Fits budget/timebox from the brief, weight: 2, kill: true, source: Gedächtnis §13}
  - {id: learning-goal, text: Every slice has a learning goal, weight: 1, source: Gedächtnis §13}
  - {id: goal-link, text: References GOAL items, weight: 1, source: Gedächtnis §13}
  - {id: vertical, text: 'Vertical, balanced slice — not one technical layer', weight: 1, source: Lean Enterprise}
bpmn:
  file: product-vision-to-user-stories.bpmn
  elements: [S4.2.1, S4.2.5, K_1]
---
# Rubric `mvp`

Seed rubric (Gedächtnis §13 core criteria + adopted notebook criteria, 2026-09-25). Loaded by `scripts/load-rubric.mjs`; the full extraction from the notebook with calibration examples is still open (docs/dark-factory/roadmap.md §2).

| Criterion | Weight | Kill | Source |
|---|---|---|---|
| `fits-budget` Fits budget/timebox from the brief | 2 | yes | Gedächtnis §13 |
| `learning-goal` Every slice has a learning goal | 1 |  | Gedächtnis §13 |
| `goal-link` References GOAL items | 1 |  | Gedächtnis §13 |
| `vertical` Vertical, balanced slice — not one technical layer | 1 |  | Lean Enterprise |

Each criterion is scored `pass | partial | fail` with a reason (K.2); score = weighted share of pass, partial = 0.5 (Gedächtnis §9.1).
