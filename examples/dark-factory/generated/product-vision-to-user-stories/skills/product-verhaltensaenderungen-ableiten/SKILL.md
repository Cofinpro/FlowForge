---
name: product-verhaltensaenderungen-ableiten
description: >-
  Derives the impacts artifact: IMP items as measurable behaviour changes of each actor that move the GOAL. Use when the dark-factory workflow reaches step S1.2.3 "Verhaltensaenderungen ableiten
  (How)".
bpmn:
  file: product-vision-to-user-stories.bpmn
  elements: [S1.2.3]
---

# Verhaltensaenderungen ableiten (How) (step 1.2.3)

Generated from `product-vision-to-user-stories.bpmn`'s "Verhaltensaenderungen ableiten (How)" (serviceTask, lane "UX-/Journey-Designer") by `flowforge-generate`. IMP items are the "How" level and a mandatory link of the trace chain (… → OPP/JOB → IMP → GOAL); S1.2.4 collects deliverables per impact and S1.2.5 scores them by leverage and risk. It is its own skill because it produces an independently versioned artifact with its own contract (body + sidecar), template and rubric (mapping-rubric.md's serviceTask rule; one skill per business step, docs/dark-factory/implementation.md §2).

Executed by the `product-ux` agent. Binding rules: `${CLAUDE_PLUGIN_ROOT}/knowledge/process-rules.md` — evidence §6, item IDs §10, artifact contract §11.2, iterations §15.

## Run context

The Workflow passes `runDir`, `runId`, `iteration` and `changeRequests` (from the last gate record of this phase).

| Input | Required | Path pattern |
|---|---|---|
| `actors` | yes | `runs/{runId}/artifacts/p1-strategie/1.2.2_actors.md` |

| Output | Item prefix | Cardinality | Path pattern |
|---|---|---|---|
| `impacts` | IMP | many | `runs/{runId}/artifacts/p1-strategie/1.2.3_impacts.md` |


## Procedure

0. **Resume / iterate.** Read the output's sidecar (`<file>.meta.json`) if it exists. If it has `status: passed`/`passed-with-risk`, or `iteration > 1` and no change request concerns this artifact or an upstream artifact it consumes, return it unchanged (idempotent resume). Otherwise work every change request into the body and keep item IDs stable when the item is materially the same. Do not copy files to `history/` or touch `version` — `commit-artifact.mjs` does both (Gedächtnis §15).
1. Read actors (ACT items with their GOAL links).
2. For each actor ask: how must this actor's behaviour change so the GOAL moves? Consider helping impacts (start, do more, do faster) and hindering impacts to reduce (stop, do less).
3. Phrase each impact as an observable behaviour change: "<actor> <does X more/less/differently>", with an indicator and, where possible, a direction and target that connects to the OMTM.
4. Reject impacts that are features or product capabilities and rewrite them as the behaviour they are meant to cause.
5. Create IMP-<nnn> items with `derivedFrom` = [ACT-id] (and the GOAL it serves) and an evidence level; add P-/SRC ids where a persona trait supports the behaviour.
6. Check that every ACT has at least one IMP and that no IMP spans several actors.
7. Write the output **body** from `assets/template.md`: Markdown only, no frontmatter (the product-artifact-contract-guard hook rejects a Write that starts with `---`); one file per instance, following the path pattern.
8. Run the self-check below and fix what fails. Never set `passed` yourself — only the critic gate does (Gedächtnis §2.2).
9. **Commit** every output file with its authored block (see "Artifact contract" below): `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/commit-artifact.mjs commit <runDir> <file.md> --step S1.2.3 <<'JSON'` … `JSON`. The script computes id, version, status, derivedFrom, evidence mix and history; fix every rejection it prints and commit again. Re-committing an unchanged file is a no-op.
10. Log: `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/run-state.mjs event <runDir> '{"event":"step-done","element":"S1.2.3"}'`.

## Artifact contract (Gedächtnis §11.2)

Every output is two files: `<file>.md` (the body you write; its frontmatter is rendered read-only from the sidecar) and `<file>.meta.json` (the sidecar, written only by `commit-artifact.mjs`). Read upstream metadata from sidecars, never from rendered frontmatter.

**You supply** the authored block on stdin (`node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/commit-artifact.mjs schema` prints its JSON Schema):

```json
{
  "itemIndex": [
    {
      "id": "IMP-001",
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

- [ ] Rubric impact-map: every IMP is a measurable behaviour change with an indicator, not a feature.
- [ ] Rubric impact-map: strict hierarchy: each IMP belongs to exactly one ACT, which belongs to a GOAL.
- [ ] Every ACT has at least one IMP.
- [ ] Every IMP has derivedFrom and an evidence level.
- [ ] At least one hindering/reducing behaviour is considered where the actor has a workaround.

## Pitfalls

- Writing "user uses feature X" — that is a deliverable in disguise, not a behaviour change.
- Unmeasurable impacts ("users are happier") that cannot be scored in S1.2.5.
- Ignoring the current workaround behaviour the actor must stop.

## Return

Reply with JSON only: `{"status": "done|blocked|partial", "artifacts": ["<committed .md paths>"], "items": ["<item ids created or changed>"], "riskFlags": [], "summary": "<one sentence>"}`.

## Domain knowledge

See `references/domain-knowledge.md` (cited from notebook "The Product - Business Design"; phase brief `knowledge/phase-1-strategie.md`).
