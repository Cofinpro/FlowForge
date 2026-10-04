#!/usr/bin/env node
// Re-places every external label (event, gateway, data object/store, group and sequence-flow names)
// of every plane of a .bpmn so labels overlap as little as possible with flow lines, shapes,
// lane/phase borders and each other. Only <bpmndi:BPMNLabel> bounds are rewritten; the model and
// every waypoint stay untouched, so it is safe to re-run after each layout change.
//
// Usage: node relabel.mjs <cacheDir> <file.bpmn> [--out <file>] [--check]
//   --out    write there instead of rewriting <file.bpmn> in place
//   --check  report only, write nothing (exit 1 if labels still collide)
//   cacheDir same tool cache validate.sh uses (needs `playwright` + chromium, like render.mjs)
//
// Why a browser: bpmn-js wraps an external label's text in a fixed ~90px box centred on the label
// bounds, whatever width the DI states, so the real text size can only be measured by rendering it.
// The script measures every label in bpmn-js, then picks per label the candidate position (around
// the shape, or along its flow) with the fewest collisions. Remaining collisions are listed.
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const flag = (n) => args.includes(n);
const opt = (n) => (args.includes(n) ? args[args.indexOf(n) + 1] : undefined);
const positional = args.filter((a, i) => !a.startsWith('--') && !(i > 0 && args[i - 1] === '--out'));
const [cacheDir, file] = positional;
if (!cacheDir || !file) {
  console.error('Usage: node relabel.mjs <cacheDir> <file.bpmn> [--out <file>] [--check]');
  process.exit(2);
}
const require = createRequire(path.join(cacheDir, 'package.json'));
const { chromium } = require('playwright');
const xml = readFileSync(file, 'utf8');

const html = `<!doctype html><html><head>
<script src="https://cdn.jsdelivr.net/npm/bpmn-js@17.11.1/dist/bpmn-navigated-viewer.production.min.js"></script>
<style>html,body,#c{margin:0;width:3000px;height:1500px;background:#fff}</style>
</head><body><div id="c"></div></body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 3000, height: 1500 } });
await page.setContent(html, { waitUntil: 'load' });

// Runs inside the page: measure, then place. Returns { placements: {id: {x,y,w,h,score,name}} }.
const result = await page.evaluate(async (xmlArg) => {
  const viewer = new BpmnJS({ container: '#c' });
  await viewer.importXML(xmlArg);
  const canvas = viewer.get('canvas');
  const registry = viewer.get('elementRegistry');
  const WRAP = 90;
  const GAP = 4;
  const placements = {};

  const rootOf = (e) => { let p = e; while (p.parent) p = p.parent; return p; };
  const rootEls = canvas.getRootElements();

  const rectsHit = (a, b, pad = 0) => !(a.x + a.w + pad <= b.x || b.x + b.w + pad <= a.x || a.y + a.h + pad <= b.y || b.y + b.h + pad <= a.y);
  const segHit = (r, a, b, pad = 2) => {
    const x0 = Math.min(a.x, b.x), x1 = Math.max(a.x, b.x), y0 = Math.min(a.y, b.y), y1 = Math.max(a.y, b.y);
    return !(x1 < r.x - pad || x0 > r.x + r.w + pad || y1 < r.y - pad || y0 > r.y + r.h + pad);
  };

  for (const root of rootEls) {
    canvas.setRootElement(root);
    const els = registry.filter((e) => rootOf(e) === root);
    const shapes = els.filter((e) => !e.waypoints && e.type !== 'label' && e.businessObject && e.id !== root.id);
    const edges = els.filter((e) => e.waypoints);
    const labelOf = (e) => (e.label && e.label.type === 'label' ? e.label : null);

    // measured text boxes
    const meas = {};
    for (const e of els) {
      if (e.type !== 'label') continue;
      const t = registry.getGraphics(e).querySelector('text');
      if (!t) continue;
      const bb = t.getBBox();
      meas[e.labelTarget.id] = { w: Math.ceil(bb.width) + 2, h: Math.ceil(bb.height) + 2, name: t.textContent };
    }

    // obstacles
    const solid = [];
    const borders = [];
    for (const s of shapes) {
      const t = s.type;
      const r = { x: s.x, y: s.y, w: s.width, h: s.height };
      if (t === 'bpmn:Lane' || t === 'bpmn:Participant') {
        borders.push({ k: 'h', v: r.y, lo: r.x, hi: r.x + r.w }, { k: 'h', v: r.y + r.h, lo: r.x, hi: r.x + r.w });
      } else if (t === 'bpmn:Group') {
        borders.push({ k: 'h', v: r.y, lo: r.x, hi: r.x + r.w }, { k: 'h', v: r.y + r.h, lo: r.x, hi: r.x + r.w },
          { k: 'v', v: r.x, lo: r.y, hi: r.y + r.h }, { k: 'v', v: r.x + r.w, lo: r.y, hi: r.y + r.h });
      } else if (t === 'bpmn:SubProcess' && s.collapsed === false) {
        borders.push({ k: 'h', v: r.y, lo: r.x, hi: r.x + r.w }, { k: 'h', v: r.y + r.h, lo: r.x, hi: r.x + r.w },
          { k: 'v', v: r.x, lo: r.y, hi: r.y + r.h }, { k: 'v', v: r.x + r.w, lo: r.y, hi: r.y + r.h });
      } else {
        solid.push({ id: s.id, r });
      }
    }
    const lines = [];
    for (const e of edges) for (let i = 0; i + 1 < e.waypoints.length; i += 1) lines.push([e.waypoints[i], e.waypoints[i + 1]]);

    const placed = [];
    const score = (r, ownId) => {
      let sc = 0;
      for (const o of solid) if (rectsHit(r, o.r, o.id === ownId ? 1 : 2)) sc += 1000;
      for (const [a, b] of lines) if (segHit(r, a, b)) sc += 400;
      for (const b of borders) {
        if (b.k === 'h' && r.y - 3 < b.v && b.v < r.y + r.h + 3 && r.x < b.hi && r.x + r.w > b.lo) sc += 300;
        if (b.k === 'v' && r.x - 3 < b.v && b.v < r.x + r.w + 3 && r.y < b.hi && r.y + r.h > b.lo) sc += 300;
      }
      for (const p of placed) if (rectsHit(r, p, 3)) sc += 800;
      return sc;
    };
    const mk = (cx, top, w, h) => ({ x: cx - w / 2, y: top, w, h });

    const edgeCandidates = (e, w, h) => {
      const wps = e.waypoints;
      const out = [];
      const fractions = [0, 0.5, 1, ...Array.from({ length: 19 }, (_, k) => 0.05 * (k + 1)).filter((f) => Math.abs(f - 0.5) > 1e-9)];
      for (let i = 0; i + 1 < wps.length; i += 1) {
        const a = wps[i], b = wps[i + 1];
        const len = Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
        if (len < 14) continue;
        const horiz = Math.abs(a.y - b.y) < 1;
        const sgn = (horiz ? b.x > a.x : b.y > a.y) ? 1 : -1;
        fractions.forEach((t, ti) => {
          let pen = i * 25 + Math.min(ti, 2) * 6 + Math.max(ti - 2, 0) * 0.5;
          // a segment that another flow shares from the same start would label both flows
          if (i === 0) {
            const shared = edges.some((o) => o !== e && o.waypoints.length > 1 && o.waypoints[0].x === a.x && o.waypoints[0].y === a.y &&
              (horiz ? o.waypoints[1].y === a.y && (o.waypoints[1].x > a.x) === (b.x > a.x)
                     : o.waypoints[1].x === a.x && (o.waypoints[1].y > a.y) === (b.y > a.y)));
            if (shared) pen += 30;
          }
          if (horiz) {
            const lead = i === 0 ? 14 : 6; // room for the default-flow tick
            let px = t === 0 ? a.x + sgn * (lead + w / 2) : t === 1 ? b.x - sgn * (6 + w / 2) : a.x + (b.x - a.x) * t;
            if (len > w) px = Math.min(Math.max(px, Math.min(a.x, b.x) + w / 2 - 2), Math.max(a.x, b.x) - w / 2 + 2);
            out.push([pen, mk(px, a.y - GAP - h, w, h)], [pen + 8, mk(px, a.y + GAP, w, h)]);
          } else {
            const py = t === 0 ? a.y + sgn * (12 + h / 2) : t === 1 ? b.y - sgn * (8 + h / 2) : a.y + (b.y - a.y) * t;
            out.push([pen, mk(a.x + GAP + w / 2, py - h / 2, w, h)], [pen + 8, mk(a.x - GAP - w / 2, py - h / 2, w, h)]);
          }
        });
      }
      return out;
    };

    const shapeCandidates = (s, w, h) => {
      const x = s.x, y = s.y, sw = s.width, sh = s.height, cx = x + sw / 2, cy = y + sh / 2;
      const above = mk(cx, y - GAP - h, w, h), below = mk(cx, y + sh + GAP, w, h);
      const right = { x: x + sw + GAP, y: cy - h / 2, w, h }, left = { x: x - GAP - w, y: cy - h / 2, w, h };
      const ar = { x: x + sw, y: y - GAP - h, w, h }, al = { x: x - w, y: y - GAP - h, w, h };
      const br = { x: x + sw, y: y + sh + GAP, w, h }, bl = { x: x - w, y: y + sh + GAP, w, h };
      const t = s.type;
      let order;
      if (t.endsWith('Gateway')) order = [al, above, ar, bl, below, br, left, right];
      else if (t === 'bpmn:EndEvent') order = [above, right, below, left, ar, al, br, bl];
      else if (t.endsWith('Event')) order = [below, above, left, right, bl, al];
      else if (t === 'bpmn:DataStoreReference') order = [below, above, right, left, br, bl, ar, al];
      else if (t === 'bpmn:Group') order = [{ x: x + 10, y: y + 6, w, h }];
      else if (t.startsWith('bpmn:Data')) order = [above, right, left, below, ar, al];
      else order = [above, below, right, left];
      return order.map((r, i) => [i * 3, r]);
    };

    const place = (id, cands, ownId) => {
      let best = null;
      for (const [pen, r] of cands) {
        const sc = score(r, ownId) + pen;
        if (!best || sc < best.sc) best = { sc, r };
      }
      if (!best) return;
      placed.push(best.r);
      placements[id] = { ...best.r, score: best.sc, name: meas[id].name };
    };

    // most constrained first: flow names, then gateways, stores, objects, events, groups
    for (const e of edges) if (meas[e.id]) place(e.id, edgeCandidates(e, meas[e.id].w, meas[e.id].h), null);
    const rank = (s) => (s.type.endsWith('Gateway') ? 0 : s.type === 'bpmn:DataStoreReference' ? 1 : s.type.startsWith('bpmn:Data') ? 2
      : s.type === 'bpmn:EndEvent' ? 3 : s.type.endsWith('Event') ? 4 : 5);
    for (const s of shapes.filter((s) => meas[s.id] && labelOf(s)).sort((a, b) => rank(a) - rank(b))) {
      place(s.id, shapeCandidates(s, meas[s.id].w, meas[s.id].h), s.id);
    }
  }
  return placements;
}, xml);
await browser.close();

// ---- write the bounds back (regex: keeps the rest of the file byte-identical)
const ids = Object.keys(result);
let out = xml;
const di = (xml.match(/<(\w+):BPMNPlane\b/) || [])[1] || 'bpmndi';
const dc = (xml.match(/<(\w+):Bounds\b/) || [])[1] || 'dc';
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
let missing = 0;
for (const id of ids) {
  const r = result[id];
  const bx = Math.round(r.x + r.w / 2 - 45);
  const lab = `<${di}:BPMNLabel><${dc}:Bounds x="${bx}" y="${Math.round(r.y)}" width="90" height="${Math.round(r.h)}" /></${di}:BPMNLabel>`;
  const re = new RegExp(`(<${di}:BPMN(Shape|Edge) id="[^"]+" bpmnElement="${esc(id)}"[^>]*>)([\\s\\S]*?)(</${di}:BPMN\\2>)`);
  const m = re.exec(out);
  if (!m) { missing += 1; console.error(`no DI block for ${id}`); continue; }
  const labelRe = new RegExp(`<${di}:BPMNLabel>[\\s\\S]*?</${di}:BPMNLabel>`);
  const inner = labelRe.test(m[3]) ? m[3].replace(labelRe, lab) : m[3] + lab;
  out = out.slice(0, m.index) + m[1] + inner + m[4] + out.slice(m.index + m[0].length);
}

const bad = ids.filter((id) => result[id].score >= 300);
console.log(`labels placed: ${ids.length - missing}, with remaining collisions: ${bad.length}`);
for (const id of bad) console.log(`  ${Math.round(result[id].score)}  ${id}  |  ${result[id].name.replace(/\s+/g, ' ').trim()}`);
if (!flag('--check')) {
  const dest = opt('--out') || file;
  writeFileSync(dest, out);
  console.log('✓', dest);
}
process.exit(flag('--check') && bad.length ? 1 : 0);
