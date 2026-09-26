---
name: product-synthetisches-panel-aufbauen
description: >-
  Produces panel-profiles: the full synthetic panel of 6 personas (P items: 4 target users, 1 Contrarian, 1 Verweigerer), each with an open part and a hidden persona-only part, every trait grounded in
  SRC sources found via DuckDuckGo bulk discovery and WebSearch factcheck. Use when the dark-factory workflow reaches step S2.1.3 "Synthetisches Panel aus Research-Korpus aufbauen".
bpmn:
  file: product-vision-to-user-stories.bpmn
  elements: [S2.1.3]
---

# Synthetisches Panel aus Research-Korpus aufbauen (step 2.1.3)

Generated from `product-vision-to-user-stories.bpmn`'s "Synthetisches Panel aus Research-Korpus aufbauen" (serviceTask, lane "Researcher") by `bpmn2agent-generate`. Replaces the proto-panel; product-panel-befragung plays these profiles in S2.1.4 (interviews), S2.2.1, S2.2.5, S3.1.1, S3.1.3 and the gates G-P2/G-P3, and the SP2.1 critic judges them against rubric panel-grounding. It is its own skill because it produces an independently versioned artifact with its own contract (body + sidecar), template and rubric (mapping-rubric.md's serviceTask rule; one skill per business step, docs/dark-factory/implementation.md §2).

Executed by the `product-researcher` agent. Binding rules: `${CLAUDE_PLUGIN_ROOT}/knowledge/process-rules.md` — evidence §6, item IDs §10, artifact contract §11.2, iterations §15.

## Run context

The Workflow passes `runDir`, `runId`, `iteration` and `changeRequests` (from the last gate record of this phase).

| Input | Required | Path pattern |
|---|---|---|
| `proto-panel` | yes | `runs/{runId}/panel/proto/P-{nnn}_{slug}.md` |

| Output | Item prefix | Cardinality | Path pattern |
|---|---|---|---|
| `panel-profiles` | P | many | `runs/{runId}/panel/personas/P-{nnn}_{slug}.md` |

- **Light research**: `ddg` (discovery), `websearch` (factcheck). Free channels only (WebSearch) — never Deep Research or a direct Gemini API call here. Fetch the page text with `node ${CLAUDE_PLUGIN_ROOT}/skills/product-recherche/scripts/providers/raw-fetch.mjs <runDir> --call <step> --tool websearch --query "<q>" --url <u>…`, normalize it with `node ${CLAUDE_PLUGIN_ROOT}/skills/product-recherche/scripts/normalize-sources.mjs <runDir> <raw.json>` and cite only the resulting `SRC-` ids (Gedächtnis §8.0/§8.3).

## Procedure

0. **Resume / iterate.** Read the output's sidecar (`<file>.meta.json`) if it exists. If it has `status: passed`/`passed-with-risk`, or `iteration > 1` and no change request concerns this artifact or an upstream artifact it consumes, return it unchanged (idempotent resume). Otherwise work every change request into the body and keep item IDs stable when the item is materially the same. Do not copy files to `history/` or touch `version` — `commit-artifact.mjs` does both (Gedächtnis §15).
1. Read proto-panel (its P items), the research-zielgruppe-voc corpus in artifacts/ and its SRC files in research/sources/, and the panel slot allocation of stakeholder-matrix in the run workspace; take the core problem assumption from 00_idea-brief.md and the proto-panel.
2. Define the 6 slots (Gedächtnis §7.1): 4 target users on distinct segment × context × maturity combinations, 1 Contrarian who is skeptical of the core assumption and hunts weaknesses, 1 Verweigerer who belongs to the target group but has a working workaround and no intent to switch. Allocate new P ids (never reuse proto ids); a persona that continues a proto persona lists that P id in derivedFrom.
3. Run DuckDuckGo bulk URL discovery per slot: 3–6 queries each aimed at a missing source type (forum threads, product reviews, app-store ratings, social posts, reports); for the Verweigerer search for satisfied users of the incumbent workaround, for the Contrarian for critiques of the solution category. Fetch the promising URLs with WebFetch.
4. Normalize every retrieved source with `node skills/product-recherche/scripts/normalize-sources.mjs` into research/sources/SRC-<nnnn>.md (url, title, retrievedAt, tool, query, contentHash, sourceType); cite only the resulting SRC ids.
5. Factcheck with WebSearch: every trait that rests on a DDG-discovered source must be corroborated by a second SRC from WebSearch or the DR-02 corpus (DuckDuckGo is never the sole source of a claim); drop or replace traits that fail.
6. Write the open part per persona (visible to the interviewer): concrete role title, segment, context, maturity, recent behaviour, publicly voiced frustrations and 1–3 verbatim source quotes as "voice" (🔗 with SRC).
7. Write the hidden part per persona between `<!-- persona-hidden:start P-<nnn> -->` and `<!-- persona-hidden:end -->` (Gedächtnis §7.3): budget / willingness to pay, skepticism level 1–5, current workaround and its satisfaction, switching barriers, one "secret" that only good questioning surfaces; each attribute with SRC. Set the Contrarian to skepticism ≥4 and the Verweigerer to high workaround satisfaction.
8. Build the source-mix table (SRC → sourceType → personas) and verify: ≥3 distinct source types across the panel, ≥2 distinct SRC per persona, no trait without SRC. Record every P item in itemIndex as cited 🔗 with derivedFrom = its SRC ids (+ proto P id).
9. Write the output **body** from `assets/template.md`: Markdown only, no frontmatter (the product-artifact-contract-guard hook rejects a Write that starts with `---`); one file per instance, following the path pattern.
10. Run the self-check below and fix what fails. Never set `passed` yourself — only the critic gate does (Gedächtnis §2.2).
11. **Commit** every output file with its authored block (see "Artifact contract" below): `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/commit-artifact.mjs commit <runDir> <file.md> --step S2.1.3 <<'JSON'` … `JSON`. The script computes id, version, status, derivedFrom, evidence mix and history; fix every rejection it prints and commit again. Re-committing an unchanged file is a no-op.
12. Log: `node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/run-state.mjs event <runDir> '{"event":"step-done","element":"S2.1.3"}'`.

## Artifact contract (Gedächtnis §11.2)

Every output is two files: `<file>.md` (the body you write; its frontmatter is rendered read-only from the sidecar) and `<file>.meta.json` (the sidecar, written only by `commit-artifact.mjs`). Read upstream metadata from sidecars, never from rendered frontmatter.

**You supply** the authored block on stdin (`node ${CLAUDE_PLUGIN_ROOT}/skills/product-traceability/scripts/commit-artifact.mjs schema` prints its JSON Schema):

```json
{
  "itemIndex": [
    {
      "id": "P-001",
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

## Self-check (rubric `panel-grounding` — judged by `product-kritiker-pruefung`)

- [ ] Every trait in open and hidden parts carries ≥1 SRC reference; no uncited trait remains (rubric panel-grounding, Gedächtnis §6/§7.2).
- [ ] The panel uses ≥3 distinct source types and no persona rests on a single source (rubric panel-grounding).
- [ ] Exactly 6 P items: 4 target users on distinct segment/context/maturity combinations, 1 Contrarian, 1 Verweigerer (rubric panel-grounding).
- [ ] Every profile has a delimited hidden part with budget/WTP, skepticism 1–5, workaround + satisfaction, switching barriers and a secret (rubric panel-grounding, §7.3).
- [ ] Every SRC cited exists as research/sources/SRC-<nnnn>.md produced by normalize-sources.mjs; no claim rests on a DDG-only source.
- [ ] New P ids are used; proto P ids are only referenced in derivedFrom.

## Pitfalls

- Inventing plausible traits (age, income, hobbies) with no SRC — they must be dropped, not marked 🧠.
- Making the Contrarian merely negative in tone instead of skeptical of the specific core assumption with sourced arguments.
- Giving the Verweigerer a weak workaround, so it is really a latent target user and the switching-intent test is lost.
- Leaking hidden attributes into the open part (e.g. mentioning the workaround satisfaction), which lets the interviewer skip good questioning.

## Return

Reply with JSON only: `{"status": "done|blocked|partial", "artifacts": ["<committed .md paths>"], "items": ["<item ids created or changed>"], "riskFlags": [], "summary": "<one sentence>"}`.

## Domain knowledge

See `references/domain-knowledge.md` (cited from notebook "The Product - Business Design"; phase brief `knowledge/phase-2-discovery.md`).
