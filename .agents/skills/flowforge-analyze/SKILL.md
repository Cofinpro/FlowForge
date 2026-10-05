---
name: flowforge-analyze
description: Reads a hand-drawn .bpmn, validates and inventories it, flags constructs the pipeline can't generate yet (pools/message flows, timer/message events, event sub-processes, compensation), asks the business user about gaps only (incl. data stores and process input/output), and writes the draft generated/<workflow>/workflow-spec.yaml. On a changed .bpmn it diffs by element id and asks only about what changed. Never edits the .bpmn. Use when a diagram is new or changed, before flowforge-knowledge.
bpmn:
  file: docs/planning/flowforge-run.bpmn
  elements:
    - Gw_Merge_Analyze
    - SubProcess_Analyze
    - SubProcess_Analyze_Start
    - SubProcess_Analyze_S1
    - SubProcess_Analyze_S2
    - SubProcess_Analyze_S3
    - SubProcess_Analyze_S4
    - SubProcess_Analyze_End
---

# BPMN → Agent Analysis

Input: a `.bpmn` the business user drew. Output: the **draft**
`generated/<workflow>/workflow-spec.yaml`, conforming to
`${CLAUDE_SKILL_DIR}/../flowforge-design/assets/workflow-spec.schema.yaml`. Record what is there, what is
missing and what can't be generated. Never decide how an element gets built (`kind`, `generatedPaths`,
`pattern` belong to `flowforge-design`). Never modify, move or rename the source `.bpmn`.

Ask every question through `AskUserQuestion`, in the user's language, with concrete options and a
recommendation.

## 1. Locate the source `.bpmn` and the target folder

Ask (or infer) which `.bpmn` to analyze and the workflow name: kebab-case, default the `.bpmn` basename;
when unambiguous, confirm instead of asking. Write only under `generated/<workflow>/`.

## 2. Validate structurally first

```bash
${CLAUDE_SKILL_DIR}/../bpmn-authoring/scripts/validate.sh <file>.bpmn
```

On failure, **stop**: name the failed stage (XSD / bpmn-moddle / bpmnlint, see
`${CLAUDE_SKILL_DIR}/../bpmn-authoring/references/validation.md`) and send the user to `bpmn-authoring`.
Always run it, even on a file you believe is clean: it fills the tool cache step 3 needs.

## 3. Inventory every element

```bash
node ${CLAUDE_SKILL_DIR}/scripts/inventory.mjs \
  "${BPMN_TOOLS_CACHE:-$HOME/.cache/bpmn-authoring-tools}" <file>.bpmn
```

It prints JSON: scopes with pattern-rubric signals, lanes, flow nodes, sequence flows, data objects and
associations, `dataStores[]` (parsed `Art:`/`Ort:`, readers, writers), `processIO` (workflow input and
output), annotations, `meta.sha256` and `findings[]`. Save it to a scratch file for later steps. How to
read role hints, task types, annotations, data stores and process input/output:
`references/conventions.md`. What each `unresolved` finding means and its rewrite suggestion:
`references/unsupported.md`.

## 4. Flag unsupported elements

Present every `severity: "unresolved"` finding in plain language, quoting the BPMN label verbatim, with
the rewrite suggestion from `references/unsupported.md`, and ask: change the diagram, or keep it as an
open gap? For example:

> Your diagram has a timer on "Wartezeit prüfen". I can't turn a clock-based wait into a Claude
> agent yet. I'd suggest "try up to 3 times" (a retry cap) instead. Change the diagram, or note it
> as an open gap and move on?

- User will rewrite the `.bpmn` (in `bpmn-authoring`): tell them to re-run this skill afterwards; don't
  wait in-session unless they say so.
- User proceeds as-is: the element gets `kind: unresolved` with `reason` = the rewrite suggestion, plus
  an `openQuestions[]` entry (step 6).

## 5. Interview about gaps — nothing else

Ask only about these gaps; never about generation decisions or elements without a gap:

- **No role**: no lane and no role hint (`sdlc:step` extension or `Rolle:` documentation). Ask which
  role it belongs to.
- **`documentation-role-fallback` finding**: confirm the actual role name (it becomes a `roles.<id>`
  key); don't derive an id from the raw string.
- **`gateway-without-default` finding**: ask which outgoing branch is the normal one (context for
  design's pattern choice).
- **Untyped `task`** (`bpmn:Task`): ask whether it is a human, agent or script step; record the answer
  as a note (rename to a typed task in `bpmn-authoring`). Don't write a `kind`.
- **Unclear multi-instance collection**: `multiInstance.collectionHint` is `null` or came only from an
  annotation/name pattern. Ask what the collection is (e.g. "one per epic").
- **`store-missing-art-ort` finding**: no readable `Art:` or `Ort:` line. Ask for the missing value as
  concrete options (the three Arts; the Orts valid for the Art, see the matrix in
  `references/conventions.md`), recommending what the store's name and readers suggest.
- **`store-invalid-art-ort` finding**: offer both repairs, a valid Ort for that Art or a different Art
  for that Ort (e.g. `gedächtnis` + `mcp:` becomes `live` + `mcp:` or `gedächtnis` + `datei:`), with a
  recommendation.
- **`memory-store-incomplete` finding**: a `gedächtnis` store needs a writing `serviceTask` and a reader.
  Ask which task writes or reads it (options: the diagram's tasks), or whether it is really
  `wissen`/`live`.
- **`store-without-associations` finding**: ask which task reads or writes it, or whether to drop it.
- **Several `processIO.inputs[]` or `outputs[]`**: ask which is the workflow's real input/result
  (`workflowIO` holds one each); the others stay plain artifacts.
- **Every unresolved finding from step 4.**

Answer a store gap in the spec only: record `art`/`ort` as confirmed and tell the user to fix the
`Art:`/`Ort:` lines in the `.bpmn` (in `bpmn-authoring`) so diagram and spec stay in sync.

## 6. Write the spec draft

Write (or merge, step 7) `generated/<workflow>/workflow-spec.yaml`:

- **`meta`**: `workflowName`, `sourceBpmn.path`/`sha256` (inventory `meta.sha256`), `language` (the
  user's), `generatorVersion`, `created`/`updated`, and `outputLayout: claude-dir` on every new spec.
  On a re-run keep the existing value; a spec without the field is on the legacy layout.
- **`roles`**: one per lane (or confirmed documentation-fallback role): `bpmnLaneId`, `label` (verbatim
  lane name), `agentName` guessed as `{workflow}-{role}` for design to confirm. Leave
  `modelTier`/`tools` unset.
- **`elements`**: one per flow node: `bpmnType`, `label` (verbatim), `lane` (resolved role id, if any),
  `kind: unresolved` as placeholder for all. `reason`: the rewrite suggestion for unsupported
  constructs (step 4), otherwise `"Not yet mapped — pending flowforge-design."`. `inputs`/`outputs`
  from data associations, referencing `artifacts.<id>`; inputs `required: true` unless the user said
  otherwise.
- **`artifacts`**: one per `dataObject`/`dataObjectReference`, kebab-case id from its name.
  `pathPattern` defaults to `generated/<workflow>/artifacts/<id>/{id}.md`. `producer`/`consumers` from
  associations; `producer` is an array when more than one element has a real `dataOutputAssociation`
  into it (all are producers, not consumers).
- **`contextSources`**: one per `dataStores[]` entry, as the schema defines it. Id = kebab-case of the
  store name; `name` verbatim; `bpmnElement` = the reference id; `art` and `ort` (`{type, ref}`) as parsed
  or confirmed in step 5; `readers`/`writers` from the inventory (only the store's arrows decide read
  vs. write). Leave `tools` and `memory` unset (design resolves them). Each store also gets
  `elements.<storeRefId>` (`bpmnType: dataStoreReference`, `label` verbatim, `kind: context-source` as a
  proposal).
- **`workflowIO`**: from `processIO`. `input.artifact`/`output.artifact` = the artifact id of the chosen
  entry. A real `dataInput`/`dataOutput` gets its own `artifacts.<id>` (kebab-case of its name; `producer`
  unset for an input, `consumers`/`producer` from `readers`/`writers`) and `elements.<id>` (`bpmnType:
  dataInput|dataOutput`, `kind: workflow-input|workflow-output`). A convention entry is an ordinary data
  object artifact; its `elements.<refId>` gets `kind: workflow-input|workflow-output` instead of
  `artifact-contract`. For a real input, `input.required` = its name as a camelCase field (`Ticket-ID`
  becomes `ticketId`); for a convention input leave it unset. Omit `workflowIO` when `processIO` is empty.
- **`pattern`**, **`knowledge`**: leave unset (design and knowledge own them).
- **`openQuestions`**: one per gap from steps 4–5 the user deferred, keys `elementId`, `question`,
  `answer`. Record the user's answer when given; `answer: null` when deferred.

Validate the spec, reading only the spec-schema section of the output (other categories may fail this
early):

```bash
node ${CLAUDE_SKILL_DIR}/../flowforge-verify/scripts/verify.mjs \
  "${BPMN_TOOLS_CACHE:-$HOME/.cache/bpmn-authoring-tools}" generated/<workflow>
```

Fix schema errors before finishing; a non-conforming spec blocks every later stage.

## 7. Re-runs: diff by element, ask only about what changed

If the spec already exists:

1. Compare its `meta.sourceBpmn.sha256` with the inventory's `meta.sha256`. Equal: tell the user
   nothing changed and stop (or confirm they meant to re-run).
2. Otherwise diff by element id: `flowNodes`/`dataObjects`/`dataStores`/`processIO`/`lanes` vs. the
   spec's `elements`/`artifacts`/`contextSources`/`workflowIO`/`roles`, comparing `bpmnType`, `label`,
   `lane`, `documentation`, `multiInstance`, `eventDefinitions`; for a store also `art`, `ort`,
   `readers`, `writers`. Classify each id as new, changed, removed or unchanged.
3. Interview (step 5) only new and changed elements with a gap. Never touch an unchanged element's
   `kind`/`reason`/`generatedPaths` or other later-stage decisions.
4. Removed elements: flag them to the user; don't delete without confirmation, especially roles,
   artifacts or stores still referenced (`elements.*.lane`, `artifacts.*.producer`/`consumers`,
   `workflowIO`).
5. Update `meta.sourceBpmn.sha256` and `meta.updated`; merge into the existing file instead of
   rewriting it, so untouched sections stay byte-identical.
