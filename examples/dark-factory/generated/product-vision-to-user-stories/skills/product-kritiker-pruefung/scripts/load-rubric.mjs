#!/usr/bin/env node
// bpmn: {"file":"product-vision-to-user-stories.bpmn","elements":["K_1"]}
//
// Generated from "Rubric laden" (scriptTask, Process_K) in product-vision-to-user-stories.bpmn by
// bpmn2agent-generate. Deterministic step — no LLM call.
//
// Usage: node load-rubric.mjs <rubricId> <artifact.md> [<artifact.md> ...]
// Resolves ../references/rubrics/<rubricId>.md. A composite rubric (phase-*, gate-*) lists
// `includes:` in its frontmatter; those are resolved recursively, and their criteria are prefixed
// with the included rubric id. Also checks that each artifact is committed (Gedächtnis §11.2): a
// valid <file>.meta.json sidecar whose body hash matches the Markdown — written by
// commit-artifact.mjs, never by hand. Prints JSON:
// { rubric, version, threshold, criteria: [{id, text, weight, kill, source}], gateQuestion,
//   artifacts: [{path, id, version, status, problems: [...]}] }
import path from 'node:path';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { readDoc, readMeta, checkCommitted, kindOfPath, die } from './lib/df.mjs';

const [, , rubricId, ...artifactPaths] = process.argv;
if (!rubricId) die('Usage: node load-rubric.mjs <rubricId> <artifact.md> [...]');

const RUBRICS = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'references', 'rubrics');

function load(id, seen = new Set()) {
  if (seen.has(id)) return { criteria: [] };
  seen.add(id);
  const file = path.join(RUBRICS, `${id}.md`);
  if (!existsSync(file)) die(`rubric "${id}" not found at ${file}`);
  const { data } = readDoc(file);
  let criteria = (data.criteria || []).map((c) => ({ ...c, id: `${id}.${c.id}`, rubric: id }));
  for (const inc of data.includes || []) criteria = criteria.concat(load(inc, seen).criteria);
  return { data, criteria };
}

const { data, criteria } = load(rubricId);
const artifacts = artifactPaths.map((p) => {
  if (!existsSync(p)) return { path: p, problems: ['file does not exist'] };
  const meta = readMeta(p) || {};
  const kind = kindOfPath(path.resolve(p)) || 'artifact';
  return { path: p, id: meta.id, version: meta.version, status: meta.status, evidence: meta.derived?.evidence, problems: checkCommitted(p, kind) };
});

console.log(JSON.stringify({
  rubric: rubricId,
  version: data.version || 1,
  threshold: data.threshold ?? 0.8,
  gateQuestion: data.gateQuestion || null,
  criteria,
  artifacts,
}, null, 2));
process.exit(0);
