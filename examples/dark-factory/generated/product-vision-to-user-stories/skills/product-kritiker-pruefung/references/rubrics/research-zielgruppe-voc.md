---
id: research-zielgruppe-voc
version: 1
threshold: 0.8
criteria:
  - {id: segments, text: ≥2 target segments with distinguishing traits and rough size, weight: 2, source: §8.2}
  - {id: voc, text: '≥3 verbatim VoC quotes per segment from ≥2 source types (forums, reviews, social)', weight: 2, source: §8.2}
  - {id: jobs-pains, text: 'Jobs/pains from user statements (not demographics only), each pain with a quote', weight: 1, source: §8.2}
  - {id: workarounds, text: Current workarounds and switching barriers, weight: 1, source: §8.2}
  - {id: wtp, text: Willingness-to-pay signals, weight: 1, source: §8.2}
  - {id: ledger-only, text: Every statement comes from the claim ledger research/claims/<callId>.json and cites CLM + SRC ids (check-claims.mjs --verify-report is ok), weight: 2, source: §8.4}
  - {id: triangulation, text: 'Every key claim is triangulated (≥2 independent sites, ≥1 raw text) or visibly marked 🧠 with untriangulated-key-claim', weight: 2, source: §8.4}
  - {id: tiers-freshness, text: No market/number/competitor claim rests on T3 sources alone; regulation cites a T1 source; market data ≤ 3 years old or flagged, weight: 1, source: §8.3}
  - {id: gaps-explicit, text: Every uncovered scope point is named explicitly as not covered, weight: 1, source: §8.5}
bpmn:
  file: product-vision-to-user-stories.bpmn
  elements: [Call_R2, K_1]
---
# Rubric `research-zielgruppe-voc`

Seed rubric (Gedächtnis §13 core criteria + adopted notebook criteria, 2026-09-25). Loaded by `scripts/load-rubric.mjs`; the full extraction from the notebook with calibration examples is still open (docs/dark-factory/roadmap.md §2).

| Criterion | Weight | Kill | Source |
|---|---|---|---|
| `segments` ≥2 target segments with distinguishing traits and rough size | 2 |  | §8.2 |
| `voc` ≥3 verbatim VoC quotes per segment from ≥2 source types (forums, reviews, social) | 2 |  | §8.2 |
| `jobs-pains` Jobs/pains from user statements (not demographics only), each pain with a quote | 1 |  | §8.2 |
| `workarounds` Current workarounds and switching barriers | 1 |  | §8.2 |
| `wtp` Willingness-to-pay signals | 1 |  | §8.2 |
| `ledger-only` Every statement comes from the claim ledger research/claims/<callId>.json and cites CLM + SRC ids (check-claims.mjs --verify-report is ok) | 2 |  | §8.4 |
| `triangulation` Every key claim is triangulated (≥2 independent sites, ≥1 raw text) or visibly marked 🧠 with untriangulated-key-claim | 2 |  | §8.4 |
| `tiers-freshness` No market/number/competitor claim rests on T3 sources alone; regulation cites a T1 source; market data ≤ 3 years old or flagged | 1 |  | §8.3 |
| `gaps-explicit` Every uncovered scope point is named explicitly as not covered | 1 |  | §8.5 |

Each criterion is scored `pass | partial | fail` with a reason (K.2); score = weighted share of pass, partial = 0.5 (Gedächtnis §9.1).
