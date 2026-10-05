---
name: flowforge-generate
description: Writes a confirmed workflow-spec.yaml out as installable Claude Code files (agents, skills, hooks, scripts, one orchestration file) under generated/<workflow>/.claude/, plus README and mapping report/view. Use after flowforge-design confirmed the spec, or when verify routes a generation defect back.
bpmn:
  file: docs/planning/flowforge-run.bpmn
  elements:
    - Gw_Merge_Generate
    - SubProcess_Generate
    - SubProcess_Generate_Start
    - SubProcess_Generate_S1
    - SubProcess_Generate_S2
    - SubProcess_Generate_S3
    - SubProcess_Generate_End
---

# BPMN → Agent Generation

Input: the **confirmed** `generated/<workflow>/workflow-spec.yaml`. Materialize only what the spec
decided; never make a mapping or pattern call (that is `flowforge-design`'s job). Write only inside
`generated/<workflow>/`, never into a real `.agents/` or `.claude/`; the user copies
`generated/<workflow>/.claude/` with the command the generated `README.md` gives. Ask every question
via `AskUserQuestion` with options + a recommendation, in the user's language.

For a large roster, parallel `Agent` calls may write per-file content, each given the spec path, its
`generatedPaths` entry and its template; README, report and the orchestration file stay in the main
thread.

## Output layout

With `meta.outputLayout: claude-dir` (every new spec):

```text
generated/<workflow>/
  .claude/                              ← the whole installable payload, copied as-is
    agents/<name>.md
    skills/<name>/SKILL.md              (+ references/, assets/, scripts/ only where design put a script)
    hooks/<name>.mjs                    (kind: hook, plus <workflow>-write-guard / -memory-cap, step 6a)
    hooks/<workflow>-cost-ledger.mjs    (always, step 6b) + <workflow>-cost-map.json
    workflows/<workflow>.workflow.mjs   (workflow-script pattern only)
    settings.json                       (only with hooks or read-tool permissions: step 6)
  (memory files and `.claude/runs/<workflow>/ledger.jsonl` are not generated: they appear in the user's
   project at run time)
  README.md                             ← install + what was generated (meta.language)
  workflow-spec.yaml  knowledge/  mapping/   ← review material, never copied
```

Address files by their post-copy path: `"$CLAUDE_PROJECT_DIR"/.claude/hooks/<name>.mjs` in
`settings.json`, `${CLAUDE_SKILL_DIR}/scripts/<x>.mjs` inside a `SKILL.md`. Never
`${CLAUDE_PLUGIN_ROOT}`, never a path into `generated/`.

A spec without `outputLayout` uses the **legacy** layout (the dark-factory example): same steps, but
`skills/`, `agents/` and `<workflow>.workflow.mjs` sit directly under `generated/<workflow>/`, and
each hook gets a `<name>.hook.settings.json` snippet (from the settings template's `hooks` block)
next to `<name>.hook.mjs` instead of the shared `settings.json`. Don't convert a legacy spec without
asking.

## 1. Read and sanity-check the spec

- No `workflow-spec.yaml` → **stop**; tell the user to run `flowforge-analyze` → `flowforge-design`.
- Not confirmed (a `workflow-spec.draft.yaml` still exists, or every element is still
  `kind: unresolved` because design never ran) → **stop**, say so, route to `flowforge-design`.
- Validate: run
  `node ${CLAUDE_SKILL_DIR}/../flowforge-verify/scripts/verify.mjs "$cacheDir" generated/<workflow>`
  and read only its spec-schema section (other categories may fail this early). Schema errors →
  **stop**; design didn't finish its step 8.
- `pattern.chosen` unset → **stop**; design hasn't confirmed a pattern.
- Single elements still at `kind: unresolved` (deferred by the user) are allowed: generate everything
  else and let them show red in the mapping report. `flowforge-verify` gates acceptance.

## 2. The frontmatter/header convention (used by every step below)

Every file written carries `bpmn: {file: <repo-relative source .bpmn path>, elements: [<elementId>, ...]}`
— the ids it was generated from (several for a file spanning several elements):

- **`SKILL.md`, agent `.md`**: `bpmn:` as a top-level frontmatter key next to `name`/`description`:
  ```yaml
  bpmn:
    file: docs/planning/approval-flow.bpmn
    elements: [S1_Nummer]
  ```
- **`README.md`, `mapping/report.md`**: a frontmatter block with just `bpmn:`.
- **`.mjs`** (scripts, hooks, Workflow script): `// bpmn: ` + one-line JSON on line 1, or line 2 after
  a shebang. In the Workflow script it goes before `export const meta`.
  ```js
  // bpmn: {"file":"docs/planning/approval-flow.bpmn","elements":["S1_Nummer"]}
  ```
- **`.claude/settings.json`**: no header (JSON, copied into the user's project); traceability runs
  through the hook scripts it registers.
- **Context hooks** (step 6a): `elements` = the `StoreRef_…` ids of the stores they guard.

Quote BPMN labels **verbatim** everywhere. Everything else is English, except `README.md`, which is
in `meta.language`.

## 3. Plan the file set per role (lane)

Before writing, decide per `roles.<id>` what to materialize from its elements
(`elements.<id>.lane == roleId`). Paths are for the claude-dir layout.

- **Lane skill** (`.claude/skills/<agentName>/`): whenever the lane has any `kind: script` element.
  Every such script lives here (at its own `generatedPaths` entry), wrapped in a minimal `SKILL.md`
  (step 5). A lane whose only file-producing elements are scripts gets nothing else (no agent, no
  chain file); the top-level orchestration file (step 7) invokes it.
- **Specialist agent** (`.claude/agents/<agentName>.md`): **only** when `pattern.chosen` is
  `orchestrator-agent` (or a `mixed` phase using it) **and** the lane has a `human-checkpoint`,
  `orchestrator` or `agent-checklist` element: the roster the orchestrator dispatches via `Agent`.
  Never for `skill-chain-hooks` or `workflow-script`; there the lane's logic lives inline in the
  step-7 file. Its `tools:` line comes only from `roles.<lane>.tools` (omitted when unset).
- **Reusable skill** (`.claude/skills/<name>/`, one per `kind: skill` element, or one shared dir
  when the rubric grouped several): for every pattern, at exactly the element's `generatedPaths`. A
  skill-backed collapsed `subProcess`/`callActivity` folds its inner elements into this one skill as
  `${CLAUDE_SKILL_DIR}/../flowforge-design/references/mapping-rubric.md` §"Inner elements" decided
  (inner `scriptTask` → `scripts/<inner-name>.mjs` inside it); no separate file per inner element.

Every path must equal an existing `elements.<id>.generatedPaths` entry; never invent one. Exceptions:
the one top-level orchestration file from step 7 (its path goes in the mapping report's pattern
section) and the two context hooks from step 6a (listed in the report's "Context hooks" table).

## 4. Materialize scripts (`kind: script`)

For each, write its `generatedPaths` file from `assets/templates/script-template.mjs`: header (step
2), then the deterministic rule derived from `label`, `elements.<id>.condition` and any copied
knowledge note. Don't second-guess the `kind` design chose.

Every script and hook is one self-contained file using Node built-ins only: no npm imports, no
`lib/`, no `package.json`, no install step, JSON rather than YAML for structured input. Write no
script that isn't some element's `generatedPaths` entry (no run-state, commit, trace or loader
helpers; that bookkeeping belongs in skill text). A rule that seems to need a package or helper
isn't mechanical: send it back to `flowforge-design` as a skill.

## 5. Materialize skills (`kind: skill`, lane skills, and the skill-chain's top-level skill)

Use `assets/templates/skill-template.md` for all three, filled per its authoring notes and
`${CLAUDE_SKILL_DIR}/../skill-authoring/SKILL.md`'s checklist. Eval scenarios come from the diagram
(happy path through the element, each outgoing gateway branch it feeds, the loop hitting
`gate.maxLoops`); list them as open items in the generated README.

- **Reusable skill**: frontmatter `elements` = the `kind: skill` id(s); `## Procedure` from the
  element's inputs/outputs/knowledge/gate.
- **Lane skill**: `elements` = every `kind: script` id in the lane.
- **Skill-chain top-level skill** (`skill-chain-hooks` only): `.claude/skills/<workflow>/SKILL.md`,
  `elements` = **every** element in the spec, description names it the entry point ("Runs the
  {{workflow}} workflow end to end — invoke this to start it"). `## Procedure` walks the whole flow
  in BPMN order across lanes:
  - `script`/`skill` element → "invoke `<path/skill name>` with `<inputs>`";
  - `human-checkpoint` → inline `AskUserQuestion` (options + recommendation), label verbatim, gated by
    `gate.criteria`;
  - `orchestrator` (gateway / loop back-edge) → inline branch/loop instructions with a counter
    against `gate.maxLoops`; at the cap, proceed with an explicit "risk: loop cap reached" note;
  - `hook` → narrate that the gated tool call exists and what the hook does (it fires on its own).

**Context sources in the text.** A step in some `contextSources.<id>.readers` or `.writers` gets a
`## Kontextquellen` section in the file that owns the step (skill, lane skill, specialist agent, or
chain skill / orchestrator), one bullet per store, store name verbatim; wording per Art is in
`assets/templates/skill-template.md`. Per store: what this step needs from it, and the tool from
`contextSources.<id>.tools` (read tools for readers; write tools for writers, marked "nur nach
Freigabe" and naming the `userTask` before the write; `unresolved` → no tool, say so). `wissen`
stores point at the task's `references/domain-knowledge.md` section. A `gedaechtnis` store: readers
load the memory file first (missing or empty is fine); the writer integrates new insights into the
fixed sections *Bewährt*, *Vermeiden*, *Offene Muster* instead of appending, and keeps the file
within `memory.maxLines`.

**Per-task knowledge.** A task with its own `knowledge/<taskId>.md` (a reader of a `wissen` store)
does not get that content merged into a skill's `references/domain-knowledge.md` (each file numbers
its footnotes from 1). Once the skills exist, run
`node ${CLAUDE_SKILL_DIR}/scripts/install-knowledge.mjs "$cacheDir" generated/<workflow>`: it
installs each file as `references/<taskId>.md` in the skill that owns the task (the top-level skill
for inline checkpoints), keeps the footnote sources, drops the verbatim quotes and FAQ ids (they stay
in `knowledge/`), fixes the pointers between files, adds a contents line to long files, and writes
the owners' `## Kontextquellen` sections for `wissen` stores. Re-run it after any change to
`knowledge/`; it overwrites its own output.

**Process input and output.** With `workflowIO.input`, the top-level skill gets `argument-hint`
(one `[field]` per `required` entry, the whole value one quoted string: `argument-hint: "[a] [b]"`)
and an `## Input` section that asks for a missing required field via `AskUserQuestion` before step 1.
With `workflowIO.output`, its last step names the end result's contract (`artifacts.<output>`). The
orchestrator agent and Workflow script do the same in step 7.

Agent files (steps 3 and 7): apply `${CLAUDE_SKILL_DIR}/../agent-authoring/SKILL.md`'s "Writing an
agent"; the template's checklist, `bpmn:` frontmatter and reporting block already cover prompt
sections and report format. Add `tools`/`model` only where design decided them.

## 6. Materialize hooks (`kind: hook`)

Write each hook script at its `generatedPaths` (`.claude/hooks/<name>.mjs`) from
`assets/templates/hook-script-template.mjs`: header (step 2), the event from `mapping-rubric.md`'s
event table (`PreToolUse`/`PostToolUse`/`Stop`/`SubagentStop`), the gate condition from
`condition`/`gate.criteria`.

Then write **one** `.claude/settings.json` from `assets/templates/settings-template.json`:

- `hooks`: one entry per hook (step 6a's two included) under `hooks.<Event>`, `matcher` for tool
  events, `"command": "node \"$CLAUDE_PROJECT_DIR\"/.claude/hooks/<name>.mjs"`.
- `permissions.allow`: the union of `contextSources.*.tools.read` of live stores whose readers are
  in lanes **without** a generated agent (lanes with one get theirs through `tools:`). Never a write
  tool, never a wildcard, nothing for `tools: unresolved`. No such store → no `permissions` key.

Nothing else (no model, env), so it is safe to merge by its `hooks` and `permissions.allow` keys.
Neither hooks nor permissions → no `settings.json`.

## 6a. Materialize the context hooks

Only for stores in `contextSources`. Each hook is one file per workflow, header per step 2 with the
`StoreRef_…` ids, Node built-ins only, and claims no `generatedPaths` entry (list both in the
mapping report's "Context hooks" table):

- **Write guard**, when a `live` store has `tools.write`: `.claude/hooks/<workflow>-write-guard.mjs`
  from `assets/templates/hook-ask-template.mjs`. PreToolUse, matcher = the write tools of all such
  stores (plus `Bash` for `cli:` patterns, checked against the command); answers
  `permissionDecision: "ask"` with the store name and approval step label. `tools: unresolved` →
  skip that store and say so in the report.
- **Memory cap**, when a `gedaechtnis` store exists: `.claude/hooks/<workflow>-memory-cap.mjs` from
  `assets/templates/hook-memory-cap-template.mjs`. PostToolUse on `Write|Edit|MultiEdit`; over
  `memory.maxLines` lines it exits 2 with the "verdichten" message.

Smoke-test both with piped payloads before moving on (a guarded write, a read, a memory file at the
cap and one line over); expectations are in the templates' header comments.

## 6b. Add run-cost tracking

Always, for `claude-dir` output (the legacy layout is left alone). Run
`node ${CLAUDE_SKILL_DIR}/scripts/install-cost-ledger.mjs "$cacheDir" generated/<workflow>` after
steps 5–7, once the skills and the orchestration file exist; re-run it after any spec change. It
writes, deterministically:

- `.claude/hooks/<workflow>-cost-ledger.mjs` from `assets/templates/hook-cost-ledger-template.mjs`:
  on `SubagentStop`, `Stop` and `SessionEnd` it appends each finished API request once to
  `.claude/runs/<workflow>/ledger.jsonl` (raw token counts, no prices) and never fails the run. Its
  header lists no element (it belongs to the whole workflow) and claims no `generatedPaths` entry.
- `.claude/hooks/<workflow>-cost-map.json` from the spec (`scripts/build-cost-map.mjs`): which skill
  names, agent types and element ids in a transcript belong to which BPMN element, lane and phase.
  It is data, not a script, and carries the `bpmn` trace as a JSON key.
- the three registrations in `.claude/settings.json`.

Nothing is priced here: the FlowForge plugin's `flowforge-cost` reads the ledger and the map after a
run. Smoke-test the hook with a piped payload (`{"transcript_path": …}`); the template header has the
expectation.

## 7. Materialize the one top-level orchestration file

Exactly one, by `pattern.chosen` (for `mixed`, one per phase):

- **`skill-chain-hooks`**: already written in step 5.
- **`workflow-script`**: `assets/templates/workflow-script-template.mjs` →
  `.claude/workflows/<workflow>.workflow.mjs`. Read the `workflow-authoring` skill if available;
  otherwise follow the template's comments. With `workflowIO.input` it reads the required fields
  from `args` and returns `blocked` when one is missing. One `phase()` per contiguous run of
  elements; `agent()` per `serviceTask`; `pipeline()` for the fan-out of a
  `parallelGateway`/`inclusiveGateway`/multi-instance marker unless the next stage needs all results
  together (then `parallel()`); plain `if`/`while` for deterministic conditions and loop caps. Every
  `agent()` gets `label: '<elementId> <label>'`; the orchestrator's `Agent` calls start their
  `description` the same way (`flowforge-cost` attributes cost by that prefix).
  **The Workflow script never runs automatically**, not by this pipeline, only when the user invokes
  it; say so in the README.
- **`orchestrator-agent`**: `assets/templates/orchestrator-agent-template.md` →
  `.claude/agents/<workflow>-orchestrator.md`, roster = step 3's specialists. It owns every
  `orchestrator` decision and every `human-checkpoint` pause-and-ask. Only the orchestrator calls
  `Agent` on other generated agents. With `workflowIO` it gets the `## Input` section (ask for a
  missing required field first) and the end-result contract line.
- **`mixed`**: one file per `pattern.phases[]` entry (`{name, pattern, elements}`), each per its own
  pattern. No `pattern.phases` → send it back to design; don't infer. At each phase boundary, the
  last element of one phase and the first of the next note the hand-off in their owning file.

## 8. Write `README.md`

From `assets/templates/README-template.md`, in `meta.language`. Strip the authoring-notes comment,
fill every placeholder, delete sections that don't apply (no hooks → no "Hooks" section, etc.).
Include:

- What was generated; `generated/<workflow>/` as the only place written; payload (`.claude/`) vs.
  review material.
- Install is one copy: `cp -R generated/<workflow>/.claude/. <project>/.claude/`. Only merge case:
  an existing `.claude/settings.json`; merge the `hooks` and `permissions.allow` keys by hand (name
  the events). Suggest an `ls` for name clashes. No install script, no `npm install`.
- `.codex/`/other runtimes: skills only (copy `.claude/skills/*`); hooks, Workflow script and
  subagents marked **Claude-only**.
- The Workflow-script section (if any): runs only when the user explicitly invokes it.
- With `contextSources`: "Voraussetzungen" (MCP servers, CLIs, notebooks; nothing is connected for
  the user, no `.mcp.json`), "Gedächtnis" (path, cap, who reads and writes), which hooks guard what,
  the permissions merge, and the required input from `workflowIO`.
- Run costs: the ledger hook records every run into `.claude/runs/<workflow>/ledger.jsonl`; add
  `.claude/runs/` to `.gitignore`; with the FlowForge plugin installed, `/flowforge-cost` reports the
  cost per BPMN element (the plugin carries the logic and the price table, this payload only the data).
- Every `openQuestions[]` entry with `answer: null`, and the eval scenarios from step 5 as open items.
- Pointers to `mapping/report.md` and `mapping/index.html`.

## 9. Write `mapping/report.md`

From `assets/templates/mapping-report-template.md`, English, labels verbatim:

- one row per element (`label`/`bpmnType`/`lane`/`kind`/`generatedPaths`/notes);
- the pattern section with `pattern.rationale` and **every `pattern.alternativesConsidered` entry
  verbatim**;
- a "Context sources" section with one subsection per store (Art, Ort, readers/writers, tool split,
  "Lesezugriff nicht pro Rolle getrennt" where the read tools sit in `permissions.allow`, write guard
  or why it was skipped) plus the context hooks table;
- grey (`not-generated`) and red (`unresolved`) sections with `reason` verbatim;
- a roles table;
- a "Review status" section (nothing red, or how many red elements and open questions remain): what
  the user approves against.

Every path listed must exist and match `generatedPaths` exactly; `flowforge-verify` traces from
this file.

## 10. Render the mapping view

Run from the directory that contains `generated/` (the cwd the pipeline started in):

```bash
node ${CLAUDE_SKILL_DIR}/scripts/render-mapping.mjs \
  "${BPMN_TOOLS_CACHE:-$HOME/.cache/bpmn-authoring-tools}" \
  generated/<workflow>/workflow-spec.yaml <sourceBpmn> generated/<workflow>/mapping
```

Produces `mapping/workflow-mapped.bpmn`, `index.html` and `renders/*.png`; the author's `.bpmn` is
never written. After a run, add `--cost <cost.json>` (from `flowforge-cost`) for a cost badge per
element, a run-cost section and a cost row in the details; without it nothing changes. Then:

```bash
node ${CLAUDE_SKILL_DIR}/scripts/check-mapping-view.mjs \
  "${BPMN_TOOLS_CACHE:-$HOME/.cache/bpmn-authoring-tools}" generated/<workflow>/mapping/index.html
```

It must print `mapping view ok` (offline it checks only the fallback; say so) and a `red elements:`
line. Data stores and process input/output are rose (`context-source`); a store with no
`elements` entry shows red like any unmapped node. Add `--no-red` to fail on red.

## 11. Self-check before handoff

- Every file from steps 4–9 carries the step-2 header; spot-check a script, a skill, an agent, the README.
- `node --check` every script/hook `.mjs`. Workflow script: wrap everything after
  `export const meta` in `(async () => {…})();` before `node --check`.
- `.claude/settings.json` (if any) parses and registers every `.claude/hooks/*.mjs`; its
  `permissions.allow` holds no write tool and no wildcard.
- Every store name in a `## Kontextquellen` section matches the BPMN label verbatim, and every tool
  there appears in that store's `contextSources.<id>.tools`.
- Step 4's rule holds: no `.mjs` under `.claude/` imports anything but `node:*` or relative files; no
  `package.json` in the payload.
- Step 6b ran: `<workflow>-cost-ledger.mjs` and `<workflow>-cost-map.json` exist and the three events
  are registered in `.claude/settings.json`.
- Every `generatedPaths` path exists; nothing written outside `generatedPaths`, the step-7 file,
  `.claude/settings.json`, or companion material inside a generated `skills/<name>/` or
  `agents/<name>/` dir; nothing outside `generated/<workflow>/`.
- Quality pass (only here in the pipeline): delegate `generated/<workflow>/` to the
  `agentic-artifact-reviewer` agent. Skip on a re-run that touched no skill, agent or orchestration
  file. Apply findings routed `generate` now. Findings routed `design`: only `high` ones go back to
  `flowforge-design` (counts toward design's re-confirmation cap); the rest go to the handoff's open items.
- If the reviewer reports `trim` findings, `AskUserQuestion` (trim flagged [recommended] / all / skip);
  on yes follow `${CLAUDE_SKILL_DIR}/../trim-the-fat/SKILL.md` per skill dir, keeping `bpmn:`, labels,
  the regenerate boundary and the JSON block. Recurring trim findings belong in `assets/templates/`.

## 12. Handoff

Report: workflow name, pattern, what was generated (counts of agents/skills/scripts/hooks + the
top-level file), whether the mapping view rendered (step 10) or why not, every red element (needs a
decision, by design or in the diagram, before verify can pass), and open reviewer items. Point at
`README.md` for the copy command and `mapping/report.md` for the trace.

## Reference files

- `assets/templates/agent-template.md`: specialist agent, orchestrator-agent roster only (steps
  3/7); name per agent-authoring's rule (kebab-case `{domain}-{role}`), plus `bpmn:` frontmatter.
- `assets/templates/skill-template.md`: reusable, lane and skill-chain top-level skill (step 5).
- `assets/templates/script-template.mjs`: `kind: script` (step 4).
- `assets/templates/hook-script-template.mjs`, `settings-template.json`: hooks and their one
  `settings.json` (step 6).
- `assets/templates/hook-ask-template.mjs`, `hook-memory-cap-template.mjs`: write guard and memory
  cap (step 6a).
- `assets/templates/hook-cost-ledger-template.mjs`, `scripts/install-cost-ledger.mjs`,
  `scripts/build-cost-map.mjs`: run-cost tracking (step 6b).
- `assets/templates/workflow-script-template.mjs`, `orchestrator-agent-template.md`: step 7.
- `assets/templates/README-template.md` (step 8), `mapping-report-template.md` (step 9).
- `scripts/render-mapping.mjs`, `scripts/check-mapping-view.mjs`: step 10.
- `assets/mapping-viewer/viewer.css` + `viewer.js`: the viewer's styles and script, inlined by
  render-mapping.mjs (edit the viewer here, not in the generator's HTML template).
