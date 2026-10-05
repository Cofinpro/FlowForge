# Aufgaben: Laufkosten je BPMN-Element

Plan: [`plan.md`](plan.md). Eigener Branch `feat/run-costs` (von `main`). Ein Commit pro Aufgabe
(Conventional Commits, Scope in Klammern). Jede Aufgabe endet mit `npm run validate`.

## Reihenfolge

```
Welle 0:  T0 Pilotlauf (dark-factory, klein, mit OTel)
              │
Welle 1:  T1 Transkript-Leser + Preise    T2 Label-Konvention
              │                               │
Welle 2:  T3 cost-report + Abgleich       T4 Ledger-Hook (generate + verify)
              │
Welle 3:  T5 Mapping-Ansicht   T6 cost-bench
              │
Welle 4:  T7 Doku              T8 Ende-zu-Ende
```

Aufgaben in derselben Welle sind unabhängig und können parallel laufen. T0 klärt Annahmen, auf
denen alles Weitere steht. Weicht ein Befund ab, wird zuerst `plan.md` angepasst.

---

## T0: Pilotlauf und offene Fakten klären

`docs(plans): record run-cost spike findings`

- **Wo:** im Repo `ai-sdlc-dojo-2026-factory` mit installiertem dark-factory-Plugin, kleiner
  Idee-Brief, Abbruch nach Phase 1.1 oder am ersten Gate.
- **Einstellungen:** OTel-Export auf Konsole/Datei, `OTEL_LOG_TOOL_DETAILS=1`.
- **Zu klären:**
  - Landen Agents aus dem Workflow-Tool unter `<session>/subagents/` und steht das `label` in
    `meta.json.description`? Gibt es eine Workflow-Run-ID im Transkript?
  - Enthält `cost-state` die Subagents mit? Wann wird es geschrieben (Sessionende, Resume)?
  - Felder von `SubagentStop` und `SessionEnd` (`agent_transcript_path`?), feuert
    `SubagentStop` auch für Workflow-Agents?
  - Tragen Subagent-Einträge `attributionSkill`, wenn der Agent einen Skill lädt?
  - Stimmen Token-Summen je `requestId` mit `cost-state.modelUsage` überein?
- **Ergebnis:**
  - `docs/plans/laufkosten/spike.md` mit Befunden
  - gekürzte Fixture-Transkripte unter `.agents/skills/flowforge-cost/fixtures/`, nur Metadaten
    und `usage`, **kein Nachrichteninhalt**
- **Abnahme:** Jede Frage oben ist mit „ja/nein + Beleg“ beantwortet.

## T1: Transkript-Leser und Preistabelle

`feat(cost): read usage from session transcripts with a versioned price table`

- **Abhängig von:** T0
- **Dateien:**
  - `.agents/skills/flowforge-cost/scripts/read-usage.mjs`
  - `.agents/skills/flowforge-cost/scripts/prices.json`
  - Symlink `.claude/skills/flowforge-cost`
- **read-usage.mjs:**
  - Eingabe: Session-ID + Projektpfad, Transkriptpfad oder `ledger.jsonl`
  - liest Hauptthread + `subagents/*.jsonl` + `meta.json`, dedupliziert je `requestId`
  - liefert Zeilen `{source: main|subagent, agentId, agentType, description, attributionSkill,
    attributionMcpServer, requestId, model, usage}` und den `cost-state`
  - unbekannte Struktur (fehlende `usage`, kein `requestId`) → Fehler mit Datei und Zeile, kein
    stilles Überspringen
- **prices.json:** Werte aus der aktuellen Anthropic-Preisseite (über den `claude-api`-Skill),
  mit `version`, `retrieved`, `source`. Cache-Write 5m und 1h getrennt, WebSearch je Anfrage.
- **Abnahme:** Tests auf den T0-Fixtures: Summe je Modell = `cost-state.modelUsage`; ein
  dupliziertes `requestId` wird einmal gezählt; unbekanntes Modell → Fehler.

## T2: Label-Konvention in den Templates

`feat(generate): prefix agent labels with the bpmn element id`

- **Abhängig von:** nur plan.md (parallel zu T1)
- **Dateien:**
  - `.agents/skills/flowforge-generate/assets/templates/workflow-script-template.mjs`
  - `.agents/skills/flowforge-generate/assets/templates/orchestrator-agent-template.md`
  - `.agents/skills/flowforge-generate/SKILL.md` (Schritt 7)
  - `.agents/skills/flowforge-design/references/pattern-rubric.md` (ein Satz zur Konvention)
- **Inhalt:**
  - jedes `agent()` bekommt `{ label: '<elementId> <label>', phase }`
  - der Orchestrator beginnt jede `Agent`-`description` mit der Element-ID
- **verify:** prüft im Workflow-Script, dass jedes `agent()`-Label mit einer Element-ID aus der
  Spec beginnt (`.agents/skills/flowforge-verify/scripts/verify.mjs`).
- **Abnahme:** Die verify-Fixtures erzeugen Labels mit Element-ID; verify meldet ein Label ohne ID
  als Fehler, geroutet an generate.

## T3: cost-report mit Abgleich

`feat(cost): attribute run cost to bpmn elements, lanes and phases`

- **Abhängig von:** T1 (T2 für saubere Zuordnung, nicht zum Start)
- **Dateien:**
  - `.agents/skills/flowforge-cost/scripts/cost-report.mjs`
  - `.agents/skills/flowforge-cost/SKILL.md`
- **Zuordnung:** Reihenfolge laut plan.md §Zuordnung, nachgeschlagen in
  `.claude/hooks/<workflow>-cost-map.json`. Im Erzeuger-Repo ersatzweise aus `workflow-spec.yaml`
  (Skill → Element über `elements.*.generatedPaths`, Phase aus `pattern.phases` bzw. den
  `phase()`-Titeln), über dieselbe Funktion, die T4 für die Kostenkarte nutzt.
- **Aufruf im Projekt der Nutzerin:** `/flowforge-cost` ohne Argumente nimmt den neuesten Lauf aus
  `.claude/runs/<workflow>/ledger.jsonl`. Mehrere Workflows im Projekt → Auswahl per
  `AskUserQuestion`.
- **Ausgabe:** `.claude/runs/<workflow>/<runId>/cost.json` + `cost.md` neben dem Ledger, oder per
  `--out` an einem anderen Ort:
  - Summen je Element, Lane, Phase und Modell
  - Tokens nach Art, Cache-Anteil sichtbar
  - Eimer *Orchestrierung* und *nicht zugeordnet*
  - MCP-Aufrufe je Server als Zählung
  - Kopfzeile mit `prices.json`-Version und Claude-Code-Version aus dem Transkript
- **Abgleich:**
  - Tokens exakt gegen `cost-state`
  - Kosten gegen `totalCostUSD` bzw. ein übergebenes `claude -p`-JSON, Toleranz 1 %
  - Exit 1 mit Fachtext, welcher Teil fehlt
- **Abnahme:** Auf den T0-Fixtures: Abgleich grün; dark-factory-Pilot ordnet ≥ 95 % der Kosten
  einem Element oder der Orchestrierung zu.

## T4: Ledger-Hook und Kostenkarte generieren

`feat(generate): emit a cost ledger hook and cost map per workflow`

- **Abhängig von:** T0 (Hook-Felder), T1 (gleiche Dedupe-Regel), T2 (Label-Präfixe)
- **Dateien:**
  - `.agents/skills/flowforge-generate/assets/templates/hook-cost-ledger-template.mjs`
  - `.agents/skills/flowforge-generate/scripts/build-cost-map.mjs` (Spec →
    `cost-map.json`, deterministisch, kein Modell)
  - `.agents/skills/flowforge-generate/SKILL.md` (neuer Schritt 6b, Self-Check, README-Abschnitt)
  - `.agents/skills/flowforge-generate/assets/templates/README-template.md`
  - `.agents/skills/flowforge-generate/assets/templates/mapping-report-template.md`
  - `.agents/skills/flowforge-verify/scripts/verify.mjs` (Pfad wie die Kontext-Hooks erlauben)
- **Hook:**
  - `SubagentStop` + `SessionEnd`, Node-Built-ins only
  - hängt deduplizierte Usage-Zeilen an `.claude/runs/<workflow>/ledger.jsonl`
  - scheitert nie den Lauf: Fehler → stderr, Exit 0
- **Header:** `bpmn.elements` = Prozess-ID (wie die Kontext-Hooks keine `generatedPaths`
  beanspruchen). Ob verify dafür eine Ausnahme braucht, klärt die Aufgabe.
- **Kostenkarte:** `.claude/hooks/<workflow>-cost-map.json` aus `build-cost-map.mjs`, Felder laut
  plan.md §Bausteine 1a. Wird bei jedem generate-Lauf neu geschrieben.
- **verify:** prüft die Kostenkarte in beide Richtungen gegen die Spec. Jedes Element mit
  `serviceTask`/Skill steht drin, jeder Eintrag zeigt auf ein existierendes Element, jeder
  Skill-Name existiert unter `.claude/skills/`.
- **README:**
  - wo Ledger und Kostenkarte liegen
  - `.gitignore`-Empfehlung für `.claude/runs/`
  - „Kosten auswerten: FlowForge-Plugin installieren, dann `/flowforge-cost`“
- **Abnahme:**
  - Smoke-Test mit gepipeten Payloads auf die T0-Fixtures schreibt die erwarteten Zeilen.
  - Ein zweiter Aufruf für denselben Agent dupliziert nichts.
  - verify grün auf den Fixtures; eine Kostenkarte mit gelöschtem Eintrag oder fremder
    Element-ID → Fehler, geroutet an generate.

## T5: Kosten in der Mapping-Ansicht

`feat(generate): overlay run cost on the mapping view`

- **Abhängig von:** T3
- **Dateien:**
  - `.agents/skills/flowforge-generate/scripts/render-mapping.mjs`
  - `.agents/skills/flowforge-generate/assets/mapping-viewer/viewer.js`
  - `.agents/skills/flowforge-generate/assets/mapping-viewer/viewer.css`
  - `.agents/skills/flowforge-generate/scripts/check-mapping-view.mjs`
- **Inhalt:**
  - optional `--cost <cost.json>`: Badge je Element (USD), Tooltip mit Tokens und Anteil
  - Lane-Summe im Lane-Kopf
  - ohne `--cost` keine Änderung
- **Abnahme:** `check-mapping-view` ok mit und ohne `--cost`; `regenerate.sh` endet weiterhin mit
  `mapping view ok`.

## T6: cost-bench für wiederholte Läufe

`feat(cost): benchmark repeated runs and report spread per element`

- **Abhängig von:** T3
- **Datei:** `.agents/skills/flowforge-cost/scripts/cost-bench.mjs`
- **Ablauf:**
  - N Läufe (Standard 5) per `claude -p --output-format json` in frischen Kopien eines
    Arbeitsverzeichnisses, gleicher Input
  - `cost-report` je Lauf
  - Aggregat je Element: Median, Min/Max, IQR
  - Option `--drop-first` gegen Cache-Effekte
- **Grenze:** Läufe mit `userTask` auf dem Pfad nur mit vorgegebenen Antworten. Sonst bricht
  `cost-bench` vor dem Start mit Hinweis ab.
- **Abnahme:** 3 Läufe auf einer kleinen workflow-script-Fixture ergeben `bench.md` mit Streuung
  je Element. Die Läufe kosten zusammen erkennbar wenig (Budget vorab nennen).

## T7: Doku

`docs: describe run cost measurement in README and ARCHITECTURE`

- **Abhängig von:** T3–T6
- **Dateien:**
  - `ARCHITECTURE.md`: Abschnitt Laufkosten (Zuordnung, Ledger, Abgleich, Grenzen)
  - `README.md`: Kurzanleitung „Was hat der Lauf gekostet?“ mit der Verteilung aus plan.md
    (Payload trägt Daten, Plugin die Logik)
  - `.agents/skills/flowforge-run/SKILL.md`: Verweis auf `flowforge-cost` nach einem
    Lauf
  - OTel als Gegenprobe: Env-Variablen und welche Attribute wofür taugen
- **Abnahme:** `npm run validate` grün. Doku auf Deutsch, Skill-Text auf Englisch.

## T8: Ende-zu-Ende

`test: measure a full generated workflow run end to end`

- **Abhängig von:** alle
- **Ablauf:**
  - Pipeline auf einer verify-Fixture mit workflow-script-Muster
  - generierten Payload in ein Scratch-Projekt kopieren und einmal laufen lassen
  - `cost-report` aus dem Ledger und zum Vergleich direkt aus dem Transkript
  - einmal im Scratch-Projekt nur mit Payload + FlowForge-Plugin, **ohne** `generated/`, also
    ausschließlich über `cost-map.json`
- **Abnahme:**
  - Alle Wege (Ledger, Transkript, nur Kostenkarte) liefern dieselben Zahlen; Abgleich grün.
  - Mapping-Ansicht mit `--cost` ohne Rot.
  - OTel-Summe `claude_code.cost.usage` weicht höchstens 1 % ab.
  - `regenerate.sh` endet weiterhin mit `RESULT: PASS`, `no reference problems`, den drei
    Smoke-Zeilen und `mapping view ok`.
