// Reference audit for generated/product-vision-to-user-stories/: every skill/agent/hook/script name
// or path mentioned in any generated or generator file must exist, and no pre-prefix name may remain.
// Usage: node tools/dark-factory-gen/check-refs.mjs   (from factory/, as regenerate.sh does)
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import path from 'node:path';

const G = 'generated/product-vision-to-user-stories';
const T = 'tools/dark-factory-gen';
const walk = (d) => readdirSync(d).flatMap((n) => { const p = path.join(d, n); return statSync(p).isDirectory() ? (n === '.build' || n === 'mapping' ? [] : walk(p)) : [p]; });
const files = [...walk(G), ...walk(T)].filter((f) => /\.(md|mjs|json|sh|yaml|py)$/.test(f) && !f.endsWith('check-refs.mjs'));

const skills = new Set(readdirSync(`${G}/skills`));
const agents = new Set(readdirSync(`${G}/agents`).map((f) => f.replace(/\.md$/, '')));
const hooks = new Set(readdirSync(`${G}/hooks`).filter((f) => f.endsWith('.hook.mjs')).map((f) => f.replace(/\.hook\.mjs$/, '')));
// knowledge/ of the plugin = generated knowledge/*.md + process-rules.md (copied by build-plugin.mjs)
const knowledge = new Set([...readdirSync(`${G}/knowledge`), 'process-rules.md']);
const known = new Set([...skills, ...agents, ...hooks, 'product-vision-to-user-stories', 'product-part']);
// names from before the prefix rename (step skills without prefix, df-* skills/agents, bare hook names)
const stepSrc = readFileSync(`${T}/steps.mjs`, 'utf8');
const oldNames = [...stepSrc.matchAll(/\['product-([a-z0-9-]+)', 'p\d/g)].map((m) => m[1])
  .concat(['research-budget-guard', 'critic-readonly-guard', 'artifact-frontmatter-check']);
const oldRx = new RegExp(`(?<![\\w-])(${oldNames.map((n) => n.replace(/[-]/g, '\\-')).join('|')})(?![\\w-])|(?<![\\w-])df-(stratege|researcher|interviewer|persona|ux|architekt|backlog-autor|qa|kritiker|recherche|kritiker-pruefung|panel-befragung|phasen-gate|traceability)(?![\\w-])|hooks/df/`, 'g');

const problems = [];
for (const f of files) {
  const s = readFileSync(f, 'utf8');
  const lines = s.split('\n');
  lines.forEach((line, i) => {
    const at = `${f}:${i + 1}`;
    for (const m of line.matchAll(oldRx)) problems.push(`${at} old name "${m[0]}"`);
    // product-* identifiers
    for (const m of line.matchAll(/(?<![\w./-])product-[a-z0-9-]+[a-z0-9](?![\w-])/g)) {
      const n = m[0];
      if (!known.has(n) && !n.startsWith('product-vision-to-user-stories')) problems.push(`${at} unknown name "${n}"`);
    }
    // install-era paths: the factory ships as the dark-factory plugin (D-35), nothing lives in .claude/
    if (f.startsWith(G) && /\.claude\/(skills|hooks|agents|workflows)\//.test(line)) problems.push(`${at} install-era .claude/ path (use \${CLAUDE_PLUGIN_ROOT}/…)`);
    // plugin paths outside skills/: ${CLAUDE_PLUGIN_ROOT}/hooks/<x>.hook.mjs, ${CLAUDE_PLUGIN_ROOT}/knowledge/<x>.md
    for (const m of line.matchAll(/\$\{CLAUDE_PLUGIN_ROOT\}\/hooks\/([a-z0-9-]+)\.hook\.mjs/g)) if (!hooks.has(m[1])) problems.push(`${at} hook "${m[1]}" missing`);
    for (const m of line.matchAll(/\$\{CLAUDE_PLUGIN_ROOT\}\/knowledge\/([a-z0-9-]+\.md)/g)) if (!knowledge.has(m[1])) problems.push(`${at} knowledge file "${m[1]}" missing`);
    // skill paths: ${CLAUDE_PLUGIN_ROOT}/skills/<x>/<rest> or skills/<x>/<rest>
    for (const m of line.matchAll(/(?:\.claude\/)?skills\/(product-[a-z0-9-]+)(\/[A-Za-z0-9_./-]*[A-Za-z0-9_])?/g)) {
      const [, name, rest] = m;
      if (!skills.has(name)) { problems.push(`${at} path to missing skill "${name}"`); continue; }
      if (rest && !rest.includes('*') && !rest.includes('<') && !existsSync(path.join(G, 'skills', name, rest))) problems.push(`${at} missing file skills/${name}${rest}`);
    }
    for (const m of line.matchAll(/agents\/(product-[a-z0-9-]+)\.md/g)) if (!agents.has(m[1])) problems.push(`${at} agent file "${m[1]}" missing`);
  });
}
// the Workflow: every role and skill literal must exist
const wf = readFileSync(`${G}/product-vision-to-user-stories.workflow.mjs`, 'utf8');
for (const m of wf.matchAll(/s\('[^']+', '[^']+', '([a-z-]+)', '([a-z0-9-]+)'/g)) {
  if (!agents.has(`product-${m[1]}`)) problems.push(`workflow: agent product-${m[1]} missing`);
  if (!skills.has(m[2])) problems.push(`workflow: skill ${m[2]} missing`);
}
for (const m of wf.matchAll(/run\([^,]+, '([a-z-]+)', '([a-z0-9-]+)'/g)) {
  if (!agents.has(`product-${m[1]}`)) problems.push(`workflow: agent product-${m[1]} missing`);
  if (!skills.has(m[2])) problems.push(`workflow: skill ${m[2]} missing`);
}
// agent/skill frontmatter name == file/dir name
for (const a of agents) if (!readFileSync(`${G}/agents/${a}.md`, 'utf8').includes(`\nname: ${a}\n`)) problems.push(`agent ${a}: frontmatter name mismatch`);
for (const k of skills) if (!readFileSync(`${G}/skills/${k}/SKILL.md`, 'utf8').includes(`\nname: ${k}\n`)) problems.push(`skill ${k}: frontmatter name mismatch`);

console.log(`checked ${files.length} files · ${skills.size} skills · ${agents.size} agents · ${hooks.size} hooks`);
console.log(problems.length ? problems.join('\n') : 'no reference problems');
process.exit(problems.length ? 1 : 0);
