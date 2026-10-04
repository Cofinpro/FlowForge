#!/usr/bin/env node
// Writes the cost map of a generated workflow: the small lookup that lets bpmn2agent-cost turn
// transcript lines (skill name, agent type, description) back into BPMN elements, lanes and phases
// without needing workflow-spec.yaml, which is never copied into the user's project.
//
// Usage: node build-cost-map.mjs <cacheDir> <generated/<workflow>/ dir> [--out <file>]
//   cacheDir   ${BPMN_TOOLS_CACHE:-$HOME/.cache/bpmn-authoring-tools} (js-yaml lives there)
//   --out      default: <dir>/.claude/hooks/<workflow>-cost-map.json (claude-dir layout) or
//              <dir>/hooks/<workflow>-cost-map.json (legacy layout, no meta.outputLayout)
//
// Deterministic: same spec in, same JSON out. It is plain data, not a script, so it claims no
// generatedPaths entry and the BPMN trace sits in its own `bpmn` key.

import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'

const COST_BEARING = new Set(['skill', 'script', 'agent-checklist'])

/** .../skills/<name>/... -> <name>; .../agents/<name>.md -> agent:<name>; else null */
function ownerOf(p) {
  let m = p.match(/(?:^|\/)skills\/([^/]+)\//)
  if (m) return { skill: m[1] }
  m = p.match(/(?:^|\/)agents\/([^/]+)\.md$/)
  if (m) return { agent: m[1] }
  return null
}

export function buildCostMap(spec) {
  const wf = spec.meta.workflowName
  const elements = {}
  const skills = {}
  const orchestrationSkills = new Set()
  const phaseOf = new Map()
  for (const ph of spec.pattern?.phases ?? []) for (const id of ph.elements ?? []) phaseOf.set(id, ph.name)

  for (const [id, el] of Object.entries(spec.elements ?? {})) {
    const owners = (el.generatedPaths ?? []).map(ownerOf).filter(Boolean)
    for (const o of owners) {
      if (!o.skill) continue
      if (COST_BEARING.has(el.kind)) (skills[o.skill] ??= new Set()).add(id)
      else if (el.kind === 'orchestrator' || el.kind === 'human-checkpoint') orchestrationSkills.add(o.skill)
    }
    if (!COST_BEARING.has(el.kind)) continue
    elements[id] = {
      label: el.label,
      lane: el.lane ?? null,
      phase: phaseOf.get(id) ?? null,
      kind: el.kind,
      skills: owners.filter((o) => o.skill).map((o) => o.skill),
    }
  }
  // a skill that some cost-bearing element owns is attributed to that element, never to orchestration
  for (const s of Object.keys(skills)) orchestrationSkills.delete(s)

  const agentTypes = {}
  const lanes = {}
  for (const [rid, role] of Object.entries(spec.roles ?? {})) {
    lanes[rid] = role.label ?? rid
    if (role.agentName) agentTypes[role.agentName] = rid
  }
  const orchestratorAgents = spec.pattern?.chosen === 'orchestrator-agent' || spec.pattern?.chosen === 'mixed'
    ? [`${wf}-orchestrator`] : []

  const sorted = (o) => Object.fromEntries(Object.entries(o).sort(([a], [b]) => a.localeCompare(b)))
  return {
    bpmn: { file: spec.meta.sourceBpmn?.path ?? null, elements: Object.keys(elements).sort() },
    workflow: wf,
    pattern: spec.pattern?.chosen ?? null,
    generatorVersion: spec.meta.generatorVersion ?? null,
    orchestration: { skills: [...orchestrationSkills].sort(), agentTypes: orchestratorAgents },
    elements: sorted(elements),
    skills: sorted(Object.fromEntries(Object.entries(skills).map(([k, v]) => [k, [...v].sort()]))),
    agentTypes: sorted(agentTypes),
    lanes: sorted(lanes),
  }
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === new URL(import.meta.url).pathname
if (isMain) {
  const [cacheDir, dir] = process.argv.slice(2).filter((a) => !a.startsWith('--'))
  if (!cacheDir || !dir || !fs.existsSync(path.join(dir, 'workflow-spec.yaml'))) {
    console.error('usage: build-cost-map.mjs <cacheDir> <generated/<workflow>/ dir> [--out <file>]')
    process.exit(2)
  }
  const yaml = createRequire(path.join(cacheDir, 'x.js'))('js-yaml')
  const spec = yaml.load(fs.readFileSync(path.join(dir, 'workflow-spec.yaml'), 'utf8'))
  const map = buildCostMap(spec)
  const outIdx = process.argv.indexOf('--out')
  const hooksDir = spec.meta.outputLayout === 'claude-dir' ? path.join(dir, '.claude', 'hooks') : path.join(dir, 'hooks')
  const out = outIdx > 0 ? process.argv[outIdx + 1] : path.join(hooksDir, `${map.workflow}-cost-map.json`)
  fs.mkdirSync(path.dirname(out), { recursive: true })
  fs.writeFileSync(out, JSON.stringify(map, null, 2) + '\n')
  console.log(`cost map: ${Object.keys(map.elements).length} elements, ${Object.keys(map.skills).length} skills -> ${out}`)
}
