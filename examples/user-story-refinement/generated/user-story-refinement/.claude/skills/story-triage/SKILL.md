---
name: story-triage
description: Captures incoming user or stakeholder feedback as a problem statement and finds the related stories and epics in the backlog, so the team can decide bug, change to an open story, park, or new story. Use for "Feedback erfassen & als Problem formulieren" and "Verwandte Stories & Epics im Backlog suchen" in the user-story-refinement flow.
bpmn:
  file: user-story-refinement.bpmn
  elements: [I1, I2]
---

# Eingang & Triage

Phase 1 of `user-story-refinement`, lane "Product Owner / BA". Criteria and sources:
`${CLAUDE_SKILL_DIR}/references/domain-knowledge.md`.

## "Feedback erfassen & als Problem formulieren"

Input: raw feedback, its source and sender. Write `stories/<storyId>/01_feedback.md`:

- frontmatter `storyId`, `version: 1`, `status: captured`, `backlog`, `fachkonzept` (where they live);
- the feedback verbatim, source, sender, date;
- **Problem**: the observed user problem, not the wished-for solution. If the feedback is a
  technical solution with no user problem, say so — it is a fake-story candidate.

## "Verwandte Stories & Epics im Backlog suchen"

Input: `01_feedback.md`, backlog, user story map, epics (read-only). Search by the problem's key
terms and synonyms. Append to `01_feedback.md`:

- **Related**: candidate epics / user activities and stories (open, in progress, done), one line
  each with why it matches;
- **Triage proposal** for the two gateways, with a one-line reason each, using their branch names:
  "Fehlverhalten einer bestehenden Funktion?" — "Ja (Bug)" / "Nein" (deviation from agreed
  acceptance criteria or rules?); "Wie hängt das Anliegen mit dem Backlog zusammen?" — "Ändert eine
  offene Story" / "Kein Epic-Bezug / kein Nutzen" / "Neue Story unter bestehendem Epic" (name it).

Set `status: triaged`. The calling skill confirms exits with the user; don't decide them here.
