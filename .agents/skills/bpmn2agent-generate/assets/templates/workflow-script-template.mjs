// bpmn: {"file":"{{sourceBpmnPath}}","elements":[{{elementIds}}]}
export const meta = {
  name: '{{workflow}}',
  description: '{{One line: what this Workflow script runs, from the BPMN process name.}}',
  phases: [
    {{one { title, detail } entry per phase — title MUST match the phase('...') call below exactly}}
    { title: '{{phaseTitle}}', detail: '{{what this phase does, from its elements\' labels}}' },
  ],
}

// Generated from {{sourceBpmnPath}} by bpmn2agent-generate for pattern.chosen: workflow-script
// (pattern-rubric.md). CLAUDE-ONLY: this is a Claude Code Workflow tool script — it has no
// meaning under Codex or a runtime-neutral reading of the generated skill.
//
// IMPORTANT — this file is only ever a saved script. bpmn2agent-generate never invokes it itself,
// and nothing in this repo runs it automatically. The business user (or whoever operates the
// workflow) runs it deliberately with the Workflow tool, on demand — see the generated README.md's
// "Workflow scripts" section, which must say this explicitly per pattern-rubric.md's Workflow
// script detail.

{{Only when the spec has `workflowIO.input`: document the input right here, as a comment, and read it
  from `args` — `meta` stays a pure literal, so it can't carry the arg list. A script can't ask the
  user, so a missing required field ends the run with a `blocked` result the caller acts on:}}
// Input (args): {{field1}}, {{field2}} — {{description per field, from artifacts.<input>.frontmatter}}.
const { {{field1}}, {{field2}} } = args ?? {}
const missing = [{{'field1', 'field2'}}].filter((k) => !args?.[k])
if (missing.length) return { status: 'blocked', summary: 'missing required input', missing }

{{one phase per contiguous run of elements sharing this workflow-script phase, in BPMN flow order}}
phase('{{phaseTitle}}')
log('{{one-line narrator message for this phase, from the phase\'s elements\' labels}}')

{{For each serviceTask element in this phase -> one agent() call. For a fan-out
  (parallelGateway/inclusiveGateway/multi-instance marker) over N independent items -> parallel()
  or pipeline() per workflow-authoring's barrier-vs-pipeline rule (default pipeline() unless this
  phase's next stage genuinely needs every result of this one together — e.g. a dedup/merge/count
  gate before the next phase). For a deterministic exclusiveGateway condition
  (elements.<id>.condition) -> a plain JS if/else, not an agent() call — judgement gateways only
  belong in this pattern when pattern-rubric.md's decision table still picked workflow-script for
  a mostly-deterministic diagram with one edge case; anything genuinely judgement-heavy should have
  produced pattern.chosen: orchestrator-agent or mixed instead, not this template.}}
const {{resultVar}} = await agent(
  `{{prompt built from the element's label, inputs, and — if grounded — a pointer to the copied
    knowledge references under this Workflow's owning skill(s); embed the actual procedure inline
    only when no skill was generated for this step}}`,
  { schema: {{SCHEMA_CONST_OR_OMIT}} },
)

{{For a loop back-edge (elements.<id>.gate.maxLoops on the closing gateway) -> a while loop with a
  plain counter variable checked each iteration, per pattern-rubric.md's Workflow-script loop-cap
  detail:}}
let {{loopCounter}} = 0
while ({{loopCondition}} && {{loopCounter}} < {{maxLoops}}) {
  {{loop body — re-run the phase(s) between the loop's split and merge}}
  {{loopCounter}}++
}
if ({{loopCounter}} >= {{maxLoops}}) {
  log('{{elementLabel}}: loop cap reached ({{maxLoops}}) — proceeding with a risk flag instead of looping again.')
}

{{When `workflowIO.output` is set, `finalResultShape` follows the output artifact's contract
  (`artifacts.<output>` frontmatter fields) and the comment names it.}}
return {{finalResultShape}}

/*
Authoring notes for whoever fills this template (bpmn2agent-generate step 7 / "workflow-script"
branch):
- Header comment (line 1) is this file's bpmn frontmatter — same JS convention as
  script-template.mjs / hook-script-template.mjs: strip "// bpmn: " and JSON.parse the rest. It
  must be the very first line, before `export const meta = {...}` (a Workflow script must still
  begin its CODE with that export — a leading comment is fine, per the workflow-authoring
  contract).
- `meta` stays a pure literal (no variables/spreads/template interpolation) — fill in the actual
  strings before writing the file, don't leave {{...}} in the emitted output.
- Plain JS only (no TypeScript syntax), no Date.now()/Math.random()/new Date() (see
  workflow-authoring's reference — stamp results after the workflow returns, or pass timestamps
  via `args` if the workflow needs one).
- Syntax-checking this file needs one extra step: it legitimately has top-level `await` AND
  top-level `return` (the Workflow tool wraps the body in its own async runner at run time) — a
  bare `node --check` on the raw file rejects the top-level `return`. Wrap everything after the
  `export const meta = {...}` block in `(async () => { ... })();` first, then `node --check` the
  wrapped copy (see SKILL.md step 11 for the exact procedure).
- Write to generated/<workflow>/<workflow>.workflow.mjs (single file per workflow, or per
  sub-workflow when mapping-rubric.md promoted a callActivity to its own pattern) — this path
  isn't in any single element's generatedPaths since it spans the whole phase/diagram; record it
  in the mapping report's own "generated artifacts" list instead (see mapping-report-template.md).
- A phase that writes into a live context store never belongs here (no human checkpoint possible);
  design's pattern rubric rules it out. If a spec reaches this template with such a writer, send it
  back to bpmn2agent-design instead of approximating an approval.
- No AskUserQuestion / human-checkpoint calls belong in this template — a diagram with a real
  human checkpoint shouldn't have resolved to pattern.chosen: workflow-script in the first place
  (pattern-rubric.md's Workflow-script "when not"); if bpmn2agent-generate reaches this template
  for a spec that has a human-checkpoint element anyway, stop and send it back to
  bpmn2agent-design as a pattern-rubric mismatch rather than trying to approximate the pause here.
*/
