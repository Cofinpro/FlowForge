# Layout conventions (grid & coordinates)

DI is hand-laid on the grid below (`bpmn-auto-layout` can't produce drill-down planes).

Sizes and why: `xml-and-di.md`, "Standard sizes".

## Top-level plane grid

- **Main row**: `y=330` is the vertical centre of the happy path; centre every shape on it (events
  36×36 at `y=312`, gateways 50×50 at `y=305`, collapsed sub-processes 100×80 at `y=290`, tasks
  140×100 at `y=280`).
- **Horizontal spacing**: ~50px gap between adjacent shapes' borders (edge waypoints span exactly the
  gap). x grows left→right in happy-path order; no fixed column width.
- **Loop-back edges**: route below the main row (e.g. dip to `y=470` for a loop spanning ~800px) so
  they never cross the happy path. Label the loop-back edge at its lowest waypoint.
- **Data objects**: `y=170`, height 50, centred above the task that outputs them; labels above them.
  Input associations from an earlier data object route via a waypoint at `y=195` before dropping into
  the consuming task's top edge.
- **Data stores** (`dataStoreReference`, 50×50): below the task row, inside the lane of their first
  reader, ~60px under the task bottom, label beside or below the store. Read arrows run straight up
  into the task's bottom edge. A store that is also written later gets its write arrow routed in a
  channel below the stores (own `y` per store, ~25px apart) so no two arrows cross; with lanes, put
  the lane that the happy path leaves and re-enters above the other, so the vertical hops do not
  cross those channels. Several stores under one task sit side by side.
- **Process input/output** (`dataInput`/`dataOutput`, 36×50): the input left of the start event, the
  output right of the end event, both in the data-object band above the task row (`y=170`, or the
  lane's top band). Route the input's association along `y≈195` into the first consuming task's top
  edge; route the output's association over the tasks between its producer and the end.
- **Groups (phase bands)**: `y=40`, `height=500`, from just left of the phase's first task to just
  right of its last, ~30–40px padding; label bounds inside the top of the band.
- New elements extend this row; never start a second main row.

## Child plane grid (inside a collapsed sub-process)

Each child plane is an independent coordinate space; don't reuse the parent's coordinates.

- **Origin**: start event at `x=60, y=202` (centre `y=220`).
- **Steps**: 140×100 tasks at `y=170` (centre `y=220`), each starting ~200px after the previous
  one's left edge (60px gap; widen it if a flow needs a label).
- **Internal gateway**: 50×50 at `y=195` after the last step. If the plane has no internal check, go
  straight from the last step to the end event.
- **Loop-back**: dips below the row (`y=380`–`420`, deeper for wider spans; with an external gateway
  label below, start the first loop-back at `gateway_bottom + label_height + 20`). It re-enters through
  a merge gateway before the step it returns to (see `modelling-rules.md`).
- **End event(s)**: 36×36 at `y=202` after the gateway's "yes" branch. A second named end (e.g.
  "verworfen") goes on its own branch above or below the row, whichever keeps edges from crossing.
- **Width**: keep one row and let the plane go wide (6+ steps ≈ 1500px and more); never wrap into a
  second row or compress below the 50px minimum gap.
- **Lanes** (agent-bound diagrams, see `modelling-rules.md`): lane bands start at `x=160`, 150px
  tall, stacked without gap, spanning the widest row plus ~40px margin, in the order the happy path
  visits them top-to-bottom where possible. Shift the grid right to make room for the lane label
  (start event at `x=200`) and centre each shape vertically in its lane's band.

## General

- Never let two shapes' bounding boxes overlap (`no-overlapping-elements` is a warning; treat it as
  an error). When in doubt, add horizontal space rather than stacking vertically.
- Several loop-backs in one plane (e.g. a three-outcome gateway with two targets): sort them by
  horizontal span; the shortest runs closest to the row, longer ones further below — same at the top
  level and in child planes.
- Escape every name/label/condition for XML (`&` → `&amp;`, `"`, `<`, `>`) — German labels often
  contain `&`, and an unescaped one fails xmllint with `xmlParseEntityRef: no name`. When generating
  XML from a script, escape once, centrally.
- Most planes that validate but look wrong have a coordinate slip: an off gap after inserting a
  shape mid-row (shift every shape after it), or a waypoint that doesn't touch its shape's border.
