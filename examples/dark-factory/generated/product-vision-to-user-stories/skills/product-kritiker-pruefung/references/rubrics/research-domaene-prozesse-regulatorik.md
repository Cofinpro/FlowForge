---
id: research-domaene-prozesse-regulatorik
version: 1
threshold: 0.8
criteria:
  - {id: as-is, text: As-is domain process in steps with the parties involved, weight: 1, source: §8.2}
  - {id: regulation, text: 'Applicable regulation/standards with exact reference (law/norm and section, T1 source) or explicitly "none specific"', weight: 2, source: §8.2}
  - {id: case, text: ≥1 documented practice case and ≥1 negative case from the domain, weight: 1, source: §8.2}
  - {id: terms, text: Domain terms collected as a glossary seed, weight: 1, source: §8.2}
  - {id: ledger-only, text: Every statement comes from the claim ledger research/claims/<callId>.json and cites CLM + SRC ids (check-claims.mjs --verify-report is ok), weight: 2, source: §8.4}
  - {id: triangulation, text: 'Every key claim is triangulated (≥2 independent sites, ≥1 raw text) or visibly marked 🧠 with untriangulated-key-claim', weight: 2, source: §8.4}
  - {id: tiers-freshness, text: No market/number/competitor claim rests on T3 sources alone; regulation cites a T1 source; market data ≤ 3 years old or flagged, weight: 1, source: §8.3}
  - {id: gaps-explicit, text: Every uncovered scope point is named explicitly as not covered, weight: 1, source: §8.5}
bpmn:
  file: product-vision-to-user-stories.bpmn
  elements: [Call_R3, K_1]
---
# Rubric `research-domaene-prozesse-regulatorik`

Seed rubric (Gedächtnis §13 core criteria + adopted notebook criteria, 2026-09-25). Loaded by `scripts/load-rubric.mjs`; the full extraction from the notebook with calibration examples is still open (docs/dark-factory/roadmap.md §2).

| Criterion | Weight | Kill | Source |
|---|---|---|---|
| `as-is` As-is domain process in steps with the parties involved | 1 |  | §8.2 |
| `regulation` Applicable regulation/standards with exact reference (law/norm and section, T1 source) or explicitly "none specific" | 2 |  | §8.2 |
| `case` ≥1 documented practice case and ≥1 negative case from the domain | 1 |  | §8.2 |
| `terms` Domain terms collected as a glossary seed | 1 |  | §8.2 |
| `ledger-only` Every statement comes from the claim ledger research/claims/<callId>.json and cites CLM + SRC ids (check-claims.mjs --verify-report is ok) | 2 |  | §8.4 |
| `triangulation` Every key claim is triangulated (≥2 independent sites, ≥1 raw text) or visibly marked 🧠 with untriangulated-key-claim | 2 |  | §8.4 |
| `tiers-freshness` No market/number/competitor claim rests on T3 sources alone; regulation cites a T1 source; market data ≤ 3 years old or flagged | 1 |  | §8.3 |
| `gaps-explicit` Every uncovered scope point is named explicitly as not covered | 1 |  | §8.5 |

Each criterion is scored `pass | partial | fail` with a reason (K.2); score = weighted share of pass, partial = 0.5 (Gedächtnis §9.1).
