---
id: pov-hmw
version: 1
threshold: 0.8
criteria:
  - {id: neutral, text: Solution-neutral, weight: 2, source: Gedächtnis §13}
  - {id: focused, text: Focused on one persona / one need, weight: 1, source: Gedächtnis §13}
  - {id: verb-need, text: 'Needs expressed as verbs, not nouns', weight: 1, source: Design Thinking Toolbox}
bpmn:
  file: product-vision-to-user-stories.bpmn
  elements: [S2.2.1, S2.2.2, S2.2.3, K_1]
---
# Rubric `pov-hmw`

Seed rubric (Gedächtnis §13 core criteria + adopted notebook criteria, 2026-09-25). Loaded by `scripts/load-rubric.mjs`; the full extraction from the notebook with calibration examples is still open (docs/dark-factory/roadmap.md §2).

| Criterion | Weight | Kill | Source |
|---|---|---|---|
| `neutral` Solution-neutral | 2 |  | Gedächtnis §13 |
| `focused` Focused on one persona / one need | 1 |  | Gedächtnis §13 |
| `verb-need` Needs expressed as verbs, not nouns | 1 |  | Design Thinking Toolbox |

Each criterion is scored `pass | partial | fail` with a reason (K.2); score = weighted share of pass, partial = 0.5 (Gedächtnis §9.1).
