#!/usr/bin/env node
// bpmn: {"file":"{{sourceBpmnPath}}","elements":["{{elementId}}"]}
//
// Claude Code {{hookEvent}} hook, generated from "{{elementLabel}}" ({{bpmnType}}, lane
// "{{laneLabel}}") in {{sourceBpmnPath}} by bpmn2agent-generate. mapping-rubric.md's
// businessRuleTask/condition -> hook decision: this rule must physically gate a tool call, not
// just a step the agent chooses to run (that would be a plain script instead — see
// script-template.mjs). CLAUDE-ONLY: hooks are a Claude Code mechanism; this file has no meaning
// under Codex or a runtime-neutral reading of the generated skill.
//
// Reads the PreToolUse/PostToolUse/Stop/SubagentStop hook JSON payload on stdin (see
// https://docs.claude.com/claude-code/hooks for the exact schema per event) and exits 0 to allow,
// non-zero with a stderr reason to block ({{hookEvent}} decides what "block" means for this event —
// PreToolUse prevents the call, Stop/SubagentStop prevents the agent from finishing).

const input = JSON.parse(await new Response(process.stdin).text());

// {{The gate condition itself, from elements.<id>.condition / gate.criteria — fill in the actual
//   check against `input`; this template only shows the shape.}}
const blocked = {{conditionExpression}};

if (blocked) {
  console.error('{{elementLabel}}: {{blockReasonTemplate}}');
  process.exit(2); // non-zero blocks the tool call / stop, per the hook contract for {{hookEvent}}
}
process.exit(0);

/*
Authoring notes for whoever fills this template (bpmn2agent-generate step 6):
- Header comment (line 2) is this file's bpmn frontmatter — same JS convention as
  script-template.mjs and the Workflow-script template: strip "// bpmn: " and JSON.parse the rest.
- Pick {{hookEvent}} from mapping-rubric.md's event table (PreToolUse/PostToolUse/Stop/
  SubagentStop) based on what the BPMN rule actually needs to gate — don't default to PreToolUse
  without checking.
- Pair this file with hook-settings-snippet-template.json using the SAME basename
  (e.g. check-threshold.hook.mjs + check-threshold.hook.settings.json) — the settings snippet
  carries no bpmn frontmatter of its own (it must stay clean JSON for the user to merge verbatim
  into their settings.json); traceability for the JSON snippet flows through this paired script's
  header instead. Document this pairing explicitly in the mapping report's element row so a reader
  (or bpmn2agent-verify) can find the settings snippet from the script and vice versa.
- Write to exactly the path in elements.<id>.generatedPaths.
*/
