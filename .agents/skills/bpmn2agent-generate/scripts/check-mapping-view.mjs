#!/usr/bin/env node
// Browser check for the read-only mapping viewer written by render-mapping.mjs: opens
// generated/<workflow>/mapping/index.html in headless Chromium and asserts that it still answers
// its one question ("is anything red, and where?"), that every element can be found (level tree,
// search, kind filter), that history and deep links work, and that it stays operable without a mouse.
//
// Usage: node check-mapping-view.mjs <cacheDir> <mapping/index.html> [--shots <dir>]
//   cacheDir  same tool cache as render-mapping.mjs (playwright is installed there by validate.sh)
//   --shots   optional: write desktop / narrow / offline screenshots into <dir>
//
// Prints "mapping view ok" and exits 0, or lists every failed check and exits 1. The viewer loads
// bpmn-js from cdn.jsdelivr.net; when that is unreachable the diagram checks are skipped (the
// offline fallback is still checked) and it prints "mapping view ok (offline, diagram skipped)".
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const args = process.argv.slice(2);
const shotsIdx = args.indexOf('--shots');
const shotsDir = shotsIdx >= 0 ? path.resolve(args[shotsIdx + 1]) : null;
const [cacheDir, htmlArg] = args.filter((_, i) => shotsIdx < 0 || (i !== shotsIdx && i !== shotsIdx + 1));
if (!cacheDir || !htmlArg) {
  console.error('Usage: node check-mapping-view.mjs <cacheDir> <mapping/index.html> [--shots <dir>]');
  process.exit(2);
}
const url = pathToFileURL(path.resolve(htmlArg)).href;
const { chromium } = createRequire(path.join(cacheDir, 'package.json'))('playwright');
if (shotsDir) mkdirSync(shotsDir, { recursive: true });

const failures = [];
const check = (ok, msg) => { if (!ok) failures.push(msg); };
const shot = async (page, name) => { if (shotsDir) await page.screenshot({ path: path.join(shotsDir, `${name}.png`) }); };

const browser = await chromium.launch();
let offline = false;
try {
  // ── desktop ──
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(url);
  await page.waitForFunction(() => document.querySelector('#status').children.length > 0);
  offline = await page.evaluate(() => typeof BpmnJS === 'undefined');

  const summary = await page.evaluate(() => SUMMARY);
  const statusText = await page.textContent('#status');
  check(statusText.trim().length > 0, 'review status block is empty');
  check((await page.$$('#status .red-item')).length === summary.red.length,
    `review status lists ${(await page.$$('#status .red-item')).length} red element(s), spec has ${summary.red.length}`);
  const legendNames = await page.$$eval('#legend .legend-item .name', (els) => els.map((e) => e.textContent.trim()));
  check(legendNames.length === 9 && legendNames.every((n) => n && !/^[a-z]+(-[a-z]+)*$/.test(n)),
    `legend must show 9 human-readable kind names, got: ${legendNames.join(', ')}`);

  const docOverflow = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  check(docOverflow <= 0, `desktop page scrolls vertically by ${docOverflow} px (canvas and sidebar should fill the window)`);
  if (!offline) {
    await page.waitForSelector('#canvas .djs-element');
    const zoom = await page.evaluate(() => bpmnViewer.get('canvas').zoom());
    check(zoom >= 0.59, `initial zoom ${zoom.toFixed(2)} is below the readable minimum`);
    await shot(page, 'desktop');

    // Every red element, and one element per collapsed sub-process level, must be revealable.
    const targets = await page.evaluate(() => {
      const seen = new Set();
      const ids = SUMMARY.red.slice();
      for (const [id, e] of Object.entries(MAPPING_DATA)) {
        const key = e.topDiagramId + '|' + e.subProcessChain.join('/');
        if (!seen.has(key)) { seen.add(key); ids.push(id); }
      }
      return ids;
    });
    for (const id of targets) {
      const r = await page.evaluate(async (elId) => {
        await revealElement(elId, { focusDetails: true });
        const c = bpmnViewer.get('canvas');
        let el = bpmnViewer.get('elementRegistry').get(elId);
        while (el && el.parent) el = el.parent;
        return {
          onLevel: !el || el === c.getRootElement(), // no shape (e.g. bare data object) is fine
          heading: (document.querySelector('#details h3') || {}).textContent,
          label: MAPPING_DATA[elId].label || elId,
          focused: document.activeElement === document.querySelector('#details h3'),
        };
      }, id);
      check(r.onLevel, `reveal ${id}: element is not on the displayed diagram level`);
      check(r.heading === r.label, `reveal ${id}: details show "${r.heading}", expected "${r.label}"`);
      check(r.focused, `reveal ${id}: focus did not move to the details heading`);
    }

    // Up one level from a drill-down, then re-selecting the process returns to its top level.
    const nested = await page.evaluate(() => Object.keys(MAPPING_DATA).find((id) => MAPPING_DATA[id].subProcessChain.length));
    if (nested) {
      await page.evaluate((id) => revealElement(id), nested);
      check(await page.isVisible('#btn-up'), 'up-one-level button hidden inside a sub-process');
      const before = await page.evaluate(() => bpmnViewer.get('canvas').getRootElement().id);
      await page.click('#btn-up');
      const after = await page.evaluate(() => bpmnViewer.get('canvas').getRootElement().id);
      check(before !== after, 'up-one-level button did not change the diagram level');
      await page.evaluate((id) => revealElement(id), nested);
      const topId = await page.evaluate((id) => MAPPING_DATA[id].viewPath && LEVELS.find((l) => l.depth === 0 && l.diagramId === MAPPING_DATA[id].topDiagramId).id, nested);
      await page.click(`#nav-tree .nav-open[data-level="${topId}"]`);
      check(!(await page.isVisible('#btn-up')), 'opening a process in the level tree did not return to its top level');

      // History: Back after a drill-down returns to the previous level; a deep link opens the element.
      await page.evaluate((id) => revealElement(id), nested);
      await page.evaluate(() => history.back());
      await page.waitForFunction((t) => currentLevelId() === t, topId, { timeout: 5000 }).catch(() => {});
      check(await page.evaluate((t) => currentLevelId() === t, topId), 'browser Back did not return to the parent level');
      const deep = await browser.newPage({ viewport: { width: 1440, height: 900 } });
      await deep.goto(`${url}#el=${encodeURIComponent(nested)}`);
      await deep.waitForFunction((id) => typeof selectedId !== 'undefined' && selectedId === id, nested, { timeout: 10000 }).catch(() => {});
      check(await deep.evaluate((id) => selectedId === id && currentLevelId() === MAPPING_DATA[id].levelId, nested),
        `deep link #el=${nested} did not open and select the element`);
      await deep.close();
    }

    // Clicking an annotation shows the element it annotates.
    const annot = await page.evaluate(() => {
      const c = bpmnViewer.get('canvas');
      const a = bpmnViewer.get('elementRegistry').filter((e) => ANNOTATION_OWNER[e.id] && e.type === 'bpmn:TextAnnotation')
        .find((e) => { let r = e; while (r.parent) r = r.parent; return r === c.getRootElement(); });
      return a && { id: a.id, owner: ANNOTATION_OWNER[a.id] };
    });
    if (annot) {
      await page.click(`#canvas [data-element-id="${annot.id}"]`, { force: true });
      const heading = await page.textContent('#details h3');
      const label = await page.evaluate((id) => MAPPING_DATA[id].label || id, annot.owner);
      check(heading === label, `annotation click shows "${heading}", expected its element "${label}"`);
    }

    // Keyboard: the canvas is focusable and arrow keys pan.
    await page.focus('#canvas');
    const x0 = await page.evaluate(() => bpmnViewer.get('canvas').viewbox().x);
    await page.keyboard.press('ArrowRight');
    const x1 = await page.evaluate(() => bpmnViewer.get('canvas').viewbox().x);
    check(x0 !== x1, 'arrow keys do not pan the focused canvas');

    // Level tree: every element reachable, one row per level.
    const nav = await page.evaluate(() => ({
      els: document.querySelectorAll('#nav-tree .nav-el').length,
      total: Object.keys(MAPPING_DATA).length,
      levelRows: document.querySelectorAll('#nav-tree .nav-open').length,
      levels: LEVELS.length,
    }));
    check(nav.els === nav.total, `level tree lists ${nav.els} of ${nav.total} elements`);
    check(nav.levels === 1 || nav.levelRows === nav.levels, `level tree shows ${nav.levelRows} of ${nav.levels} levels`);

    // Search: Enter reveals the first match; nonsense shows the empty state; reset restores.
    const probe = await page.evaluate(() => {
      const id = Object.keys(MAPPING_DATA).find((k) => MAPPING_DATA[k].subProcessChain.length && MAPPING_DATA[k].label) || Object.keys(MAPPING_DATA)[0];
      return MAPPING_DATA[id].label || id;
    });
    await page.fill('#nav-search', probe);
    const firstName = await page.evaluate(() => {
      const b = Array.from(document.querySelectorAll('#nav-tree .nav-el')).find((x) => x.offsetParent !== null);
      return b && MAPPING_DATA[b.getAttribute('data-el')].label;
    });
    check(!!firstName, `search for "${probe}" shows no element row`);
    await page.press('#nav-search', 'Enter');
    await page.waitForTimeout(200);
    check((await page.textContent('#details h3').catch(() => null)) === firstName, `Enter in search did not reveal "${firstName}"`);
    await page.fill('#nav-search', 'zzqx-no-such-element');
    check(await page.isVisible('#nav-empty') && await page.isVisible('#nav-reset'), 'search without matches shows no empty state / reset');
    await page.click('#nav-reset');
    check(!(await page.isVisible('#nav-empty')) && (await page.inputValue('#nav-search')) === '', 'reset did not clear search');

    // Kind filter: only that kind stays visible, count matches the legend.
    const kind = await page.getAttribute('#kind-filters .kind-filter', 'data-kind');
    await page.click('#kind-filters .kind-filter');
    const kinds = await page.evaluate(() => Array.from(document.querySelectorAll('#nav-tree .nav-el'))
      .filter((b) => b.offsetParent !== null).map((b) => MAPPING_DATA[b.getAttribute('data-el')].colorKey));
    const expected = await page.evaluate((k) => SUMMARY.counts[k], kind);
    check(kinds.length === expected && kinds.every((k) => k === kind), `kind filter "${kind}" shows ${kinds.length} rows, expected ${expected} of that kind`);
    await page.click('#nav-reset');

    // Agent highlight: only that agent's elements stay in the tree, the others are dimmed on the canvas.
    const agent = await page.evaluate(() => AGENTS[0]);
    if (agent) {
      await page.selectOption('#agent-filter', agent.key);
      const rows = await page.evaluate(() => Array.from(document.querySelectorAll('#nav-tree .nav-el'))
        .filter((b) => b.offsetParent !== null).map((b) => MAPPING_DATA[b.getAttribute('data-el')].agent));
      check(rows.length === agent.count && rows.every((a) => a === agent.key),
        `agent filter "${agent.key}" shows ${rows.length} rows, expected ${agent.count} of that agent`);
      const dim = await page.evaluate((key) => {
        const reg = bpmnViewer.get('elementRegistry');
        const c = bpmnViewer.get('canvas');
        const mapped = reg.filter((el) => MAPPING_DATA[el.id] && el.type !== 'label');
        return mapped.every((el) => c.hasMarker(el, 'mapping-dim') === (MAPPING_DATA[el.id].agent !== key));
      }, agent.key);
      check(dim, `agent filter "${agent.key}" does not dim exactly the other agents' shapes`);
      await page.click('#nav-reset');
      check(await page.evaluate(() => !document.querySelector('.djs-element.mapping-dim')), 'reset leaves shapes dimmed');
    }

    // File list: grouped, filterable.
    await page.evaluate(() => { document.querySelector('details.files').open = true; });
    const fileProbe = await page.evaluate(() => FILES_LIST.length && FILES_LIST[FILES_LIST.length - 1].short);
    if (fileProbe) {
      await page.fill('#files-filter', fileProbe);
      const shown = await page.$$eval('#files-list li', (lis) => lis.filter((li) => li.offsetParent !== null).length);
      check(shown >= 1, `file filter "${fileProbe}" shows no file`);
      await page.fill('#files-filter', 'zzqx-no-such-file');
      check(await page.isVisible('#files-empty'), 'file filter without matches shows no empty state');
      await page.fill('#files-filter', '');
    }

    // Red: next-red walks every red element in order and wraps; red counts sit on their sub-processes.
    if (summary.red.length) {
      const visited = [];
      for (let i = 0; i <= summary.red.length; i += 1) {
        await page.click('#btn-red-next');
        await page.waitForTimeout(100);
        visited.push(await page.evaluate(() => selectedId));
      }
      check(JSON.stringify(visited) === JSON.stringify([...summary.red, summary.red[0]]),
        `next-red visited ${visited.join(', ')}, expected ${summary.red.join(', ')} then wrap`);
      const redLevels = await page.evaluate(() => LEVELS.filter((l) => l.depth > 0 && l.redTotal).map((l) => ({ id: l.id, parentId: l.parentId })));
      for (const l of redLevels) {
        await page.evaluate((pid) => openLevel(pid), l.parentId);
        const badge = await page.isVisible(`.djs-overlays[data-container-id="${l.id}"] .red-count`);
        check(badge, `no red count on collapsed sub-process ${l.id}`);
      }
    }
  }
  if (!offline) {
    // "Ruft auf" on a call activity opens the called process and keeps focus on the page.
    const callId = await page.evaluate(() => Object.keys(CALLS)[0]);
    if (callId) {
      await page.evaluate((id) => revealElement(id), callId);
      await page.click('#details [data-open-level]');
      await page.waitForTimeout(300);
      check(await page.evaluate(() => document.activeElement !== document.body), '"Ruft auf" drops focus to <body>');
    }

    // axe-core (WCAG 2.x A/AA rules); skipped if the CDN copy cannot be loaded.
    const axeLoaded = await page.addScriptTag({ url: 'https://cdn.jsdelivr.net/npm/axe-core@4.10.2/axe.min.js' }).then(() => true, () => false);
    if (axeLoaded) {
      const violations = await page.evaluate(async () => (await axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] }))
        .violations.map((v) => `${v.id} (${v.nodes.length}: ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')})`));
      check(!violations.length, `axe violations: ${violations.join(', ')}`);
    }
  }
  check(!errors.length, `page errors: ${errors.join(' | ')}`);
  await page.close();

  // ── 200 % zoom (640×360): no focused sidebar control may be hidden behind other content ──
  if (!offline) {
    const zoomed = await browser.newPage({ viewport: { width: 640, height: 360 } });
    await zoomed.goto(url);
    await zoomed.waitForSelector('#canvas .djs-element');
    await zoomed.evaluate(() => revealElement(SUMMARY.red[0] || Object.keys(MAPPING_DATA)[0]));
    await zoomed.focus('#nav-search');
    let hidden = 0;
    for (let i = 0; i < 40; i += 1) {
      await zoomed.keyboard.press('Tab');
      hidden += await zoomed.evaluate(() => {
        const a = document.activeElement;
        if (!a || a === document.body || !a.closest('#sidebar')) return 0;
        const r = a.getBoundingClientRect();
        if (!r.width || !r.height) return 0;
        const x = Math.min(Math.max(r.left + r.width / 2, 0), innerWidth - 1);
        const y = Math.min(Math.max(r.top + r.height / 2, 0), innerHeight - 1);
        const hit = document.elementFromPoint(x, y);
        return hit && (hit === a || a.contains(hit)) ? 0 : 1;
      });
    }
    check(hidden === 0, `${hidden} of 40 focused sidebar controls are hidden at 640×360 (SC 2.4.11)`);
    await zoomed.close();
  }

  // ── narrow (390 px): the diagram must not collapse ──
  const narrow = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await narrow.goto(url);
  await narrow.waitForFunction(() => document.querySelector('#status').children.length > 0);
  const nw = await narrow.evaluate(() => ({
    canvas: document.querySelector('#canvas').getBoundingClientRect().width,
    overflow: document.documentElement.scrollWidth - window.innerWidth,
  }));
  check(nw.canvas >= 300, `canvas is ${Math.round(nw.canvas)} px wide at 390 px viewport`);
  check(nw.overflow <= 0, `page scrolls horizontally by ${nw.overflow} px at 390 px viewport`);
  await shot(narrow, 'narrow');
  await narrow.close();

  // ── CDN blocked: sidebar and a fallback message must still render ──
  const off = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await off.route(/cdn\.jsdelivr\.net/, (r) => r.abort());
  await off.goto(url);
  await off.waitForFunction(() => document.querySelector('#status').children.length > 0);
  check(await off.isVisible('#canvas .offline'), 'no fallback message when bpmn-js cannot be loaded');
  check((await off.$$('#canvas .offline a[href="report.md"]')).length === 1, 'offline fallback does not link report.md');
  const offLabel = await off.evaluate(() => { const id = Object.keys(MAPPING_DATA)[0]; return MAPPING_DATA[id].label || id; });
  await off.fill('#nav-search', offLabel);
  await off.press('#nav-search', 'Enter');
  check((await off.textContent('#details h3').catch(() => null)) === offLabel, 'offline: search + Enter does not show the element details');
  await shot(off, 'offline');
  await off.close();
} finally {
  await browser.close();
}

if (failures.length) {
  console.error(`mapping view check FAILED (${failures.length}):`);
  for (const f of failures) console.error('  ✗', f);
  process.exit(1);
}
console.log(offline ? 'mapping view ok (offline, diagram skipped)' : 'mapping view ok');
