#!/usr/bin/env node
// bpmn: {"file":"product-vision-to-user-stories.bpmn","elements":["Start_Geschaeftsidee"]}
//
// Prepares a repo as dark-factory target project before the first run (D-33, D-37): detects stack
// signals and writes .dark-factory/project.json (df.project/v1) plus the runs/ entry in .gitignore.
// Deterministic — no LLM call; the product-init skill turns the signals into a proposal.
//
// Usage:
//   node init-project.mjs detect [projectDir]   # JSON: existing manifest, stack signals, top-level entries, README head
//   node init-project.mjs write  [projectDir]   # stdin JSON {name?, language?, publishDir?, platform: {architecture, stack}}
//     merges into the existing manifest (or the default one), validates, writes, ignores runs/.
// projectDir defaults to CLAUDE_PROJECT_DIR, else the cwd.
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { readManifest, defaultManifest, writeManifest, ensureGitignore, checkManifest, manifestPath } from '../../product-traceability/scripts/lib/project.mjs';

const [, , cmd, dirArg] = process.argv;
const dir = path.resolve(dirArg || process.env.CLAUDE_PROJECT_DIR || process.cwd());
const die = (m) => { console.error(m); process.exit(2); };
if (!existsSync(dir) || !statSync(dir).isDirectory()) die(`not a directory: ${dir}`);

const SKIP = new Set(['.git', 'node_modules', 'dist', 'build', 'target', 'out', 'runs', '.claude', '.agents', '.dark-factory', 'plugins', 'vendor', '.venv', 'venv', '__pycache__', '.next', '.nuxt', 'coverage']);
const walk = (d, depth = 0) => (depth > 3 ? [] : readdirSync(d, { withFileTypes: true }).flatMap((e) => {
  if (SKIP.has(e.name)) return [];
  const p = path.join(d, e.name);
  return e.isDirectory() ? walk(p, depth + 1) : [p];
}));
const read = (f) => { try { return readFileSync(f, 'utf8'); } catch { return ''; } };
const rel = (f) => path.relative(dir, f);

// dependency name → what it tells about the platform
const JS = { vue: 'Vue', nuxt: 'Nuxt', react: 'React', next: 'Next.js', '@angular/core': 'Angular', svelte: 'Svelte', express: 'Express', '@nestjs/core': 'NestJS', fastify: 'Fastify', electron: 'Electron', 'react-native': 'React Native', '@shoelace-style/shoelace': 'Shoelace', '@awesome.me/webawesome': 'Web Awesome', typescript: 'TypeScript', vite: 'Vite', prisma: 'Prisma', '@prisma/client': 'Prisma' };
const PY = { django: 'Django', fastapi: 'FastAPI', flask: 'Flask', sqlalchemy: 'SQLAlchemy', streamlit: 'Streamlit' };
const JVM = { 'spring-boot': 'Spring Boot', quarkus: 'Quarkus', micronaut: 'Micronaut', kotlin: 'Kotlin' };

function detect() {
  const files = walk(dir);
  const signals = [];
  const add = (file, hint) => signals.push({ file: rel(file), hint });
  for (const f of files) {
    const b = path.basename(f);
    if (b === 'package.json') {
      let pj = {}; try { pj = JSON.parse(read(f)); } catch { /* ignore broken package.json */ }
      const deps = Object.keys({ ...pj.dependencies, ...pj.devDependencies });
      const hits = deps.filter((d) => JS[d]).map((d) => JS[d]);
      add(f, `Node.js${hits.length ? ': ' + [...new Set(hits)].join(', ') : ''}`);
    } else if (b === 'pom.xml' || /^build\.gradle(\.kts)?$/.test(b)) {
      const t = read(f); const hits = Object.entries(JVM).filter(([k]) => t.includes(k)).map(([, v]) => v);
      add(f, `JVM (${b === 'pom.xml' ? 'Maven' : 'Gradle'})${hits.length ? ': ' + hits.join(', ') : ''}`);
    } else if (b === 'pyproject.toml' || b === 'requirements.txt' || b === 'Pipfile') {
      const t = read(f).toLowerCase(); const hits = Object.entries(PY).filter(([k]) => t.includes(k)).map(([, v]) => v);
      add(f, `Python${hits.length ? ': ' + hits.join(', ') : ''}`);
    } else if (b === 'go.mod') add(f, 'Go');
    else if (b === 'Cargo.toml') add(f, 'Rust');
    else if (b === 'Gemfile') add(f, read(f).includes('rails') ? 'Ruby: Rails' : 'Ruby');
    else if (b === 'composer.json') add(f, read(f).includes('laravel') ? 'PHP: Laravel' : 'PHP');
    else if (b.endsWith('.csproj') || b.endsWith('.sln')) add(f, '.NET');
    else if (b === 'pubspec.yaml') add(f, 'Dart/Flutter');
    else if (b === 'Dockerfile' || /^docker-compose.*\.ya?ml$|^compose\.ya?ml$/.test(b)) add(f, 'containers');
    else if (b === 'Chart.yaml') add(f, 'Kubernetes (Helm)');
    else if (b.endsWith('.tf')) { const t = read(f); const prov = ['aws', 'azurerm', 'google', 'kubernetes'].filter((p) => t.includes(`"${p}"`) || t.includes(`provider "${p}`)); add(f, `Terraform${prov.length ? ': ' + prov.join(', ') : ''}`); }
    else if (b === 'serverless.yml') add(f, 'Serverless Framework');
    else if (/^(azure-pipelines\.ya?ml|\.gitlab-ci\.ya?ml|Jenkinsfile)$/.test(b) || rel(f).startsWith('.github/workflows/')) add(f, 'CI pipeline');
  }
  const top = readdirSync(dir).filter((n) => n !== '.git').sort();
  const readme = top.find((n) => /^readme(\.md)?$/i.test(n));
  const sources = files.filter((f) => !/^(readme|license|changelog)/i.test(path.basename(f)) && !path.basename(f).startsWith('.'));
  return {
    projectDir: dir,
    manifest: readManifest(dir),
    empty: sources.length === 0,
    signals: signals.slice(0, 60),
    topLevel: top.slice(0, 80),
    readmeHead: readme ? read(path.join(dir, readme)).split('\n').slice(0, 30).join('\n') : null,
  };
}

if (cmd === 'detect') {
  console.log(JSON.stringify(detect(), null, 2));
} else if (cmd === 'write') {
  let input;
  try { input = JSON.parse(readFileSync(0, 'utf8') || '{}'); } catch (e) { die(`stdin is not JSON: ${e.message}`); }
  const base = readManifest(dir) || defaultManifest(dir);
  const allowed = ['name', 'language', 'publishDir', 'platform'];
  const unknown = Object.keys(input).filter((k) => !allowed.includes(k));
  if (unknown.length) die(`unknown fields: ${unknown.join(', ')} (allowed: ${allowed.join(', ')})`);
  const m = { ...base, ...input, schema: base.schema, platform: { ...base.platform, ...(input.platform || {}) } };
  const problems = checkManifest(m);
  if (problems.length) die(`invalid manifest: ${problems.join('; ')}`);
  const existed = Boolean(readManifest(dir));
  writeManifest(dir, m);
  console.log(JSON.stringify({ manifest: rel(manifestPath(dir)), action: existed ? 'updated' : 'created', gitignore: ensureGitignore(dir), platformFilled: Boolean(m.platform.architecture && m.platform.stack), content: m }, null, 2));
} else {
  die('Usage: node init-project.mjs detect|write [projectDir]');
}
