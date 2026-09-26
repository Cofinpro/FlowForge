// bpmn: {"file":"product-vision-to-user-stories.bpmn","elements":["K_1"]}
// Commit core shared by commit-artifact.mjs and story.mjs (Gedächtnis §11.2). Deterministic — no LLM.
// commitArtifact() validates the model-authored block, computes every other sidecar field, writes
// the sidecar + rendered Markdown, snapshots history and logs the commit. Throws CommitError with
// the list of problems instead of exiting, so callers decide how to report.
import path from 'node:path';
import { existsSync, readFileSync, writeFileSync, copyFileSync, mkdirSync } from 'node:fs';
import {
  readJson, sha256, bodyOf, writeRecord, readMeta, metaPathOf, mdPathOf, walkMeta, loadRun, logEvent, SCHEMA, EVIDENCE_LEVELS,
} from './df.mjs';
import { STEPS, AUX_TYPES } from './contracts.mjs';

export class CommitError extends Error {}
const fail = (msg) => { throw new CommitError(msg); };

export const AUTHORED_SCHEMA = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  $id: 'df.authored/v1',
  title: 'Model-authored part of an artifact sidecar',
  type: 'object',
  additionalProperties: false,
  required: ['itemIndex'],
  properties: {
    itemIndex: {
      type: 'array',
      description: 'One entry per item this artifact creates or changes (Gedächtnis §10).',
      items: {
        type: 'object', additionalProperties: false, required: ['id', 'derivedFrom', 'evidence'],
        properties: {
          id: { type: 'string', pattern: '^[A-Z]+-\\d+$' },
          title: { type: 'string' },
          derivedFrom: { type: 'array', items: { type: 'string' }, description: 'Parent item ids (e.g. UT-004) or SRC/T ids' },
          evidence: { enum: EVIDENCE_LEVELS },
          refs: { type: 'array', items: { type: 'string' }, description: 'SRC-/T-/P- ids backing the item; cited needs >= 1 SRC' },
          status: { type: 'string', description: 'active (default) | discarded | needs-resplit | …' },
        },
      },
    },
    sources: { type: 'array', items: { type: 'string' }, description: 'All SRC-/T-/P- ids used in the body' },
    riskFlags: { type: 'array', items: { type: 'string' } },
    attributes: { type: 'object', description: 'Type-specific structured fields, e.g. epic {title, actv, tasks, goal, slice}' },
    openQuestions: { type: 'array', items: { type: 'string' } },
    notesForNext: { type: 'string', description: 'Short handoff note for the consuming step(s)' },
  },
};

/** Minimal validator for AUTHORED_SCHEMA (no dependency); returns a list of problems. */
export function validateAuthored(a) {
  const p = [];
  if (!a || typeof a !== 'object' || Array.isArray(a)) return ['authored must be a JSON object'];
  const allowed = Object.keys(AUTHORED_SCHEMA.properties);
  for (const k of Object.keys(a)) if (!allowed.includes(k)) p.push(`unknown key "${k}" — the model supplies only ${allowed.join(', ')}; ids, versions, status, evidence mix are computed`);
  if (!Array.isArray(a.itemIndex)) p.push('"itemIndex" must be an array (may be empty)');
  const strs = (k) => a[k] === undefined || (Array.isArray(a[k]) && a[k].every((x) => typeof x === 'string'));
  for (const k of ['sources', 'riskFlags', 'openQuestions']) if (!strs(k)) p.push(`"${k}" must be an array of strings`);
  if (a.attributes !== undefined && (typeof a.attributes !== 'object' || Array.isArray(a.attributes))) p.push('"attributes" must be an object');
  if (a.notesForNext !== undefined && typeof a.notesForNext !== 'string') p.push('"notesForNext" must be a string');
  const seen = new Set();
  for (const [i, it] of (a.itemIndex || []).entries()) {
    const at = `itemIndex[${i}]${it?.id ? ` (${it.id})` : ''}`;
    if (!it || typeof it !== 'object') { p.push(`${at} must be an object`); continue; }
    for (const k of Object.keys(it)) if (!Object.keys(AUTHORED_SCHEMA.properties.itemIndex.items.properties).includes(k)) p.push(`${at}: unknown key "${k}"`);
    if (!/^[A-Z]+-\d+$/.test(String(it.id || ''))) p.push(`${at}: id must look like PREFIX-001`);
    if (seen.has(it.id)) p.push(`${at}: duplicate id`);
    seen.add(it.id);
    if (!Array.isArray(it.derivedFrom)) p.push(`${at}: derivedFrom must be an array`);
    if (!EVIDENCE_LEVELS.includes(it.evidence)) p.push(`${at}: evidence must be one of ${EVIDENCE_LEVELS.join('|')}`);
    if (it.refs !== undefined && !Array.isArray(it.refs)) p.push(`${at}: refs must be an array`);
    if (it.evidence === 'cited' && !(it.refs || []).some((r) => /^SRC-\d+$/.test(r))) p.push(`${at}: evidence "cited" needs at least one SRC- id in refs (Gedächtnis §6)`);
    if (it.evidence === 'validated') p.push(`${at}: evidence "validated" is unreachable in dark mode (Gedächtnis §6)`);
  }
  return p;
}

export const rel = (runDir, p) => path.relative(runDir, p).split(path.sep).join('/');
const stable = (x) => JSON.stringify(x, Object.keys(x || {}).sort());

/** All committed artifacts of the run (history excluded). */
export function committed(runDir) {
  return walkMeta(runDir).map((f) => ({ file: f, md: mdPathOf(f), meta: readJson(f) })).filter((x) => x.meta.schema === SCHEMA.artifact);
}

/**
 * opts: { stepId, type?, authored, from?: [paths], body?: string, derivedFrom?: [{artifact, version, sha256, path}] }
 * derivedFrom: when given, used as-is instead of resolving the step's declared inputs (story lineage).
 * body: when given, the Markdown body is written by this function (record types such as stories,
 * whose body is rendered from the authored data); otherwise the file must already hold the body.
 * Returns {id, version, status, meta, items, evidence, derivedFrom, warnings, unchanged?}.
 */
export function commitArtifact(runDir, mdPath, { stepId, type: typeArg, authored, from = [], body: bodyArg, derivedFrom: derivedFromArg }) {
  if (!stepId) fail('commit needs --step <elementId>');
  const step = STEPS[stepId];
  if (!step) fail(`unknown step "${stepId}" — not in lib/contracts.mjs`);
  if (bodyArg === undefined && !existsSync(mdPath)) fail(`${mdPath} does not exist — write the body first`);
  const prev = readMeta(mdPath);
  let type = typeArg;
  const produces = (t) => step.outputs.find((o) => o.artifact === t) || (AUX_TYPES[t]?.producers.includes(stepId) ? { artifact: t, ...AUX_TYPES[t] } : null);
  // amend: a later step changes a file another step produced (e.g. ACs appended to a story file)
  const amend = prev && (!type || type === prev.type) && !produces(prev.type);
  if (amend) type = prev.type;
  if (!type) {
    if (step.outputs.length !== 1) fail(`step ${stepId} has ${step.outputs.length} outputs (${step.outputs.map((o) => o.artifact).join(', ')}) — pass --type`);
    type = step.outputs[0].artifact;
  }
  const out = amend ? { artifact: type, pathPattern: '' } : produces(type);
  if (!out) fail(`step ${stepId} does not produce "${type}" (outputs: ${step.outputs.map((o) => o.artifact).join(', ')}) and ${mdPath} is not an existing artifact it could amend`);

  const problems = validateAuthored(authored);

  const run = loadRun(runDir);
  const all = committed(runDir);
  const known = new Set(all.flatMap((a) => (a.meta.authored?.itemIndex || []).map((i) => i.id)));
  const srcIds = new Set(walkMeta(path.join(runDir, 'research', 'sources')).map((f) => readJson(f).id));
  for (const it of authored.itemIndex || []) {
    for (const r of it.refs || []) if (/^SRC-\d+$/.test(r) && !srcIds.has(r)) problems.push(`${it.id}: refs ${r}, which is not a normalized source in research/sources/`);
  }
  for (const s of authored.sources || []) if (/^SRC-\d+$/.test(s) && !srcIds.has(s)) problems.push(`sources lists ${s}, which is not a normalized source in research/sources/`);
  if (problems.length) fail(`authored block rejected for ${rel(runDir, mdPath)}:\n- ${problems.join('\n- ')}`);

  const warnings = [];
  const prefixes = [...new Set([out.itemPrefix, ...step.outputs.map((o) => o.itemPrefix)].filter(Boolean))];
  for (const it of authored.itemIndex) {
    const pre = it.id.replace(/-\d+$/, '');
    if (!known.has(it.id) && prefixes.length && !prefixes.includes(pre)) warnings.push(`${it.id}: new item with prefix ${pre}, step declares ${prefixes.join('/')}`);
  }

  // id: step key + type, plus a discriminator for per-instance files (persona, story, transcript …)
  const r = rel(runDir, mdPath);
  const storyDir = r.match(/\/((?:ST|SPK)-\d+)\//)?.[1];
  const fileTok = path.basename(r).match(/^([A-Z]+-\d+)/)?.[1];
  const disc = storyDir || (/\{(nn|nnn|nnnn|slug|storyId)\}/.test(out.pathPattern || '') ? fileTok : null);
  const id = amend ? prev.id : `${step.key}_${type}${disc ? `_${disc}` : ''}`;

  // derivedFrom: the latest committed artifact of every declared input type (same story when per-story)
  const derivedFrom = [];
  const missing = [];
  if (derivedFromArg) derivedFrom.push(...derivedFromArg);
  else if (amend) derivedFrom.push(...prev.derivedFrom);
  for (const inp of amend || derivedFromArg ? [] : step.inputs) {
    let cands = all.filter((a) => a.meta.type === inp.artifact && !['discarded', 'superseded'].includes(a.meta.status) && path.resolve(a.md) !== path.resolve(mdPath));
    if (storyDir) { const same = cands.filter((a) => rel(runDir, a.md).includes(`/${storyDir}/`)); if (same.length) cands = same; }
    if (!cands.length) { if (inp.required) missing.push(inp.artifact); continue; }
    for (const a of cands) derivedFrom.push({ artifact: a.meta.id, version: a.meta.version, sha256: a.meta.body.sha256, path: rel(runDir, a.md) });
  }
  for (const f of from) {
    if (!existsSync(f)) { warnings.push(`--from ${f} does not exist`); continue; }
    const m = f.endsWith('.md') ? readMeta(f) : null;
    derivedFrom.push(m ? { artifact: m.id, version: m.version, sha256: m.body?.sha256, path: rel(runDir, f) } : { artifact: null, version: null, sha256: sha256(readFileSync(f)), path: rel(runDir, f) });
  }
  if (missing.length) warnings.push(`required input(s) not committed yet: ${missing.join(', ')}`);

  // derived fields
  const n = authored.itemIndex.length;
  const evidence = Object.fromEntries(EVIDENCE_LEVELS.map((l) => [l, n ? Math.round((authored.itemIndex.filter((i) => i.evidence === l).length / n) * 100) / 100 : 0]));
  const derived = { items: authored.itemIndex.map((i) => i.id), evidence: { ...evidence, n } };

  const body = bodyArg !== undefined ? bodyArg.replace(/^\s*\n/, '') : bodyOf(readFileSync(mdPath, 'utf8'));
  const bodySha = sha256(body);
  if (prev && prev.id !== id) warnings.push(`sidecar id changes from ${prev.id} to ${id}`);
  const unchanged = prev && prev.body?.sha256 === bodySha && stable(prev.authored) === stable(authored) && stable(prev.derivedFrom) === stable(derivedFrom);
  if (unchanged) return { id: prev.id, version: prev.version, status: prev.status, meta: rel(runDir, metaPathOf(mdPath)), unchanged: true, warnings };

  const now = new Date().toISOString();
  const version = prev ? prev.version + 1 : 1;
  const meta = {
    schema: SCHEMA.artifact,
    id, type, bpmnElement: amend ? prev.bpmnElement : stepId, runId: run.runId || path.basename(runDir), version, status: 'draft',
    language: run.language || 'de',
    producedBy: amend ? prev.producedBy : { agentRole: step.role, modelRole: step.modelRole, model: step.model, skill: step.skill },
    ...(amend || prev?.amendedBy ? { amendedBy: [...(prev?.amendedBy || []), ...(amend ? [{ bpmnElement: stepId, agentRole: step.role, version: (prev?.version || 0) + 1 }] : [])] } : {}),
    createdAt: prev?.createdAt || now,
    committedAt: now,
    body: null, // set by writeRecord
    derivedFrom,
    ...(missing.length ? { missingInputs: missing } : {}),
    authored,
    derived,
    gate: null,
    riskFlags: [...new Set(authored.riskFlags || [])],
    history: [...(prev?.history || []), ...(prev ? [{ version: prev.version, sha256: prev.body?.sha256, status: prev.status, gate: prev.gate?.record || null, committedAt: prev.committedAt }] : [])],
  };
  writeRecord(mdPath, meta, body);

  const hist = path.join(runDir, 'history', id);
  mkdirSync(hist, { recursive: true });
  copyFileSync(mdPath, path.join(hist, `v${version}.md`));
  copyFileSync(metaPathOf(mdPath), path.join(hist, `v${version}.meta.json`));

  logEvent(runDir, { event: 'artifact-committed', element: stepId, id, version, items: n });
  return { id, version, status: meta.status, meta: rel(runDir, metaPathOf(mdPath)), items: derived.items, evidence: derived.evidence, derivedFrom: derivedFrom.map((d) => `${d.artifact ?? d.path}@${d.version ?? d.sha256.slice(0, 8)}`), warnings };
}

