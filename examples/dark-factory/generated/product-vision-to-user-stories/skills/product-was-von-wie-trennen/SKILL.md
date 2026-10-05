---
name: product-was-von-wie-trennen
description: >-
  Refines one story by separating the What (need, outcome, rules) from the How (implementation notes) based on the three-amigos protocol. Use when the dark-factory workflow reaches step 5.2.2 "Was von
  Wie trennen".
bpmn:
  file: product-vision-to-user-stories.bpmn
  elements: [S5.2.2]
---

# Was von Wie trennen (step 5.2.2)

Generated from `product-vision-to-user-stories.bpmn`'s "Was von Wie trennen" (serviceTask, lane "Backlog-Autor") by `flowforge-generate`. Produces story-refined — the implementation-neutral story text plus separated technical notes — which 5.2.3 (wireframe/domain model), 5.2.4 (size class), 6.1.1 (confirmation) and the dor critic consume. It is its own skill because it produces an independently versioned artifact with its own contract (body + sidecar), template and rubric (mapping-rubric.md's serviceTask rule; one skill per business step, docs/dark-factory/implementation.md §2).

Executed by the `product-backlog-autor` agent. Binding rules: `${CLAUDE_PLUGIN_ROOT}/knowledge/process-rules.md` — evidence §6, item IDs §10, artifact contract §11.2, iterations §15.

## Run context

The Workflow passes `runDir`, `runId`, `iteration` and `changeRequests` (from the last gate record of this phase), `storyId`.

| Input | Required | Path pattern |
|---|---|---|
| `amigos-protocol` | yes | `runs/{runId}/artifacts/p5-refinement/{storyId}/5.2.1_amigos-protocol.md` |

| Output | Item prefix | Cardinality | Path pattern |
|---|---|---|---|
| `story-refined` | — | one | `runs/{runId}/artifacts/p5-refinement/{storyId}/5.2.2_story-refined.md` |

- **Multi-instance**: runs once per story; the Workflow passes `storyId`. Per-story artifacts go under `artifacts/p5-refinement/<storyId>/`.

## Procedure

0. **Resume / iterate.** Read the output's sidecar (`<file>.meta.json`) if it exists. If it has `status: passed`/`passed-with-risk`, or `iteration > 1` and no change request concerns this artifact or an upstream artifact it consumes, return it unchanged (idempotent resume). Otherwise work every change request into the body and keep item IDs stable when the item is materially the same. Do not copy files to `history/` or touch `version` — `commit-artifact.mjs` does both (Gedächtnis §15).
1. Read the amigos-protocol for the passed story id and the story record (`node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/story.mjs show <runDir> <storyId>`).
2. Restate the story so it holds only the What: `connextra` (and `title`), `context` (trigger), `businessRules`, `scope` {in, out} — no UI element names, technologies, endpoints or data structures.
3. Move every How statement from story and protocol into `implementationNotes` (ARC, non-binding).
4. Check the story does not describe a solution instead of the need (misleading story); if it does, rephrase the goal back to the need and keep the solution as one option in the notes.
5. Carry forward edge cases from the protocol as `confirmationCandidates` and the open blockers as `blockers` (with SPK/ASM refs); update `assumptions`.
6. Write story-refined to artifacts/p5-refinement/<storyId>/ (commit it as usual) and apply the same What to the story record with `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/story.mjs patch <runDir> <storyId> --step S5.2.2` (same ST id, no new items).
7. Write the output **body** from `assets/template.md`: Markdown only, no frontmatter (the product-artifact-contract-guard hook rejects a Write that starts with `---`).
8. Run the self-check below and fix what fails. Never set `passed` yourself — only the critic gate does (Gedächtnis §2.2).
9. **Commit** every output file with its authored block (see "Artifact contract" below): `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/commit-artifact.mjs commit <runDir> <file.md> --step S5.2.2 <<'JSON'` … `JSON`. The script computes id, version, status, derivedFrom, evidence mix and history; fix every rejection it prints and commit again. Re-committing an unchanged file is a no-op. Then apply the story changes with `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/story.mjs patch <runDir> <storyId> --step S5.2.2` (see "Story records" below).
10. Log: `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/run-state.mjs event <runDir> '{"event":"step-done","element":"S5.2.2"}'`.

## Backlog records (Gedächtnis §11.3)

Stories and spikes are JSON-first: the record in the file's sidecar (`authored.attributes`, schema `df.story/v1` / `df.spike/v1`) is the story or spike; `backlog/stories/ST-*.md`, `SPK-*.md` and `backlog.json` are generated from it. Read one with `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/story.mjs show <runDir> <ST-id>` (or `spike.mjs show <SPK-id>`), list them with `list <runDir> [--epic EP-nnn]` (spikes: `[--blocks ST-nnn]`), get new ids with `next-id <runDir> [--count n]`.

**This step patches:** title, connextra, context, businessRules, scope, implementationNotes, confirmationCandidates, blockers, assumptions. `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/story.mjs patch <runDir> <ST-id> --step S5.2.2 <<'JSON'` {"story": {<only the fields you change>}} `JSON` — top-level fields replace, `connextra`/`size`/`scope` merge one level, the id is fixed. Never edit the story Markdown.

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

## Self-check (rubric `dor` — judged by `product-kritiker-pruefung`)

- [ ] Story text is implementation-neutral: no UI, technology or data-model decisions in the What.
- [ ] Connextra sentence with concrete role intact; "so that" still a user/business outcome (invest).
- [ ] Every How statement from the protocol appears in the implementation notes, none lost.
- [ ] Blockers listed with SPK/ASM refs; no hidden open questions (dor: no open blockers).
- [ ] Business rules are stated as rules, not as screens or steps.

## Pitfalls

- Deleting technical insight instead of moving it to the notes — ARC loses it for sizing.
- Leaving solution wording ("add a dropdown", "store in Postgres") in the goal.
- Changing the story's scope during refinement without recording it (scope should change via 5.1.3).

## Return

Reply with JSON only: `{"status": "done|blocked|partial", "artifacts": ["<committed .md paths>"], "items": ["<item ids created or changed>"], "riskFlags": [], "summary": "<one sentence>"}`.

## Domain knowledge

See `references/domain-knowledge.md` (cited from notebook "The Product - Business Design"; phase brief `knowledge/phase-5-6-stories-akzeptanz.md`).
