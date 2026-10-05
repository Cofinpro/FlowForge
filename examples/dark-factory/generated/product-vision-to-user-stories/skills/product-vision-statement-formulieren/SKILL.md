---
name: product-vision-statement-formulieren
description: >-
  Formulates the vision-statement artifact with one VIS item (Moore template or NABC) plus a high-concept elevator pitch derived from the zielbild. Use when the dark-factory workflow reaches step
  S1.1.2 "Vision Statement & Elevator Pitch formulieren".
bpmn:
  file: product-vision-to-user-stories.bpmn
  elements: [S1.1.2]
---

# Vision Statement & Elevator Pitch formulieren (step 1.1.2)

Generated from `product-vision-to-user-stories.bpmn`'s "Vision Statement & Elevator Pitch formulieren" (serviceTask, lane "Stratege") by `flowforge-generate`. VIS-001 is the root of the mandatory trace chain (… → IMP → GOAL → VIS); S1.1.3 builds the Lean Canvas UVP from it and S1.2.1 derives the business goals and the OMTM from it. It is its own skill because it produces an independently versioned artifact with its own contract (body + sidecar), template and rubric (mapping-rubric.md's serviceTask rule; one skill per business step, docs/dark-factory/implementation.md §2).

Executed by the `product-stratege` agent. Binding rules: `${CLAUDE_PLUGIN_ROOT}/knowledge/process-rules.md` — evidence §6, item IDs §10, artifact contract §11.2, iterations §15.

## Run context

The Workflow passes `runDir`, `runId`, `iteration` and `changeRequests` (from the last gate record of this phase).

| Input | Required | Path pattern |
|---|---|---|
| `zielbild` | yes | `runs/{runId}/artifacts/p1-strategie/1.1.1_zielbild.md` |

| Output | Item prefix | Cardinality | Path pattern |
|---|---|---|---|
| `vision-statement` | VIS | one | `runs/{runId}/artifacts/p1-strategie/1.1.2_vision-statement.md` |


## Procedure

0. **Resume / iterate.** Read the output's sidecar (`<file>.meta.json`) if it exists. If it has `status: passed`/`passed-with-risk`, or `iteration > 1` and no change request concerns this artifact or an upstream artifact it consumes, return it unchanged (idempotent resume). Otherwise work every change request into the body and keep item IDs stable when the item is materially the same. Do not copy files to `history/` or touch `version` — `commit-artifact.mjs` does both (Gedächtnis §15).
1. Read zielbild: core problem, target customer, alternatives, target picture.
2. Fill Moore's template completely: For <target customer> who <need/problem>, the <product name> is a <product category> that <core benefit>. Unlike <primary alternative>, our product <unique differentiator>. Use NABC (Need, Approach, Benefits, Competition) only if the template does not fit, and say why.
3. Name the primary alternative concretely, taken from the zielbild status quo (competitor or workaround), not "other solutions".
4. Write a high-concept pitch ("X for Y") and an elevator pitch of at most 3 sentences.
5. Create item VIS-001 with `derivedFrom` pointing to the zielbild statements/SRC ids it rests on and one evidence level (strongest of the underlying evidence).
6. Strip buzzwords (e.g. "innovative", "seamless", "AI-powered", "next-generation") and check the statement against the zielbild: every part must be traceable to it.
7. Write the output **body** from `assets/template.md`: Markdown only, no frontmatter (the product-artifact-contract-guard hook rejects a Write that starts with `---`).
8. Run the self-check below and fix what fails. Never set `passed` yourself — only the critic gate does (Gedächtnis §2.2).
9. **Commit** every output file with its authored block (see "Artifact contract" below): `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/commit-artifact.mjs commit <runDir> <file.md> --step S1.1.2 <<'JSON'` … `JSON`. The script computes id, version, status, derivedFrom, evidence mix and history; fix every rejection it prints and commit again. Re-committing an unchanged file is a no-op.
10. Log: `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/run-state.mjs event <runDir> '{"event":"step-done","element":"S1.1.2"}'`.

## Artifact contract (Gedächtnis §11.2)

Every output is two files: `<file>.md` (the body you write; its frontmatter is rendered read-only from the sidecar) and `<file>.meta.json` (the sidecar, written only by `commit-artifact.mjs`). Read upstream metadata from sidecars, never from rendered frontmatter.

**You supply** the authored block on stdin (`node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/commit-artifact.mjs schema` prints its JSON Schema):

```json
{
  "itemIndex": [
    {
      "id": "VIS-001",
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

## Self-check (rubric `vision-statement` — judged by `product-kritiker-pruefung`)

- [ ] Rubric vision-statement: Moore template complete (For … who … the … is a … that … Unlike … our product …) or NABC with justification.
- [ ] Rubric vision-statement: no buzzwords.
- [ ] Rubric vision-statement: target customer is concrete (a segment with a situation, not "everyone" or "users").
- [ ] The statement names target customer, problem and a unique differentiator and fits on one page or less.
- [ ] Exactly one VIS item (VIS-001 unless the run already has one) with derivedFrom and an evidence level.
- [ ] The high-concept pitch and elevator pitch do not contradict the vision statement.

## Pitfalls

- A generic target customer ("small businesses") that later makes actors and personas unfalsifiable.
- Differentiation claims that are features ("has an app") instead of a unique benefit versus the named alternative.
- Writing a strategy essay instead of a one-page statement.

## Return

Reply with JSON only: `{"status": "done|blocked|partial", "artifacts": ["<committed .md paths>"], "items": ["<item ids created or changed>"], "riskFlags": [], "summary": "<one sentence>"}`.

## Domain knowledge

See `references/domain-knowledge.md` (cited from notebook "The Product - Business Design"; phase brief `knowledge/phase-1-strategie.md`).
