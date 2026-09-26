# BPMN 2.0.2 XML & DI — element reference

English distillation of `docs/planning/bpmn-referenz.md` (the authoritative German reference; consult
it directly for anything not covered here). Scope: hand-authoring/editing `.bpmn` files that (1)
validate against the OMG XSD, (2) import into bpmn.io/bpmn-moddle warning-free, (3) pass
`bpmnlint:recommended` with zero warnings.

## Document skeleton

```xml
<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
                  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
                  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
                  xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
                  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                  id="Definitions_X"
                  targetNamespace="https://example.com/bpmn/x">
  <!-- rootElements: category, message, signal, error, escalation, collaboration, process, ... -->
  <bpmn:process id="Process_1" isExecutable="false"> ... </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1"> ... </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>
```

Note: the spec *version* is 2.0.2 but XML namespaces still carry the 2.0 date (`20100524`); XSDs live
under `20100501/`. There is no separate 2.0.2 namespace.

**Element order inside `process`**: `laneSet` → flow elements (events, tasks, gateways, sequence
flows, data objects/associations) → artifacts (group, textAnnotation, association) last. xmllint
enforces this via the XSD's element sequence.

## Element catalogue

- **Events** (circle, 36×36): `startEvent` (no incoming), `endEvent` (no outgoing), boundary events
  (no incoming, attached via `attachedToRef`), intermediate throw/catch. A blank start/end has no
  `eventDefinition` child.
- **Tasks** (rounded rectangle, 100×80): plain `task`, or typed (`userTask`, `serviceTask`, …) — this
  repo's diagrams use plain `task`/`subProcess` since they're descriptive, not executable.
- **Gateways** (diamond, 50×50): `exclusiveGateway` (XOR), `parallelGateway` (AND), `inclusiveGateway`
  (OR, avoid unless truly needed), `eventBasedGateway`. Forking XOR/OR gateways need a `name` (a
  question) and their outgoing flows named as answers; exactly one outgoing flow is the `default`.
- **Sub-processes**: see next section.
- **Sequence flows**: connect nodes within the *same* `process`/`subProcess` scope only. A
  conditional flow carries `<bpmn:conditionExpression xsi:type="bpmn:tFormalExpression">…</...>`; a
  gateway's default flow is referenced by the gateway's `default="Flow_Id"` attribute and carries no
  condition itself.
- **Data objects**: `dataObject` (the type, no name) + `dataObjectReference` (the named, visible node,
  `dataObjectRef` pointing at the `dataObject`). `dataInputAssociation`/`dataOutputAssociation` connect
  a reference to a task; an input association needs a `property` on the task as its `targetRef`
  (`<bpmn:property id="Property_X" name="__targetRef_placeholder" />`), matching this repo's existing
  pattern.
- **Text annotations & associations**: `textAnnotation` + plain `association` (not sequence flow) to
  the annotated element.
- **Groups / category / categoryValue**: `category` + nested `categoryValue` at `definitions` level;
  `group` inside `process` with `categoryValueRef`. Purely visual — never changes token flow.
- **Pools/lanes/message flows**: message flows (between pools) aren't used in this repo's diagrams.
  Lanes (`laneSet`, within one pool/process) **are** the default for an agent-bound workflow — see
  "Lanes (`laneSet`)" below — and stay unused (roles live in `<documentation>` instead) only for a
  purely descriptive diagram; see `modelling-rules.md` for the decision.

## Sub-processes and drill-down

| Element | Meaning |
|---|---|
| `subProcess` (embedded) | Activity with its own inner flow; **exactly one blank start event** inside (`sub-process-blank-start-event`), its own end event(s). Tokens leave only via its boundary. |
| `subProcess triggeredByEvent="true"` | Event sub-process: no incoming/outgoing; started by a **typed** start event. Not used here. |
| `callActivity` | Not a sub-process in the XML — references a separate `process`. Not used here. |

```xml
<bpmn:subProcess id="Task_1_1" name="1.1 Produktvision & Geschäftsmodell rahmen">
  <bpmn:documentation>Rolle: ... Input: ... Output: ...</bpmn:documentation>
  <bpmn:incoming>Flow_01</bpmn:incoming>
  <bpmn:outgoing>Flow_02</bpmn:outgoing>
  <bpmn:startEvent id="Task_1_1_Start"><bpmn:outgoing>Task_1_1_F1</bpmn:outgoing></bpmn:startEvent>
  <bpmn:task id="Task_1_1_S1" name="...">
    <bpmn:incoming>Task_1_1_F1</bpmn:incoming><bpmn:outgoing>Task_1_1_F2</bpmn:outgoing>
  </bpmn:task>
  <bpmn:endEvent id="Task_1_1_End" name="..."><bpmn:incoming>Task_1_1_F2</bpmn:incoming></bpmn:endEvent>
  <bpmn:sequenceFlow id="Task_1_1_F1" sourceRef="Task_1_1_Start" targetRef="Task_1_1_S1" />
  <bpmn:sequenceFlow id="Task_1_1_F2" sourceRef="Task_1_1_S1" targetRef="Task_1_1_End" />
</bpmn:subProcess>
```

**Refining a `task` into a `subProcess` without breaking the parent**: keep the element's `id`
unchanged (every `incoming`/`outgoing`/flow `sourceRef`/`targetRef`/data-association `targetRef`
pointing at it keeps working); just change the tag from `bpmn:task` to `bpmn:subProcess` and insert
the inner start/steps/end/flows as children. Data input/output associations on the task move onto the
subProcess element itself (they attach at the collapsed level, not to an inner step) — this repo's
convention is to leave them there so drill-down doesn't disturb Data Object wiring.

**ID convention for inner elements**: `<ParentTaskId>_Start`, `<ParentTaskId>_S<n>` (steps, in the
step's own order — reuse the parent's numbering, e.g. `Task_1_1_S1`..`Task_1_1_S4`), `<ParentTaskId>_
Gw<letter>` (internal gateway), `<ParentTaskId>_End`/`_EndAlt` (multiple named ends allowed),
`<ParentTaskId>_F<n>` (flows) / `<ParentTaskId>_FLoop` (loop-back flow). Keeps every ID globally
unique and greppable back to its parent task.

**DI for a collapsed sub-process**: the parent-level shape gets `isExpanded="false"` and standard
collapsed size 100×80 (not the 150×90 this diagram used for plain tasks before drill-down — 100×80 is
`bpmnlint`'s `standard-size` expectation, checked manually since that rule isn't in `recommended`).
Its inner flow gets a **second, separate** `BPMNDiagram`/`BPMNPlane` pair whose `bpmnElement` is the
subProcess's own ID:

```xml
<bpmndi:BPMNDiagram id="BPMNDiagram_Task_1_1">
  <bpmndi:BPMNPlane id="BPMNPlane_Task_1_1" bpmnElement="Task_1_1">
    <!-- shapes/edges for Task_1_1_Start, Task_1_1_S1, ..., Task_1_1_End, Task_1_1_F1, ... -->
  </bpmndi:BPMNPlane>
</bpmndi:BPMNDiagram>
```

One `<bpmndi:BPMNDiagram>` per collapsed sub-process, all as siblings of the top-level one, all
direct children of `bpmn:definitions` (after the top-level `BPMNDiagram`). Coordinates inside a
child plane are independent of the parent — start fresh at a convenient origin (see `layout.md`).

## Lanes (`laneSet`) — default for an agent-bound workflow

Use this whenever the diagram is (or may become) input to the `bpmn2agent-*` family — see
`modelling-rules.md`. A purely descriptive diagram skips this and keeps roles in
`<bpmn:documentation>` instead.

**`laneSet` inside a plain process** (no pool needed): `laneSet` is the *first* child of
`bpmn:process`, before any flow element (same element-order rule as above). Each `bpmn:lane` lists
every flow node assigned to it via `flowNodeRef` (events, tasks, gateways — not data objects,
which aren't flow nodes and carry no lane).

```xml
<bpmn:process id="Process_1" isExecutable="false">
  <bpmn:laneSet id="LaneSet_Process_1">
    <bpmn:lane id="Lane_A" name="Role A">
      <bpmn:flowNodeRef>Start_1</bpmn:flowNodeRef>
      <bpmn:flowNodeRef>Task_1</bpmn:flowNodeRef>
    </bpmn:lane>
    <bpmn:lane id="Lane_B" name="Role B">
      <bpmn:flowNodeRef>SubProcess_1</bpmn:flowNodeRef>
      <bpmn:flowNodeRef>End_1</bpmn:flowNodeRef>
    </bpmn:lane>
  </bpmn:laneSet>
  <!-- startEvent, task, subProcess, endEvent, sequenceFlow as usual -->
</bpmn:process>
```

DI: one `BPMNShape` per lane (`bpmnElement` = the lane's own ID, `isHorizontal="true"`, bounds
spanning the full width of the process's flow content, lanes stacked top-to-bottom with no gap).
The top-level `BPMNPlane`'s `bpmnElement` can point **directly at the process ID** — a
`collaboration`/`participant` (pool) is *not* required for lanes to render. Add a `participant`
only when the diagram genuinely needs a second pool (message flows to another organization); when
it's there, the plane's `bpmnElement` becomes the `collaboration` ID instead, and a `BPMNShape` for
the `participant` wraps the lane shapes (see "Tested" below for a worked example of both forms).

**`laneSet` inside a collapsed sub-process's own drill-down plane**: same pattern, one level down —
the `laneSet` is the first child of `bpmn:subProcess` (before its inner start event/steps/end/
flows), and its lanes' `flowNodeRef`s list the sub-process's *inner* elements (`<ParentTaskId>_
Start`, `<ParentTaskId>_S<n>`, …). The sub-process's own `BPMNDiagram`/`BPMNPlane
bpmnElement="<subProcessId>"` (per the drill-down section above) gets the lane `BPMNShape`s plus
the inner node shapes — nothing about the drill-down mechanics changes. No participant/pool is
needed at this level either, even though the parent-level shape for the sub-process itself sits
inside a lane of the *outer* plane.

**Tested** (2026-09-25, scratchpad spike, not committed): a minimal file with (a) a
`collaboration`+`participant`+`process` carrying a 2-lane `laneSet`, and (b) a collapsed
`subProcess` with its own 2-lane `laneSet` in its drill-down plane — both passed `validate.sh`
(XSD, 0 moddle warnings, 0 bpmnlint findings) and both rendered correctly end-to-end with
`render.mjs` (bpmn-js): lane bands, role labels and every inner shape showed up as expected in
both the pool'd top-level plane and the pool-less drill-down plane. This matches
`docs/planning/product-vision-to-user-stories.bpmn`, which already uses lanes this way throughout
(every `SPn.n` drill-down, plus two top-level reusable `bpmn:process` elements `Process_P`/
`Process_PG`) with **no `collaboration`/`participant` anywhere in the file** — confirming a pool is
never actually required for lanes to render in bpmn-js, at either the process or the sub-process
level. Treat "pool required for lanes" as a myth for this skill's purposes.

**Fallback**, only if a future bpmn-js/viewer version regresses this: colour-code per role instead,
using the `bioc`/`color` extension on each node plus a text-annotation legend, and keep
`<bpmn:documentation>Rolle: …</bpmn:documentation>` (or `sdlc:agentRole` where that extension
applies) as the authoritative role source that generators read from instead of the lane shapes.

## Diagram Interchange (DI)

Without DI, bpmn-js can't render the model, and bpmnlint's `no-bpmndi` fires for every element.

```xml
<bpmndi:BPMNShape id="Gw_Approved_di" bpmnElement="Gw_Approved" isMarkerVisible="true">
  <dc:Bounds x="655" y="285" width="50" height="50" />
  <bpmndi:BPMNLabel><dc:Bounds x="640" y="342" width="80" height="14" /></bpmndi:BPMNLabel>
</bpmndi:BPMNShape>
<bpmndi:BPMNEdge id="Flow_Yes_di" bpmnElement="Flow_Yes">
  <di:waypoint x="705" y="310" /><di:waypoint x="782" y="310" />
  <bpmndi:BPMNLabel><dc:Bounds x="735" y="292" width="18" height="14" /></bpmndi:BPMNLabel>
</bpmndi:BPMNEdge>
```

- One `BPMNShape` per node/artifact/lane/participant, one `BPMNEdge` per sequence flow, message flow,
  association, data-input/output association; `bpmnElement` = the semantic ID.
- `dc:Bounds` = top-left `x`,`y` + `width`,`height` in absolute plane coordinates (not relative to a
  pool/sub-process). `BPMNLabel` is optional; tools auto-place it when absent (external labels:
  events, gateways, data objects, flows; tasks label inside the shape).
- `BPMNEdge` needs ≥2 `di:waypoint`s; first/last should sit on the source/target shape's border.
  Orthogonal routing = add corner waypoints.
- Shape attributes: `isMarkerVisible="true"` on **exclusive gateways** (draws the "X"; otherwise
  renders as an empty diamond); `isHorizontal="true"` on pools/lanes; `isExpanded="true|false"` on
  sub-processes.
- **Data associations**: an edge whose `bpmnElement` is the `dataInputAssociation`/
  `dataOutputAssociation` ID, waypoints from producer to data object (output) or data object to
  consumer (input).
- **Groups**: a plain `BPMNShape` for the `group` ID with bounds enclosing the grouped shapes; the
  label shows `categoryValue@value`. Membership is purely geometric.
- Eingeklappter (collapsed) sub-process: second `BPMNDiagram` with `BPMNPlane bpmnElement=
  "<subProcessId>"` (see above).

Standard sizes (bpmn-js defaults = bpmnlint's `standard-size` rule, not in `recommended` but worth
matching):

| Element | Width × Height |
|---|---|
| Task / callActivity / collapsed subProcess | 100 × 80 |
| Event (any) | 36 × 36 |
| Gateway (any) | 50 × 50 |
| dataObjectReference | 36 × 50 |
| dataStoreReference | 50 × 50 |
| textAnnotation | ~100 × 30 (free) |
| Pool (participant) | e.g. 600+ × 250, header 30 wide |
| Label | ~text width × 14 per line |

Centering tip: an event on a task row with task `y=110,h=80` → center `y=150` → event `y=132`,
gateway `y=125`. Keep ~50px horizontal spacing.
