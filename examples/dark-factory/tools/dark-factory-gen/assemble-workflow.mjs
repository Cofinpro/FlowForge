// Prepends the bpmn traceability header (all spec element ids) to workflow-body.mjs, writes the
// Workflow script into generated/<wf>/, and syntax-checks it with the body wrapped in an async IIFE
// (a raw `node --check` rejects the Workflow tool's legitimate top-level `return`).
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { G, WF, BPMN } from './steps.mjs';

const HERE = path.dirname(new URL(import.meta.url).pathname);
const yaml = createRequire(process.env.HOME + '/.cache/bpmn-authoring-tools/package.json')('js-yaml');
const spec = yaml.load(readFileSync(`${G}/workflow-spec.yaml`, 'utf8'));
const hdr = '// bpmn: ' + JSON.stringify({ file: BPMN, elements: Object.keys(spec.elements) }) + '\n';
const src = hdr + readFileSync(path.join(HERE, 'workflow-body.mjs'), 'utf8');
const target = `${G}/${WF}.workflow.mjs`;
writeFileSync(target, src);

const i = src.indexOf('\n}\n', src.indexOf('export const meta')) + 3;
const stubs = 'const args={runId:"x",idea:"y"},budget={total:null,remaining:()=>Infinity},agent=async()=>({}),parallel=async()=>[],pipeline=async()=>[],phase=()=>{},log=()=>{};';
mkdirSync(path.join(HERE, '.build'), { recursive: true });
const check = path.join(HERE, '.build', 'wf-check.mjs');
writeFileSync(check, `${src.slice(0, i)}\n${stubs}\n(async () => {${src.slice(i)}\n})();\n`);
execFileSync('node', ['--check', check], { stdio: 'inherit' });
console.log('workflow ok', target);
