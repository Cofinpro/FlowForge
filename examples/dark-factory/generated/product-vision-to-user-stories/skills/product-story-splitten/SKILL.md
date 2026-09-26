---
name: product-story-splitten
description: >-
  Splits oversized or needs-resplit stories into vertical, INVEST-conform child stories (new ST items) using named splitting patterns. Use when the dark-factory workflow reaches step 5.1.3
  "Splitting-Muster anwenden".
bpmn:
  file: product-vision-to-user-stories.bpmn
  elements: [S5.1.3]
---

# Splitting-Muster anwenden (step 5.1.3)

Generated from `product-vision-to-user-stories.bpmn`'s "Splitting-Muster anwenden" (serviceTask, lane "Backlog-Autor") by `bpmn2agent-generate`. Turns stories judged "Zu gross" at SP5.1_Gw (or flagged needs-resplit via G-Split after 5.2/6.1) into right-sized story-cards that go back to the invest critic and on into refinement 5.2.x. It is its own skill because it produces an independently versioned artifact with its own contract (body + sidecar), template and rubric (mapping-rubric.md's serviceTask rule; one skill per business step, docs/dark-factory/implementation.md §2).

Executed by the `product-backlog-autor` agent. Binding rules: `${CLAUDE_PLUGIN_ROOT}/knowledge/process-rules.md` — evidence §6, item IDs §10, artifact contract §11.2, iterations §15.

## Run context

The Workflow passes `runDir`, `runId`, `iteration` and `changeRequests` (from the last gate record of this phase), `epicId`.

| Input | Required | Path pattern |
|---|---|---|
| `story-cards` | yes | `runs/{runId}/backlog/stories/ST-{nnn}_{slug}.md` |

| Output | Item prefix | Cardinality | Path pattern |
|---|---|---|---|
| `story-cards` | ST | many | `runs/{runId}/backlog/stories/ST-{nnn}_{slug}.md` |

- **Multi-instance**: runs once per epic (`EP[slice=1]`); the Workflow passes `epicId`.

## Procedure

0. **Resume / iterate.** Read the output's sidecar (`<file>.meta.json`) if it exists. If it has `status: passed`/`passed-with-risk`, or `iteration > 1` and no change request concerns this artifact or an upstream artifact it consumes, return it unchanged (idempotent resume). Otherwise work every change request into the body and keep item IDs stable when the item is materially the same. Do not copy files to `history/` or touch `version` — `commit-artifact.mjs` does both (Gedächtnis §15).
1. Read the stories of the passed epic (`node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/story.mjs list <runDir> --epic <EP id>` and `show <ST id>`) and the latest invest gate record; select the stories the critic or G-Split marked too big (status needs-resplit, size L, or change requests naming Small/Independent).
2. For each selected story pick the splitting pattern that fits and name it: by business rule, by option/variant, by channel, hard-coded reference data first then live sources, output-first, simplified output (files instead of a data warehouse), basic utility vs. skeleton on crutches; use the user story hamburger when no pattern fits.
3. Split vertically only — every child must deliver an end-to-end, user-visible slice through all layers; never split by technical layer or by workflow step that has no value on its own.
4. Create each child with a new id (`node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/story.mjs next-id`) via `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/story.mjs put <runDir> --step S5.1.3`: splitFrom = parent ST, splitPattern = the pattern name, same epic and userTask, derivedFrom = [same UT, same EP/ACTV], and `assumptions` re-derived per child (only the ASM that still apply).
5. Mark the parent with `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/story.mjs patch <runDir> <parent ST> --step S5.1.3` → {"story": {"status": "superseded", "splitInto": [child ids]}}; never delete it and never reuse its id. If the parent has `spikes`, re-point each spike to the child that carries the uncertainty (`node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/spike.mjs patch <runDir> <SPK id> --step S5.1.3` → {"spike": {"blocks": [child], "derivedFrom": [child, …]}}) and list it in that child's `spikes`.
6. Give each child a rough size S/M with one-line reasoning; if a child is still L, split again or record why it cannot be split (and flag it for 5.1.4 if the blocker is technical uncertainty).
7. Put the value each child delivers into its `notes` and anything deliberately dropped from the parent into the parent's `notes` (deferred scope) in the same patch; the split log is the parent → splitInto → children records, the traceability scripts skip superseded parents.
8. Build every story as a `df.story/v1` record (`node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/story.mjs schema` prints it; see "Backlog records" below). You write **no** Markdown for it — `story.mjs` renders `backlog/stories/ST-<nnn>_<slug>.md` from the record (the contract-guard hook blocks hand-written story files).
9. Run the self-check below and fix what fails. Never set `passed` yourself — only the critic gate does (Gedächtnis §2.2).
10. **Commit** each story: `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/story.mjs put <runDir> --step S5.1.3 <<'JSON'` {"story": …} `JSON`. The script validates the record, renders and commits the file, and computes id, version, status, derivedFrom, evidence and history; fix every rejection it prints and put again. Re-putting an unchanged record is a no-op.
11. Log: `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/run-state.mjs event <runDir> '{"event":"step-done","element":"S5.1.3"}'`.

## Backlog records (Gedächtnis §11.3)

Stories and spikes are JSON-first: the record in the file's sidecar (`authored.attributes`, schema `df.story/v1` / `df.spike/v1`) is the story or spike; `backlog/stories/ST-*.md`, `SPK-*.md` and `backlog.json` are generated from it. Read one with `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/story.mjs show <runDir> <ST-id>` (or `spike.mjs show <SPK-id>`), list them with `list <runDir> [--epic EP-nnn]` (spikes: `[--blocks ST-nnn]`), get new ids with `next-id <runDir> [--count n]`.

Record for `story.mjs put` (stdin):

```json
{
  "story": {
    "id": "ST-012",
    "title": "Plan the week in one go",
    "epic": "EP-001",
    "userTask": "UT-004",
    "connextra": {
      "role": "working parent of two",
      "want": "to plan all dinners of the week in one session",
      "soThat": "I stop deciding under time pressure every evening"
    },
    "derivedFrom": [
      "UT-004",
      "EP-001",
      "JOB-002"
    ],
    "evidence": "synthetic",
    "refs": [
      "T-03"
    ],
    "conversation": [
      "Does \"week\" include weekends?"
    ],
    "assumptions": [
      {
        "id": "ASM-007",
        "evidence": "inferred",
        "why": "assumes one person plans for the household"
      }
    ],
    "size": {
      "class": "M",
      "reasoning": "3 business rules, 2 states, no integration"
    },
    "flags": []
  },
  "notesForNext": "<one or two sentences for the next step>"
}
```

Required: `id`, `title`, `epic`, `userTask`, `connextra {role, want, soThat}`, `derivedFrom` (must contain the userTask), `evidence`. Optional: `status`, `refs`, `conversation`, `context`, `businessRules`, `scope {in, out}`, `assumptions`, `size`, `splitFrom`/`splitPattern`/`splitInto`, `spikes`, `acceptanceCriteria`, `implementationNotes`, `confirmationCandidates`, `blockers`, `discard`, `notes`, `flags`. The script rejects unknown fields, `cited` without an SRC ref, size L on an active story, SPK ids that are not spike records blocking this story, and a duplicate ST id. The record's itemIndex (its ST item) is derived from it — you do not supply one.

**This step patches:** status superseded + splitInto on the parent. `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/story.mjs patch <runDir> <ST-id> --step S5.1.3 <<'JSON'` {"story": {<only the fields you change>}} `JSON` — top-level fields replace, `connextra`/`size`/`scope` merge one level, the id is fixed. Never edit the story Markdown.

## Artifact contract (Gedächtnis §11.2)

Every output is two files: `<file>.md` (the body you write; its frontmatter is rendered read-only from the sidecar) and `<file>.meta.json` (the sidecar, written only by `commit-artifact.mjs`). Read upstream metadata from sidecars, never from rendered frontmatter.

**You supply** the authored block on stdin (`node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/commit-artifact.mjs schema` prints its JSON Schema):

```json
{
  "itemIndex": [
    {
      "id": "ST-001",
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

## Self-check (rubric `invest` — judged by `product-kritiker-pruefung`)

- [ ] Every child passes invest: Connextra with concrete role, "so that" = user/business outcome, independent, negotiable, estimable, small (≤ M), testable.
- [ ] No child is a technical-layer slice (UI-only, API-only, DB-only story).
- [ ] Each split names its pattern and states what value each child delivers on its own.
- [ ] Parent is superseded with splitInto; child ids are new; derivedFrom points to parent, UT and EP/ACTV.
- [ ] Union of children covers the parent's intent; anything deliberately dropped is listed as deferred, not silently lost.
- [ ] Unvalidated ASM list present on every child.

## Pitfalls

- Horizontal splits ("backend part", "frontend part") that each deliver nothing to the user.
- Splitting by CRUD verbs or process steps that only make sense together, creating dependent stories.
- Re-using the parent id for the first child, which breaks the trace and violates §10.1.
- Splitting a story whose real problem is technical uncertainty — that belongs in a spike (5.1.4).

## Return

Reply with JSON only: `{"status": "done|blocked|partial", "artifacts": ["<committed .md paths>"], "items": ["<item ids created or changed>"], "riskFlags": [], "summary": "<one sentence>"}`.

## Domain knowledge

See `references/domain-knowledge.md` (cited from notebook "The Product - Business Design"; phase brief `knowledge/phase-5-6-stories-akzeptanz.md`).
