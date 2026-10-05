---
name: product-stakeholder-quellen-identifizieren
description: >-
  Produces the stakeholder-matrix that lists every stakeholder group, user role and requirement source (with SRC ids and source types) and assigns the full-panel slots and elicitation technique per
  group. Use when the dark-factory workflow reaches step S2.1.1 "Stakeholder & Anforderungsquellen identifizieren".
bpmn:
  file: product-vision-to-user-stories.bpmn
  elements: [S2.1.1]
---

# Stakeholder & Anforderungsquellen identifizieren (step 2.1.1)

Generated from `product-vision-to-user-stories.bpmn`'s "Stakeholder & Anforderungsquellen identifizieren" (serviceTask, lane "Researcher") by `flowforge-generate`. Tells S2.1.2 whom the interview guide must address and which assumptions each group can speak to, and fixes the segment coverage (4 target-user slots, Contrarian, Verweigerer) that S2.1.3 grounds the full panel against. It is its own skill because it produces an independently versioned artifact with its own contract (body + sidecar), template and rubric (mapping-rubric.md's serviceTask rule; one skill per business step, docs/dark-factory/implementation.md §2).

Executed by the `product-researcher` agent. Binding rules: `${CLAUDE_PLUGIN_ROOT}/knowledge/process-rules.md` — evidence §6, item IDs §10, artifact contract §11.2, iterations §15.

## Run context

The Workflow passes `runDir`, `runId`, `iteration` and `changeRequests` (from the last gate record of this phase).

| Input | Required | Path pattern |
|---|---|---|
| `impact-map` | yes | `runs/{runId}/artifacts/p1-strategie/1.2.4_impact-map.md` |
| `actors` | yes | `runs/{runId}/artifacts/p1-strategie/1.2.2_actors.md` |
| `research-zielgruppe-voc` | yes | `runs/{runId}/research/reports/DR-02_zielgruppe-voc.md` |

| Output | Item prefix | Cardinality | Path pattern |
|---|---|---|---|
| `stakeholder-matrix` | — | one | `runs/{runId}/artifacts/p2-research/2.1.1_stakeholder-matrix.md` |


## Procedure

0. **Resume / iterate.** Read the output's sidecar (`<file>.meta.json`) if it exists. If it has `status: passed`/`passed-with-risk`, or `iteration > 1` and no change request concerns this artifact or an upstream artifact it consumes, return it unchanged (idempotent resume). Otherwise work every change request into the body and keep item IDs stable when the item is materially the same. Do not copy files to `history/` or touch `version` — `commit-artifact.mjs` does both (Gedächtnis §15).
1. Read impact-map and actors: list every ACT item (primary, secondary, off-stage) with its IMP items; each becomes a candidate stakeholder row that keeps its ACT id.
2. Read research-zielgruppe-voc: extract the target-group segments (at least 2) with their distinguishing traits and the SRC ids of their voice-of-customer evidence; attach each segment to the ACT rows it refines, and add rows for groups the corpus reveals but the impact-map lacks (evidence 🔗, flag "not in impact-map").
3. Name each user role concretely (e.g. "Part-time bookkeeper in a 5-person firm", never "user"); split an ACT into several roles when the corpus shows different contexts or maturity levels.
4. For every row record: influence and interest (high/medium/low, each with a one-line reason), requirement sources as SRC ids plus their sourceType (forum, review, app store, report, social, docs), and the gap in source types still missing for that group.
5. Choose the elicitation technique per row from what dark mode can reach: synthetic interview (panel), synthetic rating, desk research of VoC sources; mark human-only techniques (contextual inquiry, observation) as "not reachable in dark mode".
6. Propose the full-panel slot allocation (Gedächtnis §7.1): 4 target-user slots spread over different segments, contexts and maturity levels, 1 Contrarian slot (skeptical of the core assumption), 1 Verweigerer slot (in the target group, working workaround, no intent to switch); name the stakeholder row and the source-type gaps for each slot so S2.1.3 can direct its DDG discovery.
7. Mark every cell's evidence level (🔗 with SRC, 🧠 inferred from ACT/IMP) and record the rows as items and every SRC id in the authored block (itemIndex, sources); commit-artifact.mjs computes the evidence mix.
8. Write the output **body** from `assets/template.md`: Markdown only, no frontmatter (the product-artifact-contract-guard hook rejects a Write that starts with `---`).
9. Run the self-check below and fix what fails. Never set `passed` yourself — only the critic gate does (Gedächtnis §2.2).
10. **Commit** every output file with its authored block (see "Artifact contract" below): `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/commit-artifact.mjs commit <runDir> <file.md> --step S2.1.1 <<'JSON'` … `JSON`. The script computes id, version, status, derivedFrom, evidence mix and history; fix every rejection it prints and commit again. Re-committing an unchanged file is a no-op.
11. Log: `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/run-state.mjs event <runDir> '{"event":"step-done","element":"S2.1.1"}'`.

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

## Self-check

- [ ] Every ACT item from impact-map/actors appears in a row or is explicitly excluded with a reason.
- [ ] At least 2 segments from research-zielgruppe-voc are covered, each with its distinguishing trait and ≥1 SRC.
- [ ] Every role label is a concrete role title, no generic "user" or "customer".
- [ ] Every requirement source is an SRC id with a sourceType; no uncited 🔗 claim.
- [ ] The panel slot allocation names exactly 4 target-user slots on distinct segment/context/maturity combinations plus 1 Contrarian and 1 Verweigerer slot.
- [ ] Every row carries an elicitation technique that dark mode can execute, or is flagged not reachable.

## Pitfalls

- Copying the ACT list unchanged, so all 4 target-user slots end up in one segment and the panel cannot disagree.
- Listing stakeholders by demographics only instead of by role, context and job, which leaves S2.1.2 nothing to ask about.
- Treating the own team or the product owner as a stakeholder with user requirements (seeds fake stories later).

## Return

Reply with JSON only: `{"status": "done|blocked|partial", "artifacts": ["<committed .md paths>"], "items": ["<item ids created or changed>"], "riskFlags": [], "summary": "<one sentence>"}`.

## Domain knowledge

See `references/domain-knowledge.md` (cited from notebook "The Product - Business Design"; phase brief `knowledge/phase-2-discovery.md`).
