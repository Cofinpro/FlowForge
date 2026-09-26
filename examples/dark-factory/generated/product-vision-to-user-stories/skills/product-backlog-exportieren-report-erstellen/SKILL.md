---
name: product-backlog-exportieren-report-erstellen
description: >-
  Exports the cleaned backlog as backlog/backlog.json and writes the run report REPORT.md (MVP scope, evidence mix, risk flags, forced loop exits, top-5 risk assumptions, pivot history, cost/runtime),
  with a partial mode for budget exhaustion and a discarded mode for a no-go. Use when the dark-factory workflow reaches step 7 "7 Abschluss: Backlog exportieren & Run-Report erstellen".
bpmn:
  file: product-vision-to-user-stories.bpmn
  elements: [S7, SP_Budget_S1, S_NoGo]
---

# 7 Abschluss: Backlog exportieren & Run-Report erstellen (step 7)

Generated from `product-vision-to-user-stories.bpmn`'s "7 Abschluss: Backlog exportieren & Run-Report erstellen" (serviceTask, lane "Traceability-Pruefer") by `bpmn2agent-generate`. backlog.json is the product of the run for tracker adapters (Jira, GitHub Issues, Azure Boards) and REPORT.md is the only place a human has to look (Gedächtnis §2.1); the same procedure in partial mode serves the budget event subprocess "Teilergebnis sichern & Run-Report erstellen", and in discarded mode the no-go path "No-Go-Report erstellen" (S_NoGo). It is its own skill because it produces an independently versioned artifact with its own contract (body + sidecar), template and rubric (mapping-rubric.md's serviceTask rule; one skill per business step, docs/dark-factory/implementation.md §2).

Executed by the `product-traceability` agent. Binding rules: `${CLAUDE_PLUGIN_ROOT}/knowledge/process-rules.md` — evidence §6, item IDs §10, artifact contract §11.2, iterations §15.

## Run context

The Workflow passes `runDir`, `runId`, `iteration` and `changeRequests` (from the last gate record of this phase).

| Input | Required | Path pattern |
|---|---|---|
| `backlog-cleaned` | yes | `runs/{runId}/artifacts/p6-akzeptanz/6.2.4_backlog-cleaned.md` |

| Output | Item prefix | Cardinality | Path pattern |
|---|---|---|---|
| `backlog-export` | — | one | `runs/{runId}/backlog/backlog.json` |
| `run-report` | — | one | `runs/{runId}/REPORT.md` |


## Procedure

0. **Resume / iterate.** Read the output's sidecar (`<file>.meta.json`) if it exists. If it has `status: passed`/`passed-with-risk`, or `iteration > 1` and no change request concerns this artifact or an upstream artifact it consumes, return it unchanged (idempotent resume). Otherwise work every change request into the body and keep item IDs stable when the item is materially the same. Do not copy files to `history/` or touch `version` — `commit-artifact.mjs` does both (Gedächtnis §15).
1. Determine the mode: full (normal flow after G-6.2), partial (invoked from SP_Budget after Error_BudgetErschoepft) or discarded (invoked from S_NoGo after a no-go); in partial and discarded mode snapshot the current run state first and do not run any further production step, and in discarded mode skip the backlog export and publishing (see the discarded-mode section).
2. Read backlog-cleaned, glossary, backlog/traceability.md, all gates/G-*.meta.json, run.json and log/events.jsonl; stories and epics come from their records (story.mjs list/show, commit-artifact.mjs query --type epic).
3. Export backlog/backlog.json deterministically: `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/export-backlog.mjs <runDir>` (add `--partial` in partial mode). It builds df.backlog/v1 from the epic and story records (Connextra, size, status, trace chain up to VIS, evidence, assumptions, ACs, spikes, risk flags, gate) and lists consistency `problems`; never write backlog.json yourself.
4. Aggregate the evidence mix (🔗/🧠/🤖 shares) over all backlog items and per phase from the artifact sidecars (derived.evidence); list every riskFlag (e.g. loop-cap-reached, same-model-review) with the artifact/item it sits on, and every forced loop exit (gate records with verdict pass-with-risk) with open criteria.
5. Select the top-5 risk assumptions: ASM items with high importance and low evidence ranked by number of stories whose path rests on them; disclose importance, evidence and story count so the ranking is recomputable.
6. Build the pivot history from G-P2 gate records (pivotCount, verdict, reason) and the cost/runtime from log/events.jsonl (tokens, cost per model role and phase, wall-clock from first to last event, deep-research calls vs. hard cap).
7. Write REPORT.md: status (complete | partial), summary and MVP scope (slice-1 epics/stories, walking skeleton, budget/timebox fit), evidence mix, risk flags & forced loop exits, top-5 risk assumptions, pivot history, cost & runtime, links to backlog.json and traceability.md.
8. In partial mode: set status: partial, record the last completed BPMN step and the interrupting step, list what is missing (phases/artifacts/stories not produced, gates not reached) and run export-backlog.mjs with --partial so backlog.json contains only what exists.
9. Report every entry of the export's `problems` list in REPORT.md under risk flags; in full mode a non-empty list (exit 1) means the backlog is not consistent — say so in the status.
10. Write the output **body** from `assets/template.md`: Markdown only, no frontmatter (the product-artifact-contract-guard hook rejects a Write that starts with `---`).
11. Run the self-check below and fix what fails. Never set `passed` yourself — only the critic gate does (Gedächtnis §2.2).
12. **Commit** every output file with its authored block (see "Artifact contract" below): `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/commit-artifact.mjs commit <runDir> <file.md> --step S7 --type <artifact> <<'JSON'` … `JSON`. The script computes id, version, status, derivedFrom, evidence mix and history; fix every rejection it prints and commit again. Re-committing an unchanged file is a no-op.
13. **Publish** (full mode only, after REPORT.md is committed): `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/publish-results.mjs <runDir>`. It copies REPORT.md, the backlog (epics, active stories, spikes, backlog.json, traceability.md), glossary, strategy, user and story-map artifacts into the target project's publish directory from `.dark-factory/project.json` (default `docs/product/`) and records the runId in `.published.json` there. Without a manifest it publishes nothing and exits 0; a partial run is refused (exit 1). Never copy files there yourself. Name the publish directory and file count in your summary, or "not published" with the reason.
14. **Finish the run** (every mode, last command): `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/run-state.mjs finish <runDir> complete` (partial mode: `partial`, discarded mode: `discarded`). It sets run.json status and clears runs/.active, so the hooks stop treating the run as active.
15. Log: `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/run-state.mjs event <runDir> '{"event":"step-done","element":"S7"}'`.

## Partial mode ("Teilergebnis sichern & Run-Report erstellen")

When the Workflow passes `mode: partial` (budget exhausted — the accepted replacement for the "Budget erschoepft" event sub-process), skip the export of unfinished stories, write `REPORT.md` with `status: partial`, name the BPMN position the run stopped at (`run.json` `position`) and list every missing artifact. Commit `REPORT.md` like every artifact with `--step SP_Budget_S1`, then finish the run with `run-state.mjs finish <runDir> partial` (never publish a partial run).

## Discarded mode ("No-Go-Report erstellen")

When the Workflow passes `mode: discarded` (G-P1/G-P2 said no-go, or the pivot cap was reached) together with `gateRecord`, `reasons` and `pivotCount`, do not export a backlog and do not publish. Write `REPORT.md` with `status: discarded`: the no-go decision and its reasons from the gate record (which rule fired, e.g. refuted kill assumption, problem-ranking kill signal, pivot cap), the kill assumptions and their evidence, the panel votes, the evidence mix of what was produced, the pivot history, what the critic recommended, the change requests that would reopen the idea, risk flags, and cost & runtime. List which phases ran and which never started. Commit `REPORT.md` with `--step S_NoGo`, then finish the run with `run-state.mjs finish <runDir> discarded`.

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

JSON outputs (e.g. `backlog.json`) are data files, not artifacts: write them directly, no commit.

## Self-check (rubric `run-report` — judged by `product-kritiker-pruefung`)

- [ ] REPORT.md contains evidence mix, all risk flags, all forced loop exits, top-5 risk assumptions and cost (rubric run-report).
- [ ] Summary and MVP scope, pivot history and runtime are present; figures trace to gate records and log/events.jsonl.
- [ ] backlog.json is valid JSON with epics, stories, ACs, trace, evidence and risk flags; ids match the run exactly.
- [ ] Every exported story has a complete required trace chain AC → ST → UT → EP/ACTV → (OPP|JOB) → IMP → GOAL → VIS (rubric traceability), or is flagged.
- [ ] Synthetic evidence is reported as 🤖, never presented as validated.
- [ ] Partial mode: status: partial, interruption point and a concrete list of missing parts are stated.
- [ ] Discarded mode: status: discarded, the no-go rule that fired with its gate record, the kill assumptions with evidence and the change requests that would reopen the idea are stated; no backlog.json, nothing published.
- [ ] Top-5 ranking discloses its inputs and is recomputable.
- [ ] Full mode: publish-results.mjs ran after the REPORT.md commit, and its result (published directory or reason for not publishing) is in the step summary.

## Pitfalls

- Hiding pass-with-risk gates or inherited risk flags in the summary to make the run look clean.
- Estimating cost/runtime instead of summing log/events.jsonl.
- Exporting discarded or superseded stories as active backlog items.
- In partial mode, trying to finish missing steps instead of saving and reporting the gap.
- Publishing in partial mode, or writing into the publish directory by hand: only publish-results.mjs writes there.

## Return

Reply with JSON only: `{"status": "done|blocked|partial", "artifacts": ["<committed .md paths>"], "items": ["<item ids created or changed>"], "riskFlags": [], "summary": "<one sentence>"}`.

## Domain knowledge

See `references/domain-knowledge.md` (cited from notebook "The Product - Business Design"; phase brief `knowledge/phase-5-6-stories-akzeptanz.md`).
