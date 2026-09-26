---
name: agentic-workflow-kb
description: Offline, citation-backed knowledge base on designing agentic workflows, agents, skills, tools, human checkpoints, context and evaluation, distilled from the NotebookLM notebook "Agentic Workflows" plus a FAQ of every question already asked to it. Use when a design question about agents, skills, subagents, orchestration patterns, hooks, Workflow scripts, human-in-the-loop, loop caps, context engineering or evals comes up, before querying the notebook again.
---

# Agentic workflow knowledge base

Answers design questions offline, with sources. Three layers, cheapest first:

1. `faq/README.md` — index of every question already asked to the notebook. Each entry in
   `faq/<topic>.md` holds the question, the verbatim answer and a citation table (number → source
   title → cited passage).
2. `references/*.md` — short, distilled guidance per topic. Every claim carries a tag like
   `[agent-design-1: 3, 5]` = FAQ entry `agent-design-1`, citations 3 and 5 in its table.
3. The notebook itself — only when layers 1–2 don't cover the question.

## Answering a question

1. Grep `faq/README.md` and `references/` for the question's key terms. Pick the matching
   reference file from the table below and read it.
2. Answer from the reference. Keep its citation tags in the answer so the reader can check them;
   open the FAQ entry when a claim needs the full passage.
3. Not covered, or the user needs more depth: query the notebook (step "Adding knowledge").
4. Say which layer the answer came from. If none covered it and the notebook isn't reachable,
   answer from model knowledge and mark it `⚠ unverified`.

| Topic | Reference | Typical questions |
|---|---|---|
| Writing skills | `references/skill-authoring.md` | description, length, progressive disclosure, scripts, evals |
| Defining agents | `references/agent-design.md` | scope, prompt sections, tools, model, report format, split or not |
| Orchestration patterns | `references/orchestration-patterns.md` | chain, router, fan-out, supervisor, evaluator-optimizer, swarm; workflow vs. agent |
| Handoffs and failure modes | `references/multi-agent-handoffs.md` | contracts, shared state vs. messages, artifacts, runaway loops, coherent incorrectness |
| Human-in-the-loop | `references/human-in-the-loop.md` | where to gate, what needs confirmation, escalation, approval fatigue |
| Control flow and state | `references/control-flow-and-state.md` | FSM/HSM, loops, termination, retries, resume, BPMN element mapping |
| Context engineering | `references/context-engineering.md` | context rot, what to load when, compaction, subagent isolation |
| Tool design | `references/tool-design.md` | tool naming, schemas, tool count, least privilege, script vs. LLM step |
| Evaluation and guardrails | `references/evaluation-and-guardrails.md` | eval design, LLM-as-judge, trajectories, guardrails, lethal trifecta |
| Reasoning patterns | `references/reasoning-patterns.md` | CoT, ToT, ReAct, reflection, plan-and-execute |
| Claude Code specifics | `references/claude-code-workflows.md` | Workflow scripts, Agent tool vs. skill vs. workflow, meta-orchestration agents |
| Process → agents | `references/process-to-agents.md` | lanes, tasks, gateways, loops, approvals, data objects → agentic parts; model tiers |
| Source list | `references/sources.md` | which book/doc a citation points to |

## Adding knowledge

When the FAQ has no answer, ask the notebook (id in `faq/sources.json`) and record the answer so
the next run finds it. To keep large notebook results out of your context, delegate this to the
`agentic-kb-librarian` agent (unless you are that agent).

```
ToolSearch: select:mcp__gemini-notebook-mcp__notebook_query
```

1. Ask one focused question per call with `new_conversation: true` — follow-ups in one
   conversation drift toward the previous answer. On an auth error, stop and tell the user to run
   `nlm login`. Never present an unsourced answer as cited.
2. The result is usually too large to show inline and gets saved to a file. If it comes back
   inline, write it to a `.json` file first (keep `question`, `answer`, `conversation_id`,
   `references`).
3. Write only if `git -C ${CLAUDE_SKILL_DIR} rev-parse --show-toplevel` succeeds and that root's
   `.claude-plugin/plugin.json` has `"name": "lanecraft"`. Otherwise (e.g. installed plugin) stop
   here and return the saved result path as a follow-up for a maintainer.
4. Record it:

   ```bash
   python3 ${CLAUDE_SKILL_DIR}/../bpmn2agent-knowledge/scripts/notebook-faq.py add \
     --faq ${CLAUDE_SKILL_DIR}/faq --topic <topic-slug> \
     --title "<short question>" <result.json>
   ```

   Reuse an existing topic slug when the question fits one; the script numbers the entry
   (`<topic>-2`, …) and rebuilds `faq/README.md`.
5. If the answer changes or extends guidance, add the distilled point to the matching
   `references/*.md` with its citation tag. Keep references short; the FAQ is the full record.
6. A new source in the notebook needs a line in `faq/sources.json` and `references/sources.md`,
   otherwise its citations show the raw source id.

## Limits

- The notebook's sources are books and docs from 2025–2026. Claims about product versions or
  keywords (for example Workflow-script trigger words) come from those sources; check against the
  current Claude Code docs before relying on them.
- Answers are the notebook's synthesis. For anything load-bearing, read the cited passage in the
  FAQ table, not only the synthesized sentence.
