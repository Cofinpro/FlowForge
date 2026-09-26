---
name: agent-authoring
description: Writes or reviews a Claude Code subagent definition (.md with name, description, tools, model and a system prompt) — single responsibility, routing-ready description, role/goal/method/constraints/output sections, least-privilege tools, model tier, structured report back, and the decision whether a role should be one agent, two, or just a skill. Use when creating or reviewing an agent, when an orchestrator's roster needs tightening, or when bpmn2agent-design/-generate turn BPMN lanes into agents.
---

# Agent authoring

Rules come from `agentic-workflow-kb/references/agent-design.md`, `tool-design.md` and
`context-engineering.md` (all cited). This skill turns them into a procedure and a checklist.

## Should this be an agent at all?

- A reusable procedure where the calling agent keeps its judgement → **skill**, not an agent.
- One localized subtask → a one-off `Agent` call, no definition file.
- A role with its own tools, permissions or context that would pollute the caller → **agent**.

Split one role into two agents when its tools pass ~10, overlap, or need different permissions,
or when the work spans unrelated domains. Merge two agents when one of them only relays.

## Writing an agent

1. **Frontmatter**
   - `name`: kebab-case, role-based (`{domain}-{role}`), no `-expert` suffix.
   - `description`: third person; what the agent does, when to invoke it, what input it expects,
     and which neighbouring agent handles the adjacent cases. Say "invoke explicitly" if it must
     never run proactively.
   - `tools`: list only what the job needs. Read-only reviewers get `Read, Grep, Glob`. Leaving
     `tools` unset grants everything — only do that on purpose.
   - `model`: set it only when the tier matters (small for extraction/formatting, frontier for
     planning, routing, judging); otherwise inherit.
2. **System prompt, in this order:** role and scope (one paragraph) → goal → method as numbered
   steps → constraints (what it must not do, where it must stop and ask) → output format.
3. **Inputs:** the agent starts with an empty context. Name the files, artifacts and parameters
   it receives; never assume it saw the caller's conversation.
4. **Stopping and escalating:** say when to stop (done criteria), when to ask a human (risky,
   irreversible, ambiguous), and the loop/retry cap.
5. **Report back:** result first, then evidence; a fixed structure the caller can parse (e.g. a
   fenced JSON block with `status`, `summary`, `findings`/`artifactsProduced`, `followUps`).
6. **Try it** on 2–3 real tasks with a fresh session; check it stayed in scope and that the
   caller could use its report without re-reading its work.

## Reviewing an agent

Report each failed item with file, line and a concrete fix; mark non-applicable items n/a.

```
Scope
- [ ] one cohesive responsibility; not better as a skill or a one-off Agent call
- [ ] description third person: what, when, expected input, boundary to neighbours
Prompt
- [ ] sections: role/scope, goal, numbered method, constraints, output format
- [ ] inputs named explicitly (files, artifacts, parameters) — no reliance on caller context
- [ ] stop criteria, human-escalation points, loop/retry cap stated
Tools and model
- [ ] tools listed explicitly and minimal (< ~10); read-only where possible
- [ ] destructive or outward-facing tools behind a confirmation step or hook
- [ ] model set only where the tier matters, and the choice fits the work
Handoff
- [ ] report format fixed and parseable, result first
- [ ] only an orchestrator delegates to other agents; workers report back
```

## In the bpmn2agent pipeline

- `bpmn2agent-design` step 5 proposes tools and model per lane: use "Should this be an agent at
  all?" and the split rule, and record the reason when a lane becomes two agents or a skill.
- `bpmn2agent-generate` fills `agent-template.md` / `orchestrator-agent-template.md`; apply
  "Writing an agent" while filling them. The template's checklist, `bpmn:` frontmatter and
  reporting block already cover steps 2 and 5 — add `tools`/`model` only where design decided them.
- `agentic-artifact-reviewer` runs "Reviewing an agent" over `generated/<workflow>/agents/`.
