---
name: product-recherche
description: >-
  Runs the dark factory's reusable research process R ("Recherche durchfuehren") — sharpen the question and route it (Gemini Deep Research API / WebSearch / optional DuckDuckGo), fetch the real page text, normalize every source into SRC records (tier, contentKind, hash, dedupe), extract a claim ledger with triangulation and scope coverage, fill gaps once, and write a synthesis that cites only ledger claims. Use for the corpus calls DR-01/DR-02/DR-03 ("Recherche: Markt & Wettbewerb (DR-01)" etc.), for their gap-fill re-runs, for the critic's "Strittige Claims faktenchecken", and whenever a dark-factory step needs normalized sources.
bpmn:
  file: product-vision-to-user-stories.bpmn
  elements: [Call_R1, Call_R2, Call_R3, K_3, R_Start, R_1, R_Split, R_2a, R_2b, R_2c, R_Join, R_Merge, R_3, R_3b, R_Gw, R_2d, R_4, R_End]
---

# Recherche durchfuehren (process R)

Generated from `product-vision-to-user-stories.bpmn`'s reusable process `Process_R`. It is called from
`Call_R1`/`Call_R2`/`Call_R3` (corpus DR-01/02/03) and from K.3 ("Strittige Claims faktenchecken").
Executed by `product-researcher`, or by `product-kritiker` for K.3. **Binding rules:**
`${CLAUDE_PLUGIN_ROOT}/knowledge/process-rules.md` §8 (channels, tiers, triangulation, ledger, gap-fill) and §9.4
(budget). Configuration: `research.yaml` next to this file.

The Workflow script calls this skill once per **mode** (one BPMN element each):

```
R_1 route → R_2a deep-research | R_2b websearch | R_2c ddg  (parallel)
         → R_3 normalize → R_3b claims → R_Gw "Luecken?" → (gaps, once) R_2d gapfill → R_3 → R_3b
         → R_4 synthesize
```

`S=${CLAUDE_PLUGIN_ROOT}/skills/product-recherche/scripts` in all commands below. `<runDir>` comes from the run
context.

## Budget rules (never overuse the paid API)

- The **only** paid call is Gemini Deep Research, and only through `$S/providers/gemini-deep-research.mjs --live`.
  Never call the Gemini API any other way (the `product-research-budget-guard` hook blocks it).
- **At most one Deep Research call per corpus and run** (DR-01, DR-02, DR-03), hard cap 3, money cap from
  `research.yaml` / `run.json`. The adapter checks and reserves before it sends; a refusal (exit 3,
  `{"status":"refused"}`) is normal — route the questions to `websearch` and record the risk flag.
- A **gap-fill** call (`gapfill: true` in the run context) never uses Deep Research.
- An interrupted Deep Research call is resumed by running the same command again — never start a second one.
- WebSearch, page fetches and DDG are free; still keep to the question budget below.

## Modes

### `route` — "Fragestellung schaerfen & Tool routen" (R_1)

1. Read the research order (e.g. `DR-01 Markt & Wettbewerb`), the idea brief and, for DR-02/DR-03, the
   upstream artifacts named in the order.
2. Write **3–7 concrete questions** that together cover the required scope of the report
   (§8.2; scope points per corpus in `research.yaml` → `scope`). Region and language follow the idea brief.
3. Route each question (§8.0):
   - corpus depth → `deep-research` — **only if** `gapfill` is false. All deep questions of one corpus go
     into **one** research order (they become one Deep Research call);
   - facts, prices, figures, regulation texts, anything the DR report may miss → `websearch`;
   - bulk URL discovery → `ddg` only if `research.yaml` enables it, else `websearch`.
   - K.3 fact checks → `websearch` only.
4. In **gap-fill** mode (`gapfill: true`): questions come from `gaps` (the gate's change requests) and the
   existing ledger `research/claims/<callId>.json`; route everything to `websearch`.
5. Return `{"channels": [...], "questions": [{"q", "channel"}], "riskFlags": []}`.

### `deep-research` — "Deep-Research-Auftrag stellen" (R_2a)

1. Write the research order to `<runDir>/research/raw/gemini-dr/<callId>_order.md`: context (idea, region,
   language), the deep questions, and the instruction to cover every scope point with dated, citable
   sources and to name prices, figures and years explicitly.
2. Run
   `node $S/providers/gemini-deep-research.mjs <runDir> --call <callId> --query-file <order.md> --live`.
   It takes minutes (it polls). The output names the raw file (one result per cited URL, redirects
   resolved, `contentKind: summary`) and the report text file.
3. On `refused` / `blocked`: add the returned risk flag, and answer the questions via `websearch` instead.
   On `partial` (`deep-research-timeout`): run the same command once more; it resumes the same call and
   never pays twice. A call still unfinished `stallMinutes` (research.yaml) after it was issued is
   cancelled by the script and returns `blocked` with `deep-research-stalled`: then run `--live` exactly
   once more for a fresh call, and fall back to `websearch` if that one stalls too. To stop a stuck call
   by hand: `node $S/providers/gemini-deep-research.mjs <runDir> --call <callId> --cancel`.
4. Then upgrade the cited sources to real page text:
   `node $S/providers/raw-fetch.mjs <runDir> --call <callId> --tool deep-research --query "<callId> citations" --urls-file <file>`
   with the URLs from the raw file (or run `--upgrade-summaries` after `normalize`).

### `websearch` — "Web-Suche durchfuehren" (R_2b)

1. Run `WebSearch` per question (German and English queries if the market is DACH). Pick the 2–5 best
   hits per question, preferring T1/T2 sources (§8.3) and dated pages.
2. Fetch their **real text** — do not use WebFetch for this:
   `node $S/providers/raw-fetch.mjs <runDir> --call <callId> --tool websearch --query "<q>" --url <u1> --url <u2> ...`
3. Only for URLs the script reports as failed (`failedUrls`) you may use `WebFetch`; write those results
   to a raw JSON (`{"tool":"websearch","query","callId","results":[{"url","title","summary","contentKind":"summary"}]}`)
   under `<runDir>/research/raw/websearch/`. Summaries never carry a key claim alone.

### `ddg` — "Bulk-URL-Discovery via DuckDuckGo" (R_2c)

Off by default. `node $S/providers/ddg-html.mjs <runDir> --call <callId> --query "<q>" ...` → a URL list;
fetch the useful ones with `raw-fetch.mjs --urls-file`. On `refused`, skip (no risk flag needed).
**DuckDuckGo is never the only source of a claim.**

### `normalize` — "Quellen normalisieren, hashen & deduplizieren" (R_3)

Deterministic. For every raw file of this call that has not been normalized yet:

```bash
node $S/normalize-sources.mjs <runDir> <raw.json>
```

→ `research/sources/SRC-<nnnn>_<slug>.md` + `.meta.json` with url, tier, contentKind, publishedAt,
contentHash. A later raw fetch of the same URL upgrades a summary record. Never write SRC files by hand.

### `claims` — "Claims extrahieren & Abdeckung pruefen" (R_3b)

1. Read the SRC records of this call (and the DR report text). Extract every statement the report will
   need as a claim into `<runDir>/research/claims/<callId>.draft.json` (format in the header of
   `$S/check-claims.mjs`):
   - `scopePoint` from `research.yaml` → `scope.<callId>`; `category` (market, number, competitor,
     regulation, voc, process, other); `key: true` for every figure, named competitor with
     positioning/price, regulation, and anything a gate or kill assumption builds on (§8.4);
   - `sources`: only SRC ids whose text actually supports the claim (read them; for `raw` sources quote
     the supporting sentence in your notes). Keep the ids of claims from an earlier round.
   - `tierOverride` only with a reason (e.g. a T3-looking domain that is an official statistics portal).
2. Run `node $S/check-claims.mjs <runDir> <callId> <draft.json> --round <gapFillRound>`.
3. Return its `gaps` (empty in round 1 — then untriangulated key claims are already downgraded to 🧠) in
   the JSON: `{"status", "artifacts": [ledger], "gaps": [...], "stats": {...}, "riskFlags", "summary"}`.

### `gapfill` — "Luecken gezielt nachsuchen" (R_2d)

At most once per call. For each gap from R_3b: one targeted `WebSearch` (scope gaps: the scope point for
this idea and region; claim gaps: the claim text plus "Quelle"/"Studie"/"Preis" etc.), then `raw-fetch.mjs`
as in `websearch`. No Deep Research. The Workflow then runs `normalize` and `claims` (round 1) again.

### `synthesize` — "Recherche-Synthese mit Zitaten verfassen" (R_4)

1. Write the report for the calling step:
   - DR-01 → `research/reports/DR-01_markt-wettbewerb.md` (type `research-markt-wettbewerb`)
   - DR-02 → `research/reports/DR-02_zielgruppe-voc.md` (type `research-zielgruppe-voc`)
   - DR-03 → `research/reports/DR-03_domaene-prozesse-regulatorik.md` (type `research-domaene-prozesse-regulatorik`)
   - K.3 → `research/reports/<callId>_factcheck.md` (type `research-synthese`)
   In gap-fill mode: update the existing report (the commit bumps its version).
2. One section per scope point (§8.2). **Use only claims from the ledger** `research/claims/<callId>.json`
   and cite them as `CLM-nnn (SRC-…, SRC-…)`. Mark 🔗 cited / 🧠 inferred per the ledger's `evidence`;
   say explicitly which scope points stay uncovered. DR-01 includes the competitor feature matrix as a
   table; DR-02 quotes VoC verbatim.
3. Check the citations: `node $S/check-claims.mjs <runDir> <callId> --verify-report <report.md>` must
   print `"status":"ok"`; fix the report until it does.
4. Commit the report body via `product-traceability/scripts/commit-artifact.mjs` (Gedächtnis §11.2) with
   `authored.sources` = the SRC ids used, `itemIndex` = one item per key claim (`CLM-…`, evidence from
   the ledger), and the ledger's risk flags.
5. Log `{"event":"research-done","element":"<Call_R1|Call_R2|Call_R3|K_3>"}` via `run-state.mjs event`.

## Return

Every mode returns JSON: `{"status", "artifacts": [...], "sources": ["SRC-…"], "riskFlags": [...], "summary"}`.
`route` additionally returns `channels` and `questions`; `claims` returns `gaps` and `stats`.

## Domain knowledge

Channels, tiers, triangulation, the claim ledger, gap-fill and the required scope per corpus are in
`${CLAUDE_PLUGIN_ROOT}/knowledge/process-rules.md` §8, the budget in §9.4, the report rubrics in §13 — cited directly
as reviewed local docs.
