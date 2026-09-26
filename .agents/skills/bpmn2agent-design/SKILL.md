---
name: bpmn2agent-design
description: Applies the mapping rubric and pattern rubric to a knowledge-grounded BPMN workflow spec — the fourth step of the bpmn-to-agentic-workflow pipeline (analyze → knowledge → design → generate → verify). Makes a concrete generation decision (kind, target artifact path) for every element, picks the orchestration pattern (skill chain + hooks / Claude Code Workflow script / orchestrator agent / mixed) and explains it in the shape the diagram was drawn in, proposes roles (model tier + tools per lane, left unset unless it actually matters) and artifact contracts, then writes a plain-language mapping plan and gets the business user's confirmation via AskUserQuestion (options + recommendation). Never invents a mapping for something the BPMN itself can't support — an element that needs the diagram to change loops back to bpmn2agent-analyze instead of being silently redesigned. Writes the confirmed decisions into generated/<workflow>/workflow-spec.yaml. Use after bpmn2agent-knowledge has grounded the spec (or the user explicitly proceeded without grounding), before bpmn2agent-generate.
bpmn:
  file: docs/planning/bpmn-to-agentic-workflow.bpmn
  elements:
    - Gw_Merge_Design
    - Task_Design
    - UserTask_ConfirmMapping
    - Gw_MappingAccepted
---

# BPMN → Agent Design

Fourth step of the `bpmn-to-agentic-workflow` pipeline. Input is the spec `bpmn2agent-analyze`
drafted and `bpmn2agent-knowledge` enriched — every element still sits at `kind: unresolved`
except the ones analysis already flagged as genuinely unsupported constructs. This skill's whole
job is to turn every element into a real generation decision, pick how the pieces are orchestrated,
and get the business user to confirm the result in their own language before anything gets
generated. It never edits the `.bpmn` and never patches around a limitation the diagram itself
has — that always goes back to `bpmn2agent-analyze`.

## 1. Read the inputs

Read `generated/<workflow>/workflow-spec.yaml`. If it doesn't exist, **stop** and tell the user to
run `bpmn2agent-analyze` first. If `knowledge:` is absent from the spec entirely (not even a
`mode: unverified` note), stop and recommend running `bpmn2agent-knowledge` first — proceeding
ungrounded is the user's call, not a default; only skip it if they explicitly say so.

Re-run the inventory against the source BPMN to get the pattern-rubric signals (analysis computed
them but the spec schema has no field to persist them — see `assets/workflow-spec.schema.yaml`'s
`pattern` definition, which stores only the resulting choice):

```bash
node ${CLAUDE_SKILL_DIR}/../bpmn2agent-analyze/scripts/inventory.mjs \
  "${BPMN_TOOLS_CACHE:-$HOME/.cache/bpmn-authoring-tools}" <meta.sourceBpmn.path>
```

Compare the fresh `meta.sha256` against the spec's `meta.sourceBpmn.sha256`. A mismatch means the
`.bpmn` changed since analysis last ran against it — **stop** and tell the user to re-run
`bpmn2agent-analyze` first (it diffs by element id and re-interviews only what changed); designing
against a stale inventory risks silently mapping elements that no longer exist or missing new ones.
Keep the inventory's `scopes[].signals` and top-level `signals` (aggregate) — step 4 needs them.

## 2. Triage: don't redesign around a diagram limit

Before applying any rubric, sort the spec's `elements` into three groups:

- **Pending design** — `kind: unresolved`, `reason: "Not yet mapped — pending bpmn2agent-design."`
  This is the normal case; step 3 resolves these.
- **Deferred unsupported** — `kind: unresolved` with a *rewrite-suggestion* reason from analysis
  (pools/message flows, timer/message events, event sub-processes, compensation — see
  `bpmn2agent-analyze/references/unsupported.md`). The user saw this in analysis and chose to
  proceed anyway. Ask once more, now that the rest of the design is taking shape, whether they
  still want to leave it or would rather fix the diagram — construct-specific, e.g.:

  > Your diagram still has a real timer on "Wartezeit prüfen" that I can't generate a working
  > agent step for. I can (a) mark it as a known gap and design the rest of the workflow around
  > it, or (b) pause here so you can change the diagram in `bpmn-authoring` first — I'd
  > recommend (b) if this step matters for how the workflow actually runs.

  If they choose to fix the diagram, **stop the whole design pass** — don't half-apply the
  rubric to the rest of the elements first. Tell them to re-run `bpmn2agent-analyze` once the
  `.bpmn` is updated. If they confirm leaving it, resolve it to `kind: not-generated` (not
  `unresolved`) with the same reason text — it's now a deliberate, accepted gap (grey in the
  mapping view), not an open blocker (red). Leaving it `unresolved` would permanently block
  `bpmn2agent-verify`'s "no red in the map" check with no path to green short of editing the
  diagram, which defeats the point of letting the user accept a known gap.
- **Already decided** — a re-run of design on a spec that already has concrete `kind` values
  (from a previous design pass, now being refreshed because `bpmn2agent-knowledge` or the `.bpmn`
  changed). Leave these as-is unless the element itself is in the analyze diff's *new/changed*
  set — same non-regression rule `bpmn2agent-analyze` step 7 applies.

Everything from here on applies only to the "pending design" group (plus any "deferred
unsupported" elements the user just chose to keep as `not-generated`, which need no further rubric
work — the reason is already final).

## 3. Apply the mapping rubric to every remaining element

Load `references/mapping-rubric.md` now. For each element, follow its decision table and the four
per-construct sub-decisions (`serviceTask` → skill vs. checklist item, `businessRuleTask`/gateway
condition → hook vs. script, `callActivity`/subprocess → reusable skill vs. sub-workflow, and —
once a subProcess/callActivity resolves to **reusable skill** — its own inner flow nodes per
"Inner elements of a skill-backed subProcess/callActivity": they still get their own
`elements.<id>` entry, but their `kind`/`generatedPaths` fold into the container skill rather than
becoming separate top-level artifacts). Record, per element:

- `kind` — one of the schema's enum values.
- `generatedPaths` — repo-relative paths the chosen `kind` will produce (a skill directory, a
  script file inside its owning skill, a hook script, the agent-checklist section anchor). With
  `meta.outputLayout: claude-dir` they sit under `generated/<workflow>/.claude/` exactly as they
  will in the user's project: `.claude/skills/<name>/SKILL.md`, `.claude/skills/<name>/scripts/<x>.mjs`,
  `.claude/agents/<name>.md`, `.claude/hooks/<name>.mjs` (the hook's registration goes into the one
  `.claude/settings.json`, which no element claims). Leave empty for `kind: orchestrator`/`human-checkpoint` (control
  flow and interview steps live inside another element's generated file, not one of their own) and
  for `kind: not-generated`/`unresolved`.
- `reason` — required by the schema for `not-generated`/`unresolved`; write it so it reads
  sensibly in the mapping report (it surfaces verbatim as the grey/red annotation).
- `knowledge` — this is where analysis's and knowledge's outputs actually connect: neither prior
  step writes `elements.<id>.knowledge` itself (analysis leaves it unset, knowledge only writes the
  top-level `knowledge.notebooks`/`mode`/`refs`). Only fill this in for elements that could
  plausibly use domain grounding — `kind: skill`, `agent-checklist`, `human-checkpoint`, or `hook`;
  skip it (leave unset) for purely structural elements (`not-generated`, `orchestrator`,
  `artifact-contract`, `script` with no judgement content) where grounding wouldn't change
  anything. For each element it does apply to, set it from whichever of these applies: the notebook
  id(s) whose `mappedTo` includes this element or its lane; the `knowledge.refs` path for this
  element id, if one exists; otherwise the literal `"websearch"` or `"model-only"` per
  `knowledge.mode` (`unverified` → `"model-only"`). An in-scope element with genuinely no coverage
  gets an empty array, not a silently omitted field — that way a missing citation is visible in the
  mapping report rather than looking unconsidered.
- `gate` — when a `userTask` is a rubric/checklist checkpoint or a gateway closes a loop back over
  one, fill `gate.kind`/`criteria`/`maxLoops` from what the BPMN and the interview established (the
  loop's back-edge and any `openQuestions` answer about it). Not every element needs one — only
  where the mapping rubric's worked example pattern applies (a gate sits on the checkpoint task or
  the gateway that closes its loop, not on every element in between). **Tie-break**: when the
  checkpoint task directly precedes the gateway that closes its own loop (no element in between —
  `mapping-rubric.md`'s worked example, "Antrag genehmigen" → "Genehmigt?"), put `gate` on the
  **checkpoint task**, not the gateway — the task is what actually enforces `gate.criteria` via
  `AskUserQuestion`; the gateway is pure routing on the answer already given and never carries a
  `gate` of its own in that case. `maxLoops` default, absent a reason to pick something else: **3**
  (matches every worked example in `mapping-rubric.md`/`pattern-rubric.md`/`bpmn2agent-generate`'s
  own step 7) — use a different number only when the BPMN/interview gave one explicitly.
- `inputs`/`outputs` — carry forward from analysis; only add to them here if the rubric decision
  itself implies a new artifact (e.g. a `callActivity` promoted to sub-workflow gets its own
  intermediate artifacts).

Do **not** ask the user about individual rubric applications — the rubric is designed to be
mechanical once the gaps analysis/knowledge already asked about are filled in. Save every
uncertain call (rubric genuinely underdetermined, e.g. a `serviceTask` on the reuse/complexity
boundary) for the single mapping-plan confirmation in step 7 rather than a question per element.

## 4. Apply the pattern rubric

Load `references/pattern-rubric.md` now. Using the top-level `signals` from step 1's inventory,
walk the decision table to propose `pattern.chosen` for the whole workflow.

`inventory.mjs`'s `judgementGateways[]` is a heuristic, not a verdict — each entry carries its own
`looksDeterministic`/`reason` and says to confirm with the business user, so don't feed
`judgementBranchCount` into the decision table uncritically. Check whether the gateway is really an
LLM weighing a case, or just control flow evaluating the outcome of an immediately preceding human
checkpoint (`userTask`/`manualTask` with `kind: human-checkpoint`) — if a human already made the
call and the gateway only routes on what they answered, it doesn't count toward
`judgementBranchCount` for pattern purposes; recompute the signal with it excluded before consulting
the table. `mapping-rubric.md`'s worked example is exactly this shape (a "Genehmigt?" gateway right
after an approval `userTask`) and resolves to skill-chain-hooks, not orchestrator-agent, for that
reason.

For every element the mapping rubric flagged as a `callActivity`/subprocess **sub-workflow** (not a
plain reusable skill), repeat this per that scope's own `scopes[].signals` — its pattern is decided
and recorded independently, nested under the same `elements` map per the schema's note on
sub-workflows.

Write `pattern.rationale` in the business-facing phrasing the reference's "Explaining the choice"
section models — this is what gets shown to the user in step 7, not a technical justification.
Record at least one `alternativesConsidered` entry when the signals were close to another row in
the decision table (e.g. one judgement gateway in an otherwise-linear flow — explain briefly why
`mixed` wasn't worth it for a single decision point).

## 5. Propose roles: model tier + tools

For each `roles.<id>` entry, confirm or refine the `agentName` analysis guessed
(`{workflow}-{role}` kebab-case, no `-expert` suffix — see
`.agents/skills/new-agent/agent-template.md`'s naming convention). Leave `modelTier` and `tools`
**unset by default** — per the schema, model/tool choice is deployment config, not something the
BPMN dictates. Only propose a value, and only then ask about it, when something concrete makes it
matter:

- A lane's tasks are dominated by long-context synthesis or multi-source judgement calls (an
  `orchestrator` role, a `judgementBranchCount`-heavy lane) → worth asking if `opus`/`sonnet` should
  be pinned rather than left to inherit the session default.
- A lane's tasks are narrow, high-volume, and mechanical (e.g. every element maps to `script`/
  `hook`, no skills) → worth asking if `haiku` is enough.
- A `hook` needs a specific tool matcher, or a lane's skills need a tool restricted for safety
  (write access to a production artifact, an external API) → worth proposing a `tools:` allowlist.

Otherwise say nothing — don't manufacture a model/tools question for a lane where the default is
obviously fine; that trains the user to stop reading the questions, same rule analysis follows for
gaps.

While going through the lanes, apply `agent-authoring`'s "Should this be an agent at all?" and split
rule (`${CLAUDE_SKILL_DIR}/../agent-authoring/SKILL.md`). A lane whose tasks need clearly different tools or
permissions, or that spans unrelated domains, may really be two roles; that's a question for the
user in step 7 (the lane structure belongs to the diagram), not a split you make in the spec.

## 6. Define artifact contracts

For each `artifacts.<id>` entry (one per data object analysis found, plus any new ones step 3's
sub-workflow promotions introduced), confirm or fill in `pathPattern` and `frontmatter`. Base
`frontmatter` fields on what the artifact's `producer`/`consumers` actually need to track between
steps — at minimum a `status` field when the artifact crosses a `gate` or a loop back-edge (the
dark-factory frontmatter convention `pattern-rubric.md` generalises from,
`docs/planning/dark-factory-prozess-gedaechtnis.md` §11.2, is the template: `version`/`status` are
what make a re-run idempotent and a loop resumable without a separate `run.yaml`). Don't invent
frontmatter fields nothing downstream reads — every field should trace to a consumer's actual need.

## 6a. Check the orchestration against the knowledge base

Before writing the plan, run `orchestration-design`'s review mode
(`${CLAUDE_SKILL_DIR}/../orchestration-design/SKILL.md`) over the draft decisions from steps 3–6. It covers
what the two rubrics don't: handoff contracts, a checkpoint *before* every side-effecting or
outward-facing step, a defined outcome when a loop hits `maxLoops`, fallbacks, resume, and what
context each worker gets. For a larger diagram, delegate the review to the
`agentic-workflow-architect` agent instead (pass it the spec path, the draft plan and the `.bpmn`
path); it returns findings routed `design`, `bpmn` or `question`.

- `design` findings: fix them in steps 3–6 now.
- `bpmn` findings (e.g. an outward-facing task with no approval before it, a loop without an exit):
  offer them in step 7 as reasons for "the diagram itself needs to change" — never patch the
  diagram's structure in the spec.
- `question` findings: add them to `openQuestions` and surface them in step 7.

Design questions the rubrics leave open ("orchestrator agent or Workflow script here?", "does this
lane need its own model?") are answered from `${CLAUDE_SKILL_DIR}/../agentic-workflow-kb/` — FAQ first, then
its references — or by the `agentic-kb-librarian` agent, which also asks the "Agentic Workflows"
notebook and records the answer when the knowledge base has none. Quote the citation tag when a
recommendation to the user rests on it.

## 7. Write the mapping plan and confirm

Write a short, plain-language mapping plan — the user's language (`meta.language`), business
wording, not YAML or BPMN terminology. Structure it by lane/role, then by element within it, e.g.:

> **Sachbearbeiter** (dein Prüf-Schritt)
> - "Risikobewertung erstellen" → wird eine wiederverwendbare Fähigkeit mit eigener Vorlage
>   (`risk-assessment`).
> - "Antrag genehmigen" → wird ein Prüfpunkt, an dem ich dich frage, bevor es weitergeht.
> - Entscheidung "Genehmigt?" → steuert, ob es weitergeht oder zur Risikobewertung zurückgeht
>   (maximal 3 Durchläufe, danach gehe ich mit einem Risikohinweis weiter).
>
> Insgesamt baue ich das als eine Abfolge von Checklisten, die an deinem Prüfpunkt pausiert
> (siehe Begründung oben) — kein separates Steuerprogramm nötig.

Include the pattern choice and rationale from step 4, any proposed model/tools from step 5 that you
actually surfaced, and every `not-generated`/`unresolved` element with its reason in plain terms.

Confirm via `AskUserQuestion` with concrete options and a recommendation — never a bare "does this
look right?". At minimum offer:

- **Accept as proposed** (recommend this when nothing is `unresolved` and no rubric call in step 3
  was genuinely uncertain).
- **Adjust specific elements** — collect which ones and how, then redo the affected parts of steps
  3–6 for just those elements before re-confirming.
- **The diagram itself needs to change** — stop here, same rule as step 2: point the user at
  `bpmn-authoring` to edit the `.bpmn`, then `bpmn2agent-analyze` to re-run. Do not try to
  approximate the requested change inside the spec instead of the diagram.

If step 4's pattern choice or any step 5 model/tools question wasn't already confirmed inline when
raised, fold it into this same confirmation rather than a separate round — one plan, one
confirmation, unless the user's answer to it reopens a specific element (loop back into "adjust
specific elements").

## 8. Write the confirmed spec

Only after confirmation, write the decisions from steps 2–6 into
`generated/<workflow>/workflow-spec.yaml`: every element's `kind`/`generatedPaths`/`reason`/
`knowledge`/`gate`, `roles.*.modelTier`/`tools` where set, `artifacts.*`, and `pattern`. Update
`meta.updated`. Validate the written file against `assets/workflow-spec.schema.yaml` before
finishing (e.g. an ad-hoc `ajv` check, same as `bpmn2agent-analyze` step 6) — a spec that doesn't
conform blocks `bpmn2agent-generate` and `bpmn2agent-verify` both. `ajv`/`ajv-formats`/`js-yaml`
don't need installing by hand: `bpmn2agent-verify/scripts/verify.mjs` already installs them into
`${BPMN_TOOLS_CACHE:-$HOME/.cache/bpmn-authoring-tools}/node_modules/` on first use (same
`ensurePackages`-into-the-cache approach `bpmn-authoring/scripts/validate.sh` uses for its own
dependencies) and resolves them via `createRequire` against `<cacheDir>/package.json` — reuse that
same cache/`createRequire` pattern for an ad-hoc check. Simpler alternative: run
`bpmn2agent-verify/scripts/verify.mjs "$cacheDir" generated/<workflow>` and read only its
`spec-schema` section — the other five categories will likely still fail this early (no generated
files exist yet), that's expected and not this step's concern.

Confirm no element is left at `kind: unresolved` unless it's a genuine open question the user
explicitly deferred (recorded in `openQuestions` with `answer: null`) — everything else from step 2
onward should have resolved to a concrete `kind`, including `not-generated` for accepted gaps.

## 9. Handoff

Report to the user (or the calling context) that the spec is ready for `bpmn2agent-generate`:
workflow name, pattern chosen, count of elements by `kind`, and any remaining `openQuestions`.
`bpmn2agent-generate` reads the confirmed spec only — it does not re-derive mapping or pattern
decisions, so nothing here should be left implicit in prose that isn't also in the spec file.

## Re-runs

If `bpmn2agent-verify` or `bpmn2agent-generate` sends a failure back here (a lint/trace problem
that's actually a mapping decision, not a generation bug), treat it the same as step 2's
"already decided" case: re-open only the flagged elements, redo steps 3–6 for those, and get a
fresh step 7 confirmation scoped to just the change before writing.

## Reference files

- `references/mapping-rubric.md` — the element→`kind` decision table, the three construct-specific
  sub-decisions, the v1 supported/unsupported construct list, and the mapping-view colour legend.
- `references/pattern-rubric.md` — the signals, the pattern decision table, per-pattern generation/
  human-checkpoint/loop-cap/state-resume detail, and how to phrase the choice for a business user.
- `assets/workflow-spec.schema.yaml` — the schema every write in step 8 must conform to.
- `.agents/skills/new-agent/agent-template.md` — the naming convention `roles.*.agentName` follows.
- `${CLAUDE_SKILL_DIR}/../orchestration-design/SKILL.md` — the review in step 6a.
- `${CLAUDE_SKILL_DIR}/../agent-authoring/SKILL.md` — lane/agent split rule used in step 5.
- `${CLAUDE_SKILL_DIR}/../agentic-workflow-kb/` — cited answers to design questions (FAQ + references).
- `.agents/agents/agentic-workflow-architect.md`, `.agents/agents/agentic-kb-librarian.md` — the
  agents step 6a can delegate to.
