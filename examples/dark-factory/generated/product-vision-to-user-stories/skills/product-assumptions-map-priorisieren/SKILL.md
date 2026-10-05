---
name: product-assumptions-map-priorisieren
description: >-
  Extracts and prioritizes the assumptions-map artifact: ASM items from the brief, canvases and VPC, classified by Desirability/Feasibility/Viability and plotted Importance × Evidence with kill
  assumptions marked. Use when the dark-factory workflow reaches step S1.1.6 "Annahmen in Assumptions Map priorisieren".
bpmn:
  file: product-vision-to-user-stories.bpmn
  elements: [S1.1.6]
---

# Annahmen in Assumptions Map priorisieren (step 1.1.6)

Generated from `product-vision-to-user-stories.bpmn`'s "Annahmen in Assumptions Map priorisieren" (serviceTask, lane "Stratege") by `flowforge-generate`. The ASM items are the risk register of the run: S1.2.5 uses them as the risk input of the impact scoring, G-P1/G-P2 check kill assumptions for No-Go, the interview guide in Phase 2 must cover them, and every story later lists the unvalidated ASM it rests on. It is its own skill because it produces an independently versioned artifact with its own contract (body + sidecar), template and rubric (mapping-rubric.md's serviceTask rule; one skill per business step, docs/dark-factory/implementation.md §2).

Executed by the `product-stratege` agent. Binding rules: `${CLAUDE_PLUGIN_ROOT}/knowledge/process-rules.md` — evidence §6, item IDs §10, artifact contract §11.2, iterations §15.

## Run context

The Workflow passes `runDir`, `runId`, `iteration` and `changeRequests` (from the last gate record of this phase).

| Input | Required | Path pattern |
|---|---|---|
| `value-proposition-canvas` | yes | `runs/{runId}/artifacts/p1-strategie/1.1.5_value-proposition-canvas.md` |
| `lean-canvas` | yes | `runs/{runId}/artifacts/p1-strategie/1.1.3_lean-canvas.md` |

| Output | Item prefix | Cardinality | Path pattern |
|---|---|---|---|
| `assumptions-map` | ASM | many | `runs/{runId}/artifacts/p1-strategie/1.1.6_assumptions-map.md` |


## Procedure

0. **Resume / iterate.** Read the output's sidecar (`<file>.meta.json`) if it exists. If it has `status: passed`/`passed-with-risk`, or `iteration > 1` and no change request concerns this artifact or an upstream artifact it consumes, return it unchanged (idempotent resume). Otherwise work every change request into the body and keep item IDs stable when the item is materially the same. Do not copy files to `history/` or touch `version` — `commit-artifact.mjs` does both (Gedächtnis §15).
1. Read value-proposition-canvas and lean-canvas; also read the idea-brief section "Inferred fields → ASM" and the "Assumptions for 1.1.6"/"Offene Annahmen"/"Fit-Lücken" lists of zielbild, lean-canvas and VPC.
2. Create one ASM-<nnn> for every 🧠 field of the idea brief (mandatory, Gedächtnis §14), then one for every 🧠 canvas cell and every VPC fit gap; merge duplicates and never reuse an ID.
3. Phrase each assumption as a falsifiable statement ("We believe <segment> will <behaviour/pay/…> because …").
4. Classify each ASM into exactly one risk domain: Desirability, Feasibility or Viability; make sure all three domains are considered.
5. Rate Importance (1–5: how badly the business model breaks if false) and Evidence (1–5: 1 = pure 🧠 inference, 3 = 🤖 panel, 5 = strong 🔗 sources); state the reason for both values.
6. Mark kill assumptions: Importance ≥ 4 and Evidence ≤ 2 (kill zone). Record for each the evidence that would refute it.
7. Record each ASM in `itemIndex` with `derivedFrom` (brief field, canvas cell, VPC link or P-/SRC ids) and its evidence level; sort the map by Importance desc, then Evidence asc.
8. Write the output **body** from `assets/template.md`: Markdown only, no frontmatter (the product-artifact-contract-guard hook rejects a Write that starts with `---`); one file per instance, following the path pattern.
9. Run the self-check below and fix what fails. Never set `passed` yourself — only the critic gate does (Gedächtnis §2.2).
10. **Commit** every output file with its authored block (see "Artifact contract" below): `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/commit-artifact.mjs commit <runDir> <file.md> --step S1.1.6 <<'JSON'` … `JSON`. The script computes id, version, status, derivedFrom, evidence mix and history; fix every rejection it prints and commit again. Re-committing an unchanged file is a no-op.
11. Log: `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/run-state.mjs event <runDir> '{"event":"step-done","element":"S1.1.6"}'`.

## Artifact contract (Gedächtnis §11.2)

Every output is two files: `<file>.md` (the body you write; its frontmatter is rendered read-only from the sidecar) and `<file>.meta.json` (the sidecar, written only by `commit-artifact.mjs`). Read upstream metadata from sidecars, never from rendered frontmatter.

**You supply** the authored block on stdin (`node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/commit-artifact.mjs schema` prints its JSON Schema):

```json
{
  "itemIndex": [
    {
      "id": "ASM-001",
      "derivedFrom": [
        "<parent item id>"
      ],
      "evidence": "cited|inferred|synthetic",
      "refs": [
        "SRC-0001"
      ]
    }
  ],
  "sources": [
    "SRC-0001"
  ],
  "riskFlags": [],
  "openQuestions": [],
  "notesForNext": "<one or two sentences for the next step>"
}
```

- `authored.itemIndex` (required) — Per item: {id, derivedFrom[], evidence, refs[], title?, status?} — read by the traceability scripts (6.2.1/6.2.2/6.2.5)
- `authored.sources` — SRC-/T-/P- ids used in the body; every SRC must exist in research/sources/
- `authored.riskFlags` — e.g. missing-input, assumption-heavy
- `authored.attributes` — Type-specific structured fields (e.g. epic {title, actv, tasks, goal, slice})
- `authored.openQuestions` — Questions the step could not resolve
- `authored.notesForNext` — Short handoff note for the consuming step(s)

**Computed by the script** — never write these yourself: `schema`, `id`, `type`, `bpmnElement`, `runId`, `version`, `status`, `producedBy`, `derivedFrom`, `body`, `derived`, `gate`, `riskFlags`, `history`.

## Self-check (rubric `assumptions-map` — judged by `product-kritiker-pruefung`)

- [ ] Rubric assumptions-map: every assumption is rated by Desirability/Feasibility/Viability and by Importance × Evidence.
- [ ] Rubric assumptions-map: kill assumptions (high importance, low evidence) are explicitly marked.
- [ ] Every 🧠 field of the idea brief appears as its own ASM item (§14).
- [ ] Every ASM has derivedFrom, an evidence level and a written reason for both ratings.
- [ ] All three risk domains are considered; the map is not only feasibility.
- [ ] Each assumption is a falsifiable statement, not a topic ("pricing").

## Pitfalls

- Testing only technical feasibility and ignoring desirability and viability risk.
- Giving every assumption Importance 5, which destroys the prioritization.
- Rating panel agreement as strong evidence: synthetic 🤖 evidence stays mid-scale at best.

## Return

Reply with JSON only: `{"status": "done|blocked|partial", "artifacts": ["<committed .md paths>"], "items": ["<item ids created or changed>"], "riskFlags": [], "summary": "<one sentence>"}`.

## Domain knowledge

See `references/domain-knowledge.md` (cited from notebook "The Product - Business Design"; phase brief `knowledge/phase-1-strategie.md`).
