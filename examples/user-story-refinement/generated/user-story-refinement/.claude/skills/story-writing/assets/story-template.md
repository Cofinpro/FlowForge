---
bpmn:
  file: user-story-refinement.bpmn
  elements: [C1, C2, C3, C4]
---

<!-- Template for stories/<storyId>/04_story.md. Replace this frontmatter with the story's own: -->
<!--
storyId: US-20260926-kurzname
version: 1
status: invest-ok            # invest-failed | invest-ok | split | merge-proposed | ready | discarded
epic: <epic id and title>
feedback: stories/<storyId>/01_feedback.md
parentStory: null            # set for part stories after a split
-->
<!-- Run state (position, checkpoints, loops) lives in 00_run.md, not here. -->

# <storyId>: <short title>

**Als** <konkrete Rolle aus dem Fachkonzept>
**möchte ich** <Fähigkeit>,
**damit** <Nutzen> — messbar an <Kennzahl, Zielwert>.

## Einordnung

Backbone-Aktivität → Nutzer-Task: … · Release: … · dünnerer erster Schnitt möglich: …

## Bezug

Vision → Geschäftsziel → Epic → Story: … · Fachkonzept: … · Auslöser: `01_feedback.md`

## INVEST

| Kriterium | ok? | Begründung |
|---|---|---|
| Independent | | |
| Negotiable | | |
| Valuable | | |
| Estimable | | |
| Small | | |
| Testable | | |
| Vorführbar im Sprint Review | | |
