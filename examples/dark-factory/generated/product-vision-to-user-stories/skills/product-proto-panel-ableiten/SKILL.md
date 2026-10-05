---
name: product-proto-panel-ableiten
description: >-
  Derives the proto-panel artifact: exactly 3 synthetic personas P-001..P-003 grounded only in the DR-01 report, every trait backed by an SRC id, each with open and hidden attributes. Use when the
  dark-factory workflow reaches step S1.1.4 "Proto-Panel aus Research ableiten".
bpmn:
  file: product-vision-to-user-stories.bpmn
  elements: [S1.1.4]
---

# Proto-Panel aus Research ableiten (step 1.1.4)

Generated from `product-vision-to-user-stories.bpmn`'s "Proto-Panel aus Research ableiten" (serviceTask, lane "Researcher") by `flowforge-generate`. The proto panel is the synthetic audience for Phase 1 only: it rates the value proposition fit in S1.1.5 (panel mode rating), informs actors in S1.2.2 and votes at G-P1; it is replaced by the full 6-persona panel in 2.1.3. It is its own skill because it produces an independently versioned artifact with its own contract (body + sidecar), template and rubric (mapping-rubric.md's serviceTask rule; one skill per business step, docs/dark-factory/implementation.md §2).

Executed by the `product-researcher` agent. Binding rules: `${CLAUDE_PLUGIN_ROOT}/knowledge/process-rules.md` — evidence §6, item IDs §10, artifact contract §11.2, iterations §15.

## Run context

The Workflow passes `runDir`, `runId`, `iteration` and `changeRequests` (from the last gate record of this phase).

| Input | Required | Path pattern |
|---|---|---|
| `research-markt-wettbewerb` | yes | `runs/{runId}/research/reports/DR-01_markt-wettbewerb.md` |

| Output | Item prefix | Cardinality | Path pattern |
|---|---|---|---|
| `proto-panel` | P | many | `runs/{runId}/panel/proto/P-{nnn}_{slug}.md` |


## Procedure

0. **Resume / iterate.** Read the output's sidecar (`<file>.meta.json`) if it exists. If it has `status: passed`/`passed-with-risk`, or `iteration > 1` and no change request concerns this artifact or an upstream artifact it consumes, return it unchanged (idempotent resume). Otherwise work every change request into the body and keep item IDs stable when the item is materially the same. Do not copy files to `history/` or touch `version` — `commit-artifact.mjs` does both (Gedächtnis §15).
1. Read research-markt-wettbewerb (DR-01) and the SRC artifacts it cites; extract user-related evidence: segments, competitor reviews, forum and social voices, report statements about buyers.
2. Choose exactly 3 personas that differ in segment, context or maturity (e.g. a user of the leading competitor, a user of a workaround, a user from an adjacent/early-adopter segment) as far as DR-01 supports it.
3. For each persona P-<nnn> write the open part (visible to the interviewer): role/title, context, goals, current tools, pains, one "voice" quote. Every trait needs at least one SRC reference; source quotes used as voice are marked 🔗.
4. Write the hidden part (visible only to the persona model): budget/willingness to pay, skepticism level 1–5, current workaround and satisfaction with it, switching barriers, and one "secret" that only comes out with good questioning. Ground each hidden attribute in an SRC as well.
5. Drop any trait you cannot back with an SRC; do not fill gaps with 🧠 inference. If DR-01 cannot support 3 distinct personas, still produce 3 and record the thin grounding as a risk flag.
6. Check the source mix: at least 3 different sourceTypes across the panel, and no persona resting on a single source.
7. Record each persona in `itemIndex` with `derivedFrom` = its SRC ids and evidence level cited 🔗 (the persona itself is a synthetic actor; its traits are cited).
8. Write the output **body** from `assets/template.md`: Markdown only, no frontmatter (the product-artifact-contract-guard hook rejects a Write that starts with `---`); one file per instance, following the path pattern.
9. Run the self-check below and fix what fails. Never set `passed` yourself — only the critic gate does (Gedächtnis §2.2).
10. **Commit** every output file with its authored block (see "Artifact contract" below): `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/commit-artifact.mjs commit <runDir> <file.md> --step S1.1.4 <<'JSON'` … `JSON`. The script computes id, version, status, derivedFrom, evidence mix and history; fix every rejection it prints and commit again. Re-committing an unchanged file is a no-op.
11. Log: `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/run-state.mjs event <runDir> '{"event":"step-done","element":"S1.1.4"}'`.

## Artifact contract (Gedächtnis §11.2)

Every output is two files: `<file>.md` (the body you write; its frontmatter is rendered read-only from the sidecar) and `<file>.meta.json` (the sidecar, written only by `commit-artifact.mjs`). Read upstream metadata from sidecars, never from rendered frontmatter.

**You supply** the authored block on stdin (`node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/commit-artifact.mjs schema` prints its JSON Schema):

```json
{
  "itemIndex": [
    {
      "id": "P-001",
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

## Self-check (rubric `panel-grounding` — judged by `product-kritiker-pruefung`)

- [ ] Exactly 3 personas (P-<nnn>), derived only from DR-01 and its SRC artifacts (Gedächtnis §7.1).
- [ ] Rubric panel-grounding: every trait, open and hidden, carries at least one SRC reference; no un-sourced trait remains (§6, §7.2).
- [ ] Rubric panel-grounding: at least 3 different source types across the panel; no persona relies on only one source.
- [ ] Rubric panel-grounding: hidden attributes are set for every persona: budget/willingness to pay, skepticism 1–5, workaround + satisfaction, switching barriers, secret (§7.3).
- [ ] Open and hidden parts are clearly separated, so the interviewer never sees the hidden part.
- [ ] The 3 personas are distinguishable by segment, context or maturity, not just by name.

## Pitfalls

- Inventing plausible demographic detail with no source, which violates the grounding rule and makes the panel an echo chamber.
- Three near-identical enthusiasts: without skepticism and switching barriers the panel only agrees and G-P1 becomes meaningless.
- Leaking the hidden part (secret, budget) into the open profile.
- Adding a contrarian or refuser: those belong to the full panel in 2.1.3, not the proto panel.

## Return

Reply with JSON only: `{"status": "done|blocked|partial", "artifacts": ["<committed .md paths>"], "items": ["<item ids created or changed>"], "riskFlags": [], "summary": "<one sentence>"}`.

## Domain knowledge

See `references/domain-knowledge.md` (cited from notebook "The Product - Business Design"; phase brief `knowledge/phase-1-strategie.md`).
