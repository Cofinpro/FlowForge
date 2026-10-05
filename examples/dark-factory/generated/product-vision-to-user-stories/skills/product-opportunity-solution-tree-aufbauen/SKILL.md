---
name: product-opportunity-solution-tree-aufbauen
description: >-
  Produces the opportunity-solution-tree: desired outcome from business-goals → OPP items (customer needs from HMW) → several competing solutions each → experiments, fully traced to GOAL and JOB. Use
  when the dark-factory workflow reaches step S2.2.4 "Opportunity-Solution-Tree aufbauen".
bpmn:
  file: product-vision-to-user-stories.bpmn
  elements: [S2.2.4]
---

# Opportunity-Solution-Tree aufbauen (step 2.2.4)

Generated from `product-vision-to-user-stories.bpmn`'s "Opportunity-Solution-Tree aufbauen" (serviceTask, lane "Stratege") by `flowforge-generate`. Its OPP items are scored and ranked in S2.2.5; OPP is a link in the mandatory trace chain toward IMP → GOAL. It is its own skill because it produces an independently versioned artifact with its own contract (body + sidecar), template and rubric (mapping-rubric.md's serviceTask rule; one skill per business step, docs/dark-factory/implementation.md §2).

Executed by the `product-stratege` agent. Binding rules: `${CLAUDE_PLUGIN_ROOT}/knowledge/process-rules.md` — evidence §6, item IDs §10, artifact contract §11.2, iterations §15.

## Run context

The Workflow passes `runDir`, `runId`, `iteration` and `changeRequests` (from the last gate record of this phase).

| Input | Required | Path pattern |
|---|---|---|
| `pov-hmw` | yes | `runs/{runId}/artifacts/p2-research/2.2.3_pov-hmw.md` |
| `business-goals` | yes | `runs/{runId}/artifacts/p1-strategie/1.2.1_business-goals.md` |

| Output | Item prefix | Cardinality | Path pattern |
|---|---|---|---|
| `opportunity-solution-tree` | OPP | one | `runs/{runId}/artifacts/p2-research/2.2.4_opportunity-solution-tree.md` |


## Procedure

0. **Resume / iterate.** Read the output's sidecar (`<file>.meta.json`) if it exists. If it has `status: passed`/`passed-with-risk`, or `iteration > 1` and no change request concerns this artifact or an upstream artifact it consumes, return it unchanged (idempotent resume). Otherwise work every change request into the body and keep item IDs stable when the item is materially the same. Do not copy files to `history/` or touch `version` — `commit-artifact.mjs` does both (Gedächtnis §15).
1. Read business-goals: take the One Metric That Matters (its GOAL id and AARRR stage) as the tree's desired outcome root; secondary GOALs may become separate roots only if HMWs clearly serve them.
2. Read pov-hmw: group HMW items by the underlying need; each group becomes one OPP-<nnn> phrased from the customer's view (a need, pain or desire, not a feature), nested as parent/child where one opportunity is a sub-need of another.
3. Attach 2–4 competing solution ideas under each leaf OPP (never directly under the outcome), each a short description with the HMW it answers.
4. Attach 1–2 experiments per solution that could test its riskiest assumption (what to test, signal, the ASM id if one applies).
5. Trace each OPP: derivedFrom = HMW ids, the PAIN/GAIN and the JOB id reached via the HMW's derivedFrom, and the GOAL id of its root, so OPP → IMP → GOAL stays closed; flag OPPs that reach no JOB/IMP.
6. Render the tree as a Mermaid graph plus an OPP table; record OPP items with evidence level (inherited from their strongest source) in the item index.
7. Write the output **body** from `assets/template.md`: Markdown only, no frontmatter (the product-artifact-contract-guard hook rejects a Write that starts with `---`).
8. Run the self-check below and fix what fails. Never set `passed` yourself — only the critic gate does (Gedächtnis §2.2).
9. **Commit** every output file with its authored block (see "Artifact contract" below): `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/commit-artifact.mjs commit <runDir> <file.md> --step S2.2.4 <<'JSON'` … `JSON`. The script computes id, version, status, derivedFrom, evidence mix and history; fix every rejection it prints and commit again. Re-committing an unchanged file is a no-op.
10. Log: `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/run-state.mjs event <runDir> '{"event":"step-done","element":"S2.2.4"}'`.

## Artifact contract (Gedächtnis §11.2)

Every output is two files: `<file>.md` (the body you write; its frontmatter is rendered read-only from the sidecar) and `<file>.meta.json` (the sidecar, written only by `commit-artifact.mjs`). Read upstream metadata from sidecars, never from rendered frontmatter.

**You supply** the authored block on stdin (`node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/commit-artifact.mjs schema` prints its JSON Schema):

```json
{
  "itemIndex": [
    {
      "id": "OPP-001",
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

## Self-check (rubric `ost` — judged by `product-kritiker-pruefung`)

- [ ] The tree has the four levels Outcome → Opportunities → Solutions → Experiments (rubric ost).
- [ ] Every OPP is phrased from the user's perspective as a need, not a feature (rubric ost).
- [ ] No solution hangs directly under the outcome; every leaf OPP has ≥2 competing solutions.
- [ ] The outcome root references a GOAL id from business-goals (the One Metric That Matters).
- [ ] Every OPP has derivedFrom HMW ids plus a JOB and GOAL link, or an explicit gap flag.

## Pitfalls

- Opportunities that are solutions in disguise ("mobile app for…").
- A single solution per opportunity, which turns the tree into a feature list.
- Losing the link to the outcome, so solutions cannot be tied to a goal.

## Return

Reply with JSON only: `{"status": "done|blocked|partial", "artifacts": ["<committed .md paths>"], "items": ["<item ids created or changed>"], "riskFlags": [], "summary": "<one sentence>"}`.

## Domain knowledge

See `references/domain-knowledge.md` (cited from notebook "The Product - Business Design"; phase brief `knowledge/phase-2-discovery.md`).
