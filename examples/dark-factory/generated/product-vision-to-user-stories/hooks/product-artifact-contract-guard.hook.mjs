#!/usr/bin/env node
// bpmn: {"file":"product-vision-to-user-stories.bpmn","elements":["K_1"]}
//
// Claude Code PreToolUse hook, generated alongside "Rubric laden" (scriptTask, Process_K) in
// product-vision-to-user-stories.bpmn by flowforge-generate. Enforces the storage contract of
// Gedächtnis §11.2 at write time, so a producing agent learns immediately instead of burning a
// critic iteration (K.1 refuses to judge an uncommitted artifact):
//   - Metadata is script-owned: no tool write to runs/<id>/**/*.meta.json, run.json, history/**,
//     log/events.jsonl. Sidecars are written by commit-artifact.mjs and the other df scripts.
//   - Records are rendered, never hand-written: gates/G-*.md, research/sources/SRC-*.md,
//     panel/transcripts/T-*.md, 6.2.x trace findings and backlog/traceability.md come from their scripts.
//   - Stories and spikes are JSON-first (§11.3): backlog/stories/ST-*.md is rendered by story.mjs,
//     backlog/spikes/SPK-*.md by spike.mjs, backlog/backlog.json
//     by export-backlog.mjs.
//   - Agents write artifact BODIES only: a Write to a run Markdown file must not start with a
//     frontmatter block — the read-only frontmatter is rendered from the sidecar by commit-artifact.mjs.
//   - Published results (D-34) are written only by publish-results.mjs: <publishDir>/.published.json
//     always, anything else under <publishDir> while a run is running (publishDir from the target
//     project's .dark-factory/project.json, default docs/product).
// Exit 2 feeds the reason back to the writing agent. Other files outside runs/<id>/ are never touched.
// CLAUDE-ONLY: hooks are a Claude Code mechanism.
import { existsSync, readFileSync, realpathSync } from 'node:fs';
import path from 'node:path';

const input = JSON.parse(readFileSync(0, 'utf8') || '{}');
const ti = input.tool_input || {};
const s = String(ti.file_path || ti.notebook_path || '').split('\\').join('/');

// published results: only publish-results.mjs writes there
const root = process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd();
const readJson = (f) => { try { return JSON.parse(readFileSync(f, 'utf8')); } catch { return null; } };
const project = readJson(path.join(root, '.dark-factory', 'project.json'));
if (project && s) {
  // compare real paths (e.g. /var -> /private/var on macOS); the target file may not exist yet
  const real = (p) => { let head = p, tail = ''; while (!existsSync(head) && path.dirname(head) !== head) { tail = path.join(path.basename(head), tail); head = path.dirname(head); } return path.join(realpathSync(head), tail); };
  const pub = real(path.resolve(root, project.publishDir || 'docs/product'));
  const abs = real(path.resolve(input.cwd || root, s));
  if (abs.startsWith(pub + path.sep)) {
    const active = existsSync(path.join(root, 'runs', '.active')) ? readFileSync(path.join(root, 'runs', '.active'), 'utf8').trim() : '';
    const running = active && readJson(path.join(path.resolve(root, active), 'run.json'))?.status === 'running';
    if (path.basename(abs) === '.published.json' || running) {
      console.error(`${s}: published results are written only by publish-results.mjs at the end of S7 (D-34) — do not write them by hand`);
      process.exit(2);
    }
  }
}
if (!/(^|\/)runs\/[^/]+\//.test(s)) process.exit(0);

const SCRIPTS = `${process.env.CLAUDE_PLUGIN_ROOT || '<dark-factory plugin>'}/skills/product-traceability/scripts`; // D-35
const COMMIT = `node ${SCRIPTS}/commit-artifact.mjs commit <runDir> <file.md> --step <element> <<'JSON' {authored} JSON`;
const block = (why) => { console.error(`${s}: ${why} (Gedächtnis §11.2)`); process.exit(2); };

if (/\.meta\.json$/.test(s) || /(^|\/)runs\/[^/]+\/run\.json$/.test(s) || /\/history\//.test(s) || /\/log\/events\.jsonl$/.test(s)) {
  block('metadata is written only by the dark-factory scripts. Supply your part (itemIndex, sources, riskFlags, attributes, notesForNext) through commit-artifact.mjs instead');
}
if (/\/gates\/G-\d+[^/]*\.md$/.test(s)) block('gate records are rendered by write-gate-record.mjs from the record JSON — do not write them by hand');
if (/\/research\/sources\/SRC-\d+[^/]*\.md$/.test(s)) block('sources are rendered by normalize-sources.mjs from the raw results — do not write them by hand');
if (/\/panel\/transcripts\/T-\d+[^/]*\.md$/.test(s)) block('transcripts are rendered by record-transcript.mjs from the session JSON — do not write them by hand');
if (/\/backlog\/stories\/ST-\d+[^/]*\.md$/.test(s)) block(`stories are records: hand the structured story to story.mjs put/patch (node ${SCRIPTS}/story.mjs), which renders this file`);
if (/\/backlog\/(stories|spikes)\/SPK-\d+[^/]*\.md$/.test(s)) block(`spikes are records: hand the structured spike to spike.mjs put/patch (node ${SCRIPTS}/spike.mjs), which renders this file`);
if (/\/backlog\/backlog\.json$/.test(s)) block('backlog.json is exported from the story and epic records by export-backlog.mjs — run it instead');
if (/\/6\.2\.[125]_trace-findings\.md$/.test(s) || /\/backlog\/traceability\.md$/.test(s)) block('trace findings and the matrix are produced by the traceability scripts — run them instead');

if (s.endsWith('.md') && (input.tool_name === 'Write' || ti.content !== undefined)) {
  if (/^\s*---\r?\n/.test(String(ti.content || ''))) {
    block(`write the Markdown body only, without frontmatter. The read-only frontmatter is rendered from the sidecar when you commit: ${COMMIT}`);
  }
}
process.exit(0);
