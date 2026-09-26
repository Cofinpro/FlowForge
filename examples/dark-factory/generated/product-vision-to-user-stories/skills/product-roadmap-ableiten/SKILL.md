---
name: product-roadmap-ableiten
description: >-
  Derives the outcome-oriented roadmap artifact from the impact scoring: milestones as OMTM/impact movements ("from A to B") linked to GOAL and IMP, not feature dates. Use when the dark-factory
  workflow reaches step S1.2.6 "Outcome-orientierte Roadmap ableiten".
bpmn:
  file: product-vision-to-user-stories.bpmn
  elements: [S1.2.6]
---

# Outcome-orientierte Roadmap ableiten (step 1.2.6)

Generated from `product-vision-to-user-stories.bpmn`'s "Outcome-orientierte Roadmap ableiten" (serviceTask, lane "Stratege") by `bpmn2agent-generate`. Closes the impact-mapping sub-phase with a sequenced plan of target outcomes; G-P1 reviews it with the vision bundle, and Phase 2 opportunity work and later release slicing refer back to its milestones. It is its own skill because it produces an independently versioned artifact with its own contract (body + sidecar), template and rubric (mapping-rubric.md's serviceTask rule; one skill per business step, docs/dark-factory/implementation.md §2).

Executed by the `product-stratege` agent. Binding rules: `${CLAUDE_PLUGIN_ROOT}/knowledge/process-rules.md` — evidence §6, item IDs §10, artifact contract §11.2, iterations §15.

## Run context

The Workflow passes `runDir`, `runId`, `iteration` and `changeRequests` (from the last gate record of this phase).

| Input | Required | Path pattern |
|---|---|---|
| `impact-scoring` | yes | `runs/{runId}/artifacts/p1-strategie/1.2.5_impact-scoring.md` |

| Output | Item prefix | Cardinality | Path pattern |
|---|---|---|---|
| `roadmap` | — | one | `runs/{runId}/artifacts/p1-strategie/1.2.6_roadmap.md` |


## Procedure

0. **Resume / iterate.** Read the output's sidecar (`<file>.meta.json`) if it exists. If it has `status: passed`/`passed-with-risk`, or `iteration > 1` and no change request concerns this artifact or an upstream artifact it consumes, return it unchanged (idempotent resume). Otherwise work every change request into the body and keep item IDs stable when the item is materially the same. Do not copy files to `history/` or touch `version` — `commit-artifact.mjs` does both (Gedächtnis §15).
1. Read impact-scoring (ranked IMPs, flags, DEL order) and follow the chain back to GOAL and the OMTM.
2. Group impacts into 3–5 milestones ordered by the scoring: "test first" impacts early (learning), then the highest priority ones.
3. Phrase each milestone as a target outcome "from A to B" on the OMTM or an IMP indicator (baseline → target), with a horizon (Now / Next / Later) rather than calendar feature dates.
4. Reference for each milestone the GOAL and IMP ids it moves and, as candidate means, the DEL options (still options); name the ASM items it will test.
5. State the learning or exit criterion per milestone: what result moves the team to the next milestone, and what result triggers a rethink.
6. Check against the idea-brief budget/timebox that the Now horizon is plausible; note conflicts as risk.
7. Write the output **body** from `assets/template.md`: Markdown only, no frontmatter (the product-artifact-contract-guard hook rejects a Write that starts with `---`).
8. Run the self-check below and fix what fails. Never set `passed` yourself — only the critic gate does (Gedächtnis §2.2).
9. **Commit** every output file with its authored block (see "Artifact contract" below): `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/commit-artifact.mjs commit <runDir> <file.md> --step S1.2.6 <<'JSON'` … `JSON`. The script computes id, version, status, derivedFrom, evidence mix and history; fix every rejection it prints and commit again. Re-committing an unchanged file is a no-op.
10. Log: `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/run-state.mjs event <runDir> '{"event":"step-done","element":"S1.2.6"}'`.

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

## Self-check (rubric `roadmap` — judged by `product-kritiker-pruefung`)

- [ ] Rubric roadmap: every milestone is phrased as an outcome ("from A to B"), not as a feature or date.
- [ ] Rubric roadmap: every milestone references GOAL and IMP ids.
- [ ] Milestone order is consistent with the impact-scoring ranking and flags (deviations are justified).
- [ ] Deliverables appear only as candidate options, never as commitments.
- [ ] Each milestone has a learning/exit criterion and names the ASM it tests.

## Pitfalls

- A feature timeline with dates relabeled as a roadmap.
- Milestones that cannot be measured because they lack a baseline and target.
- Ignoring the budget/timebox from the idea brief, which makes G-4.2 fail later.

## Return

Reply with JSON only: `{"status": "done|blocked|partial", "artifacts": ["<committed .md paths>"], "items": ["<item ids created or changed>"], "riskFlags": [], "summary": "<one sentence>"}`.

## Domain knowledge

See `references/domain-knowledge.md` (cited from notebook "The Product - Business Design"; phase brief `knowledge/phase-1-strategie.md`).
