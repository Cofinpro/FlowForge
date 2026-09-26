// bpmn: {"file":"product-vision-to-user-stories.bpmn","elements":["S6.2.1","S6.2.2","S6.2.5"]}
// Item graph shared by the three traceability scripts (Gedächtnis §10). Items come from every
// artifact sidecar's `authored.itemIndex: [{id, derivedFrom: [...], evidence, refs, status?}]`
// (<file>.meta.json, never the rendered Markdown frontmatter); the graph is traversed
// deterministically — no LLM.
import path from 'node:path';
import { readJson, walkMeta, mdPathOf, SCHEMA } from './df.mjs';

// Required chain AC -> ST -> UT -> EP/ACTV -> (OPP | JOB) -> IMP -> GOAL -> VIS
export const PARENTS = {
  AC: ['ST'], ST: ['UT'], UT: ['EP', 'ACTV'], EP: ['ACTV', 'OPP', 'JOB'], ACTV: ['OPP', 'JOB'],
  OPP: ['IMP'], JOB: ['IMP'], IMP: ['GOAL'], GOAL: ['VIS'], VIS: [],
};
// items with these statuses are out of the backlog (6.2.4 discards, 5.1.3 supersedes split parents)
export const INACTIVE = ['discarded', 'superseded'];
export const prefixOf = (id) => String(id).replace(/-\d+$/, '');

export function loadGraph(runDir) {
  const items = new Map();
  const dirs = ['artifacts', 'backlog', 'panel'].map((d) => path.join(runDir, d));
  for (const mf of dirs.flatMap(walkMeta)) {
    const data = readJson(mf);
    if (data.schema !== SCHEMA.artifact) continue;
    const f = mdPathOf(mf);
    const artifactStatus = data.status;
    for (const it of data.authored?.itemIndex || []) {
      if (!it?.id) continue;
      const prev = items.get(it.id);
      const status = it.status || (artifactStatus === 'discarded' ? 'discarded' : 'active');
      // later versions of the same item overwrite earlier ones; keep all files it appears in
      items.set(it.id, { ...(prev || {}), ...it, status, files: [...new Set([...(prev?.files || []), path.relative(runDir, f)])] });
    }
  }
  return items;
}

/** Walk from an item up the required chain until `stopAt` prefixes; returns {ok, path, problem}. */
export function walkUp(items, id, stopAt) {
  const pathIds = [id];
  let cur = items.get(id);
  const guard = new Set();
  while (cur) {
    const p = prefixOf(cur.id);
    if (stopAt.includes(p) && cur.id !== id) return { ok: true, path: pathIds };
    const allowed = PARENTS[p];
    if (!allowed) return { ok: false, path: pathIds, problem: `prefix ${p} is not part of the required chain` };
    if (allowed.length === 0) return { ok: stopAt.includes(p), path: pathIds };
    const parents = (cur.derivedFrom || []).filter((x) => allowed.includes(prefixOf(x)));
    if (!parents.length) return { ok: false, path: pathIds, problem: `${cur.id} has no derivedFrom of type ${allowed.join('|')}` };
    const next = parents.find((x) => items.has(x));
    if (!next) return { ok: false, path: pathIds, problem: `${cur.id} -> ${parents.join(', ')} not found (dangling reference)` };
    if (guard.has(next)) return { ok: false, path: pathIds, problem: `cycle at ${next}` };
    guard.add(next);
    pathIds.push(next);
    cur = items.get(next);
  }
  return { ok: false, path: pathIds, problem: `${id} not found` };
}

export function findingsDoc({ key, element, checked, findings, derivedFrom }) {
  const meta = {
    id: `${key}_trace-findings`, type: 'trace-findings', bpmnElement: element, agentRole: 'traceability', derivedFrom,
    attributes: { checked, orphans: findings.map((f) => f.id) },
  };
  const rows = findings.map((f) => `| ${f.id} | ${f.path.join(' → ')} | ${f.problem} |`).join('\n');
  const body = `# Trace findings ${key}\n\nChecked ${checked} item(s); ${findings.length} orphan(s).\n\n| Item | Path walked | Problem |\n|---|---|---|\n${rows || '| — | — | none |'}\n`;
  return { meta, body };
}
