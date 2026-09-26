// Smoke test for the generated deterministic scripts, in a throwaway run under the OS temp dir.
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync, readFileSync, mkdtempSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const R = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../../generated/product-vision-to-user-stories/skills');
const base = mkdtempSync(path.join(os.tmpdir(), 'df-smoke-'));
process.chdir(base);
const sh = (script, ...a) => execFileSync('node', [path.join(R, script), ...a], { encoding: 'utf8' }).trim();
console.log('init', sh('product-traceability/scripts/run-state.mjs', 'init', 'runs', 't1', 'Meal planner for busy parents'));
const RUN = 'runs/t1';
if (!readFileSync(`${RUN}/00_idea-brief.md`, 'utf8').includes('Meal planner')) throw new Error('init: text idea not written to 00_idea-brief.md');
// idea as a folder: brief + supporting material land in <runDir>/input/, the brief in 00_idea-brief.md
mkdirSync('idea-in/sub', { recursive: true });
writeFileSync('idea-in/00_idee-brief.md', '# Brief\n\n- **idee:** Fair broker\n\nSee [market](01_markt.md).\n');
writeFileSync('idea-in/01_markt.md', '# Markt\n');
writeFileSync('idea-in/sub/notes.txt', 'x\n');
sh('product-traceability/scripts/run-state.mjs', 'init', 'runs', 't2', 'idea-in', '--no-pointer');
const t2 = JSON.parse(readFileSync('runs/t2/run.json', 'utf8')).input;
if (t2?.kind !== 'dir' || t2.brief !== '00_idee-brief.md' || !readFileSync('runs/t2/input/sub/notes.txt', 'utf8')
  || !readFileSync('runs/t2/00_idea-brief.md', 'utf8').includes('Fair broker')) throw new Error(`init: folder input not copied (${JSON.stringify(t2)})`);
writeFileSync('idea-in/02_brief-notes.md', '# more\n');
try { sh('product-traceability/scripts/run-state.mjs', 'init', 'runs', 't3', 'idea-in', '--no-pointer'); throw new Error('init: ambiguous brief accepted'); } catch (e) { if (/accepted/.test(e.message)) throw e; }
sh('product-traceability/scripts/run-state.mjs', 'init', 'runs', 't3', 'idea-in', '--brief', '00_idee-brief.md', '--no-pointer');
writeFileSync('runs/.active', `${RUN}\n`); // keep t1 the active run for the rest of the test
console.log('init folder input ok');
const shIn = (input, script, ...a) => execFileSync('node', [path.join(R, script), ...a], { encoding: 'utf8', input, stdio: ['pipe', 'pipe', 'pipe'] }).trim();
const shFail = (input, script, ...a) => { try { shIn(input, script, ...a); return 'accepted (unexpected)'; } catch (e) { return `rejected: ${String(e.stderr).trim().split('\n').slice(0, 2).join(' ')}`; } };
const COMMIT = 'product-traceability/scripts/commit-artifact.mjs';
// producer flow: write the body only, then commit it with the authored block
const mk = (rel, step, items, extra = [], authoredExtra = {}) => {
  const f = path.join(RUN, rel);
  mkdirSync(path.dirname(f), { recursive: true });
  writeFileSync(f, `# ${path.basename(rel)}\n\nbody\n`);
  const out = JSON.parse(shIn(JSON.stringify({ itemIndex: items, ...authoredExtra }), COMMIT, 'commit', RUN, f, '--step', step, ...extra));
  if (out.warnings?.length) console.log('  warn', rel, out.warnings.join('; '));
  return f;
};
const it = (id, derivedFrom, evidence = 'inferred', refs) => ({ id, derivedFrom, evidence, ...(refs ? { refs } : {}) });
const vis = mk('artifacts/p1-strategie/1.1.2_vision-statement.md', 'S1.1.2', [it('VIS-001', [])]);
mk('artifacts/p1-strategie/1.2.1_business-goals.md', 'S1.2.1', [it('GOAL-001', ['VIS-001'])]);
mk('artifacts/p1-strategie/1.2.3_impacts.md', 'S1.2.3', [it('IMP-001', ['GOAL-001'])]);
mk('artifacts/p2-research/2.2.4_opportunity-solution-tree.md', 'S2.2.4', [it('OPP-001', ['IMP-001'])]);
mk('artifacts/p4-story-map/4.1.3_backbone.md', 'S4.1.3', [it('ACTV-001', ['OPP-001']), it('EP-001', ['ACTV-001']), it('UT-001', ['EP-001']), it('EP-002', [])]);
const ep = mk('backlog/epics/EP-001_plan-week.md', 'S4.1.3', [it('EP-001', ['ACTV-001'])], ['--type', 'epic'], { attributes: { title: 'Plan the week', slice: null } });
console.log('attrs', shIn('', COMMIT, 'attrs', RUN, ep, '{"slice":1}'));
console.log('query slice=1', JSON.parse(shIn('', COMMIT, 'query', RUN, '--type', 'epic', '--attr', 'slice=1')).map((x) => x.id).join(','));
const st = mk('backlog/stories/ST-001_plan.md', 'S5.1.1', [it('ST-001', ['UT-001']), it('ST-002', ['UT-009'])]);
mk('artifacts/p6-akzeptanz/ST-001/6.1.3_acceptance-criteria.md', 'S6.1.3', [it('AC-001', ['ST-001'])]);
const stMeta = JSON.parse(readFileSync(st.replace(/\.md$/, '.meta.json'), 'utf8'));
console.log('story sidecar', stMeta.id, `v${stMeta.version}`, stMeta.status, JSON.stringify(stMeta.derived.evidence), 'derivedFrom', stMeta.derivedFrom.map((d) => `${d.artifact}@${d.version}`).join(','));
console.log('rendered fm', readFileSync(st, 'utf8').split('\n').slice(0, 3).join(' | '));
// idempotent re-commit, then a real change -> v2 + history
console.log('re-commit', shIn(JSON.stringify({ itemIndex: [it('ST-001', ['UT-001']), it('ST-002', ['UT-009'])] }), COMMIT, 'commit', RUN, st, '--step', 'S5.1.1'));
writeFileSync(st, readFileSync(st, 'utf8') + '\n## Acceptance criteria\n\n- AC-001\n');
console.log('amend by 6.1.1', shIn(JSON.stringify({ itemIndex: [it('ST-001', ['UT-001']), it('ST-002', ['UT-009'])] }), COMMIT, 'commit', RUN, st, '--step', 'S6.1.1'));
// the script rejects what the model must not decide
console.log('reject version', shFail(JSON.stringify({ itemIndex: [], version: 3 }), COMMIT, 'commit', RUN, vis, '--step', 'S1.1.2'));
console.log('reject cited w/o SRC', shFail(JSON.stringify({ itemIndex: [it('VIS-001', [], 'cited')] }), COMMIT, 'commit', RUN, vis, '--step', 'S1.1.2'));
console.log('reject dangling SRC', shFail(JSON.stringify({ itemIndex: [it('VIS-001', [], 'cited', ['SRC-0999'])] }), COMMIT, 'commit', RUN, vis, '--step', 'S1.1.2'));
writeFileSync(path.join(RUN, 'artifacts/p1-strategie/1.1.3_lean-canvas.md'), '# uncommitted\n');
try { execFileSync('node', [path.join(R, COMMIT), 'check', RUN], { encoding: 'utf8' }); console.log('check: all committed (unexpected)'); } catch (e) { console.log('check', JSON.stringify(JSON.parse(e.stdout).problems)); }
console.log('6.2.1', sh('product-traceability/scripts/trace-story-epic.mjs', RUN));
console.log('6.2.2', sh('product-traceability/scripts/trace-epic-vision.mjs', RUN));
console.log('6.2.5', sh('product-traceability/scripts/traceability-matrix.mjs', RUN));
console.log(readFileSync(path.join(RUN, 'backlog/traceability.md'), 'utf8').split('\n').slice(-4).join('\n'));

const lr = JSON.parse(sh('product-kritiker-pruefung/scripts/load-rubric.mjs', 'phase-1-1', vis));
console.log('rubric phase-1-1 criteria', lr.criteria.length, '| gate question', lr.gateQuestion, '| contract problems', JSON.stringify(lr.artifacts[0].problems));
console.log('K.1 uncommitted', JSON.stringify(JSON.parse(sh('product-kritiker-pruefung/scripts/load-rubric.mjs', 'phase-1-1', path.join(RUN, 'artifacts/p1-strategie/1.1.3_lean-canvas.md'))).artifacts[0].problems));
for (const g of ['gate-vision', 'gate-validierung', 'gate-mvp', 'traceability', 'invest']) console.log(' ', g, JSON.parse(sh('product-kritiker-pruefung/scripts/load-rubric.mjs', g)).criteria.length);

writeFileSync('ev.json', JSON.stringify({ threshold: 0.8, iteration: 3, maxLoops: 3, criteria: [{ id: 'a', result: 'pass' }, { id: 'b', result: 'partial', weight: 2 }], factchecks: [{ claim: 'x', criterion: 'a', result: 'refuted' }] }));
console.log('K.4 at cap', sh('product-kritiker-pruefung/scripts/verdict.mjs', 'ev.json'));
writeFileSync('ev2.json', JSON.stringify({ iteration: 1, criteria: [{ id: 'a', result: 'pass' }, { id: 'b', result: 'fail', kill: true }] }));
console.log('K.4 kill', sh('product-kritiker-pruefung/scripts/verdict.mjs', 'ev2.json'));

writeFileSync('rec.json', JSON.stringify({ gateway: 'SP1.1_Gw', iteration: 1, artifacts: [vis], rubric: 'phase-1-1', score: 0.86, verdict: 'pass', pathTaken: 'SP1.1_End', criteria: [{ id: 'a', result: 'pass', reason: 'ok' }], riskFlags: [] }));
console.log('K.5', sh('product-kritiker-pruefung/scripts/write-gate-record.mjs', RUN, 'rec.json'));
const vm = JSON.parse(readFileSync(vis.replace(/\.md$/, '.meta.json'), 'utf8'));
console.log('vision after gate', vm.status, JSON.stringify(vm.gate), '| fm', readFileSync(vis, 'utf8').split('\n').filter((l) => /^(status|gate):/.test(l)).join(' | '));

const votes = [5, 4, 4, 2].map((v, i) => ({ persona: `P-00${i + 1}`, role: 'target', vote: v })).concat([{ persona: 'P-005', role: 'contrarian', vote: 1 }]);
writeFileSync('ag.json', JSON.stringify({ gate: 'G-P2', criticVerdict: 'pass', iteration: 1, pivotCount: 0, votes, objectionsAddressed: true, citedShare: 0.6 }));
console.log('PG.1 G-P2', sh('product-phasen-gate/scripts/aggregate-gate.mjs', 'ag.json'));
writeFileSync('ag2.json', JSON.stringify({ gate: 'G-P2', criticVerdict: 'fail', iteration: 1, pivotCount: 2, votes, objectionsAddressed: true, citedShare: 0.8, viabilityFailed: true }));
console.log('PG.1 G-P2 pivot cap', sh('product-phasen-gate/scripts/aggregate-gate.mjs', 'ag2.json'));

writeFileSync('raw.json', JSON.stringify({ tool: 'websearch', query: 'meal planner apps', callId: 'DR-01', results: [{ url: 'https://www.example.com/a?utm_source=x', title: 'Mealime review', content: '<p>Great app</p>', sourceType: 'review' }, { url: 'https://example.com/a', title: 'dup', content: 'other' }] }));
console.log('R.3', sh('product-recherche/scripts/normalize-sources.mjs', RUN, 'raw.json'));
writeFileSync('sess.json', JSON.stringify({ mode: 'vote', panelSet: 'proto', stepId: 'G-P1', stimulus: 'x.md', answers: [{ personaId: 'P-001', personaRole: 'target', vote: { score: 4, reason: 'saves time' } }] }));
console.log('P.3', sh('product-panel-befragung/scripts/record-transcript.mjs', RUN, 'sess.json'));
console.log(readFileSync(path.join(RUN, 'run.json'), 'utf8'));
console.log('history', execFileSync('find', [path.join(RUN, 'history'), '-type', 'f'], { encoding: 'utf8' }).trim().split('\n').map((f) => path.relative(RUN, f)).sort().join(' '));
console.log('events', readFileSync(path.join(RUN, 'log/events.jsonl'), 'utf8').trim().split('\n').length);

// hooks
const H = path.join(R, '..', 'hooks');
const hook = (name, payload) => { try { execFileSync('node', [path.join(H, name)], { input: JSON.stringify(payload), encoding: 'utf8', env: { ...process.env, CLAUDE_PROJECT_DIR: base } }); return 0; } catch (e) { return `${e.status} ${String(e.stderr).trim().slice(0, 110)}`; } };
const guard = (file, content, tool = 'Write') => hook('product-artifact-contract-guard.hook.mjs', { tool_name: tool, tool_input: { file_path: path.join(base, RUN, file), ...(content !== undefined ? { content } : {}) } });
console.log('guard body ok', guard('artifacts/p1-strategie/1.1.3_lean-canvas.md', '# Lean canvas\n'));
console.log('guard frontmatter', guard('artifacts/p1-strategie/1.1.3_lean-canvas.md', '---\nid: x\nstatus: passed\n---\nbody'));
console.log('guard sidecar', guard('artifacts/p1-strategie/1.1.2_vision-statement.meta.json', '{}'));
console.log('guard gate md', guard('gates/G-001_SP1.1_Gw_iter1.md', '# x'));
console.log('guard run.json edit', guard('run.json', undefined, 'Edit'));
// Research budget guard: covered in detail by smoke-research.mjs; here only the direct-API block.
console.log('direct Gemini API', hook('product-research-budget-guard.hook.mjs', { tool_name: 'Bash', tool_input: { command: 'curl https://generativelanguage.googleapis.com/v1beta/interactions' } }));
console.log('persona write', hook('product-critic-readonly-guard.hook.mjs', { agent_type: 'product-persona', tool_input: { file_path: 'runs/t1/panel/x.md' } }));
// plugin agents arrive namespaced (D-35): the guard must still recognise them
const nsPersona = hook('product-critic-readonly-guard.hook.mjs', { agent_type: 'dark-factory:product-persona', tool_input: { file_path: 'runs/t1/panel/x.md' } });
const nsCritic = hook('product-critic-readonly-guard.hook.mjs', { agent_type: 'dark-factory:product-kritiker', tool_input: { file_path: 'runs/t1/artifacts/p1-strategie/1.1.2_vision-statement.md' } });
console.log('namespaced persona write', nsPersona, '· namespaced critic write', nsCritic);
if (!String(nsPersona).startsWith('2 ') || !String(nsCritic).startsWith('2 ')) throw new Error('product-critic-readonly-guard ignores namespaced plugin agents');
console.log('critic own glossary', hook('product-critic-readonly-guard.hook.mjs', { agent_type: 'product-kritiker', tool_input: { file_path: 'runs/t1/artifacts/p6-akzeptanz/6.2.3_glossary.md' } }));
