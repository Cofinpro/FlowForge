# Kontextquellen im BPMN modellieren

Status: Entwurf, abgestimmt am 2026-10-03. Aufgaben: [`tasks.md`](tasks.md).

## Ziel

Kontext ist am Ende Daten. Wer einen Prozess für lanecraft modelliert, soll beim Zeichnen
überlegen, **welche Daten jeder Schritt braucht und wo sie liegen**. Aus diesen Angaben baut die
Pipeline Wissensreferenzen, Tool-Freigaben, Schreibschutz und ein Gedächtnis über Läufe hinweg.

Heute modelliert das Diagramm nur Übergaben (Data Objects → Artefaktverträge). Wissensquellen
ordnet `bpmn2agent-knowledge` erst nachträglich Lanes zu. `dataStoreReference` ignoriert die
Pipeline (`inventory.mjs` überspringt es, die Mapping-Ansicht würde es rot färben).

## Notation

Jede dauerhafte Quelle ist ein **Data Store** (Zylinder). Seine Dokumentation trägt zwei Zeilen:

```
Art: wissen | live | gedächtnis
Quelle: notebook:<Titel> | mcp:<Server> | cli:<Befehl> | <URL> | datei:<Pfad> | websearch
```

- **Lesen/Schreiben ergibt sich nur aus der Pfeilrichtung.** Store → Task heißt lesen,
  Task → Store heißt schreiben. Es gibt keine `Zugriff:`-Zeile.
- **Ein Store ist ein fachlicher Datenbestand**, z. B. „Jira-Tickets Projekt LANE“, und kein
  System. Mehrere Stores dürfen dieselbe `Quelle:` haben.
- **Fehlt eine Zeile, fragt analyze nach.** Unsinnige Kombinationen (Matrix unten) ebenfalls.

### Art × Quelle

| Art | erlaubte Quelle | geladen | wird zu |
|---|---|---|---|
| `wissen` | `notebook:`, URL, `datei:`, `websearch` | bei der Generierung | `knowledge/<taskId>.md` → Skill-`references/` |
| `wissen` | `mcp:` | bei der Generierung (Snapshot), nur wenn der Server verbunden ist | wie oben |
| `live` | `mcp:`, `cli:` | zur Laufzeit | Tool-Allowlist + `## Kontextquellen` im Skill |
| `live` | `notebook:` | zur Laufzeit, behandelt als `mcp:gemini-notebook-mcp` | wie oben |
| `live` | URL | zur Laufzeit | `WebFetch` |
| `live` | `datei:` | zur Laufzeit | `Read` |
| `gedächtnis` | `datei:` (Standard `.claude/memory/<workflow>/<store>.md`) | zu Laufbeginn gelesen, am Ende geschrieben | kuratierte Datei + Cap-Hook |

### Prozess-Ein- und -Ausgabe

- **Eingabe:** ein echtes prozessweites `dataInput` (über bpmn-authoring geschrieben; bpmn.io
  rendert es, hat aber keinen Palette-Eintrag) **oder** die Konvention „Data Object ohne
  Erzeuger, das ein Task liest“.
- **Ausgabe:** `dataOutput` **oder** „Data Object, das niemand liest“.
- **Was daraus wird:** Die Eingabe wird ein Artefaktvertrag mit Pflichtfeldern. Der Orchestrator
  bekommt daraus ein `argument-hint` und fragt nach, wenn ein Pflichtfeld fehlt. Die Ausgabe wird
  der Vertrag für das Endergebnis.

## Regeln

### Wissen

- **Das Diagramm ist die Quelle der Wahrheit.** Die Pfeile von Wissens-Stores sind die Zuordnung.
  knowledge fragt nicht mehr „welches Notebook deckt welche Lane ab“, sondern extrahiert pro
  lesendem Task aus genau dieser Quelle.
- **Eine Datei pro Task:** `knowledge/<taskId>.md`, ein Abschnitt pro Store, Zitate je Abschnitt.
- **Rückfall:** Diagramme ohne Wissens-Store und Tasks ohne Wissens-Eingang nutzen die bisherige
  Lane-Zuordnung, mit dem Hinweis, dass Stores genauer wären.

### Live

- **Tools auflösen:** design holt die Tool-Liste des Servers per ToolSearch und sortiert nach
  Namen. `get/list/search/read/fetch/view` gilt als lesen,
  `create/update/delete/add/post/edit/transition/push` als schreiben. Wo der Server
  `readOnlyHint` liefert, gilt der. **Unklar heißt schreiben.** Die Nutzerin bestätigt die Liste im
  Mapping-Plan.
- **Server nicht verbunden:** Der Store bleibt `unresolved`. verify warnt, generate lässt die
  Tools weg (kein Wildcard).
- **Wohin die Tools gehen:** Wo Lanes Agents sind (orchestrator-agent), in `tools:` des
  Lane-Agents, nur die nötigen Lese-Tools. Sonst in `.claude/settings.json` →
  `permissions.allow` (Vereinigung aller Lese-Tools), und der Mapping-Plan sagt offen
  „Lesezugriff nicht pro Rolle getrennt“. Unterscheiden sich die nötigen Rechte der Rollen, gibt
  die Rubrik das als Signal für orchestrator-agent aus.
- **Skill-Text:** Jeder lesende Task bekommt einen Abschnitt `## Kontextquellen` mit dem
  Store-Namen (wörtlich), was für diesen Schritt zu holen ist und mit welchem Tool.

### Schreiben in Live-Stores

- **Vor jedem Schreiben ein `userTask`:** verify meldet einen Fehler, wenn nicht auf jedem Pfad
  ein `userTask` vor dem Schreiben liegt.
- **Hook als Rückhalt:** generate erzeugt einen PreToolUse-Hook, der für die Schreib-Tools
  `permissionDecision: "ask"` zurückgibt. Claude Code fragt den Menschen dann direkt beim Aufruf.
- **Musterwahl:** Eine Phase, die in einen Live-Store schreibt, darf nicht workflow-script sein,
  weil dieses Muster keine menschlichen Checkpoints erlaubt.

### Gedächtnis

- **Ablage:** `.claude/memory/<workflow>/<store>.md` relativ zum cwd des Laufs, überschreibbar
  mit `Quelle: datei:<Pfad>`. Das Gedächtnis liegt im Projekt der Nutzerin, nicht im Plugin.
- **Format:** ein kuratiertes Dokument mit festen Abschnitten (*Bewährt*, *Vermeiden*,
  *Offene Muster*) und höchstens 150 Zeilen. Der schreibende Task führt neue Erkenntnisse ein,
  statt sie anzuhängen.
- **Schreiber und Leser:** Ein Gedächtnis-Store braucht mindestens einen schreibenden
  `serviceTask` und einen Leser. Fehlt einer, fragt analyze nach. Schreiben braucht keine
  Freigabe.
- **Cap:** Ein PostToolUse-Hook auf Schreibzugriffe auf den Gedächtnispfad meldet bei über
  150 Zeilen Exit 2 mit „verdichten“ an Claude zurück.

### Rückverfolgung und Mapping-Ansicht

- **Stores:** Jeder Store bekommt `elements.<storeRefId>` mit `kind: context-source` und eine
  eigene Farbe (Türkis). verify verlangt den Eintrag wie bei Flow Nodes; fehlt er, ist der Store
  rot.
- **Prozess-I/O:** Bekommt `kind: workflow-input` / `workflow-output` und wird aus
  `ioSpecification` indiziert.

## Spec-Erweiterung (`workflow-spec.yaml`)

```yaml
contextSources:
  jira-tickets-lane:
    name: Jira-Tickets Projekt LANE        # Label wörtlich
    bpmnElement: DataStore_JiraTickets
    art: live                               # wissen | live | gedaechtnis
    quelle: { type: mcp, ref: atlassian }   # notebook|mcp|cli|url|datei|websearch
    readers: [Task_TicketAnalysieren]
    writers: [Task_KommentarPosten]
    tools:                                  # nur art: live; oder: unresolved
      read: [mcp__atlassian__getJiraIssue]
      write: [mcp__atlassian__addCommentToJiraIssue]
    memory: { path: .claude/memory/<wf>/<store>.md, maxLines: 150 }   # nur gedaechtnis
workflowIO:
  input:  { artifact: <artifactId>, required: [ticketId] }
  output: { artifact: <artifactId> }
```

`contextSources` steht bewusst neben `artifacts`. Artefakte gelten nur für einen Lauf, Stores
haben einen anderen Lebenszyklus und andere Felder.

## Nicht in v1

- **Datenzustände** (`[freigegeben]`) und daraus abgeleitete Status-Hooks
- **Freigabe-Records** zur Laufzeit (`runs/<run>/approvals/…`)
- **Zusätzliche Lint-Regeln:** toter Store, `serviceTask` ohne Eingang
- **Pro-Lane-Tools im workflow-script-Muster** (`agent({ agentType })`)
- **`.mcp.json`-Erzeugung:** keine Endpunkte oder Zugangsdaten im generierten Output
- **Änderungen am dark-factory-Beispiel** (bleibt Snapshot)

## Prüfstand

Neue Fixture `.agents/skills/bpmn2agent-verify/fixtures/context-flow.bpmn` mit:
- je einem Store pro Art
- einem geschützten Schreiben (`userTask` → Schreib-Task → Live-Store)
- Prozess-Ein- und -Ausgabe (einmal echt, einmal per Konvention)
- einem ungeschützten Schreiben in einer Negativ-Variante

Die ganze Pipeline läuft darauf. verify muss für die positive Fixture grün sein und für die
Negativ-Variante den Schreibfehler melden.
