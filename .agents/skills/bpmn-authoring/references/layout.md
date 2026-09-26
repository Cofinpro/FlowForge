# Layout conventions (grid & coordinates)

This diagram's DI is hand-authored, not tool-generated. `bpmn-auto-layout` (npm) exists and can lay
out a DI-less semantic model, but as of this writing it targets a single flat plane with no documented
support for generating a *second* plane for a collapsed sub-process's drill-down — exactly what this
diagram needs throughout. Rather than spend the round-trip finding out whether it can be coerced into
that, this skill uses the grid below as the primary (not fallback) method: it's a direct continuation
of the coordinate conventions the original flat diagram already used, so it's a known quantity.
Re-evaluate `bpmn-auto-layout` if a future diagram is large/flat enough (no drill-down) that hand
layout stops being worth it.

## Top-level plane grid (unchanged from the original diagram)

- **Main row**: `y=330` is the vertical center of the happy path. Row 1 shapes align to this center:
  - Events (36×36): `y=312`
  - Gateways (50×50): `y=305`
  - Tasks / collapsed sub-processes (100×80, was 150×90 before drill-down): `y=285`
- **Horizontal spacing**: ~50px gap between adjacent shapes' borders (edge waypoints span exactly the
  gap). Column x-positions grow left→right in the order elements appear in the happy path; a gateway
  takes less width than a task, so exact x values are whatever keeps 50px gaps — don't force a fixed
  column width.
- **Loop-back edges**: route below the main row (e.g. dip to `y=470` for a loop spanning ~800px
  horizontally, matching the original `Flow_Nein_Research`/`Flow_Nein_Refinement` pattern) so they
  never cross the happy path. Label the loop-back edge at its lowest waypoint.
- **Data objects**: `y=170`, height 50, centered above the task that outputs them; their labels sit
  above them (`y` around 94–170 depending on label line count). Input associations from an earlier
  data object route via a waypoint at `y=195` before dropping into the consuming task at its top edge.
- **Groups (phase bands)**: `y=40`, `height=500`, spanning from just left of the first task in the
  phase to just right of the last, with ~30–40px padding on each side. Label bounds sit inside the top
  of the group band.
- **New elements added by the phase-refinement plan** (extra gateways, an intermediate milestone
  event, a 7th phase group) extend this same row and grid — do not start a second main row.

## Child plane grid (inside a collapsed sub-process)

Each child plane is an independent coordinate space — start fresh, don't try to reuse the parent's
absolute coordinates.

- **Origin**: start event at `x=60, y=200` (event 36×36, so center `y=218`).
- **Steps in sequence**: 100×80 tasks at `y=175` (center `y=215`, close enough to the start event's
  center — adjust ±10px only if a label collides), spaced so each new task starts ~150–180px after the
  previous one's left edge (100px width + 50–80px gap; widen the gap if a flow needs a label).
- **Internal gateway** (the "was this step good enough?" check): 50×50 at `y=190` after the last step.
- **Loop-back**: dips to `y=380`–`420` depending on the horizontal span, re-entering through a merge
  gateway placed just before the step the loop returns to (same pattern as the top level — see
  `modelling-rules.md`). If the loop returns to the very first step, place the merge gateway between
  the start event and that step instead of giving the step two incoming flows.
- **End event(s)**: 36×36 after the gateway's "yes" branch, `y=200`. A second named end (e.g. an
  explicit "verworfen"/abandoned outcome) goes on its own branch below or above the main row, whichever
  keeps edges from crossing.
- **Width budget**: 4 steps + 1 gateway + start/end ≈ 900–1000px total width, which every phase in
  this plan fits into with one row. If a future phase needs 6+ steps, wrap into a second row 250px
  below the first (top row left→right, drop down, continue left→right) rather than compressing spacing
  below the 50px minimum.
- **Lanes, when the diagram is agent-bound** (default — see `modelling-rules.md`): give the
  sub-process its own `laneSet`, one lane per role/agent, and shift the whole grid above right by
  ~140px to make room for the lane label column (start event at `x=200` instead of `x=60`). Stack
  lane bands full-width (spanning the same x-range as the widest row of shapes plus ~40px margin),
  ~130–150px tall each, in the order the happy path visits them top-to-bottom where that's
  possible. No participant/pool needed for this to render — see `xml-and-di.md`'s lane section.
  Keep `<bpmn:documentation>Input: … Output: …</bpmn:documentation>` on each step regardless; only
  the *role* moves into the lane. For a purely descriptive diagram (no agent-generation intent),
  skip lanes and keep role/input/output in `<bpmn:documentation>` only, as before.

## Learned from building `docs/planning/product-vision-to-user-stories.bpmn` (T4–T11 retro)

- **Widen step boxes.** 100×80 (the collapsed/standard size) clips German step names, which run
  long and compound (`"Geschäftsmodell-Hypothesen im Lean / Business Model Canvas abbilden"`).
  Child-plane step tasks should be **140×100**, not 100×80 — bpmn-js does not auto-grow a task
  shape to fit its label, it just clips. 100×80 stays correct for the *collapsed* sub-process
  shape at the top level (that one holds a short `<n>.<m> Verb + Objekt` name, which fits).
- **Widen gateway question labels too.** A forking gateway's question (e.g. `"Geschäftsmodell
  tragfähig & UVP klar?"`) wraps to 2–3 lines. Use a **160×42** external label box, not 140×28 —
  otherwise the wrapped text overflows the declared bounds and visually collides with whatever
  sits just below it (typically a loop-back lane). When a gateway has an external label below it,
  place the first loop lane at `gateway_bottom + label_height + 20`, not just `gateway_bottom +
  60` — the label needs room to actually clear before the lane starts.
- **Nested loop-back lanes, multiple per plane, work exactly like the top level's.** A
  three-outcome gateway (two different loop-back targets, e.g. "too big" → an earlier step,
  "too uncertain" → the immediately preceding step) needs two lanes: sort loop-back edges by
  horizontal span and assign the shortest span to the lane closest to the row, longer spans to
  lanes further below, same rule as the top-level Pivot/Iterieren nesting. This generalizes
  cleanly — implemented once in `scripts` (see the phase-refinement plan's generator scripts,
  not committed to this skill) and reused for every phase without rework.
- **A straight-flow sub-process (no internal gate) is a real, common case.** Not every phase has
  an internal check — some (this diagram's 5.2 and 7.1) are a plain `Start → S1..Sn → End` chain,
  because the review decision lives on a gateway elsewhere in the process. Don't force a gateway
  into a child plane that doesn't need one.
- **A phase with 6+ steps in one row gets wide (≈1500px) rather than wrapping.** That's an
  acceptable trade-off for a descriptive diagram meant to be read by drilling down one plane at a
  time (pan/zoom in bpmn.io) — row-wrapping logic was scoped out as not worth the added
  complexity. Revisit only if a future phase needs to be read at a glance without panning.
- **Escape every name/label/condition string for XML** (`&`, `"`, `<`, `>`) before writing it into
  an attribute or element text — German labels routinely contain `&` ("Empathy Maps & Problem
  Definition"), and an unescaped `&` fails xmllint with a cryptic `xmlParseEntityRef: no name`
  pointing at the character, not the source string. Do this once, centrally, not per call site.

## General

- Never let two shapes' bounding boxes overlap (`no-overlapping-elements` is a warning, not an error,
  but treat it as one).
- Keep every plane's shapes readable at 100% zoom without needing to guess overlap order — when in
  doubt, add horizontal space rather than vertical stacking, since BPMN reads left to right.
- After hand-editing coordinates, render the file (see `validation.md`) and eyeball it before moving
  on — coordinate arithmetic mistakes (off-by-one gaps, a waypoint that doesn't touch its shape's
  border) are the most common source of a plane that validates but looks wrong.
