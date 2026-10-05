---
name: product-idee-brief-vervollstaendigen
description: >-
  Completes the raw idea brief into a full idea-brief artifact per Gedächtnis §14 (required and optional fields filled, derived fields marked 🧠 inferred, light WebSearch factcheck). Use when the
  dark-factory workflow reaches step 0 "0 Idee-Brief vervollstaendigen".
bpmn:
  file: product-vision-to-user-stories.bpmn
  elements: [S0]
---

# 0 Idee-Brief vervollstaendigen (step 0)

Generated from `product-vision-to-user-stories.bpmn`'s "0 Idee-Brief vervollstaendigen" (serviceTask, lane "Stratege") by `flowforge-generate`. Gives every later step one complete input contract: DR-01 (Call_R1) and S1.1.1 read idea, market/region and competitors; S1.1.6 turns every 🧠 field into an ASM item; ARC steps and G-4.2 rely on target architecture and budget/timebox. It is its own skill because it produces an independently versioned artifact with its own contract (body + sidecar), template and rubric (mapping-rubric.md's serviceTask rule; one skill per business step, docs/dark-factory/implementation.md §2).

Executed by the `product-stratege` agent. Binding rules: `${CLAUDE_PLUGIN_ROOT}/knowledge/process-rules.md` — evidence §6, item IDs §10, artifact contract §11.2, iterations §15.

## Run context

The Workflow passes `runDir`, `runId`, `iteration` and `changeRequests` (from the last gate record of this phase).

| Input | Required | Path pattern |
|---|---|---|
| `idea-brief` | no | `runs/{runId}/00_idea-brief.md` |

| Output | Item prefix | Cardinality | Path pattern |
|---|---|---|---|
| `idea-brief` | — | one | `runs/{runId}/00_idea-brief.md` |

- **Light research**: `websearch` (factcheck). Free channels only (WebSearch) — never Deep Research or a direct Gemini API call here. Fetch the page text with `node ${CLAUDE_PLUGIN_ROOT}/skills/product-recherche/scripts/providers/raw-fetch.mjs <runDir> --call <step> --tool websearch --query "<q>" --url <u>…`, normalize it with `node ${CLAUDE_PLUGIN_ROOT}/skills/product-recherche/scripts/normalize-sources.mjs <runDir> <raw.json>` and cite only the resulting `SRC-` ids (Gedächtnis §8.0/§8.3).

## Procedure

0. **Resume / iterate.** Read the output's sidecar (`<file>.meta.json`) if it exists. If it has `status: passed`/`passed-with-risk`, or `iteration > 1` and no change request concerns this artifact or an upstream artifact it consumes, return it unchanged (idempotent resume). Otherwise work every change request into the body and keep item IDs stable when the item is materially the same. Do not copy files to `history/` or touch `version` — `commit-artifact.mjs` does both (Gedächtnis §15).
1. Read the raw brief `runs/<runId>/00_idea-brief.md` (input idea-brief, optional; written by run-state init from the idea text, brief file or input folder). If it has no explicit `idee` field, take its leading idea/problem statement verbatim as `idee`. If there is no idea at all, stop and return an error: it is the only field that cannot be derived.
2. If `runs/<runId>/input/` exists (the user passed a folder), read every file there as user-provided material; relative links in the brief resolve against that folder. Values the user states in these files count as `given` (cite the file as `input/<file>`), not 🧠. Their own citations are not factory evidence: only SRC ids count, so re-check a claim you rely on with the light factcheck below. List the input files you used in a section "User input material" so DR-01 and later steps know they exist.
3. Build the §14 field table with one row per field: idee, markt/region, ausgabesprache, zielgruppe-hypothese, wettbewerber, strategische-richtung, budget/timebox, zielarchitektur/plattform, constraints. Copy every user-provided value verbatim and mark its origin `given`; never rewrite given values.
4. Read the target project's manifest `<runDir>/../../.dark-factory/project.json` if it exists (df.project/v1). Its `platform` fills zielarchitektur/plattform and its `language` fills ausgabesprache; mark both origin `given (project manifest)`, not 🧠. A value in the raw brief wins over the manifest; if they differ, keep the brief value and note the conflict. Empty manifest fields (`""`, `null`) count as missing.
5. Fill each missing field by the §14 rule: markt/region derived from the idea plus WebSearch; ausgabesprache defaults to `de`; zielgruppe-hypothese, strategische-richtung and constraints (regulation, no-gos) derived from the idea; budget/timebox and zielarchitektur/plattform as a plausible assumption with a one-sentence justification. Mark each such value 🧠 inferred and give its reasoning.
6. Leave `wettbewerber` empty when not given and note "filled by DR-01"; do not research competitors here.
7. Run a light WebSearch/WebFetch factcheck (max. a few queries) on checkable claims: the named market/region, obvious regulation for the domain, and any factual claim inside the idea. Normalize every retrieved source with `node skills/product-recherche/scripts/normalize-sources.mjs` into `research/sources/SRC-*.md` and cite it by SRC id. A field confirmed by a source becomes 🔗 cited; a refuted given value stays verbatim but gets a conflict note.
8. Write the section "Inferred fields → ASM" listing every 🧠 field with a one-line assumption statement, so S1.1.6 can take each over as an ASM item without re-interpretation.
9. Compute the evidence mix over the fields (given fields excluded from the mix, listed separately) and list all SRC ids in `sources`.
10. Write the output **body** from `assets/template.md`: Markdown only, no frontmatter (the product-artifact-contract-guard hook rejects a Write that starts with `---`).
11. Run the self-check below and fix what fails. Never set `passed` yourself — only the critic gate does (Gedächtnis §2.2).
12. **Commit** every output file with its authored block (see "Artifact contract" below): `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/commit-artifact.mjs commit <runDir> <file.md> --step S0 <<'JSON'` … `JSON`. The script computes id, version, status, derivedFrom, evidence mix and history; fix every rejection it prints and commit again. Re-committing an unchanged file is a no-op.
13. Log: `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/run-state.mjs event <runDir> '{"event":"step-done","element":"S0"}'`.

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

## Self-check (rubric `idea-brief` — judged by `product-kritiker-pruefung`)

- [ ] Rubric idea-brief: all required fields (idee, markt/region, ausgabesprache, budget/timebox, zielarchitektur/plattform) are filled.
- [ ] Rubric idea-brief: every derived field is marked 🧠 inferred with a stated reasoning; no derived value is presented as given.
- [ ] Rubric idea-brief: budget/timebox and target architecture/platform are present and justified (§14).
- [ ] Every given value is verbatim from the raw brief; conflicts found by the factcheck are noted, not silently corrected.
- [ ] Every web claim cites a normalized SRC id; no raw URL without an SRC artifact.
- [ ] The "Inferred fields → ASM" list contains exactly the 🧠 fields of the table.
- [ ] The idea is framed as a customer problem, not a feature list; if the raw brief is feature-only, strategische-richtung notes that the problem is still open.
- [ ] zielarchitektur/plattform and ausgabesprache come from the raw brief or the project manifest (origin given) whenever either provides them; 🧠 only when both are silent.

## Pitfalls

- Doing competitor or market research here: DR-01 owns the corpus; step 0 only does a light factcheck.
- Inventing a concrete budget or tech stack without a justification, or hiding it as if the user had provided it.
- Polishing or reinterpreting the user's idea sentence instead of keeping it verbatim.
- Forgetting the ASM hand-off list, so inferred brief fields never get tested as assumptions.

## Return

Reply with JSON only: `{"status": "done|blocked|partial", "artifacts": ["<committed .md paths>"], "items": ["<item ids created or changed>"], "riskFlags": [], "summary": "<one sentence>"}`.

## Domain knowledge

See `references/domain-knowledge.md` (cited from notebook "The Product - Business Design"; phase brief `knowledge/phase-1-strategie.md`).
