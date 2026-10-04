---
element: phase-4
evidence: cited
sources: ["NotebookLM: The Product - Business Design"]
bpmn:
  file: user-story-refinement.bpmn
  elements: [Merge_Refinement, D1, Par_AmigosSplit, D2a, D2d, D2b, D2c, Par_AmigosJoin, D3, D4, Merge_Schaetzung, D5, Gw_Schaetzung, Gw_Sprintgroesse, D6]
---

# Phase 4 — Refinement (Three Amigos)

Tags like `[triage-klaerung-1: 7, 9]` point to an entry and its citation numbers in the notebook FAQ kept with the generation output (`knowledge/faq/`), not installed.

## Procedure

1. **"Refinement mit Three Amigos ansetzen"** — business (PO/BA: intent, value), development
   (approach, architecture, dependencies), testing (heuristics for edge and negative cases); UX or
   domain experts join when interaction or domain detail matters. Invite the people who will build
   and test the story, not delegates [refinement-1: 1, 2, 3, 4, 5, 6, 7, 8, 9]. Output: a shared
   understanding, clarified rules, first test scenarios, risks [refinement-1: 1, 3, 10, 11].
2. The four perspectives — **"Wert & Fachregeln erläutern (Was)"**, **"Umsetzung & Abhängigkeiten
   klären (Wie)"**, **"Randfälle & Negativszenarien identifizieren"**, **"Wireframes &
   Interaktionsfluss beilegen"** — prepare that conversation; they don't replace it
   [backlog-plausibilitaet-1: 1, 2, 3, 4, 5].
3. **"Akzeptanzkriterien in Given-When-Then formulieren"** — Given (precondition), When (action or
   event), Then (verifiable result), agreed before coding; they define "done" and seed automated
   acceptance tests [refinement-1: 2, 12, 13, 14, 15, 16, 17, 18, 19].
4. **"Beispieltabellen ergänzen (Specification by Example)"** — turn rules into rows of concrete
   inputs and expected outputs [refinement-1: 12, 16, 20].
5. **"Story Points schätzen (Planning Poker)"** — PO reads the story, everyone reveals a card at
   once (Fibonacci scale), highest and lowest explain, re-vote [refinement-1: 21, 22, 23, 24, 25, 26].

## Decision criteria

- **"Schätzungen konvergiert?"** — unanimity isn't required: a narrow spread, or outliers agreeing
  to the majority, counts. Rarely more than 2–3 rounds; continue only while estimates move closer.
  Don't argue 7 vs. 8 [refinement-1: 26, 27, 28]. Loop cap: 3 rounds.
- **"Passt die Story in einen Sprint?"** — about 1–5 ideal days and well inside one sprint's
  velocity; no half features [refinement-1: 29, 30, 31, 32, 33, 34, 35].

## "Story vertikal schneiden (Splitting-Muster)"

By business rule / data variation; by operation (create, view, edit, delete); by input channel
(hard-coded data first); by output format (simplest first); by workflow step (hamburger); by
examples of usefulness; spike first, feature after; core vs. enhancement
[refinement-1: 33, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49]. Never split by
architectural layer (database story, UI story) — those slices carry no user value
[refinement-1: 34, 45].

## Pitfalls

Delegating the Three Amigos to people who won't deliver; refining too far ahead; goldplating;
splitting often during sprint planning (refinement came too late) [refinement-1: 9, 35, 67, 68, 69, 71, 72].
