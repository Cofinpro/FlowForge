---
bpmn:
  file: product-vision-to-user-stories.bpmn
  elements: [Start_Geschaeftsidee, S0, Call_R1, Merge_P1, SP1.1, SP1.1_Start, SP1.1_Merge, S1.1.1, S1.1.2, S1.1.3, S1.1.4, S1.1.5, S1.1.6, SP1.1_CallK, SP1.1_Gw, SP1.1_End, SP1.2, SP1.2_Start, SP1.2_Merge, S1.2.1, S1.2.2, S1.2.3, S1.2.4, S1.2.5, S1.2.6, SP1.2_CallK, SP1.2_Gw, SP1.2_End, Call_PG1, G-P1, Merge_Research, Call_R2, SP2.1, SP2.1_Start, SP2.1_Merge, S2.1.1, S2.1.2, S2.1.3, S2.1.4, S2.1.5, S2.1.6, SP2.1_CallK, SP2.1_Gw, SP2.1_End, SP2.2, SP2.2_Start, SP2.2_Merge, S2.2.1, S2.2.2, S2.2.3, S2.2.4, S2.2.5, SP2.2_CallK, SP2.2_Gw, SP2.2_End, Call_R3, SP3.1, SP3.1_Start, SP3.1_Merge, S3.1.1, S3.1.2, S3.1.3, S3.1.4, SP3.1_CallK, SP3.1_Gw, SP3.1_End, Call_PG2, G-P2, Merge_Mapping, SP4.1, SP4.1_Start, SP4.1_Merge, S4.1.1, S4.1.2, S4.1.3, S4.1.4, S4.1.5, SP4.1_CallK, SP4.1_Gw, SP4.1_End, SP4.2, SP4.2_Start, SP4.2_Merge, S4.2.1, S4.2.2, S4.2.3, S4.2.4, S4.2.5, SP4.2_CallK, SP4.2_Gw, SP4.2_End, Call_PG3, G-P3, Merge_Refinement, SP5.1, SP5.1_Start, S5.1.1, SP5.1_Merge, SP5.1_CallK, SP5.1_Gw, S5.1.3, S5.1.4, SP5.1_End, SP56, SP56_Start, SP5.2, SP5.2_Start, S5.2.1, S5.2.2, S5.2.3, S5.2.4, SP5.2_CallK, SP5.2_End, SP56_Gw, SP6.1, SP6.1_Start, SP6.1_Merge, S6.1.1, S6.1.2, S6.1.3, S6.1.4, SP6.1_CallK, SP6.1_Gw, SP6.1_End, SP56_End_ok, SP56_End_resplit, G-Split, Merge_AC, SP6.2, SP6.2_Start, SP6.2_Merge, S6.2.1, S6.2.2, S6.2.3, S6.2.4, S6.2.5, SP6.2_CallK, SP6.2_Gw, SP6.2_End, G-6.2, S7, End_StoryReady, Merge_NoGo, S_NoGo, End_IdeeVerworfen, SP_Budget, SP_Budget_Start, SP_Budget_S1, SP_Budget_End, R_Start, R_1, R_Split, R_2a, R_2b, R_2c, R_Join, R_Merge, R_3, R_3b, R_Gw, R_2d, R_4, R_End, K_Start, K_1, K_2, K_Gw1, K_3, K_Merge, K_4, K_5, K_End, P_Start, P_1, P_2, P_3, P_4, P_End, PG_Start, PG_Split, PG_Call_K, PG_Call_P, PG_Join, PG_1, PG_End]
---

# Mapping report — product-vision-to-user-stories

Generated 2026-09-25 from `generated/product-vision-to-user-stories/workflow-spec.yaml`
(source `product-vision-to-user-stories.bpmn` @ `74ca1628975b…`). This is the trace target for
`bpmn2agent-verify` — every row below must correspond to what's actually on disk.

Elements by kind: orchestrator 57 · skill 85 · not-generated 34 · script 8 · hook 1 (total 185).

## Review status

**Nothing red, no open questions.** All 185 elements resolved to a concrete kind.
34 element(s) deliberately not generated (grey) — not an error, reasons under "Grey" below.
Interactive, read-only view of the same mapping: [`index.html`](index.html).

## Pattern

**workflow-script** — top-level file: `product-vision-to-user-stories.workflow.mjs`

Dein Prozess läuft vollständig ohne Menschen, hat echte Parallelität (drei Recherche-Kanäle, Kritiker und Panel gleichzeitig) und Mehrfach-Instanzen („je Epic“, „je Story“, „je Persona“). Jede Raute routet nur auf dem Verdikt eines Gate-Records (pass / fail / pivot / more-research / no-go) — das eigentliche Urteil fällt vorher im Kritiker-Schritt. Deshalb baue ich das als automatisches Workflow-Skript, das jeden Schritt vom Agenten seiner Rolle ausführen lässt. Es läuft nur, wenn du es pro Idee bewusst startest; nichts passiert im Hintergrund.

### Alternatives considered

- **orchestrator-agent** — Die Gateways brauchen kein Einzelfall-Urteil (sie lesen nur das Verdikt des Kritikers), und ein einzelner Agent-Kontext kann ~60 Schritte mit Schleifen, Pivots und Mehrfach-Instanzen weder halten noch die Loop-Caps deterministisch einhalten.
- **skill-chain-hooks** — Es gibt keinen menschlichen Prüfpunkt, an dem jemand die Kette weiterschiebt; die Parallelität (Recherche, Phasen-Gates) und die „je Epic / je Story“-Schleifen bräuchten ohnehin eine Steuerung.
- **mixed** — Alle Phasen haben dieselbe Form (unbeaufsichtigt, deterministisches Routing auf Gate-Records) — es gibt keinen strukturell anderen Abschnitt, der ein zweites Muster rechtfertigt.

### Deviations from the generator defaults (confirmed with the user, 2026-09-25)

- **Role agents despite workflow-script.** `bpmn2agent-generate` normally generates agents only
  for the orchestrator-agent pattern. Here the Workflow script runs every step with
  `agentType: df-<role>`, so the 10 role agents are real runtime components (docs/dark-factory/implementation.md §2: "ein Agent pro agentRole"). Every step element claims its role's agent file.
- **Lanes → roles.** The diagram draws one lane per role per sub-process (42 lanes). Each lane has its
  own `roles.<key>` entry, and all lanes of the same `sdlc:agentRole` share one agent. Lane-less
  elements (top-level process, R, K) take their role from `sdlc:step agentRole` and point at that
  role's first lane.
- **Hooks attached to their gate element.** "Artefakt gegen Rubric bewerten" (skill) also owns
  `product-critic-readonly-guard`. "Rubric laden" (script) also owns `product-artifact-contract-guard` (the same
  storage contract enforced at write time) and `commit-artifact.mjs` + `lib/contracts.mjs`, the one writer of
  artifact sidecars that K.1 checks before anything is judged.

## Legend

One colour per `kind` (`mapping/workflow-mapped.bpmn`, `index.html`, `renders/*.png`). Every annotation
also names its kind or status, so the colour is never the only signal.

| Colour | Kind | Meaning |
|---|---|---|
| Blue | `agent-checklist` | A checklist item in the owning agent. |
| Green | `skill` | Its own generated skill. |
| Purple | `script` | A deterministic script inside a skill. |
| Orange | `hook` | A Claude Code hook. |
| Teal | `orchestrator` | Gateways, loop back-edges, multi-instance markers — no file of its own. |
| Amber | `human-checkpoint` | A person decides here (none in this fully autonomous process). |
| Brown | `artifact-contract` | A data object with a path/frontmatter contract. |
| **Grey** | `not-generated` | Deliberately not generated; reason shown under "Grey" below. Not an error. |
| **Red** | `unresolved` | Unmapped or still an open question; blocks `bpmn2agent-verify`'s "no red in the map" check. |

## Element → artifact map

| BPMN element | Type | Lane | Kind | Generated artifact(s) | Notes |
|---|---|---|---|---|---|
| Geschaeftsidee / Marktbedarf erkannt (Start_Geschaeftsidee) | startEvent | — | orchestrator | `skills/product-init/SKILL.md`, `skills/product-init/scripts/init-project.mjs`, `skills/product-traceability/scripts/lib/project.mjs` |  |
| 0 Idee-Brief vervollstaendigen (S0) | serviceTask | Stratege | skill | `skills/product-idee-brief-vervollstaendigen/SKILL.md`, `agents/product-stratege.md` |  |
| Recherche: Markt & Wettbewerb (DR-01) (Call_R1) | callActivity | Researcher | skill | `skills/product-recherche/SKILL.md`, `agents/product-researcher.md` |  |
| Merge_P1 (Merge_P1) | exclusiveGateway | — | orchestrator | (see `product-vision-to-user-stories.workflow.mjs`) |  |
| 1.1 Produktvision & Geschaeftsmodell rahmen (SP1.1) | subProcess | — | orchestrator | (see `product-vision-to-user-stories.workflow.mjs`) |  |
| Gestartet (SP1.1_Start) | startEvent | Stratege | not-generated | — | Start/end event of the collapsed '1.1 Produktvision & Geschaeftsmodell rahmen' scope — its control flow lives in the Workflow script; structural marker only, no separate artifact. |
| SP1.1_Merge (SP1.1_Merge) | exclusiveGateway | Stratege | orchestrator | (see `product-vision-to-user-stories.workflow.mjs`) |  |
| Status quo & Zielbild klaeren (S1.1.1) | serviceTask | Stratege | skill | `skills/product-zielbild-klaeren/SKILL.md`, `agents/product-stratege.md` |  |
| Vision Statement & Elevator Pitch formulieren (S1.1.2) | serviceTask | Stratege | skill | `skills/product-vision-statement-formulieren/SKILL.md`, `agents/product-stratege.md` |  |
| Lean / Business Model Canvas abbilden (S1.1.3) | serviceTask | Stratege | skill | `skills/product-lean-canvas-abbilden/SKILL.md`, `agents/product-stratege.md` |  |
| Proto-Panel aus Research ableiten (S1.1.4) | serviceTask | Researcher | skill | `skills/product-proto-panel-ableiten/SKILL.md`, `agents/product-researcher.md` |  |
| Value Proposition Canvas abgleichen (S1.1.5) | serviceTask | UX-/Journey-Designer | skill | `skills/product-value-proposition-canvas-abgleichen/SKILL.md`, `agents/product-ux.md` |  |
| Annahmen in Assumptions Map priorisieren (S1.1.6) | serviceTask | Stratege | skill | `skills/product-assumptions-map-priorisieren/SKILL.md`, `agents/product-stratege.md` |  |
| Kritiker-Pruefung aufrufen (phase-1-1) (SP1.1_CallK) | callActivity | Kritiker | skill | `skills/product-kritiker-pruefung/SKILL.md`, `agents/product-kritiker.md` | gate critic, maxLoops 3 |
| Geschaeftsmodell tragfaehig & UVP klar? (SP1.1_Gw) | exclusiveGateway | Kritiker | orchestrator | (see `product-vision-to-user-stories.workflow.mjs`) |  |
| Vision & Geschaeftsmodell entworfen (SP1.1_End) | endEvent | Kritiker | not-generated | — | Start/end event of the collapsed '1.1 Produktvision & Geschaeftsmodell rahmen' scope — its control flow lives in the Workflow script; structural marker only, no separate artifact. |
| 1.2 Impact Mapping & Business-Ziele definieren (SP1.2) | subProcess | — | orchestrator | (see `product-vision-to-user-stories.workflow.mjs`) |  |
| Gestartet (SP1.2_Start) | startEvent | Stratege | not-generated | — | Start/end event of the collapsed '1.2 Impact Mapping & Business-Ziele definieren' scope — its control flow lives in the Workflow script; structural marker only, no separate artifact. |
| SP1.2_Merge (SP1.2_Merge) | exclusiveGateway | Stratege | orchestrator | (see `product-vision-to-user-stories.workflow.mjs`) |  |
| Ziel & Kennzahlen festlegen (Why) (S1.2.1) | serviceTask | Stratege | skill | `skills/product-ziele-kennzahlen-festlegen/SKILL.md`, `agents/product-stratege.md` |  |
| Akteure identifizieren (Who) (S1.2.2) | serviceTask | Stratege | skill | `skills/product-akteure-identifizieren/SKILL.md`, `agents/product-stratege.md` |  |
| Verhaltensaenderungen ableiten (How) (S1.2.3) | serviceTask | UX-/Journey-Designer | skill | `skills/product-verhaltensaenderungen-ableiten/SKILL.md`, `agents/product-ux.md` |  |
| Deliverables als Optionen sammeln (What) (S1.2.4) | serviceTask | Stratege | skill | `skills/product-deliverables-sammeln/SKILL.md`, `agents/product-stratege.md` |  |
| Impacts nach Hebel & Risiko priorisieren (S1.2.5) | serviceTask | Stratege | skill | `skills/product-impacts-priorisieren/SKILL.md`, `agents/product-stratege.md` |  |
| Outcome-orientierte Roadmap ableiten (S1.2.6) | serviceTask | Stratege | skill | `skills/product-roadmap-ableiten/SKILL.md`, `agents/product-stratege.md` |  |
| Kritiker-Pruefung aufrufen (phase-1-2) (SP1.2_CallK) | callActivity | Kritiker | skill | `skills/product-kritiker-pruefung/SKILL.md`, `agents/product-kritiker.md` | gate critic, maxLoops 3 |
| Pfad zum Ziel plausibel? (SP1.2_Gw) | exclusiveGateway | Kritiker | orchestrator | (see `product-vision-to-user-stories.workflow.mjs`) |  |
| Impact Map & Roadmap abgeleitet (SP1.2_End) | endEvent | Kritiker | not-generated | — | Start/end event of the collapsed '1.2 Impact Mapping & Business-Ziele definieren' scope — its control flow lives in the Workflow script; structural marker only, no separate artifact. |
| Phasen-Gate-Review: Vision (Call_PG1) | callActivity | Kritiker | skill | `skills/product-phasen-gate/SKILL.md`, `agents/product-kritiker.md` | gate panel, maxLoops 3 |
| Vision & Geschaeftsziele tragfaehig? (G-P1) | exclusiveGateway | — | orchestrator | (see `product-vision-to-user-stories.workflow.mjs`) |  |
| Merge_Research (Merge_Research) | exclusiveGateway | — | orchestrator | (see `product-vision-to-user-stories.workflow.mjs`) |  |
| Recherche: Zielgruppe & Voice of Customer (DR-02) (Call_R2) | callActivity | Researcher | skill | `skills/product-recherche/SKILL.md`, `agents/product-researcher.md` |  |
| 2.1 Discovery mit synthetischem Panel (SP2.1) | subProcess | — | orchestrator | (see `product-vision-to-user-stories.workflow.mjs`) |  |
| Gestartet (SP2.1_Start) | startEvent | Researcher | not-generated | — | Start/end event of the collapsed '2.1 Discovery mit synthetischem Panel' scope — its control flow lives in the Workflow script; structural marker only, no separate artifact. |
| SP2.1_Merge (SP2.1_Merge) | exclusiveGateway | Researcher | orchestrator | (see `product-vision-to-user-stories.workflow.mjs`) |  |
| Stakeholder & Anforderungsquellen identifizieren (S2.1.1) | serviceTask | Researcher | skill | `skills/product-stakeholder-quellen-identifizieren/SKILL.md`, `agents/product-researcher.md` |  |
| Erhebungstechniken & Interviewleitfaden erstellen (S2.1.2) | serviceTask | Interviewer | skill | `skills/product-interviewleitfaden-erstellen/SKILL.md`, `agents/product-interviewer.md` |  |
| Synthetisches Panel aus Research-Korpus aufbauen (S2.1.3) | serviceTask | Researcher | skill | `skills/product-synthetisches-panel-aufbauen/SKILL.md`, `agents/product-researcher.md` |  |
| Synthetische Interviews durchfuehren (S2.1.4) | callActivity | Interviewer | skill | `skills/product-synthetische-interviews-durchfuehren/SKILL.md`, `agents/product-interviewer.md` |  |
| User Roles & Personas modellieren (S2.1.5) | serviceTask | UX-/Journey-Designer | skill | `skills/product-personas-modellieren/SKILL.md`, `agents/product-ux.md` |  |
| Jobs-to-be-Done formulieren (S2.1.6) | serviceTask | UX-/Journey-Designer | skill | `skills/product-jtbd-formulieren/SKILL.md`, `agents/product-ux.md` |  |
| Kritiker-Pruefung aufrufen (phase-2-1) (SP2.1_CallK) | callActivity | Kritiker | skill | `skills/product-kritiker-pruefung/SKILL.md`, `agents/product-kritiker.md` | gate critic, maxLoops 3 |
| Rollen & Jobs durch Quellen & Transkripte belegt? (SP2.1_Gw) | exclusiveGateway | Kritiker | orchestrator | (see `product-vision-to-user-stories.workflow.mjs`) |  |
| Personas & JTBD ermittelt (SP2.1_End) | endEvent | Kritiker | not-generated | — | Start/end event of the collapsed '2.1 Discovery mit synthetischem Panel' scope — its control flow lives in the Workflow script; structural marker only, no separate artifact. |
| 2.2 Empathy Mapping & Problem Definition (SP2.2) | subProcess | — | orchestrator | (see `product-vision-to-user-stories.workflow.mjs`) |  |
| Gestartet (SP2.2_Start) | startEvent | UX-/Journey-Designer | not-generated | — | Start/end event of the collapsed '2.2 Empathy Mapping & Problem Definition' scope — its control flow lives in the Workflow script; structural marker only, no separate artifact. |
| SP2.2_Merge (SP2.2_Merge) | exclusiveGateway | UX-/Journey-Designer | orchestrator | (see `product-vision-to-user-stories.workflow.mjs`) |  |
| Empathy Maps erstellen (S2.2.1) | serviceTask | UX-/Journey-Designer | skill | `skills/product-empathy-maps-erstellen/SKILL.md`, `agents/product-ux.md` |  |
| Pains & Gains extrahieren (S2.2.2) | serviceTask | UX-/Journey-Designer | skill | `skills/product-pains-gains-extrahieren/SKILL.md`, `agents/product-ux.md` |  |
| Point of View & How-Might-We formulieren (S2.2.3) | serviceTask | UX-/Journey-Designer | skill | `skills/product-pov-hmw-formulieren/SKILL.md`, `agents/product-ux.md` |  |
| Opportunity-Solution-Tree aufbauen (S2.2.4) | serviceTask | Stratege | skill | `skills/product-opportunity-solution-tree-aufbauen/SKILL.md`, `agents/product-stratege.md` |  |
| Opportunities priorisieren (S2.2.5) | callActivity | Stratege | skill | `skills/product-opportunities-priorisieren/SKILL.md`, `agents/product-stratege.md` |  |
| Kritiker-Pruefung aufrufen (phase-2-2) (SP2.2_CallK) | callActivity | Kritiker | skill | `skills/product-kritiker-pruefung/SKILL.md`, `agents/product-kritiker.md` | gate critic, maxLoops 3 |
| Problem loesungsneutral & fokussiert? (SP2.2_Gw) | exclusiveGateway | Kritiker | orchestrator | (see `product-vision-to-user-stories.workflow.mjs`) |  |
| Opportunity Backlog priorisiert (SP2.2_End) | endEvent | Kritiker | not-generated | — | Start/end event of the collapsed '2.2 Empathy Mapping & Problem Definition' scope — its control flow lives in the Workflow script; structural marker only, no separate artifact. |
| Recherche: Domaene, Prozesse & Regulatorik (DR-03) (Call_R3) | callActivity | Researcher | skill | `skills/product-recherche/SKILL.md`, `agents/product-researcher.md` |  |
| 3.1 Customer Journey kartieren (Current vs. Future State) (SP3.1) | subProcess | — | orchestrator | (see `product-vision-to-user-stories.workflow.mjs`) |  |
| Gestartet (SP3.1_Start) | startEvent | UX-/Journey-Designer | not-generated | — | Start/end event of the collapsed '3.1 Customer Journey kartieren (Current vs. Future State)' scope — its control flow lives in the Workflow script; structural marker only, no separate artifact. |
| SP3.1_Merge (SP3.1_Merge) | exclusiveGateway | UX-/Journey-Designer | orchestrator | (see `product-vision-to-user-stories.workflow.mjs`) |  |
| Current-State-Journey kartieren (S3.1.1) | serviceTask | UX-/Journey-Designer | skill | `skills/product-current-state-journey-kartieren/SKILL.md`, `agents/product-ux.md` |  |
| Hot Spots & Friktionspunkte markieren (S3.1.2) | serviceTask | UX-/Journey-Designer | skill | `skills/product-hot-spots-markieren/SKILL.md`, `agents/product-ux.md` |  |
| Future-State-Journey entwerfen (S3.1.3) | serviceTask | UX-/Journey-Designer | skill | `skills/product-future-state-journey-entwerfen/SKILL.md`, `agents/product-ux.md` |  |
| Service Blueprint schichten (S3.1.4) | serviceTask | Architekt | skill | `skills/product-service-blueprint-schichten/SKILL.md`, `agents/product-architekt.md` |  |
| Kritiker-Pruefung aufrufen (phase-3-1) (SP3.1_CallK) | callActivity | Kritiker | skill | `skills/product-kritiker-pruefung/SKILL.md`, `agents/product-kritiker.md` | gate critic, maxLoops 3 |
| Future State ohne untragbare Backstage-Komplexitaet? (SP3.1_Gw) | exclusiveGateway | Kritiker | orchestrator | (see `product-vision-to-user-stories.workflow.mjs`) |  |
| Customer Journey & Service Blueprint kartiert (SP3.1_End) | endEvent | Kritiker | not-generated | — | Start/end event of the collapsed '3.1 Customer Journey kartieren (Current vs. Future State)' scope — its control flow lives in the Workflow script; structural marker only, no separate artifact. |
| Phasen-Gate-Review: Validierung (Call_PG2) | callActivity | Kritiker | skill | `skills/product-phasen-gate/SKILL.md`, `agents/product-kritiker.md` | gate panel, maxLoops 3 |
| Problem & Nutzerreise validiert? (G-P2) | exclusiveGateway | — | orchestrator | (see `product-vision-to-user-stories.workflow.mjs`) | condition: verdict == pivot requires pivotCount < 2 (Gedächtnis §9.3); otherwise no-go |
| Merge_Mapping (Merge_Mapping) | exclusiveGateway | — | orchestrator | (see `product-vision-to-user-stories.workflow.mjs`) |  |
| 4.1 Story Mapping Workshop: Backbone & Epics strukturieren (SP4.1) | subProcess | — | orchestrator | (see `product-vision-to-user-stories.workflow.mjs`) |  |
| Gestartet (SP4.1_Start) | startEvent | Backlog-Autor | not-generated | — | Start/end event of the collapsed '4.1 Story Mapping Workshop: Backbone & Epics strukturieren' scope — its control flow lives in the Workflow script; structural marker only, no separate artifact. |
| SP4.1_Merge (SP4.1_Merge) | exclusiveGateway | Backlog-Autor | orchestrator | (see `product-vision-to-user-stories.workflow.mjs`) |  |
| Rahmen setzen (Personas, Ziele, Problem) (S4.1.1) | serviceTask | Backlog-Autor | skill | `skills/product-story-map-rahmen-setzen/SKILL.md`, `agents/product-backlog-autor.md` |  |
| Big Picture & Narrative Flow erzaehlen (S4.1.2) | serviceTask | UX-/Journey-Designer | skill | `skills/product-narrative-flow-erzaehlen/SKILL.md`, `agents/product-ux.md` |  |
| Backbone destillieren (Activities & Tasks) (S4.1.3) | serviceTask | Backlog-Autor | skill | `skills/product-backbone-destillieren/SKILL.md`, `agents/product-backlog-autor.md` |  |
| Details, Alternativen & Randfaelle explorieren (S4.1.4) | serviceTask | QA-Perspektive | skill | `skills/product-story-map-details-explorieren/SKILL.md`, `agents/product-qa.md` |  |
| Map durchlaufen: Luecken & Abhaengigkeiten finden (S4.1.5) | serviceTask | Architekt | skill | `skills/product-story-map-durchlaufen/SKILL.md`, `agents/product-architekt.md` |  |
| Kritiker-Pruefung aufrufen (phase-4-1) (SP4.1_CallK) | callActivity | Kritiker | skill | `skills/product-kritiker-pruefung/SKILL.md`, `agents/product-kritiker.md` | gate critic, maxLoops 3 |
| Narrativ vollstaendig & kohaerent? (SP4.1_Gw) | exclusiveGateway | Kritiker | orchestrator | (see `product-vision-to-user-stories.workflow.mjs`) |  |
| Un-sliced User Story Map & Epics (SP4.1_End) | endEvent | Kritiker | not-generated | — | Start/end event of the collapsed '4.1 Story Mapping Workshop: Backbone & Epics strukturieren' scope — its control flow lives in the Workflow script; structural marker only, no separate artifact. |
| 4.2 Release Slicing & MVP-Abgrenzung (SP4.2) | subProcess | — | orchestrator | (see `product-vision-to-user-stories.workflow.mjs`) |  |
| Gestartet (SP4.2_Start) | startEvent | Stratege | not-generated | — | Start/end event of the collapsed '4.2 Release Slicing & MVP-Abgrenzung' scope — its control flow lives in the Workflow script; structural marker only, no separate artifact. |
| SP4.2_Merge (SP4.2_Merge) | exclusiveGateway | Stratege | orchestrator | (see `product-vision-to-user-stories.workflow.mjs`) |  |
| Outcome-basierte Release-Ziele festlegen (S4.2.1) | serviceTask | Stratege | skill | `skills/product-release-ziele-festlegen/SKILL.md`, `agents/product-stratege.md` |  |
| Walking Skeleton schneiden (S4.2.2) | serviceTask | Architekt | skill | `skills/product-walking-skeleton-schneiden/SKILL.md`, `agents/product-architekt.md` |  |
| Opening / Mid / Endgame planen (S4.2.3) | serviceTask | Architekt | skill | `skills/product-release-sequenz-planen/SKILL.md`, `agents/product-architekt.md` |  |
| Nach Value vs. Effort priorisieren (S4.2.4) | serviceTask | Stratege | skill | `skills/product-value-effort-priorisieren/SKILL.md`, `agents/product-stratege.md` |  |
| MVP & Release-Roadmap abgrenzen (S4.2.5) | serviceTask | Stratege | skill | `skills/product-mvp-abgrenzen/SKILL.md`, `agents/product-stratege.md` |  |
| Kritiker-Pruefung aufrufen (phase-4-2) (SP4.2_CallK) | callActivity | Kritiker | skill | `skills/product-kritiker-pruefung/SKILL.md`, `agents/product-kritiker.md` | gate critic, maxLoops 3 |
| MVP schlank genug fuer Budget/Timebox? (SP4.2_Gw) | exclusiveGateway | Kritiker | orchestrator | (see `product-vision-to-user-stories.workflow.mjs`) |  |
| MVP-Kandidat abgegrenzt (SP4.2_End) | endEvent | Kritiker | not-generated | — | Start/end event of the collapsed '4.2 Release Slicing & MVP-Abgrenzung' scope — its control flow lives in the Workflow script; structural marker only, no separate artifact. |
| Phasen-Gate-Review: MVP (Call_PG3) | callActivity | Kritiker | skill | `skills/product-phasen-gate/SKILL.md`, `agents/product-kritiker.md` | gate panel, maxLoops 3 |
| MVP tragfaehig & machbar? (G-P3) | exclusiveGateway | — | orchestrator | (see `product-vision-to-user-stories.workflow.mjs`) |  |
| Merge_Refinement (Merge_Refinement) | exclusiveGateway | — | orchestrator | (see `product-vision-to-user-stories.workflow.mjs`) |  |
| 5.1 User Stories formulieren & schneiden (INVEST / Splitting) (SP5.1) | subProcess | — | orchestrator | (see `product-vision-to-user-stories.workflow.mjs`) | multi-instance over EP[slice=1] |
| Gestartet (SP5.1_Start) | startEvent | Backlog-Autor | not-generated | — | Start/end event of the collapsed '5.1 User Stories formulieren & schneiden (INVEST / Splitting)' scope — its control flow lives in the Workflow script; structural marker only, no separate artifact. |
| Story Card entwerfen (Connextra) (S5.1.1) | serviceTask | Backlog-Autor | skill | `skills/product-story-card-entwerfen/SKILL.md`, `agents/product-backlog-autor.md` |  |
| SP5.1_Merge (SP5.1_Merge) | exclusiveGateway | Backlog-Autor | orchestrator | (see `product-vision-to-user-stories.workflow.mjs`) |  |
| Kritiker-Pruefung aufrufen (invest) (SP5.1_CallK) | callActivity | Kritiker | skill | `skills/product-kritiker-pruefung/SKILL.md`, `agents/product-kritiker.md` | gate critic, maxLoops 3 |
| Zu gross / zu unsicher / passt? (SP5.1_Gw) | exclusiveGateway | Kritiker | orchestrator | (see `product-vision-to-user-stories.workflow.mjs`) |  |
| Splitting-Muster anwenden (S5.1.3) | serviceTask | Backlog-Autor | skill | `skills/product-story-splitten/SKILL.md`, `agents/product-backlog-autor.md` |  |
| Technische Unsicherheit als Spike auslagern (S5.1.4) | serviceTask | Architekt | skill | `skills/product-spike-auslagern/SKILL.md`, `agents/product-architekt.md` |  |
| Rechtsgrosse Story-Cards & Spikes (SP5.1_End) | endEvent | Kritiker | not-generated | — | Start/end event of the collapsed '5.1 User Stories formulieren & schneiden (INVEST / Splitting)' scope — its control flow lives in the Workflow script; structural marker only, no separate artifact. |
| Story-Veredelung (5.2 -> G-Ready -> 6.1) (SP56) | subProcess | — | orchestrator | (see `product-vision-to-user-stories.workflow.mjs`) | multi-instance over ST[from=5.1] |
| Gestartet (SP56_Start) | startEvent | — | not-generated | — | Start/end event of the collapsed 'Story-Veredelung (5.2 -> G-Ready -> 6.1)' scope — its control flow lives in the Workflow script; structural marker only, no separate artifact. |
| 5.2 Refinement-Workshop (SP5.2) | subProcess | — | orchestrator | (see `product-vision-to-user-stories.workflow.mjs`) |  |
| Gestartet (SP5.2_Start) | startEvent | Backlog-Autor | not-generated | — | Start/end event of the collapsed '5.2 Refinement-Workshop' scope — its control flow lives in the Workflow script; structural marker only, no separate artifact. |
| Three-Amigos-Debatte (3 Perspektiven) (S5.2.1) | serviceTask | Backlog-Autor | skill | `skills/product-three-amigos-debatte/SKILL.md`, `agents/product-backlog-autor.md` |  |
| Was von Wie trennen (S5.2.2) | serviceTask | Backlog-Autor | skill | `skills/product-was-von-wie-trennen/SKILL.md`, `agents/product-backlog-autor.md` |  |
| Low-Fi-Wireframe & Domaenenmodell anhaengen (S5.2.3) | serviceTask | UX-/Journey-Designer | skill | `skills/product-wireframe-domaenenmodell-anhaengen/SKILL.md`, `agents/product-ux.md` |  |
| Groessenklasse bestimmen (S/M/L) (S5.2.4) | serviceTask | Architekt | skill | `skills/product-groessenklasse-bestimmen/SKILL.md`, `agents/product-architekt.md` |  |
| Kritiker-Pruefung aufrufen (dor) (SP5.2_CallK) | callActivity | Kritiker | skill | `skills/product-kritiker-pruefung/SKILL.md`, `agents/product-kritiker.md` | gate critic, maxLoops 3 |
| Story zur DoR-Pruefung bewertet (SP5.2_End) | endEvent | Kritiker | not-generated | — | Start/end event of the collapsed '5.2 Refinement-Workshop' scope — its control flow lives in the Workflow script; structural marker only, no separate artifact. |
| Story erfuellt INVEST & DoR? (SP56_Gw) | exclusiveGateway | — | orchestrator | (see `product-vision-to-user-stories.workflow.mjs`) |  |
| 6.1 Akzeptanzkriterien verfassen (SP6.1) | subProcess | — | orchestrator | (see `product-vision-to-user-stories.workflow.mjs`) |  |
| Gestartet (SP6.1_Start) | startEvent | Backlog-Autor | not-generated | — | Start/end event of the collapsed '6.1 Akzeptanzkriterien verfassen' scope — its control flow lives in the Workflow script; structural marker only, no separate artifact. |
| SP6.1_Merge (SP6.1_Merge) | exclusiveGateway | Backlog-Autor | orchestrator | (see `product-vision-to-user-stories.workflow.mjs`) |  |
| Confirmation-Kriterien festhalten (S6.1.1) | serviceTask | Backlog-Autor | skill | `skills/product-confirmation-kriterien-festhalten/SKILL.md`, `agents/product-backlog-autor.md` |  |
| Mit konkreten Beispielen spezifizieren (SBE) (S6.1.2) | serviceTask | QA-Perspektive | skill | `skills/product-sbe-beispiele-spezifizieren/SKILL.md`, `agents/product-qa.md` |  |
| In Given-When-Then formalisieren (S6.1.3) | serviceTask | QA-Perspektive | skill | `skills/product-gherkin-formalisieren/SKILL.md`, `agents/product-qa.md` |  |
| Fachliche vs. technische Testerwartungen abgleichen (S6.1.4) | serviceTask | Architekt | skill | `skills/product-testerwartungen-abgleichen/SKILL.md`, `agents/product-architekt.md` |  |
| Kritiker-Pruefung aufrufen (gherkin) (SP6.1_CallK) | callActivity | Kritiker | skill | `skills/product-kritiker-pruefung/SKILL.md`, `agents/product-kritiker.md` | gate critic, maxLoops 3 |
| Testbar & eindeutig? (SP6.1_Gw) | exclusiveGateway | Kritiker | orchestrator | (see `product-vision-to-user-stories.workflow.mjs`) |  |
| Akzeptanzkriterien (BDD) verfasst (SP6.1_End) | endEvent | Kritiker | not-generated | — | Start/end event of the collapsed '6.1 Akzeptanzkriterien verfassen' scope — its control flow lives in the Workflow script; structural marker only, no separate artifact. |
| Story vollstaendig veredelt (SP56_End_ok) | endEvent | — | orchestrator | (see `product-vision-to-user-stories.workflow.mjs`) |  |
| Re-Splitting noetig (SP56_End_resplit) | endEvent | — | orchestrator | (see `product-vision-to-user-stories.workflow.mjs`) |  |
| Stories zum Re-Splitting? (G-Split) | exclusiveGateway | — | orchestrator | (see `product-vision-to-user-stories.workflow.mjs`) | gate deterministic, maxLoops 3 |
| Merge_AC (Merge_AC) | exclusiveGateway | — | orchestrator | (see `product-vision-to-user-stories.workflow.mjs`) |  |
| 6.2 Backlog-Konsistenz & Alignment pruefen (SP6.2) | subProcess | — | orchestrator | (see `product-vision-to-user-stories.workflow.mjs`) |  |
| Gestartet (SP6.2_Start) | startEvent | Traceability-Pruefer | not-generated | — | Start/end event of the collapsed '6.2 Backlog-Konsistenz & Alignment pruefen' scope — its control flow lives in the Workflow script; structural marker only, no separate artifact. |
| SP6.2_Merge (SP6.2_Merge) | exclusiveGateway | Traceability-Pruefer | orchestrator | (see `product-vision-to-user-stories.workflow.mjs`) |  |
| Story -> Epic-Traceability pruefen (S6.2.1) | scriptTask | Traceability-Pruefer | script | `skills/product-traceability/scripts/trace-story-epic.mjs`, `skills/product-traceability/SKILL.md` |  |
| Epic -> Impact / Vision-Traceability pruefen (S6.2.2) | scriptTask | Traceability-Pruefer | script | `skills/product-traceability/scripts/trace-epic-vision.mjs`, `skills/product-traceability/SKILL.md` |  |
| Ubiquitous-Language-Konsistenz pruefen (S6.2.3) | businessRuleTask | Kritiker | skill | `skills/product-ubiquitous-language-pruefen/SKILL.md`, `agents/product-kritiker.md` |  |
| Orphan- & Fake-Stories aussortieren (S6.2.4) | businessRuleTask | Kritiker | skill | `skills/product-orphan-fake-stories-aussortieren/SKILL.md`, `agents/product-kritiker.md` |  |
| Traceability-Matrix erzeugen (S6.2.5) | scriptTask | Traceability-Pruefer | script | `skills/product-traceability/scripts/traceability-matrix.mjs`, `skills/product-traceability/SKILL.md` |  |
| Kritiker-Pruefung aufrufen (traceability) (SP6.2_CallK) | callActivity | Kritiker | skill | `skills/product-kritiker-pruefung/SKILL.md`, `agents/product-kritiker.md` | gate critic, maxLoops 3 |
| Konsistent, rueckverfolgbar & DoR erfuellt? (SP6.2_Gw) | exclusiveGateway | Kritiker | orchestrator | (see `product-vision-to-user-stories.workflow.mjs`) |  |
| Konsistenzpruefung durchgefuehrt (SP6.2_End) | endEvent | Kritiker | not-generated | — | Start/end event of the collapsed '6.2 Backlog-Konsistenz & Alignment pruefen' scope — its control flow lives in the Workflow script; structural marker only, no separate artifact. |
| Konsistent, rueckverfolgbar & DoR erfuellt? (G-6.2) | exclusiveGateway | — | orchestrator | (see `product-vision-to-user-stories.workflow.mjs`) | gate critic, maxLoops 3 |
| 7 Abschluss: Backlog exportieren & Run-Report erstellen (S7) | serviceTask | Traceability-Pruefer | skill | `skills/product-backlog-exportieren-report-erstellen/SKILL.md`, `agents/product-traceability.md` |  |
| User Stories & Akzeptanzkriterien sprint-ready (End_StoryReady) | endEvent | — | orchestrator | (see `product-vision-to-user-stories.workflow.mjs`) |  |
| Merge_NoGo (Merge_NoGo) | exclusiveGateway | — | orchestrator | (see `product-vision-to-user-stories.workflow.mjs`) |  |
| No-Go-Report erstellen (S_NoGo) | serviceTask | Traceability-Pruefer | skill | `skills/product-backlog-exportieren-report-erstellen/SKILL.md`, `agents/product-traceability.md` |  |
| Idee verworfen (End_IdeeVerworfen) | endEvent | — | orchestrator | (see `product-vision-to-user-stories.workflow.mjs`) |  |
| Budget erschoepft (SP_Budget) | subProcess | — | not-generated | — | Event sub-process (unsupported in v1). Accepted gap (2026-09-25): the Workflow script checks the token budget before every step and, when exhausted, runs "Teilergebnis sichern & Run-Report erstellen" (status: partial); the product-research-budget-guard hook enforces the Deep-Research hard cap. Rewrite option for later: model budget exhaustion as an explicit error boundary event. |
| Budget erschoepft (Fehler) (SP_Budget_Start) | startEvent | — | not-generated | — | Start/end event of the collapsed 'Budget erschoepft' scope — its control flow lives in the Workflow script; structural marker only, no separate artifact. |
| Teilergebnis sichern & Run-Report erstellen (SP_Budget_S1) | serviceTask | Traceability-Pruefer | skill | `skills/product-backlog-exportieren-report-erstellen/SKILL.md`, `agents/product-traceability.md` |  |
| Budget erschoepft (Teilergebnis) (SP_Budget_End) | endEvent | — | not-generated | — | Start/end event of the collapsed 'Budget erschoepft' scope — its control flow lives in the Workflow script; structural marker only, no separate artifact. |
| Recherche angefordert (R_Start) | startEvent | — | not-generated | — | Start/end event of the collapsed 'Recherche durchfuehren' scope — its control flow lives in the Workflow script; structural marker only, no separate artifact. |
| Fragestellung schaerfen & Tool routen (R_1) | businessRuleTask | Researcher | hook | `hooks/product-research-budget-guard.hook.mjs`, `hooks/product-research-budget-guard.hook.settings.json`, `skills/product-recherche/SKILL.md`, `skills/product-recherche/research.yaml`, `skills/product-recherche/scripts/lib/research-config.mjs`, `agents/product-researcher.md` | hook pair: `hooks/product-research-budget-guard.hook.mjs` + `hooks/product-research-budget-guard.hook.settings.json`; condition: block research tool calls when run.json budget.status == exhausted; the paid adapters check the Deep-Research hard cap (3) and the money cap (research.yaml) before every call (Gedächtnis §9.4) |
| R_Split (R_Split) | parallelGateway | — | orchestrator | (see `product-vision-to-user-stories.workflow.mjs`) |  |
| Deep-Research-Auftrag stellen (R_2a) | serviceTask | Researcher | skill | `skills/product-recherche/SKILL.md`, `skills/product-recherche/scripts/providers/gemini-deep-research.mjs`, `agents/product-researcher.md` |  |
| Web-Suche durchfuehren (R_2b) | serviceTask | Researcher | skill | `skills/product-recherche/SKILL.md`, `skills/product-recherche/scripts/providers/raw-fetch.mjs`, `agents/product-researcher.md` |  |
| Bulk-URL-Discovery via DuckDuckGo (R_2c) | serviceTask | Researcher | skill | `skills/product-recherche/SKILL.md`, `skills/product-recherche/scripts/providers/ddg-html.mjs`, `agents/product-researcher.md` |  |
| R_Join (R_Join) | parallelGateway | — | orchestrator | (see `product-vision-to-user-stories.workflow.mjs`) |  |
| R_Merge (R_Merge) | exclusiveGateway | — | orchestrator | (see `product-vision-to-user-stories.workflow.mjs`) |  |
| Quellen normalisieren, hashen & deduplizieren (R_3) | scriptTask | Researcher | script | `skills/product-recherche/scripts/normalize-sources.mjs` |  |
| Claims extrahieren & Abdeckung pruefen (R_3b) | serviceTask | Researcher | skill | `skills/product-recherche/SKILL.md`, `skills/product-recherche/scripts/check-claims.mjs`, `agents/product-researcher.md` |  |
| Luecken? (R_Gw) | exclusiveGateway | — | orchestrator | (see `product-vision-to-user-stories.workflow.mjs`) |  |
| Luecken gezielt nachsuchen (R_2d) | serviceTask | Researcher | skill | `skills/product-recherche/SKILL.md`, `skills/product-recherche/scripts/providers/raw-fetch.mjs`, `agents/product-researcher.md` |  |
| Recherche-Synthese mit Zitaten verfassen (R_4) | serviceTask | Researcher | skill | `skills/product-recherche/SKILL.md`, `agents/product-researcher.md` |  |
| Recherche abgeschlossen (R_End) | endEvent | — | not-generated | — | Start/end event of the collapsed 'Recherche durchfuehren' scope — its control flow lives in the Workflow script; structural marker only, no separate artifact. |
| Pruefung angefordert (K_Start) | startEvent | — | not-generated | — | Start/end event of the collapsed 'Kritiker-Pruefung' scope — its control flow lives in the Workflow script; structural marker only, no separate artifact. |
| Rubric laden (K_1) | scriptTask | Kritiker | script | `skills/product-kritiker-pruefung/scripts/load-rubric.mjs`, `skills/product-traceability/scripts/commit-artifact.mjs`, `skills/product-traceability/scripts/lib/contracts.mjs`, `hooks/product-artifact-contract-guard.hook.mjs`, `hooks/product-artifact-contract-guard.hook.settings.json` | hook pair: `hooks/product-artifact-contract-guard.hook.mjs` + `hooks/product-artifact-contract-guard.hook.settings.json` |
| Artefakt gegen Rubric bewerten (K_2) | businessRuleTask | Kritiker | skill | `skills/product-kritiker-pruefung/SKILL.md`, `agents/product-kritiker.md`, `hooks/product-critic-readonly-guard.hook.mjs`, `hooks/product-critic-readonly-guard.hook.settings.json` | hook pair: `hooks/product-critic-readonly-guard.hook.mjs` + `hooks/product-critic-readonly-guard.hook.settings.json` |
| Claims strittig? (K_Gw1) | exclusiveGateway | — | orchestrator | (see `product-vision-to-user-stories.workflow.mjs`) |  |
| Strittige Claims faktenchecken (K_3) | callActivity | Kritiker | skill | `skills/product-kritiker-pruefung/SKILL.md`, `skills/product-recherche/SKILL.md` |  |
| K_Merge (K_Merge) | exclusiveGateway | — | orchestrator | (see `product-vision-to-user-stories.workflow.mjs`) |  |
| Verdikt bilden & Loop-Cap anwenden (K_4) | scriptTask | Kritiker | script | `skills/product-kritiker-pruefung/scripts/verdict.mjs` |  |
| Gate-Record schreiben (K_5) | scriptTask | Kritiker | script | `skills/product-kritiker-pruefung/scripts/write-gate-record.mjs` |  |
| Verdikt vorliegt (K_End) | endEvent | — | not-generated | — | Start/end event of the collapsed 'Kritiker-Pruefung' scope — its control flow lives in the Workflow script; structural marker only, no separate artifact. |
| Panel-Aufruf gestartet (P_Start) | startEvent | Interviewer | not-generated | — | Start/end event of the collapsed 'Panel befragen' scope — its control flow lives in the Workflow script; structural marker only, no separate artifact. |
| Stimulus / Leitfaden vorbereiten (P_1) | serviceTask | Interviewer | skill | `skills/product-panel-befragung/SKILL.md`, `agents/product-interviewer.md` |  |
| Persona befragen (P_2) | serviceTask | Synthetisches Panel | skill | `skills/product-panel-befragung/SKILL.md`, `agents/product-persona.md` | multi-instance over panel-profiles[panelSet] |
| Transkript / Antworten erfassen (P_3) | scriptTask | Interviewer | script | `skills/product-panel-befragung/scripts/record-transcript.mjs` |  |
| Synthese / Votum bilden (P_4) | serviceTask | Interviewer | skill | `skills/product-panel-befragung/SKILL.md`, `agents/product-interviewer.md` |  |
| Panel-Ergebnis vorliegt (P_End) | endEvent | Interviewer | not-generated | — | Start/end event of the collapsed 'Panel befragen' scope — its control flow lives in the Workflow script; structural marker only, no separate artifact. |
| Phasen-Gate angefordert (PG_Start) | startEvent | Kritiker | not-generated | — | Start/end event of the collapsed 'Phasen-Gate-Review' scope — its control flow lives in the Workflow script; structural marker only, no separate artifact. |
| PG_Split (PG_Split) | parallelGateway | Kritiker | orchestrator | (see `product-vision-to-user-stories.workflow.mjs`) |  |
| Kritiker-Pruefung aufrufen (PG_Call_K) | callActivity | Kritiker | skill | `skills/product-kritiker-pruefung/SKILL.md`, `agents/product-kritiker.md` |  |
| Panel befragen (vote) (PG_Call_P) | callActivity | Interviewer | skill | `skills/product-panel-befragung/SKILL.md`, `agents/product-interviewer.md` |  |
| PG_Join (PG_Join) | parallelGateway | Kritiker | orchestrator | (see `product-vision-to-user-stories.workflow.mjs`) |  |
| Verdikt aggregieren (PG_1) | businessRuleTask | Kritiker | skill | `skills/product-phasen-gate/SKILL.md`, `skills/product-phasen-gate/scripts/aggregate-gate.mjs`, `agents/product-kritiker.md` |  |
| Phasen-Gate-Verdikt vorliegt (PG_End) | endEvent | Kritiker | not-generated | — | Start/end event of the collapsed 'Phasen-Gate-Review' scope — its control flow lives in the Workflow script; structural marker only, no separate artifact. |

## Grey — deliberately not generated

- "Gestartet" (SP1.1_Start) — Start/end event of the collapsed '1.1 Produktvision & Geschaeftsmodell rahmen' scope — its control flow lives in the Workflow script; structural marker only, no separate artifact.
- "Vision & Geschaeftsmodell entworfen" (SP1.1_End) — Start/end event of the collapsed '1.1 Produktvision & Geschaeftsmodell rahmen' scope — its control flow lives in the Workflow script; structural marker only, no separate artifact.
- "Gestartet" (SP1.2_Start) — Start/end event of the collapsed '1.2 Impact Mapping & Business-Ziele definieren' scope — its control flow lives in the Workflow script; structural marker only, no separate artifact.
- "Impact Map & Roadmap abgeleitet" (SP1.2_End) — Start/end event of the collapsed '1.2 Impact Mapping & Business-Ziele definieren' scope — its control flow lives in the Workflow script; structural marker only, no separate artifact.
- "Gestartet" (SP2.1_Start) — Start/end event of the collapsed '2.1 Discovery mit synthetischem Panel' scope — its control flow lives in the Workflow script; structural marker only, no separate artifact.
- "Personas & JTBD ermittelt" (SP2.1_End) — Start/end event of the collapsed '2.1 Discovery mit synthetischem Panel' scope — its control flow lives in the Workflow script; structural marker only, no separate artifact.
- "Gestartet" (SP2.2_Start) — Start/end event of the collapsed '2.2 Empathy Mapping & Problem Definition' scope — its control flow lives in the Workflow script; structural marker only, no separate artifact.
- "Opportunity Backlog priorisiert" (SP2.2_End) — Start/end event of the collapsed '2.2 Empathy Mapping & Problem Definition' scope — its control flow lives in the Workflow script; structural marker only, no separate artifact.
- "Gestartet" (SP3.1_Start) — Start/end event of the collapsed '3.1 Customer Journey kartieren (Current vs. Future State)' scope — its control flow lives in the Workflow script; structural marker only, no separate artifact.
- "Customer Journey & Service Blueprint kartiert" (SP3.1_End) — Start/end event of the collapsed '3.1 Customer Journey kartieren (Current vs. Future State)' scope — its control flow lives in the Workflow script; structural marker only, no separate artifact.
- "Gestartet" (SP4.1_Start) — Start/end event of the collapsed '4.1 Story Mapping Workshop: Backbone & Epics strukturieren' scope — its control flow lives in the Workflow script; structural marker only, no separate artifact.
- "Un-sliced User Story Map & Epics" (SP4.1_End) — Start/end event of the collapsed '4.1 Story Mapping Workshop: Backbone & Epics strukturieren' scope — its control flow lives in the Workflow script; structural marker only, no separate artifact.
- "Gestartet" (SP4.2_Start) — Start/end event of the collapsed '4.2 Release Slicing & MVP-Abgrenzung' scope — its control flow lives in the Workflow script; structural marker only, no separate artifact.
- "MVP-Kandidat abgegrenzt" (SP4.2_End) — Start/end event of the collapsed '4.2 Release Slicing & MVP-Abgrenzung' scope — its control flow lives in the Workflow script; structural marker only, no separate artifact.
- "Gestartet" (SP5.1_Start) — Start/end event of the collapsed '5.1 User Stories formulieren & schneiden (INVEST / Splitting)' scope — its control flow lives in the Workflow script; structural marker only, no separate artifact.
- "Rechtsgrosse Story-Cards & Spikes" (SP5.1_End) — Start/end event of the collapsed '5.1 User Stories formulieren & schneiden (INVEST / Splitting)' scope — its control flow lives in the Workflow script; structural marker only, no separate artifact.
- "Gestartet" (SP56_Start) — Start/end event of the collapsed 'Story-Veredelung (5.2 -> G-Ready -> 6.1)' scope — its control flow lives in the Workflow script; structural marker only, no separate artifact.
- "Gestartet" (SP5.2_Start) — Start/end event of the collapsed '5.2 Refinement-Workshop' scope — its control flow lives in the Workflow script; structural marker only, no separate artifact.
- "Story zur DoR-Pruefung bewertet" (SP5.2_End) — Start/end event of the collapsed '5.2 Refinement-Workshop' scope — its control flow lives in the Workflow script; structural marker only, no separate artifact.
- "Gestartet" (SP6.1_Start) — Start/end event of the collapsed '6.1 Akzeptanzkriterien verfassen' scope — its control flow lives in the Workflow script; structural marker only, no separate artifact.
- "Akzeptanzkriterien (BDD) verfasst" (SP6.1_End) — Start/end event of the collapsed '6.1 Akzeptanzkriterien verfassen' scope — its control flow lives in the Workflow script; structural marker only, no separate artifact.
- "Gestartet" (SP6.2_Start) — Start/end event of the collapsed '6.2 Backlog-Konsistenz & Alignment pruefen' scope — its control flow lives in the Workflow script; structural marker only, no separate artifact.
- "Konsistenzpruefung durchgefuehrt" (SP6.2_End) — Start/end event of the collapsed '6.2 Backlog-Konsistenz & Alignment pruefen' scope — its control flow lives in the Workflow script; structural marker only, no separate artifact.
- "Budget erschoepft" (SP_Budget) — Event sub-process (unsupported in v1). Accepted gap (2026-09-25): the Workflow script checks the token budget before every step and, when exhausted, runs "Teilergebnis sichern & Run-Report erstellen" (status: partial); the product-research-budget-guard hook enforces the Deep-Research hard cap. Rewrite option for later: model budget exhaustion as an explicit error boundary event.
- "Budget erschoepft (Fehler)" (SP_Budget_Start) — Start/end event of the collapsed 'Budget erschoepft' scope — its control flow lives in the Workflow script; structural marker only, no separate artifact.
- "Budget erschoepft (Teilergebnis)" (SP_Budget_End) — Start/end event of the collapsed 'Budget erschoepft' scope — its control flow lives in the Workflow script; structural marker only, no separate artifact.
- "Recherche angefordert" (R_Start) — Start/end event of the collapsed 'Recherche durchfuehren' scope — its control flow lives in the Workflow script; structural marker only, no separate artifact.
- "Recherche abgeschlossen" (R_End) — Start/end event of the collapsed 'Recherche durchfuehren' scope — its control flow lives in the Workflow script; structural marker only, no separate artifact.
- "Pruefung angefordert" (K_Start) — Start/end event of the collapsed 'Kritiker-Pruefung' scope — its control flow lives in the Workflow script; structural marker only, no separate artifact.
- "Verdikt vorliegt" (K_End) — Start/end event of the collapsed 'Kritiker-Pruefung' scope — its control flow lives in the Workflow script; structural marker only, no separate artifact.
- "Panel-Aufruf gestartet" (P_Start) — Start/end event of the collapsed 'Panel befragen' scope — its control flow lives in the Workflow script; structural marker only, no separate artifact.
- "Panel-Ergebnis vorliegt" (P_End) — Start/end event of the collapsed 'Panel befragen' scope — its control flow lives in the Workflow script; structural marker only, no separate artifact.
- "Phasen-Gate angefordert" (PG_Start) — Start/end event of the collapsed 'Phasen-Gate-Review' scope — its control flow lives in the Workflow script; structural marker only, no separate artifact.
- "Phasen-Gate-Verdikt vorliegt" (PG_End) — Start/end event of the collapsed 'Phasen-Gate-Review' scope — its control flow lives in the Workflow script; structural marker only, no separate artifact.

## Red — open / unresolved

None — every element resolved to a concrete kind.

## Roles

| Role | Lane | Agent generated | Model tier | Tools |
|---|---|---|---|---|
| Stratege (sp1-1_stratege) | Lane_SP1.1_stratege | `agents/product-stratege.md` | session default | inherits all |
| Researcher (sp1-1_researcher) | Lane_SP1.1_researcher | `agents/product-researcher.md` | session default | inherits all |
| UX-/Journey-Designer (sp1-1_ux) | Lane_SP1.1_ux | `agents/product-ux.md` | session default | inherits all |
| Kritiker (sp1-1_kritiker) | Lane_SP1.1_kritiker | `agents/product-kritiker.md` | opus | Read, Grep, Glob, Bash, Write, WebSearch, WebFetch |
| Stratege (sp1-2_stratege) | Lane_SP1.2_stratege | `agents/product-stratege.md` | session default | inherits all |
| UX-/Journey-Designer (sp1-2_ux) | Lane_SP1.2_ux | `agents/product-ux.md` | session default | inherits all |
| Kritiker (sp1-2_kritiker) | Lane_SP1.2_kritiker | `agents/product-kritiker.md` | opus | Read, Grep, Glob, Bash, Write, WebSearch, WebFetch |
| Researcher (sp2-1_researcher) | Lane_SP2.1_researcher | `agents/product-researcher.md` | session default | inherits all |
| Interviewer (sp2-1_interviewer) | Lane_SP2.1_interviewer | `agents/product-interviewer.md` | session default | inherits all |
| UX-/Journey-Designer (sp2-1_ux) | Lane_SP2.1_ux | `agents/product-ux.md` | session default | inherits all |
| Kritiker (sp2-1_kritiker) | Lane_SP2.1_kritiker | `agents/product-kritiker.md` | opus | Read, Grep, Glob, Bash, Write, WebSearch, WebFetch |
| UX-/Journey-Designer (sp2-2_ux) | Lane_SP2.2_ux | `agents/product-ux.md` | session default | inherits all |
| Stratege (sp2-2_stratege) | Lane_SP2.2_stratege | `agents/product-stratege.md` | session default | inherits all |
| Kritiker (sp2-2_kritiker) | Lane_SP2.2_kritiker | `agents/product-kritiker.md` | opus | Read, Grep, Glob, Bash, Write, WebSearch, WebFetch |
| UX-/Journey-Designer (sp3-1_ux) | Lane_SP3.1_ux | `agents/product-ux.md` | session default | inherits all |
| Architekt (sp3-1_architekt) | Lane_SP3.1_architekt | `agents/product-architekt.md` | session default | inherits all |
| Kritiker (sp3-1_kritiker) | Lane_SP3.1_kritiker | `agents/product-kritiker.md` | opus | Read, Grep, Glob, Bash, Write, WebSearch, WebFetch |
| Backlog-Autor (sp4-1_backlog-autor) | Lane_SP4.1_backlog-autor | `agents/product-backlog-autor.md` | session default | inherits all |
| UX-/Journey-Designer (sp4-1_ux) | Lane_SP4.1_ux | `agents/product-ux.md` | session default | inherits all |
| QA-Perspektive (sp4-1_qa) | Lane_SP4.1_qa | `agents/product-qa.md` | session default | inherits all |
| Architekt (sp4-1_architekt) | Lane_SP4.1_architekt | `agents/product-architekt.md` | session default | inherits all |
| Kritiker (sp4-1_kritiker) | Lane_SP4.1_kritiker | `agents/product-kritiker.md` | opus | Read, Grep, Glob, Bash, Write, WebSearch, WebFetch |
| Stratege (sp4-2_stratege) | Lane_SP4.2_stratege | `agents/product-stratege.md` | session default | inherits all |
| Architekt (sp4-2_architekt) | Lane_SP4.2_architekt | `agents/product-architekt.md` | session default | inherits all |
| Kritiker (sp4-2_kritiker) | Lane_SP4.2_kritiker | `agents/product-kritiker.md` | opus | Read, Grep, Glob, Bash, Write, WebSearch, WebFetch |
| Backlog-Autor (sp5-1_bla) | Lane_SP5.1_BLA | `agents/product-backlog-autor.md` | session default | inherits all |
| Architekt (sp5-1_arc) | Lane_SP5.1_ARC | `agents/product-architekt.md` | session default | inherits all |
| Kritiker (sp5-1_kri) | Lane_SP5.1_KRI | `agents/product-kritiker.md` | opus | Read, Grep, Glob, Bash, Write, WebSearch, WebFetch |
| Backlog-Autor (sp5-2_backlog-autor) | Lane_SP5.2_backlog-autor | `agents/product-backlog-autor.md` | session default | inherits all |
| UX-/Journey-Designer (sp5-2_ux) | Lane_SP5.2_ux | `agents/product-ux.md` | session default | inherits all |
| Architekt (sp5-2_architekt) | Lane_SP5.2_architekt | `agents/product-architekt.md` | session default | inherits all |
| Kritiker (sp5-2_kritiker) | Lane_SP5.2_kritiker | `agents/product-kritiker.md` | opus | Read, Grep, Glob, Bash, Write, WebSearch, WebFetch |
| Backlog-Autor (sp6-1_backlog-autor) | Lane_SP6.1_backlog-autor | `agents/product-backlog-autor.md` | session default | inherits all |
| QA-Perspektive (sp6-1_qa) | Lane_SP6.1_qa | `agents/product-qa.md` | session default | inherits all |
| Architekt (sp6-1_architekt) | Lane_SP6.1_architekt | `agents/product-architekt.md` | session default | inherits all |
| Kritiker (sp6-1_kritiker) | Lane_SP6.1_kritiker | `agents/product-kritiker.md` | opus | Read, Grep, Glob, Bash, Write, WebSearch, WebFetch |
| Traceability-Pruefer (sp6-2_traceability) | Lane_SP6.2_traceability | `agents/product-traceability.md` | haiku | inherits all |
| Kritiker (sp6-2_kritiker) | Lane_SP6.2_kritiker | `agents/product-kritiker.md` | opus | Read, Grep, Glob, Bash, Write, WebSearch, WebFetch |
| Interviewer (p_int) | Lane_P_INT | `agents/product-interviewer.md` | session default | inherits all |
| Synthetisches Panel (p_panel) | Lane_P_Panel | `agents/product-persona.md` | session default | Read |
| Kritiker (pg_kri) | Lane_PG_KRI | `agents/product-kritiker.md` | opus | Read, Grep, Glob, Bash, Write, WebSearch, WebFetch |
| Interviewer (pg_int) | Lane_PG_INT | `agents/product-interviewer.md` | session default | inherits all |

## Artifacts

| Artifact | Path pattern | Producer | Consumers | Frontmatter |
|---|---|---|---|---|
| idea-brief | `runs/{runId}/00_idea-brief.md` | S0 | S0, S1.1.1, S3.1.4, S4.2.5 | schema, id, type, bpmnElement, runId, version, status, producedBy, derivedFrom, body, derived, gate, riskFlags, history, authored.itemIndex, authored.sources, authored.riskFlags, authored.attributes, authored.openQuestions, authored.notesForNext |
| research-markt-wettbewerb | `runs/{runId}/research/reports/DR-01_markt-wettbewerb.md` | Call_R1 | S1.1.1, S1.1.3, S1.1.4 | schema, id, type, bpmnElement, runId, version, status, producedBy, derivedFrom, body, derived, gate, riskFlags, history, authored.itemIndex, authored.sources, authored.riskFlags, authored.attributes, authored.openQuestions, authored.notesForNext |
| zielbild | `runs/{runId}/artifacts/p1-strategie/1.1.1_zielbild.md` | S1.1.1 | S1.1.2 | schema, id, type, bpmnElement, runId, version, status, producedBy, derivedFrom, body, derived, gate, riskFlags, history, authored.itemIndex, authored.sources, authored.riskFlags, authored.attributes, authored.openQuestions, authored.notesForNext |
| vision-statement | `runs/{runId}/artifacts/p1-strategie/1.1.2_vision-statement.md` | S1.1.2 | S1.1.3, S1.2.1, S6.2.2 | schema, id, type, bpmnElement, runId, version, status, producedBy, derivedFrom, body, derived, gate, riskFlags, history, authored.itemIndex, authored.sources, authored.riskFlags, authored.attributes, authored.openQuestions, authored.notesForNext |
| lean-canvas | `runs/{runId}/artifacts/p1-strategie/1.1.3_lean-canvas.md` | S1.1.3 | S1.1.5, S1.1.6 | schema, id, type, bpmnElement, runId, version, status, producedBy, derivedFrom, body, derived, gate, riskFlags, history, authored.itemIndex, authored.sources, authored.riskFlags, authored.attributes, authored.openQuestions, authored.notesForNext |
| proto-panel | `runs/{runId}/panel/proto/P-{nnn}_{slug}.md` | S1.1.4 | S1.1.5, S1.2.2, S2.1.3 | schema, id, type, bpmnElement, runId, version, status, producedBy, derivedFrom, body, derived, gate, riskFlags, history, authored.itemIndex, authored.sources, authored.riskFlags, authored.attributes, authored.openQuestions, authored.notesForNext |
| value-proposition-canvas | `runs/{runId}/artifacts/p1-strategie/1.1.5_value-proposition-canvas.md` | S1.1.5 | S1.1.6 | schema, id, type, bpmnElement, runId, version, status, producedBy, derivedFrom, body, derived, gate, riskFlags, history, authored.itemIndex, authored.sources, authored.riskFlags, authored.attributes, authored.openQuestions, authored.notesForNext |
| assumptions-map | `runs/{runId}/artifacts/p1-strategie/1.1.6_assumptions-map.md` | S1.1.6 | S1.2.5, S2.1.2 | schema, id, type, bpmnElement, runId, version, status, producedBy, derivedFrom, body, derived, gate, riskFlags, history, authored.itemIndex, authored.sources, authored.riskFlags, authored.attributes, authored.openQuestions, authored.notesForNext |
| business-goals | `runs/{runId}/artifacts/p1-strategie/1.2.1_business-goals.md` | S1.2.1 | S1.2.2, S2.2.4, S4.1.1, S4.2.1, S6.2.2 | schema, id, type, bpmnElement, runId, version, status, producedBy, derivedFrom, body, derived, gate, riskFlags, history, authored.itemIndex, authored.sources, authored.riskFlags, authored.attributes, authored.openQuestions, authored.notesForNext |
| actors | `runs/{runId}/artifacts/p1-strategie/1.2.2_actors.md` | S1.2.2 | S1.2.3, S2.1.1 | schema, id, type, bpmnElement, runId, version, status, producedBy, derivedFrom, body, derived, gate, riskFlags, history, authored.itemIndex, authored.sources, authored.riskFlags, authored.attributes, authored.openQuestions, authored.notesForNext |
| impacts | `runs/{runId}/artifacts/p1-strategie/1.2.3_impacts.md` | S1.2.3 | S1.2.4, S6.2.2 | schema, id, type, bpmnElement, runId, version, status, producedBy, derivedFrom, body, derived, gate, riskFlags, history, authored.itemIndex, authored.sources, authored.riskFlags, authored.attributes, authored.openQuestions, authored.notesForNext |
| impact-map | `runs/{runId}/artifacts/p1-strategie/1.2.4_impact-map.md` | S1.2.4 | S1.2.5, S2.1.1 | schema, id, type, bpmnElement, runId, version, status, producedBy, derivedFrom, body, derived, gate, riskFlags, history, authored.itemIndex, authored.sources, authored.riskFlags, authored.attributes, authored.openQuestions, authored.notesForNext |
| impact-scoring | `runs/{runId}/artifacts/p1-strategie/1.2.5_impact-scoring.md` | S1.2.5 | S1.2.6 | schema, id, type, bpmnElement, runId, version, status, producedBy, derivedFrom, body, derived, gate, riskFlags, history, authored.itemIndex, authored.sources, authored.riskFlags, authored.attributes, authored.openQuestions, authored.notesForNext |
| roadmap | `runs/{runId}/artifacts/p1-strategie/1.2.6_roadmap.md` | S1.2.6 | — | schema, id, type, bpmnElement, runId, version, status, producedBy, derivedFrom, body, derived, gate, riskFlags, history, authored.itemIndex, authored.sources, authored.riskFlags, authored.attributes, authored.openQuestions, authored.notesForNext |
| research-zielgruppe-voc | `runs/{runId}/research/reports/DR-02_zielgruppe-voc.md` | Call_R2 | S2.1.1 | schema, id, type, bpmnElement, runId, version, status, producedBy, derivedFrom, body, derived, gate, riskFlags, history, authored.itemIndex, authored.sources, authored.riskFlags, authored.attributes, authored.openQuestions, authored.notesForNext |
| stakeholder-matrix | `runs/{runId}/artifacts/p2-research/2.1.1_stakeholder-matrix.md` | S2.1.1 | S2.1.2 | schema, id, type, bpmnElement, runId, version, status, producedBy, derivedFrom, body, derived, gate, riskFlags, history, authored.itemIndex, authored.sources, authored.riskFlags, authored.attributes, authored.openQuestions, authored.notesForNext |
| interview-guide | `runs/{runId}/panel/guides/2.1.2_interview-guide.md` | S2.1.2 | S2.1.4 | schema, id, type, bpmnElement, runId, version, status, producedBy, derivedFrom, body, derived, gate, riskFlags, history, authored.itemIndex, authored.sources, authored.riskFlags, authored.attributes, authored.openQuestions, authored.notesForNext |
| panel-profiles | `runs/{runId}/panel/personas/P-{nnn}_{slug}.md` | S2.1.3 | S2.1.4 | schema, id, type, bpmnElement, runId, version, status, producedBy, derivedFrom, body, derived, gate, riskFlags, history, authored.itemIndex, authored.sources, authored.riskFlags, authored.attributes, authored.openQuestions, authored.notesForNext |
| interview-transcripts | `runs/{runId}/panel/transcripts/T-{nn}_P-{nnn}_{slug}.md` | S2.1.4, P_3 | S2.1.5, S2.1.6, S2.2.1 | schema, id, type, bpmnElement, runId, version, status, producedBy, derivedFrom, body, derived, gate, riskFlags, history, authored.itemIndex, authored.sources, authored.riskFlags, authored.attributes, authored.openQuestions, authored.notesForNext |
| personas | `runs/{runId}/artifacts/p2-research/2.1.5_personas.md` | S2.1.5 | S2.1.6, S2.2.1, S3.1.1, S4.1.1, S6.1.2 | schema, id, type, bpmnElement, runId, version, status, producedBy, derivedFrom, body, derived, gate, riskFlags, history, authored.itemIndex, authored.sources, authored.riskFlags, authored.attributes, authored.openQuestions, authored.notesForNext |
| jtbd | `runs/{runId}/artifacts/p2-research/2.1.6_jtbd.md` | S2.1.6 | S3.1.1 | schema, id, type, bpmnElement, runId, version, status, producedBy, derivedFrom, body, derived, gate, riskFlags, history, authored.itemIndex, authored.sources, authored.riskFlags, authored.attributes, authored.openQuestions, authored.notesForNext |
| empathy-maps | `runs/{runId}/artifacts/p2-research/2.2.1_empathy-maps.md` | S2.2.1 | S2.2.2 | schema, id, type, bpmnElement, runId, version, status, producedBy, derivedFrom, body, derived, gate, riskFlags, history, authored.itemIndex, authored.sources, authored.riskFlags, authored.attributes, authored.openQuestions, authored.notesForNext |
| pains-gains | `runs/{runId}/artifacts/p2-research/2.2.2_pains-gains.md` | S2.2.2 | S2.2.3, S3.1.2 | schema, id, type, bpmnElement, runId, version, status, producedBy, derivedFrom, body, derived, gate, riskFlags, history, authored.itemIndex, authored.sources, authored.riskFlags, authored.attributes, authored.openQuestions, authored.notesForNext |
| pov-hmw | `runs/{runId}/artifacts/p2-research/2.2.3_pov-hmw.md` | S2.2.3 | S2.2.4, S4.1.1 | schema, id, type, bpmnElement, runId, version, status, producedBy, derivedFrom, body, derived, gate, riskFlags, history, authored.itemIndex, authored.sources, authored.riskFlags, authored.attributes, authored.openQuestions, authored.notesForNext |
| opportunity-solution-tree | `runs/{runId}/artifacts/p2-research/2.2.4_opportunity-solution-tree.md` | S2.2.4 | S2.2.5 | schema, id, type, bpmnElement, runId, version, status, producedBy, derivedFrom, body, derived, gate, riskFlags, history, authored.itemIndex, authored.sources, authored.riskFlags, authored.attributes, authored.openQuestions, authored.notesForNext |
| opportunity-backlog | `runs/{runId}/artifacts/p2-research/2.2.5_opportunity-backlog.md` | S2.2.5 | S3.1.3, S4.2.4 | schema, id, type, bpmnElement, runId, version, status, producedBy, derivedFrom, body, derived, gate, riskFlags, history, authored.itemIndex, authored.sources, authored.riskFlags, authored.attributes, authored.openQuestions, authored.notesForNext |
| research-domaene-prozesse-regulatorik | `runs/{runId}/research/reports/DR-03_domaene-prozesse-regulatorik.md` | Call_R3 | S3.1.1 | schema, id, type, bpmnElement, runId, version, status, producedBy, derivedFrom, body, derived, gate, riskFlags, history, authored.itemIndex, authored.sources, authored.riskFlags, authored.attributes, authored.openQuestions, authored.notesForNext |
| journey-current | `runs/{runId}/artifacts/p3-journey/3.1.1_journey-current.md` | S3.1.1 | S3.1.2 | schema, id, type, bpmnElement, runId, version, status, producedBy, derivedFrom, body, derived, gate, riskFlags, history, authored.itemIndex, authored.sources, authored.riskFlags, authored.attributes, authored.openQuestions, authored.notesForNext |
| hot-spots | `runs/{runId}/artifacts/p3-journey/3.1.2_hot-spots.md` | S3.1.2 | S3.1.3, S4.1.4 | schema, id, type, bpmnElement, runId, version, status, producedBy, derivedFrom, body, derived, gate, riskFlags, history, authored.itemIndex, authored.sources, authored.riskFlags, authored.attributes, authored.openQuestions, authored.notesForNext |
| journey-future | `runs/{runId}/artifacts/p3-journey/3.1.3_journey-future.md` | S3.1.3 | S3.1.4, S4.1.2 | schema, id, type, bpmnElement, runId, version, status, producedBy, derivedFrom, body, derived, gate, riskFlags, history, authored.itemIndex, authored.sources, authored.riskFlags, authored.attributes, authored.openQuestions, authored.notesForNext |
| service-blueprint | `runs/{runId}/artifacts/p3-journey/3.1.4_service-blueprint.md` | S3.1.4 | S4.2.2 | schema, id, type, bpmnElement, runId, version, status, producedBy, derivedFrom, body, derived, gate, riskFlags, history, authored.itemIndex, authored.sources, authored.riskFlags, authored.attributes, authored.openQuestions, authored.notesForNext |
| story-map-framing | `runs/{runId}/artifacts/p4-story-map/4.1.1_story-map-framing.md` | S4.1.1 | S4.1.2 | schema, id, type, bpmnElement, runId, version, status, producedBy, derivedFrom, body, derived, gate, riskFlags, history, authored.itemIndex, authored.sources, authored.riskFlags, authored.attributes, authored.openQuestions, authored.notesForNext |
| narrative-flow | `runs/{runId}/artifacts/p4-story-map/4.1.2_narrative-flow.md` | S4.1.2 | S4.1.3 | schema, id, type, bpmnElement, runId, version, status, producedBy, derivedFrom, body, derived, gate, riskFlags, history, authored.itemIndex, authored.sources, authored.riskFlags, authored.attributes, authored.openQuestions, authored.notesForNext |
| backbone | `runs/{runId}/artifacts/p4-story-map/4.1.3_backbone.md` | S4.1.3 | S4.1.4, S6.2.1, S6.2.2 | schema, id, type, bpmnElement, runId, version, status, producedBy, derivedFrom, body, derived, gate, riskFlags, history, authored.itemIndex, authored.sources, authored.riskFlags, authored.attributes, authored.openQuestions, authored.notesForNext |
| story-map-details | `runs/{runId}/artifacts/p4-story-map/4.1.4_story-map-details.md` | S4.1.4 | S4.1.5, S4.2.1 | schema, id, type, bpmnElement, runId, version, status, producedBy, derivedFrom, body, derived, gate, riskFlags, history, authored.itemIndex, authored.sources, authored.riskFlags, authored.attributes, authored.openQuestions, authored.notesForNext |
| gap-dependency-list | `runs/{runId}/artifacts/p4-story-map/4.1.5_gap-dependency-list.md` | S4.1.5 | — | schema, id, type, bpmnElement, runId, version, status, producedBy, derivedFrom, body, derived, gate, riskFlags, history, authored.itemIndex, authored.sources, authored.riskFlags, authored.attributes, authored.openQuestions, authored.notesForNext |
| release-goals | `runs/{runId}/artifacts/p4-story-map/4.2.1_release-goals.md` | S4.2.1 | S4.2.2 | schema, id, type, bpmnElement, runId, version, status, producedBy, derivedFrom, body, derived, gate, riskFlags, history, authored.itemIndex, authored.sources, authored.riskFlags, authored.attributes, authored.openQuestions, authored.notesForNext |
| walking-skeleton | `runs/{runId}/artifacts/p4-story-map/4.2.2_walking-skeleton.md` | S4.2.2 | S4.2.3 | schema, id, type, bpmnElement, runId, version, status, producedBy, derivedFrom, body, derived, gate, riskFlags, history, authored.itemIndex, authored.sources, authored.riskFlags, authored.attributes, authored.openQuestions, authored.notesForNext |
| release-sequencing | `runs/{runId}/artifacts/p4-story-map/4.2.3_release-sequencing.md` | S4.2.3 | S4.2.4 | schema, id, type, bpmnElement, runId, version, status, producedBy, derivedFrom, body, derived, gate, riskFlags, history, authored.itemIndex, authored.sources, authored.riskFlags, authored.attributes, authored.openQuestions, authored.notesForNext |
| slice-scoring | `runs/{runId}/artifacts/p4-story-map/4.2.4_slice-scoring.md` | S4.2.4 | S4.2.5 | schema, id, type, bpmnElement, runId, version, status, producedBy, derivedFrom, body, derived, gate, riskFlags, history, authored.itemIndex, authored.sources, authored.riskFlags, authored.attributes, authored.openQuestions, authored.notesForNext |
| story-map | `runs/{runId}/artifacts/p4-story-map/4.2.5_story-map.md` | S4.2.5 | S5.1.1 | schema, id, type, bpmnElement, runId, version, status, producedBy, derivedFrom, body, derived, gate, riskFlags, history, authored.itemIndex, authored.sources, authored.riskFlags, authored.attributes, authored.openQuestions, authored.notesForNext |
| story-cards | `runs/{runId}/backlog/stories/ST-{nnn}_{slug}.md` | S5.1.1, S5.1.3 | S5.1.3, S5.1.4, S5.2.1, S6.2.1 | schema, id, type, bpmnElement, runId, version, status, producedBy, derivedFrom, body, derived, gate, riskFlags, history, authored.itemIndex, authored.sources, authored.riskFlags, authored.attributes, authored.openQuestions, authored.notesForNext |
| spikes | `runs/{runId}/backlog/spikes/SPK-{nnn}_{slug}.md` | S5.1.4 | — | schema, id, type, bpmnElement, runId, version, status, producedBy, derivedFrom, body, derived, gate, riskFlags, history, authored.itemIndex, authored.sources, authored.riskFlags, authored.attributes, authored.openQuestions, authored.notesForNext |
| amigos-protocol | `runs/{runId}/artifacts/p5-refinement/{storyId}/5.2.1_amigos-protocol.md` | S5.2.1 | S5.2.2 | schema, id, type, bpmnElement, runId, version, status, producedBy, derivedFrom, body, derived, gate, riskFlags, history, authored.itemIndex, authored.sources, authored.riskFlags, authored.attributes, authored.openQuestions, authored.notesForNext |
| story-refined | `runs/{runId}/artifacts/p5-refinement/{storyId}/5.2.2_story-refined.md` | S5.2.2 | S5.2.3, S5.2.4, S6.1.1 | schema, id, type, bpmnElement, runId, version, status, producedBy, derivedFrom, body, derived, gate, riskFlags, history, authored.itemIndex, authored.sources, authored.riskFlags, authored.attributes, authored.openQuestions, authored.notesForNext |
| wireframe-text | `runs/{runId}/artifacts/p5-refinement/{storyId}/5.2.3_wireframe-text.md` | S5.2.3 | S5.2.4 | schema, id, type, bpmnElement, runId, version, status, producedBy, derivedFrom, body, derived, gate, riskFlags, history, authored.itemIndex, authored.sources, authored.riskFlags, authored.attributes, authored.openQuestions, authored.notesForNext |
| size-estimate | `runs/{runId}/artifacts/p5-refinement/{storyId}/5.2.4_size-estimate.md` | S5.2.4 | — | schema, id, type, bpmnElement, runId, version, status, producedBy, derivedFrom, body, derived, gate, riskFlags, history, authored.itemIndex, authored.sources, authored.riskFlags, authored.attributes, authored.openQuestions, authored.notesForNext |
| gate-record | `runs/{runId}/gates/G-{nnn}_{gateway}_iter{iteration}.md` | SP5.2_CallK, K_5, PG_1 | — | schema, id, type, bpmnElement, runId, version, status, producedBy, derivedFrom, body, derived, gate, riskFlags, history, authored.itemIndex, authored.sources, authored.riskFlags, authored.attributes, authored.openQuestions, authored.notesForNext |
| ac-draft | `runs/{runId}/artifacts/p6-akzeptanz/{storyId}/6.1.1_ac-draft.md` | S6.1.1 | S6.1.2 | schema, id, type, bpmnElement, runId, version, status, producedBy, derivedFrom, body, derived, gate, riskFlags, history, authored.itemIndex, authored.sources, authored.riskFlags, authored.attributes, authored.openQuestions, authored.notesForNext |
| sbe-examples | `runs/{runId}/artifacts/p6-akzeptanz/{storyId}/6.1.2_sbe-examples.md` | S6.1.2 | S6.1.3 | schema, id, type, bpmnElement, runId, version, status, producedBy, derivedFrom, body, derived, gate, riskFlags, history, authored.itemIndex, authored.sources, authored.riskFlags, authored.attributes, authored.openQuestions, authored.notesForNext |
| acceptance-criteria | `runs/{runId}/artifacts/p6-akzeptanz/{storyId}/6.1.3_acceptance-criteria.md` | S6.1.3, S6.1.4 | S6.1.4, S6.2.3 | schema, id, type, bpmnElement, runId, version, status, producedBy, derivedFrom, body, derived, gate, riskFlags, history, authored.itemIndex, authored.sources, authored.riskFlags, authored.attributes, authored.openQuestions, authored.notesForNext |
| trace-findings | `runs/{runId}/artifacts/p6-akzeptanz/{step}_trace-findings.md` | S6.2.1, S6.2.2 | S6.2.4 | schema, id, type, bpmnElement, runId, version, status, producedBy, derivedFrom, body, derived, gate, riskFlags, history, authored.itemIndex, authored.sources, authored.riskFlags, authored.attributes, authored.openQuestions, authored.notesForNext |
| glossary | `runs/{runId}/artifacts/p6-akzeptanz/6.2.3_glossary.md` | S6.2.3 | — | schema, id, type, bpmnElement, runId, version, status, producedBy, derivedFrom, body, derived, gate, riskFlags, history, authored.itemIndex, authored.sources, authored.riskFlags, authored.attributes, authored.openQuestions, authored.notesForNext |
| backlog-cleaned | `runs/{runId}/artifacts/p6-akzeptanz/6.2.4_backlog-cleaned.md` | S6.2.4 | S6.2.5, S7 | schema, id, type, bpmnElement, runId, version, status, producedBy, derivedFrom, body, derived, gate, riskFlags, history, authored.itemIndex, authored.sources, authored.riskFlags, authored.attributes, authored.openQuestions, authored.notesForNext |
| traceability-matrix | `runs/{runId}/backlog/traceability.md` | S6.2.5 | — | schema, id, type, bpmnElement, runId, version, status, producedBy, derivedFrom, body, derived, gate, riskFlags, history, authored.itemIndex, authored.sources, authored.riskFlags, authored.attributes, authored.openQuestions, authored.notesForNext |
| backlog-export | `runs/{runId}/backlog/backlog.json` | S7 | — | schema, id, type, bpmnElement, runId, version, status, producedBy, derivedFrom, body, derived, gate, riskFlags, history, authored.itemIndex, authored.sources, authored.riskFlags, authored.attributes, authored.openQuestions, authored.notesForNext |
| run-report | `runs/{runId}/REPORT.md` | S7, S_NoGo, SP_Budget_S1 | — | schema, id, type, bpmnElement, runId, version, status, producedBy, derivedFrom, body, derived, gate, riskFlags, history, authored.itemIndex, authored.sources, authored.riskFlags, authored.attributes, authored.openQuestions, authored.notesForNext |
| source | `runs/{runId}/research/sources/SRC-{nnnn}_{slug}.md` | R_3 | R_3b | schema, id, type, bpmnElement, runId, version, status, producedBy, derivedFrom, body, derived, gate, riskFlags, history, authored.itemIndex, authored.sources, authored.riskFlags, authored.attributes, authored.openQuestions, authored.notesForNext |
| claim-ledger | `runs/{runId}/research/claims/{callId}.json` | R_3b | — | schema, id, type, bpmnElement, runId, version, status, producedBy, derivedFrom, body, derived, gate, riskFlags, history, authored.itemIndex, authored.sources, authored.riskFlags, authored.attributes, authored.openQuestions, authored.notesForNext |
| research-synthese | `runs/{runId}/research/reports/{callId}_{topic}.md` | R_4 | — | schema, id, type, bpmnElement, runId, version, status, producedBy, derivedFrom, body, derived, gate, riskFlags, history, authored.itemIndex, authored.sources, authored.riskFlags, authored.attributes, authored.openQuestions, authored.notesForNext |
| bundle-idea | `runs/{runId}/artifacts/ (bundle of: idea-brief)` | — | — | — |
| bundle-a1 | `runs/{runId}/artifacts/ (bundle of: vision-statement, lean-canvas, proto-panel, value-proposition-canvas, assumptions-map)` | — | — | — |
| bundle-a2 | `runs/{runId}/artifacts/ (bundle of: business-goals, actors, impacts, impact-map, impact-scoring, roadmap)` | — | — | — |
| bundle-a3 | `runs/{runId}/artifacts/ (bundle of: stakeholder-matrix, interview-guide, panel-profiles, interview-transcripts, personas, jtbd)` | — | — | — |
| bundle-a4 | `runs/{runId}/artifacts/ (bundle of: empathy-maps, pains-gains, pov-hmw, opportunity-solution-tree, opportunity-backlog)` | — | — | — |
| bundle-a5 | `runs/{runId}/artifacts/ (bundle of: journey-current, hot-spots, journey-future, service-blueprint)` | — | — | — |
| bundle-a6 | `runs/{runId}/artifacts/ (bundle of: story-map-framing, narrative-flow, backbone, story-map-details, gap-dependency-list, release-goals, walking-skeleton, release-sequencing, slice-scoring, story-map, mvp-candidate)` | — | — | — |
| bundle-a7 | `runs/{runId}/artifacts/ (bundle of: glossary, trace-findings, backlog-cleaned, traceability-matrix)` | — | — | — |
| bundle-a8 | `runs/{runId}/artifacts/ (bundle of: backlog-export, run-report)` | — | — | — |
| mvp-candidate | `runs/{runId}/artifacts/p4-story-map/4.2.5_story-map.md#mvp-candidate (section of story-map; no sdlc:output declares it separately)` | — | — | — |

## Open questions carried forward

None. Every question raised was answered (see README.md for the decisions).
