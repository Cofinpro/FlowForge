---
name: product-testerwartungen-abgleichen
description: >-
  Aligns business and technical test expectations for one story's acceptance criteria, adding architect-found gaps as AC items without making them implementation-specific. Use when the dark-factory
  workflow reaches step 6.1.4 "Fachliche vs. technische Testerwartungen abgleichen".
bpmn:
  file: product-vision-to-user-stories.bpmn
  elements: [S6.1.4]
---

# Fachliche vs. technische Testerwartungen abgleichen (step 6.1.4)

Generated from `product-vision-to-user-stories.bpmn`'s "Fachliche vs. technische Testerwartungen abgleichen" (serviceTask, lane "Architekt") by `flowforge-generate`. Delivers the final acceptance-criteria set per story that the gherkin critic judges at SP6.1_Gw ("Testbar & eindeutig?"); the result feeds 6.2 hygiene checks and the export in 7. It is its own skill because it produces an independently versioned artifact with its own contract (body + sidecar), template and rubric (mapping-rubric.md's serviceTask rule; one skill per business step, docs/dark-factory/implementation.md §2).

Executed by the `product-architekt` agent. Binding rules: `${CLAUDE_PLUGIN_ROOT}/knowledge/process-rules.md` — evidence §6, item IDs §10, artifact contract §11.2, iterations §15.

## Run context

The Workflow passes `runDir`, `runId`, `iteration` and `changeRequests` (from the last gate record of this phase), `storyId`.

| Input | Required | Path pattern |
|---|---|---|
| `acceptance-criteria` | yes | `runs/{runId}/artifacts/p6-akzeptanz/{storyId}/6.1.3_acceptance-criteria.md` |

| Output | Item prefix | Cardinality | Path pattern |
|---|---|---|---|
| `acceptance-criteria` | AC | many | `runs/{runId}/artifacts/p6-akzeptanz/{storyId}/6.1.3_acceptance-criteria.md` |

- **Multi-instance**: runs once per story; the Workflow passes `storyId`. Per-story artifacts go under `artifacts/p6-akzeptanz/<storyId>/`.

## Procedure

0. **Resume / iterate.** Read the output's sidecar (`<file>.meta.json`) if it exists. If it has `status: passed`/`passed-with-risk`, or `iteration > 1` and no change request concerns this artifact or an upstream artifact it consumes, return it unchanged (idempotent resume). Otherwise work every change request into the body and keep item IDs stable when the item is materially the same. Do not copy files to `history/` or touch `version` — `commit-artifact.mjs` does both (Gedächtnis §15).
1. Read acceptance-criteria for the passed story id plus the ARC implementation notes in story-refined and the target architecture from 00_idea-brief.md.
2. For each AC check technical testability: can the outcome be observed and automated against the target platform, are preconditions settable, are time/concurrency/data-volume aspects implied?
3. Identify technical expectations that change observable behavior (e.g. timeouts, offline, concurrent edits, data retention) and add them as new AC-nnn items in business language with derivedFrom = [ST id, related AC].
4. Record purely technical checks with no observable business outcome (e.g. index usage, logging format) as non-functional test notes, not as ACs.
5. Resolve contradictions between business ACs and technical constraints by rewording the AC or flagging a conflict for the critic; never silently drop a business AC.
6. If an AC turns out untestable or the story too large, mark the story needs-resplit (G-Split) with the reason.
7. Update acceptance-criteria (same file, new version, new AC ids in its itemIndex) and then the story's full `acceptanceCriteria` list via `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/story.mjs patch <runDir> <storyId> --step S6.1.4`; needs-resplit goes into the same patch as `status`.
8. Write the output **body** from `assets/template.md`: Markdown only, no frontmatter (the product-artifact-contract-guard hook rejects a Write that starts with `---`); one file per instance, following the path pattern.
9. Run the self-check below and fix what fails. Never set `passed` yourself — only the critic gate does (Gedächtnis §2.2).
10. **Commit** every output file with its authored block (see "Artifact contract" below): `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/commit-artifact.mjs commit <runDir> <file.md> --step S6.1.4 <<'JSON'` … `JSON`. The script computes id, version, status, derivedFrom, evidence mix and history; fix every rejection it prints and commit again. Re-committing an unchanged file is a no-op. Then apply the story changes with `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/story.mjs patch <runDir> <storyId> --step S6.1.4` (see "Story records" below).
11. Log: `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/run-state.mjs event <runDir> '{"event":"step-done","element":"S6.1.4"}'`.

## Backlog records (Gedächtnis §11.3)

Stories and spikes are JSON-first: the record in the file's sidecar (`authored.attributes`, schema `df.story/v1` / `df.spike/v1`) is the story or spike; `backlog/stories/ST-*.md`, `SPK-*.md` and `backlog.json` are generated from it. Read one with `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/story.mjs show <runDir> <ST-id>` (or `spike.mjs show <SPK-id>`), list them with `list <runDir> [--epic EP-nnn]` (spikes: `[--blocks ST-nnn]`), get new ids with `next-id <runDir> [--count n]`.

**This step patches:** acceptanceCriteria (full list), status needs-resplit. `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/story.mjs patch <runDir> <ST-id> --step S6.1.4 <<'JSON'` {"story": {<only the fields you change>}} `JSON` — top-level fields replace, `connextra`/`size`/`scope` merge one level, the id is fixed. Never edit the story Markdown.

## Artifact contract (Gedächtnis §11.2)

Every output is two files: `<file>.md` (the body you write; its frontmatter is rendered read-only from the sidecar) and `<file>.meta.json` (the sidecar, written only by `commit-artifact.mjs`). Read upstream metadata from sidecars, never from rendered frontmatter.

**You supply** the authored block on stdin (`node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/commit-artifact.mjs schema` prints its JSON Schema):

```json
{
  "itemIndex": [
    {
      "id": "AC-001",
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

## Self-check (rubric `gherkin` — judged by `product-kritiker-pruefung`)

- [ ] Every AC is testable and unambiguous from both business and technical perspective (gherkin).
- [ ] All ACs, including new ones, stay implementation-neutral Given-When-Then.
- [ ] Happy-path and negative/exception coverage still present after alignment.
- [ ] Technical-only checks are kept as test notes, not disguised as ACs.
- [ ] Every conflict is resolved or flagged; no business AC removed without a stated reason.
- [ ] New AC ids are unique with derivedFrom to ST and related AC.

## Pitfalls

- Rewriting ACs into technical test cases (API assertions, SQL) — breaks implementation neutrality.
- Adding technical ACs that no user could observe, which 6.2.4 later treats like fake stories.
- Ignoring non-functional behavior that users do notice (timeouts, offline).

## Return

Reply with JSON only: `{"status": "done|blocked|partial", "artifacts": ["<committed .md paths>"], "items": ["<item ids created or changed>"], "riskFlags": [], "summary": "<one sentence>"}`.

## Domain knowledge

See `references/domain-knowledge.md` (cited from notebook "The Product - Business Design"; phase brief `knowledge/phase-5-6-stories-akzeptanz.md`).
