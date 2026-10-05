# FlowSpec: die BPMN-Notation

Was jedes BPMN-2.0-Element bedeutet, wenn du damit einen agentischen Workflow und seinen Kontext
modellierst, und was die `bpmn2agent`-Pipeline daraus erzeugt. Die Regeln selbst stehen in den
Skills; diese Seite fasst sie an einem Ort zusammen (Quellen am Ende).

**Grundidee:** Lane = Rolle, Aufgabentyp = wer die Arbeit macht (KI, Mensch, Skript, Regel),
Datenobjekt = Übergabe zwischen Schritten, Data Store = Kontextquelle, Gateway = Steuerlogik.
Alles, was du zeichnest, wird entweder zu einer Datei, zu Steuerlogik oder zu einer bewusst
markierten Lücke. Nichts verschwindet still.

## Rollen

| Element | bedeutet | wird zu | Regeln |
|---|---|---|---|
| **Pool** | die eine Organisation, deren Prozess modelliert wird | nichts Eigenes | genau ein Pool bzw. Prozess; ein zweiter Pool mit Nachrichtenflüssen ist nicht unterstützt (siehe unten) |
| **Lane** | eine Rolle: eine Funktion oder ein Wissensgebiet (PO, UX, Entwicklung, QA …) | `roles.<id>` in der Spec; ein eigener Subagent nur beim Muster Orchestrator-Agent, sonst eine Perspektive im Lane-Skill und in der Skill-Kette | 2–6 Lanes, eine je Rolle, nie eine je Aufgabe; jedes Flusselement liegt in genau einer Lane, auch in den Ebenen der Teilprozesse; eine Rolle, die nur entscheidet, ist eine Lane aus `userTask`s |
| `Rolle: X` in der Dokumentation | Rollen-Hinweis für Diagramme **ohne** Lanes | wie eine Lane, nach Rückfrage | nur Notlösung; vorrangig gilt die Extension `sdlc:step agentRole="…"` |

Agentennamen folgen `{domain}-{role}` in kebab-case. Brauchen Rollen unterschiedliche Zugriffe auf
Live-Systeme, spricht das für das Muster Orchestrator-Agent, weil nur dort jede Rolle eigene
`tools:` bekommt.

## Aufgaben

| Element | bedeutet | wird zu |
|---|---|---|
| **Service Task** | KI-Arbeit: lesen, schreiben, beurteilen, etwas im Auftrag des Prozesses erledigen | ein **Skill**, wenn der Schritt Material braucht (Vorlage, längere Checkliste, Beispiele, Skript), wiederverwendet wird (≥ 2 Stellen), ein eigenes versioniertes Artefakt liefert oder im BPMN ausdrücklich als Skill benannt ist; sonst ein **Checklistenpunkt** im Agenten bzw. Lane-Skill. Im Zweifel Checklistenpunkt. |
| **User Task** | ein Mensch entscheidet, gibt frei oder liefert Input | ein **Prüfpunkt**: `AskUserQuestion` mit Optionen und Empfehlung, an genau dieser Stelle im Ablauf; keine eigene Datei |
| **Manual Task** | wie User Task | wie User Task |
| **Script Task** | rein mechanisch, gleiche Eingabe gibt immer das gleiche Ergebnis, kein Urteil | ein **Skript** (`.mjs`, nur Node-Bordmittel) unter `skills/<agentName der Lane>/scripts/`; über Lanes geteilt als eigener Skill |
| **Business Rule Task** | Prüfung gegen eine Regel | mechanisch (Schwelle, Pflichtfeld, Zählung) → **Skript**; mit Urteil (INVEST, Definition of Ready, „passt zum Fachkonzept?“) → **Checkliste** im Skill; ein **Hook** nur, wenn ein Tool-Aufruf physisch blockiert werden muss (siehe unten) |
| **Task** ohne Typ | unklar | eine Rückfrage, nie geraten. Besser gleich typisieren; im Zweifel `serviceTask`, `scriptTask` nur, wenn nichts beurteilt werden muss |
| Send Task / Receive Task | Austausch mit außen | keine eigene Regel in der Rubrik; als `serviceTask` („Anfrage an X senden“) bzw. `userTask` („Antwort von Y übernehmen“) modellieren |

**Wann ein Business Rule Task ein Hook wird:** nur wenn die Regel innerhalb der Tool-Ausführung von
Claude Code greifen muss.

| Hook | feuert | passt, wenn die Regel … |
|---|---|---|
| `PreToolUse` | vor einem Tool-Aufruf, kann ihn blockieren | ein Schreiben/Committen/Deployen stoppen muss („kein Commit vor bestandener DoR“) |
| `PostToolUse` | nach einem Tool-Aufruf | auf etwas reagiert, das ein Tool gerade getan hat |
| `Stop` | bevor der Hauptagent aufhört | eine Prüfung erzwingen muss, bevor die Aufgabe als fertig gilt |
| `SubagentStop` | bevor ein Subagent aufhört | wie `Stop`, für einen delegierten Schritt |

**Wo User Tasks hingehören:** vor jede irreversible oder nach außen wirkende Aktion (Commit,
Senden, Veröffentlichen, Löschen), vor jedes Schreiben in einen Live-Store und dort, wo das Ziel
eine Freigabe braucht. Nicht vor Routineschritte.

## Steuerfluss

| Element | bedeutet | wird zu |
|---|---|---|
| **Sequenzfluss** | Reihenfolge innerhalb einer Ebene | Reihenfolge der Schritte; überquert nie die Grenze eines Teilprozesses |
| **Exklusives Gateway (XOR)**, verzweigend | eine Entscheidung mit genau einem Ausgang | `kind: orchestrator`, keine Datei. Deterministische Bedingung (Zahl, Vergleich, `Grenzwert`, `Schwellenwert`, formale Bedingung) → Zweig im Code; sonst ein **Urteils-Gateway**: der Ablauf schlägt den Zweig mit Begründung vor |
| **Exklusives Gateway**, zusammenführend (Merge) | Wiedereintritt einer Schleife oder Zusammenführung alternativer Pfade | Steuerlogik; unbenannt |
| **Paralleles Gateway (AND)** | mehrere Dinge gleichzeitig, danach synchronisieren | parallele Schritte (`parallel()` im Workflow-Skript); in der Skill-Kette nacheinander als getrennte Perspektiven |
| **Inklusives Gateway (OR)** | einer oder mehrere Zweige | wie parallel; nur verwenden, wenn wirklich nötig |
| Komplexes / ereignisbasiertes Gateway | — | keine Regel in der Rubrik; vermeiden |
| **Standardfluss** (`default`) | der normale Weg | der Zweig, wenn nichts anderes zutrifft; genau einer je verzweigendem Gateway |
| **Schleife** | Nacharbeit | eine Wiederholung mit Obergrenze `gate.maxLoops` (Standard 3); an der Grenze geht es mit Risikohinweis weiter (`fail` → `pass-with-risk`) oder ein User Task eskaliert |

**Schleifen zeichnen:** Der Rückfluss läuft immer in ein eigenes XOR-**Merge**-Gateway vor dem
ersten Schritt des Schleifenkörpers. Entschieden wird in einem separaten XOR-**Split**-Gateway
danach, als Frage benannt. Die Obergrenze steht auf dem Rückfluss: `Nein (max. 3×)`. Jede Schleife
hat einen Ausgang (Eskalations-User-Task oder Ende).

**Beschriftung:** Aufgaben „Verb + Objekt“ („Entwurf prüfen“); verzweigende Gateways als Frage
(„Definition of Ready erfüllt?“), ihre Ausgänge als Antworten („Ja“, „Kriterien unklar“);
parallele und zusammenführende Gateways bleiben unbenannt. Die Labels landen wörtlich in den Skills.

## Ereignisse

| Element | bedeutet | wird zu |
|---|---|---|
| **Startereignis** (leer) | Auslöser | Einstieg; meist `not-generated` (reiner Marker), `orchestrator`, wenn es echte Arbeit macht |
| **Endereignis** | Ergebnis; je fachlichem Ausgang eins, benannt nach dem Zustand („Story freigegeben“) | Abschluss; ein vorzeitiges Ende hinterlässt eine Übergabenotiz |
| **Fehler-Randereignis** | Fehlerpfad an einer Aktivität | ein Fehlerzweig in der Steuerlogik |
| Zwischenereignis (leer, Link, Signal als bloßer Marker) | Wegmarke im Ablauf | `kind: orchestrator`, wie ein Gateway |
| Terminierendes Endereignis | — | vermeiden |

Timer- und Nachrichtenereignisse sind nicht unterstützt (siehe unten).

## Phasen und Wiederholung

| Element | bedeutet | wird zu |
|---|---|---|
| **Zugeklappter Teilprozess** | eine Phase mit eigenem Innenleben (ab ca. 8 Schritten) | kurz, fast linear → **wiederverwendbarer Skill**, die inneren Schritte werden zu Abschnitten seiner `## Procedure`, innere Script Tasks zu Skripten darin; mit Gateways, Schleifen oder Mehrfachinstanz → **Teil-Workflow** mit eigener Musterwahl |
| **Call Activity** | Aufruf eines separat definierten, wiederverwendbaren Prozesses | wie Teilprozess; der aufgerufene Prozess wird als eigene Ebene analysiert |
| **Mehrfachinstanz** (parallel oder sequenziell) | dasselbe je Element einer Menge („je Epic“) | ein Schritt je Element; parallel im Workflow-Skript als `parallel()`. Die Menge kommt aus `sdlc:collection`, `loopCardinality`/`loopDataInputRef`, dem Namen („je/pro/jede …“, „for each“) oder zuletzt einer Annotation, die nur als Hinweis gilt und nachgefragt wird |

Ein Teilprozess hat genau ein leeres Startereignis, eigene Endereignisse und, im Agenten-Diagramm,
eigene Lanes in seiner Ebene; diese gelten nur für ihn.

## Daten und Kontext

Beim Zeichnen für jeden Schritt fragen: **Was muss er wissen, und wo liegt es?** Die Antwort ist
ein Data Store, ein Datenobjekt aus einem früheren Schritt oder die Prozesseingabe. Und: **Schreibt
er irgendwohin?** Dann den Store benennen und den User Task davor setzen.

| Element | bedeutet | wird zu |
|---|---|---|
| **Datenobjekt** | ein Arbeitsergebnis, das ein späterer Schritt braucht; Übergabe zwischen Rollen | ein **Artefaktvertrag** `artifacts.<id>`: fester Ablageort (`pathPattern`), Kopfdaten (`status`, `version`), Erzeuger und Verbraucher. Darüber übergeben sich Schritte und wird ein Lauf fortgesetzt |
| **Data Store** | ein dauerhafter Datenbestand, der den Lauf überdauert | eine **Kontextquelle** `contextSources.<id>`, je nach `Art:` (Tabelle unten); keine eigene Datei |
| **Prozesseingabe** (`ioSpecification`/`dataInput`, oder ein Datenobjekt, das niemand erzeugt und ein Schritt liest) | was ein Lauf zum Start braucht | `workflowIO.input`; die Pflichtfelder werden zum `argument-hint` des Orchestrators |
| **Prozessausgabe** (`dataOutput`, oder ein Datenobjekt, das erzeugt und von niemandem gelesen wird) | was der Lauf am Ende liefert | `workflowIO.output`, der Vertrag für das Endergebnis |

**Pfeilrichtung ist die einzige Zugriffsregel:** Store/Objekt → Aufgabe = lesen, Aufgabe →
Store/Objekt = schreiben. Es gibt keine `Zugriff:`-Zeile. Stores sind keine Flusselemente: keine
Lane, kein Sequenzfluss. Ein Pfeil an einem Teilprozess gilt für den Teilprozess.

### Data Stores: `Art` und `Ort`

Benannt als fachlicher Datenbestand („Jira-Tickets Projekt LANE“), nicht als System („Jira“).
Mehrere Stores dürfen denselben Ort teilen. Die Dokumentation trägt genau zwei Zeilen:

```text
Art: wissen | live | gedächtnis
Ort: notebook:<Titel> | mcp:<Server> | cli:<Befehl> | <URL> | datei:<Pfad> | websearch
```

| Art | bedeutet | erlaubter Ort | geladen | wird zu |
|---|---|---|---|---|
| `wissen` | Referenzwissen, das ein Schritt kennen muss (Handbuch, Fachkonzept, Regeln) | `notebook:`, URL, `datei:`, `websearch`; `mcp:` nur als Snapshot bei verbundenem Server | bei der Generierung | belegte Datei `knowledge/<taskId>.md` je lesendem Schritt, dann `references/` in dessen Skill |
| `live` | Daten, die zur Laufzeit gelesen oder geändert werden (Tickets, Repo, Wiki) | `mcp:`, `cli:`, `notebook:` (wie `mcp:gemini-notebook-mcp`), URL (`WebFetch`), `datei:` (`Read`) | zur Laufzeit | Tool-Allowlist und ein Abschnitt `## Kontextquellen` im Skill; beim Schreiben zusätzlich ein `ask`-Hook |
| `gedächtnis` | Erkenntnisse über Läufe hinweg | nur `datei:` (Standard `.claude/memory/<workflow>/<store>.md`) | zu Laufbeginn gelesen, am Ende geschrieben | kuratierte Datei (*Bewährt*, *Vermeiden*, *Offene Muster*, max. 150 Zeilen) plus Cap-Hook |

Jede andere Kombination (z. B. `live` + `websearch`, `gedächtnis` + `mcp:`) ist ungültig und wird
nachgefragt.

**Regeln je Art:**

- `wissen` wird nur gelesen.
- `live`: Vor jedem Schreiben liegt auf **jedem** Pfad ein User Task; `bpmn2agent-verify` meldet
  sonst einen Fehler. Ein PreToolUse-Hook (`<workflow>-write-guard.mjs`, `permissionDecision:
  "ask"`) sichert die Schreib-Tools zusätzlich ab. Eine Phase mit Live-Schreiben wird nie ein
  Workflow-Skript. Tools werden per Name eingeordnet (`get/list/search/read/fetch/view` lesen,
  `create/update/delete/add/post/edit/transition/push` schreiben, `readOnlyHint` geht vor,
  unklar = schreiben). Ist der Server nicht verbunden, bleibt `tools: unresolved`, nie eine Wildcard.
- `gedächtnis` braucht einen schreibenden Service Task und einen Leser; Schreiben braucht keine
  Freigabe.

## Dokumentation an den Elementen

| wo | Zeilen | Zweck |
|---|---|---|
| jede Aufgabe | `Input: … Output: … Quelle: <FAQ-Eintrag \| URL \| ⚠ unverified>` | verdrahtet Ein- und Ausgaben, belegt die Herkunft des Schritts |
| Data Store | `Art: …` und `Ort: …` | siehe oben |
| Aufgabe ohne Lane | `Rolle: …` | Rollen-Hinweis, nur ohne Lanes |

`Quelle:` beschreibt die Herkunft eines Schritts, `Ort:` den Speicherort eines Stores; deshalb zwei
verschiedene Wörter.

## Rein visuell

| Element | Wirkung |
|---|---|
| **Gruppe** | nur optische Klammer („Review-Phase“), ersetzt keinen Teilprozess |
| **Textanmerkung** | keine Fluss- oder Rolleninformation; einzig als letzter Hinweis auf die Menge einer Mehrfachinstanz gelesen, und dann nachgefragt |

## Nicht unterstützt (v1)

`bpmn2agent-analyze` meldet diese Elemente rot und schlägt einen Umbau vor. Bleibst du dabei, wird
das Element eine bewusste, grau markierte Lücke.

| Element | warum nicht | stattdessen |
|---|---|---|
| zweiter Pool mit Nachrichtenflüssen | die Pipeline erzeugt Agenten für **einen** Prozess, nicht für fremde Systeme | eigene Rolle → Lane; echtes Außen → Service Task „Anfrage an X senden“ bzw. User Task „Antwort von Y übernehmen“ |
| Timer-Ereignis | kein Scheduler in den erzeugten Artefakten | Schleife mit Obergrenze („bis zu 3 Versuche“); regelmäßige Läufe sind Betriebssache (Cron o. Ä.) |
| Nachrichtenereignis | Signal von außerhalb des eigenen Ablaufs | wie Pool: Lane und normaler Sequenzfluss, oder ein expliziter Schritt |
| Event-Teilprozess | kein „Handler, der jeden Schritt unterbrechen kann“ | Fehler-Randereignis an der betroffenen Aktivität, oder ein Checklistenpunkt „vor/nach jedem Schritt X prüfen“ |
| Kompensation | keine Transaktions-Engine, kein automatisches Rückgängigmachen | ein expliziter Rückbau-Task auf einem Fehlerzweig hinter einem Gateway |

## Vom Diagramm zum Orchestrierungsmuster

Die Form des Diagramms bestimmt, wie die Teile zusammenspielen (`pattern-rubric.md`):

| Diagramm zeigt | Muster |
|---|---|
| User Tasks, fast linear, Schleifen mit einfacher Bestanden/Nicht-bestanden-Rubrik | **Skill-Kette + Hooks** |
| keine User Tasks, parallele Gateways oder Mehrfachinstanz, deterministische Verzweigungen, kein Live-Schreiben | **Workflow-Skript** (startet nur von Hand) |
| Urteils-Gateways, an denen im Einzelfall abgewogen wird | **Orchestrator-Agent** mit einem Agenten je Lane |
| Phasen mit deutlich verschiedener Form | **gemischt**, je Phase eines der drei |

Im Zweifel gewinnt das einfachere Muster.

## Farben in der Mapping-Ansicht

`generated/<workflow>/mapping/` färbt jedes Element nach dem, was daraus wurde. Jede Anmerkung
nennt die Art zusätzlich als Text.

| Farbe | `kind` | bedeutet |
|---|---|---|
| Blau | `agent-checklist` | Checklistenpunkt im Agenten |
| Grün | `skill` | eigener Skill |
| Lila | `script` | deterministisches Skript in einem Skill |
| Orange | `hook` | Claude-Code-Hook |
| Türkis | `orchestrator` | Gateway, Schleife, Mehrfachinstanz; keine Datei |
| Bernstein | `human-checkpoint` | ein Mensch entscheidet |
| Braun | `artifact-contract` | Datenobjekt mit Ablageort und Kopfdaten |
| Rosé | `context-source`, `workflow-input`, `workflow-output` | Data Store oder Prozess-Ein-/Ausgabe |
| Grau | `not-generated` | bewusst nicht erzeugt, mit Begründung; kein Fehler |
| Rot | `unresolved` | offen; `bpmn2agent-verify` schlägt fehl, bis es geklärt ist |

## Kurz-Checkliste vor dem Zeichnen

- Ein Pool, 2–6 Lanes, jedes Element in einer Lane.
- Jede Aufgabe typisiert, als „Verb + Objekt“ benannt, mit `Input: … Output: … Quelle: …`.
- Verzweigende Gateways als Frage, Ausgänge beschriftet, ein `default`.
- Jede Schleife über ein Merge-Gateway, Obergrenze auf dem Rückfluss, mit Ausgang.
- Ergebnisse, die die Lane wechseln, als Datenobjekt.
- Jede dauerhafte Quelle als Data Store mit `Art:` und `Ort:`; Pfeilrichtung = lesen/schreiben.
- User Task vor jedem Live-Schreiben und vor jeder nach außen wirkenden Aktion.
- Prozesseingabe mit ihren Pflichtfeldern und das Ergebnis des Laufs eingezeichnet.
- Keine Timer, Nachrichten, zweiten Pools, Event-Teilprozesse oder Kompensation.

## Quellen

- [`bpmn-process-design/SKILL.md`](.agents/skills/bpmn-process-design/SKILL.md): die
  FlowSpec-Notation beim Entwerfen, Schritt 4
- [`bpmn2agent-analyze/references/conventions.md`](.agents/skills/bpmn2agent-analyze/references/conventions.md):
  wie die Analyse ein Diagramm liest
- [`bpmn2agent-analyze/references/unsupported.md`](.agents/skills/bpmn2agent-analyze/references/unsupported.md):
  nicht unterstützte Konstrukte und Umbauten
- [`bpmn2agent-design/references/mapping-rubric.md`](.agents/skills/bpmn2agent-design/references/mapping-rubric.md):
  Element → Artefakt, Kontextquellen, Farblegende
- [`bpmn2agent-design/references/pattern-rubric.md`](.agents/skills/bpmn2agent-design/references/pattern-rubric.md):
  Wahl des Orchestrierungsmusters
- [`bpmn-authoring/references/modelling-rules.md`](.agents/skills/bpmn-authoring/references/modelling-rules.md)
  und [`xml-and-di.md`](.agents/skills/bpmn-authoring/references/xml-and-di.md): Modellierregeln,
  Schleifen, XML für Data Stores und `ioSpecification`
- [`ARCHITECTURE.md`](ARCHITECTURE.md#kontextquellen): Kontextquellen durch die Stufen
- Beispiele: [`examples/user-story-refinement/`](examples/user-story-refinement/),
  Fixture [`context-flow.bpmn`](.agents/skills/bpmn2agent-verify/fixtures/context-flow.bpmn)
