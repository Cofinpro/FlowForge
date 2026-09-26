---
id: transcript
version: 1
threshold: 0.8
criteria:
  - {id: complete, text: Complete for every persona of the panel set, weight: 1, source: Gedächtnis §13}
  - {id: in-role, text: Persona stayed in role, weight: 1, source: Gedächtnis §13}
  - {id: dont-know, text: '"Weiß nicht" / "ist mir egal" not reinterpreted', weight: 1, source: Gedächtnis §13}
  - {id: ranking-synthesis, text: Problem-ranking result per persona recorded; kill signal stated if core problem not in top 3, weight: 1, source: adopted 2026-09-25}
bpmn:
  file: product-vision-to-user-stories.bpmn
  elements: [S2.1.4, K_1]
---
# Rubric `transcript`

Seed rubric (Gedächtnis §13 core criteria + adopted notebook criteria, 2026-09-25). Loaded by `scripts/load-rubric.mjs`; the full extraction from the notebook with calibration examples is still open (docs/dark-factory/roadmap.md §2).

| Criterion | Weight | Kill | Source |
|---|---|---|---|
| `complete` Complete for every persona of the panel set | 1 |  | Gedächtnis §13 |
| `in-role` Persona stayed in role | 1 |  | Gedächtnis §13 |
| `dont-know` "Weiß nicht" / "ist mir egal" not reinterpreted | 1 |  | Gedächtnis §13 |
| `ranking-synthesis` Problem-ranking result per persona recorded; kill signal stated if core problem not in top 3 | 1 |  | adopted 2026-09-25 |

Each criterion is scored `pass | partial | fail` with a reason (K.2); score = weighted share of pass, partial = 0.5 (Gedächtnis §9.1).
