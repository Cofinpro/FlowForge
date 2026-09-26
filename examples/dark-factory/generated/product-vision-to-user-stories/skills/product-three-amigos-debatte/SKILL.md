---
name: product-three-amigos-debatte
description: >-
  Runs a simulated three-amigos debate for one story in three perspectives (BLA what, ARC how, QA edge cases) and writes the protocol. Use when the dark-factory workflow reaches step 5.2.1
  "Three-Amigos-Debatte (3 Perspektiven)".
bpmn:
  file: product-vision-to-user-stories.bpmn
  elements: [S5.2.1]
---

# Three-Amigos-Debatte (3 Perspektiven) (step 5.2.1)

Generated from `product-vision-to-user-stories.bpmn`'s "Three-Amigos-Debatte (3 Perspektiven)" (serviceTask, lane "Backlog-Autor") by `bpmn2agent-generate`. The amigos-protocol replaces the human three-amigos session (Gedächtnis §4); 5.2.2 uses it to separate What from How, and its edge cases feed 6.1.1 confirmation notes and 6.1.2 SBE examples. It is its own skill because it produces an independently versioned artifact with its own contract (body + sidecar), template and rubric (mapping-rubric.md's serviceTask rule; one skill per business step, docs/dark-factory/implementation.md §2).

Executed by the `product-backlog-autor` agent. Binding rules: `${CLAUDE_PLUGIN_ROOT}/knowledge/process-rules.md` — evidence §6, item IDs §10, artifact contract §11.2, iterations §15.

## Run context

The Workflow passes `runDir`, `runId`, `iteration` and `changeRequests` (from the last gate record of this phase), `storyId`.

| Input | Required | Path pattern |
|---|---|---|
| `story-cards` | yes | `runs/{runId}/backlog/stories/ST-{nnn}_{slug}.md` |

| Output | Item prefix | Cardinality | Path pattern |
|---|---|---|---|
| `amigos-protocol` | — | one | `runs/{runId}/artifacts/p5-refinement/{storyId}/5.2.1_amigos-protocol.md` |

- **Multi-instance**: runs once per story; the Workflow passes `storyId`. Per-story artifacts go under `artifacts/p5-refinement/<storyId>/`.

## Procedure

0. **Resume / iterate.** Read the output's sidecar (`<file>.meta.json`) if it exists. If it has `status: passed`/`passed-with-risk`, or `iteration > 1` and no change request concerns this artifact or an upstream artifact it consumes, return it unchanged (idempotent resume). Otherwise work every change request into the body and keep item IDs stable when the item is materially the same. Do not copy files to `history/` or touch `version` — `commit-artifact.mjs` does both (Gedächtnis §15).
1. Take the story id passed by the Workflow (MI over ST[from=5.1]); read backlog/stories/ST-nnn_<slug>.md, its UT/EP context and its unvalidated ASM list.
2. Business perspective (BLA): restate the user need and outcome, the persona and the trigger situation; list what is in and out of scope for this story.
3. Development perspective (ARC): name how it could be built against the idea-brief target architecture, dependencies on other stories/spikes, technical constraints and risks — as notes, not as story text.
4. Testing perspective (QA): list edge cases, limits, error and exception situations, data variations and "what if" questions (expired, empty, duplicate, concurrent, no permission).
5. Let the perspectives challenge each other in at least one round: each open question is answered, turned into an assumption (reference or propose ASM), or recorded as a blocker.
6. Write the protocol to artifacts/p5-refinement/<storyId>/ with sections What (BLA), How (ARC), Edge cases (QA), decisions, open questions/blockers; mark all content 🧠 inferred with the ST/ASM ids it rests on.
7. Write the output **body** from `assets/template.md`: Markdown only, no frontmatter (the product-artifact-contract-guard hook rejects a Write that starts with `---`).
8. Run the self-check below and fix what fails. Never set `passed` yourself — only the critic gate does (Gedächtnis §2.2).
9. **Commit** every output file with its authored block (see "Artifact contract" below): `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/commit-artifact.mjs commit <runDir> <file.md> --step S5.2.1 <<'JSON'` … `JSON`. The script computes id, version, status, derivedFrom, evidence mix and history; fix every rejection it prints and commit again. Re-committing an unchanged file is a no-op.
10. Log: `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/run-state.mjs event <runDir> '{"event":"step-done","element":"S5.2.1"}'`.

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

- [ ] All three perspectives are present, each with substantive content (at least one entry per perspective).
- [ ] What (BLA), How (ARC) and edge cases (QA) are recorded in separate sections.
- [ ] At least one negative/exception case per story is identified for later AC work.
- [ ] Every open question ends as an answer, an ASM reference, or a named blocker — none left dangling.
- [ ] Protocol references the ST id and the ASM ids it touches.

## Pitfalls

- Three voices that just agree — no challenge, no new edge cases (rubber-stamp debate).
- The ARC perspective rewriting the story into a technical task instead of annotating How.
- QA listing generic test types ("do load testing") instead of concrete edge cases of this story.

## Return

Reply with JSON only: `{"status": "done|blocked|partial", "artifacts": ["<committed .md paths>"], "items": ["<item ids created or changed>"], "riskFlags": [], "summary": "<one sentence>"}`.

## Domain knowledge

See `references/domain-knowledge.md` (cited from notebook "The Product - Business Design"; phase brief `knowledge/phase-5-6-stories-akzeptanz.md`).
