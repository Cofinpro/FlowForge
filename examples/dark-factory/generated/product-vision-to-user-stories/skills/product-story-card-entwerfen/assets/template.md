---
bpmn:
  file: product-vision-to-user-stories.bpmn
  elements: [S5.1.1]
---

<!-- story records (step 5.1.1) have no hand-written body. Supply this record to story.mjs put (--step S5.1.1); it renders backlog/stories/ST-<nnn>_<slug>.md. The frontmatter above is generator traceability only. -->

# Story Card entwerfen (Connextra) — story record

## (rendered) Story file — backlog/stories/ST-nnn_<slug>.md is rendered by story.mjs from the story record: title, Connextra sentence, epic/UT/size/evidence table, conversation, acceptance criteria, unvalidated assumptions, trace. Do not write it; supply the record.

```json
{
  "story": {
    "id": "ST-012",
    "title": "Plan the week in one go",
    "epic": "EP-001",
    "userTask": "UT-004",
    "connextra": {
      "role": "working parent of two",
      "want": "to plan all dinners of the week in one session",
      "soThat": "I stop deciding under time pressure every evening"
    },
    "derivedFrom": [
      "UT-004",
      "EP-001",
      "JOB-002"
    ],
    "evidence": "synthetic",
    "refs": [
      "T-03"
    ],
    "conversation": [
      "Does \"week\" include weekends?"
    ],
    "assumptions": [
      {
        "id": "ASM-007",
        "evidence": "inferred",
        "why": "assumes one person plans for the household"
      }
    ],
    "size": {
      "class": "M",
      "reasoning": "3 business rules, 2 states, no integration"
    },
    "flags": []
  },
  "notesForNext": "<one or two sentences for the next step>"
}
```
