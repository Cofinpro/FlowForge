# Claude Code specifics

Distilled from FAQ `claude-code-workflows-1` (mainly the claude-code-ultimate-guide, the VoltAgent
meta-orchestration agents and Osmani's workflow). Tag `[claude-code-workflows-1: n]`.

> Version numbers and trigger keywords below are what the sources state. Check them against the
> current Claude Code docs and the `workflow-authoring` skill before relying on them.

## Workflow scripts

- A JavaScript module run as an orchestrator that costs no tokens itself; LLM work happens in
  subagents it spawns [claude-code-workflows-1: 1, 2, 3].
- Shape: a `meta` export (name, description, phases) plus a default async function using
  runtime primitives [claude-code-workflows-1: 4, 5]:
  `agent(prompt, {model, phase, label, schema, isolation: 'worktree'})`, `parallel(thunks)`
  (barrier), `pipeline(stages, items)` (streaming), `phase()`, `workflow()` for sub-workflows,
  `log()`, `budget`, `args` [claude-code-workflows-1: 6–13].
- `parallel()` when the next stage needs **all** results (dedupe, judge synthesis); `pipeline()`
  when each item only needs its own previous result. Using the wrong one roughly doubled tokens
  and tripled wall-clock in the guide's benchmark [claude-code-workflows-1: 10, 14, 15, 16].

## Agent tool, skill or workflow?

| Mechanism | Use for |
|---|---|
| Agent tool | one localized subtask; no script to maintain |
| Skill | reusable procedure or knowledge where Claude keeps judgement; no ordering guarantee |
| Workflow script | multi-stage, reproducible runs with fan-out, resume and schema-typed handoffs |

Rule of thumb from the guide: a workflow pays off when at least three of these hold — multi-stage
dependencies, parallelism, resume needed, reproducible path, schema validation between phases
[claude-code-workflows-1: 3, 4, 17–22].

## Delegation

- Every `agent()` starts with an isolated context; pass everything explicitly. Concurrent code
  edits → `isolation: 'worktree'` [claude-code-workflows-1: 4, 6, 8].
- Proven shapes: plan → parallel execute → adversarial review; refutation pass on candidates;
  loop-until-dry discovery with a dedupe set and budget stop; multi-strategy sweep + synthesizer
  [claude-code-workflows-1: 8, 23, 24].

## Meta-orchestration agents (VoltAgent)

`workflow-orchestrator` (multi-phase state), `agent-organizer` (decompose, pick agents,
synthesise), `task-distributor` (load balancing, priorities), `context-manager` (token budget,
memory), `error-coordinator` (fallbacks, cascading failures), `knowledge-synthesizer` (merge and
reconcile outputs) [claude-code-workflows-1: 25–32].

## Osmani's workflow

Spec first (`spec.md`, the model asks questions until requirements, edge cases and tests are
explicit) → plan (`plan.md`, small milestones) → one small chunk at a time → pack the context
deliberately → tests alongside code, raw errors fed back → human review of every diff
[claude-code-workflows-1: 33–51].

## Setup recommendations

Skills with gerund names, third-person descriptions, `SKILL.md` < 500 lines, detail in references
and scripts; multi-stage tasks as Workflow scripts with `schema` handoffs; validation scripts run
after edits (plan–validate–execute) with failures fed back; `budget` guards in loops; rely on
autocompaction for long sessions [claude-code-workflows-1: 1, 7, 13, 20, 46, 47, 52–59].

## For flowforge

`pattern-rubric.md`'s "Workflow script" pattern generates exactly this kind of file; it is never
run by the pipeline itself. The guide's three-of-five rule is a useful sanity check on that choice.
A generated orchestrator agent resembles `workflow-orchestrator`/`agent-organizer`; keep error
handling and context curation as explicit sections rather than extra agents unless the workflow is
large.
