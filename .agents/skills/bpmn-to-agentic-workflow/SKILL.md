---
name: bpmn-to-agentic-workflow
description: Turns a hand-drawn BPMN process diagram into a reviewable set of Claude agents, skills, hooks and an orchestrator by running the five bpmn2agent-* stages end to end, with the business user confirming the mapping plan. Use for "turn my BPMN / process diagram into Claude agents/skills", "I drew a process in Camunda Modeler / bpmn.io, make it a Claude workflow", "regenerate the agents after I changed the diagram", or when someone hands over a .bpmn file. For one stage only, use that stage skill.
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

Runs the five `bpmn2agent-*` stage skills in order via the `Skill` tool, carries the gates and loops
between them, and reports the result. It does no analysis, mapping or generation itself.

Ask every question via `AskUserQuestion` with options and a recommendation, in the user's language.

## 1. Intake

Gather, asking only where context doesn't already answer it:

- **Source `.bpmn`** — glob for `*.bpmn` if not named; confirm when several candidates exist. No
  diagram yet → run `bpmn-process-design` first and use the file it writes.
- **Workflow name** — kebab-case; default to the `.bpmn` basename and confirm. Output goes to
  `generated/<workflow>/`; tell the user.
- **Language** — for questions and generated `README.md`s (generated skills/agents/scripts stay
  English). Default: the language the user writes in.
- **Knowledge sources** — whether Gemini notebooks (NotebookLM) cover this process; knowledge does
  the lookup.

If `generated/<workflow>/` already exists, this is a re-run: confirm the same name rather than
asking afresh; every stage diffs against its previous output itself. Write nothing in this step.

## 2. Analyze

Run `bpmn2agent-analyze` with the intake context; it writes the draft `workflow-spec.yaml`.

## 3. Knowledge

Run `bpmn2agent-knowledge`. Run it even when the user said no notebook exists — it owns the fallback
choice (WebSearch / unverified model knowledge / pause to build a notebook); don't pre-decide it.

## 4. Design → confirm mapping plan (loop A)

Run `bpmn2agent-design`. It ends with the user's answer to the mapping plan:

- **Accepted** → step 5. The confirmed spec is the safe point to resume from in a new session.
- **Adjust specific elements** → design redoes those and re-confirms, within this step, at most 3
  times (design handles the cap).
- **The diagram must change** → **loop A**: stop the run. The user edits the `.bpmn` with
  `bpmn-authoring` (`${CLAUDE_SKILL_DIR}/../bpmn-authoring/SKILL.md`), then re-runs this skill from
  step 2. Never approximate the change inside the spec.

## 5. Generate

Run `bpmn2agent-generate` on the confirmed spec. Elements still `kind: unresolved` don't block it;
they show red in the mapping view.

## 6. Verify (loop B)

Run `bpmn2agent-verify`. Pass → step 7. Fail → **loop B**, routing each finding as verify reports:
  - mapping/pattern problem → step 4, scoped to the flagged elements;
  - generation defect → step 5, only the affected files;
  - changed (sha256 mismatch) or invalid `.bpmn` → step 2, then steps 3–6 again.

  Re-run step 6 after every fix. Cap: 3 verify rounds per run. At the cap, or when the same finding
  (category + file) returns unchanged twice, stop and ask: send the remaining findings to design,
  change the diagram (loop A), or accept a handoff marked **unverified** with the findings listed.
  Never report success at the cap.

## 7. Handoff

Report in the user's language:

- **What** — counts of agents/skills/scripts/hooks, the orchestration file, and the pattern with
  design's one-sentence business reason.
- **Where** — `generated/<workflow>/`; open `README.md` and `mapping/report.md` next;
  `mapping/index.html` is the visual view.
- **Open items** — unanswered `openQuestions[]`, red (`unresolved`) and grey (`not-generated`)
  elements, by BPMN label, not id. If loop B hit its cap: say **unverified** and list the findings.
- **Install** — nothing was written into a real `.claude/`; the user copies it:
  `cp -R generated/<workflow>/.claude/. <project>/.claude/` (merge `settings.json` `hooks` by hand
  if one exists). Details in `README.md`.
- **Runs only on invocation** — a generated Workflow script never runs automatically, not even in
  this pipeline; the user starts it via the Workflow tool.
- **Claude-only** — hooks, the Workflow script and generated agents exist only in Claude Code;
  skills are runtime-neutral.
