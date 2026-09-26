---
name: product-hot-spots-markieren
description: >-
  Marks hot spots and friction points on the current-state journey as HS items, linked to journey steps and PAIN items, with a disclosed severity score. Use when the dark-factory workflow reaches step
  3.1.2 "Hot Spots & Friktionspunkte markieren".
bpmn:
  file: product-vision-to-user-stories.bpmn
  elements: [S3.1.2]
---

# Hot Spots & Friktionspunkte markieren (step 3.1.2)

Generated from `product-vision-to-user-stories.bpmn`'s "Hot Spots & Friktionspunkte markieren" (serviceTask, lane "UX-/Journey-Designer") by `bpmn2agent-generate`. Turns the current journey into a ranked list of HS items that S3.1.3 must address or explicitly skip in the future state and that S4.1.4 turns into edge-case/detail cards; HS is a recommended trace edge (Gedächtnis §10.2). It is its own skill because it produces an independently versioned artifact with its own contract (body + sidecar), template and rubric (mapping-rubric.md's serviceTask rule; one skill per business step, docs/dark-factory/implementation.md §2).

Executed by the `product-ux` agent. Binding rules: `${CLAUDE_PLUGIN_ROOT}/knowledge/process-rules.md` — evidence §6, item IDs §10, artifact contract §11.2, iterations §15.

## Run context

The Workflow passes `runDir`, `runId`, `iteration` and `changeRequests` (from the last gate record of this phase).

| Input | Required | Path pattern |
|---|---|---|
| `journey-current` | yes | `runs/{runId}/artifacts/p3-journey/3.1.1_journey-current.md` |
| `pains-gains` | yes | `runs/{runId}/artifacts/p2-research/2.2.2_pains-gains.md` |

| Output | Item prefix | Cardinality | Path pattern |
|---|---|---|---|
| `hot-spots` | HS | many | `runs/{runId}/artifacts/p3-journey/3.1.2_hot-spots.md` |


## Procedure

0. **Resume / iterate.** Read the output's sidecar (`<file>.meta.json`) if it exists. If it has `status: passed`/`passed-with-risk`, or `iteration > 1` and no change request concerns this artifact or an upstream artifact it consumes, return it unchanged (idempotent resume). Otherwise work every change request into the body and keep item IDs stable when the item is materially the same. Do not copy files to `history/` or touch `version` — `commit-artifact.mjs` does both (Gedächtnis §15).
1. Read journey-current step by step; a hot spot is a step with an emotion ≤ -1, a panel complaint, a documented failure case from DR-03, or a moment of truth.
2. Create one `HS-<nnn>` item per distinct friction point (merge duplicates across steps; never reuse ids); name it from the user's view ("waits for …", "re-enters …").
3. For each HS record: journey anchor(s), type (pain, wait, error, drop-off risk, compliance, moment of truth), affected personas, and `derivedFrom` = matching PAIN-… items from pains-gains plus the anchor evidence.
4. Score severity with a disclosed formula: severity = frequency (share of panel personas who hit it, 0..1) × intensity (|min emotion| on the step, 0..2) + 1 if it is a moment of truth; list the inputs per HS so the critic can recompute.
5. Set evidence per HS: 🔗 if a PAIN or DR-03 SRC cites it, 🤖 if only from panel comments, 🧠 if inferred; list all supporting ids (strongest level wins).
6. Flag PAIN items from pains-gains that do not surface anywhere on the journey (possible journey gap) and HS items with no matching PAIN (possible new pain) in a reconciliation section.
7. Record all HS ids with derivedFrom and evidence in the authored `itemIndex`, sorted by severity.
8. Write the output **body** from `assets/template.md`: Markdown only, no frontmatter (the product-artifact-contract-guard hook rejects a Write that starts with `---`); one file per instance, following the path pattern.
9. Run the self-check below and fix what fails. Never set `passed` yourself — only the critic gate does (Gedächtnis §2.2).
10. **Commit** every output file with its authored block (see "Artifact contract" below): `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/commit-artifact.mjs commit <runDir> <file.md> --step S3.1.2 <<'JSON'` … `JSON`. The script computes id, version, status, derivedFrom, evidence mix and history; fix every rejection it prints and commit again. Re-committing an unchanged file is a no-op.
11. Log: `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/run-state.mjs event <runDir> '{"event":"step-done","element":"S3.1.2"}'`.

## Artifact contract (Gedächtnis §11.2)

Every output is two files: `<file>.md` (the body you write; its frontmatter is rendered read-only from the sidecar) and `<file>.meta.json` (the sidecar, written only by `commit-artifact.mjs`). Read upstream metadata from sidecars, never from rendered frontmatter.

**You supply** the authored block on stdin (`node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/commit-artifact.mjs schema` prints its JSON Schema):

```json
{
  "itemIndex": [
    {
      "id": "HS-001",
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

## Self-check (rubric `journey` — judged by `product-kritiker-pruefung`)

- [ ] Every HS references at least one journey-current anchor and at least one evidence id (PAIN, SRC, T/panel comment or inferred).
- [ ] Rubric `scoring`: severity formula and every input value are shown; the ranking matches the computed values.
- [ ] Every journey step with emotion ≤ -1 is covered by an HS or explicitly dismissed with a reason.
- [ ] Moments of truth are marked as such.
- [ ] PAIN ↔ HS reconciliation lists unmatched items on both sides.
- [ ] Evidence levels follow Gedächtnis §6 (strongest wins, panel-only = 🤖).

## Pitfalls

- Writing solutions into the hot spot ("needs a reminder feature") instead of the friction itself.
- One HS per step by reflex, duplicating the same underlying friction.
- Severity as a gut label (high/medium/low) without disclosed inputs.

## Return

Reply with JSON only: `{"status": "done|blocked|partial", "artifacts": ["<committed .md paths>"], "items": ["<item ids created or changed>"], "riskFlags": [], "summary": "<one sentence>"}`.

## Domain knowledge

See `references/domain-knowledge.md` (cited from notebook "The Product - Business Design"; phase brief `knowledge/phase-3-4-journey-story-map.md`).
