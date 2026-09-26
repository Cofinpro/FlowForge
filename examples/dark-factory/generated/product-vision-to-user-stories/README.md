---
bpmn:
  file: product-vision-to-user-stories.bpmn
  elements: [Start_Geschaeftsidee, S0, Call_R1, SP1.1, SP1.2, Call_PG1, G-P1, Call_R2, SP2.1, SP2.2, Call_R3, SP3.1, Call_PG2, G-P2, SP4.1, SP4.2, Call_PG3, G-P3, SP5.1, SP56, G-Split, SP6.2, G-6.2, S7, End_StoryReady, End_IdeeVerworfen, SP_Budget]
---

# product-vision-to-user-stories: Dark Factory „Von der Produktvision zu User Stories & Akzeptanzkriterien“

Dieser Ordner enthält den ersten Baustein der Dark Factory. Er ist aus
`product-vision-to-user-stories.bpmn` und `docs/dark-factory/process-rules.md` generiert:
- die Agenten, einer pro Rolle
- die Skills, einer pro fachlichem Schritt, plus die wiederverwendbaren Prozesse Recherche, Kritiker, Panel und Phasen-Gate
- deterministische Skripte, Hooks und ein Workflow-Skript, das den BPMN-Ablauf steuert

Alles liegt unter `factory/generated/product-vision-to-user-stories/`. Ausgeliefert wird es als Plugin
`dark-factory` (siehe „Als Plugin nutzen“).

Generiert am 2026-09-25 · Muster: **workflow-script** · Quelle: `product-vision-to-user-stories.bpmn` (`282a184dbf2d…`)

> Dein Prozess läuft vollständig ohne Menschen, hat echte Parallelität (drei Recherche-Kanäle,
> Kritiker und Panel gleichzeitig) und Mehrfach-Instanzen („je Epic“, „je Story“, „je Persona“).
> Jede Raute routet nur auf dem Verdikt eines Gate-Records (pass / fail / pivot / more-research /
> no-go). Das eigentliche Urteil fällt vorher im Kritiker-Schritt. Deshalb baue ich das als
> automatisches Workflow-Skript, das jeden Schritt vom Agenten seiner Rolle ausführen lässt. Es läuft
> nur, wenn du es pro Idee bewusst startest; nichts passiert im Hintergrund.

Die vollständige Zuordnung jedes BPMN-Elements findest du in `mapping/report.md`. Die farbige
Klick-Ansicht ist `mapping/index.html`.

## Was generiert wurde

- **10 Agenten** (`agents/`):
  - `product-stratege`, `product-researcher`, `product-interviewer`, `product-ux`, `product-architekt`, `product-backlog-autor`, `product-qa`
  - `product-persona`: darf nur lesen
  - `product-kritiker`: `opus`, darf keine Artefakte schreiben
  - `product-traceability`: `haiku`

  Das Workflow-Skript ruft jeden Schritt mit dem Agenten seiner Rolle auf.
- **58 Skills** (`skills/`):
  - **`product-init`**: richtet das Zielprojekt vor dem ersten Run ein (`/dark-factory:product-init`, D-37).
  - **52 Schritt-Skills**, zum Beispiel `product-vision-statement-formulieren`, `product-opportunities-priorisieren`,
    `product-gherkin-formalisieren`. Jeder hat Vorlage (`assets/template.md`), Selbstcheck und
    notebook-zitiertes Fachwissen (`references/domain-knowledge.md`).
  - **`product-recherche`** (Prozess R): Routing, Deep Research, WebSearch, DuckDuckGo, Normalisierung, Synthese.
  - **`product-kritiker-pruefung`** (Prozess K): 41 Rubric-Seeds, Verdikt, Loop-Cap, Gate-Record.
  - **`product-panel-befragung`** (Prozess P): Interview, Walkthrough, Rating, Vote.
  - **`product-phasen-gate`** (Prozess PG): G-P1 bis G-P3 mit Pivot- und No-Go-Regeln.
  - **`product-traceability`**: Run-Buchhaltung und die drei Traceability-Skripte.
- **11 deterministische Skripte** für alle Schritte ohne LLM, zum Beispiel „Quellen normalisieren“,
  „Verdikt bilden & Loop-Cap anwenden“, „Gate-Record schreiben“, die Traceability-Prüfungen und
  `commit-artifact.mjs`, der einzige Schreiber der Artefakt-Metadaten (siehe „Ablage der Artefakte“).
- **3 Hooks** (`hooks/`) — **nur Claude Code**:
  - `product-research-budget-guard`: blockiert Deep Research ab dem 4. Aufruf pro Run und jede Recherche,
    wenn das Budget erschöpft ist.
  - `product-critic-readonly-guard`: Kritiker und Persona schreiben keine Artefakte.
  - `product-artifact-contract-guard`: Agenten schreiben nur Markdown-Bodies. Sidecars (`*.meta.json`),
    `run.json`, `history/` und die von Skripten erzeugten Records sind für Agenten gesperrt.
- **Workflow-Skript** `product-vision-to-user-stories.workflow.mjs` — **nur Claude Code**, siehe unten.
- **Wissen** (`knowledge/`): vier zitierte Phasen-Briefs aus dem Notebook „The Product - Business Design“.

## Als Plugin nutzen (D-35)

Die Fabrik wird als Claude-Code-Plugin **`dark-factory`** ausgeliefert, nicht mehr in `.claude/`
kopiert. `regenerate.sh` baut es mit `factory/tools/dark-factory-gen/build-plugin.mjs` nach
`plugins/dark-factory/`. Das Factory-Repo ist zugleich ein lokaler Marketplace
(`.claude-plugin/marketplace.json`). Nichts davon wird hochgeladen.

**In einem Zielprojekt aktivieren** (einmal pro Rechner):

```bash
claude plugin marketplace add /pfad/zu/ai-sdlc-dojo-2026-factory
claude plugin install dark-factory@dark-factory --scope project
```

Oder direkt in der `.claude/settings.json` des Zielprojekts, dann bekommt es jeder, der das Repo
klont und die Fabrik am selben Pfad liegen hat:

```json
{
  "extraKnownMarketplaces": {
    "dark-factory": { "source": { "source": "directory", "path": "/pfad/zu/ai-sdlc-dojo-2026-factory" } }
  },
  "enabledPlugins": { "dark-factory@dark-factory": true }
}
```

**Nur ausprobieren**, ohne etwas zu installieren: `claude --plugin-dir /pfad/zu/ai-sdlc-dojo-2026-factory/plugins/dark-factory`.
Als Datei weitergeben: `bash factory/tools/dark-factory-gen/regenerate.sh --zip` schreibt
`dist/dark-factory-<version>.zip`, das geht ebenfalls mit `--plugin-dir`.

**Aktualisieren:** Claude Code lädt ein installiertes Plugin aus seinem Cache
(`~/.claude/plugins/cache/dark-factory/dark-factory/<version>/`), nicht aus `plugins/dark-factory/`.
Nach einer Änderung `VERSION` in `build-plugin.mjs` erhöhen, `regenerate.sh` laufen lassen und im
Zielprojekt `claude plugin marketplace update dark-factory` und
`claude plugin update dark-factory@dark-factory --scope project` ausführen, dann `/reload-plugins`
oder eine neue Sitzung. Mit `--plugin-dir` reicht `/reload-plugins`.

Im Plugin:
- Skills und Agenten tragen den Plugin-Namen als Präfix: `dark-factory:product-architekt`. Das
  Workflow-Skript ruft die Rollen so auf.
- Skripte werden über `${CLAUDE_PLUGIN_ROOT}/skills/<skill>/scripts/…` aufgerufen; Claude Code setzt
  den Pfad beim Laden eines Skills ein.
- Die Hooks stehen in `hooks/hooks.json` des Plugins (aus den Fragmenten `hooks/*.hook.settings.json`)
  und sind aktiv, sobald das Plugin aktiv ist. Ohne laufenden Run (`runs/.active`) tun sie nichts.
- `knowledge/process-rules.md` ist eine Kopie von `docs/dark-factory/process-rules.md`, damit die
  Regeln auch in fremden Repos da sind. Das BPMN liegt im Plugin-Root (Hash in `run.json`).

**Zielprojekt (D-32, D-33, D-37):** Das Repo, in dem du Claude startest und das Plugin aktiv ist, ist das
Zielprojekt. Runs landen in dessen `runs/`. Richte es vor dem ersten Run mit **`/dark-factory:product-init`**
ein: Der Skill liest den Stack aus dem Repo (`package.json`, `pom.xml`, `Dockerfile`, Terraform, …),
schlägt `platform` (Architektur, Stack) vor, fragt einmal nach und schreibt `.dark-factory/project.json`
samt `runs/` in `.gitignore`. Bei einem leeren Repo fragt er nach der geplanten Zielarchitektur.
Ohne Init legt der erste Run ein Manifest mit leerem `platform` an (`run-state.mjs init --ensure-project`),
und Schritt 0 muss die Zielarchitektur raten. `publishDir` (Default `docs/product`) ist der Ort, an den
S7 die Ergebnisse veröffentlicht. Das Manifest gehört eingecheckt.

Die Skripte brauchen nur `js-yaml`. Das wird beim ersten Aufruf automatisch in
`~/.cache/bpmn-authoring-tools` installiert, nicht ins Repo. Mit `DF_TOOLS_CACHE` kannst du einen
anderen Ort wählen.

**Codex oder andere Runtimes:** Die Skills sind runtime-neutral geschrieben. **Agenten, Hooks und das
Workflow-Skript gibt es nur in Claude Code.**

### Workflow-Skript (nur Claude Code)

Das Plugin bringt das Skript als Workflow `workflows/product-vision-to-user-stories.js` mit. Es wird
**nie automatisch** ausgeführt, auch nicht von dieser Pipeline. Du startest es bewusst pro Idee im
Zielprojekt, zum Beispiel: `/dark-factory:product-vision-to-user-stories` mit
args `{"runId": "2026-09-25_meal-planner_a7f3", "idea": "…"}`. Den Fortschritt zeigt `/workflows`.

- **args:**
  - `runId` (Pflicht)
  - `idea` (1–3 Sätze), `ideaFile` (Pfad zu einem Idee-Brief) oder `ideaDir` (Ordner mit Brief und
    Material wie eigener Vorrecherche; wird nach `runs/<runId>/input/` kopiert). Welche Datei der Brief ist,
    sagt `brief` (Dateiname im Ordner); ohne `brief` nimmt init die eine `.md` mit Präfix `00` oder „brief“
    im Namen. Eigene Zitate im Material zählen nicht als Evidenz, die Fabrik prüft sie selbst nach.
  - optional `language` (Default `de`), `maxLoops` (3), `budgetReserve` (60000 Tokens)
- **Budget:** Mit einer Token-Vorgabe wie „+2M“ in deiner Nachricht prüft das Skript vor jedem
  Schritt das Restbudget. Ist es erschöpft, schreibt es Teilergebnis und `REPORT.md` mit
  `status: partial`. Das ersetzt das Event-Sub-Prozess „Budget erschoepft“.
- **Wiederaufsetzen:** mit `resumeFromRunId` und denselben args. Fertige Schritte kommen dann aus
  dem Cache. Zusätzlich zeigt `runs/<runId>/run.json`, wo der Run steht.
- **Ergebnis:**
  - `runs/<runId>/REPORT.md`: der einzige Ort, an dem ein Mensch nachsehen muss
  - `runs/<runId>/backlog/backlog.json`
  - `runs/<runId>/backlog/traceability.md`
  - veröffentlicht nach `docs/product/` (bzw. `publishDir`): Report, Backlog, Glossar, Strategie-,
    Nutzer- und Story-Map-Artefakte, mit `runId` in `.published.json` (D-34). Nur bei vollständigem
    Run und nur, wenn das Manifest existiert. Diesen Ordner eincheckst du.
- **Kosten:** Ein vollständiger Run umfasst je nach Zahl der Epics und Stories mehrere hundert
  Agent-Aufrufe. Der erste Test sollte eine kleine Idee mit Budget-Vorgabe sein.

## Ablage der Artefakte (Gedächtnis §11.2)

Jedes Artefakt im Run besteht aus zwei Dateien:

| Datei | Inhalt | Wer schreibt |
|---|---|---|
| `<name>.md` | Fachlicher Inhalt, oben ein **read-only** Frontmatter zum Lesen (id, version, status, gate, evidence, items) | Body: der Agent. Frontmatter: gerendert vom Skript |
| `<name>.meta.json` | Die Metadaten, maßgeblich für alle Skripte (Schema `df.artifact/v1`) | nur `commit-artifact.mjs` bzw. die df-Skripte |

- Der Agent liefert nur, was nur er wissen kann: `itemIndex`, `sources`, `riskFlags`, `attributes`,
  `openQuestions`, `notesForNext` (der „authored“-Block).
- Das Skript berechnet den Rest: id, version, status, runId, producedBy, derivedFrom mit Version und
  Hash, Evidenzmix, Item-Liste, Historie unter `history/<id>/v<n>.*`.
- Gate-Records (`gates/G-*.meta.json`), Quellen (`research/sources/SRC-*.meta.json`), Transkripte und
  Traceability-Ergebnisse sind reine Records: JSON ist die Quelle, das Markdown wird daraus erzeugt.
- **Stories und Spikes** sind ebenfalls Records (`df.story/v1`, `df.spike/v1`, Gedächtnis §11.3).
  Agenten legen sie mit `story.mjs` bzw. `spike.mjs put` an und ändern sie mit `patch`.
  `backlog/stories/ST-*.md`, `backlog/spikes/SPK-*.md` und `backlog/backlog.json` (von `export-backlog.mjs`)
  werden daraus erzeugt.
- `run.json` (vorher `run.yaml`) hält den Run-Zustand.

## Entscheidungen aus dem Interview (2026-09-25)

- **„Budget erschoepft“** (Event-Sub-Prozess, in v1 nicht generierbar): akzeptiert als Budget-Check
  im Workflow plus Deep-Research-Hook. Im Mapping ist das Element grau.
- **Notebook-Ergänzungen übernommen**, ohne das BPMN zu ändern:
  - Problem-Ranking im Interview (Kill-Signal für G-P2)
  - OMTM mit AARRR in 1.2.1
  - Opportunity-Scoring nach Ulwick in 2.2.5
- **Nicht übernommen** (Kandidat für eine spätere BPMN-Revision): Qualitäts-Pyramide und
  Zone-of-Control-Check schon in 5.1.
- **Modelle:** Kritiker auf `opus`, Traceability auf `haiku`, alle anderen Rollen auf dem
  Session-Modell. Weil Kritiker und Produzent dieselbe Modellfamilie nutzen (Gedächtnis §5),
  bekommt jeder Gate-Record das Risiko-Flag `same-model-review`.

## Offene Punkte

Die offenen Fragen aus dem Interview sind alle beantwortet. Folgende Punkte haben die generierenden
Agenten selbst festgelegt. Bitte prüfe sie:

1. **Formel für „Impacts nach Hebel & Risiko priorisieren“ (1.2.5):**
   `Priorität = L × (6 − R)`. L ist der Hebel auf die OMTM. R ist das höchste Risiko der verknüpften
   Annahmen, berechnet als `round((Importance + 6 − Evidence) / 2)`. Weder das Gedächtnis noch die
   Quellen geben eine Formel vor.
2. **GAIN-Items in „Pains & Gains extrahieren“ (2.2.2):** Das BPMN deklariert nur `itemPrefix="PAIN"`,
   das Gedächtnis §10.1 aber PAIN und GAIN. Die Skills erzeugen beide. Das BPMN könnte das
   nachziehen.
3. **„Low-Fi-Wireframe & Domaenenmodell anhaengen“ (5.2.3)** listet nur Begriffskandidaten. Die
   TERM-IDs vergibt erst 6.2.3, weil `wireframe-text` im BPMN kein `itemPrefix` hat.
4. **`gap-dependency-list` (4.1.5)** hat im BPMN keinen Konsumenten. Die Lücken gehen als
   Change-Requests an den 4.1-Kritiker.
5. **`mvp-candidate`** steht im Bundle „Artefakt 6“, aber kein Schritt deklariert es als Output. Es
   ist deshalb ein Abschnitt `## MVP candidate` in der Story-Map von 4.2.5.
6. **Rubrics sind Seeds.** Sie bestehen aus den §13-Kernkriterien plus den Notebook-Kriterien. Die
   vollständige Extraktion mit Kalibrierungsbeispielen steht noch aus (docs/dark-factory/roadmap.md §2).
7. **Nicht live getestet.** Das Workflow-Skript ist syntaktisch geprüft, alle Skripte und Hooks sind
   mit einem Test-Run geprüft. Ein echter Ende-zu-Ende-Run mit Agenten wurde noch nicht gestartet.
   Offen bleibt unter anderem, ob der Hook-Payload bei dir `agent_type` für Subagenten liefert. Davon
   hängt `product-critic-readonly-guard` ab.

## Mapping-Ansicht neu rendern

```bash
node .agents/skills/bpmn2agent-generate/scripts/render-mapping.mjs \
  "${BPMN_TOOLS_CACHE:-$HOME/.cache/bpmn-authoring-tools}" \
  factory/generated/product-vision-to-user-stories/workflow-spec.yaml factory/product-vision-to-user-stories.bpmn \
  factory/generated/product-vision-to-user-stories/mapping
```

## Neu generieren

Wenn sich `product-vision-to-user-stories.bpmn` ändert, starte `bpmn-to-agentic-workflow` erneut.
Die Analyse vergleicht Element für Element und fragt nur nach, was neu oder geändert ist. Danach
baut `bash factory/tools/dark-factory-gen/regenerate.sh` das Plugin neu; Zielprojekte sehen die Änderung nach
`/reload-plugins`.
