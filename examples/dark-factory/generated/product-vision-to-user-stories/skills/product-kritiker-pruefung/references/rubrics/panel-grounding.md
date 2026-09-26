---
id: panel-grounding
version: 1
threshold: 0.8
criteria:
  - {id: src-per-trait, text: Every profile trait has an SRC reference, weight: 2, kill: true, source: Gedächtnis §13 / §7.2}
  - {id: source-types, text: ≥3 different source types in the panel; no persona rests on a single source, weight: 1, source: Gedächtnis §13}
  - {id: contrarian-refuser, text: Contrarian and Verweigerer present (full panel only), weight: 1, source: Gedächtnis §13}
  - {id: hidden, text: 'Hidden attributes set (budget, skepticism, workaround, switching barriers, secret)', weight: 1, source: §7.3}
bpmn:
  file: product-vision-to-user-stories.bpmn
  elements: [S1.1.4, S2.1.3, K_1]
---
# Rubric `panel-grounding`

Seed rubric (Gedächtnis §13 core criteria + adopted notebook criteria, 2026-09-25). Loaded by `scripts/load-rubric.mjs`; the full extraction from the notebook with calibration examples is still open (docs/dark-factory/roadmap.md §2).

| Criterion | Weight | Kill | Source |
|---|---|---|---|
| `src-per-trait` Every profile trait has an SRC reference | 2 | yes | Gedächtnis §13 / §7.2 |
| `source-types` ≥3 different source types in the panel; no persona rests on a single source | 1 |  | Gedächtnis §13 |
| `contrarian-refuser` Contrarian and Verweigerer present (full panel only) | 1 |  | Gedächtnis §13 |
| `hidden` Hidden attributes set (budget, skepticism, workaround, switching barriers, secret) | 1 |  | §7.3 |

Each criterion is scored `pass | partial | fail` with a reason (K.2); score = weighted share of pass, partial = 0.5 (Gedächtnis §9.1).
