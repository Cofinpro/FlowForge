---
id: idea-brief
version: 1
threshold: 0.8
criteria:
  - {id: required, text: 'All required fields (idee, markt/region, ausgabesprache, budget/timebox, zielarchitektur/plattform) are filled', weight: 2, kill: true, source: Gedächtnis §13 / §14}
  - {id: inferred-marked, text: Every derived field is marked 🧠 with a one-line justification, weight: 1, source: Gedächtnis §13}
  - {id: budget-architecture, text: Budget/timebox and target architecture are present and plausible, weight: 1, source: Gedächtnis §13}
  - {id: asm-handoff, text: Every 🧠 field is listed for conversion into an ASM item in 1.1.6, weight: 1, source: §14}
bpmn:
  file: product-vision-to-user-stories.bpmn
  elements: [S0, K_1]
---
# Rubric `idea-brief`

Seed rubric (Gedächtnis §13 core criteria + adopted notebook criteria, 2026-09-25). Loaded by `scripts/load-rubric.mjs`; the full extraction from the notebook with calibration examples is still open (docs/dark-factory/roadmap.md §2).

| Criterion | Weight | Kill | Source |
|---|---|---|---|
| `required` All required fields (idee, markt/region, ausgabesprache, budget/timebox, zielarchitektur/plattform) are filled | 2 | yes | Gedächtnis §13 / §14 |
| `inferred-marked` Every derived field is marked 🧠 with a one-line justification | 1 |  | Gedächtnis §13 |
| `budget-architecture` Budget/timebox and target architecture are present and plausible | 1 |  | Gedächtnis §13 |
| `asm-handoff` Every 🧠 field is listed for conversion into an ASM item in 1.1.6 | 1 |  | §14 |

Each criterion is scored `pass | partial | fail` with a reason (K.2); score = weighted share of pass, partial = 0.5 (Gedächtnis §9.1).
