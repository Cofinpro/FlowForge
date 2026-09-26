---
element: SP2.1
evidence: cited
sources: ["The Product - Business Design (NotebookLM)", "docs/dark-factory/process-rules.md"]
bpmn:
  file: product-vision-to-user-stories.bpmn
  elements: [S2.1.1, S2.1.2, S2.1.3, S2.1.4, S2.1.5, S2.1.6, S2.2.1, S2.2.2, S2.2.3, S2.2.4, S2.2.5]
---

# Phase 2: Discovery with the synthetic panel, problem definition

Distilled from notebook "The Product - Business Design", queried 2026-09-25. Panel rules
(grounding, hidden attributes, Contrarian and Verweigerer) are binding from
`process-rules.md` (next to this file) §7.

## Interview guide (2.1.2) and interviews (2.1.4)

- Four-stage funnel: qualifier (is this the target audience?) → story about past behaviour →
  problem ranking and today's workaround → prototype or solution shown last [^1][^2].
- **Problem ranking (adopted 2026-09-25):** list the top 3 problems (shuffle their order per
  persona) and let each persona rank them from its own experience. If the core problem is ranked
  last, or not at all, by most target personas, that is a kill signal for G-P2 [^1][^3].
- Pass: only past-behaviour questions ("When was the last time you…?"); no leading or rhetorical
  questions; no guided tour or pitch before the last third [^2][^4][^5].
- Pitfall: a 10-minute product pitch up front, which produces fake validation ("Sure, I'd use
  that") [^5].

## User roles and personas (2.1.5)

- Identify user roles across the interaction space first, then condense interview facts into
  personas [^6].
- Pass: concrete role label, never "As a user"; built only from quotes and observed behaviour;
  1–3 JTBD, top 2 pains, top 2 gains, one trigger situation [^6][^7].
- Pitfall: the mythical generic user, who opens the door for pet features [^7].

## Jobs-to-be-Done (2.1.6)

- Syntax: "When [situation], I want to [motivation], so I can [expected result]" [^8].
- Pass: solution-independent (no UI, no technology); captures emotional and social jobs next to
  functional ones [^8].

## Empathy map (2.2.1) and pains & gains (2.2.2)

- Four quadrants from interview notes: Think & Feel, See, Hear, Say & Do. Derive pains and gains
  afterwards, from contradictions between Say/Do and Think/Feel [^8].
- Pass: Say & Do holds verbatim quotes (🤖 synthetic, marked as such); needs are verbs, not nouns [^8].

## Point of View and How-Might-We (2.2.3)

- One-sentence POV: "[Persona] needs a way to [need] because [surprising insight]", then several
  HMW questions [^8].
- Pass: the need is a verb and not a feature; HMW questions are neither too broad nor too narrow [^8].

## Opportunity-Solution-Tree (2.2.4) and prioritisation (2.2.5)

- Tree: Outcome → Opportunities (customer needs) → Solutions → Experiments. Every solution hangs
  under an opportunity, never directly under the goal, and each opportunity has several competing
  solutions [^9].
- **Opportunity scoring (adopted 2026-09-25):** score each opportunity with
  `Opportunity = Importance + max(Importance − Satisfaction, 0)`. Importance and Satisfaction are
  1–5 ratings from the panel (`rating` mode). Disclose the inputs so the critic can recompute them [^10].

## Source suggestions not adopted

The sources also recommend contextual inquiry (AEIOU) and extreme users. The full panel already
covers the extreme-user idea through the Contrarian and Verweigerer personas (Gedächtnis §7.1).
Contextual inquiry is out of reach in dark mode (Gedächtnis §2.1).

[^1]: "Testing Business Ideas" (Bland, Osterwalder 2019) — "List the top three customer jobs, pains, and gains. Interviewee ranks them based on personal experiences."
[^2]: "Lean UX" (Gothelf, Seiden) — "First, try to identify if the customer is in your target audience. Then, try to confirm any problem hypotheses … if you have a prototype or mockup with you, show this last."
[^3]: "Lean Analytics" (Croll, Yoskovitz) — "Test the problem by getting the subject to rank the problems … you might get a resounding 'meh,' in which case there's a clear disconnect."
[^4]: "The Product Book" (Product School 2017) — "always aim for actual instead of ideal-self questions—i.e., ask what customers have done, not what they might do. Also avoid leading and loaded questions."
[^5]: "UX for Lean Startups" (Klein) — "Don't Give a Guided tour … inexperienced moderators wanting to give way too much information about the product up front."
[^6]: "User Stories Applied" (Cohn 2004) — "Rather than writing stories like 'A user can restrict job searches…' you can write 'A Geographic Searcher can restrict his job searches…'"
[^7]: "Fifty Quick Ideas to Improve Your User Stories" (Adzic et al. 2014) — "Using generic roles is often a get-out-of-jail-free card for people who want to push in pet features, or unjustified scope."
[^8]: "The Design Thinking Toolbox" (Lewrick et al. 2020) — "The customer tasks are written down according to the pattern: 'When I … (situation), I want to… (motivation), so I can… (expected result).'" / "Use verbs, not nouns. Needs are verbs … Nouns are usually solutions."
[^9]: "The Product Manager's Playbook" (Richter 2023) — "You can derive solutions from opportunities, and you know exactly which of your goals they relate to."
[^10]: "Mapping Experiences" (Kalbach 2020) — "Solutions that meet unmet needs—or jobs that are important but unsatisfied—have a higher chance of succeeding … a specific technique developed by Tony Ulwick."
