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

_Footnotes name the notebook source. The verbatim quotes and FAQ references stay with the generation output (`knowledge/`), which is not installed._

**Task: "Wert & Fachregeln erläutern (Was)"** (PO). One of the Three Amigos perspectives; it prepares the
conversation with developers and testers, it does not replace it (see `domain-knowledge.md`).

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

[^1]: "Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014)", NotebookLM source, queried 2026-10-04
[^2]: "Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014)", NotebookLM source, queried 2026-10-04
[^3]: "Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014)", NotebookLM source, queried 2026-10-04
[^4]: "Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014)", NotebookLM source, queried 2026-10-04
[^5]: "Patton, User Story Mapping", NotebookLM source, queried 2026-10-04
[^6]: "Patton, User Story Mapping", NotebookLM source, queried 2026-10-04
[^7]: "Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014)", NotebookLM source, queried 2026-10-04
[^8]: "Cohn, User Stories Applied (2004)", NotebookLM source, queried 2026-10-04
[^9]: "Kelly, The Art of Agile Product Ownership (2019)", NotebookLM source, queried 2026-10-04
[^10]: "Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014)", NotebookLM source, queried 2026-10-04
[^11]: "Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014)", NotebookLM source, queried 2026-10-04
[^12]: "Patton, User Story Mapping", NotebookLM source, queried 2026-10-04
[^13]: "Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014)", NotebookLM source, queried 2026-10-04
[^14]: "Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014)", NotebookLM source, queried 2026-10-04
