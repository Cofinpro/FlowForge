---
name: product-akteure-identifizieren
description: >-
  Identifies the actors artifact: ACT items (primary, secondary, off-stage) whose behaviour can move each GOAL, informed by the proto panel. Use when the dark-factory workflow reaches step S1.2.2
  "Akteure identifizieren (Who)".
bpmn:
  file: product-vision-to-user-stories.bpmn
  elements: [S1.2.2]
---

# Akteure identifizieren (Who) (step 1.2.2)

Generated from `product-vision-to-user-stories.bpmn`'s "Akteure identifizieren (Who)" (serviceTask, lane "Stratege") by `bpmn2agent-generate`. ACT items are the "Who" level of the impact map; S1.2.3 derives the behaviour changes (IMP) per actor, and the actors later seed the full persona panel and user roles in Phase 2. It is its own skill because it produces an independently versioned artifact with its own contract (body + sidecar), template and rubric (mapping-rubric.md's serviceTask rule; one skill per business step, docs/dark-factory/implementation.md §2).

Executed by the `product-stratege` agent. Binding rules: `${CLAUDE_PLUGIN_ROOT}/knowledge/process-rules.md` — evidence §6, item IDs §10, artifact contract §11.2, iterations §15.

## Run context

The Workflow passes `runDir`, `runId`, `iteration` and `changeRequests` (from the last gate record of this phase).

| Input | Required | Path pattern |
|---|---|---|
| `business-goals` | yes | `runs/{runId}/artifacts/p1-strategie/1.2.1_business-goals.md` |
| `proto-panel` | yes | `runs/{runId}/panel/proto/P-{nnn}_{slug}.md` |

| Output | Item prefix | Cardinality | Path pattern |
|---|---|---|---|
| `actors` | ACT | many | `runs/{runId}/artifacts/p1-strategie/1.2.2_actors.md` |


## Procedure

0. **Resume / iterate.** Read the output's sidecar (`<file>.meta.json`) if it exists. If it has `status: passed`/`passed-with-risk`, or `iteration > 1` and no change request concerns this artifact or an upstream artifact it consumes, return it unchanged (idempotent resume). Otherwise work every change request into the body and keep item IDs stable when the item is materially the same. Do not copy files to `history/` or touch `version` — `commit-artifact.mjs` does both (Gedächtnis §15).
1. Read business-goals (GOAL items, OMTM) and proto-panel (P-items).
2. For each GOAL list everyone whose behaviour can help or hinder it: primary actors (use the product directly, e.g. the segments behind the proto personas), secondary actors (provide services or influence the primary ones) and off-stage actors (affected or able to block, e.g. regulators, partners, competitors' users).
3. Describe each actor as a concrete role in a situation, not a department or "users"; link proto personas that represent the actor (P-ids).
4. Create ACT-<nnn> items with `derivedFrom` = the GOAL id(s) they serve plus P-/SRC ids, and an evidence level (🔗 if a persona trait/SRC backs it, else 🧠).
5. Check coverage: every GOAL has at least one primary actor; flag actors that no GOAL needs and drop them.
6. Write the output **body** from `assets/template.md`: Markdown only, no frontmatter (the product-artifact-contract-guard hook rejects a Write that starts with `---`); one file per instance, following the path pattern.
7. Run the self-check below and fix what fails. Never set `passed` yourself — only the critic gate does (Gedächtnis §2.2).
8. **Commit** every output file with its authored block (see "Artifact contract" below): `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/commit-artifact.mjs commit <runDir> <file.md> --step S1.2.2 <<'JSON'` … `JSON`. The script computes id, version, status, derivedFrom, evidence mix and history; fix every rejection it prints and commit again. Re-committing an unchanged file is a no-op.
9. Log: `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/run-state.mjs event <runDir> '{"event":"step-done","element":"S1.2.2"}'`.

## Artifact contract (Gedächtnis §11.2)

Every output is two files: `<file>.md` (the body you write; its frontmatter is rendered read-only from the sidecar) and `<file>.meta.json` (the sidecar, written only by `commit-artifact.mjs`). Read upstream metadata from sidecars, never from rendered frontmatter.

**You supply** the authored block on stdin (`node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/commit-artifact.mjs schema` prints its JSON Schema):

```json
{
  "itemIndex": [
    {
      "id": "ACT-001",
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

- [ ] Rubric impact-map (actor level): every ACT hangs under at least one GOAL (strict hierarchy Goal → Actor).
- [ ] Primary, secondary and off-stage actors are each considered and labeled.
- [ ] Every GOAL has at least one primary actor.
- [ ] Each actor is a concrete role, not "users" or an internal team; each has derivedFrom and an evidence level.
- [ ] Proto personas are mapped to the actors they represent.

## Pitfalls

- Listing only the end user and missing blockers such as regulators, payers or partners.
- Using the own delivery team as an actor, which later produces fake stories ("As a developer …").
- Actors not linked to a goal, which become orphans in the trace chain.

## Return

Reply with JSON only: `{"status": "done|blocked|partial", "artifacts": ["<committed .md paths>"], "items": ["<item ids created or changed>"], "riskFlags": [], "summary": "<one sentence>"}`.

## Domain knowledge

See `references/domain-knowledge.md` (cited from notebook "The Product - Business Design"; phase brief `knowledge/phase-1-strategie.md`).
