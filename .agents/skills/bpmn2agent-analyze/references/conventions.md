# Input contract: how a BPMN diagram maps to roles and hints

What `bpmn2agent-analyze` (and `inventory.mjs`) assumes about a `.bpmn` file before it can be
turned into agents/skills. This is the "light conventions" side of the plan's settled input
contract — kept intentionally small so a business person's diagram, drawn with `bpmn-authoring`,
needs no special ceremony to be analyzable. Everything here is read-only: analysis never rewrites
the source `.bpmn` to conform.

## Lane = role/agent (primary)

One pool/process with a `laneSet`; each lane becomes one entry in `workflow-spec.yaml`'s `roles`
map and, later, one generated subagent (`bpmn2agent-design`/`-generate`). A collapsed sub-process
may have its **own** `laneSet` in its drill-down plane — its lanes are separate role assignments,
scoped to that sub-process only (see `bpmn-authoring/references/xml-and-di.md`'s lane section).
`inventory.mjs` records this straightforwardly: `flowNodes[].lane` is the lane id a node's
`flowNodeRef` places it in, or `null` if the enclosing scope has no `laneSet` at all.

A scope that declares a `laneSet` is expected to place **every** flow node in some lane.
`inventory.mjs` flags a scope-level `element-without-lane` warning finding when lanes exist but
some elements aren't assigned — ask the business user which role those belong to before writing
the spec.

## `<documentation>` role fallback (for scopes with no lanes at all)

A scope with **no** `laneSet` (a purely descriptive diagram, or one not yet updated to lanes) has
no structural way to say "who does this." Two fallbacks, checked in this order per element:

1. **`sdlc:step agentRole="…"` extension element** — the structured, machine-readable form (the
   dark-factory `sdlc:` vocabulary this whole family's spec schema is derived from). Preferred
   when present because it's unambiguous and was very likely written by a previous run of this
   same pipeline or a compatible generator.
2. **`Rolle: X` in `<bpmn:documentation>`** — free text, matching `bpmn-authoring`'s older
   descriptive-diagram convention (`Rolle: … Input: … Output: …`). Last resort: only consulted
   when there's no extension element to read instead.

`inventory.mjs`'s `extractRoleHint()` implements exactly this order. When a lane-less scope has
elements with a role hint from either source, the scope-level `documentation-role-fallback` info
finding surfaces them (not a warning — this is an accepted, if lower-fidelity, input shape, not a
problem). `bpmn2agent-analyze`'s interview step is where a role hint becomes an actual role/agent
assignment — the inventory only surfaces raw hints, never resolves them into `roles.*`.

Regardless of lanes vs. documentation-fallback, `Input: … Output: …` text in
`<bpmn:documentation>` stays useful on **every** element (laned or not) as a hint towards
`elements.<id>.inputs`/`outputs` artifact wiring — read it even when the role itself came from a
lane.

## Task-type meanings

The BPMN task type is the primary signal for what an element becomes; `mapping-rubric.md` (in
`bpmn2agent-design`) has the authoritative generation decision per type, but the *reading* of each
type — what `bpmn2agent-analyze` should understand when it sees one — is:

| BPMN type | Read as |
|---|---|
| `task` (untyped) | Ambiguous — same as a purely descriptive diagram's plain task. Ask the business user what it actually is (human step, automated step, script) during the interview; don't guess. |
| `userTask` / `manualTask` | A human checkpoint — someone must look at something and decide/confirm before the process continues. |
| `serviceTask` | LLM/agent work — something an agent does on the process's behalf, not a human and not a deterministic script. |
| `scriptTask` | A deterministic script step — no judgement involved, same input always produces the same output. |
| `businessRuleTask` | A deterministic check/decision against a rule (a threshold, a policy lookup) — still not a human, still not free-form LLM judgement. |
| `callActivity` | A call to a reusable, separately-defined process (`calledElement` points at another top-level `bpmn:Process`) — analyzed as its own root scope, independently of where it's called from. |
| Collapsed `subProcess` | A phase with its own inner detail — both a flow node in the parent scope *and* its own nested scope, walked recursively. |

## Annotations as hints, never as structure

`bpmn:textAnnotation` (+ its `bpmn:association` to the element it's attached to) never carries
control flow or role information on its own — per `bpmn-authoring/references/modelling-rules.md`,
artifacts have no flow semantics. `inventory.mjs` still reads them for one specific purpose: as a
**hint of last resort** for a multi-instance collection when neither the extension element nor a
formal `loopCardinality`/`loopDataInputRef` is present, and the element's own name doesn't already
say "per X" (German: `je`/`pro`/`jede(r/n/s)`, English: `for each`). See
`extractCollectionHint()`'s priority order: structured `sdlc:collection` extension → formal MI
expression → name pattern → associated annotation text. Treat an annotation-derived collection hint
as unconfirmed — ask the business user to state the actual collection during the interview rather
than writing the annotation text straight into the spec's `collection.ref`.

## What analysis does *not* try to infer

- **Which `serviceTask`s become a skill vs. an agent-checklist item** — that's
  `mapping-rubric.md`'s call, made by `bpmn2agent-design` after knowledge grounding, not analysis.
- **The orchestration pattern** — `pattern-rubric.md`'s signals (`humanTaskCount`,
  `parallelCount`, `multiInstanceCount`, `loopCount`, `judgementBranchCount`, `attended`) are
  *computed* by `inventory.mjs` per scope (and aggregated), matching that rubric's signal
  definitions exactly — but the pattern choice itself is `bpmn2agent-design`'s decision, confirmed
  with the user. Analysis only supplies the numbers.
- **Whether a gateway condition is deterministic or needs judgement** — `inventory.mjs` applies a
  best-effort heuristic (`evaluateGateway()`: a formal `conditionExpression`, or condition/flow
  text matching a threshold pattern, counts as deterministic; anything else is flagged as needing
  case-by-case judgement) to feed `pattern-rubric.md`'s `judgementBranchCount` signal — it is not
  a final answer, and `bpmn2agent-design` still confirms borderline cases with the user.
