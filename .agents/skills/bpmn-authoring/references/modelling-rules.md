# Modelling rules and best practices

## Hard rules (spec / XSD / engines)

1. **Sequence flows stay inside one scope**: they cross neither a sub-process boundary (attach to
   the sub-process shape itself, or use boundary events) nor a pool boundary (use message flows).
   `sourceRef` and `targetRef` live in the same `process`/`subProcess` element as the flow.
2. **Data associations are not sequence flows**: no tokens, not in `incoming`/`outgoing`, never routed
   as control flow into an event/gateway.
3. **Message flows only between pools**, never within one pool.
4. Boundary events have no incoming flows; start events have no incoming; end events have no outgoing.
5. Outgoing flows of a parallel gateway carry no conditions; outgoing flows of an event-based gateway
   carry no conditions and lead to catch events/receive tasks.
6. Artifacts (group, annotation, association) and lanes have **no flow semantics**.

## Best practices (bpmn.io / Camunda / "BPMN Method & Style")

- **Explicit gateways** for every split and every join. Merge alternative paths with XOR,
  synchronize parallel paths with AND — matching the split type.
- **Split and merge are separate gateways** (never one gateway with n-in and n-out).
- **One blank start and at least one end event** per process and per embedded sub-process; no implicit
  start/end (nodes with no incoming/outgoing). One end event per distinct outcome is fine; name end
  events after the resulting state.
- A sub-process without an internal check is a plain `Start → S1..Sn → End` chain; don't add a
  gateway it doesn't need.
- **Naming**: tasks = verb + object ("Entwurf prüfen"); events = object + past participle / state
  ("Entwurf genehmigt"); XOR/OR gateways = a question ("Entwurf genehmigt?"); their outgoing flows =
  the answers ("ja"/"nein", "> 1000 EUR"); parallel and merging gateways stay unnamed.
  `label-required` expects names on tasks, events, forking XOR/OR gateways, conditional flows, pools
  and lanes; `superfluous-label` flags names on unconditional flows that don't leave an XOR/OR split
  and aren't default flows.
- **Groups** only for visual grouping ("Review phase"); they never change behavior and must not stand
  in for sub-processes.
- Avoid inclusive/complex gateways and `terminateEndEvent` unless the semantics are genuinely needed.
- Flow left to right, happy path on a straight line, no overlapping shapes.

## Roles: lanes or documentation

Pool = organization/system with its own process; lane = a role within it.

- **Agent-bound diagram** (input, now or later, to `bpmn-to-agentic-workflow`): lanes are the
  default. One process with a `laneSet`, lane = role/agent, every flow node in exactly one lane via
  `flowNodeRef` — inside each collapsed sub-process's own plane too. No pool/participant needed.
- **Purely descriptive diagram**: no lanes; put `<bpmn:documentation>Rolle: … Input: … Output: …
  </bpmn:documentation>` on each task/step.
- Either way, keep `Input: … Output: …` in each step's `<bpmn:documentation>`; on a laned diagram
  only the role moves into the lane.

XML and DI: `xml-and-di.md` (lanes section); coordinates: `layout.md`.

## Loops

A loop-back always re-enters through a dedicated XOR **merge** gateway (`Merge_<X>`, or
`<ParentId>_Merge` inside a sub-process) placed *before* the loop body's first task: two incoming
flows (initial entry, loop-back), one outgoing flow into that task. The gateway that *decides* to
loop is a separate, later XOR **split** gateway after the body, with a question name and named
outgoing flows (one of them `default`). If the loop returns to the very first step of a sub-process,
the merge gateway sits between the start event and that step. Same pattern at the top level and
inside child planes; see `examples/dark-factory/product-vision-to-user-stories.bpmn` in this repo
for worked examples.

## German labels

When a diagram numbers its phases: task names are `<n>.<m> Verb + Objekt`; gateway names are a
yes/no question ending in `?`; the "yes" flow is named `Ja (…)`, the loop-back flow `Nein (…)`.
Inner sub-process steps use verb + object without a number prefix (the parent carries `<n>.<m>`).
