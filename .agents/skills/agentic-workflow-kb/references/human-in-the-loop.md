# Human-in-the-loop

Distilled from FAQ `human-in-the-loop-1`. Tag `[human-in-the-loop-1: n]`.

## Where to put checkpoints

- **Before execution:** review the plan — the cheapest gate against misdirected work
  [human-in-the-loop-1: 7].
- **Before side effects:** external API calls, database writes, file-system changes
  [human-in-the-loop-1: 8, 9, 10].
- **At phase transitions:** as a guard between superstates (drafting → publishing)
  [human-in-the-loop-1: 6, 11].
- **Before delivery:** drafts, emails, PRs reviewed before they leave the system
  [human-in-the-loop-1: 2, 12, 13].
- **Mode restriction:** a read-only planning mode that blocks mutations until switched
  [human-in-the-loop-1: 14].

## What always needs confirmation

Side-effecting operations; irreversible or high-stakes actions (payments, bookings, production
deploys, sensitive records); domain-critical decisions (coverage, treatment, legal, security);
low-confidence outputs [human-in-the-loop-1: 1, 2, 8, 9, 13, 25–31].

## Autonomy levels

Manual → ask/assisted (agent proposes, human approves) → auto (agent acts, escalates exceptions).
The human role moves from executor to reviewer, collaborator, governor as trust grows
[human-in-the-loop-1: 15, 20–25]. Production systems run "orchestrated autonomy"
[human-in-the-loop-1: 17, 18, 19].

## Escalation

Triggers: low confidence (e.g. score < 0.7), high risk (e.g. amount above a threshold),
ambiguity, repeated unexplained tool failures. Hand over what was tried, why it escalated, the raw
input and the concrete options [human-in-the-loop-1: 26, 29, 32–36].

## Interrupt and resume

- Persist state at the pause; resume with a structured payload (`approve` / `revise` + update)
  [human-in-the-loop-1: 10, 37–42].
- **Never put the side effect in the same step as the pause.** Pause first, execute after approval
  — otherwise a resume re-runs the side effect [human-in-the-loop-1: 28].

## Presenting a decision

Goal, reasoning, exact tool arguments or draft; a fixed set of actions (approve / reject / edit /
respond); 2–3 options with trade-offs and a recommendation; a confidence signal
[human-in-the-loop-1: 8, 10, 30, 31, 36, 41, 44–48].

## Approval fatigue

Auto-approve routine low-risk work and target a low escalation rate (e.g. < 10 %); let agents work
asynchronously instead of step-by-step babysitting; batch pending interrupts; widen autonomy as
evals prove reliability [human-in-the-loop-1: 13, 28, 29, 49–55].

## Feedback back into the agent

Immediate: the edit goes into state/context and the agent retries. Longer term: distil rules from
repeated edits, feed review comments into prompts and schemas, turn failed traces into regression
tests [human-in-the-loop-1: 10, 12, 41, 58–65, 70–72].

## For flowforge

`userTask`/`manualTask` → `AskUserQuestion` with options + recommendation (already the pipeline
rule) matches "presenting a decision". Check that side-effecting steps sit **after** the
checkpoint, not in the same skill step, and that risky service tasks without a preceding
`userTask` are flagged in design as open questions.
