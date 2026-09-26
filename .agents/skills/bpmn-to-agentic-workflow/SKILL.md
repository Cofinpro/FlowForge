---
name: bpmn-to-agentic-workflow
description: Turn a hand-drawn BPMN process diagram into a reviewable set of Claude agents, skills, hooks and an orchestrator. Use for "turn my BPMN / process diagram into Claude agents/skills", "generate an agentic workflow from BPMN", "build agents from this process diagram", "I drew a process in Camunda Modeler / bpmn.io, make it a Claude workflow", "regenerate the agents after I changed the diagram", or when a business person hands over a `.bpmn` file and wants working Claude tooling out of it. Runs the bpmn2agent-analyze → bpmn2agent-knowledge → bpmn2agent-design → bpmn2agent-generate → bpmn2agent-verify pipeline end to end, in plain business language, stopping for the business user's confirmation at the mapping plan and looping back on rejection or verification failure. Everything is written to generated/<workflow>/, never into .agents/ or .claude/ directly.
bpmn:
  file: docs/planning/bpmn-to-agentic-workflow.bpmn
  elements:
    - Start_Intake
    - UserTask_ConfirmIntake
    - Gw_Merge_Analyze
    - SubProcess_Analyze
    - Task_Knowledge
    - Gw_Merge_Design
    - Task_Design
    - UserTask_ConfirmMapping
    - Gw_MappingAccepted
    - Gw_Merge_Generate
    - SubProcess_Generate
    - Task_Verify
    - Gw_VerifyPassed
    - End_Done
---

# BPMN → Agentic Workflow

Umbrella skill for the `bpmn2agent-*` family. A business person draws a workflow as a BPMN diagram
(lane = role/agent, see `bpmn-authoring`) and invokes this skill to get a reviewable, reproducible
Claude Code setup out of it — agents, skills, hooks, an orchestrator — without ever touching YAML or
BPMN terminology themselves. This skill does no analysis, mapping or generation itself; it runs the
five stage skills in order via the `Skill` tool, carries the gates/loops between them, and reports
the result. Read each stage's own `SKILL.md` for what it actually does — this file only sequences
them.

This skill dogfoods itself: its own procedure below is the same shape as
`docs/planning/bpmn-to-agentic-workflow.bpmn`, the meta-process this family was designed against
(see the plan, `docs/planning/bpmn-to-agentic-workflow-plan.md`). Every question to the user, at
every stage, goes through `AskUserQuestion` with concrete options and a stated recommendation, in
the user's own language — never a bare open-ended prompt. This rule is set once here; the stage
skills all follow it too.

## 1. Intake

Gather (ask via `AskUserQuestion` where not already obvious from context, one recommendation each):

- **Source `.bpmn`** — locate the file (glob for `*.bpmn`, e.g. under `docs/planning/` and
  wherever the user says they saved it, if not named directly). Confirm rather than guess when
  more than one plausible candidate exists.
- **Workflow name** — kebab-case, becomes the `<workflow>` segment of `generated/<workflow>/`.
  Default it to the `.bpmn` file's own basename (kebab-cased) and confirm rather than asking
  outright when unambiguous — same default `bpmn2agent-analyze` step 1 uses.
- **Target folder** — always `generated/<workflow>/`; note this to the user explicitly. The
  installable part lands in `generated/<workflow>/.claude/`, ready to copy into a project; nothing
  is written into a real `.claude/` — the user copies it on their own say-so.
- **Interview language** — the language every question and every generated `README.md` will use
  (generated `SKILL.md`/agents/scripts stay English regardless — the pipeline's language rule).
  Default to the language the user is writing to you in.
- **Knowledge sources** — ask in plain terms whether they have Gemini notebook(s) (NotebookLM)
  covering this process, without naming the MCP tool yet; `bpmn2agent-knowledge` (step 3 below)
  does the actual lookup and mapping. It's enough here to know whether to expect one.

Record these as the shared context the next five steps run with (workflow name, `.bpmn` path,
target folder, language). Nothing is written yet.

## 2. Analyze

Run `bpmn2agent-analyze` (via the `Skill` tool) with the intake context. It validates the `.bpmn`,
inventories every element, flags unsupported constructs and interviews the business user about
gaps only, then writes `generated/<workflow>/workflow-spec.yaml` as a structurally complete draft
(every element at `kind: unresolved`, pending design).

If this is a **re-run** (the spec already exists), analyze diffs the `.bpmn` by element id itself
and only asks about what's new or changed — nothing extra to do here; just invoke it the same way.

## 3. Knowledge

Run `bpmn2agent-knowledge`. It asks about notebooks (or offers the WebSearch/model-knowledge
fallback), challenges the BPMN against whatever sources it has, and writes `knowledge:` +
`openQuestions:` into the spec plus `generated/<workflow>/knowledge/*.md`. If the user has already
said in step 1 that no notebook exists, this step still runs — it owns the fallback choice
((a) WebSearch, (b) model knowledge marked unverified, (c) pause to build a notebook) and records
`knowledge.mode`, so don't skip it or pre-decide the fallback in intake.

## 4. Design → confirm mapping plan (loop A)

Run `bpmn2agent-design`. It applies the mapping rubric and pattern rubric to every element, proposes
roles/models/tools and artifact contracts, then presents a plain-language mapping plan and asks the
business user to confirm it via `AskUserQuestion`. Three outcomes:

- **Accepted** — proceed to step 5.
- **Adjust specific elements** — design redoes the affected elements and re-confirms; still within
  this skill's step 4, no need to re-invoke it as a separate `Skill` call.
- **The diagram itself must change** — this is **loop A**: stop the pipeline here, tell the user to
  edit the `.bpmn` in `bpmn-authoring`, then re-invoke this skill (or at least re-run from step 2)
  once they have. Do not attempt to approximate the requested change inside the spec.

## 5. Generate

Run `bpmn2agent-generate` on the confirmed spec. It writes agents, skills, hooks, the few scripts
the diagram really needs and the one top-level orchestration file (skill chain / Workflow script /
orchestrator agent / mixed, per the confirmed pattern) into `generated/<workflow>/.claude/`, plus
`README.md`, `mapping/report.md`, the colour-coded `mapping/workflow-mapped.bpmn`
and `mapping/index.html` (via `scripts/render-mapping.mjs`), and PNG renders — all under
`generated/<workflow>/`, nothing outside it. Elements still `kind: unresolved` at this point are
allowed through and show up red in the mapping view; they don't block generation.

## 6. Verify → loop back on failure (loop B)

Run `bpmn2agent-verify`. It traces every generated file back to the spec and the source `.bpmn`
(both directions), lints frontmatter/hooks JSON/Workflow-script syntax, and checks for red elements
in the mapping view. Two outcomes:

- **Pass** — proceed to step 7 (handoff).
- **Fail** — this is **loop B**: read the failure kind and route it back per the meta-process's own
  branching —
  - a genuine mapping/pattern problem (an element mapped to the wrong `kind`, a pattern that
    doesn't fit) → back to step 4 (`bpmn2agent-design`), scoped to just the flagged elements per
    its own "Re-runs" section;
  - a generation defect (a file missing, a broken template fill, a stale render) → back to step 5
    (`bpmn2agent-generate`) to regenerate just the affected files.

  Either way, re-run step 6 after the fix before calling the pipeline done — don't report success
  on an unverified regeneration.

## 7. Handoff

Report to the business user, in their language:

- **What was generated** — counts of agents/skills/scripts/hooks plus the one top-level
  orchestration file, and the pattern chosen (with why, in one sentence — not the technical
  rationale, the business-facing one `bpmn2agent-design` already wrote).
- **Where** — `generated/<workflow>/`, with `README.md` and `mapping/report.md` named explicitly
  as the two files to open next; mention `mapping/index.html` for the visual click-through view.
- **Open items** — every `openQuestions[]` entry still unanswered, and every red
  (`kind: unresolved`) or grey (`kind: not-generated`) element from the mapping report, in plain
  terms (quote the BPMN label, not the element id).
- **How to install** — one copy: `cp -R generated/<workflow>/.claude/. <project>/.claude/` (merge
  `settings.json`'s `hooks` by hand if the project already has one); details in `README.md`. This
  skill never installs anything itself.
- **What only runs on explicit invocation** — if a Workflow script was generated, say plainly that
  it never runs automatically, not even as part of this pipeline; the user runs it deliberately via
  the Workflow tool when they're ready.
- **What's Claude-only** — hooks, the Workflow script and any generated subagent/orchestrator agent
  have no equivalent outside Claude Code; skills themselves are written runtime-neutral.

## Re-running this skill

Re-invoking `bpmn-to-agentic-workflow` on a workflow that already has a `generated/<workflow>/`
spec is the normal way to pick up a changed `.bpmn` or a knowledge update — don't treat it as
starting over. Step 1 still runs (confirm the same workflow name/folder rather than re-asking from
scratch when it's obviously the same one), but every stage skill from step 2 on does its own
re-run diffing (analyze by element id + sha256, design by leaving already-decided elements alone
unless they're in the diff, generate/verify re-checking only what changed) — this skill's own job
is unchanged: sequence the five stages and carry the two loops.

## Helpers the stages use

Not stages of their own; the stage skills call them where noted.

| Helper | Kind | Used in |
|---|---|---|
| `agentic-workflow-kb` | skill: cited FAQ + references on agentic design | knowledge (non-domain questions), design 6a |
| `agentic-kb-librarian` | agent: answers from the KB, asks the notebook and records new answers | design 6a, any stage with a design question |
| `orchestration-design` | skill: eight-question orchestration check | design 6a |
| `agentic-workflow-architect` | agent: read-only review of the draft spec | design 6a |
| `agent-authoring` | skill: agent split rule, writing and review checklist | design 5, generate 3/7 |
| `skill-authoring` | skill: skill writing and review checklist | generate 5 |
| `agentic-artifact-reviewer` | agent: read-only quality review of generated files | generate 11, verify (advisory) |
| `trim-the-fat` | skill, user-invoked only: shortens a skill without changing its behaviour | generate 11, only after the user says yes |

## Reference

- `${CLAUDE_SKILL_DIR}/../bpmn2agent-analyze/SKILL.md` — step 2.
- `${CLAUDE_SKILL_DIR}/../bpmn2agent-knowledge/SKILL.md` — step 3.
- `${CLAUDE_SKILL_DIR}/../bpmn2agent-design/SKILL.md` — step 4, loop A.
- `${CLAUDE_SKILL_DIR}/../bpmn2agent-generate/SKILL.md` — step 5 (`scripts/render-mapping.mjs` renders the
  mapping view).
- `${CLAUDE_SKILL_DIR}/../bpmn2agent-verify/` — step 6, loop B.
- `${CLAUDE_SKILL_DIR}/../bpmn-authoring/SKILL.md` — where the source `.bpmn` is authored/edited, including
  after loop A sends the user back to change the diagram.
- `docs/planning/bpmn-to-agentic-workflow.bpmn` — the meta-process this skill's own procedure
  matches, lane by lane.
- `docs/planning/bpmn-to-agentic-workflow-plan.md` — the full settled decisions and task log behind
  this family.
