<!--
Authoring notes for whoever fills this template (bpmn2agent-generate step 8) — NOT part of the
generated output, strip this whole comment block before writing README.md:

- Write the actual README.md in `meta.language` (the spec's language, i.e. the business user's
  own language) — this is the one generated file the pipeline's English-by-default rule doesn't
  apply to (plan's "Languages" decision: interview + README in the user's language; SKILL.md/
  agent prose stays English). The section headers below are placeholders — translate them too.
- Still carries the `bpmn:` frontmatter like every other generated file (see SKILL.md's frontmatter
  convention) — frontmatter keys themselves stay literal (`bpmn`, `file`, `elements`), only prose
  content is translated.
- Fill every {{...}} placeholder; delete any whole section that doesn't apply (e.g. no "Hooks"
  section if the spec has no `kind: hook` elements, no "Workflow script" section unless
  `pattern.chosen` is `workflow-script` or `mixed` with a workflow-script phase).
-->
---
bpmn:
  file: {{sourceBpmnPath}}
  elements: [{{all element ids covered by this generation run}}]
---

# {{workflow}} — {{one-line description of the process, from the BPMN process name}}

{{One paragraph, business language: what this generates, from which diagram, and that it lives
entirely under `generated/{{workflow}}/` — nothing here has been copied into `.agents/`, `.claude/`
or `.codex/` yet. That's a deliberate choice you make next, using the instructions below.}}

Generated {{created date}} · pattern: **{{pattern.chosen}}** · source: `{{sourceBpmnPath}}`
(`{{sha256, first 12 chars}}…`)

{{pattern.rationale, verbatim — the plain-language explanation already confirmed with you during
  bpmn2agent-design}}

See `mapping/report.md` for the full element-by-element breakdown, and `mapping/index.html`
(once rendered — see below) for the visual, click-through version.

## What was generated

- **Agents**: {{list generated/<workflow>/agents/*.md with a one-line purpose each}}
- **Skills**: {{list generated/<workflow>/skills/<name>/ with a one-line purpose each}}
- **Hooks**: {{list generated/<workflow>/**/hooks/*.mjs + their paired *.settings.json, or omit
  this bullet entirely if none were generated}} — **Claude Code only.** A hook is a mechanism
  specific to Claude Code's own tool-execution loop; it has no equivalent in a runtime-neutral
  reading of the generated skills and won't do anything under another agent runtime.
- **Orchestrator / Workflow script**: {{name the one file this pattern produced, or omit if the
  pattern is skill-chain-hooks and produced neither}} — **Claude Code only**, see the dedicated
  section below.
- **Mapping**: `mapping/report.md` (this table, in prose), `mapping/workflow-mapped.bpmn` +
  `mapping/index.html` + PNG renders (see "Rendering the mapping view" below).

## Installing this into your assistant setup

Everything above lives under `generated/{{workflow}}/` on purpose (the pipeline never writes
straight into `.agents/`/`.claude/`/`.codex/`) — review it here first, then install what you want:

### Claude Code (`.agents/` + `.claude/` symlink pair, this repo's own convention)

```bash
# Skills — canonical copy under .agents/, then the .claude/ symlink this repo's pre-commit hook expects
{{for each generated skill <name>:}}
cp -r generated/{{workflow}}/skills/<name> .agents/skills/<name>
ln -s ../../.agents/skills/<name> .claude/skills/<name>

# Agents
{{for each generated agent <name>.md:}}
cp generated/{{workflow}}/agents/<name>.md .agents/agents/<name>.md
```

{{if any hooks were generated:}}
### Hooks (Claude Code only)

Merge each `hooks/*.settings.json` fragment into your own `.claude/settings.json`
(`{{project}}` or `{{user}}` scope, your choice) under its top-level `hooks` key — these are
fragments to merge by hand, not files to copy verbatim, since your own settings.json likely already
has other keys. Then copy the paired hook script itself:

```bash
{{for each hook script <name>.hook.mjs:}}
cp generated/{{workflow}}/.../hooks/<name>.hook.mjs .claude/hooks/<name>.hook.mjs
```

{{omit the whole "Hooks" section if the spec has no kind: hook elements}}

{{if pattern.chosen is workflow-script or mixed with a workflow-script phase:}}
### Workflow script (Claude Code only)

`{{workflow}}.workflow.mjs` is a **Claude Code Workflow tool** script. It is only ever generated as
a saved file — running it is always a deliberate, explicit action you take, never something this
pipeline or any agent does automatically on your behalf. To run it, open Claude Code and invoke the
Workflow tool with this script's path. Nothing in `generated/{{workflow}}/` executes it for you.

{{omit the whole "Workflow script" section for skill-chain-hooks / orchestrator-agent patterns}}

{{if pattern.chosen is orchestrator-agent or mixed with an orchestrator-agent phase:}}
### Orchestrator agent (Claude Code only)

`agents/{{workflow}}-orchestrator.md` delegates to the other generated agents via the `Agent` tool
— install it like any other agent above, then invoke it explicitly the same way you'd invoke
`task-delegator`; it never runs proactively.

{{omit the whole "Orchestrator agent" section for skill-chain-hooks / workflow-script patterns}}

### `.codex/` or another runtime-neutral assistant

Skills under `generated/{{workflow}}/skills/` are written to be runtime-neutral (plain `SKILL.md` +
`references/`/`scripts/`) — copy them to wherever your tool reads skills from
(e.g. `.codex/skills/<name>/`). **Agents, hooks, and the Workflow script above are Claude Code
concepts with no direct equivalent** — an agent's checklist can be read as a manual procedure, but
its `AskUserQuestion` calls, hook enforcement, and Workflow orchestration won't run as-is outside
Claude Code.

## Rendering the mapping view

```bash
node .agents/skills/bpmn2agent-generate/scripts/render-mapping.mjs \
  "${BPMN_TOOLS_CACHE:-$HOME/.cache/bpmn-authoring-tools}" \
  generated/{{workflow}}/workflow-spec.yaml {{sourceBpmnPath}} generated/{{workflow}}/mapping
```

produces `mapping/workflow-mapped.bpmn` (colour-coded copy), `mapping/index.html` (the read-only
viewer; approval happens in `mapping/report.md`) and `mapping/renders/*.png`.

## Open questions

{{list every openQuestions[] entry with answer: null, or "none — every question raised during
  design was answered." — a reader shouldn't have to open workflow-spec.yaml to find these.}}

## Regenerating

If `{{sourceBpmnPath}}` changes, re-run `bpmn2agent-analyze` (it diffs by element id and only
re-interviews what changed), then `bpmn2agent-knowledge`/`bpmn2agent-design` as needed, then this
skill again. Files you already installed into `.agents/`/`.claude/`/`.codex/` are **not** touched
automatically — re-copy them per the instructions above after reviewing what changed in
`mapping/report.md`.
