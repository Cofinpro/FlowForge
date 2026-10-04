---
name: bpmn2agent-verify
description: Statically checks a generated/<workflow>/ output (spec schema, source .bpmn, trace both ways, lint, no red in the mapping view), explains failures in business language and routes each fix to bpmn2agent-analyze, -design or -generate. Use after bpmn2agent-generate, or as a health check on existing output. Read-only; the quality review of generated files belongs to bpmn2agent-generate.
bpmn:
  file: docs/planning/bpmn-to-agentic-workflow.bpmn
  elements:
    - Task_Verify
    - Gw_VerifyPassed
---

# BPMN → Agent Verification

Input: a `generated/<workflow>/` that `bpmn2agent-generate` wrote (fully, partly, or before the
`.bpmn` changed). This skill never edits anything; it says what is wrong, where the fix belongs, and
re-checks after the fix. Ask every question via `AskUserQuestion` with options and a
recommendation, in the user's language.

## 1. Run `verify.mjs`

```bash
node ${CLAUDE_SKILL_DIR}/scripts/verify.mjs \
  "${BPMN_TOOLS_CACHE:-$HOME/.cache/bpmn-authoring-tools}" \
  generated/<workflow>
```

Run it from the directory that contains `generated/` (the cwd the pipeline started in); it
resolves `spec.meta.sourceBpmn.path` against the cwd. Exit `0` → step 4. Otherwise at least one
category has a `FAIL`; continue to step 2. `--json` replaces the text report with structured output.

Categories, in run order:

1. **spec-schema** — `workflow-spec.yaml` parses and matches `bpmn2agent-design/assets/workflow-spec.schema.yaml`.
2. **source-bpmn** — recorded `sha256` matches the `.bpmn` on disk, which still passes `validate.sh`.
3. **element-to-artifact** — every element/lane has a spec entry; every `generatedPaths` entry exists.
4. **artifact-to-element** — every file has a correct `bpmn:` header and is claimed by an element,
   bundled in a recorded skill/agent directory, listed in `knowledge.refs`, or is the one
   orchestration file for `pattern.chosen`, or a context hook
   (`.claude/hooks/<workflow>-write-guard.mjs` / `-memory-cap.mjs`) that a store in `contextSources`
   needs: a live store with write tools, a memory store.
5. **lint** — scripts pass `node --check`; Workflow script `meta` is a literal and its body parses;
   `.claude/settings.json` registers exactly the `.claude/hooks/` scripts; installables sit inside
   `.claude/`, with no npm imports or `package.json` there (legacy layout: each hook
   `*.settings.json` parses and pairs with its script).
6. **no-red** — no `kind: unresolved`, no `openQuestions[]` with `answer: null`, and
   `mapping/workflow-mapped.bpmn` (if rendered) validates.

Plus **context-sources**, run after element-to-artifact and only when the diagram has data stores or
a process `dataInput`/`dataOutput`, or the spec has `contextSources`/`workflowIO` (otherwise absent,
output unchanged). Each finding ends with `[fix in bpmn2agent-<route>]`:

- every store and every real (`ioSpecification`) process input/output has an `elements.<id>` entry
  (`context-source` / `workflow-input` / `workflow-output`) and a `contextSources` entry /
  `workflowIO` → design; a data object that only looks like an input or output by convention needs
  one only if it is the one the user picked, the rest stay plain artifacts
- `contextSources.*.readers`/`writers` (and `art`, `ort.type`) match the diagram's arrows → analyze (stale spec)
- **write guard:** a task writing into a `live` store needs a `userTask` on **every** path from the
  start (loops and sub-processes included: a loop's first pass must be guarded too) → analyze,
  the diagram changes; verify never edits the `.bpmn`
- a live-store write inside a `workflow-script` phase (`pattern.chosen` or a `mixed` phase) → design
- `tools: unresolved` → design (warning)
- a `gedaechtnis` store without writer or reader in the spec → analyze

## 2. Translate and route

Translate each finding into business language, keeping the element label and file path. Group by
where the fix belongs, not by category:

| Route | When | Example |
|---|---|---|
| `bpmn2agent-design` | the spec is wrong or inconsistent with what was confirmed | `kind` without `reason`, bad `generatedPaths` prefix, unknown `producer`/`consumers` id, `unresolved` element not meant to stay open, open question the user can now answer, store or process input/output without `elements`/`contextSources`/`workflowIO` entry, live-store write in a workflow-script phase, `tools: unresolved` (warning) |
| `bpmn2agent-generate` | the spec is fine, the files don't match or don't parse | missing file, missing/wrong `bpmn:` header, unregistered hook, npm import, failing `node --check`, non-literal Workflow `meta`, orphan file (remove it; if it is real output, its element's `generatedPaths` must name it → design) |
| `bpmn2agent-analyze` | the diagram changed or is invalid | `sha256` mismatch, `validate.sh` failure on the source `.bpmn`, `contextSources` readers/writers out of date, live-store write without a `userTask` on every path (draw an approval step), memory store without writer or reader |

Sample phrasing: *"The plan for '<label>' says X, but that doesn't add up because Y — re-do the
mapping for just this part?"*

Surface `WARN` findings too (e.g. a spec element with no current BPMN node usually means the
`.bpmn` was edited without re-running analyze); they don't fail the run.

Generate-routed findings: hand them to `bpmn2agent-generate` without asking and report afterwards.
Design- and analyze-routed findings: ask once, one batched `AskUserQuestion` per verify pass.

## 3. Loop

After the upstream skill reports its fix, re-run step 1 in full — a spec change can ripple into
files not yet regenerated. Repeat until exit `0`, at most 3 verify rounds per pipeline run. At the
cap, or when the same finding (category + file) returns unchanged twice, stop and ask: send the
remaining findings to design, change the diagram (loop A), or accept a handoff marked
**unverified** with the findings listed. Never report success at the cap.

## 4. Handoff

When green: workflow name, pattern, one-line count per category (e.g. "6/6 green: schema, source
.bpmn, 8 elements traced, 12 files traced, 6 scripts linted, no open items"). Point at `README.md`
and `mapping/report.md` (plus `mapping/index.html` if rendered).

## Scripts and fixtures

- `scripts/verify.mjs <cacheDir> <generated/<workflow>> [--json]` — read-only, exit `0` iff no
  `fail` finding. Read its header comment before changing it.
- `fixtures/approval-flow.bpmn` — smoke-test diagram.
- `fixtures/context-flow.bpmn` — one store per Art, a guarded live write, process input/output;
  `context-flow-unguarded.bpmn` is the same without the approval step (verify must report the write guard).
