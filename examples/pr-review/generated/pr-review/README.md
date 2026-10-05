---
bpmn:
  file: pr-review.bpmn
  elements: [Start_PrEroeffnet, Gw_Merge_Pruefung, Task_Zusammenfassen, Gw_Split_Pruefung, Task_CodePruefen, Task_Tests, Task_Sicherheit, Gw_Join_Pruefung, Task_Zusammenfuehren, Gw_Kritisch, Gw_Merge_Nachbessern, Task_Nachbessern, Task_Freigeben, Gw_Freigegeben, Task_Mergen, End_Gemergt, End_Verworfen, DataInput_PrNummer, StoreRef_Richtlinien, StoreRef_Repo]
---

# pr-review — Pull Request prüfen und mergen

This is the Claude Code version of your diagram `pr-review.bpmn`: a guided review of one pull request, from the
summary through code, test and security checks to the author's fixes, the Tech Lead's approval and the merge.
Nothing has been installed yet; the `.claude/` folder next to this file is ready to copy into a project.

Generated 2026-10-05 · pattern: **skill-chain-hooks** · source: `pr-review.bpmn` (`e86d55980a84…`)

Your diagram is attended: the Author fixes findings and the Tech Lead approves the merge, so a person is in the loop at two points. The routing is simple: one yes/no on whether a finding is critical (severity hoch), one on approval. I build it as a guided sequence of checklists. One entry skill walks the steps in order, calls one skill per review step with the team guidelines, runs the tests and linter as a script, and stops at your two checkpoints. Code, tests and security run one after another instead of at the same time. Both loops are capped at three rounds; after the third round the pull request goes to approval with a risk note. The only write into the repository is the merge, and it happens only after "Merge freigeben", with Claude Code asking once more at the call. Reading is not separated per role (Lesezugriff nicht pro Rolle getrennt); a coordinating agent could give the Reviewer read-only access and only the Tech Lead the right to merge.

## Install

```bash
cp -R generated/pr-review/.claude/. <your-project>/.claude/
```

That is all: no install script, no `npm install`. If your project already has a `.claude/settings.json`, don't overwrite it:
copy everything else and merge the `hooks` entries (PreToolUse, SubagentStop, Stop, SessionEnd) and the `permissions.allow`
list from `.claude/settings.json` here into yours. Check for name clashes first if your project already has skills:
`ls <your-project>/.claude/skills`.

Start it with `/pr-review <prNummer>`. Required input: `prNummer`, e.g. `/pr-review 42`; if it is missing the workflow asks for it
before it starts.

## Voraussetzungen

- Command `gh` installed and logged in, used by "Pull Requests im Repository" (reading with `gh pr view` and `gh pr diff`, merging with `gh pr merge`).
- The project has a `package.json` with a `test` and/or a `lint` script (the test step runs those); with neither, the step reports an error and asks.
- `docs/review-guidelines.md` ("Review-Richtlinien") is already distilled into the skills; nothing is read from it at run time.

## What's in `.claude/`

- **Skills** (`skills/`):
  - `pr-review`: the entry skill that walks all steps, the two checkpoints and both loops.
  - `pr-summary`: "Änderung zusammenfassen".
  - `pr-code-review`: "Code auf Fehler und Stil prüfen", with the team guidelines.
  - `pr-security-review`: "Sicherheitsrisiken prüfen".
  - `pr-findings-merge`: "Befunde zusammenführen", the severity scale and the recommendation.
  - `pr-merge`: "Pull Request mergen", the only write; squash, pinned to the reviewed commit.
  - `pr-review-reviewer`: lane skill for "Tests und Linter ausführen".
- **Hooks** (`hooks/` + `settings.json`) — **Claude Code only.**
  - `pr-review-write-guard.mjs`: before `gh pr merge` Claude Code asks you first (on top of the approval step "Merge freigeben").
- **Kostenprotokoll** (`hooks/pr-review-cost-ledger.mjs`, `hooks/pr-review-cost-map.json`): schreibt nach jedem Lauf die verbrauchten Tokens
  nach `.claude/runs/pr-review/ledger.jsonl` (ohne Preise, ohne Netz; nimm `.claude/runs/` in die `.gitignore` auf). Auswerten: FlowForge-Plugin
  installieren, danach `/flowforge-cost`. Das zeigt die Kosten je BPMN-Element, Lane und Phase.
- **Permissions** (`settings.json` → `permissions.allow`): `Bash(gh pr view:*)` and `Bash(gh pr diff:*)` run without a prompt. Lesezugriff nicht
  pro Rolle getrennt: every role may use them. The merge is never pre-approved.
- **Scripts**: `skills/pr-review-reviewer/scripts/run-tests-and-lint.mjs` for "Tests und Linter ausführen", Node built-ins only.

Other runtimes (e.g. `.codex/`): copy `.claude/skills/*` only. Hooks are a Claude Code concept and won't run elsewhere.

## Review material (not copied)

- `mapping/report.md` — every BPMN element and what became of it; approve here.
- `mapping/index.html` — the same as a clickable diagram.
- `workflow-spec.yaml`, `knowledge/` — the decisions and the domain knowledge behind them.

## Open questions

- "Befunde zusammenführen": should the store "Review-Richtlinien" be drawn into it (it needs the severity scale and the definition of critical)? Diagram change, yours to make.
- "Sicherheitsrisiken prüfen": should "Pull Requests im Repository" also be drawn into the code, tests and security steps (they read the diff or branch)? Diagram change, yours to make.
- Also noted from design: the note on "Kritische Befunde?" in the diagram still says any security risk is critical; you chose the guidelines' rule (only severity hoch). Update the note in the diagram.

Eval scenarios still to run (open items):

- Happy path: no critical finding, the Tech Lead approves, `gh pr merge` runs once with the reviewed commit.
- Critical finding: "Kritische Befunde?" sends it to "Änderungen nachbessern" and back; after the third round it goes to approval with the risk note.
- The Tech Lead picks "nachbessern lassen" three times; the fourth time only freigeben or verwerfen are offered.
- The Tech Lead picks verwerfen: a handoff note is written, the pull request stays open.
- Someone pushes after the review: the merge stops because the head commit changed.
- The test step crashes or times out: reported as an error, not as passed.

## Regenerating

If `pr-review.bpmn` changes, run `flowforge-run` again; it only asks about what changed. Already installed copies are not touched — copy
`.claude/` again after reviewing `mapping/report.md`.
