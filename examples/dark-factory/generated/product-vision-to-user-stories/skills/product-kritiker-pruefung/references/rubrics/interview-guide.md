---
id: interview-guide
version: 1
threshold: 0.8
criteria:
  - {id: past-behaviour, text: Questions about past behaviour only, weight: 2, source: Gedächtnis §13}
  - {id: no-leading, text: No leading questions, weight: 1, source: Gedächtnis §13}
  - {id: solution-late, text: Solution shown only in the last third, weight: 1, source: Gedächtnis §13}
  - {id: kill-coverage, text: Covers the kill assumptions, weight: 1, source: Gedächtnis §13}
  - {id: problem-ranking, text: 'Contains the problem-ranking block (top-3 problems, shuffled per persona)', weight: 1, source: Testing Business Ideas / Lean Analytics (adopted 2026-09-25)}
bpmn:
  file: product-vision-to-user-stories.bpmn
  elements: [S2.1.2, K_1]
---
# Rubric `interview-guide`

Seed rubric (Gedächtnis §13 core criteria + adopted notebook criteria, 2026-09-25). Loaded by `scripts/load-rubric.mjs`; the full extraction from the notebook with calibration examples is still open (docs/dark-factory/roadmap.md §2).

| Criterion | Weight | Kill | Source |
|---|---|---|---|
| `past-behaviour` Questions about past behaviour only | 2 |  | Gedächtnis §13 |
| `no-leading` No leading questions | 1 |  | Gedächtnis §13 |
| `solution-late` Solution shown only in the last third | 1 |  | Gedächtnis §13 |
| `kill-coverage` Covers the kill assumptions | 1 |  | Gedächtnis §13 |
| `problem-ranking` Contains the problem-ranking block (top-3 problems, shuffled per persona) | 1 |  | Testing Business Ideas / Lean Analytics (adopted 2026-09-25) |

Each criterion is scored `pass | partial | fail` with a reason (K.2); score = weighted share of pass, partial = 0.5 (Gedächtnis §9.1).
