<!--
Authoring notes for whoever fills this template (bpmn2agent-generate step 9) — strip this comment
block before writing mapping/report.md. Unlike README.md, this file stays in English (it's a
generation-trace document for whoever maintains the pipeline / runs bpmn2agent-verify, not the
business-facing artifact — README.md is that one). BPMN labels inside it stay quoted verbatim in
the source language regardless (mapping-rubric.md's language rule applies here too).
-->
---
bpmn:
  file: {{sourceBpmnPath}}
  elements: [{{all element ids in the spec}}]
---

# Mapping report — {{workflow}}

Generated {{date}} from `generated/{{workflow}}/workflow-spec.yaml`
(source `{{sourceBpmnPath}}` @ `{{sha256, first 12 chars}}…`). This is the trace target for
`bpmn2agent-verify` — every row below must correspond to what's actually on disk.

## Review status

{{This is the section the business user approves against — mapping/index.html is a read-only view.
  Exactly one of:
  - "**Nothing red, no open questions.** All <n> elements resolved to a concrete kind."
  - "**<r> red element(s), <q> open question(s) — resolve before approval.** Details: "Red — open /
    unresolved" and "Open questions carried forward" below."
  Then one line "<g> element(s) deliberately not generated (grey) — not an error." and one line
  linking the viewer: "Interactive, read-only view of the same mapping: [`index.html`](index.html)."
  When a store has `tools: unresolved`, add: "<u> store(s) without resolved tools — no tool access and no
  write guard emitted for them; see "Context sources"."}}

## Pattern

**{{pattern.chosen}}**

{{pattern.rationale, verbatim}}

{{if pattern.alternativesConsidered is non-empty, one subsection per entry, shown VERBATIM per the
  plan's traceability decision — do not paraphrase:}}

### Alternatives considered

- **{{alternativesConsidered[].pattern}}** — {{alternativesConsidered[].whyNot, verbatim}}

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
| Rose | `context-source`, `workflow-input`, `workflow-output` | A data store (knowledge, live system, memory) or the process-wide input/output; no file of its own. {{Delete this row when the spec has neither.}} |
| **Grey** | `not-generated` | Deliberately not generated; reason shown in the table below. Not an error. |
| **Red** | `unresolved` | Unmapped or still an open question; blocks `bpmn2agent-verify`'s "no red in the map" check. |

(Full legend detail: `bpmn2agent-design/references/mapping-rubric.md`'s "Legend: mapping view
colours" section — this table is the textual mirror of what `mapping/workflow-mapped.bpmn` and
`mapping/index.html` render visually.)

## Element → artifact map

| BPMN element | Type | Lane | Kind | Generated artifact(s) | Notes |
|---|---|---|---|---|---|
{{one row per element in elements.<id>, in spec order:
  - "BPMN element": the label quoted verbatim, e.g. "Antrag genehmigen" — for an element with no
    label (a plain gateway), use its id.
  - "Type": bpmnType.
  - "Lane": the role's `label` (verbatim lane name), or "—" if unlaned.
  - "Kind": the kind enum value.
  - "Generated artifact(s)": every path in generatedPaths, as inline code, comma-separated; "—"
    for orchestrator/human-checkpoint (no file of its own — say "(see <owning agent/skill path>)"
    instead of a bare dash, so a reader knows where the logic actually lives); "—" for
    not-generated/unresolved too.
  - "Notes": for not-generated/unresolved, the element's `reason` verbatim (this is the grey/red
    annotation text). For a gate, its kind + maxLoops. For a hook, its event and matcher as
    registered in `.claude/settings.json`. For a `context-source`: Art and Ort, e.g. "live · mcp:atlassian"
    (details under "Context sources"); for `workflow-input`/`workflow-output`: the artifact id.
    Otherwise blank.
}}
| {{label}} | {{bpmnType}} | {{laneLabel}} | {{kind}} | {{generatedPaths joined}} | {{reason / gate / pairing note}} |

## Grey — deliberately not generated

{{one bullet per kind: not-generated element, label quoted verbatim + reason verbatim. "None." if
  empty.}}

## Red — open / unresolved

{{one bullet per kind: unresolved element, label quoted verbatim + reason verbatim, plus its
  openQuestions[] entry (question/source/answer) if one exists for the same elementId. "None — every
  element resolved to a concrete kind." if empty. A non-empty section here means
  bpmn2agent-verify's "no red in the map" check will fail until these are resolved (back to
  bpmn2agent-design, or the diagram itself per its step 2 triage).}}

## Context sources

{{Only when the spec has `contextSources` or `workflowIO`; delete the section otherwise. One
  subsection per `contextSources.<id>`, in spec order, the store name verbatim as the heading:}}

### {{contextSources.<id>.name}}

- **Art / Ort:** {{art}} / {{ort.type}}{{:ort.ref}}
- **Readers:** {{reader task labels, verbatim}} · **Writers:** {{writer task labels, verbatim, or "none"}}
- **Tools (live):** read `{{tools.read}}` · write `{{tools.write}}` — or "unresolved: no tools emitted"
  (verify warns; generate never emits a wildcard).
- **Placement:** {{agent `tools:` of `<agentName>` (orchestrator-agent lanes) | `.claude/settings.json`
  → `permissions.allow`. For the second: "Lesezugriff nicht pro Rolle getrennt" — the read tools are
  allowed for every role; write tools are never pre-approved.}}
- **Write guard:** {{approval step label(s) before the write + "PreToolUse hook asks at the call" |
  "no writers" | "skipped: tools unresolved"}}
- **Memory (gedächtnis):** {{memory.path}}, cap {{maxLines}} lines, cap hook {{path}} | omit
- **Knowledge (wissen):** {{knowledge file(s) per reading task, e.g. `knowledge/<taskId>.md`}} | omit

{{Then one line each for `workflowIO.input` ("Process input: {{artifact}}, required: {{fields}} — becomes
  the argument-hint / Input section of {{top-level file}}") and `workflowIO.output` ("Process output:
  {{artifact}} — contract for the end result"), when set.}}

### Context hooks

{{Hooks that no element's `generatedPaths` claims, by path, with event, matcher as registered in
  `.claude/settings.json`, and the store elements their `bpmn:` header names. "None." if the spec has
  no live store with write tools and no memory store. A skipped guard is listed here with the reason.}}

| Hook | Event / matcher | Stores | Purpose |
|---|---|---|---|
| `{{.claude/hooks/<workflow>-write-guard.mjs}}` | PreToolUse / `{{write tools}}` | {{store names}} | Asks before writing into a live store. |
| `{{.claude/hooks/<workflow>-memory-cap.mjs}}` | PostToolUse / `Write\|Edit\|MultiEdit` | {{store names}} | Exit 2 above the line cap. |
| `.claude/hooks/{{workflow}}-cost-ledger.mjs` | SubagentStop, Stop, SessionEnd | – | Records run token usage; `{{workflow}}-cost-map.json` beside it maps it to elements. |

## Roles

| Role | Lane | Agent / skill generated | Model tier | Tools |
|---|---|---|---|---|
{{one row per roles.<id>: label (verbatim), the actual agents/<agentName>.md or
  skills/<agentName>/ path generated for it (or "— (all elements not-generated/unresolved)" if
  nothing was), modelTier if set else "session default", tools if set else "inherits all".}}

## Artifacts

| Artifact | Path pattern | Producer | Consumers | Frontmatter |
|---|---|---|---|---|
{{one row per artifacts.<id>: id, pathPattern, producer elementId(s) (comma-separated if the spec
  gave an array — a data object genuinely written by more than one element), consumers elementIds
  (comma-separated), frontmatter field names (comma-separated, "—" if none declared). "None." if
  the spec has no artifacts.}}

## Open questions carried forward

{{one bullet per openQuestions[] entry with answer: null — these need a decision before the next
  bpmn2agent-design pass. "None." if empty.}}
