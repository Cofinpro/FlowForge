# Control flow and state

Distilled from FAQ `control-flow-and-state-1`. Tag `[control-flow-and-state-1: n]`.

## State machines as the blueprint

- **FSM:** states, events, guards, actions. Decomposes a task into stable, recoverable steps; a
  checkpoint per state lets a run resume where it failed [control-flow-and-state-1: 3–7].
- Pure FSMs turn into "spaghetti routing" once planning, reflection, approvals and retries pile
  up [control-flow-and-state-1: 7].
- **HSM:** superstates group substates (`WORKING` ⊃ `PLAN`, `ACT`, `REFLECT`); policies, rate limits
  and circuit breakers attach once to the superstate; history markers resume at the last
  substate; parallel regions fan out and join [control-flow-and-state-1: 8, 9, 10].
- In code: state schema = shared memory, nodes/subgraphs = (super)states, guard functions =
  conditional edges, checkpointer = history/persistence [control-flow-and-state-1: 11–18].

## Loops and termination

- Loops are cyclic edges or `while` loops in an orchestrator script
  [control-flow-and-state-1: 21, 24, 25].
- Check a stop rule every cycle (final answer without tool call, supervisor `FINISH`)
  [control-flow-and-state-1: 26, 27].
- Always add a hard bound: max steps, recursion limit, call ceiling or remaining-budget guard
  [control-flow-and-state-1: 28–32].

## Errors, retries, timeouts, fallbacks

- Feed the raw error or stack trace into the next turn so the agent can self-correct
  [control-flow-and-state-1: 33, 34, 35].
- Schema-invalid output → automatic correction prompt for just that output; API retries with
  exponential backoff [control-flow-and-state-1: 31, 36, 37].
- Explicit timeouts on long calls [control-flow-and-state-1: 38, 39].
- When retries or budget run out: backup model, cached data, safe default, or human review
  [control-flow-and-state-1: 37, 40, 41, 42].

## Checkpointing and resume

Persist state at key transitions. Keep orchestrator logic deterministic (no unseeded randomness,
no side effects in the orchestrator itself) so a resumed run can replay cached step results
[control-flow-and-state-1: 14, 17, 18, 43–46].

## BPMN element → agent control flow

| BPMN | Agent construct |
|---|---|
| Service / script task | node or tool execution |
| User / manual task | HITL interrupt: persist, wait, resume |
| Exclusive gateway | router edge — deterministic guard or LLM classifier |
| Parallel gateway (fork / join) | parallel region or barrier / consolidation node |
| Inclusive gateway | router returning a list of branches |
| Loop | cyclic edge or bounded `while` |

Sources: [control-flow-and-state-1: 10–16, 21, 24, 25, 27, 45–56].

Hybrid recommendation: a deterministic engine owns the process structure (sequence, retries,
audit trail); agents work *inside* the task nodes that need unstructured reasoning
[control-flow-and-state-1: 19, 39, 48, 57, 58, 59].

## For bpmn2agent

This is the reasoning behind `mapping-rubric.md`'s "gateway → orchestrator logic" and the
`gate.maxLoops` default of 3. Two checks worth adding in design: every loop has a termination
condition the agent can actually evaluate, and every retry path has a fallback (usually a human
checkpoint) once `maxLoops` is hit.
