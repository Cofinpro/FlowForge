# Validation pipeline

English distillation of `docs/planning/bpmn-referenz.md` §5, with the exact commands this skill's
`scripts/validate.sh` runs. Nothing here gets added to the repo's own `package.json`/CI — all tools
are fetched on demand into an out-of-repo cache (`${BPMN_TOOLS_CACHE:-$HOME/.cache/bpmn-authoring-
tools}`), per the phase-refinement plan's CI-cost constraint.

## Pipeline order

1. **XSD schema validation (`xmllint`)** — structure, element order, required attributes, duplicate
   IDs. Catches: unknown elements/typos, wrong child order (artifacts before flow elements, `category`
   inside `process`), missing required attributes (`targetNamespace`, `sourceRef`), duplicate IDs,
   invalid NCName IDs, a missing `targetRef` on `dataInputAssociation`. Does **not** catch: dangling
   ID references (a `targetRef` to a non-existent ID still "validates"), inconsistent
   `incoming`/`outgoing`, any modelling/semantic rule, missing DI.

   ```bash
   XSD_DIR="${BPMN_TOOLS_CACHE:-$HOME/.cache/bpmn-authoring-tools}/xsd"
   mkdir -p "$XSD_DIR"
   for f in BPMN20 Semantic BPMNDI DC DI; do
     [ -f "$XSD_DIR/$f.xsd" ] || curl -fsSL -o "$XSD_DIR/$f.xsd" "https://www.omg.org/spec/BPMN/20100501/$f.xsd"
   done
   xmllint --noout --schema "$XSD_DIR/BPMN20.xsd" <file>.bpmn
   ```

   (The five XSD files import each other via relative `schemaLocation`, so they must stay together in
   one directory. They're cached, never committed.)

2. **bpmn-moddle parse warnings** — catches dangling references (which xmllint misses), duplicate IDs,
   unparsable elements. Does not catch wrong child order. `bpmn-moddle` has no CLI, so it's invoked as
   a library from a small script (`scripts/check-moddle.mjs`) against a cached `node_modules`:

   ```bash
   CACHE="${BPMN_TOOLS_CACHE:-$HOME/.cache/bpmn-authoring-tools}"
   mkdir -p "$CACHE" && cd "$CACHE"
   [ -f package.json ] || npm init -y >/dev/null
   [ -d node_modules/bpmn-moddle ] || npm install --no-audit --no-fund --silent bpmn-moddle bpmnlint
   node <path-to-skill>/scripts/check-moddle.mjs "$CACHE" <file>.bpmn
   ```

   `check-moddle.mjs` resolves `bpmn-moddle` via `createRequire(path.join(cacheDir, 'package.json'))`
   rather than a bare `import` — Node's ESM resolver ignores `NODE_PATH`, so a bare import from outside
   the cache directory would fail even with the package installed there. `createRequire` walks up from
   `cacheDir/package.json` using normal CommonJS `node_modules` resolution, which finds it.

3. **bpmnlint** (`bpmnlint:recommended`, zero warnings) — modelling rules and DI presence, including
   the parse-warning coverage from step 2 (bpmnlint treats any moddle import warning as an error, so
   step 2 is somewhat redundant with this step but cheap and worth keeping for a clearer error message
   when it's *only* a moddle-level problem).

   ```bash
   "$CACHE/node_modules/.bin/bpmnlint" -c <skill>/assets/.bpmnlintrc <file>.bpmn
   ```

   `assets/.bpmnlintrc` for this skill:
   ```json
   { "extends": "bpmnlint:recommended" }
   ```

   Relevant rules in `bpmn:recommended` v11.14.0 (see `docs/planning/bpmn-referenz.md` §5b for the
   full table): `no-bpmndi`, `no-disconnected`, `no-implicit-start`/`-end`, `no-implicit-split`,
   `single-blank-start-event`, `sub-process-blank-start-event`, `end-event-required`/
   `start-event-required` (checked per scope — every sub-process needs its own), `label-required`,
   `fake-join` (warn), `superfluous-gateway` (warn), `no-overlapping-elements` (warn).

   `validate.sh` also installs `playwright` into the same cache directory alongside
   `bpmn-moddle`/`bpmnlint`, even though only step 4 (rendering) needs it — one cache setup path
   is simpler than two. Run `npx playwright install chromium` once if step 4's browser itself
   isn't installed yet (that binary lives in Playwright's own cache, not this skill's).

4. **Render check** — opening the file is the ultimate render test. `scripts/render.mjs` (optional,
   needs a headless browser — see `playwright-skill` if puppeteer/playwright isn't already available)
   loads each `BPMNPlane` (top-level and every collapsed sub-process) via `bpmn-js` and screenshots it.
   If headless rendering isn't available, open the file in https://demo.bpmn.io/ manually — paste the
   XML, it does not need to be uploaded anywhere sensitive since these are internal process diagrams.

## Running it

```bash
.agents/skills/bpmn-authoring/scripts/validate.sh docs/planning/product-vision-to-user-stories.bpmn
```

Exits non-zero on the first failing stage and prints that stage's output; a stage is only run once the
previous one is clean, since a structural XSD failure makes moddle/bpmnlint output noise.

## Typical errors and fixes

| Symptom | Likely cause | Fix |
|---|---|---|
| xmllint: element X not expected | wrong child order | check `xml-and-di.md`'s element order (flow elements before artifacts) |
| xmllint: duplicate ID | copy-pasted a block without renaming IDs | rename per the `<ParentTaskId>_<suffix>` convention |
| moddle: unresolved reference | a flow/association points at an ID that doesn't exist yet, or a rename missed a reference | grep the old ID across the file — `sourceRef`, `targetRef`, `bpmnElement`, `dataObjectRef` |
| bpmnlint `no-bpmndi` | added a semantic element without its DI shape/edge | every element added to `process`/`subProcess` needs a matching `BPMNShape`/`BPMNEdge` in its plane |
| bpmnlint `sub-process-blank-start-event` / `single-blank-start-event` | refined a task into a subProcess but forgot the inner start event, or added a second one | exactly one blank `startEvent` per sub-process/process scope |
| bpmnlint `no-implicit-start`/`-end` | a node has no incoming or no outgoing flow and isn't a start/end event | either it's missing a flow, or it should be a start/end event |
| bpmnlint `label-required` | a new task, event, forking gateway or conditional flow has no `name` | name it per `modelling-rules.md`'s naming convention |
| bpmnlint `fake-join` (warn) | a loop-back or merge was wired as two incoming flows into an ordinary task | insert an explicit XOR merge gateway before it |
| Renders but shapes overlap | coordinate arithmetic mistake | recheck against `layout.md`'s grid, especially after inserting a new element mid-row (every shape after it needs its x shifted) |
