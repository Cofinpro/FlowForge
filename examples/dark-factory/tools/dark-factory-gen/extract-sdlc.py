#!/usr/bin/env python3
"""Extract every sdlc:* extension (step, input, output, research, panel, critic, gate, condition,
collection, bundle) from the BPMN, keyed by element id, as JSON on stdout.

Usage: python3 extract-sdlc.py <file.bpmn> > .build/sdlc.json
"""
import json
import sys
import xml.etree.ElementTree as ET

B = '{http://www.omg.org/spec/BPMN/20100524/MODEL}'
S = '{urn:dark-factory:sdlc:1.0}'

tree = ET.parse(sys.argv[1])
out = {}
for el in tree.iter():
    ext = el.find(B + 'extensionElements')
    if ext is None or not el.get('id'):
        continue
    d = {'step': None, 'inputs': [], 'outputs': [], 'research': [], 'panel': None, 'critic': None,
         'gate': None, 'condition': None, 'collection': None, 'bundle': None}
    for c in ext:
        tag, a = c.tag.replace(S, ''), dict(c.attrib)
        if tag == 'step':
            d['step'] = a
        elif tag in ('input', 'output'):
            d[tag + 's'].append(a)
        elif tag == 'research':
            d['research'].append(a)
        else:
            d[tag] = a
    out[el.get('id')] = d
# multi-instance collections live under multiInstanceLoopCharacteristics
for el in tree.iter():
    mi = el.find(B + 'multiInstanceLoopCharacteristics')
    if mi is not None:
        c = mi.find('.//' + S + 'collection')
        if c is not None:
            out.setdefault(el.get('id'), {})['collection'] = dict(c.attrib)
            out[el.get('id')]['miParallel'] = mi.get('isSequential') != 'true'
print(json.dumps(out))
