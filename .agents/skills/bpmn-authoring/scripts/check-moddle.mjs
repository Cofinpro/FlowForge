#!/usr/bin/env node
// Usage: node check-moddle.mjs <cacheDir> <file.bpmn>
// Parses <file.bpmn> with bpmn-moddle and fails (exit 1) on any parse warning
// (unresolved references, duplicate IDs, unparsable elements). See
// references/validation.md for why bpmn-moddle is resolved via createRequire
// against <cacheDir>/package.json instead of a bare import.
import { createRequire } from 'node:module';
import path from 'node:path';
import { readFileSync } from 'node:fs';

const [, , cacheDir, file] = process.argv;
if (!cacheDir || !file) {
  console.error('Usage: node check-moddle.mjs <cacheDir> <file.bpmn>');
  process.exit(2);
}

const require = createRequire(path.join(cacheDir, 'package.json'));
const { BpmnModdle } = require('bpmn-moddle');

const xml = readFileSync(file, 'utf8');
const { warnings } = await new BpmnModdle().fromXML(xml);

if (warnings.length) {
  for (const w of warnings) console.error('WARN', w.message);
  process.exit(1);
}
console.log(`bpmn-moddle: 0 warnings (${file})`);
