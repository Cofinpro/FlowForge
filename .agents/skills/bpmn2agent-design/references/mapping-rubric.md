# Mapping rubric: BPMN element → generated artifact

How `bpmn2agent-design` turns each element of the analyzed BPMN inventory into a `kind` in
`workflow-spec.yaml` (see `../assets/workflow-spec.schema.yaml`). Apply this per element, record the
result under `elements.<id>`, and list every `not-generated`/`unresolved` decision in the step-7
mapping plan.

- [The rubric](#the-rubric)
- [serviceTask → skill vs. agent-checklist item](#servicetask--skill-vs-agent-checklist-item)
- [businessRuleTask / gateway condition → hook vs. script](#businessruletask--gateway-condition--hook-vs-script)
- [callActivity / subProcess → reusable skill vs. sub-workflow](#callactivity--collapsed-subprocess--reusable-skill-vs-sub-workflow)
- [Data stores → context sources](#data-stores--context-sources)
- [v1 supported / unsupported constructs](#v1-supported--unsupported-constructs)
- [Legend: mapping view colours](#legend-mapping-view-colours)
- [Worked mini example](#worked-mini-example)

## The rubric

| BPMN construct | Generated as | Notes |
|---|---|---|
| Lane | Role (`roles.<id>`) | A subagent file only under `orchestrator-agent` (or a mixed phase using it); otherwise the lane's steps live in the chain skill and lane skill. `agentName` per agent-authoring's naming rule (`{domain}-{role}`, kebab-case, no "-expert"). The lane's elements become checklist items and/or skills. |
| `userTask` / `manualTask` | Human checkpoint (`kind: human-checkpoint`) | An `AskUserQuestion` call — options + a recommendation, never a bare prompt — as a step in the owning skill/agent. No file of its own. |
| `serviceTask` | Skill, or an agent checklist item — see decision below | |
| `scriptTask` | Script inside a skill, `kind: script` | Deterministic, no LLM call. Lives under the skill **of its lane** — `generated/<workflow>/.claude/skills/<agentName>/scripts/<name>.mjs`, `<agentName>` = that lane's `roles.<id>.agentName` (generate's "lane skill", step 3) — unless shared across lanes (then its own skill, like a reusable `serviceTask`). `.claude/skills/<workflow>/` (the workflow name) is **reserved** for the skill-chain top-level skill; never use it for a lane's scripts, even if the lane has the same name. |
| `businessRuleTask` / gateway condition | Hook or script — see decision below | |
| Gateway (any type), loop back-edge, multi-instance marker | Orchestrator logic (`kind: orchestrator`) | No file of its own; control flow inside the pattern `pattern-rubric.md` selects (branch in a Workflow script, delegation logic in an orchestrator agent, or a hook's block/allow decision). Still record it in `elements.<id>`. |
| `startEvent` / `endEvent` | `kind: orchestrator` if it does real routing work (e.g. a start event with a form, an end event a loop can short-circuit to); otherwise `kind: not-generated` with `reason: "Start/end event — structural marker only, no generated artifact."` | Never a file of its own. Don't leave these unmapped by omission. |
| Intermediate throw/catch event (link, none/signal used as a plain marker) | `kind: orchestrator`, same as a gateway | Timer/message intermediate events are **unsupported in v1** (see below). |
| `callActivity` / collapsed `subProcess` | Reusable skill, or a sub-workflow — see decision below | A skill-backed one folds its inner flow nodes into the same skill. |
| Data object / data object reference | Artifact contract (`artifacts.<id>`, `kind: artifact-contract` on the producing element) | Path pattern + frontmatter fields, no generated file (see the schema's `artifact` definition). `producer` is one element id, or an array when the diagram has more than one real writer (`dataOutputAssociation`). |
| Data store reference, `Art: wissen` | `contextSources.<id>`, `kind: context-source` | Loaded at generation time into `knowledge/<taskId>.md` for each reading task, then the task skill's `references/`. No file of its own. |
| Data store reference, `Art: live` | `contextSources.<id>`, `kind: context-source` | Read/written at run time: resolved tool lists (see below), a `## Kontextquellen` section in each reading task's skill, and for writes a PreToolUse `ask` hook. |
| Data store reference, `Art: gedächtnis` | `contextSources.<id>`, `kind: context-source`, `memory` | A curated memory file plus a line-cap hook. Needs at least one writing `serviceTask` and one reader. |
| Process-wide `dataInput` / `dataOutput`, or a data object nobody produces / nobody reads | `workflowIO.input` / `.output`, `kind: workflow-input` / `workflow-output` on the element | Both also get an `artifacts.<id>` contract. The input's required fields become the orchestrator's `argument-hint`; the output is the contract for the end result. |

### `serviceTask` → skill vs. agent-checklist item

Generate a **skill** when any of these hold:
- The BPMN names one (`sdlc:step skill="…"` or an equivalent annotation) — always honor it.
- The same procedure is reused from ≥2 elements (repeated in a loop body, called from multiple
  lanes, or referenced by more than one `callActivity`).
- The step needs bundled reference material: a template for its output artifact, a rubric/checklist
  longer than a few lines, worked examples, or a script.
- The step's output is a distinct, independently-versioned artifact with its own frontmatter contract
  (`artifacts.<id>`), not an internal note carried to the next step.

Otherwise generate an **agent-checklist item**: a bullet in the owning agent's `## Checklist` /
domain-knowledge section — a single, non-reused piece of that role's own judgment with no separate
reference material. When unsure, default to agent-checklist item.

### `businessRuleTask` / gateway condition → hook vs. script

Generate a **Claude Code hook** only when the check must physically gate a *tool call* the agent is
about to make or has just made — enforcement inside Claude Code's tool-execution loop, not a step the
agent chooses to run:

| Event | Fires | Fits when the BPMN rule... |
|---|---|---|
| `PreToolUse` | Before a matched tool call executes; can block or modify it | ...must stop a write/commit/deploy if a condition fails (e.g. "no commit before the DoR gate passes"). |
| `PostToolUse` | After a matched tool call completes; can react or annotate | ...reacts to something a tool just did (e.g. log every file write, append a trace record after a script runs). |
| `Stop` | The main agent is about to stop responding | ...must force a validation pass before the task counts as finished (e.g. "don't stop until the checklist artifact exists"). |
| `SubagentStop` | A delegated subagent is about to finish | ...same as `Stop`, scoped to one delegated skill/agent invocation. |

Otherwise the rule is a step the workflow runs itself. Generate a **script** (inside the owning
skill, `kind: script`) only when the check is purely mechanical on structured input — a count, a
threshold, a required field, a graph traversal — so the same input always gives the same answer. A
rule that needs reading and judgment (an INVEST or Definition-of-Ready checklist, "is this consistent
with the Fachkonzept?") is **not** a script: make it a `skill` with the checklist under `references/`
when it is long or reused, else an `agent-checklist` item.

Keep scripts few: one exists only for a `scriptTask`, a mechanical `businessRuleTask` or a `hook`,
never as a helper; when in doubt, choose skill text. The file rules (built-ins only, no packages)
are in `bpmn2agent-generate` step 4.

### `callActivity` / collapsed `subProcess` → reusable skill vs. sub-workflow

- **Reusable skill**: the called process is a short, mostly-linear sequence with at most simple
  internal branching, invoked from one or more places. Generate it once under
  `generated/<workflow>/.claude/skills/<name>/`; every caller invokes it the same way.
- **Sub-workflow**: the called process has gateways, loops or multi-instance structure that need
  orchestration of their own. Generate it as a nested unit with its own pattern choice, its child
  elements nested by BPMN process/plane under the same `elements` map, not flattened.

If in doubt, compute `pattern-rubric.md`'s signals for the called process alone: if it would qualify
for `workflow-script` or `orchestrator-agent`, it's a sub-workflow; otherwise a skill.

#### Inner elements of a skill-backed subProcess/callActivity

A subprocess resolved to **reusable skill** keeps an `elements.<id>` entry for every inner flow node
on its drill-down plane, but they fold into the container skill instead of becoming top-level
artifacts:

- **Inner `serviceTask`/`userTask`/`businessRuleTask` (no gate)**: the `kind` the ordinary rubric
  would give it (`skill`, `human-checkpoint`, `script`), but `generatedPaths` points at the
  **container's own** `SKILL.md`. The container's frontmatter `elements:` list includes every folded
  inner element, and its `## Procedure` narrates each inner step in BPMN order.
- **Inner `scriptTask`**: `kind: script`, its own file at
  `generated/<workflow>/.claude/skills/<container-skill-name>/scripts/<name>.mjs`.
- **Inner `startEvent`/`endEvent`**: `kind: not-generated`, `reason: "Start/end event of the
  collapsed '<container label>' subprocess — folded into the <skill name> skill; structural marker
  only, no separate artifact."`
- **Inner gateways/loops**: `kind: orchestrator`, narrated inline in the container's `## Procedure`.

`bpmn2agent-verify` and `render-mapping.mjs` handle exactly this representation; don't invent another
(e.g. `not-generated` for every inner step, or a file per inner element).

## Data stores → context sources

A `dataStoreReference` is one business data set (e.g. "Jira-Tickets Projekt LANE"), not a system.
Its documentation carries `Art:` and `Quelle:`; reading or writing comes only from the arrow
direction (store → task = read, task → store = write). A missing line or a combination not in the
matrix is a question for the business user, never a guess.

| Art | Allowed `Quelle:` | Loaded | Becomes |
|---|---|---|---|
| `wissen` | `notebook:`, URL, `datei:`, `websearch` | at generation | `knowledge/<taskId>.md` → skill `references/` |
| `wissen` | `mcp:` | at generation (snapshot), only if the server is connected | same |
| `live` | `mcp:`, `cli:` | at run time | tool allowlist + `## Kontextquellen` in the skill |
| `live` | `notebook:` | at run time, treated as `mcp:gemini-notebook-mcp` | same |
| `live` | URL | at run time | `WebFetch` |
| `live` | `datei:` | at run time | `Read` |
| `gedächtnis` | `datei:` (default `.claude/memory/<workflow>/<store>.md`) | read at run start, written at the end | curated file + line-cap hook |

Anything else (e.g. `live` + `websearch`, `gedächtnis` + `mcp:`) is invalid.

### Live stores: tools and placement

- **Resolve the tools.** For `mcp:`, fetch the server's tool list with ToolSearch (`mcp__<server>__`)
  and sort by name: `get/list/search/read/fetch/view` read; `create/update/delete/add/post/edit/transition/push`
  write. A server's `readOnlyHint` wins over the name. **Unclear counts as write.** `cli:` becomes
  `Bash(<cmd> <subcmd>:*)` patterns, same heuristic on the subcommands. The user confirms the list in
  the mapping plan. Server not connected → `tools: unresolved` (verify warns, generate emits no tools,
  never a wildcard).
- **Place them.** Where lanes are agents (`orchestrator-agent`), the needed read tools go into that
  lane agent's `tools:`, least privilege per role. Otherwise they go into `.claude/settings.json` →
  `permissions.allow` (union of all read tools) and the plan says openly "Lesezugriff nicht pro Rolle
  getrennt". **If the roles need different privileges, that is a signal for `orchestrator-agent`**
  (see `pattern-rubric.md`).

### Writing into a live store

A write needs a `userTask` before it on every path; verify errors otherwise. A phase that writes into
a live store is **never `workflow-script`**: that pattern has no human checkpoints. A PreToolUse hook
on the write tools (`permissionDecision: "ask"`) backs the `userTask` up. Writes to a `gedächtnis`
store need no approval.

## v1 supported / unsupported constructs

Supported:

- Tasks: `task`, `userTask`, `manualTask`, `serviceTask`, `scriptTask`, `businessRuleTask`
- Lanes
- Gateways: exclusive (XOR), parallel (AND), inclusive (OR)
- Loops (back-edges through an explicit merge gateway)
- Embedded (collapsed) `subProcess`
- `callActivity`
- Multi-instance markers
- Data objects / data object references
- Data store references (`Art: wissen | live | gedächtnis`) and process-wide data input/output
- Start / end events
- Error boundary events

**Unsupported in v1** — flag red (`kind: unresolved`) and propose a rewrite, never drop silently:

- Pools and message flows (cross-organization/cross-system choreography)
- Timer and message intermediate/start/boundary events
- Event subprocesses
- Compensation events/activities

Its `reason` says *why* it can't be generated yet and gives a concrete rewrite (e.g. "model the timer
as a loop-cap on the enclosing gate instead" or "flatten the second pool into a lane if it represents
a role, not an external system").

## Legend: mapping view colours

Used in `mapping/workflow-mapped.bpmn` (bpmn.io colour extension), `mapping/index.html`'s legend and
`mapping/report.md`. One colour per `kind`; lanes are not tinted. Every annotation also starts with
the kind or status name, so colour is never the only signal (exact values: the header comment of
`bpmn2agent-generate/scripts/render-mapping.mjs`).

| Colour | Kind | Meaning |
|---|---|---|
| Blue | `agent-checklist` | A checklist item in the owning agent. |
| Green | `skill` | Its own generated skill. |
| Purple | `script` | A deterministic script inside a skill. |
| Orange | `hook` | A Claude Code hook. |
| Teal | `orchestrator` | Gateways, loop back-edges, multi-instance markers — no file of its own. |
| Amber | `human-checkpoint` | `userTask`/`manualTask`: a person decides here. |
| Brown | `artifact-contract` | A data object with a path/frontmatter contract. |
| Turquoise | `context-source`, `workflow-input`, `workflow-output` | A data store (knowledge, live system, memory) or the process-wide input/output; no file of its own. A greener shade than the `orchestrator` teal, so the two stay apart; the annotation names the Art (exact values: `render-mapping.mjs`, set in generate). |
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
| Lane "Reviewer" | Lane → role | — | `roles.reviewer`, `agentName: approval-reviewer` (lane skill; no agent file under skill chain) |
| "Antragsnummer vergeben" | `scriptTask` → script | `script` | `.claude/skills/approval-reviewer/scripts/assign-request-number.mjs` (built-ins only) |
| "Risikobewertung erstellen" | `serviceTask`, reused, has its own rubric/template | `skill` | skill `risk-assessment/` with its own `references/` |
| "Betrag > Grenzwert?" | `businessRuleTask` gating a write (the approval record must not be written above the threshold without escalation) | `hook` | `.claude/hooks/approval-threshold-guard.mjs`, a `PreToolUse` hook registered in `.claude/settings.json`, blocking the write tool until the threshold check passes |
| "Antrag genehmigen" | `userTask` → human checkpoint | `human-checkpoint` | `AskUserQuestion` step inside the chain skill |
| Gateway "Genehmigt?" | Gateway → orchestrator logic | `orchestrator` | A branch in whichever pattern `pattern-rubric.md` selects (here: skill chain + hooks — linear with one human gate) |
| Data object "Antrag" | Data object → artifact contract | `artifact-contract` | `artifacts.antrag`: `pathPattern: "artifacts/antrag/{id}.md"`, `producer: ServiceTask_Risikobewertung`, `consumers: [UserTask_Genehmigen]` |
