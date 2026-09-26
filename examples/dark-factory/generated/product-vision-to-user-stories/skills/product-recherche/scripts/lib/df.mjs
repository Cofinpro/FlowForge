// bpmn: {"file":"product-vision-to-user-stories.bpmn","elements":["R_3"]}
// Shared helpers for the dark-factory scripts: the artifact contract (Markdown body + JSON sidecar,
// Gedächtnis §11.2), run workspace state (run.json), id allocation, event log.
//
// Storage contract: every run document is two files —
//   <name>.md         human-readable body with a READ-ONLY frontmatter rendered from the sidecar
//   <name>.meta.json  the metadata, source of truth, written only by scripts
// Readers never parse the Markdown frontmatter; they read the sidecar. The frontmatter is rendered
// as `key: <JSON>` lines (valid YAML), so no YAML library is needed to write it.
//
// Dependency: js-yaml only for reading generated reference files with YAML frontmatter (rubrics),
// resolved lazily from an out-of-repo tool cache (DF_TOOLS_CACHE, default
// ~/.cache/bpmn-authoring-tools) and installed there on first use.
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync, appendFileSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const CACHE = process.env.DF_TOOLS_CACHE || path.join(os.homedir(), '.cache', 'bpmn-authoring-tools');

let yamlLib;
export function yaml() {
  if (yamlLib) return yamlLib;
  if (!existsSync(path.join(CACHE, 'node_modules', 'js-yaml'))) {
    mkdirSync(CACHE, { recursive: true });
    if (!existsSync(path.join(CACHE, 'package.json'))) execFileSync('npm', ['init', '-y'], { cwd: CACHE, stdio: 'ignore' });
    execFileSync('npm', ['install', '--no-audit', '--no-fund', '--silent', 'js-yaml'], { cwd: CACHE, stdio: 'ignore' });
  }
  return (yamlLib = createRequire(path.join(CACHE, 'package.json'))('js-yaml'));
}

export function readJson(file) {
  return JSON.parse(readFileSync(file, 'utf8'));
}
export function writeJson(file, data) {
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
}
export const sha256 = (s) => createHash('sha256').update(s).digest('hex');

/** Reference files shipped with the skills (rubrics): YAML frontmatter + body. Not for run documents. */
export function readDoc(file) {
  const text = readFileSync(file, 'utf8');
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return { data: {}, body: text };
  return { data: yaml().load(m[1]) || {}, body: m[2] };
}

// ------------------------------------------------------------------ artifact contract (§11.2)

export const SCHEMA = { artifact: 'df.artifact/v1', gate: 'df.gate-record/v1', source: 'df.source/v1' };
export const STATUSES = ['draft', 'passed', 'passed-with-risk', 'superseded', 'discarded', 'stale'];
export const EVIDENCE_LEVELS = ['cited', 'inferred', 'synthetic', 'validated'];

export const metaPathOf = (mdPath) => mdPath.replace(/\.md$/, '.meta.json');
export const mdPathOf = (metaPath) => metaPath.replace(/\.meta\.json$/, '.md');

/** The body of a run Markdown file: everything after a leading frontmatter block (if any). */
export function bodyOf(text) {
  const m = text.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n?([\s\S]*)$/);
  return (m ? m[1] : text).replace(/^\s*\n/, '');
}

/** Fields shown in the rendered frontmatter, in this order. Everything else stays in the sidecar only. */
const FM_KEYS = ['id', 'type', 'bpmnElement', 'version', 'status', 'gateway', 'iteration', 'verdict', 'score', 'url', 'sourceType'];
export function renderFrontmatter(meta, metaFile) {
  const lines = [`# READ-ONLY — rendered from ${metaFile} by the dark-factory scripts. Edits here are ignored and overwritten.`];
  for (const k of FM_KEYS) if (meta[k] !== undefined && meta[k] !== null) lines.push(`${k}: ${JSON.stringify(meta[k])}`);
  if (meta.gate) lines.push(`gate: ${JSON.stringify({ record: meta.gate.record, verdict: meta.gate.verdict })}`);
  if (meta.derived?.evidence) lines.push(`evidence: ${JSON.stringify(meta.derived.evidence)}`);
  if (meta.derived?.items?.length) lines.push(`items: ${JSON.stringify(meta.derived.items)}`);
  if (meta.riskFlags?.length) lines.push(`riskFlags: ${JSON.stringify(meta.riskFlags)}`);
  lines.push(`meta: ${JSON.stringify(metaFile)}`);
  return `---\n${lines.join('\n')}\n---\n\n`;
}

/** Write a run document: sidecar (source of truth) + Markdown with rendered frontmatter. Sets meta.body. */
export function writeRecord(mdPath, meta, body) {
  mkdirSync(path.dirname(mdPath), { recursive: true });
  const clean = body.replace(/^\s*\n/, '');
  meta.body = { path: path.basename(mdPath), sha256: sha256(clean) };
  writeJson(metaPathOf(mdPath), meta);
  writeFileSync(mdPath, renderFrontmatter(meta, path.basename(metaPathOf(mdPath))) + clean);
  return meta;
}

/** Re-render only the frontmatter after a metadata change (status, gate); the body is untouched. */
export function rerender(mdPath, meta) {
  const body = existsSync(mdPath) ? bodyOf(readFileSync(mdPath, 'utf8')) : '';
  writeJson(metaPathOf(mdPath), meta);
  writeFileSync(mdPath, renderFrontmatter(meta, path.basename(metaPathOf(mdPath))) + body);
}

/**
 * Commit an artifact produced by a script (trace findings, matrix): same envelope as
 * commit-artifact.mjs, version bump + history snapshot when the body or items changed.
 */
export function writeScriptArtifact(runDir, mdPath, { id, type, bpmnElement, agentRole, derivedFrom = [], itemIndex = [], attributes }, body) {
  const run = loadRun(runDir);
  const prev = readMeta(mdPath);
  const clean = body.replace(/^\s*\n/, '');
  const authored = { itemIndex, ...(attributes ? { attributes } : {}) };
  if (prev && prev.body?.sha256 === sha256(clean) && JSON.stringify(prev.authored) === JSON.stringify(authored)) return prev;
  const now = new Date().toISOString();
  const n = itemIndex.length;
  const evidence = Object.fromEntries(EVIDENCE_LEVELS.map((l) => [l, n ? Math.round((itemIndex.filter((i) => i.evidence === l).length / n) * 100) / 100 : 0]));
  const meta = {
    schema: SCHEMA.artifact, id, type, bpmnElement, runId: run.runId || path.basename(runDir), version: prev ? prev.version + 1 : 1, status: 'draft',
    language: run.language || 'de', producedBy: { agentRole, modelRole: 'none', model: 'script' },
    createdAt: prev?.createdAt || now, committedAt: now, body: null, derivedFrom, authored,
    derived: { items: itemIndex.map((i) => i.id), evidence: { ...evidence, n } }, gate: null, riskFlags: [],
    history: [...(prev?.history || []), ...(prev ? [{ version: prev.version, sha256: prev.body?.sha256, status: prev.status, gate: prev.gate?.record || null, committedAt: prev.committedAt }] : [])],
  };
  mkdirSync(path.dirname(mdPath), { recursive: true });
  writeRecord(mdPath, meta, clean);
  const hist = path.join(runDir, 'history', id);
  mkdirSync(hist, { recursive: true });
  writeFileSync(path.join(hist, `v${meta.version}.md`), readFileSync(mdPath));
  writeFileSync(path.join(hist, `v${meta.version}.meta.json`), readFileSync(metaPathOf(mdPath)));
  return meta;
}

/** derivedFrom entries for every committed artifact of the given types (history excluded). */
export function inputsOfType(runDir, types) {
  return walkMeta(runDir).map((f) => ({ f, m: readJson(f) }))
    .filter(({ m }) => m.schema === SCHEMA.artifact && types.includes(m.type) && !['discarded', 'superseded'].includes(m.status))
    .map(({ f, m }) => ({ artifact: m.id, version: m.version, sha256: m.body?.sha256, path: path.relative(runDir, mdPathOf(f)).split(path.sep).join('/') }));
}

export function readMeta(mdPath) {
  const f = metaPathOf(mdPath);
  return existsSync(f) ? readJson(f) : null;
}

/** All *.meta.json below dir (recursive, history/ excluded), sorted. */
export function walkMeta(dir) {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const name of readdirSync(dir).sort()) {
    const p = path.join(dir, name);
    if (statSync(p).isDirectory()) { if (name !== 'history') out.push(...walkMeta(p)); }
    else if (name.endsWith('.meta.json')) out.push(p);
  }
  return out;
}

/** All *.md below dir (recursive, history/ excluded), sorted. */
export function walkMd(dir) {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const name of readdirSync(dir).sort()) {
    const p = path.join(dir, name);
    if (statSync(p).isDirectory()) { if (name !== 'history') out.push(...walkMd(p)); }
    else if (name.endsWith('.md')) out.push(p);
  }
  return out;
}

/** Required sidecar fields per document kind (Gedächtnis §11.2, §12, §8). */
export const REQUIRED = {
  artifact: ['schema', 'id', 'type', 'bpmnElement', 'runId', 'version', 'status', 'producedBy', 'derivedFrom', 'authored', 'derived', 'body', 'language'],
  gate: ['schema', 'id', 'gateway', 'iteration', 'rubric', 'threshold', 'score', 'verdict', 'pathTaken', 'riskFlags', 'timestamp', 'body'],
  source: ['schema', 'id', 'url', 'title', 'retrievedAt', 'tool', 'query', 'contentHash', 'sourceType', 'body'],
};

/** Problems with a parsed sidecar (structure only; values are produced by scripts). */
export function checkMeta(kind, meta) {
  const problems = [];
  for (const f of REQUIRED[kind]) if (meta[f] === undefined || meta[f] === '') problems.push(`missing "${f}"`);
  if (meta.schema && meta.schema !== SCHEMA[kind]) problems.push(`schema "${meta.schema}", expected "${SCHEMA[kind]}"`);
  if (kind === 'artifact') {
    if (meta.status && !STATUSES.includes(meta.status)) problems.push(`status "${meta.status}" not in ${STATUSES.join('|')}`);
    if (meta.derivedFrom && !Array.isArray(meta.derivedFrom)) problems.push('"derivedFrom" must be a list of {artifact, version, sha256, path}');
  }
  return problems;
}

/**
 * Is this Markdown file committed, i.e. has a valid sidecar whose body hash matches the file?
 * Returns a list of problems (empty = committed). Used by K.1 before the critic judges anything.
 */
export function checkCommitted(mdPath, kind = kindOfPath(mdPath) || 'artifact') {
  if (!existsSync(mdPath)) return ['file does not exist'];
  const meta = readMeta(mdPath);
  if (!meta) return [`no sidecar ${path.basename(metaPathOf(mdPath))} — the step did not run commit-artifact.mjs`];
  const problems = checkMeta(kind, meta);
  const body = bodyOf(readFileSync(mdPath, 'utf8'));
  if (meta.body?.sha256 && meta.body.sha256 !== sha256(body)) problems.push('body changed after the last commit (sha256 mismatch) — run commit-artifact.mjs again');
  return problems;
}

/** Classify a run-workspace path into a document kind, or null if it carries no contract. */
export function kindOfPath(p) {
  const s = String(p).split(path.sep).join('/');
  if (/\/history\//.test(s)) return null;
  if (/\/panel\/guides\/[^/]+_(interview|walkthrough|rating|vote)\.md$/.test(s)) return null; // panel stimulus, not an artifact
  if (/\/gates\/G-\d+.*\.md$/.test(s)) return 'gate';
  if (/\/research\/sources\/SRC-\d+.*\.md$/.test(s)) return 'source';
  if (/\/(artifacts|backlog|panel|research\/reports)\/.*\.md$/.test(s) || /\/00_idea-brief\.md$/.test(s) || /\/runs\/[^/]+\/REPORT\.md$/.test(s)) return 'artifact';
  return null;
}

// ------------------------------------------------------------------ ids, run state, log

/** Next free id for a prefix, scanning a directory for files named <PREFIX>-<n>... */
export function nextId(dir, prefix, width) {
  let max = 0;
  if (existsSync(dir)) {
    for (const name of readdirSync(dir)) {
      const m = name.match(new RegExp(`^${prefix}-(\\d+)`));
      if (m) max = Math.max(max, Number(m[1]));
    }
  }
  return `${prefix}-${String(max + 1).padStart(width, '0')}`;
}

export function loadRun(runDir) {
  const f = path.join(runDir, 'run.json');
  return existsSync(f) ? readJson(f) : {};
}
export function saveRun(runDir, run) {
  writeJson(path.join(runDir, 'run.json'), run);
}

/** Append one line to log/events.jsonl. Timestamps come from the script (scripts may use the clock; Workflow scripts may not). */
export function logEvent(runDir, event) {
  mkdirSync(path.join(runDir, 'log'), { recursive: true });
  appendFileSync(path.join(runDir, 'log', 'events.jsonl'), JSON.stringify({ ts: new Date().toISOString(), ...event }) + '\n');
}

export function die(msg, code = 2) {
  console.error(msg);
  process.exit(code);
}
