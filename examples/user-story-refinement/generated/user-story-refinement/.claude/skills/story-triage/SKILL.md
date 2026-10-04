---
name: story-triage
description: Captures incoming user or stakeholder feedback as a problem statement and finds the related stories and epics in the GitHub backlog, so the team can decide bug, change to an open story, park, or new story. Use for "Feedback erfassen & als Problem formulieren" and "Verwandte Stories & Epics im Backlog suchen" in the user-story-refinement flow.
bpmn:
  file: user-story-refinement.bpmn
  elements: [I1, I2]
---

# Eingang & Triage

Phase 1 of `user-story-refinement`, lane "Product Owner / BA". Criteria and sources:
`${CLAUDE_SKILL_DIR}/references/domain-knowledge.md`.

## "Feedback erfassen & als Problem formulieren"

Input: raw feedback, its source and sender. Write `stories/<storyId>/01_feedback.md`:

- frontmatter `storyId`, `version: 1`, `status: captured`, `backlog`, `fachkonzept` (where they live);
- the feedback verbatim, source, sender, date;
- **Problem**: the observed user problem, not the wished-for solution. If the feedback is a
  technical solution with no user problem, say so — it is a fake-story candidate.

## "Verwandte Stories & Epics im Backlog suchen"

Input: `01_feedback.md`; the backlog in GitHub (read only). Repo and project come from `backlog` in
`01_feedback.md`. Epics are labels `epic:<name>`; the user story map is the project grouped by them.
Search by the problem's key terms and synonyms, always with `-R <owner/repo>` (or `--repo`), `--json`
with only the needed fields and a `--limit`; open single issues with `gh issue view`. A failed read
(not logged in, missing scope, wrong repo or project) is an error, not an empty result: show the raw
error and ask via `AskUserQuestion` whether to fix access and retry (recommended) or continue with the
risk "Backlog nicht gelesen" noted in the triage proposal. Append to `01_feedback.md`:

- **Related**: candidate epics (label) and stories (open, in progress, done), one line each with the
  issue URL, title, state, epic label and why it matches — the approval steps later take the target
  issue from this list;
- **Triage proposal** for the two gateways, with a one-line reason each, using their branch names:
  "Fehlverhalten einer bestehenden Funktion?" — "Ja (Bug)" / "Nein" (deviation from agreed
  acceptance criteria or rules?); "Wie hängt das Anliegen mit dem Backlog zusammen?" — "Ändert eine
  offene Story" (name the issue URL) / "Kein Epic-Bezug / kein Nutzen" / "Neue Story unter bestehendem Epic" (name it).

Set `status: triaged`. The calling skill confirms exits with the user; don't decide them here.

## Kontextquellen

Knowledge stores, distilled at generation time into one file per task; no tool call at run time. `${CLAUDE_SKILL_DIR}/references/domain-knowledge.md` keeps the phase-level criteria.

- **Product-Methodik: Eingang & Triage** (wissen): "Feedback erfassen & als Problem formulieren" → `${CLAUDE_SKILL_DIR}/references/I1.md`; "Verwandte Stories & Epics im Backlog suchen" → `${CLAUDE_SKILL_DIR}/references/I2.md`

Live and memory stores, used at run time:

- **Product Backlog & User Story Map** (live, read): "Verwandte Stories & Epics im Backlog suchen" searches stories by the problem's key terms with `Bash(gh search issues:*)` and `Bash(gh issue list:*)`, opens candidates with `Bash(gh issue view:*)` and reads the epic grouping with `Bash(gh project view:*)` and `Bash(gh project item-list:*)`.
