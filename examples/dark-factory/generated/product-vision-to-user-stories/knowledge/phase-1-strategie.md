---
element: SP1.1
evidence: cited
sources: ["The Product - Business Design (NotebookLM)", "docs/dark-factory/process-rules.md"]
bpmn:
  file: product-vision-to-user-stories.bpmn
  elements: [S0, S1.1.1, S1.1.2, S1.1.3, S1.1.4, S1.1.5, S1.1.6, S1.2.1, S1.2.2, S1.2.3, S1.2.4, S1.2.5, S1.2.6]
---

# Phase 1: Vision, business model, impact mapping

Distilled from notebook "The Product - Business Design" (26 sources), queried 2026-09-25, plus the
binding rules in `process-rules.md` (next to this file) (§4, §13, §14).

## Vision statement and elevator pitch (1.1.1–1.1.2)

- Start from status quo vs. target picture, then fill Moore's template (For … who … the … is a …
  that … Unlike … our product …) or NABC; pair it with a high-concept pitch ("X for Y") [^1][^2].
- Pass: one page or less; names target customer, problem and unique differentiator; no buzzwords [^1].
- Pitfall: 50-page strategy documents instead of a one-page statement; starting from features
  instead of the customer problem [^1][^3].

## Lean Canvas (1.1.3)

- Fill the boxes in order: Problem (top 1–3) and existing alternatives → customer segments and
  early adopters → UVP and high-level concept → solution → channels → revenue → costs → key
  metrics → unfair advantage [^4].
- Pass: fits on one page; 3–4 entries per box at most; the problem box names today's workarounds;
  the revenue model is explicit [^4]. The Gedächtnis rubric adds: every cell has an evidence level.
- Pitfall: treating the canvas as a one-off document, or using the Business Model Canvas before
  problem/solution fit is established [^4].

## Value Proposition Canvas (1.1.5)

- Customer profile first (jobs, pains, gains), then the value map (products, pain relievers, gain
  creators), then check the fit [^2].
- Pass: pain relievers address the top pains and gain creators produce the top gains; jobs cover
  functional, social and emotional dimensions [^2].

## Assumptions map (1.1.6)

- Extract the assumptions behind the canvases, classify them as Desirability, Feasibility or
  Viability, and plot Importance × Evidence. High importance with low evidence is the kill zone [^5].
- Pitfall: testing only technical feasibility and ignoring desirability and viability risk [^5].

## Impact mapping (1.2.1–1.2.6)

- Four levels in order: Goal (why, a measurable KPI) → Actors (who: primary, secondary, off-stage)
  → Impacts (how: behaviour changes) → Deliverables (what: options, not commitments) [^6].
- **OMTM (adopted 2026-09-25):** 1.2.1 fixes one *One Metric That Matters* for the product's
  current stage and places it on the AARRR funnel (Acquisition, Activation, Retention, Revenue,
  Referral) instead of listing KPIs loosely [^7].
- Pass: goals are business outcomes, not solution mandates; impacts are actor behaviour changes,
  not features; deliverables can be dropped once the impact target is reached [^6].
- Roadmap (1.2.6): order by impact leverage and risk; milestones are target outcomes ("from A to
  B"), not feature dates [^6][^7].
- Pitfall: a feature as goal or impact ("build a mobile app"); deliverables treated as immutable [^6].

## Source suggestions not adopted (for a later BPMN revision)

The sources also recommend a stakeholder/power-interest map before impact mapping, a formal
problem statement, and the Purpose Alignment Model [^6]. None of these was raised as a design
question in this run. They are recorded here only.

[^1]: "The Design Thinking Toolbox" (Lewrick, Link, Leifer 2020), via notebook answer 2026-09-25 — "Draft a concise statement defining target customer, need, product name, category, core benefit, primary alternative, and unique differentiation using Moore's template or an NABC structure."
[^2]: "The Design Thinking Playbook" / "The Design Thinking Toolbox", via notebook answer 2026-09-25 — "Complete the right side (Customer Profile) first … Then design the left side (Value Map) … Cross-check left and right sides to evaluate 'Fit'."
[^3]: "Lean UX" (Gothelf, Seiden), via notebook answer 2026-09-25 — "Starting with solution features rather than framing the customer problem/need."
[^4]: "Running Lean" (Maurya), via notebook answer 2026-09-25 — "Fill out the 9 building blocks in sequence: Problem (top 1–3) & Existing Alternatives → Customer Segments & Early Adopters → UVP …"
[^5]: "Testing Business Ideas" (Bland, Osterwalder 2019), via notebook answer 2026-09-25 — "Categorize into three risk domains: Desirability, Feasibility, and Viability. Plot on a 2x2 grid of Importance vs. Evidence."
[^6]: "Fifty Quick Ideas to Improve Your User Stories" (Adzic, Evans, Korac 2014) — "capture user stories, epics, tasks, product ideas – all the deliverables that could potentially cause a positive impact … Then treat them as options, not as commitments."
[^7]: "Lean Analytics" (Croll, Yoskovitz), via notebook answer 2026-09-25 — "define a single OMTM suited to the product's current stage, using Dave McClure's AARRR (Pirate Metrics) framework."
