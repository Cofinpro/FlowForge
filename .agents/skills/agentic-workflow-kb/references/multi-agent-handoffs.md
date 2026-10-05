# Handoffs and multi-agent failure modes

Distilled from FAQ `multi-agent-handoffs-1`. Tag `[multi-agent-handoffs-1: n]`.

## Contracts

- Typed inputs/outputs between steps (JSON Schema, Pydantic, TypedDict) instead of prose
  [multi-agent-handoffs-1: 11, 12, 13].
- Validate each structured output; on failure the runtime re-prompts with the validation error
  before the next stage sees anything [multi-agent-handoffs-1: 12, 14, 18, 19].
- Downstream agents read named fields (`verdict.isReal`), never regex over text
  [multi-agent-handoffs-1: 14, 20].
- Across organisations/runtimes: A2A (agent cards, typed task lifecycle) and MCP for tools
  [multi-agent-handoffs-1: 2–10].

## Shared state vs. message passing

- **Shared state / blackboard:** one state schema all nodes read and write; checkpoints per
  thread allow pause for review and resume without re-running earlier nodes
  [multi-agent-handoffs-1: 11, 12, 21–25].
- **Message passing / handoff:** an agent passes control with an explicit handoff tool
  (`transfer_to_writer`, `return_to_researcher`) [multi-agent-handoffs-1: 33–36].

## Hand off through artifacts

- Write progress and results to files (`PLAN.md`, `changes.json`); the next agent reads them on
  demand instead of receiving a pasted payload [multi-agent-handoffs-1: 37–41].
- Plan → validate (deterministic script) → execute for batch or destructive changes
  [multi-agent-handoffs-1: 41].
- Parallel code-editing agents each get an isolated git worktree
  [multi-agent-handoffs-1: 14, 42].

## Context at handoff

Pass the minimum: the target's instructions, the immediate task, references to artifacts or a
summary. Crop intermediate tool chatter; full histories cause context rot
[multi-agent-handoffs-1: 37, 43–47].

## Coordination

Supervisor dispatch avoids deadlocks and leaves an audit trail; judge panels score candidates
and re-run reflection when judges disagree; interdependent work that parallel agents keep getting
wrong falls back to one sequential agent with shared context
[multi-agent-handoffs-1: 50–63].

## Failure modes

| Failure | Mitigation |
|---|---|
| Error propagation, "coherent incorrectness" (consistent but wrong) | plan–validate–execute with scripts, evaluator loops before handoff, feed raw errors back [multi-agent-handoffs-1: 41, 59, 61, 67–70] |
| Infinite loops, ping-pong handoffs | recursion/step limits, budget guards, dedupe sets incl. rejected items [multi-agent-handoffs-1: 58, 71–73] |
| Context rot, poisoning, confusion | compaction, file artifacts, cropped history, filtered recall [multi-agent-handoffs-1: 37, 43, 44, 48, 74–76] |
| Role confusion from overloaded prompts | single responsibility, third-person descriptions for routing [multi-agent-handoffs-1: 50, 77–82] |
| Cost explosion | zero-token script orchestrators, small models for routine steps, prompt caching, concurrency caps [multi-agent-handoffs-1: 15, 19, 44, 83–88] |

## Context sources at handoff (repo design decision)

Not notebook-cited; from `docs/plans/kontextquellen/plan.md`. Artifacts carry one run's handoff;
data stores carry what outlives a handoff or a run. A role reads the stores it needs (knowledge
reference, live tool, memory file) instead of receiving them pasted in the handoff, and its tool
list names only those stores' tools. Where lanes are not agents, the read tools are shared and the
plan says so. Memory is a curated file with a line cap that the writing step rewrites, never an
append-only log.

## For flowforge

BPMN data objects become `artifacts.<id>` contracts (path + frontmatter) — this is the
artifact-handoff pattern. Give every artifact a schema-like frontmatter and have the consuming
skill check it before use. Parallel gateways with editing agents need worktree isolation in a
Workflow script.
