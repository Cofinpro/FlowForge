---
name: product-confirmation-kriterien-festhalten
description: >-
  Records the confirmation notes ("back of the card") for one refined story as the first acceptance-criteria draft. Use when the dark-factory workflow reaches step 6.1.1 "Confirmation-Kriterien
  festhalten".
bpmn:
  file: product-vision-to-user-stories.bpmn
  elements: [S6.1.1]
---

# Confirmation-Kriterien festhalten (step 6.1.1)

Generated from `product-vision-to-user-stories.bpmn`'s "Confirmation-Kriterien festhalten" (serviceTask, lane "Backlog-Autor") by `flowforge-generate`. The ac-draft is the rule-level basis that 6.1.2 turns into concrete SBE examples and 6.1.3 formalizes as Gherkin AC items judged by the gherkin critic. It is its own skill because it produces an independently versioned artifact with its own contract (body + sidecar), template and rubric (mapping-rubric.md's serviceTask rule; one skill per business step, docs/dark-factory/implementation.md §2).

Executed by the `product-backlog-autor` agent. Binding rules: `${CLAUDE_PLUGIN_ROOT}/knowledge/process-rules.md` — evidence §6, item IDs §10, artifact contract §11.2, iterations §15.

## Run context

The Workflow passes `runDir`, `runId`, `iteration` and `changeRequests` (from the last gate record of this phase), `storyId`.

| Input | Required | Path pattern |
|---|---|---|
| `story-refined` | yes | `runs/{runId}/artifacts/p5-refinement/{storyId}/5.2.2_story-refined.md` |

| Output | Item prefix | Cardinality | Path pattern |
|---|---|---|---|
| `ac-draft` | — | one | `runs/{runId}/artifacts/p6-akzeptanz/{storyId}/6.1.1_ac-draft.md` |

- **Multi-instance**: runs once per story; the Workflow passes `storyId`. Per-story artifacts go under `artifacts/p6-akzeptanz/<storyId>/`.

## Procedure

0. **Resume / iterate.** Read the output's sidecar (`<file>.meta.json`) if it exists. If it has `status: passed`/`passed-with-risk`, or `iteration > 1` and no change request concerns this artifact or an upstream artifact it consumes, return it unchanged (idempotent resume). Otherwise work every change request into the body and keep item IDs stable when the item is materially the same. Do not copy files to `history/` or touch `version` — `commit-artifact.mjs` does both (Gedächtnis §15).
1. Read story-refined for the passed story id (What, business rules, confirmation candidates, edge cases from the amigos protocol).
2. Write confirmation notes as short, testable statements of what must be true when the story is done — one per business rule or outcome, in the story's domain terms.
3. Include at least one happy-path confirmation and at least one negative/exception confirmation (limits, invalid or expired data, missing permission) from the QA edge cases.
4. Keep every note implementation-neutral: no selectors, screens, SQL, API calls; refer to domain concepts and observable outcomes.
5. Tag each note with its source (business rule, edge case, ASM) and mark notes that rest on an unvalidated ASM.
6. Write ac-draft to artifacts/p6-akzeptanz/<storyId>/; derivedFrom = story-refined@version; evidence 🧠 inferred.
7. Write the output **body** from `assets/template.md`: Markdown only, no frontmatter (the product-artifact-contract-guard hook rejects a Write that starts with `---`).
8. Run the self-check below and fix what fails. Never set `passed` yourself — only the critic gate does (Gedächtnis §2.2).
9. **Commit** every output file with its authored block (see "Artifact contract" below): `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/commit-artifact.mjs commit <runDir> <file.md> --step S6.1.1 <<'JSON'` … `JSON`. The script computes id, version, status, derivedFrom, evidence mix and history; fix every rejection it prints and commit again. Re-committing an unchanged file is a no-op.
10. Log: `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/run-state.mjs event <runDir> '{"event":"step-done","element":"S6.1.1"}'`.

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

- [ ] At least one happy-path and at least one negative/exception confirmation (gherkin).
- [ ] Every note is implementation-neutral and uses glossary/domain-model terms.
- [ ] Each business rule in story-refined is covered by at least one note.
- [ ] Notes are testable statements (observable outcome), not tasks or vague qualities ("fast", "easy").
- [ ] Notes depending on unvalidated ASM are marked.

## Pitfalls

- Writing test steps or UI click paths instead of confirmation criteria.
- Only happy-path criteria, pushing all negatives to "later".
- Adding new scope in the confirmation that is not in the story.

## Return

Reply with JSON only: `{"status": "done|blocked|partial", "artifacts": ["<committed .md paths>"], "items": ["<item ids created or changed>"], "riskFlags": [], "summary": "<one sentence>"}`.

## Domain knowledge

See `references/domain-knowledge.md` (cited from notebook "The Product - Business Design"; phase brief `knowledge/phase-5-6-stories-akzeptanz.md`).
