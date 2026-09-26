---
name: product-zielbild-klaeren
description: >-
  Writes the zielbild artifact: the status quo versus the target picture for the idea, grounded in the idea brief and the DR-01 market and competition report. Use when the dark-factory workflow
  reaches step S1.1.1 "Status quo & Zielbild klaeren".
bpmn:
  file: product-vision-to-user-stories.bpmn
  elements: [S1.1.1]
---

# Status quo & Zielbild klaeren (step 1.1.1)

Generated from `product-vision-to-user-stories.bpmn`'s "Status quo & Zielbild klaeren" (serviceTask, lane "Stratege") by `bpmn2agent-generate`. Establishes the problem-first gap (today vs. desired future) that S1.1.2 condenses into the vision statement and elevator pitch; it also frames the Problem and Existing Alternatives boxes of the Lean Canvas in S1.1.3. It is its own skill because it produces an independently versioned artifact with its own contract (body + sidecar), template and rubric (mapping-rubric.md's serviceTask rule; one skill per business step, docs/dark-factory/implementation.md §2).

Executed by the `product-stratege` agent. Binding rules: `${CLAUDE_PLUGIN_ROOT}/knowledge/process-rules.md` — evidence §6, item IDs §10, artifact contract §11.2, iterations §15.

## Run context

The Workflow passes `runDir`, `runId`, `iteration` and `changeRequests` (from the last gate record of this phase).

| Input | Required | Path pattern |
|---|---|---|
| `idea-brief` | yes | `runs/{runId}/00_idea-brief.md` |
| `research-markt-wettbewerb` | yes | `runs/{runId}/research/reports/DR-01_markt-wettbewerb.md` |

| Output | Item prefix | Cardinality | Path pattern |
|---|---|---|---|
| `zielbild` | — | one | `runs/{runId}/artifacts/p1-strategie/1.1.1_zielbild.md` |


## Procedure

0. **Resume / iterate.** Read the output's sidecar (`<file>.meta.json`) if it exists. If it has `status: passed`/`passed-with-risk`, or `iteration > 1` and no change request concerns this artifact or an upstream artifact it consumes, return it unchanged (idempotent resume). Otherwise work every change request into the body and keep item IDs stable when the item is materially the same. Do not copy files to `history/` or touch `version` — `commit-artifact.mjs` does both (Gedächtnis §15).
1. Read idea-brief (fields idee, zielgruppe-hypothese, strategische-richtung, constraints) and research-markt-wettbewerb (DR-01).
2. Describe the status quo from the customer's perspective: who has the problem today, how they solve it now (existing alternatives, workarounds, competitor products from DR-01) and what it costs them. Cite every market or competitor statement by its SRC id (🔗).
3. State the core problem in one or two sentences, customer-first and solution-neutral.
4. Describe the target picture: what is different for the customer once the product exists (outcome, not features), and which market trends from DR-01 make it plausible now.
5. Make the gap explicit as a short "from … to …" table (dimension | status quo | target picture | evidence).
6. Mark statements that are not backed by DR-01 or the brief as 🧠 inferred and list them under "Open assumptions" for S1.1.6.
7. Compute the evidence mix over all statements and list the used SRC ids in `sources`.
8. Write the output **body** from `assets/template.md`: Markdown only, no frontmatter (the product-artifact-contract-guard hook rejects a Write that starts with `---`).
9. Run the self-check below and fix what fails. Never set `passed` yourself — only the critic gate does (Gedächtnis §2.2).
10. **Commit** every output file with its authored block (see "Artifact contract" below): `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/commit-artifact.mjs commit <runDir> <file.md> --step S1.1.1 <<'JSON'` … `JSON`. The script computes id, version, status, derivedFrom, evidence mix and history; fix every rejection it prints and commit again. Re-committing an unchanged file is a no-op.
11. Log: `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/run-state.mjs event <runDir> '{"event":"step-done","element":"S1.1.1"}'`.

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

## Self-check

- [ ] Status quo names today's alternatives/workarounds, each backed by an SRC from DR-01 or marked 🧠.
- [ ] The core problem is stated from the customer's view and contains no feature or technology.
- [ ] The target picture describes outcomes for the customer, not a feature list (rubric phase-1-1: problem-first framing).
- [ ] Every claim carries an evidence level; cited claims reference SRC ids only (no raw URLs).
- [ ] The "from … to …" table covers at least the problem, the alternative and the customer outcome.
- [ ] The zielbild fits on one page, so S1.1.2 can condense it without losing substance.

## Pitfalls

- Starting from the product's features instead of the customer problem.
- Copying the DR-01 report instead of synthesizing the gap it reveals.
- A target picture so vague (e.g. "better experience") that no goal or KPI can be derived later.

## Return

Reply with JSON only: `{"status": "done|blocked|partial", "artifacts": ["<committed .md paths>"], "items": ["<item ids created or changed>"], "riskFlags": [], "summary": "<one sentence>"}`.

## Domain knowledge

See `references/domain-knowledge.md` (cited from notebook "The Product - Business Design"; phase brief `knowledge/phase-1-strategie.md`).
