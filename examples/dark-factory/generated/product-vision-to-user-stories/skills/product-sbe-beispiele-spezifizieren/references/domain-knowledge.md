---
element: S6.1.2
evidence: cited
sources:
  - The Product - Business Design (NotebookLM)
  - docs/dark-factory/process-rules.md
bpmn:
  file: product-vision-to-user-stories.bpmn
  elements: [S6.1.2]
---

# Domain knowledge — Mit konkreten Beispielen spezifizieren (SBE)

**Speak in examples.** Wherever possible, use specific examples of what users do, exactly what data might be entered, exactly what users would see in response [^1].

**Order of work.** First confirmation notes, then concrete examples (SBE, real values, tables), then Given-When-Then [^2][^3][^1].

**Pass criteria (gate gherkin).** At least one happy path and at least one negative or exception path (limits, expired data, …); implementation-neutral [^2][^3].

**Panel (binding, Gedächtnis §6/§7).** Mode rating produces a table item × persona. Synthetic evidence 🤖 counts for gates in dark mode but is always labeled; 6.1.2 is an optional panel point and is the first to be skipped when the budget runs low (§9.4).

[^1]: "User Story Mapping" (Patton) — "Speak in examples. Wherever possible, use specific examples of what users do, exactly what data might be entered, exactly what users would see in response."
[^2]: "User Stories Applied" (Cohn 2004) — "A good story is: Independent, Negotiable, Valuable to users or customers, Estimatable, Small, Testable … Bill Wake (2003a) refers to this as 'slicing the cake.' Each story must have a little from each layer."
[^3]: "Fifty Quick Ideas to Improve Your User Stories" (Adzic et al. 2014) — "Fake stories are those about the needs of delivery team members … create small conversations that involve at least one person representing each of the development, testing and analysis roles."
