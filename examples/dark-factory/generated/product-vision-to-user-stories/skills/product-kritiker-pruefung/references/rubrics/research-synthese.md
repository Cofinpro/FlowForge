---
id: research-synthese
version: 1
threshold: 0.8
criteria:
  - {id: verdict-per-claim, text: Every checked claim has a result (confirmed / refuted / unclear), weight: 2, source: Gedächtnis §13}
  - {id: sources, text: Every result cites ≥1 SRC in an allowed tier; refuted claims name the counter-source, weight: 2, source: §8.3}
bpmn:
  file: product-vision-to-user-stories.bpmn
  elements: [K_3, K_1]
---
# Rubric `research-synthese`

Seed rubric (Gedächtnis §13 core criteria + adopted notebook criteria, 2026-09-25). Loaded by `scripts/load-rubric.mjs`; the full extraction from the notebook with calibration examples is still open (docs/dark-factory/roadmap.md §2).

| Criterion | Weight | Kill | Source |
|---|---|---|---|
| `verdict-per-claim` Every checked claim has a result (confirmed / refuted / unclear) | 2 |  | Gedächtnis §13 |
| `sources` Every result cites ≥1 SRC in an allowed tier; refuted claims name the counter-source | 2 |  | §8.3 |

Each criterion is scored `pass | partial | fail` with a reason (K.2); score = weighted share of pass, partial = 0.5 (Gedächtnis §9.1).
