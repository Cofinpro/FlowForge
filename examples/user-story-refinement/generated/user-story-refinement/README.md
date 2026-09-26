---
bpmn:
  file: user-story-refinement.bpmn
  elements: [Start_FeedbackEingegangen, I1, I2, Gw_Bug, End_BugUebergeben, Gw_Bezug, End_AnStoryUebergeben, End_FeedbackGeparkt, K1, K2, Gw_Fachkonzept, End_FachkonzeptAenderung, Par_KlaerungSplit, K3, K5, K4, Par_KlaerungJoin, Gw_Unsicherheit, K6, B4, Merge_Validierung, B5, Gw_Erkenntnis, End_AnliegenVerworfen, Merge_Einordnung, C1, Merge_Formulierung, C2, C3, C4, Gw_Invest, Merge_Refinement, D1, Par_AmigosSplit, D2a, D2d, D2b, D2c, Par_AmigosJoin, D3, D4, Merge_Schaetzung, D5, Gw_Schaetzung, Gw_Sprintgroesse, D6, E1, E2, E3, Gw_Ready, E5, End_StoryVerworfen, Par_PlausiSplit, P1, P7, P3, P2, Par_PlausiJoin, P4, Gw_Plausibel, P6, End_StoryZusammengefuehrt, P5, E4, End_StorySprintReady]
---

# user-story-refinement — Neue User Story aus Feedback erstellen & verfeinern

Aus dem Diagramm `user-story-refinement.bpmn` erzeugt: ein geführter Ablauf, der aus einem
Nutzer- oder Stakeholder-Feedback eine sprint-reife User Story macht, oder begründet, warum nicht.
Installiert ist noch nichts. `.claude/` in diesem Ordner ist fertig zum Kopieren in ein Projekt.

Erzeugt 2026-09-26 · Muster: **Skill-Kette** · Quelle: `user-story-refinement.bpmn` (`d97297a43b12…`)

Dein Diagramm wird von einem Menschen begleitet: fünfmal entscheidet oder bestätigt jemand aus dem
Team. Einige Verzweigungen verlangen ein Urteil (Bug oder Story? passt es zum Fachkonzept? tragen
die Erkenntnisse?). Diese Urteile schlägt der Ablauf mit Begründung vor, und du bestätigst jeden
Ausgang und jeden Rücksprung. Ein Einstiegs-Skill geht die sechs Phasen der Reihe nach durch, ruft
je Phase einen Skill mit den Checklisten aus dem Notebook auf und hält an euren Prüfpunkten an.

## Installieren

```bash
cp -R generated/user-story-refinement/.claude/. <dein-projekt>/.claude/
```

Mehr ist nicht zu tun: kein Installationsskript, kein `npm install`, keine `settings.json`.
Hat dein Projekt schon Skills mit denselben Namen, vorher nachsehen:
`ls <dein-projekt>/.claude/skills`.

Starten: `/user-story-refinement` in Claude Code, mit dem Feedback als Text, Ticket oder Datei.
Beim ersten Schritt fragt der Ablauf, wo Backlog, Story Map, Epic und Fachkonzept liegen.

**Empfehlung:** Der Ablauf schreibt nur nach `stories/<id>/` und ändert Backlog, andere Stories
oder das Fachkonzept nie, sondern legt Änderungsvorschläge ab. Wer das technisch absichern will,
sperrt Schreibzugriffe auf diese Pfade oder Werkzeuge in der eigenen `.claude/settings.json`
(`permissions.deny`), denn die Pfade kennt nur dein Projekt.

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
    Backlog; Änderungsvorschläge statt Änderungen.
- **Agenten, Hooks, Skripte:** keine.

Andere Umgebungen (z. B. `.codex/`): die Skills sind neutral geschrieben und lassen sich dorthin
kopieren; die Rückfragen per `AskUserQuestion` gibt es nur in Claude Code.

## Ablauf in Kürze

Je Story entsteht ein Ordner `stories/<id>/` mit nummerierten Dateien: Feedback, Ist-/Soll-Delta,
Prototyp-Test oder Spike, Story, Akzeptanzkriterien, Schätzung, DoR-Befund, Plausibilität,
Änderungsvorschläge, Ready-Story, bei einem vorzeitigen Ende eine Übergabe. Ein unterbrochener
Lauf macht dort weiter, wo die Dateien aufhören.

Schleifen haben Grenzen: INVEST und Planning Poker höchstens 3 Runden, danach weiter mit
Risikohinweis. Zurück ins Refinement geht es insgesamt höchstens 3-mal; danach fragt der Ablauf den
PO: verwerfen, parken oder mit sichtbarem Risiko zur Priorisierung. Eine zu große Story wird
geschnitten, und alle Teil-Stories laufen nacheinander bis zur Freigabe durch.

## Prüfmaterial (wird nicht kopiert)

- `mapping/report.md`: jedes BPMN-Element und was daraus wurde; hier wird freigegeben.
- `mapping/index.html`: dasselbe als anklickbares Diagramm.
- `workflow-spec.yaml`: alle Entscheidungen.
- `knowledge/`: das Fachwissen je Phase aus dem Notebook „The Product – Business Design“, mit
  Belegstellen in `knowledge/faq/`.

## Offene Fragen

Keine. Während des Laufs entschieden:

- „Mit dem Fachkonzept vereinbar?“ = nein: Diagramm bleibt; der Änderungsantrag nennt Begriff oder
  Regel und einen Vorschlag für die Fachexperten.
- Nicht-funktionale Anforderungen: in „Technische Auswirkungen grob einschätzen“ und in der
  Definition of Ready.
- Messbares Ziel: in „Ist-/Soll-Delta beschreiben“ und in der Story.
- Priorisierung: WSJF als Vorschlag, der PO entscheidet.
- Zusammenführen mit einer bestehenden Story: nur nach deiner Bestätigung, ohne BPMN-Änderung.
- Geschnittene Stories: alle Teil-Stories nacheinander.

## Neu erzeugen

Ändert sich `user-story-refinement.bpmn`, `bpmn-to-agentic-workflow` erneut starten; gefragt
wird nur nach dem, was sich geändert hat. Bereits kopierte Dateien bleiben unberührt; nach einem
Blick in `mapping/report.md` `.claude/` einfach neu kopieren.
