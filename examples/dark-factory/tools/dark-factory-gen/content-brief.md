# Brief: author step-skill content JSON for the dark factory

Repo root: /Users/benjamin.tenke/dev/github-work/ai-sdlc-dojo-2026-factory
Scratchpad: /private/tmp/claude-501/-Users-benjamin-tenke-dev-github-work-ai-sdlc-dojo-2026-factory/335369c0-fb5b-4485-8d3b-5d923b4a661e/scratchpad

You write ONLY the domain content for a set of BPMN steps. A generator script turns your JSON into
`SKILL.md` + `assets/template.md` + `references/domain-knowledge.md` per step. The generator adds
the uniform parts itself — do NOT repeat them: run-context header, reading declared inputs, the artifact
contract (body + sidecar, commit-artifact.mjs), change-request handling on re-runs, versioning, return JSON, BPMN traceability.

## Read first
1. `docs/dark-factory/process-rules.md` (repo root) — binding rules: roles §4, evidence §6, panel §7,
   research routing §8, gates §9, item IDs & trace chain §10, artifact contract §11.2, rubric seeds §13,
   idea brief §14. Your self-checks MUST include the §13 rubric core criteria of the step's artifact.
2. Your phase's knowledge file under `generated/product-vision-to-user-stories/knowledge/` (cited
   notebook distillation). Use its footnotes for `domainKnowledge`.
3. `sdlc.json` in the scratchpad: per element id → `step` (agentRole, key, skill), `inputs`,
   `outputs` (artifact, itemPrefix, cardinality), `panel` (mode, panelSet, optional), `research`
   (tool, purpose). Respect them exactly.
4. `steps.mjs` in the scratchpad: element id → [skillName, runPhaseDir, knowledgeKey].

## Runtime facts the procedure can rely on
- The step runs as the role's subagent (`product-<agentRole>`) inside a Claude Code Workflow run. Run workspace:
  `runs/<runId>/` (layout: 00_idea-brief.md, artifacts/<phaseDir>/, panel/, research/sources|reports,
  gates/, backlog/epics|stories, history/, log/events.jsonl, run.json).
- If the step has `panel`, the Workflow has ALREADY run the panel (skill `product-panel-befragung`) before the
  step and passes the panel result path; the procedure must consume it (e.g. ratings/votes/walkthrough
  comments) and mark panel-derived content 🤖 synthetic. If panel `optional: true`, the procedure must
  work without it (budget may skip it).
- If the step has `research` websearch/ddg (light research), the step itself uses WebSearch/WebFetch,
  and every retrieved source must be normalized via `node skills/product-recherche/scripts/normalize-sources.mjs`
  into `research/sources/SRC-*.md` and cited by SRC id. Deep research is NOT done inside steps.
- Items: every output with itemPrefix creates items `<PREFIX>-<nnn>` (never reuse ids), each with
  `derivedFrom` item ids and an evidence level (cited 🔗 / inferred 🧠 / synthetic 🤖), recorded in
  the authored `itemIndex` (handed to commit-artifact.mjs). Scoring steps disclose inputs + formula (Gedächtnis §2.5).
- The critic (product-kritiker-pruefung) judges later; the step only self-checks. Never set status passed.

## Adopted source additions (MUST appear in the named steps)
- S2.1.2 / S2.1.4: problem ranking (top-3 problems, shuffled per persona; core problem not in a
  persona's top 3 = kill signal for G-P2, recorded in the transcript synthesis).
- S1.2.1: One Metric That Matters, placed on AARRR, instead of a loose KPI list.
- S2.2.5: Opportunity score = Importance + max(Importance − Satisfaction, 0) from panel rating (1–5), inputs disclosed.
NOT adopted: global quality pyramid / zone-of-control check in 5.1 (do not add).

## Output
Write valid JSON to `<scratchpad>/content/<your-file>.json`:
```json
{
  "<elementId>": {
    "description": "One English sentence, trigger-worthy: what it produces + 'Use when the dark-factory workflow reaches step <key> \"<BPMN label verbatim>\".'",
    "purpose": "1–2 sentences: what the artifact is for downstream (name the consuming steps).",
    "procedure": ["5–9 concrete imperative steps, English, referencing artifact type ids and item prefixes; include panel/research use when the element has it"],
    "selfCheck": ["4–8 checkable criteria = Gedächtnis §13 core criteria + cited criteria"],
    "pitfalls": ["2–4 concrete failure modes"],
    "templateSections": ["## Heading — one-line hint of what goes in", "..."],
    "domainKnowledge": "Markdown, 8–25 lines: the parts of the phase knowledge file relevant to THIS step, with [^n] markers and the footnote definitions at the end (copy the footnote text verbatim from the knowledge file; renumber from 1)."
  }
}
```
English everywhere except quoted BPMN labels. Be concrete and compact — no filler. Return a one-line
summary when done (file path + number of elements).
