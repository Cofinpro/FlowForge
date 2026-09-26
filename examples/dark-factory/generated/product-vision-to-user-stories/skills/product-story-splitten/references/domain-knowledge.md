---
element: S5.1.3
evidence: cited
sources:
  - The Product - Business Design (NotebookLM)
  - docs/dark-factory/process-rules.md
bpmn:
  file: product-vision-to-user-stories.bpmn
  elements: [S5.1.3]
---

# Domain knowledge — Splitting-Muster anwenden

**Split vertically.** Split through all layers ("slice the cake"), never by technical layer [^1].

**Splitting patterns** [^1][^2]:
- by business rule, option or channel;
- hard-coded reference data first, live sources later;
- output-first;
- simplified outputs (files instead of a data warehouse);
- basic utility vs. skeleton on crutches;
- the user story hamburger when stuck.

**Why small.** Larger stories carry greater uncertainty [^3]; in the dark factory Small = size class ≤ M, and L forces splitting (Gedächtnis §4).

**Small vs. Valuable.** Technical stories without an outcome are the typical symptom of choosing Small over Valuable [^2] — a split that loses the outcome is a bad split.

**IDs (binding, Gedächtnis §10.1).** IDs are stable per run and never reused, even after an item is discarded or superseded.

[^1]: "User Stories Applied" (Cohn 2004) — "A good story is: Independent, Negotiable, Valuable to users or customers, Estimatable, Small, Testable … Bill Wake (2003a) refers to this as 'slicing the cake.' Each story must have a little from each layer."
[^2]: "Fifty Quick Ideas to Improve Your User Stories" (Adzic et al. 2014) — "Fake stories are those about the needs of delivery team members … create small conversations that involve at least one person representing each of the development, testing and analysis roles."
[^3]: "The Lean Product Playbook" (Olsen) — "Small: Good stories tend to be small in scope. Larger stories will have greater uncertainty … Testable: A good story provides enough information to make it clear how to test that the story is 'done'."
