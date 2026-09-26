---
name: product-pov-hmw-formulieren
description: >-
  Produces pov-hmw: one solution-neutral Point-of-View sentence per persona need and HMW items derived from it, each focused on one persona and scoped neither too broad nor too narrow. Use when the
  dark-factory workflow reaches step S2.2.3 "Point of View & How-Might-We formulieren".
bpmn:
  file: product-vision-to-user-stories.bpmn
  elements: [S2.2.3]
---

# Point of View & How-Might-We formulieren (step 2.2.3)

Generated from `product-vision-to-user-stories.bpmn`'s "Point of View & How-Might-We formulieren" (serviceTask, lane "UX-/Journey-Designer") by `bpmn2agent-generate`. Feeds S2.2.4, where each opportunity grows from HMW questions, and S4.1.1 story mapping. It is its own skill because it produces an independently versioned artifact with its own contract (body + sidecar), template and rubric (mapping-rubric.md's serviceTask rule; one skill per business step, docs/dark-factory/implementation.md §2).

Executed by the `product-ux` agent. Binding rules: `${CLAUDE_PLUGIN_ROOT}/knowledge/process-rules.md` — evidence §6, item IDs §10, artifact contract §11.2, iterations §15.

## Run context

The Workflow passes `runDir`, `runId`, `iteration` and `changeRequests` (from the last gate record of this phase).

| Input | Required | Path pattern |
|---|---|---|
| `pains-gains` | yes | `runs/{runId}/artifacts/p2-research/2.2.2_pains-gains.md` |

| Output | Item prefix | Cardinality | Path pattern |
|---|---|---|---|
| `pov-hmw` | HMW | one | `runs/{runId}/artifacts/p2-research/2.2.3_pov-hmw.md` |


## Procedure

0. **Resume / iterate.** Read the output's sidecar (`<file>.meta.json`) if it exists. If it has `status: passed`/`passed-with-risk`, or `iteration > 1` and no change request concerns this artifact or an upstream artifact it consumes, return it unchanged (idempotent resume). Otherwise work every change request into the body and keep item IDs stable when the item is materially the same. Do not copy files to `history/` or touch `version` — `commit-artifact.mjs` does both (Gedächtnis §15).
1. Read pains-gains; select per PER the high-severity PAINs and high-relevance GAINs.
2. Write one POV per persona need: "[PER role] needs a way to [need as verb] because [surprising insight]", where the insight comes from an empathy-map contradiction behind the PAIN/GAIN.
3. Derive 2–5 HMW-<nnn> items per POV ("How might we … for [PER] …?"), each targeting one need of one persona.
4. Test each HMW for scope: too broad (could be answered by anything, e.g. "improve the experience") or too narrow (already names a solution); rewrite until neither.
5. Remove solution language from POV and HMW (no feature, channel or technology).
6. Record per HMW derivedFrom (PAIN/GAIN ids, PER id) and the evidence level inherited from its strongest source; write the item index.
7. Write the output **body** from `assets/template.md`: Markdown only, no frontmatter (the product-artifact-contract-guard hook rejects a Write that starts with `---`).
8. Run the self-check below and fix what fails. Never set `passed` yourself — only the critic gate does (Gedächtnis §2.2).
9. **Commit** every output file with its authored block (see "Artifact contract" below): `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/commit-artifact.mjs commit <runDir> <file.md> --step S2.2.3 <<'JSON'` … `JSON`. The script computes id, version, status, derivedFrom, evidence mix and history; fix every rejection it prints and commit again. Re-committing an unchanged file is a no-op.
10. Log: `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/run-state.mjs event <runDir> '{"event":"step-done","element":"S2.2.3"}'`.

## Artifact contract (Gedächtnis §11.2)

Every output is two files: `<file>.md` (the body you write; its frontmatter is rendered read-only from the sidecar) and `<file>.meta.json` (the sidecar, written only by `commit-artifact.mjs`). Read upstream metadata from sidecars, never from rendered frontmatter.

**You supply** the authored block on stdin (`node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/commit-artifact.mjs schema` prints its JSON Schema):

```json
{
  "itemIndex": [
    {
      "id": "HMW-001",
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

## Self-check (rubric `pov-hmw` — judged by `product-kritiker-pruefung`)

- [ ] Every POV and HMW is solution-neutral (rubric pov-hmw).
- [ ] Every POV and HMW focuses on one persona and one need (rubric pov-hmw).
- [ ] Every POV follows "[Persona] needs a way to [verb] because [insight]" and the insight traces to a contradiction.
- [ ] Every HMW is neither too broad nor too narrow, with the scope test noted.
- [ ] Every HMW has derivedFrom PAIN/GAIN and PER ids.

## Pitfalls

- An insight that restates the need instead of something surprising from the transcripts.
- HMW questions that encode the planned solution ("How might we add a dashboard…").
- One HMW mixing the needs of several personas.

## Return

Reply with JSON only: `{"status": "done|blocked|partial", "artifacts": ["<committed .md paths>"], "items": ["<item ids created or changed>"], "riskFlags": [], "summary": "<one sentence>"}`.

## Domain knowledge

See `references/domain-knowledge.md` (cited from notebook "The Product - Business Design"; phase brief `knowledge/phase-2-discovery.md`).
