---
name: product-backbone-destillieren
description: >-
  Distils the story-map backbone from the narrative into User Activities (ACTV), User Tasks (UT) and one Epic (EP) per activity, and writes one epic file per EP into the run backlog. Use when the
  dark-factory workflow reaches step 4.1.3 "Backbone destillieren (Activities & Tasks)".
bpmn:
  file: product-vision-to-user-stories.bpmn
  elements: [S4.1.3]
---

# Backbone destillieren (Activities & Tasks) (step 4.1.3)

Generated from `product-vision-to-user-stories.bpmn`'s "Backbone destillieren (Activities & Tasks)" (serviceTask, lane "Backlog-Autor") by `bpmn2agent-generate`. Creates the ACTV/UT/EP skeleton of the trace chain (UT → EP/ACTV → OPP|JOB) that S4.1.4 details, S4.2.x slices and S5.1.1 turns into stories; S6.2.1/6.2.2 traverse it for orphan checks. It is its own skill because it produces an independently versioned artifact with its own contract (body + sidecar), template and rubric (mapping-rubric.md's serviceTask rule; one skill per business step, docs/dark-factory/implementation.md §2).

Executed by the `product-backlog-autor` agent. Binding rules: `${CLAUDE_PLUGIN_ROOT}/knowledge/process-rules.md` — evidence §6, item IDs §10, artifact contract §11.2, iterations §15.

## Run context

The Workflow passes `runDir`, `runId`, `iteration` and `changeRequests` (from the last gate record of this phase).

| Input | Required | Path pattern |
|---|---|---|
| `narrative-flow` | yes | `runs/{runId}/artifacts/p4-story-map/4.1.2_narrative-flow.md` |

| Output | Item prefix | Cardinality | Path pattern |
|---|---|---|---|
| `backbone` | ACTV | one | `runs/{runId}/artifacts/p4-story-map/4.1.3_backbone.md` |


## Procedure

0. **Resume / iterate.** Read the output's sidecar (`<file>.meta.json`) if it exists. If it has `status: passed`/`passed-with-risk`, or `iteration > 1` and no change request concerns this artifact or an upstream artifact it consumes, return it unchanged (idempotent resume). Otherwise work every change request into the body and keep item IDs stable when the item is materially the same. Do not copy files to `history/` or touch `version` — `commit-artifact.mjs` does both (Gedächtnis §15).
1. Group the narrative-flow beats into user activities (verb phrase of a user goal, e.g. "plan the week"); create `ACTV-<nnn>` items in narrative order, derivedFrom the beats' OPP/JOB ids and journey anchors.
2. Under each activity list the user tasks at walking level (one verb, one user intent); create `UT-<nnn>` items, each derivedFrom exactly one ACTV plus the beat's OPP/HS ids; order them left to right.
3. Create one `EP-<nnn>` per ACTV (1:1 default; merge or split only with a written reason); each EP is derivedFrom its ACTV and the OPP or JOB it serves so the chain EP/ACTV → (OPP | JOB) → IMP → GOAL is unbroken — name the IMP/GOAL reached via the OPP.
4. Write one file per epic at `runs/<runId>/backlog/epics/EP-<nnn>_<slug>.md` (file name = EP item id + kebab slug) containing only a 3–5 line body (user goal, outcome, in/out of scope), then commit each with `--type epic`: authored itemIndex = the EP item, attributes {title, actv, tasks [UT ids], goal, slice: null} (slice is set later by S4.2.5).
5. Keep the backbone solution-independent: activity and task names describe user intent, never screens, APIs or components.
6. Render the backbone as a Markdown grid (columns = ACTV in narrative order, rows = UT) plus the ACTV → EP mapping table.
7. Assign evidence per item (strongest of its derivedFrom sources, Gedächtnis §6) and record all ACTV, UT and EP ids with derivedFrom and evidence in the authored `itemIndex`.
8. Write the output **body** from `assets/template.md`: Markdown only, no frontmatter (the product-artifact-contract-guard hook rejects a Write that starts with `---`).
9. Run the self-check below and fix what fails. Never set `passed` yourself — only the critic gate does (Gedächtnis §2.2).
10. **Commit** every output file with its authored block (see "Artifact contract" below): `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/commit-artifact.mjs commit <runDir> <file.md> --step S4.1.3 <<'JSON'` … `JSON`. The script computes id, version, status, derivedFrom, evidence mix and history; fix every rejection it prints and commit again. Re-committing an unchanged file is a no-op.
11. Log: `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/run-state.mjs event <runDir> '{"event":"step-done","element":"S4.1.3"}'`.

## Artifact contract (Gedächtnis §11.2)

Every output is two files: `<file>.md` (the body you write; its frontmatter is rendered read-only from the sidecar) and `<file>.meta.json` (the sidecar, written only by `commit-artifact.mjs`). Read upstream metadata from sidecars, never from rendered frontmatter.

**You supply** the authored block on stdin (`node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/commit-artifact.mjs schema` prints its JSON Schema):

```json
{
  "itemIndex": [
    {
      "id": "ACTV-001",
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

Epic files (`backlog/epics/EP-<nnn>_<slug>.md`) are committed separately with `--type epic`, one per EP item, e.g. `{"itemIndex": [{"id": "EP-001", "derivedFrom": ["ACTV-001", "OPP-002"], "evidence": "inferred"}], "attributes": {"title": "…", "actv": "ACTV-001", "tasks": ["UT-001"], "goal": "GOAL-001", "slice": null}}`.

## Self-check (rubric `story-map` — judged by `product-kritiker-pruefung`)

- [ ] Rubric `story-map` (partial): horizontal axis follows the narrative; no orphaned cards — every UT sits under exactly one ACTV and every ACTV has ≥ 1 UT.
- [ ] Every EP traces via its ACTV to at least one OPP or JOB, and onward to IMP and GOAL (Gedächtnis §10.2).
- [ ] Backbone is solution-independent (no UI/tech words in ACTV/UT titles).
- [ ] One epic file exists per EP id under backlog/epics/, committed as type `epic` with attributes.slice = null.
- [ ] IDs are new and unique in the run; none reused.
- [ ] Every narrative beat is covered by at least one UT or listed as intentionally dropped.

## Pitfalls

- Activities that are really features or system components ("notification service").
- Tasks too fine (clicks) or too coarse (another activity) — mixed altitudes break slicing.
- Epic files that drift from the itemIndex (different titles, missing UT list).

## Return

Reply with JSON only: `{"status": "done|blocked|partial", "artifacts": ["<committed .md paths>"], "items": ["<item ids created or changed>"], "riskFlags": [], "summary": "<one sentence>"}`.

## Domain knowledge

See `references/domain-knowledge.md` (cited from notebook "The Product - Business Design"; phase brief `knowledge/phase-3-4-journey-story-map.md`).
