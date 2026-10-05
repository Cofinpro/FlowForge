---
name: product-sbe-beispiele-spezifizieren
description: >-
  Specifies one story's confirmation criteria with concrete examples (SBE tables with real values), optionally rated by the full synthetic panel. Use when the dark-factory workflow reaches step 6.1.2
  "Mit konkreten Beispielen spezifizieren (SBE)".
bpmn:
  file: product-vision-to-user-stories.bpmn
  elements: [S6.1.2]
---

# Mit konkreten Beispielen spezifizieren (SBE) (step 6.1.2)

Generated from `product-vision-to-user-stories.bpmn`'s "Mit konkreten Beispielen spezifizieren (SBE)" (serviceTask, lane "QA-Perspektive") by `flowforge-generate`. The sbe-examples make each criterion unambiguous with real data; 6.1.3 formalizes them into Gherkin AC items and the gherkin critic checks the concrete values. It is its own skill because it produces an independently versioned artifact with its own contract (body + sidecar), template and rubric (mapping-rubric.md's serviceTask rule; one skill per business step, docs/dark-factory/implementation.md §2).

Executed by the `product-qa` agent. Binding rules: `${CLAUDE_PLUGIN_ROOT}/knowledge/process-rules.md` — evidence §6, item IDs §10, artifact contract §11.2, iterations §15.

## Run context

The Workflow passes `runDir`, `runId`, `iteration` and `changeRequests` (from the last gate record of this phase), `storyId`, `panelResult`.

| Input | Required | Path pattern |
|---|---|---|
| `ac-draft` | yes | `runs/{runId}/artifacts/p6-akzeptanz/{storyId}/6.1.1_ac-draft.md` |
| `personas` | yes | `runs/{runId}/artifacts/p2-research/2.1.5_personas.md` |

| Output | Item prefix | Cardinality | Path pattern |
|---|---|---|---|
| `sbe-examples` | — | one | `runs/{runId}/artifacts/p6-akzeptanz/{storyId}/6.1.2_sbe-examples.md` |

- **Panel** (`rating`, panel set `full`, optional — may be skipped when the budget is tight; then proceed without it and say "panel skipped" in the artifact): the Workflow has already run `product-panel-befragung` for this step and passes `panelResult` (the session JSON under `panel/sessions/`). Mark everything taken from it 🤖 synthetic.
- **Multi-instance**: runs once per story; the Workflow passes `storyId`. Per-story artifacts go under `artifacts/p6-akzeptanz/<storyId>/`.

## Procedure

0. **Resume / iterate.** Read the output's sidecar (`<file>.meta.json`) if it exists. If it has `status: passed`/`passed-with-risk`, or `iteration > 1` and no change request concerns this artifact or an upstream artifact it consumes, return it unchanged (idempotent resume). Otherwise work every change request into the body and keep item IDs stable when the item is materially the same. Do not copy files to `history/` or touch `version` — `commit-artifact.mjs` does both (Gedächtnis §15).
1. Read ac-draft for the passed story id and personas (PER) for realistic roles, contexts and data.
2. For each confirmation note write concrete examples: specific input values, preconditions and the exact expected outcome; use tables for rule variations and boundary values (just below / at / above limits).
3. Cover every negative/exception note with at least one example using concrete invalid, expired, empty or boundary data.
4. If a panel result path is passed (mode rating, panelSet full), consume it: use the per-persona ratings of the examples (realism/importance) to drop or fix unrealistic examples and add persona-suggested cases; mark those examples and changes 🤖 synthetic citing the panel/T ids.
5. If no panel result is passed (optional, budget skip), proceed with persona-derived examples marked 🧠 inferred and note "panel skipped" in the artifact.
6. Keep examples implementation-neutral (domain values and outcomes, no UI selectors or SQL) and in glossary terms.
7. Write sbe-examples to artifacts/p6-akzeptanz/<storyId>/; derivedFrom = ac-draft@version, personas@version (and panel result if used).
8. Write the output **body** from `assets/template.md`: Markdown only, no frontmatter (the product-artifact-contract-guard hook rejects a Write that starts with `---`).
9. Run the self-check below and fix what fails. Never set `passed` yourself — only the critic gate does (Gedächtnis §2.2).
10. **Commit** every output file with its authored block (see "Artifact contract" below): `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/commit-artifact.mjs commit <runDir> <file.md> --step S6.1.2 --from <panelResult> <<'JSON'` … `JSON`. The script computes id, version, status, derivedFrom, evidence mix and history; fix every rejection it prints and commit again. Re-committing an unchanged file is a no-op.
11. Log: `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/run-state.mjs event <runDir> '{"event":"step-done","element":"S6.1.2"}'`.

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

## Self-check (rubric `gherkin` — judged by `product-kritiker-pruefung`)

- [ ] Every confirmation note has at least one example with concrete values (gherkin: SBE examples with concrete values).
- [ ] At least one happy-path and one negative/exception example exist.
- [ ] Boundary values are explicit for every numeric/time limit.
- [ ] Examples are implementation-neutral and use domain/glossary terms.
- [ ] Panel-derived content is marked 🤖 with its source; without panel the skip is stated and nothing is marked 🤖.
- [ ] Example data is plausible for the PER roles in personas.

## Pitfalls

- Placeholder values ("some user", "a valid date") instead of real data.
- Treating panel ratings as validation — they are synthetic evidence only.
- Tables that mix several rules in one row so the failing rule is unclear.

## Return

Reply with JSON only: `{"status": "done|blocked|partial", "artifacts": ["<committed .md paths>"], "items": ["<item ids created or changed>"], "riskFlags": [], "summary": "<one sentence>"}`.

## Domain knowledge

See `references/domain-knowledge.md` (cited from notebook "The Product - Business Design"; phase brief `knowledge/phase-5-6-stories-akzeptanz.md`).
