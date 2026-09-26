---
name: bpmn2agent-design
description: Decides how each element of a knowledge-grounded workflow-spec.yaml gets built (kind, paths, orchestration pattern, roles), then gets the business user to confirm a plain-language mapping plan. Use after bpmn2agent-knowledge, before bpmn2agent-generate, or when verify routes a mapping problem back.
bpmn:
  file: docs/planning/bpmn-to-agentic-workflow.bpmn
  elements:
    - Gw_Merge_Design
    - Task_Design
    - UserTask_ConfirmMapping
    - Gw_MappingAccepted
---

# BPMN → Agent Design

Input: the spec `bpmn2agent-analyze` drafted and `bpmn2agent-knowledge` enriched; every element is
`kind: unresolved` except constructs analysis flagged as unsupported. Output: a concrete generation
decision per element, an orchestration pattern, and the user's confirmation — written to the spec.
Never edit the `.bpmn` and never patch around a limit of the diagram; that goes back to
`bpmn2agent-analyze`. Ask every question via `AskUserQuestion` with options and a recommendation,
in the user's language (`meta.language`).

## 1. Read the inputs

Read `generated/<workflow>/workflow-spec.yaml`. If it doesn't exist, **stop** and tell the user to
run `bpmn2agent-analyze` first. If `knowledge:` is absent entirely (not even `mode: unverified`),
stop and recommend `bpmn2agent-knowledge`; proceed ungrounded only if the user explicitly says so.

Re-run the inventory for the pattern signals (the spec doesn't persist them):

```bash
node ${CLAUDE_SKILL_DIR}/../bpmn2agent-analyze/scripts/inventory.mjs \
  "${BPMN_TOOLS_CACHE:-$HOME/.cache/bpmn-authoring-tools}" <meta.sourceBpmn.path>
```

If the fresh `meta.sha256` differs from the spec's `meta.sourceBpmn.sha256`, **stop** and tell the
user to re-run `bpmn2agent-analyze` first. Keep `scopes[].signals` and top-level `signals` for step 4.

## 2. Triage: don't redesign around a diagram limit

Sort the spec's `elements` into:

- **Pending design** — `kind: unresolved`, `reason: "Not yet mapped — pending bpmn2agent-design."`
  Steps 3–6 resolve these.
- **Deferred unsupported** — `kind: unresolved` with a rewrite-suggestion reason from analysis
  (see `${CLAUDE_SKILL_DIR}/../bpmn2agent-analyze/references/unsupported.md`). Ask once more,
  construct-specific, whether to leave it or fix the diagram, e.g.:

  > Your diagram still has a real timer on "Wartezeit prüfen" that I can't generate a working
  > agent step for. I can (a) mark it as a known gap and design the rest of the workflow around
  > it, or (b) pause here so you can change the diagram in `bpmn-authoring` first — I'd
  > recommend (b) if this step matters for how the workflow actually runs.

  Fix the diagram → **stop the whole design pass** (apply nothing to other elements) and tell them
  to re-run `bpmn2agent-analyze` once the `.bpmn` is updated. Leave it → set `kind: not-generated`
  (not `unresolved`) with the same reason text, and set that element's `openQuestions` entry to
  `answer: "known gap — not generated"`, `answeredAt: <now>`; it needs no further rubric work.
- **Already decided** — concrete `kind` from a previous design pass. Leave as-is unless the element
  is in the analyze diff's new/changed set.

## 3. Apply the mapping rubric to every remaining element

Load `references/mapping-rubric.md`. Apply its decision table and sub-decisions (`serviceTask` →
skill vs. checklist item; `businessRuleTask`/gateway condition → hook vs. script;
`callActivity`/subprocess → reusable skill vs. sub-workflow; inner elements of a skill-backed
subprocess fold into the container skill but keep their own `elements.<id>` entry). Record per
element:

- `kind` — a schema enum value.
- `generatedPaths` — repo-relative paths under `generated/<workflow>/.claude/`, as they will sit in
  the user's project: `.claude/skills/<name>/SKILL.md`, `.claude/skills/<name>/scripts/<x>.mjs`,
  `.claude/agents/<name>.md`, `.claude/hooks/<name>.mjs` (hook registration goes into the one
  `.claude/settings.json`, which no element claims). Empty for `orchestrator`, `human-checkpoint`,
  `not-generated` and `unresolved`.
- `reason` — required for `not-generated`/`unresolved`; it appears verbatim in the mapping report.
- `knowledge` — for `skill`/`agent-checklist`/`human-checkpoint`/`hook` only: notebook ids mapped to
  the element or its lane, else its `knowledge.refs` path, else `"websearch"`/`"model-only"` per
  `knowledge.mode` (`unverified` → `"model-only"`); `[]` if none. Leave unset for other kinds.
- `gate` — on a rubric/checklist checkpoint: `kind`/`criteria`/`maxLoops` from the BPMN and the
  interview. Put it on the checkpoint task, not on the routing gateway that follows it. `maxLoops`:
  `references/pattern-rubric.md`'s default unless the BPMN or interview gives one.
- `inputs`/`outputs` — carry forward from analysis; add only artifacts the decision itself
  introduces (e.g. a sub-workflow's intermediate artifacts).

Don't ask about individual rubric applications. Save every genuinely uncertain call for the step-7
confirmation.

## 4. Apply the pattern rubric

Load `references/pattern-rubric.md` and walk its decision table with step 1's top-level `signals`.
`judgementGateways[]` is a heuristic: don't count a gateway that only routes on a preceding human
checkpoint's answer toward `judgementBranchCount` (recompute before consulting the table). Repeat per
`scopes[].signals` for every sub-workflow; each gets its own pattern under the same `elements` map.

Write `pattern.rationale` in the business phrasing of the rubric's "Explaining the choice" section.
Add an `alternativesConsidered` entry when the signals were close to another row.

## 5. Propose roles: model tier + tools

Confirm or refine each `roles.<id>.agentName` per the naming rule in
`${CLAUDE_SKILL_DIR}/../agent-authoring/SKILL.md` (`{workflow}-{role}`, kebab-case, no `-expert`).
Leave `modelTier` and `tools` **unset** unless something concrete makes them matter, and only then
ask:

- long-context synthesis or multi-source judgement dominates a lane → ask whether to pin
  `opus`/`sonnet`;
- a lane is narrow, high-volume and mechanical (only `script`/`hook`) → ask whether `haiku` suffices;
- a hook needs a tool matcher, or a lane's skills touch production artifacts or external APIs →
  propose a `tools:` allowlist.

Apply agent-authoring's "Should this be an agent at all?" and split rule to every lane. A lane that
should become two agents or a skill is a question for step 7 (the lane belongs to the diagram), not
a split you make; when the user agrees, record the reason in the spec.

## 6. Define artifact contracts

For each `artifacts.<id>` (from analysis plus step 3's additions), fill `pathPattern` and
`frontmatter`. Artifacts crossing a gate or loop get `version` and `status` frontmatter. Add no
field that no producer or consumer reads.

## 6a. Check the orchestration against the knowledge base

1. Write the draft decisions of steps 2–6 to `generated/<workflow>/workflow-spec.draft.yaml` (same
   schema; the confirmed spec stays untouched until step 8; delete the draft whenever design stops
   before step 8, since verify flags it as untraced) and draft the step-7 plan text.
2. Delegate the review to the `agentic-workflow-architect` agent with absolute paths: the draft
   spec, the `.bpmn`, `${CLAUDE_SKILL_DIR}/references/pattern-rubric.md` and
   `${CLAUDE_SKILL_DIR}/references/mapping-rubric.md`, plus the draft plan text. If the agent fails
   or its JSON is unparseable, run `${CLAUDE_SKILL_DIR}/../orchestration-design/SKILL.md` review
   mode inline once and say so in the plan.
3. Route the findings:
   - `design` → fix in steps 3–6 now; fold what changed into `pattern.rationale` and the plan's
     "how it runs" part (no separate brief file).
   - `bpmn` → offer in step 7 as reasons for "the diagram itself needs to change"; never patch the
     diagram's structure in the spec.
   - `question` → add to `openQuestions` (`answer: null`) and raise in step 7.
4. Agentic-design questions the rubrics leave open (including the `source: agentic-design` entries
   `bpmn2agent-knowledge` queued in `openQuestions`): answer from `${CLAUDE_SKILL_DIR}/../agentic-workflow-kb/` (FAQ, then
   references); only if it has no answer, ask the `agentic-kb-librarian` agent. Quote the citation
   tag when a recommendation rests on it. Write each answer into the entry's `answer`/`answeredAt`;
   one neither answers goes to step 7 as a question.

## 7. Write the mapping plan and confirm

Write a short plan in the user's language and business wording (no YAML/BPMN terms), grouped by
lane/role, then element, e.g.:

> **Sachbearbeiter** (dein Prüf-Schritt)
> - "Risikobewertung erstellen" → wird eine wiederverwendbare Fähigkeit mit eigener Vorlage
>   (`risk-assessment`).
> - "Antrag genehmigen" → wird ein Prüfpunkt, an dem ich dich frage, bevor es weitergeht.
> - Entscheidung "Genehmigt?" → steuert, ob es weitergeht oder zur Risikobewertung zurückgeht
>   (maximal 3 Durchläufe, danach gehe ich mit einem Risikohinweis weiter).
>
> Insgesamt baue ich das als eine Abfolge von Checklisten, die an deinem Prüfpunkt pausiert
> (siehe Begründung oben) — kein separates Steuerprogramm nötig.

Include the pattern and rationale ("how it runs"), any model/tools proposals from step 5, open
questions from 6a, and every `not-generated`/`unresolved` element with its reason. Fold every
pending pattern or model/tools question into this one confirmation. Offer at least:

- **Accept as proposed** — recommend when nothing is `unresolved` and no step-3 call was uncertain.
- **Adjust specific elements** — collect which and how, redo steps 3–6 (and the draft) for those,
  re-confirm. After 3 re-confirmations, offer only: accept with the open items listed in
  `openQuestions`, or change the diagram.
- **The diagram itself needs to change** — stop: point the user at `bpmn-authoring`, then
  `bpmn2agent-analyze`. Don't approximate the change in the spec.

## 8. Write the confirmed spec

Only after confirmation, write the decisions into `generated/<workflow>/workflow-spec.yaml`: every
element's `kind`/`generatedPaths`/`reason`/`knowledge`/`gate`, `roles.*.modelTier`/`tools` where set,
`artifacts.*`, `pattern`, `openQuestions`; update `meta.updated`; delete
`workflow-spec.draft.yaml`. Validate: run
`node ${CLAUDE_SKILL_DIR}/../bpmn2agent-verify/scripts/verify.mjs "$cacheDir" generated/<workflow>`
and read only its spec-schema section (other categories may fail this early). Fix until it passes.

No element may stay `kind: unresolved` unless the user explicitly deferred it (in `openQuestions`
with `answer: null`).

## 9. Handoff

Report: workflow name, pattern, element count per `kind`, remaining `openQuestions`. Next is
`bpmn2agent-generate`, which reads only the spec, so nothing may live only in prose.

## Re-runs

When `bpmn2agent-verify` or `bpmn2agent-generate` routes a mapping problem back, re-open only the
flagged elements, redo steps 3–6 for them, and get a step-7 confirmation scoped to the change
before writing.

## Reference files

- `references/mapping-rubric.md` — element → `kind` table, sub-decisions, v1 supported constructs,
  mapping-view colours.
- `references/pattern-rubric.md` — signals, pattern table, per-pattern generation/checkpoint/loop
  cap/resume detail, business phrasing.
- `assets/workflow-spec.schema.yaml` — the schema for step 8.
- `${CLAUDE_SKILL_DIR}/../agent-authoring/SKILL.md` — naming and split rule (step 5).
- `${CLAUDE_SKILL_DIR}/../orchestration-design/SKILL.md` — inline fallback review (step 6a).
- `${CLAUDE_SKILL_DIR}/../agentic-workflow-kb/` — cited answers to design questions.
- Agents `agentic-workflow-architect`, `agentic-kb-librarian` — step 6a.
