---
name: story-writing
description: Places a clarified story under its epic in the user story map, writes it in Connextra format with a concrete role and a measurable benefit, documents the trace to epic, Fachkonzept and feedback, and runs the INVEST self-check. Use for the "Story formulieren" phase of the user-story-refinement flow, for reformulating after a failed INVEST check, and for each part story after a vertical split.
bpmn:
  file: user-story-refinement.bpmn
  elements: [C1, C2, C3, C4]
---

# Story formulieren

Phase 3 of `user-story-refinement`, lane "Product Owner / BA". INVEST table, anti-patterns and
sources: `${CLAUDE_SKILL_DIR}/references/domain-knowledge.md`. Card template:
`${CLAUDE_SKILL_DIR}/assets/story-template.md`.

1. **"Story unter Epic in User Story Map einordnen"** — backbone activity and user task it
   supports, vertical position (release), and whether a thinner first slice ships value earlier.
   For a part story (`parentStory` set), read `01_feedback.md` and `02_ist-soll-delta.md` from the
   parent's folder and start from the draft card the split wrote.
2. **"Story im Connextra-Format formulieren"** — *As a* concrete role from the Fachkonzept (never
   "a user"), *I want* the capability (no screens, no technology), *so that* the benefit **with
   the measurable target** from `02_ist-soll-delta.md`. On a re-run after "INVEST erfüllt?" =
   "Nein", fix exactly the failed criteria and bump `version`.
3. **"Bezug zu Epic, Fachkonzept & Feedback dokumentieren"** — the chain vision → business goal →
   epic → story, the Fachkonzept sections and the triggering feedback.
4. **"INVEST-Selbstcheck durchführen"** — one line per criterion (pass/fail + reason), plus "how
   will we demonstrate this in the sprint review?". If "Estimable" fails from technical
   uncertainty, say so in its row: "Umsetzung & Abhängigkeiten klären (Wie)" and the Definition of
   Ready ("Technisches Risiko offen") pick it up; rewording won't fix it.

Write `stories/<storyId>/04_story.md` from the template; `status: invest-ok` or `invest-failed`.
Run state and counters live in `00_run.md`; the calling skill updates them.
