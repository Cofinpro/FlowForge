---
name: product-lean-canvas-abbilden
description: >-
  Maps the idea onto a one-page lean-canvas artifact (nine building blocks in Running Lean order, evidence level per cell, explicit pricing model), with a light WebSearch factcheck. Use when the
  dark-factory workflow reaches step S1.1.3 "Lean / Business Model Canvas abbilden".
bpmn:
  file: product-vision-to-user-stories.bpmn
  elements: [S1.1.3]
---

# Lean / Business Model Canvas abbilden (step 1.1.3)

Generated from `product-vision-to-user-stories.bpmn`'s "Lean / Business Model Canvas abbilden" (serviceTask, lane "Stratege") by `flowforge-generate`. The canvas is the business-model baseline: S1.1.5 checks the value proposition against it, S1.1.6 extracts its assumptions, and G-P3 compares panel willingness to pay against its pricing model. It is its own skill because it produces an independently versioned artifact with its own contract (body + sidecar), template and rubric (mapping-rubric.md's serviceTask rule; one skill per business step, docs/dark-factory/implementation.md §2).

Executed by the `product-stratege` agent. Binding rules: `${CLAUDE_PLUGIN_ROOT}/knowledge/process-rules.md` — evidence §6, item IDs §10, artifact contract §11.2, iterations §15.

## Run context

The Workflow passes `runDir`, `runId`, `iteration` and `changeRequests` (from the last gate record of this phase).

| Input | Required | Path pattern |
|---|---|---|
| `vision-statement` | yes | `runs/{runId}/artifacts/p1-strategie/1.1.2_vision-statement.md` |
| `research-markt-wettbewerb` | yes | `runs/{runId}/research/reports/DR-01_markt-wettbewerb.md` |

| Output | Item prefix | Cardinality | Path pattern |
|---|---|---|---|
| `lean-canvas` | — | one | `runs/{runId}/artifacts/p1-strategie/1.1.3_lean-canvas.md` |

- **Light research**: `websearch` (factcheck). Free channels only (WebSearch) — never Deep Research or a direct Gemini API call here. Fetch the page text with `node ${CLAUDE_PLUGIN_ROOT}/skills/product-recherche/scripts/providers/raw-fetch.mjs <runDir> --call <step> --tool websearch --query "<q>" --url <u>…`, normalize it with `node ${CLAUDE_PLUGIN_ROOT}/skills/product-recherche/scripts/normalize-sources.mjs <runDir> <raw.json>` and cite only the resulting `SRC-` ids (Gedächtnis §8.0/§8.3).

## Procedure

0. **Resume / iterate.** Read the output's sidecar (`<file>.meta.json`) if it exists. If it has `status: passed`/`passed-with-risk`, or `iteration > 1` and no change request concerns this artifact or an upstream artifact it consumes, return it unchanged (idempotent resume). Otherwise work every change request into the body and keep item IDs stable when the item is materially the same. Do not copy files to `history/` or touch `version` — `commit-artifact.mjs` does both (Gedächtnis §15).
1. Read vision-statement (VIS-001) and research-markt-wettbewerb (DR-01).
2. Fill the Lean Canvas in order: Problem (top 1–3) with Existing Alternatives → Customer Segments with Early Adopters → UVP with High-Level Concept (from VIS-001) → Solution → Channels → Revenue Streams → Cost Structure → Key Metrics → Unfair Advantage. Max. 3–4 entries per box.
3. Make the revenue model explicit: pricing model (e.g. subscription, freemium, per use), price point or range, and the DR-01 pricing benchmark it is compared against.
4. Give every cell an evidence level: 🔗 with SRC id, or 🧠 inferred with a short reason. Unfair Advantage stays "none yet" rather than invented.
5. Run a light WebSearch/WebFetch factcheck on the claims DR-01 does not cover (e.g. a channel cost, a price point, a regulatory cost). Normalize each source with `node skills/product-recherche/scripts/normalize-sources.mjs` into `research/sources/SRC-*.md` and cite it by SRC id.
6. List all 🧠 cells under "Assumptions for 1.1.6" with a one-line assumption statement and its risk domain (Desirability, Feasibility, Viability).
7. Compute the evidence mix across cells and list all SRC ids in `sources`.
8. Write the output **body** from `assets/template.md`: Markdown only, no frontmatter (the product-artifact-contract-guard hook rejects a Write that starts with `---`).
9. Run the self-check below and fix what fails. Never set `passed` yourself — only the critic gate does (Gedächtnis §2.2).
10. **Commit** every output file with its authored block (see "Artifact contract" below): `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/commit-artifact.mjs commit <runDir> <file.md> --step S1.1.3 <<'JSON'` … `JSON`. The script computes id, version, status, derivedFrom, evidence mix and history; fix every rejection it prints and commit again. Re-committing an unchanged file is a no-op.
11. Log: `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/run-state.mjs event <runDir> '{"event":"step-done","element":"S1.1.3"}'`.

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

## Self-check (rubric `lean-canvas` — judged by `product-kritiker-pruefung`)

- [ ] Rubric lean-canvas: all nine building blocks are filled (an honest "none yet" counts for Unfair Advantage).
- [ ] Rubric lean-canvas: every cell has an evidence level (🔗 with SRC or 🧠 with reason).
- [ ] Rubric lean-canvas: the pricing model is explicit (model plus price point/range) and compared to a DR-01 benchmark.
- [ ] The canvas fits on one page; no box has more than 4 entries.
- [ ] The Problem box names today's workarounds/existing alternatives.
- [ ] The UVP is consistent with VIS-001; every web-sourced claim cites a normalized SRC id.

## Pitfalls

- Using the full Business Model Canvas (key partners, activities) before problem/solution fit is established.
- Filling the Solution box with a long feature list, which later biases deliverables in S1.2.4.
- Revenue box left vague ("monetization later"), which makes G-P3's willingness-to-pay check impossible.
- Treating the canvas as a one-off document instead of the baseline that pivots revise.

## Return

Reply with JSON only: `{"status": "done|blocked|partial", "artifacts": ["<committed .md paths>"], "items": ["<item ids created or changed>"], "riskFlags": [], "summary": "<one sentence>"}`.

## Domain knowledge

See `references/domain-knowledge.md` (cited from notebook "The Product - Business Design"; phase brief `knowledge/phase-1-strategie.md`).
