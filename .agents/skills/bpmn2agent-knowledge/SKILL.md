---
name: bpmn2agent-knowledge
description: Grounds the agents/skills that will be generated from a BPMN diagram in real domain knowledge before design starts — the third step of the bpmn-to-agentic-workflow pipeline (analyze → knowledge → design → generate → verify). Looks for Gemini notebooks (NotebookLM, via gemini-notebook-mcp) mapped to lanes/tasks, uses them to challenge the BPMN (find gaps, surface open questions — never silently redesign) and to extract cited reference material per generated skill/agent. Falls back to WebSearch or explicitly "unverified" model knowledge when no notebook exists. Use after bpmn2agent-analyze has produced generated/<workflow>/workflow-spec.yaml, before bpmn2agent-design.
bpmn:
  file: docs/planning/bpmn-to-agentic-workflow.bpmn
  elements:
    - Task_Knowledge
---

# BPMN → Agent Knowledge Grounding

Second-to-third step of the `bpmn-to-agentic-workflow` pipeline. Input is the spec that
`bpmn2agent-analyze` wrote; output is the same spec enriched with `knowledge:` and
`openQuestions:`, plus a `knowledge/*.md` file per mapped element/lane. `bpmn2agent-design` and
`bpmn2agent-generate` consume both later — they don't talk to notebooks themselves.

## 1. Read the spec

Read `generated/<workflow>/workflow-spec.yaml`. If it doesn't exist, **stop** and tell the user to
run `bpmn2agent-analyze` first — this skill never parses the `.bpmn` file itself. From the spec,
list the lanes/roles and the elements (tasks, gateways, sub-processes) that survived analysis; these
are the mapping targets for notebooks and the units the extraction step writes one file per.

## 2. Ask about notebooks

In plain business language, not tool jargon: ask whether they have one or more Gemini notebooks
(NotebookLM) containing knowledge the workflow's agents should have — process handbooks, policy
docs, prior project write-ups, domain glossaries, anything a new team member would be pointed at.

Load the MCP tools before calling them:

```
ToolSearch: select:mcp__gemini-notebook-mcp__notebook_list,mcp__gemini-notebook-mcp__notebook_describe,mcp__gemini-notebook-mcp__notebook_query
```

Call `notebook_list` first and show the user their actual notebook titles via `AskUserQuestion`
(options = notebook titles + "none of these" + a clear recommended option) so they pick by name
rather than typing UUIDs. If the tool errors with an auth/connection failure, tell the user to run
`nlm login` in a terminal and ask (don't assume) whether to retry after or continue without a
notebook. `notebook_describe` on a chosen notebook gives its AI summary — use it to sanity-check the
user's pick before mapping.

Allow **multiple** notebooks. For each one, ask which lanes/tasks it covers and record it as
`knowledge.notebooks[]` in the spec:

```yaml
knowledge:
  notebooks:
    - id: <uuid>
      title: <notebook title>
      mappedTo: [<laneId or elementId>, ...]
  mode: notebook | websearch | unverified   # fallback mode actually used, see §3
```

## 3. No notebook → offer a fallback

If the user has none, or declines, offer four options via `AskUserQuestion` (recommend (a) unless
the domain is generic/well-known, then recommend (b); recommend (d) instead of either when this
workflow is itself being generated from a process that already has hand-authored, reviewed
reference material sitting in this same repo — see (d)):

- **(a) WebSearch research per lane** — run targeted `WebSearch` queries per lane/phase, cite what
  comes back, mark it `evidence: cited`.
- **(b) Proceed with model knowledge** — usable for well-known domains, but every resulting claim
  gets marked `evidence: unverified` (see `references/notebook-extraction.md` for the exact
  callout/frontmatter convention). Never silently upgrade this later.
- **(c) Pause to create a notebook** — the user goes and builds one, then re-runs this skill.
- **(d) Cite existing repo docs** — this diagram's domain already has an existing, already-reviewed
  reference file (or a few) living in this repo — e.g. dogfooding this very pipeline against its own
  meta-process, where `bpmn2agent-design/references/mapping-rubric.md` etc. already document the
  domain far better than a fresh model-only pass could. Ask which file(s) apply per lane/element,
  same as mapping a notebook. Mark it `evidence: cited` (the file is a reviewed, checked-in source,
  not a bare model claim) — see `references/notebook-extraction.md`'s "Citing local repo docs"
  section for the ref format.

Record the choice as `knowledge.mode` in the spec (`notebook | websearch | local-docs |
unverified`). Mixing is fine: some lanes may have a notebook, others fall back to (a)/(b)/(d) —
record the mode per notebook mapping / per lane, not just once globally, when they differ.

## 4. Challenge the BPMN

For each lane/phase that has a notebook, a WebSearch fallback (a), or a local-docs fallback (d), ask
a **challenge query** per the patterns in `references/notebook-extraction.md` §Challenge queries —
roughly: "what steps, checks, roles, or artifacts do the sources describe for `<this activity,
quoted from the BPMN>` that the diagram lacks or does differently?" — answered from the notebook,
WebSearch, or the cited repo file, respectively.

**Under mode (b) (model knowledge, no source at all)**: still run this step, just answer the same
challenge questions from model reasoning instead of `notebook_query`/`WebSearch`/a repo file, and
mark every resulting finding `unverified`, same as any other model-only claim. Don't skip
challenging the diagram just because there's no source to query — the `unverified` evidence tier
exists specifically so this can still happen, honestly labelled, rather than silently doing nothing
once a run falls back to (b).

Turn every real finding into a question for the user — **never** change the design based on a
notebook answer without asking first; the human drew the diagram and owns it. Record each open
question and (once answered) its resolution in the spec's `openQuestions:` list:

```yaml
openQuestions:
  - element: <elementId>
    question: <what the source suggests that the diagram doesn't have>
    source: <notebook title or WebSearch>
    answer: <user's decision, or "pending">
```

If the user's answer implies a BPMN change, that's a hand-back to the human modeler (or a note for
`bpmn2agent-design`'s loop-to-analyze path) — this skill records the question and answer, it doesn't
edit the `.bpmn` or the spec's structural fields itself.

**Log every notebook answer as a FAQ entry** — challenge queries here and extraction queries in §5
alike — in `generated/<workflow>/knowledge/faq/` with `scripts/notebook-faq.py` (details in
`references/notebook-extraction.md` §FAQ log). On a re-run, read `knowledge/faq/README.md` first and
re-ask only what it doesn't answer or what the changed diagram makes stale. Questions about how to
build the agentic side (patterns, agents, skills, checkpoints) rather than the business domain go to
`.agents/skills/agentic-workflow-kb/` instead — it already has cited answers.

## 5. Extract reference material per element

For each element mapped to a notebook, a WebSearch fallback, or a local-docs fallback, run the
**extraction queries** from `references/notebook-extraction.md` §Extraction queries — procedure,
criteria/checklists, pitfalls, terminology — and write the distilled result to
`generated/<workflow>/knowledge/<element-or-lane>.md` with inline citations (format in the same
reference file). Under mode (d) (local-docs), "extraction" can be a direct citation of the existing
repo file instead of a distilled rewrite — see `references/notebook-extraction.md`'s "Citing local
repo docs" section for when to distill vs. cite the source path directly in `knowledge.refs`.

**Under mode (b) (model knowledge)**: still write one file per in-scope element, same as above, just
sourced from model reasoning instead of a query — every claim in it `unverified` (frontmatter
`evidence: unverified`, inline `⚠ unverified` callouts throughout, per
`references/notebook-extraction.md`'s evidence-marking section). Don't treat mode (b) as "no files,
just a `knowledge.mode: unverified` note" — the note alone loses the per-element grounding
`bpmn2agent-design`/`-generate` read `knowledge.refs` for.

Every `generated/<workflow>/knowledge/*.md` file this step writes carries the same `bpmn:`
frontmatter every other pipeline-generated Markdown file does (`bpmn2agent-generate/SKILL.md` step
2's convention — this skill writes files too, so it follows the same rule, not just the generation
stage):

```yaml
---
element: <elementId>
evidence: cited | inferred | unverified
sources: ["Finance Handbook v3"]
bpmn:
  file: <meta.sourceBpmn.path>
  elements: [<elementId>]
---
```

These `generated/<workflow>/knowledge/*.md` files **persist** — they are not deleted once
`bpmn2agent-generate` copies their content into a skill's `references/` (step 6 below); they stay on
disk as the traceable source `bpmn2agent-verify` checks against `knowledge.refs`, exactly the way
`generatedPaths` traces a skill/script file. Only remove one if its content genuinely turned out
unneeded (e.g. design left the element's own `knowledge` unset because grounding wouldn't change
anything) — and if you do, also drop its `knowledge.refs` entry so the two stay in sync.

`notebook_query` output can exceed the tool's inline output limit and get saved to a file instead —
when that happens, extract the `.answer` field with `jq '.answer' <file>` and read it in chunks
rather than trying to load the whole raw response. Distill before writing: these files become a
generated skill's `references/`, so keep each one a short, citation-backed brief, not a transcript
dump — see `references/notebook-extraction.md` §Keep it short for the target length and what to cut.

Record the per-element refs in the spec:

```yaml
knowledge:
  refs:
    <elementId>: generated/<workflow>/knowledge/<element-or-lane>.md
```

## 6. Hand off

Confirm before finishing: every mapped element has either a `knowledge.refs` entry or an explicit
"no notebook coverage, mode: <fallback>" note; every challenge finding has an `openQuestions` entry
with an answer (not left "pending") or is flagged for the user to resolve before design proceeds.
`bpmn2agent-design` reads `knowledge.notebooks`, `knowledge.refs` and `openQuestions` to shape roles
and models; `bpmn2agent-generate` later copies `knowledge/*.md` into each generated skill's
`references/` and distills the rest into agents' "Domain knowledge" sections — this skill does
neither of those copies itself, and the original `generated/<workflow>/knowledge/*.md` files stay in
place after that copy (see step 5) — `bpmn2agent-verify` traces them via `knowledge.refs`, not via
any `generatedPaths` entry.

## Reference files

- `references/notebook-extraction.md` — challenge/extraction query patterns, citation format,
  the `cited`/`inferred`/`unverified` evidence convention, chunking large `notebook_query` output,
  how short an extracted knowledge file should be, and the FAQ log.

## Scripts

- `scripts/notebook-faq.py` — `add` turns one saved `notebook_query` result into a FAQ entry
  (question, verbatim answer, citation table: number → source title → cited passage) and rebuilds
  the index; `index` only rebuilds the index. Also used by `agentic-workflow-kb`.
