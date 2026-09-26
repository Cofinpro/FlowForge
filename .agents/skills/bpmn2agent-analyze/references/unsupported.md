# Unsupported constructs (v1) — flag red, suggest a rewrite

`bpmn2agent-analyze` never silently drops a construct it can't generate from. Every element listed
here gets a `findings[]` entry (`severity: "unresolved"`) from `inventory.mjs`, must be surfaced to
the business user during the interview, and — once written to `workflow-spec.yaml` by
`bpmn2agent-design` — gets `kind: unresolved` with a `reason` explaining *why*, so it renders red in
the mapping view (`mapping-rubric.md`'s legend) instead of vanishing. `bpmn2agent-verify`'s "no red
in the map" check fails the run until every one of these is either rewritten out of the source
`.bpmn` (by the human modeler, never by this pipeline) or explicitly accepted as an open, unresolved
gap.

This list matches `bpmn2agent-design/references/mapping-rubric.md`'s "v1 supported/unsupported
constructs" section — this file exists so `bpmn2agent-analyze` has the same list, framed as "what to
flag and what to suggest," without needing to read the design skill's rubric during analysis.

## Pools and message flows

**Why unsupported**: a second pool + message flows models cross-organization or cross-system
choreography — a different system or company doing its own thing and exchanging messages with this
one. This family generates *one* coherent set of agents/skills for *one* process; it has no model
for "an external system I don't control."

**Detection**: `inventory.mjs` flags this once per diagram (`unsupported-pools-message-flows`) when
the `bpmn:Collaboration` root element has more than one `bpmn:participant` connected by at least one
`bpmn:messageFlow`.

**Rewrite suggestion**: if the second pool actually represents a *role* your own team/agents play
(not a genuinely external system), flatten it into a lane of the single process instead — that's
exactly what lanes are for. If it's genuinely external (a customer, a vendor system, a different
department that won't run this pipeline), the interaction with it has to be modelled as a step your
process takes (e.g. a `serviceTask` "send the request to X" / a `userTask` "wait for Y's reply"),
not as a second pool.

## Timer events (start, intermediate, boundary)

**Why unsupported**: nothing in this pipeline's generated output (skills, hooks, orchestrator
agents, Workflow scripts) has a wall-clock scheduler. A generated Workflow script only ever runs
when a human deliberately starts it (see `pattern-rubric.md`); there's no daemon to wake up an
orchestrator agent at a timer.

**Detection**: `inventory.mjs` flags any flow node whose `eventDefinitions` includes
`bpmn:TimerEventDefinition` (`unsupported-timer-event`).

**Rewrite suggestion**: model the timer as a loop cap on the enclosing gate instead (`gate.maxLoops`
in the spec) — "retry up to N times" rather than "wait until a clock fires." If the intent is
genuinely a scheduled/recurring run, that's an operational concern for whoever runs the generated
artifacts (e.g. an external cron/scheduler invoking the workflow), not something the BPMN itself
should express.

## Message events (start, intermediate, boundary)

**Why unsupported**: same root cause as pools/message flows — a message event models a signal from
outside this process's own control flow, which only makes sense with a choreography partner this
pipeline doesn't generate for.

**Detection**: `inventory.mjs` flags any flow node whose `eventDefinitions` includes
`bpmn:MessageEventDefinition` (`unsupported-message-event`).

**Rewrite suggestion**: if the message's sender is really a role your own agents play, flatten it
into a lane and turn the message exchange into an ordinary sequence flow (a task that produces what
the message would have carried, followed by a task that consumes it). If it's genuinely an external
system, model receiving from it as an explicit step (e.g. a `serviceTask` your agent performs by
calling out, or a `userTask` where a human relays the result in).

## Event sub-processes (`subProcess triggeredByEvent="true"`)

**Why unsupported**: an event sub-process runs detached from the main flow, triggered by an event
that can fire at any point while its parent is active (e.g. "budget exhausted, anywhere in this
phase") — there's no equivalent of "a handler that can interrupt any step" in any of the three
generated orchestration patterns; each one processes its steps in an explicit, traceable order.

**Detection**: `inventory.mjs` flags any `bpmn:SubProcess`/`bpmn:Transaction` with
`triggeredByEvent="true"` (`unsupported-event-subprocess`).

**Rewrite suggestion**: if the event sub-process is really guarding one specific activity (e.g. "if
this step fails, do X"), model it as an explicit boundary error event on that activity instead —
that construct *is* supported (see mapping-rubric.md's v1 supported list). If it genuinely needs to
watch the whole run rather than one activity, express it as its own agent-checklist item ("check for
condition X before/after every step") on the role that owns the surrounding phase, rather than as
BPMN control flow.

## Compensation (compensation events and `isForCompensation` activities)

**Why unsupported**: compensation models an automatic, engine-driven rollback triggered by a
cancellation — none of the generated patterns have a transactional engine underneath them to trigger
it; a Claude agent/skill/hook has no built-in "undo this activity" mechanism to hook into.

**Detection**: `inventory.mjs` flags any flow node whose `eventDefinitions` includes
`bpmn:CompensateEventDefinition`, or that has `isForCompensation="true"` set
(`unsupported-compensation`).

**Rewrite suggestion**: model the rollback as an explicit, separate task on the happy path's error
branch instead — "if the approval is later reversed, do Y" becomes an ordinary task reachable via a
gateway, not an implicit compensation handler. This keeps the rollback logic visible in the diagram
and traceable to a generated step, exactly like every other task.

## What "flag red" means in practice, end to end

1. `inventory.mjs` detects the construct and adds a `findings[]` entry with
   `severity: "unresolved"`, the element id, and a short rewrite suggestion (mirroring this file).
2. `bpmn2agent-analyze`'s `SKILL.md` procedure surfaces every `unresolved` finding to the business
   user (plain language, quoting the BPMN label verbatim) *before* writing the spec draft — this is
   not something to ask about later.
3. If the user agrees to rewrite the `.bpmn` (in `bpmn-authoring`, outside this skill — analysis
   never edits the source file), re-run analysis; the element disappears from `findings` once it's
   gone from the diagram.
4. If the user wants to keep it as-is for now, write `elements.<id>.kind: unresolved` with `reason`
   set to the concrete rewrite suggestion, and add an `openQuestions[]` entry if there's still a
   decision pending. `bpmn2agent-verify`'s "no red in the map" check will keep failing until this is
   resolved one way or the other — that's intentional; it's the visible reminder that something in
   the diagram couldn't be turned into working agents/skills yet.
