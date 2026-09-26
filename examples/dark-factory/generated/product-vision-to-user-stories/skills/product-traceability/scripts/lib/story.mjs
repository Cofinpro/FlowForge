// bpmn: {"file":"product-vision-to-user-stories.bpmn","elements":["S5.1.1"]}
// Story record (df.story/v1, Gedächtnis §11.3): stories are JSON-first. The story lives in the
// sidecar of backlog/stories/ST-<nnn>_<slug>.md under authored.attributes; the Markdown body is
// rendered from it here and never written by an agent. Deterministic — no LLM.
import { EVIDENCE_LEVELS } from './df.mjs';

export const STORY_STATUSES = ['active', 'needs-resplit', 'superseded', 'discarded'];
export const SIZE_CLASSES = ['S', 'M', 'L'];

const str = { type: 'string', minLength: 1 };
export const STORY_SCHEMA = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  $id: 'df.story/v1',
  title: 'User story record (source of truth for backlog/stories/ST-*.md and backlog.json)',
  type: 'object',
  additionalProperties: false,
  required: ['id', 'title', 'epic', 'userTask', 'connextra', 'derivedFrom', 'evidence'],
  properties: {
    id: { type: 'string', pattern: '^ST-\\d+$' },
    title: str,
    epic: { type: 'string', pattern: '^EP-\\d+$' },
    userTask: { type: 'string', pattern: '^UT-\\d+$' },
    connextra: { type: 'object', additionalProperties: false, required: ['role', 'want', 'soThat'], properties: { role: str, want: str, soThat: str } },
    status: { enum: STORY_STATUSES, default: 'active' },
    derivedFrom: { type: 'array', minItems: 1, items: { type: 'string' }, description: 'Parent item ids: the UT plus EP/ACTV and the JOB/OPP it serves' },
    evidence: { enum: EVIDENCE_LEVELS },
    refs: { type: 'array', items: { type: 'string' }, description: 'SRC-/T-/P- ids; cited needs >= 1 SRC' },
    conversation: { type: 'array', items: { type: 'string' }, description: 'Conversation notes (Card-Conversation-Confirmation)' },
    context: { type: 'string', description: 'Context / trigger of the need (5.2.2 What)' },
    businessRules: { type: 'array', items: { type: 'string' } },
    scope: { type: 'object', additionalProperties: false, properties: { in: { type: 'array', items: { type: 'string' } }, out: { type: 'array', items: { type: 'string' } } } },
    implementationNotes: { type: 'array', items: { type: 'string' }, description: 'How statements, non-binding (ARC)' },
    confirmationCandidates: { type: 'array', items: { type: 'string' }, description: 'Edge cases and rules for 6.1.1' },
    blockers: { type: 'array', items: { type: 'string' }, description: 'Open blockers with SPK/ASM refs' },
    assumptions: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['id', 'why'], properties: { id: { type: 'string', pattern: '^ASM-\\d+$' }, evidence: { enum: EVIDENCE_LEVELS }, why: str } } },
    size: { type: ['object', 'null'], additionalProperties: false, required: ['class', 'reasoning'], properties: { class: { enum: SIZE_CLASSES }, reasoning: str } },
    splitFrom: { type: ['string', 'null'], pattern: '^ST-\\d+$' },
    splitPattern: { type: ['string', 'null'] },
    splitInto: { type: 'array', items: { type: 'string', pattern: '^ST-\\d+$' }, description: 'Children, set on the superseded parent (5.1.3)' },
    discard: { type: ['object', 'null'], additionalProperties: false, required: ['reason', 'justification'], properties: { reason: { enum: ['orphan', 'fake', 'duplicate'] }, duplicateOf: { type: 'string', pattern: '^ST-\\d+$' }, justification: { type: 'string' } } },
    spikes: { type: 'array', items: { type: 'string', pattern: '^SPK-\\d+$' } },
    acceptanceCriteria: {
      type: 'array',
      description: 'Canonical ACs of the story; every id must be an item of a committed acceptance-criteria artifact',
      items: {
        type: 'object', additionalProperties: false, required: ['id', 'title', 'given', 'when', 'then'],
        properties: {
          id: { type: 'string', pattern: '^AC-\\d+$' }, title: str, kind: { enum: ['happy', 'negative', 'edge'] },
          given: { type: 'array', items: { type: 'string' }, minItems: 1 }, when: { type: 'array', items: { type: 'string' }, minItems: 1 }, then: { type: 'array', items: { type: 'string' }, minItems: 1 },
          examples: { type: 'array', items: { type: 'object' } },
        },
      },
    },
    notes: { type: 'string' },
    flags: { type: 'array', items: { type: 'string' } },
  },
};

/** Validate a full story record against STORY_SCHEMA (no dependency). Returns problems. */
export function validateStory(st) {
  const p = [];
  if (!st || typeof st !== 'object' || Array.isArray(st)) return ['story must be a JSON object'];
  const props = STORY_SCHEMA.properties;
  for (const k of Object.keys(st)) if (!props[k]) p.push(`unknown story field "${k}" (allowed: ${Object.keys(props).join(', ')})`);
  for (const k of STORY_SCHEMA.required) if (st[k] === undefined || st[k] === null || st[k] === '') p.push(`missing "${k}"`);
  const re = (k, rx) => { if (st[k] != null && !rx.test(String(st[k]))) p.push(`"${k}" must match ${rx}`); };
  re('id', /^ST-\d+$/); re('epic', /^EP-\d+$/); re('userTask', /^UT-\d+$/); re('splitFrom', /^ST-\d+$/);
  const c = st.connextra;
  if (c && (typeof c !== 'object' || !c.role || !c.want || !c.soThat)) p.push('"connextra" needs role, want and soThat');
  if (c) for (const k of Object.keys(c)) if (!['role', 'want', 'soThat'].includes(k)) p.push(`connextra: unknown key "${k}"`);
  if (st.status !== undefined && !STORY_STATUSES.includes(st.status)) p.push(`status must be one of ${STORY_STATUSES.join('|')}`);
  if (st.evidence !== undefined && !EVIDENCE_LEVELS.includes(st.evidence)) p.push(`evidence must be one of ${EVIDENCE_LEVELS.join('|')}`);
  if (st.evidence === 'cited' && !(st.refs || []).some((r) => /^SRC-\d+$/.test(r))) p.push('evidence "cited" needs at least one SRC- id in refs (Gedächtnis §6)');
  if (st.evidence === 'validated') p.push('evidence "validated" is unreachable in dark mode (Gedächtnis §6)');
  if (st.derivedFrom !== undefined && (!Array.isArray(st.derivedFrom) || !st.derivedFrom.length)) p.push('"derivedFrom" must be a non-empty array of item ids');
  if (Array.isArray(st.derivedFrom) && st.userTask && !st.derivedFrom.includes(st.userTask)) p.push(`"derivedFrom" must include the userTask ${st.userTask}`);
  for (const k of ['refs', 'conversation', 'spikes', 'flags', 'businessRules', 'implementationNotes', 'confirmationCandidates', 'blockers', 'splitInto']) if (st[k] !== undefined && !(Array.isArray(st[k]) && st[k].every((x) => typeof x === 'string'))) p.push(`"${k}" must be an array of strings`);
  if (st.scope != null && (typeof st.scope !== 'object' || Object.keys(st.scope).some((k) => !['in', 'out'].includes(k)))) p.push('"scope" must be {in: [], out: []}');
  if (st.status === 'discarded' && !st.discard) p.push('a discarded story needs discard {reason: orphan|fake|duplicate, justification} (Gedächtnis §10.2)');
  if (st.discard && (!['orphan', 'fake', 'duplicate'].includes(st.discard.reason) || !st.discard.justification)) p.push('discard needs reason orphan|fake|duplicate and a justification');
  if (st.discard?.reason === 'duplicate' && !/^ST-\d+$/.test(st.discard.duplicateOf || '')) p.push('a duplicate needs discard.duplicateOf ST-nnn');
  if (st.status === 'superseded' && !(st.splitInto || []).length) p.push('a superseded story needs splitInto with its children');
  for (const [i, a] of (st.assumptions || []).entries()) if (!/^ASM-\d+$/.test(a?.id || '') || !a.why) p.push(`assumptions[${i}] needs id ASM-nnn and why`);
  if (st.size != null && (!SIZE_CLASSES.includes(st.size.class) || !st.size.reasoning)) p.push(`size needs class ${SIZE_CLASSES.join('|')} and reasoning`);
  if (st.size?.class === 'L' && st.status === 'active') p.push('size L forces splitting (Gedächtnis §4): set status "needs-resplit" or split the story');
  const acIds = new Set();
  for (const [i, ac] of (st.acceptanceCriteria || []).entries()) {
    const at = `acceptanceCriteria[${i}]${ac?.id ? ` (${ac.id})` : ''}`;
    if (!/^AC-\d+$/.test(ac?.id || '')) p.push(`${at}: id must be AC-nnn`);
    if (acIds.has(ac?.id)) p.push(`${at}: duplicate id`);
    acIds.add(ac?.id);
    if (!ac?.title) p.push(`${at}: missing title`);
    for (const k of ['given', 'when', 'then']) if (!Array.isArray(ac?.[k]) || !ac[k].length) p.push(`${at}: "${k}" must be a non-empty array of steps`);
    if (ac?.kind && !['happy', 'negative', 'edge'].includes(ac.kind)) p.push(`${at}: kind must be happy|negative|edge`);
  }
  return p;
}

/** itemIndex of a story file: the ST item only (ACs are items of their acceptance-criteria artifact). */
export function itemIndexOf(st) {
  const it = { id: st.id, title: st.title, derivedFrom: [...st.derivedFrom, ...(st.splitFrom ? [st.splitFrom] : [])], evidence: st.evidence, ...(st.refs?.length ? { refs: st.refs } : {}) };
  if (st.status && st.status !== 'active') it.status = st.status;
  return [it];
}

const esc = (s) => String(s ?? '').replace(/\|/g, '\\|');
const EV = { cited: '🔗 cited', inferred: '🧠 inferred', synthetic: '🤖 synthetic', validated: '✅ validated' };

/** The Markdown body of a story file — a pure function of the record. */
export function renderStory(st) {
  const L = [`# ${st.id} — ${st.title}`, ''];
  if (st.status && st.status !== 'active') L.push(`> **Status: ${st.status}**`, '');
  L.push(`**As a** ${st.connextra.role}, **I want** ${st.connextra.want}, **so that** ${st.connextra.soThat}.`, '');
  L.push('| Epic | User task | Size | Evidence | Split from | Spikes |', '|---|---|---|---|---|---|',
    `| ${st.epic} | ${st.userTask} | ${st.size ? `${st.size.class}` : '—'} | ${EV[st.evidence] || st.evidence} | ${st.splitFrom ? `${st.splitFrom}${st.splitPattern ? ` (${esc(st.splitPattern)})` : ''}` : '—'} | ${(st.spikes || []).join(', ') || '—'} |`, '');
  if (st.size) L.push(`**Size reasoning:** ${st.size.reasoning}`, '');
  if (st.splitInto?.length) L.push(`**Split into:** ${st.splitInto.join(', ')}`, '');
  if (st.discard) L.push(`**Discarded (${st.discard.reason}${st.discard.duplicateOf ? ` of ${st.discard.duplicateOf}` : ''}):** ${st.discard.justification}`, '');
  const list = (h, arr) => { if (arr?.length) L.push(`## ${h}`, '', ...arr.map((c) => `- ${c}`), ''); };
  if (st.context) L.push('## Context', '', st.context, '');
  list('Business rules', st.businessRules);
  if (st.scope?.in?.length || st.scope?.out?.length) L.push('## Scope', '', ...(st.scope.in || []).map((x) => `- **in:** ${x}`), ...(st.scope.out || []).map((x) => `- **out:** ${x}`), '');
  list('Conversation', st.conversation);
  list('Confirmation candidates', st.confirmationCandidates);
  list('Blockers', st.blockers);
  L.push('## Acceptance criteria', '');
  if (st.acceptanceCriteria?.length) {
    for (const ac of st.acceptanceCriteria) {
      L.push(`### ${ac.id} — ${ac.title}${ac.kind ? ` _(${ac.kind})_` : ''}`, '', '```gherkin');
      const step = (kw, arr) => arr.forEach((x, i) => L.push(`${i ? '  And' : kw} ${x}`));
      step('Given', ac.given); step('When', ac.when); step('Then', ac.then);
      L.push('```', '');
      if (ac.examples?.length) {
        const cols = [...new Set(ac.examples.flatMap((e) => Object.keys(e)))];
        L.push(`| ${cols.join(' | ')} |`, `|${cols.map(() => '---').join('|')}|`, ...ac.examples.map((e) => `| ${cols.map((c) => esc(e[c])).join(' | ')} |`), '');
      }
    }
  } else L.push('_none yet (added in 6.1)_', '');
  L.push('## Unvalidated assumptions', '');
  L.push(st.assumptions?.length ? st.assumptions.map((a) => `- **${a.id}**${a.evidence ? ` (${EV[a.evidence] || a.evidence})` : ''}: ${a.why}`).join('\n') : '_none_', '');
  L.push('## Trace', '', `derivedFrom: ${st.derivedFrom.join(', ')}${st.refs?.length ? ` · refs: ${st.refs.join(', ')}` : ''}`, '');
  list('Implementation notes (ARC, non-binding)', st.implementationNotes);
  if (st.notes) L.push('## Notes', '', st.notes, '');
  if (st.flags?.length) L.push('## Flags', '', ...st.flags.map((f) => `- ${f}`), '');
  return L.join('\n');
}
