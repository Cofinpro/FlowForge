// Builds generated/<wf>/workflow-spec.yaml from the inventory + sdlc extraction + confirmed design.
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { WF, G, BPMN, GED, NB, STEP_SKILLS, ROLE_LABEL, artifactPath, META } from './steps.mjs';

const SCR = path.dirname(new URL(import.meta.url).pathname);
const cache = process.env.HOME + '/.cache/bpmn-authoring-tools';
const yaml = createRequire(cache + '/package.json')('js-yaml');
const inv = JSON.parse(readFileSync(SCR + '/.build/inv.json', 'utf8'));
const sdlc = JSON.parse(readFileSync(SCR + '/.build/sdlc.json', 'utf8'));
const NOW = '2026-09-25T18:00:00Z';

// ---- roles: one entry per lane (verify requires every lane id), agentName per sdlc role
const laneRole = (laneId) => {
  const m = laneId.match(/^Lane_[^_]+_(.+)$/);
  const map = { BLA: 'backlog-autor', ARC: 'architekt', KRI: 'kritiker', INT: 'interviewer', Panel: 'persona' };
  return map[m[1]] || m[1];
};
const roles = {};
const canonicalRoleKey = {};
for (const l of inv.lanes) {
  const role = laneRole(l.id);
  const key = l.id.replace(/^Lane_/, '').replace(/\./g, '-').toLowerCase();
  roles[key] = { bpmnLaneId: l.id, label: l.name, agentName: `product-${role}` };
  if (role === 'kritiker') roles[key].modelTier = 'opus';
  if (role === 'traceability') roles[key].modelTier = 'haiku';
  if (role === 'persona') roles[key].tools = ['Read'];
  if (role === 'kritiker') roles[key].tools = ['Read', 'Grep', 'Glob', 'Bash', 'Write', 'WebSearch', 'WebFetch'];
  if (role !== 'traceability') roles[key].notebooks = [NB.id];
  canonicalRoleKey[role] ??= key;
}
const laneKeyById = Object.fromEntries(Object.entries(roles).map(([k, r]) => [r.bpmnLaneId, k]));

// ---- element -> kind / paths
const skillPath = (name) => `${G}/skills/${name}/SKILL.md`;
const agentPath = (role) => `${G}/agents/product-${role}.md`;
const hook = (n) => [`${G}/hooks/${n}.hook.mjs`, `${G}/hooks/${n}.hook.settings.json`];
const P = {
  R: skillPath('product-recherche'), K: skillPath('product-kritiker-pruefung'), Pn: skillPath('product-panel-befragung'),
  PG: skillPath('product-phasen-gate'), TRC: skillPath('product-traceability'),
};
const scriptP = (skill, f) => `${G}/skills/${skill}/scripts/${f}`;

const knowledgeFile = { 'phase-1': `${G}/knowledge/phase-1-strategie.md`, 'phase-2': `${G}/knowledge/phase-2-discovery.md`,
  'phase-3-4': `${G}/knowledge/phase-3-4-journey-story-map.md`, 'phase-5-6': `${G}/knowledge/phase-5-6-stories-akzeptanz.md` };
const refs = {};

const NG_START = (scopeLabel) => `Start/end event of the collapsed '${scopeLabel}' scope — its control flow lives in the Workflow script; structural marker only, no separate artifact.`;
const scopeLabel = Object.fromEntries(inv.scopes.map((s) => [s.id, s.name || s.id]));
const elements = {};

for (const n of inv.flowNodes) {
  const type = n.bpmnType.replace('bpmn:', '');
  const bt = type[0].toLowerCase() + type.slice(1);
  const s = sdlc[n.id] || {};
  const role = s.step?.agentRole;
  const e = { bpmnType: bt };
  if (n.name) e.label = n.name;
  const lk = n.lane ? laneKeyById[n.lane] : role ? canonicalRoleKey[role] : undefined;
  if (lk) e.lane = lk;
  const id = n.id;

  if (STEP_SKILLS[id]) {
    const [skill, , ph] = STEP_SKILLS[id];
    e.kind = 'skill';
    e.generatedPaths = [skillPath(skill), agentPath(role)];
    e.knowledge = [NB.id, knowledgeFile[ph]];
    refs[id] = knowledgeFile[ph];
  } else if (id === 'SP_Budget_S1' || id === 'S_NoGo') { // S7's skill in partial / discarded mode
    e.kind = 'skill'; e.generatedPaths = [skillPath('product-backlog-exportieren-report-erstellen'), agentPath('traceability')];
    e.knowledge = ['local-docs']; refs[id] = GED;
  } else if (/^Call_R\d$/.test(id)) {
    e.kind = 'skill'; e.generatedPaths = [P.R, agentPath('researcher')]; e.knowledge = ['local-docs']; refs[id] = GED;
  } else if (id === 'K_3') {
    e.kind = 'skill'; e.generatedPaths = [P.K, P.R]; e.knowledge = ['local-docs']; refs[id] = GED;
  } else if (/_CallK$/.test(id) || id === 'PG_Call_K') {
    e.kind = 'skill'; e.generatedPaths = [P.K, agentPath('kritiker')]; e.knowledge = ['local-docs']; refs[id] = GED;
    if (s.critic) e.gate = { kind: 'critic', criteria: [`Rubric "${s.critic.rubric}" (docs/dark-factory/process-rules.md §13), score >= ${s.critic.threshold}`], maxLoops: Number(s.critic.maxLoops) };
  } else if (/^Call_PG\d$/.test(id)) {
    e.kind = 'skill'; e.generatedPaths = [P.PG, agentPath('kritiker')]; e.knowledge = ['local-docs']; refs[id] = GED;
    e.gate = { kind: 'panel', criteria: [`Rubric "${s.critic.rubric}" + panel votes per Gedächtnis §9.2`], maxLoops: Number(s.critic.maxLoops) };
  } else if (id === 'PG_Call_P') {
    e.kind = 'skill'; e.generatedPaths = [P.Pn, agentPath('interviewer')]; e.knowledge = ['local-docs']; refs[id] = GED;
  } else if (id === 'PG_1') {
    e.kind = 'skill'; e.generatedPaths = [P.PG, scriptP('product-phasen-gate', 'aggregate-gate.mjs'), agentPath('kritiker')]; e.knowledge = ['local-docs']; refs[id] = GED;
  } else if (id === 'R_1') {
    e.kind = 'hook'; e.generatedPaths = [...hook('product-research-budget-guard'), P.R, `${G}/skills/product-recherche/research.yaml`, scriptP('product-recherche', 'lib/research-config.mjs'), agentPath('researcher')];
    e.condition = 'block research tool calls when run.json budget.status == exhausted; the paid adapters check the Deep-Research hard cap (3) and the money cap (research.yaml) before every call (Gedächtnis §9.4)';
    e.knowledge = ['local-docs']; refs[id] = GED;
  } else if (id === 'R_2a') {
    e.kind = 'skill'; e.generatedPaths = [P.R, scriptP('product-recherche', 'providers/gemini-deep-research.mjs'), agentPath('researcher')]; e.knowledge = ['local-docs']; refs[id] = GED;
  } else if (id === 'R_2b' || id === 'R_2d') {
    e.kind = 'skill'; e.generatedPaths = [P.R, scriptP('product-recherche', 'providers/raw-fetch.mjs'), agentPath('researcher')]; e.knowledge = ['local-docs']; refs[id] = GED;
  } else if (id === 'R_2c') {
    e.kind = 'skill'; e.generatedPaths = [P.R, scriptP('product-recherche', 'providers/ddg-html.mjs'), agentPath('researcher')]; e.knowledge = ['local-docs']; refs[id] = GED;
  } else if (id === 'R_3b') {
    e.kind = 'skill'; e.generatedPaths = [P.R, scriptP('product-recherche', 'check-claims.mjs'), agentPath('researcher')]; e.knowledge = ['local-docs']; refs[id] = GED;
  } else if (id === 'R_4') {
    e.kind = 'skill'; e.generatedPaths = [P.R, agentPath('researcher')]; e.knowledge = ['local-docs']; refs[id] = GED;
  } else if (id === 'R_3') {
    e.kind = 'script'; e.generatedPaths = [scriptP('product-recherche', 'normalize-sources.mjs')];
  } else if (id === 'K_1') {
    e.kind = 'script'; e.generatedPaths = [scriptP('product-kritiker-pruefung', 'load-rubric.mjs'), scriptP('product-traceability', 'commit-artifact.mjs'), scriptP('product-traceability', 'lib/contracts.mjs'), ...hook('product-artifact-contract-guard')];
  } else if (id === 'K_2') {
    e.kind = 'skill'; e.generatedPaths = [P.K, agentPath('kritiker'), ...hook('product-critic-readonly-guard')]; e.knowledge = ['local-docs']; refs[id] = GED;
  } else if (id === 'K_4') {
    e.kind = 'script'; e.generatedPaths = [scriptP('product-kritiker-pruefung', 'verdict.mjs')];
  } else if (id === 'K_5') {
    e.kind = 'script'; e.generatedPaths = [scriptP('product-kritiker-pruefung', 'write-gate-record.mjs')];
  } else if (id === 'P_1' || id === 'P_4') {
    e.kind = 'skill'; e.generatedPaths = [P.Pn, agentPath('interviewer')]; e.knowledge = ['local-docs']; refs[id] = GED;
  } else if (id === 'P_2') {
    e.kind = 'skill'; e.generatedPaths = [P.Pn, agentPath('persona')]; e.knowledge = ['local-docs']; refs[id] = GED;
  } else if (id === 'P_3') {
    e.kind = 'script'; e.generatedPaths = [scriptP('product-panel-befragung', 'record-transcript.mjs')];
  } else if (['S6.2.1', 'S6.2.2', 'S6.2.5'].includes(id)) {
    const f = { 'S6.2.1': 'trace-story-epic.mjs', 'S6.2.2': 'trace-epic-vision.mjs', 'S6.2.5': 'traceability-matrix.mjs' }[id];
    e.kind = 'script'; e.generatedPaths = [scriptP('product-traceability', f), P.TRC];
  } else if (id === 'SP_Budget') {
    e.kind = 'not-generated';
    e.reason = 'Event sub-process (unsupported in v1). Accepted gap (2026-09-25): the Workflow script checks the token budget before every step and, when exhausted, runs "Teilergebnis sichern & Run-Report erstellen" (status: partial); the product-research-budget-guard hook enforces the Deep-Research hard cap. Rewrite option for later: model budget exhaustion as an explicit error boundary event.';
  } else if (id === 'SP_Budget_Start' || id === 'SP_Budget_End') {
    e.kind = 'not-generated'; e.reason = NG_START('Budget erschoepft');
  } else if (['Start_Geschaeftsidee', 'End_StoryReady', 'End_IdeeVerworfen', 'SP56_End_ok', 'SP56_End_resplit'].includes(id)) {
    e.kind = 'orchestrator';
    // D-37: product-init prepares the start event's project context (.dark-factory/project.json) before a run
    if (id === 'Start_Geschaeftsidee') e.generatedPaths = [skillPath('product-init'), scriptP('product-init', 'init-project.mjs'), scriptP('product-traceability', 'lib/project.mjs')];
  } else if (n.bpmnType === 'bpmn:StartEvent' || n.bpmnType === 'bpmn:EndEvent') {
    e.kind = 'not-generated'; e.reason = NG_START(scopeLabel[n.scopeId] || n.scopeId);
  } else if (/Gateway$/.test(n.bpmnType) || n.bpmnType === 'bpmn:SubProcess') {
    e.kind = 'orchestrator';
  } else {
    throw new Error('unmapped element ' + id + ' ' + n.bpmnType);
  }

  // gates on closing gateways without a preceding critic task (deterministic ones)
  if (id === 'G-Split') e.gate = { kind: 'deterministic', criteria: ['Any story ended in "Re-Splitting noetig" -> back to 5.1 for those stories'], maxLoops: 3 };
  if (id === 'G-6.2') e.gate = { kind: 'critic', criteria: ['Verdict of "Kritiker-Pruefung aufrufen (traceability)" is pass or pass-with-risk'], maxLoops: 3 };
  if (id === 'G-P2') e.condition = 'verdict == pivot requires pivotCount < 2 (Gedächtnis §9.3); otherwise no-go';
  if (s.collection) e.collection = { ref: s.collection.ref };

  const mapRef = (x) => { const r = { artifact: x.artifact }; if (x.required) r.required = x.required === 'true'; if (x.itemPrefix) r.itemPrefix = x.itemPrefix; if (x.cardinality) r.cardinality = x.cardinality; return r; };
  if (s.inputs?.length) e.inputs = s.inputs.map(mapRef);
  if (s.outputs?.length) e.outputs = s.outputs.map(mapRef);
  elements[id] = e;
}

// ---- artifacts: one per sdlc artifact type, plus the 9 top-level bundles
const artifacts = {};
const bundles = {};
for (const [id, s] of Object.entries(sdlc)) {
  if (s.bundle) {
    const key = 'bundle-' + id.replace('DataRef_DO_', '').toLowerCase();
    bundles[key] = s.bundle.artifacts.split(',');
  }
}
const phaseDirOf = (elId) => (STEP_SKILLS[elId] ? STEP_SKILLS[elId][1] : null);
for (const [id, s] of Object.entries(sdlc)) {
  for (const o of s.outputs || []) {
    const a = (artifacts[o.artifact] ??= { producer: [], consumers: [] });
    a.producer.push(id);
  }
  for (const i of s.inputs || []) {
    const a = (artifacts[i.artifact] ??= { producer: [], consumers: [] });
    a.consumers.push(id);
  }
}
for (const [type, a] of Object.entries(artifacts)) {
  const first = a.producer[0];
  const key = first ? (sdlc[first].step?.key || first).replace(/^S/, '') : 'x';
  a.pathPattern = artifactPath(type, key, phaseDirOf(first) || 'p0-intake');
  // spec key stays `frontmatter` (spec schema); the fields live in the <file>.meta.json sidecar (Gedächtnis §11.2)
  a.frontmatter = META.map(([field, description, required, writer]) => ({ field, description: `[sidecar, ${writer === 'model' ? 'authored by the producing agent' : 'computed by script'}] ${description}`, required }));
  if (a.producer.length === 1) a.producer = a.producer[0];
  else if (a.producer.length === 0) delete a.producer;
  a.consumers = [...new Set(a.consumers)];
  if (!a.consumers.length) delete a.consumers;
  const inB = Object.entries(bundles).filter(([, list]) => list.includes(type)).map(([k]) => k);
  if (inB.length) a.bundledIn = inB;
}
for (const [k, list] of Object.entries(bundles)) {
  artifacts[k] = { pathPattern: 'runs/{runId}/artifacts/ (bundle of: ' + list.join(', ') + ')' };
}
// mvp-candidate is listed in bundle A6 but no step declares it as output: surface it honestly
if (!artifacts['mvp-candidate']) artifacts['mvp-candidate'] = { pathPattern: 'runs/{runId}/artifacts/p4-story-map/4.2.5_story-map.md#mvp-candidate (section of story-map; no sdlc:output declares it separately)', bundledIn: ['bundle-a6'] };

const spec = {
  meta: {
    workflowName: WF,
    sourceBpmn: { path: BPMN, sha256: inv.meta.sha256 },
    language: 'de',
    generatorVersion: '0.1.0',
    created: NOW,
    updated: NOW,
  },
  roles,
  elements,
  artifacts,
  pattern: {
    chosen: 'workflow-script',
    rationale: 'Dein Prozess läuft vollständig ohne Menschen, hat echte Parallelität (drei Recherche-Kanäle, Kritiker und Panel gleichzeitig) und Mehrfach-Instanzen („je Epic“, „je Story“, „je Persona“). Jede Raute routet nur auf dem Verdikt eines Gate-Records (pass / fail / pivot / more-research / no-go) — das eigentliche Urteil fällt vorher im Kritiker-Schritt. Deshalb baue ich das als automatisches Workflow-Skript, das jeden Schritt vom Agenten seiner Rolle ausführen lässt. Es läuft nur, wenn du es pro Idee bewusst startest; nichts passiert im Hintergrund.',
    alternativesConsidered: [
      { pattern: 'orchestrator-agent', whyNot: 'Die Gateways brauchen kein Einzelfall-Urteil (sie lesen nur das Verdikt des Kritikers), und ein einzelner Agent-Kontext kann ~60 Schritte mit Schleifen, Pivots und Mehrfach-Instanzen weder halten noch die Loop-Caps deterministisch einhalten.' },
      { pattern: 'skill-chain-hooks', whyNot: 'Es gibt keinen menschlichen Prüfpunkt, an dem jemand die Kette weiterschiebt; die Parallelität (Recherche, Phasen-Gates) und die „je Epic / je Story“-Schleifen bräuchten ohnehin eine Steuerung.' },
      { pattern: 'mixed', whyNot: 'Alle Phasen haben dieselbe Form (unbeaufsichtigt, deterministisches Routing auf Gate-Records) — es gibt keinen strukturell anderen Abschnitt, der ein zweites Muster rechtfertigt.' },
    ],
  },
  knowledge: {
    notebooks: [{ id: NB.id, title: NB.title, mappedTo: Object.keys(roles).filter((k) => !k.includes('traceability')) }],
    mode: 'notebook',
    refs,
  },
  openQuestions: [
    { elementId: 'SP_Budget', question: 'Das Event-Sub-Prozess „Budget erschoepft“ kann jeden Schritt unterbrechen — das kann v1 nicht generieren. Diagramm ändern oder als Budget-Check akzeptieren?', answer: 'Akzeptiert als Budget-Check: Workflow prüft vor jedem Schritt das Token-Budget, bei Erschöpfung Teilergebnis + Run-Report (status: partial); Deep-Research-Hard-Cap per Hook.', answeredAt: NOW },
    { elementId: 'S2.1.4', question: 'Quellen empfehlen ein explizites Problem-Ranking im Interview (Top-3-Probleme ranken lassen) als Validierungs-Check — fehlt im BPMN.', source: NB.title, answer: 'Übernommen als Leitfaden-/Rubric-Kriterium in 2.1.2/2.1.4 und phase-2-1; Kernproblem nicht unter Top 3 = Kill-Signal für G-P2. Kein BPMN-Umbau.', answeredAt: NOW },
    { elementId: 'S1.2.1', question: 'Quellen empfehlen eine One Metric That Matters (AARRR) statt einer losen KPI-Liste.', source: NB.title, answer: 'Übernommen in Skill/Rubric von 1.2.1 (OMTM + AARRR-Stufe). Kein BPMN-Umbau.', answeredAt: NOW },
    { elementId: 'S2.2.5', question: 'Quellen empfehlen nachrechenbares Opportunity-Scoring (Ulwick: Importance + max(Importance − Satisfaction, 0)).', source: NB.title, answer: 'Übernommen in 2.2.5 (Formel aus Panel-Rating, offengelegt). Kein BPMN-Umbau.', answeredAt: NOW },
    { elementId: 'S5.1.1', question: 'Quellen empfehlen eine globale Qualitäts-Pyramide (cross-cutting NFR-Checkliste) und einen frühen Zone-of-Control-Check gegen Fake-Stories in 5.1.', source: NB.title, answer: 'Nicht übernommen (Entscheidung 2026-09-25) — Kandidat für eine spätere BPMN-Revision; Fake-Stories werden weiterhin in 6.2.4 aussortiert.', answeredAt: NOW },
    { elementId: 'K_2', question: 'Gedächtnis §5 verlangt für Kritiker/Persona eine andere Modellfamilie als der Produzent — in Claude Code ist nur Claude verfügbar.', source: 'docs/dark-factory/process-rules.md §5', answer: 'Kritiker auf opus, Traceability auf haiku, Rest Session-Default; jeder Gate-Record setzt das Risiko-Flag same-model-review.', answeredAt: NOW },
  ],
};

mkdirSync(G, { recursive: true });
writeFileSync(`${G}/workflow-spec.yaml`, '# Generated by flowforge-analyze/-knowledge/-design (confirmed 2026-09-25). Keyed by BPMN element id.\n' + yaml.dump(spec, { lineWidth: 120, noRefs: true }));
const kinds = {};
for (const e of Object.values(elements)) kinds[e.kind] = (kinds[e.kind] || 0) + 1;
console.log('elements', Object.keys(elements).length, kinds, 'roles', Object.keys(roles).length, 'artifacts', Object.keys(artifacts).length);
