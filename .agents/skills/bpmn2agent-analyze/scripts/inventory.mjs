#!/usr/bin/env node
// Usage: node inventory.mjs <cacheDir> <file.bpmn>
//
// Parses <file.bpmn> with bpmn-moddle and prints a JSON inventory to stdout: every
// process/subProcess scope, every lane, every flow node (with lane/scope/documentation/
// incoming/outgoing/multi-instance/boundary-events/eventDefinitions), every sequence flow,
// every data object/reference + data association, every text annotation + its associated
// element, computed pattern-rubric signals (per scope and aggregated), and a `findings`
// array of things bpmn2agent-analyze's SKILL.md should ask the business user about.
//
// bpmn-moddle is resolved via createRequire against <cacheDir>/package.json, same reasoning
// as bpmn-authoring/scripts/check-moddle.mjs: Node's ESM resolver won't find a package
// installed outside this script's own directory tree. Run bpmn-authoring/scripts/validate.sh
// first (it installs bpmn-moddle into that cache) so this script has something to require.
//
// This script only reads and reports; it never mutates the .bpmn file.
import { createRequire } from 'node:module';
import path from 'node:path';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const [, , cacheDir, file] = process.argv;
if (!cacheDir || !file) {
  console.error('Usage: node inventory.mjs <cacheDir> <file.bpmn>');
  process.exit(2);
}

const require = createRequire(path.join(cacheDir, 'package.json'));
const { BpmnModdle } = require('bpmn-moddle');

const xmlBuffer = readFileSync(file);
const xml = xmlBuffer.toString('utf8');
const sha256 = createHash('sha256').update(xmlBuffer).digest('hex');

const { rootElement, warnings } = await new BpmnModdle().fromXML(xml);
if (warnings.length) {
  // Non-fatal here (validate.sh is the gate for parse warnings); surface them as findings
  // instead of failing, since bpmn2agent-analyze may be run on a file that hasn't been
  // through validate.sh yet in an earlier attempt.
  for (const w of warnings) console.error('WARN (bpmn-moddle):', w.message);
}

const FLOW_NODE_TYPES = new Set([
  'bpmn:Task', 'bpmn:UserTask', 'bpmn:ManualTask', 'bpmn:ServiceTask', 'bpmn:ScriptTask',
  'bpmn:BusinessRuleTask', 'bpmn:SendTask', 'bpmn:ReceiveTask',
  'bpmn:CallActivity', 'bpmn:SubProcess', 'bpmn:Transaction',
  'bpmn:ExclusiveGateway', 'bpmn:ParallelGateway', 'bpmn:InclusiveGateway',
  'bpmn:ComplexGateway', 'bpmn:EventBasedGateway',
  'bpmn:StartEvent', 'bpmn:EndEvent', 'bpmn:BoundaryEvent',
  'bpmn:IntermediateCatchEvent', 'bpmn:IntermediateThrowEvent',
]);
const SUBPROCESS_TYPES = new Set(['bpmn:SubProcess', 'bpmn:Transaction']);
const FORKING_GATEWAY_TYPES = new Set(['bpmn:ExclusiveGateway', 'bpmn:InclusiveGateway']);

const asArray = (x) => (x == null ? [] : Array.isArray(x) ? x : [x]);
const docText = (el) => {
  const docs = asArray(el.documentation).map((d) => d.text).filter(Boolean);
  return docs.length ? docs.join('\n\n') : null;
};

// --- role hint extraction: structured sdlc:step agentRole extension takes priority (it's the
// machine-readable source); "Rolle: X" in <documentation> is the last-resort fallback per the
// input contract (references/conventions.md) for scopes/elements with neither a lane nor an
// extension element. ---
const ROLE_DOC_RE = /Rolle:\s*([^.\n]+)/i;
function extractRoleHint(el) {
  const values = el.extensionElements?.values || [];
  const step = values.find((v) => /:step$/i.test(v.$type || ''));
  if (step && step.agentRole) return { source: 'extension', value: String(step.agentRole) };
  const doc = docText(el);
  if (doc) {
    const m = ROLE_DOC_RE.exec(doc);
    if (m) return { source: 'documentation', value: m[1].trim() };
  }
  return null;
}

// --- multi-instance collection hint: extension element, else name pattern, else null ---
const MI_NAME_HINT_RE = /\b(je|pro|for each|jede[rns]?)\b/i;
function extractCollectionHint(el, textAnnotationsByAssociatedId) {
  const mi = el.loopCharacteristics;
  if (!mi) return null;
  const values = mi.extensionElements?.values || [];
  const collectionExt = values.find((v) => /collection/i.test(v.$type || ''));
  if (collectionExt) {
    return collectionExt.ref || collectionExt.expression || collectionExt.value || JSON.stringify(collectionExt);
  }
  if (mi.loopCardinality?.body) return `cardinality: ${mi.loopCardinality.body}`;
  if (mi.loopDataInputRef?.id) return `dataInput: ${mi.loopDataInputRef.id}`;
  if (el.name && MI_NAME_HINT_RE.test(el.name)) return `name hint: "${el.name}"`;
  const note = textAnnotationsByAssociatedId.get(el.id);
  if (note) return `annotation hint: "${note}"`;
  return null;
}

const scopes = [];
const lanes = [];
const flowNodes = [];
const sequenceFlows = [];
const dataObjects = [];
const textAnnotations = [];
const associationsRaw = []; // bpmn:Association elements, resolved into textAnnotations after the walk
const findings = [];

function pushFinding(type, severity, message, extra = {}) {
  findings.push({ type, severity, message, ...extra });
}

// First pass: collect text annotations + associations per scope so multi-instance hint
// extraction (which needs "annotation associated with this element") can use them; done in
// the same walk since both live in flowElements.
function walkScope(scopeEl, scopeId, parentScopeId, scopeType) {
  const triggeredByEvent = scopeEl.triggeredByEvent === true;
  scopes.push({
    id: scopeId,
    bpmnType: scopeEl.$type,
    name: scopeEl.name || null,
    scopeType, // 'process' | 'subProcess'
    parentScopeId,
    triggeredByEvent,
  });

  const laneSets = scopeEl.laneSets || [];
  const laneOfNode = new Map();
  for (const laneSet of laneSets) {
    for (const lane of laneSet.lanes || []) {
      const refIds = (lane.flowNodeRef || []).map((n) => n.id);
      lanes.push({ id: lane.id, name: lane.name || null, scopeId, flowNodeRefs: refIds });
      for (const id of refIds) laneOfNode.set(id, lane.id);
    }
  }
  const hasLanes = laneSets.some((ls) => (ls.lanes || []).length > 0);

  const flowElements = scopeEl.flowElements || [];

  // local text-annotation/association pass first, so collection-hint extraction below can
  // look up "does this element have an associated annotation".
  const localAnnotations = flowElements.filter((el) => el.$type === 'bpmn:TextAnnotation');
  const localAssociations = flowElements.filter((el) => el.$type === 'bpmn:Association');
  const annotationTextById = new Map(localAnnotations.map((a) => [a.id, a.text || null]));
  const associatedIdByAnnotationId = new Map();
  const textByAssociatedElementId = new Map();
  for (const assoc of localAssociations) {
    const srcIsAnnotation = assoc.sourceRef?.$type === 'bpmn:TextAnnotation';
    const tgtIsAnnotation = assoc.targetRef?.$type === 'bpmn:TextAnnotation';
    let annotationId = null;
    let associatedElementId = null;
    if (srcIsAnnotation) {
      annotationId = assoc.sourceRef.id;
      associatedElementId = assoc.targetRef?.id || null;
    } else if (tgtIsAnnotation) {
      annotationId = assoc.targetRef.id;
      associatedElementId = assoc.sourceRef?.id || null;
    }
    if (annotationId) {
      associatedIdByAnnotationId.set(annotationId, associatedElementId);
      if (associatedElementId) {
        textByAssociatedElementId.set(associatedElementId, annotationTextById.get(annotationId) || null);
      }
    }
  }
  for (const ann of localAnnotations) {
    textAnnotations.push({
      id: ann.id,
      text: ann.text || null,
      scopeId,
      associatedElementId: associatedIdByAnnotationId.get(ann.id) || null,
    });
  }

  const nestedScopeIds = [];

  for (const el of flowElements) {
    if (SUBPROCESS_TYPES.has(el.$type)) {
      // A collapsed/embedded sub-process is both a flow node in this scope AND its own
      // nested scope. callActivity is NOT a scope here — it references a separate
      // top-level bpmn:Process, which is walked independently as its own root scope.
      nestedScopeIds.push(el.id);
      recordFlowNode(el, scopeId, laneOfNode, textByAssociatedElementId);
      walkScope(el, el.id, scopeId, 'subProcess');
      continue;
    }
    if (FLOW_NODE_TYPES.has(el.$type)) {
      recordFlowNode(el, scopeId, laneOfNode, textByAssociatedElementId);
      continue;
    }
    if (el.$type === 'bpmn:SequenceFlow') {
      sequenceFlows.push({
        id: el.id,
        scopeId,
        source: el.sourceRef?.id || null,
        target: el.targetRef?.id || null,
        name: el.name || null,
        condition: el.conditionExpression?.body || null,
        isDefault: el.sourceRef?.default?.id === el.id,
      });
      continue;
    }
    if (el.$type === 'bpmn:DataObject') {
      dataObjects.push({ id: el.id, kind: 'dataObject', name: el.name || null, scopeId, dataObjectRef: null });
      continue;
    }
    if (el.$type === 'bpmn:DataObjectReference') {
      dataObjects.push({
        id: el.id,
        kind: 'dataObjectReference',
        name: el.name || null,
        scopeId,
        dataObjectRef: el.dataObjectRef?.id || null,
      });
      continue;
    }
    // bpmn:TextAnnotation / bpmn:Association already handled above; bpmn:Group,
    // bpmn:Category etc. are purely visual and out of scope for the inventory.
  }

  // Second pass over this scope's own flow nodes for boundary-event attachment and
  // data associations (needs the full flowNodes list for this scope already pushed).
  const scopeFlowNodeIds = new Set(
    flowElements.filter((el) => FLOW_NODE_TYPES.has(el.$type) || SUBPROCESS_TYPES.has(el.$type)).map((el) => el.id)
  );
  for (const el of flowElements) {
    if (el.$type !== 'bpmn:BoundaryEvent') continue;
    const target = el.attachedToRef?.id;
    if (!target) continue;
    const node = flowNodes.find((n) => n.id === target);
    if (node) node.attachedBoundaryEvents.push(el.id);
  }

  // No-lane finding: every flow node in this scope should be referenced by a lane when
  // this scope declares any lanes at all.
  if (hasLanes) {
    const laned = new Set(lanes.filter((l) => l.scopeId === scopeId).flatMap((l) => l.flowNodeRefs));
    const orphans = [...scopeFlowNodeIds].filter((id) => !laned.has(id));
    if (orphans.length) {
      pushFinding(
        'element-without-lane', 'warning',
        `Scope "${scopeEl.name || scopeId}" declares lanes but ${orphans.length} element(s) aren't assigned to any lane.`,
        { scopeId, elements: orphans }
      );
    }
  } else {
    // documentation-role fallback: no laneSet in this scope at all — collect "Rolle:" /
    // sdlc:step agentRole hints from this scope's own flow nodes.
    const hinted = [...scopeFlowNodeIds]
      .map((id) => flowNodes.find((n) => n.id === id))
      .filter((n) => n && n.roleHint);
    if (hinted.length) {
      pushFinding(
        'documentation-role-fallback', 'info',
        `Scope "${scopeEl.name || scopeId}" has no laneSet; ${hinted.length} element(s) carry a role hint in <documentation>/sdlc:step instead of a lane.`,
        { scopeId, elements: hinted.map((n) => ({ id: n.id, roleHint: n.roleHint })) }
      );
    }
  }

  return nestedScopeIds;
}

function recordFlowNode(el, scopeId, laneOfNode, textByAssociatedElementId) {
  const isSubProcess = SUBPROCESS_TYPES.has(el.$type);
  const isForkingGateway = FORKING_GATEWAY_TYPES.has(el.$type) && (el.outgoing || []).length > 1;

  const node = {
    id: el.id,
    bpmnType: el.$type,
    name: el.name || null,
    lane: laneOfNode.get(el.id) || null,
    scopeId,
    documentation: docText(el),
    roleHint: extractRoleHint(el),
    incoming: (el.incoming || []).map((f) => f.id),
    outgoing: (el.outgoing || []).map((f) => f.id),
    multiInstance: el.loopCharacteristics
      ? {
          isSequential: !!el.loopCharacteristics.isSequential,
          collectionHint: extractCollectionHint(el, textByAssociatedElementId),
        }
      : null,
    attachedBoundaryEvents: [], // filled in the boundary-event pass
    eventDefinitions: (el.eventDefinitions || []).map((d) => d.$type),
    calledElement: el.calledElement || null,
    triggeredByEvent: isSubProcess ? el.triggeredByEvent === true : undefined,
    isForCompensation: el.isForCompensation === true || undefined,
    default: el.default?.id || undefined,
  };
  flowNodes.push(node);

  if (isForkingGateway && !el.default) {
    pushFinding(
      'gateway-without-default', 'warning',
      `Forking gateway ${el.id}${el.name ? ` ("${el.name}")` : ''} has no default outgoing flow.`,
      { elementId: el.id }
    );
  }
  if (el.eventDefinitions?.some((d) => d.$type === 'bpmn:TimerEventDefinition')) {
    pushFinding(
      'unsupported-timer-event', 'unresolved',
      `${el.id} is a timer event — unsupported in v1 (see mapping-rubric.md). Suggest modelling the timer as a loop-cap on the enclosing gate instead.`,
      { elementId: el.id }
    );
  }
  if (el.eventDefinitions?.some((d) => d.$type === 'bpmn:MessageEventDefinition')) {
    pushFinding(
      'unsupported-message-event', 'unresolved',
      `${el.id} is a message event — unsupported in v1 (cross-system/cross-pool choreography). Suggest flattening the counterpart into a lane if it represents a role, not an external system.`,
      { elementId: el.id }
    );
  }
  if (el.eventDefinitions?.some((d) => d.$type === 'bpmn:CompensateEventDefinition') || el.isForCompensation) {
    pushFinding(
      'unsupported-compensation', 'unresolved',
      `${el.id} uses compensation — unsupported in v1. Suggest modelling the rollback as an explicit, separate task on the happy-path's error branch instead.`,
      { elementId: el.id }
    );
  }
  if (isSubProcess && el.triggeredByEvent === true) {
    pushFinding(
      'unsupported-event-subprocess', 'unresolved',
      `${el.id}${el.name ? ` ("${el.name}")` : ''} is an event sub-process — unsupported in v1. Suggest modelling it as an explicit boundary error event on the activity it actually guards, or as its own monitoring agent checklist item if it truly watches the whole run.`,
      { elementId: el.id }
    );
  }
  // Per-element "no lane" detail is available via `node.lane === null`; the aggregate
  // `element-without-lane` finding (with the full list of affected element ids) is pushed once
  // per scope in walkScope() above, so nothing further is recorded here.
}

// --- walk every root process (top-level workflow root + any reusable sub-processes
// referenced by callActivity, e.g. Process_K/Process_P/Process_PG/Process_R) ---
const rootProcesses = (rootElement.rootElements || []).filter((e) => e.$type === 'bpmn:Process');
for (const proc of rootProcesses) {
  walkScope(proc, proc.id, null, 'process');
}

// --- collaboration / pools / message flows (unsupported construct) ---
const collaboration = (rootElement.rootElements || []).find((e) => e.$type === 'bpmn:Collaboration');
if (collaboration) {
  const participants = collaboration.participants || [];
  const messageFlows = collaboration.messageFlows || [];
  if (participants.length > 1 && messageFlows.length > 0) {
    pushFinding(
      'unsupported-pools-message-flows', 'unresolved',
      `Collaboration ${collaboration.id} has ${participants.length} pools connected by ${messageFlows.length} message flow(s) — unsupported in v1 (cross-organization/cross-system choreography). Suggest flattening a pool into a lane if it represents a role rather than an external system.`,
      { elementId: collaboration.id }
    );
  }
}

// --- data associations (declared on the activity element itself, not as flowElements) ---
function collectDataAssociations(scopeEl) {
  for (const el of scopeEl.flowElements || []) {
    for (const da of el.dataInputAssociations || []) {
      const sources = asArray(da.sourceRef).map((s) => s.id);
      dataObjects.push({ id: da.id, kind: 'dataInputAssociation', activityId: el.id, dataRefIds: sources });
    }
    for (const da of el.dataOutputAssociations || []) {
      const target = da.targetRef?.id;
      dataObjects.push({ id: da.id, kind: 'dataOutputAssociation', activityId: el.id, dataRefIds: target ? [target] : [] });
    }
    if (SUBPROCESS_TYPES.has(el.$type)) collectDataAssociations(el);
  }
}
for (const proc of rootProcesses) collectDataAssociations(proc);

// --- signals per scope (pattern-rubric.md), computed from THIS scope's own flow nodes/
// flows only (nested sub-process scopes get their own signals, computed independently, so
// bpmn2agent-design can recurse per callActivity/subProcess as the rubric requires) ---
function detectBackEdges(nodeIds, flows) {
  const adjacency = new Map();
  for (const id of nodeIds) adjacency.set(id, []);
  for (const f of flows) {
    if (!adjacency.has(f.source)) continue;
    adjacency.get(f.source).push({ flowId: f.id, target: f.target });
  }
  const visited = new Set();
  const onStack = new Set();
  const backEdges = [];
  function dfs(id) {
    visited.add(id);
    onStack.add(id);
    for (const edge of adjacency.get(id) || []) {
      if (!nodeIds.has(edge.target)) continue;
      if (!visited.has(edge.target)) dfs(edge.target);
      else if (onStack.has(edge.target)) backEdges.push({ flowId: edge.flowId, source: id, target: edge.target });
    }
    onStack.delete(id);
  }
  const targets = new Set(flows.map((f) => f.target));
  const entryNodes = [...nodeIds].filter((id) => !targets.has(id));
  for (const id of entryNodes.length ? entryNodes : nodeIds) if (!visited.has(id)) dfs(id);
  for (const id of nodeIds) if (!visited.has(id)) dfs(id); // disconnected components
  return backEdges;
}

const DETERMINISTIC_CONDITION_RE = /[<>=]|\d|Grenzwert|Schwellenwert|threshold|schwelle/i;
function evaluateGateway(node, flowsById) {
  const outFlows = node.outgoing.map((id) => flowsById.get(id)).filter(Boolean);
  const hasFormalCondition = outFlows.some((f) => f.condition);
  const textSignal = `${node.name || ''} ${outFlows.map((f) => f.name || '').join(' ')}`;
  const looksDeterministic = hasFormalCondition || DETERMINISTIC_CONDITION_RE.test(textSignal);
  return {
    id: node.id,
    name: node.name,
    looksDeterministic,
    reason: hasFormalCondition
      ? 'has a formal conditionExpression on at least one outgoing flow'
      : looksDeterministic
        ? 'condition/flow text matches a deterministic threshold pattern'
        : 'no formal condition and free-text branch labels — looks like it needs case-by-case judgement (confirm with the business user)',
  };
}

function computeSignals(scopeId) {
  const nodesInScope = flowNodes.filter((n) => n.scopeId === scopeId);
  const flowsInScope = sequenceFlows.filter((f) => f.scopeId === scopeId);
  const flowsById = new Map(flowsInScope.map((f) => [f.id, f]));
  const nodeIds = new Set(nodesInScope.map((n) => n.id));

  const humanTaskCount = nodesInScope.filter((n) => n.bpmnType === 'bpmn:UserTask' || n.bpmnType === 'bpmn:ManualTask').length;
  const parallelCount = nodesInScope.filter((n) => n.bpmnType === 'bpmn:ParallelGateway' || n.bpmnType === 'bpmn:InclusiveGateway').length;
  const multiInstanceCount = nodesInScope.filter((n) => n.multiInstance).length;
  const backEdges = detectBackEdges(nodeIds, flowsInScope);
  const forkingGateways = nodesInScope.filter((n) => FORKING_GATEWAY_TYPES.has(n.bpmnType) && n.outgoing.length > 1);
  const judgementGateways = forkingGateways.map((g) => evaluateGateway(g, flowsById)).filter((g) => !g.looksDeterministic);

  return {
    humanTaskCount,
    parallelCount,
    multiInstanceCount,
    loopCount: backEdges.length,
    judgementBranchCount: judgementGateways.length,
    attended: humanTaskCount > 0,
    loops: backEdges,
    judgementGateways,
  };
}

for (const scope of scopes) {
  scope.signals = computeSignals(scope.id);
}

const aggregate = {
  humanTaskCount: 0, parallelCount: 0, multiInstanceCount: 0, loopCount: 0, judgementBranchCount: 0,
  loops: [], judgementGateways: [],
};
for (const scope of scopes) {
  aggregate.humanTaskCount += scope.signals.humanTaskCount;
  aggregate.parallelCount += scope.signals.parallelCount;
  aggregate.multiInstanceCount += scope.signals.multiInstanceCount;
  aggregate.loopCount += scope.signals.loopCount;
  aggregate.judgementBranchCount += scope.signals.judgementBranchCount;
  aggregate.loops.push(...scope.signals.loops.map((l) => ({ ...l, scopeId: scope.id })));
  aggregate.judgementGateways.push(...scope.signals.judgementGateways.map((g) => ({ ...g, scopeId: scope.id })));
}
aggregate.attended = aggregate.humanTaskCount > 0;

const inventory = {
  meta: { file, sha256, generatedAt: new Date().toISOString() },
  scopes,
  lanes,
  flowNodes,
  sequenceFlows,
  dataObjects,
  textAnnotations,
  signals: aggregate,
  findings,
};

process.stdout.write(JSON.stringify(inventory, null, 2) + '\n');
