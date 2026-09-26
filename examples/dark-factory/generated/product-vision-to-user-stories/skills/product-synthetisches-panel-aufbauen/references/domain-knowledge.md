---
element: S2.1.3
evidence: cited
sources:
  - The Product - Business Design (NotebookLM)
  - docs/dark-factory/process-rules.md
bpmn:
  file: product-vision-to-user-stories.bpmn
  elements: [S2.1.3]
---

# Domain knowledge — Synthetisches Panel aus Research-Korpus aufbauen

- Gedächtnis §7.1: the full panel has 6 personas — 4 target users (different segments, contexts, maturity), 1 Contrarian (skeptical of the core assumption, hunts weaknesses), 1 Verweigerer (target group, working workaround, no intent to switch). It replaces the proto-panel from 1.1.4.
- §7.2: every trait needs ≥1 SRC (forums, reviews, app-store ratings, reports, social posts); ≥3 source types per panel; no persona on a single source; source quotes may serve as the persona's "voice" (🔗).
- §7.3: the hidden part (persona model only) holds budget/WTP, skepticism 1–5, current workaround and satisfaction, switching barriers and a "secret" — so the panel tests interview quality instead of just agreeing.
- §8: DuckDuckGo is for bulk URL discovery for panel grounding and is never the only source of a claim; WebSearch does the factchecks; every source is normalized to SRC-<nnnn> with sourceType and contentHash, duplicates merged.
- The extreme-user idea from the sources is covered by the Contrarian and Verweigerer personas.
- Personas are later played against a guide that ranks the top 3 problems per persona [^1]; a hidden workaround and secret make a "meh" answer possible [^2].

[^1]: "Testing Business Ideas" (Bland, Osterwalder 2019) — "List the top three customer jobs, pains, and gains. Interviewee ranks them based on personal experiences."
[^2]: "Lean Analytics" (Croll, Yoskovitz) — "Test the problem by getting the subject to rank the problems … you might get a resounding 'meh,' in which case there's a clear disconnect."
