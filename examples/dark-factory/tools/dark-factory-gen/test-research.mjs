// Research-only harness (D-26): runs the deterministic part of process R for ONE corpus call in a
// throwaway run, without the full Workflow — init run → Deep Research (replay or ONE live call) →
// normalize → fetch real page text for the cited sources → normalize again. The LLM parts (claims,
// synthesis) are then done by the researcher agent on this run, or by the end-to-end Workflow.
//
// Usage (from the repo root):
//   node factory/tools/dark-factory-gen/test-research.mjs --replay <interaction.json> [--call DR-01] [--runs <dir>]
//   node factory/tools/dark-factory-gen/test-research.mjs --live --yes-spend --order <order.md> [--call DR-01] [--runs <dir>]
//
// --live makes exactly ONE paid Gemini Deep Research call (≈ minutes, cost booked in run.json) and
// needs --yes-spend as an explicit confirmation. Default runs dir: a new temp dir (nothing in the repo).
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const argv = process.argv.slice(2);
const opt = (n) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : undefined; };
const HERE = path.dirname(new URL(import.meta.url).pathname);
const SK = path.resolve(HERE, '../../generated/product-vision-to-user-stories/skills');
const callId = opt('--call') || 'DR-01';
const live = argv.includes('--live');
if (!live && !opt('--replay')) { console.error('Usage: test-research.mjs (--replay <interaction.json> | --live --yes-spend --order <order.md>) [--call DR-01] [--runs <dir>]'); process.exit(2); }
if (live && !argv.includes('--yes-spend')) { console.error('--live makes one PAID Gemini Deep Research call; add --yes-spend to confirm.'); process.exit(2); }
if (live && !opt('--order')) { console.error('--live needs --order <order.md> (the research order text)'); process.exit(2); }

const runsRoot = opt('--runs') || path.join(mkdtempSync(path.join(os.tmpdir(), 'df-research-')), 'runs');
const runId = `research-test_${callId}_${Date.now().toString(36)}`;
const sh = (script, ...a) => {
  try { return execFileSync('node', [path.join(SK, script), ...a], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] }).trim(); }
  catch (e) { return String(e.stdout || '').trim(); }
};
const last = (s) => { try { return JSON.parse(s.split('\n').at(-1)); } catch { return { raw: s }; } };
const step = (name, res) => { console.log(`── ${name}\n${JSON.stringify(res, null, 1).slice(0, 800)}`); return res; };

const init = step('init run', last(sh('product-traceability/scripts/run-state.mjs', 'init', runsRoot, runId, 'Research harness test run', '--no-pointer')));
const runDir = init.runDir;
const dr = step(live ? 'Deep Research (LIVE, one paid call)' : 'Deep Research (replay, free)', last(live
  ? sh('product-recherche/scripts/providers/gemini-deep-research.mjs', runDir, '--call', callId, '--query-file', opt('--order'), '--live')
  : sh('product-recherche/scripts/providers/gemini-deep-research.mjs', runDir, '--call', callId, '--replay', opt('--replay'))));
if (dr.status !== 'done') { console.error('Deep Research did not complete — stopping.'); process.exit(1); }
step('normalize DR citations', last(sh('product-recherche/scripts/normalize-sources.mjs', runDir, dr.rawFile)));
const fetched = step('fetch real page text', last(sh('product-recherche/scripts/providers/raw-fetch.mjs', runDir, '--call', callId, '--upgrade-summaries')));
if (fetched.rawFile) step('normalize page text', last(sh('product-recherche/scripts/normalize-sources.mjs', runDir, fetched.rawFile)));

const metas = readdirSync(path.join(runDir, 'research', 'sources')).filter((f) => f.endsWith('.meta.json')).map((f) => JSON.parse(readFileSync(path.join(runDir, 'research', 'sources', f), 'utf8')));
const count = (k, v) => metas.filter((m) => m[k] === v).length;
const run = JSON.parse(readFileSync(path.join(runDir, 'run.json'), 'utf8'));
const summary = {
  runDir, sources: metas.length, raw: count('contentKind', 'raw'), summaryOnly: count('contentKind', 'summary'),
  tiers: { T1: count('tier', 'T1'), T2: count('tier', 'T2'), T3: count('tier', 'T3') },
  deepResearchCalls: run.research?.deepResearchCalls ?? 0, costUsd: run.research?.costUsd ?? 0,
  next: `researcher agent: product-recherche mode "claims" then "synthesize" on ${runDir} (callId ${callId})`,
};
writeFileSync(path.join(runDir, 'log', 'research-harness.json'), JSON.stringify(summary, null, 2) + '\n');
step('summary', summary);
