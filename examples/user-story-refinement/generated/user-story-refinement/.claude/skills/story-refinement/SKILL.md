---
name: story-refinement
description: Prepares and documents a Three Amigos refinement of a user story — the what (value and business rules), the how (approach and dependencies), edge and negative cases, wireframes — then writes Given-When-Then acceptance criteria and example tables, and splits a story that is too big for one sprint vertically. Use for the "Refinement (Three Amigos)" phase of the user-story-refinement flow.
bpmn:
  file: user-story-refinement.bpmn
  elements: [D2a, D2d, D2b, D2c, D3, D4, D6]
---

# Refinement (Three Amigos)

Phase 4 of `user-story-refinement`. Procedure, convergence and sprint-size criteria, splitting
patterns and sources: `${CLAUDE_SKILL_DIR}/references/domain-knowledge.md`. These notes prepare the
team's conversation; they don't replace it.

## Four perspectives → `stories/<storyId>/05_akzeptanzkriterien.md`

Frontmatter `storyId`, `version`, `status: draft`. Write each section before reading the others.

- **Was — "Wert & Fachregeln erläutern (Was)"** (PO / BA): business rules, desired result, value.
- **Wireframes — "Wireframes & Interaktionsfluss beilegen"** (UX): screens, flow, links to mockups
  and to the prototype if one was tested.
- **Wie — "Umsetzung & Abhängigkeiten klären (Wie)"** (Entwicklung): approach, dependencies on
  other stories or systems, input from the spike report.
- **Randfälle — "Randfälle & Negativszenarien identifizieren"** (QA): boundary values, invalid
  input, system limits.

## "Akzeptanzkriterien in Given-When-Then formulieren" (QA / Test)

From the four sections: scenarios `Gegeben … / Wenn … / Dann …`, one per rule and edge case, each
with a verifiable result.

## "Beispieltabellen ergänzen (Specification by Example)" (QA / Test)

A table per rule: concrete inputs → expected output. Set `status: refined`.

## "Story vertikal schneiden (Splitting-Muster)" (Product Owner / BA)

Only after "Passt die Story in einen Sprint?" = "Nein (zu groß)". Pick a pattern from the reference
(business rule, operation, input channel, output format, workflow step, example of usefulness,
spike first, core vs. enhancement), never by architectural layer. For each part story `<n>`:

- `stories/<storyId>-<n>/04_story.md`: a draft card with its own value, `parentStory: <storyId>`,
  `feedback:` the parent's `01_feedback.md`, `status: invest-failed` (not yet checked);
- `stories/<storyId>-<n>/05_akzeptanzkriterien.md`: the scenarios and examples that move with it,
  `status: draft`.

List the part stories in the order they should run. The calling skill closes the parent.

## Kontextquellen

Knowledge stores, distilled at generation time into one file per task; no tool call at run time. `${CLAUDE_SKILL_DIR}/references/domain-knowledge.md` keeps the phase-level criteria.

- **Product-Methodik: Refinement** (wissen): "Wert & Fachregeln erläutern (Was)" → `${CLAUDE_SKILL_DIR}/references/D2a.md`; "Akzeptanzkriterien in Given-When-Then formulieren" → `${CLAUDE_SKILL_DIR}/references/D3.md`; "Beispieltabellen ergänzen (Specification by Example)" → `${CLAUDE_SKILL_DIR}/references/D4.md`; "Story vertikal schneiden (Splitting-Muster)" → `${CLAUDE_SKILL_DIR}/references/D6.md`
