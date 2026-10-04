# T0: Befunde zur Kostenmessung

Stand 2026-10-04. Ausgewertet wurden die vorhandenen Transkripte unter `~/.claude/projects/` (125
Sessions mit `cost-state`), darunter fünf echte Läufe des generierten Workflows
`presentation-storyline` (SlideGen, Muster orchestrator-agent). Es wurde **kein** neuer Lauf
bezahlt. Zwei Fragen bleiben für den Ende-zu-Ende-Test (T8) offen, siehe unten.

## Beantwortete Fragen

| Frage | Befund |
|---|---|
| Landen Subagents unter `<session>/subagents/`? | **Ja.** `agent-<id>.jsonl` + `agent-<id>.meta.json`. Auch die Lane-Agents der SlideGen-Läufe (`agentType: presentation-storyline-<rolle>`). |
| Was steht in `meta.json`? | `agentType`, `description`, `toolUseId`, `spawnDepth`, teils `model`, `parentAgentId` (verschachtelte Agents), `requestShape` (foreground/background). `description` ist der Text, den der Aufrufer als Beschreibung mitgibt, bei SlideGen z. B. `4.3 Moderation z1r3`. |
| Trägt jede Antwort `usage`? | **Ja**, `message.usage` mit `input_tokens`, `output_tokens`, `cache_read_input_tokens`, `cache_creation_input_tokens` und `cache_creation.{ephemeral_5m,ephemeral_1h}_input_tokens`, dazu `message.model` und `requestId`. |
| Ist `output_tokens` überall endgültig? | **Nein.** Eine API-Antwort steht in mehreren Zeilen (eine je Content-Block). Nur die **letzte** Zeile mit `stop_reason` trägt die endgültige Ausgabe; frühere haben Zwischenstände (z. B. 2 statt 587). Die Regel lautet daher: je `requestId` die Zeile mit der höchsten `output_tokens`, nicht die erste. |
| Stimmen die Summen mit `cost-state.modelUsage`? | **Ja, exakt** für alle Modelle, die im Transkript vorkommen, wenn Hauptthread und alle Subagents summiert werden. In 39 von 39 token-gleichen Modell-Sessions stimmte auch `costUSD` auf den Cent. |
| Gilt das für alle Sessions? | **Nein.** Wo eine Session fortgesetzt, geleert oder verzweigt wurde, deckt `cost-state` mehr ab als das eine Transkript (125 Sessions, nur ein Teil token-gleich). Der Abgleich gilt je Session und muss die Lücke ausweisen, nicht verstecken. |
| Fehlt etwas im Transkript? | **Ja: Hilfsaufrufe.** In `cost-state` steht ein Haiku-Eintrag (z. B. 251 885 Input-Tokens, 13 `webSearchRequests`), der in keinem Transkript vorkommt. Das sind interne Aufrufe (WebSearch-Hilfsmodell u. ä.). Sie sind die Differenz `cost-state − Transkriptsummen` und werden als eigener Eimer **Hilfsaufrufe** ausgewiesen. |
| Tragen Subagent-Zeilen `attributionSkill`? | **Nein** (421 von 421 Zeilen leer in den SlideGen-Läufen). `attributionSkill` kommt nur im Hauptthread vor (und dort nur, wenn ein Skill aktiv ist). Im Muster orchestrator-agent ordnet also `agentType` + `description` zu, nicht der Skill. |
| Preise | Die Tabelle aus dem `claude-api`-Skill (Input/Output) mit Cache-Lesen 0,1× (Opus 5.5: 0,05×), Cache-Schreiben 5 min 1,25× und 1 h 2× des Input-Preises reproduziert `costUSD` für `claude-opus-5-5`, `claude-opus-5`, `claude-sonnet-5`, `claude-sonnet-5-5` und `claude-haiku-4-5` (siehe `prices.json`). |

## Reihenuntersuchung über alle lokalen Sessions

Der Bericht lief über alle 137 Transkripte dieser Maschine (125 mit `cost-state`), mit leerer
Kostenkarte: 37 stimmen ohne Hinweis, 88 mit Warnung, **0 Fehler, 0 Abstürze**. Zwei Annahmen aus dem
ersten Entwurf haben echte Daten widerlegt und wurden korrigiert:

- **Synthetische Zeilen** (`model: <synthetic>`, API-Fehlertexte, „No response requested“) tragen
  keine `requestId` und keine Kosten. Sie werden übersprungen, bevor die `requestId` verlangt wird
  (13 Abstürze vorher).
- **`cost-state` hinter dem Transkript** kommt vor: `startTime` ist der Start des *Prozesses*; wer
  eine Session fortsetzt, hat im Transkript die frühere Arbeit, `cost-state` zählt sie nicht (oder nur
  einen älteren Zwischenstand). „Mehr Tokens im Transkript als in `cost-state`“ ist deshalb kein
  Zuordnungsfehler.

## Folgen für den Plan

- **Abgleich:** `cost-state` ist nur dann der harte Maßstab, wenn es Token für Token passt (ein
  durchgehender Prozess, etwa `claude -p`). Dann muss auch der Preis aufgehen (sonst ist
  `prices.json` veraltet: Fehler). Was nur in `cost-state` steht, ist der Eimer *Hilfsaufrufe*. Steht
  `cost-state` **hinter** dem Transkript, ist das eine Warnung, kein Fehler (siehe Reihenuntersuchung);
  die Transkriptsumme gilt, die Gesamtsumme ist immer Transkripte + Hilfsaufrufe. Namen mit
  Kontextvariante (`claude-opus-5-5[1m]`) werden je bepreistem Modell zusammengezählt.
- **Dedupe:** je `requestId` die Zeile mit den meisten `output_tokens`; Zeilen ohne `stop_reason` in
  der Endzeile gelten als unvollständig und werden gezählt und gemeldet.
- **Hook:** Er soll nicht von Feldern des Hook-Payloads abhängen. Er liest nur `transcript_path`,
  leitet daraus das Sitzungsverzeichnis ab und hängt alle noch nicht erfassten, abgeschlossenen
  `requestId`s an. Das ist idempotent und gilt für `SubagentStop`, `Stop` und `SessionEnd`.
- **Zuordnung im Muster orchestrator-agent:** über `description` (Element-ID als Präfix, T2) und
  `agentType` (Lane). `attributionSkill` bleibt für den Hauptthread und das Muster skill-chain-hooks.
- **Kostenkarte:** Mehrere Elemente teilen sich einen Skill-Ordner (der Top-Level-Skill steht in den
  `generatedPaths` aller Orchestrator- und Checkpoint-Elemente). Die Karte führt deshalb je Skill die
  **Liste** der Elemente; der Report ordnet dem Element zu, wenn die Liste genau eines enthält, sonst
  dem Skill.
- **`cost-report` braucht die Spec nicht:** Er liest nur die Kostenkarte. Im Erzeuger-Repo liegt sie
  unter `generated/<workflow>/.claude/hooks/<workflow>-cost-map.json`.

## Pilotlauf mit dem Workflow-Tool (dark-factory, 2026-10-04)

Ein echter Lauf von `product-vision-to-user-stories` im Factory-Repo (`agentCap: 14`, 15 Agents,
Gesamtkosten 10,02 USD), mit Kostenprotokoll-Hook, einem Hook, der die Payloads mitschreibt, und
OpenTelemetry in eine lokale Senke. Die drei offenen Fragen sind beantwortet; zwei Annahmen waren
falsch und wurden korrigiert.

| Frage | Befund |
|---|---|
| Hook-Payload | `SubagentStop`: `agent_id`, `agent_type`, `agent_transcript_path`, `transcript_path` (**Hauptthread**), `session_id`, `cwd`, `permission_mode`, `prompt_id`, `effort`, `stop_hook_active`, `background_tasks`, `session_crons`, `scratchpad_dir`. `Stop`: dazu `last_assistant_message`. `SessionEnd`: `reason` (`prompt_input_exit`, `clear`), `session_id`, `transcript_path`. **Keine Token- oder Kostenfelder.** Der Hook braucht weiterhin nur `transcript_path`. |
| Feuert `SubagentStop` für Workflow-Agents? | **Ja**, 15 Ereignisse für 15 Agents. |
| Wo liegen die Transkripte der Workflow-Agents? | **Tiefer als gedacht:** `<session>/subagents/workflows/<workflowRun>/agent-<id>.jsonl` (+ `.meta.json`, `journal.jsonl`), daneben `<session>/workflows/<workflowRun>.json`. Leser und Hook scannten nur `subagents/*.jsonl` und fanden 0 von 15 Agents (0,16 von 10,02 USD). Beide scannen jetzt jede Tiefe. |
| Ist das Label die `description`? | **Ja**, und `meta.json` trägt zusätzlich `workflowPhase` (der `phase()`-Titel). Phase und Element kommen damit aus dem Transkript, nicht aus der Spec. 15 von 15 Labels beginnen mit einer Element-ID; zwei Formen kamen vor, die der Plan nicht kannte: zusammengesetzte IDs `Call_R1/R_4` (innerer Schritt einer Call Activity, gilt der Teil nach `/`) und Elemente, die die Spec als `hook` oder `orchestrator` führt, die die Fabrik aber als Agent ausführt (die Karte führt jetzt alle ausführbaren Elemente). |
| OpenTelemetry-Gegenprobe | `claude_code.cost.usage` summiert auf **10,0193 USD**, also exakt `cost-state` und die Summe des Berichts. Die `api_request`-Ereignisse tragen dieselbe `request_id` wie die Transkriptzeilen, dazu exakte Tokens und `cost_usd`. `agent.name` kam mit `OTEL_LOG_TOOL_DETAILS=1` im Klartext. |

**Korrigierte Annahme: Ausgabe-Tokens der Workflow-Agents.** Im Transkript eines Workflow-Agents trägt
die Zeile einer Anfrage nur den Zwischenstand der Ausgabe (16 statt 365 Tokens, kein `stop_reason`),
der Endwert wird nie nachgetragen. Von 168 Anfragen waren nur 34 vollständig. Eingabe- und
Cache-Tokens stimmen dagegen bei allen 168 exakt mit OpenTelemetry überein. Der Rest (1,26 USD) sind 52
Hilfsaufrufe (`web_search_tool`, `web_fetch_apply`), die in keinem Transkript stehen. Zwei Wege, das zu
schließen:

- **Mit Telemetrie (exakt):** `cost-report.mjs --otel` ersetzt je `request_id` die Ausgabe und führt die
  Hilfsaufrufe als eigene Zeilen. Summe 10,0193 USD, nichts geschätzt.
- **Ohne Telemetrie (geschätzt, gekennzeichnet):** Stimmen Eingabe und Cache je Modell exakt mit
  `cost-state` überein, ist die fehlende Ausgabe in der Summe exakt bekannt. Sie wird nach Textlänge auf
  die unvollständigen Anfragen verteilt. Am Pilot: Gesamtsumme exakt, je Element eine Abweichung von
  zusammen 1,8 % der Kosten (größter Einzelfehler 0,05 USD bei einem Element mit 0,67 USD). Stimmen die
  Tokens nicht überein (fortgesetzte Session), gibt es keine Schätzung, nur eine Untergrenze mit Hinweis.

Nicht brauchbar: `totalTokens` und `tokens` in `workflows/<run>.json` entsprechen keiner Kombination
aus Eingabe, Cache und Ausgabe.

**Was der Lauf gekostet hat** (exakt): Phase *0 Idee-Brief & DR-01* 6,90 USD, davon der Schritt
„Claims extrahieren & Abdeckung prüfen“ (`R_3b`) allein 2,76 USD (27 % des Laufs); Lane *Researcher*
6,24 USD; Hilfsaufrufe 1,26 USD.

## Früher offen (jetzt beantwortet)

1. **Hook-Payload:** Welche Felder `SubagentStop`, `Stop` und `SessionEnd` tatsächlich liefern und
   ob `SubagentStop` auch für Agents aus dem Workflow-Tool feuert. Der Hook ist so gebaut, dass er
   nur `transcript_path` braucht.
2. **Workflow-Tool:** Ob dessen Agents (`agent({ agentType, label })`) unter `subagents/` landen und
   `label` in `description` steht. Die SlideGen-Läufe nutzen das Muster orchestrator-agent, nicht das
   Workflow-Tool; dort wurde das Label als `description` übernommen, aber das Workflow-Tool selbst
   ist damit nicht belegt.

`cost-state` steht einmal je Session im Hauptthread-Transkript. Wann es geschrieben wird (Ende,
Fortsetzen), ist nicht belegt; der Hook liest es, wenn vorhanden, und `cost-report` meldet, wenn es
fehlt.
