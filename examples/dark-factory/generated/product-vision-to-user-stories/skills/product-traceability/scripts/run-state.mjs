#!/usr/bin/env node
// bpmn: {"file":"product-vision-to-user-stories.bpmn","elements":["Start_Geschaeftsidee","S6.2.1","S6.2.2","S6.2.5"]}
//
// Run workspace bookkeeping for the "Geschaeftsidee / Marktbedarf erkannt" start event and every
// later step: creates runs/<runId>/ (layout from docs/dark-factory/implementation.md §4), keeps run.json
// (state, loop/pivot counters, budget, deep-research count, config snapshot + BPMN hash) and
// appends log/events.jsonl. Deterministic — no LLM call.
//
// Usage:
//   node run-state.mjs init  <runsRoot> <runId> <idea | brief.md | input-dir> [--brief <file>] [--language de] [--bpmn <path>] [--money-cap 15] [--no-pointer] [--ensure-project]
//     The idea input is one of: the idea text itself, a brief .md file, or a folder (brief plus any
//     supporting material, e.g. own research). A folder is copied as a whole to <runDir>/input/, so
//     relative links in the brief keep working there. Its brief is --brief <file> (relative to the
//     folder), else the single .md whose name starts with 00 or contains "brief", else the only .md.
//     The raw brief always lands in <runDir>/00_idea-brief.md (read by S0, which then overwrites it
//     with the completed brief) and, untouched, in log/idea-input.md.
//     --bpmn defaults to the BPMN shipped in the dark-factory plugin root (D-35), else ./<name>.bpmn.
//     --ensure-project (used by the Workflow): makes the project around runsRoot a target project —
//     creates .dark-factory/project.json (df.project/v1, D-33) if missing, never overwrites it, and adds
//     runs/ to its .gitignore (lib/project.mjs). Better: run /dark-factory:product-init first, which
//     also fills in platform.
//     runsRoot may lie in another repo (workflow arg targetDir); then ./runs/.active points there too
//     (unless --no-pointer, used by test harnesses).
//   node run-state.mjs event <runDir> <json>        # append an event, e.g. '{"event":"step-done","element":"S1.1.2"}'
//   node run-state.mjs set   <runDir> <key> <json>  # set a top-level run.json key (dotted keys allowed)
//   node run-state.mjs get   <runDir>               # print run.json
//   node run-state.mjs finish <runDir> <complete|partial|discarded>
//     # end of the run (S7, SP_Budget_S1, End_IdeeVerworfen): sets run.json status + finishedAt and
//     # removes every runs/.active pointer that points at this run, so the hooks go quiet again
import path from 'node:path';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync, cpSync, readdirSync, statSync, rmSync } from 'node:fs';
import { loadRun, saveRun, logEvent, die } from './lib/df.mjs';
import { ensureProject } from './lib/project.mjs';

const [, , cmd, ...rest] = process.argv;
const BPMN_NAME = 'product-vision-to-user-stories.bpmn';
const PLUGIN_BPMN = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../../..', BPMN_NAME);

/** event/set/get/finish act on an existing run only: a wrong or cwd-relative path must fail, not create a stray run. */
function existingRun(runDir) {
  if (!existsSync(path.join(runDir, 'run.json'))) die(`no run at "${runDir}" (resolved: ${path.resolve(runDir)}; run.json missing) — pass the runDir from the run context, relative to the project directory`);
  return runDir;
}

const LAYOUT = ['artifacts/p1-strategie', 'artifacts/p2-research', 'artifacts/p3-journey', 'artifacts/p4-story-map',
  'artifacts/p5-refinement', 'artifacts/p6-akzeptanz', 'panel/proto', 'panel/personas', 'panel/guides', 'panel/transcripts', 'panel/sessions',
  'research/reports', 'research/sources', 'research/claims', 'research/raw/gemini-dr', 'research/raw/websearch', 'research/raw/ddg',
  'gates', 'backlog/epics', 'backlog/stories', 'backlog/spikes', 'history', 'log'];

/** Pick the brief inside an input folder (see Usage). */
function findBrief(dir, explicit) {
  if (explicit) {
    const p = path.resolve(dir, explicit);
    if (!existsSync(p)) die(`--brief ${explicit} not found in ${dir}`);
    return p;
  }
  const mds = readdirSync(dir).filter((f) => f.endsWith('.md') && statSync(path.join(dir, f)).isFile()).sort();
  const named = mds.filter((f) => /^00/.test(f) || /brief/i.test(f));
  const pick = named.length === 1 ? named : mds.length === 1 ? mds : null;
  if (!pick) die(`cannot tell which file in ${dir} is the idea brief (candidates: ${(named.length ? named : mds).join(', ') || 'no .md files'}); pass --brief <file>`);
  return path.join(dir, pick[0]);
}

if (cmd === 'init') {
  const [runsRoot, runId, idea, ...flags] = rest;
  if (!runsRoot || !runId || !idea) die('Usage: node run-state.mjs init <runsRoot> <runId> <idea | brief.md | input-dir> [--brief <file>] [--language de] [--bpmn <path>] [--money-cap 15]');
  const flag = (n, d) => { const i = flags.indexOf(n); return i >= 0 ? flags[i + 1] : d; };
  const runDir = path.join(runsRoot, runId);
  const fresh = !existsSync(path.join(runDir, 'run.json'));
  for (const d of LAYOUT) mkdirSync(path.join(runDir, d), { recursive: true });
  if (fresh) {
    const bpmn = flag('--bpmn', existsSync(PLUGIN_BPMN) ? PLUGIN_BPMN : BPMN_NAME);
    const sha = existsSync(bpmn) ? createHash('sha256').update(readFileSync(bpmn)).digest('hex') : null;
    const isDir = existsSync(idea) && statSync(idea).isDirectory();
    let input = { kind: 'text' };
    let brief;
    if (isDir) {
      const briefPath = findBrief(idea, flag('--brief'));
      cpSync(idea, path.join(runDir, 'input'), { recursive: true });
      brief = readFileSync(briefPath, 'utf8');
      input = { kind: 'dir', source: path.resolve(idea), brief: path.relative(idea, briefPath), files: readdirSync(path.join(runDir, 'input'), { recursive: true }).sort() };
    } else if (existsSync(idea)) {
      brief = readFileSync(idea, 'utf8');
      input = { kind: 'file', source: path.resolve(idea) };
    } else {
      brief = `# Idee-Brief (roh)\n\n- **idee:** ${idea.trim()}\n`;
    }
    writeFileSync(path.join(runDir, 'log', 'idea-input.md'), existsSync(idea) ? brief : idea);
    writeFileSync(path.join(runDir, '00_idea-brief.md'), brief); // raw brief = S0's input; S0 commits the completed one
    saveRun(runDir, {
      runId, status: 'running', language: flag('--language', 'de'), input,
      bpmn: { path: bpmn, sha256: sha },
      position: 'Start_Geschaeftsidee',
      loopCounters: {}, pivotCount: 0,
      limits: { maxLoops: 3, pivotCap: 2, deepResearchHardCap: 3, moneyCapUsd: Number(flag('--money-cap', 15)) },
      research: { deepResearchCalls: 0, costUsd: 0, calls: [] }, // booked by product-recherche/scripts/lib/research-config.mjs
      budget: { status: 'ok' },
      modelFamilies: { producer: 'claude', critic: 'claude', persona: 'claude', criticEqualsProducer: true },
    });
  }
  writeFileSync(path.join(runsRoot, '.active'), runDir + '\n'); // read by the product-research-budget-guard hook
  // Run lives in another repo (workflow arg targetDir)? The hooks look in <project>/runs/.active, so
  // point there too, with an absolute path.
  const localRuns = path.resolve('runs');
  if (path.resolve(runsRoot) !== localRuns && !flags.includes('--no-pointer')) { // --no-pointer: harness/test runs
    mkdirSync(localRuns, { recursive: true });
    writeFileSync(path.join(localRuns, '.active'), path.resolve(runDir) + '\n');
  }
  const project = flags.includes('--ensure-project') ? ensureProject(path.dirname(path.resolve(runsRoot))) : undefined;
  logEvent(runDir, { event: fresh ? 'run-init' : 'run-resume', element: 'Start_Geschaeftsidee' });
  console.log(JSON.stringify({ runDir, fresh, project }));
} else if (cmd === 'event') {
  const [runDir, json] = rest;
  if (!runDir || !json) die('Usage: node run-state.mjs event <runDir> <json>');
  existingRun(runDir);
  const ev = JSON.parse(json);
  logEvent(runDir, ev);
  if (ev.element) { const run = loadRun(runDir); run.position = ev.element; saveRun(runDir, run); }
  console.log('{"ok":true}');
} else if (cmd === 'set') {
  const [runDir, key, json] = rest;
  if (!runDir || !key || json === undefined) die('Usage: node run-state.mjs set <runDir> <key> <json>');
  existingRun(runDir);
  const run = loadRun(runDir);
  const keys = key.split('.');
  let o = run;
  for (const k of keys.slice(0, -1)) o = o[k] ??= {};
  o[keys.at(-1)] = JSON.parse(json);
  saveRun(runDir, run);
  console.log('{"ok":true}');
} else if (cmd === 'get') {
  const [runDir] = rest;
  if (!runDir) die('Usage: node run-state.mjs get <runDir>');
  existingRun(runDir);
  console.log(JSON.stringify(loadRun(runDir)));
} else if (cmd === 'finish') {
  const [runDir, status] = rest;
  if (!runDir || !['complete', 'partial', 'discarded'].includes(status)) die('Usage: node run-state.mjs finish <runDir> <complete|partial|discarded>');
  existingRun(runDir);
  const run = loadRun(runDir);
  saveRun(runDir, { ...run, status, finishedAt: new Date().toISOString() });
  const me = path.resolve(runDir);
  const cleared = [];
  // init writes runDir as given (cwd-relative) or absolute, so resolve pointer content against cwd
  for (const p of new Set([path.join(path.dirname(me), '.active'), path.resolve('runs', '.active')])) {
    if (existsSync(p) && path.resolve(readFileSync(p, 'utf8').trim()) === me) { rmSync(p); cleared.push(p); }
  }
  logEvent(runDir, { event: 'run-finished', status });
  console.log(JSON.stringify({ runDir, status, clearedPointers: cleared.length }));
} else {
  die('Usage: node run-state.mjs init|event|set|get|finish ...');
}
process.exit(0);
