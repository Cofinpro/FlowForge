// bpmn: {"file":"product-vision-to-user-stories.bpmn","elements":["Start_Geschaeftsidee"]}
// Target-project manifest .dark-factory/project.json (df.project/v1, D-33). Shared by
// run-state.mjs init --ensure-project (first run creates it) and product-init (init-project.mjs,
// which fills in platform before the first run). Deterministic — no LLM call.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

export const SCHEMA = 'df.project/v1';
export const manifestPath = (projectDir) => path.join(projectDir, '.dark-factory', 'project.json');

export function readManifest(projectDir) {
  try { return JSON.parse(readFileSync(manifestPath(projectDir), 'utf8')); } catch { return null; }
}

export function defaultManifest(projectDir) {
  return { schema: SCHEMA, name: path.basename(path.resolve(projectDir)), language: 'de', publishDir: 'docs/product', platform: { architecture: '', stack: '' } };
}

// Rejects what publish-results.mjs and S0 could not use. Returns a list of problems.
export function checkManifest(m) {
  const p = [];
  if (m.schema !== SCHEMA) p.push(`schema must be ${SCHEMA}`);
  if (!m.name || typeof m.name !== 'string') p.push('name is required');
  if (!['de', 'en'].includes(m.language)) p.push('language must be de or en');
  const pub = String(m.publishDir || '');
  if (!pub || path.isAbsolute(pub) || pub.split(/[\\/]/).includes('..') || /^runs(\/|$)/.test(pub)) p.push('publishDir must be relative, inside the project and outside runs/');
  if (typeof m.platform !== 'object' || m.platform === null) p.push('platform {architecture, stack} is required');
  else for (const k of ['architecture', 'stack']) if (typeof m.platform[k] !== 'string') p.push(`platform.${k} must be a string`);
  return p;
}

export function writeManifest(projectDir, m) {
  const problems = checkManifest(m);
  if (problems.length) throw new Error(`invalid manifest: ${problems.join('; ')}`);
  mkdirSync(path.dirname(manifestPath(projectDir)), { recursive: true });
  writeFileSync(manifestPath(projectDir), JSON.stringify(m, null, 2) + '\n');
}

// runs/ holds evidence and must stay out of git (implementation.md §4)
export function ensureGitignore(projectDir) {
  const gi = path.join(projectDir, '.gitignore');
  const text = existsSync(gi) ? readFileSync(gi, 'utf8') : '';
  if (text.split('\n').some((l) => ['runs/', 'runs', '/runs/', '/runs'].includes(l.trim()))) return 'kept';
  writeFileSync(gi, text + (text && !text.endsWith('\n') ? '\n' : '') + 'runs/\n');
  return 'added runs/';
}

// Creates the manifest if missing (never overwrites) and ignores runs/.
export function ensureProject(projectDir) {
  const out = {};
  if (existsSync(manifestPath(projectDir))) out.manifest = 'kept';
  else { writeManifest(projectDir, defaultManifest(projectDir)); out.manifest = 'created — fill in platform (or run /dark-factory:product-init)'; }
  out.gitignore = ensureGitignore(projectDir);
  return out;
}
