---
element: S6.2.3
evidence: cited
sources:
  - The Product - Business Design (NotebookLM)
  - docs/dark-factory/process-rules.md
bpmn:
  file: product-vision-to-user-stories.bpmn
  elements: [S6.2.3]
---

# Domain knowledge — Ubiquitous-Language-Konsistenz pruefen

**Ubiquitous language (Gedächtnis §13 `ubiquitous-language`).** One term per concept, no contradicting domain rules, every term in the glossary (Evans).

**DoR.** "Terms as in the glossary" is part of the Definition of Ready [^1][^2].

**Implementation-neutral ACs.** ACs use domain concepts, not selectors or SQL [^1][^3] — so the domain vocabulary in ACs is exactly what the glossary must cover.

**Examples expose terms.** Specific examples of what users do and see [^4] surface the concrete words the domain uses.

**Critic role (binding, Gedächtnis §4).** The critic evaluates against rubrics and never rewrites artifacts; findings go back as change requests. TERM items originate in 5.2.3 and 6.2.3 (§10.1).

[^1]: "User Stories Applied" (Cohn 2004) — "A good story is: Independent, Negotiable, Valuable to users or customers, Estimatable, Small, Testable … Bill Wake (2003a) refers to this as 'slicing the cake.' Each story must have a little from each layer."
[^2]: "Testing Business Ideas" (Bland, Osterwalder 2019) — "Before performing a spike, clearly define the acceptance criteria and time box … These can turn into never-ending research projects if left unchecked."
[^3]: "Fifty Quick Ideas to Improve Your User Stories" (Adzic et al. 2014) — "Fake stories are those about the needs of delivery team members … create small conversations that involve at least one person representing each of the development, testing and analysis roles."
[^4]: "User Story Mapping" (Patton) — "Speak in examples. Wherever possible, use specific examples of what users do, exactly what data might be entered, exactly what users would see in response."
