#!/usr/bin/env node
// Minimal OTLP/HTTP-JSON receiver for flowforge-cost: appends every request body as one {path, body}
// line, which `cost-report.mjs --otel <out.jsonl>` reads for exact per-request usage. No dependencies.
// Usage: node otel-sink.mjs <out.jsonl> [port=4318]   (stop it with Ctrl-C / SIGTERM)
import fs from 'node:fs'
import http from 'node:http'
const [out, port = '4318'] = process.argv.slice(2)
if (!out) { console.error('usage: otel-sink.mjs <out.jsonl> [port]'); process.exit(2) }
const server = http.createServer((req, res) => {
  const chunks = []
  req.on('data', (c) => chunks.push(c))
  req.on('end', () => {
    const text = Buffer.concat(chunks).toString('utf8')
    let body = null
    try { body = JSON.parse(text) } catch { body = { _raw: text.slice(0, 2000) } }
    fs.appendFileSync(out, JSON.stringify({ path: req.url, body }) + '\n')
    res.writeHead(200, { 'content-type': 'application/json' })
    res.end('{}')
  })
})
server.listen(Number(port), '127.0.0.1', () => console.log(`otel sink on 127.0.0.1:${port} -> ${out}`))
process.on('SIGTERM', () => server.close(() => process.exit(0)))
process.on('SIGINT', () => server.close(() => process.exit(0)))
