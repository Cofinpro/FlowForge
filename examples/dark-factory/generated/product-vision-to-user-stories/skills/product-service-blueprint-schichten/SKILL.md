---
name: product-service-blueprint-schichten
description: >-
  Layers the future-state journey into a service blueprint (customer actions, frontstage, backstage, support systems) on the target architecture from the idea brief, with rated backstage complexity
  and web-fact-checked system claims. Use when the dark-factory workflow reaches step 3.1.4 "Service Blueprint schichten".
bpmn:
  file: product-vision-to-user-stories.bpmn
  elements: [S3.1.4]
---

# Service Blueprint schichten (step 3.1.4)

Generated from `product-vision-to-user-stories.bpmn`'s "Service Blueprint schichten" (serviceTask, lane "Architekt") by `flowforge-generate`. Shows what must exist behind every touchpoint so S4.2.2 can cut a walking skeleton through all layers and later sizing/spikes can see backstage complexity. It is its own skill because it produces an independently versioned artifact with its own contract (body + sidecar), template and rubric (mapping-rubric.md's serviceTask rule; one skill per business step, docs/dark-factory/implementation.md §2).

Executed by the `product-architekt` agent. Binding rules: `${CLAUDE_PLUGIN_ROOT}/knowledge/process-rules.md` — evidence §6, item IDs §10, artifact contract §11.2, iterations §15.

## Run context

The Workflow passes `runDir`, `runId`, `iteration` and `changeRequests` (from the last gate record of this phase).

| Input | Required | Path pattern |
|---|---|---|
| `journey-future` | yes | `runs/{runId}/artifacts/p3-journey/3.1.3_journey-future.md` |
| `idea-brief` | yes | `runs/{runId}/00_idea-brief.md` |

| Output | Item prefix | Cardinality | Path pattern |
|---|---|---|---|
| `service-blueprint` | — | one | `runs/{runId}/artifacts/p3-journey/3.1.4_service-blueprint.md` |

- **Light research**: `websearch` (factcheck). Free channels only (WebSearch) — never Deep Research or a direct Gemini API call here. Fetch the page text with `node ${CLAUDE_PLUGIN_ROOT}/skills/product-recherche/scripts/providers/raw-fetch.mjs <runDir> --call <step> --tool websearch --query "<q>" --url <u>…`, normalize it with `node ${CLAUDE_PLUGIN_ROOT}/skills/product-recherche/scripts/normalize-sources.mjs <runDir> <raw.json>` and cite only the resulting `SRC-` ids (Gedächtnis §8.0/§8.3).

## Procedure

0. **Resume / iterate.** Read the output's sidecar (`<file>.meta.json`) if it exists. If it has `status: passed`/`passed-with-risk`, or `iteration > 1` and no change request concerns this artifact or an upstream artifact it consumes, return it unchanged (idempotent resume). Otherwise work every change request into the body and keep item IDs stable when the item is materially the same. Do not copy files to `history/` or touch `version` — `commit-artifact.mjs` does both (Gedächtnis §15).
1. Read `zielarchitektur`/`plattform` and `constraints` from idea-brief; note which fields are 🧠 assumptions and carry that flag onto dependent blueprint cells.
2. For each journey-future anchor create one column with lanes: customer action | line of interaction | frontstage (touchpoint) | line of visibility | backstage action | line of internal interaction | support process / IT system.
3. Trace every frontstage interaction down to at least one backstage action or support system; mark gaps as "no backstage yet" explicitly.
4. Rate backstage complexity per column low/medium/high with a disclosed reason (new component, external integration, regulated data, manual process) — a manual backstage is allowed and flagged as candidate "crutch" for S4.2.2.
5. Fact-check claims about external systems, APIs, platform limits and regulatory obligations with WebSearch/WebFetch; normalize every retrieved source via `node skills/product-recherche/scripts/normalize-sources.mjs` into `research/sources/SRC-*.md` and cite by SRC id; mark unchecked claims 🧠.
6. Render the blueprint as a Markdown table per stage or a Mermaid flowchart with subgraphs per lane; no images.
7. List cross-column shared components/systems and the riskiest backstage items (high complexity or unverified external dependency) for release sequencing.
8. Write the output **body** from `assets/template.md`: Markdown only, no frontmatter (the product-artifact-contract-guard hook rejects a Write that starts with `---`).
9. Run the self-check below and fix what fails. Never set `passed` yourself — only the critic gate does (Gedächtnis §2.2).
10. **Commit** every output file with its authored block (see "Artifact contract" below): `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/commit-artifact.mjs commit <runDir> <file.md> --step S3.1.4 <<'JSON'` … `JSON`. The script computes id, version, status, derivedFrom, evidence mix and history; fix every rejection it prints and commit again. Re-committing an unchanged file is a no-op.
11. Log: `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/run-state.mjs event <runDir> '{"event":"step-done","element":"S3.1.4"}'`.

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

## Self-check (rubric `service-blueprint` — judged by `product-kritiker-pruefung`)

- [ ] Rubric `service-blueprint`: frontstage, line of visibility, backstage and support systems all present; backstage complexity rated.
- [ ] Strict separation at the line of visibility: nothing the customer cannot see is in frontstage.
- [ ] Every frontstage interaction traces to a backstage process or system, or is marked as a gap.
- [ ] Blueprint is consistent with the target architecture/platform from idea-brief; brief-derived 🧠 assumptions are flagged.
- [ ] Every external-system or regulatory claim cites an SRC produced by this step or DR-03, or is marked 🧠.

## Pitfalls

- Mixing internal staff actions into frontstage (blurring the line of visibility).
- Designing a technology stack that ignores the brief's `zielarchitektur`.
- Citing a web page without normalizing it into an SRC artifact.

## Return

Reply with JSON only: `{"status": "done|blocked|partial", "artifacts": ["<committed .md paths>"], "items": ["<item ids created or changed>"], "riskFlags": [], "summary": "<one sentence>"}`.

## Domain knowledge

See `references/domain-knowledge.md` (cited from notebook "The Product - Business Design"; phase brief `knowledge/phase-3-4-journey-story-map.md`).
