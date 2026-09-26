---
name: product-init
description: Prepares the current repo as a dark-factory target project before the first run — detects the stack, proposes the target platform, asks the user once and writes .dark-factory/project.json. Use when the user wants to set up, init or prepare a repo for the dark factory, or before the first /dark-factory:product-vision-to-user-stories run.
bpmn:
  file: product-vision-to-user-stories.bpmn
  elements: [Start_Geschaeftsidee]
---

# Zielprojekt einrichten (before "Geschaeftsidee / Marktbedarf erkannt")

Makes the repo Claude runs in a target project (D-32, D-33, D-37): writes the manifest
`.dark-factory/project.json` (df.project/v1) that S0 reads for the target architecture and language
and `publish-results.mjs` reads for `publishDir`, and puts `runs/` into `.gitignore`.

This is the only interactive part of the factory. It runs **before** a run, with a human present, so
asking is allowed here. It never starts the workflow.

Without it, the first run creates a default manifest with an empty `platform`, and S0 has to guess
the target architecture (🧠 inferred) — every later step (walking skeleton, spikes, size classes)
builds on that guess.

## Procedure

1. Detect: `node ${CLAUDE_PLUGIN_ROOT}/skills/product-init/scripts/init-project.mjs detect`
   → existing `manifest` (or null), `empty`, stack `signals`, `topLevel` entries, `readmeHead`.
   Open the files behind the strongest signals if you need more detail (for example the frontend
   and backend `package.json`/`pom.xml`, the `Dockerfile`, Terraform providers).
2. Propose the manifest:
   - `platform.architecture`: one line on the shape of the system, e.g. "SPA + REST backend,
     containerised, AWS (ECS)" or "Monolith, server-rendered". Only what the repo shows.
   - `platform.stack`: the concrete technologies, e.g. "Vue 3 + TypeScript + Web Awesome; Spring
     Boot 3 (Java 21); PostgreSQL; Docker; GitHub Actions".
   - `language`: `de` unless the repo is clearly English-only (README, docs) — ask if unsure.
   - `name`: the existing name, else the repo folder name. `publishDir`: keep `docs/product` unless
     that path is already used for something else.
   - If a manifest exists, show what would change against it.
3. Ask the user **once** (AskUserQuestion): your proposal as the recommended option, one plausible
   alternative if the signals are ambiguous, and "Other" for their own text. Name the evidence
   ("from `frontend/package.json`: vue, vite; from `backend/pom.xml`: spring-boot").
   - **Empty or greenfield repo** (`empty: true` or no stack signals): there is nothing to detect.
     Ask for the intended target architecture and stack instead; offer "leave open" — then S0 infers
     it and flags it 🧠.
4. Write the confirmed values:
   `node ${CLAUDE_PLUGIN_ROOT}/skills/product-init/scripts/init-project.mjs write <<'JSON'`
   `{"language": "de", "platform": {"architecture": "…", "stack": "…"}}`
   `JSON`
   It merges into an existing manifest (only the fields you pass), validates it and adds `runs/`
   to `.gitignore`. Never write `.dark-factory/project.json` by hand.
5. Tell the user in two or three lines: what was written, that the manifest belongs in git, and how
   to start a run (`/dark-factory:product-vision-to-user-stories` with args `{"runId": "<date>_<slug>_<4 hex>", "idea": "…"}`).
   Do not start it.

## Rules

- Describe what the repo **is**, not what it should become — unless it is empty and the user tells
  you the plan.
- Keep `platform` short: S0 copies it into the idea brief as `given (project manifest)`.
- Re-running is safe: it shows the current manifest and only changes what the user confirms.
- Binding rules: `${CLAUDE_PLUGIN_ROOT}/knowledge/process-rules.md` §14 (idea brief, target platform).
