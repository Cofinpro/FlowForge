#!/usr/bin/env node
// bpmn: {"file":"pr-review.bpmn","elements":["Task_Tests"]}
//
// Generated for the step "Tests und Linter ausführen" (scriptTask, lane "Reviewer") in pr-review.bpmn by
// flowforge-generate. Deterministic step — no LLM call, same input always produces the same
// output (mapping-rubric.md's scriptTask/businessRuleTask -> script decision).
//
// Usage: node run-tests-and-lint.mjs <repoDir> <outFile>
// Runs the project's own `test` and `lint` npm scripts (from package.json) with a timeout and
// writes the result as JSON to <outFile>:
//   {"status":"passed|failed|error","commands":[...],"failures":[{"file","line","text"}]}
// status error = the step could not run (no command found, crash, timeout); never read it as passed.
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';

const [, , repoDir, outFile] = process.argv;
if (!repoDir || !outFile) {
  console.error('Usage: node run-tests-and-lint.mjs <repoDir> <outFile>');
  process.exit(2);
}

const TIMEOUT_MS = Number(process.env.PR_REVIEW_TEST_TIMEOUT_MS || 600000);
const result = { status: 'passed', commands: [], failures: [] };

function finish(status, extra = {}) {
  Object.assign(result, extra, { status });
  mkdirSync(dirname(outFile), { recursive: true });
  writeFileSync(outFile, JSON.stringify(result, null, 2) + '\n');
  console.log(`testergebnis: ${status} (${result.failures.length} failure(s)) -> ${outFile}`);
  process.exit(status === 'error' ? 1 : 0);
}

const pkgPath = join(repoDir, 'package.json');
if (!existsSync(pkgPath)) {
  finish('error', { failures: [{ file: null, line: null, text: 'No package.json: cannot discover the test and lint commands. Ask the Reviewer.' }] });
}
let scripts;
try {
  scripts = JSON.parse(readFileSync(pkgPath, 'utf8')).scripts ?? {};
} catch (e) {
  finish('error', { failures: [{ file: null, line: null, text: `package.json is not valid JSON: ${e.message}` }] });
}
const names = ['test', 'lint'].filter((n) => scripts[n]);
if (names.length === 0) {
  finish('error', { failures: [{ file: null, line: null, text: 'package.json has neither a "test" nor a "lint" script. Ask the Reviewer.' }] });
}

const LOCATION = /([\w./\\-]+\.[A-Za-z]{1,5}):(\d+)(?::\d+)?/;
for (const name of names) {
  const cmd = `npm run ${name}`;
  result.commands.push(cmd);
  const r = spawnSync('npm', ['run', name, '--silent'], { cwd: repoDir, encoding: 'utf8', timeout: TIMEOUT_MS });
  if (r.error || r.signal) {
    finish('error', { failures: [{ file: null, line: null, text: `${cmd} did not finish (${r.error?.code ?? r.signal}); timeout is ${TIMEOUT_MS} ms.` }] });
  }
  if (r.status !== 0) {
    result.status = 'failed';
    const lines = `${r.stdout}\n${r.stderr}`.split('\n').filter((l) => l.trim());
    const located = lines.filter((l) => LOCATION.test(l)).slice(0, 20);
    if (located.length === 0) {
      result.failures.push({ file: null, line: null, text: `${cmd} exited with ${r.status}: ${lines.slice(-5).join(' | ')}` });
    }
    for (const l of located) {
      const m = l.match(LOCATION);
      result.failures.push({ file: m[1], line: Number(m[2]), text: l.trim() });
    }
  }
}
finish(result.status);
