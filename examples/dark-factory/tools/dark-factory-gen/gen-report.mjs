// Writes mapping/report.md from the confirmed spec.
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { G, BPMN } from './steps.mjs';

const yaml = createRequire(process.env.HOME + '/.cache/bpmn-authoring-tools/package.json')('js-yaml');
const spec = yaml.load(readFileSync(`${G}/workflow-spec.yaml`, 'utf8'));
const ids = Object.keys(spec.elements);
const esc = (x) => String(x ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
const rel = (p) => '`' + p.replace(`${G}/`, '') + '`';
const ownerOf = (id) => {
  // where orchestrator logic lives
  return '(see `product-vision-to-user-stories.workflow.mjs`)';
};
const rows = ids.map((id) => {
  const e = spec.elements[id];
  const lane = spec.roles[e.lane]?.label || '—';
  let paths = (e.generatedPaths || []).map(rel).join(', ');
  if (!paths) paths = e.kind === 'orchestrator' ? ownerOf(id) : '—';
  const notes = [];
  if (e.reason) notes.push(e.reason);
  if (e.gate) notes.push(`gate ${e.gate.kind}, maxLoops ${e.gate.maxLoops}`);
  if (e.kind === 'hook' || (e.generatedPaths || []).some((p) => p.endsWith('.hook.mjs'))) {
    const h = e.generatedPaths.filter((p) => p.includes('/hooks/')).map(rel);
    notes.push(`hook pair: ${h.join(' + ')}`);
  }
  if (e.collection) notes.push(`multi-instance over ${e.collection.ref}`);
  if (e.condition) notes.push(`condition: ${e.condition}`);
  return `| ${esc(e.label || id)} (${id}) | ${e.bpmnType} | ${esc(lane)} | ${e.kind} | ${paths} | ${esc(notes.join('; '))} |`;
});
const grey = ids.filter((id) => spec.elements[id].kind === 'not-generated').map((id) => `- "${spec.elements[id].label || id}" (${id}) — ${spec.elements[id].reason}`);
const red = ids.filter((id) => spec.elements[id].kind === 'unresolved');
const openQs = (spec.openQuestions || []).filter((q) => q.answer == null);
const redLine = (id) => {
  const e = spec.elements[id];
  const q = openQs.find((x) => x.elementId === id);
  return `- "${e.label || id}" (${id}) — ${e.reason || '(no reason given)'}${q ? ` Open question: ${q.question}` : ''}`;
};
const roleRows = Object.entries(spec.roles).map(([k, r]) => `| ${esc(r.label)} (${k}) | ${r.bpmnLaneId} | \`agents/${r.agentName}.md\` | ${r.modelTier || 'session default'} | ${r.tools ? r.tools.join(', ') : 'inherits all'} |`);
const artRows = Object.entries(spec.artifacts).map(([k, a]) => `| ${k} | \`${esc(a.pathPattern)}\` | ${[].concat(a.producer || []).join(', ') || '—'} | ${(a.consumers || []).join(', ') || '—'} | ${(a.frontmatter || []).map((f) => f.field).join(', ') || '—'} |`);
const kinds = {};
for (const e of Object.values(spec.elements)) kinds[e.kind] = (kinds[e.kind] || 0) + 1;

const out = `---
bpmn:
  file: ${BPMN}
  elements: [${ids.join(', ')}]
---

# Mapping report — ${spec.meta.workflowName}

Generated ${spec.meta.updated.slice(0, 10)} from \`generated/${spec.meta.workflowName}/workflow-spec.yaml\`
(source \`${BPMN}\` @ \`${spec.meta.sourceBpmn.sha256.slice(0, 12)}…\`). This is the trace target for
\`bpmn2agent-verify\` — every row below must correspond to what's actually on disk.

Elements by kind: ${Object.entries(kinds).map(([k, n]) => `${k} ${n}`).join(' · ')} (total ${ids.length}).

## Review status

${red.length || openQs.length
    ? `**${red.length} red element(s), ${openQs.length} open question(s) — resolve before approval.** Details: "Red — open / unresolved" and "Open questions carried forward" below.`
    : `**Nothing red, no open questions.** All ${ids.length} elements resolved to a concrete kind.`}
${grey.length} element(s) deliberately not generated (grey) — not an error, reasons under "Grey" below.
Interactive, read-only view of the same mapping: [\`index.html\`](index.html).

## Pattern

**${spec.pattern.chosen}** — top-level file: \`${spec.meta.workflowName}.workflow.mjs\`

${spec.pattern.rationale}

### Alternatives considered

${spec.pattern.alternativesConsidered.map((a) => `- **${a.pattern}** — ${a.whyNot}`).join('\n')}

### Deviations from the generator defaults (confirmed with the user, 2026-09-25)

- **Role agents despite workflow-script.** \`bpmn2agent-generate\` normally generates agents only
  for the orchestrator-agent pattern. Here the Workflow script runs every step with
  \`agentType: df-<role>\`, so the 10 role agents are real runtime components (docs/dark-factory/implementation.md §2: "ein Agent pro agentRole"). Every step element claims its role's agent file.
- **Lanes → roles.** The diagram draws one lane per role per sub-process (42 lanes). Each lane has its
  own \`roles.<key>\` entry, and all lanes of the same \`sdlc:agentRole\` share one agent. Lane-less
  elements (top-level process, R, K) take their role from \`sdlc:step agentRole\` and point at that
  role's first lane.
- **Hooks attached to their gate element.** "Artefakt gegen Rubric bewerten" (skill) also owns
  \`product-critic-readonly-guard\`. "Rubric laden" (script) also owns \`product-artifact-contract-guard\` (the same
  storage contract enforced at write time) and \`commit-artifact.mjs\` + \`lib/contracts.mjs\`, the one writer of
  artifact sidecars that K.1 checks before anything is judged.

## Legend

One colour per \`kind\` (\`mapping/workflow-mapped.bpmn\`, \`index.html\`, \`renders/*.png\`). Every annotation
also names its kind or status, so the colour is never the only signal.

| Colour | Kind | Meaning |
|---|---|---|
| Blue | \`agent-checklist\` | A checklist item in the owning agent. |
| Green | \`skill\` | Its own generated skill. |
| Purple | \`script\` | A deterministic script inside a skill. |
| Orange | \`hook\` | A Claude Code hook. |
| Teal | \`orchestrator\` | Gateways, loop back-edges, multi-instance markers — no file of its own. |
| Amber | \`human-checkpoint\` | A person decides here (none in this fully autonomous process). |
| Brown | \`artifact-contract\` | A data object with a path/frontmatter contract. |
| **Grey** | \`not-generated\` | Deliberately not generated; reason shown under "Grey" below. Not an error. |
| **Red** | \`unresolved\` | Unmapped or still an open question; blocks \`bpmn2agent-verify\`'s "no red in the map" check. |

## Element → artifact map

| BPMN element | Type | Lane | Kind | Generated artifact(s) | Notes |
|---|---|---|---|---|---|
${rows.join('\n')}

## Grey — deliberately not generated

${grey.join('\n') || 'None.'}

## Red — open / unresolved

${red.length ? red.map(redLine).join('\n') : 'None — every element resolved to a concrete kind.'}

## Roles

| Role | Lane | Agent generated | Model tier | Tools |
|---|---|---|---|---|
${roleRows.join('\n')}

## Artifacts

| Artifact | Path pattern | Producer | Consumers | Frontmatter |
|---|---|---|---|---|
${artRows.join('\n')}

## Open questions carried forward

${openQs.map((q) => `- ${q.elementId}: ${q.question}`).join('\n') || 'None. Every question raised was answered (see README.md for the decisions).'}
`;
mkdirSync(`${G}/mapping`, { recursive: true });
writeFileSync(`${G}/mapping/report.md`, out);
console.log('report rows', rows.length);
