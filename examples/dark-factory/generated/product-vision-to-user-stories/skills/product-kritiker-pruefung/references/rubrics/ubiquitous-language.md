---
id: ubiquitous-language
version: 1
threshold: 0.8
criteria:
  - {id: one-term, text: One term per concept, weight: 1, source: Gedächtnis §13 (Evans)}
  - {id: no-contradictions, text: No contradicting domain rules, weight: 1, source: Gedächtnis §13}
  - {id: all-in-glossary, text: All terms in the glossary, weight: 1, source: Gedächtnis §13}
bpmn:
  file: product-vision-to-user-stories.bpmn
  elements: [S6.2.3, K_1]
---
# Rubric `ubiquitous-language`

Seed rubric (Gedächtnis §13 core criteria + adopted notebook criteria, 2026-09-25). Loaded by `scripts/load-rubric.mjs`; the full extraction from the notebook with calibration examples is still open (docs/dark-factory/roadmap.md §2).

| Criterion | Weight | Kill | Source |
|---|---|---|---|
| `one-term` One term per concept | 1 |  | Gedächtnis §13 (Evans) |
| `no-contradictions` No contradicting domain rules | 1 |  | Gedächtnis §13 |
| `all-in-glossary` All terms in the glossary | 1 |  | Gedächtnis §13 |

Each criterion is scored `pass | partial | fail` with a reason (K.2); score = weighted share of pass, partial = 0.5 (Gedächtnis §9.1).
