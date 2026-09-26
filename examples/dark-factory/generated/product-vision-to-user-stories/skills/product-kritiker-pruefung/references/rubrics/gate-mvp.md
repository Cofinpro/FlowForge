---
id: gate-mvp
version: 1
threshold: 0.8
gateQuestion: MVP tragfaehig & machbar?
includes:
  - phase-4-1
  - phase-4-2
criteria:
  - {id: feasible, text: MVP feasible for the target architecture and within budget/timebox, weight: 2, kill: true, source: §9.2}
  - {id: valuable, text: MVP delivers the core outcome for the target personas, weight: 2, source: §9.2}
bpmn:
  file: product-vision-to-user-stories.bpmn
  elements: [Call_PG3, K_1]
---
# Rubric `gate-mvp`

Seed rubric (Gedächtnis §13 core criteria + adopted notebook criteria, 2026-09-25). Loaded by `scripts/load-rubric.mjs`; the full extraction from the notebook with calibration examples is still open (docs/dark-factory/roadmap.md §2).

**Gate question:** "MVP tragfaehig & machbar?"

**Includes:** `phase-4-1`, `phase-4-2`

**Panel rule:** Full panel: ≥3 of 4 target personas "würde nutzen" ≥4/5 and ≥2 of 4 willing to pay at the lean-canvas price.

| Criterion | Weight | Kill | Source |
|---|---|---|---|
| `feasible` MVP feasible for the target architecture and within budget/timebox | 2 | yes | §9.2 |
| `valuable` MVP delivers the core outcome for the target personas | 2 |  | §9.2 |

Each criterion is scored `pass | partial | fail` with a reason (K.2); score = weighted share of pass, partial = 0.5 (Gedächtnis §9.1).
