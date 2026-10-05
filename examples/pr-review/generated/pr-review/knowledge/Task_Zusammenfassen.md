---
element: Task_Zusammenfassen
evidence: cited
sources: ["https://developers.google.com/blockly/guides/modify/contribute/write_a_good_pr", "https://kodus.io/en/best-practices-for-pull-requests/"]
bpmn:
  file: pr-review.bpmn
  elements: [Task_Zusammenfassen]
---

## WebSearch: pull request summaries

_Ort: websearch (fallback for a lane without a drawn knowledge source)_

A useful summary tells a reviewer what changed, why, how it was tested and where the risk is [^1].

Procedure:

1. State the purpose of the change first, not just a ticket number [^1].
2. List the key modifications (files, modules); no line-by-line account [^1].
3. Link the related issue so the reviewer can compare the change with the requirement [^1].
4. Name the testing evidence (environment, edge cases, coverage), not just "tested locally" [^1].
5. Surface the risk and trade-offs early; keep the summary around 200-400 words depending on PR size [^2].

Output of this step (from the diagram): what changes, which files and modules are affected, how large the risk is.

[^1]: "Write a good pull request", Blockly docs, https://developers.google.com/blockly/guides/modify/contribute/write_a_good_pr — a good PR needs to help reviewers understand what changed, why, how to test it and where there is risk (via WebSearch, 2026-10-05).
[^2]: "Pull Request Best Practices: Checklist, Template, and Review Tips", Kodus, https://kodus.io/en/best-practices-for-pull-requests/ — descriptions of 200-400 words with trade-offs surfaced early (via WebSearch snippet, 2026-10-05).
