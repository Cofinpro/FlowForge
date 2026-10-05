---
bpmn:
  file: pr-review.bpmn
  elements: [Start_PrEroeffnet, Gw_Merge_Pruefung, Task_Zusammenfassen, Gw_Split_Pruefung, Task_CodePruefen, Task_Tests, Task_Sicherheit, Gw_Join_Pruefung, Task_Zusammenfuehren, Gw_Kritisch, Gw_Merge_Nachbessern, Task_Nachbessern, Task_Freigeben, Gw_Freigegeben, Task_Mergen, End_Gemergt, End_Verworfen, DataInput_PrNummer, StoreRef_Richtlinien, StoreRef_Repo]
---

# Mapping report — pr-review

Generated 2026-10-05 from `generated/pr-review/workflow-spec.yaml`
(source `pr-review.bpmn` @ `e86d55980a84…`). This is the trace target for
`flowforge-verify` — every row below must correspond to what's on disk.

## Review status

**Nothing red, 2 open question(s) about the diagram.** All 20 elements resolved to a concrete kind (17 diagram nodes, 2 data stores, 1 process input).
0 elements deliberately not generated (grey).
Interactive, read-only view of the same mapping: [`index.html`](index.html).

## Pattern

**skill-chain-hooks**

Your diagram is attended: the Author fixes findings and the Tech Lead approves the merge, so a person is in the loop at two points. The routing is simple: one yes/no on whether a finding is critical (severity hoch), one on approval. I build it as a guided sequence of checklists. One entry skill walks the steps in order, calls one skill per review step with the team guidelines, runs the tests and linter as a script, and stops at your two checkpoints. Code, tests and security run one after another instead of at the same time. Both loops are capped at three rounds; after the third round the pull request goes to approval with a risk note. The only write into the repository is the merge, and it happens only after "Merge freigeben", with Claude Code asking once more at the call. Reading is not separated per role (Lesezugriff nicht pro Rolle getrennt); a coordinating agent could give the Reviewer read-only access and only the Tech Lead the right to merge.

### Alternatives considered

- **orchestrator-agent** — The Reviewer only reads pull requests and only the Tech Lead merges (roleToolSpread), which a coordinator with one agent per lane could separate. Not chosen: no gateway needs a case-by-case judgement (critical is a field of the Review-Befund), the merge sits behind its own approval and a write-guard hook, and the lighter guided flow is enough for a three-lane process.
- **workflow-script** — The flow pauses for the author and the Tech Lead, and the merge writes into a live store behind a user task; a Workflow script cannot stop for people mid-run.

## Payload

Everything installable is under `.claude/`: 7 skills (the entry skill `pr-review` spanning all elements, the step skills
`pr-summary`, `pr-code-review`, `pr-security-review`, `pr-findings-merge`, the write skill `pr-merge`, and the Reviewer lane skill
`pr-review-reviewer` with one script), two hooks (`pr-review-write-guard.mjs`, `pr-review-cost-ledger.mjs`) and `settings.json`. No agents.
Knowledge files sit beside the skill that owns the task (`references/<taskId>.md`).

## Legend

| Colour | Kind | Meaning |
|---|---|---|
| Blue | `agent-checklist` | A checklist item in the owning agent. |
| Green | `skill` | Its own generated skill. |
| Purple | `script` | A deterministic script inside a skill. |
| Orange | `hook` | A Claude Code hook. |
| Teal | `orchestrator` | Gateways, loop back-edges, multi-instance markers — no file of its own. |
| Amber | `human-checkpoint` | `userTask`/`manualTask`: a person decides here. |
| Brown | `artifact-contract` | A data object with a path/frontmatter contract. |
| Rose | `context-source`, `workflow-input`, `workflow-output` | A data store (knowledge, live system, memory) or the process-wide input/output; no file of its own. |
| **Grey** | `not-generated` | Deliberately not generated; reason shown in the table below. Not an error. |
| **Red** | `unresolved` | Unmapped or still an open question; blocks `flowforge-verify`'s "no red in the map" check. |

## Element → artifact map

| BPMN element | Type | Lane | Kind | Generated artifact(s) | Notes |
|---|---|---|---|---|---|
| "Pull Request eröffnet" | startEvent | Autor | orchestrator | `generated/pr-review/.claude/skills/pr-review/SKILL.md` |  |
| "Gw_Merge_Pruefung" | exclusiveGateway | Reviewer | orchestrator | `generated/pr-review/.claude/skills/pr-review/SKILL.md` |  |
| "Änderung zusammenfassen" | serviceTask | Reviewer | skill | `generated/pr-review/.claude/skills/pr-summary/SKILL.md` |  |
| "Gw_Split_Pruefung" | parallelGateway | Reviewer | orchestrator | `generated/pr-review/.claude/skills/pr-review/SKILL.md` |  |
| "Code auf Fehler und Stil prüfen" | serviceTask | Reviewer | skill | `generated/pr-review/.claude/skills/pr-code-review/SKILL.md` |  |
| "Tests und Linter ausführen" | scriptTask | Reviewer | script | `generated/pr-review/.claude/skills/pr-review-reviewer/scripts/run-tests-and-lint.mjs` | gate deterministic |
| "Sicherheitsrisiken prüfen" | serviceTask | Reviewer | skill | `generated/pr-review/.claude/skills/pr-security-review/SKILL.md` |  |
| "Gw_Join_Pruefung" | parallelGateway | Reviewer | orchestrator | `generated/pr-review/.claude/skills/pr-review/SKILL.md` |  |
| "Befunde zusammenführen" | serviceTask | Reviewer | skill | `generated/pr-review/.claude/skills/pr-findings-merge/SKILL.md` | gate deterministic, max 3 loops |
| "Kritische Befunde?" | exclusiveGateway | Reviewer | orchestrator | `generated/pr-review/.claude/skills/pr-review/SKILL.md` |  |
| "Gw_Merge_Nachbessern" | exclusiveGateway | Autor | orchestrator | `generated/pr-review/.claude/skills/pr-review/SKILL.md` |  |
| "Änderungen nachbessern" | userTask | Autor | human-checkpoint | (see `generated/pr-review/.claude/skills/pr-review/SKILL.md`) | gate human |
| "Merge freigeben" | userTask | Tech Lead | human-checkpoint | (see `generated/pr-review/.claude/skills/pr-review/SKILL.md`) | gate human, max 3 loops |
| "Freigegeben?" | exclusiveGateway | Tech Lead | orchestrator | `generated/pr-review/.claude/skills/pr-review/SKILL.md` |  |
| "Pull Request mergen" | serviceTask | Tech Lead | skill | `generated/pr-review/.claude/skills/pr-merge/SKILL.md` | gate deterministic |
| "Pull Request gemergt" | endEvent | Tech Lead | orchestrator | `generated/pr-review/.claude/skills/pr-review/SKILL.md` |  |
| "Pull Request verworfen" | endEvent | Tech Lead | orchestrator | `generated/pr-review/.claude/skills/pr-review/SKILL.md` |  |
| "PR-Nummer" | dataInput | — | workflow-input | — | artifact pr-nummer |
| "Review-Richtlinien" | dataStoreReference | — | context-source | — | wissen · datei:docs/review-guidelines.md |
| "Pull Requests im Repository" | dataStoreReference | — | context-source | — | live · cli:gh |

## Grey — deliberately not generated

None.

## Red — open / unresolved

None — every element resolved to a concrete kind.

## Context sources

### Review-Richtlinien

- **Art / Ort:** wissen / datei:docs/review-guidelines.md
- **Readers:** "Code auf Fehler und Stil prüfen" · **Writers:** none
- **Knowledge (wissen):** `knowledge/Task_CodePruefen.md`, installed as `references/Task_CodePruefen.md` of `pr-code-review`

### Pull Requests im Repository

- **Art / Ort:** live / cli:gh
- **Readers:** "Änderung zusammenfassen" · **Writers:** "Pull Request mergen"
- **Tools (live):** read `Bash(gh pr view:*)`, `Bash(gh pr diff:*)` · write `Bash(gh pr merge:*)`
- **Placement:** `.claude/settings.json` → `permissions.allow` (read tools). Lesezugriff nicht pro Rolle getrennt — the read tools are allowed for every role; the write tool is never pre-approved.
- **Write guard:** "Merge freigeben" + PreToolUse hook asks at the call

Process input: pr-nummer, required: prNummer — becomes the argument-hint and Input section of `pr-review`.

### Context hooks

| Hook | Event / matcher | Stores | Purpose |
|---|---|---|---|
| `.claude/hooks/pr-review-write-guard.mjs` | PreToolUse / `Bash` | Pull Requests im Repository | Asks before `gh pr merge`. |
| `.claude/hooks/pr-review-cost-ledger.mjs` | SubagentStop, Stop, SessionEnd | – | Records run token usage; `pr-review-cost-map.json` beside it maps it to elements. |

## Roles

| Role | Lane | Agent / skill generated | Model tier | Tools |
|---|---|---|---|---|
| Autor | Lane_Autor | — (steps live in the entry skill and step skills) | session default | inherits all |
| Reviewer | Lane_Reviewer | `generated/pr-review/.claude/skills/pr-review-reviewer/` (lane skill) | session default | inherits all |
| Tech Lead | Lane_TechLead | — (steps live in the entry skill and step skills) | session default | inherits all |

## Artifacts

| Artifact | Path pattern | Producer | Consumers | Frontmatter |
|---|---|---|---|---|
| pr-nummer | `generated/pr-review/artifacts/pr-nummer/{id}.md` | — | Task_Zusammenfassen | prNummer |
| kurzfassung | `generated/pr-review/artifacts/kurzfassung/{id}.md` | Task_Zusammenfassen | Task_CodePruefen, Task_Sicherheit, Task_Freigeben | prNummer, riskLevel |
| befund-code | `generated/pr-review/artifacts/befund-code/{id}.md` | Task_CodePruefen | Task_Zusammenfuehren | findings |
| testergebnis | `generated/pr-review/artifacts/testergebnis/{id}.json` | Task_Tests | Task_Zusammenfuehren | status, failures |
| befund-sicherheit | `generated/pr-review/artifacts/befund-sicherheit/{id}.md` | Task_Sicherheit | Task_Zusammenfuehren | findings |
| uebergabenotiz | `generated/pr-review/artifacts/uebergabenotiz/{id}.md` | End_Verworfen | — | prNummer, reason |
| review-befund | `generated/pr-review/artifacts/review-befund/{id}.md` | Task_Zusammenfuehren | Task_Nachbessern, Task_Freigeben | version, status, kritischRounds, freigabeRounds, maxSeverity, recommendation, capReached, headSha |

## Open questions carried forward

- Task_Zusammenfuehren: Should the Review-Richtlinien store be drawn into "Befunde zusammenführen" (it needs the severity scale and the definition of critical)?
- Task_Sicherheit: Should the Pull Requests im Repository store also be drawn into "Code auf Fehler und Stil prüfen", "Tests und Linter ausführen" and "Sicherheitsrisiken prüfen" (they read the diff or branch)?
