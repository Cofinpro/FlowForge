---
element: phase-3
evidence: cited
sources: ["NotebookLM: The Product - Business Design"]
bpmn:
  file: user-story-refinement.bpmn
  elements: [Merge_Einordnung, C1, Merge_Formulierung, C2, C3, C4, Gw_Invest]
---

# Phase 3 — Story formulieren

## Procedure

1. **"Story unter Epic in User Story Map einordnen"** — find the backbone activity/step (left to
   right, solution-neutral), place the story under the user task it supports, set its vertical
   position (release/priority), and check whether a thinner first slice ships value earlier
   [story-formulieren-1: 1, 2, 3, 4, 5, 6, 7, 8, 9].
2. **"Story im Connextra-Format formulieren"** — written by the customer side (PO/BA), shaped with
   developers [story-formulieren-1: 10, 11, 12, 13, 14]:
   - *As a [role]*: a concrete role or persona from the Fachkonzept, never "a user"
     [story-formulieren-1: 15, 16, 17, 18, 19];
   - *I want [goal]*: the capability, no screen layout or technical design
     [story-formulieren-1: 17, 19, 20, 21, 22];
   - *so that [benefit]*: the concrete value or behaviour change, **with the measurable target
     from the Ist-/Soll-Delta** [story-formulieren-1: 17, 19, 20, 21, 23] (decided: required).
   The card is a placeholder for a conversation, not a contract [story-formulieren-1: 27, 28, 29, 30, 31].
3. **"Bezug zu Epic, Fachkonzept & Feedback dokumentieren"** — link upward to the triggering
   feedback, business goal, role in the Fachkonzept and epic/backbone activity; give the story an
   id, owner and source [story-formulieren-1: 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52].

## INVEST check ("INVEST-Selbstcheck durchführen", gateway "INVEST erfüllt?")

| Criterion | Pass question | Fail signs |
|---|---|---|
| Independent | Can it be built and shipped in any order? | only testable after another story |
| Negotiable | Is it an invitation to talk, not a spec? | exhaustive UI/technical detail on the card |
| Valuable | Does a real user or customer get value? | value only for developers/QA; "so that business improves" |
| Estimable | Can developers estimate it? | "no idea how long"; missing domain knowledge |
| Small | Fits one iteration (1–3 days of work)? | an epic; estimate above sprint velocity |
| Testable | Are there objective pass/fail criteria? | "must be fast", no test notes |

[story-formulieren-1: 33, 34, 35, 36, 37, 38, 39, 40, 41]. Also ask: *how will we demonstrate this in
the sprint review?* — it exposes missing flows or test data [story-formulieren-1: 28, 59]. If
"Estimable" fails because of technical uncertainty, a spike ("learning story") helps more than
rewording [story-formulieren-1: 60].

## Anti-patterns

Generic roles, fake/developer stories, template zombies, cards treated as contracts, premature UI
or technical specification [story-formulieren-1: 15, 16, 20, 22, 24, 25, 26, 32].
