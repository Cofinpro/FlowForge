// Smoke test for JSON-first stories (Gedächtnis §11.3): story.mjs put/patch/show/list/next-id,
// the split and discard paths, AC linking, export-backlog.mjs, publish-results.mjs, the contract guard
// and product-init's init-project.mjs (D-37) — in a
// throwaway run under the OS temp dir. Exits non-zero on the first unexpected result.
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync, readFileSync, mkdtempSync, existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const R = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../../generated/product-vision-to-user-stories/skills');
const H = path.join(R, '..', 'hooks');
const base = mkdtempSync(path.join(os.tmpdir(), 'df-story-smoke-'));
process.chdir(base);
const RUN = 'runs/s1';
const run = (script, args, input = '') => execFileSync('node', [path.join(R, script), ...args], { encoding: 'utf8', input, stdio: ['pipe', 'pipe', 'pipe'] }).trim();
const fails = (script, args, input) => { try { run(script, args, input); return null; } catch (e) { return String(e.stderr).trim(); } };
const ok = (cond, msg) => { if (!cond) { console.error(`FAIL: ${msg}`); process.exit(1); } console.log(`ok   ${msg}`); };
const STORY = 'product-traceability/scripts/story.mjs';
const COMMIT = 'product-traceability/scripts/commit-artifact.mjs';
const SPIKE = 'product-traceability/scripts/spike.mjs';
const J = (x) => JSON.stringify(x);

run('product-traceability/scripts/run-state.mjs', ['init', 'runs', 's1', 'Meal planner for busy parents']);
// upstream chain VIS → GOAL → IMP → OPP → ACTV/EP/UT, committed as ordinary artifacts
const art = (rel, step, items, extra = [], authored = {}) => {
  const f = path.join(RUN, rel);
  mkdirSync(path.dirname(f), { recursive: true });
  writeFileSync(f, `# ${path.basename(rel)}\n\nbody\n`);
  run(COMMIT, ['commit', RUN, f, '--step', step, ...extra], J({ itemIndex: items, ...authored }));
  return f;
};
const it = (id, derivedFrom) => ({ id, derivedFrom, evidence: 'inferred' });
art('artifacts/p1-strategie/1.1.2_vision-statement.md', 'S1.1.2', [it('VIS-001', [])]);
art('artifacts/p1-strategie/1.2.1_business-goals.md', 'S1.2.1', [it('GOAL-001', ['VIS-001'])]);
art('artifacts/p1-strategie/1.2.3_impacts.md', 'S1.2.3', [it('IMP-001', ['GOAL-001'])]);
art('artifacts/p2-research/2.2.4_ost.md', 'S2.2.4', [it('OPP-001', ['IMP-001'])]);
art('artifacts/p4-story-map/4.1.3_backbone.md', 'S4.1.3', [it('ACTV-001', ['OPP-001']), it('EP-001', ['ACTV-001', 'OPP-001']), it('UT-001', ['EP-001'])]);
const ep = art('backlog/epics/EP-001_plan-week.md', 'S4.1.3', [it('EP-001', ['ACTV-001', 'OPP-001'])], ['--type', 'epic'], { attributes: { title: 'Plan the week', slice: null } });
run(COMMIT, ['attrs', RUN, ep, '{"slice":1}']);

// put
const [id1, id2] = JSON.parse(run(STORY, ['next-id', RUN, '--count', '2']));
ok(id1 === 'ST-001' && id2 === 'ST-002', `next-id → ${id1}, ${id2}`);
const story = (id, over = {}) => ({ id, title: `Plan the week ${id}`, epic: 'EP-001', userTask: 'UT-001', connextra: { role: 'working parent', want: 'to plan all dinners at once', soThat: 'I stop deciding every evening' }, derivedFrom: ['UT-001', 'EP-001'], evidence: 'inferred', size: { class: 'M', reasoning: '3 rules' }, ...over });
const put1 = JSON.parse(run(STORY, ['put', RUN, '--step', 'S5.1.1'], J({ story: story(id1), notesForNext: 'split candidate?' })));
ok(put1.version === 1 && put1.path === 'backlog/stories/ST-001_plan-the-week-st-001.md', `put ${id1} → ${put1.path} v${put1.version}`);
const md1 = path.join(RUN, put1.path);
ok(readFileSync(md1, 'utf8').includes('**As a** working parent'), 'story Markdown rendered from the record');
ok(JSON.parse(run(STORY, ['put', RUN, '--step', 'S5.1.1'], J({ story: story(id1), notesForNext: 'split candidate?' }))).unchanged === true, 're-put of an unchanged story is a no-op');

// rejections
ok(/unknown story field "points"/.test(fails(STORY, ['put', RUN, '--step', 'S5.1.1'], J({ story: story(id2, { points: 5 }) }))), 'rejects unknown story field');
ok(/size L forces splitting/.test(fails(STORY, ['put', RUN, '--step', 'S5.1.1'], J({ story: story(id2, { size: { class: 'L', reasoning: 'big' } }) }))), 'rejects active size-L story');
ok(/must include the userTask/.test(fails(STORY, ['put', RUN, '--step', 'S5.1.1'], J({ story: story(id2, { derivedFrom: ['EP-001'] }) }))), 'rejects derivedFrom without the user task');
ok(/unknown key\(s\) version/.test(fails(STORY, ['put', RUN, '--step', 'S5.1.1'], J({ story: story(id2), version: 3 }))), 'rejects envelope fields from the model');

// split: ST-002, ST-003 children of ST-001
run(STORY, ['put', RUN, '--step', 'S5.1.3'], J({ story: story('ST-002', { splitFrom: id1, splitPattern: 'by business rule', size: { class: 'S', reasoning: '1 rule' } }) }));
run(STORY, ['put', RUN, '--step', 'S5.1.3'], J({ story: story('ST-003', { splitFrom: id1, splitPattern: 'by business rule', size: { class: 'S', reasoning: '1 rule' } }) }));
ok(/needs splitInto/.test(fails(STORY, ['patch', RUN, id1, '--step', 'S5.1.3'], J({ story: { status: 'superseded' } }))), 'superseded parent needs splitInto');
const sup = JSON.parse(run(STORY, ['patch', RUN, id1, '--step', 'S5.1.3'], J({ story: { status: 'superseded', splitInto: ['ST-002', 'ST-003'] } })));
ok(sup.version === 2, `parent ${id1} superseded (v${sup.version})`);
const child = JSON.parse(readFileSync(path.join(RUN, 'backlog/stories/ST-002_plan-the-week-st-002.meta.json'), 'utf8'));
ok(child.derivedFrom.length === 1 && child.derivedFrom[0].artifact === '5.1.1_story-cards_ST-001', `split child derives from its parent only (${child.derivedFrom.map((d) => d.artifact).join(',')})`);
ok(child.authored.itemIndex[0].derivedFrom.includes('ST-001'), 'child ST item links to parent item');

// patch from a refinement step (amend) + ACs
const size = JSON.parse(run(STORY, ['patch', RUN, 'ST-002', '--step', 'S5.2.4'], J({ story: { size: { class: 'M' } } })));
const m2 = JSON.parse(readFileSync(path.join(RUN, 'backlog/stories/ST-002_plan-the-week-st-002.meta.json'), 'utf8'));
ok(size.version === 2 && m2.authored.attributes.size.reasoning === '1 rule' && m2.amendedBy?.[0]?.bpmnElement === 'S5.2.4', 'patch merges size one level and records amendedBy');
const ac = { id: 'AC-001', title: 'week plan saved', kind: 'happy', given: ['a household of 4'], when: ['the parent confirms 7 dinners'], then: ['the plan is saved'] };
ok(/AC-001 is not an item of any committed acceptance-criteria/.test(fails(STORY, ['patch', RUN, 'ST-002', '--step', 'S6.1.3'], J({ story: { acceptanceCriteria: [ac] } }))), 'rejects ACs that are not committed items');
art('artifacts/p6-akzeptanz/ST-002/6.1.3_acceptance-criteria.md', 'S6.1.3', [it('AC-001', ['ST-002'])]);
run(STORY, ['patch', RUN, 'ST-002', '--step', 'S6.1.3'], J({ story: { acceptanceCriteria: [ac] } }));
ok(readFileSync(path.join(RUN, 'backlog/stories/ST-002_plan-the-week-st-002.md'), 'utf8').includes('```gherkin\nGiven a household of 4'), 'ACs rendered as Gherkin');

// discard
ok(/needs discard/.test(fails(STORY, ['patch', RUN, 'ST-003', '--step', 'S6.2.4'], J({ story: { status: 'discarded' } }))), 'discard needs a reason');
run(STORY, ['patch', RUN, 'ST-003', '--step', 'S6.2.4'], J({ story: { status: 'discarded', discard: { reason: 'duplicate', duplicateOf: 'ST-002', justification: 'same goal' } } }));

// list / show
const rows = JSON.parse(run(STORY, ['list', RUN, '--epic', 'EP-001']));
ok(rows.map((r) => `${r.id}:${r.storyStatus}`).join(',') === 'ST-001:superseded,ST-002:active,ST-003:discarded', `list → ${rows.map((r) => `${r.id}:${r.storyStatus}`).join(',')}`);
ok(JSON.parse(run(STORY, ['show', RUN, 'ST-002'])).story.acceptanceCriteria.length === 1, 'show returns the record');

// spikes (records, linked both ways to stories)
const [spk1] = JSON.parse(run(SPIKE, ['next-id', RUN]));
ok(spk1 === 'SPK-001', `spike next-id → ${spk1}`);
const spike = (id, over = {}) => ({ id, title: 'Partner recipe API', question: 'Does the partner API return quantities per portion?', why: 'ST-002 cannot be sized without it', blocks: ['ST-002'], timebox: { amount: 1, unit: 'days' }, acceptanceCriteria: ['20 sample recipes fetched and analysed'], decisionEnabled: 'size of ST-002', derivedFrom: ['ST-002', 'ASM-001'], evidence: 'inferred', ...over });
ok(/not bounded/.test(fails(SPIKE, ['put', RUN, '--step', 'S5.1.4'], J({ spike: spike(spk1, { timebox: { amount: 5, unit: 'days' } }) }))), 'rejects an unbounded spike timebox');
ok(/ST-099 in blocks is not a committed story/.test(fails(SPIKE, ['put', RUN, '--step', 'S5.1.4'], J({ spike: spike(spk1, { blocks: ['ST-099'], derivedFrom: ['ST-099'] }) }))), 'rejects a spike blocking an unknown story');
ok(/must include the blocked story ST-002/.test(fails(SPIKE, ['put', RUN, '--step', 'S5.1.4'], J({ spike: spike(spk1, { derivedFrom: ['ASM-001'] }) }))), 'rejects spike derivedFrom without the blocked story');
ok(/SPK-001 is not a committed spike record/.test(fails(STORY, ['patch', RUN, 'ST-002', '--step', 'S5.1.4'], J({ story: { spikes: ['SPK-001'] } }))), 'story cannot reference a spike that does not exist yet');
const sp1 = JSON.parse(run(SPIKE, ['put', RUN, '--step', 'S5.1.4'], J({ spike: spike(spk1) })));
ok(sp1.path === 'backlog/spikes/SPK-001_partner-recipe-api.md' && readFileSync(path.join(RUN, sp1.path), 'utf8').includes('**Question:** Does the partner API'), `spike put → ${sp1.path}, rendered`);
const spm = JSON.parse(readFileSync(path.join(RUN, 'backlog/spikes/SPK-001_partner-recipe-api.meta.json'), 'utf8'));
ok(spm.id === '5.1.4_spikes_SPK-001' && spm.derivedFrom.map((d) => d.artifact).join() === '5.1.3_story-cards_ST-002', `spike sidecar ${spm.id} derives from the blocked story file`);
run(STORY, ['patch', RUN, 'ST-002', '--step', 'S5.1.4'], J({ story: { spikes: ['SPK-001'] } }));
ok(/a done spike needs its "outcome"/.test(fails(SPIKE, ['patch', RUN, 'SPK-001', '--step', 'S5.1.4'], J({ spike: { status: 'done' } }))), 'done spike needs an outcome');
run(SPIKE, ['patch', RUN, 'SPK-001', '--step', 'S5.1.4'], J({ spike: { status: 'done', outcome: 'quantities are structured' } }));
ok(JSON.parse(run(SPIKE, ['list', RUN, '--blocks', 'ST-002']))[0]?.spikeStatus === 'done', 'spike list --blocks ST-002 → done');

// traceability skips superseded/discarded, export builds backlog.json
const t = JSON.parse(run('product-traceability/scripts/trace-story-epic.mjs', [RUN]));
ok(t.checked === 1 && t.orphans.length === 0, `6.2.1 checks only active stories (checked ${t.checked}, orphans ${t.orphans.length})`);
const ex = JSON.parse(run('product-traceability/scripts/export-backlog.mjs', [RUN]));
const bj = JSON.parse(readFileSync(path.join(RUN, 'backlog/backlog.json'), 'utf8'));
ok(ex.stories === 1 && ex.problems.length === 0 && bj.schema === 'df.backlog/v1', `export: ${ex.stories} story, ${ex.excluded} excluded, ${ex.problems.length} problems`);
ok(bj.stories[0].traceComplete && bj.stories[0].trace.join('>') === 'ST-002>UT-001>EP-001>ACTV-001>OPP-001>IMP-001>GOAL-001>VIS-001', `trace ${bj.stories[0].trace.join(' → ')}`);
ok(bj.epics[0].slice === 1 && bj.epics[0].stories.join() === 'ST-002', 'epic carries slice and its stories');
ok(bj.excluded.map((x) => x.id).join() === 'ST-001,ST-003', 'superseded and discarded stories are excluded');
ok(bj.spikes.length === 1 && bj.spikes[0].status === 'done' && bj.stats.spikes.timeboxDays === 1, 'spike exported with status and timebox total');
// a story without ACs is a problem in full mode, not in partial mode
run(STORY, ['put', RUN, '--step', 'S5.1.1'], J({ story: story('ST-004') }));
ok(/no acceptance criteria/.test(fails('product-traceability/scripts/export-backlog.mjs', [RUN]) === null ? '' : execFileSync('cat', [path.join(RUN, 'backlog/backlog.json')], { encoding: 'utf8' })), 'full export fails on a story without ACs');
ok(JSON.parse(run('product-traceability/scripts/export-backlog.mjs', [RUN, '--partial'])).stories === 2, 'partial export still writes what exists');
run(SPIKE, ['put', RUN, '--step', 'S5.1.4'], J({ spike: spike('SPK-002', { title: 'Second spike' }) }));
ok(JSON.parse(run('product-traceability/scripts/export-backlog.mjs', [RUN, '--partial'])).problems.some((x) => x === 'SPK-002: ST-002 does not list it in spikes'), 'export reports a one-sided spike link');

// publish into the target project (D-32 … D-34): the repo that holds runs/ is the target
const PUB = 'product-traceability/scripts/publish-results.mjs';
ok(JSON.parse(run(PUB, [RUN])).published === false, 'publish without .dark-factory/project.json is a no-op');
mkdirSync('.dark-factory', { recursive: true });
writeFileSync('.dark-factory/project.json', J({ schema: 'df.project/v1', name: 'smoke', publishDir: 'docs/product' }));
ok(/partial/.test(fails(PUB, [RUN]) || ''), 'publish refuses a partial backlog');
run(STORY, ['patch', RUN, 'ST-004', '--step', 'S6.2.4'], J({ story: { status: 'discarded', discard: { reason: 'orphan', justification: 'smoke: no AC yet' } } }));
run(SPIKE, ['patch', RUN, 'SPK-002', '--step', 'S6.2.4'], J({ spike: { status: 'discarded' } }));
ok(JSON.parse(run('product-traceability/scripts/export-backlog.mjs', [RUN])).problems.length === 0, 'full export is clean again');
ok(/REPORT\.md/.test(fails(PUB, [RUN]) || ''), 'publish refuses a run without a committed REPORT.md');
art('REPORT.md', 'S7', [], ['--type', 'run-report']);
mkdirSync('docs/product/strategy', { recursive: true });
writeFileSync('docs/product/notes.md', 'hand-written\n');
writeFileSync('docs/product/strategy/stale.md', 'from an older run\n');
writeFileSync('docs/product/.published.json', J({ schema: 'df.published/v1', runId: 's0', files: ['strategy/stale.md'] }));
const pub = JSON.parse(run(PUB, [RUN]));
const P = (f) => existsSync(path.join('docs/product', f));
ok(pub.published && P('REPORT.md') && P('backlog/backlog.json') && P('strategy/1.1.2_vision-statement.md') && P('backlog/epics/EP-001_plan-week.md'), `publish copies report, backlog and strategy (${pub.files} files)`);
ok(readdirSync('docs/product/backlog/stories').every((f) => f.startsWith('ST-002_')) && readdirSync('docs/product/backlog/spikes').join() === 'SPK-001_partner-recipe-api.md', 'publish skips superseded/discarded stories and discarded spikes');
ok(!P('strategy/stale.md') && P('notes.md') && pub.removed.join() === 'strategy/stale.md', 'publish removes files of the previous publish only');
ok(JSON.parse(readFileSync('docs/product/.published.json', 'utf8')).runId === 's1' && JSON.parse(readFileSync(path.join(RUN, 'run.json'), 'utf8')).published.dir === 'docs/product', 'publish records runId and marks run.json');
writeFileSync('.dark-factory/project.json', J({ schema: 'df.project/v1', publishDir: 'runs/x' }));
ok(/publishDir/.test(fails(PUB, [RUN]) || ''), 'publishDir inside runs/ is rejected');
writeFileSync('.dark-factory/project.json', J({ schema: 'df.project/v1', publishDir: '../elsewhere' }));
ok(/publishDir/.test(fails(PUB, [RUN]) || ''), 'publishDir outside the project is rejected');

// guard
const guard =(rel, content) => { try { execFileSync('node', [path.join(H, 'product-artifact-contract-guard.hook.mjs')], { input: J({ tool_name: 'Write', tool_input: { file_path: path.join(base, RUN, rel), content } }), stdio: ['pipe', 'pipe', 'pipe'] }); return 0; } catch (e) { return e.status; } };
ok(guard('backlog/stories/ST-009_x.md', '# x') === 2, 'guard blocks hand-written story files');
ok(guard('backlog/backlog.json', '{}') === 2, 'guard blocks hand-written backlog.json');
ok(guard('backlog/spikes/SPK-009_x.md', '# x') === 2, 'guard blocks hand-written spike files');
ok(existsSync(path.join(RUN, 'history/5.1.3_story-cards_ST-002/v3.md')), 'every story version has a history snapshot');
// published results are script-owned; the run end clears the active pointer
writeFileSync('.dark-factory/project.json', J({ schema: 'df.project/v1', publishDir: 'docs/product' }));
const pubGuard = (rel) => { try { execFileSync('node', [path.join(H, 'product-artifact-contract-guard.hook.mjs')], { input: J({ tool_name: 'Write', tool_input: { file_path: path.join(base, rel), content: 'x' } }), stdio: ['pipe', 'pipe', 'pipe'] }); return 0; } catch (e) { return e.status; } };
ok(pubGuard('docs/product/REPORT.md') === 2 && pubGuard('docs/product/.published.json') === 2, 'guard blocks writes into the publish directory while a run is running');
ok(/no run at/.test(fails('product-traceability/scripts/run-state.mjs', ['finish', 'elsewhere/runs/s1', 'discarded']) || '') && !existsSync('elsewhere'), 'run-state finish refuses a run dir without run.json and creates nothing');
ok(JSON.parse(run('product-traceability/scripts/run-state.mjs', ['finish', RUN, 'complete'])).clearedPointers === 1 && !existsSync('runs/.active'), 'run-state finish sets the status and clears runs/.active');
ok(pubGuard('docs/product/REPORT.md') === 0 && pubGuard('docs/product/.published.json') === 2, 'after the run, the publish directory is editable again, .published.json never');
// product-init (D-37): detect stack signals, write/merge/validate the manifest, ignore runs/; --ensure-project keeps it
const INIT = 'product-init/scripts/init-project.mjs';
const proj = path.join(base, 'init-target');
mkdirSync(path.join(proj, 'frontend'), { recursive: true }); mkdirSync(path.join(proj, 'backend'), { recursive: true });
writeFileSync(path.join(proj, 'frontend/package.json'), J({ dependencies: { vue: '^3.5.0' }, devDependencies: { vite: '^6.0.0', typescript: '^5.6.0' } }));
writeFileSync(path.join(proj, 'backend/pom.xml'), '<project><parent><artifactId>spring-boot-starter-parent</artifactId></parent></project>');
writeFileSync(path.join(proj, 'Dockerfile'), 'FROM eclipse-temurin:21\n');
const det = JSON.parse(run(INIT, ['detect', proj]));
ok(det.manifest === null && !det.empty && det.signals.some((x) => x.file === 'frontend/package.json' && /Vue/.test(x.hint) && /Vite/.test(x.hint)) && det.signals.some((x) => /Spring Boot/.test(x.hint)) && det.signals.some((x) => x.hint === 'containers'), 'init detect finds Vue/Vite, Spring Boot and containers');
const empty = path.join(base, 'init-empty'); mkdirSync(empty); writeFileSync(path.join(empty, 'README.md'), '# idea\n');
ok(JSON.parse(run(INIT, ['detect', empty])).empty === true, 'init detect reports an empty repo');
const wr = JSON.parse(run(INIT, ['write', proj], J({ platform: { architecture: 'SPA + REST backend, containerised', stack: 'Vue 3 + Vite; Spring Boot; Docker' } })));
const mf = JSON.parse(readFileSync(path.join(proj, '.dark-factory/project.json'), 'utf8'));
ok(wr.action === 'created' && wr.platformFilled && mf.schema === 'df.project/v1' && mf.name === 'init-target' && mf.publishDir === 'docs/product' && readFileSync(path.join(proj, '.gitignore'), 'utf8').includes('runs/'), 'init write creates the manifest with platform and ignores runs/');
run(INIT, ['write', proj], J({ language: 'en' }));
const mf2 = JSON.parse(readFileSync(path.join(proj, '.dark-factory/project.json'), 'utf8'));
ok(mf2.language === 'en' && mf2.platform.stack === 'Vue 3 + Vite; Spring Boot; Docker', 'init write merges only the given fields');
ok(/publishDir/.test(fails(INIT, ['write', proj], J({ publishDir: '../elsewhere' })) || '') && /unknown fields/.test(fails(INIT, ['write', proj], J({ budget: 5 })) || ''), 'init write rejects an escaping publishDir and unknown fields');
ok(JSON.parse(run('product-traceability/scripts/run-state.mjs', ['init', path.join(proj, 'runs'), 'i1', 'x', '--ensure-project', '--no-pointer'])).project.manifest === 'kept' && JSON.parse(readFileSync(path.join(proj, '.dark-factory/project.json'), 'utf8')).language === 'en', 'run-state --ensure-project keeps a manifest written by product-init');
console.log('story smoke ok');
