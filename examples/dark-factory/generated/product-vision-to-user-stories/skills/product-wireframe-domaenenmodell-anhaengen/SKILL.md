---
name: product-wireframe-domaenenmodell-anhaengen
description: >-
  Attaches a low-fi text/Mermaid wireframe (regions, elements, states) and a small domain model with candidate terms to one refined story. Use when the dark-factory workflow reaches step 5.2.3
  "Low-Fi-Wireframe & Domaenenmodell anhaengen".
bpmn:
  file: product-vision-to-user-stories.bpmn
  elements: [S5.2.3]
---

# Low-Fi-Wireframe & Domaenenmodell anhaengen (step 5.2.3)

Generated from `product-vision-to-user-stories.bpmn`'s "Low-Fi-Wireframe & Domaenenmodell anhaengen" (serviceTask, lane "UX-/Journey-Designer") by `flowforge-generate`. The wireframe-text satisfies the DoR wireframe criterion and gives 5.2.4 a basis for sizing; its domain-model terms are the input 6.2.3 turns into TERM glossary items. It is its own skill because it produces an independently versioned artifact with its own contract (body + sidecar), template and rubric (mapping-rubric.md's serviceTask rule; one skill per business step, docs/dark-factory/implementation.md §2).

Executed by the `product-ux` agent. Binding rules: `${CLAUDE_PLUGIN_ROOT}/knowledge/process-rules.md` — evidence §6, item IDs §10, artifact contract §11.2, iterations §15.

## Run context

The Workflow passes `runDir`, `runId`, `iteration` and `changeRequests` (from the last gate record of this phase), `storyId`.

| Input | Required | Path pattern |
|---|---|---|
| `story-refined` | yes | `runs/{runId}/artifacts/p5-refinement/{storyId}/5.2.2_story-refined.md` |

| Output | Item prefix | Cardinality | Path pattern |
|---|---|---|---|
| `wireframe-text` | — | one | `runs/{runId}/artifacts/p5-refinement/{storyId}/5.2.3_wireframe-text.md` |

- **Multi-instance**: runs once per story; the Workflow passes `storyId`. Per-story artifacts go under `artifacts/p5-refinement/<storyId>/`.

## Procedure

0. **Resume / iterate.** Read the output's sidecar (`<file>.meta.json`) if it exists. If it has `status: passed`/`passed-with-risk`, or `iteration > 1` and no change request concerns this artifact or an upstream artifact it consumes, return it unchanged (idempotent resume). Otherwise work every change request into the body and keep item IDs stable when the item is materially the same. Do not copy files to `history/` or touch `version` — `commit-artifact.mjs` does both (Gedächtnis §15).
1. Read story-refined for the passed story id (What section, business rules, confirmation candidates).
2. Sketch the interaction as text or a Mermaid diagram: regions, elements and the information shown, plus states (empty, loading, error, success, no permission) relevant to the story — no images, no visual styling.
3. Keep the sketch low-fidelity and consistent with the What: it illustrates one way to meet the need and is labeled non-binding.
4. Model the domain concepts the story touches as a small Mermaid class/ER sketch or a list: entity, key attributes, relations, and business rules attached to them.
5. List each domain term with a one-line definition as a glossary candidate; reuse existing TERM wording from any prior glossary or other stories of the run instead of inventing synonyms, and flag conflicts.
6. Write wireframe-text to artifacts/p5-refinement/<storyId>/; derivedFrom = story-refined@version; evidence 🧠 inferred.
7. Write the output **body** from `assets/template.md`: Markdown only, no frontmatter (the product-artifact-contract-guard hook rejects a Write that starts with `---`).
8. Run the self-check below and fix what fails. Never set `passed` yourself — only the critic gate does (Gedächtnis §2.2).
9. **Commit** every output file with its authored block (see "Artifact contract" below): `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/commit-artifact.mjs commit <runDir> <file.md> --step S5.2.3 <<'JSON'` … `JSON`. The script computes id, version, status, derivedFrom, evidence mix and history; fix every rejection it prints and commit again. Re-committing an unchanged file is a no-op.
10. Log: `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/run-state.mjs event <runDir> '{"event":"step-done","element":"S5.2.3"}'`.

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

## Self-check (rubric `dor` — judged by `product-kritiker-pruefung`)

- [ ] Wireframe is a text or Mermaid sketch with regions, elements and states — no image (dor).
- [ ] At least the empty/error states relevant to the story are shown, matching the QA edge cases.
- [ ] Sketch does not add scope beyond story-refined.
- [ ] Every domain concept used in the story appears in the domain model with a definition.
- [ ] One term per concept; synonyms or conflicts with existing terms are flagged (ubiquitous-language).
- [ ] Mermaid blocks are syntactically valid.

## Pitfalls

- Hi-fi pixel descriptions or styling details that pre-empt design and bloat sizing.
- Introducing new synonyms for concepts other stories already named ("order" vs. "booking").
- Only the happy-path screen; missing error/empty states that the ACs will need.

## Return

Reply with JSON only: `{"status": "done|blocked|partial", "artifacts": ["<committed .md paths>"], "items": ["<item ids created or changed>"], "riskFlags": [], "summary": "<one sentence>"}`.

## Domain knowledge

See `references/domain-knowledge.md` (cited from notebook "The Product - Business Design"; phase brief `knowledge/phase-5-6-stories-akzeptanz.md`).
