# Aufgaben: Kontextquellen im BPMN

Plan: [`plan.md`](plan.md). Branch `feat/context-sources`. Ein Commit pro Aufgabe
(Conventional Commits, Scope in Klammern). Jede Aufgabe endet mit `npm run validate`.

## Reihenfolge

```
Welle 1:  T1 Spec-Vertrag   T2 Authoring + Fixture   T3 process-design
              │                    │
Welle 2:      └──────── T4 analyze ┘
                        │
Welle 3:      T5 knowledge   T6 design   T7 verify
                             │
Welle 4:                     T8 generate
                             │
Welle 5:      T9 Doku        T10 Ende-zu-Ende
```

Aufgaben in derselben Welle sind unabhängig und können parallel laufen.

---

## T1 — Spec-Vertrag: Schema und Mapping-Rubrik

`feat(design): add contextSources and workflowIO to the spec contract`

- **Dateien:**
  - `.agents/skills/bpmn2agent-design/assets/workflow-spec.schema.yaml`
  - `.agents/skills/bpmn2agent-design/references/mapping-rubric.md`
- **Schema:**
  - neue Top-Level-Abschnitte `contextSources.<id>` und `workflowIO`, Felder wie in
    plan.md §Spec-Erweiterung
  - `tools` ist entweder `{read, write}` oder `unresolved`
  - `memory` nur bei `art: gedaechtnis`
- **Neue Element-Kinds:** `context-source`, `workflow-input`, `workflow-output`.
- **Rubrik:**
  - Zeilen für Data Store je Art und für Prozess-I/O
  - die Art×Quelle-Matrix
  - die Regel „Schreiben in Live-Store braucht `userTask`, nicht workflow-script“
  - Platzierung der Tools (Agent-`tools:` vs. `permissions.allow`)
  - Farbe Türkis in der Farbtabelle
  - Musterhinweis „unterschiedliche Rechte je Rolle → orchestrator-agent“
- **Abnahme:**
  - Das Schema validiert ein Beispiel-Snippet mit allen drei Arten.
  - Bestehende Specs (dark-factory, verify-Fixtures) validieren weiterhin, weil alle neuen
    Felder optional sind.

## T2 — bpmn-authoring: Stores und Prozess-I/O zeichnen, Fixture anlegen

`feat(bpmn-authoring): support data stores and process io; add context-flow fixture`

- **Dateien:**
  - `.agents/skills/bpmn-authoring/references/xml-and-di.md`
  - `.agents/skills/bpmn-authoring/references/layout.md`
  - `.agents/skills/bpmn2agent-verify/fixtures/context-flow.bpmn`
  - `.agents/skills/bpmn2agent-verify/fixtures/context-flow-unguarded.bpmn`
- **XML und DI:**
  - `dataStore` (Root) + `dataStoreReference` (sichtbar, 50×50), Dokumentation mit
    `Art:`/`Quelle:`
  - prozessweite `ioSpecification` mit `dataInput`/`dataOutput` + `inputSet`/`outputSet`
  - DI-Hinweis: Shapes für dataInput/dataOutput sind nötig, damit bpmn-js sie zeichnet;
    bpmnlint verlangt sie nicht
- **Layout:** Stores unterhalb der Lane ihres ersten Lesers. Prozess-Eingabe links neben dem
  Start, Ausgabe rechts neben dem Ende.
- **Positive Fixture:**
  - je ein Store `wissen` (notebook), `live` (mcp, gelesen + geschrieben nach `userTask`) und
    `gedächtnis`
  - ein echtes `dataInput` und eine Ausgabe per Konvention
- **Negativ-Fixture:** dieselbe, aber ohne den `userTask` vor dem Schreiben.
- **Abnahme:** Beide Fixtures bestehen `validate.sh` (XSD, moddle ohne Warnungen,
  bpmnlint:recommended ohne Warnungen) und rendern sauber.

## T3 — bpmn-process-design: Kontext beim Modellieren abfragen

`feat(skills): ask for context sources in bpmn-process-design`

- **Datei:** `.agents/skills/bpmn-process-design/SKILL.md`
- **Inhalt:**
  - Notationstabelle um Data Store (drei Arten) und Prozess-I/O ergänzen
  - Regeln: Store = fachlicher Datenbestand; Pfeilrichtung = lesen/schreiben; `userTask` vor
    Schreiben in Live-Stores; Gedächtnis braucht Schreiber und Leser
- **Outline (§5):** pro Schritt die Frage „Was muss dieser Schritt wissen, und wo liegt es?“.
  Die Bestätigungsübersicht zeigt Stores mit Art, Quelle, Lesern und Schreibern sowie die
  Prozess-Eingabe mit Pflichtfeldern.
- **Abhängig von:** nur plan.md (läuft parallel zu T1/T2).
- **Abnahme:** `npm run validate` grün. Der Text bleibt schlank (Skill-Authoring-Regeln).

## T4 — analyze: Stores und Prozess-I/O inventarisieren

`feat(analyze): inventory data stores and process io into contextSources`

- **Abhängig von:** T1, T2
- **Dateien:**
  - `.agents/skills/bpmn2agent-analyze/scripts/inventory.mjs`
  - `.agents/skills/bpmn2agent-analyze/SKILL.md`
  - `.agents/skills/bpmn2agent-analyze/references/conventions.md`
- **inventory.mjs:**
  - `dataStoreReference` mit Name, Dokumentation (geparste `Art:`/`Quelle:`), Scope
  - Leser und Schreiber aus den Data Associations
  - prozessweite `ioSpecification`
  - Konventions-I/O: Data Object ohne Erzeuger, das gelesen wird, und Data Object ohne Leser
- **SKILL.md:**
  - `contextSources` und `workflowIO` in den Spec-Entwurf schreiben
  - per `AskUserQuestion` nachfragen bei: fehlendem `Art:`/`Quelle:`, ungültiger Kombination,
    Gedächtnis ohne Schreiber oder Leser
  - Stores in den ID-Diff bei geänderten Diagrammen aufnehmen
- **Abnahme:**
  - Die Inventur der Fixture listet alle drei Stores mit korrekten Lesern/Schreibern und beide
    I/O-Varianten.
  - dark-factory-Inventur unverändert (Diff leer bis auf neue leere Felder).

## T5 — knowledge: Zuordnung aus dem Diagramm

`feat(knowledge): ground tasks from knowledge stores in the diagram`

- **Abhängig von:** T4
- **Dateien:**
  - `.agents/skills/bpmn2agent-knowledge/SKILL.md`
  - `.agents/skills/bpmn2agent-knowledge/references/notebook-extraction.md`
- **Inhalt:**
  - Wissens-Stores ersetzen §2 „welches Notebook für welche Lane“. Die Quelle wird je nach
    Typ aufgelöst (`notebook:` über notebook_list per Titel, URL per WebFetch, `datei:` als
    lokales Doc, `websearch`, `mcp:` als Snapshot nur bei verbundenem Server).
  - Pro lesendem Task `knowledge/<taskId>.md`, ein Abschnitt pro Store.
  - Lane-Rückfall für Tasks ohne Wissens-Store.
  - `serviceTask` ohne jeden Wissens-Eingang wird als offene Frage erfasst, nicht als Fehler.
- **Abnahme:** Ein Lauf auf der Fixture erzeugt Dateien je Task mit Quellenangaben. Diagramme
  ohne Stores laufen wie bisher.

## T6 — design: Tools auflösen und Mapping-Plan

`feat(design): resolve live store tools and place them per role`

- **Abhängig von:** T1, T4
- **Dateien:**
  - `.agents/skills/bpmn2agent-design/SKILL.md`
  - `references/mapping-rubric.md` (Ergänzung zu T1)
  - `references/pattern-rubric.md`
- **Tools auflösen:**
  - `mcp:` per ToolSearch auf `mcp__<server>__`
  - Namensheuristik plus `readOnlyHint`; unklar = schreiben
  - `cli:` als `Bash(<cmd> <subcmd>:*)`-Muster, gleiche Heuristik auf die Unterbefehle
  - nicht verbunden → `unresolved`
- **Platzierung:** Agent-`tools:` bei orchestrator-agent, sonst `permissions.allow`.
- **Musterwahl:** Eine Phase mit Schreiben in einen Live-Store wird nicht workflow-script.
- **Mapping-Plan:** listet je Store Art, Quelle, Leser/Schreiber und die Tool-Aufteilung zur
  Bestätigung, inkl. „Lesezugriff nicht pro Rolle getrennt“, wo zutreffend.
- **Abnahme:** Die Spec der Fixture hat vollständige `contextSources.*.tools` (oder
  `unresolved`) und `elements.*` für alle Stores.

## T7 — verify: Stores prüfen

`feat(verify): trace context sources and guard live store writes`

- **Abhängig von:** T1, T4 (läuft parallel zu T5/T6, testet gegen handgeschriebene Spec)
- **Dateien:**
  - `.agents/skills/bpmn2agent-verify/scripts/verify.mjs`
  - `.agents/skills/bpmn2agent-verify/SKILL.md`
- **Prüfungen:**
  - Jeder Store und jedes Prozess-I/O-Element braucht einen `elements`-Eintrag.
  - `contextSources.*.readers/writers` müssen mit den Associations übereinstimmen.
  - **Schreiben in Live-Store ohne `userTask` auf jedem Pfad → Fehler** (Pfadanalyse über
    Sequenzflüsse, Schleifen beachten).
  - Live-Schreiben in einer workflow-script-Phase → Fehler.
  - `tools: unresolved` → Warnung.
- **Fehlermeldungen:** in Fachsprache, geroutet an analyze/design/generate.
- **Abnahme:** Die positive Fixture besteht diese Prüfungen. Die Negativ-Fixture meldet genau
  den Schreibfehler, geroutet an analyze (Diagramm ändern).

## T8 — generate: Dateien erzeugen

`feat(generate): emit context sources, write guard and memory hooks`

- **Abhängig von:** T6 (T7 für die Prüfung)
- **Dateien:**
  - `.agents/skills/bpmn2agent-generate/SKILL.md`
  - `assets/templates/*` (skill, agent, orchestrator, settings, hook, README, mapping-report)
  - `scripts/render-mapping.mjs`
  - `scripts/check-mapping-view.mjs`
- **Skill- und Agent-Templates:** Abschnitt `## Kontextquellen`; `tools:`-Platzhalter in
  Agent-Templates.
- **settings.json:** `permissions.allow` mit den Lese-Tools, wo Lanes keine Agents sind.
- **Schreibschutz-Hook:** PreToolUse, Matcher = Schreib-Tools aller Live-Stores,
  `permissionDecision: "ask"` mit Begründung (Store-Name, Freigabe-Task).
- **Gedächtnis:**
  - PostToolUse-Hook auf Schreibzugriffe auf den Gedächtnispfad; über `maxLines` → Exit 2
    „verdichten“
  - Skill-Text für Schreiber: einpflegen statt anhängen, feste Abschnitte, Cap
  - Leser laden die Datei zuerst; leer oder fehlend ist in Ordnung
- **Orchestrator:** `argument-hint` aus `workflowIO.input`; fragt nach, wenn ein Pflichtfeld
  fehlt.
- **README:** Voraussetzungen (MCP-Server, CLIs), Gedächtnisablage.
- **Mapping-Ansicht:** `context-source` in Türkis, Prozess-I/O aus `ioSpecification`
  indizieren, Stores ohne Eintrag rot.
- **Abnahme:** Generate auf der Fixture, danach verify grün und `check-mapping-view` ohne Rot.

## T9 — Doku

`docs: describe context sources in README and ARCHITECTURE`

- **Abhängig von:** T3–T8
- **Dateien:**
  - `ARCHITECTURE.md`
  - `README.md`
  - `.agents/skills/agentic-workflow-kb/references/process-to-agents.md`
  - `.agents/skills/agentic-workflow-kb/references/multi-agent-handoffs.md`
- **ARCHITECTURE.md:** Abschnitt Kontextquellen (Notation, Art×Quelle, Weg durch die Stufen).
- **README.md:** Kurzbeschreibung + Beispiel aus der Fixture.
- **Agent-Definitionen:** `agentic-workflow-architect` und `agentic-artifact-reviewer` prüfen
  Stores mit: ungeschütztes Schreiben, zu breite Tool-Listen, Gedächtnis ohne Cap.
- **Abnahme:** `npm run validate` grün. Doku auf Deutsch, Skill-Text auf Englisch.

## T10 — Ende-zu-Ende

`test: run the full pipeline on the context-flow fixture`

- **Abhängig von:** alle
- **Ablauf:** `bpmn-to-agentic-workflow` auf `context-flow.bpmn` in einem Scratch-Verzeichnis
  (analyze → knowledge → design → generate → verify) laufen lassen.
- **Abnahme:**
  - verify grün, Mapping-Ansicht ohne Rot.
  - Hooks per Smoke-Test: Schreib-Tool → `ask`; Gedächtnis mit 151 Zeilen → Exit 2.
  - Negativ-Fixture scheitert an verify mit der erwarteten Meldung.
  - `examples/dark-factory/tools/dark-factory-gen/regenerate.sh` endet weiterhin mit
    `RESULT: PASS`, `no reference problems`, den drei Smoke-Zeilen und `mapping view ok`.
