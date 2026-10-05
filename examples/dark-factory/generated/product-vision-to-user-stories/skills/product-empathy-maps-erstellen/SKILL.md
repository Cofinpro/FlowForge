---
name: product-empathy-maps-erstellen
description: >-
  Produces empathy-maps: one four-quadrant map (Think & Feel, See, Hear, Say & Do) per persona built from the interview transcripts, optionally weighted by a panel rating, with Say/Do-vs-Think/Feel
  contradictions marked. Use when the dark-factory workflow reaches step S2.2.1 "Empathy Maps erstellen".
bpmn:
  file: product-vision-to-user-stories.bpmn
  elements: [S2.2.1]
---

# Empathy Maps erstellen (step 2.2.1)

Generated from `product-vision-to-user-stories.bpmn`'s "Empathy Maps erstellen" (serviceTask, lane "UX-/Journey-Designer") by `flowforge-generate`. Is the sole input of S2.2.2, which derives PAIN/GAIN items from the contradictions marked here. It is its own skill because it produces an independently versioned artifact with its own contract (body + sidecar), template and rubric (mapping-rubric.md's serviceTask rule; one skill per business step, docs/dark-factory/implementation.md §2).

Executed by the `product-ux` agent. Binding rules: `${CLAUDE_PLUGIN_ROOT}/knowledge/process-rules.md` — evidence §6, item IDs §10, artifact contract §11.2, iterations §15.

## Run context

The Workflow passes `runDir`, `runId`, `iteration` and `changeRequests` (from the last gate record of this phase), `panelResult`.

| Input | Required | Path pattern |
|---|---|---|
| `personas` | yes | `runs/{runId}/artifacts/p2-research/2.1.5_personas.md` |
| `interview-transcripts` | yes | `runs/{runId}/panel/transcripts/T-{nn}_P-{nnn}_{slug}.md` |

| Output | Item prefix | Cardinality | Path pattern |
|---|---|---|---|
| `empathy-maps` | — | one | `runs/{runId}/artifacts/p2-research/2.2.1_empathy-maps.md` |

- **Panel** (`rating`, panel set `full`, optional — may be skipped when the budget is tight; then proceed without it and say "panel skipped" in the artifact): the Workflow has already run `product-panel-befragung` for this step and passes `panelResult` (the session JSON under `panel/sessions/`). Mark everything taken from it 🤖 synthetic.

## Procedure

0. **Resume / iterate.** Read the output's sidecar (`<file>.meta.json`) if it exists. If it has `status: passed`/`passed-with-risk`, or `iteration > 1` and no change request concerns this artifact or an upstream artifact it consumes, return it unchanged (idempotent resume). Otherwise work every change request into the body and keep item IDs stable when the item is materially the same. Do not copy files to `history/` or touch `version` — `commit-artifact.mjs` does both (Gedächtnis §15).
1. Read personas and interview-transcripts; build one empathy map per PER from the transcripts of the P items it was derived from.
2. Fill Say & Do with verbatim transcript quotes and reported actions (🤖 synthetic, with T id and line/question ref); fill Hear and See with influences, channels and environment the persona mentioned; fill Think & Feel with inferred attitudes (🧠) each tied to the quotes that support it.
3. Mark contradictions between Say/Do and Think/Feel (e.g. says a problem is minor but spends hours on a workaround) with a short id per contradiction; these are the raw material for pains and gains.
4. If the Workflow passed a panel result (product-panel-befragung, mode rating, optional): read each persona's 1–5 rating of how well the map's statements describe it, keep statements rated ≥3 by their source persona, and mark statements rated ≤2 as "disputed by panel" (🤖) — do not delete them silently.
5. If no panel result was passed (budget skipped it), proceed without it and state "panel rating skipped" in the artifact.
6. Write needs in the map summary as verbs, not nouns; record per map derivedFrom (PER id, T ids) and evidence in the authored itemIndex.
7. Write the output **body** from `assets/template.md`: Markdown only, no frontmatter (the product-artifact-contract-guard hook rejects a Write that starts with `---`).
8. Run the self-check below and fix what fails. Never set `passed` yourself — only the critic gate does (Gedächtnis §2.2).
9. **Commit** every output file with its authored block (see "Artifact contract" below): `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/commit-artifact.mjs commit <runDir> <file.md> --step S2.2.1 --from <panelResult> <<'JSON'` … `JSON`. The script computes id, version, status, derivedFrom, evidence mix and history; fix every rejection it prints and commit again. Re-committing an unchanged file is a no-op.
10. Log: `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/run-state.mjs event <runDir> '{"event":"step-done","element":"S2.2.1"}'`.

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

## Self-check (rubric `pov-hmw` — judged by `product-kritiker-pruefung`)

- [ ] One map per PER with all four quadrants filled.
- [ ] Say & Do contains only verbatim quotes or reported actions, each with a T reference and marked 🤖.
- [ ] Every Think & Feel entry is marked 🧠 and points to supporting quotes.
- [ ] Contradictions between Say/Do and Think/Feel are listed with ids.
- [ ] Panel use is explicit: rating applied with thresholds, or "panel rating skipped" stated.
- [ ] Needs are phrased as verbs, not nouns.

## Pitfalls

- Paraphrasing quotes in Say & Do, which erases the evidence and the contradictions.
- Filling Think & Feel with the team's wishes instead of inferences from transcript behaviour.
- Treating panel ratings as new facts; they only weight existing statements.

## Return

Reply with JSON only: `{"status": "done|blocked|partial", "artifacts": ["<committed .md paths>"], "items": ["<item ids created or changed>"], "riskFlags": [], "summary": "<one sentence>"}`.

## Domain knowledge

See `references/domain-knowledge.md` (cited from notebook "The Product - Business Design"; phase brief `knowledge/phase-2-discovery.md`).
