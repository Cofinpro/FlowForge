---
id: persona
version: 1
threshold: 0.8
criteria:
  - {id: role-title, text: Concrete role title (no generic "user"), weight: 1, source: Gedächtnis §13}
  - {id: jtbd, text: 1–3 JTBD, weight: 1, source: Gedächtnis §13}
  - {id: pains-gains, text: Top-2 pains and top-2 gains, weight: 1, source: Gedächtnis §13}
  - {id: trigger, text: Trigger situation, weight: 1, source: Gedächtnis §13}
  - {id: evidence, text: Evidence from T/SRC, weight: 2, source: Gedächtnis §13}
bpmn:
  file: product-vision-to-user-stories.bpmn
  elements: [S2.1.5, K_1]
---
# Rubric `persona`

Seed rubric (Gedächtnis §13 core criteria + adopted notebook criteria, 2026-09-25). Loaded by `scripts/load-rubric.mjs`; the full extraction from the notebook with calibration examples is still open (docs/dark-factory/roadmap.md §2).

| Criterion | Weight | Kill | Source |
|---|---|---|---|
| `role-title` Concrete role title (no generic "user") | 1 |  | Gedächtnis §13 |
| `jtbd` 1–3 JTBD | 1 |  | Gedächtnis §13 |
| `pains-gains` Top-2 pains and top-2 gains | 1 |  | Gedächtnis §13 |
| `trigger` Trigger situation | 1 |  | Gedächtnis §13 |
| `evidence` Evidence from T/SRC | 2 |  | Gedächtnis §13 |

Each criterion is scored `pass | partial | fail` with a reason (K.2); score = weighted share of pass, partial = 0.5 (Gedächtnis §9.1).
