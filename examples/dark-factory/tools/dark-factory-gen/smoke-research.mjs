// Offline smoke test of the research layer (process R): Deep Research adapter (replay + every refusal
// path), normalizer (contentKind, tiers, safe dedupe, upgrade), claim ledger (triangulation, tiers,
// downgrade, report check) and the budget hook. Makes NO paid call and NO request to Google: the live
// paths run against a config whose endpoint is 127.0.0.1:59999 with a dummy key. Exit 1 on any failure.
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const HERE = path.dirname(new URL(import.meta.url).pathname);
const R = path.resolve(HERE, '../../generated/product-vision-to-user-stories/skills/product-recherche');
const HOOK = path.resolve(HERE, '../../generated/product-vision-to-user-stories/hooks/product-research-budget-guard.hook.mjs');
const base = mkdtempSync(path.join(os.tmpdir(), 'df-research-smoke-'));
const RUN = path.join(base, 'runs', 't1');
mkdirSync(path.join(RUN, 'log'), { recursive: true });
const runJson = (patch = {}) => writeFileSync(path.join(RUN, 'run.json'), JSON.stringify({ runId: 't1', limits: { deepResearchHardCap: 3, moneyCapUsd: 15 }, research: { deepResearchCalls: 0, costUsd: 0, calls: [] }, budget: { status: 'ok' }, ...patch }, null, 2));
const readRun = () => JSON.parse(readFileSync(path.join(RUN, 'run.json'), 'utf8'));
runJson();

// Test config: same as research.yaml, but the endpoint can never reach Google.
const cfgFile = path.join(base, 'research.test.yaml');
writeFileSync(cfgFile, readFileSync(path.join(R, 'research.yaml'), 'utf8').replace(/endpoint: \S+/, 'endpoint: http://127.0.0.1:59999/v1beta/interactions'));
const ENV = { ...process.env, DF_RESEARCH_CONFIG: cfgFile };
delete ENV.GEMINI_API_KEY;

let failures = 0;
const check = (name, cond, detail = '') => { console.log(`${cond ? 'ok  ' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`); if (!cond) failures++; };
const node = (script, args, env = ENV) => {
  try { return { code: 0, out: execFileSync('node', [path.join(R, 'scripts', script), ...args], { encoding: 'utf8', env, stdio: ['ignore', 'pipe', 'pipe'] }) }; }
  catch (e) { return { code: e.status, out: String(e.stdout || ''), err: String(e.stderr || '') }; }
};
const json = (s) => { try { return JSON.parse(s.trim().split('\n').at(-1)); } catch { return {}; } };

// ---------------------------------------------------------------- Deep Research adapter
const order = path.join(base, 'order.md');
writeFileSync(order, 'smoke order');
let r = node('providers/gemini-deep-research.mjs', [RUN, '--call', 'DR-01', '--replay', path.join(HERE, 'fixtures', 'dr-interaction.json')]);
check('DR replay writes raw file', r.code === 0 && json(r.out).sources === 3, r.out.trim().slice(0, 120));
check('DR replay books nothing', (readRun().research.calls || []).length === 0);

r = node('providers/gemini-deep-research.mjs', [RUN, '--call', 'DR-01', '--query-file', order, '--live']);
check('DR live without key is refused', r.code === 3 && json(r.out).status === 'refused');

const KEY = { ...ENV, GEMINI_API_KEY: 'dummy-smoke-key' };
r = node('providers/gemini-deep-research.mjs', [RUN, '--call', 'DR-01', '--query-file', order, '--live'], KEY);
const afterRefused = readRun().research;
check('DR connection refused releases the reservation', r.code === 1 && afterRefused.deepResearchCalls === 0 && afterRefused.costUsd === 0 && afterRefused.calls[0]?.status === 'released', JSON.stringify(afterRefused).slice(0, 140));

runJson({ research: { deepResearchCalls: 3, costUsd: 0, calls: [] } });
r = node('providers/gemini-deep-research.mjs', [RUN, '--call', 'DR-02', '--query-file', order, '--live'], KEY);
check('DR hard cap refuses before sending', r.code === 3 && /hard cap/.test(json(r.out).reason || ''));

runJson({ research: { deepResearchCalls: 1, costUsd: 3, calls: [{ provider: 'gemini-deep-research', callId: 'DR-01', deepResearch: true, status: 'completed' }] } });
r = node('providers/gemini-deep-research.mjs', [RUN, '--call', 'DR-01', '--query-file', order, '--live'], KEY);
check('DR second call of the same corpus is refused (gap-fill instead)', r.code === 3 && /already had/.test(json(r.out).reason || ''));

// a released or cancelled call (e.g. a stuck one voided by --cancel) is never resumed and does not use up the corpus
const lib = await import(path.join(R, 'scripts', 'lib', 'research-config.mjs'));
const voided = (status) => ({ research: { deepResearchCalls: 1, costUsd: 3, calls: [
  { provider: 'gemini-deep-research', callId: 'DR-01', deepResearch: true, status: 'completed' },
  { provider: 'gemini-deep-research', callId: 'DR-02', deepResearch: true, status, reservedUsd: 3, interactionId: 'stuck-1' }] } });
for (const status of ['released', 'cancelled']) {
  runJson(voided(status));
  check(`DR ${status} call is not resumed`, lib.pendingCall(RUN, 'gemini-deep-research', 'DR-02') === null);
  r = node('providers/gemini-deep-research.mjs', [RUN, '--call', 'DR-02', '--query-file', order, '--live'], KEY);
  check(`DR ${status} call allows a fresh call of the corpus`, r.code === 1 && /create failed/.test(json(r.out).reason || ''), r.out.trim().slice(0, 120));
}
runJson(voided('timeout'));
check('DR timed-out call is resumed', lib.pendingCall(RUN, 'gemini-deep-research', 'DR-02')?.call.interactionId === 'stuck-1');
r = node('providers/gemini-deep-research.mjs', [RUN, '--call', 'DR-02', '--cancel'], KEY);
const afterCancel = readRun().research;
const cc = afterCancel.calls[1];
check('DR --cancel voids a stuck call (released, id kept aside, cap and cost given back)', r.code === 0 && cc.status === 'released' && !cc.interactionId && cc.cancelledInteractionId === 'stuck-1' && afterCancel.deepResearchCalls === 0 && afterCancel.costUsd === 0, JSON.stringify(afterCancel).slice(0, 160));
r = node('providers/gemini-deep-research.mjs', [RUN, '--call', 'DR-02', '--cancel'], KEY);
check('DR --cancel without an unfinished call is a no-op', r.code === 0 && /no unfinished/.test(json(r.out).reason || ''));

runJson({ research: { deepResearchCalls: 1, costUsd: 13.5, calls: [] } });
r = node('providers/gemini-deep-research.mjs', [RUN, '--call', 'DR-02', '--query-file', order, '--live'], KEY);
check('DR money cap refuses before sending', r.code === 3 && /money cap/.test(json(r.out).reason || ''));
runJson();

// ---------------------------------------------------------------- normalizer
const drRaw = readdirSync(path.join(RUN, 'research', 'raw', 'gemini-dr')).find((f) => f.endsWith('.json'));
r = node('normalize-sources.mjs', [RUN, path.join(RUN, 'research', 'raw', 'gemini-dr', drRaw)]);
check('normalize keeps same-sentence citations apart', json(r.out).created?.length === 3, r.out.trim());
const rawFetch = path.join(base, 'fetch.json');
const page = (w) => `${w} `.repeat(80);
writeFileSync(rawFetch, JSON.stringify({ tool: 'websearch', query: 'alpha price', callId: 'DR-01', results: [
  { url: 'https://alpha.example/pricing', title: 'Alpha pricing', content: page('Alpha costs 5 EUR per month.'), contentKind: 'raw', publishedAt: new Date().toISOString() },
  { url: 'https://forum.example/thread', title: 'Forum', content: page('I love Alpha.'), contentKind: 'raw' },
] }));
r = node('normalize-sources.mjs', [RUN, rawFetch]);
check('raw fetch upgrades the summary record', json(r.out).upgraded?.length === 1 && json(r.out).created?.length === 1, r.out.trim());
const metas = readdirSync(path.join(RUN, 'research', 'sources')).filter((f) => f.endsWith('.meta.json')).map((f) => JSON.parse(readFileSync(path.join(RUN, 'research', 'sources', f), 'utf8')));
const byUrl = (u) => metas.find((m) => m.url === u);
check('source carries contentKind, tier, site', byUrl('https://alpha.example/pricing')?.contentKind === 'raw' && byUrl('https://forum.example/thread')?.tier === 'T3' && byUrl('https://review.example/alpha')?.site === 'review.example');

// ---------------------------------------------------------------- claim ledger
const id = (u) => byUrl(u).id;
const draft = path.join(base, 'draft.json');
writeFileSync(draft, JSON.stringify({ claims: [
  { text: 'Alpha costs 5 EUR per month', scopePoint: 'pricing-benchmarks', category: 'number', key: true, sources: [id('https://alpha.example/pricing'), id('https://review.example/alpha')] },
  { text: 'Beta is free', scopePoint: 'competitors-direct', category: 'competitor', key: true, sources: [id('https://beta.example/')] },
  { text: 'Alpha is the market leader', scopePoint: 'market-size', category: 'market', key: true, sources: [id('https://forum.example/thread'), id('https://alpha.example/pricing')] },
  { text: 'Users love Alpha', scopePoint: 'trends', category: 'voc', key: false, sources: [id('https://forum.example/thread')] },
] }));
r = node('check-claims.mjs', [RUN, 'DR-01', draft, '--round', '0']);
let out = json(r.out);
const ledger = () => JSON.parse(readFileSync(path.join(RUN, 'research', 'claims', 'DR-01.json'), 'utf8'));
let L = ledger();
check('triangulated key claim (2 sites, 1 raw)', L.claims[0].triangulated === true && L.claims[0].evidence === 'cited');
check('single-source key claim is a gap, not yet downgraded', L.claims[1].triangulated === false && L.claims[1].evidence === 'pending' && out.gaps.some((g) => g.ref === L.claims[1].id));
check('T3 cannot carry a market claim', L.claims[2].triangulated === false && L.claims[2].sourceCheck.some((s) => /tier T3/.test(s.why || '')));
check('VoC claim may rest on T3', L.claims[3].supported === true);
check('missing scope points are gaps', out.gaps.some((g) => g.kind === 'scope' && g.ref === 'feature-matrix'));
r = node('check-claims.mjs', [RUN, 'DR-01', draft, '--round', '1']);
out = json(r.out);
const ids0 = L.claims.map((c) => c.id).join();
L = ledger();
check('round 1 downgrades untriangulated key claims', L.claims[1].evidence === 'inferred' && L.claims[1].riskFlags.includes('untriangulated-key-claim') && out.gaps.length === 0);
check('claim ids are stable across rounds', L.claims.map((c) => c.id).join() === ids0);
const rep = path.join(base, 'report.md');
writeFileSync(rep, `${L.claims[0].id} (${L.claims[0].sources.join(', ')})`);
check('report citing only ledger claims passes', node('check-claims.mjs', [RUN, 'DR-01', '--verify-report', rep]).code === 0);
writeFileSync(rep, `${L.claims[0].id} and SRC-9999`);
check('report citing a non-ledger source fails', node('check-claims.mjs', [RUN, 'DR-01', '--verify-report', rep]).code === 1);

// ---------------------------------------------------------------- budget hook
mkdirSync(path.join(base, 'runs'), { recursive: true });
writeFileSync(path.join(base, 'runs', '.active'), RUN + '\n');
const hook = (payload) => { try { execFileSync('node', [HOOK], { input: JSON.stringify(payload), encoding: 'utf8', env: { ...process.env, CLAUDE_PROJECT_DIR: base }, stdio: ['pipe', 'pipe', 'pipe'] }); return 0; } catch (e) { return e.status; } };
check('hook allows ordinary Bash', hook({ tool_name: 'Bash', tool_input: { command: 'ls' } }) === 0);
check('hook blocks direct Gemini API calls', hook({ tool_name: 'Bash', tool_input: { command: 'curl https://generativelanguage.googleapis.com/v1beta/interactions' } }) === 2);
check('hook blocks NotebookLM research', hook({ tool_name: 'mcp__gemini-notebook-mcp__research_start', tool_input: { mode: 'deep' } }) === 2);
runJson({ research: { deepResearchCalls: 3, costUsd: 0, calls: [] } });
check('hook blocks a live DR call at the hard cap', hook({ tool_name: 'Bash', tool_input: { command: 'node providers/gemini-deep-research.mjs runs/t1 --call DR-02 --query-file o.md --live' } }) === 2);
runJson({ research: { deepResearchCalls: 3, costUsd: 0, calls: [{ provider: 'gemini-deep-research', callId: 'DR-02', deepResearch: true, status: 'released', interactionId: 'x' }] } });
check('hook does not treat a released call as resumable', hook({ tool_name: 'Bash', tool_input: { command: 'node providers/gemini-deep-research.mjs runs/t1 --call DR-02 --query-file o.md --live' } }) === 2);
runJson({ research: { deepResearchCalls: 3, costUsd: 0, calls: [] } });
check('hook allows replay at the hard cap', hook({ tool_name: 'Bash', tool_input: { command: 'node providers/gemini-deep-research.mjs runs/t1 --call DR-02 --replay x.json' } }) === 0);
runJson({ budget: { status: 'exhausted' } });
check('hook blocks WebSearch when the budget is exhausted', hook({ tool_name: 'WebSearch', tool_input: { query: 'x' } }) === 2);

console.log(failures ? `${failures} research smoke check(s) FAILED` : 'research smoke ok');
process.exit(failures ? 1 : 0);
