---
name: product-jtbd-formulieren
description: >-
  Produces jtbd: JOB items in "When …, I want to …, so I can …" syntax per persona, solution-neutral and covering functional, emotional and social jobs, each traced to T/SRC evidence. Use when the
  dark-factory workflow reaches step S2.1.6 "Jobs-to-be-Done formulieren".
bpmn:
  file: product-vision-to-user-stories.bpmn
  elements: [S2.1.6]
---

# Jobs-to-be-Done formulieren (step 2.1.6)

Generated from `product-vision-to-user-stories.bpmn`'s "Jobs-to-be-Done formulieren" (serviceTask, lane "UX-/Journey-Designer") by `bpmn2agent-generate`. JOB items are a link in the mandatory trace chain (OPP | JOB → IMP) and feed the journeys in S3.1.1; the SP2.1 critic and G-P2 judge their evidence mix. It is its own skill because it produces an independently versioned artifact with its own contract (body + sidecar), template and rubric (mapping-rubric.md's serviceTask rule; one skill per business step, docs/dark-factory/implementation.md §2).

Executed by the `product-ux` agent. Binding rules: `${CLAUDE_PLUGIN_ROOT}/knowledge/process-rules.md` — evidence §6, item IDs §10, artifact contract §11.2, iterations §15.

## Run context

The Workflow passes `runDir`, `runId`, `iteration` and `changeRequests` (from the last gate record of this phase).

| Input | Required | Path pattern |
|---|---|---|
| `personas` | yes | `runs/{runId}/artifacts/p2-research/2.1.5_personas.md` |
| `interview-transcripts` | yes | `runs/{runId}/panel/transcripts/T-{nn}_P-{nnn}_{slug}.md` |

| Output | Item prefix | Cardinality | Path pattern |
|---|---|---|---|
| `jtbd` | JOB | many | `runs/{runId}/artifacts/p2-research/2.1.6_jtbd.md` |


## Procedure

0. **Resume / iterate.** Read the output's sidecar (`<file>.meta.json`) if it exists. If it has `status: passed`/`passed-with-risk`, or `iteration > 1` and no change request concerns this artifact or an upstream artifact it consumes, return it unchanged (idempotent resume). Otherwise work every change request into the body and keep item IDs stable when the item is materially the same. Do not copy files to `history/` or touch `version` — `commit-artifact.mjs` does both (Gedächtnis §15).
1. Read personas (PER items and their plain-language jobs) and interview-transcripts (story and workaround passages).
2. For each PER write 1–3 JOB-<nnn> items in the syntax "When [situation], I want to [motivation], so I can [expected result]", taking the situation from the trigger and past-behaviour stories.
3. Cover the job dimensions: at least one functional job per PER and, where transcripts show it, an emotional or social job; label each JOB functional / emotional / social.
4. Strip solution language: no UI elements, features, devices or technology in any part; rewrite needs as verbs.
5. Link each JOB to the IMP item(s) of the impact-map it serves (via the PER's ACT) so the trace chain JOB → IMP → GOAL is closed; flag JOBs that match no IMP as potential scope gaps.
6. Record per JOB derivedFrom (PER id, T ids, IMP id), evidence refs (T and SRC where available) and one evidence level in the authored itemIndex (the evidence mix is computed on commit).
7. Write the output **body** from `assets/template.md`: Markdown only, no frontmatter (the product-artifact-contract-guard hook rejects a Write that starts with `---`); one file per instance, following the path pattern.
8. Run the self-check below and fix what fails. Never set `passed` yourself — only the critic gate does (Gedächtnis §2.2).
9. **Commit** every output file with its authored block (see "Artifact contract" below): `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/commit-artifact.mjs commit <runDir> <file.md> --step S2.1.6 <<'JSON'` … `JSON`. The script computes id, version, status, derivedFrom, evidence mix and history; fix every rejection it prints and commit again. Re-committing an unchanged file is a no-op.
10. Log: `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/run-state.mjs event <runDir> '{"event":"step-done","element":"S2.1.6"}'`.

## Artifact contract (Gedächtnis §11.2)

Every output is two files: `<file>.md` (the body you write; its frontmatter is rendered read-only from the sidecar) and `<file>.meta.json` (the sidecar, written only by `commit-artifact.mjs`). Read upstream metadata from sidecars, never from rendered frontmatter.

**You supply** the authored block on stdin (`node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/commit-artifact.mjs schema` prints its JSON Schema):

```json
{
  "itemIndex": [
    {
      "id": "JOB-001",
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

## Self-check (rubric `jtbd` — judged by `product-kritiker-pruefung`)

- [ ] Every JOB follows "When …, I want to …, so I can …" exactly (rubric jtbd).
- [ ] No JOB mentions UI, a feature or a technology (rubric jtbd: implementation-neutral).
- [ ] Every PER has 1–3 JOBs and at least one emotional or social job exists across the artifact where transcripts support it.
- [ ] Every JOB has derivedFrom with a PER id, ≥1 T or SRC reference and an IMP link, or an explicit "no IMP" flag.
- [ ] The evidence mix is recorded; cited share < 50 % is flagged for G-P2.

## Pitfalls

- Smuggling the solution into the motivation ("I want to use an app to…").
- Situations that are generic ("When I work…") instead of the concrete trigger from a past story.
- Duplicating the same job for several personas instead of referencing shared jobs once.

## Return

Reply with JSON only: `{"status": "done|blocked|partial", "artifacts": ["<committed .md paths>"], "items": ["<item ids created or changed>"], "riskFlags": [], "summary": "<one sentence>"}`.

## Domain knowledge

See `references/domain-knowledge.md` (cited from notebook "The Product - Business Design"; phase brief `knowledge/phase-2-discovery.md`).
