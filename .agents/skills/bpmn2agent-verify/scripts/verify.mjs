#!/usr/bin/env node
// Static verification pass for a bpmn2agent-generate output — the fifth/last step of the
// bpmn-to-agentic-workflow pipeline (analyze -> knowledge -> design -> generate -> verify).
//
// Usage: node verify.mjs <cacheDir> <generated/<workflow>/ dir> [--json]
//   cacheDir      same tool cache bpmn-authoring/scripts/validate.sh uses
//                 (${BPMN_TOOLS_CACHE:-$HOME/.cache/bpmn-authoring-tools}) — already has
//                 bpmn-moddle/bpmnlint/playwright from a prior validate.sh run; this script
//                 additionally installs ajv/ajv-formats/js-yaml into the SAME cache on first use
//                 (same ensurePackages() approach as validate.sh's own npm-install step).
//   generatedDir  a generated/<workflow>/ directory containing workflow-spec.yaml, produced by
//                 bpmn2agent-generate.
//   --json        print a single machine-readable JSON report instead of the human-readable one.
//
// IMPORTANT: run from the repo root. workflow-spec.yaml's meta.sourceBpmn.path is repo-relative
// and is resolved against process.cwd() — the same convention bpmn2agent-generate's
// render-mapping.mjs documents for itself. generatedPaths entries are ALSO repo-relative
// (e.g. "generated/<workflow>/skills/foo/SKILL.md") but are resolved against the <generatedDir>
// argument instead of cwd, by stripping the "generated/<workflow>/" prefix — this is what lets
// verify.mjs be pointed at a *copy* of a generated/<workflow>/ tree living anywhere (e.g. for a
// dry run under a scratch directory) without the copy needing to sit inside a real repo checkout
// at generated/<workflow>/.
//
// Exit code: 0 iff every check category below has zero "fail"-level findings (warnings don't
// block). 2 on a CLI usage error (bad args / <generatedDir> not a directory).
//
// ── What this checks (six categories, run in this order) ──────────────────────────────────
//  1. spec-schema         workflow-spec.yaml parses as YAML and validates against
//                          bpmn2agent-design/assets/workflow-spec.schema.yaml (ajv, draft-07).
//  2. source-bpmn          sha256 of the recorded meta.sourceBpmn.path matches
//                          meta.sourceBpmn.sha256 (HARD FAIL on mismatch — see rationale below),
//                          and the .bpmn still passes bpmn-authoring/scripts/validate.sh
//                          (XSD + bpmn-moddle + bpmnlint).
//  3. element-to-artifact  every BPMN flow node from a fresh inventory.mjs run has a
//                          spec.elements entry; every BPMN lane has a roles.* entry; every
//                          not-generated/unresolved element has a reason; every generatedPaths
//                          entry for a skill/script/hook/artifact-contract element exists on disk.
//  4. artifact-to-element  every file actually on disk under <generatedDir> (except a short,
//                          documented exception list) carries a valid bpmn header whose `file`
//                          matches the spec's source .bpmn and whose `elements` are real spec
//                          element ids; a file an element's generatedPaths claims must have that
//                          element id in its own header (header elements superset the claim).
//                          Files nobody claims are either (a) inside a recorded skill/agent
//                          directory (bundled companion material — allowed), (b) one of a small
//                          budget of "the one top-level orchestration file" the plan says isn't
//                          in any element's own generatedPaths, or (c) flagged as an orphan.
//  5. lint                 every plain script/hook .mjs parses (`node --check`); every hook
//                          `*.hook.settings.json` is valid JSON and pairs with a `*.hook.mjs`;
//                          a Workflow script (detected by an `export const meta = {...}` block,
//                          not by file name) has a pure-literal meta with name+description, and
//                          the body after that block parses once wrapped in
//                          `(async () => { ... })();` (plain `node --check` on the raw file
//                          rejects the Workflow tool's legitimate top-level `return`).
//  6. no-red               no `kind: unresolved` element, no openQuestions[] entry with
//                          answer: null, and — only if it exists — mapping/workflow-mapped.bpmn
//                          itself still passes validate.sh.
//
// ── Output layouts (spec.meta.outputLayout) ───────────────────────────────────────────────
// - claude-dir: everything a user installs sits under <generatedDir>/.claude/ in the layout of a
//   project's own .claude/ folder (skills/, agents/, hooks/, workflows/, settings.json), so
//   installing is one copy. Extra checks: skill/script/hook generatedPaths must point inside
//   .claude/; .claude/settings.json is valid JSON and references exactly the hook scripts under
//   .claude/hooks/ (both directions); no *.hook.settings.json snippets; every .mjs under .claude/
//   imports only Node built-ins or relative files (no npm packages, nothing to install); no
//   package.json under .claude/.
// - legacy (default when the field is absent, e.g. the dark-factory example): skills/, agents/,
//   hooks/*.hook.settings.json snippets and <workflow>.workflow.mjs directly under <generatedDir>.
//
// ── Design notes / judgement calls (documented here so a reader doesn't have to reverse them) ──
// - sha256 mismatch is a HARD FAIL, not a warning: every other check in this file assumes the
//   recorded hash still describes what's on disk (the schema's own doc comment says a mismatch
//   "means elements may have changed" and should drive a diff-only re-interview). Warning and
//   continuing would validate a spec against a diagram it was never actually generated from --
//   worse than useless, actively misleading. Route: re-run bpmn2agent-analyze.
// - "the one top-level orchestration file" (skill-chain top-level skill / Workflow script /
//   orchestrator agent) is, by construction (bpmn2agent-generate SKILL.md step 3/7), not in any
//   element's own generatedPaths. This script knows its expected PATH in advance from
//   pattern.chosen + meta.workflowName (skills/<workflow>/SKILL.md for skill-chain-hooks,
//   <workflow>.workflow.mjs for workflow-script, agents/<workflow>-orchestrator.md for
//   orchestrator-agent — same paths bpmn2agent-generate SKILL.md step 7 writes to) and only grants
//   the budget-of-one to a file matching that exact path; anything else unclaimed is an orphan.
//   "mixed" has no single expected shape (one top-level file per phase, no formal phase-boundary
//   field to check against — see pattern.phases), so it keeps the old unlimited/any-unclaimed-file
//   behaviour instead. (Earlier versions of this script granted the budget to the first
//   unexplained file the directory walk reached, in sort order — that could hand the budget to an
//   unrelated stray file and misreport the real top-level file as the duplicate; fixed by matching
//   the expected path instead of walk order.)
// - `generated/<workflow>/knowledge/*.md` (written by bpmn2agent-knowledge SKILL.md §5) persists
//   on disk and is explained by being listed in spec.knowledge.refs — a field this script
//   otherwise never reads, since it's separate from elements.*.generatedPaths. A knowledge file
//   still needs a valid bpmn: header like every other .md file; only the "who claims this path"
//   orphan check is exempted for it.
// - The bpmn header's line position in a .mjs file: the plan says "FIRST line"; the actual
//   templates (script-template.mjs, hook-script-template.mjs) put a `#!/usr/bin/env node`
//   shebang first and the `// bpmn: ` header on line 2 (a shebang MUST be the file's literal
//   first byte to work as a shebang at all). workflow-script-template.mjs has no shebang (it's
//   never executed directly — see its own template comment) and puts the header on line 1. This
//   script accepts either: line 1, or line 2 if line 1 starts with "#!".
import { builtinModules, createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SKILL_DIR = path.resolve(__dirname, '..'); // .../bpmn2agent-verify
const FAMILY_DIR = path.resolve(SKILL_DIR, '..'); // .../skills
const SCHEMA_PATH = path.join(FAMILY_DIR, 'bpmn2agent-design', 'assets', 'workflow-spec.schema.yaml');
const INVENTORY_SCRIPT = path.join(FAMILY_DIR, 'bpmn2agent-analyze', 'scripts', 'inventory.mjs');
const VALIDATE_SH = path.join(FAMILY_DIR, 'bpmn-authoring', 'scripts', 'validate.sh');

// ---------------------------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------------------------
const rawArgs = process.argv.slice(2);
const jsonMode = rawArgs.includes('--json');
const positional = rawArgs.filter((a) => a !== '--json');
const [cacheDir, generatedDirArg] = positional;
if (!cacheDir || !generatedDirArg) {
  console.error('Usage: node verify.mjs <cacheDir> <generated/<workflow>/ dir> [--json]');
  process.exit(2);
}
const generatedDir = path.resolve(generatedDirArg);
if (!existsSync(generatedDir) || !statSync(generatedDir).isDirectory()) {
  console.error(`Not a directory: ${generatedDir}`);
  process.exit(2);
}

// ---------------------------------------------------------------------------------------------
// Result collection
// ---------------------------------------------------------------------------------------------
const categories = [];
function category(id, title) {
  const cat = { id, title, findings: [] };
  cat.fail = (message) => cat.findings.push({ level: 'fail', message });
  cat.warn = (message) => cat.findings.push({ level: 'warn', message });
  cat.info = (message) => cat.findings.push({ level: 'info', message });
  categories.push(cat);
  return cat;
}
function catStatus(cat) {
  if (cat.findings.some((f) => f.level === 'fail')) return 'fail';
  if (cat.findings.some((f) => f.level === 'warn')) return 'warn';
  return 'pass';
}

// ---------------------------------------------------------------------------------------------
// Tool cache bootstrap: ajv/ajv-formats/js-yaml into the SAME cache validate.sh uses, same
// npm-install-if-missing approach validate.sh itself uses for bpmn-moddle/bpmnlint/playwright.
// ---------------------------------------------------------------------------------------------
function ensurePackages(dir, pkgs) {
  mkdirSync(dir, { recursive: true });
  const pkgJson = path.join(dir, 'package.json');
  if (!existsSync(pkgJson)) {
    execFileSync('npm', ['init', '-y'], { cwd: dir, stdio: 'ignore' });
  }
  const missing = pkgs.filter((p) => !existsSync(path.join(dir, 'node_modules', p)));
  if (missing.length) {
    execFileSync('npm', ['install', '--no-audit', '--no-fund', '--silent', ...missing], { cwd: dir, stdio: 'inherit' });
  }
}
ensurePackages(cacheDir, ['ajv', 'ajv-formats', 'js-yaml']);
const cacheRequire = createRequire(path.join(cacheDir, 'package.json'));
const yaml = cacheRequire('js-yaml');
const AjvMod = cacheRequire('ajv');
const Ajv = AjvMod.default || AjvMod;
const addFormatsMod = cacheRequire('ajv-formats');
const addFormats = addFormatsMod.default || addFormatsMod;

// ---------------------------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------------------------
function runCapture(cmd, args, opts = {}) {
  try {
    const stdout = execFileSync(cmd, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], ...opts });
    return { ok: true, stdout, stderr: '' };
  } catch (e) {
    return { ok: false, stdout: e.stdout ? String(e.stdout) : '', stderr: e.stderr ? String(e.stderr) : String(e.message) };
  }
}
function tail(text, n = 15) {
  const lines = String(text).trim().split('\n');
  return lines.slice(-n).join('\n');
}

function parseMdHeader(content) {
  const lines = content.split('\n');
  if (lines[0] === undefined || lines[0].trim() !== '---') {
    throw new Error('no YAML frontmatter (file must start with "---")');
  }
  let endIdx = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '---') { endIdx = i; break; }
  }
  if (endIdx === -1) throw new Error('frontmatter opening "---" found but no closing "---"');
  const fmText = lines.slice(1, endIdx).join('\n');
  let fm;
  try {
    fm = yaml.load(fmText);
  } catch (e) {
    throw new Error(`frontmatter YAML parse error: ${e.message}`);
  }
  if (!fm || typeof fm !== 'object') throw new Error('frontmatter did not parse to an object');
  if (!fm.bpmn || typeof fm.bpmn !== 'object') throw new Error('frontmatter has no top-level "bpmn:" key');
  const { file, elements } = fm.bpmn;
  if (typeof file !== 'string' || !file) throw new Error('frontmatter bpmn.file is missing or not a non-empty string');
  if (!Array.isArray(elements)) throw new Error('frontmatter bpmn.elements is missing or not an array');
  return { file, elements: elements.map(String) };
}

function parseMjsHeader(content) {
  const lines = content.split('\n');
  let idx = 0;
  if (lines[0] && lines[0].startsWith('#!')) idx = 1;
  const line = lines[idx];
  if (line === undefined) throw new Error('file is shorter than expected — no bpmn header line found');
  const prefix = '// bpmn: ';
  if (!line.startsWith(prefix)) {
    throw new Error(
      `${idx === 1 ? 'line 2 (after the shebang)' : 'line 1'} is not "// bpmn: {...}" (got: ${JSON.stringify(line.slice(0, 60))})`
    );
  }
  const jsonText = line.slice(prefix.length);
  let obj;
  try {
    obj = JSON.parse(jsonText);
  } catch (e) {
    throw new Error(`bpmn header JSON parse error: ${e.message}`);
  }
  if (typeof obj.file !== 'string' || !obj.file) throw new Error('bpmn header .file is missing or not a non-empty string');
  if (!Array.isArray(obj.elements)) throw new Error('bpmn header .elements is missing or not an array');
  return { file: obj.file, elements: obj.elements.map(String) };
}

// Brace matcher: string/comment-aware so it doesn't get confused by "}" inside a label like
// "Betrag > Grenzwert pruefen" or a `//` comment. Good enough for the simple object/array
// literals bpmn2agent-generate's templates produce; not a full JS parser.
function findMatchingBrace(s, openIdx) {
  let depth = 0;
  const n = s.length;
  for (let i = openIdx; i < n; i++) {
    const c = s[i];
    if (c === '{') depth++;
    else if (c === '}') {
      depth--;
      if (depth === 0) return i;
    } else if (c === "'" || c === '"' || c === '`') {
      const quote = c;
      i++;
      while (i < n && s[i] !== quote) {
        if (s[i] === '\\') i++;
        i++;
      }
    } else if (c === '/' && s[i + 1] === '/') {
      while (i < n && s[i] !== '\n') i++;
    } else if (c === '/' && s[i + 1] === '*') {
      i += 2;
      while (i < n && !(s[i] === '*' && s[i + 1] === '/')) i++;
      i++;
    }
  }
  throw new Error('unbalanced braces while locating the end of the "export const meta" block');
}

function extractMetaBlock(content) {
  const metaIdx = content.indexOf('export const meta');
  if (metaIdx === -1) throw new Error('no "export const meta" found');
  const eqIdx = content.indexOf('=', metaIdx);
  if (eqIdx === -1) throw new Error('"export const meta" has no "="');
  const openIdx = content.indexOf('{', eqIdx);
  if (openIdx === -1) throw new Error('no "{" found to open the meta object');
  const closeIdx = findMatchingBrace(content, openIdx);
  let endOfMeta = closeIdx + 1;
  if (content[endOfMeta] === ';') endOfMeta++;
  return { openIdx, closeIdx, endOfMeta, text: content.slice(openIdx, closeIdx + 1) };
}

function isWorkflowScriptShaped(content) {
  const lines = content.split('\n');
  let idx = 0;
  if (lines[0] && lines[0].startsWith('#!')) idx++;
  if (lines[idx] && lines[idx].trimStart().startsWith('// bpmn: ')) idx++;
  while (lines[idx] !== undefined && lines[idx].trim() === '') idx++;
  return !!(lines[idx] && lines[idx].trim().startsWith('export const meta'));
}

function checkMetaLiteral(content) {
  const { text } = extractMetaBlock(content);
  let metaObj;
  try {
    // eslint-disable-next-line no-new-func -- narrow, local check that the meta block is a pure
    // object literal (no imports/calls); acceptable for a dev-time verification tool running
    // against files this same pipeline just generated.
    metaObj = new Function(`"use strict"; return (${text});`)();
  } catch (e) {
    throw new Error(`meta block is not a pure, evaluable object literal: ${e.message}`);
  }
  if (!metaObj || typeof metaObj !== 'object') throw new Error('meta did not evaluate to an object');
  if (typeof metaObj.name !== 'string' || !metaObj.name) throw new Error('meta.name is missing or not a non-empty string');
  if (typeof metaObj.description !== 'string' || !metaObj.description) {
    throw new Error('meta.description is missing or not a non-empty string');
  }
  return metaObj;
}

function wrapCheckWorkflowScript(content, tmpDir) {
  const { endOfMeta } = extractMetaBlock(content);
  const head = content.slice(0, endOfMeta);
  const body = content.slice(endOfMeta);
  const wrapped = `${head}\n(async () => {\n${body}\n})();\n`;
  mkdirSync(tmpDir, { recursive: true });
  const tmpFile = path.join(tmpDir, `wrapcheck-${process.pid}-${Date.now()}-${Math.random().toString(36).slice(2)}.mjs`);
  writeFileSync(tmpFile, wrapped);
  try {
    const result = runCapture('node', ['--check', tmpFile]);
    if (!result.ok) throw new Error(tail(result.stderr));
  } finally {
    try { rmSync(tmpFile); } catch { /* best-effort cleanup */ }
  }
}

function walkFiles(dir, base = dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    // skip dotfiles/.git/.DS_Store etc. — except the top-level .claude/ payload of the claude-dir layout
    if (entry.name.startsWith('.') && !(entry.name === '.claude' && dir === base && entry.isDirectory())) continue;
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkFiles(abs, base));
    else out.push(path.relative(base, abs).split(path.sep).join('/'));
  }
  return out.sort();
}

// ---------------------------------------------------------------------------------------------
// 1. spec-schema
// ---------------------------------------------------------------------------------------------
const specCat = category('spec-schema', 'Spec schema validation');
const specPath = path.join(generatedDir, 'workflow-spec.yaml');
let spec = null;
if (!existsSync(specPath)) {
  specCat.fail(`${specPath} does not exist`);
} else {
  const specRaw = readFileSync(specPath, 'utf8');
  try {
    spec = yaml.load(specRaw);
  } catch (e) {
    specCat.fail(`workflow-spec.yaml is not valid YAML: ${e.message}`);
  }
  if (spec) {
    if (!existsSync(SCHEMA_PATH)) {
      specCat.fail(`schema not found at ${SCHEMA_PATH} (bpmn2agent-design/assets/workflow-spec.schema.yaml missing)`);
    } else {
      const schema = yaml.load(readFileSync(SCHEMA_PATH, 'utf8'));
      const ajv = new Ajv({ allErrors: true, strict: false });
      addFormats(ajv);
      const validateFn = ajv.compile(schema);
      const valid = validateFn(spec);
      if (!valid) {
        for (const err of validateFn.errors) {
          specCat.fail(`${err.instancePath || '(root)'} ${err.message} ${JSON.stringify(err.params)}`);
        }
      }
    }
  }
}

// ---------------------------------------------------------------------------------------------
// 2. source-bpmn (sha256 + structural validity) — also runs inventory.mjs for step 3.
// ---------------------------------------------------------------------------------------------
const sourceCat = category('source-bpmn', 'Source .bpmn (hash + structural validity)');
let inventory = null;
let sourceBpmnAbsPath = null;
const workflowName = spec?.meta?.workflowName;
const outputLayout = spec?.meta?.outputLayout === 'claude-dir' ? 'claude-dir' : 'legacy';
const payloadPrefix = outputLayout === 'claude-dir' ? '.claude/' : ''; // where skills/, agents/, ... live
const sourceBpmnRelPath = spec?.meta?.sourceBpmn?.path;
const recordedSha256 = spec?.meta?.sourceBpmn?.sha256;

if (!spec) {
  sourceCat.fail('skipped — workflow-spec.yaml did not parse (see spec-schema)');
} else if (!sourceBpmnRelPath) {
  sourceCat.fail('spec.meta.sourceBpmn.path is missing — cannot locate the source .bpmn');
} else {
  sourceBpmnAbsPath = path.resolve(process.cwd(), sourceBpmnRelPath);
  if (!existsSync(sourceBpmnAbsPath)) {
    sourceCat.fail(
      `source .bpmn not found at ${sourceBpmnAbsPath} (resolved "${sourceBpmnRelPath}" against cwd as the repo root — ` +
      `run verify.mjs from the repo root)`
    );
  } else {
    const bytes = readFileSync(sourceBpmnAbsPath);
    const actualSha256 = createHash('sha256').update(bytes).digest('hex');
    if (!recordedSha256) {
      sourceCat.fail('spec.meta.sourceBpmn.sha256 is missing');
    } else if (actualSha256 !== recordedSha256) {
      sourceCat.fail(
        `sha256 mismatch: spec recorded ${recordedSha256}, source .bpmn on disk is now ${actualSha256} — treated as a ` +
        `HARD FAIL (not a warning): every other check here assumes the recorded hash still describes this file; ` +
        `the diagram changed since bpmn2agent-analyze last ran. Re-run bpmn2agent-analyze (it diffs by element id and ` +
        `only asks about what changed) before trusting anything else in this report.`
      );
    } else {
      sourceCat.info(`sha256 matches (${actualSha256.slice(0, 12)}…)`);
    }

    const validateResult = runCapture('bash', [VALIDATE_SH, sourceBpmnAbsPath], {
      env: { ...process.env, BPMN_TOOLS_CACHE: cacheDir },
    });
    if (!validateResult.ok) {
      sourceCat.fail(`source .bpmn fails bpmn-authoring validate.sh:\n${tail(validateResult.stdout + '\n' + validateResult.stderr)}`);
    }

    const inventoryResult = runCapture('node', [INVENTORY_SCRIPT, cacheDir, sourceBpmnAbsPath]);
    if (!inventoryResult.ok) {
      sourceCat.fail(`could not run bpmn2agent-analyze/scripts/inventory.mjs:\n${tail(inventoryResult.stdout + '\n' + inventoryResult.stderr)}`);
    } else {
      try {
        inventory = JSON.parse(inventoryResult.stdout);
      } catch (e) {
        sourceCat.fail(`inventory.mjs did not print valid JSON: ${e.message}`);
      }
    }
  }
}

// ---------------------------------------------------------------------------------------------
// 3. element-to-artifact
// ---------------------------------------------------------------------------------------------
const elCat = category('element-to-artifact', 'Element -> artifact trace');
// claimedBy: relPath (posix, relative to generatedDir) -> Set<elementId>
const claimedBy = new Map();
// skillRoots: '[.claude/]skills/<name>' or '[.claude/]agents/<name>' directory prefixes bundled files may live under
const skillRoots = new Set();
const expectedPrefix = workflowName ? `generated/${workflowName}/` : null;

if (!spec || !inventory) {
  elCat.fail('skipped — spec and/or BPMN inventory unavailable (see spec-schema / source-bpmn)');
} else {
  const specElements = spec.elements || {};
  const specElementIds = new Set(Object.keys(specElements));
  const roleLaneIds = new Set(Object.values(spec.roles || {}).map((r) => r.bpmnLaneId));

  for (const node of inventory.flowNodes || []) {
    if (!specElementIds.has(node.id)) {
      elCat.fail(`BPMN element "${node.name || node.id}" (${node.id}, ${node.bpmnType}) has no entry in spec.elements`);
    }
  }
  for (const lane of inventory.lanes || []) {
    if (!roleLaneIds.has(lane.id)) {
      elCat.fail(`BPMN lane "${lane.name || lane.id}" (${lane.id}) has no roles.* entry (bpmnLaneId)`);
    }
  }

  const flowNodeIds = new Set((inventory.flowNodes || []).map((n) => n.id));
  const needsGeneratedPaths = new Set(['skill', 'script', 'hook', 'artifact-contract']);
  const payloadKinds = new Set(['skill', 'script', 'hook']);

  for (const [id, el] of Object.entries(specElements)) {
    if (!flowNodeIds.has(id)) {
      elCat.warn(`spec.elements.${id} does not correspond to any current BPMN flow node — possibly stale after a diagram edit`);
    }
    if ((el.kind === 'not-generated' || el.kind === 'unresolved') && !el.reason) {
      elCat.fail(`elements.${id} (kind: ${el.kind}) has no "reason"`);
    }
    const paths = el.generatedPaths || [];
    if (needsGeneratedPaths.has(el.kind) && paths.length === 0) {
      elCat.fail(`elements.${id} (kind: ${el.kind}) has no generatedPaths`);
    }
    for (const p of paths) {
      if (!expectedPrefix) continue;
      if (!p.startsWith(expectedPrefix)) {
        elCat.fail(`elements.${id} generatedPaths entry "${p}" does not start with the expected "${expectedPrefix}" prefix`);
        continue;
      }
      const rel = p.slice(expectedPrefix.length);
      const abs = path.join(generatedDir, rel);
      if (!claimedBy.has(rel)) claimedBy.set(rel, new Set());
      claimedBy.get(rel).add(id);
      if (payloadPrefix && payloadKinds.has(el.kind) && !rel.startsWith(payloadPrefix)) {
        elCat.fail(
          `elements.${id} (kind: ${el.kind}) generatedPaths entry "${p}" is outside ${expectedPrefix}${payloadPrefix} — ` +
          `with outputLayout claude-dir every installable file lives there so installing is one copy`
        );
      }
      const segs = (payloadPrefix && rel.startsWith(payloadPrefix) ? rel.slice(payloadPrefix.length) : rel).split('/');
      if ((segs[0] === 'skills' || segs[0] === 'agents') && segs.length >= 2) {
        skillRoots.add(`${rel.startsWith(payloadPrefix) ? payloadPrefix : ''}${segs[0]}/${segs[1]}`);
      }
      if (!existsSync(abs)) {
        elCat.fail(`elements.${id} generatedPaths entry "${p}" does not exist on disk (expected at ${abs})`);
      }
    }
  }

  for (const [id, art] of Object.entries(spec.artifacts || {})) {
    // producer accepts a single element id (string, legacy) or several (array) — a data object
    // genuinely written by more than one element (e.g. a draft written by analysis, then
    // overwritten/confirmed by design) is representable either way.
    const producers = art.producer == null ? [] : Array.isArray(art.producer) ? art.producer : [art.producer];
    for (const producer of producers) {
      if (!specElementIds.has(producer)) {
        elCat.fail(`artifacts.${id}.producer "${producer}" is not a known element`);
      }
    }
    for (const consumer of art.consumers || []) {
      if (!specElementIds.has(consumer)) {
        elCat.fail(`artifacts.${id}.consumers references "${consumer}", not a known element`);
      }
    }
  }
}

// ---------------------------------------------------------------------------------------------
// 4. artifact-to-element
// ---------------------------------------------------------------------------------------------
const artCat = category('artifact-to-element', 'Artifact -> element trace');
const allFiles = existsSync(generatedDir) ? walkFiles(generatedDir) : [];
const mjsFilesToLint = []; // { relPath, abs }

if (!spec) {
  artCat.fail('skipped — workflow-spec.yaml did not parse (see spec-schema)');
} else {
  const specElements = spec.elements || {};
  const allElementIds = new Set(Object.keys(specElements));
  const sourceBpmnPathNormalized = spec.meta?.sourceBpmn?.path;

  // knowledge.refs-explained paths: generated/<workflow>/knowledge/*.md files distilled by
  // bpmn2agent-knowledge (SKILL.md §5) — a *different* field from elements.*.generatedPaths, so
  // without this they'd be structurally unexplainable no matter what their header says (see the
  // bpmn2agent-knowledge SKILL.md "knowledge/ persists" note this mirrors). Explained by being
  // listed in spec.knowledge.refs; still must carry a valid bpmn: header like every other .md file
  // — this only exempts them from the "who claims this file" / orphan check below.
  const knowledgeRefPaths = new Set();
  if (expectedPrefix) {
    for (const refPath of Object.values(spec.knowledge?.refs || {})) {
      if (typeof refPath === 'string' && refPath.startsWith(expectedPrefix)) {
        knowledgeRefPaths.add(refPath.slice(expectedPrefix.length));
      }
    }
  }

  // The "one top-level orchestration file" budget (bpmn2agent-generate SKILL.md step 3/7: a
  // skill-chain top-level skill / Workflow script / orchestrator agent, by construction not in any
  // element's own generatedPaths) is only granted to a file whose path matches the *expected*
  // shape for pattern.chosen — never just the first unexplained file the walk happens to reach
  // (that misattributes the budget to whatever sorts first and misreports the real top-level file
  // as a stray, see bpmn2agent-generate SKILL.md step 7 for the per-pattern paths this mirrors).
  // "mixed" has no single expected shape (one top-level file per phase, no formal phase-boundary
  // field in the schema yet — see pattern.phases and generate step 7's own caveat), so it keeps the
  // permissive unlimited-budget/any-unclaimed-file behaviour instead of a shape check.
  const patternChosen = spec.pattern?.chosen;
  const expectedTopLevelPaths = workflowName
    ? {
        'skill-chain-hooks': [`${payloadPrefix}skills/${workflowName}/SKILL.md`],
        'workflow-script': [outputLayout === 'claude-dir' ? `.claude/workflows/${workflowName}.workflow.mjs` : `${workflowName}.workflow.mjs`],
        'orchestrator-agent': [`${payloadPrefix}agents/${workflowName}-orchestrator.md`],
      }[patternChosen] || []
    : [];

  // claude-dir: .claude/settings.json must reference exactly the hook scripts under .claude/hooks/.
  const hookScripts = allFiles.filter((f) => f.startsWith('.claude/hooks/') && f.endsWith('.mjs'));
  const expectedTopLevelPathSet = new Set(expectedTopLevelPaths);
  const topLevelBudget = patternChosen === 'mixed' ? Infinity : 1;
  let topLevelUsed = 0;

  for (const relPath of allFiles) {
    if (relPath === 'workflow-spec.yaml') continue; // the input itself, no header convention

    if (relPath.startsWith('mapping/') && relPath !== 'mapping/report.md') {
      continue; // rendered mapping assets (bpmn/html/png) — no per-file header convention
    }

    if (relPath.startsWith('knowledge/faq/')) {
      continue; // notebook Q&A audit log (bpmn2agent-knowledge notebook-faq.py) — verbatim answers, no header convention
    }

    if (outputLayout === 'claude-dir' && relPath === '.claude/settings.json') {
      let parsed = null;
      try {
        parsed = JSON.parse(readFileSync(path.join(generatedDir, relPath), 'utf8'));
      } catch (e) {
        artCat.fail(`"${relPath}" is not valid JSON: ${e.message}`);
      }
      if (parsed) {
        if (!parsed.hooks || typeof parsed.hooks !== 'object') {
          artCat.fail(`"${relPath}" has no top-level "hooks" object — it only exists to register the generated hooks`);
        }
        const commands = [];
        for (const groups of Object.values(parsed.hooks || {})) {
          for (const g of Array.isArray(groups) ? groups : []) {
            for (const h of g.hooks || []) if (typeof h.command === 'string') commands.push(h.command);
          }
        }
        const referenced = new Set(commands.flatMap((c) => c.match(/\.claude\/hooks\/[^"'\s]+/g) || []));
        for (const r of referenced) {
          if (!existsSync(path.join(generatedDir, r))) artCat.fail(`"${relPath}" runs "${r}", which does not exist`);
        }
        for (const h of hookScripts) {
          if (!referenced.has(h)) artCat.fail(`"${h}" is not registered in "${relPath}" — the hook would never fire`);
        }
        for (const c of commands) {
          if (/CLAUDE_PLUGIN_ROOT/.test(c)) artCat.fail(`"${relPath}": hook command "${c}" uses \${CLAUDE_PLUGIN_ROOT}; a project .claude/ needs $CLAUDE_PROJECT_DIR`);
        }
      }
      continue;
    }

    if (outputLayout === 'claude-dir' && /(^|\/)package(-lock)?\.json$/.test(relPath) && relPath.startsWith('.claude/')) {
      artCat.fail(`"${relPath}": no npm packages in the payload — generated scripts use Node built-ins only, nothing to install`);
      continue;
    }

    if (relPath.endsWith('.hook.settings.json')) {
      if (outputLayout === 'claude-dir') {
        artCat.fail(`"${relPath}": a per-hook settings snippet — with outputLayout claude-dir every hook is registered in .claude/settings.json instead`);
        continue;
      }
      const pairPath = relPath.slice(0, -'.settings.json'.length) + '.mjs';
      if (!existsSync(path.join(generatedDir, pairPath))) {
        artCat.fail(
          `"${relPath}" has no paired "${pairPath}" — a hook settings snippet carries no header of its own; ` +
          `traceability flows through the paired hook script's own header instead`
        );
      }
      try {
        const parsed = JSON.parse(readFileSync(path.join(generatedDir, relPath), 'utf8'));
        if (!parsed || typeof parsed !== 'object' || !parsed.hooks) {
          artCat.warn(`"${relPath}" parses as JSON but has no top-level "hooks" key`);
        }
      } catch (e) {
        artCat.fail(`"${relPath}" is not valid JSON: ${e.message}`);
      }
      continue;
    }

    const abs = path.join(generatedDir, relPath);
    const ext = path.extname(relPath);
    let content;
    try {
      content = readFileSync(abs, 'utf8');
    } catch (e) {
      artCat.fail(`"${relPath}" could not be read: ${e.message}`);
      continue;
    }

    let header = null;
    let headerErr = null;
    let unsupportedType = false;
    if (ext === '.md') {
      try { header = parseMdHeader(content); } catch (e) { headerErr = e.message; }
    } else if (ext === '.mjs') {
      mjsFilesToLint.push({ relPath, abs, content });
      try { header = parseMjsHeader(content); } catch (e) { headerErr = e.message; }
    } else {
      unsupportedType = true;
    }

    const claimingSet = claimedBy.get(relPath) || new Set();
    const underRoot = [...skillRoots].some((root) => relPath === root || relPath.startsWith(root + '/'));
    const budgetExempt = relPath === 'README.md' || relPath === 'mapping/report.md';

    if (unsupportedType) {
      artCat.warn(`"${relPath}": unknown file type, no bpmn header convention defined for it — header not checked`);
    } else if (headerErr) {
      artCat.fail(`"${relPath}": ${headerErr}`);
    } else {
      if (header.file !== sourceBpmnPathNormalized) {
        artCat.fail(`"${relPath}": header bpmn.file is "${header.file}", expected "${sourceBpmnPathNormalized}"`);
      }
      const unknownEls = header.elements.filter((e) => !allElementIds.has(e));
      if (unknownEls.length) {
        artCat.fail(`"${relPath}": header references unknown element id(s) [${unknownEls.join(', ')}] (not in spec.elements)`);
      }
      const headerSet = new Set(header.elements);
      const missingFromHeader = [...claimingSet].filter((e) => !headerSet.has(e));
      if (missingFromHeader.length) {
        artCat.fail(
          `"${relPath}": claimed by elements [${missingFromHeader.join(', ')}] via generatedPaths, but its own header ` +
          `only lists [${header.elements.join(', ')}] — header elements must be a superset of every element that claims this path`
        );
      }
    }

    const explained = claimingSet.size > 0 || underRoot || budgetExempt || knowledgeRefPaths.has(relPath);
    if (!explained) {
      const matchesExpectedTopLevelShape = patternChosen === 'mixed' || expectedTopLevelPathSet.has(relPath);
      if (matchesExpectedTopLevelShape && topLevelUsed < topLevelBudget) {
        topLevelUsed++;
        artCat.info(
          `"${relPath}": treated as the workflow's one top-level orchestration file (pattern.chosen: ` +
          `${patternChosen ?? '(unset)'}) — not itself in any element's generatedPaths, per the plan's design`
        );
      } else {
        artCat.fail(
          `"${relPath}": not traceable to any elements.*.generatedPaths entry, not inside a recorded skill/agent ` +
          `directory, not listed in knowledge.refs, and ${
            expectedTopLevelPaths.length
              ? `doesn't match the expected top-level-orchestration-file path for pattern.chosen: ${patternChosen} ` +
                `(expected "${expectedTopLevelPaths.join('" or "')}")`
              : `the top-level-orchestration-file budget (${topLevelBudget === Infinity ? 'unlimited — mixed pattern' : topLevelBudget}) is already used`
          } — looks like a stray/leftover file that shouldn't be here`
        );
      }
    }
  }
}

// ---------------------------------------------------------------------------------------------
// 5. lint
// ---------------------------------------------------------------------------------------------
const lintCat = category('lint', 'Lint (frontmatter/JSON already checked above; scripts here)');
const tmpDir = path.join(os.tmpdir(), 'bpmn2agent-verify');
const builtins = new Set(builtinModules);
for (const { relPath, content } of mjsFilesToLint) {
  if (outputLayout !== 'claude-dir' || !relPath.startsWith('.claude/')) continue;
  const specifiers = [...content.matchAll(/(?:\bfrom\s*|\bimport\s*\(?\s*|\brequire\s*\(\s*)['"]([^'"]+)['"]/g)].map((m) => m[1]);
  const external = specifiers.filter((s) => !s.startsWith('node:') && !s.startsWith('.') && !builtins.has(s.split('/')[0]));
  if (external.length) {
    lintCat.fail(`"${relPath}" imports npm package(s) [${[...new Set(external)].join(', ')}] — generated scripts use Node built-ins only, so installing stays a plain copy`);
  }
}
for (const { relPath, abs, content } of mjsFilesToLint) {
  if (isWorkflowScriptShaped(content)) {
    try {
      checkMetaLiteral(content);
    } catch (e) {
      lintCat.fail(`"${relPath}": ${e.message}`);
      continue;
    }
    try {
      wrapCheckWorkflowScript(content, tmpDir);
    } catch (e) {
      lintCat.fail(`"${relPath}" (Workflow script, wrap-checked): ${e.message}`);
    }
  } else {
    const result = runCapture('node', ['--check', abs]);
    if (!result.ok) {
      lintCat.fail(`"${relPath}": node --check failed:\n${tail(result.stdout + '\n' + result.stderr)}`);
    }
  }
}
if (lintCat.findings.length === 0) lintCat.info(`${mjsFilesToLint.length} .mjs file(s) checked, all parse cleanly`);

// ---------------------------------------------------------------------------------------------
// 6. no-red
// ---------------------------------------------------------------------------------------------
const redCat = category('no-red', 'No red (unresolved elements / open questions / mapped BPMN)');
if (!spec) {
  redCat.fail('skipped — workflow-spec.yaml did not parse (see spec-schema)');
} else {
  for (const [id, el] of Object.entries(spec.elements || {})) {
    if (el.kind === 'unresolved') {
      redCat.fail(`elements.${id} ("${el.label || id}") is kind: unresolved — ${el.reason || '(no reason given)'}`);
    }
  }
  for (const q of spec.openQuestions || []) {
    if (q.answer === null || q.answer === undefined) {
      redCat.fail(`open question on ${q.elementId}: "${q.question}" — unanswered`);
    }
  }
  const mappedBpmn = path.join(generatedDir, 'mapping', 'workflow-mapped.bpmn');
  if (existsSync(mappedBpmn)) {
    const result = runCapture('bash', [VALIDATE_SH, mappedBpmn], { env: { ...process.env, BPMN_TOOLS_CACHE: cacheDir } });
    if (!result.ok) {
      redCat.fail(`mapping/workflow-mapped.bpmn fails bpmn-authoring validate.sh:\n${tail(result.stdout + '\n' + result.stderr)}`);
    } else {
      redCat.info('mapping/workflow-mapped.bpmn passes validate.sh');
    }
  } else {
    redCat.info('mapping/workflow-mapped.bpmn not present — mapped-BPMN validate.sh check skipped (only rendered once the mapping view exists)');
  }
}

// ---------------------------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------------------------
const overall = categories.every((c) => catStatus(c) !== 'fail');

if (jsonMode) {
  const jsonReport = {
    overall: overall ? 'pass' : 'fail',
    generatedDir,
    workflowName: workflowName ?? null,
    categories: categories.map((c) => ({ id: c.id, title: c.title, status: catStatus(c), findings: c.findings })),
  };
  process.stdout.write(JSON.stringify(jsonReport, null, 2) + '\n');
} else {
  const icon = { fail: '✗', warn: '⚠', info: 'ℹ' };
  console.log(`bpmn2agent-verify — ${generatedDir}`);
  console.log('='.repeat(60));
  for (const cat of categories) {
    const status = catStatus(cat);
    const statusLabel = status === 'pass' ? 'PASS' : status === 'warn' ? 'WARN' : 'FAIL';
    console.log(`\n[${statusLabel}] ${cat.title}`);
    if (cat.findings.length === 0) console.log('  (no findings)');
    for (const f of cat.findings) {
      const lines = f.message.split('\n');
      console.log(`  ${icon[f.level] || '-'} ${lines[0]}`);
      for (const extra of lines.slice(1)) console.log(`      ${extra}`);
    }
  }
  console.log('\n' + '='.repeat(60));
  console.log(overall ? 'RESULT: PASS' : 'RESULT: FAIL');
}

process.exit(overall ? 0 : 1);
