---
name: {{skillName}}
description: {{One sentence: the procedure this skill runs, derived from the BPMN element label(s)
  "{{elementLabel}}" verbatim, plus when it's used — e.g. "Use whenever the {{workflow}} skill chain
  reaches '{{elementLabel}}'." Trigger-worthy per this repo's sibling skills, not a bare restatement
  of the element name.}}
{{Skill-chain top-level skill only, and only when the spec has `workflowIO.input`: add the line
`argument-hint: "[{{field1}}] [{{field2}}]"` here — one bracketed name per `workflowIO.input.required`
entry, the whole value in double quotes (unquoted, `[a] [b]` is not valid YAML and `verify` fails on it).
Delete this note otherwise.}}
bpmn:
  file: {{sourceBpmnPath}}
  elements: [{{elementIds}}]
---

# {{Human-readable title derived from elementLabel}}

Generated from `{{sourceBpmnPath}}`'s "{{elementLabel}}" ({{bpmnType}}, lane "{{laneLabel}}") by
`bpmn2agent-generate`. {{One or two sentences: what this step produces and why it's its own skill —
reused ≥2 places / needs its own template / bundles reference material — per
`bpmn2agent-design/references/mapping-rubric.md`'s serviceTask decision, so a reader knows this
wasn't an arbitrary split.}}

{{Skill-chain top-level skill with `workflowIO.input` only — put this section before "## Procedure",
delete it otherwise:}}

## Input

Required: {{`workflowIO.input.required` fields, each with its description from
`artifacts.<input>.frontmatter`}}. Take them from the invocation arguments. If one is missing, ask the
user for it via `AskUserQuestion` before starting step 1; never start with a guess.

## Procedure

1. {{Step derived from the element's inputs — read `{{inputArtifactPath}}`, required: {{true/false}}.}}
2. {{The core procedure — from `knowledge/*.md` extraction if grounded, otherwise a best-effort
   description marked unverified per the Domain knowledge section below.}}
3. {{Step producing the element's outputs — write `{{outputArtifactPath}}` with frontmatter
   {{frontmatter fields from `artifacts.<id>`}}.}}
{{If this element has a `gate`: add a step naming the gate.kind (critic/human/deterministic/panel)
  and listing gate.criteria as a checklist the output must pass before being considered done.}}
{{Skill-chain top-level skill with `workflowIO.output`: the last step names the end result and the
  contract it follows — "the end result is `{{artifacts.<output>.pathPattern}}` with frontmatter
  {{fields}}".}}

{{Add this section only when the element is in some `contextSources.<id>.readers` or `.writers`
  (a lane skill carries one bullet group per task of the lane that touches a store). Heading verbatim.
  One bullet per store, store name verbatim from `contextSources.<id>.name`; pick the line matching
  the store's Art and the element's role:}}

## Kontextquellen

- **{{storeName}}** (wissen, read): distilled at generation time; see `references/domain-knowledge.md`,
  section "{{storeName}}". No tool call at run time.
- **{{storeName}}** (live, read): fetch {{what THIS step needs from the store — derive it from the
  element's documentation and inputs, e.g. "the ticket named by `ticketId`: summary, description,
  status"}} with `{{one tool from contextSources.<id>.tools.read}}`.
- **{{storeName}}** (live, write — nur nach Freigabe): {{what this step writes}} with
  `{{one tool from contextSources.<id>.tools.write}}`. Only after the approval step
  "{{label of the userTask before this write}}" has confirmed it; Claude Code asks again at the call
  (write-guard hook). Without that confirmation, do not write.
- **{{storeName}}** (live, tools unresolved): no tool was resolved for this store at design time
  (server not connected). Do not guess a tool; tell the user the step cannot reach the store.
- **{{storeName}}** (gedächtnis, read): load `{{memory.path}}` FIRST, before any other step. A missing
  or empty file is fine: continue without it.
- **{{storeName}}** (gedächtnis, write): integrate this run's new insights into the fixed sections
  *Bewährt*, *Vermeiden* and *Offene Muster* of `{{memory.path}}` (create the file with these three
  headings if it is missing): merge with existing entries, drop what is outdated, never append a log.
  Keep the file within {{memory.maxLines}} lines; if the memory-cap hook reports it too long (exit 2),
  condense and rewrite. Writing the memory needs no approval.

## Domain knowledge

{{A task that has its own `knowledge/<taskId>.md` (reader of a `wissen` store) is NOT copied here: run
`scripts/install-knowledge.mjs` (SKILL.md step 5), which installs it as `references/<taskId>.md` and writes the
`## Kontextquellen` bullets for `wissen` stores. The text below is for elements grounded at phase or lane level.}}

{{Copy the distilled, cited content from `generated/{{workflow}}/knowledge/{{ref}}.md` into
`references/domain-knowledge.md` verbatim (footnotes intact) when `knowledge.refs` names a file for
this element. For a `"websearch"` entry, do the same from the WebSearch-sourced knowledge file. For
`"model-only"`, write a short best-effort note directly in `references/domain-knowledge.md` and open
it with:}}

> ⚠ unverified — model knowledge, no source. Confirm before relying on this in production.

{{Omit this whole section (and the references/domain-knowledge.md file) only if the element's
`knowledge` array is empty/absent. `references/domain-knowledge.md` itself carries its OWN small
frontmatter too — `element`/`evidence`/`sources` per `notebook-extraction.md`'s convention — but
still needs the same `bpmn:` block as every other generated file (step 2's rule has no exception
for a references/ file), added alongside those keys, not instead of them:}}

```yaml
---
element: {{elementId}}
evidence: cited | inferred | unverified
sources: [{{...}}]
bpmn:
  file: {{sourceBpmnPath}}
  elements: [{{elementId}}]
---
```

<!--
Authoring notes for whoever fills this template (bpmn2agent-generate step 5):
- One skill dir per `kind: skill` element (or one shared dir when the rubric grouped several
  reused elements into a single reusable skill) — write to exactly the path in
  `elements.<id>.generatedPaths`, never a path this template invents.
- A skill wrapping a lane's scripts (the "lane skill" case — see SKILL.md step 3) uses this same
  template but trims "## Procedure" down to one line per script ("Deterministic — see
  `scripts/<name>.mjs`; no LLM judgement in this step") and usually has no "## Domain knowledge"
  section, since deterministic scripts rarely carry grounded domain content.
- Bundle a template/rubric/worked example under `assets/` or `references/` inside this skill dir
  when the source BPMN's data object / knowledge extraction implies one — don't leave "## Procedure"
  as the only content for a skill the rubric flagged as needing bundled reference material.
- English throughout except quoted BPMN labels (mapping-rubric.md's language rule) and the fixed German
  tokens `## Kontextquellen`, "nur nach Freigabe" and the memory section names (*Bewährt*, *Vermeiden*,
  *Offene Muster*).
- `## Kontextquellen` goes into the file that owns the step's logic (its skill, lane skill, specialist
  agent, or the chain skill / orchestrator for steps narrated inline). Tasks without a store get no
  such section. Tool names come only from the spec's `contextSources.<id>.tools`; never invent one and
  never use a wildcard.
-->
