// Script of the read-only mapping viewer (mapping/index.html). render-mapping.mjs inlines this file
// after a <script> block that defines the data it reads: STRINGS, MAPPING_DATA, SUMMARY, LEVELS,
// CALLS, AGENTS, ANNOTATION_OWNER, FILES_LIST, PROCESS_LIST, LEGEND and MAPPED_BPMN_XML.
// Plain browser JavaScript, no build step; bpmn-js 17 (navigated viewer) comes from the CDN.
const MIN_READABLE_ZOOM = 0.75;
const FOCUS_ZOOM = 0.9;
const RED_LIST_MAX = 10;
const LEVEL_BY_ID = {};
LEVELS.forEach(function (l, i) { l.index = i; LEVEL_BY_ID[l.id] = l; });

function escapeHtml(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

function fill(template, values) {
  return template.replace(/{([^}]+)}/g, function (m, k) { return values[k] != null ? values[k] : m; });
}

function plural(pair, n) {
  return fill(pair[n === 1 ? 0 : 1], { n: n });
}

// Case- and umlaut-insensitive search key: "Prüfung", "Pruefung" and "prufung" all match "pruef".
function fold(s) {
  return String(s == null ? '' : s).toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function statusName(entry) {
  return STRINGS.statusNames[entry.statusLabel] || entry.statusLabel;
}

function kindName(entry) {
  if (entry.colorKey === 'unresolved') return statusName(entry);
  return STRINGS.kindNames[entry.kind] || entry.kind || statusName(entry);
}

function swatch(key) {
  return '<span class="swatch" aria-hidden="true" style="background:var(--fill-' + key + ');border-color:var(--stroke-' + key + ')"></span>';
}

function wireReveal(root) {
  root.querySelectorAll('[data-reveal]').forEach(function (btn) {
    btn.addEventListener('click', function () { revealElement(btn.getAttribute('data-reveal'), { focusDetails: true }); });
  });
}

// ── sidebar: review status ───────────────────────────────────────────────

function renderStatus() {
  const el = document.getElementById('status');
  const red = SUMMARY.red;
  const grey = SUMMARY.counts['not-generated'] || 0;
  let html;
  if (!red.length) {
    html = '<p class="status-line status-ok">✓ ' + escapeHtml(fill(STRINGS.statusNoRed, { total: SUMMARY.total })) + '</p>';
  } else {
    html = '<p class="status-line status-red">⚠ ' + escapeHtml(plural(STRINGS.statusRed, red.length)) + '</p>';
    html += '<div class="red-nav"><button type="button" id="btn-red-next" class="btn-primary"></button><span id="red-pos"></span></div>';
    html += '<ul class="red-list">' + red.slice(0, RED_LIST_MAX).map(function (id) {
      const e = MAPPING_DATA[id];
      return '<li><button type="button" class="red-item" data-reveal="' + escapeHtml(id) + '">' + escapeHtml(e.label || id) +
        '<span class="meta">' + escapeHtml(statusName(e)) + ' · ' + escapeHtml(e.viewPath.join(' › ')) + '</span></button></li>';
    }).join('') + '</ul>';
    if (red.length > RED_LIST_MAX) {
      html += '<button type="button" id="red-show-all" class="link-btn">' + escapeHtml(fill(STRINGS.redShowAll, { n: red.length })) + '</button>';
    }
  }
  if (grey) html += '<p class="status-note">' + escapeHtml(plural(STRINGS.statusGrey, grey)) + '</p>';
  el.innerHTML = html;
  wireReveal(el);
  if (!red.length) return;
  document.getElementById('btn-red-next').addEventListener('click', function () {
    const i = red.indexOf(selectedId);
    revealElement(red[(i + 1) % red.length]);
  });
  const all = document.getElementById('red-show-all');
  if (all) {
    all.addEventListener('click', function () {
      activeKinds = new Set(['unresolved']);
      setAgent('');
      document.getElementById('nav-search').value = '';
      applyFilter();
      const first = visibleRows().find(function (b) { return b.classList.contains('nav-el'); });
      if (first) first.focus();
    });
  }
  updateRedNav();
}

function updateRedNav() {
  const btn = document.getElementById('btn-red-next');
  if (!btn) return;
  const red = SUMMARY.red;
  const i = red.indexOf(selectedId);
  btn.textContent = red.length === 1 ? STRINGS.redOnly : (i < 0 ? STRINGS.redFirst : STRINGS.redNext);
  document.getElementById('red-pos').textContent = i < 0 ? '' : fill(STRINGS.redPos, { i: i + 1, n: red.length });
}

// ── sidebar: levels and elements ─────────────────────────────────────────

let activeKinds = new Set();
let activeAgent = '';
const expanded = new Set();
const SEARCH_KEY = {};
// Label, id and generated artifact names (a skill by its folder), indexed umlaut-folded
// ("pruefung") and with the umlaut marker dropped ("prufung"), whether the label says "Prüfung" or
// "Pruefung".
function artifactName(p) {
  const parts = p.replace(/\/+$/, '').split('/');
  const base = parts.pop();
  return base === 'SKILL.md' && parts.length ? parts.pop() : base;
}
function stripMarks(s) { return String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }
Object.keys(MAPPING_DATA).forEach(function (id) {
  const e = MAPPING_DATA[id];
  const text = [e.label, id].concat(e.files.map(function (f) { return artifactName(f.path); })).join(' ');
  const folded = fold(text);
  SEARCH_KEY[id] = folded + ' ' + stripMarks(text) + ' ' + folded.replace(/([aou])e/g, '$1');
});

function levelHtml(level, showRows) {
  const n = level.elementIds.length;
  let html = '<li class="nav-level" data-level="' + escapeHtml(level.id) + '" style="--depth:' + level.depth + '">';
  if (showRows) {
    const red = level.redTotal
      ? ' <span class="red-count-inline">⚠ ' + level.redTotal + '<span class="sr-only"> ' + escapeHtml(fill(STRINGS.levelRedSr, { n: level.redTotal })) + '</span></span>'
      : '';
    html += '<div class="nav-row"><button type="button" class="nav-expand" aria-expanded="false" aria-controls="els-' + level.index + '"' +
      ' aria-label="' + escapeHtml(fill(STRINGS.expandLevel, { level: level.name, n: n })) + '"' + (n ? '' : ' disabled') + '>▸</button>' +
      '<button type="button" class="nav-open" data-level="' + escapeHtml(level.id) + '"><span class="name">' + escapeHtml(level.name) + '</span>' + red + '</button></div>';
  }
  html += '<ul class="nav-els" id="els-' + level.index + '"' + (showRows ? ' hidden' : '') + '>' + level.elementIds.map(function (id) {
    const e = MAPPING_DATA[id];
    const tag = e.colorKey === 'unresolved' ? ' <span class="red-tag">⚠ ' + escapeHtml(statusName(e)) + '</span>' : '';
    return '<li data-el="' + escapeHtml(id) + '"><button type="button" class="nav-el" data-el="' + escapeHtml(id) + '">' + swatch(e.colorKey) +
      '<span class="name">' + escapeHtml(e.label || id) + tag + '</span><code class="id">' + escapeHtml(id) + '</code></button></li>';
  }).join('') + '</ul>';
  if (level.childIds.length) {
    html += '<ul class="nav-children">' + level.childIds.map(function (c) { return levelHtml(LEVEL_BY_ID[c], showRows); }).join('') + '</ul>';
  }
  return html + '</li>';
}

function renderNav() {
  const showRows = LEVELS.length > 1;
  const tree = document.getElementById('nav-tree');
  tree.innerHTML = '<ul>' + LEVELS.filter(function (l) { return l.depth === 0; }).map(function (l) { return levelHtml(l, showRows); }).join('') +
    '</ul><p id="nav-empty" hidden></p>';

  document.getElementById('kind-filters').innerHTML = LEGEND.filter(function (l) { return SUMMARY.counts[l.key]; }).map(function (l) {
    return '<button type="button" class="kind-filter" aria-pressed="false" data-kind="' + l.key + '">' + swatch(l.key) +
      escapeHtml(STRINGS.kindNames[l.key]) + ' <span class="count">' + SUMMARY.counts[l.key] + '</span></button>';
  }).join('');

  document.getElementById('kind-filters').addEventListener('click', function (e) {
    const btn = e.target.closest('.kind-filter');
    if (!btn) return;
    const k = btn.getAttribute('data-kind');
    if (activeKinds.has(k)) activeKinds.delete(k); else activeKinds.add(k);
    applyFilter();
  });
  const search = document.getElementById('nav-search');
  search.addEventListener('input', applyFilter);
  search.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      const first = visibleRows().find(function (b) { return b.classList.contains('nav-el'); });
      if (first) { e.preventDefault(); first.click(); }
    } else if (e.key === 'Escape' && search.value) {
      e.preventDefault(); search.value = ''; applyFilter();
    } else if (e.key === 'ArrowDown') {
      const rows = visibleRows();
      const target = (search.value.trim() || activeKinds.size) && rows.find(function (b) { return b.classList.contains('nav-el'); });
      if (rows.length) { e.preventDefault(); (target || rows[0]).focus(); }
    }
  });
  document.getElementById('nav-reset').addEventListener('click', function () {
    search.value = ''; activeKinds = new Set(); setAgent(''); applyFilter(); search.focus();
  });
  const agentSel = document.getElementById('agent-filter');
  agentSel.innerHTML = '<option value="">' + escapeHtml(STRINGS.agentFilterAll) + '</option>' + AGENTS.map(function (a) {
    return '<option value="' + escapeHtml(a.key) + '">' + escapeHtml(a.label) + ' (' + a.count + ')</option>';
  }).join('');
  agentSel.addEventListener('change', function () { setAgent(agentSel.value); applyFilter(); });
  document.getElementById('skip-nav').addEventListener('click', function () { search.focus(); });
  document.getElementById('skip-details').addEventListener('click', function () {
    const pane = document.getElementById('details-pane');
    pane.scrollIntoView({ block: 'nearest' });
    (pane.querySelector('h3') || pane).focus();
  });

  tree.addEventListener('click', function (e) {
    const exp = e.target.closest('.nav-expand');
    if (exp) { toggleLevel(exp.closest('.nav-level'), exp.getAttribute('aria-expanded') !== 'true'); return; }
    const open = e.target.closest('.nav-open');
    if (open) { if (open.getAttribute('aria-disabled') !== 'true') openLevel(open.getAttribute('data-level')); return; }
    const el = e.target.closest('.nav-el');
    if (el) revealElement(el.getAttribute('data-el'));
  });
  tree.addEventListener('keydown', onTreeKey);
}

function levelLi(id) {
  return document.querySelector('#nav-tree .nav-level[data-level="' + CSS.escape(id) + '"]');
}

function toggleLevel(li, open) {
  if (!li) return;
  const id = li.getAttribute('data-level');
  const list = li.querySelector(':scope > .nav-els');
  const btn = li.querySelector(':scope > .nav-row > .nav-expand');
  if (!btn || btn.disabled) return;
  list.hidden = !open;
  btn.setAttribute('aria-expanded', String(open));
  btn.textContent = open ? '▾' : '▸';
  if (open) expanded.add(id); else expanded.delete(id);
}

function visibleRows() {
  return Array.prototype.filter.call(document.querySelectorAll('#nav-tree .nav-open, #nav-tree .nav-el'), function (b) {
    return b.offsetParent !== null;
  });
}

function onTreeKey(e) {
  const t = e.target;
  if (!t.matches('.nav-open, .nav-el')) return;
  const rows = visibleRows();
  const i = rows.indexOf(t);
  const li = t.closest('.nav-level');
  let target = null;
  if (e.key === 'ArrowDown') target = rows[i + 1];
  else if (e.key === 'ArrowUp') target = rows[i - 1];
  else if (e.key === 'Home') target = rows[0];
  else if (e.key === 'End') target = rows[rows.length - 1];
  else if (e.key === 'ArrowRight' && t.classList.contains('nav-open')) { toggleLevel(li, true); e.preventDefault(); return; }
  else if (e.key === 'ArrowLeft') {
    const exp = li.querySelector(':scope > .nav-row > .nav-expand');
    if (t.classList.contains('nav-open') && exp && exp.getAttribute('aria-expanded') === 'true') { toggleLevel(li, false); e.preventDefault(); return; }
    const owner = t.classList.contains('nav-el') ? li : li.parentElement.closest('.nav-level');
    target = owner && owner.querySelector(':scope > .nav-row > .nav-open');
  } else return;
  e.preventDefault();
  if (target) target.focus();
}

function applyFilter() {
  const raw = document.getElementById('nav-search').value.trim();
  const q = fold(raw);
  const filtering = !!q || activeKinds.size > 0 || !!activeAgent;
  document.querySelectorAll('#kind-filters .kind-filter').forEach(function (b) {
    b.setAttribute('aria-pressed', String(activeKinds.has(b.getAttribute('data-kind'))));
  });
  let total = 0;
  // Deepest levels first, so a parent knows whether any child level is visible.
  LEVELS.slice().reverse().forEach(function (level) {
    const li = levelLi(level.id);
    if (!li) return;
    let own = 0;
    li.querySelectorAll(':scope > .nav-els > li').forEach(function (row) {
      const id = row.getAttribute('data-el');
      const match = (!q || SEARCH_KEY[id].indexOf(q) >= 0) && (!activeKinds.size || activeKinds.has(MAPPING_DATA[id].colorKey)) &&
        (!activeAgent || MAPPING_DATA[id].agent === activeAgent);
      row.hidden = filtering && !match;
      if (match) own += 1;
    });
    total += filtering ? own : 0;
    const childVisible = level.childIds.some(function (c) { const cl = levelLi(c); return cl && !cl.hidden; });
    li.hidden = filtering && !own && !childVisible;
    const list = li.querySelector(':scope > .nav-els');
    const btn = li.querySelector(':scope > .nav-row > .nav-expand');
    if (!btn) { list.hidden = false; return; } // single-level mode: the list is always open
    const open = filtering ? own > 0 : expanded.has(level.id);
    list.hidden = !open;
    btn.setAttribute('aria-expanded', String(open));
    btn.textContent = open ? '▾' : '▸';
  });
  const empty = document.getElementById('nav-empty');
  empty.hidden = !filtering || total > 0;
  empty.textContent = raw && !activeKinds.size && !activeAgent ? fill(STRINGS.navNoResults, { q: raw }) : STRINGS.navNoResultsFilter;
  document.getElementById('nav-count').textContent = !filtering ? '' : (total ? plural(STRINGS.navResults, total) : empty.textContent);
  document.getElementById('nav-reset').hidden = !filtering;
}

// Agent highlight: filters the tree (applyFilter) and dims every mapped shape of other agents.
function setAgent(key) {
  activeAgent = key || '';
  document.getElementById('agent-filter').value = activeAgent;
  applyDim();
}

function applyDim() {
  if (!bpmnViewer) return;
  const c = canvas();
  bpmnViewer.get('elementRegistry').forEach(function (el) {
    const entry = MAPPING_DATA[ANNOTATION_OWNER[el.id] || el.id];
    if (!entry || el.type === 'label') return;
    if (activeAgent && entry.agent !== activeAgent) c.addMarker(el, 'mapping-dim');
    else c.removeMarker(el, 'mapping-dim');
  });
}

function syncNav() {
  const current = bpmnViewer ? currentLevelId() : null;
  document.querySelectorAll('#nav-tree .nav-open').forEach(function (b) {
    if (b.getAttribute('data-level') === current) b.setAttribute('aria-current', 'location');
    else b.removeAttribute('aria-current');
  });
  document.querySelectorAll('#nav-tree .nav-el').forEach(function (b) {
    b.classList.toggle('is-selected', b.getAttribute('data-el') === selectedId);
  });
  updateRedNav();
}

// ── sidebar: legend, files, details ──────────────────────────────────────

function renderLegend() {
  const el = document.getElementById('legend');
  el.innerHTML = LEGEND.map(function (l) {
    const n = SUMMARY.counts[l.key] || 0;
    return '<div class="legend-item' + (n ? '' : ' empty') + '">' +
      '<span class="swatch" style="background:' + l.fill + ';border-color:' + l.stroke + '"></span>' +
      '<span class="name">' + escapeHtml(STRINGS.kindNames[l.key]) + '</span>' +
      '<span class="count">' + n + '</span>' +
      '<span class="help">' + escapeHtml(STRINGS.kindHelp[l.key]) + ' <code>' + escapeHtml(l.key) + '</code></span></div>';
  }).join('');
}

// All generated files, grouped by their first folder below the common prefix (agents/, skills/, ...),
// with a filter on path and element name.
function renderFilesList() {
  const el = document.getElementById('files-list');
  if (!FILES_LIST.length) {
    el.innerHTML = '<p class="placeholder">' + escapeHtml(STRINGS.noFiles) + '</p>';
    document.getElementById('files-filter').hidden = true;
    return;
  }
  const groups = [];
  FILES_LIST.forEach(function (f) {
    let g = groups.find(function (x) { return x.name === f.group; });
    if (!g) { g = { name: f.group, files: [] }; groups.push(g); }
    g.files.push(f);
  });
  el.innerHTML = groups.map(function (g) {
    const items = g.files.map(function (f) {
      const chips = f.elementIds.map(function (id) {
        const label = (MAPPING_DATA[id] && MAPPING_DATA[id].label) || id;
        return '<button type="button" class="chip" data-reveal="' + escapeHtml(id) + '" title="' + escapeHtml(id) + '">' + escapeHtml(label) + '</button>';
      }).join('');
      const key = fold(f.path + ' ' + f.elementIds.map(function (id) { return (MAPPING_DATA[id] && MAPPING_DATA[id].label) || id; }).join(' '));
      return '<li data-key="' + escapeHtml(key) + '"><a href="' + escapeHtml(f.href) + '" target="_blank" rel="noopener">' + escapeHtml(f.short || f.path) +
        '</a><span class="chips">' + chips + '</span></li>';
    }).join('');
    const title = (g.name ? g.name + '/' : '…') + ' <span class="count">(' + g.files.length + ')</span>';
    return '<details class="file-group" open><summary>' + title + '</summary><ul class="file-list">' + items + '</ul></details>';
  }).join('') + '<p id="files-empty" class="placeholder" hidden></p>';
  wireReveal(el);
  document.getElementById('files-filter').addEventListener('input', function (e) {
    const raw = e.target.value.trim();
    const q = fold(raw);
    let shown = 0;
    el.querySelectorAll('.file-group').forEach(function (g) {
      let own = 0;
      g.querySelectorAll('li').forEach(function (li) {
        const hit = !q || li.getAttribute('data-key').indexOf(q) >= 0;
        li.hidden = !hit;
        if (hit) own += 1;
      });
      g.hidden = !own;
      shown += own;
    });
    const empty = document.getElementById('files-empty');
    empty.hidden = shown > 0;
    empty.textContent = fill(STRINGS.navNoResults, { q: raw });
  });
}

function kindBadge(entry) {
  const key = entry.colorKey || 'not-generated';
  return '<span class="kind-badge" style="background:var(--fill-' + key + ');border-color:var(--stroke-' + key + ')">' + escapeHtml(kindName(entry)) + '</span>';
}

function showDetails(id, opts) {
  const panel = document.getElementById('details');
  const entry = MAPPING_DATA[id];
  document.getElementById('details-pane').scrollTop = 0;
  if (!entry) {
    panel.innerHTML = '<p class="placeholder">' + escapeHtml(STRINGS.noSelection) + '</p>';
    return;
  }
  let html = '<h3 tabindex="-1">' + escapeHtml(entry.label || id) + '</h3><dl>';
  html += '<dt>' + escapeHtml(STRINGS.kindLabel) + '</dt><dd>' + kindBadge(entry) + '</dd>';
  if (entry.colorKey === 'unresolved' || entry.statusLabel !== entry.kind) {
    html += '<dt>' + escapeHtml(STRINGS.statusLabel) + '</dt><dd>' + escapeHtml(statusName(entry)) + '</dd>';
  }
  if (entry.reason) {
    html += '<dt>' + escapeHtml(STRINGS.reasonLabel) + '</dt><dd class="reason">' + escapeHtml(entry.reason) + '</dd>';
  }
  html += '<dt>' + escapeHtml(STRINGS.filesLabel) + '</dt><dd>';
  if (entry.files && entry.files.length) {
    html += '<ul class="plain-list">' + entry.files.map(function (f) {
      return '<li><a href="' + escapeHtml(f.href) + '" target="_blank" rel="noopener">' + escapeHtml(f.path) + '</a></li>';
    }).join('') + '</ul>';
  } else if (entry.kind === 'orchestrator' && SUMMARY.pattern) {
    html += '<span class="placeholder">' + escapeHtml(fill(STRINGS.orchestratorNoFiles, { pattern: SUMMARY.pattern })) + '</span>';
  } else {
    html += '<span class="placeholder">' + escapeHtml(STRINGS.noFiles) + '</span>';
  }
  html += '</dd>';
  const called = bpmnViewer && CALLS[id] && LEVEL_BY_ID[CALLS[id]];
  if (called) {
    html += '<dt>' + escapeHtml(STRINGS.callsLabel) + '</dt><dd><button type="button" class="link-btn" data-open-level="' + escapeHtml(called.id) + '">' +
      escapeHtml(fill(STRINGS.openCalled, { name: called.name })) + '</button></dd>';
  }
  const cost = COST_DATA && COST_DATA.byElement[id];
  const sharedCost = COST_DATA && COST_DATA.shared[id];
  if (cost) {
    html += '<dt>' + escapeHtml(STRINGS.costLabel) + '</dt><dd>' + escapeHtml(fill(STRINGS.costElement, { usd: usd(cost.usd), requests: cost.requests, share: (cost.share * 100).toFixed(1) })) + '</dd>';
  } else if (sharedCost) {
    html += '<dt>' + escapeHtml(STRINGS.costLabel) + '</dt><dd>' + escapeHtml(fill(STRINGS.costShared, { skill: sharedCost.skill, n: sharedCost.elements, usd: usd(sharedCost.usd) })) + '</dd>';
  }
  html += '<dt>' + escapeHtml(STRINGS.viewLabel) + '</dt><dd>' + escapeHtml(entry.viewPath.join(' › ')) + '</dd>';
  if (entry.lane) {
    html += '<dt>' + escapeHtml(STRINGS.laneLabel) + '</dt><dd>' + escapeHtml(entry.lane) + '</dd>';
  }
  html += '<dt>' + escapeHtml(STRINGS.bpmnTypeLabel) + '</dt><dd><code>' + escapeHtml(entry.bpmnType || '') + '</code></dd>';
  html += '<dt>' + escapeHtml(STRINGS.idLabel) + '</dt><dd><code>' + escapeHtml(id) + '</code></dd>';
  html += '</dl>';
  panel.innerHTML = html;
  const openBtn = panel.querySelector('[data-open-level]');
  if (openBtn) {
    openBtn.addEventListener('click', function () {
      // openLevel clears the details (and this button), so hand focus to the level now shown.
      openLevel(openBtn.getAttribute('data-open-level')).then(function () {
        const row = document.querySelector('#nav-tree .nav-open[aria-current]');
        (row && row.offsetParent !== null ? row : document.getElementById('canvas')).focus();
      });
    });
  }
  // One short announcement instead of re-reading the whole panel.
  const red = SUMMARY.red.indexOf(id);
  document.getElementById('sr-status').textContent = (entry.label || id) + ' — ' + kindName(entry) +
    (red >= 0 ? ' (' + fill(STRINGS.redPos, { i: red + 1, n: SUMMARY.red.length }) + ')' : '');
  // Stacked layout: the details sit below the sidebar content, bring them into view.
  if (window.matchMedia('(max-width: 767px)').matches && !(opts && opts.quiet)) {
    document.getElementById('details-pane').scrollIntoView({ block: 'nearest' });
  }
  if (opts && opts.focusDetails) {
    const h = panel.querySelector('h3');
    h.scrollIntoView({ block: 'nearest' });
    h.focus({ preventScroll: true });
  }
}

// ── canvas ───────────────────────────────────────────────────────────────

let bpmnViewer = null;
let currentDiagramId = null;
let selectedId = null;
let navigating = false; // true while openLevel/revealElement/goUp position the view themselves
let lastHash = location.hash;

function canvas() { return bpmnViewer.get('canvas'); }

function markSelected(id) {
  if (selectedId && bpmnViewer) { try { canvas().removeMarker(selectedId, 'mapping-selected'); } catch (e) {} }
  selectedId = id || null;
  if (selectedId && bpmnViewer) { try { canvas().addMarker(selectedId, 'mapping-selected'); } catch (e) { /* no shape */ } }
  syncNav();
}

// Fit the current level; if that would make labels unreadable, show its top-left part at a readable
// zoom instead ("Einpassen" still gives the full overview).
function fitReadable() {
  const c = canvas();
  c.zoom('fit-viewport');
  const vb = c.viewbox();
  if (vb.scale >= MIN_READABLE_ZOOM) return;
  c.viewbox({
    x: vb.inner.x - 20,
    y: vb.inner.y - 20,
    width: vb.outer.width / MIN_READABLE_ZOOM,
    height: vb.outer.height / MIN_READABLE_ZOOM,
  });
}

function centerOn(id) {
  const c = canvas();
  const el = bpmnViewer.get('elementRegistry').get(id);
  if (!el) return;
  const vb = c.viewbox();
  const scale = Math.max(vb.scale, FOCUS_ZOOM);
  const w = vb.outer.width / scale;
  const h = vb.outer.height / scale;
  c.viewbox({ x: el.x + el.width / 2 - w / 2, y: el.y + el.height / 2 - h / 2, width: w, height: h });
}

function topRoot() {
  return canvas().getRootElements().find(function (r) {
    const t = r.businessObject && r.businessObject.$type;
    return t === 'bpmn:Process' || t === 'bpmn:Collaboration';
  });
}

function rootFor(bo) {
  return canvas().getRootElements().find(function (r) {
    const rb = r.businessObject;
    if (!rb) return false;
    if (rb === bo) return true;
    return rb.$type === 'bpmn:Collaboration' && (rb.participants || []).some(function (p) { return p.processRef === bo; });
  });
}

function currentLevelId() {
  const bo = canvas().getRootElement().businessObject;
  if (bo && bo.$type === 'bpmn:SubProcess' && LEVEL_BY_ID[bo.id]) return bo.id;
  const top = LEVELS.find(function (l) { return l.depth === 0 && l.diagramId === currentDiagramId; });
  return top ? top.id : null;
}

// Parent level of the current drill-down plane (collapsed sub-process), or null at top level.
function parentLevel() {
  const root = canvas().getRootElement();
  const bo = root && root.businessObject;
  if (!bo || bo.$type !== 'bpmn:SubProcess') return null;
  for (let p = bo.$parent; p; p = p.$parent) {
    const r = rootFor(p);
    if (r) return { root: r, childId: bo.id };
  }
  return null;
}

// Deepest collapsed sub-process on the chain that has its own plane; expanded ones have none.
function levelFor(chain) {
  const roots = canvas().getRootElements();
  for (let i = (chain || []).length - 1; i >= 0; i -= 1) {
    const subId = chain[i];
    const r = roots.find(function (x) { return x.id === subId + '_plane' || (x.businessObject && x.businessObject.id === subId && x.businessObject.$type === 'bpmn:SubProcess'); });
    if (r) return r;
  }
  return topRoot();
}

// Level change pushes a history entry (Back goes up again), a selection change replaces it.
function writeHash(push) {
  if (!bpmnViewer) return;
  const level = currentLevelId();
  if (!level) return;
  const h = '#level=' + encodeURIComponent(level) + (selectedId ? '&el=' + encodeURIComponent(selectedId) : '');
  lastHash = h;
  if (h === location.hash) return;
  if (push) location.hash = h; else location.replace(h);
}

function applyHash() {
  lastHash = location.hash;
  const params = new URLSearchParams(location.hash.slice(1));
  const el = params.get('el');
  const level = params.get('level');
  if (el && MAPPING_DATA[el]) return revealElement(el, { fromHash: true });
  if (level && LEVEL_BY_ID[level]) return openLevel(level, { fromHash: true });
  if (location.hash && location.hash !== '#') { location.replace('#'); lastHash = location.hash; }
  return openLevel(LEVELS[0].id, { fromHash: true });
}

// Open a diagram (a top-level process); overlays and tooltips live per diagram, so decorate again.
async function openDiagram(diagramId) {
  if (diagramId === currentDiagramId) return;
  await bpmnViewer.open(diagramId);
  currentDiagramId = diagramId;
  decorate();
}

function decorate() {
  applyDim();
  const registry = bpmnViewer.get('elementRegistry');
  const overlays = bpmnViewer.get('overlays');
  registry.forEach(function (el) {
    const level = el.type === 'bpmn:SubProcess' && el.collapsed && LEVEL_BY_ID[el.id];
    if (level && level.redTotal) {
      overlays.add(el.id, 'red-count', {
        position: { top: -12, left: -8 },
        scale: { min: 0.6, max: 1 },
        html: '<span class="red-count" title="' + escapeHtml(fill(STRINGS.overlayRedTitle, { n: level.redTotal, name: level.name })) + '">' +
          escapeHtml(fill(STRINGS.overlayRed, { n: level.redTotal })) + '</span>',
      });
    }
    const cost = COST_DATA && COST_DATA.byElement[el.id];
    if (cost) {
      overlays.add(el.id, 'run-cost', {
        position: { bottom: 14, right: 0 },
        scale: { min: 0.6, max: 1 },
        html: '<span class="cost-badge" title="' + escapeHtml(fill(STRINGS.costElement, { usd: usd(cost.usd), requests: cost.requests, share: (cost.share * 100).toFixed(1) })) + '">' +
          usd(cost.usd) + '</span>',
      });
    }
    const entry = MAPPING_DATA[el.id];
    const gfx = entry && el.type !== 'label' && registry.getGraphics(el);
    if (!gfx || gfx.querySelector(':scope > title')) return;
    const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
    const reason = entry.reason ? String(entry.reason) : '';
    title.textContent = (entry.label || el.id) + ' — ' + kindName(entry) + (reason ? ': ' + (reason.length > 200 ? reason.slice(0, 199) + '…' : reason) : '');
    gfx.insertBefore(title, gfx.firstChild);
  });
}

async function openLevel(levelId, opts) {
  const level = LEVEL_BY_ID[levelId];
  if (!level || !bpmnViewer || !level.diagramId) return;
  navigating = true;
  try {
    await openDiagram(level.diagramId);
    const root = level.depth === 0 ? topRoot() : levelFor([level.id]);
    if (root && root !== canvas().getRootElement()) canvas().setRootElement(root);
  } finally { navigating = false; }
  afterRootChange();
  fitReadable();
  markSelected(null);
  showDetails(null);
  if (!(opts && opts.fromHash)) writeHash(true);
}

async function revealElement(id, opts) {
  const entry = MAPPING_DATA[id];
  if (!entry) return;
  opts = opts || {};
  if (!bpmnViewer) { markSelected(id); showDetails(id, opts); return; } // offline: details only
  const before = currentLevelId();
  navigating = true;
  try {
    if (entry.topDiagramId) await openDiagram(entry.topDiagramId);
    const level = levelFor(entry.subProcessChain);
    if (level && level !== canvas().getRootElement()) canvas().setRootElement(level);
  } finally { navigating = false; }
  afterRootChange();
  fitReadable();
  centerOn(id);
  markSelected(id);
  showDetails(id, opts);
  if (!opts.fromHash) writeHash(currentLevelId() !== before);
}

function goUp() {
  const parent = parentLevel();
  if (!parent) return;
  navigating = true;
  try { canvas().setRootElement(parent.root); } finally { navigating = false; }
  afterRootChange();
  fitReadable();
  centerOn(parent.childId);
  markSelected(parent.childId);
  showDetails(parent.childId, { quiet: true });
  writeHash(true);
}

function afterRootChange() {
  document.getElementById('btn-up').hidden = !parentLevel();
  syncNav();
}

// root.set from bpmn-js itself (drill-down button, breadcrumb): reset selection, fit, record history.
function onRootChanged() {
  afterRootChange();
  if (navigating) return;
  markSelected(null);
  showDetails(null);
  fitReadable();
  writeHash(true);
}

function wireToolbar() {
  document.getElementById('btn-up').addEventListener('click', goUp);
  document.getElementById('btn-fit').addEventListener('click', function () { canvas().zoom('fit-viewport'); });
  document.getElementById('btn-zoom-in').addEventListener('click', function () { bpmnViewer.get('zoomScroll').stepZoom(1); });
  document.getElementById('btn-zoom-out').addEventListener('click', function () { bpmnViewer.get('zoomScroll').stepZoom(-1); });
  // Own key handling for the focused canvas: diagram-js pans only with Ctrl/Cmd + arrows, and its
  // Ctrl/Cmd + plus/minus would take over the browser zoom, so it stays unbound.
  const PAN = { ArrowLeft: [1, 0], ArrowRight: [-1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] };
  document.getElementById('canvas').addEventListener('keydown', function (e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    let handled = true;
    if (PAN[e.key]) {
      const step = e.shiftKey ? 200 : 50;
      canvas().scroll({ dx: PAN[e.key][0] * step, dy: PAN[e.key][1] * step });
    } else if (e.key === '+' || e.key === '=') bpmnViewer.get('zoomScroll').stepZoom(1);
    else if (e.key === '-') bpmnViewer.get('zoomScroll').stepZoom(-1);
    else if (e.key === '0') canvas().zoom('fit-viewport');
    else if (e.key === 'Escape' || e.key === 'Backspace') goUp();
    else handled = false;
    if (handled) e.preventDefault();
  });
}

function onElementClick(e) {
  let el = e.element;
  if (el.type === 'label' && el.labelTarget) el = el.labelTarget;
  if (el === canvas().getRootElement()) return;
  const id = ANNOTATION_OWNER[el.id] || el.id;
  if (!MAPPING_DATA[id]) return; // lanes, flows, pools: nothing to show, keep the current details
  markSelected(id);
  showDetails(id, { quiet: true });
  writeHash(false);
}

function degrade(canvasHtml) {
  bpmnViewer = null;
  document.getElementById('toolbar').hidden = true;
  document.getElementById('canvas').innerHTML = canvasHtml;
  document.getElementById('nav-offline').hidden = false;
  document.querySelectorAll('#nav-tree .nav-open').forEach(function (b) { b.setAttribute('aria-disabled', 'true'); });
}

function showHashOffline() {
  const el = new URLSearchParams(location.hash.slice(1)).get('el');
  if (el && MAPPING_DATA[el]) revealElement(el);
}

function offlineHtml() {
  return '<div class="offline"><h2>' + escapeHtml(STRINGS.offlineTitle) + '</h2><p>' +
    escapeHtml(STRINGS.offlineBody) + '</p><ul><li><a href="report.md">' + escapeHtml(STRINGS.reportLink) + '</a></li><li><a href="renders/">' +
    escapeHtml(STRINGS.rendersLink) + '</a></li></ul></div>';
}

function usd(n) { return (Math.round(n * 100) / 100).toFixed(2); }

// Run cost (render-mapping.mjs --cost): summary, lanes and the most expensive elements.
function renderCost() {
  const el = document.getElementById('cost');
  if (!COST_DATA || !el) return;
  const c = COST_DATA;
  let html = '<p class="status-line ' + (c.ok ? 'status-ok' : 'status-red') + '">' +
    escapeHtml(fill(STRINGS.costSummary, { usd: usd(c.totalUsd), session: c.sessionId.slice(0, 8), prices: c.pricesVersion })) + '</p>';
  if (!c.ok) html += '<p class="status-note">' + escapeHtml(STRINGS.costNotReconciled) + '</p>';
  html += '<p class="status-note">' + escapeHtml(fill(STRINGS.costOrchestration, { usd: usd(c.orchestrationUsd) })) + '</p>';
  if (c.unassignedUsd) html += '<p class="status-note">' + escapeHtml(fill(STRINGS.costUnassigned, { usd: usd(c.unassignedUsd) })) + '</p>';
  html += '<h3>' + escapeHtml(STRINGS.costLanes) + '</h3><ul class="plain-list">' + c.byLane.map(function (l) {
    return '<li>' + escapeHtml(l.name) + ' <span class="cost-amount">' + usd(l.costUsd) + ' USD</span></li>';
  }).join('') + '</ul>';
  if (c.top.length) {
    html += '<h3>' + escapeHtml(STRINGS.costTop) + '</h3><ul class="plain-list">' + c.top.map(function (t) {
      const entry = MAPPING_DATA[t.id];
      return '<li><button type="button" class="link-btn" data-reveal="' + escapeHtml(t.id) + '">' + escapeHtml(entry ? entry.label : t.id) +
        '</button> <span class="cost-amount">' + usd(t.usd) + ' USD</span></li>';
    }).join('') + '</ul>';
  }
  el.innerHTML = html;
  wireReveal(el);
}

async function boot() {
  renderStatus();
  renderCost();
  renderNav();
  renderLegend();
  renderFilesList();
  if (typeof BpmnJS === 'undefined') { degrade(offlineHtml()); showHashOffline(); return; }

  const canvasEl = document.getElementById('canvas');
  const translations = { 'Open {element}': STRINGS.openElement };
  bpmnViewer = new BpmnJS({
    container: canvasEl,
    additionalModules: [{
      translate: ['value', function (template, replacements) { return fill(translations[template] || template, replacements || {}); }],
    }],
  });
  try {
    const result = await bpmnViewer.importXML(MAPPED_BPMN_XML);
    if (result && result.warnings && result.warnings.length) {
      console.warn('bpmn-js import warnings:', result.warnings);
    }
  } catch (err) {
    console.error(err);
    degrade('<p class="offline">' + escapeHtml(STRINGS.renderFailed.replace(/:s*$/, '.')) + '</p>');
    showHashOffline();
    return;
  }
  const rootEl = canvas().getRootElement();
  currentDiagramId = (PROCESS_LIST.find(function (p) {
    return rootEl && rootEl.businessObject && p.id === rootEl.businessObject.id;
  }) || {}).diagramId || (PROCESS_LIST[0] && PROCESS_LIST[0].diagramId) || null;
  decorate();
  wireToolbar();
  bpmnViewer.on('root.set', onRootChanged);
  bpmnViewer.on('element.click', onElementClick);
  window.addEventListener('hashchange', function () { if (location.hash !== lastHash) applyHash(); });
  if (location.hash && location.hash !== '#') await applyHash();
  else { afterRootChange(); fitReadable(); }
}

boot();
