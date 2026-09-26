---
id: vision-statement
version: 1
threshold: 0.8
criteria:
  - {id: moore, text: Follows the Moore template (For … who … the … is a … that … Unlike … our product …), weight: 2, source: 'Gedächtnis §13 (Moore, Olsen)'}
  - {id: no-buzzwords, text: No buzzwords, weight: 1, source: Gedächtnis §13}
  - {id: concrete-customer, text: Target customer is concrete, weight: 1, source: Gedächtnis §13}
  - {id: one-page, text: 'Fits one page, names problem and differentiator; high-concept pitch present', weight: 1, source: Design Thinking Toolbox}
bpmn:
  file: product-vision-to-user-stories.bpmn
  elements: [S1.1.2, K_1]
---
# Rubric `vision-statement`

Seed rubric (Gedächtnis §13 core criteria + adopted notebook criteria, 2026-09-25). Loaded by `scripts/load-rubric.mjs`; the full extraction from the notebook with calibration examples is still open (docs/dark-factory/roadmap.md §2).

| Criterion | Weight | Kill | Source |
|---|---|---|---|
| `moore` Follows the Moore template (For … who … the … is a … that … Unlike … our product …) | 2 |  | Gedächtnis §13 (Moore, Olsen) |
| `no-buzzwords` No buzzwords | 1 |  | Gedächtnis §13 |
| `concrete-customer` Target customer is concrete | 1 |  | Gedächtnis §13 |
| `one-page` Fits one page, names problem and differentiator; high-concept pitch present | 1 |  | Design Thinking Toolbox |

Each criterion is scored `pass | partial | fail` with a reason (K.2); score = weighted share of pass, partial = 0.5 (Gedächtnis §9.1).
