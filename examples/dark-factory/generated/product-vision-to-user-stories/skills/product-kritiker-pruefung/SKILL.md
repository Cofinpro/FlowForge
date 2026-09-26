---
name: product-kritiker-pruefung
description: Runs the dark factory's reusable critic process K ("Kritiker-Pruefung") — load the rubric, judge the artifacts criterion by criterion, factcheck disputed claims, form the verdict with the loop cap and write the gate record. Use for every "Kritiker-Pruefung aufrufen (<rubric>)" call of the product-vision-to-user-stories workflow and for the critic half of a phase-gate review.
bpmn:
  file: product-vision-to-user-stories.bpmn
  elements: [SP1.1_CallK, SP1.2_CallK, SP2.1_CallK, SP2.2_CallK, SP3.1_CallK, SP4.1_CallK, SP4.2_CallK, SP5.1_CallK, SP5.2_CallK, SP6.1_CallK, SP6.2_CallK, PG_Call_K, K_Start, K_1, K_2, K_Gw1, K_3, K_Merge, K_4, K_5, K_End]
---

# Kritiker-Pruefung (process K)

Generated from `product-vision-to-user-stories.bpmn`'s reusable process `Process_K`. Every inner gate
of the process calls it (`SP*_CallK`), and so does the phase-gate review (`PG_Call_K`). Executed by
`product-kritiker`. **You judge, you never rewrite.** The product-critic-readonly-guard hook blocks your writes
to artifacts. Your output is the verdict, the gate record and concrete change requests
(Gedächtnis §2.2, §9.1).

## Inputs from the Workflow

`runDir`, `gateway` (e.g. `SP1.1_Gw`), `rubric` (e.g. `phase-1-1`), `threshold` (0.8), `maxLoops`
(3), `iteration`, and `artifacts` (the paths to judge). For a phase-gate call, `mode: phase-gate`.

## Procedure

1. **"Rubric laden" (K.1)** is deterministic:
   ```bash
   node ${CLAUDE_PLUGIN_ROOT}/skills/product-kritiker-pruefung/scripts/load-rubric.mjs <rubric> <artifact.md> [...]
   ```
   It resolves `references/rubrics/<rubric>.md` including every `includes:` rubric, and it checks
   that each artifact is committed: a valid `<file>.meta.json` sidecar whose body hash matches the
   Markdown (Gedächtnis §11.2). An uncommitted or changed-after-commit artifact counts as a `fail` on
   a synthetic criterion `contract.<artifact-id>`. Read evidence mix, items and item lineage from the
   sidecar (`derived`, `authored.itemIndex`), never from the rendered frontmatter.
2. **"Artefakt gegen Rubric bewerten" (K.2)**: for every criterion, return `pass | partial | fail`
   with a one-to-two sentence reason that points to the artifact section or item id. Recompute every
   disclosed scoring (Gedächtnis §2.5) and don't just trust it. Mark claims you doubt as
   **disputed**. For the `invest` rubric, also classify each story as
   `fits | too-big | too-uncertain`.
3. **"Claims strittig?"**: if there are disputed claims, do **"Strittige Claims faktenchecken"
   (K.3)** with skill `product-recherche`, modes `websearch` → `normalize` → `synthesize`
   (callId `K-<gateway>-<iteration>`). Record each factcheck as `confirmed | refuted | unclear`
   with its SRC id. Otherwise skip to step 4.
4. **"Verdikt bilden & Loop-Cap anwenden" (K.4)** is deterministic. Write
   `gates/.work/<gateway>_iter<k>_evaluation.json`
   (`{threshold, iteration, maxLoops, criteria, factchecks}`) and run:
   ```bash
   node ${CLAUDE_PLUGIN_ROOT}/skills/product-kritiker-pruefung/scripts/verdict.mjs <evaluation.json>
   ```
   Score = weighted pass share, where partial counts 0.5. A refuted claim fails its criterion.
   Below the threshold the verdict is `fail` while `iteration < maxLoops`, and `pass-with-risk` at
   the cap, with the open criteria inherited as risk flags.
5. On `fail`, write **concrete change requests**, one per failed or partial criterion, each naming
   the artifact and the exact fix. Change nothing yourself.
6. **"Gate-Record schreiben" (K.5)** is deterministic. Write
   `gates/.work/<gateway>_iter<k>_record.json` and run:
   ```bash
   node ${CLAUDE_PLUGIN_ROOT}/skills/product-kritiker-pruefung/scripts/write-gate-record.mjs <runDir> <record.json>
   ```
   This writes `gates/G-<nnn>_<gateway>_iter<k>.meta.json` (the record, Gedächtnis §12) and the
   rendered `.md`. It is the only writer that stamps `status`/`gate` into the judged artifacts'
   sidecars (and re-renders their read-only frontmatter), and it adds `same-model-review` while critic
   and producer share a model family (§5).

## Return (the Workflow routes on this; the gateway itself only reads the verdict)

```json
{"verdict": "pass|fail|pass-with-risk", "score": 0.0, "gateRecord": "G-014", "iteration": 1,
 "classification": "fits|too-big|too-uncertain|null", "changeRequests": ["..."],
 "riskFlags": ["..."], "killCriteriaFailed": ["..."], "summary": "..."}
```

## References

- `references/rubrics/*.md` holds 41 seed rubrics (Gedächtnis §13 core criteria plus the notebook
  criteria adopted on 2026-09-25). The full notebook extraction with calibration examples is still
  open (docs/dark-factory/roadmap.md §2).
- Gate rules: `${CLAUDE_PLUGIN_ROOT}/knowledge/process-rules.md` §9.1 and §12.
