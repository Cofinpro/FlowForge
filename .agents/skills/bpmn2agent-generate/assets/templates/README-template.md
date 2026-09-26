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

That is all: no install script, no `npm install`. {{if hooks:}} If your project already has a
`.claude/settings.json`, don't overwrite it — copy everything else and merge the `hooks` entry
from `.claude/settings.json` here into yours ({{events}}). {{end}} Check for name clashes first if
your project already has skills or agents: `ls <your-project>/.claude/skills <your-project>/.claude/agents`.

Start it with {{how to start: `/{{workflow}}` for a skill chain, "run the {{workflow}} workflow"
for a Workflow script, "use the {{workflow}}-orchestrator agent" for an orchestrator agent}}.

## What's in `.claude/`

- **Agents** (`agents/`): {{one line each}}
- **Skills** (`skills/`): {{one line each}}
- **Hooks** (`hooks/` + `settings.json`): {{one line each: what it blocks and when}} — **Claude Code only.**
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
