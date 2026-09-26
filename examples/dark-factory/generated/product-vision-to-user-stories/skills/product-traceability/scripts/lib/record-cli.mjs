// bpmn: {"file":"product-vision-to-user-stories.bpmn","elements":["S5.1.1","S5.1.4"]}
// Shared CLI for JSON-first backlog records (Gedächtnis §11.3): stories (story.mjs) and spikes
// (spike.mjs). A record kind supplies its schema, validator, renderer and cross-checks; this module
// does the rest — reading stdin, locating the file, merging patches, lineage, commit through the
// shared commit core (lib/commit.mjs), and the show/list/next-id/schema commands. Deterministic.
import path from 'node:path';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { readMeta, die } from './df.mjs';
import { commitArtifact, committed, rel, CommitError } from './commit.mjs';

export const slugOf = (s) => String(s || 'record').toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48) || 'record';

/** Patch merge: objects merge one level, arrays and scalars replace. */
export function mergeRecord(base, patch) {
  const out = { ...base };
  for (const [k, v] of Object.entries(patch)) {
    out[k] = v && typeof v === 'object' && !Array.isArray(v) && base[k] && typeof base[k] === 'object' && !Array.isArray(base[k]) ? { ...base[k], ...v } : v;
  }
  return out;
}

/** Stories live in backlog/stories/, spikes in backlog/spikes/ — the directory follows the id prefix. */
export const recordsDir = (runDir, id) => path.join(runDir, 'backlog', /^SPK-/.test(id || '') ? 'spikes' : 'stories');
export function fileOf(runDir, id) {
  const d = recordsDir(runDir, id);
  const f = existsSync(d) ? readdirSync(d).find((n) => n.startsWith(`${id}_`) && n.endsWith('.md')) : null;
  return f ? path.join(d, f) : null;
}
/** Committed records of an artifact type (story-cards | spikes), keyed by their record id. */
export const recordsOf = (runDir, type) => committed(runDir).filter((a) => a.meta.type === type && a.meta.authored?.attributes?.id);
export const recordIds = (runDir, type) => new Set(recordsOf(runDir, type).map((a) => a.meta.authored.attributes.id));

/**
 * kind: { key: 'story', label, type, prefix, script, schema, validate(rec), render(rec), itemIndexOf(rec),
 *         defaults: {}, crossCheck(runDir, rec) -> problems[], lineage(runDir, rec, existing) -> derivedFrom|undefined,
 *         listRow(rec) -> {}, listFilters: {flag: field} }
 */
export function runRecordCli(kind, argv) {
  const K = kind.key;
  const flagArgs = (args, name) => args.flatMap((a, i) => (a === name ? [args[i + 1]] : []));
  const flagArg = (args, name) => flagArgs(args, name)[0];
  const readInput = () => {
    let x;
    try { x = JSON.parse(readFileSync(0, 'utf8') || '{}'); } catch (e) { die(`stdin JSON does not parse: ${e.message}`); }
    if (!x[K] || typeof x[K] !== 'object') die(`stdin must be {"${K}": {...}, "riskFlags"?, "sources"?, "openQuestions"?, "notesForNext"?}`);
    const extra = Object.keys(x).filter((k) => ![K, 'riskFlags', 'sources', 'openQuestions', 'notesForNext'].includes(k));
    if (extra.length) die(`unknown key(s) ${extra.join(', ')} — version, status of the file, evidence mix etc. are computed`);
    return x;
  };

  function save(runDir, mdPath, stepId, rec, input, prevAuthored, from, derivedFrom) {
    const problems = [...kind.validate(rec), ...kind.crossCheck(runDir, rec)];
    for (const other of recordsOf(runDir, kind.type)) if (other.meta.authored.attributes.id === rec.id && path.resolve(other.md) !== path.resolve(mdPath)) problems.push(`${rec.id} already exists in ${rel(runDir, other.md)}`);
    if (problems.length) die(`${K} ${rec.id || '?'} rejected:\n- ${problems.join('\n- ')}`);
    const authored = {
      itemIndex: kind.itemIndexOf(rec),
      sources: [...new Set([...(rec.refs || []).filter((r) => /^SRC-/.test(r)), ...(input.sources || [])])],
      riskFlags: [...new Set([...(prevAuthored?.riskFlags || []), ...(input.riskFlags || [])])],
      attributes: rec,
      ...(input.openQuestions ? { openQuestions: input.openQuestions } : prevAuthored?.openQuestions ? { openQuestions: prevAuthored.openQuestions } : {}),
      ...(input.notesForNext ? { notesForNext: input.notesForNext } : {}),
    };
    try {
      const r = commitArtifact(runDir, mdPath, { stepId, type: kind.type, authored, from, body: kind.render(rec), derivedFrom });
      console.log(JSON.stringify({ [K]: rec.id, path: rel(runDir, mdPath), ...r }));
    } catch (e) {
      if (e instanceof CommitError) die(e.message);
      throw e;
    }
  }

  const S = kind.script;
  const [cmd, ...rest] = argv;
  if (cmd === 'put') {
    const [runDir, ...args] = rest;
    if (!runDir) die(`Usage: node ${S} put <runDir> --step <element> [--from <path>]...  (stdin: {"${K}": {...}})`);
    const input = readInput();
    const id = input[K].id;
    if (!new RegExp(`^${kind.prefix}-\\d+$`).test(id || '')) die(`${K}.id must be ${kind.prefix}-nnn — get one with ${S} next-id`);
    const existing = fileOf(runDir, id);
    const md = existing || path.join(recordsDir(runDir, id), `${id}_${slugOf(input[K].title)}.md`);
    const lineage = kind.lineage(runDir, input[K], existing);
    save(runDir, md, flagArg(args, '--step'), { ...kind.defaults, ...input[K] }, input, existing ? readMeta(existing)?.authored : null, flagArgs(args, '--from'), lineage);
  } else if (cmd === 'patch') {
    const [runDir, id, ...args] = rest;
    if (!runDir || !id) die(`Usage: node ${S} patch <runDir> <${kind.prefix}-id> --step <element>  (stdin: {"${K}": {<fields>}})`);
    const md = fileOf(runDir, id);
    const prev = md && readMeta(md);
    if (!prev?.authored?.attributes || prev.type !== kind.type) die(`${id} has no committed ${K} record — create it with ${S} put first`);
    const input = readInput();
    if (input[K].id && input[K].id !== id) die(`a patch cannot change the ${K} id`);
    save(runDir, md, flagArg(args, '--step'), mergeRecord(prev.authored.attributes, input[K]), input, prev.authored, [], prev.derivedFrom);
  } else if (cmd === 'show') {
    const [runDir, id] = rest;
    const md = runDir && id && fileOf(runDir, id);
    const m = md && readMeta(md);
    if (!m || m.type !== kind.type) die(`${id} not found`);
    console.log(JSON.stringify({ path: rel(runDir, md), version: m.version, status: m.status, gate: m.gate, [K]: m.authored.attributes }, null, 2));
  } else if (cmd === 'list') {
    const [runDir, ...args] = rest;
    if (!runDir) die(`Usage: node ${S} list <runDir> ${Object.keys(kind.listFilters).map((f) => `[${f} <v>]`).join(' ')}`);
    const filters = Object.entries(kind.listFilters).map(([f, field]) => [field, flagArg(args, f)]).filter(([, v]) => v);
    const rows = recordsOf(runDir, kind.type).map(({ md, meta }) => ({ ...kind.listRow(meta.authored.attributes), artifactStatus: meta.status, version: meta.version, path: rel(runDir, md) }))
      .filter((r) => filters.every(([field, v]) => [].concat(r[field]).includes(v))).sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
    console.log(JSON.stringify(rows, null, 2));
  } else if (cmd === 'next-id') {
    const [runDir, ...args] = rest;
    if (!runDir) die(`Usage: node ${S} next-id <runDir> [--count n]`);
    const rx = new RegExp(`^${kind.prefix}-\\d+$`);
    const used = committed(runDir).flatMap((a) => (a.meta.authored?.itemIndex || []).map((i) => i.id)).filter((x) => rx.test(x));
    let max = Math.max(0, ...used.map((x) => Number(x.split('-')[1])));
    console.log(JSON.stringify(Array.from({ length: Number(flagArg(args, '--count') || 1) }, () => `${kind.prefix}-${String(++max).padStart(3, '0')}`)));
  } else if (cmd === 'schema') {
    console.log(JSON.stringify(kind.schema, null, 2));
  } else {
    die(`Usage: node ${S} put|patch|show|list|next-id|schema ...`);
  }
  process.exit(0);
}
