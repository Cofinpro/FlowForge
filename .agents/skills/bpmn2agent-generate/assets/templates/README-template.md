<!--
Authoring notes for whoever fills this template (bpmn2agent-generate step 8) — NOT part of the
generated output, strip this whole comment block before writing README.md:

- Write the actual README.md in `meta.language` (the business user's own language) — the one
  generated file the English-by-default rule doesn't apply to. Translate the headings too.
- Still carries the `bpmn:` frontmatter like every other generated file; frontmatter keys stay
  literal (`bpmn`, `file`, `elements`).
- Fill every {{...}} placeholder; delete any bullet or section that doesn't apply (no hooks → no
  settings.json lines, no "Workflow script" section unless the pattern produced one, ...).
- Keep it short: a business user should be able to install in one minute.
-->
---
bpmn:
  file: {{sourceBpmnPath}}
  elements: [{{all element ids covered by this generation run}}]
---

# {{workflow}} — {{one-line description of the process, from the BPMN process name}}

{{One paragraph, business language: what this is, from which diagram, and that nothing has been
installed yet — `.claude/` in this folder is ready to copy into a project.}}

Generated {{created date}} · pattern: **{{pattern.chosen}}** · source: `{{sourceBpmnPath}}`
(`{{sha256, first 12 chars}}…`)

{{pattern.rationale, verbatim — the plain-language explanation already confirmed during design}}

## Install

```bash
cp -R generated/{{workflow}}/.claude/. <your-project>/.claude/
```

That is all: no install script, no `npm install`. {{if settings.json:}} If your project already has a
`.claude/settings.json`, don't overwrite it — copy everything else and merge the `hooks` entry
({{events}}) and the `permissions.allow` list from `.claude/settings.json` here into yours. {{end}} Check for name clashes first if
your project already has skills or agents: `ls <your-project>/.claude/skills <your-project>/.claude/agents`.

Start it with {{how to start: `/{{workflow}}` for a skill chain, "run the {{workflow}} workflow"
for a Workflow script, "use the {{workflow}}-orchestrator agent" for an orchestrator agent}}.
{{if `workflowIO.input`: "Required input: {{required fields}}, e.g. `/{{workflow}} {{example}}`;
if one is missing the workflow asks for it before it starts." If `workflowIO.output`: "Result:
{{output artifact pathPattern}}."}}

{{Section "Voraussetzungen" (translated) — only when the spec has `contextSources`; delete otherwise.
Nothing is connected for the user: no `.mcp.json`, no endpoints or credentials are generated.}}
## Voraussetzungen

{{One bullet per distinct need, from `contextSources`:
- `art: live`, `ort.type: mcp` → "MCP server `{{ort.ref}}` connected in your project (Claude Code:
  `/mcp`) — used by {{store names verbatim}}". `tools: unresolved` → "(its tools could not be resolved
  at design time; connect the server and re-run `bpmn2agent-design`; until then the steps work without it)".
- `ort.type: cli` → "command `{{ort.ref}}` installed and logged in".
- `ort.type: notebook` with `art: live` → "MCP server `gemini-notebook-mcp` connected, notebook
  "{{ort.ref}}" accessible"; with `art: wissen` → nothing at run time (the knowledge is already in
  the skills' `references/`).
- `ort.type: url` → "{{url}} reachable (WebFetch)"; `datei:` live → "file `{{path}}` exists".}}

{{Section "Gedächtnis" — only when a `gedaechtnis` store exists; delete otherwise:}}
## Gedächtnis

{{Per memory store: "„{{store name}}“ lives in `{{memory.path}}` (relative to the project root, so
inside your project, not in the copied `.claude/`), at most {{maxLines}} lines in the fixed sections
*Bewährt*, *Vermeiden*, *Offene Muster*. {{reader task labels}} load it first (missing is fine),
{{writer task labels}} fold new insights in. Commit it or add it to `.gitignore`, your call."}}

## What's in `.claude/`

- **Agents** (`agents/`): {{one line each}}
- **Skills** (`skills/`): {{one line each}}
- **Hooks** (`hooks/` + `settings.json`): {{one line each: what it blocks and when}} — **Claude Code only.**
  {{Context hooks, when generated: "`{{workflow}}-write-guard.mjs` — before any tool that writes into
  {{live store names, verbatim}} Claude Code asks you first (on top of the approval step in the
  process)." and "`{{workflow}}-memory-cap.mjs` — rejects a write that makes a memory file longer than
  its cap and asks Claude to condense it." A store whose tools could not be resolved has no guard;
  say so.}}
- **Kostenprotokoll** (`hooks/{{workflow}}-cost-ledger.mjs`, `hooks/{{workflow}}-cost-map.json`): schreibt
  nach jedem Lauf die verbrauchten Tokens nach `.claude/runs/{{workflow}}/ledger.jsonl` (ohne Preise,
  ohne Netz; nimm `.claude/runs/` in die `.gitignore` auf). Auswerten: FlowForge-Plugin installieren,
  danach `/bpmn2agent-cost`. Das zeigt die Kosten je BPMN-Element, Lane und Phase.
- **Permissions** (`settings.json` → `permissions.allow`): {{the read tools allowed without a prompt,
  for stores read by non-agent lanes; "Lesezugriff nicht pro Rolle getrennt" — every role may use
  them. Write tools are never pre-approved.}}
- **Workflow script** (`workflows/{{workflow}}.workflow.mjs`): runs only when you start it
  deliberately via the Workflow tool, never automatically. **Claude Code only.**
- **Scripts**: {{list every scripts/*.mjs with its BPMN task, or "none"}} — Node built-ins only.

Other runtimes (e.g. `.codex/`): copy `.claude/skills/*` only. Agents, hooks and the Workflow
script are Claude Code concepts and won't run elsewhere.

## Review material (not copied)

- `mapping/report.md` — every BPMN element and what became of it; approve here.
- `mapping/index.html` — the same as a clickable diagram.
- `workflow-spec.yaml`, `knowledge/` — the decisions and the domain knowledge behind them.

## Open questions

{{every openQuestions[] entry with answer: null, or "none"}}

## Regenerating

If `{{sourceBpmnPath}}` changes, run `bpmn-to-agentic-workflow` again; it only asks about what
changed. Already installed copies are not touched — copy `.claude/` again after reviewing
`mapping/report.md`.
