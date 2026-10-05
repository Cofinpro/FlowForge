---
name: pr-findings-merge
description: Merges the findings of code review, tests and security review into one deduplicated, severity-sorted Review-Befund with a recommendation kritisch or unkritisch ("Befunde zusammenführen"). Use whenever the pr-review skill has all three results and reaches that step.
bpmn:
  file: pr-review.bpmn
  elements: [Task_Zusammenfuehren]
---

# Befunde zusammenführen

Generated from `pr-review.bpmn`'s "Befunde zusammenführen" (serviceTask, lane "Reviewer") by
`flowforge-generate`. Its own skill because it owns the severity scale and the `review-befund` artifact
that both loops and the Tech Lead's decision read.

## Procedure

1. Read `befund-code`, `testergebnis` and `befund-sicherheit` for the pull request (all required). Wait for all three, even when one reports a failure.
2. Turn each failure in `testergebnis` into a finding of severity hoch. A `testergebnis` with status `error` is not a finding: stop and report it to the Reviewer.
3. Deduplicate by file and line, keep the highest severity of merged findings, sort by severity (hoch, mittel, niedrig). Severity scale and the definition of critical: `references/Task_Zusammenfuehren.md`.
4. Write `generated/pr-review/artifacts/review-befund/<prNummer>.md`. Frontmatter: `version` (rounds so far; preserved here, incremented by `pr-review`), `status` (`draft`), `kritischRounds`, `freigabeRounds` (only preserve the existing counters and create them as 0; the `pr-review` skill increments them), `maxSeverity`, `recommendation` (`kritisch` when `maxSeverity` is hoch, else `unkritisch`; derive it, never set it by hand), `capReached` (false), `headSha` (the pull request's current head commit). Body: the findings and the recommendation.
5. Gate (deterministic): critical means at least one finding of severity hoch. The routing and the cap (`kritischRounds`, `capReached`, the risk note) belong to the `pr-review` skill; do not change the counters here.

## Kontextquellen

Knowledge stores, distilled at generation time into one file per task; no tool call at run time.

- **WebSearch** (research done at generation time, no drawn store): merge procedure and the severity scale → `${CLAUDE_SKILL_DIR}/references/Task_Zusammenfuehren.md`

