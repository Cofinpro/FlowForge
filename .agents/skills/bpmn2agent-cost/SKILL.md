---
name: bpmn2agent-cost
description: Reports what a run of a generated workflow cost and which BPMN elements, lanes and phases the cost belongs to, from the session transcripts or the workflow's cost ledger, and reconciles the parts against the session total. Use after a generated workflow ran ("what did that run cost", "which step is expensive") or to benchmark repeated runs. Deterministic, read-only; needs the workflow's cost map.
---

# Run cost per BPMN element

Tokens come from the session transcripts, prices from `scripts/prices.json`, the element lookup from
the generated `.claude/hooks/<workflow>-cost-map.json`. Nothing here is estimated by the model:
report the numbers the script prints and never recompute or round them yourself.

## 1. Find the inputs

- **Cost map:** `.claude/hooks/<workflow>-cost-map.json` in the project where the workflow runs. In the
  repo that generated the workflow: `generated/<workflow>/.claude/hooks/<workflow>-cost-map.json`
  (legacy layout: `generated/<workflow>/hooks/…`). Missing → the workflow was generated before cost
  tracking: re-run `bpmn2agent-generate`, which writes it. Several workflows → `AskUserQuestion` which one.
- **Run data**, in this order:
  1. `.claude/runs/<workflow>/ledger.jsonl`, written by the workflow's cost-ledger hook; survives
     the cleanup of old transcripts. No session named → the newest.
  2. A session transcript `~/.claude/projects/<project>/<session>.jsonl` (subagents sit next to it);
     use it when the workflow has no ledger yet or to cross-check one.

## 2. Run the report

```bash
node ${CLAUDE_SKILL_DIR}/scripts/cost-report.mjs --map <cost-map.json> \
  --ledger .claude/runs/<workflow>/ledger.jsonl        # or: --session <session.jsonl>
```

Optional: `--session-id <id>` (ledger with several runs), `--claude-json <file>` (result of
`claude -p --output-format json`, its `total_cost_usd` is compared), `--out <dir>`. It writes
`cost.json` and `cost.md` next to the ledger and prints the checks. Exit `1` means a reconciliation
check failed: say which one and do not present the cost as reliable.

## 3. Read the result to the user

- Lead with the total and the top elements; point at `cost.md` for the tables.
- **nicht zugeordnet** over 5 % means the label convention or the cost map is off. Name where the
  requests came from (the report lists them); do not distribute the cost over elements.
- **Hilfsaufrufe** are in the session total but in no transcript (web-search helper model and the
  like). A warning that a model's tokens are missing means the session was resumed or cleared.
- MCP calls (Gemini/NotebookLM and others) are counted but carry no price: they are billed outside
  Claude.
- Prices are those of `prices.json`; the report names its version. A failing "Preis reproduziert
  cost-state" check means the table is stale: update it from the current price list, then re-run.

## 4. Repeated runs

`scripts/cost-bench.mjs` runs the same input N times with `claude -p` (each in a fresh copy of a
template project) and reports median, min/max and IQR per element, lane and phase; see its header for
the options. Every run spends real money: print the plan first (no `--confirm`), tell the user the
number of runs, and start only after they agree. It refuses a workflow with human checkpoints
(`claude -p` cannot answer them) unless the prompt carries the answers (`--allow-checkpoints`).
`--drop-first` leaves out the first run, whose cache writes make it dearer. Under 3 runs the spread
says little.

## What this skill never does

Edit the workflow, the spec or the price table without being asked, or turn missing data into an
estimate.
