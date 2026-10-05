---
name: product-pains-gains-extrahieren
description: >-
  Produces pains-gains: PAIN and GAIN items per persona derived from the empathy-map contradictions and needs, each with severity/relevance and traced evidence. Use when the dark-factory workflow
  reaches step S2.2.2 "Pains & Gains extrahieren".
bpmn:
  file: product-vision-to-user-stories.bpmn
  elements: [S2.2.2]
---

# Pains & Gains extrahieren (step 2.2.2)

Generated from `product-vision-to-user-stories.bpmn`'s "Pains & Gains extrahieren" (serviceTask, lane "UX-/Journey-Designer") by `flowforge-generate`. Feeds S2.2.3 (POV/HMW) and S3.1.2 (journey hot spots); PAIN is a recommended edge in the trace chain. It is its own skill because it produces an independently versioned artifact with its own contract (body + sidecar), template and rubric (mapping-rubric.md's serviceTask rule; one skill per business step, docs/dark-factory/implementation.md §2).

Executed by the `product-ux` agent. Binding rules: `${CLAUDE_PLUGIN_ROOT}/knowledge/process-rules.md` — evidence §6, item IDs §10, artifact contract §11.2, iterations §15.

## Run context

The Workflow passes `runDir`, `runId`, `iteration` and `changeRequests` (from the last gate record of this phase).

| Input | Required | Path pattern |
|---|---|---|
| `empathy-maps` | yes | `runs/{runId}/artifacts/p2-research/2.2.1_empathy-maps.md` |

| Output | Item prefix | Cardinality | Path pattern |
|---|---|---|---|
| `pains-gains` | PAIN | one | `runs/{runId}/artifacts/p2-research/2.2.2_pains-gains.md` |


## Procedure

0. **Resume / iterate.** Read the output's sidecar (`<file>.meta.json`) if it exists. If it has `status: passed`/`passed-with-risk`, or `iteration > 1` and no change request concerns this artifact or an upstream artifact it consumes, return it unchanged (idempotent resume). Otherwise work every change request into the body and keep item IDs stable when the item is materially the same. Do not copy files to `history/` or touch `version` — `commit-artifact.mjs` does both (Gedächtnis §15).
1. Read empathy-maps: per PER the contradictions, needs and Say & Do quotes.
2. Derive a PAIN-<nnn> item from each contradiction or negative experience (frustration, risk, cost, obstacle in the current workaround), phrased from the persona's view and solution-free.
3. Derive GAIN-<nnn> items (Gedächtnis §10.1 PAIN / GAIN) for desired outcomes and benefits the persona expressed or implied; label each gain required / expected / desired.
4. Rate each PAIN severity and each GAIN relevance (high/medium/low) with a one-line reason tied to transcript behaviour (time or money spent, frequency), not to the team's opinion.
5. Check consistency with personas: every PER's top-2 pains and top-2 gains must appear; flag any new pain that outranks them.
6. Record per item derivedFrom (empathy-map contradiction id, PER id, T ids) and one evidence level in the authored itemIndex.
7. Write the output **body** from `assets/template.md`: Markdown only, no frontmatter (the product-artifact-contract-guard hook rejects a Write that starts with `---`).
8. Run the self-check below and fix what fails. Never set `passed` yourself — only the critic gate does (Gedächtnis §2.2).
9. **Commit** every output file with its authored block (see "Artifact contract" below): `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/commit-artifact.mjs commit <runDir> <file.md> --step S2.2.2 <<'JSON'` … `JSON`. The script computes id, version, status, derivedFrom, evidence mix and history; fix every rejection it prints and commit again. Re-committing an unchanged file is a no-op.
10. Log: `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/run-state.mjs event <runDir> '{"event":"step-done","element":"S2.2.2"}'`.

## Artifact contract (Gedächtnis §11.2)

Every output is two files: `<file>.md` (the body you write; its frontmatter is rendered read-only from the sidecar) and `<file>.meta.json` (the sidecar, written only by `commit-artifact.mjs`). Read upstream metadata from sidecars, never from rendered frontmatter.

**You supply** the authored block on stdin (`node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/commit-artifact.mjs schema` prints its JSON Schema):

```json
{
  "itemIndex": [
    {
      "id": "PAIN-001",
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

- [ ] Every PAIN/GAIN is phrased from the persona's perspective and names no solution or feature.
- [ ] Every item traces to an empathy-map contradiction or quote with T ids.
- [ ] Every PAIN has severity and every GAIN has relevance with a behaviour-based reason.
- [ ] Every PER's top-2 pains and gains from personas are present.
- [ ] IDs are new and never reused; each item has exactly one evidence level.

## Pitfalls

- Writing gains as features ("has an export button") instead of outcomes.
- Listing the absence of the product as a pain ("no app for X").
- Inflating severity for pains that match the planned solution.

## Return

Reply with JSON only: `{"status": "done|blocked|partial", "artifacts": ["<committed .md paths>"], "items": ["<item ids created or changed>"], "riskFlags": [], "summary": "<one sentence>"}`.

## Domain knowledge

See `references/domain-knowledge.md` (cited from notebook "The Product - Business Design"; phase brief `knowledge/phase-2-discovery.md`).
