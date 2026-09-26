---
id: gherkin
version: 1
threshold: 0.8
criteria:
  - {id: valid, text: Valid Given-When-Then, weight: 1, source: Gedächtnis §13}
  - {id: paths, text: ≥1 happy path and ≥1 negative/exception path, weight: 2, source: Gedächtnis §13}
  - {id: neutral, text: Implementation-neutral, weight: 1, source: Gedächtnis §13}
  - {id: sbe, text: SBE examples with concrete values, weight: 1, source: Gedächtnis §13 (Adzic)}
bpmn:
  file: product-vision-to-user-stories.bpmn
  elements: [S6.1.1, S6.1.2, S6.1.3, S6.1.4, SP6.1_CallK, K_1]
---
# Rubric `gherkin`

Seed rubric (Gedächtnis §13 core criteria + adopted notebook criteria, 2026-09-25). Loaded by `scripts/load-rubric.mjs`; the full extraction from the notebook with calibration examples is still open (docs/dark-factory/roadmap.md §2).

| Criterion | Weight | Kill | Source |
|---|---|---|---|
| `valid` Valid Given-When-Then | 1 |  | Gedächtnis §13 |
| `paths` ≥1 happy path and ≥1 negative/exception path | 2 |  | Gedächtnis §13 |
| `neutral` Implementation-neutral | 1 |  | Gedächtnis §13 |
| `sbe` SBE examples with concrete values | 1 |  | Gedächtnis §13 (Adzic) |

Each criterion is scored `pass | partial | fail` with a reason (K.2); score = weighted share of pass, partial = 0.5 (Gedächtnis §9.1).
