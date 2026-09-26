---
bpmn:
  file: product-vision-to-user-stories.bpmn
  elements: [S5.1.4]
---

<!-- spike records (step 5.1.4) have no hand-written body. Supply this record to spike.mjs put (--step S5.1.4); it renders backlog/spikes/SPK-<nnn>_<slug>.md. The frontmatter above is generator traceability only. -->

# Technische Unsicherheit als Spike auslagern — spike record

## (rendered) Spike file — backlog/spikes/SPK-nnn_<slug>.md is rendered by spike.mjs from the spike record: question, why it blocks sizing, blocks/timebox/evidence table, acceptance criteria, decision enabled, architecture assumptions, trace. Do not write it; supply the record.

```json
{
  "spike": {
    "id": "SPK-003",
    "title": "Recipe import from partner API",
    "question": "Does the partner API deliver ingredient lists with quantities per portion?",
    "why": "ST-012 cannot be sized until we know whether we must parse free text",
    "blocks": [
      "ST-012"
    ],
    "timebox": {
      "amount": 1,
      "unit": "days"
    },
    "acceptanceCriteria": [
      "A sample of 20 recipes is fetched and the share with structured quantities is known",
      "Decision memo: structured import vs. parser"
    ],
    "decisionEnabled": "Size class of ST-012 (S if structured, L otherwise)",
    "derivedFrom": [
      "ST-012",
      "ASM-011"
    ],
    "evidence": "inferred",
    "architectureAssumptions": [
      {
        "id": "ASM-011",
        "why": "idea brief assumes a partner API exists"
      }
    ]
  },
  "notesForNext": "<one or two sentences for the next step>"
}
```
