---
name: skill-authoring
description: Writes or reviews a Claude skill package (SKILL.md plus references/, scripts/, assets/) against the Claude skill-authoring best practices — discoverable description, lean body, one-level progressive disclosure, degrees of freedom, scripts with explicit run-or-read intent, checklists and validation loops, evals. Use when creating a new skill, reviewing or tightening an existing one, or when bpmn2agent-generate fills skill-template.md and the result needs a quality pass.
---

# Skill authoring

Rules come from `agentic-workflow-kb/references/skill-authoring.md` (cited, one level deeper in
its FAQ). This skill turns them into a procedure and a checklist.

## Writing a skill

1. **Collect the failure first.** What does Claude get wrong on this task without the skill?
   Write 3 short eval scenarios (input, expected behaviour). No scenario → no reason for the skill.
2. **Frontmatter.**
   - `name`: lowercase, digits, hyphens, ≤ 64 chars, no `claude`/`anthropic`; specific, not
     `helper`/`utils`. Follow the repo's existing naming style when it has one.
   - `description`: third person, ≤ 1024 chars, *what it does* + *when to use it*, with the words
     users actually type. Extra keys the repo requires (e.g. `bpmn:` for generated files) stay.
3. **Body** — only what Claude doesn't already know:
   - numbered steps for multi-step work, a copyable checklist when steps are easy to skip;
   - pick the freedom per step: heuristic (judgement), template (preferred pattern), exact
     command (fragile operation);
   - one default tool or approach, alternatives only as an escape hatch;
   - one term per concept throughout;
   - branching work gets an explicit fork ("new → A, existing → B").
4. **Split** anything that isn't needed on every run into `references/*.md`, linked directly
   from `SKILL.md` with a line saying when to read it. Files > 100 lines get a table of contents.
   Keep `SKILL.md` < 500 lines.
5. **Scripts** for deterministic or fragile steps. Say "run `scripts/x`" or "read `scripts/x` for
   the algorithm". Scripts return actionable errors and justify their constants.
6. **Validation loop** for quality-critical output: run the check → fix → re-run, continue only on
   pass.
7. **Test** the scenarios from step 1 with a fresh session, on every model tier that will run the
   skill. Watch which files it reads and where it goes wrong; fix the skill, not the test.

## Reviewing a skill

Go through the checklist; report each failed item with file, line and a concrete fix. Mark items
that don't apply as n/a rather than passing them silently. If the only problems are length and
repetition, the fix is `trim-the-fat` — it is user-invoked only, so suggest it rather than running
it unasked.

```
Discovery
- [ ] name valid (charset, length, reserved words) and specific
- [ ] description third person, says what AND when, contains trigger words
Body
- [ ] SKILL.md < 500 lines, no explanations of things Claude knows
- [ ] steps numbered; checklist where steps get skipped
- [ ] freedom matches fragility (exact commands only where needed)
- [ ] one default per choice, consistent terminology
- [ ] no time-sensitive facts in the main flow
Structure
- [ ] every reference linked directly from SKILL.md with "when to read"
- [ ] references > 100 lines have a table of contents
- [ ] forward slashes in all paths
Scripts
- [ ] run-or-read intent stated for each script
- [ ] scripts handle errors with actionable messages, no unexplained constants
- [ ] dependencies named and checked
Quality
- [ ] validation loop for quality-critical output
- [ ] ≥ 3 eval scenarios exist (or are listed as missing)
```

## In the bpmn2agent pipeline

- `bpmn2agent-generate` step 5 fills `skill-template.md`; apply "Writing a skill" steps 2–6 while
  filling it. The template's `bpmn:` frontmatter and English-with-verbatim-BPMN-labels rule stay.
- The eval scenarios come from the diagram: the happy path through the element, each outgoing
  gateway branch it feeds, and the loop hitting `gate.maxLoops`. List them in the generated
  skill's README section or as open items if nobody writes them yet.
- `agentic-artifact-reviewer` runs "Reviewing a skill" over `generated/<workflow>/skills/`.
