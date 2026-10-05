---
name: product-gherkin-formalisieren
description: Formalizes one story's SBE examples into Given-When-Then acceptance criteria (AC items) traced to the story. Use when the dark-factory workflow reaches step 6.1.3 "In Given-When-Then formalisieren".
bpmn:
  file: product-vision-to-user-stories.bpmn
  elements: [S6.1.3]
---

# In Given-When-Then formalisieren (step 6.1.3)

Generated from `product-vision-to-user-stories.bpmn`'s "In Given-When-Then formalisieren" (serviceTask, lane "QA-Perspektive") by `flowforge-generate`. Creates the AC items at the head of the required trace chain; the gherkin critic (SP6.1_CallK) judges them, 6.1.4 aligns test expectations, 6.2.3 checks their language and 7 exports them. It is its own skill because it produces an independently versioned artifact with its own contract (body + sidecar), template and rubric (mapping-rubric.md's serviceTask rule; one skill per business step, docs/dark-factory/implementation.md §2).

Executed by the `product-qa` agent. Binding rules: `${CLAUDE_PLUGIN_ROOT}/knowledge/process-rules.md` — evidence §6, item IDs §10, artifact contract §11.2, iterations §15.

## Run context

The Workflow passes `runDir`, `runId`, `iteration` and `changeRequests` (from the last gate record of this phase), `storyId`.

| Input | Required | Path pattern |
|---|---|---|
| `sbe-examples` | yes | `runs/{runId}/artifacts/p6-akzeptanz/{storyId}/6.1.2_sbe-examples.md` |

| Output | Item prefix | Cardinality | Path pattern |
|---|---|---|---|
| `acceptance-criteria` | AC | many | `runs/{runId}/artifacts/p6-akzeptanz/{storyId}/6.1.3_acceptance-criteria.md` |

- **Multi-instance**: runs once per story; the Workflow passes `storyId`. Per-story artifacts go under `artifacts/p6-akzeptanz/<storyId>/`.

## Procedure

0. **Resume / iterate.** Read the output's sidecar (`<file>.meta.json`) if it exists. If it has `status: passed`/`passed-with-risk`, or `iteration > 1` and no change request concerns this artifact or an upstream artifact it consumes, return it unchanged (idempotent resume). Otherwise work every change request into the body and keep item IDs stable when the item is materially the same. Do not copy files to `history/` or touch `version` — `commit-artifact.mjs` does both (Gedächtnis §15).
1. Read sbe-examples for the passed story id.
2. Write one AC per behavior as a Gherkin scenario (Given context, When one action/event, Then observable outcome); use Scenario Outline + Examples tables for rule variations and boundary values from SBE.
3. Give each AC a new id AC-nnn (never reuse), a title and a kind (happy | negative | edge); derivedFrom = [ST id] plus the SBE example/confirmation note it formalizes.
4. Keep Given/When/Then implementation-neutral: domain terms, concrete values, no selectors, clicks, SQL or endpoints.
5. Evidence per AC: 🤖 if its example came from the panel, else 🧠 inferred; list refs.
6. First commit acceptance-criteria to artifacts/p6-akzeptanz/<storyId>/ with every AC id in its authored itemIndex; then set the canonical ACs on the story with `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/story.mjs patch <runDir> <storyId> --step S6.1.3` → {"story": {"acceptanceCriteria": [{id, title, kind, given: [..], when: [..], then: [..], examples?: [..]}]}}. The script rejects AC ids that are not committed items.
7. Write the output **body** from `assets/template.md`: Markdown only, no frontmatter (the product-artifact-contract-guard hook rejects a Write that starts with `---`); one file per instance, following the path pattern.
8. Run the self-check below and fix what fails. Never set `passed` yourself — only the critic gate does (Gedächtnis §2.2).
9. **Commit** every output file with its authored block (see "Artifact contract" below): `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/commit-artifact.mjs commit <runDir> <file.md> --step S6.1.3 <<'JSON'` … `JSON`. The script computes id, version, status, derivedFrom, evidence mix and history; fix every rejection it prints and commit again. Re-committing an unchanged file is a no-op. Then apply the story changes with `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/story.mjs patch <runDir> <storyId> --step S6.1.3` (see "Story records" below).
10. Log: `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/run-state.mjs event <runDir> '{"event":"step-done","element":"S6.1.3"}'`.

## Backlog records (Gedächtnis §11.3)

Stories and spikes are JSON-first: the record in the file's sidecar (`authored.attributes`, schema `df.story/v1` / `df.spike/v1`) is the story or spike; `backlog/stories/ST-*.md`, `SPK-*.md` and `backlog.json` are generated from it. Read one with `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/story.mjs show <runDir> <ST-id>` (or `spike.mjs show <SPK-id>`), list them with `list <runDir> [--epic EP-nnn]` (spikes: `[--blocks ST-nnn]`), get new ids with `next-id <runDir> [--count n]`.

**This step patches:** acceptanceCriteria. `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/story.mjs patch <runDir> <ST-id> --step S6.1.3 <<'JSON'` {"story": {<only the fields you change>}} `JSON` — top-level fields replace, `connextra`/`size`/`scope` merge one level, the id is fixed. Never edit the story Markdown.

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

- [ ] Every scenario is valid Given-When-Then with one When per scenario (gherkin).
- [ ] At least one happy-path and at least one negative/exception AC per story.
- [ ] Implementation-neutral: no UI selectors, SQL, endpoints or click paths.
- [ ] Concrete values from the SBE examples are used (no placeholders).
- [ ] Every AC has a new AC id, derivedFrom containing its ST id, and an evidence level.
- [ ] Every SBE example is covered by an AC or its omission is justified.

## Pitfalls

- Multiple Whens/Thens chaining a whole workflow into one scenario.
- Then steps that assert internal state ("record saved in table X") instead of observable outcomes.
- Losing boundary values when collapsing examples into prose.

## Return

Reply with JSON only: `{"status": "done|blocked|partial", "artifacts": ["<committed .md paths>"], "items": ["<item ids created or changed>"], "riskFlags": [], "summary": "<one sentence>"}`.

## Domain knowledge

See `references/domain-knowledge.md` (cited from notebook "The Product - Business Design"; phase brief `knowledge/phase-5-6-stories-akzeptanz.md`).
