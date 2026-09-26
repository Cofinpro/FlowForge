---
element: S3.1.4
evidence: cited
sources:
  - The Product - Business Design (NotebookLM)
  - docs/dark-factory/process-rules.md
bpmn:
  file: product-vision-to-user-stories.bpmn
  elements: [S3.1.4]
---

# Domain knowledge — Service Blueprint schichten

- Swimlanes: customer actions | line of interaction | frontstage | **line of visibility** | backstage | line of internal interaction | support processes and IT systems [^1].
- Pass: strict separation at the line of visibility; every frontstage interaction traces down to a backstage process or system; backstage complexity is rated [^1].
- Support processes indirectly impact the customer experience, so they belong on the blueprint even without a touchpoint [^1].
- The architect role replaces tech lead/operations and needs the target architecture/platform from the idea brief (Gedächtnis §4, §14).
- Light research uses Claude WebSearch for fact-checks; every retrieved source becomes an `SRC-<nnnn>` source artifact (Gedächtnis §8).
- Unverified claims stay 🧠; a claim the critic later refutes via K.3 fact-check becomes a `fail` of the affected criterion (Gedächtnis §9.1).

[^1]: "Mapping Experiences" (Kalbach 2020) — "The line of visibility separates onstage touchpoints from backstage actions … Support processes … indirectly impact the customer experience."
