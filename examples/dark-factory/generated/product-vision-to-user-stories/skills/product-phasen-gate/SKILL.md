---
name: product-phasen-gate
description: >-
  Runs the dark factory's phase-gate review PG ("Phasen-Gate-Review") for G-P1 Vision, G-P2 Validierung and G-P3 MVP — critic check and panel vote in parallel, then "Verdikt aggregieren" into pass / fail (Nachschaerfen) / pivot / more-research / no-go with a gate record. Use when the product-vision-to-user-stories workflow reaches "Phasen-Gate-Review: Vision|Validierung|MVP".
bpmn:
  file: product-vision-to-user-stories.bpmn
  elements: [Call_PG1, Call_PG2, Call_PG3, PG_Start, PG_Split, PG_Call_K, PG_Call_P, PG_Join, PG_1, PG_End]
---

# Phasen-Gate-Review (process PG)

Generated from `product-vision-to-user-stories.bpmn`'s reusable process `Process_PG`. The Workflow
script runs the parallel part itself:
- PG_Split → "Kritiker-Pruefung aufrufen" (`product-kritiker-pruefung`, rubric `gate-vision` /
  `gate-validierung` / `gate-mvp`)
- ‖ "Panel befragen (vote)" (`product-panel-befragung`, mode `vote`; proto panel for G-P1, full panel
  for G-P2/G-P3)
- → PG_Join

It then calls this skill for **"Verdikt aggregieren" (PG.1)** with `product-kritiker`.

## "Verdikt aggregieren" (PG.1)

Inputs: `gate` (`G-P1|G-P2|G-P3`), the critic result, the panel result, `iteration`, `pivotCount`.

1. Judge the parts that need judgement, as briefly and evidence-based as possible:
   - `objectionsAddressed`: every Contrarian/Verweigerer objection has an answer in the artifacts
     or a risk flag.
   - `killAssumptionRefuted`: a kill assumption from `assumptions-map` is actively refuted by 🔗
     evidence.
   - `viabilityFailed` (G-P2): desirability is fine but the business model does not hold up.
   - `citedShare` (G-P2): the share of 🔗 in `personas` and `jtbd`, taken from their sidecars
     (`<file>.meta.json` → `derived.evidence.cited`).
   - `problemRankingKill` (G-P2): copied from the interview synthesis of 2.1.4.
2. Apply the counting rules deterministically. Write `gates/.work/<gate>_iter<k>_aggregate.json`
   and run:
   ```bash
   node ${CLAUDE_PLUGIN_ROOT}/skills/product-phasen-gate/scripts/aggregate-gate.mjs <input.json>
   ```
   The rules come from Gedächtnis §9.2/§9.3:
   - Proto panel ≥2/3 votes ≥3; G-P2 ≥3/4 target users ≥4 and objections addressed; G-P3 ≥3/4
     would use and ≥2/4 would pay.
   - Contrarian and Verweigerer never count.
   - No-go on a refuted kill assumption or when the pivot cap is reached.
   - Pivot only while pivotCount < 2.
   - More research when the cited share is below 50% or the vote spread is ≥2.
3. Write the gate record with `product-kritiker-pruefung/scripts/write-gate-record.mjs`, including
   `panelVotes`, `objections`, `pivotCount` (G-P2) and `pathTaken`:
   - G-P1: Ja → Merge_Research | Nachschaerfen → Merge_P1 | No-Go → Merge_NoGo
   - G-P2: Ja → Merge_Mapping | Mehr Research → Merge_Research | Pivot → Merge_P1 | No-Go
   - G-P3: Ja → Merge_Refinement | Nachschaerfen → Merge_Mapping

## Return

```json
{"verdict": "pass|fail|pivot|more-research|no-go", "gateRecord": "G-0nn", "reasons": ["..."],
 "changeRequests": ["..."], "riskFlags": ["..."], "summary": "..."}
```
