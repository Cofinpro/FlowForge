---
id: gate-vision
version: 1
threshold: 0.8
gateQuestion: Vision & Geschaeftsziele tragfaehig?
includes:
  - phase-1-1
  - phase-1-2
criteria:
  - {id: coherent, text: 'Vision, business model and impact map tell one coherent story', weight: 2, source: §9.2}
  - {id: no-refuted-kill, text: No kill assumption actively refuted by 🔗 evidence, weight: 2, kill: true, source: §9.3}
bpmn:
  file: product-vision-to-user-stories.bpmn
  elements: [Call_PG1, K_1]
---
# Rubric `gate-vision`

Seed rubric (Gedächtnis §13 core criteria + adopted notebook criteria, 2026-09-25). Loaded by `scripts/load-rubric.mjs`; the full extraction from the notebook with calibration examples is still open (docs/dark-factory/roadmap.md §2).

**Gate question:** "Vision & Geschaeftsziele tragfaehig?"

**Includes:** `phase-1-1`, `phase-1-2`

**Panel rule:** Proto panel vote: ≥2 of 3 personas ≥3/5.

| Criterion | Weight | Kill | Source |
|---|---|---|---|
| `coherent` Vision, business model and impact map tell one coherent story | 2 |  | §9.2 |
| `no-refuted-kill` No kill assumption actively refuted by 🔗 evidence | 2 | yes | §9.3 |

Each criterion is scored `pass | partial | fail` with a reason (K.2); score = weighted share of pass, partial = 0.5 (Gedächtnis §9.1).
