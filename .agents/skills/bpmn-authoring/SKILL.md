---
name: bpmn-authoring
description: Create, extend or refine BPMN 2.0 `.bpmn` files by hand, so they (1) validate against the OMG XSD, (2) import into bpmn.io/bpmn-moddle without warnings, (3) pass bpmnlint:recommended with zero warnings, and (4) look tidy when rendered — including refining a plain task into a collapsed drill-down subprocess without breaking the parent diagram. Use whenever authoring or editing a `.bpmn` file, or planning one.
---

# Author BPMN

Knowledge base: `docs/planning/bpmn-referenz.md` (the authoritative German BPMN 2.0.2 XML/DI/
validation reference for this repo) distilled into English `references/` so this file stays a
procedure, not a restatement of the spec. Load each reference at the step that needs it.

A `.bpmn` file in this repo is a **descriptive** process model (`isExecutable="false"`), not an
executable one — it documents how a process works for humans. Roles: for a workflow meant to be
turned into agents (input to the `bpmn2agent-*` family), **lanes are the default** — one
pool/process with a `laneSet`, lane = role/agent, every flow node in exactly one lane. For a
purely descriptive diagram with no agent-generation intent, roles stay in `<bpmn:documentation>`
instead (see `references/modelling-rules.md` for the decision and `references/xml-and-di.md` for
the lane XML/DI).

## Workflow

### 1. Understand the existing file

Read the target file (or start from `assets/skeleton.bpmn` for a new one). List its element IDs,
sequence flows and `BPMNDiagram`/`BPMNPlane` pairs before changing anything. **Never renumber or
rename an existing ID** — every reference to it (`sourceRef`/`targetRef`, `dataObjectRef`,
`bpmnElement`, `categoryValueRef`) would need updating too, and a stray miss produces a dangling
reference that only bpmn-moddle (not xmllint) catches.

### 2. Model the semantics first, layout second

Add or change elements per `references/xml-and-di.md` (element catalogue, skeleton, sub-process/
drill-down structure) and `references/modelling-rules.md` (hard rules, naming, loop pattern). In
particular:

- One blank start event and ≥1 named end event per process **and per embedded sub-process**.
- Every split/join is an explicit gateway; a loop re-enters through a dedicated XOR merge gateway
  placed before the loop body's first step (never give a task two incoming flows).
- Forking XOR/OR gateways get a question name; their outgoing flows get answer names; exactly one
  outgoing flow is the `default`.
- Every task, event, forking gateway and conditional flow needs a `name` (bpmnlint's
  `label-required` — this includes blank start/end events, which is easy to forget).
- Roles: for an agent-bound workflow, put every flow node in exactly one `laneSet` lane (role =
  agent) — see `references/xml-and-di.md`'s lane section for the XML/DI, including inside a
  collapsed sub-process's own drill-down plane. For a purely descriptive diagram, use
  `<bpmn:documentation>Rolle: … Input: … Output: …</bpmn:documentation>` on each task/step instead.
  Either way, `Input: … Output: …` in `<bpmn:documentation>` stays useful for artifacts even on a
  laned diagram.

### 3. Refining a task into a collapsed drill-down sub-process

To give an existing flat `task` its own detailed child process without disturbing anything that
points at it:

1. Change the tag from `bpmn:task` to `bpmn:subProcess`, **keep its `id`**.
2. Move any `dataInputAssociation`/`dataOutputAssociation` it already had onto the subProcess element
   itself (they stay at the collapsed level).
3. Add its inner flow as children: one blank start event, the step tasks, an internal gateway/loop if
   the phase has one, one or more named end events, and the sequence flows connecting them. ID
   convention: `<ParentId>_Start`, `<ParentId>_S<n>`, `<ParentId>_Gw<letter>`, `<ParentId>_End`,
   `<ParentId>_F<n>` — see `references/xml-and-di.md`.
4. Add a **second** `<bpmndi:BPMNDiagram>`/`<bpmndi:BPMNPlane bpmnElement="<ParentId>">` sibling of the
   top-level diagram, containing DI for every inner element.
5. Set the parent's own shape to `isExpanded="false"` at the standard collapsed size 100×80.

### 4. Lay out (DI)

Follow `references/layout.md`'s grid — it's a direct extension of this diagram's existing coordinate
conventions (main row at `y=330`, loop-backs dipping below it, a fresh independent origin per child
plane). Every semantic element needs a matching `BPMNShape`/`BPMNEdge`, including data associations,
groups and the new drill-down planes. `isMarkerVisible="true"` on every exclusive gateway.

### 5. Validate

```bash
.agents/skills/bpmn-authoring/scripts/validate.sh <file>.bpmn
```

Runs, in order: XSD schema check (xmllint) → bpmn-moddle parse warnings → `bpmnlint:recommended`
with `--max-warnings=0`. Fix findings before moving on — `references/validation.md` has the pipeline
detail and a table of typical errors with fixes. All tooling is fetched on demand into
`~/.cache/bpmn-authoring-tools` (override with `$BPMN_TOOLS_CACHE`); nothing is added to this repo's
`package.json` or CI.

### 6. Render and eyeball

```bash
node .agents/skills/bpmn-authoring/scripts/render.mjs "$BPMN_TOOLS_CACHE" <file>.bpmn <outDir>
```

(Needs `playwright` + a Chromium install in that cache dir — `validate.sh`'s cache setup installs
`playwright` alongside `bpmn-moddle`/`bpmnlint`; run `npx playwright install chromium` once if the
browser itself isn't installed yet.) Screenshots the top-level plane and every collapsed
sub-process's drill-down plane to PNG. Check: nothing overlaps, labels are readable, loop-backs route
below the happy path, and drill-down planes actually show the intended detail. If Playwright isn't
available, open the file at https://demo.bpmn.io/ instead (paste the XML — fine for these internal
process diagrams).

### 7. Iterate

Repeat steps 2–6 for each further change. When multiple phases/subprocesses are being modelled in
sequence, validate and render after each one rather than batching — a coordinate mistake or a missed
ID rename is far cheaper to find in one plane at a time.

## Reference files

- `references/xml-and-di.md` — document skeleton, element catalogue, sub-process/drill-down DI,
  standard sizes.
- `references/modelling-rules.md` — hard rules, naming conventions, the loop pattern.
- `references/layout.md` — the coordinate grid, top-level and per-child-plane.
- `references/validation.md` — the validation pipeline, exact commands, typical errors and fixes.

## Assets & scripts

- `assets/skeleton.bpmn` — minimal valid file to start a new diagram from.
- `assets/.bpmnlintrc` — `bpmnlint:recommended`, used by `scripts/validate.sh`.
- `scripts/validate.sh` — the full validation pipeline (§5 above).
- `scripts/check-moddle.mjs` — bpmn-moddle parse-warning check (called by `validate.sh`).
- `scripts/render.mjs` — headless render of every plane to PNG (optional, §6 above).
