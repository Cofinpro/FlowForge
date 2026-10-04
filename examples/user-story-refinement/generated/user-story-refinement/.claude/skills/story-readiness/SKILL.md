---
name: story-readiness
description: Checks a refined user story against the Definition of Ready, aligns its terms with the domain model and ubiquitous language, and detects fake and orphan stories; runs a follow-up spike when the check uncovers a technical risk. Use for the "Definition of Ready" phase of the user-story-refinement flow, or to check any story before sprint planning (without a story folder, ask for the story and its acceptance criteria and create stories/<new id>/ first).
bpmn:
  file: user-story-refinement.bpmn
  elements: [E1, E2, E3, E5]
---

# Definition of Ready

Phase 5 of `user-story-refinement`. Checklist and sources:
`${CLAUDE_SKILL_DIR}/references/domain-knowledge.md`. A readiness check, not a stage gate: flag
what blocks, don't demand complete specifications.

Write `stories/<storyId>/07_dor-befund.md` (`storyId`, `version`, `status`) with three sections:

1. **"Definition of Ready prüfen"** (QA / Test) — the ten checklist items, pass/fail + one line
   each, including non-functional impact and the measurable target.
2. **"Begriffe mit Domänenmodell abgleichen"** (Entwicklung) — every entity, attribute, role and
   action in `04_story.md` and `05_akzeptanzkriterien.md` against the domain model: synonyms,
   ambiguous or contradicting terms, new terms not in the model.
3. **"Auf Fake- & Waisen-Story prüfen"** (Product Owner / BA) — fake: goal inside the team's own
   control, developer/system role, no business acceptance test possible; orphan: no link to goal,
   epic or user activity, or a role outside the milestone. Legitimate technical work → suggest the
   team's technical budget.

End with a **proposal** for "Definition of Ready erfüllt?": Ja / Kriterien unklar / Technisches
Risiko offen / Nicht mehr relevant, with the reason. `status: ready-ok` or `ready-failed`.

## "Nachgelagerten Spike durchführen" (Entwicklung / Tech Lead)

Only for "Technisches Risiko offen". Same rules as the spike in `story-clarification`: timebox,
learning goal, acceptance criteria first; ask the user for what you can't investigate. Write the
result to `03_spike-report.md`: create it if absent (`version: 1`), otherwise add a section and
bump `version`; `status: done`.

## Kontextquellen

Knowledge stores, distilled at generation time into one file per task; no tool call at run time. `${CLAUDE_SKILL_DIR}/references/domain-knowledge.md` keeps the phase-level criteria.

- **Product-Methodik: Definition of Ready** (wissen): "Definition of Ready prüfen" → `${CLAUDE_SKILL_DIR}/references/E1.md`; "Auf Fake- & Waisen-Story prüfen" → `${CLAUDE_SKILL_DIR}/references/E3.md`
