#!/usr/bin/env node
// bpmn: {"file":"product-vision-to-user-stories.bpmn","elements":["K_1"]}
//
// The one sanctioned writer of artifact metadata (Gedächtnis §11.2). Deterministic — no LLM.
// Producing agents write only the Markdown BODY of their artifact and hand over the part of the
// metadata only they can know (the "authored" block: item index, sources, risk flags, type
// attributes, notes for the next step). Everything else — id, version, status, runId, producedBy,
// derivedFrom with versions and hashes, evidence mix, item list, history — is computed here.
// Hooked to K_1 "Rubric laden" because K.1 refuses to judge an artifact that was not committed.
//
// Usage:
//   node commit-artifact.mjs commit <runDir> <file.md> --step <elementId> [--type <artifactType>]
//        [--from <path>]... [--authored <file.json>]     (authored JSON from stdin when --authored is omitted)
//   node commit-artifact.mjs attrs  <runDir> <file.md> '<json>'   # merge into authored.attributes (e.g. {"slice":1}), no version bump
//   node commit-artifact.mjs query  <runDir> [--type t] [--attr k=v] [--status s]   # list committed artifacts as JSON
//   node commit-artifact.mjs check  <runDir> [<file.md> ...]      # every run Markdown has a matching sidecar
//   node commit-artifact.mjs schema                              # print the authored JSON Schema
//
// commit: writes <file>.meta.json, re-renders <file>.md with a read-only frontmatter, snapshots both
// into history/<id>/v<version>.*, appends "artifact-committed" to log/events.jsonl and prints
// {id, version, status, meta, items, evidence, derivedFrom, warnings}. Re-committing an unchanged
// body + authored block is a no-op (idempotent resume). A changed one bumps the version and resets
// status to draft and gate to null — only write-gate-record.mjs sets passed/passed-with-risk.
// Amend: when --step does not produce the file's type but the file is already committed (e.g. 6.1.1
// appends ACs to a story card), id/type/producer/derivedFrom are kept and the step is recorded in amendedBy.
import path from 'node:path';
import { readFileSync } from 'node:fs';
import { rerender, readMeta, walkMd, checkCommitted, kindOfPath, logEvent, die } from './lib/df.mjs';
import { AUTHORED_SCHEMA, commitArtifact, committed, rel, CommitError } from './lib/commit.mjs';

const flagArgs = (args, name) => args.flatMap((a, i) => (a === name ? [args[i + 1]] : []));
const flagArg = (args, name) => flagArgs(args, name)[0];

function commit(runDir, mdPath, args) {
  const raw = flagArg(args, '--authored') ? readFileSync(flagArg(args, '--authored'), 'utf8') : readFileSync(0, 'utf8');
  let authored;
  try { authored = JSON.parse(raw || '{}'); } catch (e) { die(`authored JSON does not parse: ${e.message}`); }
  try {
    console.log(JSON.stringify(commitArtifact(runDir, mdPath, { stepId: flagArg(args, '--step'), type: flagArg(args, '--type'), authored, from: flagArgs(args, '--from') })));
  } catch (e) {
    if (e instanceof CommitError) die(e.message);
    throw e;
  }
}

const [, , cmd, ...rest] = process.argv;
if (cmd === 'commit') {
  const [runDir, mdPath, ...args] = rest;
  if (!runDir || !mdPath) die('Usage: node commit-artifact.mjs commit <runDir> <file.md> --step <elementId> [--type <t>] [--from <path>]... [--authored <file.json>]');
  commit(runDir, mdPath, args);
} else if (cmd === 'attrs') {
  const [runDir, mdPath, json] = rest;
  if (!runDir || !mdPath || !json) die("Usage: node commit-artifact.mjs attrs <runDir> <file.md> '<json>'");
  const meta = readMeta(mdPath);
  if (!meta) die(`${mdPath} has no sidecar — commit it first`);
  let patch;
  try { patch = JSON.parse(json); } catch (e) { die(`attributes JSON does not parse: ${e.message}`); }
  meta.authored.attributes = { ...(meta.authored.attributes || {}), ...patch };
  rerender(mdPath, meta);
  logEvent(runDir, { event: 'artifact-attributes', id: meta.id, attributes: Object.keys(patch) });
  console.log(JSON.stringify({ id: meta.id, version: meta.version, attributes: meta.authored.attributes }));
} else if (cmd === 'query') {
  const [runDir, ...args] = rest;
  if (!runDir) die('Usage: node commit-artifact.mjs query <runDir> [--type t] [--attr k=v] [--status s]');
  const type = flagArg(args, '--type');
  const status = flagArg(args, '--status');
  const attrs = flagArgs(args, '--attr').map((a) => a.split('='));
  const rows = committed(runDir).filter(({ meta }) => (!type || meta.type === type) && (!status || meta.status === status)
    && attrs.every(([k, v]) => String(meta.authored?.attributes?.[k]) === v));
  console.log(JSON.stringify(rows.map(({ md, meta }) => ({ id: meta.id, type: meta.type, version: meta.version, status: meta.status, path: rel(runDir, md), items: meta.derived?.items || [], attributes: meta.authored?.attributes || {} })), null, 2));
} else if (cmd === 'check') {
  const [runDir, ...files] = rest;
  if (!runDir) die('Usage: node commit-artifact.mjs check <runDir> [<file.md> ...]');
  const targets = files.length ? files : walkMd(runDir).filter((f) => kindOfPath(path.resolve(f)));
  const bad = targets.map((f) => ({ path: rel(runDir, f), problems: checkCommitted(f, kindOfPath(path.resolve(f)) || 'artifact') })).filter((x) => x.problems.length);
  console.log(JSON.stringify({ checked: targets.length, problems: bad }, null, 2));
  process.exit(bad.length ? 1 : 0);
} else if (cmd === 'schema') {
  console.log(JSON.stringify(AUTHORED_SCHEMA, null, 2));
} else {
  die('Usage: node commit-artifact.mjs commit|attrs|query|check|schema ...');
}
process.exit(0);
