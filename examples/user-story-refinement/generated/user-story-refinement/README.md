---
bpmn:
  file: user-story-refinement.bpmn
  elements: [Start_FeedbackEingegangen, I1, I2, Gw_Bug, End_BugUebergeben, Gw_Bezug, End_AnStoryUebergeben, End_FeedbackGeparkt, I3, I4, I5, I6, K1, K2, Gw_Fachkonzept, End_FachkonzeptAenderung, Par_KlaerungSplit, K3, K5, K4, Par_KlaerungJoin, Gw_Unsicherheit, K6, B4, Merge_Validierung, B5, Gw_Erkenntnis, End_AnliegenVerworfen, Merge_Einordnung, C1, Merge_Formulierung, C2, C3, C4, Gw_Invest, Merge_Refinement, D1, Par_AmigosSplit, D2a, D2d, D2b, D2c, Par_AmigosJoin, D3, D4, Merge_Schaetzung, D5, Gw_Schaetzung, Gw_Sprintgroesse, D6, E1, E2, E3, Gw_Ready, E5, End_StoryVerworfen, Par_PlausiSplit, P1, P7, P3, P2, Par_PlausiJoin, P4, Gw_Plausibel, P9, P6, End_StoryZusammengefuehrt, P5, E4, P8, P10, End_StorySprintReady, StoreRef_MethodikPhase1, StoreRef_MethodikPhase2, StoreRef_MethodikPhase3, StoreRef_MethodikPhase4, StoreRef_MethodikPhase5, StoreRef_MethodikPhase6, StoreRef_BacklogTriage, StoreRef_BacklogPlausi, StoreRef_BacklogFreigabe, DataInput_Feedback, DO_ReadyStory_Ref]
---

# user-story-refinement — Neue User Story aus Feedback erstellen & verfeinern

Aus dem Diagramm `user-story-refinement.bpmn` erzeugt: ein geführter Ablauf, der aus einem
Nutzer- oder Stakeholder-Feedback eine sprint-reife User Story macht, oder begründet, warum nicht.
Installiert ist noch nichts. `.claude/` in diesem Ordner ist fertig zum Kopieren in ein Projekt.

Erzeugt 2026-09-26, aktualisiert 2026-10-04 (Kontextquellen, GitHub-Backlog) · Muster: **Skill-Kette + Hook** · Quelle: `user-story-refinement.bpmn` (`a3be89b16aad…`)

Dein Diagramm wird von einem Menschen begleitet: achtmal entscheidet oder bestätigt jemand aus dem
Team. Einige Verzweigungen verlangen ein Urteil (Bug oder Story? passt es zum Fachkonzept? tragen
die Erkenntnisse?). Diese Urteile schlägt der Ablauf mit Begründung vor, und du bestätigst jeden
Ausgang und jeden Rücksprung. Ein Einstiegs-Skill geht die sechs Phasen der Reihe nach durch, ruft
je Phase einen Skill mit den Checklisten aus dem Notebook auf und hält an euren Prüfpunkten an. Ins
GitHub-Backlog schreibt er an fünf Stellen, jedes Mal erst nach deiner Freigabe direkt davor.

## Installieren

```bash
cp -R generated/user-story-refinement/.claude/. <dein-projekt>/.claude/
```

Kein Installationsskript, kein `npm install`. Hat dein Projekt schon eine `.claude/settings.json`,
überschreibt die Kopie sie: dann vorher sichern und von Hand zusammenführen, nämlich den Eintrag unter
`hooks.PreToolUse` (Matcher `Bash`), die drei Kostenprotokoll-Einträge (`SubagentStop`, `Stop`, `SessionEnd`) und die sechs Einträge unter `permissions.allow`. Hat dein Projekt
schon Skills oder Hooks mit denselben Namen, vorher nachsehen:
`ls <dein-projekt>/.claude/skills <dein-projekt>/.claude/hooks`.

Starten: `/user-story-refinement <feedback> <backlog> <fachkonzept>` in Claude Code: das Feedback als Text,
Ticket oder Datei, dazu Repo und Projekt des Backlogs auf GitHub (z. B. „owner/repo, project 3“) und wo Epics
und Fachkonzept liegen. Was fehlt,
fragt der Ablauf vor dem ersten Schritt ab. Beim Fortsetzen einer Story kommen Backlog und Fachkonzept aus
`stories/<id>/01_feedback.md`.

Lokal schreibt der Ablauf nur nach `stories/<id>/`; das Fachkonzept ändert er nie. Ins GitHub-Backlog
schreibt nur der Skill `story-backlog-publish`, und nur nach der passenden Freigabe:

| Freigabe | danach | schreibt |
|---|---|---|
| „Änderungshinweis an offene Story freigeben“ | „Änderungshinweis an offener Story ergänzen“ | Kommentar an der offenen Story |
| „Parken im Opportunity Backlog freigeben“ | „Feedback im Opportunity Backlog anlegen“ | Issue mit Label `opportunity` |
| „Zusammenführung freigeben“ | „Mit bestehender Story zusammenführen“ | neuer Abschnitt im Duplikat |
| „Story priorisieren & Übernahme ins Backlog freigeben“ | „Story im Backlog anlegen & in Ready-Spalte stellen“ | Issue mit `epic:<name>`, im Projekt, Status „Ready“, Feld „Priority“ |
| (dieselbe) | „Betroffene Stories im Backlog markieren“ | Kommentare an den betroffenen Stories |

Lehnst du eine Freigabe ab, wird nichts geschrieben und der Lauf pausiert; ein späterer Aufruf fragt
an derselben Stelle wieder. Ein abgebrochener Schreibschritt schreibt beim Fortsetzen nichts doppelt.

## Voraussetzungen

- **GitHub CLI `gh`**, angemeldet (`gh auth login`) mit Zugriff auf das Repo und dem Scope `project`
  (`gh auth refresh -s project`). Im GitHub-Projekt: ein Feld „Status“ mit der Option „Ready“ und ein
  Feld „Priority“; Epics als Labels `epic:<name>`, dazu ein Label `opportunity`. Der Ablauf prüft den
  Zugriff vor dem ersten Schritt; ein fehlgeschlagener Lesezugriff gilt als Fehler, nicht als „nichts
  gefunden“.
- Die sechs Wissensquellen („Product-Methodik: …“, Notebook „The Product – Business Design“) wurden beim
  Erzeugen gelesen; das Wissen steckt in den Skills (`references/`), zur Laufzeit ist das Notebook nicht nötig.
- Es wird nichts für dich verbunden: kein MCP-Server, keine `.mcp.json`. Ein Gedächtnis gibt es nicht.

## Kontextquellen

| Datenbestand | Art / Ort | liest | schreibt (nur nach Freigabe) |
|---|---|---|---|
| Product Backlog & User Story Map | live / `gh` | „Verwandte Stories & Epics im Backlog suchen“ | „Änderungshinweis an offener Story ergänzen“, „Feedback im Opportunity Backlog anlegen“ |
| Product Backlog: übrige Stories | live / `gh` | „Auf Duplikate & Überschneidungen prüfen“, „Abhängigkeiten & Reihenfolge prüfen“, „Akzeptanzkriterien gegen bestehende Stories abgleichen“ | – |
| Product Backlog: freigegebene Änderungen | live / `gh` | – | „Mit bestehender Story zusammenführen“, „Story im Backlog anlegen & in Ready-Spalte stellen“, „Betroffene Stories im Backlog markieren“ |

Alle drei sind dasselbe GitHub-Backlog, nach Phase geschnitten.

- **Berechtigungen** (`settings.json` → `permissions.allow`): die Lesebefehle `gh auth status`,
  `gh issue list`, `gh issue view`, `gh search issues`, `gh project view`, `gh project item-list` laufen
  ohne Rückfrage. Lesezugriff ist nicht pro Rolle getrennt; ein koordinierender Agent je Rolle könnte
  das, wurde aber bewusst nicht gewählt.
- **Hook** `hooks/user-story-refinement-write-guard.mjs` (PreToolUse, Matcher `Bash`): bei jedem
  `gh`-Befehl, der kein bekannter Lesebefehl ist, fragt Claude Code nach, auch in zusammengesetzten
  Befehlen, hinter `env` oder in `bash -c`. Repo und Projekt prüft der Hook nicht; die zeigt dir die
  Freigabe. Gilt im ganzen Projekt, also auch für `gh`-Schreibbefehle außerhalb dieses Ablaufs.

## Was in `.claude/` steckt

- **Skills** (`skills/`):
  - `user-story-refinement`: der Einstieg; führt durch alle sechs Phasen, fragt an den
    Prüfpunkten, zählt Schleifen und schreibt am Ende eine Übergabenotiz.
  - `story-triage`: Feedback als Problem formulieren, verwandte Stories und Epics suchen.
  - `story-clarification`: Epic-Ziel und Fachkonzept, Ist-/Soll-Delta mit messbarem Ziel,
    Screens, technische und nicht-funktionale Einschätzung, Prototyp-Test oder Spike.
  - `story-writing`: Story Map, Connextra-Story, Bezug, INVEST-Check (mit Vorlage).
  - `story-refinement`: Three-Amigos-Perspektiven, Given-When-Then, Beispieltabellen,
    vertikales Schneiden.
  - `story-readiness`: Definition of Ready, Domänenmodell-Abgleich, Fake- und Waisen-Stories.
  - `story-backlog-check`: Duplikate, Abläufe, Abhängigkeiten, Akzeptanzkriterien gegen das
    GitHub-Backlog (nur lesend); Vorschläge für betroffene Stories.
  - `story-backlog-publish`: alle fünf Schreibschritte ins GitHub-Backlog, jeweils erst nach der
    Freigabe, ohne doppeltes Schreiben beim Fortsetzen.
- **Wissensdateien:** zu 24 Aufgaben gibt es eine eigene Datei `references/<Aufgaben-Id>.md` im Skill, der den Schritt
  ausführt (z. B. `story-triage/references/I1.md`), jeweils mit Belegstellen aus dem Notebook. Fünf Prüfpunkte im
  Einstiegs-Skill haben ihre Dateien dort (`K1`, `B5`, `D1`, `D5`, `E4`), dazu die Phasen-Dateien, auf die sie
  verweisen. Elf Aufgaben (UX & Design, Entwicklung / Tech Lead, QA / Test) behalten das Phasen-Wissen in
  `references/domain-knowledge.md`.
- **Hooks:** `hooks/user-story-refinement-write-guard.mjs` und `hooks/user-story-refinement-cost-ledger.mjs`,
  angemeldet in `settings.json`.
- **Kostenprotokoll** (`hooks/user-story-refinement-cost-ledger.mjs`, `hooks/user-story-refinement-cost-map.json`):
  schreibt nach jedem Lauf die verbrauchten Tokens nach `.claude/runs/user-story-refinement/ledger.jsonl`
  (ohne Preise, ohne Netz; nimm `.claude/runs/` in die `.gitignore` auf). Auswerten: lanecraft-Plugin
  installieren, danach `/bpmn2agent-cost`. Das zeigt die Kosten je BPMN-Element, Lane und Phase.
- **Agenten, Skripte:** keine.

Andere Umgebungen (z. B. `.codex/`): die Skills sind neutral geschrieben und lassen sich dorthin
kopieren; die Rückfragen per `AskUserQuestion`, der Hook und `settings.json` gibt es nur in
Claude Code (**Claude-only**).

## Ablauf in Kürze

Je Story entsteht ein Ordner `stories/<id>/` mit nummerierten Dateien: Feedback, Ist-/Soll-Delta,
Prototyp-Test oder Spike, Story, Akzeptanzkriterien, Schätzung, DoR-Befund, Plausibilität,
Änderungsvorschläge, Ready-Story mit Link aufs Issue, bei einem vorzeitigen Ende eine Übergabe. Ein
unterbrochener oder pausierter Lauf macht dort weiter, wo `00_run.md` steht.

Schleifen haben Grenzen: INVEST und Planning Poker höchstens 3 Runden, danach weiter mit
Risikohinweis. Zurück ins Refinement geht es insgesamt höchstens 3-mal; danach fragt der Ablauf den
PO: verwerfen, parken oder mit sichtbarem Risiko zur Priorisierung. Eine zu große Story wird
geschnitten, und alle Teil-Stories laufen nacheinander bis zur Freigabe durch.

## Prüfmaterial (wird nicht kopiert)

- `mapping/report.md`: jedes BPMN-Element und was daraus wurde; hier wird freigegeben.
- `mapping/index.html`: dasselbe als anklickbares Diagramm.
- `workflow-spec.yaml`: alle Entscheidungen.
- `knowledge/`: das Fachwissen aus dem Notebook „The Product – Business Design“, je Aufgabe (`<Aufgaben-Id>.md`) und
  je Phase, mit Belegstellen in `knowledge/faq/`.

## Offene Fragen

Keine. Während des Laufs entschieden:

- „Mit dem Fachkonzept vereinbar?“ = nein: Diagramm bleibt; der Änderungsantrag nennt Begriff oder
  Regel und einen Vorschlag für die Fachexperten.
- Nicht-funktionale Anforderungen: in „Technische Auswirkungen grob einschätzen“ und in der
  Definition of Ready.
- Messbares Ziel: in „Ist-/Soll-Delta beschreiben“ und in der Story.
- Priorisierung: WSJF als Vorschlag, der PO entscheidet.
- Backlog in GitHub (2026-10-04): der Ablauf schreibt selbst, jeweils nach einem eigenen Freigabe-Schritt im
  Diagramm. Ablehnen pausiert den Lauf. Priorität als Projektfeld „Priority“, Epics als Labels `epic:<name>`.
  Die Übergabe an die Fehlerbearbeitung bleibt lokal.
- Die Freigabe-Schritte und die fünf Schreibschritte brauchen kein Notebook-Wissen.
- Geschnittene Stories: alle Teil-Stories nacheinander.
- „Tragen die Erkenntnisse die Story?“: bleibt bei Ja / Nein. Ein Pivot läuft über „Nein“ mit Notiz, ein weiteres
  Experiment setzt der Mensch bei „Erkenntnisse auswerten“ an. Keine Diagrammänderung.
- Elf Aufgaben ohne Pfeil von einer Wissensquelle behalten das Wissen ihrer Phase.

## Zu testen (Eval-Szenarien)

- Normalfall bis „Story sprint-ready“: Issue angelegt, im Projekt, Status „Ready“, „Priority“ gesetzt,
  betroffene Stories kommentiert, `backlogItem` in `10_ready-story.md`.
- „Ändert eine offene Story“ und „Kein Epic-Bezug / kein Nutzen“: je ein Kommentar bzw. Issue nach Freigabe.
- „Duplikat einer bestehenden Story“: Abschnitt angehängt; Duplikat zwischen Freigabe und Schreiben geändert →
  erneute Rückfrage.
- Freigabe abgelehnt → nichts geschrieben, `00_run.md` `paused`, Fortsetzen fragt erneut.
- Abbruch nach `gh issue create` → Fortsetzen legt kein zweites Issue an.
- `gh` nicht angemeldet → Fehler beim Start, kein Triage-Ergebnis „nichts gefunden“.

## Neu erzeugen

Ändert sich `user-story-refinement.bpmn`, `bpmn-to-agentic-workflow` erneut starten; gefragt
wird nur nach dem, was sich geändert hat. Bereits kopierte Dateien bleiben unberührt; nach einem
Blick in `mapping/report.md` `.claude/` einfach neu kopieren.
