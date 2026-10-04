# Unsupported constructs (v1) — flag red, suggest a rewrite

`bpmn2agent-analyze` never silently drops a construct it can't generate from. For every construct here
`inventory.mjs` emits a `findings[]` entry (`severity: "unresolved"`). Surface it to the business user in
the interview. In the spec draft it gets `kind: unresolved` with a `reason` saying *why*, so it renders
red in the mapping view (`mapping-rubric.md`'s legend). `bpmn2agent-verify`'s "no red in the map" check
fails until each one is rewritten out of the source `.bpmn` (by the human modeler, never by this
pipeline) or explicitly accepted as an open gap.

## Pools and message flows

**Why unsupported**: a second pool with message flows models choreography with an external system or
organization. The pipeline generates one set of agents/skills for one process and has no model for a
system it doesn't control.

**Detection**: `unsupported-pools-message-flows`, once per diagram, when the `bpmn:Collaboration` has
more than one `bpmn:participant` connected by at least one `bpmn:messageFlow`.

**Rewrite suggestion**: if the second pool is really a *role* your own team/agents play, flatten it into
a lane of the single process. If it is genuinely external (a customer, a vendor system, a department
that won't run this pipeline), model the interaction as a step of your process (e.g. a `serviceTask`
"send the request to X" / a `userTask` "wait for Y's reply"), not as a second pool.

## Timer events (start, intermediate, boundary)

**Why unsupported**: no generated output (skills, hooks, orchestrator agents, Workflow scripts) has a
wall-clock scheduler. A generated Workflow script runs only when a human starts it (see
`pattern-rubric.md`); nothing wakes an orchestrator agent at a timer.

**Detection**: `unsupported-timer-event`, any flow node whose `eventDefinitions` includes
`bpmn:TimerEventDefinition`.

**Rewrite suggestion**: model the timer as a loop cap on the enclosing gate (`gate.maxLoops` in the
spec): "retry up to N times" instead of "wait until a clock fires". A genuinely scheduled/recurring run
is an operational concern for whoever runs the generated artifacts (e.g. an external cron/scheduler
invoking the workflow), not something the BPMN should express.

## Message events (start, intermediate, boundary)

**Why unsupported**: like pools/message flows, a message event models a signal from outside the
process's own control flow, which needs a choreography partner the pipeline doesn't generate for.

**Detection**: `unsupported-message-event`, any flow node whose `eventDefinitions` includes
`bpmn:MessageEventDefinition`.

**Rewrite suggestion**: if the sender is really a role your own agents play, flatten it into a lane and
turn the exchange into an ordinary sequence flow (a task producing what the message carried, followed by
a task consuming it). If it is genuinely external, model receiving from it as an explicit step (e.g. a
`serviceTask` your agent performs by calling out, or a `userTask` where a human relays the result in).

## Event sub-processes (`subProcess triggeredByEvent="true"`)

**Why unsupported**: an event sub-process runs detached from the main flow and can fire at any point
while its parent is active (e.g. "budget exhausted, anywhere in this phase"). None of the three
generated orchestration patterns has a handler that can interrupt any step; each runs its steps in an
explicit, traceable order.

**Detection**: `unsupported-event-subprocess`, any `bpmn:SubProcess`/`bpmn:Transaction` with
`triggeredByEvent="true"`.

**Rewrite suggestion**: if it really guards one specific activity ("if this step fails, do X"), model it
as a boundary error event on that activity, which *is* supported (see mapping-rubric.md's v1 supported
list). If it must watch the whole run, express it as an agent-checklist item ("check for condition X
before/after every step") on the role owning the surrounding phase, not as BPMN control flow.

## Compensation (compensation events and `isForCompensation` activities)

**Why unsupported**: compensation is an automatic, engine-driven rollback triggered by a cancellation.
No generated pattern has a transactional engine to trigger it, and a Claude agent/skill/hook has no
built-in "undo this activity" mechanism.

**Detection**: `unsupported-compensation`, any flow node whose `eventDefinitions` includes
`bpmn:CompensateEventDefinition`, or with `isForCompensation="true"`.

**Rewrite suggestion**: model the rollback as an explicit, separate task on the happy path's error
branch: "if the approval is later reversed, do Y" becomes an ordinary task reachable via a gateway, not
an implicit compensation handler. This keeps the rollback visible in the diagram and traceable to a
generated step.
