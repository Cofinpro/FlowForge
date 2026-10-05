// Generates: 52 step skills, rubric files, 10 role agents, the step contract module
// (product-traceability/scripts/lib/contracts.mjs) and the per-skill copies of lib-df.mjs.
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { G, BPMN, STEP_SKILLS, ROLE_LABEL, artifactPath, META, AUX_TYPES, SKILLS_DIR, RULES } from './steps.mjs';
import { RUBRICS } from './rubrics.mjs';

const SCR = path.dirname(new URL(import.meta.url).pathname);
const yaml = createRequire(process.env.HOME + '/.cache/bpmn-authoring-tools/package.json')('js-yaml');
const spec = yaml.load(readFileSync(`${G}/workflow-spec.yaml`, 'utf8'));
const sdlc = JSON.parse(readFileSync(SCR + '/.build/sdlc.json', 'utf8'));
const content = {};
for (const f of ['phase-1', 'phase-2', 'phase-3-4', 'phase-5-6']) Object.assign(content, JSON.parse(readFileSync(`${SCR}/content/${f}.json`, 'utf8')));

const w = (p, s) => { mkdirSync(path.dirname(p), { recursive: true }); writeFileSync(p, s); };
const fm = (obj) => `---\n${yaml.dump(obj, { lineWidth: 200, noRefs: true, flowLevel: 2 })}---\n`;
const bpmnHdr = (elements) => ({ file: BPMN, elements });
const laneLabel = (el) => spec.roles[el.lane]?.label || '—';
const rubricFor = (id) => Object.entries(RUBRICS).filter(([, r]) => (r.for || []).includes(id)).map(([k]) => k);
const S = SKILLS_DIR; // skills inside the dark-factory plugin (D-35)
const COMMIT = `${S}/product-traceability/scripts/commit-artifact.mjs`;
const STORY = `${S}/product-traceability/scripts/story.mjs`;
const SPIKE = `${S}/product-traceability/scripts/spike.mjs`;
// Stories and spikes are JSON-first records (Gedächtnis §11.3): these steps create them with put …
const RECORD_PUT = { 'S5.1.1': 'story', 'S5.1.3': 'story', 'S5.1.4': 'spike' };
// … and these change existing ones with story.mjs patch (next to their own narrative artifact).
const STORY_PATCH = { 'S5.1.3': 'status superseded + splitInto on the parent', 'S5.1.4': 'spikes, blockers, size: null', 'S5.2.2': 'title, connextra, context, businessRules, scope, implementationNotes, confirmationCandidates, blockers, assumptions', 'S5.2.4': 'size (and status needs-resplit for L)', 'S6.1.3': 'acceptanceCriteria', 'S6.1.4': 'acceptanceCriteria (full list), status needs-resplit', 'S6.2.4': 'status discarded + discard {reason, duplicateOf?, justification}' };
const STORY_EXAMPLE = { story: { id: 'ST-012', title: 'Plan the week in one go', epic: 'EP-001', userTask: 'UT-004', connextra: { role: 'working parent of two', want: 'to plan all dinners of the week in one session', soThat: 'I stop deciding under time pressure every evening' }, derivedFrom: ['UT-004', 'EP-001', 'JOB-002'], evidence: 'synthetic', refs: ['T-03'], conversation: ['Does "week" include weekends?'], assumptions: [{ id: 'ASM-007', evidence: 'inferred', why: 'assumes one person plans for the household' }], size: { class: 'M', reasoning: '3 business rules, 2 states, no integration' }, flags: [] }, notesForNext: '<one or two sentences for the next step>' };
const SPIKE_EXAMPLE = { spike: { id: 'SPK-003', title: 'Recipe import from partner API', question: 'Does the partner API deliver ingredient lists with quantities per portion?', why: 'ST-012 cannot be sized until we know whether we must parse free text', blocks: ['ST-012'], timebox: { amount: 1, unit: 'days' }, acceptanceCriteria: ['A sample of 20 recipes is fetched and the share with structured quantities is known', 'Decision memo: structured import vs. parser'], decisionEnabled: 'Size class of ST-012 (S if structured, L otherwise)', derivedFrom: ['ST-012', 'ASM-011'], evidence: 'inferred', architectureAssumptions: [{ id: 'ASM-011', why: 'idea brief assumes a partner API exists' }] }, notesForNext: '<one or two sentences for the next step>' };
const RECORDS = {
  story: { script: STORY, schema: 'df.story/v1', prefix: 'ST', file: 'backlog/stories/ST-<nnn>_<slug>.md', example: STORY_EXAMPLE, fields: 'Required: `id`, `title`, `epic`, `userTask`, `connextra {role, want, soThat}`, `derivedFrom` (must contain the userTask), `evidence`. Optional: `status`, `refs`, `conversation`, `context`, `businessRules`, `scope {in, out}`, `assumptions`, `size`, `splitFrom`/`splitPattern`/`splitInto`, `spikes`, `acceptanceCriteria`, `implementationNotes`, `confirmationCandidates`, `blockers`, `discard`, `notes`, `flags`. The script rejects unknown fields, `cited` without an SRC ref, size L on an active story, SPK ids that are not spike records blocking this story, and a duplicate ST id.' },
  spike: { script: SPIKE, schema: 'df.spike/v1', prefix: 'SPK', file: 'backlog/spikes/SPK-<nnn>_<slug>.md', example: SPIKE_EXAMPLE, fields: 'Required: `id`, `title`, `question` (one), `why` (why sizing is blocked), `blocks` (ST ids), `timebox {amount, unit: hours|days}` (≤ 2 days / 16 hours), `acceptanceCriteria` (defined before execution), `decisionEnabled`, `derivedFrom` (must contain every blocked ST), `evidence`. Optional: `refs`, `architectureAssumptions [{id, why}]`, `status` (open | done | discarded), `outcome` (only with done), `notes`, `flags`. The script rejects unknown fields, unbounded timeboxes, blocked stories that are not story records, and a duplicate SPK id.' },
};
const modelOf = (role) => Object.values(spec.roles).find((x) => x.agentName === `product-${role}`)?.modelTier || 'session-default';
const contracts = {};

// ------------------------------------------------------------------ step skills
for (const [id, [skill, phaseDir, phKey]] of Object.entries(STEP_SKILLS)) {
  const el = spec.elements[id];
  const c = content[id];
  if (!c) throw new Error('no content for ' + id);
  const s = sdlc[id];
  const key = s.step.key.replace(/^S/, '');
  const role = s.step.agentRole;
  const extraEls = id === 'S7' ? [id, 'SP_Budget_S1', 'S_NoGo'] : [id];
  const perStory = /^(5\.2|6\.1)/.test(key);
  const perEpic = /^5\.1/.test(key);
  const inRows = (s.inputs || []).map((i) => `| \`${i.artifact}\` | ${i.required === 'true' ? 'yes' : 'no'} | \`${spec.artifacts[i.artifact]?.pathPattern || '—'}\` |`).join('\n');
  const outRows = (s.outputs || []).map((o) => `| \`${o.artifact}\` | ${o.itemPrefix || '—'} | ${o.cardinality || 'one'} | \`${spec.artifacts[o.artifact]?.pathPattern || '—'}\` |`).join('\n');
  const rubrics = rubricFor(id);
  const panel = s.panel ? `- **Panel** (\`${s.panel.mode}\`, panel set \`${s.panel.panelSet}\`${s.panel.optional === 'true' ? ', optional — may be skipped when the budget is tight; then proceed without it and say "panel skipped" in the artifact' : ''}): the Workflow has already run \`product-panel-befragung\` for this step and passes \`panelResult\` (the session JSON under \`panel/sessions/\`). Mark everything taken from it 🤖 synthetic.\n` : '';
  const research = (s.research || []).length ? `- **Light research**: ${s.research.map((r) => `\`${r.tool}\` (${r.purpose})`).join(', ')}. Free channels only (WebSearch) — never Deep Research or a direct Gemini API call here. Fetch the page text with \`node ${S}/product-recherche/scripts/providers/raw-fetch.mjs <runDir> --call <step> --tool websearch --query "<q>" --url <u>…\`, normalize it with \`node ${S}/product-recherche/scripts/normalize-sources.mjs <runDir> <raw.json>\` and cite only the resulting \`SRC-\` ids (Gedächtnis §8.0/§8.3).\n` : '';
  const scope = perEpic ? '- **Multi-instance**: runs once per epic (`EP[slice=1]`); the Workflow passes `epicId`.\n' : perStory ? '- **Multi-instance**: runs once per story; the Workflow passes `storyId`. Per-story artifacts go under `artifacts/' + phaseDir + '/<storyId>/`.\n' : '';
  const partial = id === 'S7' ? '\n## Partial mode ("Teilergebnis sichern & Run-Report erstellen")\n\nWhen the Workflow passes `mode: partial` (budget exhausted — the accepted replacement for the "Budget erschoepft" event sub-process), skip the export of unfinished stories, write `REPORT.md` with `status: partial`, name the BPMN position the run stopped at (`run.json` `position`) and list every missing artifact. Commit `REPORT.md` like every artifact with `--step SP_Budget_S1`, then finish the run with `run-state.mjs finish <runDir> partial` (never publish a partial run).\n\n## Discarded mode ("No-Go-Report erstellen")\n\nWhen the Workflow passes `mode: discarded` (G-P1/G-P2 said no-go, or the pivot cap was reached) together with `gateRecord`, `reasons` and `pivotCount`, do not export a backlog and do not publish. Write `REPORT.md` with `status: discarded`: the no-go decision and its reasons from the gate record (which rule fired, e.g. refuted kill assumption, problem-ranking kill signal, pivot cap), the kill assumptions and their evidence, the panel votes, the evidence mix of what was produced, the pivot history, what the critic recommended, the change requests that would reopen the idea, risk flags, and cost & runtime. List which phases ran and which never started. Commit `REPORT.md` with `--step S_NoGo`, then finish the run with `run-state.mjs finish <runDir> discarded`.\n' : '';

  const skillMd = fm({ name: skill, description: c.description, bpmn: bpmnHdr(extraEls) }) + `
# ${el.label} (step ${key})

Generated from \`${BPMN}\`'s "${el.label}" (${el.bpmnType}, lane "${laneLabel(el)}") by \`flowforge-generate\`. ${c.purpose} It is its own skill because it produces an independently versioned artifact with its own contract (body + sidecar), template and rubric (mapping-rubric.md's serviceTask rule; one skill per business step, docs/dark-factory/implementation.md §2).

Executed by the \`product-${role}\` agent. Binding rules: \`${RULES}\` — evidence §6, item IDs §10, artifact contract §11.2, iterations §15.

## Run context

The Workflow passes \`runDir\`, \`runId\`, \`iteration\` and \`changeRequests\` (from the last gate record of this phase)${perEpic ? ', `epicId`' : ''}${perStory ? ', `storyId`' : ''}${s.panel ? ', `panelResult`' : ''}.

| Input | Required | Path pattern |
|---|---|---|
${inRows || '| — | — | — |'}

| Output | Item prefix | Cardinality | Path pattern |
|---|---|---|---|
${outRows}

${panel}${research}${scope}
## Procedure

0. **Resume / iterate.** Read the output's sidecar (\`<file>.meta.json\`) if it exists. If it has \`status: passed\`/\`passed-with-risk\`, or \`iteration > 1\` and no change request concerns this artifact or an upstream artifact it consumes, return it unchanged (idempotent resume). Otherwise work every change request into the body and keep item IDs stable when the item is materially the same. Do not copy files to \`history/\` or touch \`version\` — \`commit-artifact.mjs\` does both (Gedächtnis §15).
${c.procedure.map((p, i) => `${i + 1}. ${p}`).join('\n')}
${RECORD_PUT[id] ? `${c.procedure.length + 1}. Build every ${RECORD_PUT[id]} as a \`${RECORDS[RECORD_PUT[id]].schema}\` record (\`node ${RECORDS[RECORD_PUT[id]].script} schema\` prints it; see "Backlog records" below). You write **no** Markdown for it — \`${RECORD_PUT[id]}.mjs\` renders \`${RECORDS[RECORD_PUT[id]].file}\` from the record (the contract-guard hook blocks hand-written ${RECORD_PUT[id]} files).
${c.procedure.length + 2}. Run the self-check below and fix what fails. Never set \`passed\` yourself — only the critic gate does (Gedächtnis §2.2).
${c.procedure.length + 3}. **Commit** each ${RECORD_PUT[id]}: \`node ${RECORDS[RECORD_PUT[id]].script} put <runDir> --step ${id} <<'JSON'\` {"${RECORD_PUT[id]}": …} \`JSON\`. The script validates the record, renders and commits the file, and computes id, version, status, derivedFrom, evidence and history; fix every rejection it prints and put again. Re-putting an unchanged record is a no-op.${RECORD_PUT[id] !== 'story' && STORY_PATCH[id] ? ` Then link each blocked story with \`node ${STORY} patch <runDir> <storyId> --step ${id}\` (see "Backlog records" below).` : ''}` : `${c.procedure.length + 1}. Write the output **body** from \`assets/template.md\`: Markdown only, no frontmatter (the product-artifact-contract-guard hook rejects a Write that starts with \`---\`)${(s.outputs || []).some((o) => o.cardinality === 'many') ? '; one file per instance, following the path pattern' : ''}.
${c.procedure.length + 2}. Run the self-check below and fix what fails. Never set \`passed\` yourself — only the critic gate does (Gedächtnis §2.2).
${c.procedure.length + 3}. **Commit** every output file with its authored block (see "Artifact contract" below): \`node ${COMMIT} commit <runDir> <file.md> --step ${id}${(s.outputs || []).length > 1 ? ' --type <artifact>' : ''}${s.panel ? ' --from <panelResult>' : ''} <<'JSON'\` … \`JSON\`. The script computes id, version, status, derivedFrom, evidence mix and history; fix every rejection it prints and commit again. Re-committing an unchanged file is a no-op.${STORY_PATCH[id] ? ` Then apply the story changes with \`node ${STORY} patch <runDir> <storyId> --step ${id}\` (see "Story records" below).` : ''}`}
${(c.afterCommit || []).map((p, i) => `${c.procedure.length + 4 + i}. ${p}`).join('\n')}${c.afterCommit?.length ? '\n' : ''}${c.procedure.length + 4 + (c.afterCommit || []).length}. Log: \`node ${S}/product-traceability/scripts/run-state.mjs event <runDir> '{"event":"step-done","element":"${id}"}'\`.
${partial}
${RECORD_PUT[id] || STORY_PATCH[id] ? `## Backlog records (Gedächtnis §11.3)

Stories and spikes are JSON-first: the record in the file's sidecar (\`authored.attributes\`, schema \`df.story/v1\` / \`df.spike/v1\`) is the story or spike; \`backlog/stories/ST-*.md\`, \`SPK-*.md\` and \`backlog.json\` are generated from it. Read one with \`node ${STORY} show <runDir> <ST-id>\` (or \`spike.mjs show <SPK-id>\`), list them with \`list <runDir> [--epic EP-nnn]\` (spikes: \`[--blocks ST-nnn]\`), get new ids with \`next-id <runDir> [--count n]\`.
${RECORD_PUT[id] ? `
Record for \`${RECORD_PUT[id]}.mjs put\` (stdin):

\`\`\`json
${JSON.stringify(RECORDS[RECORD_PUT[id]].example, null, 2)}
\`\`\`

${RECORDS[RECORD_PUT[id]].fields} The record's itemIndex (its ${RECORDS[RECORD_PUT[id]].prefix} item) is derived from it — you do not supply one.
` : ''}${STORY_PATCH[id] ? `
**This step patches:** ${STORY_PATCH[id]}. \`node ${STORY} patch <runDir> <ST-id> --step ${id} <<'JSON'\` {"story": {<only the fields you change>}} \`JSON\` — top-level fields replace, \`connextra\`/\`size\`/\`scope\` merge one level, the id is fixed. Never edit the story Markdown.
` : ''}
` : ''}## Artifact contract (Gedächtnis §11.2)

Every output is two files: \`<file>.md\` (the body you write; its frontmatter is rendered read-only from the sidecar) and \`<file>.meta.json\` (the sidecar, written only by \`commit-artifact.mjs\`). Read upstream metadata from sidecars, never from rendered frontmatter.

**You supply** the authored block on stdin (\`node ${COMMIT} schema\` prints its JSON Schema):

\`\`\`json
${JSON.stringify({ itemIndex: (s.outputs || []).filter((o) => o.itemPrefix).slice(0, 1).map((o) => ({ id: `${o.itemPrefix}-001`, derivedFrom: ['<parent item id>'], evidence: 'cited|inferred|synthetic', refs: ['SRC-0001'] })), sources: ['SRC-0001'], riskFlags: [], openQuestions: [], notesForNext: '<one or two sentences for the next step>' }, null, 2)}
\`\`\`

${META.filter(([, , , w]) => w === 'model').map(([f, d, r]) => `- \`${f}\`${r ? ' (required)' : ''} — ${d}`).join('\n')}

**Computed by the script** — never write these yourself: ${META.filter(([, , , w]) => w === 'script').map(([f]) => `\`${f}\``).join(', ')}.
${id === 'S4.1.3' ? '\nEpic files (`backlog/epics/EP-<nnn>_<slug>.md`) are committed separately with `--type epic`, one per EP item, e.g. `{"itemIndex": [{"id": "EP-001", "derivedFrom": ["ACTV-001", "OPP-002"], "evidence": "inferred"}], "attributes": {"title": "…", "actv": "ACTV-001", "tasks": ["UT-001"], "goal": "GOAL-001", "slice": null}}`.\n' : ''}${id === 'S4.2.5' ? '\nSet each epic\'s release slice without re-committing its body: `node ' + COMMIT + ' attrs <runDir> backlog/epics/EP-<nnn>_<slug>.md \'{"slice": 1}\'`.\n' : ''}${(s.outputs || []).some((o) => spec.artifacts[o.artifact]?.pathPattern?.endsWith('.json')) ? '\nJSON outputs (e.g. `backlog.json`) are data files, not artifacts: write them directly, no commit.\n' : ''}
## Self-check${rubrics.length ? ` (rubric ${rubrics.map((r) => '`' + r + '`').join(', ')} — judged by \`product-kritiker-pruefung\`)` : ''}

${c.selfCheck.map((x) => `- [ ] ${x}`).join('\n')}

## Pitfalls

${c.pitfalls.map((x) => `- ${x}`).join('\n')}

## Return

Reply with JSON only: \`{"status": "done|blocked|partial", "artifacts": ["<committed .md paths>"], "items": ["<item ids created or changed>"], "riskFlags": [], "summary": "<one sentence>"}\`.

## Domain knowledge

See \`references/domain-knowledge.md\` (cited from notebook "The Product - Business Design"; phase brief \`knowledge/${path.basename(spec.knowledge.refs[id])}\`).
`;
  w(`${G}/skills/${skill}/SKILL.md`, skillMd);

  const tmplFm = { bpmn: bpmnHdr([id]) };
  contracts[id] = {
    key, skill, role, modelRole: s.step.modelRole, model: modelOf(role),
    inputs: (s.inputs || []).map((i) => ({ artifact: i.artifact, required: i.required === 'true' })),
    outputs: (s.outputs || []).map((o) => ({ artifact: o.artifact, ...(o.itemPrefix ? { itemPrefix: o.itemPrefix } : {}), cardinality: o.cardinality || 'one', pathPattern: spec.artifacts[o.artifact]?.pathPattern || null })),
  };
  if (RECORD_PUT[id]) w(`${G}/skills/${skill}/assets/template.md`, fm(tmplFm) + `
<!-- ${RECORD_PUT[id]} records (step ${key}) have no hand-written body. Supply this record to ${RECORD_PUT[id]}.mjs put (--step ${id}); it renders ${RECORDS[RECORD_PUT[id]].file}. The frontmatter above is generator traceability only. -->

# ${el.label} — ${RECORD_PUT[id]} record

${c.templateSections.join('\n\n')}

\`\`\`json
${JSON.stringify(RECORDS[RECORD_PUT[id]].example, null, 2)}
\`\`\`
`);
  else w(`${G}/skills/${skill}/assets/template.md`, fm(tmplFm) + `
<!-- Body skeleton for ${s.outputs.map((o) => o.artifact).join(' + ')} (step ${key}). The frontmatter above is generator traceability only: write the run artifact WITHOUT any frontmatter, then commit it with commit-artifact.mjs (--step ${id}). -->

# ${el.label}

${c.templateSections.join('\n\n')}

## Evidence & sources

Evidence mix and every SRC-/T- id used; mark each statement 🔗 cited, 🧠 inferred or 🤖 synthetic.
`);

  w(`${G}/skills/${skill}/references/domain-knowledge.md`, fm({ element: id, evidence: 'cited', sources: ['The Product - Business Design (NotebookLM)', 'docs/dark-factory/process-rules.md'], bpmn: bpmnHdr([id]) }) + `
# Domain knowledge — ${el.label}

${c.domainKnowledge}
`);
}

// ------------------------------------------------------------------ rubrics
for (const [rid, r] of Object.entries(RUBRICS)) {
  const els = (r.for || []).filter((x) => spec.elements[x]);
  const callers = Object.entries(sdlc).filter(([, s]) => s.critic?.rubric === rid).map(([k]) => k);
  const elements = [...new Set([...els, ...callers, 'K_1'])];
  const data = {
    id: rid, version: 1, threshold: 0.8, ...(r.gateQuestion ? { gateQuestion: r.gateQuestion } : {}), ...(r.includes ? { includes: r.includes } : {}),
    criteria: r.criteria.map(([cid, text, weight, kill, source]) => ({ id: cid, text, weight, ...(kill ? { kill: true } : {}), source })),
    bpmn: bpmnHdr(elements),
  };
  const body = `# Rubric \`${rid}\`

Seed rubric (Gedächtnis §13 core criteria + adopted notebook criteria, 2026-09-25). Loaded by \`scripts/load-rubric.mjs\`; the full extraction from the notebook with calibration examples is still open (docs/dark-factory/roadmap.md §2).
${r.gateQuestion ? `\n**Gate question:** "${r.gateQuestion}"\n` : ''}${r.includes ? `\n**Includes:** ${r.includes.map((x) => '`' + x + '`').join(', ')}\n` : ''}${r.panel ? `\n**Panel rule:** ${r.panel}\n` : ''}${r.routing ? `\n**Routing:** ${r.routing}\n` : ''}
| Criterion | Weight | Kill | Source |
|---|---|---|---|
${r.criteria.map(([cid, text, weight, kill, source]) => `| \`${cid}\` ${text} | ${weight} | ${kill ? 'yes' : ''} | ${source} |`).join('\n') || '| (composite — see includes) | | | |'}

Each criterion is scored \`pass | partial | fail\` with a reason (K.2); score = weighted share of pass, partial = 0.5 (Gedächtnis §9.1).
`;
  w(`${G}/skills/product-kritiker-pruefung/references/rubrics/${rid}.md`, fm(data) + body);
}

// ------------------------------------------------------------------ role agents
const ROLE_INFO = {
  stratege: ['Product strategist: vision, business model, goals, prioritisation, release cut.', 'Scores always disclose inputs and formula (Gedächtnis §2.5). Business goals are outcomes, deliverables are options (Adzic).'],
  researcher: ['Researcher: research orders, sources, panel grounding, stakeholder matrix; runs the reusable research process R (DR-01/02/03).', 'Paid research only via providers/gemini-deep-research.mjs: one Deep Research call per corpus, hard cap 3 and a money cap per run, checked before every call (Gedächtnis §9.4); gap-fill re-runs use WebSearch only. Fetch real page text with providers/raw-fetch.mjs, not WebFetch. Every claim goes through the claim ledger (check-claims.mjs): key claims need ≥2 independent sources, T3 never carries market/number/regulation claims alone (Gedächtnis §8.3/§8.4). Research syntheses cite ledger claims (CLM + SRC ids) only.'],
  interviewer: ['Interviewer / panel moderator: guide, synthetic interviews, transcripts, votes; runs the panel process P.', 'Mom-Test: past behaviour, no leading questions, solution only in the last third; never reinterpret "weiß nicht" (Gedächtnis §7.4). You see only the open part of a persona profile.'],
  persona: ['Synthetic persona of the panel: answers in role, based only on its own profile.', 'You may say "weiß nicht" or "ist mir egal". Your hidden attributes (budget, skepticism, workaround, switching barriers, secret) shape your answers but are revealed only when the question technique earns it (Gedächtnis §7.3). You never write files.'],
  ux: ['UX / journey designer: personas, JTBD, empathy maps, journeys, text wireframes.', 'Wireframes are text/Mermaid sketches (regions, elements, states), never images (Gedächtnis §4). Needs are verbs, not nouns.'],
  architekt: ['Architect: service blueprint, walking skeleton, spikes, size classes, technical perspective.', 'Uses the target architecture/platform from the idea brief (§14). Size class S/M/L with reasoning; L forces splitting (§4).'],
  'backlog-autor': ['Backlog author: story map, story cards, splitting, refinement, confirmation.', 'Connextra with a concrete role; vertical slices; each story lists its unvalidated ASM assumptions (Gedächtnis §10.2).'],
  qa: ['QA perspective: edge cases, specification by example, Gherkin, testability.', 'At least one happy path and one negative path per story; concrete values; implementation-neutral (Adzic).'],
  kritiker: ['Critic: judges artifacts against rubrics, factchecks, forms verdicts and writes gate records via scripts. Never rewrites artifacts (hook-enforced).', 'Score = weighted pass share (partial 0.5); loop cap 3 -> pass-with-risk (Gedächtnis §9.1). Give concrete change requests on fail. Runs on a stronger tier than producers; same model family -> risk flag same-model-review (§5). In 6.2.3/6.2.4 you are also the producer of the glossary and the cleaned backlog.'],
  traceability: ['Traceability checker: deterministic graph checks, matrix, export, run report, run bookkeeping.', 'Orphans are found by the scripts, never by judgement (Gedächtnis §10.2). REPORT.md is the only place a human has to look (docs/dark-factory/implementation.md §6).'],
};
const byRole = {};
for (const [id, e] of Object.entries(spec.elements)) {
  for (const p of e.generatedPaths || []) {
    const m = p.match(/agents\/product-(.+)\.md$/);
    if (m) (byRole[m[1]] ??= []).push(id);
  }
}
for (const [role, ids] of Object.entries(byRole)) {
  const r = Object.values(spec.roles).find((x) => x.agentName === `product-${role}`);
  const [what, rules] = ROLE_INFO[role];
  const lines = ids.map((id) => {
    const e = spec.elements[id];
    const skills = (e.generatedPaths || []).filter((p) => p.endsWith('SKILL.md')).map((p) => '`' + p.split('/').at(-2) + '`');
    return `- [ ] "${e.label || id}" (${id}) — skill ${skills.join(' + ')}`;
  });
  const front = { name: `product-${role}`, description: `${ROLE_LABEL[role]} role of the dark-factory workflow "Von der Produktvision zu User Stories" — ${what} Invoked by the product-vision-to-user-stories Workflow script (agentType) for the steps of this role; not meant for ad-hoc use.` };
  if (r.modelTier) front.model = r.modelTier;
  if (r.tools) front.tools = r.tools.join(', ');
  front.bpmn = bpmnHdr(ids);
  w(`${G}/agents/product-${role}.md`, fm(front) + `
You are the **${ROLE_LABEL[role]}** (\`${role}\`) role of the generated \`product-vision-to-user-stories\` dark factory (from \`${BPMN}\`). ${what} The Workflow script calls you once per BPMN step; each call names the step, the skill to run and the run context (\`runDir\`, \`runId\`, \`iteration\`, \`changeRequests\`, …). Run exactly that skill, then answer with its return JSON.

## Checklist

Your steps, in BPMN order:

${lines.join('\n')}

Before returning, confirm the skill's self-check passed and \`commit-artifact.mjs\` accepted every output file.

<!-- regenerate boundary: flowforge-generate only rewrites the checklist bullets and the domain
     knowledge section above a re-run; anything you add below this line is preserved. -->

## Domain knowledge

- **Role rules**: ${rules}
- **Evidence** (Gedächtnis §6): every item has exactly one level — 🔗 cited (SRC), 🧠 inferred, 🤖 synthetic (panel). Synthetic evidence counts for gates in dark mode but is never presented as real. ✅ validated is unreachable.
- **Items & trace** (§10): IDs \`<PREFIX>-<nnn>\` (SRC: 4 digits), stable per run, never reused; every item has \`derivedFrom\` and an evidence reference. Required chain AC → ST → UT → EP/ACTV → (OPP|JOB) → IMP → GOAL → VIS.
- **Artifacts** (§11.2, §15): you write Markdown **bodies** only and hand your authored block (itemIndex, sources, riskFlags, attributes, notesForNext) to \`commit-artifact.mjs\`; it writes the \`*.meta.json\` sidecar, versions, history and derivedFrom. Never write sidecars, \`run.json\` or \`history/\` yourself (hook-enforced), and read upstream metadata from sidecars. Stories and spikes are JSON-first records: create and change them only with \`story.mjs\` / \`spike.mjs put|patch\` (§11.3); \`backlog.json\` comes from \`export-backlog.mjs\`.
- **Autonomy** (§2): no human intervenes; never ask the user anything. When something is missing, make a plausible, justified assumption, mark it 🧠 and continue.
- **Scope discipline**: only do what the BPMN step and its skill describe; flag anything else as a follow-up instead of improvising.

## Reporting back

End with the skill's JSON: \`{"status": "done|blocked|partial", "artifacts": [...], "items": [...], "riskFlags": [...], "summary": "..."}\`.
`);
}
// ------------------------------------------------------------------ step contracts (read by commit-artifact.mjs + trace scripts)
// deterministic steps (6.2.1/6.2.2/6.2.5 …) carry a contract too; their skill is the lane/process skill that runs them
for (const [id, s] of Object.entries(sdlc)) {
  if (contracts[id] || !s.step || !spec.elements[id]) continue;
  const skill = (spec.elements[id].generatedPaths || []).find((p) => p.endsWith('SKILL.md'))?.split('/').at(-2) || null;
  const role = s.step.agentRole;
  contracts[id] = {
    key: String(s.step.key).replace(/^S/, ''), skill, role, modelRole: s.step.modelRole, model: s.step.kind === 'deterministic' ? 'script' : modelOf(role),
    inputs: (s.inputs || []).map((i) => ({ artifact: i.artifact, required: i.required === 'true' })),
    outputs: (s.outputs || []).map((o) => ({ artifact: o.artifact, ...(o.itemPrefix ? { itemPrefix: o.itemPrefix } : {}), cardinality: o.cardinality || 'one', pathPattern: spec.artifacts[o.artifact]?.pathPattern || null })),
  };
}
w(`${G}/skills/product-traceability/scripts/lib/contracts.mjs`, `// bpmn: ${JSON.stringify(bpmnHdr(['K_1', ...Object.keys(contracts)]))}
// GENERATED by tools/dark-factory-gen/gen-files.mjs from the BPMN sdlc: annotations — do not edit.
// Per step element: key, skill, role, model and the declared inputs/outputs (Gedächtnis §3.2, §11).
export const STEPS = ${JSON.stringify(contracts, null, 2)};

// Artifact types a step writes in addition to its declared outputs (steps.mjs AUX_TYPES).
export const AUX_TYPES = ${JSON.stringify(AUX_TYPES, null, 2)};
`);

// ------------------------------------------------------------------ lib-df.mjs copies (one per skill with scripts)
const LIB_ELEMENTS = {
  'product-kritiker-pruefung': ['K_1', 'K_4', 'K_5'], 'product-panel-befragung': ['P_3'], 'product-phasen-gate': ['PG_1'],
  'product-recherche': ['R_3'], 'product-traceability': ['S6.2.1', 'S6.2.2', 'S6.2.5'],
};
const libSrc = readFileSync(`${SCR}/lib-df.mjs`, 'utf8');
for (const [skill, els] of Object.entries(LIB_ELEMENTS)) w(`${G}/skills/${skill}/scripts/lib/df.mjs`, `// bpmn: ${JSON.stringify(bpmnHdr(els))}\n${libSrc}`);

console.log('ok', Object.keys(STEP_SKILLS).length, 'step skills;', Object.keys(RUBRICS).length, 'rubrics;', Object.keys(byRole).length, 'agents');
