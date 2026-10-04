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

## Offen für T8 (braucht einen echten Lauf)

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
