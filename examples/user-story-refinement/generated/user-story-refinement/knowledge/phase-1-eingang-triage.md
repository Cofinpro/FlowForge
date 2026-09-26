---
element: phase-1
evidence: cited
sources: ["NotebookLM: The Product - Business Design"]
bpmn:
  file: user-story-refinement.bpmn
  elements: [Start_FeedbackEingegangen, I1, I2, Gw_Bug, End_BugUebergeben, Gw_Bezug, End_AnStoryUebergeben, End_FeedbackGeparkt]
---

# Phase 1 — Eingang & Triage

Tags like `[feedback-driven-stories-1: 5, 6]` point to an entry in `faq/` and the citation numbers
in its table.

## Procedure

1. **"Feedback erfassen & als Problem formulieren"** — record source and sender, then restate the
   request as the observed user problem, not the wished-for solution ("I need a custom Excel
   report" → "I need to spot data discrepancies faster") [feedback-driven-stories-1: 11, 23].
   Requests framed as a technical solution with no user problem are fake stories: reframe around
   the behaviour change or reject [feedback-driven-stories-1: 10, 11].
2. **"Verwandte Stories & Epics im Backlog suchen"** — look for the epic or user-activity branch in
   the user story map / impact map the feedback belongs to, and for open, in-progress and done
   stories touching the same concept [feedback-driven-stories-1: 8, 9].

## Decision criteria

- **"Fehlverhalten einer bestehenden Funktion?"** — a bug is behaviour that deviates from agreed
  acceptance criteria or business rules. Small bugs go to bug handling (several can be stapled into
  one card); a fix that needs new capabilities or changed workflows is a story
  [feedback-driven-stories-1: 5, 6].
- **"Wie hängt das Anliegen mit dem Backlog zusammen?"**
  - touches a story still in refinement or in progress → adjust that story's acceptance criteria
    instead of a new ticket [feedback-driven-stories-1: 7];
  - fits an existing epic / user activity → new story under that epic [feedback-driven-stories-1: 8, 9];
  - no epic, no goal, generic "as a user" pet feature, expired deadline ("rotten fruit") → park in
    the opportunity backlog or reject [feedback-driven-stories-1: 4, 12, 13, 14].

## Pitfalls

- Passing solution wishes through unchanged; the problem statement is the check against it
  [triage-klaerung-1: 16, 53].
- A "stream of consciousness" backlog that accepts all feedback without triage
  [backlog-plausibilitaet-1: 31, 53, 55].
