---
element: Task_Sicherheit
evidence: cited
sources: ["docs/review-guidelines.md", "https://tessl.io/registry/skills/github/nearai/ironclaw/security-review"]
bpmn:
  file: pr-review.bpmn
  elements: [Task_Sicherheit]
---

## Review-Richtlinien (Sicherheit)

_Ort: datei:docs/review-guidelines.md (not yet drawn as a read for this task; see open question)_

_Footnotes name the notebook source. The verbatim quotes and FAQ references stay with the generation output (`knowledge/`), which is not installed._

The team's rules for this step [^1]:

- No credentials, tokens or keys in code or test data.
- Input from outside is validated before it reaches queries, paths or shell calls.
- New dependencies need a reason in the PR description.
- A security finding with severity "hoch" is always critical.

## WebSearch: security review checklist

_Ort: websearch_

Complements the team rules [^2]:

- Secrets: none in code, configs or fixtures; credentials come from environment variables or secret stores.
- Input: user-controlled input is validated against an allowlist and encoded to prevent injection, path traversal and SSRF.
- Dependencies: check for known CVEs and maintainer reputation; lock files are committed.
- On large PRs, look first at files that handle authentication, user input, configuration and new dependencies.

[^1]: "Review-Richtlinien", docs/review-guidelines.md, section "Sicherheit"
[^2]: "security review", Tessl registry (nearai/ironclaw), https://tessl.io/registry/skills/github/nearai/ironclaw/security-review
