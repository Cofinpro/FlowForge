# Notebook extraction: query patterns, citation format, evidence marking

Detail for `flowforge-knowledge` §4/§5. Load this when actually querying, not before.

Contents: Challenge queries · Extraction queries · Store-driven extraction · Citing local repo docs ·
Citation format · Evidence marking and frontmatter · Knowledge files persist · Chunking · FAQ log ·
Keep it short

## Challenge queries

One per lane/phase (or per element in a dense phase). Goal: what the diagram lacks or does
differently; every real finding becomes a user question (SKILL.md §4). Fill in the quoted BPMN label
and the diagram's actual flow:

- "What steps, checks, roles, or artifacts do the sources describe for **`<this activity>`** that
  this diagram (`<list what the diagram currently shows: predecessor → this task → successor, any
  gateway conditions>`) lacks or does differently?"
- "Are there preconditions or exit criteria for **`<this activity>`** in the sources that aren't
  represented as a gateway or checkpoint here?"
- "Do the sources name a role or approval step for **`<this activity>`** that isn't one of this
  diagram's lanes (`<list lane names>`)?"
- "What commonly goes wrong at **`<this activity>`** according to the sources — and does this
  diagram have a check or gate that would catch it?"

Scope each query to one activity/lane; whole-process queries get vague, uncited answers. Put only the
resulting question into `openQuestions`, not the answer.

## Extraction queries

Per element likely to become a skill, agent or gate/critic; skip elements likely to be dropped. Run
only the relevant ones (a `scriptTask` rarely needs domain knowledge, a lane rarely needs a checklist).

- **Skill procedure** (serviceTask/callActivity → reusable skill): "Describe the step-by-step
  procedure for `<activity>` as the sources document it — inputs, the ordered steps, and outputs."
- **Agent domain knowledge** (lane → agent's "Domain knowledge" section): "What background
  knowledge, terminology, and context would someone need to do `<role>`'s work competently,
  according to the sources?"
- **Gate/critic checklist** (businessRuleTask, exclusive gateway with a quality/approval condition):
  "What are the pass/fail criteria or checklist items the sources give for deciding
  `<gateway question / condition>`?"
- **Pitfalls**: "What mistakes or failure modes do the sources call out for `<activity>`?"
- **Terminology**: "What domain terms does `<activity>` use that a generic reader wouldn't already
  know, and how do the sources define them?"

## Store-driven extraction

Per reading task of a `wissen` store (SKILL.md §1), run the relevant extraction queries against
**each store it reads, separately**; the store's `ort.type` picks the route:

| `ort.type` | Route | Cited as |
|---|---|---|
| `notebook` | `notebook_query` on the notebook found by title (`new_conversation: true`, one question per call, log the FAQ) | notebook source name + quote |
| `url` | `WebFetch` the page, distill what answers the query | page title + URL |
| `datei` | §Citing local repo docs | file title + relative path |
| `websearch` | `WebSearch` queries scoped to the task | page title + URL |
| `mcp` | read through the server's read tools once; snapshot only | `<server>`, tool name, date |

All five yield `evidence: cited`. An unresolved store (title not found, server not connected, file
missing) gets no section; it is an open question instead, never filled from model knowledge.

One file per reading task, `knowledge/<taskId>.md`, one section per store, named with the store label
verbatim:

```markdown
---
element: Task_AntwortEntwerfen
evidence: cited
sources: ["Support-Handbuch"]
bpmn:
  file: <meta.sourceBpmn.path>
  elements: [Task_AntwortEntwerfen]
---

## Support-Handbuch

_Ort: notebook:Support-Handbuch_

Procedure, checklist, terminology for this task, each claim cited [^1].

[^1]: "Support-Handbuch", NotebookLM source, queried 2026-10-03 — "short verbatim quote".
```

- `element` is the reading task's id; `bpmn.elements` lists only that id (the stores are named in the
  section headings and `sources:`).
- `sources:` lists every store's source (notebook title, URL, repo path, server), in section order.
  `evidence:` is the dominant tier over all sections.
- Footnotes form one list at the file bottom, numbered across sections. The citation format below
  applies per section; a section without a footnote is not `cited`.
- Each section follows the length target (§Keep it short); scale it down when a task reads several
  stores.

## Citing local repo docs (mode (d))

For fallback (d) and `datei:` stores. Run no query; point at the reviewed file(s). Per element:

- **Cite directly**: if the file already answers the extraction query briefly and on point (e.g.
  `flowforge-design/references/mapping-rubric.md` for a mapping-decision element), set
  `knowledge.refs.<elementId>` to its repo-relative path and write no `knowledge/*.md`. For a
  `datei:` store only when it is the task's sole `wissen` store; otherwise distill it as a section.
- **Distill**: if it is long, broader than this element, or needs combining with another source,
  write a normal `knowledge/<element-or-lane>.md` citing it like any source (file title instead of
  notebook name, relative path instead of URL).

Both count as `evidence: cited`.

## Citation format

Cite every extracted claim inline, not just in a bibliography:

```markdown
Approvals above €10,000 require a second signer [^1].

[^1]: "Finance Handbook v3", NotebookLM source, queried 2026-09-25 — "transactions exceeding the
    threshold require dual authorization before release" (short verbatim quote from the answer).
```

- `[^n]` inline at the claim; footnote at file bottom: source title + verbatim quote (≤ 2–3
  sentences). Carry through the source names/snippets `notebook_query` returns.
- One footnote list per file; numbering restarts per file.
- WebSearch claims: page title and URL instead of the notebook source name.
- Two sources agree: cite both, `[^1][^2]`. Sources conflict: say so in the text ("sources
  disagree: A says X, B says Y"); never pick one silently.

## Evidence marking and frontmatter

| Tier | Frontmatter value | Meaning |
|---|---|---|
| Cited | `cited` | Backed by at least one notebook, page, repo-file or snapshot citation (footnote present). |
| Inferred | `inferred` | Reasoned from cited material or from the BPMN itself, no direct source claim. |
| Unverified | `unverified` | Model knowledge only — no notebook, no search, mode (b) from SKILL.md §3. |

Every `knowledge/*.md` file gets a frontmatter `evidence:` field naming its **dominant** tier
(strongest wins if mixed: `cited` > `inferred` > `unverified`). Every `unverified` claim inside an
otherwise-cited file gets this inline callout:

```markdown
> ⚠ unverified — model knowledge, no source. Confirm before relying on this in production.
```

```yaml
---
element: <elementId>
evidence: cited
sources: ["Finance Handbook v3", "https://example.org/policy"]
bpmn:
  file: <meta.sourceBpmn.path>
  elements: [<elementId>]
---
```

The `bpmn:` key is required on every `knowledge/*.md` file; `flowforge-verify` checks it like any
generated file.

Never upgrade `unverified` to `cited` unless an actual citation is added.

## Knowledge files persist

`knowledge/*.md` files stay on disk after `flowforge-generate` copies them into skills'
`references/`; `flowforge-verify` traces them via `knowledge.refs`. Remove one only if its content
turned out unneeded, and then also drop its `knowledge.refs` entry.

## Chunking / large-output handling

A `notebook_query` answer over the inline output limit is saved to a file. Read it in chunks, not whole:

```bash
jq -r '.answer' <saved-file>.json | head -c 4000      # first chunk
jq -r '.answer' <saved-file>.json | tail -c +4001 | head -c 4000   # next chunk, etc.
```

Adjust the chunk size to the output budget; keep only claims and citations relevant to the query.

## FAQ log

Keep every `notebook_query` answer so later runs reuse it instead of asking again.

1. Once per workflow, write `generated/<workflow>/knowledge/faq/sources.json` from `notebook_get`:
   `{"notebook": {"id": …, "title": …}, "sources": {"<source-id>": "<short title>", …}}`.
   Several notebooks → one FAQ directory per notebook (`knowledge/faq/<notebook-slug>/`).
2. Query with `new_conversation: true`, one question per call.
3. Save the result as JSON (the harness already saved it if it was too large; otherwise write the
   inline result to a file) and record it:

   ```bash
   python3 ${CLAUDE_SKILL_DIR}/scripts/notebook-faq.py add \
     --faq generated/<workflow>/knowledge/faq --topic <element-or-lane-slug> \
     --title "<short question>" <result.json>
   ```

4. In the distilled `knowledge/*.md` file, footnotes may point at the FAQ entry
   (`knowledge/faq/<topic>.md`, entry `<topic>-n`, citation `[k]`) instead of repeating the quote.

`knowledge/faq/` is an audit log: verbatim answers, no `bpmn:` header, skipped by
`flowforge-verify`. Everything the generated files rely on still goes through a distilled,
header-carrying `knowledge/*.md` file listed in `knowledge.refs`.

## Keep it short — distill, don't dump

Target **half a page to two pages** per element: a procedure outline, a short checklist, 3–8
terminology entries, not a transcript. Cut notebook preamble, claims without a citation-worthy
source, and coverage already in another element's file (cross-reference it). If it keeps running
long, split the element or re-scope the query.
