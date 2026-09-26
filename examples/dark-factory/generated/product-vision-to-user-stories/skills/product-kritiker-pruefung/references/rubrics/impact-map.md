---
id: impact-map
version: 1
threshold: 0.8
criteria:
  - {id: hierarchy, text: Strict hierarchy Goal → Actor → Impact → Deliverable, weight: 2, source: Gedächtnis §13 (Adzic)}
  - {id: measurable-impacts, text: Impacts are measurable behaviour changes, weight: 1, source: Gedächtnis §13}
  - {id: options, text: 'Deliverables are options, not commitments', weight: 1, source: Gedächtnis §13}
  - {id: omtm, text: Goal defines exactly one OMTM placed on the AARRR funnel, weight: 1, source: Lean Analytics (adopted 2026-09-25)}
bpmn:
  file: product-vision-to-user-stories.bpmn
  elements: [S1.2.1, S1.2.2, S1.2.3, S1.2.4, K_1]
---
# Rubric `impact-map`

Seed rubric (Gedächtnis §13 core criteria + adopted notebook criteria, 2026-09-25). Loaded by `scripts/load-rubric.mjs`; the full extraction from the notebook with calibration examples is still open (docs/dark-factory/roadmap.md §2).

| Criterion | Weight | Kill | Source |
|---|---|---|---|
| `hierarchy` Strict hierarchy Goal → Actor → Impact → Deliverable | 2 |  | Gedächtnis §13 (Adzic) |
| `measurable-impacts` Impacts are measurable behaviour changes | 1 |  | Gedächtnis §13 |
| `options` Deliverables are options, not commitments | 1 |  | Gedächtnis §13 |
| `omtm` Goal defines exactly one OMTM placed on the AARRR funnel | 1 |  | Lean Analytics (adopted 2026-09-25) |

Each criterion is scored `pass | partial | fail` with a reason (K.2); score = weighted share of pass, partial = 0.5 (Gedächtnis §9.1).
