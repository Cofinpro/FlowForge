# Tool design

Distilled from FAQ `tool-design-1`. Tag `[tool-design-1: n]`.

## Metadata is the interface

- Name, description and schema decide whether the model picks a tool; they matter as much as the
  code [tool-design-1: 2, 3].
- Precise, narrow names (`calculate_sum`, not `process_numbers`/`helper`) [tool-design-1: 3–6].
- Description: third person, one sentence of unique purpose, when to call it, parameter meaning,
  an example call [tool-design-1: 3, 4, 6].

## Schemas

Typed parameters with required fields and ranges (JSON Schema, Zod, Pydantic); validate before
execution and send the model back to fix a malformed call [tool-design-1: 4, 5, 9–12].

## Granularity and count

- Narrow, single-purpose tools over "execute arbitrary SQL"; overloaded tools confuse the model
  and widen the attack surface [tool-design-1: 3, 13, 14].
- Keep the number bound to one agent small; accuracy drops around 16+ tools
  [tool-design-1: 14, 16, 17].
- Scaling options: retrieve the top-K relevant tools semantically, group tools hierarchically, or
  split tools across specialist agents [tool-design-1: 17–24].

## Errors

Return the raw error as the tool observation so the model can correct itself; bound the retry
loop; turn recurring failures into explicit constraints in the prompt
[tool-design-1: 25–32].

## MCP

One protocol between hosts (Claude Code, IDEs) and tool servers turns N×M integrations into N+M;
the server is maintained once for all clients [tool-design-1: 33–45].

## Permissions and sandboxing

- Least privilege; separate read from write; destructive operations on their own isolated path
  [tool-design-1: 13, 46, 47].
- Per-call, just-in-time credentials; planning modes that block mutations
  [tool-design-1: 47].
- Wrap irreversible tools in a review gate (accept / edit / reject)
  [tool-design-1: 48–51].
- Agent-generated code runs in an ephemeral sandbox with network, file-system and resource limits
  [tool-design-1: 52–59].

## Script or LLM step

- **Script:** fixed formats, math, conversions, date arithmetic, fragile exact sequences, known
  branches [tool-design-1: 6, 60–64].
- **LLM:** high input variability, unstructured text, novel cases, open-ended planning
  [tool-design-1: 61, 65, 66].
- Recurring procedures ship as ready-made scripts rather than code the model writes each time
  [tool-design-1: 67, 68].

## For bpmn2agent

`scriptTask` and deterministic `businessRuleTask` → scripts; this is the justification. When
design proposes tools per role, list them explicitly (least privilege) and keep each lane's agent
well under ~10–16 tools; a lane that needs more is a split candidate. Hooks are the place for
"block this tool call unless …" enforcement.
