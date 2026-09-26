// Shared step table for the spec builder and the file generator.
// skill: generated skill dir name; phase: run-workspace artifact folder.
export const WF = 'product-vision-to-user-stories';
export const G = `generated/${WF}`;
export const BPMN = 'product-vision-to-user-stories.bpmn';
export const GED = 'docs/process-rules.md'; // path under examples/dark-factory/ (provenance in the spec)
// The factory ships as the Claude Code plugin `dark-factory` (D-35). Runtime paths in skill and agent
// text go through ${CLAUDE_PLUGIN_ROOT}, which Claude Code substitutes when it loads the content.
export const PLUGIN = 'dark-factory';
export const PLUGIN_ROOT = '${CLAUDE_PLUGIN_ROOT}';
export const SKILLS_DIR = `${PLUGIN_ROOT}/skills`;
export const RULES = `${PLUGIN_ROOT}/knowledge/process-rules.md`; // copy of GED, shipped by build-plugin.mjs
export const NB = { id: '7cfe6e95-cb2b-4b23-88ed-fac6f7b3a6c0', title: 'The Product - Business Design' };

export const STEP_SKILLS = {
  'S0': ['product-idee-brief-vervollstaendigen', 'p0-intake', 'phase-1'],
  'S1.1.1': ['product-zielbild-klaeren', 'p1-strategie', 'phase-1'],
  'S1.1.2': ['product-vision-statement-formulieren', 'p1-strategie', 'phase-1'],
  'S1.1.3': ['product-lean-canvas-abbilden', 'p1-strategie', 'phase-1'],
  'S1.1.4': ['product-proto-panel-ableiten', 'p1-strategie', 'phase-1'],
  'S1.1.5': ['product-value-proposition-canvas-abgleichen', 'p1-strategie', 'phase-1'],
  'S1.1.6': ['product-assumptions-map-priorisieren', 'p1-strategie', 'phase-1'],
  'S1.2.1': ['product-ziele-kennzahlen-festlegen', 'p1-strategie', 'phase-1'],
  'S1.2.2': ['product-akteure-identifizieren', 'p1-strategie', 'phase-1'],
  'S1.2.3': ['product-verhaltensaenderungen-ableiten', 'p1-strategie', 'phase-1'],
  'S1.2.4': ['product-deliverables-sammeln', 'p1-strategie', 'phase-1'],
  'S1.2.5': ['product-impacts-priorisieren', 'p1-strategie', 'phase-1'],
  'S1.2.6': ['product-roadmap-ableiten', 'p1-strategie', 'phase-1'],
  'S2.1.1': ['product-stakeholder-quellen-identifizieren', 'p2-research', 'phase-2'],
  'S2.1.2': ['product-interviewleitfaden-erstellen', 'p2-research', 'phase-2'],
  'S2.1.3': ['product-synthetisches-panel-aufbauen', 'p2-research', 'phase-2'],
  'S2.1.4': ['product-synthetische-interviews-durchfuehren', 'p2-research', 'phase-2'],
  'S2.1.5': ['product-personas-modellieren', 'p2-research', 'phase-2'],
  'S2.1.6': ['product-jtbd-formulieren', 'p2-research', 'phase-2'],
  'S2.2.1': ['product-empathy-maps-erstellen', 'p2-research', 'phase-2'],
  'S2.2.2': ['product-pains-gains-extrahieren', 'p2-research', 'phase-2'],
  'S2.2.3': ['product-pov-hmw-formulieren', 'p2-research', 'phase-2'],
  'S2.2.4': ['product-opportunity-solution-tree-aufbauen', 'p2-research', 'phase-2'],
  'S2.2.5': ['product-opportunities-priorisieren', 'p2-research', 'phase-2'],
  'S3.1.1': ['product-current-state-journey-kartieren', 'p3-journey', 'phase-3-4'],
  'S3.1.2': ['product-hot-spots-markieren', 'p3-journey', 'phase-3-4'],
  'S3.1.3': ['product-future-state-journey-entwerfen', 'p3-journey', 'phase-3-4'],
  'S3.1.4': ['product-service-blueprint-schichten', 'p3-journey', 'phase-3-4'],
  'S4.1.1': ['product-story-map-rahmen-setzen', 'p4-story-map', 'phase-3-4'],
  'S4.1.2': ['product-narrative-flow-erzaehlen', 'p4-story-map', 'phase-3-4'],
  'S4.1.3': ['product-backbone-destillieren', 'p4-story-map', 'phase-3-4'],
  'S4.1.4': ['product-story-map-details-explorieren', 'p4-story-map', 'phase-3-4'],
  'S4.1.5': ['product-story-map-durchlaufen', 'p4-story-map', 'phase-3-4'],
  'S4.2.1': ['product-release-ziele-festlegen', 'p4-story-map', 'phase-3-4'],
  'S4.2.2': ['product-walking-skeleton-schneiden', 'p4-story-map', 'phase-3-4'],
  'S4.2.3': ['product-release-sequenz-planen', 'p4-story-map', 'phase-3-4'],
  'S4.2.4': ['product-value-effort-priorisieren', 'p4-story-map', 'phase-3-4'],
  'S4.2.5': ['product-mvp-abgrenzen', 'p4-story-map', 'phase-3-4'],
  'S5.1.1': ['product-story-card-entwerfen', 'p5-refinement', 'phase-5-6'],
  'S5.1.3': ['product-story-splitten', 'p5-refinement', 'phase-5-6'],
  'S5.1.4': ['product-spike-auslagern', 'p5-refinement', 'phase-5-6'],
  'S5.2.1': ['product-three-amigos-debatte', 'p5-refinement', 'phase-5-6'],
  'S5.2.2': ['product-was-von-wie-trennen', 'p5-refinement', 'phase-5-6'],
  'S5.2.3': ['product-wireframe-domaenenmodell-anhaengen', 'p5-refinement', 'phase-5-6'],
  'S5.2.4': ['product-groessenklasse-bestimmen', 'p5-refinement', 'phase-5-6'],
  'S6.1.1': ['product-confirmation-kriterien-festhalten', 'p6-akzeptanz', 'phase-5-6'],
  'S6.1.2': ['product-sbe-beispiele-spezifizieren', 'p6-akzeptanz', 'phase-5-6'],
  'S6.1.3': ['product-gherkin-formalisieren', 'p6-akzeptanz', 'phase-5-6'],
  'S6.1.4': ['product-testerwartungen-abgleichen', 'p6-akzeptanz', 'phase-5-6'],
  'S6.2.3': ['product-ubiquitous-language-pruefen', 'p6-akzeptanz', 'phase-5-6'],
  'S6.2.4': ['product-orphan-fake-stories-aussortieren', 'p6-akzeptanz', 'phase-5-6'],
  'S7': ['product-backlog-exportieren-report-erstellen', 'p7-abschluss', 'phase-5-6'],
};

export const ROLE_LABEL = {
  stratege: 'Stratege', researcher: 'Researcher', interviewer: 'Interviewer', persona: 'Synthetisches Panel',
  ux: 'UX-/Journey-Designer', architekt: 'Architekt', 'backlog-autor': 'Backlog-Autor', qa: 'QA-Perspektive',
  kritiker: 'Kritiker', traceability: 'Traceability-Pruefer',
};

// Where each artifact type lives in a run workspace (docs/dark-factory/implementation.md §4).
export function artifactPath(type, producerKey, phaseDir) {
  const special = {
    'idea-brief': 'runs/{runId}/00_idea-brief.md',
    'source': 'runs/{runId}/research/sources/SRC-{nnnn}_{slug}.md',
    'research-synthese': 'runs/{runId}/research/reports/{callId}_{topic}.md',
    'claim-ledger': 'runs/{runId}/research/claims/{callId}.json',
    'research-markt-wettbewerb': 'runs/{runId}/research/reports/DR-01_markt-wettbewerb.md',
    'research-zielgruppe-voc': 'runs/{runId}/research/reports/DR-02_zielgruppe-voc.md',
    'research-domaene-prozesse-regulatorik': 'runs/{runId}/research/reports/DR-03_domaene-prozesse-regulatorik.md',
    'gate-record': 'runs/{runId}/gates/G-{nnn}_{gateway}_iter{iteration}.md',
    'proto-panel': 'runs/{runId}/panel/proto/P-{nnn}_{slug}.md',
    'panel-profiles': 'runs/{runId}/panel/personas/P-{nnn}_{slug}.md',
    'interview-transcripts': 'runs/{runId}/panel/transcripts/T-{nn}_P-{nnn}_{slug}.md',
    'interview-guide': 'runs/{runId}/panel/guides/2.1.2_interview-guide.md',
    'story-cards': 'runs/{runId}/backlog/stories/ST-{nnn}_{slug}.md',
    'spikes': 'runs/{runId}/backlog/spikes/SPK-{nnn}_{slug}.md',
    'backlog-export': 'runs/{runId}/backlog/backlog.json',
    'traceability-matrix': 'runs/{runId}/backlog/traceability.md',
    'run-report': 'runs/{runId}/REPORT.md',
    'trace-findings': 'runs/{runId}/artifacts/p6-akzeptanz/{step}_trace-findings.md',
    'glossary': 'runs/{runId}/artifacts/p6-akzeptanz/6.2.3_glossary.md',
    'backlog-cleaned': 'runs/{runId}/artifacts/p6-akzeptanz/6.2.4_backlog-cleaned.md',
  };
  if (special[type]) return special[type];
  const perStory = ['amigos-protocol', 'story-refined', 'wireframe-text', 'size-estimate', 'ac-draft', 'sbe-examples', 'acceptance-criteria'];
  if (perStory.includes(type)) return `runs/{runId}/artifacts/${phaseDir}/{storyId}/${producerKey}_${type}.md`;
  return `runs/{runId}/artifacts/${phaseDir}/${producerKey}_${type}.md`;
}

// Artifact contract (Gedächtnis §11.2): Markdown body + <file>.meta.json sidecar. [field, description, required, writer]
// writer: 'script' = computed by commit-artifact.mjs / the df scripts; 'model' = the producing agent's authored block.
export const META = [
  ['schema', 'df.artifact/v1', true, 'script'],
  ['id', 'Step key + artifact type (+ instance id for per-persona/per-story files), e.g. 1.1.2_vision-statement', true, 'script'],
  ['type', 'Artifact type id (Gedächtnis §11.1)', true, 'script'],
  ['bpmnElement', 'Producing BPMN element id', true, 'script'],
  ['runId', 'Run workspace id', true, 'script'],
  ['version', 'Bumped on every commit with a changed body/authored block (Gedächtnis §15); snapshots in history/<id>/', true, 'script'],
  ['status', 'draft on every commit; passed | passed-with-risk | discarded only via write-gate-record.mjs', true, 'script'],
  ['producedBy', '{agentRole, modelRole, model, skill} from the step contract', true, 'script'],
  ['derivedFrom', 'Upstream artifacts [{artifact, version, sha256, path}] resolved from the step inputs (+ --from)', true, 'script'],
  ['body', '{path, sha256} of the Markdown body', true, 'script'],
  ['derived', '{items, evidence: {cited, inferred, synthetic, validated, n}} computed from authored.itemIndex', true, 'script'],
  ['gate', '{record, verdict, score, iteration} of the last gate that judged it', false, 'script'],
  ['riskFlags', 'authored.riskFlags plus flags inherited from gates', false, 'script'],
  ['history', 'Previous versions [{version, sha256, status, gate, committedAt}]', false, 'script'],
  ['authored.itemIndex', 'Per item: {id, derivedFrom[], evidence, refs[], title?, status?} — read by the traceability scripts (6.2.1/6.2.2/6.2.5)', true, 'model'],
  ['authored.sources', 'SRC-/T-/P- ids used in the body; every SRC must exist in research/sources/', false, 'model'],
  ['authored.riskFlags', 'e.g. missing-input, assumption-heavy', false, 'model'],
  ['authored.attributes', 'Type-specific structured fields (e.g. epic {title, actv, tasks, goal, slice})', false, 'model'],
  ['authored.openQuestions', 'Questions the step could not resolve', false, 'model'],
  ['authored.notesForNext', 'Short handoff note for the consuming step(s)', false, 'model'],
];

// Artifact types written by a step in addition to its declared sdlc:output (no own data object in the BPMN).
export const AUX_TYPES = {
  epic: { itemPrefix: 'EP', cardinality: 'many', producers: ['S4.1.3'], pathPattern: 'runs/{runId}/backlog/epics/EP-{nnn}_{slug}.md' },
};
