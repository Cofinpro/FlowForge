# Laufkosten je BPMN-Element messen

Status: Entwurf, abgestimmt am 2026-10-04. Aufgaben: [`tasks.md`](tasks.md).

## Ziel

Nach jedem Lauf eines generierten Workflows soll feststehen, **was der Lauf gekostet hat und
welcher Teil des Diagramms wie viel davon**. Die Zahl soll ohne Schätzung durch das Modell
zustande kommen: Tokens aus den API-Antworten, Preise aus einer versionierten Tabelle, Zuordnung
über die BPMN-Element-IDs, die die Pipeline ohnehin überall mitführt.

Deterministisch ist die **Messung**. Die Läufe selbst sind es nicht; deshalb gehören wiederholte
Läufe mit Median und Streuung dazu.

## Was es schon gibt (geprüft am 2026-10-04)

- **Session-Transkripte** unter `~/.claude/projects/<projekt>/`:
  - `<session>.jsonl` für den Hauptthread, `<session>/subagents/agent-<id>.jsonl` je Subagent
  - daneben `agent-<id>.meta.json` mit `agentType` und `description`
  - Assistant-Einträge tragen `message.usage` (Input, Output, Cache-Write 5m/1h, Cache-Read),
    `message.model`, `requestId` und, wenn ein Skill aktiv ist, `attributionSkill`
    (bei MCP-Aufrufen zusätzlich `attributionMcpServer`/`attributionMcpTool`)
  - ein `cost-state`-Eintrag mit `totalCostUSD` und `modelUsage` je Modell (Tokens,
    `webSearchRequests`, `costUSD`)
- **Doppelte Zeilen:** Eine API-Anfrage erscheint oft in mehreren Einträgen mit identischer
  `usage` (in einer Stichprobe 124 von 165 Anfragen). Summiert wird deshalb **je `requestId`**.
- **Das Format ist intern** und kann sich mit jeder Claude-Code-Version ändern. Der Leser ist
  deshalb ein kleiner Adapter mit Fixtures, der bei Formatänderungen laut scheitert.
- **OpenTelemetry:** `claude_code.cost.usage`/`claude_code.token.usage` mit `agent.name`,
  `skill.name`, `plugin.name`, `query_source`, `model`. Gut für Dashboards über viele Läufe, aber
  ohne Element-ID und ohne eigene Attribute je Subagent. Dient hier nur zum Gegenprüfen.
- **Hooks** bekommen `transcript_path` (SubagentStop zusätzlich `agent_id`/`agent_type`), aber
  keine Tokens. Ein Hook kann die Kosten also nicht direkt lesen, wohl aber aus dem Transkript
  berechnen.
- **dark-factory** setzt schon `label: "<elementId> <label>"` je `agent()`-Aufruf
  (`workflow-body.mjs`). Das generische Workflow-Template tut das noch nicht.

## Zuordnung: welcher Token gehört zu welchem Element

Jede API-Anfrage bekommt genau einen Eimer, in dieser Reihenfolge:

| Quelle | gilt für Muster | ergibt |
|---|---|---|
| Subagent-`description` beginnt mit einer Element-ID aus der Spec | workflow-script, orchestrator-agent | dieses Element |
| `attributionSkill` = Skill aus `elements.*.generatedPaths` | skill-chain-hooks, alle | das Element (oder die Elemente) des Skills |
| Subagent-`agentType` = Lane-Agent | orchestrator-agent | die Lane, Element unbekannt |
| Hauptthread ohne Skill, Top-Level-Skill, Orchestrator-Agent | alle | Eimer **Orchestrierung** |
| alles andere | – | Eimer **nicht zugeordnet** |

`nicht zugeordnet` wird immer ausgewiesen, nie verteilt. Ist der Eimer groß, fehlt eine
Konvention und nicht eine Rechenregel.

Daraus folgt eine **Namenskonvention** für generierte Dateien: Jeder `agent()`-Aufruf im
Workflow-Script und jeder `Agent`-Aufruf des Orchestrators beginnt `label`/`description` mit der
Element-ID, gefolgt vom Label wörtlich.

## Bausteine

1. **Ledger-Hook** (generiert): `.claude/hooks/<workflow>-cost-ledger.mjs`, registriert auf
   `SubagentStop` und `SessionEnd`. Liest das Transkript, dedupliziert je `requestId` und hängt
   rohe Usage-Zeilen an `.claude/runs/<workflow>/ledger.jsonl` an:
   `{sessionId, agentId, agentType, description, attributionSkill, requestId, model, usage}`.
   Keine Preise, keine Gruppierung, kein Netz. Die Zeilen überleben das Aufräumen der Transkripte
   (`cleanupPeriodDays`).
1a. **Kostenkarte** (generiert): `.claude/hooks/<workflow>-cost-map.json` neben dem Hook, nicht
   unter `.claude/runs/` (das ist per `.gitignore` ausgeschlossen). Rückverfolgung als
   `bpmn: {file, elements}`-Schlüssel im JSON selbst. Je Eintrag `{elementId, label, lane, phase}` plus die Schlüssel, unter denen
   das Element im Transkript auftaucht: Label-Präfix (Element-ID) und Skill-Namen aus
   `generatedPaths`. Dazu `workflow`, `pattern`, `generatorVersion` und die Namen des
   Top-Level-Skills bzw. Orchestrators (→ Eimer *Orchestrierung*). Eine gekürzte Laufzeitfassung
   der Rückverfolgung, ohne Logik.
2. **`cost-report`** (lanecraft, neuer Helper-Skill `bpmn2agent-cost`): liest Ledger **oder**
   direkt eine Session-ID bzw. einen Transkriptpfad, dazu `cost-map.json` (im Projekt der
   Nutzerin) oder ersatzweise `workflow-spec.yaml` (im Erzeuger-Repo). Wendet die
   Preistabelle an, ordnet nach der Tabelle oben zu und schreibt `cost.json` + `cost.md`:
   gruppiert nach Element, Lane, Phase und Modell, Tokens getrennt nach Art, Cache-Anteil sichtbar.
3. **Abgleich** (Teil von `cost-report`): die Summe der Teile gegen den Gesamtwert.
   - Tokens je Modell gegen `cost-state.modelUsage`: muss exakt passen.
   - Kosten gegen `totalCostUSD` bzw. `total_cost_usd` aus `claude -p --output-format json`:
     Abweichung über 1 % → Fehler mit Angabe, welcher Teil fehlt.
4. **Preistabelle** `prices.json`: je Modell Input, Output, Cache-Write 5m/1h, Cache-Read, dazu
   WebSearch je Anfrage. Mit `version`, `retrieved` und Quell-URL. Unbekanntes Modell → Fehler,
   kein Schätzwert.
5. **Mapping-Ansicht:** `render-mapping.mjs --cost cost.json` blendet je Element die Kosten ein
   (Badge plus Tooltip mit Tokens). Ohne `--cost` bleibt alles wie heute.
6. **Wiederholte Läufe:** `cost-bench` startet denselben Input N-mal headless (`claude -p`) in
   frischen Arbeitskopien, sammelt die Session-IDs und berichtet je Element Median, Min/Max und
   Interquartilsabstand.

## Verteilung: was mit dem Workflow kommt, was in lanecraft bleibt

Die Spec ist Review-Material und wird nie ins Projekt der Nutzerin kopiert. Damit Kosten dort
auswertbar sind, wo der Workflow läuft, gilt: **Der Payload trägt Daten, das Plugin die Logik.**

| Teil | liegt in | kommt zur Nutzerin über |
|---|---|---|
| Ledger-Hook | Payload `.claude/hooks/` | `cp -R generated/<workflow>/.claude/.` |
| `cost-map.json` | Payload `.claude/hooks/` | dieselbe Kopie |
| `cost-report`, Abgleich, `prices.json` | lanecraft-Plugin, Skill `bpmn2agent-cost` | Plugin-Installation |
| `cost-bench`, Mapping-Overlay | lanecraft-Plugin | nur im Erzeuger-Repo sinnvoll (braucht `generated/`) |

- **Ablauf für Nutzerinnen:** Workflow installieren, lanecraft-Plugin installieren, Workflow
  laufen lassen, danach `/bpmn2agent-cost` im selben Projekt.
- **Warum nicht alles in den Payload:** Jede Workflow-Kopie hätte eine eigene, veraltende
  Preistabelle, und ein Report-Skript ohne BPMN-Element verstieße gegen die Regel aus generate
  Schritt 4. Der Hook ist wie die Kontext-Hooks eine benannte Ausnahme; `cost-map.json` ist
  Daten, kein Skript.
- **Ohne lanecraft-Plugin** sammelt der Hook trotzdem. Der Ledger lässt sich später auswerten,
  auch in einem anderen Projekt.
- **Später:** Werden generierte Workflows als Plugins veröffentlicht (wie dark-factory), wandert
  der Hook in das `hooks.json` des Plugins und `cost-map.json` reist mit. Die Aufteilung bleibt
  gleich.

## Grenzen

- **Kosten außerhalb von Claude** fehlen: Gemini/NotebookLM über MCP, externe APIs aus Skripten.
  Der Bericht nennt die MCP-Aufrufe (`attributionMcpServer`) als Zählung, ohne Preis.
- **Menschliche Checkpoints** blockieren headless Läufe. `cost-bench` unterstützt in v1 nur Läufe
  ohne `userTask` auf dem Pfad (workflow-script) oder mit vorgegebenen Antworten im Input.
- **Erster Lauf ist teurer:** Cache-Writes fallen beim ersten Lauf an. Der Bericht zeigt Writes und
  Reads getrennt, `cost-bench` verwirft auf Wunsch den ersten Lauf.
- **Preise ändern sich:** Ein Bericht nennt immer die `prices.json`-Version, mit der er gerechnet
  wurde.

## Nicht in v1

- Budget-Abbruch über den Ledger-Hook (Exit 2 bei Überschreiten eines Phasenbudgets)
- OTel-Collector oder Dashboard; OTel bleibt eine dokumentierte Gegenprobe
- Änderungen am dark-factory-Beispiel (bleibt Snapshot); der Pilot wertet dessen Transkripte
  direkt aus
- Kosten je Tool-Aufruf innerhalb eines Elements

## Entscheidungen

- **Der Ledger-Hook wird immer generiert**, ohne Schalter in der Spec. Er ist billig, lokal und
  schreibt nur ins Projekt der Nutzerin.
- **Der generierte README empfiehlt, `.claude/runs/` per `.gitignore` auszuschließen.**
