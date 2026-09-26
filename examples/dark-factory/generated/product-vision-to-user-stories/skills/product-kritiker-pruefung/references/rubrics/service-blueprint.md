---
id: service-blueprint
version: 1
threshold: 0.8
criteria:
  - {id: layers, text: Frontstage / line of visibility / backstage / support systems, weight: 2, source: Gedächtnis §13}
  - {id: complexity, text: Backstage complexity rated, weight: 1, source: Gedächtnis §13}
  - {id: traced, text: Every frontstage interaction traces to a backstage process or system, weight: 1, source: Mapping Experiences}
bpmn:
  file: product-vision-to-user-stories.bpmn
  elements: [S3.1.4, K_1]
---
# Rubric `service-blueprint`

Seed rubric (Gedächtnis §13 core criteria + adopted notebook criteria, 2026-09-25). Loaded by `scripts/load-rubric.mjs`; the full extraction from the notebook with calibration examples is still open (docs/dark-factory/roadmap.md §2).

| Criterion | Weight | Kill | Source |
|---|---|---|---|
| `layers` Frontstage / line of visibility / backstage / support systems | 2 |  | Gedächtnis §13 |
| `complexity` Backstage complexity rated | 1 |  | Gedächtnis §13 |
| `traced` Every frontstage interaction traces to a backstage process or system | 1 |  | Mapping Experiences |

Each criterion is scored `pass | partial | fail` with a reason (K.2); score = weighted share of pass, partial = 0.5 (Gedächtnis §9.1).
