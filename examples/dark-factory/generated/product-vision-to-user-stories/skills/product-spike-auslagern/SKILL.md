---
name: product-spike-auslagern
description: >-
  Extracts technical uncertainty from stories into timeboxed spikes (SPK items) with a question and predefined acceptance criteria. Use when the dark-factory workflow reaches step 5.1.4 "Technische
  Unsicherheit als Spike auslagern".
bpmn:
  file: product-vision-to-user-stories.bpmn
  elements: [S5.1.4]
---

# Technische Unsicherheit als Spike auslagern (step 5.1.4)

Generated from `product-vision-to-user-stories.bpmn`'s "Technische Unsicherheit als Spike auslagern" (serviceTask, lane "Architekt") by `bpmn2agent-generate`. Makes stories judged "Zu unsicher (Spike)" at SP5.1_Gw estimable again: the spikes are checked by the invest critic (rubric spike) and the DoR gate in 5.2 requires that no un-spiked risk remains; 7 lists them in the backlog export. It is its own skill because it produces an independently versioned artifact with its own contract (body + sidecar), template and rubric (mapping-rubric.md's serviceTask rule; one skill per business step, docs/dark-factory/implementation.md §2).

Executed by the `product-architekt` agent. Binding rules: `${CLAUDE_PLUGIN_ROOT}/knowledge/process-rules.md` — evidence §6, item IDs §10, artifact contract §11.2, iterations §15.

## Run context

The Workflow passes `runDir`, `runId`, `iteration` and `changeRequests` (from the last gate record of this phase), `epicId`.

| Input | Required | Path pattern |
|---|---|---|
| `story-cards` | yes | `runs/{runId}/backlog/stories/ST-{nnn}_{slug}.md` |

| Output | Item prefix | Cardinality | Path pattern |
|---|---|---|---|
| `spikes` | SPK | many | `runs/{runId}/backlog/spikes/SPK-{nnn}_{slug}.md` |

- **Multi-instance**: runs once per epic (`EP[slice=1]`); the Workflow passes `epicId`.

## Procedure

0. **Resume / iterate.** Read the output's sidecar (`<file>.meta.json`) if it exists. If it has `status: passed`/`passed-with-risk`, or `iteration > 1` and no change request concerns this artifact or an upstream artifact it consumes, return it unchanged (idempotent resume). Otherwise work every change request into the body and keep item IDs stable when the item is materially the same. Do not copy files to `history/` or touch `version` — `commit-artifact.mjs` does both (Gedächtnis §15).
1. Read story-cards for the passed epic and the invest gate record; select stories flagged too uncertain (not Estimable because of an unknown technical factor).
2. Read the target architecture/platform from 00_idea-brief.md (zielarchitektur/plattform) — if it is an 🧠 assumption, put that ASM into the spike's `architectureAssumptions` as a source of the uncertainty.
3. For each uncertainty build one spike record (df.spike/v1) with a new id (`node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/spike.mjs next-id <runDir>`): `question` (the single question to answer), `why` (why the story cannot be sized without it), `timebox` {amount, unit: hours|days} (bounded: ≤ 2 days), `acceptanceCriteria` defined in advance (what evidence or prototype output ends it) and `decisionEnabled` (the decision it unlocks).
4. Set `blocks` to the blocked ST id(s) and `derivedFrom` to those ST ids plus any ASM involved; `evidence` 🧠 inferred unless an SRC documents the risk (then `refs`). Commit each spike with `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/spike.mjs put <runDir> --step S5.1.4` — the script renders backlog/spikes/SPK-nnn_<slug>.md.
5. Update the affected story only through `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/story.mjs patch <runDir> <ST id> --step S5.1.4` → {"story": {"spikes": ["SPK-nnn"], "blockers": ["Blocked by SPK-nnn: …"], "size": null}}; keep the Connextra sentence unchanged; the story stays in the backlog with a pending size.
6. If the uncertainty is actually a missing business decision (not technical), do not create a spike — add it to the story's `conversation` via `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/story.mjs patch` for 5.2.1.
7. Check the links: `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/spike.mjs list <runDir> --blocks <ST id>` lists the spikes of each blocked story, and the story's `spikes` (set in step 5) must name exactly those; `export-backlog.mjs` reports any mismatch.
8. Build every spike as a `df.spike/v1` record (`node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/spike.mjs schema` prints it; see "Backlog records" below). You write **no** Markdown for it — `spike.mjs` renders `backlog/spikes/SPK-<nnn>_<slug>.md` from the record (the contract-guard hook blocks hand-written spike files).
9. Run the self-check below and fix what fails. Never set `passed` yourself — only the critic gate does (Gedächtnis §2.2).
10. **Commit** each spike: `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/spike.mjs put <runDir> --step S5.1.4 <<'JSON'` {"spike": …} `JSON`. The script validates the record, renders and commits the file, and computes id, version, status, derivedFrom, evidence and history; fix every rejection it prints and put again. Re-putting an unchanged record is a no-op. Then link each blocked story with `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/story.mjs patch <runDir> <storyId> --step S5.1.4` (see "Backlog records" below).
11. Log: `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/run-state.mjs event <runDir> '{"event":"step-done","element":"S5.1.4"}'`.

## Backlog records (Gedächtnis §11.3)

Stories and spikes are JSON-first: the record in the file's sidecar (`authored.attributes`, schema `df.story/v1` / `df.spike/v1`) is the story or spike; `backlog/stories/ST-*.md`, `SPK-*.md` and `backlog.json` are generated from it. Read one with `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/story.mjs show <runDir> <ST-id>` (or `spike.mjs show <SPK-id>`), list them with `list <runDir> [--epic EP-nnn]` (spikes: `[--blocks ST-nnn]`), get new ids with `next-id <runDir> [--count n]`.

Record for `spike.mjs put` (stdin):

```json
{
  "spike": {
    "id": "SPK-003",
    "title": "Recipe import from partner API",
    "question": "Does the partner API deliver ingredient lists with quantities per portion?",
    "why": "ST-012 cannot be sized until we know whether we must parse free text",
    "blocks": [
      "ST-012"
    ],
    "timebox": {
      "amount": 1,
      "unit": "days"
    },
    "acceptanceCriteria": [
      "A sample of 20 recipes is fetched and the share with structured quantities is known",
      "Decision memo: structured import vs. parser"
    ],
    "decisionEnabled": "Size class of ST-012 (S if structured, L otherwise)",
    "derivedFrom": [
      "ST-012",
      "ASM-011"
    ],
    "evidence": "inferred",
    "architectureAssumptions": [
      {
        "id": "ASM-011",
        "why": "idea brief assumes a partner API exists"
      }
    ]
  },
  "notesForNext": "<one or two sentences for the next step>"
}
```

Required: `id`, `title`, `question` (one), `why` (why sizing is blocked), `blocks` (ST ids), `timebox {amount, unit: hours|days}` (≤ 2 days / 16 hours), `acceptanceCriteria` (defined before execution), `decisionEnabled`, `derivedFrom` (must contain every blocked ST), `evidence`. Optional: `refs`, `architectureAssumptions [{id, why}]`, `status` (open | done | discarded), `outcome` (only with done), `notes`, `flags`. The script rejects unknown fields, unbounded timeboxes, blocked stories that are not story records, and a duplicate SPK id. The record's itemIndex (its SPK item) is derived from it — you do not supply one.

**This step patches:** spikes, blockers, size: null. `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/story.mjs patch <runDir> <ST-id> --step S5.1.4 <<'JSON'` {"story": {<only the fields you change>}} `JSON` — top-level fields replace, `connextra`/`size`/`scope` merge one level, the id is fixed. Never edit the story Markdown.

## Artifact contract (Gedächtnis §11.2)

Every output is two files: `<file>.md` (the body you write; its frontmatter is rendered read-only from the sidecar) and `<file>.meta.json` (the sidecar, written only by `commit-artifact.mjs`). Read upstream metadata from sidecars, never from rendered frontmatter.

**You supply** the authored block on stdin (`node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/commit-artifact.mjs schema` prints its JSON Schema):

```json
{
  "itemIndex": [
    {
      "id": "SPK-001",
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

## Self-check (rubric `spike` — judged by `product-kritiker-pruefung`)

- [ ] Every spike has a timebox, one explicit question and acceptance criteria defined before execution (rubric spike).
- [ ] Each spike links to the story/stories it unblocks and states the decision it enables.
- [ ] Spikes cover technical uncertainty only; business unknowns are routed to refinement, not spiked.
- [ ] Timeboxes are bounded (no open-ended research); total spike effort is visible per epic.
- [ ] Every blocked story lists its SPK id in `spikes` (story.mjs patch), and every spike lists the story in `blocks`; the Connextra sentence is unchanged.

## Pitfalls

- Open-ended spikes ("investigate the architecture") that become never-ending research projects.
- Spike acceptance criteria phrased as tasks ("look at X") instead of an answerable outcome.
- Hiding a too-big story behind a spike instead of splitting it (5.1.3).

## Return

Reply with JSON only: `{"status": "done|blocked|partial", "artifacts": ["<committed .md paths>"], "items": ["<item ids created or changed>"], "riskFlags": [], "summary": "<one sentence>"}`.

## Domain knowledge

See `references/domain-knowledge.md` (cited from notebook "The Product - Business Design"; phase brief `knowledge/phase-5-6-stories-akzeptanz.md`).
