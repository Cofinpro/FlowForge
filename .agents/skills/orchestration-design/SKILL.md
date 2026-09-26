---
name: orchestration-design
description: Designs or reviews the orchestration layer of an agentic workflow — pattern, handoff contracts, human checkpoints, loop termination and caps, errors and fallbacks, state and resume, context and model tiers — as a short orchestration brief (new design) or a list of findings (existing design or spec). Use when defining how agents, skills, hooks and scripts work together or when a pattern choice needs a second look. For a single agent definition use agent-authoring.
---

# Orchestration design

Each question names the agentic-workflow-kb reference that backs it; read it for detail or the
citation tag.

- **New design** → Procedure, then the orchestration brief.
- **Existing design or spec** → Review mode (findings only, no brief).

## Procedure

Work through the eight questions in order. Each answer is one or two lines in the brief.

1. **Workflow or agent?** Can every branch, retry and approval be listed in advance? Then the
   control flow is deterministic (script/skill chain) and agents only work inside steps. Open-ended
   inputs or replanning from observations need an agent that decides. Prefer the least autonomy
   that works. A phase that asks the user is not a Workflow-script phase: `agent()` subagents
   can't use AskUserQuestion, runs need explicit opt-in, and resume works only in the same
   session. → `orchestration-patterns.md`, `claude-code-workflows.md`
2. **Pattern.** Name it (sequential, router, fan-out/fan-in, supervisor, evaluator–optimizer,
   handoff, hierarchical) and why the neighbouring pattern doesn't fit. Start with the fewest
   agents; add one only for a named reason (tools, context, permissions). An LLM step doing
   deterministic work → script. In Claude Code terms: skill chain + hooks, Workflow script
   (unattended phases only, see Q1), orchestrator agent, or mixed per phase. If the caller has a
   pattern rubric, it wins where explicit; a pattern contradicting its signals is a finding.
   → `orchestration-patterns.md`, `claude-code-workflows.md`, `tool-design.md`
3. **Handoffs.** For every edge between two workers: what artifact or structured output crosses
   it, where it lives, who validates it. No free-text handoffs. Parallel editors get isolation;
   parallel branches must not depend on each other's output. → `multi-agent-handoffs.md`
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
   (extraction, formatting). A worker that reads untrusted input and can write outward needs a
   gate or hook in between (lethal trifecta). → `context-engineering.md`, `agent-design.md`,
   `evaluation-and-guardrails.md`

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
- Open risks: …
```

## Review mode

Answer the same eight questions from what is there and list each gap as a finding: question
number, what's missing, a concrete fix, and the reference that backs it. A gap that needs the
source diagram or process to change is a finding for its owner, never a silent redesign.
