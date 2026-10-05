---
name: product-synthetische-interviews-durchfuehren
description: >-
  Produces interview-transcripts: consolidates the 6 panel interview transcripts that product-panel-befragung (mode interview, full panel) already recorded into T items with an index, quality flags
  and the problem-ranking synthesis that raises or clears the G-P2 kill signal. Use when the dark-factory workflow reaches step S2.1.4 "Synthetische Interviews durchfuehren".
bpmn:
  file: product-vision-to-user-stories.bpmn
  elements: [S2.1.4]
---

# Synthetische Interviews durchfuehren (step 2.1.4)

Generated from `product-vision-to-user-stories.bpmn`'s "Synthetische Interviews durchfuehren" (callActivity, lane "Interviewer") by `flowforge-generate`. Is the synthetic evidence base (🤖 T items) that S2.1.5 personas, S2.1.6 JTBD and S2.2.1 empathy maps are built from; its problem-ranking synthesis feeds the SP2.1 critic and gate G-P2. It is its own skill because it produces an independently versioned artifact with its own contract (body + sidecar), template and rubric (mapping-rubric.md's serviceTask rule; one skill per business step, docs/dark-factory/implementation.md §2).

Executed by the `product-interviewer` agent. Binding rules: `${CLAUDE_PLUGIN_ROOT}/knowledge/process-rules.md` — evidence §6, item IDs §10, artifact contract §11.2, iterations §15.

## Run context

The Workflow passes `runDir`, `runId`, `iteration` and `changeRequests` (from the last gate record of this phase), `panelResult`.

| Input | Required | Path pattern |
|---|---|---|
| `interview-guide` | yes | `runs/{runId}/panel/guides/2.1.2_interview-guide.md` |
| `panel-profiles` | yes | `runs/{runId}/panel/personas/P-{nnn}_{slug}.md` |

| Output | Item prefix | Cardinality | Path pattern |
|---|---|---|---|
| `interview-transcripts` | T | many | `runs/{runId}/panel/transcripts/T-{nn}_P-{nnn}_{slug}.md` |

- **Panel** (`interview`, panel set `full`): the Workflow has already run `product-panel-befragung` for this step and passes `panelResult` (the session JSON under `panel/sessions/`). Mark everything taken from it 🤖 synthetic.

## Procedure

0. **Resume / iterate.** Read the output's sidecar (`<file>.meta.json`) if it exists. If it has `status: passed`/`passed-with-risk`, or `iteration > 1` and no change request concerns this artifact or an upstream artifact it consumes, return it unchanged (idempotent resume). Otherwise work every change request into the body and keep item IDs stable when the item is materially the same. Do not copy files to `history/` or touch `version` — `commit-artifact.mjs` does both (Gedächtnis §15).
1. Read the panel result the Workflow passed (product-panel-befragung, mode interview, panelSet full) and locate one raw transcript per persona under panel/; do not play, extend or re-ask any persona yourself — this step only consolidates.
2. Match transcripts against panel-profiles (the 6 P items) and interview-guide (version): if a persona's transcript is missing or was run on a different guide version, record it as a blocker in the index and in the return summary instead of filling the gap.
3. Assign one T-<nnn> item per transcript (file naming T-<nnn>_P-<nnn> per Gedächtnis §7.4) with derivedFrom = [P id, interview-guide@version], evidence synthetic 🤖, and the persona modelRole/model from the panel result.
4. Keep each transcript verbatim; add per transcript the quality flags only: persona stayed in role (y/n with line refs), "don't know"/"don't care" answers left unreinterpreted, leading questions or solution shown before the last third (with question ids), stages of the guide covered.
5. Extract per transcript the problem ranking: the order in which the 3 problems were shown (from the guide's permutation table), the persona's ranking, and the stated workaround with its cost/satisfaction.
6. Write the problem-ranking synthesis: table persona × problem rank; per target-user persona flag "core problem ranked last or not in its top 3"; raise the kill signal for G-P2 when this holds for ≥3 of 4 target users, report Contrarian and Verweigerer rankings separately (they do not count toward the majority); note any position bias visible across permutations.
7. List per transcript the objections of Contrarian and Verweigerer verbatim (they must be addressed at G-P2) and the ASM ids each transcript supports or contradicts; mark all panel-derived statements 🤖 synthetic and record the T items in itemIndex.
8. Write the output **body** from `assets/template.md`: Markdown only, no frontmatter (the product-artifact-contract-guard hook rejects a Write that starts with `---`); one file per instance, following the path pattern.
9. Run the self-check below and fix what fails. Never set `passed` yourself — only the critic gate does (Gedächtnis §2.2).
10. **Commit** every output file with its authored block (see "Artifact contract" below): `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/commit-artifact.mjs commit <runDir> <file.md> --step S2.1.4 --from <panelResult> <<'JSON'` … `JSON`. The script computes id, version, status, derivedFrom, evidence mix and history; fix every rejection it prints and commit again. Re-committing an unchanged file is a no-op.
11. Log: `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/run-state.mjs event <runDir> '{"event":"step-done","element":"S2.1.4"}'`.

## Artifact contract (Gedächtnis §11.2)

Every output is two files: `<file>.md` (the body you write; its frontmatter is rendered read-only from the sidecar) and `<file>.meta.json` (the sidecar, written only by `commit-artifact.mjs`). Read upstream metadata from sidecars, never from rendered frontmatter.

**You supply** the authored block on stdin (`node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/commit-artifact.mjs schema` prints its JSON Schema):

```json
{
  "itemIndex": [
    {
      "id": "T-001",
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

## Self-check (rubric `transcript` — judged by `product-kritiker-pruefung`)

- [ ] Exactly one T item per P item of the full panel, each with guide version and model role; missing ones are reported as blockers, never fabricated (rubric transcript: complete).
- [ ] Transcripts are verbatim from the panel result; no answer was added or rewritten by this step (rubric transcript: persona stayed in role).
- [ ] No "don't know"/"don't care" answer is reinterpreted in flags or synthesis (rubric transcript).
- [ ] The problem-ranking synthesis shows the shown order and the ranking per persona and states the kill signal explicitly (raised / not raised) with the ≥3-of-4 target-user count.
- [ ] Contrarian and Verweigerer rankings and objections are reported separately and excluded from the majority.
- [ ] Every T item is marked 🤖 synthetic with derivedFrom P id + interview-guide@version.

## Pitfalls

- Re-playing or "completing" a persona to close a gap in a transcript — that breaks the model-family separation and fakes evidence.
- Reading the hidden part of panel-profiles to judge answers; the interviewer role only knows the open part.
- Softening a "meh" ranking of the core problem in the synthesis, which hides the G-P2 kill signal.
- Averaging Contrarian and Verweigerer into the target-user ranking.

## Return

Reply with JSON only: `{"status": "done|blocked|partial", "artifacts": ["<committed .md paths>"], "items": ["<item ids created or changed>"], "riskFlags": [], "summary": "<one sentence>"}`.

## Domain knowledge

See `references/domain-knowledge.md` (cited from notebook "The Product - Business Design"; phase brief `knowledge/phase-2-discovery.md`).
