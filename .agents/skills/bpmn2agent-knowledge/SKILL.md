---
name: bpmn2agent-knowledge
description: Grounds the agents and skills to be generated from a BPMN diagram in domain knowledge. Maps Gemini notebooks (NotebookLM, via gemini-notebook-mcp) to lanes/tasks, uses them to challenge the diagram (gaps become open questions, never silent redesign) and extracts cited reference material per element. Falls back to WebSearch, reviewed repo docs, or model knowledge marked "unverified". Use after bpmn2agent-analyze wrote generated/<workflow>/workflow-spec.yaml, before bpmn2agent-design.
bpmn:
  file: docs/planning/bpmn-to-agentic-workflow.bpmn
  elements:
    - Task_Knowledge
---

# BPMN → Agent Knowledge Grounding

Input: the spec `bpmn2agent-analyze` wrote. Output: the same spec with `knowledge:` and
`openQuestions:` filled, plus `generated/<workflow>/knowledge/*.md` per mapped element/lane. Later
stages read these; they don't query notebooks themselves.

Every question goes through `AskUserQuestion` with concrete options plus a recommendation, in the
user's business language.

## 1. Read the spec

Read `generated/<workflow>/workflow-spec.yaml`. Missing: **stop** and tell the user to run
`bpmn2agent-analyze` first; never parse the `.bpmn` here. Its lanes/roles and elements are the
mapping targets and the units extraction writes one file per.

## 2. Ask about notebooks

Ask whether they have Gemini notebooks (NotebookLM) with knowledge the agents should have (process
handbooks, policies, prior write-ups, glossaries). Load the tools first:

```
ToolSearch: select:mcp__gemini-notebook-mcp__notebook_list,mcp__gemini-notebook-mcp__notebook_describe,mcp__gemini-notebook-mcp__notebook_query,mcp__gemini-notebook-mcp__notebook_get
```

Call `notebook_list` and offer the actual titles as options (plus "none of these" and a
recommendation), so the user picks by name, not UUID. On an auth/connection error, tell the user to
run `nlm login` in a terminal and ask whether to retry or continue without a notebook. Use
`notebook_describe` to sanity-check a pick before mapping.

Allow multiple notebooks. Ask which lanes/tasks each covers and record:

```yaml
knowledge:
  notebooks:
    - id: <uuid>
      title: <notebook title>
      mappedTo: [<laneId or elementId>, ...]
  mode: notebook | websearch | local-docs | unverified   # see §3
```

## 3. No notebook → offer a fallback

For lanes without a notebook, offer via `AskUserQuestion`. Recommend (d) if reviewed reference docs
for this domain exist in the repo, else (b) for generic domains, else (a).

- **(a) WebSearch per lane** — targeted queries per lane/phase, cited, `evidence: cited`.
- **(b) Model knowledge** — every claim `evidence: unverified`; never silently upgraded later.
- **(c) Pause to create a notebook** — the user builds one and re-runs this skill.
- **(d) Cite existing repo docs** — ask which reviewed file(s) apply per lane/element;
  `evidence: cited`. Format: `references/notebook-extraction.md` §Citing local repo docs.

`knowledge.mode`: `notebook` if every element has notebook coverage, else the fallback
(`websearch | local-docs | unverified`). Mixing is fine; record the fallback used for uncovered lanes
as `knowledge.mode` and name each lane's source in its `knowledge/*.md` `sources:`.

## 4. Challenge the BPMN

For each lane/phase, run the **challenge queries** from `references/notebook-extraction.md`
§Challenge queries against its source (notebook, WebSearch or repo file). Under (b), answer them
from model reasoning and mark every finding `unverified`; don't skip the step.

Only domain questions belong here. Queue agentic-design questions (patterns, agents, skills,
checkpoints, hooks) as `openQuestions` entries with `source: agentic-design` and `answer: null` for
`bpmn2agent-design` step 6a instead of querying about them.

Turn every real finding into a question for the user; **never** change the design based on a source
without asking. Record in the spec:

```yaml
openQuestions:
  - elementId: <elementId>
    question: <what the source suggests that the diagram doesn't have>
    source: <notebook title or WebSearch>
    answer: <user's decision, or null>
```

If an answer implies a BPMN change, hand it back to the modeler (or note it for design's
loop-to-analyze path). Never edit the `.bpmn` or the spec's structural fields here.

**Log every notebook answer** (challenge and extraction queries) as a FAQ entry in
`generated/<workflow>/knowledge/faq/` with `scripts/notebook-faq.py` (see
`references/notebook-extraction.md` §FAQ log). On a re-run, read `knowledge/faq/README.md` first and
re-ask only what it doesn't answer or what the changed diagram makes stale.

## 5. Extract reference material per element

For each mapped element, run the **extraction queries** from `references/notebook-extraction.md`
§Extraction queries and write the distilled, cited result to
`generated/<workflow>/knowledge/<element-or-lane>.md`. Under (d), cite the repo file directly in
`knowledge.refs` or distill it (same reference, §Citing local repo docs). Under (b), still write one
file per in-scope element, `evidence: unverified` with inline callouts.

With many lanes × notebooks, extraction may run as parallel `Agent` calls, one per lane/notebook;
each writes its `knowledge/<x>.md` and saves its raw query results for the FAQ log. No Workflow
script.

Frontmatter (incl. the required `bpmn:` key), citation format, evidence tiers, chunking of large
`notebook_query` output, target length and persistence of `knowledge/*.md`: see
`references/notebook-extraction.md`.

Record the refs:

```yaml
knowledge:
  refs:
    <elementId>: generated/<workflow>/knowledge/<element-or-lane>.md
```

## 6. Hand off

Before finishing, confirm: every mapped element has a `knowledge.refs` entry or an explicit "no
coverage, mode: <fallback>" note; every challenge finding has an `openQuestions` entry with an answer
(not null) or is flagged for the user to resolve before design; `source: agentic-design` entries
stay null, design answers them. `bpmn2agent-generate` copies
`knowledge/*.md` into skills' `references/` and agents' "Domain knowledge"; this skill does neither.

## Scripts

- `scripts/notebook-faq.py` — `add` turns one saved `notebook_query` result into a FAQ entry and
  rebuilds the index; `index` only rebuilds it. Also used by `agentic-workflow-kb`.
