#!/usr/bin/env node
// bpmn: {"file":"product-vision-to-user-stories.bpmn","elements":["R_2c"]}
//
// Adapter for "Bulk-URL-Discovery via DuckDuckGo" (R_2c, Process_R). OPTIONAL and OFF by default
// (research.yaml channels.ddg.enabled; docs/dark-factory/process-rules.md §8.0, D-24): DuckDuckGo has
// no official web-search API, so this reads the HTML results page, slowly. It only discovers URLs;
// the page text comes from raw-fetch.mjs. Never the only source of a claim.
//
// Usage: node ddg-html.mjs <runDir> --call <callId> --query "<q>" [--query "<q2>" ...]
// Output: research/raw/ddg/<callId>_ddg_<n>.json (normalize-sources.mjs format, contentKind none)
// and a URL list <...>.urls.txt for raw-fetch.mjs --urls-file. Disabled -> {status:"refused"}, exit 3.
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { loadConfig } from '../lib/research-config.mjs';
import { logEvent, die } from '../lib/df.mjs';

const argv = process.argv.slice(2);
const runDir = argv[0];
const opt = (n) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : undefined; };
const queries = argv.flatMap((a, i) => (a === '--query' ? [argv[i + 1]] : []));
const callId = opt('--call');
if (!runDir || !callId || !queries.length) die('Usage: ddg-html.mjs <runDir> --call <callId> --query "<q>" [...]');

const cfg = loadConfig();
if (!cfg.channels?.ddg?.enabled) { console.log(JSON.stringify({ status: 'refused', reason: 'ddg channel disabled in research.yaml (default)', riskFlags: [] })); process.exit(3); }
const P = cfg.providers['ddg-html'];

const results = [];
for (const q of queries) {
  try {
    const r = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(q)}`, { headers: { 'user-agent': 'Mozilla/5.0 (dark-factory-research)' }, signal: AbortSignal.timeout(15_000) });
    const html = r.ok ? await r.text() : '';
    for (const m of html.matchAll(/<a[^>]+class="result__a"[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)) {
      let url = m[1].replace(/&amp;/g, '&');
      const uddg = url.match(/[?&]uddg=([^&]+)/);
      if (uddg) url = decodeURIComponent(uddg[1]);
      if (!/^https?:/.test(url) || /duckduckgo\.com\/y\.js/.test(url)) continue; // skip ads
      results.push({ url, title: m[2].replace(/<[^>]+>/g, '').trim(), content: '', contentKind: 'none', sourceType: 'unknown', query: q });
      if (results.filter((x) => x.query === q).length >= (P.maxResults || 20)) break;
    }
    if (!r.ok) logEvent(runDir, { event: 'ddg-error', callId, status: r.status });
  } catch (e) {
    logEvent(runDir, { event: 'ddg-error', callId, error: String(e.message || e).slice(0, 120) });
  }
  await new Promise((s) => setTimeout(s, P.minIntervalMs || 1500));
}
const dir = path.join(runDir, 'research', 'raw', 'ddg');
mkdirSync(dir, { recursive: true });
let n = 1;
while (existsSync(path.join(dir, `${callId}_ddg_${n}.json`))) n++;
const rawFile = path.join(dir, `${callId}_ddg_${n}.json`);
writeFileSync(rawFile, JSON.stringify({ tool: 'ddg', query: queries.join(' | '), callId, provider: 'ddg-html', results }, null, 2) + '\n');
writeFileSync(rawFile.replace(/\.json$/, '.urls.txt'), [...new Set(results.map((r) => r.url))].join('\n') + '\n');
console.log(JSON.stringify({ status: results.length ? 'done' : 'partial', rawFile, urlsFile: rawFile.replace(/\.json$/, '.urls.txt'), urls: results.length, riskFlags: results.length ? [] : ['ddg-no-results'] }));
