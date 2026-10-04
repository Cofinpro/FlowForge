# From a process model to an agentic system

Distilled from FAQ `process-to-agents-1`, with the element table from
`control-flow-and-state-1`. Tag `[process-to-agents-1: n]`.

## Element mapping

| Process element | Becomes | Note |
|---|---|---|
| Swimlane / role | specialised domain agent | group by function or shared knowledge, no mega-agent [process-to-agents-1: 5–8] |
| Predictable single-pass task | deterministic tool or skill | [process-to-agents-1: 9, 10, 11] |
| Open-ended task (interpretation, planning) | subtask for an agent | [process-to-agents-1: 9, 10, 11] |
| XOR/OR gateway | router node or state-machine edge reading state | [process-to-agents-1: 3, 12, 13, 14] |
| Rework loop | ReAct / reflection / actor–critic cycle with error feedback | [process-to-agents-1: 9, 15, 16, 17] |
| Parallel branches | parallel subagents, merged downstream | [process-to-agents-1: 18–21] |
| Human approval | HITL checkpoint (pause/resume, edit arguments) | [process-to-agents-1: 22–25] |
| Data artifact | typed state, memory store or persistent file | [process-to-agents-1: 12, 21, 26, 27, 28] |
| Data store (cylinder) | context source: knowledge reference, live tool access or memory file, by `Art:` | repo design decision, not notebook-cited |

## Where each part belongs

- **Agents:** reasoning, multi-step planning, ambiguity, language generation
  [process-to-agents-1: 4, 29, 30].
- **Tools/skills:** discrete actions against systems [process-to-agents-1: 11, 34, 35].
- **Deterministic code:** predictable logic, math, schema transformation, formatting
  [process-to-agents-1: 10, 38].
- **Orchestration:** state machines, edges, workflow scripts [process-to-agents-1: 3, 13, 26, 39].
- **Human checkpoints:** irreversible, high-risk or low-confidence steps
  [process-to-agents-1: 22, 41, 42, 43].

## Granularity

Too coarse (mega-agent) → tool-selection errors, diluted focus. Too fine (micro-agents) → latency,
token overhead, brittle handoffs. Scope agents around a role, a dataset or a workflow phase, and
add only as many as needed [process-to-agents-1: 5, 7, 8, 46–55].

## Model per role

Frontier models for planning, routing, synthesis and evaluator roles; small models for narrow
extraction, classification and routine calls. A small model can propose, a stronger one judge
[process-to-agents-1: 56–65].

## Pitfalls when automating a human process

- The 70 % problem: routine steps go fast, edge cases and hardening remain human work
  [process-to-agents-1: 66–69].
- Over-agentifying deterministic logic adds cost, latency and audit problems
  [process-to-agents-1: 4, 10, 52, 70].
- Coherent incorrectness: consistent output that misses the business intent
  [process-to-agents-1: 71, 72, 73].
- Parallel agents without shared context produce parts that don't fit
  [process-to-agents-1: 74, 75, 76].
- Context bloat from dumping data or traces [process-to-agents-1: 50, 77, 78].
- Missing domain-expert review of real failures [process-to-agents-1: 79, 80, 81].

## For bpmn2agent

**Data stores (repo design decision, from `docs/plans/kontextquellen/plan.md`; not notebook-cited).**
A data store is a context source with an `Art:` (`wissen` → cited reference loaded at generation,
`live` → tool allowlist read at run time, `gedächtnis` → curated memory file with a line cap) and
an `Ort:`; the arrow direction alone says read or write. Every write into a live store needs a
`userTask` before it plus an `ask` hook behind it, and a phase with such a write is never a
workflow script. Ask during design: does each task have a store for what it must know, and does
each store have a reader?

This confirms the pipeline's defaults (lane → agent, service task → skill or checklist item,
script task → script, gateway → orchestrator logic, user task → checkpoint, data object →
artifact contract). The questions to add during design: is this lane really one role or two? Is
this service task deterministic enough to be a script? Does each parallel branch have the context
it needs to produce a part that fits the join?
