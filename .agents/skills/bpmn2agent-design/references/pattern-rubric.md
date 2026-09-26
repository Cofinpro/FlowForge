# Pattern rubric: choosing the orchestration pattern

How `bpmn2agent-design` picks `pattern.chosen` in `workflow-spec.yaml` from the shape of the analyzed
diagram, and how it explains that choice to the business user who drew it. The choice is made once
per workflow (and, recursively, once per `callActivity`/`subProcess` that `mapping-rubric.md` decided
is a sub-workflow rather than a plain skill) — always propose it, never silently apply it; confirm via
`AskUserQuestion` with the rationale and the alternatives considered, both recorded in the spec.

Every pattern below caps its loops at `elements.<id>.gate.maxLoops`. **Default: 3**, absent a
reason from the BPMN/interview to pick something else (see `bpmn2agent-design/SKILL.md` step 3's
gate bullet) — don't leave it unset and don't silently invent a different number per gate.

## Signals to compute from the element inventory

Before consulting the table, count these over the diagram (or sub-diagram) being decided:

| Signal | What it counts |
|---|---|
| `humanTaskCount` | `userTask` + `manualTask` elements |
| `parallelCount` | `parallelGateway` + `inclusiveGateway` elements |
| `multiInstanceCount` | Elements with a multi-instance marker |
| `loopCount` | Back-edges (loop merge → split pairs per `bpmn-authoring/references/modelling-rules.md`) |
| `judgementBranchCount` | `exclusiveGateway`s whose outgoing conditions require an LLM to weigh a case (e.g. "is this good enough?", "which of these applies?") rather than a deterministic threshold a script can evaluate |
| `attended` | `humanTaskCount > 0` — the workflow needs at least one point where a human is present while it runs |

## Decision table

| Signal pattern | Pattern | Why |
|---|---|---|
| `attended`, low `parallelCount`/`multiInstanceCount`/`judgementBranchCount`, loops bounded by a simple pass/fail rubric | **Skill chain + hooks** | The diagram is essentially a script a human walks through with the agent, pausing at defined points. No need for a coordinating process beyond "run skill A, then B, then C." |
| Not `attended` (fully unattended), `parallelCount` and/or `multiInstanceCount` > 0, branching is deterministic (a script can evaluate every condition) | **Claude Code Workflow script** | The shape is exactly what `agent()`/`parallel()`/`pipeline()` model: deterministic fan-out/fan-in with no human in the loop. |
| `judgementBranchCount` > 0 with case-by-case weighing (not just "run N things and merge"), regardless of `attended` | **Orchestrator agent** (delegates via the `Agent` tool, like `task-delegator`) | The branching itself needs judgment a script can't encode as a condition — something has to look at the actual case and decide who does what next. |
| The diagram has phases with genuinely different shapes (e.g. an unattended parallel research phase feeding into a phase that needs a human sign-off, or a judgement-heavy phase followed by a deterministic one) | **Mixed** | No single pattern fits the whole diagram; compose phase-by-phase (see below) instead of forcing one pattern over a shape it doesn't match. |

If two rows both plausibly apply, prefer the earliest one that fits before reaching for `mixed` —
`mixed` costs the most to generate, explain and maintain, so it should win only when phases are
*structurally* different, not merely because the diagram is large.

## Per-pattern detail

### Skill chain + hooks

- **When**: linear or near-linear flow, one or more human checkpoints, gates are simple threshold
  rubrics, no unattended parallelism.
- **When not**: any real fan-out/fan-in the human isn't present for, or branching that needs
  case-by-case judgment beyond a fixed rubric.
- **Generated**: one skill per `serviceTask`/reusable-procedure element (per `mapping-rubric.md`),
  invoked in sequence by the calling agent/skill's own instructions; hooks for any
  `businessRuleTask`/condition that must gate a tool call.
- **Human checkpoints**: `AskUserQuestion` calls inline in the skill sequence, exactly where the
  `userTask`/`manualTask` sits in the diagram.
- **Loop caps**: enforced in the skill itself (a counter the skill's instructions track and check
  against `elements.<id>.gate.maxLoops`) — no separate orchestrator needed since a human is present to
  notice runaway loops anyway.
- **State/resume**: the artifacts themselves are the state — each has `version`/`status` frontmatter
  (see dark-factory's artifact frontmatter, `docs/planning/dark-factory-prozess-gedaechtnis.md` §11.2,
  as the template this generalises). Re-running the chain is idempotent: a skill checks whether its
  output artifact already exists at the expected version before redoing the work. No `run.yaml` is
  needed for this pattern — the artifact trail already resumes.

### Claude Code Workflow script

- **When**: fully unattended, real parallel/multi-instance structure, deterministic branching.
- **When not**: any human checkpoint inside the flow (a Workflow script has no place to pause for
  `AskUserQuestion` mid-run), or branching that needs judgment a script condition can't express.
- **Generated**: one `.mjs`-style Workflow script per workflow (`.claude/workflows/<workflow>.workflow.mjs`
  in the claude-dir layout, `<workflow>.workflow.mjs` in the legacy one), using `agent()` for
  LLM steps, `parallel()`/`pipeline()` for the fan-out the gateways/multi-instance markers represent,
  and plain JS for deterministic gateway conditions. **The script is only ever generated as a saved
  file — it must never be invoked by the generator itself, and the generated `README.md` says so
  explicitly: the business user (or whoever operates the workflow) runs it deliberately, on demand.**
- **Human checkpoints**: none inside the script by construction (see "when not"); if the diagram has
  any, the pattern doesn't apply and `mixed` should be chosen instead.
- **Loop caps**: a plain counter variable checked each iteration (`while (loopCount < maxLoops)`),
  matching `elements.<id>.gate.maxLoops` from the spec.
- **State/resume**: the Workflow tool's own resume mechanism (`resumeFromRunId`, replaying cached
  `agent()` results from its journal) is the actual resume backend — prefer it over hand-rolled state.
  No hand-rolled run-state scripts or sidecar files: the Workflow tool's own journal is the record
  (the legacy dark-factory layout added a `run.yaml` + `log/events.jsonl` sidecar; new specs don't).

### Orchestrator agent

- **When**: branching needs an actual judgment call per case — not "run these N things," but "decide,
  looking at this specific case, what happens next" — the way `task-delegator` reads a task list and
  decides which specialist handles each item.
- **When not**: the branching is really just a deterministic condition dressed up as a gateway (use
  Workflow script), or there's no branching at all requiring delegation (use skill chain).
- **Generated**: one orchestrator agent (`generated/<workflow>/.claude/agents/<workflow>-orchestrator.md`,
  following the same shape as `task-delegator.md`) that owns the gateway decisions and delegates
  each branch to the matching generated agent via the `Agent` tool — written under
  `generated/<workflow>/` like every other output, per the pipeline's output-location decision
  (never straight into the user's `.claude/agents/`); the generated `README.md` gives the one copy
  command that installs it. Only this orchestrator calls `Agent` on the other
  generated agents — same rule as this repo's `task-delegator` — other handoffs stay report-based.
- **Human checkpoints**: modeled as the orchestrator itself pausing and asking via `AskUserQuestion`
  before dispatching past a `userTask`/`manualTask`, exactly like `task-delegator`'s confirmation
  checkpoint before dispatch.
- **Loop caps**: the orchestrator tracks iteration counts in its own working state (or in `run.yaml`,
  see below) and stops looping back once `maxLoops` is hit, proceeding with a risk flag instead —
  mirroring dark-factory's K.4 rule of converting `fail` to `pass-with-risk` at the cap
  (`dark-factory-prozess-gedaechtnis.md` §9.1) generalised beyond that specific process.
- **State/resume**: an `Agent`-tool-delegating agent has no built-in cross-session resume the way a
  Workflow script does. The generator has the orchestrator read/write a `run.yaml` (current
  gateway position, loop/iteration counters, config snapshot + BPMN hash) and append to
  `log/events.jsonl` at each delegation boundary — the same sidecar layout as the Workflow-script
  pattern, here doing double duty as the actual resume mechanism, not just an explainability aid: a
  fresh session resumes by reading `run.yaml`'s last completed step and re-dispatching from there.

### Mixed

- **When**: distinct phases have structurally different shapes — e.g. an unattended parallel-research
  phase (Workflow script) feeding a phase that needs a human sign-off between two skills (skill
  chain), or a deterministic phase followed by a judgment-heavy one (orchestrator agent).
- **When not**: the whole diagram actually fits one pattern — don't reach for `mixed` just because the
  diagram is long; re-check the decision table per phase first.
- **Generated**: each phase generated per its own pattern (as above), with the phase boundary itself
  becoming the hand-off point — typically a human checkpoint or an orchestrator-agent decision that
  invokes the next phase's Workflow script or skill chain. Record the phase split itself in
  `pattern.phases[]` (`workflow-spec.schema.yaml`'s `pattern` definition — `[{name, pattern,
  elements: [...]}]`, one entry per phase in diagram order) rather than leaving it only in prose;
  `bpmn2agent-generate` reads `pattern.phases` when present instead of re-inferring phase
  boundaries from contiguous element runs (see that skill's step 7).
- **Human checkpoints / loop caps**: whatever the owning phase's pattern specifies, per phase.
- **State/resume**: `run.yaml` + `log/events.jsonl` (as above) becomes the cross-phase spine — it
  records which phase is active and, within a Workflow-script phase, can still lean on that phase's
  own `resumeFromRunId`. Phase transitions are themselves logged as events so a resume can tell
  "mid-phase" from "between phases."

## Explaining the choice to a non-technical business user

Tie the explanation to the shape they drew, not to the pattern's technical name. Then confirm with
`AskUserQuestion` (options + a recommendation), per the umbrella skill's framing rule. Examples:

- **Skill chain + hooks**: "Your diagram runs straight through with your own sign-off at a couple of
  points — I'll build this as a sequence of checklists that pause and wait for you each time, like a
  guided playbook."
- **Workflow script**: "Your diagram runs entirely on its own, with several things happening at once
  (the three research tasks) — I'll build this as an automated script. It only runs when you
  deliberately start it; nothing happens in the background."
- **Orchestrator agent**: "Your diagram has a judgment call at this fork that depends on weighing the
  specific case, not a simple yes/no rule — I'll build this as a coordinating agent that decides
  case by case and hands off work, the way a project lead would."
- **Mixed**: "The first part of your diagram runs entirely on its own; the second part needs your
  sign-off partway through — I'll build the first part as an automated script and the second as a
  guided checklist, with a clear handoff between them."
