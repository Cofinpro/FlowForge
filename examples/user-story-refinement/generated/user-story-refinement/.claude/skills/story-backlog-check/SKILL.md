---
name: story-backlog-check
description: Checks a ready user story for plausibility against the rest of the backlog — duplicates and overlaps, consistency with existing flows, dependencies and order, acceptance criteria against other stories and the living documentation — merges the findings, and writes merge and adjustment proposals for affected stories without touching the backlog. Use for the "Plausibilität gegen Backlog & Freigabe" phase of the user-story-refinement flow.
bpmn:
  file: user-story-refinement.bpmn
  elements: [P1, P7, P3, P2, P4, P5, P6]
---

# Plausibilität gegen Backlog

Phase 6 of `user-story-refinement`. Criteria and sources:
`${CLAUDE_SKILL_DIR}/references/domain-knowledge.md`. The backlog and other stories are read-only:
everything that would change them goes into `09_aenderungsvorschlaege.md` for the team.

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

## "Mit bestehender Story zusammenführen" (only for "Duplikat")

Write the merge proposal to `09_aenderungsvorschlaege.md`: target story, the acceptance criteria and
the feedback link to add, combined estimate if several overlap (`status: merge-proposed`). Set
`04_story.md` to `status: merge-proposed`. The calling skill asks before the merge counts as done.

## "Betroffene Stories zur Anpassung markieren" (only for "Ja")

From the findings: one entry per affected or superseded story in `09_aenderungsvorschlaege.md`
(story, what to change, dependency link, reason). No findings → write "keine".
`status: proposed`.
