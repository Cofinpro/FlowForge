#!/usr/bin/env node
// bpmn: {"file":"product-vision-to-user-stories.bpmn","elements":["R_3"]}
//
// Generated from "Quellen normalisieren, hashen & deduplizieren" (scriptTask, Process_R) in
// product-vision-to-user-stories.bpmn by flowforge-generate. Deterministic step — no LLM call
// (Gedächtnis §8 normalization rules).
//
// Usage: node normalize-sources.mjs <runDir> <rawResults.json>
//   rawResults.json: { "tool": "deep-research|websearch|ddg", "query": "...", "callId": "DR-01|R2|K3-...",
//                      "results": [{ "url", "title", "content", "contentKind"?: "raw|summary|none", "summary"?,
//                                   "publishedAt"?, "sourceType"?, "tier"? }] }
//   (written by providers/gemini-deep-research.mjs, providers/raw-fetch.mjs, providers/ddg-html.mjs or the agent)
// Tier default from research.yaml (Gedächtnis §8.3). A raw fetch upgrades an earlier summary record of the same URL.
// Effect: keeps the raw file unchanged under research/raw/<tool>/, creates or merges one
// research/sources/SRC-<nnnn>_<slug>.meta.json (schema df.source/v1) + rendered .md per result
// (dedupe by SHA-256 of cleaned text or canonical URL; the query history is appended on merge). Prints {created: [...], merged: [...]} as JSON.
import { createHash } from 'node:crypto';
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { readJson, writeRecord, rerender, walkMeta, mdPathOf, nextId, logEvent, die, SCHEMA } from './lib/df.mjs';
import { tierOf, siteOf } from './lib/research-config.mjs';

const [, , runDir, rawFile] = process.argv;
if (!runDir || !rawFile) die('Usage: node normalize-sources.mjs <runDir> <rawResults.json>');

const raw = readJson(rawFile);
const tool = raw.tool;
if (!['deep-research', 'websearch', 'ddg'].includes(tool)) die(`unknown tool "${tool}"`);

const rawDir = path.join(runDir, 'research', 'raw', { 'deep-research': 'gemini-dr', websearch: 'websearch', ddg: 'ddg' }[tool]);
mkdirSync(rawDir, { recursive: true });
const rawTarget = path.join(rawDir, path.basename(rawFile));
if (path.resolve(rawFile) !== path.resolve(rawTarget)) copyFileSync(rawFile, rawTarget);

const clean = (t = '') => t.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const canonical = (u) => {
  try {
    const x = new URL(u);
    x.hash = '';
    for (const k of [...x.searchParams.keys()]) if (/^(utm_|fbclid|gclid|ref$)/.test(k)) x.searchParams.delete(k);
    return (x.hostname.replace(/^www\./, '') + x.pathname.replace(/\/$/, '') + (x.search || '')).toLowerCase();
  } catch { return String(u).toLowerCase(); }
};
const slug = (s) => String(s || 'source').toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48) || 'source';

const srcDir = path.join(runDir, 'research', 'sources');
const existing = walkMeta(srcDir).map((m) => ({ f: mdPathOf(m), data: readJson(m) }));
const created = [];
const merged = [];
const upgraded = [];
const now = new Date().toISOString();

for (const r of raw.results || []) {
  if (!r.url) continue;
  // contentKind (Gedächtnis §8.3): raw = real page text, summary = model-written text only, none = fetch failed
  const kind = r.contentKind || (r.content ? 'raw' : r.summary ? 'summary' : 'none');
  const text = clean(kind === 'raw' ? r.content : r.summary || r.content || '');
  const hash = createHash('sha256').update(text).digest('hex');
  const canon = canonical(r.url);
  // Dedupe on the content hash only for real page text: Deep Research cites many URLs with the same sentence.
  const hit = existing.find((e) => e.data.canonicalUrl === canon || (kind === 'raw' && text && e.data.contentKind === 'raw' && e.data.contentHash === hash));
  const excerpt = (kind === 'raw' ? text.slice(0, 1500) : r.summary || text.slice(0, 600)) || '(no content returned)';
  if (hit) {
    const q = new Set([...(hit.data.queryHistory || [hit.data.query]), raw.query]);
    hit.data.queryHistory = [...q];
    hit.data.tools = [...new Set([...(hit.data.tools || [hit.data.tool]), tool])];
    if (kind === 'raw' && hit.data.contentKind !== 'raw') { // upgrade a summary/none record with the real page text
      Object.assign(hit.data, { contentKind: 'raw', contentHash: hash, raw: path.relative(runDir, rawTarget), publishedAt: r.publishedAt || hit.data.publishedAt || null, title: r.title || hit.data.title, upgradedAt: now });
      writeRecord(hit.f, hit.data, sourceBody(hit.data, excerpt, hit.data.citedText));
      upgraded.push(hit.data.id);
    } else {
      rerender(hit.f, hit.data);
    }
    merged.push(hit.data.id);
    continue;
  }
  const id = nextId(srcDir, 'SRC', 4);
  const data = {
    schema: SCHEMA.source,
    id,
    url: r.url,
    canonicalUrl: canon,
    title: r.title || r.url,
    retrievedAt: now,
    publishedAt: r.publishedAt || null,
    tool,
    query: raw.query,
    queryHistory: [raw.query],
    callId: raw.callId || null,
    contentHash: hash,
    contentKind: kind,
    tier: r.tier || tierOf(r.url),
    site: siteOf(r.url),
    sourceType: r.sourceType || 'unknown',
    raw: path.relative(runDir, rawTarget),
    ...(r.error ? { fetchError: r.error } : {}),
    ...(kind === 'summary' && r.summary ? { citedText: r.summary.slice(0, 1500) } : {}),
  };
  const file = path.join(srcDir, `${id}_${slug(r.title)}.md`);
  writeRecord(file, data, sourceBody(data, excerpt));
  existing.push({ f: file, data });
  created.push(id);
}

function sourceBody(d, excerpt, citedText) {
  const head = `# ${d.title}\n\n- URL: ${d.url}\n- Tier: ${d.tier} · contentKind: ${d.contentKind} · published: ${d.publishedAt || 'unknown'}\n`;
  const cited = citedText ? `\n## Cited by Deep Research\n\n${citedText}\n` : '';
  return `${head}\n## ${d.contentKind === 'raw' ? 'Excerpt (raw page text)' : 'Summary'}\n\n${excerpt}\n${cited}`;
}

logEvent(runDir, { event: 'sources-normalized', element: 'R_3', tool, callId: raw.callId || null, created: created.length, merged: merged.length, upgraded: upgraded.length });
console.log(JSON.stringify({ created, merged, upgraded }));
process.exit(0);
