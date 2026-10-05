---
name: pr-review-reviewer
description: Runs the project's own tests and linter for the Reviewer lane of the pr-review workflow ("Tests und Linter ausführen") and writes the result as JSON. Use whenever the pr-review skill reaches that step; deterministic, no judgement.
bpmn:
  file: pr-review.bpmn
  elements: [Task_Tests]
---

# Reviewer lane: Tests und Linter ausführen

Generated from `pr-review.bpmn`'s "Tests und Linter ausführen" (scriptTask, lane "Reviewer") by
`flowforge-generate`. Lane skill: it only wraps the script, so the step never depends on LLM judgement.

## Procedure

1. Deterministic: run `node ${CLAUDE_SKILL_DIR}/scripts/run-tests-and-lint.mjs <repoDir> <outFile>` with the pull request's branch checked out in `<repoDir>` and `<outFile>` = `generated/pr-review/artifacts/testergebnis/<prNummer>.json`. No LLM judgement in this step.
2. Gate (deterministic):
   - The script runs only the project's own `test` and `lint` npm scripts, with a timeout (`PR_REVIEW_TEST_TIMEOUT_MS`, default 10 minutes).
   - `testergebnis.status` is `passed`, `failed` or `error`. A crash, a timeout or a missing command is `error`, never `passed` and never silently `hoch`: stop and ask the Reviewer via `AskUserQuestion` (fix and retry / continue without test result and say so in the Review-Befund).
   - A failed test is a finding of severity hoch; `pr-findings-merge` applies that.
