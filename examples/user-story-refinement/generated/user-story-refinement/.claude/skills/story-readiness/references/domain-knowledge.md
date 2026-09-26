---
element: phase-5
evidence: cited
sources: ["NotebookLM: The Product - Business Design"]
bpmn:
  file: user-story-refinement.bpmn
  elements: [E1, E2, E3, Gw_Ready, E5, End_StoryVerworfen]
---

# Phase 5 — Definition of Ready

Tags like `[topic-n: 3, 5]` point to an entry and its citation numbers in the notebook FAQ kept with the generation output (`knowledge/faq/`), not installed.

## "Definition of Ready prüfen" — checklist

One pass/fail question each [definition-of-ready-1: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]:

1. Concrete role or persona, not "as a user" or a system component?
2. Real user/business value (or an explicit learning goal), not a developer task?
3. Independent of other unfinished stories?
4. Still negotiable — a conversation placeholder, not a fixed spec?
5. Understood well enough to estimate within the current architecture?
6. Small enough to finish and test in one sprint?
7. Objective acceptance criteria (Given-When-Then) that allow a clear pass/fail?
8. States the need without dictating screens, database design or technology?
9. Non-functional impact (performance, security, capacity) named or ruled out
   [triage-klaerung-1: 23, 24, 25, 26] (decided with the business user: part of the DoR).
10. Measurable target / expected behaviour change stated [definition-of-ready-1: 53, 54, 55].

## "Begriffe mit Domänenmodell abgleichen"

Check that entities, attributes and operations in the story and in its scenarios map 1:1 to the
ubiquitous language, that behaviour respects the model's rules and bounded contexts, and that
developers and domain experts use the same terms [definition-of-ready-1: 21, 22, 23, 24].
Deviations: synonyms or technical jargon for a domain concept ("order table" for "Cargo"),
ambiguous or contradicting terms, new business terms not in the model — the last one means the
model itself has to change [definition-of-ready-1: 25, 26, 27, 28, 29, 30].

## "Auf Fake- & Waisen-Story prüfen"

- **Fake story**: a technical task dressed as a feature. Signs: goal and benefit entirely inside the
  team's own control, a developer/QA/system role, no business stakeholder can give acceptance
  criteria [definition-of-ready-1: 4, 6, 18, 31, 32, 33]. Legitimate technical work goes to a
  separate time budget, not discarded [definition-of-ready-1: 32, 33].
- **Orphan story**: can't be attached to a goal, impact, epic or user activity, or its beneficiary is
  outside the milestone's target roles [definition-of-ready-1: 34, 35, 36, 37, 38, 39, 40].

## "Definition of Ready erfüllt?"

Criteria unclear → back to refinement; technical risk → **"Nachgelagerten Spike durchführen"** with
a timebox and an explicit learning goal, then refinement [definition-of-ready-1: 5, 56, 57, 58];
no longer relevant → discard. Loop cap back to refinement: 3.

## Pitfalls

The DoR as a stage gate demanding complete specs ("agile-fall"), analysis paralysis, queues waiting
for sign-offs, paperwork instead of conversation [definition-of-ready-1: 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52].
