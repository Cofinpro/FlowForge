---
name: product-panel-befragung
description: Runs the dark factory's synthetic panel process P ("Panel-Befragung") in one of four modes — interview, walkthrough, rating, vote — against the proto (3) or full (6) panel. Covers preparing the stimulus, the per-persona questioning (one product-persona call each), recording transcripts and forming the synthesis/vote. Use whenever a product-vision-to-user-stories step or phase gate needs panel input (1.1.5, 2.1.4, 2.2.1, 2.2.5, 3.1.1, 3.1.3, 6.1.2, G-P1…G-P3).
bpmn:
  file: product-vision-to-user-stories.bpmn
  elements: [PG_Call_P, P_Start, P_1, P_2, P_3, P_4, P_End]
---

# Panel-Befragung (process P)

Generated from `product-vision-to-user-stories.bpmn`'s reusable process `Process_P` (lanes
"Interviewer" and "Synthetisches Panel"). The Workflow script runs the three stages as separate
agent calls. "Persona befragen" is a multi-instance task, one `product-persona` call per profile in the
panel set. Binding rules: `${CLAUDE_PLUGIN_ROOT}/knowledge/process-rules.md` §7.

## Stage 1 — "Stimulus / Leitfaden vorbereiten" (P.1, `product-interviewer`)

Input from the Workflow: `runDir`, `mode`, `panelSet` (`proto` = `panel/proto/` from 1.1.4,
`full` = the 6 personas in `panel/personas/` from 2.1.3), `stepId`, and `stimulus` (the artifact under test).

1. Load the panel set. Proto means 3 personas. Full means 4 target users + Contrarian + Verweigerer.
2. Prepare one stimulus per mode:
   - `interview`: the guide from `interview-guide` with its version.
   - `walkthrough`: the journey steps to comment on, one by one.
   - `rating`: the item list and scale, e.g. Importance/Satisfaction 1–5 or VPC fit.
   - `vote`: the gate question plus a neutral summary of the phase result. For G-P3, also the
     price from `lean-canvas`.
3. Write the stimulus to `panel/guides/<stepId>_<mode>.md`. It uses **only the open part** of the
   profiles; the interviewer never sees hidden attributes.
4. Return `{"personas": [{"id": "P-001", "role": "target|contrarian|refuser", "profile": "<path>"}], "stimulusPath": "..."}`.

## Stage 2 — "Persona befragen" (P.2, `product-persona`, once per persona, in parallel)

The persona reads **only its own profile file**, open and hidden part, plus the stimulus, and
answers in role:
- Answers draw on past behaviour and its own situation.
- "weiß nicht" and "ist mir egal" are allowed.
- The profile's secret comes out only if a question really earns it.
- The persona never writes files; the hook blocks it.

It returns turns, comments, ratings or a vote with a reason, as JSON.

## Stage 3 — "Transkript / Antworten erfassen" (P.3) and "Synthese / Votum bilden" (P.4, `product-interviewer`)

1. Write `panel/sessions/.work/<stepId>_<mode>.json` from the persona answers and record it
   (deterministic):
   ```bash
   node ${CLAUDE_PLUGIN_ROOT}/skills/product-panel-befragung/scripts/record-transcript.mjs <runDir> <session.json>
   ```
   This creates one `T-<nn>` transcript per persona (🤖 synthetic).
2. Synthesise without reinterpreting any answer:
   - `interview`: key statements per persona and the problem-ranking result (adopted 2026-09-25).
     If the core problem is not in the top 3 for most target users, state the kill signal.
   - `rating`: a table of item × persona, with the target-user means and the dissent shown
     separately.
   - `vote`: every vote with its reason, and the Contrarian/Verweigerer objections listed
     separately. Those two votes never count toward a majority (§9.2).
3. Return `{"sessionPath", "transcripts": ["T-…"], "votes": [{persona, role, vote, wouldUse?, paysAtPrice?, reason}], "objections": [...], "problemRankingKill": false, "summary"}`.

## Budget

A panel call for a step with `sdlc:panel optional="true"` (2.2.1, 6.1.2) is skipped first when
the budget is low (§9.4). The Workflow decides and passes no `panelResult`.
