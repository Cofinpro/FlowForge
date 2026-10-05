#!/usr/bin/env node
// Step 6b of flowforge-generate: adds run-cost tracking to a generated workflow.
//
// Usage: node install-cost-ledger.mjs <cacheDir> <generated/<workflow>/ dir>
//
// Writes, deterministically and idempotently (re-run after every spec change):
//   .claude/hooks/<workflow>-cost-ledger.mjs    from assets/templates/hook-cost-ledger-template.mjs
//   .claude/hooks/<workflow>-cost-map.json      from the spec (build-cost-map.mjs)
//   .claude/settings.json                       registers the hook on SubagentStop, Stop, SessionEnd
// Only for meta.outputLayout: claude-dir; the legacy layout (dark-factory snapshot) is left alone.

import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { buildCostMap } from './build-cost-map.mjs'

const here = path.dirname(fileURLToPath(import.meta.url))
const EVENTS = ['SubagentStop', 'Stop', 'SessionEnd']

export function installCostLedger(spec, dir) {
  if (spec.meta.outputLayout !== 'claude-dir') return { skipped: 'legacy output layout' }
  const wf = spec.meta.workflowName
  const hooks = path.join(dir, '.claude', 'hooks')
  fs.mkdirSync(hooks, { recursive: true })

  const template = fs.readFileSync(path.join(here, '..', 'assets', 'templates', 'hook-cost-ledger-template.mjs'), 'utf8')
  const hook = template
    .slice(0, template.indexOf('\n/*\nAuthoring notes'))  // the authoring notes stay in the template
    .replaceAll('{{workflow}}', wf)
    .replaceAll('{{sourceBpmnPath}}', spec.meta.sourceBpmn.path) + '\n'
  fs.writeFileSync(path.join(hooks, `${wf}-cost-ledger.mjs`), hook)

  const map = buildCostMap(spec)
  fs.writeFileSync(path.join(hooks, `${wf}-cost-map.json`), JSON.stringify(map, null, 2) + '\n')

  const settingsPath = path.join(dir, '.claude', 'settings.json')
  const settings = fs.existsSync(settingsPath) ? JSON.parse(fs.readFileSync(settingsPath, 'utf8')) : {}
  settings.hooks ??= {}
  const command = `node "$CLAUDE_PROJECT_DIR"/.claude/hooks/${wf}-cost-ledger.mjs`
  for (const ev of EVENTS) {
    const groups = (settings.hooks[ev] ??= [])
    const has = groups.some((g) => (g.hooks ?? []).some((h) => h.command === command))
    if (!has) groups.push({ hooks: [{ type: 'command', command }] })
  }
  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n')
  return { hook: `${wf}-cost-ledger.mjs`, map: `${wf}-cost-map.json`, elements: Object.keys(map.elements).length }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [cacheDir, dir] = process.argv.slice(2)
  if (!cacheDir || !dir || !fs.existsSync(path.join(dir, 'workflow-spec.yaml'))) {
    console.error('usage: install-cost-ledger.mjs <cacheDir> <generated/<workflow>/ dir>')
    process.exit(2)
  }
  const yaml = createRequire(path.join(cacheDir, 'x.js'))('js-yaml')
  const r = installCostLedger(yaml.load(fs.readFileSync(path.join(dir, 'workflow-spec.yaml'), 'utf8')), dir)
  console.log(r.skipped ? `cost ledger skipped: ${r.skipped}` : `cost ledger: ${r.hook}, ${r.map} (${r.elements} elements), registered in .claude/settings.json`)
}
