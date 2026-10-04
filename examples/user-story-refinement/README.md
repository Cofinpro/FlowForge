# Beispiel: Neue User Story aus Feedback erstellen & verfeinern

Ein einzelnes BPMN-Diagramm, das den Weg **einer** neuen User Story in einem laufenden IT-Projekt
beschreibt. Produktvision, Epics, Fachkonzept (mit Domänenmodell) und Product Backlog gibt es schon.
Auslöser ist Feedback von Nutzern oder Stakeholdern. Das Diagramm endet bei einer sprint-reifen Story,
die die Definition of Ready erfüllt und zum übrigen Backlog passt. Es bleibt bewusst auf einer Ebene:
keine aufklappbaren Teilprozesse, keine Call Activities.

Eine vollständige Discovery (Opportunity-Karte, Problem-Interviews, Persona/JTBD, Assumptions Map)
ist hier nicht der Normalfall. Spike oder Prototyp gibt es nur, wenn nach der fachlichen Klärung
wirklich etwas unklar ist.

![Gesamtansicht](user-story-refinement.png)

## Aufbau

- **Eine Ebene, vier Lanes** (Lane = Rolle, später ein Agent): Product Owner / BA, UX & Design,
  Entwicklung / Tech Lead, QA / Test.
- **Sechs Phasen**, als Gruppen eingezeichnet:

| Phase | Inhalt | Entscheidung / Schleife |
|---|---|---|
| 1 Eingang & Triage | Feedback als Problem formulieren (nicht als Lösungswunsch), verwandte Stories und Epics im Backlog suchen | *Fehlverhalten einer bestehenden Funktion?* (→ Fehlerbearbeitung) · *Wie hängt das Anliegen mit dem Backlog zusammen?* (Änderung an offener Story → dorthin übergeben, kein Epic-Bezug → im Opportunity Backlog parken, sonst neue Story unter bestehendem Epic) |
| 2 Fachliche Klärung | Rückfrage beim Feedbackgeber, Prüfung gegen Epic-Ziel und Fachkonzept, danach parallel: Ist-/Soll-Delta (PO), betroffene Screens (UX), technische Grobeinschätzung (Entwicklung) | *Mit dem Fachkonzept vereinbar?* (sonst Fachkonzept-Änderung beantragen) · *Relevante Unsicherheit offen?* (technisch → Spike, Nutzen/Bedienbarkeit → Prototyp-Test, sonst direkt weiter) · *Tragen die Erkenntnisse die Story?* |
| 3 Story formulieren | Einordnung unter den Epic in der User Story Map, Connextra-Format, Bezug zu Epic, Fachkonzept und auslösendem Feedback, INVEST-Selbstcheck | *INVEST erfüllt?* (umformulieren) |
| 4 Refinement (Three Amigos) | parallel Was (PO), Wie (Entwicklung), Rand- und Negativfälle (QA), Wireframes (UX); danach Given-When-Then, Beispieltabellen, Planning Poker | *Schätzungen konvergiert?* · *Passt die Story in einen Sprint?* (vertikal schneiden, Teil-Stories neu formulieren) |
| 5 Definition of Ready | DoR-Checkliste, Abgleich mit dem Domänenmodell, Prüfung auf Fake- oder Waisen-Story | *Definition of Ready erfüllt?* (Kriterien unklar → Refinement, technisches Risiko → Spike → Refinement, nicht mehr relevant → verwerfen) |
| 6 Plausibilität gegen Backlog & Freigabe | parallel: Duplikate/Überschneidungen (PO), Konsistenz mit bestehenden Abläufen (UX), Abhängigkeiten und Reihenfolge (Entwicklung), Akzeptanzkriterien gegen andere Stories und Living Documentation (QA); Befund zusammenführen, betroffene Stories markieren, priorisieren | *Konsistent mit dem übrigen Backlog?* (Widerspruch → zurück ins Refinement, Duplikat → mit bestehender Story zusammenführen) |

- **Aufgabentypen** nach der Lesart von `bpmn2agent-analyze`: `serviceTask` = Agentenarbeit,
  `userTask` = menschlicher Kontrollpunkt (Rückfrage beim Feedbackgeber, Auswertung von Spike oder
  Prototyp-Test, Refinement-Termin, Planning Poker, Priorisierung), `businessRuleTask` = Prüfung gegen
  eine Checkliste (INVEST, DoR).
- Jede Aufgabe trägt in `<bpmn:documentation>` ein `Input: … Output: …`. Zwölf Datenobjekte zeigen
  die wichtigsten Artefakte, darunter drei Eingaben aus dem Projektrahmen: Product Backlog (zweimal:
  bei der Triage und bei der Duplikatprüfung) sowie Epic & Fachkonzept.
- **Sechs Wissens-Stores**, je einer pro Phase (`Product-Methodik: Eingang & Triage`, `… Fachliche
  Klärung`, `… Story formulieren`, `… Refinement`, `… Definition of Ready`, `… Plausibilität &
  Freigabe`). Alle tragen `Art: wissen` und `Ort: notebook:The Product - Business Design`, also
  dasselbe Notebook, nur fachlich nach Phase geschnitten. Die Pfeile gehen vom Store zur Aufgabe
  (lesen): Triage → I1, I2 · Klärung → K1, K2, K3, K4, B5 · Story formulieren → C1, C2, C3, C4 ·
  Refinement → D1, D2a, D3, D4, D5, D6 · DoR → E1, E3 · Plausibilität → E4, P1, P4, P5, P6.
  Aufgaben ohne Pfeil von einem Store (alle übrigen) fallen auf die Lane-Zuordnung von
  `bpmn2agent-knowledge` zurück.

## Wissensgrundlage

Ablauf, Rollen, Gates und Artefakte stammen aus dem NotebookLM-Notebook **„The Product – Business
Design“** (26 Quellen), abgefragt über `gemini-notebook-mcp`. Für diese Fassung kamen dazu: Triage
von Feedback (Bug, Änderung an offener Story, Erweiterung eines Epics, neue Opportunity, parken),
leichtgewichtige Validierung gegen Epic-Ziel, Bounded Context und Ubiquitous Language des
Fachkonzepts, Umformulieren von Lösungswünschen in Problemstellungen, Ist-/Soll-Delta, Eskalation zu
Spike oder Prototyp nur bei hoher Unsicherheit und die Konsistenzprüfung gegen das Backlog
(Duplikate und „Splitter“, widersprüchliche Given-When-Then-Szenarien, Abhängigkeiten,
überholte Stories, Traceability Vision → Epic → Story).

Die Frage an das Notebook liegt mit wörtlicher Antwort und allen Belegstellen in
`notebook-faq/feedback-driven-stories.md`.

## Prüfen

Von der Repo-Wurzel aus:

```bash
.agents/skills/bpmn-authoring/scripts/validate.sh examples/user-story-refinement/user-story-refinement.bpmn
```

Stand: XSD gültig, 0 bpmn-moddle-Warnungen, 0 bpmnlint-Befunde.

## Ergebnis der Pipeline

Am 2026-09-26 mit `bpmn-to-agentic-workflow` durchgelaufen, als erstes Beispiel im neuen Aufbau:
[`generated/user-story-refinement/`](generated/user-story-refinement/). Muster Skill-Kette, 7 Skills
(ein Einstieg, sechs Phasen-Skills mit dem Notebook-Wissen als `references/`), keine Agenten, keine
Skripte, keine Hooks. Installiert wird mit einer Kopie:

```bash
cp -R generated/user-story-refinement/.claude/. <projekt>/.claude/
```

`bpmn2agent-verify` endet mit `RESULT: PASS`. Was aus jedem Element wurde, steht in
`generated/user-story-refinement/mapping/report.md`; die sechs Notebook-Fragen dieses Laufs liegen
in `generated/user-story-refinement/knowledge/faq/`.
