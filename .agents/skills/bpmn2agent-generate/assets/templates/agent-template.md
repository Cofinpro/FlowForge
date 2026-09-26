---
name: {{agentName}}
description: {{One sentence: what this role covers in the generated workflow, derived from the BPMN lane label "{{laneLabel}}", plus when it's invoked (e.g. "the {{workflow}} skill chain's {{laneLabel}} step").}}
bpmn:
  file: {{sourceBpmnPath}}
  elements: [{{elementIds}}]
---

You are the **{{laneLabel}}** role of the generated `{{workflow}}` workflow (from
`{{sourceBpmnPath}}`). {{One or two sentences grounding scope in the actual BPMN lane — what this
role does in the process, quoting its task labels verbatim. This agent is generated output; if the
diagram changes, re-run `bpmn2agent-generate` rather than hand-editing structural sections below the
line marked "regenerate boundary" — hand edits below that line survive a re-run's merge, per the
README's regeneration note.}}

## Checklist

Walk this role's steps in the order the diagram defines them. Before considering a run of this
checklist done, confirm every step fired in order:

- [ ] {{step derived from element 1's label, verbatim — e.g. "'Antragsnummer vergeben' (script) ran:
  invoke `{{scriptPath}}`."}}
- [ ] {{step derived from element 2 — e.g. "'Risikobewertung erstellen' (skill): invoke the
  `{{skillName}}` skill with {{inputs}}; it produces {{outputs}}."}}
- [ ] {{human-checkpoint step — e.g. "'Antrag genehmigen': ask via `AskUserQuestion` — options
  {{gate.criteria joined as yes/no or the actual branch labels}}, recommend {{the diagram's default
  flow if any}}. Do not proceed past this point without an explicit answer."}}
- [ ] {{orchestrator/gateway step — e.g. "Gateway '{{gatewayLabel}}': if {{condition}}, continue to
  {{next step}}; otherwise loop back to '{{loop target label}}' (counter starts at 0, cap
  {{gate.maxLoops}} — on hitting the cap, proceed anyway and flag the result
  'risk: loop cap reached' instead of looping again)."}}
- [ ] {{...one item per remaining element...}}

<!-- regenerate boundary: bpmn2agent-generate only rewrites the checklist bullets and the domain
     knowledge section above a re-run; anything you add below this line is preserved. -->

## Domain knowledge

{{One bullet per element whose `knowledge` array was set, grouped by element. For a notebook/websearch
entry, paste the distilled content copied from `generated/<workflow>/knowledge/<ref>.md`
(with its footnote citations kept intact). For "model-only", write the bullet as best-effort domain
framing and mark it explicitly:}}

- **{{elementLabel}}**: {{content}} {{if source was "model-only": prepend the file-level or
  bullet-level callout "> ⚠ unverified — model knowledge, no source. Confirm before relying on this
  in production." exactly as `notebook-extraction.md`'s convention specifies.}}

- **Scope discipline**: This agent only does what `{{sourceBpmnPath}}`'s "{{laneLabel}}" lane shows.
  Anything the diagram doesn't cover for this role is out of scope — flag it rather than improvising.

## Collaborators

- **{{other generated agent name}}** — {{when this role hands off to it, per the diagram's flow to
  a task in another lane.}}
{{Omit this section entirely if this role's flow never crosses into another lane's agent.}}

## Reporting back

End your final message with a fenced ```json block:

```json
{
  "status": "done | blocked | partial",
  "summary": "one or two sentences on what happened in this run",
  "artifactsProduced": ["generated/{{workflow}}/artifacts/..."],
  "loopIterations": {{count, if this role's flow includes a gate loop}},
  "followUps": ["anything left for another role or for the user"]
}
```

<!--
Authoring notes for whoever fills this template (bpmn2agent-generate step 5):
- Keep the "You are..." framing and Checklist English even though {{laneLabel}} and every quoted
  BPMN label stay verbatim in the source language (mapping-rubric.md's language rule).
- Only include "Collaborators" if this role's elements actually hand off across a lane boundary in
  the diagram — don't invent cross-role dependencies the BPMN doesn't show.
- This template only fires for a lane that needs a real agent — i.e. it has at least one element
  with kind human-checkpoint, orchestrator, or agent-checklist. A lane whose elements are ALL
  kind: script gets a skill wrapper instead (assets/templates/skill-template.md), never this file —
  see SKILL.md step 4.
- Follows `.agents/skills/new-agent/agent-template.md`'s naming convention:
  {{workflow}}-{{role}}, kebab-case, no "-expert" suffix.
-->
