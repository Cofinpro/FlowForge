---
element: SP5.1
evidence: cited
sources: ["The Product - Business Design (NotebookLM)", "docs/dark-factory/process-rules.md"]
bpmn:
  file: product-vision-to-user-stories.bpmn
  elements: [S5.1.1, S5.1.3, S5.1.4, S5.2.1, S5.2.2, S5.2.3, S5.2.4, S6.1.1, S6.1.2, S6.1.3, S6.1.4, S6.2.3, S6.2.4, S7]
---

# Phase 5–6: Stories, splitting, refinement, acceptance criteria, backlog hygiene

Distilled from notebook "The Product - Business Design", queried 2026-09-25. Item IDs, the
required trace chain and the fake-story definition are binding from
`process-rules.md` (next to this file) §10.

## Story card and INVEST (5.1.1, gate `invest`)

- Connextra: "As a <concrete role/persona>, I want <goal>, so that <user or business outcome>";
  active voice, one user, no UI assumptions [^1].
- INVEST: Independent, Negotiable, Valuable (to users or purchasers), Estimable, Small, Testable [^1][^2].
- Card, Conversation, Confirmation: a card is a placeholder for a conversation, not a contract [^1].

## Splitting (5.1.3) and spikes (5.1.4)

- Split vertically through all layers ("slice the cake"), never by technical layer [^1].
- Patterns: by business rule, option or channel; hard-coded reference data first, live sources
  later; output-first; simplified outputs (files instead of a data warehouse); basic utility vs.
  skeleton on crutches; the user story hamburger when stuck [^1][^3].
- A spike has a timebox, a question, and acceptance criteria defined in advance [^4][^1].

## Refinement (5.2.x) and Definition of Ready (gate `dor`)

- Three amigos: at least one person per perspective (business, development, testing). The protocol
  records What (BLA), How (ARC) and edge cases (QA). Four or five amigos are fine if needed [^3].
- DoR: Connextra with a concrete role; INVEST fulfilled; at least one AC; low-fi wireframe as a
  text or Mermaid sketch; no open blockers or un-spiked risks; size ≤ M; terms as in the glossary [^1][^4].

## Acceptance criteria (6.1.x, gate `gherkin`)

- First confirmation notes on the back of the card, then concrete examples (SBE, real values,
  tables), then Given-When-Then [^1][^3][^5].
- Pass: at least one happy path and at least one negative or exception path (limits, expired
  data, …); implementation-neutral (no selectors, no SQL) [^1][^3].

## Backlog hygiene (6.2.3–6.2.4)

- Fake story: a need inside the team's own zone of control, e.g. "As a QA, I want database
  restarts automated". Micro-stories are fine if the hierarchy is tracked. A misleading story
  describes a solution instead of the need [^3].
- Technical stories without an outcome are the typical symptom of choosing Small over Valuable [^3].
- Ubiquitous language: one term per concept, no contradicting domain rules, every term in the
  glossary (Gedächtnis §13 `ubiquitous-language`).

## Source suggestions not adopted (decision 2026-09-25)

A global quality pyramid (cross-cutting NFR checklist), an early zone-of-control check already in
5.1, and "best before" dates on stories [^3]. They stay a candidate for a later BPMN revision.
Fake stories are still removed in 6.2.4.

[^1]: "User Stories Applied" (Cohn 2004) — "A good story is: Independent, Negotiable, Valuable to users or customers, Estimatable, Small, Testable … Bill Wake (2003a) refers to this as 'slicing the cake.' Each story must have a little from each layer."
[^2]: "The Lean Product Playbook" (Olsen) — "Small: Good stories tend to be small in scope. Larger stories will have greater uncertainty … Testable: A good story provides enough information to make it clear how to test that the story is 'done'."
[^3]: "Fifty Quick Ideas to Improve Your User Stories" (Adzic et al. 2014) — "Fake stories are those about the needs of delivery team members … create small conversations that involve at least one person representing each of the development, testing and analysis roles."
[^4]: "Testing Business Ideas" (Bland, Osterwalder 2019) — "Before performing a spike, clearly define the acceptance criteria and time box … These can turn into never-ending research projects if left unchecked."
[^5]: "User Story Mapping" (Patton) — "Speak in examples. Wherever possible, use specific examples of what users do, exactly what data might be entered, exactly what users would see in response."
