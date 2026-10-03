---
name: bpmn-process-design
description: Designs a new process from what the user wants to build plus domain knowledge from Gemini notebooks (NotebookLM, via gemini-notebook-mcp), and draws it as an agent-ready BPMN 2.0 diagram in the lanecraft notation (lane = role, serviceTask = AI, userTask = human checkpoint, scriptTask = script, data object = handoff, data store = context source, capped loops) that the bpmn2agent pipeline turns into agents and skills without rework. Use for "model a process for X", "draw the BPMN for what I want to build", "design a workflow from my notebook", or when a user has a goal but no diagram yet. To edit an existing .bpmn use bpmn-authoring; to turn a finished diagram into agents use bpmn-to-agentic-workflow.
---

# Design an agent-ready BPMN process

Output: a validated `<workflow>.bpmn` (default: cwd) that `bpmn2agent-analyze` reads with no
findings, plus every notebook answer logged in `generated/<workflow>/knowledge/faq/`. Speak the
user's language in business terms; BPMN labels use it too. Every question goes through
`AskUserQuestion` with options and a recommendation.

## 1. Understand the goal

Establish goal, trigger, end states, available inputs, people involved, decisions a human must
own, and systems or files touched. Ask only for what's missing, at most four questions per call.
Propose a kebab-case workflow name and confirm it.

## 2. Pick the notebooks

```
ToolSearch: select:mcp__gemini-notebook-mcp__notebook_list,mcp__gemini-notebook-mcp__notebook_describe,mcp__gemini-notebook-mcp__notebook_get,mcp__gemini-notebook-mcp__notebook_query
```

Let the user pick from `notebook_list` by title (several allowed, or none); sanity-check each pick
with `notebook_describe`. Auth error → tell the user to run `nlm login`, ask whether to retry or go
on without. No notebook → offer WebSearch (cite title and URL; recommended unless the domain is
generic) or model knowledge.

## 3. Research the process

One question per `notebook_query` call, `new_conversation: true`, scoped to the goal:

- phases and steps in order, with inputs and outputs
- roles, and which decisions or approvals need a person
- quality gates or checklists, and what happens on failure (rework, escalation, abort)
- artifacts handed between roles
- what typically goes wrong, and where a check would catch it

Follow up per phase while an answer stays vague. Log every answer per "FAQ log" in
`${CLAUDE_SKILL_DIR}/../bpmn2agent-knowledge/references/notebook-extraction.md`, with
`--faq generated/<workflow>/knowledge/faq`. Read oversized answers' `.answer` in `jq` chunks.
Agentic-design questions (lane cut, checkpoints, loop caps) go to
`${CLAUDE_SKILL_DIR}/../agentic-workflow-kb/` first (`references/process-to-agents.md`,
`references/human-in-the-loop.md`).

## 4. Design the process

Combine the notebook answers with your own knowledge. Name conflicts and gaps in the outline; mark
model-only steps `⚠ unverified`.

| Draw | when the step … | pipeline makes |
|---|---|---|
| Lane | is a role (one function or knowledge area) | role; own agent only under the orchestrator-agent pattern, else a perspective in the skills |
| `serviceTask` | reads, writes or judges | skill or checklist item (AI) |
| `userTask` | is a human decision, approval or input | checkpoint: Claude proposes, the human chooses |
| `scriptTask` | is purely mechanical; same input, same result | script in the lane's skill |
| `businessRuleTask` | checks a rule (checklist, threshold) | script, skill text, or a hook if it must block an action |
| exclusive / parallel gateway | branches, joins or loops | orchestrator logic |
| collapsed `subProcess` | is a phase with its own sequence | reusable skill or sub-workflow |
| data object | is a result a later step needs | artifact contract |
| data store `Art: wissen` | holds reference knowledge a step must know | cited reference in the reading skill, loaded at generation |
| data store `Art: live` | holds data read or changed at run time | tool allowlist + `## Kontextquellen` in the skill |
| data store `Art: gedächtnis` | keeps learnings across runs | curated memory file with a size cap |
| process input / output | is what a run needs to start / finally delivers | argument contract with required fields / result contract |

- 2–6 lanes, one per role, never one per task. A role that only decides is a human lane of
  `userTask`s.
- No untyped `task`. Unsure → `serviceTask`; `scriptTask` only when nothing needs judgement.
- A `userTask` before every irreversible or outward-facing action (commit, send, publish, delete)
  and wherever the goal needs sign-off; none on routine steps.
- Names become verbatim skill text: tasks verb + object, forking gateways a question with
  answer-labelled flows and one `default`, end events the resulting state.
- Every loop re-enters through a merge gateway, carries its cap on the loop-back label
  (`Nein (max. 3×)`, default 3), and has a way out (escalation `userTask` or end).
- Results cross lanes as data objects. Every task gets
  `<bpmn:documentation>Input: … Output: … Quelle: <FAQ entry id | URL | ⚠ unverified></bpmn:documentation>`.
- A data store is a business data set named in business terms ("Jira-Tickets Projekt LANE"), not a
  system; several stores may share one source. Its documentation carries `Art: wissen | live |
  gedächtnis` and `Ort: notebook:<Titel> | mcp:<Server> | cli:<Befehl> | <URL> | datei:<Pfad> |
  websearch`. Notebooks picked in step 2 are candidates for `wissen` stores.
- Valid pairs: `wissen` with `notebook:`, URL, `datei:`, `websearch`, or `mcp:` (a snapshot, only if
  the server is connected); `live` with `mcp:`, `cli:`, `notebook:`, URL or `datei:`; `gedächtnis`
  with `datei:` only (default `.claude/memory/<workflow>/<store>.md`). Anything else: pick another
  Art or Ort.
- Read or write follows only the arrow: store → task reads, task → store writes. No `Zugriff:` line.
- A `userTask` precedes every write to a `live` store, on every path.
- A `gedächtnis` store needs a `serviceTask` that writes it and a reader; writing needs no approval.
- A phase over ~8 steps becomes a collapsed `subProcess` with its own lanes.
- One pool; no message flows, timer or message events, event sub-processes or compensation
  (rewrites: `${CLAUDE_SKILL_DIR}/../bpmn2agent-analyze/references/unsupported.md`). Error
  boundary events are fine.

## 5. Confirm the outline

For each step ask: "What must this step know, and where does it live?" Every answer is a store
(Art, Ort), a data object from an earlier step, or the process input; nothing means the step
needs no context. Does it write anywhere? Then name the store and the `userTask` before it.

Before drawing, show: lanes with what each becomes, then per phase the steps with type
(AI / human / script / rule) and source, gateways with answers, loops with caps, data objects. Add
a store table (name, Art, Ort, readers, writers) and the process input with its required fields
and the result the run delivers. Ask: draw as is / change what / ask the notebook more. Repeat until
confirmed; never draw an unconfirmed design.

## 6. Draw

Follow `${CLAUDE_SKILL_DIR}/../bpmn-authoring/SKILL.md` steps 2–7, starting from its
`assets/skeleton.bpmn`. Use readable ids (`Task_FeedbackFormulieren`, `Gw_InvestErfuellt`). Draw
stores and the process input/output with its data store and `ioSpecification` conventions
(`${CLAUDE_SKILL_DIR}/../bpmn-authoring/references/xml-and-di.md` and `layout.md`); a
convention-based input is a data object no task produces.

## 7. Check it's agent-ready

Put `inventory.json` in a scratch directory, not next to the diagram:

```bash
C="${BPMN_TOOLS_CACHE:-$HOME/.cache/bpmn-authoring-tools}"
${CLAUDE_SKILL_DIR}/../bpmn-authoring/scripts/validate.sh <workflow>.bpmn
node ${CLAUDE_SKILL_DIR}/../bpmn2agent-analyze/scripts/inventory.mjs "$C" <workflow>.bpmn > <scratch>/inventory.json
jq '.findings' <scratch>/inventory.json                                        # must be []
jq '[.flowNodes[] | select(.bpmnType=="bpmn:Task") | .id]' <scratch>/inventory.json   # must be []
node ${CLAUDE_SKILL_DIR}/../bpmn-authoring/scripts/render.mjs "$C" <workflow>.bpmn <outDir>
```

Fix the `.bpmn` and re-run until all pass and the PNGs show no overlaps.

## 8. Hand off

Report the file path, PNG, lanes with their agent role, human checkpoints, open points and
`⚠ unverified` steps. Offer to run `bpmn-to-agentic-workflow` next.

Worked example: `examples/user-story-refinement/` (four lanes, `serviceTask`/`userTask`/
`businessRuleTask`, `Input/Output` on every task, notebook answer in `notebook-faq/`).
