# Agent design

Distilled from FAQ `agent-design-1`. Tag `[agent-design-1: n]` = citation n in that entry.

## Scope

- One cohesive responsibility, the size of a plausible human job description, department or API
  integration [agent-design-1: 3, 4, 6, 7].
- The "Michael Scott" anti-pattern: one agent doing sales research, support and order processing
  gets worse at all of them, because tool-selection errors grow with tool count
  [agent-design-1: 1].

## System prompt sections

Role and expertise → primary goal → step-by-step method → constraints (allowed/forbidden
actions, environment limits) → output format. Separate the blocks with headers or XML tags
[agent-design-1: 2, 9, 10].

## Tools

- Least privilege: only what the narrow scope needs, no broad admin keys
  [agent-design-1: 20, 21, 22].
- Keep it under ~10 tools; selection accuracy drops beyond that (10–16 is where sources see
  breakdown) [agent-design-1: 1, 23, 24, 25].
- Each tool: precise name, one-sentence purpose, typed parameters, an example
  [agent-design-1: 24, 26]. Validate arguments against a schema before execution
  [agent-design-1: 20, 28].

## Model

Frontier models for orchestration, planning, routing and high-stakes analysis; small fast models
for narrow extraction, summarisation, formatting. Allocation can be dynamic
[agent-design-1: 29, 31, 33, 35, 36].

## Description used for delegation

Third person; says what the agent does, when to call it and what input it expects; lists covered
topics/trigger words so the router can tell neighbours apart [agent-design-1: 15, 41].

## Report back to the orchestrator

Structured and validated (fields like `status`, `verdict`, `findings`, `confidence`), result
first, then evidence and file paths. No free-text dumps between stages
[agent-design-1: 43, 44, 45, 46, 48, 49].

## Split or keep one agent

| Split when … | Keep one agent when … |
|---|---|
| tool count passes ~10–16 or tools overlap | < 10 clearly separated tools |
| work crosses departments/systems/skill sets | one end-to-end domain |
| context overflows or rots on long runs | the workflow fits comfortably |
| steps need different permissions | uniform access rights |
| subtasks can run independently | parallel parts would produce incompatible outputs |
| accuracy/modularity beats extra latency | latency matters more |

Sources: [agent-design-1: 1, 6, 8, 10, 21, 25, 50–65].

## Management roles are separate agents

The meta-orchestration subagents split decomposition/synthesis (`agent-organizer`,
`multi-agent-coordinator`), workflow state and scheduling (`workflow-orchestrator`,
`task-distributor`), context curation (`context-manager`) and failure recovery
(`error-coordinator`) away from domain workers [agent-design-1: 41, 66–72].

## Anti-patterns

Monolithic agent · overlapping tools · parallel agents on dependent work without shared context ·
unbounded loops (no step, recursion or budget limit) · over-privileged tools · unvalidated text
handoffs [agent-design-1: 1, 20–25, 43, 54, 61, 73–75].
