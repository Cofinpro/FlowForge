---
bpmn:
  file: user-story-refinement.bpmn
  elements: [Start_FeedbackEingegangen, I1, I2, Gw_Bug, End_BugUebergeben, Gw_Bezug, End_AnStoryUebergeben, End_FeedbackGeparkt, I3, I4, I5, I6, K1, K2, Gw_Fachkonzept, End_FachkonzeptAenderung, Par_KlaerungSplit, K3, K5, K4, Par_KlaerungJoin, Gw_Unsicherheit, K6, B4, Merge_Validierung, B5, Gw_Erkenntnis, End_AnliegenVerworfen, Merge_Einordnung, C1, Merge_Formulierung, C2, C3, C4, Gw_Invest, Merge_Refinement, D1, Par_AmigosSplit, D2a, D2d, D2b, D2c, Par_AmigosJoin, D3, D4, Merge_Schaetzung, D5, Gw_Schaetzung, Gw_Sprintgroesse, D6, E1, E2, E3, Gw_Ready, E5, End_StoryVerworfen, Par_PlausiSplit, P1, P7, P3, P2, Par_PlausiJoin, P4, Gw_Plausibel, P9, P6, End_StoryZusammengefuehrt, P5, E4, P8, P10, End_StorySprintReady, StoreRef_MethodikPhase1, StoreRef_MethodikPhase2, StoreRef_MethodikPhase3, StoreRef_MethodikPhase4, StoreRef_MethodikPhase5, StoreRef_MethodikPhase6, StoreRef_BacklogTriage, StoreRef_BacklogPlausi, StoreRef_BacklogFreigabe, DataInput_Feedback, DO_ReadyStory_Ref]
---

# Mapping report — user-story-refinement

Generated 2026-09-26, updated 2026-10-04 (context sources, GitHub backlog) from `generated/user-story-refinement/workflow-spec.yaml`
(source `user-story-refinement.bpmn` @ `31eafa88ad49…`). This is the
trace target for `bpmn2agent-verify` — every row below must correspond to what's on disk.

## Review status

**Nothing red, no open questions.** All 83 elements resolved to a concrete kind (72 diagram nodes, 9 data stores, 2 process input/output elements).
0 elements deliberately not generated (grey).
Interactive, read-only view of the same mapping: [`index.html`](index.html).

## Pattern

**skill-chain-hooks**

Dein Diagramm wird von einem Menschen begleitet: achtmal entscheidet oder bestätigt jemand aus dem Team. Einige Verzweigungen verlangen ein Urteil (Bug oder Story? passt es zum Fachkonzept? tragen die Erkenntnisse?). Diese Urteile schlage ich mit Begründung vor, und du bestätigst jeden Ausgang und jeden Rücksprung – so bleibt die Entscheidung bei euch. Ich baue es deshalb als geführten Ablauf: ein Einstiegs-Skill geht die sechs Phasen der Reihe nach durch, ruft je Phase einen Skill mit den Checklisten aus dem Notebook auf und hält an euren Prüfpunkten an. Parallele Blöcke arbeitet er als getrennte Perspektiven nacheinander ab, jede schreibt zuerst ihren eigenen Abschnitt. Schleifen haben feste Obergrenzen; bei Definition of Ready, Backlog-Konsistenz und Sprintgröße fragt er dich an der Grenze, statt einfach weiterzumachen. Ins GitHub-Backlog schreibt der Ablauf nur an fünf Stellen, und jedes Mal erst nach deiner Freigabe direkt davor: Änderungshinweis an eine offene Story, Eintrag im Opportunity Backlog, Zusammenführung mit einem Duplikat, die neue Story in der Ready-Spalte und die Hinweise an betroffenen Stories. Alle Schreibschritte liegen in einem eigenen Skill, der ohne Freigabe nicht schreibt; Claude Code fragt beim Schreiben zusätzlich nach. Gelesen wird das Backlog von vier Schritten; der Lesezugriff ist nicht pro Rolle getrennt. Ein koordinierender Agent könnte jeder Rolle nur ihren Zugriff geben (UX & Design keinen, Entwicklung und QA nur lesen); das lohnt sich, wenn euch diese Trennung wichtig ist.

### Alternatives considered

- **orchestrator-agent** — Six gateways need judgement (Gw_Bug, Gw_Bezug, Gw_Fachkonzept, Gw_Erkenntnis, Gw_Ready, Gw_Plausibel), which points to the orchestrator row. Every exit and loop-back of these is confirmed by the user instead, so a person makes the call, as with a gateway right after a checkpoint. A coordinator agent plus one agent per lane and its own run-state file would add independence for the parallel checks, but the business user chose the lighter guided flow. With the GitHub backlog the roles need different access (UX & Design none, Entwicklung and QA read only, only Product Owner / BA writes); only a coordinator with one agent per lane could separate that. Not chosen: every write sits behind its own approval, in one write skill, and behind the write-guard hook.
- **workflow-script** — The flow pauses eight times for people (clarification, evaluation, refinement meeting, planning poker, three approvals before backlog writes, prioritisation) and writes into a live store; a Workflow script cannot stop for them mid-run.

## Payload

Everything installable is under `.claude/`: 8 skills (one entry skill spanning all elements, six
phase skills, one write skill `story-backlog-publish`), one hook (`hooks/user-story-refinement-write-guard.mjs`)
and `settings.json` (the hook plus the read permissions), no agents, no scripts.
Per reading task a knowledge file sits beside the skill that owns it (`references/<taskId>.md`, 24 files); the
entry skill also carries the three phase files its five checkpoints point to.

## Legend

| Colour | Kind | Meaning |
|---|---|---|
| Green | `skill` | Its own generated skill. |
| Teal | `orchestrator` | Gateways, merges, start/end events — control flow in the entry skill. |
| Amber | `human-checkpoint` | `userTask`: a person decides here (AskUserQuestion in the entry skill). |
| **Grey** | `not-generated` | Deliberately not generated. None in this run. |
| **Red** | `unresolved` | Unmapped or open. None in this run. |
| Rose | `context-source`, `workflow-input`, `workflow-output` | A data store (here: six knowledge stores and three live GitHub backlog stores) or the process-wide input/output; no file of its own. |

(Full legend: `bpmn2agent-design/references/mapping-rubric.md`.)

## Element → artifact map

| BPMN element | Type | Lane | Kind | Generated artifact(s) | Notes |
|---|---|---|---|---|---|
| "Nutzer- oder Stakeholder-Feedback eingegangen" | startEvent | Product Owner / BA | orchestrator | `.claude/skills/user-story-refinement/SKILL.md` |  |
| "Feedback erfassen & als Problem formulieren" | serviceTask | Product Owner / BA | skill | `.claude/skills/story-triage/SKILL.md` | knowledge: references/I1.md |
| "Verwandte Stories & Epics im Backlog suchen" | serviceTask | Product Owner / BA | skill | `.claude/skills/story-triage/SKILL.md` | knowledge: references/I2.md; reads "Product Backlog & User Story Map" (gh); writes the related issues into 01_feedback.md |
| "Fehlverhalten einer bestehenden Funktion?" | exclusiveGateway | Product Owner / BA | orchestrator | `.claude/skills/user-story-refinement/SKILL.md` | Exit and loop-back branches are proposed with reasons and confirmed by the user (AskUserQuestion); the forward branch continues without asking. |
| "An Fehlerbearbeitung übergeben" | endEvent | Product Owner / BA | orchestrator | `.claude/skills/user-story-refinement/SKILL.md` |  |
| "Wie hängt das Anliegen mit dem Backlog zusammen?" | exclusiveGateway | Product Owner / BA | orchestrator | `.claude/skills/user-story-refinement/SKILL.md` | Exit and loop-back branches are proposed with reasons and confirmed by the user (AskUserQuestion); the forward branch continues without asking. |
| "Als Änderung an offene Story übergeben" | endEvent | Product Owner / BA | orchestrator | `.claude/skills/user-story-refinement/SKILL.md` |  |
| "Feedback im Opportunity Backlog geparkt" | endEvent | Product Owner / BA | orchestrator | `.claude/skills/user-story-refinement/SKILL.md` |  |
| "Änderungshinweis an offene Story freigeben" | userTask | Product Owner / BA | human-checkpoint | `.claude/skills/user-story-refinement/SKILL.md` | gate human; asked together with the Gw_Bezug branch; reject pauses |
| "Änderungshinweis an offener Story ergänzen" | serviceTask | Product Owner / BA | skill | `.claude/skills/story-backlog-publish/SKILL.md` | writes "Product Backlog & User Story Map" (gh issue comment) after approval |
| "Parken im Opportunity Backlog freigeben" | userTask | Product Owner / BA | human-checkpoint | `.claude/skills/user-story-refinement/SKILL.md` | gate human; asked together with the Gw_Bezug branch; reject pauses |
| "Feedback im Opportunity Backlog anlegen" | serviceTask | Product Owner / BA | skill | `.claude/skills/story-backlog-publish/SKILL.md` | writes "Product Backlog & User Story Map" (gh issue create) after approval |
| "Anliegen mit Feedbackgeber klären" | userTask | Product Owner / BA | human-checkpoint | `.claude/skills/user-story-refinement/SKILL.md` | gate human; knowledge: references/K1.md |
| "Gegen Epic-Ziel & Fachkonzept prüfen" | serviceTask | Product Owner / BA | skill | `.claude/skills/story-clarification/SKILL.md` | knowledge: references/K2.md |
| "Mit dem Fachkonzept vereinbar?" | exclusiveGateway | Product Owner / BA | orchestrator | `.claude/skills/user-story-refinement/SKILL.md` | Exit and loop-back branches are proposed with reasons and confirmed by the user (AskUserQuestion); the forward branch continues without asking. |
| "Fachkonzept-Änderung beantragt" | endEvent | Product Owner / BA | orchestrator | `.claude/skills/user-story-refinement/SKILL.md` |  |
| Par_KlaerungSplit | parallelGateway | Product Owner / BA | orchestrator | `.claude/skills/user-story-refinement/SKILL.md` |  |
| "Ist-/Soll-Delta beschreiben" | serviceTask | Product Owner / BA | skill | `.claude/skills/story-clarification/SKILL.md` | knowledge: references/K3.md |
| "Betroffene Screens & Abläufe identifizieren" | serviceTask | UX & Design | skill | `.claude/skills/story-clarification/SKILL.md` |  |
| "Technische Auswirkungen grob einschätzen" | serviceTask | Entwicklung / Tech Lead | skill | `.claude/skills/story-clarification/SKILL.md` | knowledge: references/K4.md |
| Par_KlaerungJoin | parallelGateway | Product Owner / BA | orchestrator | `.claude/skills/user-story-refinement/SKILL.md` |  |
| "Relevante Unsicherheit offen?" | exclusiveGateway | Product Owner / BA | orchestrator | `.claude/skills/user-story-refinement/SKILL.md` | Exit and loop-back branches are proposed with reasons and confirmed by the user (AskUserQuestion); the forward branch continues without asking. |
| "Klickbaren Prototyp mit Nutzern testen" | serviceTask | UX & Design | skill | `.claude/skills/story-clarification/SKILL.md` |  |
| "Time-boxed Spike durchführen" | serviceTask | Entwicklung / Tech Lead | skill | `.claude/skills/story-clarification/SKILL.md` |  |
| Merge_Validierung | exclusiveGateway | UX & Design | orchestrator | `.claude/skills/user-story-refinement/SKILL.md` |  |
| "Erkenntnisse auswerten" | userTask | Product Owner / BA | human-checkpoint | `.claude/skills/user-story-refinement/SKILL.md` | gate human; knowledge: references/B5.md |
| "Tragen die Erkenntnisse die Story?" | exclusiveGateway | Product Owner / BA | orchestrator | `.claude/skills/user-story-refinement/SKILL.md` | Exit and loop-back branches are proposed with reasons and confirmed by the user (AskUserQuestion); the forward branch continues without asking. |
| "Anliegen verworfen" | endEvent | Product Owner / BA | orchestrator | `.claude/skills/user-story-refinement/SKILL.md` |  |
| Merge_Einordnung | exclusiveGateway | Product Owner / BA | orchestrator | `.claude/skills/user-story-refinement/SKILL.md` |  |
| "Story unter Epic in User Story Map einordnen" | serviceTask | Product Owner / BA | skill | `.claude/skills/story-writing/SKILL.md` | knowledge: references/C1.md |
| Merge_Formulierung | exclusiveGateway | Product Owner / BA | orchestrator | `.claude/skills/user-story-refinement/SKILL.md` |  |
| "Story im Connextra-Format formulieren" | serviceTask | Product Owner / BA | skill | `.claude/skills/story-writing/SKILL.md` | knowledge: references/C2.md |
| "Bezug zu Epic, Fachkonzept & Feedback dokumentieren" | serviceTask | Product Owner / BA | skill | `.claude/skills/story-writing/SKILL.md` | knowledge: references/C3.md |
| "INVEST-Selbstcheck durchführen" | businessRuleTask | Product Owner / BA | skill | `.claude/skills/story-writing/SKILL.md` | gate critic, maxLoops 3; knowledge: references/C4.md |
| "INVEST erfüllt?" | exclusiveGateway | Product Owner / BA | orchestrator | `.claude/skills/user-story-refinement/SKILL.md` |  |
| Merge_Refinement | exclusiveGateway | Product Owner / BA | orchestrator | `.claude/skills/user-story-refinement/SKILL.md` |  |
| "Refinement mit Three Amigos ansetzen" | userTask | Product Owner / BA | human-checkpoint | `.claude/skills/user-story-refinement/SKILL.md` | gate human; knowledge: references/D1.md |
| Par_AmigosSplit | parallelGateway | Product Owner / BA | orchestrator | `.claude/skills/user-story-refinement/SKILL.md` |  |
| "Wert & Fachregeln erläutern (Was)" | serviceTask | Product Owner / BA | skill | `.claude/skills/story-refinement/SKILL.md` | knowledge: references/D2a.md |
| "Wireframes & Interaktionsfluss beilegen" | serviceTask | UX & Design | skill | `.claude/skills/story-refinement/SKILL.md` |  |
| "Umsetzung & Abhängigkeiten klären (Wie)" | serviceTask | Entwicklung / Tech Lead | skill | `.claude/skills/story-refinement/SKILL.md` |  |
| "Randfälle & Negativszenarien identifizieren" | serviceTask | QA / Test | skill | `.claude/skills/story-refinement/SKILL.md` |  |
| Par_AmigosJoin | parallelGateway | QA / Test | orchestrator | `.claude/skills/user-story-refinement/SKILL.md` |  |
| "Akzeptanzkriterien in Given-When-Then formulieren" | serviceTask | QA / Test | skill | `.claude/skills/story-refinement/SKILL.md` | knowledge: references/D3.md |
| "Beispieltabellen ergänzen (Specification by Example)" | serviceTask | QA / Test | skill | `.claude/skills/story-refinement/SKILL.md` | knowledge: references/D4.md |
| Merge_Schaetzung | exclusiveGateway | Entwicklung / Tech Lead | orchestrator | `.claude/skills/user-story-refinement/SKILL.md` |  |
| "Story Points schätzen (Planning Poker)" | userTask | Entwicklung / Tech Lead | human-checkpoint | `.claude/skills/user-story-refinement/SKILL.md` | gate human, maxLoops 3; knowledge: references/D5.md |
| "Schätzungen konvergiert?" | exclusiveGateway | Entwicklung / Tech Lead | orchestrator | `.claude/skills/user-story-refinement/SKILL.md` |  |
| "Passt die Story in einen Sprint?" | exclusiveGateway | Product Owner / BA | orchestrator | `.claude/skills/user-story-refinement/SKILL.md` | gate critic, maxLoops 3 |
| "Story vertikal schneiden (Splitting-Muster)" | serviceTask | Product Owner / BA | skill | `.claude/skills/story-refinement/SKILL.md` | Every part story runs through "Story im Connextra-Format formulieren" and the rest of the flow one after another (stories/{storyId}-1, -2, ...), each with its own run state; parts inherit loops.split from the parent, so splitting is capped at 3 levels in total.; knowledge: references/D6.md |
| "Definition of Ready prüfen" | businessRuleTask | QA / Test | skill | `.claude/skills/story-readiness/SKILL.md` | knowledge: references/E1.md |
| "Begriffe mit Domänenmodell abgleichen" | serviceTask | Entwicklung / Tech Lead | skill | `.claude/skills/story-readiness/SKILL.md` |  |
| "Auf Fake- & Waisen-Story prüfen" | serviceTask | Product Owner / BA | skill | `.claude/skills/story-readiness/SKILL.md` | knowledge: references/E3.md |
| "Definition of Ready erfüllt?" | exclusiveGateway | Product Owner / BA | orchestrator | `.claude/skills/user-story-refinement/SKILL.md` | gate critic, maxLoops 3 |
| "Nachgelagerten Spike durchführen" | serviceTask | Entwicklung / Tech Lead | skill | `.claude/skills/story-readiness/SKILL.md` |  |
| "Story verworfen" | endEvent | Product Owner / BA | orchestrator | `.claude/skills/user-story-refinement/SKILL.md` |  |
| Par_PlausiSplit | parallelGateway | Product Owner / BA | orchestrator | `.claude/skills/user-story-refinement/SKILL.md` |  |
| "Auf Duplikate & Überschneidungen prüfen" | serviceTask | Product Owner / BA | skill | `.claude/skills/story-backlog-check/SKILL.md` | knowledge: references/P1.md; reads "Product Backlog: übrige Stories" (gh) |
| "Konsistenz mit bestehenden Abläufen prüfen" | serviceTask | UX & Design | skill | `.claude/skills/story-backlog-check/SKILL.md` |  |
| "Abhängigkeiten & Reihenfolge prüfen" | serviceTask | Entwicklung / Tech Lead | skill | `.claude/skills/story-backlog-check/SKILL.md` | reads "Product Backlog: übrige Stories" (gh) |
| "Akzeptanzkriterien gegen bestehende Stories abgleichen" | serviceTask | QA / Test | skill | `.claude/skills/story-backlog-check/SKILL.md` | reads "Product Backlog: übrige Stories" (gh) |
| Par_PlausiJoin | parallelGateway | Product Owner / BA | orchestrator | `.claude/skills/user-story-refinement/SKILL.md` |  |
| "Plausibilitätsbefund zusammenführen" | serviceTask | Product Owner / BA | skill | `.claude/skills/story-backlog-check/SKILL.md` | knowledge: references/P4.md |
| "Konsistent mit dem übrigen Backlog?" | exclusiveGateway | Product Owner / BA | orchestrator | `.claude/skills/user-story-refinement/SKILL.md` | gate critic, maxLoops 3 |
| "Zusammenführung freigeben" | userTask | Product Owner / BA | human-checkpoint | `.claude/skills/user-story-refinement/SKILL.md` | gate human; asked together with the duplicate verdict; reject pauses |
| "Mit bestehender Story zusammenführen" | serviceTask | Product Owner / BA | skill | `.claude/skills/story-backlog-publish/SKILL.md` | knowledge: references/P6.md; writes "Product Backlog: freigegebene Änderungen" (gh issue edit) after approval |
| "Story in bestehende Story überführt" | endEvent | Product Owner / BA | orchestrator | `.claude/skills/user-story-refinement/SKILL.md` |  |
| "Anpassungen an betroffenen Stories vorschlagen" | serviceTask | Product Owner / BA | skill | `.claude/skills/story-backlog-check/SKILL.md` | knowledge: references/P5.md; proposal only |
| "Story priorisieren & Übernahme ins Backlog freigeben" | userTask | Product Owner / BA | human-checkpoint | `.claude/skills/user-story-refinement/SKILL.md` | gate human; shows the exact backlog changes, records approvedVersions; reject pauses; knowledge: references/E4.md |
| "Story im Backlog anlegen & in Ready-Spalte stellen" | serviceTask | Product Owner / BA | skill | `.claude/skills/story-backlog-publish/SKILL.md` | writes "Product Backlog: freigegebene Änderungen" (gh issue create, project item-add/item-edit) after approval; backlogItem recorded right after create |
| "Betroffene Stories im Backlog markieren" | serviceTask | Product Owner / BA | skill | `.claude/skills/story-backlog-publish/SKILL.md` | writes "Product Backlog: freigegebene Änderungen" (gh issue comment) after approval, one appliedUrl per proposal |
| "Story sprint-ready" | endEvent | Product Owner / BA | orchestrator | `.claude/skills/user-story-refinement/SKILL.md` |  |
| "Product-Methodik: Eingang & Triage" | dataStoreReference | — | context-source | — | wissen · notebook:The Product - Business Design (details under "Context sources") |
| "Product-Methodik: Fachliche Klärung" | dataStoreReference | — | context-source | — | wissen · notebook:The Product - Business Design (details under "Context sources") |
| "Product-Methodik: Story formulieren" | dataStoreReference | — | context-source | — | wissen · notebook:The Product - Business Design (details under "Context sources") |
| "Product-Methodik: Refinement" | dataStoreReference | — | context-source | — | wissen · notebook:The Product - Business Design (details under "Context sources") |
| "Product-Methodik: Definition of Ready" | dataStoreReference | — | context-source | — | wissen · notebook:The Product - Business Design (details under "Context sources") |
| "Product-Methodik: Plausibilität & Freigabe" | dataStoreReference | — | context-source | — | wissen · notebook:The Product - Business Design (details under "Context sources") |
| "Product Backlog & User Story Map" | dataStoreReference | — | context-source | — | live · cli:gh (details under "Context sources") |
| "Product Backlog: übrige Stories" | dataStoreReference | — | context-source | — | live · cli:gh (details under "Context sources") |
| "Product Backlog: freigegebene Änderungen" | dataStoreReference | — | context-source | — | live · cli:gh (details under "Context sources") |
| "Feedback" | dataInput | — | workflow-input | — | artifact feedback |
| "Sprint-reife User Story" | dataObjectReference | Product Owner / BA | workflow-output | — | artifact sprint-reife-user-story |

## Grey — deliberately not generated

None.

## Red — open / unresolved

None — every element resolved to a concrete kind.

## Context sources

### Product-Methodik: Eingang & Triage

- **Art / Ort:** wissen / notebook:The Product - Business Design
- **Readers:** "Feedback erfassen & als Problem formulieren", "Verwandte Stories & Epics im Backlog suchen" · **Writers:** none
- **Placement:** no tools (wissen): distilled at generation time, no access at run time.
- **Knowledge (wissen):** knowledge/I1.md, knowledge/I2.md (installed as `references/<taskId>.md`)

### Product-Methodik: Fachliche Klärung

- **Art / Ort:** wissen / notebook:The Product - Business Design
- **Readers:** "Anliegen mit Feedbackgeber klären", "Gegen Epic-Ziel & Fachkonzept prüfen", "Ist-/Soll-Delta beschreiben", "Technische Auswirkungen grob einschätzen", "Erkenntnisse auswerten" · **Writers:** none
- **Placement:** no tools (wissen): distilled at generation time, no access at run time.
- **Knowledge (wissen):** knowledge/K1.md, knowledge/K2.md, knowledge/K3.md, knowledge/K4.md, knowledge/B5.md (installed as `references/<taskId>.md`)

### Product-Methodik: Story formulieren

- **Art / Ort:** wissen / notebook:The Product - Business Design
- **Readers:** "Story unter Epic in User Story Map einordnen", "Story im Connextra-Format formulieren", "Bezug zu Epic, Fachkonzept & Feedback dokumentieren", "INVEST-Selbstcheck durchführen" · **Writers:** none
- **Placement:** no tools (wissen): distilled at generation time, no access at run time.
- **Knowledge (wissen):** knowledge/C1.md, knowledge/C2.md, knowledge/C3.md, knowledge/C4.md (installed as `references/<taskId>.md`)

### Product-Methodik: Refinement

- **Art / Ort:** wissen / notebook:The Product - Business Design
- **Readers:** "Refinement mit Three Amigos ansetzen", "Wert & Fachregeln erläutern (Was)", "Akzeptanzkriterien in Given-When-Then formulieren", "Beispieltabellen ergänzen (Specification by Example)", "Story Points schätzen (Planning Poker)", "Story vertikal schneiden (Splitting-Muster)" · **Writers:** none
- **Placement:** no tools (wissen): distilled at generation time, no access at run time.
- **Knowledge (wissen):** knowledge/D1.md, knowledge/D2a.md, knowledge/D3.md, knowledge/D4.md, knowledge/D5.md, knowledge/D6.md (installed as `references/<taskId>.md`)

### Product-Methodik: Definition of Ready

- **Art / Ort:** wissen / notebook:The Product - Business Design
- **Readers:** "Definition of Ready prüfen", "Auf Fake- & Waisen-Story prüfen" · **Writers:** none
- **Placement:** no tools (wissen): distilled at generation time, no access at run time.
- **Knowledge (wissen):** knowledge/E1.md, knowledge/E3.md (installed as `references/<taskId>.md`)

### Product-Methodik: Plausibilität & Freigabe

- **Art / Ort:** wissen / notebook:The Product - Business Design
- **Readers:** "Auf Duplikate & Überschneidungen prüfen", "Plausibilitätsbefund zusammenführen", "Mit bestehender Story zusammenführen", "Anpassungen an betroffenen Stories vorschlagen", "Story priorisieren & Übernahme ins Backlog freigeben" · **Writers:** none
- **Placement:** no tools (wissen): distilled at generation time, no access at run time.
- **Knowledge (wissen):** knowledge/P1.md, knowledge/P4.md, knowledge/P6.md, knowledge/P5.md, knowledge/E4.md (installed as `references/<taskId>.md`)

### Product Backlog & User Story Map

- **Art / Ort:** live / cli:gh
- **Readers:** "Verwandte Stories & Epics im Backlog suchen" · **Writers:** "Änderungshinweis an offener Story ergänzen", "Feedback im Opportunity Backlog anlegen"
- **Tools:** read `Bash(gh auth status:*)`, `Bash(gh issue list:*)`, `Bash(gh issue view:*)`, `Bash(gh search issues:*)`, `Bash(gh project view:*)`, `Bash(gh project item-list:*)` · write `Bash(gh issue comment:*)`, `Bash(gh issue create:*)`
- **Placement:** read tools in `.claude/settings.json` → `permissions.allow`. Lesezugriff nicht pro Rolle getrennt. Writes only in `story-backlog-publish`, after "Änderungshinweis an offene Story freigeben" / "Parken im Opportunity Backlog freigeben", backed by the write guard.

### Product Backlog: übrige Stories

- **Art / Ort:** live / cli:gh
- **Readers:** "Auf Duplikate & Überschneidungen prüfen", "Abhängigkeiten & Reihenfolge prüfen", "Akzeptanzkriterien gegen bestehende Stories abgleichen" · **Writers:** none
- **Tools:** read `Bash(gh issue list:*)`, `Bash(gh issue view:*)`, `Bash(gh search issues:*)`, `Bash(gh project item-list:*)`
- **Placement:** read tools in `.claude/settings.json` → `permissions.allow`. Lesezugriff nicht pro Rolle getrennt.

### Product Backlog: freigegebene Änderungen

- **Art / Ort:** live / cli:gh
- **Readers:** none (look-ups by the writers only) · **Writers:** "Mit bestehender Story zusammenführen", "Story im Backlog anlegen & in Ready-Spalte stellen", "Betroffene Stories im Backlog markieren"
- **Tools:** read `Bash(gh issue list:*)`, `Bash(gh issue view:*)`, `Bash(gh project view:*)`, `Bash(gh project field-list:*)`, `Bash(gh project item-list:*)` · write `Bash(gh issue create:*)`, `Bash(gh issue edit:*)`, `Bash(gh issue comment:*)`, `Bash(gh project item-add:*)`, `Bash(gh project item-edit:*)`
- **Placement:** the store has no readers, so its read tools are not in `permissions.allow` (`gh project field-list` prompts as usual). Writes only in `story-backlog-publish`, after "Zusammenführung freigeben" / "Story priorisieren & Übernahme ins Backlog freigeben", backed by the write guard.

All three backlog stores are the same GitHub backlog (one `DataStore_Backlog`), cut by phase.

Process input: feedback, required: feedback, backlog, fachkonzept — becomes the argument-hint and Input section of `.claude/skills/user-story-refinement/SKILL.md`; `backlog` = GitHub repo and project.
Process output: sprint-reife-user-story — contract for the end result, written by "Story im Backlog anlegen & in Ready-Spalte stellen", complete at the end "Story sprint-ready".

11 agent tasks (UX & Design, Entwicklung / Tech Lead, QA / Test) have no store arrow and keep the phase-level knowledge (lane mapping; decided by the business user).

### Context hooks

| Hook | Event / matcher | Guards | Purpose |
|---|---|---|---|
| `.claude/hooks/user-story-refinement-write-guard.mjs` | PreToolUse / `Bash` | "Product Backlog & User Story Map", "Product Backlog: freigegebene Änderungen" | Asks before writing into a live store: every gh call that is not a listed read, also inside compound commands, after env or in bash -c. Does not pin repo or project (accepted risk, see open questions). |
| `.claude/hooks/user-story-refinement-cost-ledger.mjs` | SubagentStop, Stop, SessionEnd | – | Records run token usage; `user-story-refinement-cost-map.json` beside it maps it to elements. |

No memory store, so no memory cap.

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
| feedback | `{feedback} (feedback text or file the user hands over at the start, read-only)` | — | I1 | feedback, backlog, fachkonzept (workflow input) |
| feedback-eintrag | `stories/{storyId}/01_feedback.md` | I1, I2 | — | storyId, version, status, backlog, fachkonzept |
| epic-fachkonzept | `{fachkonzept} (existing epic and Fachkonzept documents, read-only)` | — | K2 | — |
| ist-soll-delta | `stories/{storyId}/02_ist-soll-delta.md` | K3 | — | storyId, version, status |
| prototyp-testergebnisse | `stories/{storyId}/03_prototyp-test.md` | K6 | — | storyId, version, status |
| spike-report | `stories/{storyId}/03_spike-report.md` | B4 | — | storyId, version, status |
| story-karte | `stories/{storyId}/04_story.md` | C2 | — | storyId, version, status, epic, feedback, parentStory |
| given-when-then-szenarien | `stories/{storyId}/05_akzeptanzkriterien.md` | D3 | — | storyId, version, status |
| story-point-schaetzung | `stories/{storyId}/06_schaetzung.md` | D5 | — | storyId, version, status, storyPoints, maxStorySize |
| plausibilitaetsbefund | `stories/{storyId}/08_plausibilitaet.md` | P4 | — | storyId, version, status |
| sprint-reife-user-story | `stories/{storyId}/10_ready-story.md` | P8 | — | storyId, version, status, epic, storyPoints, priority, backlogItem |
| dor-befund | `stories/{storyId}/07_dor-befund.md` | E1, E2, E3 | Gw_Ready | storyId, version, status |
| aenderungsvorschlaege | `stories/{storyId}/09_aenderungsvorschlaege.md` | P5, P9, E4 | E4, P6, P10 | storyId, status, proposals |
| uebergabe | `stories/{storyId}/99_uebergabe.md` | I3, I5, End_BugUebergeben, End_AnStoryUebergeben, End_FeedbackGeparkt, End_FachkonzeptAenderung, End_AnliegenVerworfen, End_StoryVerworfen, End_StoryZusammengefuehrt | I4, I6 | storyId, status, target, backlogItem |
| run-state | `stories/{storyId}/00_run.md` | Start_FeedbackEingegangen, D6, I3, I5, P9, E4 | I4, I6, P6, P8, P10, K1, B5, D1, D5, E4, Gw_Invest, Gw_Schaetzung, Gw_Sprintgroesse, Gw_Ready, Gw_Plausibel | storyId, parentStory, position, checkpoints, loops, status |

## Open questions carried forward

None. Answered during this run:

- **Mit dem Fachkonzept vereinbar?** — The sources treat a conflict with the Fachkonzept as a trigger to refine model and language with the domain experts, not a hard stop. Keep the end event "Fachkonzept-Änderung beantragt" or loop back? → Keep the diagram as drawn. The change request names the conflicting term or rule and a proposal so it involves the domain experts concretely.
- **Technische Auswirkungen grob einschätzen** — Non-functional requirements (performance, security, capacity) are not checked explicitly anywhere. Where should they go? → Into existing steps: "Technische Auswirkungen grob einschätzen" and the Definition-of-Ready checklist. No new BPMN step.
- **Ist-/Soll-Delta beschreiben** — Should the steps require a measurable target (expected behaviour change and metric) for every story? → Yes: "Ist-/Soll-Delta beschreiben" and "Story im Connextra-Format formulieren" ask for the expected behaviour change and a metric. No new step.
- **Story priorisieren & Übernahme ins Backlog freigeben** — Should "Story priorisieren & in Ready-Spalte stellen" suggest a prioritisation method? → Yes: suggest a position via Weighted Shortest Job First (Cost of Delay ÷ story points); the PO decides.
- **Mit bestehender Story zusammenführen** — The merge path (Gw_Plausibel -> "Mit bestehender Story zusammenführen" -> end) passes no human approval. Add a userTask to the BPMN or confirm inside the flow? → Superseded on 2026-10-04: the diagram now has "Zusammenführung freigeben" before the merge, which writes into GitHub.
- **Story vertikal schneiden (Splitting-Muster)** — A vertical split yields several part stories. Continue with the first and keep the rest as drafts, or process all of them one after another? → Process all part stories one after another in the same run (stories/{storyId}-1, -2, ...), each through the rest of the flow.
- **Gw_Erkenntnis ‘Tragen die Erkenntnisse die Story?’** — The notebook names more outcomes after a spike or prototype test than the diagram has (persevere, pivot, kill, another experiment); the gateway has two exits. → Keep two exits: a pivot goes through "Nein" with a note, a further experiment is started by the human at "Erkenntnisse auswerten". No diagram change.
- **Backlog in GitHub (2026-10-04)** — Should the workflow itself write changes into the live backlog? → Yes, each after its own approval step drawn in the diagram ("Änderungshinweis an offene Story freigeben", "Parken im Opportunity Backlog freigeben", "Zusammenführung freigeben", "Story priorisieren & Übernahme ins Backlog freigeben"); "Anpassungen an betroffenen Stories vorschlagen" only proposes; the bug hand-over stays local. Reject pauses the run. Priority as project field "Priority", epics as labels epic:<name>.
- **Write guard** — Does the hook pin repo or project? → No: it asks before every gh call that is not a listed read; the skills pass -R/--owner and the approvals show the target. Accepted risk.
- **Approvals and write steps without a knowledge store** — The four approvals and five write steps need no notebook knowledge; the park and merge judgement happens at the gateways with the phase knowledge.
