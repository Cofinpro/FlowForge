#!/usr/bin/env node
// bpmn: {"file":"product-vision-to-user-stories.bpmn","elements":["K_2"]}
//
// Claude Code PreToolUse hook, generated from "Artefakt gegen Rubric bewerten"
// (businessRuleTask, Process_K) in product-vision-to-user-stories.bpmn by bpmn2agent-generate.
// Enforces Gedächtnis §2.2 / §4 "Kein Selbst-Abnicken — der Kritiker schreibt nie Artefakte um"
// and §7.3 "die Persona kennt nur das eigene Profil" at the tool level:
//   - product-kritiker may write only under runs/<id>/gates/ (evaluation files; records are written by
//     write-gate-record.mjs) — plus the two artifacts it produces itself in 6.2.3/6.2.4 (glossary,
//     backlog-cleaned), recognised by their file name. Committing them (sidecar) runs through
//     commit-artifact.mjs via Bash, which this hook does not gate.
//   - product-persona may not write anything.
// The subagent is identified by the hook payload's agent_type (set by Claude Code for tool calls
// made inside a subagent). Main-session calls (no agent_type) are never blocked. As plugin agents the
// roles arrive namespaced ("dark-factory:product-kritiker", D-35); the bare name is accepted too.
// CLAUDE-ONLY: hooks are a Claude Code mechanism.
import { readFileSync } from 'node:fs';

const input = JSON.parse(readFileSync(0, 'utf8') || '{}');
const agent = String(input.agent_type || '').replace(/^dark-factory:/, '');
if (!['product-kritiker', 'product-persona'].includes(agent)) process.exit(0);

const ti = input.tool_input || {};
const target = String(ti.file_path || ti.notebook_path || '').split('\\').join('/');

if (agent === 'product-persona') {
  console.error('Persona befragen: a synthetic persona only answers — it never writes files (Gedächtnis §7.3). Return your answer as text.');
  process.exit(2);
}

const inRun = /(^|\/)runs\/[^/]+\//.test(target);
if (!inRun) process.exit(0);
if (/(^|\/)runs\/[^/]+\/gates\//.test(target)) process.exit(0);
const ownArtifact = /\/6\.2\.[34]_(glossary|backlog-cleaned)\.md$/.test(target);
if (ownArtifact) process.exit(0);

console.error(`Artefakt gegen Rubric bewerten: the critic never rewrites artifacts (Gedächtnis §9.1.4). Blocked write to ${target}. Put concrete change requests into the gate record instead.`);
process.exit(2);
