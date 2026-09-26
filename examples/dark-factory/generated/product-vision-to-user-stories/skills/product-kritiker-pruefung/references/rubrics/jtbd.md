---
id: jtbd
version: 1
threshold: 0.8
criteria:
  - {id: syntax, text: 'Syntax "When …, I want to …, so I can …"', weight: 1, source: Gedächtnis §13}
  - {id: neutral, text: Implementation-neutral (no UI/tech), weight: 2, source: Gedächtnis §13}
bpmn:
  file: product-vision-to-user-stories.bpmn
  elements: [S2.1.6, K_1]
---
# Rubric `jtbd`

Seed rubric (Gedächtnis §13 core criteria + adopted notebook criteria, 2026-09-25). Loaded by `scripts/load-rubric.mjs`; the full extraction from the notebook with calibration examples is still open (docs/dark-factory/roadmap.md §2).

| Criterion | Weight | Kill | Source |
|---|---|---|---|
| `syntax` Syntax "When …, I want to …, so I can …" | 1 |  | Gedächtnis §13 |
| `neutral` Implementation-neutral (no UI/tech) | 2 |  | Gedächtnis §13 |

Each criterion is scored `pass | partial | fail` with a reason (K.2); score = weighted share of pass, partial = 0.5 (Gedächtnis §9.1).
