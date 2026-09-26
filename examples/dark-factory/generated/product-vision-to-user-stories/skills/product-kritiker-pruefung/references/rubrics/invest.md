---
id: invest
version: 1
threshold: 0.8
criteria:
  - {id: connextra, text: Connextra format with a concrete role, weight: 1, source: Gedächtnis §13}
  - {id: independent, text: Independent, weight: 1, source: 'Gedächtnis §13 (Wake, Cohn)'}
  - {id: negotiable, text: Negotiable, weight: 1, source: Gedächtnis §13}
  - {id: valuable, text: 'Valuable: "damit" is a user/business outcome', weight: 2, source: Gedächtnis §13}
  - {id: estimable, text: Estimable, weight: 1, source: Gedächtnis §13}
  - {id: small, text: Small (≤ M), weight: 1, source: Gedächtnis §13}
  - {id: testable, text: Testable, weight: 1, source: Gedächtnis §13}
bpmn:
  file: product-vision-to-user-stories.bpmn
  elements: [S5.1.1, S5.1.3, SP5.1_CallK, K_1]
---
# Rubric `invest`

Seed rubric (Gedächtnis §13 core criteria + adopted notebook criteria, 2026-09-25). Loaded by `scripts/load-rubric.mjs`; the full extraction from the notebook with calibration examples is still open (docs/dark-factory/roadmap.md §2).

**Routing:** Also classify the story: fits | too-big (-> splitting) | too-uncertain (-> spike).

| Criterion | Weight | Kill | Source |
|---|---|---|---|
| `connextra` Connextra format with a concrete role | 1 |  | Gedächtnis §13 |
| `independent` Independent | 1 |  | Gedächtnis §13 (Wake, Cohn) |
| `negotiable` Negotiable | 1 |  | Gedächtnis §13 |
| `valuable` Valuable: "damit" is a user/business outcome | 2 |  | Gedächtnis §13 |
| `estimable` Estimable | 1 |  | Gedächtnis §13 |
| `small` Small (≤ M) | 1 |  | Gedächtnis §13 |
| `testable` Testable | 1 |  | Gedächtnis §13 |

Each criterion is scored `pass | partial | fail` with a reason (K.2); score = weighted share of pass, partial = 0.5 (Gedächtnis §9.1).
