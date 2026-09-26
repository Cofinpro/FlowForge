---
element: S6.1.4
evidence: cited
sources:
  - The Product - Business Design (NotebookLM)
  - docs/dark-factory/process-rules.md
bpmn:
  file: product-vision-to-user-stories.bpmn
  elements: [S6.1.4]
---

# Domain knowledge — Fachliche vs. technische Testerwartungen abgleichen

**Pass criteria (gate gherkin).** At least one happy path and at least one negative or exception path; implementation-neutral (no selectors, no SQL) [^1][^2].

**Testable.** A good story provides enough information to make it clear how to test that the story is "done" [^3].

**Three perspectives.** Development and testing perspectives are part of every story conversation [^2]; here ARC contributes the How-side view of testability.

**Small vs. Valuable.** Technical stories without an outcome are the typical symptom of choosing Small over Valuable [^2] — the same applies to technical ACs without an observable outcome.

**Role (Gedächtnis §4).** ARC is the technical perspective and needs the target architecture/platform from the idea brief (§14).

[^1]: "User Stories Applied" (Cohn 2004) — "A good story is: Independent, Negotiable, Valuable to users or customers, Estimatable, Small, Testable … Bill Wake (2003a) refers to this as 'slicing the cake.' Each story must have a little from each layer."
[^2]: "Fifty Quick Ideas to Improve Your User Stories" (Adzic et al. 2014) — "Fake stories are those about the needs of delivery team members … create small conversations that involve at least one person representing each of the development, testing and analysis roles."
[^3]: "The Lean Product Playbook" (Olsen) — "Small: Good stories tend to be small in scope. Larger stories will have greater uncertainty … Testable: A good story provides enough information to make it clear how to test that the story is 'done'."
