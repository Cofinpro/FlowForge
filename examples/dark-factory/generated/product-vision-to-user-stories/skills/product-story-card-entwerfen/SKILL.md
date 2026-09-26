---
name: product-story-card-entwerfen
description: >-
  Drafts Connextra story cards (ST items) for one epic from the story map, each traced to its user task and listing its unvalidated ASM assumptions. Use when the dark-factory workflow reaches step
  5.1.1 "Story Card entwerfen (Connextra)".
bpmn:
  file: product-vision-to-user-stories.bpmn
  elements: [S5.1.1]
---

# Story Card entwerfen (Connextra) (step 5.1.1)

Generated from `product-vision-to-user-stories.bpmn`'s "Story Card entwerfen (Connextra)" (serviceTask, lane "Backlog-Autor") by `bpmn2agent-generate`. Produces the story-cards that the invest critic (SP5.1_CallK) judges and that 5.1.3 (splitting), 5.1.4 (spikes) and the per-story refinement 5.2.x consume; every later AC hangs off these ST items. It is its own skill because it produces an independently versioned artifact with its own contract (body + sidecar), template and rubric (mapping-rubric.md's serviceTask rule; one skill per business step, docs/dark-factory/implementation.md §2).

Executed by the `product-backlog-autor` agent. Binding rules: `${CLAUDE_PLUGIN_ROOT}/knowledge/process-rules.md` — evidence §6, item IDs §10, artifact contract §11.2, iterations §15.

## Run context

The Workflow passes `runDir`, `runId`, `iteration` and `changeRequests` (from the last gate record of this phase), `epicId`.

| Input | Required | Path pattern |
|---|---|---|
| `story-map` | yes | `runs/{runId}/artifacts/p4-story-map/4.2.5_story-map.md` |

| Output | Item prefix | Cardinality | Path pattern |
|---|---|---|---|
| `story-cards` | ST | many | `runs/{runId}/backlog/stories/ST-{nnn}_{slug}.md` |

- **Multi-instance**: runs once per epic (`EP[slice=1]`); the Workflow passes `epicId`.

## Procedure

0. **Resume / iterate.** Read the output's sidecar (`<file>.meta.json`) if it exists. If it has `status: passed`/`passed-with-risk`, or `iteration > 1` and no change request concerns this artifact or an upstream artifact it consumes, return it unchanged (idempotent resume). Otherwise work every change request into the body and keep item IDs stable when the item is materially the same. Do not copy files to `history/` or touch `version` — `commit-artifact.mjs` does both (Gedächtnis §15).
1. Take the epic id passed by the Workflow (MI over EP[slice=1]); from story-map read that EP/ACTV and its UT items below the release line of slice 1 only.
2. For each UT write one or more stories in Connextra form "As a <concrete PER role>, I want <goal>, so that <user or business outcome>" — active voice, one user, no UI or technology assumptions; the role must be a PER/ACT from upstream, never the delivery team.
3. Get new ids with `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/story.mjs next-id <runDir> --count <n>` (never reuse). For each story build the story record (df.story/v1): id, title, epic, userTask, connextra {role, want, soThat}, derivedFrom = the UT id plus the EP/ACTV id and the JOB/OPP/HS/PAIN ids the task was derived from where the story map records them.
4. Walk the trace path UT → EP/ACTV → (OPP|JOB) → IMP → GOAL → VIS through the upstream sidecars (`*.meta.json`, authored.itemIndex) and put, per story, every ASM on that path whose evidence is low (inferred/not cited) into `assumptions` [{id, evidence, why}] (Gedächtnis §10.2).
5. Add Card-level `conversation` notes (open questions, known constraints) and a first rough `size` {class S/M/L, reasoning}; add `flags` such as "split-candidate" or "spike-candidate" for anything obviously L or technically uncertain (L also needs status needs-resplit).
6. Set `evidence` per story: 🧠 inferred by default; 🔗 cited only if the need is directly backed by an SRC quote, 🤖 synthetic if it rests on panel transcripts (T ids), and list them in `refs`.
7. Hand each story to `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/story.mjs put <runDir> --step S5.1.1` (stdin {"story": {...}, "notesForNext": "…"}). The script validates the record, renders backlog/stories/ST-nnn_<slug>.md and commits it; fix every rejection. Check coverage with `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/story.mjs list <runDir> --epic <EP id>`: every in-scope UT has at least one story.
8. Build every story as a `df.story/v1` record (`node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/story.mjs schema` prints it; see "Backlog records" below). You write **no** Markdown for it — `story.mjs` renders `backlog/stories/ST-<nnn>_<slug>.md` from the record (the contract-guard hook blocks hand-written story files).
9. Run the self-check below and fix what fails. Never set `passed` yourself — only the critic gate does (Gedächtnis §2.2).
10. **Commit** each story: `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/story.mjs put <runDir> --step S5.1.1 <<'JSON'` {"story": …} `JSON`. The script validates the record, renders and commits the file, and computes id, version, status, derivedFrom, evidence and history; fix every rejection it prints and put again. Re-putting an unchanged record is a no-op.
11. Log: `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/run-state.mjs event <runDir> '{"event":"step-done","element":"S5.1.1"}'`.

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

- [ ] Every story uses Connextra with a concrete role taken from PER/ACT; no "As a developer/QA/PO" stories (rubric invest).
- [ ] Every "so that" names a user or business outcome, not a technical effect (Valuable).
- [ ] Stories are independent of each other where possible and negotiable — no embedded solution design or UI layout.
- [ ] Each story is estimable and small: rough size ≤ M, or it is flagged for 5.1.3 splitting (Small = ≤ M, Gedächtnis §4).
- [ ] Each story is testable: the goal is concrete enough that a pass/fail check can be imagined.
- [ ] Each ST has derivedFrom containing its UT and EP/ACTV id and an "Unvalidated assumptions" list (may be empty only if no low-evidence ASM is on its path).
- [ ] Only UT items above the slice-1 release line of the passed epic were used; every such UT is covered by at least one story.

## Pitfalls

- Writing one story per technical layer (API story, UI story, DB story) instead of vertical slices.
- Using the team or the system as the role ("As the system …"), which 6.2.4 later removes as a fake story.
- Copying the UT label verbatim without an outcome in the "so that" clause.
- Pulling tasks from below the release line or from other epics into this epic's stories.

## Return

Reply with JSON only: `{"status": "done|blocked|partial", "artifacts": ["<committed .md paths>"], "items": ["<item ids created or changed>"], "riskFlags": [], "summary": "<one sentence>"}`.

## Domain knowledge

See `references/domain-knowledge.md` (cited from notebook "The Product - Business Design"; phase brief `knowledge/phase-5-6-stories-akzeptanz.md`).
