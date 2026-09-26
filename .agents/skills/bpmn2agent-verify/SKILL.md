---
name: bpmn2agent-verify
description: Statically verifies a bpmn2agent-generate output — spec-schema validity, the source .bpmn's sha256 and structural validity, the element<->artifact trace in both directions, lint (frontmatter/JSON/scripts/Workflow-script), and "no red in the map" — the sixth and last step of the bpmn-to-agentic-workflow pipeline (analyze → knowledge → design → generate → verify). Runs scripts/verify.mjs, translates every failure into plain business language, and routes the fix to the right upstream skill (a spec/mapping problem back to bpmn2agent-design, a missing/broken generated file back to bpmn2agent-generate, a genuine BPMN problem back to bpmn2agent-analyze), then re-runs until the report is green. Use right after bpmn2agent-generate has written generated/<workflow>/, or any time an existing generated/<workflow>/ needs a health check.
bpmn:
  file: docs/planning/bpmn-to-agentic-workflow.bpmn
  elements:
    - Task_Verify
    - Gw_VerifyPassed
---

# BPMN → Agent Verification

Sixth and last step of the `bpmn-to-agentic-workflow` pipeline. Input is a `generated/<workflow>/`
directory `bpmn2agent-generate` wrote (or partially wrote, or wrote a while ago and the `.bpmn`
since changed). This skill never edits anything — it's read-only, same as `bpmn2agent-analyze`.
Its whole job is to say, precisely, what's wrong and where the fix belongs, then confirm the fix
actually worked by re-running.

## 1. Run `verify.mjs`

```bash
node ${CLAUDE_SKILL_DIR}/scripts/verify.mjs \
  "${BPMN_TOOLS_CACHE:-$HOME/.cache/bpmn-authoring-tools}" \
  generated/<workflow>
```

Run it from the repo root (it resolves `spec.meta.sourceBpmn.path` against `cwd`, same convention
`bpmn2agent-generate/scripts/render-mapping.mjs` uses). Exit code `0` means every check category
passed — nothing further to do here; go straight to step 4's handoff. Any other exit code means at
least one category has a `FAIL` finding; read the report (it's already grouped into six named
categories, each finding a one-line, file-and-reason message) and continue to step 2.

Add `--json` when you need the structured form (e.g. to hand a specific finding list to another
skill run in the same session) — it replaces the human-readable report, it doesn't add to it.

The six categories, in the order they run and print:

1. **spec-schema** — does `workflow-spec.yaml` even parse and validate against
   `bpmn2agent-design/assets/workflow-spec.schema.yaml`?
2. **source-bpmn** — does the recorded `sha256` still match the `.bpmn` on disk, and does that
   `.bpmn` still pass `bpmn-authoring/scripts/validate.sh`?
3. **element-to-artifact** — does every BPMN element/lane have a spec entry, and does every
   `generatedPaths` entry the spec promises actually exist on disk?
4. **artifact-to-element** — does every file actually on disk carry a correct `bpmn:` header, and
   is every file explainable (claimed by an element, bundled inside a recorded skill/agent
   directory, listed in `knowledge.refs` — for `generated/<workflow>/knowledge/*.md` — or the one
   legitimate top-level orchestration file, matched by its expected `pattern.chosen` path)?
5. **lint** — does every plain script/hook `.mjs` pass `node --check`; does a Workflow script's
   `meta` literal and wrapped body parse? For `outputLayout: claude-dir` also: does
   `.claude/settings.json` parse and register exactly the scripts in `.claude/hooks/`; is every
   installable file inside `.claude/`; does no script under `.claude/` import an npm package (and
   is there no `package.json` there)? Legacy layout: does every hook `*.settings.json` parse and
   pair with its script?
6. **no-red** — no `kind: unresolved` element, no unanswered `openQuestions[]`, and (if rendered)
   `mapping/workflow-mapped.bpmn` itself still validates.

## 2. Translate failures into business language, and route each one

Never hand the user the raw finding text as the whole answer — translate it, but keep the concrete
detail (element label, file path) so they can act on it without re-reading the JSON. Group by where
the fix actually belongs, not by which category found it (a `spec-schema` failure and an
`element-to-artifact` failure can both be the same underlying spec problem):

- **Spec / mapping problem → `bpmn2agent-design`.** The spec itself is wrong, incomplete, or
  inconsistent with what was confirmed: schema violations, a `kind` with no `reason`, a
  `generatedPaths` entry that doesn't start with the expected `generated/<workflow>/` prefix, an
  artifact `producer`/`consumers` pointing at an unknown element id, a `kind: unresolved` element
  that was never actually meant to stay open, an unanswered `openQuestions[]` entry the business
  user is now ready to answer. Phrase it as: *"The plan for '<element label>' says X, but that
  doesn't add up because Y — should I send this back to re-do the mapping for just this part?"*
- **Missing/bad generated file → `bpmn2agent-generate`.** The spec's decisions are fine, but what
  was actually written doesn't match them or doesn't parse: a `generatedPaths` entry that's missing
  on disk, a file with no `bpmn:` header (or one that doesn't parse), a header naming the wrong
  source file, a header missing an element the spec says it should cover, a `settings.json` that
  doesn't register a hook script (or a legacy hook `*.settings.json` with no paired script), a
  script that imports an npm package, a script/hook that fails `node --check`,
  a Workflow script whose `meta` isn't a pure literal or whose body doesn't parse once wrapped.
  Phrase it as: *"'<file path>' should exist/parse/say X but doesn't — this needs re-generating,
  not re-planning."*
- **Orphan file, not traceable to the spec at all → `bpmn2agent-generate`** too (same bucket): a
  file present on disk that's neither an element's own `generatedPaths` entry, nor bundled inside a
  recorded skill/agent directory, nor the one allowed top-level orchestration file. Say plainly that
  this looks like a leftover/stray file from a previous or partial run and should be removed (or, if
  it was meant to be real output, its owning element's `generatedPaths` needs to name it — a
  `bpmn2agent-design` fix instead).
- **Genuine BPMN problem → `bpmn2agent-analyze`.** The `source-bpmn` category's `sha256` mismatch
  (the diagram changed since the spec was last generated — analyze re-runs its element-by-element
  diff and only asks about what's new) or a `validate.sh` failure on the source `.bpmn` itself
  (the diagram doesn't even parse/lint cleanly any more). Phrase it as: *"Your diagram changed (or
  has a structural problem) since this was last generated — let's re-run the analysis step first."*

A `WARN`-level finding (e.g. `element-to-artifact`'s "spec.elements.X doesn't correspond to any
current BPMN flow node") doesn't block the exit code, but still surface it — it's usually a sign the
`.bpmn` was edited without re-running `bpmn2agent-analyze` first, which is worth flagging even if it
isn't fatal today.

## 3. Loop

After routing, the actual fix happens in whichever upstream skill step 2 named (this skill never
edits `generated/<workflow>/` or the spec itself). Once that skill reports it's done, re-run step 1
from scratch — don't assume the fix only touched the one finding you sent it for; a spec/mapping
change can ripple into files `bpmn2agent-generate` hasn't re-written yet. Repeat until the exit code
is `0`.

If a fix loop keeps bouncing between skills without converging (e.g. design and generate disagree
about who owns a decision), stop looping and say so explicitly to the user rather than silently
retrying — that's a pipeline design gap worth surfacing, not something to paper over.

**Advisory quality review.** `verify.mjs` proves structure, not whether a skill or agent will work
well. Once it is green, and if `bpmn2agent-generate` didn't already run it for this generation,
delegate `generated/<workflow>/` to the `agentic-artifact-reviewer` agent. Route its `high`
findings like step 2 (`generate` → `bpmn2agent-generate`, `design` → `bpmn2agent-design`) and
re-run step 1 after the fix; list `medium`/`low` findings in the handoff. The review never turns a
green `verify.mjs` result red on its own.

## 4. Handoff

Once green: report the workflow name, the pattern used, and a one-line count per category (e.g.
"6/6 checks green: schema, source .bpmn, 8 elements traced, 12 files traced, 6 scripts linted, no
open items"). Point at `README.md` for install instructions and `mapping/report.md` (plus
`mapping/index.html` if rendered) as the human-readable trace, exactly as `bpmn2agent-generate`'s
own handoff does — this skill's job was only to confirm those are trustworthy, not to repeat their
content.

## Scripts

- `scripts/verify.mjs` — `node scripts/verify.mjs <cacheDir> <generated/<workflow>/ dir> [--json]`,
  read-only, exit `0` iff every check category has zero `fail`-level findings. Installs
  `ajv`/`ajv-formats`/`js-yaml` into `<cacheDir>` on first use (same cache, same
  install-if-missing approach as `bpmn-authoring/scripts/validate.sh`); reuses
  `bpmn2agent-analyze/scripts/inventory.mjs` for the authoritative BPMN element list and
  `bpmn-authoring/scripts/validate.sh` for structural `.bpmn` validity. The script's own header
  comment documents every judgement call in detail (the sha256-mismatch-is-a-hard-fail rationale,
  the top-level-orchestration-file detection heuristic, the shebang-then-header `.mjs` convention)
  — read it before changing behavior, not just this file.

## Fixtures

- `fixtures/approval-flow.bpmn` — the small smoke-test diagram (`docs/planning/...` plan's
  "Fixtures" decision) used to develop and exercise this skill: two lanes, a script/business-rule
  pair, a reusable skill with a rework loop back through a gateway, one human checkpoint. See
  `generated/approval-flow/` (once generated) for what a passing run of this whole pipeline
  produces from it.
