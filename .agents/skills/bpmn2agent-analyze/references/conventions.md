# Input contract: how a BPMN diagram maps to roles and hints

What `bpmn2agent-analyze` (and `inventory.mjs`) assumes about a `.bpmn`. Analysis never rewrites
the source `.bpmn` to conform.

## Lane = role/agent (primary)

One pool/process with a `laneSet`; each lane becomes a role (`roles.<id>` in `workflow-spec.yaml`).
It becomes a subagent file only under the orchestrator-agent pattern (or a mixed phase using it),
decided by `bpmn2agent-design`. A collapsed sub-process may have its **own** `laneSet` in its
drill-down plane; those lanes are role assignments scoped to that sub-process only.
`flowNodes[].lane` is the lane id from `flowNodeRef`, or `null` if the scope has no `laneSet`.

A scope with a `laneSet` must place every flow node in a lane; otherwise `inventory.mjs` emits an
`element-without-lane` warning. Ask the business user which role those belong to before writing the
spec.

## `<documentation>` role fallback (for scopes with no lanes at all)

For a scope with **no** `laneSet`, the role hint per element comes from, in this order:

1. **`sdlc:step agentRole="…"` extension element** — structured and unambiguous; preferred.
2. **`Rolle: X` in `<bpmn:documentation>`** — free text (`Rolle: … Input: … Output: …`); only when
   there is no extension element.

`extractRoleHint()` implements this order. Role hints in a lane-less scope surface as a
`documentation-role-fallback` info finding (an accepted input shape, not a problem). The inventory
never resolves hints into `roles.*`; the interview does.

On **every** element, laned or not, read `Input: … Output: …` in `<bpmn:documentation>` as a hint
for `elements.<id>.inputs`/`outputs` wiring.

## Task-type meanings

How analysis reads each type (the generation decision per type is design's `mapping-rubric.md`):

| BPMN type | Read as |
|---|---|
| `task` (untyped) | Ambiguous. Ask whether it is a human, agent or script step; don't guess. |
| `userTask` / `manualTask` | A human checkpoint — someone must look at something and decide/confirm before the process continues. |
| `serviceTask` | LLM/agent work — something an agent does on the process's behalf, not a human and not a deterministic script. |
| `scriptTask` | A deterministic script step — no judgement involved, same input always produces the same output. |
| `businessRuleTask` | A deterministic check/decision against a rule (a threshold, a policy lookup) — still not a human, still not free-form LLM judgement. |
| `callActivity` | A call to a reusable, separately-defined process (`calledElement` points at another top-level `bpmn:Process`) — analyzed as its own root scope, independently of where it's called from. |
| Collapsed `subProcess` | A phase with its own inner detail — both a flow node in the parent scope *and* its own nested scope, walked recursively. |

## Annotations as hints, never as structure

Annotations carry no flow or role information. `inventory.mjs` reads them only as the last-resort
multi-instance collection hint. `extractCollectionHint()` order: `sdlc:collection` extension →
formal `loopCardinality`/`loopDataInputRef` → name pattern ("per X": `je`/`pro`/`jede(r/n/s)`,
`for each`) → associated annotation text. Treat an annotation-derived hint as unconfirmed: ask for
the actual collection instead of writing the annotation text into `collection.ref`.

## Left to `bpmn2agent-design`

- skill vs. agent-checklist item per `serviceTask` (mapping rubric);
- the orchestration pattern — `inventory.mjs` only computes the pattern-rubric signals;
- deterministic vs. judgement gateways — `evaluateGateway()` is a heuristic feeding
  `judgementBranchCount`; design confirms borderline cases.
