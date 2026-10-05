# Reasoning patterns

Distilled from FAQ `reasoning-patterns-1`. Tag `[reasoning-patterns-1: n]`.

| Pattern | Mechanism | Use for | Cost / failure mode |
|---|---|---|---|
| Chain of Thought | write intermediate steps before the answer | math, logic, analysis; lets smaller models do harder tasks | more tokens; a wrong early premise propagates ("coherent incorrectness") [reasoning-patterns-1: 3–9] |
| Tree of Thought | generate several candidate thoughts, evaluate, prune | design, strategy, outlines — avoiding first-answer bias | many branches, bad pruning criteria [reasoning-patterns-1: 7, 11–15] |
| ReAct | thought → action (tool) → observation, repeat | tasks needing external data or tools | latency, loops without halting condition, compounding tool errors [reasoning-patterns-1: 7, 9, 12, 16–26] |
| Reflection / Reflexion | critique a failed attempt, store the lesson, retry with it | code, debugging, high-stakes multi-step work | extra calls; shallow self-critique, repeating the same mistake [reasoning-patterns-1: 30–36] |
| Plan-and-execute | planner writes a plan, executors run steps, a judge checks | long multi-step work, research, software changes | wasted work on a bad plan; brittle plans [reasoning-patterns-1: 9, 23, 36, 41–45] |
| Memory-augmented | short-term window + long-term stores; search during reasoning | multi-session assistants, large corpora | lost-in-the-middle, noisy retrieval, stale memory [reasoning-patterns-1: 46–63] |

## How it shows up in instructions

- CoT: "before the recommendation, describe the data, the patterns, pros/cons, then decide"
  [reasoning-patterns-1: 6, 10].
- ToT: one prompt asks for exactly N distinct options with rationale; a second evaluates and
  keeps one [reasoning-patterns-1: 14, 15].
- ReAct: the prompt names the tools and the Thought/Action/Observation loop
  [reasoning-patterns-1: 22, 27].
- Reflection: "you failed; focus on the strategy, not the environment; write a new plan"
  [reasoning-patterns-1: 37, 38].
- Plan-and-execute: the planner returns a structured plan marking parallel vs. sequential steps;
  each executor gets exactly one step and may touch only its files [reasoning-patterns-1: 36, 41, 45].

## For flowforge

A BPMN rework loop (check → back to the task) is reflection with a cap: the gate's critique should
be passed back to the task as explicit input, not just "try again". Judgement gateways with several
viable options are ToT-shaped: propose options, then decide — which is also how the pipeline
presents decisions to humans.
