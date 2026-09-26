# Notebook extraction: query patterns, citation format, evidence marking

Detail for `bpmn2agent-knowledge` §4/§5. Load this when actually querying, not before.

## Challenge queries

Run one per lane/phase (or per element, for a dense phase) against its mapped notebook via
`notebook_query`. Purpose: find what the diagram is missing or doing differently, never to
generate new design — every real finding becomes a question for the user (SKILL.md §4).

Base pattern, filling in the quoted BPMN label and the diagram's actual flow for `<this activity>`:

- "What steps, checks, roles, or artifacts do the sources describe for **`<this activity>`** that
  this diagram (`<list what the diagram currently shows: predecessor → this task → successor, any
  gateway conditions>`) lacks or does differently?"
- "Are there preconditions or exit criteria for **`<this activity>`** in the sources that aren't
  represented as a gateway or checkpoint here?"
- "Do the sources name a role or approval step for **`<this activity>`** that isn't one of this
  diagram's lanes (`<list lane names>`)?"
- "What commonly goes wrong at **`<this activity>`** according to the sources — and does this
  diagram have a check or gate that would catch it?"

Keep each query scoped to one activity/lane at a time — a query spanning the whole process gets
vague, uncited answers. Log every challenge query and its raw answer's key claims; only the
resulting question (not the full answer) needs to go into the spec's `openQuestions`.

## Extraction queries

Run per generated-artifact kind, against the element's mapped notebook, once the element is
confirmed in scope for extraction (i.e., it's actually going to become a skill, agent, or
gate/critic in `bpmn2agent-design`'s mapping — don't extract for elements likely to be dropped).

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

Run only the subsets relevant to the element's mapped kind — a plain `scriptTask` rarely needs a
"domain knowledge" query, a lane-level agent rarely needs a "checklist" query.

## Citing local repo docs (mode (d))

When SKILL.md §3's fallback (d) applies — an existing, already-reviewed reference file already
lives in this repo (a rubric, a conventions doc, a prior write-up) — there is no
`notebook_query`/`WebSearch` call to run; the extraction step becomes "point at the right existing
file(s) and cite them", not "generate new prose". Two ways to do that, pick per element based on how
directly the existing file already answers the extraction queries above:

- **Cite directly, no new file**: if an existing repo file already is a short, focused answer to the
  element's extraction query (e.g. `bpmn2agent-design/references/mapping-rubric.md` for a "mapping
  decision" element), set `knowledge.refs.<elementId>` to that file's own repo-relative path
  directly — skip writing a `generated/<workflow>/knowledge/*.md` file for it entirely. Still counts
  as `evidence: cited` (a reviewed, checked-in source), even without a fresh knowledge file.
- **Distill, same as any other source**: if the existing file is long, covers more than this one
  element, or needs combining with another source, write a normal
  `generated/<workflow>/knowledge/<element-or-lane>.md` file (SKILL.md §5) that cites the repo
  file(s) the same way a notebook/WebSearch source would be cited (footnote format below, page/file
  title in place of the notebook name, a relative path instead of a URL).

Either way, mark it `evidence: cited` — a reviewed, checked-in repo file is a real source, not model
knowledge.

## Citation format

Every extracted claim keeps its source inline, not just in a bibliography:

```markdown
Approvals above €10,000 require a second signer [^1].

[^1]: "Finance Handbook v3", NotebookLM source, queried 2026-09-25 — "transactions exceeding the
    threshold require dual authorization before release" (short verbatim quote from the answer).
```

- Citation marker `[^n]` inline at the sentence/claim it supports, footnote at the bottom of the
  file mapping `n` → source title + short verbatim quote (2–3 sentences max) the claim is drawn
  from. `notebook_query` answers usually already carry source names/snippets — carry those through,
  don't paraphrase away the traceability.
- One footnote list per file; numbers restart per file, they don't need to be globally unique.
- WebSearch-sourced claims cite the same way, with the page title and URL in place of the notebook
  source name.
- If two sources agree, cite both: `[^1][^2]`. If sources conflict, say so in the text ("sources
  disagree: A says X, B says Y") rather than picking one silently.

## Evidence marking: `cited` / `inferred` / `unverified`

This pipeline uses a three-tier scheme, a narrower cousin of dark-factory's
`cited`/`inferred`/`synthetic`/`validated` tiers (`docs/planning/dark-factory-prozess-gedaechtnis.md`
§6) — this skill has no synthetic persona panel, so that tier doesn't apply here, and "validated by
a real human" is out of scope for an unattended extraction pass.

| Tier | Frontmatter value | Meaning |
|---|---|---|
| Cited | `cited` | Backed by at least one notebook or WebSearch citation (footnote present). |
| Inferred | `inferred` | Reasoned from cited material or from the BPMN itself, no direct source claim. |
| Unverified | `unverified` | Model knowledge only — no notebook, no search, mode (b) from SKILL.md §3. |

Every `knowledge/*.md` file gets a frontmatter `evidence:` field naming its **dominant** tier
(strongest wins if mixed: `cited` > `inferred` > `unverified`), and every `unverified` claim inside
an otherwise-cited file gets an inline callout so it can't be mistaken for sourced material:

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

The `bpmn:` key is required on every `generated/<workflow>/knowledge/*.md` file, same convention
`bpmn2agent-generate/SKILL.md` step 2 documents for every other generated Markdown file —
`bpmn2agent-verify` checks it the same way (see SKILL.md §5).

Never upgrade an `unverified` claim to `cited` later just because it turned out to be true —
upgrade only when an actual citation is added.

## Chunking / large-output handling

`notebook_query` answers can exceed the tool's inline output limit; when that happens the result is
saved to a file instead of returned inline. Don't try to read that file whole:

```bash
jq -r '.answer' <saved-file>.json | head -c 4000      # first chunk
jq -r '.answer' <saved-file>.json | tail -c +4001 | head -c 4000   # next chunk, etc.
```

Read in ~4000-character chunks (adjust to the actual output-limit budget available), extracting
only the claims and citations relevant to the current extraction query rather than the whole answer
— the skill file needs a distillation, not the notebook's full response.

## FAQ log

Every `notebook_query` answer is kept, so the next run (or another workflow on the same notebook)
can see how a question was already answered instead of asking again.

1. Once per workflow, write `generated/<workflow>/knowledge/faq/sources.json` from `notebook_get`:
   `{"notebook": {"id": …, "title": …}, "sources": {"<source-id>": "<short title>", …}}`.
   Several notebooks → one FAQ directory per notebook (`knowledge/faq/<notebook-slug>/`).
2. Query with `new_conversation: true`, one question per call.
3. Save the result as JSON (the harness already saved it if it was too large; otherwise write the
   inline result to a file) and record it:

   ```bash
   python3 .agents/skills/bpmn2agent-knowledge/scripts/notebook-faq.py add \
     --faq generated/<workflow>/knowledge/faq --topic <element-or-lane-slug> \
     --title "<short question>" <result.json>
   ```

4. In the distilled `knowledge/*.md` file, footnotes may point at the FAQ entry
   (`knowledge/faq/<topic>.md`, entry `<topic>-n`, citation `[k]`) instead of repeating the quote.

`knowledge/faq/` is an audit log: verbatim answers, no `bpmn:` header, skipped by
`bpmn2agent-verify`. Everything the generated files rely on still goes through a distilled,
header-carrying `knowledge/*.md` file listed in `knowledge.refs`.

## Keep it short — distill, don't dump

A `knowledge/*.md` file becomes part of a generated skill's `references/` or gets folded into an
agent's "Domain knowledge" section (`bpmn2agent-generate`). Target **half a page to two pages**
per element — a procedure outline, a short checklist, 3–8 terminology entries, not a transcript.
Cut: restated notebook preamble, anything not tied to a citation-worthy claim, duplicate coverage
already in another element's file (cross-reference instead of repeating). If an extraction keeps
running long, that's a signal the element should be split or the query re-scoped, not that the file
should stay long.
