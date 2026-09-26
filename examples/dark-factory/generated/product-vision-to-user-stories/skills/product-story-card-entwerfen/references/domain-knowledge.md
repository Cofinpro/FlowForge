---
element: S5.1.1
evidence: cited
sources:
  - The Product - Business Design (NotebookLM)
  - docs/dark-factory/process-rules.md
bpmn:
  file: product-vision-to-user-stories.bpmn
  elements: [S5.1.1]
---

# Domain knowledge — Story Card entwerfen (Connextra)

**Connextra form.** "As a <concrete role/persona>, I want <goal>, so that <user or business outcome>"; active voice, one user, no UI assumptions [^1].

**INVEST** — Independent, Negotiable, Valuable (to users or purchasers), Estimable, Small, Testable [^1][^2]. In the dark factory "Small" means size class ≤ M; L forces splitting (Gedächtnis §4). Larger stories carry greater uncertainty, and a testable story makes clear how to check it is done [^2].

**Card, Conversation, Confirmation.** A card is a placeholder for a conversation, not a contract [^1] — keep solution detail out of the card; it is negotiated in 5.2.

**Vertical slices.** Each story must have a little from each layer ("slicing the cake") [^1].

**Trace and assumptions (binding, Gedächtnis §10.2).** Required chain AC → ST → UT → EP/ACTV → (OPP | JOB) → IMP → GOAL → VIS. Every story lists the unvalidated ASM items (low evidence) its path rests on.

**Fake stories** are about the needs of delivery team members [^3]; they are removed in 6.2.4, so do not write them here.

[^1]: "User Stories Applied" (Cohn 2004) — "A good story is: Independent, Negotiable, Valuable to users or customers, Estimatable, Small, Testable … Bill Wake (2003a) refers to this as 'slicing the cake.' Each story must have a little from each layer."
[^2]: "The Lean Product Playbook" (Olsen) — "Small: Good stories tend to be small in scope. Larger stories will have greater uncertainty … Testable: A good story provides enough information to make it clear how to test that the story is 'done'."
[^3]: "Fifty Quick Ideas to Improve Your User Stories" (Adzic et al. 2014) — "Fake stories are those about the needs of delivery team members … create small conversations that involve at least one person representing each of the development, testing and analysis roles."
