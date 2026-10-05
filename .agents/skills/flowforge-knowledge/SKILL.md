---
name: flowforge-knowledge
description: Grounds the agents and skills to be generated from a BPMN diagram in domain knowledge. Reads the diagram's knowledge data stores (else maps Gemini notebooks, NotebookLM via gemini-notebook-mcp, to lanes/tasks), resolves each store's Ort, uses the sources to challenge the diagram (gaps become open questions, never silent redesign) and extracts cited reference material per reading task. Falls back to WebSearch, reviewed repo docs, or model knowledge marked "unverified". Use after flowforge-analyze wrote generated/<workflow>/workflow-spec.yaml, before flowforge-design.
bpmn:
  file: docs/planning/flowforge-run.bpmn
  elements:
    - Task_Knowledge
---

# BPMN → Agent Knowledge Grounding

Input: the spec `flowforge-analyze` wrote. Output: the same spec with `knowledge:` and
`openQuestions:` filled, plus `generated/<workflow>/knowledge/*.md`: one file per reading task, or per
element/lane under the fallback (§3). Later stages read these and don't query notebooks.

The diagram is the source of truth: a `wissen` data store with an arrow into a task **is** the
mapping. Ask the user only where the diagram says nothing.

Ask every question through `AskUserQuestion` with concrete options plus a recommendation, in the
user's business language.

## 1. Read the spec

Read `generated/<workflow>/workflow-spec.yaml`. Missing: **stop** and tell the user to run
`flowforge-analyze` first; never parse the `.bpmn` here. Its lanes/roles and elements are the
mapping targets. From `contextSources` take every store with `art: wissen`: its `name`, `ort`
(`{type, ref}`), `readers` and `bpmnElement`. Each reader is a **reading task**, the unit extraction
writes one file for.

Skip `live` and `gedaechtnis` stores entirely (no extraction, no questions); `flowforge-design`
resolves them.

## 2. Resolve each store's Ort

Load the notebook tools once, when a `notebook:` store exists or step 3 needs them:

```
ToolSearch: select:mcp__gemini-notebook-mcp__notebook_list,mcp__gemini-notebook-mcp__notebook_describe,mcp__gemini-notebook-mcp__notebook_query,mcp__gemini-notebook-mcp__notebook_get
```

Resolve by `ort.type`; ask nothing when the store resolves cleanly:

- **`notebook`**: call `notebook_list`, match `ort.ref` against the titles (exact, then
  case-insensitive). One match: take its id and sanity-check it with `notebook_describe`. No match: ask
  which notebook is meant, offering the actual titles (plus "none of these" and a recommendation),
  and tell the user to fix the `Ort:` line in the diagram. Auth/connection error: tell the user to run
  `nlm login` in a terminal, then retry or treat the store as unresolved.
- **`url`**: `WebFetch` the page. `evidence: cited`, URL as the citation.
- **`datei`**: a local repo doc, cited per `references/notebook-extraction.md` §Citing local repo
  docs. File missing: unresolved.
- **`websearch`**: targeted `WebSearch` queries per reading task. `evidence: cited`.
- **`mcp`**: only if the server's tools are connected (check with `ToolSearch` on
  `mcp__<server>__`). Read through its read tools once and keep the result as a generation-time
  snapshot, cited as server, tool and date. Not connected: unresolved.

An **unresolved** store gets an `openQuestions` entry (`elementId` = the store reference id); never
drop it silently or downgrade it to model knowledge. Offer the user: fix and re-run, or knowingly use
a fallback from step 3 for its readers.

Record the notebooks, with `mappedTo` taken from the store readers (task ids), not from a question:

```yaml
knowledge:
  notebooks:
    - id: <uuid>
      title: <notebook title>
      mappedTo: [<reading taskId>, ...]
  mode: notebook | websearch | local-docs | unverified   # see step 3
```

## 3. Fallback for what the stores don't cover

Covered: every reading task of a resolved `wissen` store. Not covered:

- **a store with no `ort`** (analyze normally asks; if it slipped through, ask now),
- **a `serviceTask` (or `callActivity`/`businessRuleTask`) that reads no `wissen` store**, and
- **every task of a diagram with no `wissen` store at all.**

Each uncovered `serviceTask` gets an `openQuestions` entry: "No knowledge source is drawn for this
step. Intentional, or a missing source?" (`answer: null` until decided; never an error). Ask once per
lane (not per task) and offer:

- **(0) Intentional, no knowledge needed** (the recommendation for tasks that only use `live` or
  `gedaechtnis` stores): answer the open question, write no file.
- **Notebook**: call `notebook_list`, offer the actual titles (plus "none of these"), record it in
  `knowledge.notebooks` with the lane/task ids as `mappedTo`. Several notebooks are fine.
- **(a) WebSearch per lane** — targeted queries per lane/phase, cited, `evidence: cited`.
- **(b) Model knowledge** — every claim `evidence: unverified`; never silently upgraded later.
- **(c) Pause to create a notebook** — the user builds one and re-runs this skill.
- **(d) Cite existing repo docs** — ask which reviewed file(s) apply per lane/element;
  `evidence: cited`. Format: `references/notebook-extraction.md` §Citing local repo docs.

Otherwise recommend (d) if reviewed reference docs for this domain exist in the repo, else (b) for
generic domains, else (a). Diagrams without stores use only this flow; mixed diagrams use the stores
where drawn and this flow for the rest.

`knowledge.mode`: `notebook` if every in-scope task has notebook coverage; otherwise the fallback in
use (`websearch | local-docs | unverified`; `url`/`websearch` stores count as `websearch`, `datei` as
`local-docs`). Mixing is fine; name each source in its file's `sources:`.

## 4. Challenge the BPMN

For each reading task (fallback: each lane/phase), run the **challenge queries** from
`references/notebook-extraction.md` §Challenge queries against its source (notebook, page, repo file or
WebSearch). Under (b), answer them from model reasoning and mark every finding `unverified`; don't skip
the step.

Ask only domain questions here. Queue agentic-design questions (patterns, agents, skills,
checkpoints, hooks) as `openQuestions` entries with `source: agentic-design` and `answer: null` for
`flowforge-design` step 6a; don't query about them.

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

## 5. Extract reference material per reading task

For each reading task write `generated/<workflow>/knowledge/<taskId>.md` (the task's BPMN element id,
e.g. `Task_AntwortEntwerfen.md`) with **one section per `wissen` store it reads**, named with the
store's label verbatim, each with its own citations. Run the **extraction queries** from
`references/notebook-extraction.md` §Extraction queries against that store's source only; the store's
Ort picks the route (§Store-driven extraction there). Under the fallback (§3), write
`<element-or-lane>.md`; under (b), still one file per in-scope element, `evidence: unverified` with
inline callouts.

With many tasks × notebooks, extraction may run as parallel `Agent` calls, one per task; each writes its
`knowledge/<taskId>.md` and saves its raw query results for the FAQ log. No Workflow script.

Frontmatter (incl. the required `bpmn:` key), section layout, citation format, evidence tiers, chunking
of large `notebook_query` output, target length and persistence of `knowledge/*.md`: see
`references/notebook-extraction.md`.

Record the refs, keyed by element id (a lane under the fallback):

```yaml
knowledge:
  refs:
    <taskId>: generated/<workflow>/knowledge/<taskId>.md
```

## 6. Hand off

Before finishing, confirm:

- every reading task of a resolved `wissen` store has a `knowledge.refs` entry and a cited section per
  store;
- every other in-scope element has a `knowledge.refs` entry, an answered "intentional" open question,
  or an explicit "no coverage, mode: <fallback>" note;
- every `knowledge.notebooks[].mappedTo` lists the reading tasks;
- every challenge finding has an `openQuestions` entry with an answer (not null) or is flagged for the
  user to resolve before design;
- `source: agentic-design` entries stay null; design answers them.

`flowforge-generate`, not this skill, copies `knowledge/*.md` into skills' `references/` and agents'
"Domain knowledge".

## Scripts

- `scripts/notebook-faq.py` — `add` turns one saved `notebook_query` result into a FAQ entry and
  rebuilds the index; `index` only rebuilds it. Also used by `agentic-workflow-kb`.
