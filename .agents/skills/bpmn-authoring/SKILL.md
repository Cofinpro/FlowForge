---
name: bpmn-authoring
description: Creates, extends or refines BPMN 2.0 .bpmn diagrams (process models, lanes, collapsed drill-down subprocesses) so they validate against the OMG XSD, import into bpmn.io/bpmn-moddle without warnings, pass bpmnlint:recommended with zero warnings and render tidily. Use when writing, editing or planning a .bpmn file; turning a diagram into agents is bpmn-to-agentic-workflow.
---

# Author BPMN

Diagrams here are descriptive process models (`isExecutable="false"`), documenting how a process
works. The `references/` are distilled from an external German BPMN reference (not in this repo);
load each at the step that needs it.

## Workflow

### 1. Understand the existing file

Read the target file (or start from `assets/skeleton.bpmn`). List its element IDs, sequence flows
and `BPMNDiagram`/`BPMNPlane` pairs before changing anything. **Never renumber or rename an existing
ID** — every `sourceRef`/`targetRef`, `dataObjectRef`, `bpmnElement`, `categoryValueRef` would need
updating, and a missed one is a dangling reference only bpmn-moddle (not xmllint) catches.

### 2. Model the semantics first, layout second

Add or change elements per `references/xml-and-di.md` (skeleton, element catalogue, drill-down and
lane XML) and `references/modelling-rules.md` (hard rules, naming, loops, lanes vs. documentation).
Most-missed:

- One blank start event and ≥1 named end event per process **and per embedded sub-process**.
- Every split/join is an explicit gateway; a loop re-enters through a dedicated XOR merge gateway
  before the loop body's first step (never give a task two incoming flows).
- Forking XOR/OR gateways get a question name, their outgoing flows answer names, exactly one
  outgoing flow is the `default`.
- Every task, event (blank start/end included), forking gateway and conditional flow needs a `name`.
- Roles: lanes or `<bpmn:documentation>` — decide per `references/modelling-rules.md`.

### 3. Refining a task into a collapsed drill-down sub-process

1. Change the tag from `bpmn:task` to `bpmn:subProcess`; **keep its `id`**, so everything pointing
   at it keeps working.
2. Move its `dataInputAssociation`/`dataOutputAssociation` onto the subProcess element itself (they
   stay at the collapsed level, not on an inner step).
3. Add the inner flow as children: one blank start event, the step tasks, an internal gateway/loop if
   the phase has one, one or more named end events, and their sequence flows. IDs per
   `references/xml-and-di.md`.
4. Add a **second** `<bpmndi:BPMNDiagram>`/`<bpmndi:BPMNPlane bpmnElement="<ParentId>">` as a sibling
   of the top-level diagram, with DI for every inner element.
5. Set the parent's shape to `isExpanded="false"` at the collapsed size 100×80.

### 4. Lay out (DI)

Follow `references/layout.md`'s grid. Every semantic element needs a matching `BPMNShape`/`BPMNEdge`,
including data associations, groups, lanes and drill-down planes. `isMarkerVisible="true"` on every
exclusive gateway.

### 5. Validate

```bash
${CLAUDE_SKILL_DIR}/scripts/validate.sh <file>.bpmn
```

Runs XSD (xmllint) → bpmn-moddle parse warnings → `bpmnlint:recommended --max-warnings=0` and stops
at the first failing stage. Fix every finding before moving on; `references/validation.md` has what
each stage catches and a table of typical errors. Tooling is fetched on demand into
`${BPMN_TOOLS_CACHE:-$HOME/.cache/bpmn-authoring-tools}`; never add it to this repo's `package.json`.

### 6. Render and eyeball

```bash
node ${CLAUDE_SKILL_DIR}/scripts/render.mjs "${BPMN_TOOLS_CACHE:-$HOME/.cache/bpmn-authoring-tools}" <file>.bpmn <outDir>
```

Screenshots the top-level plane and every collapsed sub-process's plane to PNG. Needs the
`playwright` that `validate.sh` installs into the cache, plus `npx playwright install chromium` once.
Check: nothing overlaps, labels are readable, loop-backs route below the happy path, drill-down
planes show the intended detail. Without Playwright, paste the XML into https://demo.bpmn.io/.

### 7. Iterate

Repeat steps 2–6 per change. When modelling several phases/sub-processes, validate and render after
each one, not in a batch.

## Files

- `references/xml-and-di.md` — skeleton, element catalogue, drill-down and lane XML/DI, standard sizes.
- `references/modelling-rules.md` — hard rules, best practices, loops, lanes, naming.
- `references/layout.md` — the coordinate grid, top-level and per child plane.
- `references/validation.md` — what each validation stage catches, typical errors and fixes.
- `assets/skeleton.bpmn` — minimal valid file to start from; `assets/.bpmnlintrc` — the lint config.
- `scripts/validate.sh` (step 5), `scripts/check-moddle.mjs` (called by it), `scripts/render.mjs`
  (step 6).
