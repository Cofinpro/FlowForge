---
name: product-groessenklasse-bestimmen
description: Assigns a size class S/M/L with explicit reasoning to one refined story, forcing re-splitting for L. Use when the dark-factory workflow reaches step 5.2.4 "Groessenklasse bestimmen (S/M/L)".
bpmn:
  file: product-vision-to-user-stories.bpmn
  elements: [S5.2.4]
---

# Groessenklasse bestimmen (S/M/L) (step 5.2.4)

Generated from `product-vision-to-user-stories.bpmn`'s "Groessenklasse bestimmen (S/M/L)" (serviceTask, lane "Architekt") by `flowforge-generate`. The size-estimate replaces story points (Gedächtnis §4); the dor critic (SP5.2_CallK) and SP56_Gw use it — L sends the story back via G-Split to 5.1.3 — and 7 reports sizes in the backlog export. It is its own skill because it produces an independently versioned artifact with its own contract (body + sidecar), template and rubric (mapping-rubric.md's serviceTask rule; one skill per business step, docs/dark-factory/implementation.md §2).

Executed by the `product-architekt` agent. Binding rules: `${CLAUDE_PLUGIN_ROOT}/knowledge/process-rules.md` — evidence §6, item IDs §10, artifact contract §11.2, iterations §15.

## Run context

The Workflow passes `runDir`, `runId`, `iteration` and `changeRequests` (from the last gate record of this phase), `storyId`.

| Input | Required | Path pattern |
|---|---|---|
| `story-refined` | yes | `runs/{runId}/artifacts/p5-refinement/{storyId}/5.2.2_story-refined.md` |
| `wireframe-text` | yes | `runs/{runId}/artifacts/p5-refinement/{storyId}/5.2.3_wireframe-text.md` |

| Output | Item prefix | Cardinality | Path pattern |
|---|---|---|---|
| `size-estimate` | — | one | `runs/{runId}/artifacts/p5-refinement/{storyId}/5.2.4_size-estimate.md` |

- **Multi-instance**: runs once per story; the Workflow passes `storyId`. Per-story artifacts go under `artifacts/p5-refinement/<storyId>/`.

## Procedure

0. **Resume / iterate.** Read the output's sidecar (`<file>.meta.json`) if it exists. If it has `status: passed`/`passed-with-risk`, or `iteration > 1` and no change request concerns this artifact or an upstream artifact it consumes, return it unchanged (idempotent resume). Otherwise work every change request into the body and keep item IDs stable when the item is materially the same. Do not copy files to `history/` or touch `version` — `commit-artifact.mjs` does both (Gedächtnis §15).
1. Read story-refined (What, implementation notes, blockers) and wireframe-text (states, domain model) for the passed story id.
2. Derive the size drivers explicitly: number of business rules, states/variants, domain entities touched, integrations/dependencies, unknowns, and spikes still open.
3. Assign S, M or L using the driver list and state the reasoning in 2–4 sentences; disclose the drivers so the critic can recompute the judgment.
4. If L: set status needs-resplit on the story, name the drivers that make it large and suggest a splitting pattern for 5.1.3 (in `flags`/`notes`); do not shrink the story yourself.
5. If a size cannot be given because of technical uncertainty, set `size: null` with a `blockers` entry naming the SPK id (or propose a new spike for 5.1.4) instead of guessing.
6. Write size-estimate to artifacts/p5-refinement/<storyId>/ (commit it as usual; evidence 🧠 inferred) and set the size on the story with `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/story.mjs patch <runDir> <storyId> --step S5.2.4` → {"story": {"size": {"class": "M", "reasoning": "…"}}} (plus `"status": "needs-resplit"` for L).
7. Write the output **body** from `assets/template.md`: Markdown only, no frontmatter (the product-artifact-contract-guard hook rejects a Write that starts with `---`).
8. Run the self-check below and fix what fails. Never set `passed` yourself — only the critic gate does (Gedächtnis §2.2).
9. **Commit** every output file with its authored block (see "Artifact contract" below): `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/commit-artifact.mjs commit <runDir> <file.md> --step S5.2.4 <<'JSON'` … `JSON`. The script computes id, version, status, derivedFrom, evidence mix and history; fix every rejection it prints and commit again. Re-committing an unchanged file is a no-op. Then apply the story changes with `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/story.mjs patch <runDir> <storyId> --step S5.2.4` (see "Story records" below).
10. Log: `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/run-state.mjs event <runDir> '{"event":"step-done","element":"S5.2.4"}'`.

## Backlog records (Gedächtnis §11.3)

Stories and spikes are JSON-first: the record in the file's sidecar (`authored.attributes`, schema `df.story/v1` / `df.spike/v1`) is the story or spike; `backlog/stories/ST-*.md`, `SPK-*.md` and `backlog.json` are generated from it. Read one with `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/story.mjs show <runDir> <ST-id>` (or `spike.mjs show <SPK-id>`), list them with `list <runDir> [--epic EP-nnn]` (spikes: `[--blocks ST-nnn]`), get new ids with `next-id <runDir> [--count n]`.

**This step patches:** size (and status needs-resplit for L). `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/story.mjs patch <runDir> <ST-id> --step S5.2.4 <<'JSON'` {"story": {<only the fields you change>}} `JSON` — top-level fields replace, `connextra`/`size`/`scope` merge one level, the id is fixed. Never edit the story Markdown.

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

- [ ] Exactly one size class S, M or L (or unsized with SPK ref) per story.
- [ ] Reasoning names concrete drivers from story-refined and wireframe-text and is recomputable (scoring principle, Gedächtnis §2.5).
- [ ] L always results in status needs-resplit with a suggested pattern (Small = ≤ M).
- [ ] No open blockers or un-spiked risks are ignored in the estimate (dor).
- [ ] Size is consistent with the scope shown in the wireframe and edge-case list.

## Pitfalls

- Converting to hidden story points or hours — only S/M/L with reasoning is allowed.
- Rating an L as M to avoid a re-split loop.
- Sizing only the happy path and ignoring the error states and rules captured in 5.2.1/5.2.3.

## Return

Reply with JSON only: `{"status": "done|blocked|partial", "artifacts": ["<committed .md paths>"], "items": ["<item ids created or changed>"], "riskFlags": [], "summary": "<one sentence>"}`.

## Domain knowledge

See `references/domain-knowledge.md` (cited from notebook "The Product - Business Design"; phase brief `knowledge/phase-5-6-stories-akzeptanz.md`).
