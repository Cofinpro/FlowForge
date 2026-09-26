---
element: S6.1.3
evidence: cited
sources:
  - The Product - Business Design (NotebookLM)
  - docs/dark-factory/process-rules.md
bpmn:
  file: product-vision-to-user-stories.bpmn
  elements: [S6.1.3]
---

# Domain knowledge — In Given-When-Then formalisieren

**Order of work.** First confirmation notes, then concrete examples (SBE, real values, tables), then Given-When-Then [^1][^2][^3].

**Pass criteria (gate gherkin).** Valid Given-When-Then; at least one happy path and at least one negative or exception path (limits, expired data, …); implementation-neutral (no selectors, no SQL); SBE examples with concrete values [^1][^2].

**Testable.** A good story provides enough information to make it clear how to test that the story is "done" [^4].

**Trace (binding, Gedächtnis §10).** AC items originate in 6.1.3; required chain AC → ST → UT → EP/ACTV → (OPP | JOB) → IMP → GOAL → VIS. IDs are never reused.

[^1]: "User Stories Applied" (Cohn 2004) — "A good story is: Independent, Negotiable, Valuable to users or customers, Estimatable, Small, Testable … Bill Wake (2003a) refers to this as 'slicing the cake.' Each story must have a little from each layer."
[^2]: "Fifty Quick Ideas to Improve Your User Stories" (Adzic et al. 2014) — "Fake stories are those about the needs of delivery team members … create small conversations that involve at least one person representing each of the development, testing and analysis roles."
[^3]: "User Story Mapping" (Patton) — "Speak in examples. Wherever possible, use specific examples of what users do, exactly what data might be entered, exactly what users would see in response."
[^4]: "The Lean Product Playbook" (Olsen) — "Small: Good stories tend to be small in scope. Larger stories will have greater uncertainty … Testable: A good story provides enough information to make it clear how to test that the story is 'done'."
