---
name: story-clarification
description: Lightweight business clarification of a triaged feedback story — check against epic goal and Fachkonzept, describe the as-is/to-be delta with a measurable target, identify affected screens, estimate technical and non-functional impact, and run a prototype test or time-boxed spike only when real uncertainty is open. Use for the "Fachliche Klärung" phase of the user-story-refinement flow.
bpmn:
  file: user-story-refinement.bpmn
  elements: [K2, K3, K5, K4, K6, B4]
---

# Fachliche Klärung

Phase 2 of `user-story-refinement`. Minutes to hours, not a discovery cycle. Criteria, thresholds
and sources: `${CLAUDE_SKILL_DIR}/references/domain-knowledge.md`. Inputs are read-only.

## "Gegen Epic-Ziel & Fachkonzept prüfen" (Product Owner / BA)

Input: confirmed problem in `01_feedback.md`, epic with its target KPI, Fachkonzept (rules, domain
model, ubiquitous language). Append **Befund Epic & Fachkonzept** to `01_feedback.md`: serves the
epic goal? terms match the language? any rule, invariant or bounded context violated? Propose
"vereinbar" or "nicht vereinbar". For "nicht vereinbar" draft the change request: the conflicting
term or rule, why, a proposal for the domain experts. Set `status: clarified`.

## The three perspectives → `stories/<storyId>/02_ist-soll-delta.md`

Frontmatter `storyId`, `version`, `status: draft`. Write each section before reading the others.

- **PO — "Ist-/Soll-Delta beschreiben"**: behaviour today, behaviour after the story, what is not
  changing; the **expected behaviour change and how it will be measured** (metric + target).
- **UX — "Betroffene Screens & Abläufe identifizieren"**: affected screens, interaction flow,
  reusable patterns from existing wireframes / design system.
- **Technik — "Technische Auswirkungen grob einschätzen"**: rough size, affected interfaces and
  components, open technical risks, **non-functional impact** (performance, security, capacity).

Then add **Unsicherheit**: none / value or usability unclear / technically unclear, with the reason.
Set `status: done`.

## "Klickbaren Prototyp mit Nutzern testen" (UX & Design)

Only when value or usability is unclear. Define success criteria first, then plan a test with 3–5
users of the concrete role. You can't run it: prepare the plan and script, ask the user for the
results, write `03_prototyp-test.md` (`status: done`).

## "Time-boxed Spike durchführen" (Entwicklung / Tech Lead)

Only when technically unclear. Fix timebox (1–3 days), learning goal and acceptance criteria of the
spike first. Investigate what you can in the codebase; ask the user for the rest. Write
`03_spike-report.md`: feasible yes/no, approach, effort, remaining risk (`status: done`).
