---
id: research-markt-wettbewerb
version: 1
threshold: 0.8
criteria:
  - {id: market-size, text: 'Market size/growth as a range with method (top-down/bottom-up) and reference year, triangulated', weight: 2, source: §8.2}
  - {id: competitors, text: '≥3 direct and ≥2 indirect competitors with positioning, target group, pricing model and price points', weight: 2, source: §8.2}
  - {id: feature-matrix, text: Feature matrix of the direct competitors (≥5 features), weight: 1, source: §8.2}
  - {id: pricing-benchmarks, text: Price/revenue model benchmarks, weight: 1, source: §8.2}
  - {id: trends, text: Dated market trends of the last 2–3 years, weight: 1, source: §8.2}
  - {id: entry-barriers, text: Market entry barriers, weight: 1, source: §8.2}
  - {id: ledger-only, text: Every statement comes from the claim ledger research/claims/<callId>.json and cites CLM + SRC ids (check-claims.mjs --verify-report is ok), weight: 2, source: §8.4}
  - {id: triangulation, text: 'Every key claim is triangulated (≥2 independent sites, ≥1 raw text) or visibly marked 🧠 with untriangulated-key-claim', weight: 2, source: §8.4}
  - {id: tiers-freshness, text: No market/number/competitor claim rests on T3 sources alone; regulation cites a T1 source; market data ≤ 3 years old or flagged, weight: 1, source: §8.3}
  - {id: gaps-explicit, text: Every uncovered scope point is named explicitly as not covered, weight: 1, source: §8.5}
bpmn:
  file: product-vision-to-user-stories.bpmn
  elements: [Call_R1, K_1]
---
# Rubric `research-markt-wettbewerb`

Seed rubric (Gedächtnis §13 core criteria + adopted notebook criteria, 2026-09-25). Loaded by `scripts/load-rubric.mjs`; the full extraction from the notebook with calibration examples is still open (docs/dark-factory/roadmap.md §2).

| Criterion | Weight | Kill | Source |
|---|---|---|---|
| `market-size` Market size/growth as a range with method (top-down/bottom-up) and reference year, triangulated | 2 |  | §8.2 |
| `competitors` ≥3 direct and ≥2 indirect competitors with positioning, target group, pricing model and price points | 2 |  | §8.2 |
| `feature-matrix` Feature matrix of the direct competitors (≥5 features) | 1 |  | §8.2 |
| `pricing-benchmarks` Price/revenue model benchmarks | 1 |  | §8.2 |
| `trends` Dated market trends of the last 2–3 years | 1 |  | §8.2 |
| `entry-barriers` Market entry barriers | 1 |  | §8.2 |
| `ledger-only` Every statement comes from the claim ledger research/claims/<callId>.json and cites CLM + SRC ids (check-claims.mjs --verify-report is ok) | 2 |  | §8.4 |
| `triangulation` Every key claim is triangulated (≥2 independent sites, ≥1 raw text) or visibly marked 🧠 with untriangulated-key-claim | 2 |  | §8.4 |
| `tiers-freshness` No market/number/competitor claim rests on T3 sources alone; regulation cites a T1 source; market data ≤ 3 years old or flagged | 1 |  | §8.3 |
| `gaps-explicit` Every uncovered scope point is named explicitly as not covered | 1 |  | §8.5 |

Each criterion is scored `pass | partial | fail` with a reason (K.2); score = weighted share of pass, partial = 0.5 (Gedächtnis §9.1).
