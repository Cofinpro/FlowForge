---
name: story-backlog-publish
description: Writes approved changes into the GitHub product backlog with gh — the note on an open story, the Opportunity Backlog entry, the merge into a duplicate, the new story in the Ready column and the marks on affected stories — only after the matching approval and never twice on a resumed run. Use only from the user-story-refinement skill chain, right after "Änderungshinweis an offene Story freigeben", "Parken im Opportunity Backlog freigeben", "Zusammenführung freigeben" or "Story priorisieren & Übernahme ins Backlog freigeben".
bpmn:
  file: user-story-refinement.bpmn
  elements: [I4, I6, P6, P8, P10]
---

# Freigegebene Änderungen ins Backlog schreiben

Generated from `user-story-refinement.bpmn`'s write steps "Änderungshinweis an offener Story ergänzen"
(I4), "Feedback im Opportunity Backlog anlegen" (I6), "Mit bestehender Story zusammenführen" (P6),
"Story im Backlog anlegen & in Ready-Spalte stellen" (P8) and "Betroffene Stories im Backlog
markieren" (P10) (serviceTasks, lane "Product Owner / BA") by `bpmn2agent-generate`. They are the only
steps of the workflow that change the backlog, so they live in one skill that refuses to write
without approval. The calling skill names the step to run.

## Rules for every write

1. **Approval first.** In `stories/<storyId>/00_run.md`, `checkpoints.<id>` of the approving step
   (I3, I5, P9 or E4, named in each section) must have `decision: approved`, and the approved content
   (`99_uebergabe.md`, or the entry in `09_aenderungsvorschlaege.md`) must have `status: approved`.
   Otherwise stop and report; write nothing. For P8 and P10 also compare the `version` of
   `04_story.md`, `05_akzeptanzkriterien.md` and `06_schaetzung.md` with
   `checkpoints.E4.approvedVersions`; a higher version means the story changed after the approval →
   stop and send the user back to E4.
2. **Only the approved content.** Send exactly the approved text, never a rewrite. The calling skill
   wrote it at the approval to `stories/<storyId>/publish/<step id>.md`; pass that file with
   `--body-file` (never inline with `--body`, which breaks on quotes, `$` and backticks).
3. **Only the backlog of this run.** Take repo and project from `backlog` in `01_feedback.md`
   (e.g. `owner/repo, project 3`). Pass `-R <owner/repo>` to every `gh issue` command and
   `--owner <owner>` to every `gh project` command except `item-edit`, which takes `--project-id`.
   Never write anywhere else.
4. **Never twice.** Before every write, check in this order:
   1. The URL is already recorded (field named in the section) → skip.
   2. The marker exists. Every text this skill sends ends with the literal marker
      `<!-- user-story-refinement: <storyId> <step id> -->` (e.g.
      `<!-- user-story-refinement: US-20261004-export P8 -->`; the step id is the one in each
      heading). For an issue (I6, P8):
      `gh issue list -R <repo> --author @me --state all --limit 50 --json url,body --jq '.[] | select(.body | contains("<marker>")) | .url'`.
      For a comment or an appended section (I4, P6, P10): `gh issue view <target> -R <repo> --json body,comments`
      and look for the exact marker. Found → record its URL and skip.
   3. Only then the freshness check (rule 6).
5. **Record right away.** Write the URL `gh` returns into the field named in the section before the
   next `gh` call.
6. **Freshness before changing someone else's issue** (I4, P6, P10): re-read the target with
   `gh issue view <target> -R <repo> --json updatedAt,body,state`. If `updatedAt` differs from the
   `baseUpdatedAt` recorded at the approval, stop and ask the user to approve again. Add, never
   rewrite: notes are comments, a body change appends the approved section to the body as it is now.
7. **Errors stop.** On any `gh` error (not logged in, missing `project` scope, wrong number, missing
   label) show the raw error and ask via `AskUserQuestion`: retry after fixing it (recommended) / leave
   this write undone and note it as a risk. Never retry by creating something new.

## I4 — "Änderungshinweis an offener Story ergänzen"

Approval: `checkpoints.I3`. Input: `99_uebergabe.md` (`target` = URL of the open story),
`publish/I4.md` (the approved comment with its marker). Write the comment with
`gh issue comment <target> -R <repo> --body-file stories/<storyId>/publish/I4.md`. Record the comment
URL as `backlogItem` in `99_uebergabe.md`.

## I6 — "Feedback im Opportunity Backlog anlegen"

Approval: `checkpoints.I5`. Input: `99_uebergabe.md` (approved `title`), `publish/I6.md` (the approved
body with its marker). Create the entry with
`gh issue create -R <repo> --title "<approved title>" --body-file stories/<storyId>/publish/I6.md --label opportunity`.
Record the issue URL as `backlogItem` in `99_uebergabe.md`.

## P6 — "Mit bestehender Story zusammenführen"

Approval: `checkpoints.P9`. Input: the merge entry in `09_aenderungsvorschlaege.md` (target issue,
`baseUpdatedAt`), `publish/P6.md` (the approved section with its marker). After rules 4 and 6, write
the target's current body followed by `publish/P6.md` into `stories/<storyId>/publish/P6-body.md` and
send it with `gh issue edit <target> -R <repo> --body-file stories/<storyId>/publish/P6-body.md`.
Record the issue URL as `appliedUrl` of the entry and set the entry and the file to `status: applied`.
Send only the approved section: the merge criteria (`${CLAUDE_SKILL_DIR}/references/P6.md`) were
applied when it was drafted at "Zusammenführung freigeben".

## P8 — "Story im Backlog anlegen & in Ready-Spalte stellen"

Approval: `checkpoints.E4` (`priority` = the value for the project field "Priority" in that field's
type, `approvedVersions`). Input: `publish/P8.md` (first line `# <approved title>`, then the approved
body with its marker), the epic label from `04_story.md`.

1. **Issue.** If `10_ready-story.md` already has `backlogItem`, use it. Otherwise check the marker
   (rule 4); if nothing is found, write the body (everything after the title line) to
   `stories/<storyId>/publish/P8-body.md` and create the issue with
   `gh issue create -R <repo> --title "<approved title>" --body-file stories/<storyId>/publish/P8-body.md --label "epic:<name>"`.
   Write `10_ready-story.md` right away (frontmatter `storyId`, `version`, `status: draft`, `epic`,
   `storyPoints`, `priority`, `backlogItem`).
2. **Project item.** `gh project item-add <number> --owner <owner> --url <backlogItem> --format json`
   returns the item, also when the issue is already in the project; take `<item id>` from its `id`.
3. **Ready and priority.** Get the project id with `gh project view <number> --owner <owner> --format json`
   and the ids of the "Status" field, its option "Ready" and the "Priority" field with
   `gh project field-list <number> --owner <owner> --format json`. Set both with
   `gh project item-edit --id <item id> --project-id <project id> --field-id <field id>` plus
   `--single-select-option-id <option id>` (Status, and Priority when it's a single select) or
   `--number <value>` (Priority as a number). A field or option that doesn't exist → rule 7.
4. Set `10_ready-story.md` to `status: sprint-ready`.

## P10 — "Betroffene Stories im Backlog markieren"

Approval: `checkpoints.E4` plus the per-proposal `decision` in `09_aenderungsvorschlaege.md`. Input:
`proposals` in `09_aenderungsvorschlaege.md`, `10_ready-story.md` (`backlogItem`). For every proposal
with `decision: approved` and no `appliedUrl`: append the link to `backlogItem` and the marker
`<!-- user-story-refinement: <storyId> P10-<n> -->` (`<n>` = the proposal's position) to the approved
note in `stories/<storyId>/publish/P10-<n>.md`, apply rules 4 and 6, then post it with
`gh issue comment <target> -R <repo> --body-file stories/<storyId>/publish/P10-<n>.md` and record the
comment URL as `appliedUrl`. Rejected proposals stay untouched. Report done only when every approved
proposal has an `appliedUrl` or the user chose to leave it undone (rule 7). No file or "keine" →
nothing to do.

## Kontextquellen

Knowledge stores, distilled at generation time into one file per task; no tool call at run time.

- **Product-Methodik: Plausibilität & Freigabe** (wissen): "Mit bestehender Story zusammenführen" → `${CLAUDE_SKILL_DIR}/references/P6.md`

Live and memory stores, used at run time:

- **Product Backlog & User Story Map** (live, write — nur nach Freigabe): "Änderungshinweis an offener Story ergänzen" posts the approved comment on the open story with `Bash(gh issue comment:*)`, only after "Änderungshinweis an offene Story freigeben"; "Feedback im Opportunity Backlog anlegen" creates the approved entry with `Bash(gh issue create:*)`, only after "Parken im Opportunity Backlog freigeben". Look-ups for rule 4 use `Bash(gh issue list:*)` and `Bash(gh issue view:*)`. Claude Code asks again at each write (write-guard hook). Without that confirmation, do not write.
- **Product Backlog: freigegebene Änderungen** (live, write — nur nach Freigabe): "Mit bestehender Story zusammenführen" appends the approved section with `Bash(gh issue edit:*)`, only after "Zusammenführung freigeben"; "Story im Backlog anlegen & in Ready-Spalte stellen" uses `Bash(gh issue create:*)`, `Bash(gh project item-add:*)` and `Bash(gh project item-edit:*)`, and "Betroffene Stories im Backlog markieren" uses `Bash(gh issue comment:*)`, both only after "Story priorisieren & Übernahme ins Backlog freigeben". Look-ups use `Bash(gh issue list:*)`, `Bash(gh issue view:*)`, `Bash(gh project view:*)`, `Bash(gh project field-list:*)` and `Bash(gh project item-list:*)`. Claude Code asks again at each write (write-guard hook). Without that confirmation, do not write.
