---
name: product-future-state-journey-entwerfen
description: >-
  Designs the future-state customer journey (journey-future) that resolves the hot spots via backlog opportunities, validated by a panel walkthrough. Use when the dark-factory workflow reaches step
  3.1.3 "Future-State-Journey entwerfen".
bpmn:
  file: product-vision-to-user-stories.bpmn
  elements: [S3.1.3]
---

# Future-State-Journey entwerfen (step 3.1.3)

Generated from `product-vision-to-user-stories.bpmn`'s "Future-State-Journey entwerfen" (serviceTask, lane "UX-/Journey-Designer") by `bpmn2agent-generate`. Defines the target experience that S3.1.4 blueprints into frontstage/backstage layers and that S4.1.2 retells as the story-map narrative. It is its own skill because it produces an independently versioned artifact with its own contract (body + sidecar), template and rubric (mapping-rubric.md's serviceTask rule; one skill per business step, docs/dark-factory/implementation.md §2).

Executed by the `product-ux` agent. Binding rules: `${CLAUDE_PLUGIN_ROOT}/knowledge/process-rules.md` — evidence §6, item IDs §10, artifact contract §11.2, iterations §15.

## Run context

The Workflow passes `runDir`, `runId`, `iteration` and `changeRequests` (from the last gate record of this phase), `panelResult`.

| Input | Required | Path pattern |
|---|---|---|
| `hot-spots` | yes | `runs/{runId}/artifacts/p3-journey/3.1.2_hot-spots.md` |
| `opportunity-backlog` | yes | `runs/{runId}/artifacts/p2-research/2.2.5_opportunity-backlog.md` |

| Output | Item prefix | Cardinality | Path pattern |
|---|---|---|---|
| `journey-future` | — | one | `runs/{runId}/artifacts/p3-journey/3.1.3_journey-future.md` |

- **Panel** (`walkthrough`, panel set `full`): the Workflow has already run `product-panel-befragung` for this step and passes `panelResult` (the session JSON under `panel/sessions/`). Mark everything taken from it 🤖 synthetic.

## Procedure

0. **Resume / iterate.** Read the output's sidecar (`<file>.meta.json`) if it exists. If it has `status: passed`/`passed-with-risk`, or `iteration > 1` and no change request concerns this artifact or an upstream artifact it consumes, return it unchanged (idempotent resume). Otherwise work every change request into the body and keep item IDs stable when the item is materially the same. Do not copy files to `history/` or touch `version` — `commit-artifact.mjs` does both (Gedächtnis §15).
1. Start from the current journey stages; for each HS-… (highest severity first) decide: address (which future step, which OPP-… from opportunity-backlog) or skip (reason: out of scope, low severity, not ours to fix).
2. Write the future journey Before / During / After with local anchors (`fut.B1` …), action, touchpoint, thought, target emotion; mark new or changed touchpoints versus the current state.
3. Keep it outside-in and solution-light: describe what the persona experiences, not UI widgets; any screen idea is a text/Mermaid region sketch only, no images (Gedächtnis §4).
4. Consume the walkthrough panel result: per future step and persona, the comment, whether they would take this path, remaining friction; mark all 🤖 and keep Contrarian and Verweigerer objections verbatim with an answer or a risk flag.
5. Draw current vs. future emotion curves side by side (Mermaid xychart or table) and name the moments of truth the future state must win.
6. Build the HS coverage table: every HS → addressed-by (future anchor + OPP) or skipped-with-reason; every future step lists derivedFrom (HS, OPP, JOB).
7. Record new assumptions the future state relies on (e.g. "persona will connect X") as candidates for ASM, flagged 🧠, in an assumptions section.
8. Write the output **body** from `assets/template.md`: Markdown only, no frontmatter (the product-artifact-contract-guard hook rejects a Write that starts with `---`).
9. Run the self-check below and fix what fails. Never set `passed` yourself — only the critic gate does (Gedächtnis §2.2).
10. **Commit** every output file with its authored block (see "Artifact contract" below): `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/commit-artifact.mjs commit <runDir> <file.md> --step S3.1.3 --from <panelResult> <<'JSON'` … `JSON`. The script computes id, version, status, derivedFrom, evidence mix and history; fix every rejection it prints and commit again. Re-committing an unchanged file is a no-op.
11. Log: `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/run-state.mjs event <runDir> '{"event":"step-done","element":"S3.1.3"}'`.

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

## Self-check (rubric `journey` — judged by `product-kritiker-pruefung`)

- [ ] Rubric `journey`: phases, touchpoints and emotion curve present; every HS is addressed or skipped with a reason.
- [ ] Every addressed HS names the OPP (or JOB) that resolves it.
- [ ] Outside-in and end to end (before first contact to after the job outcome).
- [ ] Panel walkthrough comments exist per step, are 🤖, and Contrarian/Verweigerer objections are answered or risk-flagged.
- [ ] No images; any wireframe is text/Mermaid.
- [ ] Current vs. future emotion comparison is shown.

## Pitfalls

- Describing the product feature list in journey form instead of the experience.
- Silently dropping low-severity HS instead of listing them as skipped with reason.
- Letting the panel rubber-stamp: ignoring the Verweigerer who stays on the workaround.

## Return

Reply with JSON only: `{"status": "done|blocked|partial", "artifacts": ["<committed .md paths>"], "items": ["<item ids created or changed>"], "riskFlags": [], "summary": "<one sentence>"}`.

## Domain knowledge

See `references/domain-knowledge.md` (cited from notebook "The Product - Business Design"; phase brief `knowledge/phase-3-4-journey-story-map.md`).
