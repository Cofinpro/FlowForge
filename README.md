# bpmn2agent

Aus einem handgezeichneten BPMN-2.0-Prozess einen prüfbaren Satz Claude-Code-Artefakte machen:
Agenten, Skills, Hooks, Skripte und einen Orchestrator (Skill-Kette, Workflow-Skript oder
Orchestrator-Agent), jede Datei mit Rückverfolgung auf ihr BPMN-Element.

Das ist eine eigenständige Idee. Wer Agenten und Skills normal von Hand schreibt, braucht dieses Repo
nicht. Die Dark Factory im Repo `ai-sdlc-dojo-2026-factory` ist einmal mit dieser Pipeline entstanden
und wird seitdem ohne sie gepflegt.

Wie die Teile zusammenspielen, steht in [`ARCHITECTURE.md`](ARCHITECTURE.md).

## Inhalt

```text
.agents/skills/                       # die Skills (echte Dateien); .claude/skills/<name> sind Symlinks
  bpmn-authoring                      #   BPMN von Hand schreiben: XSD, bpmn-moddle, bpmnlint, Layout
  bpmn-to-agentic-workflow            #   Einstieg: führt die Pipeline Ende-zu-Ende
  bpmn2agent-analyze                  #   1. BPMN inventarisieren, Lücken erfragen → workflow-spec.yaml
  bpmn2agent-knowledge                #   2. Fachwissen erden (NotebookLM, Web, sonst "unverified")
  bpmn2agent-design                   #   3. Mapping + Muster wählen, vom Fachanwender bestätigen lassen
  bpmn2agent-generate                 #   4. Dateien schreiben (nur nach generated/<workflow>/)
  bpmn2agent-verify                   #   5. statisch prüfen: Schema, Hash, Trace in beide Richtungen, Lint
  agentic-workflow-kb                 #   Wissensbasis Agentic Design: FAQ + Referenzen mit Belegstellen
  orchestration-design                #   Hilfe für 3.: Orchestrierung prüfen (Übergaben, Prüfpunkte, Schleifen)
  agent-authoring                     #   Hilfe für 3./4.: Agenten schneiden, schreiben, reviewen
  skill-authoring                     #   Hilfe für 4.: Skills schreiben und reviewen
  trim-the-fat                        #   Skills kürzen, ohne ihr Verhalten zu ändern (nur per /trim-the-fat)
.agents/agents/                       # Agenten (echte Dateien); .claude/agents/<name>.md sind Symlinks
  agentic-kb-librarian                #   beantwortet Designfragen aus der Wissensbasis, fragt sonst das Notebook
  agentic-workflow-architect          #   prüft den Spec-Entwurf vor dem Mapping-Plan (nur lesend)
  agentic-artifact-reviewer           #   prüft erzeugte Skills/Agenten auf Qualität (nur lesend)
examples/dark-factory/                # Fallbeispiel: "Von der Produktvision zu User Stories"
  product-vision-to-user-stories.bpmn #   der Prozess mit sdlc:*-Annotationen
  docs/process-rules.md               #   Kopie der Prozessregeln (Stand 2026-09-26)
  generated/product-vision-to-user-stories/  # Ergebnis der Pipeline (Schnappschuss)
  tools/dark-factory-gen/             #   Generator-Quellen + regenerate.sh (reproduziert generated/)
examples/user-story-refinement/       # zweites Beispiel: neue User Story aus Feedback erstellen & verfeinern
  user-story-refinement.bpmn          #   ein Diagramm, 4 Lanes, 6 Phasen, noch nicht durch die Pipeline
  notebook-faq/                       #   die Notebook-Frage hinter dem Diagramm, mit Belegstellen
```

## Wissensbasis und FAQ

`agentic-workflow-kb` enthält das Wissen aus dem NotebookLM-Notebook **„Agentic Workflows“**
(11 Quellen: O'Reilly-Bücher zu Agenten, Claude-Doku zu Skills und Kontextfenstern, Leitfäden zu
Claude-Code-Workflows) offline:

- `faq/` – jede Frage, die dem Notebook gestellt wurde, mit wörtlicher Antwort und einer Tabelle,
  die jede Belegnummer auf Quelle und zitierte Textstelle auflöst. `faq/README.md` ist der Index.
- `references/` – kurze, destillierte Leitlinien je Thema; jede Aussage trägt einen Verweis wie
  `[agent-design-1: 3, 5]` (FAQ-Eintrag, Belegnummern).

Vor einer neuen Notebook-Frage zuerst im FAQ nachsehen. Neue Antworten mit
`.agents/skills/bpmn2agent-knowledge/scripts/notebook-faq.py add` aufnehmen, dann findet sie der
nächste Lauf. `bpmn2agent-knowledge` legt nach demselben Muster je Workflow ein FAQ unter
`generated/<workflow>/knowledge/faq/` an.

## Nutzen

Die Pipeline-Skills schreiben relativ zum aktuellen Verzeichnis nach `generated/<workflow>/`. Starte
Claude Code deshalb in dem Ordner, in dem das `.bpmn` liegt, und rufe `bpmn-to-agentic-workflow` auf.

In einem anderen Projekt als Plugin installieren (das Repo ist Plugin und Marketplace zugleich):

```text
/plugin marketplace add Cofinpro/lanecraft
/plugin install lanecraft@lanecraft
```

Skills und Agenten heißen dann `lanecraft:<name>`, z. B. `/lanecraft:bpmn-to-agentic-workflow`. Lokal
ausprobieren ohne Installation: `claude --plugin-dir <pfad-zu-lanecraft>`.

Hinweis: Im installierten Plugin ist die Wissensbasis schreibgeschützt. Neue Notebook-Antworten nimmt
`agentic-kb-librarian` nur in einem Checkout dieses Repos ins FAQ auf.

## Plugin und Release

Das Plugin braucht keinen Build: `.claude-plugin/plugin.json` zeigt direkt auf `.agents/skills/` und
`.agents/agents/`, `.claude-plugin/marketplace.json` veröffentlicht das Repo-Root als Plugin. Pfade
zwischen Skills stehen als `${CLAUDE_SKILL_DIR}/../<skill>/…` und funktionieren so im Repo wie im
installierten Plugin. Agenten laden die Skills, die sie brauchen, über `skills:` im Frontmatter.

```bash
npm install          # Dev-Tools (release-it, commitlint, husky) nach node_modules/ (ignoriert),
                     # richtet den commit-msg-Hook ein
npm run validate     # claude plugin validate .
```

Commit-Nachrichten folgen den [Conventional Commits](https://www.conventionalcommits.org/)
(`feat: …`, `fix: …`, `docs: …`, `chore: …`); der `commit-msg`-Hook (husky + commitlint) lehnt
andere ab. Daraus leitet release-it die Version ab (`feat:` → minor, `fix:` → patch,
`feat!:`/`BREAKING CHANGE:` → major) und schreibt `CHANGELOG.md`.

GitHub Actions:

- `CI` (`.github/workflows/ci.yml`) – bei jedem Push auf `main` und jedem PR: Plugin validieren, bei
  PRs zusätzlich alle Commit-Nachrichten prüfen.
- `Release` (`.github/workflows/release.yml`) – von Hand unter *Actions → Release → Run workflow*,
  nur auf `main`. Wahl der Erhöhung (`auto` aus den Commits, oder `patch`/`minor`/`major`) und
  Probelauf. Setzt die Version in `plugin.json` + `package.json`, schreibt `CHANGELOG.md`,
  committet, taggt `vX.Y.Z`, pusht und legt das GitHub-Release an.

Nutzer bekommen Updates nur, wenn die Version in `plugin.json` steigt, also jede Auslieferung über
den Release-Workflow (lokal geht auch `npm run release`).

## Fallbeispiel neu erzeugen

```bash
bash examples/dark-factory/tools/dark-factory-gen/regenerate.sh
```

Muss mit `RESULT: PASS`, `no reference problems`, `smoke test ok`, `story smoke ok`,
`research smoke ok` und `mapping view ok` enden. Details: `examples/dark-factory/tools/dark-factory-gen/README.md`.

## Voraussetzungen

`node`, `python3`, `xmllint`. Die npm-Tools (`bpmn-moddle`, `bpmnlint`, `js-yaml`, `ajv`) liegen in
`~/.cache/bpmn-authoring-tools` (`BPMN_TOOLS_CACHE`), nie im Repo. Die Skripte installieren sie dort
beim ersten Lauf.
