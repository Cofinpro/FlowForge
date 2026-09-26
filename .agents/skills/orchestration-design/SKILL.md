---
name: orchestration-design
description: Designs or reviews the orchestration layer of an agentic workflow — which pattern coordinates the pieces, handoff contracts between steps, human checkpoints, loop termination and caps, error handling and fallbacks, state and resume, context passing and model tiers — and writes it up as a short orchestration brief. Use when defining how agents, skills, hooks and scripts work together, when a workflow's pattern choice needs a second look, or in bpmn2agent-design before the mapping plan goes to the business user.
---

# Orchestration design

Rules come from `agentic-workflow-kb/references/` — `orchestration-patterns.md`,
`control-flow-and-state.md`, `human-in-the-loop.md`, `multi-agent-handoffs.md`,
`context-engineering.md`, `claude-code-workflows.md`. Read the one a step names when you need the
detail or the citation.

## Procedure

Work through the eight questions in order. Each answer is one or two lines in the brief.

1. **Workflow or agent?** Can every branch, retry and approval be listed in advance? Then the
   control flow is deterministic (script/skill chain) and agents only work inside steps. Open-ended
   inputs or replanning from observations need an agent that decides. Prefer the least autonomy
   that works. → `orchestration-patterns.md`
2. **Pattern.** Name it (sequential, router, fan-out/fan-in, supervisor, evaluator–optimizer,
   handoff, hierarchical) and why the neighbouring pattern doesn't fit. Start with the fewest
   agents; add one only for a named reason (tools, context, permissions). In Claude Code terms:
   skill chain + hooks, Workflow script, orchestrator agent, or mixed per phase.
   → `orchestration-patterns.md`, `claude-code-workflows.md`
3. **Handoffs.** For every edge between two workers: what artifact or structured output crosses
   it, where it lives, who validates it. No free-text handoffs. Parallel editors get isolation.
   → `multi-agent-handoffs.md`
4. **Human checkpoints.** Where the plan is approved; which actions are side-effecting,
   irreversible or outward-facing and get a gate *before* they run (never in the same step as the
   pause); how each decision is presented (options, recommendation, context); how to avoid
   approval fatigue. → `human-in-the-loop.md`
5. **Loops and termination.** Every loop: its stop condition, its cap, and what happens at the cap
   (proceed with a risk flag, fall back, or escalate). The critique from a failed check goes back
   into the retry as input. → `control-flow-and-state.md`
6. **Errors and fallbacks.** Raw errors fed back to the step that caused them; retries bounded;
   timeouts on long calls; a fallback per failure class (backup model, cached result, human).
   → `control-flow-and-state.md`
7. **State and resume.** Where progress is recorded (artifact frontmatter, run file, Workflow
   journal) and how a fresh session continues without redoing side effects.
   → `control-flow-and-state.md`, `claude-code-workflows.md`
8. **Context and models.** What each worker receives (paths and constraints, not transcripts);
   which steps need a frontier model (planning, routing, judging) and which run on a small one
   (extraction, formatting). → `context-engineering.md`, `agent-design.md`

## Orchestration brief

```markdown
## Orchestration brief: <workflow>
- Control: <deterministic | agent-decided>, because …
- Pattern: <pattern>; rejected <alternative> because …
- Handoffs: <from> → <to>: <artifact/schema>, validated by <who/what>
- Human checkpoints: <where>, <what is decided>, <options + default>
- Loops: <loop>: stop when …, cap <n>, at cap …
- Errors/fallbacks: …
- State/resume: …
- Context/models: …
- Open risks: … (e.g. untrusted input + outbound write = lethal trifecta)
```

## Review mode

For an existing design, answer the same eight questions from what is there and list each gap as a
finding: question number, what's missing, a concrete fix, and the reference that backs it.

## In the bpmn2agent pipeline

- Use in `bpmn2agent-design` after step 4 (pattern) and before step 7 (mapping plan).
  `pattern-rubric.md` stays the decision rule for the Claude Code shape; this skill checks what the
  rubric doesn't cover — handoff contracts, gates before side effects, termination at the cap,
  fallbacks, resume, context per worker.
- Findings that need a different diagram (a missing approval before an outward-facing task, a loop
  without an exit) go to the user as open questions — design never patches the BPMN.
- The brief's content feeds the mapping plan's "how it runs" part and `pattern.rationale`; it is
  not written as a separate generated file.
- `agentic-workflow-architect` runs this skill's review mode on a draft spec.
