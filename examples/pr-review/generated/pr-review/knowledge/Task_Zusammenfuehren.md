---
element: Task_Zusammenfuehren
evidence: cited
sources: ["https://playbooks.com/skills/wshobson/agents/multi-reviewer-patterns", "docs/review-guidelines.md"]
bpmn:
  file: pr-review.bpmn
  elements: [Task_Zusammenfuehren]
---

## WebSearch: consolidating review findings

_Ort: websearch_

Procedure for merging findings from several reviewers [^1]:

1. Group findings that point at the same file and line.
2. Decide whether they describe the same issue; merge duplicates and keep the more detailed description.
3. Keep the highest severity among merged findings.
4. Report grouped by severity, each with location, dimension, description, impact and fix, plus an overall recommendation.

Severity scale for this team (the workflow follows the guidelines, not the diagram's wording) [^2]:

- hoch: logic error, data loss, security hole, failed test. Blocks the merge and is the only critical level.
- mittel: missing test for new behavior, unclear error handling, duplicated code.
- niedrig: naming, comments, formatting the linter misses.

[^1]: "multi-reviewer-patterns", wshobson/agents, https://playbooks.com/skills/wshobson/agents/multi-reviewer-patterns — deduplication by file:line, highest severity wins, consolidated report by severity (via WebSearch snippet, 2026-10-05).
[^2]: "Review-Richtlinien", docs/review-guidelines.md, section "Schweregrade" and "Kritisch" — "Kritisch ist ein Befund mit Schweregrad hoch."
