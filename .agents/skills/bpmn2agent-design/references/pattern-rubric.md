# Pattern rubric: choosing the orchestration pattern

How `bpmn2agent-design` picks `pattern.chosen` in `workflow-spec.yaml` from the shape of the analyzed
diagram, and how it explains that choice to the business user who drew it. The choice is made once
per workflow (and, recursively, once per `callActivity`/`subProcess` that `mapping-rubric.md` decided
is a sub-workflow rather than a plain skill) — always propose it, never silently apply it; confirm via
`AskUserQuestion` with the rationale and the alternatives considered, both recorded in the spec.

Every pattern caps its loops at `elements.<id>.gate.maxLoops`. **Default: 3**, unless the BPMN or
interview gives another number; never leave it unset. At the cap the gate stops sending work back
and proceeds with a risk flag (`fail` becomes `pass-with-risk`).

Run state, one rule: skill chain uses the artifacts' own frontmatter; workflow-script uses the
Workflow journal only; orchestrator-agent and mixed have the orchestrator's own instructions
read/write `run.yaml` (position, loop counters, BPMN hash) and append `log/events.jsonl` — no helper
script.

- [Signals](#signals-to-compute-from-the-element-inventory)
- [Decision table](#decision-table)
- [Per-pattern detail](#per-pattern-detail)
- [Explaining the choice](#explaining-the-choice-to-a-non-technical-business-user)

## Signals to compute from the element inventory

Count these over the diagram (or sub-diagram) being decided:

| Signal | What it counts |
|---|---|
| `humanTaskCount` | `userTask` + `manualTask` elements |
| `parallelCount` | `parallelGateway` + `inclusiveGateway` elements |
| `multiInstanceCount` | Elements with a multi-instance marker |
| `loopCount` | Back-edges (loop merge → split pairs per `bpmn-authoring/references/modelling-rules.md`) |
| `judgementBranchCount` | `exclusiveGateway`s whose outgoing conditions require an LLM to weigh a case (e.g. "is this good enough?", "which of these applies?") rather than a deterministic threshold a script can evaluate |
| `attended` | `humanTaskCount > 0` — a human must be present at least once while it runs |
| `liveWriteCount` | Tasks in the phase that write into a `live` context store (`contextSources.*.writers` of `art: live`). Writes into `gedaechtnis` stores don't count. |
| `roleToolSpread` | Two or more lanes need different live-store tools (a lane reads a store another doesn't need, or only some lanes write). Needs `contextSources.*.tools` resolved first (`SKILL.md` step 3a). |

## Decision table

| Signal pattern | Pattern | Why |
|---|---|---|
| `attended`, low `parallelCount`/`multiInstanceCount`/`judgementBranchCount`, loops bounded by a simple pass/fail rubric | **Skill chain + hooks** | A human walks through it with the agent, pausing at defined points. |
| Not `attended`, `parallelCount` and/or `multiInstanceCount` > 0, deterministic branching (a script can evaluate every condition) | **Claude Code Workflow script** | Deterministic fan-out/fan-in with no human in the loop — what `agent()`/`parallel()`/`pipeline()` model. |
| `judgementBranchCount` > 0 with case-by-case weighing (not just "run N things and merge"), regardless of `attended` | **Orchestrator agent** (delegates via the `Agent` tool) | Something has to look at each case and decide what happens next. |
| Phases with genuinely different shapes (e.g. an unattended parallel research phase feeding a phase that needs human sign-off, or a judgement-heavy phase followed by a deterministic one) | **Mixed** | Compose phase by phase (see below). |

If two rows plausibly apply, prefer the earliest that fits. Choose `mixed` only when phases are
*structurally* different, not because the diagram is large.

Two context-store rules apply on top of the table:

- **`liveWriteCount > 0` rules out `workflow-script` for that phase.** The pattern has no human
  checkpoints, and a write into a live store needs a `userTask` before it on every path (the
  write-guard rule in `mapping-rubric.md`). Take the next fitting row, or `mixed` with the writing
  phase as `skill-chain-hooks`/`orchestrator-agent`. A phase with a live write and no `userTask`
  before it is a diagram defect, not a pattern question: route to `bpmn2agent-analyze` (change the
  `.bpmn`), never invent a checkpoint in the spec.
- **`roleToolSpread` is a signal for `orchestrator-agent`.** It is the only pattern where each role
  is its own agent with its own `tools:`. If the table picks another row, keep that row, say in the
  mapping plan that read access is not separated per role ("Lesezugriff nicht pro Rolle getrennt";
  the tools go into `permissions.allow`) and offer `orchestrator-agent` as the option that
  separates them; record it under `alternativesConsidered`.

## Per-pattern detail

### Skill chain + hooks

- **When**: linear or near-linear flow, one or more human checkpoints, gates are simple threshold
  rubrics, no unattended parallelism.
- **When not**: real fan-out/fan-in the human isn't present for, or branching that needs
  case-by-case judgment beyond a fixed rubric.
- **Generated**: one skill per `serviceTask`/reusable-procedure element (per `mapping-rubric.md`),
  invoked in sequence by the calling skill's instructions; hooks for any `businessRuleTask`/condition
  that must gate a tool call.
- **Human checkpoints**: `AskUserQuestion` calls inline in the skill sequence, exactly where the
  `userTask`/`manualTask` sits in the diagram.
- **Loop caps**: a counter the skill's instructions track against `elements.<id>.gate.maxLoops`; no
  separate orchestrator.
- **State/resume**: the artifacts are the state (`version`/`status` frontmatter). Re-running is
  idempotent: a skill checks whether its output artifact already exists at the expected version
  before redoing the work. No `run.yaml`.

### Claude Code Workflow script

- **When**: fully unattended, real parallel/multi-instance structure, deterministic branching.
- **When not**: any human checkpoint inside the flow, branching that needs judgment a script
  condition can't express, or any write into a live context store (`liveWriteCount > 0`).
- **Sanity check**: the three-of-five rule in
  `${CLAUDE_SKILL_DIR}/../agentic-workflow-kb/references/claude-code-workflows.md`. Workflow `agent()`
  subagents can't ask the user, so any attended step disqualifies that phase.
- **Generated**: one Workflow script, `.claude/workflows/<workflow>.workflow.mjs`: `agent()` for LLM
  steps, `parallel()`/`pipeline()` for the fan-out of gateways/multi-instance markers, plain JS for
  deterministic gateway conditions. **The script never runs automatically — neither the generator
  nor anything else invokes it; the generated `README.md` says the operator starts it deliberately,
  on demand.**
- **Human checkpoints**: none inside the script; if the diagram has any, choose `mixed`.
- **Loop caps**: a plain counter checked each iteration (`while (loopCount < maxLoops)`), matching
  `elements.<id>.gate.maxLoops`.
- **State/resume**: the Workflow journal (`resumeFromRunId` replays cached `agent()` results). No
  run-state scripts or sidecar files.

### Orchestrator agent

- **When**: branching needs a judgment call per case — not "run these N things" but "decide, looking
  at this case, what happens next".
- **When not**: the branching is a deterministic condition dressed up as a gateway (use Workflow
  script), or nothing needs delegation (use skill chain).
- **Generated**: one orchestrator agent, `generated/<workflow>/.claude/agents/<workflow>-orchestrator.md`,
  that owns the gateway decisions and delegates each branch to the matching generated agent via the
  `Agent` tool. Only the orchestrator calls `Agent` on other generated agents; other handoffs stay
  report-based.
- **Human checkpoints**: the orchestrator pauses and asks via `AskUserQuestion` before dispatching
  past a `userTask`/`manualTask`.
- **Loop caps**: counters in `run.yaml`; at `maxLoops` proceed with a risk flag.
- **State/resume**: `run.yaml` + `log/events.jsonl` (see top), updated at each delegation boundary; a
  fresh session resumes from `run.yaml`'s last completed step.

### Mixed

- **When**: distinct phases have structurally different shapes — e.g. an unattended parallel-research
  phase (Workflow script) feeding a phase that needs a human sign-off between two skills (skill
  chain), or a deterministic phase followed by a judgment-heavy one (orchestrator agent).
- **When not**: the whole diagram fits one pattern; re-check the decision table per phase first.
- **Live writes**: a phase with a live-store write is never the Workflow-script phase; its
  `userTask` and the write sit in the same phase.
- **Generated**: each phase per its own pattern; the phase boundary is the hand-off point (typically
  a human checkpoint or an orchestrator decision that starts the next phase). Record the split in
  `pattern.phases[]` (`[{name, pattern, elements: [...]}]`, one entry per phase in diagram order);
  `bpmn2agent-generate` step 7 reads it.
- **Human checkpoints / loop caps**: per the owning phase's pattern.
- **State/resume**: `run.yaml` + `log/events.jsonl` (see top) records the active phase; a
  Workflow-script phase resumes via its own journal. Log phase transitions as events so a resume can
  tell "mid-phase" from "between phases".

## Explaining the choice to a non-technical business user

Tie the explanation to the shape they drew, not to the pattern's name. Examples:

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
- **Live write forces a human step**: "Your diagram posts into Jira, so I'll build this so that you
  confirm first and nothing is written automatically — that rules out the fully automatic script."
- **Different access per role**: "The roles don't need the same access to your systems. As a guided
  checklist they all share one set of permissions; a coordinating agent could give each role only
  what it needs — I'd recommend that if the separation matters to you."
