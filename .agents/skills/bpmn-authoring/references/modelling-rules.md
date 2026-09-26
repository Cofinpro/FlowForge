# Modelling rules and best practices

English distillation of `docs/planning/bpmn-referenz.md` §4. Consult that file directly for edge
cases.

## Hard rules (spec / XSD / engines)

1. **Sequence flows stay inside one scope**: they can cross neither a sub-process boundary (attach to
   the sub-process shape itself, or use boundary events) nor a pool boundary (use message flows for
   that). Both `sourceRef` and `targetRef` must live in the same `process`/`subProcess` element as the
   flow.
2. **Data associations are not sequence flows**: no tokens, not in `incoming`/`outgoing`, never routed
   as control flow into an event/gateway.
3. **Message flows only between pools** (or between elements of different pools), never within one
   pool.
4. Boundary events have no incoming flows; start events have no incoming; end events have no outgoing.
5. Outgoing flows of a parallel gateway carry no conditions; outgoing flows of an event-based gateway
   carry no conditions and lead to catch events/receive tasks.
6. Artifacts (group, annotation, association) and lanes have **no flow semantics**.

## Best practices (bpmn.io / Camunda / "BPMN Method & Style")

- **Explicit gateways**: model every split and every join with a gateway. **Loops**: route the
  back-edge into an explicit **XOR merge gateway** placed before the loop's first task, rather than
  giving that task two incoming flows (`fake-join`). Merge alternative paths with XOR, synchronize
  parallel paths with AND — matching the split type.
- **Split and merge are separate gateways** (never one gateway with n-in and n-out).
- **One blank start and at least one end event** per process and per embedded sub-process; no implicit
  start/end (nodes with no incoming/outgoing). One end event per distinct outcome is fine and improves
  readability; name end events after the resulting state.
- **Naming**: tasks = verb + object ("Entwurf prüfen", "Rechnung senden"); events = object + past
  participle / state ("Rechnung erhalten", "Entwurf genehmigt"); XOR/OR gateways = a question ("Entwurf
  genehmigt?"); their outgoing flows = the answers ("ja"/"nein", "> 1000 EUR"); parallel and merging
  gateways stay unnamed. `label-required` expects names on tasks, events, forking XOR/OR gateways,
  conditional flows, pools and lanes; `superfluous-label` flags names on unconditional flows that
  don't leave an XOR/OR split and aren't default flows.
- **Pools/lanes**: pool = organization/system with its own process; lane = a role within it. Every
  flow node in exactly one lane, via `flowNodeRef`. **Default for a workflow meant to be turned
  into agents** (input to the `bpmn2agent-*` family): one pool/process with a `laneSet`, lane =
  role/agent, including inside a collapsed sub-process's own drill-down plane (see
  `xml-and-di.md`'s lane section for the XML/DI and what's been tested to render). For a purely
  descriptive diagram with no agent-generation intent, keep the older convention instead: roles in
  `<bpmn:documentation>`, no lane shapes.
- **Groups** only for visual grouping ("Review phase"); they never change behavior and must not stand
  in for sub-processes.
- Avoid inclusive/complex gateways and `terminateEndEvent` unless the semantics are genuinely needed.
- Keep models readable: flow left to right, happy path on a straight line, no overlapping shapes
  (`no-overlapping-elements`), standard sizes.

## Loops, specifically

A loop-back always re-enters through a dedicated XOR **merge** gateway that sits *before* the first
task of the loop body, with two incoming flows (the initial entry, and the loop-back) and one
outgoing flow into the first task. The gateway that *decides* to loop is a separate, later XOR
**split** gateway with a question name and named outgoing flows (one of them `default`). This
diagram's existing pattern (`Gateway_Merge_Research` / `Gateway_Validiert`, `Gateway_Merge_Refinement`
/ `Gateway_Ready`) is the template — reuse it for every new loop, at both the top level and inside
sub-process child planes.

## Naming this diagram's German labels

Existing convention (keep it): task names are `<n>.<m> Verb + Objekt`; gateway names are a yes/no
question ending in `?`; the "yes" outgoing flow is named `Ja (…)`, the loop-back flow is named
`Nein (…)`. Inner sub-process steps follow the same verb+object task naming without a number prefix
(the parent already carries the `<n>.<m>`).
