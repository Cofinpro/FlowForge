---
name: bpmn2agent-analyze
description: Reads a hand-drawn BPMN diagram and turns it into the first draft of generated/<workflow>/workflow-spec.yaml — the first step of the bpmn-to-agentic-workflow pipeline (analyze → knowledge → design → generate → verify). Validates the .bpmn (bpmn-authoring), inventories every element with bpmn-moddle, flags BPMN constructs this pipeline can't generate from yet (pools/message flows, timer/message events, event sub-processes, compensation) and suggests a rewrite, then interviews the business user in plain language — via AskUserQuestion, options + a recommendation — about gaps only (missing roles, unclear multi-instance collections, unsupported constructs). Re-running it on a changed .bpmn diffs by element id (sha256 + element-level comparison) and asks only about what's new or changed. Never mutates the author's .bpmn. Use right after a business person has drawn or updated a workflow diagram and wants it turned into Claude agents/skills, before bpmn2agent-knowledge.
bpmn:
  file: docs/planning/bpmn-to-agentic-workflow.bpmn
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

First step of the `bpmn-to-agentic-workflow` pipeline. Input is a `.bpmn` file the business user
drew (with `bpmn-authoring`, ideally using lanes — see
`bpmn-authoring/references/modelling-rules.md`). Output is
`generated/<workflow>/workflow-spec.yaml` — a **draft**: structurally complete against
`bpmn2agent-design/assets/workflow-spec.schema.yaml`, but with every element's actual generation
decision (`kind`, `generatedPaths`, the orchestration `pattern`) left for `bpmn2agent-design` to
fill in after knowledge grounding. This skill only reads the `.bpmn`; it never edits it, and it
never decides how an element gets built — it decides what's *there*, what's *missing*, and what
this pipeline flatly can't generate from yet.

## 1. Locate the source `.bpmn` and the target folder

Ask (or infer from context) which `.bpmn` file to analyze and what the workflow should be called.
The workflow name is kebab-case and becomes the `<workflow>` segment of
`generated/<workflow>/workflow-spec.yaml` — default it to the `.bpmn` file's own basename
(kebab-cased) and confirm rather than asking outright when it's unambiguous. Everything this skill
writes lives under `generated/<workflow>/`; the source `.bpmn` stays wherever the user put it
(e.g. `docs/planning/*.bpmn`) and is **never** modified, moved, or renamed by this skill.

## 2. Validate structurally first

```bash
${CLAUDE_SKILL_DIR}/../bpmn-authoring/scripts/validate.sh <file>.bpmn
```

If this fails, **stop** — tell the user which stage failed (XSD / bpmn-moddle / bpmnlint, see
`bpmn-authoring/references/validation.md`'s typical-errors table) and point them at
`bpmn-authoring` to fix it first. Don't attempt inventory/analysis on a file that doesn't parse
cleanly; every finding downstream would be noise on top of a real structural problem. This step
also populates the tool cache (`${BPMN_TOOLS_CACHE:-$HOME/.cache/bpmn-authoring-tools}`) that step 3
needs — always run it, even on a file you're fairly sure is already clean.

## 3. Inventory every element

```bash
node ${CLAUDE_SKILL_DIR}/scripts/inventory.mjs \
  "${BPMN_TOOLS_CACHE:-$HOME/.cache/bpmn-authoring-tools}" <file>.bpmn
```

Prints a JSON inventory to stdout: every process/subProcess scope (with computed
`pattern-rubric.md` signals — `humanTaskCount`, `parallelCount`, `multiInstanceCount`, `loopCount`,
`judgementBranchCount`, `attended`), every lane, every flow node (lane, scope, documentation, role
hint, multi-instance info, boundary events, event definitions), every sequence flow, every data
object/reference + data association, every text annotation, and a `findings[]` list. Read
`references/conventions.md` for exactly how role hints, task types and annotations are read, and
`references/unsupported.md` for what each `unresolved`-severity finding means and what rewrite to
suggest. Save the JSON to a scratch file — you'll need it across the rest of this procedure, not
just once.

## 4. Flag unsupported elements

Every finding with `severity: "unresolved"` in the inventory is a construct this pipeline's v1
can't generate from (see `references/unsupported.md` for the full list and why: pools + message
flows, timer/message events, event sub-processes, compensation). Present each one to the business
user in plain language, quoting the BPMN element's own label verbatim, e.g.:

> Your diagram has a timer on "Wartezeit prüfen" — a fixed waiting period. I can't turn a real
> clock-based wait into a working Claude agent yet. I'd suggest modelling it as "try up to 3
> times" instead (a retry cap) rather than a real timer. Want to change the diagram, or should I
> note this as an open gap for now and move on?

Record the outcome either way: if the user will rewrite the `.bpmn` themselves (in
`bpmn-authoring`, outside this skill), tell them to re-run this skill afterwards — don't wait for
them to do it in-session unless they say so. If they want to proceed as-is, this element gets
`kind: unresolved` in the spec draft (step 6) with `reason` set to the concrete rewrite suggestion,
plus an `openQuestions[]` entry.

## 5. Interview about gaps — nothing else

Ask about genuine gaps only, never about generation decisions (that's `bpmn2agent-design`'s job,
after knowledge grounding). A "gap" is one of:

- **An element without a role** — no lane, and no role hint from either the `sdlc:step`
  extension or a `Rolle:` documentation fallback (see `references/conventions.md`). Ask which
  role/agent it belongs to.
- **A `documentation-role-fallback` finding** — the scope has no lanes; a role hint exists but is
  freeform text. Confirm the actual role name (it becomes a `roles.<id>` key) rather than
  guessing a kebab-case id from the raw string.
- **A forking gateway without a default flow** (`gateway-without-default` finding) — ask which
  outgoing branch is the "normal"/expected one; this becomes useful context for
  `bpmn2agent-design`'s pattern choice even though analysis doesn't set `pattern` itself.
- **An ambiguous plain `task`** (untyped, i.e. `bpmnType: "bpmn:Task"`) — BPMN's untyped task
  doesn't say whether it's a human step, an agent step or a script. Ask; record the answer as a
  note the user can act on (rename it to a typed task in `bpmn-authoring`) rather than silently
  assuming — do not write a `kind` decision here either way (see step 6).
- **An unclear multi-instance collection** — `multiInstance.collectionHint` is `null`, or came
  only from an annotation/name-pattern guess rather than a structured extension or formal
  `loopCardinality`/`loopDataInputRef`. Ask what the actual collection is (e.g. "one per epic",
  "one per story needing rework").
- **Every unresolved (unsupported) finding from step 4.**

Every question uses `AskUserQuestion` with concrete options plus a clear recommendation — never a
bare open-ended prompt — per the pipeline's business-language framing rule. Do **not** ask about
elements with no gap (a laned, named, typed task with a clear role needs no question at all) —
asking about everything defeats the point of "gaps only" and trains the user to stop reading the
questions.

## 6. Write the spec draft

Write (or refresh — see step 7) `generated/<workflow>/workflow-spec.yaml`, conforming to
`bpmn2agent-design/assets/workflow-spec.schema.yaml`. What analysis is responsible for filling in:

- **`meta`** — `workflowName`, `sourceBpmn.path`/`sha256` (from the inventory's `meta.sha256`),
  `language` (the user's language, from the interview), `generatorVersion` (this skill family's
  version), `created`/`updated` timestamps, and `outputLayout: claude-dir` for every new spec
  (installable files under `generated/<workflow>/.claude/`). On a re-run keep whatever the spec
  already has; a spec without the field is on the legacy layout.
- **`roles`** — one entry per lane (or per resolved documentation-fallback role from step 5),
  `bpmnLaneId`, `label` (verbatim lane name), `agentName` left as a reasonable kebab-case guess
  (`{workflow}-{role}`) for `bpmn2agent-design` to confirm or rename. Leave `modelTier`/`tools`
  unset — that's a deployment decision, not analysis's call.
- **`elements`** — one entry per flow node from the inventory: `bpmnType`, `label` (verbatim BPMN
  name), `lane` (the resolved role id, if any). Set **`kind: unresolved`** for every element as a
  placeholder — analysis never assigns skill/script/hook/orchestrator/human-checkpoint/etc.,
  that's `bpmn2agent-design`'s mapping-rubric decision made after knowledge grounding. Use
  `reason` to say *why* it's still unresolved:
  - For a genuinely unsupported construct (step 4): the concrete rewrite suggestion from
    `references/unsupported.md`.
  - For everything else: `"Not yet mapped — pending bpmn2agent-design."`
  Populate `inputs`/`outputs` from data associations the inventory found (`dataInputAssociation`/
  `dataOutputAssociation`), referencing `artifacts.<id>` entries created in the next bullet;
  `required: true` by default on inputs unless the user said otherwise in step 5.
- **`artifacts`** — one entry per `dataObject`/`dataObjectReference` the inventory found, keyed by
  a kebab-case id derived from its name. `pathPattern` defaults to
  `generated/<workflow>/artifacts/<id>/{id}.md` (a placeholder `bpmn2agent-generate` can refine);
  `producer`/`consumers` from the resolved data associations — `producer` is a single element id
  for the common case, or an array when more than one element has a real `dataOutputAssociation`
  into the same data object (e.g. a draft written by one element, then overwritten/confirmed by
  another — both writes are real, neither is a "consumer").
- **`pattern`** — leave unset entirely (it's optional in the schema); `bpmn2agent-design` sets it
  from the signals this step already computed and stored in the inventory (don't recompute them,
  and don't guess the pattern here).
- **`knowledge`** — leave unset; `bpmn2agent-knowledge` (the very next pipeline step) owns this
  section.
- **`openQuestions`** — one entry per unresolved gap from step 5 the user asked to defer, with
  their actual answer recorded in `answer` when they gave one (not left as `"pending"` unless they
  explicitly deferred it).

Validate the written file against the schema before finishing (e.g. an ad-hoc `ajv` check — see
`bpmn2agent-design/assets/workflow-spec.schema.yaml`'s own definitions for the exact shape); a spec
that doesn't conform blocks every later pipeline step, not just this one. `ajv`/`ajv-formats`/
`js-yaml` live in `${BPMN_TOOLS_CACHE:-$HOME/.cache/bpmn-authoring-tools}/node_modules/` —
`bpmn2agent-verify/scripts/verify.mjs` installs them there on first use (same cache, same
install-if-missing approach step 2's `validate.sh` already uses) and resolves them via
`createRequire` against `<cacheDir>/package.json`; reuse that pattern rather than installing
anything globally.

## 7. Re-runs: diff by element, ask only about what changed

If `generated/<workflow>/workflow-spec.yaml` already exists, this is a re-run against a possibly
updated `.bpmn`:

1. Read the existing spec's `meta.sourceBpmn.sha256`. Compare it against the fresh inventory's
   `meta.sha256` (from step 3). If they match, the `.bpmn` hasn't changed at all since the last
   run — nothing to do; tell the user and stop (or proceed straight to confirming with them
   whether they actually meant to re-run).
2. If the hash differs, diff **by element id**: for every id in the new inventory's `flowNodes` /
   `dataObjects` / `lanes`, check whether it existed in the old spec's `elements/roles/artifacts`
   maps and, if so, whether anything analysis reads has changed (`bpmnType`, `label`, `lane`,
   `documentation`, `multiInstance`, `eventDefinitions` — the fields this skill itself derives
   values from). Classify each id as **new**, **changed**, **removed**, or **unchanged**.
3. Only run step 5's interview for **new** and **changed** elements with an actual gap. Leave
   every **unchanged** element's existing `kind`/`reason`/`generatedPaths`/etc. exactly as
   `bpmn2agent-design`/`-generate` last set them — re-running analysis must never revert a later
   stage's decisions on elements that didn't change.
4. For **removed** elements (present in the old spec, absent from the new inventory), flag them to
   the user rather than silently deleting — a role or artifact something else in the spec still
   references (`elements.*.lane`, `artifacts.*.producer`/`consumers`) shouldn't disappear without
   confirmation.
5. Update `meta.sourceBpmn.sha256` and `meta.updated`; merge the new/changed element data into the
   existing file rather than rewriting it from scratch, so untouched sections survive byte-for-byte
   where possible (easier to review in a diff).

## Reference files

- `references/conventions.md` — the input contract: lane vs. documentation-fallback role
  resolution and its priority order, what each task type means, how annotations are read as hints
  (never as structure), and what analysis deliberately leaves for later pipeline steps.
- `references/unsupported.md` — the v1 unsupported-construct list (pools/message flows,
  timer/message events, event sub-processes, compensation), why each is unsupported, its detection
  signal in `inventory.mjs`, and the concrete rewrite suggestion to offer.

## Scripts

- `scripts/inventory.mjs` — `node scripts/inventory.mjs <cacheDir> <file.bpmn>`, prints the JSON
  inventory described in step 3 to stdout. Read-only; resolves `bpmn-moddle` via `createRequire`
  against `<cacheDir>/package.json`, same approach as
  `bpmn-authoring/scripts/check-moddle.mjs` — run `bpmn-authoring/scripts/validate.sh` first so
  the cache actually has `bpmn-moddle` installed.
