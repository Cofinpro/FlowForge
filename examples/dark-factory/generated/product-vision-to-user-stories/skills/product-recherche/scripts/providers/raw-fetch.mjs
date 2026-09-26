#!/usr/bin/env node
// bpmn: {"file":"product-vision-to-user-stories.bpmn","elements":["R_2b","R_2d"]}
//
// Adapter for the `fetch` channel of process R (docs/dark-factory/process-rules.md §8.0, §8.3): loads
// the real page text of URLs found by WebSearch, Deep Research or DDG, so every source keeps its raw
// text and a stable contentHash (instead of a model-written WebFetch summary). Free — no paid API.
//
// Usage:
//   node raw-fetch.mjs <runDir> --call <callId> --tool websearch|deep-research|ddg --query "<q>" (--url <u> ... | --urls-file <file>)
//   node raw-fetch.mjs <runDir> --call <callId> --upgrade-summaries    # re-fetch every SRC of this call with contentKind summary
// Behaviour: robots.txt respected, one request per host per minIntervalMsPerHost, timeout + size cap,
// grounding redirect links resolved. Main text via Mozilla Readability + jsdom (installed on first use
// into DF_TOOLS_CACHE, never into the repo); if that is unavailable, a plain HTML strip.
// Output: research/raw/<tool>/<callId>_fetch_<n>.json in the normalize-sources.mjs format with
// contentKind raw | none per URL. A failed URL is kept with contentKind none — the agent may then use
// WebFetch and record the result as contentKind summary. Prints a JSON summary.
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { loadConfig } from '../lib/research-config.mjs';
import { readJson, walkMeta, logEvent, die } from '../lib/df.mjs';

const argv = process.argv.slice(2);
const runDir = argv[0];
const opt = (n) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : undefined; };
const all = (n) => argv.flatMap((a, i) => (a === n ? [argv[i + 1]] : []));
const callId = opt('--call');
if (!runDir || !callId) die('Usage: raw-fetch.mjs <runDir> --call <callId> --tool <tool> --query "<q>" (--url <u>... | --urls-file <f>) | --upgrade-summaries');

const P = loadConfig().providers['raw-fetch'];
let tool = opt('--tool') || 'websearch';
let query = opt('--query') || '';
let urls = [...all('--url'), ...(opt('--urls-file') ? readFileSync(opt('--urls-file'), 'utf8').split(/\s+/) : [])].filter(Boolean);
if (argv.includes('--upgrade-summaries')) {
  const metas = walkMeta(path.join(runDir, 'research', 'sources')).map((f) => readJson(f)).filter((m) => m.callId === callId && m.contentKind !== 'raw');
  urls = metas.map((m) => m.url);
  tool = metas[0]?.tool || tool;
  query = query || `upgrade summaries of ${callId}`;
}
urls = [...new Set(urls)];
if (!urls.length) { console.log(JSON.stringify({ status: 'done', fetched: 0, failed: 0, rawFile: null })); process.exit(0); }

const lastHit = new Map();
const robots = new Map();
const extractor = loadReadability();
const results = [];
for (const u of urls) results.push(await fetchOne(u));

const dir = path.join(runDir, 'research', 'raw', { 'deep-research': 'gemini-dr', websearch: 'websearch', ddg: 'ddg' }[tool] || 'websearch');
mkdirSync(dir, { recursive: true });
let n = 1;
while (existsSync(path.join(dir, `${callId}_fetch_${n}.json`))) n++;
const rawFile = path.join(dir, `${callId}_fetch_${n}.json`);
writeFileSync(rawFile, JSON.stringify({ tool, query, callId, provider: 'raw-fetch', extractor: extractor ? 'readability' : 'strip', results }, null, 2) + '\n');
const failed = results.filter((r) => r.contentKind === 'none');
logEvent(runDir, { event: 'raw-fetch', callId, tool, fetched: results.length - failed.length, failed: failed.length });
console.log(JSON.stringify({ status: 'done', rawFile, fetched: results.length - failed.length, failed: failed.length, failedUrls: failed.map((r) => r.url) }));

// ------------------------------------------------------------------ helpers
async function fetchOne(input) {
  let url = input;
  try {
    if (/grounding-api-redirect/.test(url)) url = (await fetch(url, { method: 'HEAD', redirect: 'manual', signal: AbortSignal.timeout(10_000) })).headers.get('location') || url;
    const u = new URL(url);
    if (P.respectRobots && !(await allowed(u))) return { url, title: u.hostname, content: '', contentKind: 'none', error: 'robots.txt disallows' };
    await pace(u.host);
    const r = await fetch(u, { headers: { 'user-agent': P.userAgent, accept: 'text/html,application/xhtml+xml,text/plain;q=0.8' }, redirect: 'follow', signal: AbortSignal.timeout((P.timeoutSeconds || 20) * 1000) });
    if (!r.ok) return { url, title: u.hostname, content: '', contentKind: 'none', error: `HTTP ${r.status}` };
    const type = r.headers.get('content-type') || '';
    if (!/html|text\/plain|xml/.test(type)) return { url, title: u.hostname, content: '', contentKind: 'none', error: `unsupported content-type ${type}` };
    const html = (await r.text()).slice(0, P.maxBytes || 2_000_000);
    const { title, text, published } = extract(html, r.url || url);
    if (text.length < 200) return { url: r.url || url, title, content: text, contentKind: 'none', error: 'too little text (JavaScript page or paywall?)' };
    return { url: r.url || url, title, content: text, contentKind: 'raw', publishedAt: published || null, sourceType: 'unknown' };
  } catch (e) {
    return { url, title: url, content: '', contentKind: 'none', error: String(e.message || e).slice(0, 200) };
  }
}

async function allowed(u) {
  if (!robots.has(u.host)) {
    let rules = [];
    try {
      const r = await fetch(`${u.protocol}//${u.host}/robots.txt`, { headers: { 'user-agent': P.userAgent }, signal: AbortSignal.timeout(8000) });
      if (r.ok) rules = parseRobots(await r.text());
    } catch { /* no robots.txt -> allowed */ }
    robots.set(u.host, rules);
  }
  const p = u.pathname + u.search;
  let verdict = true;
  let best = -1;
  for (const { allow, path: rp } of robots.get(u.host)) if (rp && p.startsWith(rp) && rp.length > best) { best = rp.length; verdict = allow; }
  return verdict;
}
function parseRobots(txt) {
  const out = [];
  let applies = false;
  for (const line of txt.split('\n').map((l) => l.replace(/#.*/, '').trim()).filter(Boolean)) {
    const [k, ...v] = line.split(':');
    const val = v.join(':').trim();
    if (/^user-agent$/i.test(k)) applies = val === '*' || /dark-factory/i.test(val);
    else if (applies && /^disallow$/i.test(k)) out.push({ allow: false, path: val });
    else if (applies && /^allow$/i.test(k)) out.push({ allow: true, path: val });
  }
  return out;
}
async function pace(host) {
  const wait = (lastHit.get(host) || 0) + (P.minIntervalMsPerHost || 1000) - Date.now();
  if (wait > 0) await new Promise((s) => setTimeout(s, wait));
  lastHit.set(host, Date.now());
}

function loadReadability() {
  const cache = process.env.DF_TOOLS_CACHE || path.join(os.homedir(), '.cache', 'bpmn-authoring-tools');
  try {
    if (!existsSync(path.join(cache, 'node_modules', '@mozilla', 'readability')) || !existsSync(path.join(cache, 'node_modules', 'jsdom'))) {
      mkdirSync(cache, { recursive: true });
      if (!existsSync(path.join(cache, 'package.json'))) execFileSync('npm', ['init', '-y'], { cwd: cache, stdio: 'ignore' });
      execFileSync('npm', ['install', '--no-audit', '--no-fund', '--silent', '@mozilla/readability', 'jsdom'], { cwd: cache, stdio: 'ignore' });
    }
    const req = createRequire(path.join(cache, 'package.json'));
    return { Readability: req('@mozilla/readability').Readability, JSDOM: req('jsdom').JSDOM, VirtualConsole: req('jsdom').VirtualConsole };
  } catch {
    return null; // fall back to the plain strip
  }
}
function extract(html, url) {
  const published = (html.match(/"datePublished"\s*:\s*"([^"]+)"/) || html.match(/<meta[^>]+(?:article:published_time|name="date")[^>]+content="([^"]+)"/i) || [])[1];
  if (extractor) {
    try {
      const vc = new extractor.VirtualConsole(); // silence CSS/script parse noise
      const dom = new extractor.JSDOM(html, { url, virtualConsole: vc });
      const a = new extractor.Readability(dom.window.document).parse();
      if (a?.textContent) return { title: (a.title || '').trim() || new URL(url).hostname, text: a.textContent.replace(/\s+/g, ' ').trim(), published: published || a.publishedTime };
    } catch { /* strip below */ }
  }
  const title = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1]?.trim() || url;
  const text = html.replace(/<(script|style|noscript|nav|footer|header)[\s\S]*?<\/\1>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
  return { title, text, published };
}
