#!/usr/bin/env node
// bpmn: {"file":"product-vision-to-user-stories.bpmn","elements":["S7"]}
//
// Last deterministic part of "7 Abschluss": copies the curated results of a finished run from the
// gitignored run workspace into the target project's committed publish directory, so later factory
// parts read a stable path instead of runs/<runId>/ (docs/dark-factory/implementation.md §6, D-34).
// No LLM.
//
// Usage: node publish-results.mjs <runDir> [--dry-run]
//
// The target project is the repo that contains runs/ (D-32): <runDir>/../.. . It opts in with the
// manifest .dark-factory/project.json (df.project/v1, D-33); without one nothing is published and
// the script exits 0. A partial run (backlog.json status "partial") is never published (exit 1).
// Only bodies and the backlog export are copied: gates, sources, panel and history stay in the run.
// Discarded / superseded stories and discarded spikes are skipped. <publishDir>/.published.json
// records runId and files; files of the previous publish that the new one no longer has are
// removed, every other file in <publishDir> is left alone. Prints {published, dir, runId, files, removed}.
import path from 'node:path';
import { copyFileSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { readJson, writeJson, loadRun, saveRun, logEvent, die } from './lib/df.mjs';
import { committed } from './lib/commit.mjs';

// artifact type -> folder inside publishDir (file keeps its run name)
const PUBLISH = {
  'run-report': '.', 'glossary': '.',
  'traceability-matrix': 'backlog', 'epic': 'backlog/epics', 'story-cards': 'backlog/stories', 'spikes': 'backlog/spikes',
  'vision-statement': 'strategy', 'lean-canvas': 'strategy', 'business-goals': 'strategy', 'impact-map': 'strategy', 'roadmap': 'strategy',
  'personas': 'users', 'jtbd': 'users', 'journey-future': 'users', 'service-blueprint': 'users',
  'release-goals': 'story-map', 'walking-skeleton': 'story-map', 'story-map': 'story-map',
};
const DROPPED = { 'story-cards': ['discarded', 'superseded'], 'spikes': ['discarded'] };
const RENAME = { 'run-report': 'REPORT.md', 'glossary': 'glossary.md' };

const [, , runDir, ...flags] = process.argv;
if (!runDir) die('Usage: node publish-results.mjs <runDir> [--dry-run]');
const dry = flags.includes('--dry-run');
const root = path.resolve(runDir, '..', '..');
const manifestFile = path.join(root, '.dark-factory', 'project.json');
if (!existsSync(manifestFile)) {
  console.log(JSON.stringify({ published: false, reason: `no .dark-factory/project.json in ${root} — this repo is not a target project, nothing published` }));
  process.exit(0);
}
const project = readJson(manifestFile);
if (project.schema !== 'df.project/v1') die(`${manifestFile}: schema must be df.project/v1`);
const publishDir = project.publishDir || 'docs/product';
const dir = path.resolve(root, publishDir);
if (path.isAbsolute(publishDir) || !dir.startsWith(root + path.sep) || dir.startsWith(path.resolve(root, 'runs') + path.sep) || dir === path.resolve(root, 'runs')) {
  die(`${manifestFile}: publishDir "${publishDir}" must be a relative path inside the project and outside runs/`);
}

const run = loadRun(runDir);
const backlogFile = path.join(runDir, 'backlog', 'backlog.json');
if (!existsSync(backlogFile)) die('not published: backlog/backlog.json is missing — run export-backlog.mjs first', 1);
if (readJson(backlogFile).status !== 'complete' || run.status === 'partial') die('not published: the run is partial (budget exhausted) — only complete runs are published', 1);

const files = [{ from: backlogFile, to: 'backlog/backlog.json' }];
for (const { md, meta } of committed(runDir)) {
  const folder = PUBLISH[meta.type];
  if (folder === undefined || !existsSync(md)) continue;
  if ((DROPPED[meta.type] || []).includes(meta.authored?.attributes?.status)) continue;
  files.push({ from: md, to: path.posix.join(folder, RENAME[meta.type] || path.basename(md)) });
}
if (!files.some((f) => f.to === 'REPORT.md')) die('not published: REPORT.md is not committed yet — commit it before publishing', 1);
files.sort((a, b) => a.to.localeCompare(b.to));

const recordFile = path.join(dir, '.published.json');
const previous = existsSync(recordFile) ? readJson(recordFile).files || [] : [];
const now = new Set(files.map((f) => f.to));
const removed = previous.filter((f) => !now.has(f) && !f.split('/').includes('..'));
if (!dry) {
  for (const f of removed) rmSync(path.join(dir, f), { force: true });
  for (const f of files) { const to = path.join(dir, f.to); mkdirSync(path.dirname(to), { recursive: true }); copyFileSync(f.from, to); }
  const record = { schema: 'df.published/v1', runId: run.runId, run: path.relative(root, path.resolve(runDir)), publishedAt: new Date().toISOString(), files: files.map((f) => f.to) };
  writeJson(recordFile, record);
  saveRun(runDir, { ...loadRun(runDir), published: { dir: publishDir, at: record.publishedAt, files: files.length } });
  logEvent(runDir, { event: 'published', element: 'S7', dir: publishDir, files: files.length, removed: removed.length });
}
console.log(JSON.stringify({ published: !dry, dryRun: dry, dir: publishDir, runId: run.runId, files: files.length, removed }));
