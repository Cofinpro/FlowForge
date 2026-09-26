---
name: trim-the-fat
description: Rewrite an existing skill package in place to remove verbosity and redundancy without changing its behavior. Use when the user explicitly asks to shorten, simplify, compress, or trim a skill.
disable-model-invocation: true
---

# Trim the Fat

**Weniger ist mehr.** Minimize text, not meaning.

## Preserve

Before editing, extract the skill's behavioral contract. Keep:

- triggers, boundaries, inputs, outputs, and ordering
- actions, constraints, prohibitions, and exceptions
- clarification, escalation, and failure behavior
- validation and completion criteria
- meaningful examples, references, and executable support files

A shorter skill must produce the same decisions and results. Never target a fixed reduction percentage.

## Workflow

1. Resolve the target; ask if ambiguous. Read `SKILL.md`, every supporting file, applicable repository instructions, and version-control status. Record the package size.
2. Express the contract as atomic obligations. For each item, ask: **Could removing this let a capable agent behave materially differently or incorrectly?** Then classify it:
   - **Keep:** necessary as written.
   - **Compress:** useful behavior expressed inefficiently.
   - **Move:** rare detail better loaded through a referenced support file.
   - **Delete:** repetition, filler, generic advice, decorative examples, or rationale that changes no decision.
3. Rewrite with:
   - concrete imperatives and one obligation per statement
   - one consistent term per concept
   - shared rules stated once
   - only deviations from normal agent behavior
   - condition-action rules or tables only when shorter
   - examples only when they define output, resolve ambiguity, or cover an edge case
   - rationale only when it changes judgment
4. Audit the entire package:
   - Preserve `name`, a precise routing `description`, and other functional frontmatter.
   - Consolidate overlapping documentation; remove or repair obsolete references.
   - Do not minify or refactor scripts, schemas, fixtures, or data merely to reduce size.
   - Delete a file only when it adds no unique behavior and is safely recoverable. Ask before deleting untracked or otherwise unrecoverable content.
5. Rewrite in place. Do not touch unrelated files, create backup copies, or revert pre-existing changes.
6. Validate:
   - Map every extracted obligation to the result.
   - Check frontmatter, links, referenced paths, and package structure.
   - Run existing package checks when available.
   - Inspect the final diff for changed meaning, broken references, and accidental scope.
   - Fix failures before finishing. Clarity wins when shorter wording is ambiguous.

## Report

Finish with:

- files changed or deleted
- size before and after
- behavior and edge cases intentionally preserved
- material removed or consolidated
- validation performed and unresolved risks

Keep the report short.
