---
element: S4.1.3
evidence: cited
sources:
  - The Product - Business Design (NotebookLM)
  - docs/dark-factory/process-rules.md
bpmn:
  file: product-vision-to-user-stories.bpmn
  elements: [S4.1.3]
---

# Domain knowledge — Backbone destillieren (Activities & Tasks)

- Story mapping step 3: distil the backbone — activities (top row, candidate epics) and tasks (the walking level) [^1].
- Pass: 2D grid (horizontal is narrative, vertical is priority); the backbone is solution-independent; no orphaned cards [^2][^3].
- A story map is a grid where the horizontal axis represents steps in a high-level user activity and the vertical axis the delivery schedule [^3].
- Pitfall: the flat backlog trap, meaning a linear list without narrative context [^3].
- Item prefixes: `ACTV` = user activity (epic candidate), `UT` = user task, `EP` = epic, all created in 4.1.3; format `<PREFIX>-<nnn>`, never reused (Gedächtnis §10.1).
- Mandatory chain `AC → ST → UT → EP/ACTV → (OPP | JOB) → IMP → GOAL → VIS`; orphans are found deterministically in 6.2.1/6.2.2 (Gedächtnis §10.2).

[^1]: "User Story Mapping" (Patton) — "I call this first slice a functional walking skeleton … Opening game: Focus on the essential features or user steps that cross through the entire product … Midgame … Endgame."
[^2]: "Mapping Experiences" (Kalbach 2020) — "Frame the idea … Write your responses down at the top of the map. Map the big picture … Explore … Create a release strategy."
[^3]: "Fifty Quick Ideas to Improve Your User Stories" (Adzic et al. 2014) — "A story map is a grid where the horizontal axis represents steps in a high-level user activity, and the vertical axis represents the software delivery schedule." / "put it on crutches and ship it out."
