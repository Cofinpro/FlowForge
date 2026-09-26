---
name: skill-authoring
description: Writes or reviews a Claude skill package (SKILL.md plus references/, scripts/, assets/) against the skill-authoring best practices — discoverable description, lean body, one-level progressive disclosure, degrees of freedom, scripts with run-or-read intent, validation loops, evals. Use when creating a skill, reviewing or tightening one, or giving a filled skill-template.md a quality pass. For subagent definitions use agent-authoring.
---

# Skill authoring

Cited rules: `agentic-workflow-kb/references/skill-authoring.md` (full passages in its FAQ).
The checklist below states every rule; the procedure applies it.

## Writing a skill

1. **Collect the failure first.** What does Claude get wrong on this task without the skill?
   Write 3 short eval scenarios (input, expected behaviour). No scenario → no reason for the skill.
2. **Draft** frontmatter and body against the checklist.
3. **Split** into `references/` and `scripts/` per the Structure and Scripts items.
4. **Validation loop:** run the check → fix → re-run; continue only on pass.
5. **Test** the step-1 scenarios in a fresh session on every model tier that will run the skill.
   Watch which files it reads and where it goes wrong; fix the skill, not the test.

## Reviewing a skill

Go through the checklist; report each failed item with file, line and a concrete fix. Mark items
that don't apply as n/a rather than passing them silently. If the only problems are length and
repetition, the fix is `trim-the-fat` — it is user-invoked only, so suggest it rather than running
it unasked.

```
Discovery
- [ ] name: lowercase, digits, hyphens, ≤ 64 chars, no `claude`/`anthropic`; specific (not
      helper/utils); follows the repo's naming style
- [ ] description: third person, ≤ 1024 chars, what it does AND when to use it, in the words
      users type; repo-required extra keys (e.g. `bpmn:`) kept
Body
- [ ] SKILL.md < 500 lines; only what Claude doesn't already know
- [ ] numbered steps for multi-step work; a copyable checklist where steps get skipped
- [ ] freedom per step matches fragility: heuristic (judgement), template (preferred pattern),
      exact command (fragile operation)
- [ ] one default tool or approach per choice, alternatives only as an escape hatch
- [ ] one term per concept throughout
- [ ] branching work has an explicit fork ("new → A, existing → B")
- [ ] no time-sensitive facts in the main flow
Structure
- [ ] anything not needed on every run lives in `references/*.md`, linked directly from
      SKILL.md with a line saying when to read it
- [ ] references > 100 lines have a table of contents
- [ ] forward slashes in all paths
Scripts
- [ ] deterministic or fragile steps are scripts
- [ ] run-or-read intent stated for each ("run `scripts/x`" / "read `scripts/x` for the algorithm")
- [ ] actionable error messages; constants justified
- [ ] dependencies named and checked
Quality
- [ ] validation loop for quality-critical output
- [ ] ≥ 3 eval scenarios exist (or are listed as missing)
```
