# Validation pipeline

```bash
${CLAUDE_SKILL_DIR}/scripts/validate.sh <file>.bpmn
```

Runs the three stages below in order, stops at the first failing one and exits non-zero. Exact
commands are in the script; tooling is cached in `${BPMN_TOOLS_CACHE:-$HOME/.cache/bpmn-authoring-tools}`.

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
   `no-overlapping-elements` (the last three are warnings; they still fail at zero tolerance).
   Misses: `standard-size` (not in `recommended`) and anything visual.

Then render (SKILL step 6): the only check of how the planes look.

## Typical errors and fixes

| Symptom | Likely cause | Fix |
|---|---|---|
| xmllint: element X not expected | wrong child order | follow `xml-and-di.md`'s element order (flow elements before artifacts) |
| xmllint: duplicate ID | copy-pasted block with unchanged IDs | rename per the `<ParentTaskId>_<suffix>` convention |
| xmllint: `xmlParseEntityRef: no name` | unescaped `&` in a name/label | escape it as `&amp;` |
| moddle: unresolved reference | a flow/association points at a missing ID, or a rename missed a reference | grep the old ID across the file — `sourceRef`, `targetRef`, `bpmnElement`, `dataObjectRef` |
| bpmnlint `no-bpmndi` | semantic element without its DI shape/edge | add the matching `BPMNShape`/`BPMNEdge` in its plane |
| bpmnlint `sub-process-blank-start-event` / `single-blank-start-event` | missing inner start event after refining a task, or a second one | exactly one blank `startEvent` per sub-process/process scope |
| bpmnlint `no-implicit-start`/`-end` | a non-start/end node has no incoming or no outgoing flow | add the missing flow, or make it a start/end event |
| bpmnlint `label-required` | task, event, forking gateway or conditional flow without `name` | name it per `modelling-rules.md` |
| bpmnlint `fake-join` (warn) | loop-back or merge wired as two incoming flows into an ordinary task | insert an explicit XOR merge gateway before it |
| Renders but shapes overlap | coordinate slip | recheck against `layout.md`'s grid; after inserting an element mid-row, shift every shape after it |
