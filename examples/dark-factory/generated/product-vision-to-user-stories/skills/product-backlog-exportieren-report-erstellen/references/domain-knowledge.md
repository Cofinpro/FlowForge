---
element: S7
evidence: cited
sources:
  - The Product - Business Design (NotebookLM)
  - docs/dark-factory/process-rules.md
bpmn:
  file: product-vision-to-user-stories.bpmn
  elements: [S7]
---

# Domain knowledge — 7 Abschluss: Backlog exportieren & Run-Report erstellen

**Run outputs (binding, docs/dark-factory/implementation.md §6).** `backlog.json`: generic schema with epics, stories, ACs, trace, evidence and risk flags; adapters for Jira, GitHub Issues and Azure Boards come later. `REPORT.md` is the only place a human has to look: summary and MVP scope, evidence mix (🔗/🧠/🤖), all risk flags and forced loop exits, top-5 risk assumptions, pivot history, cost and runtime.

**Evidence (Gedächtnis §6).** Each item carries exactly one level; the artifact's evidence mix is aggregated for the run report; synthetic evidence counts for gates but is always labeled.

**Budget (Gedächtnis §9.4).** On exhaustion `Error_BudgetErschoepft` fires; the event subprocess saves the intermediate state and writes a run report with `status: partial`.

**Forced loop exits (Gedächtnis §9.1).** At iteration ≥ maxLoops the verdict is pass-with-risk and open criteria are inherited as risk flags by the artifact and all derived items.

**What a ready story looks like.** INVEST [^1]; testable enough to know when it is done [^2]; DoR includes at least one AC and no un-spiked risks [^1][^3]; fake stories (team needs) are not in the backlog [^4].

[^1]: "User Stories Applied" (Cohn 2004) — "A good story is: Independent, Negotiable, Valuable to users or customers, Estimatable, Small, Testable … Bill Wake (2003a) refers to this as 'slicing the cake.' Each story must have a little from each layer."
[^2]: "The Lean Product Playbook" (Olsen) — "Small: Good stories tend to be small in scope. Larger stories will have greater uncertainty … Testable: A good story provides enough information to make it clear how to test that the story is 'done'."
[^3]: "Testing Business Ideas" (Bland, Osterwalder 2019) — "Before performing a spike, clearly define the acceptance criteria and time box … These can turn into never-ending research projects if left unchecked."
[^4]: "Fifty Quick Ideas to Improve Your User Stories" (Adzic et al. 2014) — "Fake stories are those about the needs of delivery team members … create small conversations that involve at least one person representing each of the development, testing and analysis roles."
