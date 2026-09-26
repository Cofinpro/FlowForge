// bpmn: {"file":"product-vision-to-user-stories.bpmn","elements":["S5.1.4"]}
// Spike record (df.spike/v1, Gedächtnis §11.3): spikes are JSON-first like stories. The spike lives
// in the sidecar of backlog/spikes/SPK-<nnn>_<slug>.md under authored.attributes; the Markdown body
// is rendered from it here and never written by an agent. Deterministic — no LLM.
import { EVIDENCE_LEVELS } from './df.mjs';

export const SPIKE_STATUSES = ['open', 'done', 'discarded'];
// Timebox bounds (rubric spike: bounded, no open-ended research)
export const TIMEBOX_MAX = { hours: 16, days: 2 };

const str = { type: 'string', minLength: 1 };
const strs = { type: 'array', items: { type: 'string' } };
export const SPIKE_SCHEMA = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  $id: 'df.spike/v1',
  title: 'Spike record (source of truth for backlog/spikes/SPK-*.md and backlog.json spikes)',
  type: 'object',
  additionalProperties: false,
  required: ['id', 'title', 'question', 'why', 'blocks', 'timebox', 'acceptanceCriteria', 'decisionEnabled', 'derivedFrom', 'evidence'],
  properties: {
    id: { type: 'string', pattern: '^SPK-\\d+$' },
    title: str,
    question: { ...str, description: 'The single technical question the spike answers' },
    why: { ...str, description: 'Why the blocked story cannot be sized without the answer' },
    blocks: { type: 'array', minItems: 1, items: { type: 'string', pattern: '^ST-\\d+$' }, description: 'Stories this spike unblocks; each lists the spike in its `spikes`' },
    timebox: { type: 'object', additionalProperties: false, required: ['amount', 'unit'], properties: { amount: { type: 'number', exclusiveMinimum: 0 }, unit: { enum: Object.keys(TIMEBOX_MAX) } }, description: `Bounded: ≤ ${TIMEBOX_MAX.days} days / ${TIMEBOX_MAX.hours} hours` },
    acceptanceCriteria: { ...strs, minItems: 1, description: 'Defined before execution: what evidence or prototype output ends the spike' },
    decisionEnabled: { ...str, description: 'The decision the answer enables (e.g. size class, architecture option)' },
    derivedFrom: { ...strs, minItems: 1, description: 'Blocked ST ids (all of `blocks`) plus involved ASM ids' },
    evidence: { enum: EVIDENCE_LEVELS },
    refs: strs,
    architectureAssumptions: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['id', 'why'], properties: { id: { type: 'string', pattern: '^ASM-\\d+$' }, why: str } }, description: 'Idea-brief target-architecture assumptions behind the uncertainty' },
    status: { enum: SPIKE_STATUSES, default: 'open' },
    outcome: { type: 'string', description: 'Answer found — only with status done' },
    notes: { type: 'string' },
    flags: strs,
  },
};

export function validateSpike(sp) {
  const p = [];
  if (!sp || typeof sp !== 'object' || Array.isArray(sp)) return ['spike must be a JSON object'];
  const props = SPIKE_SCHEMA.properties;
  for (const k of Object.keys(sp)) if (!props[k]) p.push(`unknown spike field "${k}" (allowed: ${Object.keys(props).join(', ')})`);
  for (const k of SPIKE_SCHEMA.required) if (sp[k] === undefined || sp[k] === null || sp[k] === '') p.push(`missing "${k}"`);
  if (sp.id != null && !/^SPK-\d+$/.test(sp.id)) p.push('"id" must be SPK-nnn');
  if (sp.blocks !== undefined && (!Array.isArray(sp.blocks) || !sp.blocks.length || !sp.blocks.every((x) => /^ST-\d+$/.test(x)))) p.push('"blocks" must be a non-empty array of ST ids');
  const tb = sp.timebox;
  if (tb !== undefined) {
    if (!tb || typeof tb !== 'object' || !(tb.amount > 0) || !TIMEBOX_MAX[tb.unit]) p.push(`timebox must be {amount > 0, unit: ${Object.keys(TIMEBOX_MAX).join('|')}}`);
    else if (tb.amount > TIMEBOX_MAX[tb.unit]) p.push(`timebox ${tb.amount} ${tb.unit} is not bounded (max ${TIMEBOX_MAX[tb.unit]} ${tb.unit}, rubric spike)`);
  }
  for (const k of ['acceptanceCriteria', 'derivedFrom', 'refs', 'flags']) if (sp[k] !== undefined && !(Array.isArray(sp[k]) && sp[k].every((x) => typeof x === 'string'))) p.push(`"${k}" must be an array of strings`);
  if (Array.isArray(sp.acceptanceCriteria) && !sp.acceptanceCriteria.length) p.push('"acceptanceCriteria" needs at least one criterion, defined before execution');
  if (Array.isArray(sp.derivedFrom) && Array.isArray(sp.blocks)) for (const st of sp.blocks) if (!sp.derivedFrom.includes(st)) p.push(`"derivedFrom" must include the blocked story ${st}`);
  if (sp.evidence !== undefined && !EVIDENCE_LEVELS.includes(sp.evidence)) p.push(`evidence must be one of ${EVIDENCE_LEVELS.join('|')}`);
  if (sp.evidence === 'cited' && !(sp.refs || []).some((r) => /^SRC-\d+$/.test(r))) p.push('evidence "cited" needs at least one SRC- id in refs (Gedächtnis §6)');
  if (sp.evidence === 'validated') p.push('evidence "validated" is unreachable in dark mode (Gedächtnis §6)');
  if (sp.status !== undefined && !SPIKE_STATUSES.includes(sp.status)) p.push(`status must be one of ${SPIKE_STATUSES.join('|')}`);
  if (sp.outcome && sp.status !== 'done') p.push('"outcome" is only allowed with status done');
  if (sp.status === 'done' && !sp.outcome) p.push('a done spike needs its "outcome"');
  for (const [i, a] of (sp.architectureAssumptions || []).entries()) if (!/^ASM-\d+$/.test(a?.id || '') || !a.why) p.push(`architectureAssumptions[${i}] needs id ASM-nnn and why`);
  return p;
}

export function itemIndexOf(sp) {
  const it = { id: sp.id, title: sp.title, derivedFrom: sp.derivedFrom, evidence: sp.evidence, ...(sp.refs?.length ? { refs: sp.refs } : {}) };
  if (sp.status === 'discarded') it.status = 'discarded';
  return [it];
}

const EV = { cited: '🔗 cited', inferred: '🧠 inferred', synthetic: '🤖 synthetic', validated: '✅ validated' };

export function renderSpike(sp) {
  const L = [`# ${sp.id} — ${sp.title}`, ''];
  if (sp.status && sp.status !== 'open') L.push(`> **Status: ${sp.status}**`, '');
  L.push(`**Question:** ${sp.question}`, '', `**Why it blocks sizing:** ${sp.why}`, '');
  L.push('| Blocks | Timebox | Evidence | Status |', '|---|---|---|---|', `| ${sp.blocks.join(', ')} | ≤ ${sp.timebox.amount} ${sp.timebox.unit} | ${EV[sp.evidence] || sp.evidence} | ${sp.status || 'open'} |`, '');
  L.push('## Acceptance criteria (defined before execution)', '', ...sp.acceptanceCriteria.map((c) => `- [ ] ${c}`), '');
  L.push('## Decision enabled', '', sp.decisionEnabled, '');
  if (sp.architectureAssumptions?.length) L.push('## Architecture assumptions', '', ...sp.architectureAssumptions.map((a) => `- **${a.id}**: ${a.why}`), '');
  if (sp.outcome) L.push('## Outcome', '', sp.outcome, '');
  L.push('## Trace', '', `derivedFrom: ${sp.derivedFrom.join(', ')}${sp.refs?.length ? ` · refs: ${sp.refs.join(', ')}` : ''}`, '');
  if (sp.notes) L.push('## Notes', '', sp.notes, '');
  if (sp.flags?.length) L.push('## Flags', '', ...sp.flags.map((f) => `- ${f}`), '');
  return L.join('\n');
}
