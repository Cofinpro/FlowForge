# Skill authoring

Distilled from FAQ `skill-authoring-1` (source: Skill authoring best practices, Claude Platform
Docs). Tag `[skill-authoring-1: n]` = citation n in that entry's table.

## Discovery

- Only `name` and `description` of every installed skill sit in context at startup; the body loads
  when the skill triggers, bundled files only when read [skill-authoring-1: 2].
- `name`: ≤ 64 chars, lowercase letters, digits, hyphens; no `anthropic`/`claude`. Gerund form
  (`processing-pdfs`) is the recommended style, noun phrases are acceptable; avoid `helper`,
  `utils`, `tools` [skill-authoring-1: 4].
- `description`: ≤ 1024 chars, third person, says what the skill does **and** when to use it, with
  the trigger words users actually type (file types, task names) [skill-authoring-1: 4, 6].
  "Helps with documents" is the counter-example [skill-authoring-1: 7].

## Body

- Assume Claude is already smart; cut every sentence that explains what it knows anyway
  [skill-authoring-1: 2, 8].
- Keep `SKILL.md` under 500 lines; move detail into files linked **directly** from `SKILL.md` (one
  level deep — nested links get read partially) [skill-authoring-1: 9, 12, 13].
- Reference files over 100 lines start with a table of contents [skill-authoring-1: 13].
- Match freedom to fragility: heuristics for open judgement, a parameterised template when a
  preferred pattern exists, an exact command for fragile operations
  [skill-authoring-1: 4, 10, 11].
- One default tool with an escape hatch instead of a menu of options [skill-authoring-1: 15].
- One term per concept across instructions, references, scripts and error messages
  [skill-authoring-1: 21].
- No time-sensitive facts in the main flow [skill-authoring-1: 9].
- Forward slashes in all paths [skill-authoring-1: 25, 26].

## Workflows, templates, feedback loops

- Multi-step work gets numbered steps plus a copyable checklist the agent ticks off
  [skill-authoring-1: 17, 18].
- Quality-critical steps get a loop: run validator → fix → re-run, proceed only on pass
  [skill-authoring-1: 18, 19, 20].
- Templates state their strictness: "always use exactly this" vs. "sensible default, adapt"
  [skill-authoring-1: 21, 22]. Concrete input/output examples beat descriptions.
- Branching work gets an explicit fork: "Creating new? → workflow A. Editing? → workflow B"
  [skill-authoring-1: 23].

## Scripts

- Bundled scripts are cheaper and more reliable than generated code: only their output enters
  context [skill-authoring-1: 5, 14].
- Say whether the agent should **run** a script or **read** it as reference
  [skill-authoring-1: 5, 14].
- Scripts handle their own errors with actionable messages ("solve, don't defer") and justify
  every constant — no `TIMEOUT = 47  # why?` [skill-authoring-1: 15, 16, 26].
- Destructive or batch operations: plan file → validate the plan with a script → execute →
  verify [skill-authoring-1: 5].

## Testing

- Evaluation-driven: run representative tasks without the skill, note the failures, write ≥ 3
  eval scenarios, then the minimal instructions that pass them [skill-authoring-1: 3, 26].
- Test with every model tier that will use the skill (Haiku needs more guidance, Opus less)
  [skill-authoring-1: 11, 26].
- Author with one Claude instance, test with a fresh one on real tasks, feed observations back.
