---
name: {{skillName}}
description: {{One sentence: the procedure this skill runs, derived from the BPMN element label(s)
  "{{elementLabel}}" verbatim, plus when it's used — e.g. "Use whenever the {{workflow}} skill chain
  reaches '{{elementLabel}}'." Trigger-worthy per this repo's sibling skills, not a bare restatement
  of the element name.}}
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

## Procedure

1. {{Step derived from the element's inputs — read `{{inputArtifactPath}}`, required: {{true/false}}.}}
2. {{The core procedure — from `knowledge/*.md` extraction if grounded, otherwise a best-effort
   description marked unverified per the Domain knowledge section below.}}
3. {{Step producing the element's outputs — write `{{outputArtifactPath}}` with frontmatter
   {{frontmatter fields from `artifacts.<id>`}}.}}
{{If this element has a `gate`: add a step naming the gate.kind (critic/human/deterministic/panel)
  and listing gate.criteria as a checklist the output must pass before being considered done.}}

## Domain knowledge

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
- English throughout except quoted BPMN labels (mapping-rubric.md's language rule).
-->
