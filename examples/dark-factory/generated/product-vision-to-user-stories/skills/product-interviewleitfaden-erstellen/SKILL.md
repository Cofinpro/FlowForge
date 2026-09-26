---
name: product-interviewleitfaden-erstellen
description: >-
  Produces the interview-guide: a four-stage past-behaviour interview (qualifier, story, problem ranking with workaround, solution last) that covers every kill assumption and fixes the shuffled top-3
  problem order per persona. Use when the dark-factory workflow reaches step S2.1.2 "Erhebungstechniken & Interviewleitfaden erstellen".
bpmn:
  file: product-vision-to-user-stories.bpmn
  elements: [S2.1.2]
---

# Erhebungstechniken & Interviewleitfaden erstellen (step 2.1.2)

Generated from `product-vision-to-user-stories.bpmn`'s "Erhebungstechniken & Interviewleitfaden erstellen" (serviceTask, lane "Interviewer") by `bpmn2agent-generate`. Is the script the panel interview (product-panel-befragung, mode interview) follows in S2.1.4; its problem-ranking block is what S2.1.4 synthesises into the G-P2 kill signal, and the SP2.1 critic judges it against rubric interview-guide. It is its own skill because it produces an independently versioned artifact with its own contract (body + sidecar), template and rubric (mapping-rubric.md's serviceTask rule; one skill per business step, docs/dark-factory/implementation.md §2).

Executed by the `product-interviewer` agent. Binding rules: `${CLAUDE_PLUGIN_ROOT}/knowledge/process-rules.md` — evidence §6, item IDs §10, artifact contract §11.2, iterations §15.

## Run context

The Workflow passes `runDir`, `runId`, `iteration` and `changeRequests` (from the last gate record of this phase).

| Input | Required | Path pattern |
|---|---|---|
| `stakeholder-matrix` | yes | `runs/{runId}/artifacts/p2-research/2.1.1_stakeholder-matrix.md` |
| `assumptions-map` | yes | `runs/{runId}/artifacts/p1-strategie/1.1.6_assumptions-map.md` |

| Output | Item prefix | Cardinality | Path pattern |
|---|---|---|---|
| `interview-guide` | — | one | `runs/{runId}/panel/guides/2.1.2_interview-guide.md` |


## Procedure

0. **Resume / iterate.** Read the output's sidecar (`<file>.meta.json`) if it exists. If it has `status: passed`/`passed-with-risk`, or `iteration > 1` and no change request concerns this artifact or an upstream artifact it consumes, return it unchanged (idempotent resume). Otherwise work every change request into the body and keep item IDs stable when the item is materially the same. Do not copy files to `history/` or touch `version` — `commit-artifact.mjs` does both (Gedächtnis §15).
1. Read assumptions-map: list every kill assumption (importance high, evidence low) and every desirability assumption as ASM ids; identify the core problem assumption the idea stands on.
2. Read stakeholder-matrix: take the stakeholder rows and panel slots (target users, Contrarian, Verweigerer) the guide must serve, and note per slot which ASM items it can speak to.
3. Write stage 1 "Qualifier": 2–3 questions that establish whether the persona is in the target group and in which context (role, frequency, current tools), without mentioning the idea.
4. Write stage 2 "Story": past-behaviour questions only ("When was the last time you…?", "Walk me through what you did", "What happened next?"); each question names the ASM id(s) it probes; add neutral follow-ups ("Why was that?", "What did that cost you?").
5. Write stage 3 "Problem ranking and workaround": define exactly 3 problems (the core problem plus the 2 strongest competing problem hypotheses, each linked to ASM ids), let the persona rank them by its own experience, then ask for today's workaround, its cost and satisfaction. Fix the shuffle: the 3! = 6 permutations are assigned to the 6 panel slots in slot order, recorded as a table, so no persona sees the core problem in the same position and S2.1.4 can check order bias.
6. Write stage 4 "Solution" for the last third only: a neutral one-paragraph concept description, then reaction questions about fit to past behaviour ("Where would this have fit last time?"), no pitch or guided tour; add Verweigerer/Contrarian probes on switching barriers and the strongest objection.
7. Add interviewer rules: no leading or loaded questions, no hypothetical "would you" before stage 4, accept "don't know" and "don't care" verbatim without reinterpreting, one transcript per persona, record guide version.
8. Build a coverage table ASM id → question ids; every kill assumption needs ≥1 question in stages 2–3. Record the coverage table in the body; the guide version is the artifact version set by commit-artifact.mjs.
9. Write the output **body** from `assets/template.md`: Markdown only, no frontmatter (the product-artifact-contract-guard hook rejects a Write that starts with `---`).
10. Run the self-check below and fix what fails. Never set `passed` yourself — only the critic gate does (Gedächtnis §2.2).
11. **Commit** every output file with its authored block (see "Artifact contract" below): `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/commit-artifact.mjs commit <runDir> <file.md> --step S2.1.2 <<'JSON'` … `JSON`. The script computes id, version, status, derivedFrom, evidence mix and history; fix every rejection it prints and commit again. Re-committing an unchanged file is a no-op.
12. Log: `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/run-state.mjs event <runDir> '{"event":"step-done","element":"S2.1.2"}'`.

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

## Self-check (rubric `interview-guide` — judged by `product-kritiker-pruefung`)

- [ ] Stages 1–3 contain only past-behaviour questions; no "would you", "do you like" or leading/loaded question (rubric interview-guide).
- [ ] The solution is shown only in stage 4, the last third of the guide (rubric interview-guide).
- [ ] Every kill assumption from assumptions-map is covered by ≥1 question, shown in the coverage table (rubric interview-guide).
- [ ] The problem-ranking block lists exactly 3 problems including the core problem, each linked to ASM ids, and a per-slot permutation table covering all 6 slots with distinct orders.
- [ ] The rules state that "don't know"/"don't care" are recorded verbatim and never reinterpreted (Gedächtnis §7.4).
- [ ] Contrarian and Verweigerer probes (objection, workaround satisfaction, switching barriers) are present.

## Pitfalls

- Opening with the product idea or a pitch, which produces fake validation ("Sure, I'd use that").
- Phrasing the core problem so it obviously wins the ranking (more vivid wording, always listed first).
- Asking about future intent ("Would you pay for…?") in the story stage instead of past spend and behaviour.
- Writing questions that fish for the hidden "secret" directly instead of letting good follow-ups surface it.

## Return

Reply with JSON only: `{"status": "done|blocked|partial", "artifacts": ["<committed .md paths>"], "items": ["<item ids created or changed>"], "riskFlags": [], "summary": "<one sentence>"}`.

## Domain knowledge

See `references/domain-knowledge.md` (cited from notebook "The Product - Business Design"; phase brief `knowledge/phase-2-discovery.md`).
