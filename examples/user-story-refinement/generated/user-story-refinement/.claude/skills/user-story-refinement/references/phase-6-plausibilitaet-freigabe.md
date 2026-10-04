---
element: phase-6
evidence: cited
sources: ["NotebookLM: The Product - Business Design"]
bpmn:
  file: user-story-refinement.bpmn
  elements: [Par_PlausiSplit, P1, P7, P3, P2, Par_PlausiJoin, P4, Gw_Plausibel, P6, End_StoryZusammengefuehrt, P5, E4, End_StorySprintReady]
---

# Phase 6 — Plausibilität gegen Backlog & Freigabe

Tags like `[triage-klaerung-1: 7, 9]` point to an entry and its citation numbers in the notebook FAQ kept with the generation output (`knowledge/faq/`), not installed.

## The four checks

- **"Auf Duplikate & Überschneidungen prüfen"** — same or overlapping goal, the same concept under
  another name ("splinters") [feedback-driven-stories-1: 40]. Someone other than the story's author
  should review — authors miss their own duplicates [backlog-plausibilitaet-1: 6].
- **"Konsistenz mit bestehenden Abläufen prüfen"** — deviations from interaction patterns of other
  stories in the same user task.
- **"Abhängigkeiten & Reihenfolge prüfen"** — predecessors/successors, shared components, and the
  release's non-functional targets [feedback-driven-stories-1: 16, 44]; unclear technical
  dependencies call for a spike [backlog-plausibilitaet-1: 11, 12].
- **"Akzeptanzkriterien gegen bestehende Stories abgleichen"** — new Given-When-Then scenarios must
  not contradict existing ones or the living documentation, which is organised by functional area,
  not by story [feedback-driven-stories-1: 38, 41, 42] [backlog-plausibilitaet-1: 13, 14, 15, 16].
- Also confirm terms against the ubiquitous language and the unbroken chain vision → goal → epic →
  story → criteria [feedback-driven-stories-1: 8, 19, 20, 43, 45].

## "Plausibilitätsbefund zusammenführen" and "Konsistent mit dem übrigen Backlog?"

One report listing duplicates, contradictions, dependencies and affected stories. Contradiction →
back to refinement (loop cap 3); duplicate → merge; otherwise continue.

- **"Mit bestehender Story zusammenführen"** — add the new acceptance criteria and the feedback
  link to the existing story; a cluster of overlaps becomes one header story with the others as
  bullets and a combined estimate [backlog-plausibilitaet-1: 17, 18, 19, 20, 21]. The new card moves
  to a rejected/trash state with the reason recorded [backlog-plausibilitaet-1: 28, 29].
- **"Betroffene Stories zur Anpassung markieren"** — impact analysis over the traceability links;
  affected stories get a note and a new version, superseded ones a recorded reason
  [backlog-plausibilitaet-1: 23, 24, 25, 26, 27, 28, 29]. Time-sensitive stories get a "best before"
  date [backlog-plausibilitaet-1: 31, 32].

## "Story priorisieren & in Ready-Spalte stellen"

Suggest a position with **Weighted Shortest Job First**: Cost of Delay (user/business value + time
criticality + risk reduction/opportunity enablement) ÷ job size (the story points)
[backlog-plausibilitaet-1: 33, 34, 35, 36, 37, 38, 39, 40]; the PO decides (decided with the business
user). Alternatives: Kano, Wiegers matrix, value vs. cost [backlog-plausibilitaet-1: 8, 41, 42, 43, 44, 45].
Ready means the team has estimated it and agrees it meets the DoR, not only the PO
[backlog-plausibilitaet-1: 7, 8, 9, 10].

## Pitfalls

Long analysis queues before development, HiPPO prioritisation, technical tasks competing as
stories, reading old stories as documentation [backlog-plausibilitaet-1: 13, 14, 46, 47, 48, 49, 50, 51, 52, 56, 57].
