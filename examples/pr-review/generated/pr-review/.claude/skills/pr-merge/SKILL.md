---
name: pr-merge
description: Merges one approved pull request ("Pull Request mergen") — only the commit that was reviewed, only after the Tech Lead approved in "Merge freigeben". Use whenever the pr-review skill has that approval; never without it.
bpmn:
  file: pr-review.bpmn
  elements: [Task_Mergen]
---

# Pull Request mergen

Generated from `pr-review.bpmn`'s "Pull Request mergen" (serviceTask, lane "Tech Lead") by
`flowforge-generate`. Its own skill so the only write into the repository sits in one place, behind
one approval and the write-guard hook.

## Procedure

1. Check that `review-befund` has `status: final` and the Tech Lead's decision freigeben from "Merge freigeben". Without that approval do nothing.
2. Read `headSha` from `generated/pr-review/artifacts/review-befund/<prNummer>.md`.
3. Merge: `gh pr merge <prNummer> --squash --match-head-commit <headSha>` (see Kontextquellen). Squash was confirmed by the business user.
4. Gate (deterministic): merge only the reviewed commit; if someone pushed since, the merge stops and `pr-review` takes the Tech Lead back to "Merge freigeben" with that reason. Use no other flags (no `--admin`). If `gh` fails (conflict, branch protection, required checks), show the raw error to the Tech Lead and do not report End "Pull Request gemergt". Retry at most twice for transient errors, then hand over to the Tech Lead.

## Kontextquellen

- **Pull Requests im Repository** (live, write — nur nach Freigabe): merge the approved pull request with `Bash(gh pr merge:*)`. Only after the approval step "Merge freigeben" has confirmed it; Claude Code asks again at the call (write-guard hook). Without that confirmation, do not write.
