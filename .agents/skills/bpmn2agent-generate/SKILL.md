---
name: bpmn2agent-generate
description: Writes the confirmed workflow-spec.yaml out as real files — agents, skills, scripts, hooks, an orchestrator (skill chain / Claude Code Workflow script / orchestrator agent, per the confirmed pattern), a README with install instructions, and a mapping report — the fifth step of the bpmn-to-agentic-workflow pipeline (analyze → knowledge → design → generate → verify). Everything is written under generated/<workflow>/ only, never into .agents/ or .claude/ directly. Every generated file carries bpmn: {file, elements} traceability (frontmatter for Markdown, a header comment for scripts). Use right after bpmn2agent-design has confirmed the spec with the business user, before bpmn2agent-verify.
bpmn:
  file: docs/planning/bpmn-to-agentic-workflow.bpmn
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

Fifth step of the `bpmn-to-agentic-workflow` pipeline. Input is the **confirmed**
`generated/<workflow>/workflow-spec.yaml` — every element has a concrete `kind`, `pattern.chosen`
is set, roles/artifacts are filled in. This skill only materializes what the spec already decided;
it never makes a mapping or pattern call itself (that's `bpmn2agent-design`'s job) and it never
writes outside `generated/<workflow>/` — installing into `.agents/`/`.claude/`/`.codex/` is a
manual step the generated `README.md` walks the user through, not something this skill does.

## 1. Read and sanity-check the spec

Read `generated/<workflow>/workflow-spec.yaml`. If it doesn't exist, **stop** and tell the user to
run `bpmn2agent-analyze` → `bpmn2agent-design` first. Validate it against
`bpmn2agent-design/assets/workflow-spec.schema.yaml` (ad-hoc `ajv` check, same approach as
`bpmn2agent-analyze`/`-design`'s own final steps) — a spec that doesn't conform means design didn't
finish step 8 of its own procedure; stop and say so rather than generating from a malformed input.

`pattern.chosen` must be set (`skill-chain-hooks` / `workflow-script` / `orchestrator-agent` /
`mixed`) — if it's absent, design hasn't confirmed a pattern yet; stop.

Elements still at `kind: unresolved` are allowed to exist (a genuine open question the user
explicitly deferred, per design's step 8 rule) — generate everything else and let these surface as
**red** in the mapping report; don't block the whole run on them. `bpmn2agent-verify`'s "no red in
the map" check is what actually gates acceptance, not this skill.

## 2. The frontmatter/header convention (used by every step below)

Every file this skill writes carries `bpmn: {file: <repo-relative source .bpmn path>, elements:
[<elementId>, ...]}` — the element ids that file was generated from (one for a per-element file,
several for a file spanning multiple elements like the skill-chain's top-level skill or a lane
skill wrapping several scripts). Three concrete forms, by file type:

- **Markdown with its own frontmatter already** (`SKILL.md`, agent `.md`): add `bpmn:` as another
  top-level YAML key alongside `name`/`description`:
  ```yaml
  ---
  name: ...
  description: ...
  bpmn:
    file: docs/planning/approval-flow.bpmn
    elements: [S1_Nummer]
  ---
  ```
- **Markdown with no other frontmatter need** (`README.md`, `mapping/report.md`): a frontmatter
  block with just `bpmn:`.
- **`.mjs` scripts** (plain scripts, hook scripts, the Workflow script): a single-line comment,
  `// bpmn: ` followed by one-line JSON, on **line 1 — or line 2 if line 1 is a `#!/usr/bin/env
  node` shebang** (a shebang must be the file's literal first byte to work as one at all;
  `script-template.mjs`/`hook-script-template.mjs` both have one and so put the header on line 2;
  `workflow-script-template.mjs` has no shebang — see its own step-7 note — so the header stays on
  line 1 there). `bpmn2agent-verify` parses whichever line applies by stripping the `// bpmn: `
  prefix and `JSON.parse`-ing the rest:
  ```js
  // bpmn: {"file":"docs/planning/approval-flow.bpmn","elements":["S1_Nummer"]}
  ```
  For the Workflow script this line still comes *before* the required `export const meta = {...}`
  — a leading comment doesn't violate "script must begin with `export const meta`".
- **JSON files that must stay clean, mergeable config** (a hook's `*.settings.json` snippet — see
  step 6): JSON has no comment syntax and this file gets spliced verbatim into the user's own
  `settings.json`, so it carries **no** frontmatter of its own. Traceability instead flows through
  the paired hook script (same basename, e.g. `check-threshold.hook.mjs` +
  `check-threshold.hook.settings.json`) — the mapping report's row for that element names both
  paths together so the pairing is explicit on the page a reader (or `bpmn2agent-verify`) actually
  looks at.

BPMN element labels are quoted **verbatim** (source language) everywhere they appear in a
generated file's prose — headings, checklist items, mapping-report rows. Everything else in a
generated `SKILL.md`/agent/script is **English** (the pipeline's language rule), except
`README.md`, which is written in `meta.language` (the user's own language) — see step 8.

## 3. Plan the file set per role (lane)

Before writing anything, decide per `roles.<id>` what gets materialized, from that role's elements
(`elements.<id>.lane == roleId`):

- **Lane skill** (`generated/<workflow>/skills/<agentName>/`): generated whenever the lane has
  **any** `kind: script` element — every such element's script lives here
  (`scripts/<name>.mjs`, wherever its own `generatedPaths` entry actually points), wrapped in a
  minimal `SKILL.md` (step 5) naming the scripts it bundles. This is the case the plan calls out
  explicitly: a lane whose only **file-producing** elements are scripts (i.e. every non-`script`
  element in the lane is `kind: orchestrator`/`not-generated`/an event — none of which ever
  produces a file of its own) gets nothing but this — no agent, no chain file of its own; it's
  invoked as a step from whichever file owns the overall sequence (the top-level chain/Workflow-
  script/orchestrator file from step 7).
- **Specialist agent** (`generated/<workflow>/agents/<agentName>.md`): generated **only** when
  `pattern.chosen` is `orchestrator-agent` (or a `mixed` phase using that pattern) **and** the lane
  has at least one `kind: human-checkpoint`, `kind: orchestrator`, or `kind: agent-checklist`
  element — these are the "roster" specialists the orchestrator dispatches to via the `Agent` tool
  (`pattern-rubric.md`'s orchestrator-agent detail). **Not** generated for `skill-chain-hooks` or
  `workflow-script` — those patterns have no delegation step, so a persona file per lane would be
  dead weight; the lane's human-checkpoint/orchestrator logic instead lives inline in the one
  top-level file step 7 produces.
- **Reusable skill** (`generated/<workflow>/skills/<name>/`, one per `kind: skill` element, or one
  shared dir when the rubric grouped several reused elements together): generated regardless of
  pattern — write to exactly the element's own `generatedPaths` entry. When the element is a
  collapsed `subProcess`/`callActivity` that mapping-rubric.md's "Inner elements of a skill-backed
  subProcess/callActivity" section resolved this way, its inner flow nodes fold into this same
  skill: inner `serviceTask`/`userTask`/`businessRuleTask` steps share this element's own
  `generatedPaths` (their content becomes more `## Procedure` steps + more ids in this file's
  `bpmn:` header, per step 2's superset rule), an inner `scriptTask` still gets its own bundled
  file at `generated/<workflow>/skills/<name>/scripts/<inner-name>.mjs` (step 4, just nested here
  instead of a lane skill), and inner start/end events produce nothing (already `kind:
  not-generated` from design). Don't generate a separate file per inner element — that's not what
  `bpmn2agent-verify`'s header/claim checks or `render-mapping.mjs`'s annotations expect.

Every one of these paths must equal something already in `elements.<id>.generatedPaths` — this
skill never invents a path `bpmn2agent-design` didn't already decide, **except** the one top-level
orchestration file step 7 produces (a Workflow script, an orchestrator agent, or — for
skill-chain-hooks — the chain skill), which by construction spans the whole workflow and so isn't
any single element's own `generatedPaths` entry; record its path in the mapping report's pattern
section instead (`mapping-report-template.md` already has a slot for this).

## 4. Materialize scripts (`kind: script`)

For each such element, write its `generatedPaths` file from `assets/templates/script-template.mjs`:
header comment (step 2), then the deterministic rule itself — derive it from the element's `label`,
any `elements.<id>.condition` text, and (if grounded) the copied knowledge note. A `businessRuleTask`
that stayed `script` (not `hook`) per `mapping-rubric.md`'s decision — i.e. it doesn't gate a tool
call — still just gets this treatment; don't second-guess the `kind` design already chose.

## 5. Materialize skills (`kind: skill`, lane skills, and the skill-chain's top-level skill)

Use `assets/templates/skill-template.md` for all three cases; they differ only in scope. While
filling it, follow `skill-authoring`'s "Writing a skill" steps 2–6
(`.agents/skills/skill-authoring/SKILL.md`): a description that says what *and* when, only what the
model doesn't already know, detail in directly linked `references/`, run-or-read intent for every
script. Agents (steps 3 and 7) follow `agent-authoring`'s "Writing an agent" the same way: explicit
inputs, stop and escalation points, `tools`/`model` only where design decided them.

- **Reusable skill**: `elements` in the frontmatter is the one (or few, if grouped) `kind: skill`
  element id(s). `## Procedure` comes from that element's inputs/outputs/knowledge/gate. Bundle a
  template/checklist under `assets/`/`references/` inside the skill dir when the rubric flagged the
  element as needing bundled reference material (mapping-rubric.md's `serviceTask` → skill
  conditions) — don't leave a skill that was supposed to carry a template with only the top-level
  `SKILL.md`.
- **Lane skill** (script-only or mixed lane's scripts): `elements` lists every `kind: script`
  element in that lane. Trim `## Procedure` to one line per script ("Deterministic — see
  `scripts/<name>.mjs`"); usually no `## Domain knowledge` section (scripts rarely carry grounded
  content — omit the section rather than leaving it empty).
- **Skill-chain top-level skill** (`skill-chain-hooks` pattern only, one per workflow):
  `generated/<workflow>/skills/<workflow>/SKILL.md`. `elements` lists **every** element in the
  spec (this file is the spine the whole diagram runs through). Its `description` frontmatter
  names it as the entry point ("Runs the {{workflow}} workflow end to end — invoke this to start
  it"). `## Procedure` walks the **entire** flow in BPMN order, crossing lane boundaries exactly as
  the diagram does:
  - a `kind: script`/`kind: skill` element → "invoke `<path/skill name>` with `<inputs>`" (from the
    lane skill / reusable skill step 4/5 already wrote);
  - a `kind: human-checkpoint` element → an inline `AskUserQuestion` step, options + a
    recommendation (never a bare prompt), quoting the task's label verbatim, gated by any
    `elements.<id>.gate.criteria`;
  - a `kind: orchestrator` element (a gateway or loop back-edge) → inline branch/loop instructions,
    including a loop counter check against `elements.<id>.gate.maxLoops` — on hitting the cap,
    proceed with an explicit "risk: loop cap reached" note instead of looping again
    (`pattern-rubric.md`'s skill-chain-hooks loop-cap detail: enforced in the skill itself, no
    separate orchestrator needed since a human is present).
  This is also where a `kind: hook`'s enforcement gets *narrated* (the hook itself fires inside
  Claude Code's tool loop automatically — this file just tells the human/agent that the gated tool
  call exists and what the hook does about it, for readability).

## 6. Materialize hooks (`kind: hook`)

For each such element, write **two** files at its `generatedPaths` entries (design records both —
the script and the settings snippet):

- `<...>.hook.mjs` from `assets/templates/hook-script-template.mjs` — header comment (step 2), the
  event picked from `mapping-rubric.md`'s event table (`PreToolUse`/`PostToolUse`/`Stop`/
  `SubagentStop`, matching the reasoning the table records), and the gate condition itself from
  `elements.<id>.condition`/`gate.criteria`.
- `<...>.hook.settings.json` (same basename) from `assets/templates/hook-settings-snippet-template.json`
  — no frontmatter (step 2's JSON exception), just the mergeable `hooks.<Event>` fragment.

Verify both files' basenames match before moving on — `bpmn2agent-verify` traces the JSON snippet
through this pairing, not through its own (absent) header.

## 7. Materialize the one top-level orchestration file

Exactly one of these, by `pattern.chosen` (for `mixed`, one per phase — see the note below):

- **`skill-chain-hooks`**: already produced in step 5 (the skill-chain top-level skill) — nothing
  further here.
- **`workflow-script`**: `assets/templates/workflow-script-template.mjs` →
  `generated/<workflow>/<workflow>.workflow.mjs`. One `phase()` per contiguous run of elements;
  `agent()` per `serviceTask`; `parallel()`/`pipeline()` for the fan-out a `parallelGateway`/
  `inclusiveGateway`/multi-instance marker represents (default `pipeline()` unless a later stage
  genuinely needs every result of the current one together, per `workflow-authoring`'s
  barrier-vs-pipeline rule); plain `if`/`while` for deterministic gateway conditions and loop caps.
  **This file is only ever a saved script — never invoke it.** Say so in the README (step 8); the
  business user runs it deliberately via the Workflow tool.
- **`orchestrator-agent`**: `assets/templates/orchestrator-agent-template.md` →
  `generated/<workflow>/agents/<workflow>-orchestrator.md`, roster = the specialist agents step 3
  planned. It owns every `kind: orchestrator` element's decision and every `kind: human-checkpoint`
  element's pause-and-ask, dispatching via the `Agent` tool — the *only* generated file allowed to
  call `Agent` on another generated agent (same rule this repo's own `task-delegator` follows).
- **`mixed`**: apply the three rules above **per phase**. If `bpmn2agent-design` recorded
  `pattern.phases[]` (the schema's `pattern.phases` — `[{name, pattern, elements: [...]}]`), use it
  directly: one top-level file per phase entry, at its own `pattern`. If `pattern.phases` is
  absent (an older spec, or design didn't fill it in), fall back to inferring phase boundaries from
  contiguous runs of elements that share one pattern-shape (a run with no human-checkpoint/
  judgement content vs. a run that has one) — the same signals `pattern-rubric.md` computed for the
  whole diagram, recomputed per contiguous run; **this inference is a real gap** when it's needed —
  flag it to the user in the handoff (step 10) rather than silently guessing wrong, and prefer
  asking `bpmn2agent-design` to fill in `pattern.phases` explicitly over repeatedly re-deriving it.
  Either way, generate each phase's file per its own pattern, and make the hand-off explicit: the
  last element of one phase and the first of the next both note the phase boundary in their owning
  file's prose.

## 8. Write `README.md`

From `assets/templates/README-template.md`, **in `meta.language`** (the one generated file that
isn't English — see step 2). Strip the template's own authoring-notes comment block; fill every
placeholder; delete whole sections that don't apply (no "Hooks" section with zero `kind: hook`
elements, no "Workflow script"/"Orchestrator agent" section for a pattern that didn't produce one).
Must include, per the plan's settled decisions:

- What was generated, with `generated/<workflow>/` named explicitly as the only place anything was
  written.
- Copy/symlink instructions for `.agents/` + `.claude/` (this repo's own canonical-plus-symlink
  pairing, `cp -r` the skill then `ln -s ../../.agents/skills/<name> .claude/skills/<name>`),
  `.codex/` (skills only — copy, since they're written runtime-neutral), and an explicit
  **Claude-only** callout on hooks, the Workflow script, and any generated subagent — these have no
  equivalent outside Claude Code.
- The Workflow-script section (if any) stating plainly that it only ever runs when the user
  explicitly invokes it — never automatically, not even by this pipeline.
- Every `openQuestions[]` entry with `answer: null`, so a reader doesn't have to open the YAML to
  find open gaps.
- A pointer to `mapping/report.md` and (once rendered — step 9) `mapping/index.html`.

## 9. Write `mapping/report.md`

From `assets/templates/mapping-report-template.md` — English, BPMN labels verbatim. One row per
element (`label`/`bpmnType`/`lane`/`kind`/`generatedPaths`/notes), the pattern section with
`pattern.rationale` and **every `pattern.alternativesConsidered` entry shown verbatim** (the plan's
explicit traceability requirement — do not paraphrase or summarize them), the grey
(`not-generated`) and red (`unresolved`) sections with `reason` verbatim, and a roles table. Its
"Review status" section near the top is what the business user approves against: nothing red, or
how many red elements and open questions remain. This
file is `bpmn2agent-verify`'s primary trace target — every path it lists must exist on disk and
match `elements.<id>.generatedPaths` exactly.

## 10. Render the mapping view

```bash
node .agents/skills/bpmn2agent-generate/scripts/render-mapping.mjs \
  "${BPMN_TOOLS_CACHE:-$HOME/.cache/bpmn-authoring-tools}" \
  generated/<workflow>/workflow-spec.yaml <sourceBpmn> generated/<workflow>/mapping
```

Run it from the repo root (it resolves `generatedPaths` against the working directory). It
produces `mapping/workflow-mapped.bpmn` (colour-coded, annotated copy — one colour per `kind`, grey
= not generated, red = unresolved/unmapped/open question; legend in the script's header comment),
`mapping/index.html` (read-only bpmn-js viewer: review status with every red element and a
next-red button, a level tree of all processes/sub-processes with red counts, element search, kind
filter and an agent highlight that dims the other agents' shapes, a grouped and filterable file list, German/English legend with counts, click-through to files, `#level=…&el=…` deep links and
Back; approval happens in `report.md`) and
`mapping/renders/*.png` (one per plane, via `bpmn-authoring/scripts/render.mjs` — no separate render
call needed). The author's `.bpmn` is never written to.

Then check the viewer in a headless browser (needs internet for the bpmn-js CDN; offline it checks
only the fallback and says so):

```bash
node .agents/skills/bpmn2agent-generate/scripts/check-mapping-view.mjs \
  "${BPMN_TOOLS_CACHE:-$HOME/.cache/bpmn-authoring-tools}" generated/<workflow>/mapping/index.html
```

It must print `mapping view ok`: every red element, level and element reachable from the sidebar
(tree, search, kind filter, next-red), red counts on sub-processes, Back and deep links, keyboard
panning, a readable start zoom, no collapse at 390 px, and a working sidebar without the CDN.

## 11. Self-check before handoff

- Every file written in steps 4–9 carries the frontmatter/header from step 2 — spot-check a script,
  a skill, an agent (if any), and the README.
- Every plain script/hook `.mjs` file parses: `node --check <file>` (syntax only — no LLM calls,
  so this is the right bar, not execution).
- The Workflow script (if one was produced) needs one extra step before `node --check`: it
  legitimately uses top-level `await` **and** top-level `return` (the Workflow tool wraps the body
  in its own async runner) — plain `node --check` on the raw `.mjs` rejects the top-level `return`
  (`SyntaxError: Illegal return statement`; confirmed empirically, and a plain `.cjs` reinterpretation
  doesn't fix it either — that rejects the top-level `await` instead). Wrap everything **after**
  the `export const meta = {...}` block in `(async () => { ... })();` before checking — the export
  itself must stay at module top level, only the script body needs wrapping.
- Every `*.settings.json` parses: `node -e "JSON.parse(require('fs').readFileSync(process.argv[1],'utf8'))" <file>`.
- Every path in every element's `generatedPaths` exists on disk, and nothing was written to a path
  *not* traceable to a `generatedPaths` entry, the one top-level orchestration file from step 7, or
  companion material bundled inside a generated `skills/<name>/` or `agents/<name>/` directory (e.g.
  a skill's `references/*.md` — the same allowance `bpmn2agent-verify` makes).
- Nothing was written outside `generated/<workflow>/`.
- Quality pass: delegate `generated/<workflow>/` to the `agentic-artifact-reviewer` agent (it runs
  the skill-authoring and agent-authoring review checklists). Apply findings routed `generate`
  now; send findings routed `design` back to `bpmn2agent-design`. Skip this only for a re-run that
  touched no skill, agent or orchestration file.
- Trim (optional). When the reviewer reports findings routed `trim` (wording that is longer than
  it needs to be, behaviour unaffected), ask via `AskUserQuestion` whether to shorten the generated
  skills with `trim-the-fat` — options: trim the flagged skills (recommended when there are `trim`
  findings), trim all generated skills, skip. `trim-the-fat` is user-invoked only
  (`disable-model-invocation`), so run it only on a yes, which counts as the explicit request: read
  `.agents/skills/trim-the-fat/SKILL.md` and follow it once per skill directory. Its "functional
  frontmatter" includes the `bpmn:` block; also keep verbatim BPMN labels, the templates'
  regenerate boundary and the JSON reporting block. `bpmn2agent-verify` re-checks the trimmed
  files. Trimmed files are still generated output — the next generate run rewrites them from the
  templates, so a `trim` finding that keeps coming back belongs in `assets/templates/`.

## 12. Handoff

Report to the user: workflow name, pattern chosen, what was generated (counts of agents/skills/
scripts/hooks + the one top-level file), whether the mapping view rendered (step 10) or was
skipped and why, and every red (`kind: unresolved`) element from the mapping report — these need a
decision (back to `bpmn2agent-design`, or the diagram itself) before `bpmn2agent-verify` can pass.
Point at `README.md` for what to do next (install instructions) and `mapping/report.md` for the
full trace.

## Reference files

- `assets/templates/agent-template.md` — specialist agent, `orchestrator-agent` pattern's roster
  only (step 3/7); reuses `.agents/skills/new-agent/agent-template.md`'s structure and naming
  convention with `bpmn:` frontmatter added.
- `assets/templates/skill-template.md` — reusable skill, lane skill, and the skill-chain's
  top-level skill (step 5).
- `assets/templates/script-template.mjs` — `kind: script` (step 4).
- `assets/templates/hook-script-template.mjs` + `assets/templates/hook-settings-snippet-template.json`
  — `kind: hook`'s paired files (step 6).
- `assets/templates/workflow-script-template.mjs` — `workflow-script` pattern's one file (step 7);
  read the `workflow-authoring` skill (via the `Skill` tool) for the actual script API before
  filling this in — the template only sketches the shape.
- `assets/templates/orchestrator-agent-template.md` — `orchestrator-agent` pattern's one file
  (step 7), shaped after `.agents/agents/task-delegator.md`.
- `assets/templates/README-template.md` — step 8.
- `assets/templates/mapping-report-template.md` — step 9.
- `scripts/render-mapping.mjs` — mapped BPMN + `index.html` viewer + PNG renders (step 10).
- `assets/mapping-viewer/viewer.css` + `viewer.js` — the viewer's page styles and script; render-mapping.mjs
  inlines them into `index.html` (edit the viewer here, not in the generator's HTML template).
- `scripts/check-mapping-view.mjs` — headless-browser check of the viewer (step 10).
- `.agents/skills/skill-authoring/SKILL.md`, `.agents/skills/agent-authoring/SKILL.md` — how to
  fill the skill and agent templates well (steps 3, 5, 7).
- `.agents/agents/agentic-artifact-reviewer.md` — the quality pass in step 11.
- `.agents/skills/trim-the-fat/SKILL.md` — the optional trim in step 11 (user-invoked only).
