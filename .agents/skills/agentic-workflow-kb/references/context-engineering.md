# Context engineering

Distilled from FAQ `context-engineering-1`. Tag `[context-engineering-1: n]`.

## The budget

- The context window is working memory for one call. System prompt, history, tool schemas,
  documents, tool results, responses and thinking tokens all count
  [context-engineering-1: 5, 6, 10, 11].
- Thinking tokens bill as output. On newer Claude models earlier thinking blocks stay in context
  by default; on others the API strips them. With tool use, pass the thinking block back unchanged
  [context-engineering-1: 11–15].
- Some models get the budget injected and receive usage updates after tool calls, so they can
  pace long tasks [context-engineering-1: 16, 17].

## Why more context hurts

- Retrieval benchmarks look fine at long lengths; multi-hop reasoning degrades sharply, with
  sources reporting drops beyond ~100–125k tokens even on larger windows
  [context-engineering-1: 18–22].
- "Lost in the middle": beginning and end get more attention [context-engineering-1: 23, 24].
- Five failure modes: poisoning (an error keeps getting referenced), distraction, confusion
  (irrelevant context), clash (contradictions), rot (signal lost in volume)
  [context-engineering-1: 19].

## What to load when

- **Up front:** goals, instructions, invariants, spec/plan files [context-engineering-1: 28–32].
- **On demand:** documentation, past interactions, code — via search/RAG, not dumps
  [context-engineering-1: 33–37].
- **Progressive disclosure:** skill metadata always, `SKILL.md` on trigger, files when read
  [context-engineering-1: 38].

## Keeping it small

- Compaction / rolling summaries near the limit (Claude Code autocompacts near capacity)
  [context-engineering-1: 6, 39, 40, 41].
- Clear processed tool results; drop old turns but keep system prompt, state/summary file and the
  current request [context-engineering-1: 31, 40, 43].
- Deduplicate retrieved chunks [context-engineering-1: 45, 46].
- Put critical constraints at the top or end, structure context into named fields, skip
  explanations the model doesn't need [context-engineering-1: 23, 34, 38, 52, 74].

## Memory types

Short-term (current conversation) · episodic (what happened, outcomes) · semantic (facts, docs) ·
procedural (how to do things: prompts, workflows) [context-engineering-1: 47–56].

## Subagents isolate context

- Splitting a mega-agent into specialists gives each its own window and a smaller tool set
  [context-engineering-1: 61–65].
- Claude Code subagents start with an isolated window: everything they need must be in the prompt
  [context-engineering-1: 67, 72]. Script orchestrators cost no tokens themselves
  [context-engineering-1: 66, 67].
- Hand over extracted constraints and outputs, not the whole trace — unless the receiver really
  needs the reasoning behind a decision [context-engineering-1: 68–72].

## For bpmn2agent

Skills are procedural memory, `knowledge/*.md` and references are semantic memory, artifact files
are the handoff channel. A generated agent's prompt should name the artifacts it reads rather than
restate their content, and an orchestrator must pass each subagent the paths and constraints it
needs because the subagent sees nothing else.
