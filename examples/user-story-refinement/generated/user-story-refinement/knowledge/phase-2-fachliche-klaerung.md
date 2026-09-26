---
element: phase-2
evidence: cited
sources: ["NotebookLM: The Product - Business Design"]
bpmn:
  file: user-story-refinement.bpmn
  elements: [K1, K2, Gw_Fachkonzept, End_FachkonzeptAenderung, Par_KlaerungSplit, K3, K5, K4, Par_KlaerungJoin, Gw_Unsicherheit, K6, B4, Merge_Validierung, B5, Gw_Erkenntnis, End_AnliegenVerworfen]
---

# Phase 2 — Fachliche Klärung

Lightweight validation in minutes or hours, not a full discovery cycle, because vision, epics and
Fachkonzept already exist [feedback-driven-stories-1: 2, 16, 17].

## Procedure

1. **"Anliegen mit Feedbackgeber klären"** — a short clarification that confirms the problem
   behind the wish [feedback-driven-stories-1: 11, 23].
2. **"Gegen Epic-Ziel & Fachkonzept prüfen"** — does it serve the epic's target outcome/KPI; does
   it respect the bounded context, domain invariants and ubiquitous language
   [feedback-driven-stories-1: 8, 18, 19, 20, 21, 22].
3. In parallel:
   - **"Ist-/Soll-Delta beschreiben"** — how the system behaves today versus after the story
     [feedback-driven-stories-1: 2, 24], **plus the expected behaviour change and how it will be
     measured** (a target metric); without it there is no pass/fail basis later
     [triage-klaerung-1: 16, 17, 18]. (Decided with the business user: required.)
   - **"Betroffene Screens & Abläufe identifizieren"** — affected screens, interaction flow,
     reusable patterns.
   - **"Technische Auswirkungen grob einschätzen"** — rough size, interfaces, open risks, **and
     non-functional impact** (performance, security, capacity) [triage-klaerung-1: 23, 24, 25, 26].
     (Decided with the business user: checked here and in the DoR, no new step.)

## Decision criteria

- **"Mit dem Fachkonzept vereinbar?"** — pass: terms match the ubiquitous language, no
  contradicting business rule, stays inside the bounded context, fits the domain vision
  [triage-klaerung-1: 11, 29, 30, 31, 32, 33, 34, 35, 36]. Fail: a contradiction that can't be
  reconciled without changing rules or the domain model. The diagram ends here with a change
  request; the sources treat such a conflict as a trigger to refine model and language together
  with the domain experts [triage-klaerung-1: 7, 9, 10, 11], so the request names the term or rule,
  the conflict and a proposal for them. (Decided: diagram stays as drawn.)
- **"Relevante Unsicherheit offen?"** — escalate only on real uncertainty
  [feedback-driven-stories-1: 27, 28, 29, 30]:
  - technical (unknown API, performance limit, unproven algorithm) → **"Time-boxed Spike
    durchführen"**, 1–3 days, with explicit acceptance criteria and a learning goal
    [feedback-driven-stories-1: 30, 31, 32, 33];
  - value / usability → **"Klickbaren Prototyp mit Nutzern testen"** with 3–5 users and success
    criteria defined up front [feedback-driven-stories-1: 27, 35];
  - otherwise continue.
- **"Tragen die Erkenntnisse die Story?"** (after **"Erkenntnisse auswerten"**) — pass: users
  confirm the problem and want the solution, the spike shows it is feasible at acceptable cost, the
  expected behaviour change is plausible. Fail: low demand ("solution in search of a problem") or
  effort out of proportion to the value → discard [triage-klaerung-1: 38, 45, 46, 47, 48, 50, 51, 52].
  Spike failed: timebox expired without meeting its acceptance criteria [triage-klaerung-1: 38, 39, 40].

## Pitfalls

- Parallel checks turning into isolated hand-offs instead of a joint conversation
  [triage-klaerung-1: 20, 54, 55].
- Open-ended spikes; the timebox is the guard [triage-klaerung-1: 38, 40].
