# Evaluation and guardrails

Distilled from FAQ `evaluation-and-guardrails-1`. Tag `[evaluation-and-guardrails-1: n]`.

## Designing evals

- Score on ranges or rubrics, not only pass/fail — outputs are non-deterministic
  [evaluation-and-guardrails-1: 3, 4].
- Start from domain failure modes and tie them to business outcomes (e.g. false approval rate)
  [evaluation-and-guardrails-1: 3, 5, 6].
- Levels: tool evals (recall, precision, argument accuracy), planning evals (sequence, branching,
  early stop), end-to-end evals [evaluation-and-guardrails-1: 7–12].
- Run evals in CI and block regressions [evaluation-and-guardrails-1: 13, 14].

## Datasets

Begin hand-curated or synthetic, move to versioned sets from real logs; domain experts label, not
engineers; grow with adversarial and counterfactual cases
[evaluation-and-guardrails-1: 15–22].

## LLM-as-judge

Prefer binary or categorical grades over 1–10 scales. Watch for metric overfitting,
self-preference and missed domain nuance; sample with human experts
[evaluation-and-guardrails-1: 23–27].

## Trajectory vs. final output

Final-output checks miss *how* the result was reached. Trajectory evals check the path: right
tools, right arguments, no loops, feedback used [evaluation-and-guardrails-1: 7, 8, 25, 28, 29].
Actor–critic and Reflexion loops apply the same idea at run time
[evaluation-and-guardrails-1: 27, 30–33].

## Observability

Hierarchical spans (OpenTelemetry) per LLM call and tool call with timing and payloads; export
failed and exemplary traces into the test corpus
[evaluation-and-guardrails-1: 34–37, 49, 50].

## Guardrails

- Input: block injection, jailbreaks, PII, off-topic requests before the model runs
  [evaluation-and-guardrails-1: 52–55].
- Output: schema enforcement with retry, toxicity/hallucination/sensitive-data screens
  [evaluation-and-guardrails-1: 56–60].
- Policy: narrow tools, planning modes without write access, policy-as-code
  [evaluation-and-guardrails-1: 61, 62, 63].

## Security: the lethal trifecta

Private data + untrusted content + a way to send data out = exfiltration risk. Cut at least one
leg, usually the outbound channel [evaluation-and-guardrails-1: 51, 68, 69]. Run generated code in
sandboxes; red-team before release [evaluation-and-guardrails-1: 70–76].

## Cost and latency

Track tokens per workflow, tool failure/retry rates, fallback frequency and P95 latency;
reduce with context compaction, routing to small models and prompt caching; roll out with shadow
mode or canaries [evaluation-and-guardrails-1: 77–95].

## For flowforge

`flowforge-verify` is a static check (trace, schema, lint) — it proves structure, not behaviour.
Behavioural evals for a generated workflow are still missing: per generated skill, ≥ 3 scenarios
from the BPMN's own paths (happy path, each gateway branch, a loop hitting `maxLoops`). Any agent
that reads untrusted input and can write outward (PRs, messages) is a trifecta candidate and should
get a human checkpoint or a hook before the outbound step.
