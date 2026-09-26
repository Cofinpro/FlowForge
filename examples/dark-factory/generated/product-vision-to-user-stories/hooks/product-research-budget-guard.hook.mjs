#!/usr/bin/env node
// bpmn: {"file":"product-vision-to-user-stories.bpmn","elements":["R_1","SP_Budget"]}
//
// Claude Code PreToolUse hook, generated from "Fragestellung schaerfen & Tool routen"
// (businessRuleTask, Process_R) in product-vision-to-user-stories.bpmn by bpmn2agent-generate.
// Second line of defence for the research budget (docs/dark-factory/process-rules.md §8.0, §9.4);
// the first line is the adapter itself (lib/research-config.mjs reserves every paid call in run.json
// before it is sent). During an active dark-factory run this hook:
//   - blocks every research tool (WebSearch, WebFetch, the provider scripts) once
//     run.json budget.status == exhausted, so the Workflow's budget branch takes over;
//   - blocks direct calls of the Gemini API from Bash (curl/fetch to generativelanguage.googleapis.com)
//     — paid research must go through providers/gemini-deep-research.mjs, which counts and caps it;
//   - blocks a live Deep Research call when the hard cap (3/run) or the money cap is already used up;
//   - blocks NotebookLM research tools (removed from the run path, D-22).
// It never counts calls itself (the adapter books them), so nothing is counted twice.
// The active run is read from runs/.active (written by product-traceability/scripts/run-state.mjs init;
// may hold an absolute path when the run lives in another repo). No active run -> allow.
// CLAUDE-ONLY: hooks are a Claude Code mechanism.
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const input = JSON.parse(readFileSync(0, 'utf8') || '{}');
const tool = input.tool_name || '';
const cmd = String(input.tool_input?.command || '');
const root = process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd();
const activeFile = path.join(root, 'runs', '.active');
if (!existsSync(activeFile)) process.exit(0);
const runDir = path.resolve(root, readFileSync(activeFile, 'utf8').trim());
const runFile = path.join(runDir, 'run.json');
if (!existsSync(runFile)) process.exit(0);

let run;
try {
  run = JSON.parse(readFileSync(runFile, 'utf8')) || {};
} catch {
  process.exit(0); // cannot read run state -> do not block blindly
}
const block = (msg) => { console.error(`Fragestellung schaerfen & Tool routen: ${msg}`); process.exit(2); };

const isProvider = tool === 'Bash' && /providers\/(gemini-deep-research|raw-fetch|ddg-html)\.mjs/.test(cmd);
const isResearch = /^(WebSearch|WebFetch)$/.test(tool) || isProvider;

if (/^mcp__gemini-notebook-mcp__research_/.test(tool)) {
  block('NotebookLM research is not part of the run path (D-22). Use providers/gemini-deep-research.mjs for Deep Research or WebSearch for facts.');
}
if (isResearch && run.budget?.status === 'exhausted') {
  block('run budget is exhausted (run.json budget.status) — no further research. Save the partial result instead (Gedächtnis §9.4).');
}
if (tool === 'Bash' && /generativelanguage\.googleapis\.com/.test(cmd)) {
  block('direct Gemini API calls are not allowed during a run — use providers/gemini-deep-research.mjs, which checks and books the budget (Gedächtnis §9.4).');
}
if (tool === 'Bash' && /providers\/gemini-deep-research\.mjs/.test(cmd) && /--live/.test(cmd)) {
  const r = run.research || {};
  const cap = run.limits?.deepResearchHardCap ?? 3;
  const money = run.limits?.moneyCapUsd ?? 15;
  const m = cmd.match(/--call\s+(\S+)/);
  const resumable = (r.calls || []).some((c) => c.provider === 'gemini-deep-research' && c.callId === m?.[1] && c.interactionId && !['completed', 'failed', 'released', 'cancelled'].includes(c.status)); // = isResumable in lib/research-config.mjs
  if (!resumable && (r.deepResearchCalls ?? 0) >= cap) block(`Deep-Research hard cap reached (${r.deepResearchCalls}/${cap} per run, Gedächtnis §9.4). Route this question to WebSearch instead.`);
  if (!resumable && (r.costUsd ?? 0) >= money) block(`research money cap reached (${r.costUsd} of ${money} USD, Gedächtnis §9.4). Route this question to WebSearch instead.`);
}
process.exit(0);
