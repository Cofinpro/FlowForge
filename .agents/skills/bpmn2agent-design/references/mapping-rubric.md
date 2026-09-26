# Mapping rubric: BPMN element → generated artifact

How `bpmn2agent-design` turns each element of the analyzed BPMN inventory into a `kind` in
`workflow-spec.yaml` (see `../assets/workflow-spec.schema.yaml`). Apply this per element, record the
result under `elements.<id>`, and surface every `not-generated`/`unresolved` decision to the user via
`AskUserQuestion` before writing it to the spec.

## The rubric

| BPMN construct | Generated as | Notes |
|---|---|---|
| Lane | Agent (`roles.<id>`) | One subagent per lane, named per `.agents/skills/new-agent/agent-template.md` (`{domain}-{role}`, kebab-case, no "-expert"). All elements in that lane become the agent's checklist items and/or its skills. |
| `userTask` / `manualTask` | Human checkpoint (`kind: human-checkpoint`) | Generated as an `AskUserQuestion` call inside the owning skill/agent — options + a recommendation, never a bare prompt. No file is generated for the task itself; it becomes a step in whatever skill/script precedes it. |
| `serviceTask` | Skill, or an agent checklist item — see decision below | |
| `scriptTask` | Script inside a skill (`scripts/*.mjs` or similar), `kind: script` | Deterministic, no LLM call. Lives under the skill **of the lane it's in**, not as a standalone skill, unless it's shared across lanes (then it's its own skill, same as a reusable `serviceTask`) — concretely: `generated/<workflow>/skills/<agentName>/scripts/<name>.mjs`, where `<agentName>` is that lane's own `roles.<id>.agentName` (`generate`'s "lane skill", step 3). `generated/<workflow>/skills/<workflow>/` (matching the workflow name itself, not any lane's `agentName`) is **reserved** for the skill-chain top-level skill (see the pattern row below) — never reuse it for a lane's scripts, even if the lane happens to be named the same as the workflow. |
| `businessRuleTask` / gateway condition | Hook or script — see decision below | |
| Gateway (any type), loop back-edge, multi-instance marker | Orchestrator logic (`kind: orchestrator`) | Never generated as a file of its own kind; it becomes control flow inside whichever pattern `pattern-rubric.md` selects (branch in a Workflow script, delegation logic in an orchestrator agent, or a hook's block/allow decision). Record it in `elements.<id>` anyway — the spec is the trace target even for elements that produce no standalone file. |
| `startEvent` / `endEvent` | Orchestrator logic (`kind: orchestrator`) if it does real routing work (e.g. a start event with a form, an end event a loop can short-circuit to); otherwise `kind: not-generated` with `reason: "Start/end event — structural marker only, no generated artifact."` | Same treatment as a gateway either way: never a file of its own. Every BPMN process has at least one of each, so don't leave this element type unmapped by omission. |
| Intermediate throw/catch event (link, none/signal used as a plain marker) | Orchestrator logic (`kind: orchestrator`), same as a gateway | Timer/message intermediate events are **unsupported in v1** (see below) — this row is only for the plain/link/signal kinds v1 already covers as control-flow markers. |
| `callActivity` / collapsed `subProcess` | Reusable skill, or a sub-workflow — see decision below | A collapsed `subProcess` that resolves to a reusable skill folds its own inner flow nodes into that same skill too — see "Inner elements of a skill-backed subProcess" below. |
| Data object / data object reference | Artifact contract (`artifacts.<id>`, `kind: artifact-contract` on the producing element) | Path pattern + frontmatter fields, not a generated file by itself — see `workflow-spec.schema.yaml`'s `artifact` definition. `producer` is normally one element id, but accepts an array when the diagram genuinely has more than one writer (e.g. a draft written by one element, confirmed/overwritten by another — both have a real `dataOutputAssociation`). |

### `serviceTask` → skill vs. agent-checklist item

Generate a **skill** when any of these hold:
- The BPMN itself names one (`sdlc:step skill="…"` or an equivalent explicit annotation/text
  annotation) — always honor an explicit author decision.
- The same procedure is reused from ≥2 elements (same task repeated in a loop body, called from
  multiple lanes, or referenced by more than one `callActivity`).
- The step needs bundled reference material to do its job well: a template for its output artifact,
  a rubric/checklist longer than a few lines, worked examples, or a script.
- The step's output is a distinct, independently-versioned artifact with its own frontmatter contract
  (see `artifacts.<id>`) rather than just an internal note the agent carries to the next step.

Otherwise, generate an **agent-checklist item**: a bullet in the owning agent's `## Checklist` /
domain-knowledge section, per `agent-template.md`. Use this when the step is a single, non-reused
piece of that role's own judgment with no separate reference material — the kind of thing a human in
that role would just know how to do, not look up.

When unsure, default to agent-checklist item — it's cheaper to promote a checklist bullet to a skill
later (once reuse or complexity actually shows up) than to prune an unused skill.

### `businessRuleTask` / gateway condition → hook vs. script

Generate a **Claude Code hook** only when the check must physically gate a *tool call* the agent is
about to make or has just made — i.e. enforcement has to live inside Claude Code's own tool-execution
loop, not inside a step the agent chooses to run. Relevant hook events, at a glance:

| Event | Fires | Fits when the BPMN rule... |
|---|---|---|
| `PreToolUse` | Before a matched tool call executes; can block or modify it | ...must stop a write/commit/deploy from happening at all if a condition fails (e.g. "no commit before the DoR gate passes"). |
| `PostToolUse` | After a matched tool call completes; can react or annotate | ...reacts to something a tool just did (e.g. log every file write, append a trace record after a script runs). |
| `Stop` | The main agent is about to stop responding | ...must force a validation pass before the agent is allowed to consider a task finished (e.g. "don't stop until the checklist artifact exists"). |
| `SubagentStop` | A delegated subagent is about to finish | ...same as `Stop`, scoped to one delegated skill/agent invocation rather than the whole session. |

Generate a **script** (inside the owning skill, `kind: script`) when the rule is instead a step the
workflow explicitly runs as part of its own control flow — a data check, a graph traversal, a
threshold comparison feeding a gateway decision — rather than something that must intercept a tool
call. Most `businessRuleTask`s map here; hooks are the exception, reserved for enforcement that would
otherwise depend on the agent remembering to self-police.

### `callActivity` / collapsed `subProcess` → reusable skill vs. sub-workflow

- **Reusable skill**: the called process is itself a short, mostly-linear sequence of tasks with at
  most simple internal branching, invoked from one or more places. Generate it once under
  `generated/<workflow>/skills/<name>/` and have every caller invoke it the same way.
- **Sub-workflow**: the called process has its own gateways, loops, or multi-instance structure rich
  enough that it needs orchestration logic of its own (see `pattern-rubric.md`). Generate it as a
  nested unit with its own pattern choice, recorded under the same `elements` map with its child
  elements nested by BPMN process/plane, not flattened into the parent.

If in doubt, look at what `pattern-rubric.md`'s signals compute for the called process in isolation —
if it would independently qualify for `workflow-script` or `orchestrator-agent`, treat it as a
sub-workflow; otherwise a skill.

#### Inner elements of a skill-backed subProcess/callActivity

Once a collapsed `subProcess`/`callActivity` resolves to **reusable skill** (not sub-workflow), its
own inner flow nodes — the elements on the drill-down plane, still individually inventoried by
`inventory.mjs` and still needing their own `elements.<id>` entry, per the pipeline's rule that
every BPMN element gets a spec entry whether or not it produces a file of its own — fold into that
same skill rather than becoming separate top-level artifacts. Generalizes the precedent the
skill-chain top-level skill already sets (spanning every element in the spec) to any subProcess
that becomes one skill:

- **Inner `serviceTask`/`userTask`/`businessRuleTask`-as-script-with-no-gate steps**: `kind: skill`
  (or `kind: human-checkpoint`, `kind: script` — whatever the ordinary rubric row above would give
  the element on its own), but `generatedPaths` points at the **container's own** `SKILL.md`, not a
  file of its own — same path the container element itself uses. The container's frontmatter
  `elements:` list grows to include every inner element folded this way (superset, per
  `bpmn2agent-verify`'s header-elements-superset-of-claims rule); the container's `## Procedure`
  narrates each inner step in BPMN order, exactly like the skill-chain top-level skill's step 5
  treatment of `kind: human-checkpoint`/`kind: orchestrator` elements.
- **Inner `scriptTask`**: `kind: script`, its own bundled file under the container skill's own
  directory — `generated/<workflow>/skills/<container-skill-name>/scripts/<name>.mjs` — same as any
  other script bundled inside a skill (the `skillRoots` allowance `bpmn2agent-verify` already
  grants to every file under a recorded `skills/<name>/` directory covers this without any special
  case).
- **Inner `startEvent`/`endEvent`**: `kind: not-generated`, `reason: "Start/end event of the
  collapsed '<container label>' subprocess — folded into the <skill name> skill; structural marker
  only, no separate artifact."` — same treatment as a top-level start/end event.
- **Inner gateways/loops**: `kind: orchestrator`, narrated inline in the container skill's
  `## Procedure`, same as a top-level gateway inside the skill-chain top-level skill.

This is what `bpmn2agent-verify` and `render-mapping.mjs` already handle correctly with no
special-casing (an inner element's `generatedPaths` entry is just another path under a recorded
`skills/<name>/` root, or the container's own path, claimed the same way any multi-element file
is) — don't invent a different representation (e.g. `kind: not-generated` for every inner step, or
a separate file per inner element) without updating both scripts to match.

## v1 supported / unsupported constructs

Supported (analyzed and mapped by this rubric):

- Tasks: `task`, `userTask`, `manualTask`, `serviceTask`, `scriptTask`, `businessRuleTask`
- Lanes
- Gateways: exclusive (XOR), parallel (AND), inclusive (OR)
- Loops (back-edges through an explicit merge gateway)
- Embedded (collapsed) `subProcess`
- `callActivity`
- Multi-instance markers
- Data objects / data object references
- Start / end events
- Error boundary events

**Unsupported in v1** — flag red (`kind: unresolved`) in the mapping view and propose a rewrite rather
than silently dropping them:

- Pools and message flows (cross-organization/cross-system choreography)
- Timer and message intermediate/start/boundary events
- Event subprocesses
- Compensation events/activities

An unsupported construct always gets `reason` explaining *why* it can't be generated yet and a
concrete rewrite suggestion (e.g. "model the timer as a loop-cap on the enclosing gate instead" or
"flatten the second pool into a lane if it represents a role, not an external system").

## Legend: mapping view colours

Used in `mapping/workflow-mapped.bpmn` (bpmn.io colour extension), `mapping/index.html`'s legend and
`mapping/report.md`. One colour per `kind` — lanes are not tinted; the grouping by role comes from the
diagram's own lanes. Every annotation also starts with the kind or status name, so colour is never
the only signal (exact values: the header comment of `bpmn2agent-generate/scripts/render-mapping.mjs`).

| Colour | Kind | Meaning |
|---|---|---|
| Blue | `agent-checklist` | A checklist item in the owning agent. |
| Green | `skill` | Its own generated skill. |
| Purple | `script` | A deterministic script inside a skill. |
| Orange | `hook` | A Claude Code hook. |
| Teal | `orchestrator` | Gateways, loop back-edges, multi-instance markers — no file of its own. |
| Amber | `human-checkpoint` | `userTask`/`manualTask`: a person decides here. |
| Brown | `artifact-contract` | A data object with a path/frontmatter contract. |
| **Grey** | `not-generated` | Deliberately not generated; the element's `reason` is shown in its annotation and on click. Not an error. |
| **Red** | `unresolved` | Unmapped or still an open question; blocks `bpmn2agent-verify`'s "no red in the map" check. |

## Worked mini example

A three-step approval flow: lane **Reviewer**, one `userTask` "Antrag genehmigen" (approve request),
one `serviceTask` "Risikobewertung erstellen" (produce risk assessment — reused later in a loop), one
`scriptTask` "Antragsnummer vergeben" (assign a request number), one `businessRuleTask` "Betrag >
Grenzwert?" gating whether the agent may write the approval record, one `exclusiveGateway` "Genehmigt?",
and a data object "Antrag" (request).

| Element | Rubric applied | `kind` | Result |
|---|---|---|---|
| Lane "Reviewer" | Lane → agent | — | `roles.reviewer` → agent `approval-reviewer` |
| "Antragsnummer vergeben" | `scriptTask` → script | `script` | `scripts/assign-request-number.mjs` inside a skill |
| "Risikobewertung erstellen" | `serviceTask`, reused, has its own rubric/template | `skill` | skill `risk-assessment/` with its own `references/` |
| "Betrag > Grenzwert?" | `businessRuleTask` gating a write (the approval record must not be written above the threshold without escalation) | `hook` | `PreToolUse` hook blocking the write tool until the threshold check passes |
| "Antrag genehmigen" | `userTask` → human checkpoint | `human-checkpoint` | `AskUserQuestion` step inside the `approval-reviewer` agent's flow |
| Gateway "Genehmigt?" | Gateway → orchestrator logic | `orchestrator` | A branch in whichever pattern `pattern-rubric.md` selects for this diagram (here: skill chain + hooks, since it's linear with one human gate — see that reference) |
| Data object "Antrag" | Data object → artifact contract | `artifact-contract` | `artifacts.antrag`: `pathPattern: "artifacts/antrag/{id}.md"`, `producer: ServiceTask_Risikobewertung`, `consumers: [UserTask_Genehmigen]` |
