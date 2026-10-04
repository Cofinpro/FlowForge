---
element: D2a
evidence: cited
sources: ["The Product - Business Design"]
bpmn:
  file: user-story-refinement.bpmn
  elements: [D2a]
---

## Product-Methodik: Refinement

_Ort: notebook:The Product - Business Design_

**Task: "Wert & Fachregeln erläutern (Was)"** (PO). One of the Three Amigos perspectives; it prepares the
conversation with developers and testers, it does not replace it (see `phase-4-refinement.md`).

### Procedure

1. Open the session by introducing the story and a few initial scenarios of how the business side sees
   it working. Developer and tester probe afterwards, until everyone has enough information and all
   major risks are covered [^1].
2. Explain the value as an observable change in behaviour, not as a feature. Valuable initiatives
   produce an observable change in someone's way of working; a generic or missing value statement
   ("in order to improve business") is the cue to ask for the concrete change [^2].
3. State the **what** only (role, benefit, target users, constraints) and leave the **how** to the
   delivery team. The "In order to" part must not name a feature; the team proposes at least three
   solution options, because two options just get one of them picked [^3][^4].
4. Explain the business rules in examples: specific users, exact data, exact expected response [^5].
   Then play "what-about" on the rules underneath the UI: tough business rules, complex data
   validation, backend services [^6].
5. Time-box. One team limited each story to two 20-minute diverge/merge cycles; if the story is still
   vague afterwards, the PO either splits it (when the main scenarios are clear and only exceptions
   need clarification) or takes it out for detailed analysis [^7]. Park unresolved questions in a
   "parking lot" instead of debating them [^8].

**Inputs:** story card (role and benefit), initial scenarios and sample data, optional wireframes or
story map. **Outputs:** clarified business rules and an explicit in/out-of-scope boundary, agreed
test scenarios, a list of open questions, a shared understanding across the three roles
[^1][^9]. The notebook names no separate template for recording business rules; it points to
examples, "what-about" and the parking lot.

### Pitfalls

- The PO defines the whole solution instead of deciding what to build ("client-vendor anti-pattern"):
  suboptimal design and technical debt [^10].
- Delegating the session to whoever is free, so the actual developers and testers miss it; special
  cases then get discussed again in iteration planning [^11].
- A monologue: reading long narrative requirements to a passive team [^12].
- Rules discussed abstractly, without examples; major architecture impact handled in the small group
  instead of escalating to the whole team [^5][^13].

### Terminology

- **Three Amigos / Power of Three**: PO or analyst, developer and tester, immediately before a story
  is developed; four or five amigos is fine if the relevant roles are present [^9][^14].
- **What-about**: Patton's name for probing business rules, validation and back-end behaviour [^6].
- **Parking lot**: written list of open questions to come back to [^8].

[^1]: "Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014)", NotebookLM source, queried 2026-10-04 — "The typical way to run a three-amigo meeting is to start with the analyst or business representative introducing a story and presenting a few initial scenarios of how they would see a story working." (FAQ `store-phase-4-refinement-1`, [7])
[^2]: "Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014)", NotebookLM source, queried 2026-10-04 — "valuable initiatives produce an observable change in someone's way of working. This principle is a great way to start a conversation on the value of a story." (FAQ `store-phase-4-refinement-1`, [10])
[^3]: "Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014)", NotebookLM source, queried 2026-10-04 — "The product owner or XP customer should be responsible for deciding what the team will work on. But deciding isn't the same as defining." (FAQ `store-phase-4-refinement-1`, [8])
[^4]: "Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014)", NotebookLM source, queried 2026-10-04 — "The 'In order to…' part shouldn't say anything about what the software or the product does, only what the users will be able to do differently. Try to propose at least three options". (FAQ `store-phase-4-refinement-1`, [12])
[^5]: "Patton, User Story Mapping", NotebookLM source, queried 2026-10-04 — "Speak in examples. Wherever possible, use specific examples of what users do, exactly what data might be entered, exactly what users would see in response". (FAQ `store-phase-4-refinement-1`, [13])
[^6]: "Patton, User Story Mapping", NotebookLM source, queried 2026-10-04 — "Play 'What-About' … Talk about tough business rules, complex data validation, and nasty backend systems or services you'll need to connect with." (FAQ `store-phase-4-refinement-1`, [14])
[^7]: "Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014)", NotebookLM source, queried 2026-10-04 — "limit each story to two diverge and merge cycles of 20 minutes each. … the product owner can choose to split the story or to take it out for detailed analysis." (FAQ `store-phase-4-refinement-1`, [19])
[^8]: "Cohn, User Stories Applied (2004)", NotebookLM source, queried 2026-10-04 — "Maintain a parking lot of issues to come back to." (FAQ `store-phase-4-refinement-1`, [27])
[^9]: "Kelly, The Art of Agile Product Ownership (2019)", NotebookLM source, queried 2026-10-04 — "The Product Owner, Programmer(s) who will be developing the story, and the Tester meet together to discuss the story, agree acceptance criteria, and generally refine it there and then." (FAQ `store-phase-4-refinement-1`, [1])
[^10]: "Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014)", NotebookLM source, queried 2026-10-04 — "One of the most common mistakes with user stories is to expect business stakeholders to fully define the scope." (FAQ `store-phase-4-refinement-1`, [30])
[^11]: "Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014)", NotebookLM source, queried 2026-10-04 — "A common mistake teams make is to delegate the three-amigos analysis to whoever has time, so the people who actually end up delivering the software do not participate in the discussions." (FAQ `store-phase-4-refinement-1`, [32])
[^12]: "Patton, User Story Mapping", NotebookLM source, queried 2026-10-04 — "Reading the narratives to the team using a projector and asking for any questions Unfortunately, the outcomes were not so great. The elaboration sessions were flat and uninspiring". (FAQ `store-phase-4-refinement-1`, [31])
[^13]: "Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014)", NotebookLM source, queried 2026-10-04 — "If the three amigos end up discussing a major impact on the current architecture or some globally significant feature change, then it might be worth pausing the smaller discussion and continuing in a larger group with the whole team." (FAQ `store-phase-4-refinement-1`, [33])
[^14]: "Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014)", NotebookLM source, queried 2026-10-04 — "Four or five amigos is fine, as long as all the relevant roles are represented." (FAQ `store-phase-4-refinement-1`, [2])
