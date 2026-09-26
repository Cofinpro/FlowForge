#!/usr/bin/env node
// bpmn: {"file":"{{sourceBpmnPath}}","elements":["{{elementId}}"]}
//
// Generated from "{{elementLabel}}" ({{bpmnType}}, lane "{{laneLabel}}") in {{sourceBpmnPath}} by
// bpmn2agent-generate. Deterministic step — no LLM call, same input always produces the same
// output (mapping-rubric.md's scriptTask/businessRuleTask -> script decision).
//
// Usage: node {{scriptBasename}}.mjs {{argSketch}}
{{node:* imports only, if any}}

const [, , {{argNames}}] = process.argv;
if ({{requiredArgCheck}}) {
  console.error('Usage: node {{scriptBasename}}.mjs {{argSketch}}');
  process.exit(2);
}

// {{The deterministic rule itself, from the BPMN element's label/documentation and any
//   businessRuleTask condition text carried in elements.<id>.condition — fill in the actual
//   check; this template only shows the shape.}}
{{ruleBody}}

console.log({{resultShape}});
process.exit(0);

/*
Authoring notes for whoever fills this template (bpmn2agent-generate step 3):
- Header comment (line 2) is this file's bpmn frontmatter: strip the "// bpmn: " prefix and
  JSON.parse the remainder — this is the JS convention SKILL.md documents for every generated
  .mjs file (scripts, hooks, Workflow scripts). Keep it on its own line, before any other code.
- Write to exactly the path in elements.<id>.generatedPaths, never a path this template invents.
- A script living inside a "lane skill" (see skill-template.md's lane-skill note) sits at
  generated/<workflow>/.claude/skills/<agentName>/scripts/<name>.mjs; a script reused across lanes
  gets its own skill dir instead (mapping-rubric.md's scriptTask note). The owning SKILL.md calls
  it as `node ${CLAUDE_SKILL_DIR}/scripts/<name>.mjs …`.
- Node built-ins only (node:fs, node:path, ...). No npm packages, no lib/ folder, no package.json,
  no install step; read JSON, not YAML. If the rule can't be written that way, it isn't a script —
  send it back to bpmn2agent-design as skill text.
*/
