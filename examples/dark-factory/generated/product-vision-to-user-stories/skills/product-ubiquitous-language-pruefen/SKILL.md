---
name: product-ubiquitous-language-pruefen
description: >-
  Checks ubiquitous-language consistency across all acceptance criteria and stories and builds the run glossary (TERM items), as the critic-owned business rule step. Use when the dark-factory workflow
  reaches step 6.2.3 "Ubiquitous-Language-Konsistenz pruefen".
bpmn:
  file: product-vision-to-user-stories.bpmn
  elements: [S6.2.3]
---

# Ubiquitous-Language-Konsistenz pruefen (step 6.2.3)

Generated from `product-vision-to-user-stories.bpmn`'s "Ubiquitous-Language-Konsistenz pruefen" (businessRuleTask, lane "Kritiker") by `bpmn2agent-generate`. The glossary is the reference for the DoR criterion "terms as in the glossary" and the backlog-hygiene/traceability critic in SP6.2; 6.2.4 and 7 use its findings and export it with the backlog. It is its own skill because it produces an independently versioned artifact with its own contract (body + sidecar), template and rubric (mapping-rubric.md's serviceTask rule; one skill per business step, docs/dark-factory/implementation.md §2).

Executed by the `product-kritiker` agent. Binding rules: `${CLAUDE_PLUGIN_ROOT}/knowledge/process-rules.md` — evidence §6, item IDs §10, artifact contract §11.2, iterations §15.

## Run context

The Workflow passes `runDir`, `runId`, `iteration` and `changeRequests` (from the last gate record of this phase).

| Input | Required | Path pattern |
|---|---|---|
| `acceptance-criteria` | yes | `runs/{runId}/artifacts/p6-akzeptanz/{storyId}/6.1.3_acceptance-criteria.md` |

| Output | Item prefix | Cardinality | Path pattern |
|---|---|---|---|
| `glossary` | TERM | many | `runs/{runId}/artifacts/p6-akzeptanz/6.2.3_glossary.md` |


## Procedure

0. **Resume / iterate.** Read the output's sidecar (`<file>.meta.json`) if it exists. If it has `status: passed`/`passed-with-risk`, or `iteration > 1` and no change request concerns this artifact or an upstream artifact it consumes, return it unchanged (idempotent resume). Otherwise work every change request into the body and keep item IDs stable when the item is materially the same. Do not copy files to `history/` or touch `version` — `commit-artifact.mjs` does both (Gedächtnis §15).
1. Read acceptance-criteria of all stories, the story files in backlog/stories/ and the glossary candidates from each story's wireframe-text (artifacts/p5-refinement/<storyId>/).
2. Extract every domain term used; cluster synonyms and near-synonyms (same concept, different words) and homonyms (same word, different concepts).
3. For each concept pick one canonical term, write a definition and list rejected synonyms; create one TERM-nnn item per concept (new id, never reuse) with derivedFrom = the ST/AC ids where it occurs.
4. Detect contradicting domain rules across stories/ACs (e.g. different limits, states or ownership for the same concept) and record each as a finding with the conflicting item ids.
5. Produce findings for every AC/story that uses a non-canonical term or an undefined term; do not rewrite ACs or stories yourself — the findings are change requests for the producers.
6. Evaluate against rubric ubiquitous-language (one term per concept; no contradicting domain rules; all terms in the glossary) and state per criterion pass/partial/fail with reasons as input for the critic loop; never set status passed.
7. Write glossary to artifacts/p6-akzeptanz/ with TERM items in the authored itemIndex (evidence 🧠 inferred unless a TERM comes from a cited SRC).
8. Write the output **body** from `assets/template.md`: Markdown only, no frontmatter (the product-artifact-contract-guard hook rejects a Write that starts with `---`); one file per instance, following the path pattern.
9. Run the self-check below and fix what fails. Never set `passed` yourself — only the critic gate does (Gedächtnis §2.2).
10. **Commit** every output file with its authored block (see "Artifact contract" below): `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/commit-artifact.mjs commit <runDir> <file.md> --step S6.2.3 <<'JSON'` … `JSON`. The script computes id, version, status, derivedFrom, evidence mix and history; fix every rejection it prints and commit again. Re-committing an unchanged file is a no-op.
11. Log: `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/run-state.mjs event <runDir> '{"event":"step-done","element":"S6.2.3"}'`.

## Artifact contract (Gedächtnis §11.2)

Every output is two files: `<file>.md` (the body you write; its frontmatter is rendered read-only from the sidecar) and `<file>.meta.json` (the sidecar, written only by `commit-artifact.mjs`). Read upstream metadata from sidecars, never from rendered frontmatter.

**You supply** the authored block on stdin (`node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/commit-artifact.mjs schema` prints its JSON Schema):

```json
{
  "itemIndex": [
    {
      "id": "TERM-001",
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

## Self-check (rubric `ubiquitous-language` — judged by `product-kritiker-pruefung`)

- [ ] One canonical term per concept; every rejected synonym is listed (ubiquitous-language).
- [ ] No contradicting domain rules left unreported; each conflict names the item ids involved.
- [ ] Every domain term used in any AC or story appears in the glossary.
- [ ] Every TERM has a definition, a new id and derivedFrom to the ST/AC where it occurs.
- [ ] Findings are change requests only; no story or AC text was modified by this step.
- [ ] Criterion-level assessment against the rubric is present; status is not set to passed.

## Pitfalls

- Silently rewriting ACs to the canonical term — the critic role never rewrites artifacts (Gedächtnis §4).
- Treating generic words (user, button, data) as domain terms and bloating the glossary.
- Merging two genuinely different concepts because they share a word (homonym).

## Return

Reply with JSON only: `{"status": "done|blocked|partial", "artifacts": ["<committed .md paths>"], "items": ["<item ids created or changed>"], "riskFlags": [], "summary": "<one sentence>"}`.

## Domain knowledge

See `references/domain-knowledge.md` (cited from notebook "The Product - Business Design"; phase brief `knowledge/phase-5-6-stories-akzeptanz.md`).
