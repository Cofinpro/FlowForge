---
name: user-story-refinement
description: Turns one piece of user or stakeholder feedback into a sprint-ready user story in a running project that already has a product vision, epics, a Fachkonzept and a backlog ("Neue User Story aus Feedback erstellen & verfeinern") — triage, fachliche Klärung, story writing, Three Amigos refinement, Definition of Ready and a plausibility check against the backlog, pausing for the team at every decision. Use when feedback, a support ticket, a review comment or a change request should become (or be ruled out as) a new User Story, for "aus Feedback eine User Story machen", "Story verfeinern", or to resume such a run from its stories/<id>/ folder.
bpmn:
  file: user-story-refinement.bpmn
  elements: [Start_FeedbackEingegangen, I1, I2, Gw_Bug, End_BugUebergeben, Gw_Bezug, End_AnStoryUebergeben, End_FeedbackGeparkt, K1, K2, Gw_Fachkonzept, End_FachkonzeptAenderung, Par_KlaerungSplit, K3, K5, K4, Par_KlaerungJoin, Gw_Unsicherheit, K6, B4, Merge_Validierung, B5, Gw_Erkenntnis, End_AnliegenVerworfen, Merge_Einordnung, C1, Merge_Formulierung, C2, C3, C4, Gw_Invest, Merge_Refinement, D1, Par_AmigosSplit, D2a, D2d, D2b, D2c, Par_AmigosJoin, D3, D4, Merge_Schaetzung, D5, Gw_Schaetzung, Gw_Sprintgroesse, D6, E1, E2, E3, Gw_Ready, E5, End_StoryVerworfen, Par_PlausiSplit, P1, P7, P3, P2, Par_PlausiJoin, P4, Gw_Plausibel, P6, End_StoryZusammengefuehrt, P5, E4, End_StorySprintReady]
---

# Neue User Story aus Feedback erstellen & verfeinern

Generated from `user-story-refinement.bpmn` by `bpmn2agent-generate`. This skill is the spine of
the process: it walks the six phases in diagram order, calls one phase skill per phase and stops
for the team at every checkpoint. The team decides; you prepare, propose and record.

## Ground rules

- **Never write outside `stories/<storyId>/`.** Backlog, user story map, epics and Fachkonzept are
  read-only. Anything that would change them (a bug hand-over, a change to an open story, a merge,
  marks on affected stories, the Ready column) is written as a proposal the team applies.
- **Every question goes through `AskUserQuestion`**, with concrete options and a recommendation.
- **Judgement gateways:** propose the branch with a one-line reason. Branches that leave the process
  or loop back are confirmed by the user; the forward branch continues without asking. Record each
  confirmation in `00_run.md` `checkpoints`.
- **Parallel blocks** are separate perspectives: write each perspective's section before reading the
  others' sections; merge only from the file.

## Story folder and run state

One folder per story, `stories/<storyId>/`, `storyId` = `US-<yyyymmdd>-<short-slug>`.

| File | Written by | `status` values |
|---|---|---|
| `00_run.md` | this skill | `running`, `ended` |
| `01_feedback.md` | story-triage, story-clarification | `captured`, `triaged`, `clarified` |
| `02_ist-soll-delta.md` | story-clarification | `draft`, `done` |
| `03_prototyp-test.md` / `03_spike-report.md` | story-clarification, story-readiness | `done` |
| `04_story.md` | story-writing, story-refinement, this skill | `invest-failed`, `invest-ok`, `split`, `merge-proposed`, `ready`, `discarded` |
| `05_akzeptanzkriterien.md` | story-refinement | `draft`, `refined` |
| `06_schaetzung.md` | this skill | `converged`, `cap-majority` |
| `07_dor-befund.md` | story-readiness | `ready-ok`, `ready-failed` |
| `08_plausibilitaet.md` | story-backlog-check | `draft`, `done` |
| `09_aenderungsvorschlaege.md` | story-backlog-check | `proposed`, `merge-proposed`, `approved` |
| `10_ready-story.md` | this skill | `sprint-ready` |
| `99_uebergabe.md` | this skill | the label of the end reached |

`00_run.md` (created at the start) holds the run state in its frontmatter: `storyId`,
`parentStory`, `position` (number of the last step completed below), `checkpoints` (outcome +
date of every checkpoint and confirmed gateway), `loops` and `status`. Counters: `invest` and
`poker` restart at 0 each time their phase is entered from outside the loop; `refinement` (returns
into step 13) and `split` never reset. Update `position` after every step.

**Resume:** if `stories/<storyId>/00_run.md` exists, continue after `position`. Trust `position`
over file statuses: after a loop back, older files still show their earlier `status`.

## Start: "Nutzer- oder Stakeholder-Feedback eingegangen"

0. Take the feedback (text, ticket, file). If a story folder for it exists, resume it. Otherwise ask
   once where the backlog / user story map and the epic + Fachkonzept live (paths, a tool, or
   "paste it"), create `00_run.md` (`position: 0`, `status: running`).

## Phase 1 — Eingang & Triage

1. Invoke `story-triage` → `01_feedback.md` (`triaged`) with the problem statement, related
   stories and a triage proposal.
2. **"Fehlverhalten einer bestehenden Funktion?"** — "Ja (Bug)" → confirm, end **"An
   Fehlerbearbeitung übergeben"**. "Nein" → next.
3. **"Wie hängt das Anliegen mit dem Backlog zusammen?"** — "Ändert eine offene Story" → confirm,
   end **"Als Änderung an offene Story übergeben"**; "Kein Epic-Bezug / kein Nutzen" → confirm, end
   **"Feedback im Opportunity Backlog geparkt"**; "Neue Story unter bestehendem Epic" → phase 2.

## Phase 2 — Fachliche Klärung

4. **Checkpoint "Anliegen mit Feedbackgeber klären".** Draft the questions for the feedback giver
   (problem behind the wish, expected outcome, urgency); ask the user for the answers or to confirm
   the problem statement. Pass: the problem is confirmed and outcome and urgency are known.
5. Invoke `story-clarification` for "Gegen Epic-Ziel & Fachkonzept prüfen".
6. **"Mit dem Fachkonzept vereinbar?"** — "Nein (Fachkonzept ändern)" → confirm; the change request
   from `01_feedback.md` (conflicting term or rule, why, proposal for the domain experts) goes into
   `99_uebergabe.md`; end **"Fachkonzept-Änderung beantragt"**. "Ja" → next.
7. Invoke `story-clarification` for the three perspectives "Ist-/Soll-Delta beschreiben",
   "Betroffene Screens & Abläufe identifizieren", "Technische Auswirkungen grob einschätzen" →
   `02_ist-soll-delta.md` (`done`).
8. **"Relevante Unsicherheit offen?"** — "Nein" → step 11. "Nutzen / Bedienbarkeit unklar" →
   confirm, `story-clarification` "Klickbaren Prototyp mit Nutzern testen". "Technisch unklar" →
   confirm, `story-clarification` "Time-boxed Spike durchführen".
9. **Checkpoint "Erkenntnisse auswerten".** Hold the test or spike result against these criteria,
   recommend, and ask: continue or discard. Pass: users confirm the problem and want the solution;
   the spike shows feasibility at acceptable cost (fail: timebox expired without meeting its
   criteria); the expected behaviour change is plausible. Fail: low demand, or effort out of
   proportion to the value.
10. **"Tragen die Erkenntnisse die Story?"** — "Nein" → end **"Anliegen verworfen"**. "Ja" → next.

## Phase 3 — Story formulieren

11. Set `loops.invest` to 0. Invoke `story-writing` for "Story unter Epic in User Story Map
    einordnen", "Story im Connextra-Format formulieren", "Bezug zu Epic, Fachkonzept & Feedback
    dokumentieren", "INVEST-Selbstcheck durchführen" → `04_story.md`.
12. **"INVEST erfüllt?"** — "Nein (umformulieren)" → `loops.invest` + 1; below 3, back to "Story im
    Connextra-Format formulieren" with the failed criteria as input. At 3: continue with the note
    "risk: loop cap reached" in `04_story.md`. "Ja" → phase 4.

## Phase 4 — Refinement (Three Amigos)

13. **Checkpoint "Refinement mit Three Amigos ansetzen".** Propose participants (PO/BA, the
    developers and testers who will deliver it, UX if screens change, optionally the feedback
    giver) and an agenda from `04_story.md`; ask the user to confirm or report the meeting outcome.
14. Invoke `story-refinement` for the four perspectives "Wert & Fachregeln erläutern (Was)",
    "Wireframes & Interaktionsfluss beilegen", "Umsetzung & Abhängigkeiten klären (Wie)",
    "Randfälle & Negativszenarien identifizieren", then "Akzeptanzkriterien in Given-When-Then
    formulieren" and "Beispieltabellen ergänzen (Specification by Example)" →
    `05_akzeptanzkriterien.md` (`refined`).
15. Set `loops.poker` to 0. **Checkpoint "Story Points schätzen (Planning Poker)".** Ask for the
    team's cards and its maximum story size for one sprint (default 8 points). Write
    `06_schaetzung.md`: cards per round, outliers and their reasons, `storyPoints`,
    `maxStorySize`.
16. **"Schätzungen konvergiert?"** — converged when highest and lowest card are at most one scale
    step apart, or the team accepts the majority value (`status: converged`). "Nein (Ausreißer
    begründen)" → `loops.poker` + 1, ask the outliers' reasons, next round. In round 3: take the
    majority value, document the outliers (`status: cap-majority`), continue with a risk note.
17. **"Passt die Story in einen Sprint?"** — "Ja" when `storyPoints` ≤ `maxStorySize` → phase 5.
    "Nein (zu groß)" → if `loops.split` is already 3, escalate (see "Loop caps"). Otherwise
    `story-refinement` "Story vertikal schneiden (Splitting-Muster)" writes the part stories;
    set the parent's `04_story.md` to `split`, its `00_run.md` to `ended`. Then run **every
    part story** one after another from step 11, each with its own `00_run.md`
    (`parentStory` set, `loops.split` = parent's + 1, other counters 0, `position: 10`).

## Phase 5 — Definition of Ready

18. Invoke `story-readiness` for "Definition of Ready prüfen", "Begriffe mit Domänenmodell
    abgleichen", "Auf Fake- & Waisen-Story prüfen" → `07_dor-befund.md` with a proposal.
19. **"Definition of Ready erfüllt?"** — "Ja" → phase 6. "Kriterien unklar" → confirm,
    `loops.refinement` + 1, back to step 13. "Technisches Risiko offen" → confirm,
    `loops.refinement` + 1, `story-readiness` "Nachgelagerten Spike durchführen", back to step 13.
    "Nicht mehr relevant" → confirm, end **"Story verworfen"**. Before going back, check the cap.

## Phase 6 — Plausibilität gegen Backlog & Freigabe

20. Invoke `story-backlog-check` for "Auf Duplikate & Überschneidungen prüfen", "Konsistenz mit
    bestehenden Abläufen prüfen", "Abhängigkeiten & Reihenfolge prüfen", "Akzeptanzkriterien gegen
    bestehende Stories abgleichen", then "Plausibilitätsbefund zusammenführen" →
    `08_plausibilitaet.md` with a proposal.
21. **"Konsistent mit dem übrigen Backlog?"** — "Widerspruch zu anderen Stories" → confirm,
    `loops.refinement` + 1, back to step 13 (check the cap first). "Duplikat einer bestehenden
    Story" → `story-backlog-check` "Mit bestehender Story zusammenführen", then show the duplicate
    and the merge proposal and ask: merge / not a duplicate (continue with "Ja") / back to
    refinement (counts like "Widerspruch"). On merge, set `09_aenderungsvorschlaege.md` to
    `approved`, end **"Story in bestehende Story überführt"**. "Ja" → `story-backlog-check`
    "Betroffene Stories zur Anpassung markieren".
22. **Checkpoint "Story priorisieren & in Ready-Spalte stellen".** Ask for the Cost of Delay parts
    (user/business value, time criticality, risk reduction) and propose a position by WSJF = Cost of
    Delay ÷ story points. Show the change proposals from `09_aenderungsvorschlaege.md` (if the file
    is missing, say that phase 6 was skipped at a cap). The PO decides. Write `10_ready-story.md`:
    final story text, link to `05_akzeptanzkriterien.md`, `storyPoints`, WSJF inputs,
    `priority`, risk notes. Set `04_story.md` to `ready`, `09_…` to `approved`, end **"Story
    sprint-ready"**. Moving the card is the team's step.

## Loop caps on readiness, consistency and size

When `loops.refinement` would pass 3, or a split is needed with `loops.split` at 3, don't loop
again and don't pass silently. Ask the PO, with a recommendation based on what failed: discard (end
"Story verworfen") / park (end "Feedback im Opportunity Backlog geparkt") / continue with the open
problem shown as a risk — from step 19 to step 20, from steps 17 and 21 to step 22.

## At every end

Except "Story sprint-ready", write `99_uebergabe.md`: `status` = the end's label, `target`
(Fehlerbearbeitung, the open story, Opportunity Backlog, Fachkonzept, the existing story, none), the
reason and what the team should do next. On "Story verworfen" and "Anliegen verworfen" set
`04_story.md` (if it exists) to `discarded`. Set `00_run.md` to `ended` and tell the user what to
carry over into their tools. After a split, continue with the next part story.
