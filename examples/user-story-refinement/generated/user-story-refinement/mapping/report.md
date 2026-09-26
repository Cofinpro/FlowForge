---
bpmn:
  file: user-story-refinement.bpmn
  elements: [Start_FeedbackEingegangen, I1, I2, Gw_Bug, End_BugUebergeben, Gw_Bezug, End_AnStoryUebergeben, End_FeedbackGeparkt, K1, K2, Gw_Fachkonzept, End_FachkonzeptAenderung, Par_KlaerungSplit, K3, K5, K4, Par_KlaerungJoin, Gw_Unsicherheit, K6, B4, Merge_Validierung, B5, Gw_Erkenntnis, End_AnliegenVerworfen, Merge_Einordnung, C1, Merge_Formulierung, C2, C3, C4, Gw_Invest, Merge_Refinement, D1, Par_AmigosSplit, D2a, D2d, D2b, D2c, Par_AmigosJoin, D3, D4, Merge_Schaetzung, D5, Gw_Schaetzung, Gw_Sprintgroesse, D6, E1, E2, E3, Gw_Ready, E5, End_StoryVerworfen, Par_PlausiSplit, P1, P7, P3, P2, Par_PlausiJoin, P4, Gw_Plausibel, P6, End_StoryZusammengefuehrt, P5, E4, End_StorySprintReady]
---

# Mapping report — user-story-refinement

Generated 2026-09-26 from `generated/user-story-refinement/workflow-spec.yaml`
(source `user-story-refinement.bpmn` @ `d97297a43b12…`). This is the
trace target for `bpmn2agent-verify` — every row below must correspond to what's on disk.

## Review status

**Nothing red, no open questions.** All 65 elements resolved to a concrete kind.
0 elements deliberately not generated (grey).
Interactive, read-only view of the same mapping: [`index.html`](index.html).

## Pattern

**skill-chain-hooks**

Dein Diagramm wird von einem Menschen begleitet: fünfmal entscheidet oder bestätigt jemand aus dem Team. Einige Verzweigungen verlangen ein Urteil (Bug oder Story? passt es zum Fachkonzept? tragen die Erkenntnisse?). Diese Urteile schlage ich mit Begründung vor, und du bestätigst jeden Ausgang und jeden Rücksprung – so bleibt die Entscheidung bei euch. Ich baue es deshalb als geführten Ablauf: ein Einstiegs-Skill geht die sechs Phasen der Reihe nach durch, ruft je Phase einen Skill mit den Checklisten aus dem Notebook auf und hält an euren Prüfpunkten an. Parallele Blöcke arbeitet er als getrennte Perspektiven nacheinander ab, jede schreibt zuerst ihren eigenen Abschnitt. Schleifen haben feste Obergrenzen; bei Definition of Ready, Backlog-Konsistenz und Sprintgröße fragt er dich an der Grenze, statt einfach weiterzumachen.

### Alternatives considered

- **orchestrator-agent** — Six gateways need judgement (Gw_Bug, Gw_Bezug, Gw_Fachkonzept, Gw_Erkenntnis, Gw_Ready, Gw_Plausibel), which points to the orchestrator row. Every exit and loop-back of these is confirmed by the user instead, so a person makes the call, as with a gateway right after a checkpoint. A coordinator agent plus one agent per lane and its own run-state file would add independence for the parallel checks, but the business user chose the lighter guided flow.
- **workflow-script** — The flow pauses five times for people (clarification, evaluation, refinement meeting, planning poker, prioritisation); a Workflow script cannot stop for them mid-run.

## Payload

Everything installable is under `.claude/`: 7 skills (one entry skill spanning all elements, six
phase skills), no agents, no scripts, no hooks, no `settings.json`.

## Legend

| Colour | Kind | Meaning |
|---|---|---|
| Green | `skill` | Its own generated skill. |
| Teal | `orchestrator` | Gateways, merges, start/end events — control flow in the entry skill. |
| Amber | `human-checkpoint` | `userTask`: a person decides here (AskUserQuestion in the entry skill). |
| **Grey** | `not-generated` | Deliberately not generated. None in this run. |
| **Red** | `unresolved` | Unmapped or open. None in this run. |

(Full legend: `bpmn2agent-design/references/mapping-rubric.md`.)

## Element → artifact map

| BPMN element | Type | Lane | Kind | Generated artifact(s) | Notes |
|---|---|---|---|---|---|
| "Nutzer- oder Stakeholder-Feedback eingegangen" | startEvent | Product Owner / BA | orchestrator | `.claude/skills/user-story-refinement/SKILL.md` |  |
| "Feedback erfassen & als Problem formulieren" | serviceTask | Product Owner / BA | skill | `.claude/skills/story-triage/SKILL.md` |  |
| "Verwandte Stories & Epics im Backlog suchen" | serviceTask | Product Owner / BA | skill | `.claude/skills/story-triage/SKILL.md` |  |
| "Fehlverhalten einer bestehenden Funktion?" | exclusiveGateway | Product Owner / BA | orchestrator | `.claude/skills/user-story-refinement/SKILL.md` | Exit and loop-back branches are proposed with reasons and confirmed by the user (AskUserQuestion); the forward branch continues without asking. |
| "An Fehlerbearbeitung übergeben" | endEvent | Product Owner / BA | orchestrator | `.claude/skills/user-story-refinement/SKILL.md` |  |
| "Wie hängt das Anliegen mit dem Backlog zusammen?" | exclusiveGateway | Product Owner / BA | orchestrator | `.claude/skills/user-story-refinement/SKILL.md` | Exit and loop-back branches are proposed with reasons and confirmed by the user (AskUserQuestion); the forward branch continues without asking. |
| "Als Änderung an offene Story übergeben" | endEvent | Product Owner / BA | orchestrator | `.claude/skills/user-story-refinement/SKILL.md` |  |
| "Feedback im Opportunity Backlog geparkt" | endEvent | Product Owner / BA | orchestrator | `.claude/skills/user-story-refinement/SKILL.md` |  |
| "Anliegen mit Feedbackgeber klären" | userTask | Product Owner / BA | human-checkpoint | `.claude/skills/user-story-refinement/SKILL.md` | gate human |
| "Gegen Epic-Ziel & Fachkonzept prüfen" | serviceTask | Product Owner / BA | skill | `.claude/skills/story-clarification/SKILL.md` |  |
| "Mit dem Fachkonzept vereinbar?" | exclusiveGateway | Product Owner / BA | orchestrator | `.claude/skills/user-story-refinement/SKILL.md` | Exit and loop-back branches are proposed with reasons and confirmed by the user (AskUserQuestion); the forward branch continues without asking. |
| "Fachkonzept-Änderung beantragt" | endEvent | Product Owner / BA | orchestrator | `.claude/skills/user-story-refinement/SKILL.md` |  |
| Par_KlaerungSplit | parallelGateway | Product Owner / BA | orchestrator | `.claude/skills/user-story-refinement/SKILL.md` |  |
| "Ist-/Soll-Delta beschreiben" | serviceTask | Product Owner / BA | skill | `.claude/skills/story-clarification/SKILL.md` |  |
| "Betroffene Screens & Abläufe identifizieren" | serviceTask | UX & Design | skill | `.claude/skills/story-clarification/SKILL.md` |  |
| "Technische Auswirkungen grob einschätzen" | serviceTask | Entwicklung / Tech Lead | skill | `.claude/skills/story-clarification/SKILL.md` |  |
| Par_KlaerungJoin | parallelGateway | Product Owner / BA | orchestrator | `.claude/skills/user-story-refinement/SKILL.md` |  |
| "Relevante Unsicherheit offen?" | exclusiveGateway | Product Owner / BA | orchestrator | `.claude/skills/user-story-refinement/SKILL.md` | Exit and loop-back branches are proposed with reasons and confirmed by the user (AskUserQuestion); the forward branch continues without asking. |
| "Klickbaren Prototyp mit Nutzern testen" | serviceTask | UX & Design | skill | `.claude/skills/story-clarification/SKILL.md` |  |
| "Time-boxed Spike durchführen" | serviceTask | Entwicklung / Tech Lead | skill | `.claude/skills/story-clarification/SKILL.md` |  |
| Merge_Validierung | exclusiveGateway | UX & Design | orchestrator | `.claude/skills/user-story-refinement/SKILL.md` |  |
| "Erkenntnisse auswerten" | userTask | Product Owner / BA | human-checkpoint | `.claude/skills/user-story-refinement/SKILL.md` | gate human |
| "Tragen die Erkenntnisse die Story?" | exclusiveGateway | Product Owner / BA | orchestrator | `.claude/skills/user-story-refinement/SKILL.md` | Exit and loop-back branches are proposed with reasons and confirmed by the user (AskUserQuestion); the forward branch continues without asking. |
| "Anliegen verworfen" | endEvent | Product Owner / BA | orchestrator | `.claude/skills/user-story-refinement/SKILL.md` |  |
| Merge_Einordnung | exclusiveGateway | Product Owner / BA | orchestrator | `.claude/skills/user-story-refinement/SKILL.md` |  |
| "Story unter Epic in User Story Map einordnen" | serviceTask | Product Owner / BA | skill | `.claude/skills/story-writing/SKILL.md` |  |
| Merge_Formulierung | exclusiveGateway | Product Owner / BA | orchestrator | `.claude/skills/user-story-refinement/SKILL.md` |  |
| "Story im Connextra-Format formulieren" | serviceTask | Product Owner / BA | skill | `.claude/skills/story-writing/SKILL.md` |  |
| "Bezug zu Epic, Fachkonzept & Feedback dokumentieren" | serviceTask | Product Owner / BA | skill | `.claude/skills/story-writing/SKILL.md` |  |
| "INVEST-Selbstcheck durchführen" | businessRuleTask | Product Owner / BA | skill | `.claude/skills/story-writing/SKILL.md` | gate critic, maxLoops 3 |
| "INVEST erfüllt?" | exclusiveGateway | Product Owner / BA | orchestrator | `.claude/skills/user-story-refinement/SKILL.md` |  |
| Merge_Refinement | exclusiveGateway | Product Owner / BA | orchestrator | `.claude/skills/user-story-refinement/SKILL.md` |  |
| "Refinement mit Three Amigos ansetzen" | userTask | Product Owner / BA | human-checkpoint | `.claude/skills/user-story-refinement/SKILL.md` | gate human |
| Par_AmigosSplit | parallelGateway | Product Owner / BA | orchestrator | `.claude/skills/user-story-refinement/SKILL.md` |  |
| "Wert & Fachregeln erläutern (Was)" | serviceTask | Product Owner / BA | skill | `.claude/skills/story-refinement/SKILL.md` |  |
| "Wireframes & Interaktionsfluss beilegen" | serviceTask | UX & Design | skill | `.claude/skills/story-refinement/SKILL.md` |  |
| "Umsetzung & Abhängigkeiten klären (Wie)" | serviceTask | Entwicklung / Tech Lead | skill | `.claude/skills/story-refinement/SKILL.md` |  |
| "Randfälle & Negativszenarien identifizieren" | serviceTask | QA / Test | skill | `.claude/skills/story-refinement/SKILL.md` |  |
| Par_AmigosJoin | parallelGateway | QA / Test | orchestrator | `.claude/skills/user-story-refinement/SKILL.md` |  |
| "Akzeptanzkriterien in Given-When-Then formulieren" | serviceTask | QA / Test | skill | `.claude/skills/story-refinement/SKILL.md` |  |
| "Beispieltabellen ergänzen (Specification by Example)" | serviceTask | QA / Test | skill | `.claude/skills/story-refinement/SKILL.md` |  |
| Merge_Schaetzung | exclusiveGateway | Entwicklung / Tech Lead | orchestrator | `.claude/skills/user-story-refinement/SKILL.md` |  |
| "Story Points schätzen (Planning Poker)" | userTask | Entwicklung / Tech Lead | human-checkpoint | `.claude/skills/user-story-refinement/SKILL.md` | gate human, maxLoops 3 |
| "Schätzungen konvergiert?" | exclusiveGateway | Entwicklung / Tech Lead | orchestrator | `.claude/skills/user-story-refinement/SKILL.md` |  |
| "Passt die Story in einen Sprint?" | exclusiveGateway | Product Owner / BA | orchestrator | `.claude/skills/user-story-refinement/SKILL.md` | gate critic, maxLoops 3 |
| "Story vertikal schneiden (Splitting-Muster)" | serviceTask | Product Owner / BA | skill | `.claude/skills/story-refinement/SKILL.md` | Every part story runs through "Story im Connextra-Format formulieren" and the rest of the flow one after another (stories/{storyId}-1, -2, ...), each with its own run state; parts inherit loops.split from the parent, so splitting is capped at 3 levels in total. |
| "Definition of Ready prüfen" | businessRuleTask | QA / Test | skill | `.claude/skills/story-readiness/SKILL.md` |  |
| "Begriffe mit Domänenmodell abgleichen" | serviceTask | Entwicklung / Tech Lead | skill | `.claude/skills/story-readiness/SKILL.md` |  |
| "Auf Fake- & Waisen-Story prüfen" | serviceTask | Product Owner / BA | skill | `.claude/skills/story-readiness/SKILL.md` |  |
| "Definition of Ready erfüllt?" | exclusiveGateway | Product Owner / BA | orchestrator | `.claude/skills/user-story-refinement/SKILL.md` | gate critic, maxLoops 3 |
| "Nachgelagerten Spike durchführen" | serviceTask | Entwicklung / Tech Lead | skill | `.claude/skills/story-readiness/SKILL.md` |  |
| "Story verworfen" | endEvent | Product Owner / BA | orchestrator | `.claude/skills/user-story-refinement/SKILL.md` |  |
| Par_PlausiSplit | parallelGateway | Product Owner / BA | orchestrator | `.claude/skills/user-story-refinement/SKILL.md` |  |
| "Auf Duplikate & Überschneidungen prüfen" | serviceTask | Product Owner / BA | skill | `.claude/skills/story-backlog-check/SKILL.md` |  |
| "Konsistenz mit bestehenden Abläufen prüfen" | serviceTask | UX & Design | skill | `.claude/skills/story-backlog-check/SKILL.md` |  |
| "Abhängigkeiten & Reihenfolge prüfen" | serviceTask | Entwicklung / Tech Lead | skill | `.claude/skills/story-backlog-check/SKILL.md` |  |
| "Akzeptanzkriterien gegen bestehende Stories abgleichen" | serviceTask | QA / Test | skill | `.claude/skills/story-backlog-check/SKILL.md` |  |
| Par_PlausiJoin | parallelGateway | Product Owner / BA | orchestrator | `.claude/skills/user-story-refinement/SKILL.md` |  |
| "Plausibilitätsbefund zusammenführen" | serviceTask | Product Owner / BA | skill | `.claude/skills/story-backlog-check/SKILL.md` |  |
| "Konsistent mit dem übrigen Backlog?" | exclusiveGateway | Product Owner / BA | orchestrator | `.claude/skills/user-story-refinement/SKILL.md` | gate critic, maxLoops 3 |
| "Mit bestehender Story zusammenführen" | serviceTask | Product Owner / BA | skill | `.claude/skills/story-backlog-check/SKILL.md` |  |
| "Story in bestehende Story überführt" | endEvent | Product Owner / BA | orchestrator | `.claude/skills/user-story-refinement/SKILL.md` |  |
| "Betroffene Stories zur Anpassung markieren" | serviceTask | Product Owner / BA | skill | `.claude/skills/story-backlog-check/SKILL.md` |  |
| "Story priorisieren & in Ready-Spalte stellen" | userTask | Product Owner / BA | human-checkpoint | `.claude/skills/user-story-refinement/SKILL.md` | gate human |
| "Story sprint-ready" | endEvent | Product Owner / BA | orchestrator | `.claude/skills/user-story-refinement/SKILL.md` |  |

## Grey — deliberately not generated

None.

## Red — open / unresolved

None — every element resolved to a concrete kind.

## Roles

Lanes are perspectives inside the phase skills; the skill-chain pattern generates no agents.

| Role | Lane | Agent / skill generated | Model tier | Tools |
|---|---|---|---|---|
| story-product-owner | Product Owner / BA | — (perspective in the phase skills) | session default | inherits all |
| story-ux-designer | UX & Design | — (perspective in the phase skills) | session default | inherits all |
| story-tech-lead | Entwicklung / Tech Lead | — (perspective in the phase skills) | session default | inherits all |
| story-qa | QA / Test | — (perspective in the phase skills) | session default | inherits all |

## Artifacts

| Artifact | Path pattern | Producer | Consumers | Frontmatter |
|---|---|---|---|---|
| feedback-eintrag | `stories/{storyId}/01_feedback.md` | I1 | — | storyId, version, status, backlog, fachkonzept |
| product-backlog | `{backlog} (existing project backlog and user story map, read-only)` | — | I2, P1 | — |
| epic-fachkonzept | `{fachkonzept} (existing epic and Fachkonzept documents, read-only)` | — | K2 | — |
| ist-soll-delta | `stories/{storyId}/02_ist-soll-delta.md` | K3 | — | storyId, version, status |
| prototyp-testergebnisse | `stories/{storyId}/03_prototyp-test.md` | K6 | — | storyId, version, status |
| spike-report | `stories/{storyId}/03_spike-report.md` | B4 | — | storyId, version, status |
| story-karte | `stories/{storyId}/04_story.md` | C2 | — | storyId, version, status, epic, feedback, parentStory |
| given-when-then-szenarien | `stories/{storyId}/05_akzeptanzkriterien.md` | D3 | — | storyId, version, status |
| story-point-schaetzung | `stories/{storyId}/06_schaetzung.md` | D5 | — | storyId, version, status, storyPoints, maxStorySize |
| plausibilitaetsbefund | `stories/{storyId}/08_plausibilitaet.md` | P4 | — | storyId, version, status |
| sprint-reife-user-story | `stories/{storyId}/10_ready-story.md` | E4 | — | storyId, version, status, epic, storyPoints, priority |
| dor-befund | `stories/{storyId}/07_dor-befund.md` | E1, E2, E3 | Gw_Ready | storyId, version, status |
| aenderungsvorschlaege | `stories/{storyId}/09_aenderungsvorschlaege.md` | P5, P6 | E4 | storyId, status |
| uebergabe | `stories/{storyId}/99_uebergabe.md` | End_BugUebergeben, End_AnStoryUebergeben, End_FeedbackGeparkt, End_FachkonzeptAenderung, End_AnliegenVerworfen, End_StoryVerworfen, End_StoryZusammengefuehrt | — | storyId, status, target |
| run-state | `stories/{storyId}/00_run.md` | Start_FeedbackEingegangen, D6 | K1, B5, D1, D5, E4, Gw_Invest, Gw_Schaetzung, Gw_Sprintgroesse, Gw_Ready, Gw_Plausibel | storyId, parentStory, position, checkpoints, loops, status |

## Open questions carried forward

None. Answered during this run:

- **Mit dem Fachkonzept vereinbar?** — The sources treat a conflict with the Fachkonzept as a trigger to refine model and language with the domain experts, not a hard stop. Keep the end event "Fachkonzept-Änderung beantragt" or loop back? → Keep the diagram as drawn. The change request names the conflicting term or rule and a proposal so it involves the domain experts concretely.
- **Technische Auswirkungen grob einschätzen** — Non-functional requirements (performance, security, capacity) are not checked explicitly anywhere. Where should they go? → Into existing steps: "Technische Auswirkungen grob einschätzen" and the Definition-of-Ready checklist. No new BPMN step.
- **Ist-/Soll-Delta beschreiben** — Should the steps require a measurable target (expected behaviour change and metric) for every story? → Yes: "Ist-/Soll-Delta beschreiben" and "Story im Connextra-Format formulieren" ask for the expected behaviour change and a metric. No new step.
- **Story priorisieren & in Ready-Spalte stellen** — Should "Story priorisieren & in Ready-Spalte stellen" suggest a prioritisation method? → Yes: suggest a position via Weighted Shortest Job First (Cost of Delay ÷ story points); the PO decides.
- **Mit bestehender Story zusammenführen** — The merge path (Gw_Plausibel -> "Mit bestehender Story zusammenführen" -> end) passes no human approval. Add a userTask to the BPMN or confirm inside the flow? → Confirm inside the flow before the end event; the workflow only writes a merge proposal. No BPMN change.
- **Story vertikal schneiden (Splitting-Muster)** — A vertical split yields several part stories. Continue with the first and keep the rest as drafts, or process all of them one after another? → Process all part stories one after another in the same run (stories/{storyId}-1, -2, ...), each through the rest of the flow.
