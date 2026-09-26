---
id: gate-validierung
version: 1
threshold: 0.8
gateQuestion: Problem & Nutzerreise validiert?
includes:
  - phase-2-1
  - phase-2-2
  - phase-3-1
criteria:
  - {id: problem-validated, text: Problem validated by transcripts and sources, weight: 2, source: §9.2}
  - {id: cited-share, text: Evidence mix of personas/jtbd ≥50% 🔗, weight: 1, source: §9.3}
  - {id: objections, text: Every Contrarian/Verweigerer objection addressed (answer or risk flag), weight: 1, source: §9.2}
  - {id: viability, text: 'Business model/solution viable (else pivot, max 2)', weight: 2, source: §9.3}
bpmn:
  file: product-vision-to-user-stories.bpmn
  elements: [Call_PG2, K_1]
---
# Rubric `gate-validierung`

Seed rubric (Gedächtnis §13 core criteria + adopted notebook criteria, 2026-09-25). Loaded by `scripts/load-rubric.mjs`; the full extraction from the notebook with calibration examples is still open (docs/dark-factory/roadmap.md §2).

**Gate question:** "Problem & Nutzerreise validiert?"

**Includes:** `phase-2-1`, `phase-2-2`, `phase-3-1`

**Panel rule:** Full panel: ≥3 of 4 target personas desirability ≥4/5; Contrarian/Verweigerer votes do not count.

| Criterion | Weight | Kill | Source |
|---|---|---|---|
| `problem-validated` Problem validated by transcripts and sources | 2 |  | §9.2 |
| `cited-share` Evidence mix of personas/jtbd ≥50% 🔗 | 1 |  | §9.3 |
| `objections` Every Contrarian/Verweigerer objection addressed (answer or risk flag) | 1 |  | §9.2 |
| `viability` Business model/solution viable (else pivot, max 2) | 2 |  | §9.3 |

Each criterion is scored `pass | partial | fail` with a reason (K.2); score = weighted share of pass, partial = 0.5 (Gedächtnis §9.1).
