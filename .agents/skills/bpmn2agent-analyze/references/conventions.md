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

## Data stores = context sources

Every durable source is a `bpmn:DataStoreReference` (cylinder, name = the business data set, e.g.
"Jira-Tickets Projekt LANE", not the system). The visible reference carries the documentation; the root
`bpmn:DataStore` is unnamed, so `inventory.mjs` reads `Art:`/`Ort:` from the reference. Two lines:

```
Art: wissen | live | gedächtnis
Ort: notebook:<Titel> | mcp:<Server> | cli:<Befehl> | <URL> | datei:<Pfad> | websearch
```

`Art` is normalised for the spec (`gedächtnis` becomes `gedaechtnis`); `Ort` becomes `{type, ref}`
(`ref` omitted for `websearch`; a URL keeps the whole URL as `ref`). Task documentation uses `Quelle:`
for provenance, which is why the store location is `Ort:`. Several stores may share one `Ort:`.

**Arrow direction is the only access rule**: store → task (`dataInputAssociation`) = read, task → store
(`dataOutputAssociation`) = write; there is no access line. An association on a `subProcess` counts for
the sub-process element. Stores are not flow nodes: no lane, no sequence flow.

### Art × Ort

| Art | Valid Ort type |
|---|---|
| `wissen` | `notebook`, URL, `datei`, `websearch`, `mcp` |
| `live` | `mcp`, `cli`, `notebook`, URL, `datei` |
| `gedaechtnis` | `datei` |

Anything else is a `store-invalid-art-ort` finding (e.g. `live` + `websearch`, `wissen` + `cli`,
`gedächtnis` + `mcp`). Further store findings, all `warning`: `store-missing-art-ort` (a line is missing or
unparseable, details in `dataStores[].problems`), `memory-store-incomplete` (a `gedaechtnis` store needs a
writing `serviceTask` and a reader), `store-without-associations`. They are questions for the user; the
inventory never repairs a store. Whether a write into a `live` store has a `userTask` in front of it is
checked by `bpmn2agent-verify`, not here.

## Process input and output

`inventory.mjs` reports the workflow's input and output in `processIO.inputs[]`/`outputs[]`, each entry
tagged `source: ioSpecification | convention`. Only the top-level workflow process counts, not
sub-processes and not a process some `callActivity` calls.

1. **Real**: a process-wide `bpmn:ioSpecification` (first child of the `process`) with `dataInput` /
   `dataOutput`. Readers/writers come from the data associations whose `sourceRef` (input) or `targetRef`
   (output) is that element. bpmn.io has no palette entry for these, so they only exist through XML.
2. **Convention**: an input is a data object reference that no activity produces and some activity reads;
   an output is one that is produced and nobody reads. It only applies when the process draws at least one
   data-object read; a diagram with output associations only has no "nobody reads" signal and yields none.

A diagram may mix both. When several entries qualify, the user picks the real input/result in the
interview; `workflowIO` holds one of each.

## Left to `bpmn2agent-design`

- skill vs. agent-checklist item per `serviceTask` (mapping rubric);
- the orchestration pattern — `inventory.mjs` only computes the pattern-rubric signals;
- tool lists and placement for `live` stores, the memory path/cap for `gedaechtnis` stores;
- deterministic vs. judgement gateways — `evaluateGateway()` is a heuristic feeding
  `judgementBranchCount`; design confirms borderline cases.
