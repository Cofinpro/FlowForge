// bpmn: {"file":"product-vision-to-user-stories.bpmn","elements":["Start_Geschaeftsidee","S0","Call_R1","Merge_P1","SP1.1","SP1.1_Start","SP1.1_Merge","S1.1.1","S1.1.2","S1.1.3","S1.1.4","S1.1.5","S1.1.6","SP1.1_CallK","SP1.1_Gw","SP1.1_End","SP1.2","SP1.2_Start","SP1.2_Merge","S1.2.1","S1.2.2","S1.2.3","S1.2.4","S1.2.5","S1.2.6","SP1.2_CallK","SP1.2_Gw","SP1.2_End","Call_PG1","G-P1","Merge_Research","Call_R2","SP2.1","SP2.1_Start","SP2.1_Merge","S2.1.1","S2.1.2","S2.1.3","S2.1.4","S2.1.5","S2.1.6","SP2.1_CallK","SP2.1_Gw","SP2.1_End","SP2.2","SP2.2_Start","SP2.2_Merge","S2.2.1","S2.2.2","S2.2.3","S2.2.4","S2.2.5","SP2.2_CallK","SP2.2_Gw","SP2.2_End","Call_R3","SP3.1","SP3.1_Start","SP3.1_Merge","S3.1.1","S3.1.2","S3.1.3","S3.1.4","SP3.1_CallK","SP3.1_Gw","SP3.1_End","Call_PG2","G-P2","Merge_Mapping","SP4.1","SP4.1_Start","SP4.1_Merge","S4.1.1","S4.1.2","S4.1.3","S4.1.4","S4.1.5","SP4.1_CallK","SP4.1_Gw","SP4.1_End","SP4.2","SP4.2_Start","SP4.2_Merge","S4.2.1","S4.2.2","S4.2.3","S4.2.4","S4.2.5","SP4.2_CallK","SP4.2_Gw","SP4.2_End","Call_PG3","G-P3","Merge_Refinement","SP5.1","SP5.1_Start","S5.1.1","SP5.1_Merge","SP5.1_CallK","SP5.1_Gw","S5.1.3","S5.1.4","SP5.1_End","SP56","SP56_Start","SP5.2","SP5.2_Start","S5.2.1","S5.2.2","S5.2.3","S5.2.4","SP5.2_CallK","SP5.2_End","SP56_Gw","SP6.1","SP6.1_Start","SP6.1_Merge","S6.1.1","S6.1.2","S6.1.3","S6.1.4","SP6.1_CallK","SP6.1_Gw","SP6.1_End","SP56_End_ok","SP56_End_resplit","G-Split","Merge_AC","SP6.2","SP6.2_Start","SP6.2_Merge","S6.2.1","S6.2.2","S6.2.3","S6.2.4","S6.2.5","SP6.2_CallK","SP6.2_Gw","SP6.2_End","G-6.2","S7","End_StoryReady","Merge_NoGo","S_NoGo","End_IdeeVerworfen","SP_Budget","SP_Budget_Start","SP_Budget_S1","SP_Budget_End","R_Start","R_1","R_Split","R_2a","R_2b","R_2c","R_Join","R_Merge","R_3","R_3b","R_Gw","R_2d","R_4","R_End","K_Start","K_1","K_2","K_Gw1","K_3","K_Merge","K_4","K_5","K_End","P_Start","P_1","P_2","P_3","P_4","P_End","PG_Start","PG_Split","PG_Call_K","PG_Call_P","PG_Join","PG_1","PG_End"]}
export const meta = {
  name: 'product-vision-to-user-stories',
  description: 'Dark factory: from a business idea to sprint-ready user stories with acceptance criteria, fully autonomous (BPMN product-vision-to-user-stories.bpmn)',
  whenToUse: 'Run deliberately once per business idea. Args: {runId: "2026-09-25_meal-planner_a7f3", idea: "1–3 sentences" | ideaFile: "path/to/brief.md" | ideaDir: "path/to/input-folder" (brief + supporting material, copied to runs/<runId>/input/; brief?: file name of the brief inside it), language?: "de", maxLoops?: 3, budgetReserve?: 60000, targetDir?: "../other-repo" (tests/harness only: runs land in <targetDir>/runs; normally enable the dark-factory plugin in the target project and run there, D-32/D-35), researchMoneyCapUsd?: 15}',
  phases: [
    { title: '0 Idee-Brief & DR-01', detail: 'Start, 0 Idee-Brief vervollstaendigen, Recherche: Markt & Wettbewerb (DR-01)' },
    { title: '1.1 Produktvision & Geschaeftsmodell', detail: 'SP1.1 steps + critic phase-1-1' },
    { title: '1.2 Impact Mapping', detail: 'SP1.2 steps + critic phase-1-2' },
    { title: 'G-P1 Vision', detail: 'Phasen-Gate-Review: Vision (critic + proto panel vote)' },
    { title: '2.1 Discovery', detail: 'DR-02, SP2.1 steps with synthetic panel + critic phase-2-1' },
    { title: '2.2 Problem Definition', detail: 'SP2.2 steps + critic phase-2-2' },
    { title: '3.1 Customer Journey', detail: 'DR-03, SP3.1 steps + critic phase-3-1' },
    { title: 'G-P2 Validierung', detail: 'Phasen-Gate-Review: Validierung (pass / more research / pivot / no-go)' },
    { title: '4.1 Story Mapping', detail: 'SP4.1 steps + critic phase-4-1' },
    { title: '4.2 Release Slicing & MVP', detail: 'SP4.2 steps + critic phase-4-2' },
    { title: 'G-P3 MVP', detail: 'Phasen-Gate-Review: MVP' },
    { title: '5.1 Stories je Epic', detail: 'per slice-1 epic: story cards, INVEST critic, splitting / spikes' },
    { title: '5.2-6.1 Story-Veredelung', detail: 'per story: refinement, DoR critic, acceptance criteria + gherkin critic' },
    { title: '6.2 Backlog-Konsistenz', detail: 'traceability scripts, glossary, orphan/fake cleanup, matrix + critic' },
    { title: '7 Abschluss', detail: 'backlog export + run report (or partial report when the budget is exhausted)' },
  ],
}

// Generated from product-vision-to-user-stories.bpmn by flowforge-generate for pattern.chosen:
// workflow-script. CLAUDE-ONLY: this is a Claude Code Workflow tool script.
//
// IMPORTANT — this file is only ever a saved script. Nothing runs it automatically; you start it
// deliberately with the Workflow tool, once per idea (see README.md). Every BPMN step runs as the
// agent of its role (agentType dark-factory:product-<role>) with the step's skill; the gateways below only route on
// the verdicts the critic returns (Gedächtnis §9), loop caps are plain counters, and resume uses
// the Workflow's own resumeFromRunId (same args -> cached steps) plus run.json / log/events.jsonl
// in the run workspace.

// Args normally arrive as an object; a slash-command invocation may pass the JSON as a string, possibly
// followed by extra text (e.g. a token-budget suffix) — parse the first {...} block in that case.
function parseArgs(a) {
  if (typeof a !== 'string') return a || {}
  const m = a.match(/\{[\s\S]*\}/)
  try { return m ? JSON.parse(m[0]) : {} } catch (e) { throw new Error(`args is a string but not valid JSON: ${e.message}`) }
}
const A = parseArgs(args)
if (!A.runId || !(A.idea || A.ideaFile || A.ideaDir)) throw new Error('args.runId and args.idea (or args.ideaFile / args.ideaDir) are required, e.g. {runId: "2026-09-25_meal-planner_a7f3", idea: "..."}')
const RUNS_ROOT = A.targetDir ? `${String(A.targetDir).replace(/\/+$/, '')}/runs` : 'runs' // D-12: runs may land in the app repo
const RUN = `${RUNS_ROOT}/${A.runId}`
const MAX = A.maxLoops ?? 3 // sdlc:critic maxLoops (Gedächtnis §9.1)
const PIVOT_CAP = 2 // Gedächtnis §9.3
const RESERVE = A.budgetReserve ?? 60000 // tokens kept back for the partial report
const risks = []

// ---------------------------------------------------------------- schemas
const STR = { type: 'string' }
const STRS = { type: 'array', items: STR }
const STEP = { type: 'object', properties: { status: { type: 'string', enum: ['done', 'blocked', 'partial'] }, artifacts: STRS, items: STRS, riskFlags: STRS, summary: STR }, required: ['status', 'artifacts', 'summary'] }
const VERDICT = { type: 'object', properties: { verdict: { type: 'string', enum: ['pass', 'fail', 'pass-with-risk'] }, score: { type: 'number' }, gateRecord: STR, iteration: { type: 'number' }, classification: { type: 'string', enum: ['fits', 'too-big', 'too-uncertain', 'n/a'] }, changeRequests: STRS, riskFlags: STRS, summary: STR }, required: ['verdict', 'gateRecord', 'changeRequests', 'summary'] }
const GATE = { type: 'object', properties: { verdict: { type: 'string', enum: ['pass', 'fail', 'pivot', 'more-research', 'no-go'] }, gateRecord: STR, reasons: STRS, changeRequests: STRS, riskFlags: STRS, summary: STR }, required: ['verdict', 'gateRecord', 'reasons', 'summary'] }
const ROUTE = { type: 'object', properties: { channels: STRS, questions: { type: 'array', items: { type: 'object', properties: { q: STR, channel: STR }, required: ['q', 'channel'] } }, riskFlags: STRS }, required: ['channels', 'questions'] }
const CLAIMS = { type: 'object', properties: { status: { type: 'string', enum: ['done', 'blocked', 'partial'] }, artifacts: STRS, gaps: { type: 'array', items: { type: 'object', properties: { kind: { type: 'string', enum: ['scope', 'claim'] }, ref: STR, query: STR } } }, stats: { type: 'object' }, riskFlags: STRS, summary: STR }, required: ['status', 'gaps', 'summary'] }
const PANEL1 = { type: 'object', properties: { personas: { type: 'array', items: { type: 'object', properties: { id: STR, role: STR, profile: STR }, required: ['id', 'role', 'profile'] } }, stimulusPath: STR }, required: ['personas', 'stimulusPath'] }
const ANSWER = { type: 'object', properties: { personaId: STR, turns: { type: 'array', items: { type: 'object', properties: { q: STR, a: STR } } }, comments: { type: 'array', items: { type: 'object', properties: { step: STR, comment: STR } } }, ratings: { type: 'array', items: { type: 'object' } }, vote: { type: 'object', properties: { score: { type: 'number' }, reason: STR } } }, required: ['personaId'] }
const PANEL3 = { type: 'object', properties: { sessionPath: STR, transcripts: STRS, votes: { type: 'array', items: { type: 'object' } }, objections: { type: 'array', items: { type: 'object' } }, problemRankingKill: { type: 'boolean' }, summary: STR }, required: ['sessionPath', 'summary'] }
const EPICS = { type: 'object', properties: { epics: { type: 'array', items: { type: 'object', properties: { id: STR, path: STR }, required: ['id'] } } }, required: ['epics'] }

// ---------------------------------------------------------------- BPMN steps (sdlc:step / sdlc:panel)
const s = (id, label, role, skill, panel) => ({ id, label, role, skill, panel })
const SP = {
  '1.1': { title: '1.1 Produktvision & Geschaeftsmodell', callK: 'SP1.1_CallK', rubric: 'phase-1-1', gw: 'SP1.1_Gw', steps: [
    s('S1.1.1', 'Status quo & Zielbild klaeren', 'stratege', 'product-zielbild-klaeren'),
    s('S1.1.2', 'Vision Statement & Elevator Pitch formulieren', 'stratege', 'product-vision-statement-formulieren'),
    s('S1.1.3', 'Lean / Business Model Canvas abbilden', 'stratege', 'product-lean-canvas-abbilden'),
    s('S1.1.4', 'Proto-Panel aus Research ableiten', 'researcher', 'product-proto-panel-ableiten'),
    s('S1.1.5', 'Value Proposition Canvas abgleichen', 'ux', 'product-value-proposition-canvas-abgleichen', { mode: 'rating', set: 'proto' }),
    s('S1.1.6', 'Annahmen in Assumptions Map priorisieren', 'stratege', 'product-assumptions-map-priorisieren')] },
  '1.2': { title: '1.2 Impact Mapping', callK: 'SP1.2_CallK', rubric: 'phase-1-2', gw: 'SP1.2_Gw', steps: [
    s('S1.2.1', 'Ziel & Kennzahlen festlegen (Why)', 'stratege', 'product-ziele-kennzahlen-festlegen'),
    s('S1.2.2', 'Akteure identifizieren (Who)', 'stratege', 'product-akteure-identifizieren'),
    s('S1.2.3', 'Verhaltensaenderungen ableiten (How)', 'ux', 'product-verhaltensaenderungen-ableiten'),
    s('S1.2.4', 'Deliverables als Optionen sammeln (What)', 'stratege', 'product-deliverables-sammeln'),
    s('S1.2.5', 'Impacts nach Hebel & Risiko priorisieren', 'stratege', 'product-impacts-priorisieren'),
    s('S1.2.6', 'Outcome-orientierte Roadmap ableiten', 'stratege', 'product-roadmap-ableiten')] },
  '2.1': { title: '2.1 Discovery', callK: 'SP2.1_CallK', rubric: 'phase-2-1', gw: 'SP2.1_Gw', steps: [
    s('S2.1.1', 'Stakeholder & Anforderungsquellen identifizieren', 'researcher', 'product-stakeholder-quellen-identifizieren'),
    s('S2.1.2', 'Erhebungstechniken & Interviewleitfaden erstellen', 'interviewer', 'product-interviewleitfaden-erstellen'),
    s('S2.1.3', 'Synthetisches Panel aus Research-Korpus aufbauen', 'researcher', 'product-synthetisches-panel-aufbauen'),
    s('S2.1.4', 'Synthetische Interviews durchfuehren', 'interviewer', 'product-synthetische-interviews-durchfuehren', { mode: 'interview', set: 'full' }),
    s('S2.1.5', 'User Roles & Personas modellieren', 'ux', 'product-personas-modellieren'),
    s('S2.1.6', 'Jobs-to-be-Done formulieren', 'ux', 'product-jtbd-formulieren')] },
  '2.2': { title: '2.2 Problem Definition', callK: 'SP2.2_CallK', rubric: 'phase-2-2', gw: 'SP2.2_Gw', steps: [
    s('S2.2.1', 'Empathy Maps erstellen', 'ux', 'product-empathy-maps-erstellen', { mode: 'rating', set: 'full', optional: true }),
    s('S2.2.2', 'Pains & Gains extrahieren', 'ux', 'product-pains-gains-extrahieren'),
    s('S2.2.3', 'Point of View & How-Might-We formulieren', 'ux', 'product-pov-hmw-formulieren'),
    s('S2.2.4', 'Opportunity-Solution-Tree aufbauen', 'stratege', 'product-opportunity-solution-tree-aufbauen'),
    s('S2.2.5', 'Opportunities priorisieren', 'stratege', 'product-opportunities-priorisieren', { mode: 'rating', set: 'full' })] },
  '3.1': { title: '3.1 Customer Journey', callK: 'SP3.1_CallK', rubric: 'phase-3-1', gw: 'SP3.1_Gw', steps: [
    s('S3.1.1', 'Current-State-Journey kartieren', 'ux', 'product-current-state-journey-kartieren', { mode: 'walkthrough', set: 'full' }),
    s('S3.1.2', 'Hot Spots & Friktionspunkte markieren', 'ux', 'product-hot-spots-markieren'),
    s('S3.1.3', 'Future-State-Journey entwerfen', 'ux', 'product-future-state-journey-entwerfen', { mode: 'walkthrough', set: 'full' }),
    s('S3.1.4', 'Service Blueprint schichten', 'architekt', 'product-service-blueprint-schichten')] },
  '4.1': { title: '4.1 Story Mapping', callK: 'SP4.1_CallK', rubric: 'phase-4-1', gw: 'SP4.1_Gw', steps: [
    s('S4.1.1', 'Rahmen setzen (Personas, Ziele, Problem)', 'backlog-autor', 'product-story-map-rahmen-setzen'),
    s('S4.1.2', 'Big Picture & Narrative Flow erzaehlen', 'ux', 'product-narrative-flow-erzaehlen'),
    s('S4.1.3', 'Backbone destillieren (Activities & Tasks)', 'backlog-autor', 'product-backbone-destillieren'),
    s('S4.1.4', 'Details, Alternativen & Randfaelle explorieren', 'qa', 'product-story-map-details-explorieren'),
    s('S4.1.5', 'Map durchlaufen: Luecken & Abhaengigkeiten finden', 'architekt', 'product-story-map-durchlaufen')] },
  '4.2': { title: '4.2 Release Slicing & MVP', callK: 'SP4.2_CallK', rubric: 'phase-4-2', gw: 'SP4.2_Gw', steps: [
    s('S4.2.1', 'Outcome-basierte Release-Ziele festlegen', 'stratege', 'product-release-ziele-festlegen'),
    s('S4.2.2', 'Walking Skeleton schneiden', 'architekt', 'product-walking-skeleton-schneiden'),
    s('S4.2.3', 'Opening / Mid / Endgame planen', 'architekt', 'product-release-sequenz-planen'),
    s('S4.2.4', 'Nach Value vs. Effort priorisieren', 'stratege', 'product-value-effort-priorisieren'),
    s('S4.2.5', 'MVP & Release-Roadmap abgrenzen', 'stratege', 'product-mvp-abgrenzen')] },
  '6.1': { title: '5.2-6.1 Story-Veredelung', callK: 'SP6.1_CallK', rubric: 'gherkin', gw: 'SP6.1_Gw', steps: [
    s('S6.1.1', 'Confirmation-Kriterien festhalten', 'backlog-autor', 'product-confirmation-kriterien-festhalten'),
    s('S6.1.2', 'Mit konkreten Beispielen spezifizieren (SBE)', 'qa', 'product-sbe-beispiele-spezifizieren', { mode: 'rating', set: 'full', optional: true }),
    s('S6.1.3', 'In Given-When-Then formalisieren', 'qa', 'product-gherkin-formalisieren'),
    s('S6.1.4', 'Fachliche vs. technische Testerwartungen abgleichen', 'architekt', 'product-testerwartungen-abgleichen')] },
  '6.2': { title: '6.2 Backlog-Konsistenz', callK: 'SP6.2_CallK', rubric: 'traceability', gw: 'SP6.2_Gw', steps: [
    s('S6.2.1', 'Story -> Epic-Traceability pruefen', 'traceability', 'product-traceability'),
    s('S6.2.2', 'Epic -> Impact / Vision-Traceability pruefen', 'traceability', 'product-traceability'),
    s('S6.2.3', 'Ubiquitous-Language-Konsistenz pruefen', 'kritiker', 'product-ubiquitous-language-pruefen'),
    s('S6.2.4', 'Orphan- & Fake-Stories aussortieren', 'kritiker', 'product-orphan-fake-stories-aussortieren'),
    s('S6.2.5', 'Traceability-Matrix erzeugen', 'traceability', 'product-traceability')] },
}
const S52 = [
  s('S5.2.1', 'Three-Amigos-Debatte (3 Perspektiven)', 'backlog-autor', 'product-three-amigos-debatte'),
  s('S5.2.2', 'Was von Wie trennen', 'backlog-autor', 'product-was-von-wie-trennen'),
  s('S5.2.3', 'Low-Fi-Wireframe & Domaenenmodell anhaengen', 'ux', 'product-wireframe-domaenenmodell-anhaengen'),
  s('S5.2.4', 'Groessenklasse bestimmen (S/M/L)', 'architekt', 'product-groessenklasse-bestimmen')]
const S511 = s('S5.1.1', 'Story Card entwerfen (Connextra)', 'backlog-autor', 'product-story-card-entwerfen')
const S513 = s('S5.1.3', 'Splitting-Muster anwenden', 'backlog-autor', 'product-story-splitten')
const S514 = s('S5.1.4', 'Technische Unsicherheit als Spike auslagern', 'architekt', 'product-spike-auslagern')
const PGS = {
  'G-P1': { call: 'Call_PG1', label: 'Phasen-Gate-Review: Vision', rubric: 'gate-vision', panelSet: 'proto', title: 'G-P1 Vision' },
  'G-P2': { call: 'Call_PG2', label: 'Phasen-Gate-Review: Validierung', rubric: 'gate-validierung', panelSet: 'full', title: 'G-P2 Validierung' },
  'G-P3': { call: 'Call_PG3', label: 'Phasen-Gate-Review: MVP', rubric: 'gate-mvp', panelSet: 'full', title: 'G-P3 MVP' },
}

// ---------------------------------------------------------------- budget ("Budget erschoepft", accepted gap)
let budgetBypass = false
const budgetLow = (factor = 1) => Boolean(budget.total) && budget.remaining() < RESERVE * factor
function checkBudget() {
  if (!budgetBypass && budgetLow()) { const e = new Error('BUDGET_EXHAUSTED'); e.code = 'BUDGET_EXHAUSTED'; throw e }
}

// ---------------------------------------------------------------- primitives
// Agents occasionally return a list field as a JSON-encoded string or a bare string. Normalise it so a
// malformed field can never crash the orchestration (a string riskFlags once cost a G-P2 panel vote).
const LIST_FIELDS = ['artifacts', 'items', 'riskFlags', 'changeRequests', 'reasons', 'channels']
function asList(v) {
  if (v == null || Array.isArray(v)) return v
  if (typeof v === 'string') {
    try { const p = JSON.parse(v); if (Array.isArray(p)) return p } catch { /* plain string */ }
    return v.trim() ? [v] : []
  }
  return [v]
}

async function run(ph, role, skill, element, label, ctx, schema = STEP, extra = '') {
  checkBudget()
  const prompt = `Dark factory run ${A.runId} — run workspace ${RUN}.
BPMN element ${element} "${label}".
Invoke the skill \`dark-factory:${skill}\` (Skill tool) and follow it exactly; it names its scripts and the binding rules (knowledge/process-rules.md of the dark-factory plugin).
Run context: ${JSON.stringify({ runDir: RUN, runId: A.runId, ...ctx })}
${extra}
Paths in the run context are relative to the project directory (the session's working directory): run every script from there by the absolute path the skill names, never cd into the plugin or elsewhere first, or the run directory resolves to the wrong place.
Work fully autonomously (never ask a human). Return only the skill's return JSON.`
  const r = await agent(prompt, { agentType: `dark-factory:product-${role}`, label: `${element} ${label}`.slice(0, 70), phase: ph, schema })
  if (!r) throw new Error(`${element} "${label}" returned no result`)
  for (const f of LIST_FIELDS) if (f in r) r[f] = asList(r[f])
  if (r.riskFlags?.length) risks.push(...r.riskFlags.map((f) => `${element}: ${f}`))
  return r
}

// Process_R — Recherche durchfuehren (Gedächtnis §8)
// First call of a corpus: R_1 -> R_Split -> R_2a|R_2b|R_2c -> R_Join -> R_Merge -> R_3 -> R_3b -> R_Gw "Luecken?"
//   -> (gaps and not yet searched) R_2d -> R_Merge ... | (else) R_4.
// A second call of the same corpus (G-P2 "more research", re-entry after a pivot) runs in gap-fill mode:
// websearch only, aimed at the gate's change requests — never another Deep Research call (Gedächtnis §8.5).
const corpusDone = new Set()
async function research(ph, callEl, label, callId, order, gaps = []) {
  const gapfill = corpusDone.has(callId)
  const route = await run(ph, 'researcher', 'product-recherche', `${callEl}/R_1`, 'Fragestellung schaerfen & Tool routen', { mode: 'route', callId, order, gapfill, gaps }, ROUTE)
  const EL = { 'deep-research': ['R_2a', 'Deep-Research-Auftrag stellen'], websearch: ['R_2b', 'Web-Suche durchfuehren'], ddg: ['R_2c', 'Bulk-URL-Discovery via DuckDuckGo'] }
  let channels = [...new Set(route.channels)].filter((c) => EL[c])
  if (gapfill) channels = channels.filter((c) => c !== 'deep-research') // hard rule, whatever R_1 answered
  if (!channels.length) channels.push('websearch')
  // R_Split ... R_Join: a real barrier — normalization needs every channel's raw results
  await parallel(channels.map((ch) => () => run(ph, 'researcher', 'product-recherche', `${callEl}/${EL[ch][0]}`, EL[ch][1],
    { mode: ch, callId, questions: route.questions.filter((q) => q.channel === ch || (gapfill && ch === 'websearch')) })))
  checkBudget() // parallel() swallows a thrown thunk — re-raise a budget stop here
  // R_Merge -> R_3 -> R_3b -> R_Gw, at most one gap-fill round (R_2d)
  for (let round = 0; ; round++) {
    await run(ph, 'researcher', 'product-recherche', `${callEl}/R_3`, 'Quellen normalisieren, hashen & deduplizieren', { mode: 'normalize', callId })
    const claims = await run(ph, 'researcher', 'product-recherche', `${callEl}/R_3b`, 'Claims extrahieren & Abdeckung pruefen', { mode: 'claims', callId, gapFillRound: round }, CLAIMS)
    if (!claims.gaps?.length || round >= 1) break // R_F9 "Nein / schon nachgesucht"
    await run(ph, 'researcher', 'product-recherche', `${callEl}/R_2d`, 'Luecken gezielt nachsuchen', { mode: 'gapfill', callId, gaps: claims.gaps }) // R_F8
  }
  corpusDone.add(callId)
  return run(ph, 'researcher', 'product-recherche', `${callEl}/R_4`, 'Recherche-Synthese mit Zitaten verfassen', { mode: 'synthesize', callId, callElement: callEl, gapfill })
}

// Process_P — Panel-Befragung (P_1 -> P_2 multi-instance per persona -> P_3 + P_4)
async function panel(ph, stepId, mode, panelSet, stimulus) {
  const p1 = await run(ph, 'interviewer', 'product-panel-befragung', `${stepId}/P_1`, 'Stimulus / Leitfaden vorbereiten', { stage: 1, stepId, mode, panelSet, stimulus }, PANEL1)
  const answers = await parallel(p1.personas.map((p) => () => run(ph, 'persona', 'product-panel-befragung', `${stepId}/P_2 ${p.id}`, 'Persona befragen',
    { stage: 2, stepId, mode, personaId: p.id, personaRole: p.role, profile: p.profile, stimulus: p1.stimulusPath }, ANSWER,
    `You are persona ${p.id}. Read ONLY ${p.profile} and ${p1.stimulusPath}; answer in role.`)))
  checkBudget()
  return run(ph, 'interviewer', 'product-panel-befragung', `${stepId}/P_3+P_4`, 'Transkript erfassen & Synthese / Votum bilden',
    { stage: 3, stepId, mode, panelSet, stimulus: p1.stimulusPath, answers: answers.filter(Boolean) }, PANEL3)
}

// Process_K — Kritiker-Pruefung
function critic(ph, callEl, rubric, gateway, iteration, artifacts, ctx = {}) {
  return run(ph, 'kritiker', 'product-kritiker-pruefung', callEl, `Kritiker-Pruefung aufrufen (${rubric})`,
    { gateway, rubric, threshold: 0.8, maxLoops: MAX, iteration, artifacts, ...ctx }, VERDICT)
}

// Process_PG — Phasen-Gate-Review: PG_Split -> (K || P vote) -> PG_Join -> PG_1
async function phaseGate(gateId, iteration, pivotCount) {
  const g = PGS[gateId]
  phase(g.title)
  const [k, p] = await parallel([
    () => critic(g.title, `${g.call}/PG_Call_K`, g.rubric, gateId, iteration, [], { mode: 'phase-gate' }),
    () => panel(g.title, gateId, 'vote', g.panelSet, []),
  ])
  checkBudget()
  if (!k || !p) throw new Error(`${gateId}: critic or panel returned nothing`)
  const v = await run(g.title, 'kritiker', 'product-phasen-gate', `${g.call}/PG_1`, 'Verdikt aggregieren', { gate: gateId, iteration, pivotCount, maxLoops: MAX, critic: k, panel: p }, GATE)
  log(`${gateId} (iteration ${iteration}): ${v.verdict} — ${v.summary}`)
  return v
}

// One BPMN task (+ its panel call, if sdlc:panel is set)
async function step(ph, st, ctx) {
  let panelResult
  if (st.panel) {
    if (st.panel.optional && budgetLow(3)) { log(`${st.id}: optional panel skipped (budget, Gedächtnis §9.4)`); risks.push(`${st.id}: panel-skipped`) }
    else panelResult = (await panel(ph, st.id, st.panel.mode, st.panel.set, ctx.phaseArtifacts || [])).sessionPath
  }
  return run(ph, st.role, st.skill, st.id, st.label, { ...ctx, ...(panelResult ? { panelResult } : {}) })
}

// A collapsed sub-process with the pattern: Start -> Merge -> steps -> K -> Gw ("Ja" -> End | "Nein" -> Merge)
async function subProcess(key, ctx = {}, ph) {
  const sp = SP[key]
  ph = ph || sp.title
  if (!ctx.storyId) phase(ph)
  let changeRequests = []
  let v
  for (let it = 1; ; it++) {
    const arts = []
    for (const st of sp.steps) {
      const r = await step(ph, st, { ...ctx, iteration: it, changeRequests, phaseArtifacts: arts })
      arts.push(...(r.artifacts || []))
    }
    v = await critic(ph, sp.callK, sp.rubric, sp.gw, it, arts, ctx)
    if (v.verdict === 'pass' || v.verdict === 'pass-with-risk') break // "Ja (ggf. mit Risiko-Flag)"
    if (it >= MAX) { risks.push(`${sp.gw}: loop cap ${MAX} reached`); break } // K.4 normally already returned pass-with-risk
    changeRequests = v.changeRequests || [] // "Nein" -> back to the merge
  }
  if (v.verdict === 'pass-with-risk') risks.push(`${sp.gw}: pass-with-risk (${v.gateRecord})`)
  return v
}

// SP5.1 — per epic: Story Card -> Merge -> K(invest) -> Gw "Zu gross / zu unsicher / passt?"
async function storiesForEpic(epic, storyIds) {
  const ph = '5.1 Stories je Epic'
  const ctx = { epicId: epic.id, ...(storyIds ? { storyIds, reason: 'Re-Splitting noetig' } : {}) }
  let r = await step(ph, S511, { ...ctx, iteration: 1, changeRequests: [] })
  const stories = new Set((r.items || []).filter((x) => x.startsWith('ST-')))
  for (let it = 1; ; it++) {
    const v = await critic(ph, 'SP5.1_CallK', 'invest', 'SP5.1_Gw', it, r.artifacts || [], ctx)
    const cls = v.classification || 'fits'
    if (cls === 'fits' || v.verdict === 'pass') break // "Passt (Sized Right)"
    if (it >= MAX) { risks.push(`SP5.1_Gw ${epic.id}: loop cap reached (${cls})`); break }
    r = await step(ph, cls === 'too-big' ? S513 : S514, { ...ctx, iteration: it + 1, changeRequests: v.changeRequests || [] }) // "Zu gross" | "Zu unsicher (Spike)"
    for (const x of r.items || []) if (x.startsWith('ST-')) stories.add(x)
  }
  return [...stories]
}

// SP56 — per story: SP5.2 -> SP56_Gw "Story erfuellt INVEST & DoR?" -> SP6.1
async function refineStory(storyId) {
  const ph = '5.2-6.1 Story-Veredelung'
  const arts = []
  for (const st of S52) {
    const r = await step(ph, st, { storyId, iteration: 1, changeRequests: [], phaseArtifacts: arts })
    arts.push(...(r.artifacts || []))
  }
  const dor = await critic(ph, 'SP5.2_CallK', 'dor', 'SP5.2', 1, arts, { storyId })
  if (dor.verdict !== 'pass' && dor.verdict !== 'pass-with-risk') return { storyId, outcome: 'resplit', gateRecord: dor.gateRecord } // SP56_End_resplit
  await subProcess('6.1', { storyId }, ph)
  return { storyId, outcome: 'ok' } // SP56_End_ok
}

// ---------------------------------------------------------------- main flow
let result
try {
  phase('0 Idee-Brief & DR-01')
  await run('0 Idee-Brief & DR-01', 'traceability', 'product-traceability', 'Start_Geschaeftsidee', 'Geschaeftsidee / Marktbedarf erkannt',
    { command: 'init', idea: A.idea || null, ideaFile: A.ideaFile || null, ideaDir: A.ideaDir || null, brief: A.brief || null, language: A.language || 'de' }, STEP,
    `Initialise the run workspace with run-state.mjs init ${RUNS_ROOT} ${A.runId} <idea> ${A.brief ? `--brief ${JSON.stringify(A.brief)} ` : ''}--language ${A.language || 'de'} --money-cap ${A.researchMoneyCapUsd ?? 15} --ensure-project, where <idea> is the ideaDir folder path, else the ideaFile path, else the idea text as one quoted argument.`)
  await step('0 Idee-Brief & DR-01', s('S0', '0 Idee-Brief vervollstaendigen', 'stratege', 'product-idee-brief-vervollstaendigen'), { iteration: 1, changeRequests: [] })
  await research('0 Idee-Brief & DR-01', 'Call_R1', 'Recherche: Markt & Wettbewerb (DR-01)', 'DR-01', 'DR-01 Markt & Wettbewerb')

  let pivotCount = 0
  let lastG2 = null // survives a pivot so the gap-fill knows why it runs again
  let noGo = null
  // Merge_P1 (entered first time, after "Nachschaerfen" and after "Pivot")
  phases: for (;;) {
    for (let it = 1; ; it++) {
      await subProcess('1.1', { pivotCount })
      await subProcess('1.2', { pivotCount })
      const g1 = await phaseGate('G-P1', it, pivotCount)
      if (g1.verdict === 'no-go') { noGo = g1; break phases } // F_P1_nogo
      if (g1.verdict === 'pass') break // F_P1_ja
      if (it >= MAX) { risks.push(`G-P1: loop cap ${MAX} reached`); break }
      // F_P1_nachschaerfen -> Merge_P1
    }
    // Merge_Research
    let g2
    for (let it = 1; ; it++) {
      phase('2.1 Discovery')
      const prev = g2 || lastG2
      const gaps = prev?.changeRequests?.length ? prev.changeRequests : prev?.reasons || [] // gap-fill input on "more research" / after a pivot
      await research('2.1 Discovery', 'Call_R2', 'Recherche: Zielgruppe & Voice of Customer (DR-02)', 'DR-02', 'DR-02 Zielgruppe / Voice of Customer', gaps)
      await subProcess('2.1')
      await subProcess('2.2')
      phase('3.1 Customer Journey')
      await research('3.1 Customer Journey', 'Call_R3', 'Recherche: Domaene, Prozesse & Regulatorik (DR-03)', 'DR-03', 'DR-03 Domaene, Prozesse, Regulatorik', gaps)
      await subProcess('3.1')
      g2 = await phaseGate('G-P2', it, pivotCount)
      lastG2 = g2
      if (g2.verdict === 'more-research' && it < MAX) continue // F_P2_research -> Merge_Research
      if (g2.verdict === 'more-research') { risks.push(`G-P2: more-research loop cap ${MAX} reached — proceeding`); g2 = { ...g2, verdict: 'pass' } }
      break
    }
    if (g2.verdict === 'no-go') { noGo = g2; break } // F_P2_nogo
    if (g2.verdict === 'pivot') { // F_P2_pivot -> Merge_P1 (sdlc:condition pivotCount < 2); corpora are kept
      if (pivotCount < PIVOT_CAP) { pivotCount++; log(`Pivot ${pivotCount}/${PIVOT_CAP} — back to 1.1`); continue }
      noGo = { ...g2, verdict: 'no-go', reasons: [...(g2.reasons || []), 'pivot cap reached'] }; break
    }
    break // F_P2_ja -> Merge_Mapping
  }

  if (noGo) {
    // Merge_NoGo -> S_NoGo -> End_IdeeVerworfen: S7's skill in discarded mode writes REPORT.md and finishes the run
    phase('7 Abschluss')
    await run('7 Abschluss', 'traceability', 'product-backlog-exportieren-report-erstellen', 'S_NoGo', 'No-Go-Report erstellen',
      { mode: 'discarded', gateRecord: noGo.gateRecord, reasons: noGo.reasons, pivotCount, workflowRisks: risks })
    result = { status: 'discarded', end: 'End_IdeeVerworfen', report: `${RUN}/REPORT.md`, gateRecord: noGo.gateRecord, reasons: noGo.reasons, risks }
  } else {
    // Merge_Mapping
    for (let it = 1; ; it++) {
      await subProcess('4.1')
      await subProcess('4.2')
      const g3 = await phaseGate('G-P3', it, pivotCount)
      if (g3.verdict === 'pass') break // F_P3_ja
      if (it >= MAX) { risks.push(`G-P3: loop cap ${MAX} reached`); break }
      // F_P3_nachschaerfen -> Merge_Mapping
    }

    // Merge_Refinement — SP5.1 multi-instance over EP[slice=1], then SP56 multi-instance over ST[from=5.1]
    phase('5.1 Stories je Epic')
    const { epics } = await run('5.1 Stories je Epic', 'traceability', 'product-traceability', 'SP5.1', 'Collection EP[slice=1]',
      { command: 'list-epics' }, EPICS, `Run node <this skill's base directory>/scripts/commit-artifact.mjs query ${RUN} --type epic --attr slice=1 and return every epic it lists (id = the EP item id from items, path). Read only; change nothing.`)
    let targets = epics.map((e) => ({ epic: e, storyIds: null }))
    const epicOf = {}
    for (let split = 1; ; split++) {
      const perEpic = await pipeline(targets, (t) => storiesForEpic(t.epic, t.storyIds))
      checkBudget() // pipeline() swallows a thrown stage — re-raise a budget stop here
      perEpic.forEach((ids, i) => (ids || []).forEach((id) => { epicOf[id] = targets[i].epic }))
      const stories = perEpic.filter(Boolean).flat()
      phase('5.2-6.1 Story-Veredelung')
      const refined = (await pipeline(stories, (id) => refineStory(id))).filter(Boolean)
      checkBudget()
      const resplit = refined.filter((r) => r.outcome === 'resplit')
      log(`G-Split: ${resplit.length} of ${refined.length} stories need re-splitting`)
      if (!resplit.length) break // F_Split_nein
      if (split >= MAX) { risks.push(`G-Split: loop cap ${MAX} reached — ${resplit.map((r) => r.storyId).join(', ')} stay unrefined`); break }
      // F_Split_ja -> Merge_Refinement, only for the affected stories (ST[status=needs-resplit])
      const byEpic = {}
      for (const r of resplit) { const e = epicOf[r.storyId]; if (e) (byEpic[e.id] ??= { epic: e, storyIds: [] }).storyIds.push(r.storyId) }
      targets = Object.values(byEpic)
    }

    // Merge_AC -> SP6.2 -> G-6.2
    for (let it = 1; ; it++) {
      const v = await subProcess('6.2')
      if (v.verdict === 'pass' || v.verdict === 'pass-with-risk') break // F_62_ja
      if (it >= MAX) { risks.push(`G-6.2: loop cap ${MAX} reached`); break }
    }

    phase('7 Abschluss')
    await step('7 Abschluss', s('S7', '7 Abschluss: Backlog exportieren & Run-Report erstellen', 'traceability', 'product-backlog-exportieren-report-erstellen'),
      { iteration: 1, changeRequests: [], mode: 'final', workflowRisks: risks })
    result = { status: 'done', end: 'End_StoryReady', report: `${RUN}/REPORT.md`, backlog: `${RUN}/backlog/backlog.json`, risks }
  }
} catch (e) {
  if (e.code !== 'BUDGET_EXHAUSTED' && e.message !== 'BUDGET_EXHAUSTED') throw e
  // "Budget erschoepft" (accepted gap for the event sub-process): save the partial result + report
  budgetBypass = true
  log('Budget exhausted — writing the partial result and run report (Teilergebnis sichern & Run-Report erstellen)')
  phase('7 Abschluss')
  await run('7 Abschluss', 'traceability', 'product-backlog-exportieren-report-erstellen', 'SP_Budget_S1', 'Teilergebnis sichern & Run-Report erstellen',
    { mode: 'partial', workflowRisks: risks })
  result = { status: 'partial', end: 'SP_Budget_End', report: `${RUN}/REPORT.md`, risks }
}
return result
