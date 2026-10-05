#!/usr/bin/env python3
"""Turn saved gemini-notebook-mcp `notebook_query` results into a citable FAQ.

A FAQ directory holds one Markdown file per topic plus an index (README.md). Each entry keeps the
question, the notebook's answer verbatim (citation markers like [3] or [1-4] intact) and a table
that resolves every citation number to its source title and the passage the notebook cited. Later
runs read the FAQ first and only query the notebook for questions it doesn't answer yet.

Usage:
  notebook-faq.py add   --faq DIR --topic SLUG --title "Short question" RESULT.json
  notebook-faq.py index --faq DIR

RESULT.json is the notebook_query tool result: either the file the harness saved when the output
was too large, or the inline result written to a file. It needs `question`, `answer`,
`conversation_id` and, for the citation table, `references` ([{citation_number, source_id,
cited_text}]).

DIR/sources.json maps source ids to readable titles:
  {"notebook": {"id": "...", "title": "..."}, "sources": {"<source-id>": "<title>", ...}}
Unknown source ids are printed as the raw id, so a missing mapping is visible, not silent.
"""
import argparse
import datetime
import json
import re
import sys
from pathlib import Path

QUOTE_CHARS = 320  # long enough to verify a claim, short enough to keep the FAQ readable


def load_sources(faq: Path):
    p = faq / 'sources.json'
    if not p.exists():
        return {'notebook': {'id': '', 'title': ''}, 'sources': {}}
    return json.loads(p.read_text())


def shorten(text: str) -> str:
    text = ' '.join((text or '').split())
    if len(text) <= QUOTE_CHARS:
        return text
    return text[:QUOTE_CHARS].rsplit(' ', 1)[0] + ' …'


def cell(text: str) -> str:
    return text.replace('|', '\\|')


def next_id(topic_file: Path, topic: str) -> str:
    n = 0
    if topic_file.exists():
        n = len(re.findall(rf'^## {re.escape(topic)}-\d+', topic_file.read_text(), re.M))
    return f'{topic}-{n + 1}'


def cmd_add(args):
    faq = Path(args.faq)
    faq.mkdir(parents=True, exist_ok=True)
    result = json.loads(Path(args.result).read_text())
    for key in ('question', 'answer'):
        if not result.get(key):
            sys.exit(f'{args.result}: missing "{key}" - is this a notebook_query result?')
    cat = load_sources(faq)
    titles = cat['sources']
    topic_file = faq / f'{args.topic}.md'
    entry_id = next_id(topic_file, args.topic)
    date = args.date or datetime.date.today().isoformat()

    refs = sorted(result.get('references') or [], key=lambda r: r.get('citation_number', 0))
    used = []
    for r in refs:
        t = titles.get(r.get('source_id'), r.get('source_id', '?'))
        if t not in used:
            used.append(t)

    lines = [f'## {entry_id}: {args.title}', '']
    meta = [f'asked {date}']
    if cat['notebook'].get('title'):
        meta.append(f'notebook "{cat["notebook"]["title"]}"')
    if result.get('conversation_id'):
        meta.append(f'conversation `{result["conversation_id"]}`')
    lines += ['- ' + ' · '.join(meta)]
    if used:
        lines += ['- Sources: ' + '; '.join(used)]
    if result.get('note'):
        lines += [f'- Note: {result["note"]}']
    lines += ['', '**Question**', '']
    lines += ['> ' + l if l else '>' for l in result['question'].strip().splitlines()]
    lines += ['', '**Answer** (verbatim, citation markers resolve in the table below)', '']
    # demote the answer's own headings so they nest under this entry
    answer = re.sub(r'^(#{1,4}) ', lambda m: '#' * min(len(m.group(1)) + 2, 6) + ' ',
                    result['answer'].strip(), flags=re.M)
    lines += [answer, '']
    if refs:
        lines += ['**Citations**', '', '| # | Source | Cited passage |', '|---|---|---|']
        for r in refs:
            t = titles.get(r.get('source_id'), r.get('source_id', '?'))
            quote = shorten(r.get('cited_text', '')) or '(no passage returned)'
            lines += [f'| {r.get("citation_number")} | {cell(t)} | {cell(quote)} |']
        lines += ['']
    lines += ['---', '']

    if not topic_file.exists():
        head = [f'# FAQ: {args.topic}', '',
                'Notebook answers recorded verbatim with their citations. Distilled guidance lives',
                'in the references; this file is the audit trail behind it.', '', '---', '']
        topic_file.write_text('\n'.join(head))
    with topic_file.open('a') as fh:
        fh.write('\n'.join(lines))
    write_index(faq)
    print(f'{entry_id} -> {topic_file}')


def write_index(faq: Path):
    cat = load_sources(faq)
    rows = []
    for f in sorted(faq.glob('*.md')):
        if f.name == 'README.md':
            continue
        for m in re.finditer(r'^## (\S+): (.+)$', f.read_text(), re.M):
            anchor = re.sub(r'[^a-z0-9 -]', '', f'{m.group(1)} {m.group(2)}'.lower()).replace(' ', '-')
            rows.append(f'| [{m.group(1)}]({f.name}#{anchor}) | {cell(m.group(2))} |')
    title = cat['notebook'].get('title')
    out = ['# FAQ index', '']
    if title:
        out += [f'Questions asked to the NotebookLM notebook "{title}" (id `{cat["notebook"].get("id", "")}`).', '']
    out += ['Check this list before querying the notebook again. Add new answers with',
            '`notebook-faq.py add` so the next run finds them here.', '',
            '| Entry | Question |', '|---|---|'] + rows + ['']
    (faq / 'README.md').write_text('\n'.join(out))


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest='cmd', required=True)
    a = sub.add_parser('add', help='append one notebook_query result as a FAQ entry')
    a.add_argument('--faq', required=True)
    a.add_argument('--topic', required=True, help='kebab-case topic slug, becomes <topic>.md')
    a.add_argument('--title', required=True, help='short question title for the index')
    a.add_argument('--date', help='ISO date of the query (default: today)')
    a.add_argument('result')
    i = sub.add_parser('index', help='rebuild README.md from the topic files')
    i.add_argument('--faq', required=True)
    args = ap.parse_args()
    if args.cmd == 'add':
        cmd_add(args)
    else:
        write_index(Path(args.faq))


if __name__ == '__main__':
    main()
