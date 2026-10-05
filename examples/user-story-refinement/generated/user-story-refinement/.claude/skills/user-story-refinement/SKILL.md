---
name: user-story-refinement
description: Turns one piece of user or stakeholder feedback into a sprint-ready user story in a running project that already has a product vision, epics, a Fachkonzept and a backlog ("Neue User Story aus Feedback erstellen & verfeinern") — triage, fachliche Klärung, story writing, Three Amigos refinement, Definition of Ready and a plausibility check against the GitHub backlog, pausing for the team at every decision and writing into the backlog only after its approval. Use when feedback, a support ticket, a review comment or a change request should become (or be ruled out as) a new User Story, for "aus Feedback eine User Story machen", "Story verfeinern", or to resume such a run from its stories/<id>/ folder.
argument-hint: "[feedback] [backlog] [fachkonzept]"
bpmn:
  file: user-story-refinement.bpmn
  elements: [Start_FeedbackEingegangen, I1, I2, Gw_Bug, End_BugUebergeben, Gw_Bezug, End_AnStoryUebergeben, End_FeedbackGeparkt, I3, I4, I5, I6, K1, K2, Gw_Fachkonzept, End_FachkonzeptAenderung, Par_KlaerungSplit, K3, K5, K4, Par_KlaerungJoin, Gw_Unsicherheit, K6, B4, Merge_Validierung, B5, Gw_Erkenntnis, End_AnliegenVerworfen, Merge_Einordnung, C1, Merge_Formulierung, C2, C3, C4, Gw_Invest, Merge_Refinement, D1, Par_AmigosSplit, D2a, D2d, D2b, D2c, Par_AmigosJoin, D3, D4, Merge_Schaetzung, D5, Gw_Schaetzung, Gw_Sprintgroesse, D6, E1, E2, E3, Gw_Ready, E5, End_StoryVerworfen, Par_PlausiSplit, P1, P7, P3, P2, Par_PlausiJoin, P4, Gw_Plausibel, P9, P6, End_StoryZusammengefuehrt, P5, E4, P8, P10, End_StorySprintReady, StoreRef_MethodikPhase1, StoreRef_MethodikPhase2, StoreRef_MethodikPhase3, StoreRef_MethodikPhase4, StoreRef_MethodikPhase5, StoreRef_MethodikPhase6, StoreRef_BacklogTriage, StoreRef_BacklogPlausi, StoreRef_BacklogFreigabe, DataInput_Feedback, DO_ReadyStory_Ref]
---

# Neue User Story aus Feedback erstellen & verfeinern

Generated from `user-story-refinement.bpmn` by `flowforge-generate`. This skill is the spine of
the process: it walks the six phases in diagram order, calls one phase skill per phase and stops
for the team at every checkpoint. The team decides; you prepare, propose and record.

## Input

Required: `feedback` (the raw user or stakeholder feedback, as text or a path to a file), `backlog` (GitHub
repository and project of the product backlog and user story map, e.g. "owner/repo, project 3"; epics are labels
`epic:<name>`, Status "Ready" and the field "Priority" live in the project) and `fachkonzept` (location of the existing epic and Fachkonzept
documents). Take them from the invocation arguments. If one is missing, ask the user for it via `AskUserQuestion`
before starting step 0; never start with a guess. When resuming an existing story folder, take `backlog` and
`fachkonzept` from its `01_feedback.md` and ask only for what is still missing. If the arguments are only free text, treat all of it as `feedback`
and ask for `backlog` and `fachkonzept` via `AskUserQuestion`.

Before step 1, check access to the backlog: `gh auth status` (its token scopes must include
`project`; otherwise suggest `gh auth refresh -s project`), `gh issue list -R <owner/repo> --limit 1 --json number`
and `gh project view <number> --owner <owner> --format json`. On an error show it raw and ask via
`AskUserQuestion`: fix access and retry (recommended) / stop. Never start the triage on a backlog you
cannot read.

## Ground rules

- **Local files only under `stories/<storyId>/`.** Fachkonzept and epics documents stay read-only.
- **The backlog changes only after an approval.** Five steps write into GitHub, all through
  `story-backlog-publish`, each right after its approval checkpoint ("Änderungshinweis an offene Story
  freigeben", "Parken im Opportunity Backlog freigeben", "Zusammenführung freigeben", "Story
  priorisieren & Übernahme ins Backlog freigeben"). Claude Code asks again at every write (write-guard
  hook). The bug hand-over stays local.
- **Approval checkpoints** (I3, I5, P9, E4) show the exact change (repo, issue, text, labels, field
  values) and offer approve (recommended when the checks passed) / edit / reject.
  - The approved text has one home: `99_uebergabe.md` (I3, I5) or its entry in
    `09_aenderungsvorschlaege.md` (P9, E4), with `status: approved`, plus the exact text to send in
    `stories/<storyId>/publish/<step id>.md` (I4, I6, P6, P8, P10-<n>), ending with the marker
    `<!-- user-story-refinement: <storyId> <step id> -->`. Any edit after the approval sets it back
    to `proposed` and asks again.
  - Record `checkpoints.<id>` in `00_run.md` (`I3`, `I5`, `P9`, `E4`): `decision`, `approvedAt`, and for
    E4 also `priority` and `approvedVersions` (the `version` of `04_story.md`,
    `05_akzeptanzkriterien.md`, `06_schaetzung.md`).
  - Reject → write nothing, set `00_run.md` to `status: paused` with the reason; a later invocation
    resumes at this checkpoint.
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
| `00_run.md` | this skill | `running`, `paused`, `ended` |
| `01_feedback.md` | story-triage (incl. the related issues), story-clarification | `captured`, `triaged`, `clarified` |
| `02_ist-soll-delta.md` | story-clarification | `draft`, `done` |
| `03_prototyp-test.md` / `03_spike-report.md` | story-clarification, story-readiness | `done` |
| `04_story.md` | story-writing, story-refinement, this skill | `invest-failed`, `invest-ok`, `split`, `merged`, `ready`, `discarded` |
| `05_akzeptanzkriterien.md` | story-refinement | `draft`, `refined` |
| `06_schaetzung.md` | this skill | `converged`, `cap-majority` |
| `07_dor-befund.md` | story-readiness | `ready-ok`, `ready-failed` |
| `08_plausibilitaet.md` | story-backlog-check | `draft`, `done` |
| `09_aenderungsvorschlaege.md` | story-backlog-check, this skill, story-backlog-publish (`appliedUrl`) | `proposed`, `merge-proposed`, `approved`, `applied` |
| `10_ready-story.md` | story-backlog-publish | `draft`, `sprint-ready` |
| `99_uebergabe.md` | this skill, story-backlog-publish (`backlogItem`) | `proposed`, `approved`, or the label of the end reached |

`00_run.md` (created at the start) holds the run state in its frontmatter: `storyId`,
`parentStory`, `position` (number of the last step completed below), `checkpoints` (outcome +
date of every checkpoint and confirmed gateway), `loops` and `status`. Counters: `invest` and
`poker` restart at 0 each time their phase is entered from outside the loop; `refinement` (returns
into step 13) and `split` never reset. Update `position` after every step.

**Resume:** if `stories/<storyId>/00_run.md` exists, continue after `position`; a `paused` run
re-asks the checkpoint it paused at. If `checkpoints.<id>.decision` is `approved` but the write after
it isn't recorded yet (no `backlogItem` / `appliedUrl`), don't ask again: invoke `story-backlog-publish`
for that write directly; it skips what it already recorded. Trust `position`
over file statuses: after a loop back, older files still show their earlier `status`.

## Start: "Nutzer- oder Stakeholder-Feedback eingegangen"

0. Take the `feedback` argument (text, ticket, file). If a story folder for it exists, resume it. Otherwise create
   `00_run.md` (`position: 0`, `status: running`).

## Phase 1 — Eingang & Triage

1. Invoke `story-triage` → `01_feedback.md` (`triaged`) with the problem statement, related
   stories and a triage proposal.
2. **"Fehlverhalten einer bestehenden Funktion?"** — "Ja (Bug)" → confirm, end **"An
   Fehlerbearbeitung übergeben"**. "Nein" → next.
3. **"Wie hängt das Anliegen mit dem Backlog zusammen?"** — "Neue Story unter bestehendem Epic" →
   phase 2. The two exits are confirmed together with their approval, in one question:
   - "Ändert eine offene Story" → **Checkpoint "Änderungshinweis an offene Story freigeben".** Draft
     the comment for the open story (problem statement, link to the feedback) and take the target
     issue URL named in the triage proposal of `01_feedback.md`; read its `updatedAt`
     (`gh issue view <url> -R <repo> --json updatedAt`). Write the comment, `target` and
     `baseUpdatedAt` to `99_uebergabe.md` (`status: proposed`) and the exact comment with its marker to
     `publish/I4.md`. Ask: approve / edit / other branch / reject. Approved → `status: approved`,
     `checkpoints.I3`, invoke `story-backlog-publish` for "Änderungshinweis an offener Story ergänzen",
     end **"Als Änderung an offene Story übergeben"**.
   - "Kein Epic-Bezug / kein Nutzen" → **Checkpoint "Parken im Opportunity Backlog freigeben".** Draft
     the entry (`title`, problem statement, source, reason, label `opportunity`) in `99_uebergabe.md`
     (`status: proposed`) and the exact body with its marker in `publish/I6.md`. Ask: approve / edit /
     other branch / reject. Approved → `status: approved`, `checkpoints.I5`, invoke
     `story-backlog-publish` for "Feedback im Opportunity Backlog anlegen", end **"Feedback im
     Opportunity Backlog geparkt"**.

## Phase 2 — Fachliche Klärung

4. **Checkpoint "Anliegen mit Feedbackgeber klären".** Draft the questions for the feedback giver
   (problem behind the wish, expected outcome, urgency); ask the user for the answers or to confirm
   the problem statement. Pass: the problem is confirmed and outcome and urgency are known. Method and pitfalls:
   `${CLAUDE_SKILL_DIR}/references/K1.md`.
5. Invoke `story-clarification` for "Gegen Epic-Ziel & Fachkonzept prüfen".
6. **"Mit dem Fachkonzept vereinbar?"** — "Nein (Fachkonzept ändern)" → confirm; the change request
   from `01_feedback.md` (conflicting term or rule, why, proposal for the domain experts) goes into
   `99_uebergabe.md`; end **"Fachkonzept-Änderung beantragt"**. "Ja" → next. Criteria: `${CLAUDE_SKILL_DIR}/references/phase-2-fachliche-klaerung.md` (Decision criteria).
7. Invoke `story-clarification` for the three perspectives "Ist-/Soll-Delta beschreiben",
   "Betroffene Screens & Abläufe identifizieren", "Technische Auswirkungen grob einschätzen" →
   `02_ist-soll-delta.md` (`done`).
8. **"Relevante Unsicherheit offen?"** — "Nein" → step 11. "Nutzen / Bedienbarkeit unklar" →
   confirm, `story-clarification` "Klickbaren Prototyp mit Nutzern testen". "Technisch unklar" →
   confirm, `story-clarification` "Time-boxed Spike durchführen". Criteria: `${CLAUDE_SKILL_DIR}/references/phase-2-fachliche-klaerung.md`.
9. **Checkpoint "Erkenntnisse auswerten".** Hold the test or spike result against these criteria,
   recommend, and ask: continue, discard, or another test or spike (stay at this checkpoint and ask for
   the new result). Pass: users confirm the problem and want the solution;
   the spike shows feasibility at acceptable cost (fail: timebox expired without meeting its
   criteria); the expected behaviour change is plausible. Fail: low demand, or effort out of
   proportion to the value. Evidence and decision options:
   `${CLAUDE_SKILL_DIR}/references/B5.md`.
10. **"Tragen die Erkenntnisse die Story?"** — "Nein" → end **"Anliegen verworfen"** (a pivot ends here too: note it in `99_uebergabe.md`). "Ja" → next.

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
    Preparation, agenda and outputs: `${CLAUDE_SKILL_DIR}/references/D1.md`.
14. Invoke `story-refinement` for the four perspectives "Wert & Fachregeln erläutern (Was)",
    "Wireframes & Interaktionsfluss beilegen", "Umsetzung & Abhängigkeiten klären (Wie)",
    "Randfälle & Negativszenarien identifizieren", then "Akzeptanzkriterien in Given-When-Then
    formulieren" and "Beispieltabellen ergänzen (Specification by Example)" →
    `05_akzeptanzkriterien.md` (`refined`).
15. Set `loops.poker` to 0. **Checkpoint "Story Points schätzen (Planning Poker)".** Ask for the
    team's cards and its maximum story size for one sprint (default 8 points). Write
    `06_schaetzung.md`: cards per round, outliers and their reasons, `storyPoints`,
    `maxStorySize`.
    Rules for the rounds and for convergence: `${CLAUDE_SKILL_DIR}/references/D5.md`.
16. **"Schätzungen konvergiert?"** — converged when highest and lowest card are at most one scale
    step apart, or the team accepts the majority value (`status: converged`). "Nein (Ausreißer
    begründen)" → `loops.poker` + 1, ask the outliers' reasons, next round. In round 3: take the
    majority value, document the outliers (`status: cap-majority`), continue with a risk note. Criteria: `${CLAUDE_SKILL_DIR}/references/phase-4-refinement.md`.
17. **"Passt die Story in einen Sprint?"** — "Ja" when `storyPoints` ≤ `maxStorySize` → phase 5.
    "Nein (zu groß)" → if `loops.split` is already 3, escalate (see "Loop caps"). Otherwise
    `story-refinement` "Story vertikal schneiden (Splitting-Muster)" writes the part stories;
    set the parent's `04_story.md` to `split`, its `00_run.md` to `ended`. Then run **every
    part story** one after another from step 11, each with its own `00_run.md`
    (`parentStory` set, `loops.split` = parent's + 1, other counters 0, `position: 10`). Sprint-size criteria:
    `${CLAUDE_SKILL_DIR}/references/phase-4-refinement.md`.

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
    Story" → **Checkpoint "Zusammenführung freigeben"**, asked together with the duplicate verdict:
    read the duplicate (`gh issue view <url> -R <repo> --json body,updatedAt`), draft the section to
    add (new acceptance criteria, feedback link, combined estimate if several overlap; merge criteria:
    `${CLAUDE_SKILL_DIR}/../story-backlog-publish/references/P6.md`) and write it as the merge entry in
    `09_aenderungsvorschlaege.md` (`status: merge-proposed`, target, the section, `baseUpdatedAt`) and
    with its marker to `publish/P6.md`. Show it as a diff against the current body and ask one
    `AskUserQuestion` call with two questions — verdict: duplicate / not a duplicate (continue with
    "Ja") / back to refinement (counts like "Widerspruch"); approval: approve / edit / reject.
    Duplicate + approved → entry `decision: approved`, `status: approved`, `checkpoints.P9`, invoke
    `story-backlog-publish` for "Mit bestehender Story zusammenführen", set `04_story.md` to `merged`
    and `09_…` to `applied`, end **"Story in bestehende Story überführt"**. "Ja" →
    `story-backlog-check` "Anpassungen an betroffenen Stories vorschlagen".
    Criteria: `${CLAUDE_SKILL_DIR}/references/phase-6-plausibilitaet-freigabe.md`.
22. **Checkpoint "Story priorisieren & Übernahme ins Backlog freigeben".** First read the project's
    fields (`gh project field-list <number> --owner <owner> --format json`): "Status" must have the
    option "Ready", and "Priority" decides the value's form (a number, or one of its single-select
    options). A missing field or option → say so and ask how to proceed before anything else. Ask for
    the Cost of Delay parts (user/business value, time criticality, risk reduction), rank by WSJF =
    Cost of Delay ÷ story points and propose a "Priority" value in the field's form. Write the exact
    issue title (first line `# <title>`) and body with its marker to `publish/P8.md`, and each
    approved proposal's note to `publish/P10-<n>.md`. Show exactly what will be written: repo and project, issue title and body (story text, Given-When-Then
    scenarios, estimate, links to epic, feedback and affected stories), label `epic:<name>`, Status
    "Ready", Priority, and each proposal from `09_aenderungsvorschlaege.md` (if the file is missing,
    say that phase 6 was skipped at a cap). Say how many Claude Code write prompts follow. Ask:
    approve (recommended when nothing is open) / edit / reject; approve or reject each proposal on
    its own. Record `checkpoints.E4` (`decision`, `priority`, `approvedVersions`, `approvedAt`) and the
    per-proposal `decision`.
    Reject → pause (ground rules). Criteria for the position and for Ready:
    `${CLAUDE_SKILL_DIR}/references/E4.md`.
23. Invoke `story-backlog-publish` for "Story im Backlog anlegen & in Ready-Spalte stellen" →
    `10_ready-story.md` with `backlogItem`, `status: sprint-ready`.
24. Invoke `story-backlog-publish` for "Betroffene Stories im Backlog markieren". Continue only when
    every approved proposal is applied or the user chose to leave it undone. Set `04_story.md` to
    `ready`, `09_…` to `applied`, end **"Story sprint-ready"**.

## Loop caps on readiness, consistency and size

When `loops.refinement` would pass 3, or a split is needed with `loops.split` at 3, don't loop
again and don't pass silently. Ask the PO, with a recommendation based on what failed: discard (end
"Story verworfen") / park (end "Feedback im Opportunity Backlog geparkt") / continue with the open
problem shown as a risk — from step 19 to step 20, from steps 17 and 21 to step 22. Parking at a cap
also goes through "Parken im Opportunity Backlog freigeben".

## At every end

Except "Story sprint-ready", write `99_uebergabe.md`, or update it when an approval step already wrote
it (keep `target`, the approved text and `backlogItem`): `status` = the end's label, `target`
(Fehlerbearbeitung, the open story, Opportunity Backlog, Fachkonzept, the existing story, none), the
reason and what the team should do next (with `backlogItem` when the end wrote into GitHub). On "Story verworfen" and "Anliegen verworfen" set
`04_story.md` (if it exists) to `discarded`. Set `00_run.md` to `ended` and tell the user what to
carry over into their tools. After a split, continue with the next part story.

## End result

The result of a run is the "Sprint-reife User Story": `stories/<storyId>/10_ready-story.md` (frontmatter
`storyId`, `version`, `status`, `epic`, `storyPoints`, `priority`, `backlogItem` = URL of the GitHub issue),
written by "Story im Backlog anlegen & in Ready-Spalte stellen" and complete at the end **"Story sprint-ready"**.
Every other end hands over through `99_uebergabe.md`. After a vertical split, each part story ends with
its own `10_ready-story.md`.

## Kontextquellen

Knowledge stores, distilled at generation time into one file per task; no tool call at run time. The phase files beside them hold the gateway criteria.

- **Product-Methodik: Fachliche Klärung** (wissen): "Anliegen mit Feedbackgeber klären" → `${CLAUDE_SKILL_DIR}/references/K1.md`; "Erkenntnisse auswerten" → `${CLAUDE_SKILL_DIR}/references/B5.md`
- **Product-Methodik: Refinement** (wissen): "Refinement mit Three Amigos ansetzen" → `${CLAUDE_SKILL_DIR}/references/D1.md`; "Story Points schätzen (Planning Poker)" → `${CLAUDE_SKILL_DIR}/references/D5.md`
- **Product-Methodik: Plausibilität & Freigabe** (wissen): "Story priorisieren & Übernahme ins Backlog freigeben" → `${CLAUDE_SKILL_DIR}/references/E4.md`
