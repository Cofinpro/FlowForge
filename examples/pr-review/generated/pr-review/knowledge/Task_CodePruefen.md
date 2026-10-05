---
element: Task_CodePruefen
evidence: cited
sources: ["docs/review-guidelines.md"]
bpmn:
  file: pr-review.bpmn
  elements: [Task_CodePruefen]
---

## Review-Richtlinien

_Ort: datei:docs/review-guidelines.md_

Severity scale [^1]:

- **hoch**: logic error, data loss, security hole, failed test. Blocks the merge.
- **mittel**: missing test for new behaviour, unclear error handling, duplicated code.
- **niedrig**: naming, comments, formatting the linter does not catch.

What to check in the code [^1]:

- A change does one thing. A pull request that mixes refactoring and new behaviour is a finding.
- New behaviour needs a test that fails without the change.
- Errors are handled or deliberately passed on, never swallowed.
- Names describe what something is, not how it was built.

Critical means a finding of severity hoch [^1].

[^1]: "Review-Richtlinien", docs/review-guidelines.md, sections "Schweregrade", "Code prüfen" and "Kritisch" — "Kritisch ist ein Befund mit Schweregrad hoch."
