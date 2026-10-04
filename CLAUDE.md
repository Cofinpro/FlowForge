# bpmn2agent

BPMN 2.0 process diagram in, reviewable Claude Code artifacts (agents, skills, hooks, scripts,
orchestrator) out. See `README.md` for the layout and `ARCHITECTURE.md` for how the pipeline, the
spec, traceability, the knowledge layer and the helper skills/agents fit together.

## Rules of work

- Skills live in `.agents/skills/` (real files); `.claude/skills/<name>` are relative symlinks. Agents
  likewise: `.agents/agents/<name>.md`, symlinked from `.claude/agents/`. Add new ones the same way.
- The repo is also the `lanecraft` plugin (`.claude-plugin/`). A new agent must be added to the
  `agents` list in `plugin.json`. Inside a SKILL.md, point at another skill as
  `${CLAUDE_SKILL_DIR}/../<skill>/…`, never `.agents/skills/…`; agents get skills through `skills:`
  in their frontmatter. Check with `npm run validate`; release via the `Release` GitHub Action.
- Commit messages are Conventional Commits (commitlint `commit-msg` hook); release-it derives the
  version and changelog from them.
- Notebook answers are kept, not thrown away: record every `notebook_query` result with
  `.agents/skills/bpmn2agent-knowledge/scripts/notebook-faq.py add`. Agentic-design questions go to
  `.agents/skills/agentic-workflow-kb/faq/`; check its `README.md` before asking the notebook again.
- The `bpmn2agent-*` skills write relative to the cwd into `generated/<workflow>/`. For an example, run
  them (and `bpmn-authoring` on its BPMN) from that example's folder, e.g. `examples/dark-factory/`.
- Never edit `examples/dark-factory/generated/` by hand. Edit the generator sources in
  `examples/dark-factory/tools/dark-factory-gen/` and run `regenerate.sh`; it must end with
  `RESULT: PASS`, `no reference problems`, the three smoke lines and `mapping view ok`.
- The example is a snapshot. The dark-factory plugin it once produced is maintained by hand in the
  `ai-sdlc-dojo-2026-factory` repo; nothing here builds or ships that plugin.
- Paths like `docs/planning/…` inside `.agents/skills/bpmn2agent-*` point to the repo those skills came
  from. They are not links in this repo.

## Conventions

- Docs and READMEs in German. Skills, scripts and code comments in English. BPMN labels stay verbatim.
- Every generated file carries `bpmn: {file, elements}`; `bpmn2agent-verify` checks it in both directions.
- npm dependencies live in `~/.cache/bpmn-authoring-tools`, never in this repo. Only exception: the
  dev tooling in `package.json` (release-it, commitlint, husky).
