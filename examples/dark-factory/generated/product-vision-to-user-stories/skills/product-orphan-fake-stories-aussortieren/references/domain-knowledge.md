---
element: S6.2.4
evidence: cited
sources:
  - The Product - Business Design (NotebookLM)
  - docs/dark-factory/process-rules.md
bpmn:
  file: product-vision-to-user-stories.bpmn
  elements: [S6.2.4]
---

# Domain knowledge — Orphan- & Fake-Stories aussortieren

**Fake story.** A need inside the team's own zone of control, e.g. "As a QA, I want database restarts automated" [^1]. Binding definition (Gedächtnis §10.2): story without user value (role is the own team), duplicate (semantically equal story), or story with a purely technical "so that"; judged in 6.2.4 by the critic.

**Misleading story.** Describes a solution instead of the need [^1].

**Micro-stories** are fine if the hierarchy is tracked [^1].

**Small vs. Valuable.** Technical stories without an outcome are the typical symptom of choosing Small over Valuable [^1]; Valuable means valuable to users or purchasers [^2].

**Orphan (binding, Gedächtnis §10.2).** An item without a complete path along AC → ST → UT → EP/ACTV → (OPP | JOB) → IMP → GOAL → VIS; found deterministically in 6.2.1/6.2.2 by graph traversal, without LLM. IDs are never reused, even after discarding (§10.1).

[^1]: "Fifty Quick Ideas to Improve Your User Stories" (Adzic et al. 2014) — "Fake stories are those about the needs of delivery team members … create small conversations that involve at least one person representing each of the development, testing and analysis roles."
[^2]: "User Stories Applied" (Cohn 2004) — "A good story is: Independent, Negotiable, Valuable to users or customers, Estimatable, Small, Testable … Bill Wake (2003a) refers to this as 'slicing the cake.' Each story must have a little from each layer."
