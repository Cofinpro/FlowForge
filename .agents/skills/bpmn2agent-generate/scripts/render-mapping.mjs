#!/usr/bin/env node
// Renders the "mapping view" for a bpmn2agent workflow-spec: a colour-coded copy of the author's
// .bpmn (never mutates the original), a self-contained HTML viewer, and per-plane PNGs.
//
// Usage: node render-mapping.mjs <cacheDir> <spec.yaml> <file.bpmn> <outDir>
//   cacheDir  same tool cache bpmn-authoring/scripts/validate.sh uses (bpmn-moddle, bpmnlint,
//             playwright already installed there by validate.sh; js-yaml is installed into the
//             same cache by this script on first run, the same way — see ensureYaml() below).
//   spec.yaml a generated/<workflow>/workflow-spec.yaml conforming to
//             bpmn2agent-design/assets/workflow-spec.schema.yaml.
//   file.bpmn the author's source .bpmn (spec.meta.sourceBpmn.path) — read-only, never written to.
//   outDir    generated/<workflow>/mapping/ — created if missing. Generated files:
//               workflow-mapped.bpmn   colour-coded + annotated copy, still validate.sh-clean
//               index.html             self-contained bpmn-js viewer, click-through to files
//                                       (page CSS/JS: ../assets/mapping-viewer/, inlined here)
//               renders/*.png          one PNG per plane (top-level process(es) + every
//                                       collapsed sub-process), via bpmn-authoring/scripts/render.mjs
//
// IMPORTANT: generatedPaths/sourceBpmn.path in the spec are repo-relative. This script resolves
// them against process.cwd() — invoke it from the repo root (as bpmn2agent-generate's SKILL.md
// does).
//
// ── Colour legend (one colour per `kind`, see workflow-spec.schema.yaml's kind enum) ──
// Strokes double as label colour in bpmn-js, so every stroke keeps >= 4.5:1 against its own fill
// (WCAG 1.4.3) and >= 3:1 against white (1.4.11). Hue per kind is fixed; only lightness may change.
//   agent-checklist   blue    #E3F2FD / #1565C0  — bullet in the owning agent's checklist
//   skill             green   #E8F5E9 / #1B5E20  — generated skill directory
//   script            purple  #F3E5F5 / #6A1B9A  — deterministic script inside a skill
//   hook              orange  #FFF3E0 / #BF360C  — Claude Code hook (PreToolUse/PostToolUse/Stop/...)
//   orchestrator      teal    #E0F7FA / #006064  — gateway / loop-back / multi-instance control flow
//   human-checkpoint  amber   #FFFDE7 / #7A5C00  — userTask/manualTask -> AskUserQuestion step
//   artifact-contract brown   #EFEBE9 / #4E342E  — data object with a path/frontmatter contract
//   not-generated     grey    #F5F5F5 / #616161  — deliberately not generated (reason on click/hover)
//   unresolved        red     #FFEBEE / #C62828  — also used for two extra red cases not in the
//                                                  kind enum: an element with NO spec.elements
//                                                  entry at all ("unmapped"), and an element whose
//                                                  spec.openQuestions entry has no answer yet
//                                                  ("open") — see classifyElement() below.
// Colour is never the only signal: annotations start with the kind/status name, and the viewer's
// legend, review-status block and details panel repeat it as text.
//
// The viewer (index.html) is read-only: it answers "what became of each element, and is anything
// red?". Approval happens against mapping/report.md, which the viewer links to.
//
// Implementation notes:
// - Colouring/annotating is done via bpmn-moddle (fromXML -> mutate the in-memory tree -> toXML),
//   never by string-patching the XML, so the result stays well-formed and validate.sh-clean.
// - The bpmn.io colour extension (`bioc:stroke`/`bioc:fill`) and the older `color:background-color`/
//   `color:border-color` extension are both written (belt and braces — different bpmn.io tool
//   versions read one or the other); bpmn-moddle round-trips unknown-namespace attributes on DI
//   elements untouched, no moddle extension package needed for this.
// - Text annotations + associations for elements inside a collapsed sub-process's drill-down are
//   added to THAT sub-process's own `artifacts` array and its own BPMNPlane, not the top-level one
//   (see addAnnotation()/collectElements()) — otherwise bpmn-js would try to render them on the
//   wrong plane.
// - `bpmn:DataObject`/`bpmn:DataObjectReference` elements are excluded from the "no spec entry ->
//   red/unmapped" sweep (see classifyElement): the schema models an artifact TYPE under
//   `artifacts.<id>`, not a 1:1 link to one specific dataObjectReference id, so most diagrams will
//   legitimately have data objects with no `elements.<id>` entry — flagging all of them red would
//   be noise, not signal. A dataObjectReference IS coloured/annotated normally if the spec author
//   chose to give it an explicit `elements.<id>` entry (kind: artifact-contract).
// - Sequence flows and data in/out associations are not individually coloured (the schema doesn't
//   key elements by flow id) — a known limitation, see the skill's report.
import { createRequire } from 'node:module';
import { execFileSync, execSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));

const [, , cacheDir, specPath, bpmnPath, outDirArg] = process.argv;
if (!cacheDir || !specPath || !bpmnPath || !outDirArg) {
  console.error('Usage: node render-mapping.mjs <cacheDir> <spec.yaml> <file.bpmn> <outDir>');
  process.exit(2);
}
const outDir = path.resolve(outDirArg);
mkdirSync(outDir, { recursive: true });

ensureYaml(cacheDir);
const require = createRequire(path.join(cacheDir, 'package.json'));
const { BpmnModdle } = require('bpmn-moddle');
const yaml = require('js-yaml');

const PALETTE = {
  'agent-checklist': { fill: '#E3F2FD', stroke: '#1565C0' },
  skill: { fill: '#E8F5E9', stroke: '#1B5E20' },
  script: { fill: '#F3E5F5', stroke: '#6A1B9A' },
  hook: { fill: '#FFF3E0', stroke: '#BF360C' },
  orchestrator: { fill: '#E0F7FA', stroke: '#006064' },
  'human-checkpoint': { fill: '#FFFDE7', stroke: '#7A5C00' },
  'artifact-contract': { fill: '#EFEBE9', stroke: '#4E342E' },
  'not-generated': { fill: '#F5F5F5', stroke: '#616161' },
  unresolved: { fill: '#FFEBEE', stroke: '#C62828' },
};
const KIND_ORDER = [
  'agent-checklist', 'skill', 'script', 'hook', 'orchestrator',
  'human-checkpoint', 'artifact-contract', 'not-generated', 'unresolved',
];

// Both languages must define the same keys (the viewer reads them without fallbacks).
const STRINGS = {
  en: {
    title: 'BPMN → agentic workflow mapping',
    purpose: 'Read-only view: which generated artifact belongs to which BPMN element. Review and approval happen in',
    reportLink: 'the mapping report',
    statusTitle: 'Review status',
    statusNoRed: 'No red elements — all {total} BPMN elements are mapped.',
    statusRed: ['1 red element — must be resolved before approval.', '{n} red elements — must be resolved before approval.'],
    statusGrey: ['1 element deliberately not generated (grey) — not an error.', '{n} elements deliberately not generated (grey) — not an error.'],
    legendTitle: 'Legend',
    panelTitle: 'Element details',
    noSelection: 'Click an element in the diagram or pick one under “Levels and elements”.',
    noMappingData: 'This shape has no mapping of its own.',
    idLabel: 'BPMN id',
    kindLabel: 'Kind',
    bpmnTypeLabel: 'BPMN type',
    laneLabel: 'Lane',
    statusLabel: 'Status',
    reasonLabel: 'Reason',
    filesLabel: 'Generated files',
    noFiles: '(none)',
    orchestratorNoFiles: 'No file of its own — controlled by the orchestration ({pattern}).',
    filesListTitle: 'All generated files',
    navTitle: 'Levels and elements',
    skipToNav: 'Skip to element search',
    skipToDetails: 'Skip to element details',
    searchLabel: 'Find element',
    searchPlaceholder: 'Name or BPMN id',
    kindFilterLabel: 'Filter by kind',
    navReset: 'Reset search and filter',
    navResults: ['1 match', '{n} matches'],
    navNoResults: 'No element matches “{q}”.',
    navNoResultsFilter: 'No element matches search and filter.',
    navOffline: 'Diagram not loaded — selecting only shows the details.',
    navHint: 'Up and down arrows move between rows, right and left expand and collapse.',
    expandLevel: 'Show elements of “{level}” ({n})',
    levelRedSr: '{n} red, including sub-levels',
    redFirst: 'Show first red element',
    redNext: 'Next red element',
    redOnly: 'Show red element',
    redPos: '{i} of {n}',
    redShowAll: 'Show all {n} red elements',
    overlayRed: '⚠ {n} red',
    overlayRedTitle: '{n} red elements in “{name}”',
    agentFilterLabel: 'Highlight agent',
    agentFilterAll: 'All agents',
    filesFilterLabel: 'Filter files',
    callsLabel: 'Calls',
    openCalled: 'Open “{name}”',
    viewLabel: 'Location',
    zoomIn: 'Zoom in',
    zoomOut: 'Zoom out',
    zoomFit: 'Fit',
    upLevel: 'Up one level',
    canvasLabel: 'BPMN diagram. Arrow keys pan, + and − zoom, 0 fits, Esc goes up one level.',
    offlineTitle: 'The diagram viewer could not be loaded.',
    offlineBody: 'It needs internet access to cdn.jsdelivr.net. Without it, use the mapping report or the static images:',
    rendersLink: 'images per diagram level (renders/)',
    renderFailed: 'The diagram could not be displayed:',
    openElement: 'Open {element}',
    unmappedReason: 'Not present in workflow-spec.yaml — no elements.<id> entry for this BPMN element.',
    openPrefix: 'OPEN QUESTION: ',
    unresolvedPrefix: 'UNRESOLVED: ',
    unmappedPrefix: 'NOT MAPPED: ',
    notGeneratedPrefix: 'Not generated: ',
    statusNames: {
      unmapped: 'not mapped',
      'open-question': 'open question',
      'not-generated': 'deliberately not generated',
      unresolved: 'unresolved',
    },
    kindNames: {
      'agent-checklist': 'Agent checklist',
      skill: 'Skill',
      script: 'Script',
      hook: 'Hook',
      orchestrator: 'Orchestrator',
      'human-checkpoint': 'Human checkpoint',
      'artifact-contract': 'Artifact contract',
      'not-generated': 'Not generated',
      unresolved: 'Unresolved',
    },
    kindHelp: {
      'agent-checklist': 'A checklist item in the responsible agent.',
      skill: 'Its own skill that Claude runs for this step.',
      script: 'A deterministic script, no model judgement.',
      hook: 'A rule Claude Code enforces automatically.',
      orchestrator: 'Control flow: decision, loop, parallelism — no file of its own.',
      'human-checkpoint': 'A person decides here (question to the user).',
      'artifact-contract': 'A document with a fixed storage location and format.',
      'not-generated': 'Deliberately left out, with a reason. Not an error.',
      unresolved: 'Not mapped or an open question — must be resolved.',
    },
  },
  de: {
    title: 'BPMN → agentischer Workflow — Mapping',
    purpose: 'Nur-Lese-Ansicht: welches generierte Artefakt zu welchem BPMN-Element gehört. Prüfung und Freigabe erfolgen im',
    reportLink: 'Mapping-Report',
    statusTitle: 'Prüfstatus',
    statusNoRed: 'Keine roten Elemente — alle {total} BPMN-Elemente sind zugeordnet.',
    statusRed: ['1 rotes Element — vor der Freigabe zu klären.', '{n} rote Elemente — vor der Freigabe zu klären.'],
    statusGrey: ['1 Element bewusst nicht generiert (grau) — kein Fehler.', '{n} Elemente bewusst nicht generiert (grau) — kein Fehler.'],
    legendTitle: 'Legende',
    panelTitle: 'Element-Details',
    noSelection: 'Element im Diagramm anklicken oder unter „Ebenen und Elemente“ wählen.',
    noMappingData: 'Diese Form hat kein eigenes Mapping.',
    idLabel: 'BPMN-ID',
    kindLabel: 'Art',
    bpmnTypeLabel: 'BPMN-Typ',
    laneLabel: 'Lane',
    statusLabel: 'Status',
    reasonLabel: 'Begründung',
    filesLabel: 'Generierte Dateien',
    noFiles: '(keine)',
    orchestratorNoFiles: 'Keine eigene Datei — gesteuert durch die Orchestrierung ({pattern}).',
    filesListTitle: 'Alle generierten Dateien',
    navTitle: 'Ebenen und Elemente',
    skipToNav: 'Zur Element-Suche springen',
    skipToDetails: 'Zu den Element-Details springen',
    searchLabel: 'Element suchen',
    searchPlaceholder: 'Name oder BPMN-ID',
    kindFilterLabel: 'Nach Art filtern',
    navReset: 'Suche und Filter zurücksetzen',
    navResults: ['1 Treffer', '{n} Treffer'],
    navNoResults: 'Kein Element passt zu „{q}“.',
    navNoResultsFilter: 'Kein Element passt zu Suche und Filter.',
    navOffline: 'Diagramm nicht geladen — die Auswahl zeigt nur die Details.',
    navHint: 'Pfeiltasten hoch und runter wechseln die Zeile, rechts und links klappen auf und zu.',
    expandLevel: 'Elemente von „{level}“ anzeigen ({n})',
    levelRedSr: '{n} rot, inkl. Unterebenen',
    redFirst: 'Erstes rotes Element zeigen',
    redNext: 'Nächstes rotes Element',
    redOnly: 'Rotes Element zeigen',
    redPos: '{i} von {n}',
    redShowAll: 'Alle {n} roten Elemente zeigen',
    overlayRed: '⚠ {n} rot',
    overlayRedTitle: '{n} rote Elemente in „{name}“',
    agentFilterLabel: 'Agent hervorheben',
    agentFilterAll: 'Alle Agenten',
    filesFilterLabel: 'Dateien filtern',
    callsLabel: 'Ruft auf',
    openCalled: '„{name}“ öffnen',
    viewLabel: 'Ort',
    zoomIn: 'Vergrößern',
    zoomOut: 'Verkleinern',
    zoomFit: 'Einpassen',
    upLevel: 'Zur übergeordneten Ebene',
    canvasLabel: 'BPMN-Diagramm. Pfeiltasten verschieben, + und − zoomen, 0 passt ein, Esc geht eine Ebene nach oben.',
    offlineTitle: 'Der Diagramm-Viewer konnte nicht geladen werden.',
    offlineBody: 'Er braucht Internetzugang zu cdn.jsdelivr.net. Ohne ihn helfen der Mapping-Report oder die statischen Bilder:',
    rendersLink: 'Bilder je Diagramm-Ebene (renders/)',
    renderFailed: 'Das Diagramm konnte nicht angezeigt werden:',
    openElement: '{element} öffnen',
    unmappedReason: 'Nicht in workflow-spec.yaml erfasst — kein elements.<id>-Eintrag für dieses BPMN-Element.',
    openPrefix: 'OFFENE FRAGE: ',
    unresolvedPrefix: 'UNGELÖST: ',
    unmappedPrefix: 'NICHT GEMAPPT: ',
    notGeneratedPrefix: 'Nicht generiert: ',
    statusNames: {
      unmapped: 'nicht gemappt',
      'open-question': 'offene Frage',
      'not-generated': 'bewusst nicht generiert',
      unresolved: 'ungelöst',
    },
    kindNames: {
      'agent-checklist': 'Agenten-Checkliste',
      skill: 'Skill',
      script: 'Skript',
      hook: 'Hook',
      orchestrator: 'Orchestrierung',
      'human-checkpoint': 'Menschliche Prüfung',
      'artifact-contract': 'Artefakt-Vertrag',
      'not-generated': 'Nicht generiert',
      unresolved: 'Ungelöst',
    },
    kindHelp: {
      'agent-checklist': 'Ein Punkt in der Checkliste des zuständigen Agenten.',
      skill: 'Eigener Skill, den Claude für diesen Schritt ausführt.',
      script: 'Festes Skript, ohne Modell-Urteil.',
      hook: 'Regel, die Claude Code automatisch durchsetzt.',
      orchestrator: 'Ablaufsteuerung: Entscheidung, Schleife, Parallelität — keine eigene Datei.',
      'human-checkpoint': 'Hier entscheidet ein Mensch (Rückfrage an den Nutzer).',
      'artifact-contract': 'Dokument mit festem Ablageort und Format.',
      'not-generated': 'Bewusst weggelassen, mit Begründung. Kein Fehler.',
      unresolved: 'Nicht gemappt oder offene Frage — muss geklärt werden.',
    },
  },
};

main().catch((err) => {
  console.error('render-mapping failed:', err);
  process.exit(1);
});

async function main() {
  const spec = yaml.load(readFileSync(specPath, 'utf8'));
  const lang = (spec.meta && spec.meta.language || 'en').toLowerCase().startsWith('de') ? 'de' : 'en';
  const strings = STRINGS[lang];
  assertSameKeys(STRINGS.en, STRINGS.de, 'STRINGS');

  const xml = readFileSync(bpmnPath, 'utf8');
  const moddle = new BpmnModdle();
  const { rootElement: definitions, warnings } = await moddle.fromXML(xml);
  if (warnings.length) {
    console.error(`⚠️  ${warnings.length} bpmn-moddle warning(s) parsing ${bpmnPath} (proceeding anyway):`);
    for (const w of warnings) console.error('  WARN', w.message);
  }

  const { index, planeByBpmnElementId, processInfos } = collectElements(definitions);

  // Classify every element the traversal found.
  const entries = {};
  for (const [id, info] of index) {
    const cls = classifyElement(id, info.bo, spec, strings);
    if (!cls) continue; // excluded (unmapped data object with no explicit entry)
    entries[id] = { ...cls, id, bo: info.bo, containerBo: info.containerBo, topProcessId: info.topProcessId, subProcessChain: info.subProcessChain };
  }

  // Colour + annotate.
  let usedColorExtension = false;
  let annotationCounter = 0;
  const annotationOwner = {}; // annotation/association id -> annotated element id (viewer click-through)
  for (const id of Object.keys(entries)) {
    const entry = entries[id];
    const containerInfo = planeByBpmnElementId.get(entry.containerBo.id);
    if (!containerInfo) continue; // no DI plane found for this container (e.g. pools) — skip, documented limitation
    const { plane } = containerInfo;
    const shapeDi = findShapeDi(plane, entry.bo);
    if (!shapeDi) continue; // element has no visual shape (e.g. a bare bpmn:DataObject) — nothing to colour

    colorShape(shapeDi, PALETTE[entry.colorKey]);
    usedColorExtension = true;

    const text = annotationText(entry, strings);
    if (text) {
      annotationCounter += 1;
      const idPrefix = `MapAnnot_${annotationCounter}`;
      const { annotation, assoc } = addAnnotation(moddle, entry.containerBo, text, idPrefix, entry.bo);
      annotationOwner[annotation.id] = id;
      annotationOwner[assoc.id] = id;
      const size = annotationSize(text);
      const rect = placeAnnotation(plane, shapeDi, size.width, size.height);
      createAnnotationDi(moddle, plane, annotation, assoc, rect, shapeDi);
    }
  }

  if (usedColorExtension) {
    definitions.$attrs['xmlns:bioc'] = 'http://bpmn.io/schema/bpmn/biocolor/1.0';
    definitions.$attrs['xmlns:color'] = 'http://www.omg.org/spec/BPMN/non-normative/color/1.0';
  }

  const { xml: mappedXml } = await moddle.toXML(definitions, { format: true });
  const mappedBpmnPath = path.join(outDir, 'workflow-mapped.bpmn');
  writeFileSync(mappedBpmnPath, mappedXml);
  console.log('✓', mappedBpmnPath);

  const html = buildHtml({
    spec, strings, lang, mappedXml, entries, processInfos, outDir, index, annotationOwner,
    planes: new Set(planeByBpmnElementId.keys()),
  });
  const indexHtmlPath = path.join(outDir, 'index.html');
  writeFileSync(indexHtmlPath, html);
  console.log('✓', indexHtmlPath);

  const renderScript = path.join(SCRIPT_DIR, '..', '..', 'bpmn-authoring', 'scripts', 'render.mjs');
  const pngOutDir = path.join(outDir, 'renders');
  try {
    execFileSync('node', [renderScript, cacheDir, mappedBpmnPath, pngOutDir], { stdio: 'inherit' });
  } catch (err) {
    console.error('⚠️  PNG rendering failed (mapping.bpmn and index.html were still written):', err.message);
    process.exitCode = 1;
  }
}

// ── setup ─────────────────────────────────────────────────────────────────

// The viewer reads strings without fallbacks, so both languages must define exactly the same keys.
function assertSameKeys(a, b, where) {
  const ka = Object.keys(a).sort();
  const kb = Object.keys(b).sort();
  const missing = ka.filter((k) => !kb.includes(k)).concat(kb.filter((k) => !ka.includes(k)));
  if (missing.length) throw new Error(`${where}: keys differ between languages: ${missing.join(', ')}`);
  for (const k of ka) {
    if (a[k] && typeof a[k] === 'object' && !Array.isArray(a[k])) assertSameKeys(a[k], b[k], `${where}.${k}`);
  }
}

function ensureYaml(dir) {
  mkdirSync(dir, { recursive: true });
  if (!existsSync(path.join(dir, 'package.json'))) {
    execSync('npm init -y', { cwd: dir, stdio: 'ignore' });
  }
  if (!existsSync(path.join(dir, 'node_modules', 'js-yaml'))) {
    execSync('npm install --no-audit --no-fund --silent js-yaml', { cwd: dir, stdio: 'inherit' });
  }
}

// ── BPMN tree traversal ──────────────────────────────────────────────────

function collectElements(definitions) {
  const topProcesses = (definitions.rootElements || []).filter((e) => e.$type === 'bpmn:Process');
  const index = new Map(); // id -> { bo, containerBo, topProcessId, subProcessChain }
  const planeByBpmnElementId = new Map();

  for (const d of definitions.diagrams || []) {
    const plane = d.plane;
    if (plane && plane.bpmnElement) planeByBpmnElementId.set(plane.bpmnElement.id, { diagram: d, plane });
  }

  function walk(container, topProcessId, chain) {
    for (const fe of container.flowElements || []) {
      if (fe.$type === 'bpmn:SequenceFlow') continue;
      index.set(fe.id, { bo: fe, containerBo: container, topProcessId, subProcessChain: chain.slice() });
      if (fe.$type === 'bpmn:SubProcess') {
        walk(fe, topProcessId, chain.concat(fe.id));
      }
    }
  }

  const processInfos = [];
  for (const p of topProcesses) {
    const diInfo = planeByBpmnElementId.get(p.id);
    processInfos.push({ id: p.id, name: p.name || p.id, diagramId: diInfo ? diInfo.diagram.id : null });
    walk(p, p.id, []);
  }

  return { index, planeByBpmnElementId, processInfos };
}

function findShapeDi(plane, bo) {
  return (plane.planeElement || []).find((pe) => pe.$type === 'bpmndi:BPMNShape' && pe.bpmnElement === bo);
}

// ── classification (kind -> colour bucket, red/grey special cases) ──────

function classifyElement(id, bo, spec, strings) {
  const isDataObjectLike = bo.$type === 'bpmn:DataObjectReference' || bo.$type === 'bpmn:DataObject';
  const specEl = spec.elements && spec.elements[id];
  const openQ = (spec.openQuestions || []).find(
    (q) => q.elementId === id && (q.answer === null || q.answer === undefined || q.answer === ''),
  );

  if (!specEl) {
    if (isDataObjectLike) return null; // see header comment: not flagged red by default
    return {
      kind: null,
      statusLabel: 'unmapped',
      colorKey: 'unresolved',
      label: bo.name || id,
      bpmnType: bo.$type.replace(/^bpmn:/, '').replace(/^./, (c) => c.toLowerCase()),
      lane: null,
      reason: strings.unmappedReason,
      generatedPaths: [],
    };
  }

  const base = {
    kind: specEl.kind,
    label: specEl.label || bo.name || id,
    bpmnType: specEl.bpmnType || bo.$type,
    lane: specEl.lane || null,
    reason: specEl.reason || null,
    generatedPaths: specEl.generatedPaths || [],
  };

  if (specEl.kind === 'unresolved') {
    return { ...base, statusLabel: 'unresolved', colorKey: 'unresolved' };
  }
  if (openQ) {
    return { ...base, statusLabel: 'open-question', colorKey: 'unresolved', reason: openQ.question };
  }
  if (specEl.kind === 'not-generated') {
    return { ...base, statusLabel: 'not-generated', colorKey: 'not-generated' };
  }
  return { ...base, statusLabel: specEl.kind, colorKey: specEl.kind };
}

// ── colouring ─────────────────────────────────────────────────────────────

function colorShape(shapeDi, colors) {
  if (!colors) return;
  shapeDi.$attrs['bioc:stroke'] = colors.stroke;
  shapeDi.$attrs['bioc:fill'] = colors.fill;
  shapeDi.$attrs['color:background-color'] = colors.fill;
  shapeDi.$attrs['color:border-color'] = colors.stroke;
}

// ── annotations ───────────────────────────────────────────────────────────

function truncate(s, max) {
  if (!s) return '';
  const flat = String(s).trim().replace(/\s+/g, ' ');
  return flat.length > max ? `${flat.slice(0, max - 1)}…` : flat;
}

// Every annotation starts with the kind or status name, so the canvas never encodes kind by colour
// alone (WCAG 1.4.1). A skill's SKILL.md is named by its directory, otherwise every skill would read
// "SKILL.md".
function artifactName(p) {
  const parts = p.replace(/\/+$/, '').split('/');
  const base = parts.pop();
  return base === 'SKILL.md' && parts.length ? parts.pop() : base;
}

function annotationText(entry, strings) {
  if (entry.statusLabel === 'unmapped') return truncate(strings.unmappedPrefix + entry.reason, 110);
  if (entry.statusLabel === 'open-question') return truncate(strings.openPrefix + entry.reason, 110);
  if (entry.kind === 'unresolved') return truncate(strings.unresolvedPrefix + (entry.reason || ''), 110);
  if (entry.kind === 'not-generated') return truncate(strings.notGeneratedPrefix + (entry.reason || ''), 110);
  if (entry.generatedPaths && entry.generatedPaths.length) {
    const names = [...new Set(entry.generatedPaths.map(artifactName))];
    return truncate(`${strings.kindNames[entry.kind] || entry.kind}: ${names.join(', ')}`, 120);
  }
  return null;
}

function annotationSize(text) {
  const width = 220;
  const charsPerLine = 34;
  const lines = Math.max(1, Math.ceil(text.length / charsPerLine));
  const height = Math.max(30, lines * 16 + 14);
  return { width, height };
}

function addAnnotation(moddle, containerBo, text, idPrefix, targetBo) {
  const annotation = moddle.create('bpmn:TextAnnotation', { id: `${idPrefix}_TextAnnotation`, text });
  annotation.$parent = containerBo;
  containerBo.artifacts = containerBo.artifacts || [];
  containerBo.artifacts.push(annotation);

  const assoc = moddle.create('bpmn:Association', {
    id: `${idPrefix}_Association`,
    sourceRef: targetBo,
    targetRef: annotation,
  });
  assoc.$parent = containerBo;
  containerBo.artifacts.push(assoc);

  return { annotation, assoc };
}

function rectsOverlap(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

function collectExistingRects(plane) {
  return (plane.planeElement || [])
    .filter((pe) => pe.$type === 'bpmndi:BPMNShape' && pe.bounds)
    .map((pe) => ({ x: pe.bounds.x, y: pe.bounds.y, width: pe.bounds.width, height: pe.bounds.height }));
}

function placeAnnotation(plane, sourceShapeDi, width, height) {
  if (!plane.__occupiedRects) plane.__occupiedRects = collectExistingRects(plane);
  const occupied = plane.__occupiedRects;
  const b = sourceShapeDi.bounds;

  const candidates = [
    { x: b.x + b.width + 30, y: b.y - height - 10 },
    { x: b.x + b.width + 30, y: b.y + (b.height - height) / 2 },
    { x: b.x - width - 30, y: b.y - height - 10 },
    { x: b.x, y: b.y - height - 40 },
    { x: b.x + b.width + 30, y: b.y + b.height + 20 },
  ];

  for (const base of candidates) {
    let { x, y } = base;
    for (let attempt = 0; attempt < 8; attempt += 1) {
      const rect = { x: Math.max(0, x), y: Math.max(0, y), width, height };
      if (!occupied.some((r) => rectsOverlap(r, rect))) {
        occupied.push(rect);
        return rect;
      }
      y += height + 15;
    }
  }

  const idx = occupied.length;
  const rect = {
    x: Math.max(0, b.x + b.width + 30),
    y: Math.max(0, b.y + b.height + 40 + idx * (height + 15)),
    width,
    height,
  };
  occupied.push(rect);
  return rect;
}

function edgeWaypoints(moddle, srcBounds, rect) {
  let sx;
  let sy;
  let tx;
  let ty;
  if (rect.x >= srcBounds.x + srcBounds.width) {
    sx = srcBounds.x + srcBounds.width; sy = srcBounds.y + srcBounds.height / 2;
    tx = rect.x; ty = rect.y + rect.height / 2;
  } else if (rect.x + rect.width <= srcBounds.x) {
    sx = srcBounds.x; sy = srcBounds.y + srcBounds.height / 2;
    tx = rect.x + rect.width; ty = rect.y + rect.height / 2;
  } else if (rect.y + rect.height <= srcBounds.y) {
    sx = srcBounds.x + srcBounds.width / 2; sy = srcBounds.y;
    tx = rect.x + rect.width / 2; ty = rect.y + rect.height;
  } else {
    sx = srcBounds.x + srcBounds.width / 2; sy = srcBounds.y + srcBounds.height;
    tx = rect.x + rect.width / 2; ty = rect.y;
  }
  return [
    moddle.create('dc:Point', { x: sx, y: sy }),
    moddle.create('dc:Point', { x: tx, y: ty }),
  ];
}

function createAnnotationDi(moddle, plane, annotation, assoc, rect, sourceShapeDi) {
  const bounds = moddle.create('dc:Bounds', rect);
  const shapeDi = moddle.create('bpmndi:BPMNShape', { id: `${annotation.id}_di`, bpmnElement: annotation, bounds });
  plane.planeElement.push(shapeDi);

  const waypoint = edgeWaypoints(moddle, sourceShapeDi.bounds, rect);
  const edgeDi = moddle.create('bpmndi:BPMNEdge', { id: `${assoc.id}_di`, bpmnElement: assoc, waypoint });
  plane.planeElement.push(edgeDi);
}

// ── HTML viewer ───────────────────────────────────────────────────────────

function relHref(outDirAbs, repoRelativePath) {
  const abs = path.resolve(process.cwd(), repoRelativePath);
  const rel = path.relative(outDirAbs, abs);
  return rel.split(path.sep).join('/');
}

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

function embed(obj) {
  // Safe to inline inside a <script> block: escapes every '<' so a literal "</script" (or any
  // other tag-looking substring) inside embedded BPMN XML / free-text spec content can never
  // prematurely close the surrounding <script> element.
  return JSON.stringify(obj).replace(/</g, '\\u003c');
}

function buildHtml({ spec, strings, lang, mappedXml, entries, processInfos, outDir, index, annotationOwner, planes }) {
  const roleLabel = (roleId) => {
    if (!roleId) return null;
    const role = spec.roles && spec.roles[roleId];
    return role ? role.label : roleId;
  };
  const flat = (s) => String(s ?? '').trim().replace(/\s+/g, ' ');
  const processName = (pid) => flat((processInfos.find((p) => p.id === pid) || {}).name || pid);
  const elementName = (id) => flat((index.get(id) && index.get(id).bo.name) || id);
  // A "level" is one drill-down diagram: a top-level process or a collapsed sub-process (it has its
  // own DI plane). Same rule as levelFor() in the viewer.
  const levelIdOf = (topProcessId, chain) => {
    for (let i = chain.length - 1; i >= 0; i -= 1) if (planes.has(chain[i])) return chain[i];
    return topProcessId;
  };

  // Levels in tree order: processes first, sub-process levels nested in document order.
  const levelById = new Map();
  for (const p of processInfos) {
    levelById.set(p.id, { id: p.id, name: flat(p.name || p.id), parentId: null, diagramId: p.diagramId, elementIds: [], children: [] });
  }
  for (const [id, info] of index) {
    if (info.bo.$type !== 'bpmn:SubProcess' || !planes.has(id)) continue;
    const parentId = levelIdOf(info.topProcessId, info.subProcessChain);
    const top = processInfos.find((p) => p.id === info.topProcessId);
    levelById.set(id, { id, name: elementName(id), parentId, diagramId: top ? top.diagramId : null, elementIds: [], children: [] });
  }
  for (const l of levelById.values()) if (l.parentId && levelById.has(l.parentId)) levelById.get(l.parentId).children.push(l.id);

  const mappingData = {};
  const filesByPath = new Map();
  const counts = Object.fromEntries(KIND_ORDER.map((k) => [k, 0]));
  const calls = {};
  for (const [id, e] of Object.entries(entries)) {
    const files = (e.generatedPaths || []).map((p) => ({ path: p, href: relHref(outDir, p) }));
    const viewPath = [processName(e.topProcessId), ...e.subProcessChain.map(elementName)];
    const levelId = levelIdOf(e.topProcessId, e.subProcessChain);
    mappingData[id] = {
      label: flat(e.label),
      bpmnType: e.bpmnType,
      kind: e.kind,
      statusLabel: e.statusLabel,
      colorKey: e.colorKey,
      lane: roleLabel(e.lane),
      agent: (e.lane && spec.roles && spec.roles[e.lane] && spec.roles[e.lane].agentName) || null,
      reason: e.reason,
      files,
      viewPath,
      levelId,
      topDiagramId: (processInfos.find((p) => p.id === e.topProcessId) || {}).diagramId || null,
      subProcessChain: e.subProcessChain,
    };
    if (levelById.has(levelId)) levelById.get(levelId).elementIds.push(id);
    counts[e.colorKey] = (counts[e.colorKey] || 0) + 1;
    const called = e.bo.$type === 'bpmn:CallActivity' && e.bo.calledElement;
    if (called && levelById.has(called)) calls[id] = called;
    for (const f of files) {
      if (!filesByPath.has(f.path)) filesByPath.set(f.path, { path: f.path, href: f.href, elementIds: [] });
      filesByPath.get(f.path).elementIds.push(id);
    }
  }

  const levels = [];
  const redOrder = [];
  const visit = (l, depth) => {
    const entry = { id: l.id, name: l.name, parentId: l.parentId, depth, diagramId: l.diagramId, elementIds: l.elementIds, childIds: l.children, redOwn: 0, redTotal: 0 };
    levels.push(entry);
    for (const id of l.elementIds) if (mappingData[id].colorKey === 'unresolved') { entry.redOwn += 1; redOrder.push(id); }
    entry.redTotal = entry.redOwn;
    for (const c of l.children) entry.redTotal += visit(levelById.get(c), depth + 1);
    return entry.redTotal;
  };
  for (const p of processInfos) visit(levelById.get(p.id), 0);

  const summary = {
    total: Object.keys(entries).length,
    counts,
    red: redOrder,
    pattern: (spec.pattern && spec.pattern.chosen) || null,
  };
  const filesList = [...filesByPath.values()].sort((a, b) => a.path.localeCompare(b.path));
  const processList = processInfos.filter((p) => p.diagramId).map((p) => ({ id: p.id, name: p.name, diagramId: p.diagramId }));
  const legend = KIND_ORDER.map((k) => ({ key: k, fill: PALETTE[k].fill, stroke: PALETTE[k].stroke }));

  // Agents for the highlight filter: every lane of the same role shares one agent (agentName).
  const agents = new Map();
  for (const d of Object.values(mappingData)) {
    if (!d.agent) continue;
    if (!agents.has(d.agent)) agents.set(d.agent, { key: d.agent, label: d.lane, count: 0 });
    agents.get(d.agent).count += 1;
  }
  const agentList = [...agents.values()].sort((a, b) => a.label.localeCompare(b.label));

  // File list: strip the common directory prefix, group by the first remaining folder.
  const dirs = filesList.map((f) => f.path.split('/').slice(0, -1));
  let common = dirs.length ? dirs[0].length : 0;
  for (const d of dirs) {
    let i = 0;
    while (i < common && i < d.length && d[i] === dirs[0][i]) i += 1;
    common = i;
  }
  for (const f of filesList) {
    const rest = f.path.split('/').slice(common);
    f.short = rest.join('/');
    f.group = rest.length > 1 ? rest[0] : '';
  }

  const workflowName = (spec.meta && spec.meta.workflowName) || 'workflow';
  const BPMN_JS = 'https://cdn.jsdelivr.net/npm/bpmn-js@17.11.1/dist';
  const viewerCss = readViewerAsset('viewer.css');
  const viewerJs = readViewerAsset('viewer.js');
  const palette = KIND_ORDER.map((k) => `  --fill-${k}: ${PALETTE[k].fill};\n  --stroke-${k}: ${PALETTE[k].stroke};`).join('\n');
  const t = (key) => escapeHtml(strings[key]);

  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8" />
<title>${t('title')} — ${escapeHtml(workflowName)}</title>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<link rel="stylesheet" href="${BPMN_JS}/assets/diagram-js.css" />
<link rel="stylesheet" href="${BPMN_JS}/assets/bpmn-js.css" />
<script src="${BPMN_JS}/bpmn-navigated-viewer.production.min.js"></script>
<style>
:root {
${palette}
}
${viewerCss}</style>
</head>
<body>
<button type="button" id="skip-nav" class="skip-link">${t('skipToNav')}</button>
<button type="button" id="skip-details" class="skip-link">${t('skipToDetails')}</button>
<p id="sr-status" class="sr-only" role="status"></p>
<header>
  <h1>${t('title')}</h1>
  <span class="workflow">${escapeHtml(workflowName)}</span>
  <p class="purpose">${t('purpose')} <a href="report.md">${t('reportLink')}</a>.</p>
</header>
<main>
  <div id="canvas-wrap">
    <div id="canvas" tabindex="0" role="region" aria-label="${t('canvasLabel')}"></div>
    <div id="toolbar" role="toolbar" aria-label="${t('canvasLabel')}">
      <button type="button" id="btn-up" hidden>↑ ${t('upLevel')}</button>
      <button type="button" id="btn-zoom-out" aria-label="${t('zoomOut')}" title="${t('zoomOut')}">−</button>
      <button type="button" id="btn-zoom-in" aria-label="${t('zoomIn')}" title="${t('zoomIn')}">+</button>
      <button type="button" id="btn-fit">${t('zoomFit')}</button>
    </div>
  </div>
  <aside id="sidebar">
    <div id="sidebar-scroll">
      <section aria-labelledby="h-status">
        <h2 id="h-status">${t('statusTitle')}</h2>
        <div id="status"></div>
      </section>
      <section id="nav" aria-labelledby="h-nav">
        <h2 id="h-nav">${t('navTitle')}</h2>
        <label for="nav-search">${t('searchLabel')}</label>
        <input type="search" id="nav-search" autocomplete="off" placeholder="${t('searchPlaceholder')}" />
        <div id="kind-filters" role="group" aria-label="${t('kindFilterLabel')}"></div>
        <div id="agent-filter-wrap"${agentList.length ? '' : ' hidden'}>
          <label for="agent-filter">${t('agentFilterLabel')}</label>
          <select id="agent-filter"></select>
        </div>
        <button type="button" id="nav-reset" class="link-btn" hidden>${t('navReset')}</button>
        <p id="nav-count" aria-live="polite"></p>
        <p id="nav-offline" hidden>${t('navOffline')}</p>
        <div id="nav-tree" aria-describedby="nav-hint"></div>
        <span id="nav-hint" class="sr-only">${t('navHint')}</span>
      </section>
      <section aria-labelledby="h-legend">
        <h2 id="h-legend">${t('legendTitle')}</h2>
        <div id="legend"></div>
      </section>
      <section>
        <details class="files">
          <summary>${t('filesListTitle')} (${filesList.length})</summary>
          <label for="files-filter">${t('filesFilterLabel')}</label>
          <input type="search" id="files-filter" autocomplete="off" />
          <div id="files-list"></div>
        </details>
      </section>
    </div>
    <section id="details-pane" aria-labelledby="h-details" tabindex="0">
      <h2 id="h-details">${t('panelTitle')}</h2>
      <div id="details"><p class="placeholder">${t('noSelection')}</p></div>
    </section>
  </aside>
</main>
<script>
const STRINGS = ${embed(strings)};
const MAPPING_DATA = ${embed(mappingData)};
const SUMMARY = ${embed(summary)};
const LEVELS = ${embed(levels)};
const CALLS = ${embed(calls)};
const AGENTS = ${embed(agentList)};
const ANNOTATION_OWNER = ${embed(annotationOwner)};
const FILES_LIST = ${embed(filesList)};
const PROCESS_LIST = ${embed(processList)};
const LEGEND = ${embed(legend)};
const MAPPED_BPMN_XML = ${embed(mappedXml)};
</script>
<script>
${viewerJs}</script>
</body>
</html>
`;
}

// Page CSS/JS live as real files in assets/mapping-viewer/ and are inlined, so index.html stays one
// self-contained file. They are plain text, never template-interpolated.
function readViewerAsset(name) {
  const text = readFileSync(path.join(SCRIPT_DIR, '..', 'assets', 'mapping-viewer', name), 'utf8');
  if (/<\/(script|style)/i.test(text)) throw new Error(`${name} must not contain a closing </script> or </style> tag`);
  return text;
}
