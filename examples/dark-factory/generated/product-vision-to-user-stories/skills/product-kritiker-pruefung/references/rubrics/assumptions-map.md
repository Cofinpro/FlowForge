---
id: assumptions-map
version: 1
threshold: 0.8
criteria:
  - {id: dfv, text: Every assumption rated for Desirability/Feasibility/Viability, weight: 1, source: Gedächtnis §13}
  - {id: importance-evidence, text: Every assumption placed on Importance × Evidence, weight: 1, source: Gedächtnis §13}
  - {id: kill-marked, text: 'Kill assumptions (high importance, low evidence) marked', weight: 2, source: Gedächtnis §13}
  - {id: brief-asm, text: All 🧠 fields of the idea brief present as ASM items, weight: 1, source: §14}
bpmn:
  file: product-vision-to-user-stories.bpmn
  elements: [S1.1.6, K_1]
---
# Rubric `assumptions-map`

Seed rubric (Gedächtnis §13 core criteria + adopted notebook criteria, 2026-09-25). Loaded by `scripts/load-rubric.mjs`; the full extraction from the notebook with calibration examples is still open (docs/dark-factory/roadmap.md §2).

| Criterion | Weight | Kill | Source |
|---|---|---|---|
| `dfv` Every assumption rated for Desirability/Feasibility/Viability | 1 |  | Gedächtnis §13 |
| `importance-evidence` Every assumption placed on Importance × Evidence | 1 |  | Gedächtnis §13 |
| `kill-marked` Kill assumptions (high importance, low evidence) marked | 2 |  | Gedächtnis §13 |
| `brief-asm` All 🧠 fields of the idea brief present as ASM items | 1 |  | §14 |

Each criterion is scored `pass | partial | fail` with a reason (K.2); score = weighted share of pass, partial = 0.5 (Gedächtnis §9.1).
