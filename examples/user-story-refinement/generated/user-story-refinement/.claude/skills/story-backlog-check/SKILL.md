---
name: story-backlog-check
description: Checks a ready user story for plausibility against the rest of the GitHub backlog — duplicates and overlaps, consistency with existing flows, dependencies and order, acceptance criteria against other stories and the living documentation — merges the findings and proposes changes to affected stories, reading the backlog only. Use for the "Plausibilität gegen Backlog & Freigabe" phase of the user-story-refinement flow; the approved changes are written later by story-backlog-publish.
bpmn:
  file: user-story-refinement.bpmn
  elements: [P1, P7, P3, P2, P4, P5]
---

# Plausibilität gegen Backlog

Phase 6 of `user-story-refinement`. Criteria and sources:
`${CLAUDE_SKILL_DIR}/references/domain-knowledge.md`. This skill only reads the backlog: every change
it finds goes into `09_aenderungsvorschlaege.md` as a proposal; `story-backlog-publish` writes it after
the approval.

**Reading the backlog.** Repo and project come from `backlog` in `01_feedback.md`. Always pass
`-R <owner/repo>` (or `--repo` for `gh search issues`), ask for `--json` with only the fields you need
and a `--limit`, and open single issues on demand with `gh issue view`. A failed read (not logged in,
missing scope, wrong repo or project) is an error, not an empty result: show the raw error and ask
via `AskUserQuestion` whether to fix access and retry (recommended) or continue with the risk
"Backlog nicht gelesen" written into `08_plausibilitaet.md`. Record per perspective the query, the
outcome and the number of hits.

## Four perspectives → `stories/<storyId>/08_plausibilitaet.md`

Frontmatter `storyId`, `version`, `status: draft`. Write each section before reading the others;
review as someone other than the story's author would.

- **"Auf Duplikate & Überschneidungen prüfen"** (PO / BA): stories with the same or overlapping
  goal, the same concept under another name.
- **"Konsistenz mit bestehenden Abläufen prüfen"** (UX): deviations from interaction patterns of
  other stories in the same user task.
- **"Abhängigkeiten & Reihenfolge prüfen"** (Entwicklung): predecessors, successors, shared
  components, conflicts with the release's non-functional targets.
- **"Akzeptanzkriterien gegen bestehende Stories abgleichen"** (QA): contradicting Given-When-Then
  scenarios or rules versus other stories and the living documentation.

## "Plausibilitätsbefund zusammenführen" (Product Owner / BA)

From the file only: duplicates, contradictions, dependencies, affected stories; then a **proposal**
for "Konsistent mit dem übrigen Backlog?": Ja / Widerspruch zu anderen Stories / Duplikat einer
bestehenden Story, with the reason. `status: done`.

## "Anpassungen an betroffenen Stories vorschlagen" (only for "Ja")

From the findings: one entry per affected or superseded story under `proposals` in
`09_aenderungsvorschlaege.md` — target issue URL, the exact note to post (what to change, dependency
link, reason), `baseUpdatedAt` from `gh issue view <url> -R <repo> --json updatedAt`, `decision` empty.
No findings → write "keine". `status: proposed`. Nothing is written into the backlog here.

## Kontextquellen

Knowledge stores, distilled at generation time into one file per task; no tool call at run time. `${CLAUDE_SKILL_DIR}/references/domain-knowledge.md` keeps the phase-level criteria.

- **Product-Methodik: Plausibilität & Freigabe** (wissen): "Auf Duplikate & Überschneidungen prüfen" → `${CLAUDE_SKILL_DIR}/references/P1.md`; "Plausibilitätsbefund zusammenführen" → `${CLAUDE_SKILL_DIR}/references/P4.md`; "Anpassungen an betroffenen Stories vorschlagen" → `${CLAUDE_SKILL_DIR}/references/P5.md`

Live and memory stores, used at run time:

- **Product Backlog: übrige Stories** (live, read): "Auf Duplikate & Überschneidungen prüfen" searches open and done stories with the same goal or concept with `Bash(gh search issues:*)` and `Bash(gh issue list:*)`; "Abhängigkeiten & Reihenfolge prüfen" lists the project's items and their order with `Bash(gh project item-list:*)`; "Akzeptanzkriterien gegen bestehende Stories abgleichen" reads the scenarios of candidate stories with `Bash(gh issue view:*)`.
