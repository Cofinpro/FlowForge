// bpmn: {"file":"docs/planning/bpmn-to-agentic-workflow.bpmn","elements":["Task_Generate"]}
// install-knowledge.mjs — copies the per-task knowledge files into the skills that own the tasks,
// in the shape an installed skill can use. Run by bpmn2agent-generate step 5 after the skills exist.
//
// Usage: node install-knowledge.mjs <cacheDir> <generated/<workflow>/ dir>      (cwd = repo root of the run)
//
// A task has a "per-task file" when knowledge.refs.<id> is generated/<workflow>/knowledge/<id>.md.
// For each one:
//   - owner skill: the skill dir named by elements.<id>.generatedPaths[0]; a step narrated inline
//     (a human checkpoint of the skill-chain pattern) belongs to the top-level skill skills/<workflow>/.
//   - written to <owner>/references/<id>.md (the knowledge file's own `bpmn:` header stays);
//   - pointers to `phase-N-….md` become `domain-knowledge.md` in the phase skills (their phase file is
//     installed under that name) and stay as they are in the top-level skill, which gets the phase
//     files it points at under their own names; a pointer to another per-task file in a different
//     skill becomes ${CLAUDE_SKILL_DIR}/../<skill>/references/<id>.md;
//   - footnotes keep the source and date and drop the verbatim quote and the FAQ reference after the
//     first " — "; the body tags like [triage-klaerung-1: 7, 9] (they point into knowledge/faq/, which
//     is not installed) are removed; a note says where the quotes are;
//   - a file over 100 lines gets a one-line contents list from its headings.
// Then every owner skill gets one `## Kontextquellen` section (replaced when it exists): one line per
// store, the store name verbatim, the task labels verbatim, the reference files. Existing live and
// gedächtnis bullets of that section are kept and follow the wissen lines.
// Idempotent: re-running rewrites the same files from knowledge/.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const [cacheDir, genDir] = process.argv.slice(2);
if (!cacheDir || !genDir) {
  console.error('Usage: node install-knowledge.mjs <cacheDir> <generated/<workflow>/ dir>');
  process.exit(2);
}
const require = createRequire(path.join(path.resolve(cacheDir), 'package.json'));
const yaml = require('js-yaml');

const spec = yaml.load(fs.readFileSync(path.join(genDir, 'workflow-spec.yaml'), 'utf8'));
const workflow = spec.meta.workflowName;
const skillsDir = path.join(genDir, '.claude', 'skills');
const knowledgeDir = path.join(genDir, 'knowledge');
const NOTE = '_Footnotes name the notebook source. The verbatim quotes and FAQ references stay with the generation output (`knowledge/`), which is not installed._';
const refs = spec.knowledge?.refs || {};
const stores = Object.values(spec.contextSources || {}).filter((s) => s.art === 'wissen');

const perTask = Object.keys(refs).filter((id) => path.basename(refs[id]) === `${id}.md`);
const ownerOf = (id) => {
  const p = (spec.elements[id]?.generatedPaths || [])[0] || '';
  const m = p.match(/\.claude\/skills\/([^/]+)\//);
  return m ? m[1] : workflow;
};
const owners = Object.fromEntries(perTask.map((id) => [id, ownerOf(id)]));

const transform = (id, text) => {
  const owner = owners[id];
  const isTop = owner === workflow;
  // pointers
  if (!isTop) text = text.replace(/`phase-\d+-[a-z0-9-]+\.md`/g, '`domain-knowledge.md`');
  text = text.replace(/`([A-Za-z0-9_]+)\.md`/g, (m, other) =>
    owners[other] && owners[other] !== owner ? `\`\${CLAUDE_SKILL_DIR}/../${owners[other]}/references/${other}.md\`` : m);
  // footnote definitions keep source and date; body tags into the FAQ go
  const out = text.split('\n').map((line) => {
    if (/^\[\^[^\]]+\]:/.test(line)) {
      const i = line.indexOf(' — ');
      return i === -1 ? line : line.slice(0, i);
    }
    return line.replace(/ ?\[[a-z0-9-]+-\d+: [^\]]*\]/g, '');
  });
  let body = out.join('\n');
  // note under the `_Ort:_` line
  body = body.replace(/(_Ort: [^\n]*_\n)/, `$1\n${NOTE}\n`);
  // contents line for long files
  if (body.split('\n').length > 100) {
    const heads = [];
    for (const l of body.split('\n')) {
      const h = l.match(/^###+ (.+)$/) || l.match(/^\*\*([^*]+)\*\*(?: \[[^\]]*\])?:?$/);
      if (h) heads.push(h[1].replace(/[:.]$/, '').trim());
    }
    if (heads.length >= 3) body = body.replace(NOTE, `${NOTE}\n\nContents: ${heads.join(' · ')}`);
  }
  return body;
};

const written = [];
for (const id of perTask) {
  const dir = path.join(skillsDir, owners[id], 'references');
  fs.mkdirSync(dir, { recursive: true });
  const src = fs.readFileSync(path.join(knowledgeDir, `${id}.md`), 'utf8');
  fs.writeFileSync(path.join(dir, `${id}.md`), transform(id, src));
  written.push(path.join(owners[id], 'references', `${id}.md`));
}

// the top-level skill gets the phase files its per-task files point at, with the FAQ note
const phaseNote = 'Tags like `[triage-klaerung-1: 7, 9]` point to an entry and its citation numbers in the notebook FAQ kept with the generation output (`knowledge/faq/`), not installed.';
const topRefs = path.join(skillsDir, workflow, 'references');
const wantPhase = new Set();
for (const id of perTask.filter((i) => owners[i] === workflow)) {
  const t = fs.readFileSync(path.join(knowledgeDir, `${id}.md`), 'utf8');
  for (const m of t.matchAll(/`(phase-\d+-[a-z0-9-]+\.md)`/g)) wantPhase.add(m[1]);
}
for (const f of wantPhase) {
  const src = path.join(knowledgeDir, f);
  if (!fs.existsSync(src)) continue;
  let t = fs.readFileSync(src, 'utf8');
  if (phaseNote && !/not installed/.test(t)) t = t.replace(/^(# [^\n]*\n)/m, `$1\n${phaseNote}\n`);
  fs.mkdirSync(topRefs, { recursive: true });
  fs.writeFileSync(path.join(topRefs, f), t);
  written.push(path.join(workflow, 'references', f));
}

// Kontextquellen per owner skill
const byOwner = {};
for (const id of perTask) (byOwner[owners[id]] ??= []).push(id);
for (const [owner, ids] of Object.entries(byOwner)) {
  const p = path.join(skillsDir, owner, 'SKILL.md');
  if (!fs.existsSync(p)) continue;
  let t = fs.readFileSync(p, 'utf8');
  // live and gedächtnis bullets are written by generate step 5, not here: carry them over
  const old = t.match(/\n## Kontextquellen\n[\s\S]*?(?=\n## |$)/)?.[0] || '';
  const keep = old.split('\n').filter((l) => /^- \*\*.+?\*\* \((live|gedächtnis)\b/.test(l));
  t = t.replace(/\n## Kontextquellen\n[\s\S]*?(?=\n## |$)/, '').replace(/\s+$/, '\n');
  const isTop = owner === workflow;
  let sec = '\n## Kontextquellen\n\nKnowledge stores, distilled at generation time into one file per task; no tool call at run time.';
  sec += isTop
    ? ' The phase files beside them hold the gateway criteria.\n\n'
    : fs.existsSync(path.join(skillsDir, owner, 'references', 'domain-knowledge.md'))
      ? ' `${CLAUDE_SKILL_DIR}/references/domain-knowledge.md` keeps the phase-level criteria.\n\n'
      : '\n\n';
  for (const s of stores) {
    const mine = s.readers.filter((r) => ids.includes(r));
    if (!mine.length) continue;
    sec += `- **${s.name}** (wissen): ${mine.map((r) => `"${spec.elements[r].label}" → \`\${CLAUDE_SKILL_DIR}/references/${r}.md\``).join('; ')}\n`;
  }
  if (keep.length) sec += `\nLive and memory stores, used at run time:\n\n${keep.join('\n')}\n`;
  fs.writeFileSync(p, t + sec);
}

console.log(`installed ${written.length} knowledge file(s) into ${Object.keys(byOwner).length} skill(s)`);
