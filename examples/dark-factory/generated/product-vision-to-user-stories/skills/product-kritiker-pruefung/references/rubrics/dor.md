---
id: dor
version: 1
threshold: 0.8
criteria:
  - {id: invest, text: INVEST fulfilled, weight: 2, source: 'Gedächtnis §13 (Scrum, IREB)'}
  - {id: ac, text: ≥1 AC (confirmation notes at this stage), weight: 1, source: Gedächtnis §13}
  - {id: no-blockers, text: No open blockers, weight: 1, source: Gedächtnis §13}
  - {id: glossary, text: Terminology per glossary, weight: 1, source: Gedächtnis §13}
  - {id: size, text: Size class S or M with reasoning (L forces re-splitting), weight: 1, kill: true, source: §4}
bpmn:
  file: product-vision-to-user-stories.bpmn
  elements: [S5.2.1, S5.2.2, S5.2.3, S5.2.4, SP5.2_CallK, K_1]
---
# Rubric `dor`

Seed rubric (Gedächtnis §13 core criteria + adopted notebook criteria, 2026-09-25). Loaded by `scripts/load-rubric.mjs`; the full extraction from the notebook with calibration examples is still open (docs/dark-factory/roadmap.md §2).

| Criterion | Weight | Kill | Source |
|---|---|---|---|
| `invest` INVEST fulfilled | 2 |  | Gedächtnis §13 (Scrum, IREB) |
| `ac` ≥1 AC (confirmation notes at this stage) | 1 |  | Gedächtnis §13 |
| `no-blockers` No open blockers | 1 |  | Gedächtnis §13 |
| `glossary` Terminology per glossary | 1 |  | Gedächtnis §13 |
| `size` Size class S or M with reasoning (L forces re-splitting) | 1 | yes | §4 |

Each criterion is scored `pass | partial | fail` with a reason (K.2); score = weighted share of pass, partial = 0.5 (Gedächtnis §9.1).
