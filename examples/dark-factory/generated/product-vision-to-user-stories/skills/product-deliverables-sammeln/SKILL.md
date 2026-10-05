---
name: product-deliverables-sammeln
description: >-
  Collects deliverables as options under each impact and assembles the complete impact-map artifact (GOAL → ACT → IMP → DEL). Use when the dark-factory workflow reaches step S1.2.4 "Deliverables als
  Optionen sammeln (What)".
bpmn:
  file: product-vision-to-user-stories.bpmn
  elements: [S1.2.4]
---

# Deliverables als Optionen sammeln (What) (step 1.2.4)

Generated from `product-vision-to-user-stories.bpmn`'s "Deliverables als Optionen sammeln (What)" (serviceTask, lane "Stratege") by `flowforge-generate`. DEL items are the "What" options that S1.2.5 prioritizes and S1.2.6 sequences; the impact map as a whole is the traceable backbone that Phase 2–4 opportunities and epics hang from. It is its own skill because it produces an independently versioned artifact with its own contract (body + sidecar), template and rubric (mapping-rubric.md's serviceTask rule; one skill per business step, docs/dark-factory/implementation.md §2).

Executed by the `product-stratege` agent. Binding rules: `${CLAUDE_PLUGIN_ROOT}/knowledge/process-rules.md` — evidence §6, item IDs §10, artifact contract §11.2, iterations §15.

## Run context

The Workflow passes `runDir`, `runId`, `iteration` and `changeRequests` (from the last gate record of this phase).

| Input | Required | Path pattern |
|---|---|---|
| `impacts` | yes | `runs/{runId}/artifacts/p1-strategie/1.2.3_impacts.md` |

| Output | Item prefix | Cardinality | Path pattern |
|---|---|---|---|
| `impact-map` | DEL | one | `runs/{runId}/artifacts/p1-strategie/1.2.4_impact-map.md` |


## Procedure

0. **Resume / iterate.** Read the output's sidecar (`<file>.meta.json`) if it exists. If it has `status: passed`/`passed-with-risk`, or `iteration > 1` and no change request concerns this artifact or an upstream artifact it consumes, return it unchanged (idempotent resume). Otherwise work every change request into the body and keep item IDs stable when the item is materially the same. Do not copy files to `history/` or touch `version` — `commit-artifact.mjs` does both (Gedächtnis §15).
1. Read impacts (IMP items with ACT and GOAL links).
2. For each IMP brainstorm several alternative deliverables that could cause the behaviour change: features, content, services, campaigns, partnerships, process changes — including non-software options.
3. Create DEL-<nnn> items with `derivedFrom: [IMP-id]`, a one-line hypothesis ("if we deliver X, actor Y will Z") and an evidence level.
4. Mark every DEL explicitly as an option, not a commitment, and note the condition under which it would be dropped (the IMP target is reached, or a cheaper option works).
5. Assemble the full impact map as a Mermaid tree and as a table: GOAL → ACT → IMP → DEL, one parent per node.
6. Check that no DEL hangs directly under a GOAL or ACT and that every IMP has at least one option (ideally 2+).
7. Write the output **body** from `assets/template.md`: Markdown only, no frontmatter (the product-artifact-contract-guard hook rejects a Write that starts with `---`).
8. Run the self-check below and fix what fails. Never set `passed` yourself — only the critic gate does (Gedächtnis §2.2).
9. **Commit** every output file with its authored block (see "Artifact contract" below): `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/commit-artifact.mjs commit <runDir> <file.md> --step S1.2.4 <<'JSON'` … `JSON`. The script computes id, version, status, derivedFrom, evidence mix and history; fix every rejection it prints and commit again. Re-committing an unchanged file is a no-op.
10. Log: `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/run-state.mjs event <runDir> '{"event":"step-done","element":"S1.2.4"}'`.

## Artifact contract (Gedächtnis §11.2)

Every output is two files: `<file>.md` (the body you write; its frontmatter is rendered read-only from the sidecar) and `<file>.meta.json` (the sidecar, written only by `commit-artifact.mjs`). Read upstream metadata from sidecars, never from rendered frontmatter.

**You supply** the authored block on stdin (`node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/commit-artifact.mjs schema` prints its JSON Schema):

```json
{
  "itemIndex": [
    {
      "id": "DEL-001",
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

## Self-check (rubric `impact-map` — judged by `product-kritiker-pruefung`)

- [ ] Rubric impact-map: strict hierarchy Goal → Actor → Impact → Deliverable; every DEL has exactly one IMP parent.
- [ ] Rubric impact-map: deliverables are phrased as options with a drop condition, not as commitments (Adzic).
- [ ] Rubric impact-map: impacts remain measurable behaviour changes in the assembled map.
- [ ] Every IMP has at least one DEL; most have more than one alternative.
- [ ] Every DEL has derivedFrom, a hypothesis and an evidence level.

## Pitfalls

- Only one deliverable per impact, which turns the options list into a hidden feature commitment.
- Copying the Lean Canvas solution list without tying each item to a behaviour change.
- Deliverables attached to a goal directly, skipping actor and impact.

## Return

Reply with JSON only: `{"status": "done|blocked|partial", "artifacts": ["<committed .md paths>"], "items": ["<item ids created or changed>"], "riskFlags": [], "summary": "<one sentence>"}`.

## Domain knowledge

See `references/domain-knowledge.md` (cited from notebook "The Product - Business Design"; phase brief `knowledge/phase-1-strategie.md`).
