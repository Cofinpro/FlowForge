---
name: product-release-ziele-festlegen
description: >-
  Sets outcome-based release goals (release-goals) for the detailed story map, each tied to GOAL/IMP items and a learning hypothesis. Use when the dark-factory workflow reaches step 4.2.1
  "Outcome-basierte Release-Ziele festlegen".
bpmn:
  file: product-vision-to-user-stories.bpmn
  elements: [S4.2.1]
---

# Outcome-basierte Release-Ziele festlegen (step 4.2.1)

Generated from `product-vision-to-user-stories.bpmn`'s "Outcome-basierte Release-Ziele festlegen" (serviceTask, lane "Stratege") by `bpmn2agent-generate`. Defines what each release must change for users and the business, so S4.2.2 cuts a skeleton serving release 1 and S4.2.5 checks every slice has a learning goal. It is its own skill because it produces an independently versioned artifact with its own contract (body + sidecar), template and rubric (mapping-rubric.md's serviceTask rule; one skill per business step, docs/dark-factory/implementation.md §2).

Executed by the `product-stratege` agent. Binding rules: `${CLAUDE_PLUGIN_ROOT}/knowledge/process-rules.md` — evidence §6, item IDs §10, artifact contract §11.2, iterations §15.

## Run context

The Workflow passes `runDir`, `runId`, `iteration` and `changeRequests` (from the last gate record of this phase).

| Input | Required | Path pattern |
|---|---|---|
| `story-map-details` | yes | `runs/{runId}/artifacts/p4-story-map/4.1.4_story-map-details.md` |
| `business-goals` | yes | `runs/{runId}/artifacts/p1-strategie/1.2.1_business-goals.md` |

| Output | Item prefix | Cardinality | Path pattern |
|---|---|---|---|
| `release-goals` | — | one | `runs/{runId}/artifacts/p4-story-map/4.2.1_release-goals.md` |


## Procedure

0. **Resume / iterate.** Read the output's sidecar (`<file>.meta.json`) if it exists. If it has `status: passed`/`passed-with-risk`, or `iteration > 1` and no change request concerns this artifact or an upstream artifact it consumes, return it unchanged (idempotent resume). Otherwise work every change request into the body and keep item IDs stable when the item is materially the same. Do not copy files to `history/` or touch `version` — `commit-artifact.mjs` does both (Gedächtnis §15).
1. Read the OMTM and GOAL-… items from business-goals and the IMP-… items they connect to; read story-map-details for what is buildable.
2. Define 2–4 releases; for each write an outcome goal as a behaviour change of a persona ("PER-… does X within Y"), not a feature list.
3. Attach to each release goal: GOAL/IMP ids, metric and target (preferably the OMTM or a leading indicator, with AARRR stage), and a learning hypothesis linked to the riskiest ASM-… it tests.
4. Name the primary persona and the ACTV-… activities each release must touch (without choosing cards yet).
5. State the release-1 success/kill signal: what result would stop further investment.
6. Order releases by learning value: release 1 tests the riskiest assumption behind the OMTM.
7. Write the output **body** from `assets/template.md`: Markdown only, no frontmatter (the product-artifact-contract-guard hook rejects a Write that starts with `---`).
8. Run the self-check below and fix what fails. Never set `passed` yourself — only the critic gate does (Gedächtnis §2.2).
9. **Commit** every output file with its authored block (see "Artifact contract" below): `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/commit-artifact.mjs commit <runDir> <file.md> --step S4.2.1 <<'JSON'` … `JSON`. The script computes id, version, status, derivedFrom, evidence mix and history; fix every rejection it prints and commit again. Re-committing an unchanged file is a no-op.
10. Log: `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/run-state.mjs event <runDir> '{"event":"step-done","element":"S4.2.1"}'`.

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

## Self-check (rubric `mvp` — judged by `product-kritiker-pruefung`)

- [ ] Rubric `roadmap`: every goal is an outcome, not a feature, and references GOAL/IMP ids.
- [ ] Each release has a metric with target and an AARRR stage.
- [ ] Each release has a learning hypothesis linked to an ASM id (rubric `mvp`: every slice has a learning goal).
- [ ] Release 1 has an explicit success and kill signal.

## Pitfalls

- Release goals phrased as "deliver feature X".
- Metrics with no target value or no link to the OMTM.

## Return

Reply with JSON only: `{"status": "done|blocked|partial", "artifacts": ["<committed .md paths>"], "items": ["<item ids created or changed>"], "riskFlags": [], "summary": "<one sentence>"}`.

## Domain knowledge

See `references/domain-knowledge.md` (cited from notebook "The Product - Business Design"; phase brief `knowledge/phase-3-4-journey-story-map.md`).
