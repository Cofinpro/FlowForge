---
id: traceability
version: 1
threshold: 0.8
gateQuestion: Konsistent, rueckverfolgbar & DoR erfuellt?
includes:
  - ubiquitous-language
  - backlog-hygiene
criteria:
  - {id: chain, text: Required chain complete for every story, weight: 2, kill: true, source: Gedächtnis §13}
  - {id: matrix, text: Matrix complete, weight: 1, source: Gedächtnis §13}
bpmn:
  file: product-vision-to-user-stories.bpmn
  elements: [S6.2.1, S6.2.2, S6.2.5, SP6.2_CallK, K_1]
---
# Rubric `traceability`

Seed rubric (Gedächtnis §13 core criteria + adopted notebook criteria, 2026-09-25). Loaded by `scripts/load-rubric.mjs`; the full extraction from the notebook with calibration examples is still open (docs/dark-factory/roadmap.md §2).

**Gate question:** "Konsistent, rueckverfolgbar & DoR erfuellt?"

**Includes:** `ubiquitous-language`, `backlog-hygiene`

| Criterion | Weight | Kill | Source |
|---|---|---|---|
| `chain` Required chain complete for every story | 2 | yes | Gedächtnis §13 |
| `matrix` Matrix complete | 1 |  | Gedächtnis §13 |

Each criterion is scored `pass | partial | fail` with a reason (K.2); score = weighted share of pass, partial = 0.5 (Gedächtnis §9.1).
