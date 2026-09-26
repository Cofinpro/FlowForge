---
id: journey
version: 1
threshold: 0.8
criteria:
  - {id: structure, text: 'Phases, touchpoints, emotion curve', weight: 1, source: Gedächtnis §13}
  - {id: hot-spots, text: Every hot spot addressed or skipped with a reason, weight: 2, source: Gedächtnis §13}
  - {id: outside-in, text: Outside-in and end to end (before/during/after), weight: 1, source: Journey Mapping Playbook}
bpmn:
  file: product-vision-to-user-stories.bpmn
  elements: [S3.1.1, S3.1.2, S3.1.3, K_1]
---
# Rubric `journey`

Seed rubric (Gedächtnis §13 core criteria + adopted notebook criteria, 2026-09-25). Loaded by `scripts/load-rubric.mjs`; the full extraction from the notebook with calibration examples is still open (docs/dark-factory/roadmap.md §2).

| Criterion | Weight | Kill | Source |
|---|---|---|---|
| `structure` Phases, touchpoints, emotion curve | 1 |  | Gedächtnis §13 |
| `hot-spots` Every hot spot addressed or skipped with a reason | 2 |  | Gedächtnis §13 |
| `outside-in` Outside-in and end to end (before/during/after) | 1 |  | Journey Mapping Playbook |

Each criterion is scored `pass | partial | fail` with a reason (K.2); score = weighted share of pass, partial = 0.5 (Gedächtnis §9.1).
