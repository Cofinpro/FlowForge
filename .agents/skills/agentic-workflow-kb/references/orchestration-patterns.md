# Orchestration patterns

Distilled from FAQ `orchestration-patterns-1`. Tag `[orchestration-patterns-1: n]`.

## Catalogue

| Pattern | Use when | Avoid when | Cost / latency | Debuggability |
|---|---|---|---|---|
| Sequential pipeline (prompt chain) | step N+1 needs step N's result | steps are independent or need loops | moderate / cumulative | excellent |
| Router | inputs fall into distinct categories | one domain only (adds a hop) | minimal / +1 hop | excellent |
| Parallel fan-out / fan-in | independent dimensions (security, performance, a11y …) | parallel parts need shared context — outputs won't combine | high / slowest branch | moderate |
| Orchestrator–workers (supervisor) | distinct domains, central policy | single domain, or large swarms (bottleneck) | high / moderate–high | good, central audit trail |
| Hierarchical teams | enterprise, multi-department | small/medium projects | very high / high | complex |
| Evaluator–optimizer (actor–critic) | hard to produce, easy to check against a rubric or tests | no clear metric, real-time needs | very high / looping | high |
| Handoff / swarm | peers iterate back and forth | regulated flows needing a fixed path | variable / low–moderate | hard |
| Blackboard / shared state | decoupled agents, durable state, resume | a single in-memory turn | moderate / async | high (state snapshots) |

Sources: [orchestration-patterns-1: 2–81].

`parallel()` is a barrier (next stage waits for all); `pipeline()` streams items through stages
without a global barrier [orchestration-patterns-1: 5, 28, 29].

## Deterministic workflow or autonomous agent

Four questions [orchestration-patterns-1: 82–91]:

1. **Input variability** — structured and predictable → workflow; open-ended → agent.
2. **Reasoning** — every branch, retry and approval can be enumerated → workflow; needs
   replanning from observations → agent.
3. **Constraints** — low latency, audit trail, deterministic replay → workflow.
4. **Maintenance** — agents need evals, observability and guardrails to stay reliable.

Spectrum: deterministic code → graph workflow (FSM/HSM) → RAG/chat → autonomous agent.
Production systems sit at "orchestrated autonomy": humans fix decision points and tool
boundaries [human-in-the-loop-1: 17, 18, 19].

## Single agent first

- Start with one agent; add agents only when tool selection degrades (~10–16 tools), context rots,
  or permissions force separation [orchestration-patterns-1: 47, 92–101].
- Parsimony: the minimum number of agents; each adds overhead and a failure point
  [orchestration-patterns-1: 35, 46, 105].
- Grow iteratively: one specialist → notice the next need → split when unwieldy → add a
  router/supervisor [orchestration-patterns-1: 20].

## For bpmn2agent

`bpmn2agent-design/references/pattern-rubric.md` picks one of four Claude Code shapes. Rough
correspondence: skill chain + hooks ≈ sequential pipeline with human pauses; Workflow script ≈
deterministic fan-out/fan-in and pipelines; orchestrator agent ≈ supervisor/router with judgement;
mixed ≈ hierarchical composition per phase. An evaluator–optimizer loop in the BPMN (rework loop
after a check) maps to a gate with `maxLoops`, not to a new pattern.
