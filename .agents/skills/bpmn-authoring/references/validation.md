# Validation pipeline

```bash
${CLAUDE_SKILL_DIR}/scripts/validate.sh <file>.bpmn
```

Runs the three stages below in order, stops at the first failing one (a structural XSD failure makes
later output noise) and exits non-zero. Read the script for the exact commands; tooling is cached in
`${BPMN_TOOLS_CACHE:-$HOME/.cache/bpmn-authoring-tools}`.

## Stages

1. **XSD schema (xmllint)** — catches unknown elements/typos, wrong child order (artifacts before
   flow elements, `category` inside `process`), missing required attributes (`targetNamespace`,
   `sourceRef`), duplicate IDs, invalid NCName IDs, a missing `targetRef` on `dataInputAssociation`.
   Misses: dangling ID references, inconsistent `incoming`/`outgoing`, modelling rules, missing DI.
2. **bpmn-moddle parse warnings** (`scripts/check-moddle.mjs`) — catches dangling references,
   duplicate IDs, unparsable elements. Misses: wrong child order.
3. **bpmnlint** (`bpmnlint:recommended`, `--max-warnings=0`, config `assets/.bpmnlintrc`) — modelling
   rules and DI presence; also fails on any moddle import warning. Relevant rules: `no-bpmndi`,
   `no-disconnected`, `no-implicit-start`/`-end`, `no-implicit-split`, `single-blank-start-event`,
   `sub-process-blank-start-event`, `end-event-required`/`start-event-required` (per scope — every
   sub-process needs its own), `label-required`, `fake-join`, `superfluous-gateway`,
   `no-overlapping-elements` (the last three are warnings, which still fail at zero tolerance).
   Misses: `standard-size` (not in `recommended`) and anything visual.

Then render (SKILL step 6) — the only check for how the planes actually look.

## Typical errors and fixes

| Symptom | Likely cause | Fix |
|---|---|---|
| xmllint: element X not expected | wrong child order | check `xml-and-di.md`'s element order (flow elements before artifacts) |
| xmllint: duplicate ID | copy-pasted a block without renaming IDs | rename per the `<ParentTaskId>_<suffix>` convention |
| xmllint: `xmlParseEntityRef: no name` | unescaped `&` in a name/label | escape it as `&amp;` |
| moddle: unresolved reference | a flow/association points at an ID that doesn't exist yet, or a rename missed a reference | grep the old ID across the file — `sourceRef`, `targetRef`, `bpmnElement`, `dataObjectRef` |
| bpmnlint `no-bpmndi` | added a semantic element without its DI shape/edge | every element added to `process`/`subProcess` needs a matching `BPMNShape`/`BPMNEdge` in its plane |
| bpmnlint `sub-process-blank-start-event` / `single-blank-start-event` | refined a task into a subProcess but forgot the inner start event, or added a second one | exactly one blank `startEvent` per sub-process/process scope |
| bpmnlint `no-implicit-start`/`-end` | a node has no incoming or no outgoing flow and isn't a start/end event | either it's missing a flow, or it should be a start/end event |
| bpmnlint `label-required` | a new task, event, forking gateway or conditional flow has no `name` | name it per `modelling-rules.md`'s naming convention |
| bpmnlint `fake-join` (warn) | a loop-back or merge was wired as two incoming flows into an ordinary task | insert an explicit XOR merge gateway before it |
| Renders but shapes overlap | coordinate arithmetic mistake | recheck against `layout.md`'s grid, especially after inserting a new element mid-row (every shape after it needs its x shifted) |
