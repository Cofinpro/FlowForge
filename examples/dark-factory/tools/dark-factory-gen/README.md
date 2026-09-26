# dark-factory-gen: Generator-Quellen der Dark Factory

Mit diesen Quellen entstand am 2026-09-25 `examples/dark-factory/generated/product-vision-to-user-stories/`,
im Lauf der Pipeline `bpmn-to-agentic-workflow`. Aus diesem Stand wurde das Plugin `dark-factory` gebaut.
Seit 2026-09-26 wird das Plugin im Repo `ai-sdlc-dojo-2026-factory` (`plugins/dark-factory/`) von Hand
gepflegt; `generated/` hier ist ein Schnappschuss und wird nicht mehr dorthin übertragen.

## Neu erzeugen

```bash
bash examples/dark-factory/tools/dark-factory-gen/regenerate.sh
```

Das Skript läuft in 7 Schritten (vom Repo-Root oder von überall):
1. BPMN validieren
2. Inventar und `sdlc:`-Extraktion nach `.build/` schreiben
3. `workflow-spec.yaml` erzeugen
4. 52 Schritt-Skills, 41 Rubrics und 10 Agenten generieren
5. Workflow-Skript zusammensetzen und prüfen
6. Mapping-Report schreiben und rendern
7. `bpmn2agent-verify`, Referenzprüfung, Rauchtests und die Browser-Prüfung der Mapping-Ansicht
   (`check-mapping-view.mjs`, braucht Internet für das bpmn-js-CDN) ausführen

Voraussetzungen: `node`, `python3` und `xmllint`. Die npm-Tools (`bpmn-moddle`, `bpmnlint`,
`js-yaml`, `ajv`, `playwright`) liegen in `~/.cache/bpmn-authoring-tools`. Die Skripte der
`bpmn-authoring`/`bpmn2agent-*`-Skills (`.agents/skills/`) installieren sie dort beim ersten Lauf.

## Dateien

| Datei | Rolle |
|---|---|
| `steps.mjs` | Element-ID → Skill-Name, Run-Ordner, Wissensdatei; Pfadmuster der Artefakte; Artefakt-Vertrag (`META`: Sidecar-Felder, wer sie schreibt) und Zusatztypen (`AUX_TYPES`, z. B. `epic`) |
| `build-spec.mjs` | Die **bestätigten Design-Entscheidungen**: Kind und Pfade je Element, Rollen, Modelle, Muster, offene Fragen und ihre Antworten → `workflow-spec.yaml` |
| `rubrics.mjs` | Rubric-Seeds (Gedächtnis §13 plus übernommene Notebook-Kriterien) |
| `content/phase-*.json` | Fachinhalt der 52 Schritt-Skills (Procedure, Self-Check, Pitfalls, Template-Abschnitte, zitiertes Fachwissen). Wurde von vier Agenten nach `content-brief.md` verfasst; weitere Änderungen direkt hier. Optional `afterCommit`: Schritte nach dem Commit, vor dem Log (z. B. S7 → `publish-results.mjs`) |
| `gen-files.mjs` | Erzeugt Schritt-Skills, Rubric-Dateien und Rollen-Agenten aus Spec, `sdlc.json` und Content. Erzeugt außerdem `skills/product-traceability/scripts/lib/contracts.mjs` (Schritt-Verträge für `commit-artifact.mjs`) und die fünf Kopien `skills/*/scripts/lib/df.mjs` aus `lib-df.mjs` |
| `workflow-body.mjs` | Das Workflow-Skript ohne Traceability-Header (Steuerlogik; hier bearbeiten) |
| `assemble-workflow.mjs` | Setzt den Header davor, schreibt das Skript nach `generated/` und prüft die Syntax |
| `gen-report.mjs` | `mapping/report.md` |
| `lib-df.mjs` | Gemeinsame Skript-Bibliothek: Artefakt-Vertrag (Sidecar lesen, schreiben, rendern, prüfen), `run.json`, IDs, Event-Log. Hier bearbeiten, `gen-files.mjs` kopiert sie mit Header in jedes `skills/product-*/scripts/lib/df.mjs` |
| `extract-sdlc.py` | Liest die `sdlc:`-Annotationen aus dem BPMN |
| `check-refs.mjs` | Prüft, dass jeder erwähnte Skill-, Agent-, Hook- und Skriptname existiert und kein Name ohne `product-`-Präfix übrig ist |
| `smoke.mjs` | Rauchtest aller deterministischen Skripte und Hooks in einem Wegwerf-Run |
| `smoke-stories.mjs` | Rauchtest der Story- und Spike-Records: put, patch, Split, Discard, AC- und Spike-Verknüpfung, Export, Guard (42 Checks) |
| `content-brief.md` | Der Auftrag, nach dem der Content verfasst wurde, falls neue Schritte dazukommen |

## Nicht generiert (in `generated/` von Hand gepflegt)

- die 5 Prozess-Skills `skills/product-*/SKILL.md` und `skills/product-init/` (Zielprojekt einrichten, D-37)
- alle `scripts/*.mjs` außer `lib/df.mjs` und `lib/contracts.mjs` (beide generiert)
- `hooks/*`
- `knowledge/*.md`
- `README.md`

`regenerate.sh` überschreibt sie nicht.

## Bei einer BPMN-Änderung

Die Pipeline-Skills (`bpmn-to-agentic-workflow`) diffen nach Element-ID und fragen nur zu Neuem
nach. Die Entscheidungen daraus werden in `build-spec.mjs` (Mapping) und `content/*.json`
(Inhalt neuer Schritte) nachgetragen. Danach neu erzeugen.

`.build/` enthält nur abgeleitete Zwischenstände und ist gitignored.

## Prozessregeln

`docs/process-rules.md` ist eine Kopie der Prozessregeln ("Gedächtnis") vom 2026-09-26. Die gepflegte
Fassung liegt im Plugin: `ai-sdlc-dojo-2026-factory/plugins/dark-factory/knowledge/process-rules.md`.
