#!/usr/bin/env node
// Renders every plane (top-level process + each collapsed sub-process) of a .bpmn file
// to PNG, using bpmn-js (via CDN, loaded in a headless Chromium page) and Playwright.
// Optional / best-effort: if Playwright's Chromium isn't installed, install it once with
// `npx playwright install chromium`, or skip this step and open the file in
// https://demo.bpmn.io/ manually instead. See references/validation.md.
//
// Usage: node render.mjs <cacheDir> <file.bpmn> <outDir>
// cacheDir must have `playwright` installed (see validate.sh's cache setup) — resolved via
// createRequire rather than a bare import, same reasoning as check-moddle.mjs: Node's ESM
// resolver won't find a package installed outside this script's own directory tree.
import { createRequire } from 'node:module';
import { readFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const [, , cacheDir, file, outDirArg] = process.argv;
if (!cacheDir || !file) {
  console.error('Usage: node render.mjs <cacheDir> <file.bpmn> [outDir]');
  process.exit(2);
}
const require = createRequire(path.join(cacheDir, 'package.json'));
const { chromium } = require('playwright');
const outDir = outDirArg || path.join(path.dirname(file), 'renders');
mkdirSync(outDir, { recursive: true });

const xml = readFileSync(file, 'utf8');

// Every subProcess id in the file becomes a drill-down target, in addition to the
// top-level process/collaboration root that bpmn-js selects by default.
const subProcessIds = [...xml.matchAll(/<bpmn:subProcess\s[^>]*\bid="([^"]+)"/g)].map((m) => m[1]);

const html = `<!doctype html><html><head>
<script src="https://cdn.jsdelivr.net/npm/bpmn-js@17.11.1/dist/bpmn-navigated-viewer.production.min.js"></script>
<style>html,body,#canvas{margin:0;width:1600px;height:1000px;background:#fff;}</style>
</head><body><div id="canvas"></div></body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
page.on('console', (msg) => {
  if (msg.type() === 'error') console.error('[page]', msg.text());
});
await page.setContent(html, { waitUntil: 'load' });

const ok = await page.evaluate(async (xmlArg) => {
  // eslint-disable-next-line no-undef
  window.__viewer = new BpmnJS({ container: '#canvas' });
  try {
    await window.__viewer.importXML(xmlArg);
    return true;
  } catch (err) {
    return String(err);
  }
}, xml);

if (ok !== true) {
  console.error('❌ bpmn-js failed to import the file:', ok);
  await browser.close();
  process.exit(1);
}

async function shoot(rootId, outFile) {
  const err = await page.evaluate(async (id) => {
    // eslint-disable-next-line no-undef
    const viewer = window.__viewer;
    const canvas = viewer.get('canvas');
    // bpmn-js creates one root element per <bpmndi:BPMNPlane> found on import (the
    // top-level process plus one per collapsed sub-process that has its own plane).
    // getRootElements() lists all of them; switch with setRootElement.
    const roots = canvas.getRootElements();
    // bpmn-js names a sub-process's synthetic plane root "<id>_plane", not "<id>" itself.
    const root = id
      ? roots.find((r) => r.id === id || r.id === `${id}_plane` || r.businessObject?.id === id)
      : roots[0];
    if (!root) return `no plane found for ${id || '(top-level)'} — known roots: ${roots.map((r) => r.id).join(', ')}`;
    canvas.setRootElement(root);
    canvas.zoom('fit-viewport');
    return null;
  }, rootId);
  if (err) {
    console.error(`⚠️  skipped ${rootId || '(top-level)'}: ${err}`);
    return;
  }
  await page.screenshot({ path: outFile });
  console.log('✓', outFile);
}

await shoot(null, path.join(outDir, 'top-level.png'));
for (const id of subProcessIds) {
  await shoot(id, path.join(outDir, `${id}.png`));
}

await browser.close();
