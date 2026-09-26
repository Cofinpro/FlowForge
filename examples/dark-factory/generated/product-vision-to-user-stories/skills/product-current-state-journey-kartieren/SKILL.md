---
name: product-current-state-journey-kartieren
description: >-
  Maps the current-state customer journey (journey-current) of the focal persona before, during and after the job, with touchpoints, thoughts, emotion curve and per-step panel walkthrough comments.
  Use when the dark-factory workflow reaches step 3.1.1 "Current-State-Journey kartieren".
bpmn:
  file: product-vision-to-user-stories.bpmn
  elements: [S3.1.1]
---

# Current-State-Journey kartieren (step 3.1.1)

Generated from `product-vision-to-user-stories.bpmn`'s "Current-State-Journey kartieren" (serviceTask, lane "UX-/Journey-Designer") by `bpmn2agent-generate`. Gives an outside-in picture of how the job is done today, so S3.1.2 can mark hot spots on concrete journey steps and S3.1.3 can design the future state against it. It is its own skill because it produces an independently versioned artifact with its own contract (body + sidecar), template and rubric (mapping-rubric.md's serviceTask rule; one skill per business step, docs/dark-factory/implementation.md §2).

Executed by the `product-ux` agent. Binding rules: `${CLAUDE_PLUGIN_ROOT}/knowledge/process-rules.md` — evidence §6, item IDs §10, artifact contract §11.2, iterations §15.

## Run context

The Workflow passes `runDir`, `runId`, `iteration` and `changeRequests` (from the last gate record of this phase), `panelResult`.

| Input | Required | Path pattern |
|---|---|---|
| `personas` | yes | `runs/{runId}/artifacts/p2-research/2.1.5_personas.md` |
| `jtbd` | yes | `runs/{runId}/artifacts/p2-research/2.1.6_jtbd.md` |
| `research-domaene-prozesse-regulatorik` | yes | `runs/{runId}/research/reports/DR-03_domaene-prozesse-regulatorik.md` |

| Output | Item prefix | Cardinality | Path pattern |
|---|---|---|---|
| `journey-current` | — | one | `runs/{runId}/artifacts/p3-journey/3.1.1_journey-current.md` |

- **Panel** (`walkthrough`, panel set `full`): the Workflow has already run `product-panel-befragung` for this step and passes `panelResult` (the session JSON under `panel/sessions/`). Mark everything taken from it 🤖 synthetic.

## Procedure

0. **Resume / iterate.** Read the output's sidecar (`<file>.meta.json`) if it exists. If it has `status: passed`/`passed-with-risk`, or `iteration > 1` and no change request concerns this artifact or an upstream artifact it consumes, return it unchanged (idempotent resume). Otherwise work every change request into the body and keep item IDs stable when the item is materially the same. Do not copy files to `history/` or touch `version` — `commit-artifact.mjs` does both (Gedächtnis §15).
1. Pick the focal persona (PER-…) and one job (JOB-…) from personas/jtbd; state the scenario and trigger situation in one paragraph, citing both ids.
2. Take the as-is process steps, workarounds and regulatory touchpoints from research-domaene-prozesse-regulatorik (DR-03) and cite them by SRC id; include the Verweigerer workaround as a real current-state path.
3. Lay out stages Before / During / After (journey starts before first contact with any tool and ends after the job is done); give every step a stable local anchor (e.g. `cur.B2`) that S3.1.2 will reference — anchors are not items.
4. For each step record: user action, touchpoint/channel, thought (quote-like), emotion score -2..+2; no internal/system-only steps.
5. Consume the walkthrough panel result passed by the Workflow: attach each persona comment (persona id, step anchor, verbatim gist) to its step and mark it 🤖; where personas diverge, keep separate emotion values per persona and show the spread.
6. Draw the emotion curve as a Mermaid xychart or a text table (step × score); mark candidate moments of truth (largest drops/rises) without yet rating them — rating is S3.1.2.
7. Set evidence per step (🔗 when a DR-03 SRC backs it, 🤖 when only panel comments, 🧠 when inferred) and record it per item in the authored itemIndex (commit-artifact.mjs computes the artifact evidence mix).
8. Write the output **body** from `assets/template.md`: Markdown only, no frontmatter (the product-artifact-contract-guard hook rejects a Write that starts with `---`).
9. Run the self-check below and fix what fails. Never set `passed` yourself — only the critic gate does (Gedächtnis §2.2).
10. **Commit** every output file with its authored block (see "Artifact contract" below): `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/commit-artifact.mjs commit <runDir> <file.md> --step S3.1.1 --from <panelResult> <<'JSON'` … `JSON`. The script computes id, version, status, derivedFrom, evidence mix and history; fix every rejection it prints and commit again. Re-committing an unchanged file is a no-op.
11. Log: `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/run-state.mjs event <runDir> '{"event":"step-done","element":"S3.1.1"}'`.

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

- [ ] Rubric `journey`: phases (Before/During/After), touchpoints and an emotion curve are all present.
- [ ] Outside-in: every step describes what the persona experiences, none is an internal process step.
- [ ] End to end: the first step precedes first contact, the last step follows the transaction/job outcome.
- [ ] Every action is tied to a touchpoint or channel.
- [ ] Every step has at least one panel walkthrough comment marked 🤖 or an explicit note that no persona commented.
- [ ] DR-03 facts are cited by SRC id; nothing from the panel is labelled 🔗.

## Pitfalls

- Drawing a process map (system/back-office steps) instead of a journey map.
- Starting the journey at "opens our app" — the current state has no product of ours yet.
- Averaging persona emotions into one curve and hiding Contrarian/Verweigerer divergence.

## Return

Reply with JSON only: `{"status": "done|blocked|partial", "artifacts": ["<committed .md paths>"], "items": ["<item ids created or changed>"], "riskFlags": [], "summary": "<one sentence>"}`.

## Domain knowledge

See `references/domain-knowledge.md` (cited from notebook "The Product - Business Design"; phase brief `knowledge/phase-3-4-journey-story-map.md`).
