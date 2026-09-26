---
element: S0
evidence: cited
sources:
  - The Product - Business Design (NotebookLM)
  - docs/dark-factory/process-rules.md
bpmn:
  file: product-vision-to-user-stories.bpmn
  elements: [S0]
---

# Domain knowledge — 0 Idee-Brief vervollstaendigen

## Idea brief as input contract (Gedächtnis §14)

- `idee` (1–3 sentences) is the only true mandatory field; everything else can be derived.
- Required with derivation: `markt`/`region` (from the idea and WebSearch → 🧠), `ausgabesprache` (default `de` → 🧠),
  `budget`/`timebox` for G-4.2 and `zielarchitektur`/`plattform` for ARC (plausible, justified assumption → 🧠).
- Optional: `zielgruppe-hypothese`, `strategische-richtung`, `constraints` (derive → 🧠); `wettbewerber` stays empty, DR-01 fills it.
- All 🧠 fields of the brief are carried over automatically as ASM items into the assumptions-map (1.1.6).
- Research routing (§8): Claude WebSearch is the tool for light research in step 0; every source is normalized to `SRC-<nnnn>`
  with url, title, retrievedAt, tool, query, contentHash, sourceType and a summary.
- Evidence (§6): inferred 🧠 = logically derived or assumed, explicitly including brief fields from step 0.

## Framing

- A common failure downstream is starting with solution features rather than framing the customer problem [^1];
  the brief should keep the problem visible so 1.1.1 and the Lean Canvas can start from it [^2].

[^1]: "Lean UX" (Gothelf, Seiden), via notebook answer 2026-09-25 — "Starting with solution features rather than framing the customer problem/need."
[^2]: "Running Lean" (Maurya), via notebook answer 2026-09-25 — "Fill out the 9 building blocks in sequence: Problem (top 1–3) & Existing Alternatives → Customer Segments & Early Adopters → UVP …"
