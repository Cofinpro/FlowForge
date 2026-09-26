---
element: SP3.1
evidence: cited
sources: ["The Product - Business Design (NotebookLM)", "docs/dark-factory/process-rules.md"]
bpmn:
  file: product-vision-to-user-stories.bpmn
  elements: [S3.1.1, S3.1.2, S3.1.3, S3.1.4, S4.1.1, S4.1.2, S4.1.3, S4.1.4, S4.1.5, S4.2.1, S4.2.2, S4.2.3, S4.2.4, S4.2.5]
---

# Phase 3–4: Journey, service blueprint, story map, release slicing

Distilled from notebook "The Product - Business Design", queried 2026-09-25.

## Customer journey, current and future state (3.1.1–3.1.3)

- Pick a persona and a scenario or job; lay out the stages Before, During and After; for each step
  record actions, touchpoints, thoughts and an emotion curve; mark hot spots and moments of truth [^1][^2].
- Pass: outside-in (what the user experiences, not internal process steps); end to end, starting
  before first contact and ending after the transaction; every action tied to a touchpoint or
  channel [^1][^2].
- Pitfall: confusing a process map with a journey map [^1].
- Dark-factory rule: panel `walkthrough` comments on each journey step (Gedächtnis §7.5); every
  hot spot is either addressed in the future state or skipped with a reason (rubric `journey`).

## Service blueprint (3.1.4)

- Swimlanes: customer actions | line of interaction | frontstage | **line of visibility** |
  backstage | line of internal interaction | support processes and IT systems [^3].
- Pass: strict separation at the line of visibility; every frontstage interaction traces down to a
  backstage process or system; backstage complexity is rated [^3].

## Story mapping (4.1.1–4.1.5, after Patton)

1. Set the frame: personas, problem and goals written above the map [^4].
2. Tell the big picture as a narrative from left to right [^4].
3. Distil the backbone: activities (top row, candidate epics) and tasks (the walking level) [^5].
4. Explore details, alternatives, edge cases, and play "What-About" [^5].
5. Walk the map: find missing steps, admin tasks and system dependencies [^5].

- Pass: 2D grid (horizontal is narrative, vertical is priority); the backbone is
  solution-independent; no orphaned cards [^4][^6].
- Pitfall: the flat backlog trap, meaning a linear list without narrative context [^6].

## Release slicing, walking skeleton, MVP (4.2.1–4.2.5)

- Walking skeleton or steel thread: a thin slice end to end through all layers across all backbone
  activities. Adzic's variant "skeleton on crutches" uses a manual backend to validate the front
  end earlier [^5][^6].
- Opening game (essential end-to-end flow plus risky items) → midgame (optional steps, business
  rules) → endgame (refinement, efficiency) [^5].
- MVP: a balanced vertical slice (feasible, valuable, usable, delightful), not one technical
  layer; it must yield learning toward a goal [^7].
- Pitfall: horizontal cake slicing; the "all must-have" priority-one paradox under MoSCoW [^6][^7].
- Dark-factory rule: value vs. effort discloses its inputs and formula (rubric `scoring`); the MVP
  fits the budget and timebox from the idea brief (rubric `mvp`).

## Source suggestions not adopted

Impact map as a pre-filter (a story map only for the top impact), Purpose Alignment instead of
MoSCoW, and output-first or hamburger slicing [^6]. The last one is used inside 5.1.3 splitting
patterns. The first two were not raised as design questions.

[^1]: "The Journey Mapping Playbook" (Angrave 2020) — "The customer journey is not about your process maps. Their journey may start well before any contact with you and may carry on well beyond their last interaction with you."
[^2]: "The Design Thinking Toolbox" (Lewrick et al. 2020) — "Define what happens BEFORE, DURING, and AFTER the actual experience … Supplement what the persona thinks … and the emotion he/she feels."
[^3]: "Mapping Experiences" (Kalbach 2020) — "The line of visibility separates onstage touchpoints from backstage actions … Support processes … indirectly impact the customer experience."
[^4]: "Mapping Experiences" (Kalbach 2020) — "Frame the idea … Write your responses down at the top of the map. Map the big picture … Explore … Create a release strategy."
[^5]: "User Story Mapping" (Patton) — "I call this first slice a functional walking skeleton … Opening game: Focus on the essential features or user steps that cross through the entire product … Midgame … Endgame."
[^6]: "Fifty Quick Ideas to Improve Your User Stories" (Adzic et al. 2014) — "A story map is a grid where the horizontal axis represents steps in a high-level user activity, and the vertical axis represents the software delivery schedule." / "put it on crutches and ship it out."
[^7]: "Lean Enterprise" (Humble, Molesky, O'Reilly) — "Minimum Viable Product: build a slice across instead of one layer at a time … valuable, usable, and feasible … to which we add 'delightful'."
