---
name: product-value-proposition-canvas-abgleichen
description: >-
  Builds the value-proposition-canvas artifact (customer profile, value map, explicit fit links) and consumes the proto-panel rating of the fit. Use when the dark-factory workflow reaches step S1.1.5
  "Value Proposition Canvas abgleichen".
bpmn:
  file: product-vision-to-user-stories.bpmn
  elements: [S1.1.5]
---

# Value Proposition Canvas abgleichen (step 1.1.5)

Generated from `product-vision-to-user-stories.bpmn`'s "Value Proposition Canvas abgleichen" (serviceTask, lane "UX-/Journey-Designer") by `flowforge-generate`. Tests whether the offer from the Lean Canvas actually relieves the proto personas' top pains and creates their top gains; S1.1.6 turns weak or unlinked fit into assumptions, and G-P1 relies on it for the vision decision. It is its own skill because it produces an independently versioned artifact with its own contract (body + sidecar), template and rubric (mapping-rubric.md's serviceTask rule; one skill per business step, docs/dark-factory/implementation.md §2).

Executed by the `product-ux` agent. Binding rules: `${CLAUDE_PLUGIN_ROOT}/knowledge/process-rules.md` — evidence §6, item IDs §10, artifact contract §11.2, iterations §15.

## Run context

The Workflow passes `runDir`, `runId`, `iteration` and `changeRequests` (from the last gate record of this phase), `panelResult`.

| Input | Required | Path pattern |
|---|---|---|
| `lean-canvas` | yes | `runs/{runId}/artifacts/p1-strategie/1.1.3_lean-canvas.md` |
| `proto-panel` | yes | `runs/{runId}/panel/proto/P-{nnn}_{slug}.md` |

| Output | Item prefix | Cardinality | Path pattern |
|---|---|---|---|
| `value-proposition-canvas` | — | one | `runs/{runId}/artifacts/p1-strategie/1.1.5_value-proposition-canvas.md` |

- **Panel** (`rating`, panel set `proto`): the Workflow has already run `product-panel-befragung` for this step and passes `panelResult` (the session JSON under `panel/sessions/`). Mark everything taken from it 🤖 synthetic.

## Procedure

0. **Resume / iterate.** Read the output's sidecar (`<file>.meta.json`) if it exists. If it has `status: passed`/`passed-with-risk`, or `iteration > 1` and no change request concerns this artifact or an upstream artifact it consumes, return it unchanged (idempotent resume). Otherwise work every change request into the body and keep item IDs stable when the item is materially the same. Do not copy files to `history/` or touch `version` — `commit-artifact.mjs` does both (Gedächtnis §15).
1. Read lean-canvas, proto-panel (P-items) and the panel result path passed by the Workflow (panel mode rating, set proto; mandatory for this step).
2. Fill the customer profile first: jobs (functional, social, emotional), pains and gains, derived from the proto personas and their SRC references; rank the top pains and top gains.
3. Then fill the value map: products and services (from the Lean Canvas solution/UVP), pain relievers, gain creators.
4. Link every pain reliever to the pain(s) it addresses and every gain creator to the gain(s) it produces in a fit table; mark unlinked jobs/pains/gains and unlinked value-map entries explicitly.
5. Consume the panel rating table (item × persona, 1–5): add each persona's fit rating per link, compute the mean and spread, and mark all panel-derived values 🤖 synthetic with the transcript/result reference.
6. Summarize the fit: top pains without a reliever, relievers with low panel rating (≤ 2) or high spread (≥ 2 points), and hand them to S1.1.6 as assumption candidates.
7. Compute the evidence mix (🔗 profile traits, 🧠 value-map claims, 🤖 ratings).
8. Write the output **body** from `assets/template.md`: Markdown only, no frontmatter (the product-artifact-contract-guard hook rejects a Write that starts with `---`).
9. Run the self-check below and fix what fails. Never set `passed` yourself — only the critic gate does (Gedächtnis §2.2).
10. **Commit** every output file with its authored block (see "Artifact contract" below): `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/commit-artifact.mjs commit <runDir> <file.md> --step S1.1.5 --from <panelResult> <<'JSON'` … `JSON`. The script computes id, version, status, derivedFrom, evidence mix and history; fix every rejection it prints and commit again. Re-committing an unchanged file is a no-op.
11. Log: `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/run-state.mjs event <runDir> '{"event":"step-done","element":"S1.1.5"}'`.

## Artifact contract (Gedächtnis §11.2)

Every output is two files: `<file>.md` (the body you write; its frontmatter is rendered read-only from the sidecar) and `<file>.meta.json` (the sidecar, written only by `commit-artifact.mjs`). Read upstream metadata from sidecars, never from rendered frontmatter.

**You supply** the authored block on stdin (`node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/commit-artifact.mjs schema` prints its JSON Schema):

```json
{
  "itemIndex": [],
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

## Self-check (rubric `vpc` — judged by `product-kritiker-pruefung`)

- [ ] Rubric vpc: jobs/pains/gains and products/pain relievers/gain creators are completely linked; every unlinked entry is marked as a gap.
- [ ] Rubric vpc: the panel fit rating is present for every link and every persona (or a missing rating is explicitly noted).
- [ ] The customer profile was filled before the value map and is grounded in proto-panel traits with SRC.
- [ ] Pain relievers address the top pains and gain creators the top gains; jobs cover functional, social and emotional dimensions.
- [ ] All panel-derived values are marked 🤖 synthetic and reference the panel result.
- [ ] The value map is consistent with the Lean Canvas solution and UVP.

## Pitfalls

- Designing the value map first and then writing pains that fit it (confirmation bias).
- Averaging away disagreement: a mean of 3 from ratings 1 and 5 hides a split panel.
- Presenting synthetic ratings as validated customer evidence.

## Return

Reply with JSON only: `{"status": "done|blocked|partial", "artifacts": ["<committed .md paths>"], "items": ["<item ids created or changed>"], "riskFlags": [], "summary": "<one sentence>"}`.

## Domain knowledge

See `references/domain-knowledge.md` (cited from notebook "The Product - Business Design"; phase brief `knowledge/phase-1-strategie.md`).
