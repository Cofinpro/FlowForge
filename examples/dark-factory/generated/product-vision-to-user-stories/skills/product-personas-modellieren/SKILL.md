---
name: product-personas-modellieren
description: >-
  Produces personas: PER items (concrete user roles) condensed from the interview transcripts, each with 1–3 JTBD, top-2 pains, top-2 gains, a trigger situation and T/SRC evidence. Use when the
  dark-factory workflow reaches step S2.1.5 "User Roles & Personas modellieren".
bpmn:
  file: product-vision-to-user-stories.bpmn
  elements: [S2.1.5]
---

# User Roles & Personas modellieren (step 2.1.5)

Generated from `product-vision-to-user-stories.bpmn`'s "User Roles & Personas modellieren" (serviceTask, lane "UX-/Journey-Designer") by `flowforge-generate`. Gives S2.1.6, S2.2.1, S3.1.1, S4.1.1 and S6.1.2 the concrete roles every later job, journey and story is written for; its evidence mix decides the G-P2 "more research" route. It is its own skill because it produces an independently versioned artifact with its own contract (body + sidecar), template and rubric (mapping-rubric.md's serviceTask rule; one skill per business step, docs/dark-factory/implementation.md §2).

Executed by the `product-ux` agent. Binding rules: `${CLAUDE_PLUGIN_ROOT}/knowledge/process-rules.md` — evidence §6, item IDs §10, artifact contract §11.2, iterations §15.

## Run context

The Workflow passes `runDir`, `runId`, `iteration` and `changeRequests` (from the last gate record of this phase).

| Input | Required | Path pattern |
|---|---|---|
| `interview-transcripts` | yes | `runs/{runId}/panel/transcripts/T-{nn}_P-{nnn}_{slug}.md` |

| Output | Item prefix | Cardinality | Path pattern |
|---|---|---|---|
| `personas` | PER | many | `runs/{runId}/artifacts/p2-research/2.1.5_personas.md` |


## Procedure

0. **Resume / iterate.** Read the output's sidecar (`<file>.meta.json`) if it exists. If it has `status: passed`/`passed-with-risk`, or `iteration > 1` and no change request concerns this artifact or an upstream artifact it consumes, return it unchanged (idempotent resume). Otherwise work every change request into the body and keep item IDs stable when the item is materially the same. Do not copy files to `history/` or touch `version` — `commit-artifact.mjs` does both (Gedächtnis §15).
1. Read interview-transcripts: the T index, the verbatim transcripts, workarounds, objections and the problem-ranking synthesis; note the kill-signal status.
2. Identify user roles across the interaction space first: cluster the target-user transcripts by shared context, goal and behaviour (two P can merge into one role, one P can reveal two roles); give each role a concrete title, never "user".
3. Condense each role into a PER-<nnn> persona using only quotes and observed behaviour from the transcripts: role title, context, trigger situation, 1–3 jobs in plain words (formalised in S2.1.6), top-2 pains and top-2 gains, current workaround.
4. Strengthen evidence: for every persona statement cite the T ids and, where the research-zielgruppe-voc SRC ids behind the underlying panel-profile trait support it, the SRC id as well (🔗 beats 🤖); aim for ≥50 % cited statements.
5. Fold Verweigerer and Contrarian insights into the matching PER as "adoption barriers" (switching barriers, objections) instead of modelling them as separate target personas.
6. Record per PER item derivedFrom (T ids, P ids) and one evidence level (strongest applicable), in the authored itemIndex; if the committed evidence mix shows a cited share < 50 %, add a risk flag (G-P2 "more research" risk).
7. Write the output **body** from `assets/template.md`: Markdown only, no frontmatter (the product-artifact-contract-guard hook rejects a Write that starts with `---`); one file per instance, following the path pattern.
8. Run the self-check below and fix what fails. Never set `passed` yourself — only the critic gate does (Gedächtnis §2.2).
9. **Commit** every output file with its authored block (see "Artifact contract" below): `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/commit-artifact.mjs commit <runDir> <file.md> --step S2.1.5 <<'JSON'` … `JSON`. The script computes id, version, status, derivedFrom, evidence mix and history; fix every rejection it prints and commit again. Re-committing an unchanged file is a no-op.
10. Log: `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/run-state.mjs event <runDir> '{"event":"step-done","element":"S2.1.5"}'`.

## Artifact contract (Gedächtnis §11.2)

Every output is two files: `<file>.md` (the body you write; its frontmatter is rendered read-only from the sidecar) and `<file>.meta.json` (the sidecar, written only by `commit-artifact.mjs`). Read upstream metadata from sidecars, never from rendered frontmatter.

**You supply** the authored block on stdin (`node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/commit-artifact.mjs schema` prints its JSON Schema):

```json
{
  "itemIndex": [
    {
      "id": "PER-001",
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

## Self-check (rubric `persona` — judged by `product-kritiker-pruefung`)

- [ ] Every PER has a concrete role title, not a generic user (rubric persona).
- [ ] Every PER has 1–3 JTBD, exactly top-2 pains and top-2 gains, and one trigger situation (rubric persona).
- [ ] Every persona statement cites T and/or SRC ids; nothing is invented (rubric persona).
- [ ] Each PER lists derivedFrom T/P ids and exactly one evidence level; the evidence mix is recorded and a cited share < 50 % is flagged.
- [ ] Contrarian/Verweigerer objections appear as adoption barriers on the matching PER.

## Pitfalls

- The mythical generic user built from averages, which opens the door for pet features.
- Copying panel-profiles 1:1 as personas instead of condensing transcript facts into roles.
- Adding demographic colour (names, hobbies) with no T/SRC backing.

## Return

Reply with JSON only: `{"status": "done|blocked|partial", "artifacts": ["<committed .md paths>"], "items": ["<item ids created or changed>"], "riskFlags": [], "summary": "<one sentence>"}`.

## Domain knowledge

See `references/domain-knowledge.md` (cited from notebook "The Product - Business Design"; phase brief `knowledge/phase-2-discovery.md`).
