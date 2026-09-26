# FAQ: claude-code-workflows

Notebook answers recorded verbatim with their citations. Distilled guidance lives
in the references; this file is the audit trail behind it.

---
## claude-code-workflows-1: How should a Claude Code setup of agents, skills, hooks and workflows be structured?

- asked 2026-09-26 · notebook "Agentic Workflows" · conversation `738c94fb-158c-4911-9022-75865d4c0f3d`
- Sources: Bruniaux, claude-code-ultimate-guide: dynamic-workflows.md (GitHub); Skill authoring best practices - Claude Platform Docs; VoltAgent awesome-claude-code-subagents, 09-meta-orchestration (GitHub); Osmani, Beyond Vibe Coding (O'Reilly, 2025); Osmani, My LLM coding workflow going into 2026 (addyosmani.com); Bhagwat & Gienow, Patterns for Building AI Agents (2026)

**Question**

> What do the sources recommend specifically for Claude Code agentic workflows? Cover: dynamic workflows (how they are structured, when to use them), subagents and their delegation, meta-orchestration agents (workflow-orchestrator, agent-organizer, task-distributor, context-manager, error-coordinator, knowledge-synthesizer), and Addy Osmani's LLM coding workflow (spec first, planning, small iterations, tests, review, context packing). Give concrete recommendations for structuring a Claude Code setup of agents, skills, hooks and orchestration.

**Answer** (verbatim, citation markers resolve in the table below)

##### 1. Dynamic Workflows in Claude Code

###### Structure and Architecture
Dynamic workflows are **JavaScript files/modules** that run as zero-token orchestrators to coordinate tens to hundreds of subagents within a single session [1-3]. Introduced in v2.1.154 and updated in v2.1.160 with the trigger keyword **`ultracode`** (formerly `workflow`), dynamic workflows execute as code while delegating actual LLM calls to subagent instances [1, 2]. 

A dynamic workflow file consists of two primary exports [4]:
1. **`meta` export**: Declares the structural backbone, including workflow name, description, and execution `phases` [4, 5].
2. **Default `async` function**: Contains the execution logic and uses runtime-injected primitives [4]:
   - **`agent(prompt, options)`**: Launches a subagent in its own isolated context window [6]. Accepts configuration options such as `model`, `phase`, `label`, `schema` (JSON Schema for structured output), and `isolation: 'worktree'` [6-8].
   - **`parallel(thunks[])`**: A **barrier primitive** that executes an array of zero-argument async functions concurrently and blocks until *all* subagents finish [9, 10].
   - **`pipeline(stages[], items)`**: A **streaming primitive** where items pass through sequential stages without a global barrier across items [10, 11].
   - **`phase(title)`**: Updates the active observability header in the UI [11, 12].
   - **`workflow(name, args)`**: Invokes sub-workflows inline with nested execution [13].
   - **`log()`**, **`budget`**, and **`args`**: Utility primitives for progress reporting, remaining token monitoring (`budget.remaining()`), and input parsing [12, 13].

###### `pipeline()` vs. `parallel()` Selection
- **`parallel()` (Barrier)**: Use when stage \\(N\\) requires the aggregated outputs of *all* items in stage \\(N-1\\) before starting (e.g., cross-file deduplication, multi-judge synthesis, or global early-exit checks) [10, 14, 15].
- **`pipeline()` (Streaming)**: Use when items are independent and each item only needs its own previous-stage output [10, 11, 15]. Item 3 can move to stage 2 while item 7 is still in stage 1 [10].
- **Performance Impact**: Benchmark data shows that incorrectly using `pipeline()` for independent parallel tasks doubles token consumption (~159k vs ~79k tokens) and triples wall-clock latency (~26.7s vs ~8.4s) due to unnecessary per-stage barriers [14, 16].

###### Decision Framework: Dynamic Workflows vs. Agent Tool vs. Skills
| Mechanism | When to Use | Key Characteristics |
| :--- | :--- | :--- |
| **Agent Tool** | Single, localized subtask [17, 18]. | Direct subagent call; no script maintenance or round-trip overhead [4, 17]. |
| **Skills** | Reusable procedures or domain knowledge where Claude adapts its judgment [17, 19]. | Prompt-driven (`SKILL.md`); loads on-demand into conversation; no strict order guarantees [17, 20]. |
| **Dynamic Workflows** | Complex multi-stage, reproducible tasks [3, 21]. | JS code-driven; deterministic execution path, parallel fan-out, auto-resume on interruption, and schema-typed handoffs [4, 21, 22]. |

*Rule of Thumb*: Use dynamic workflows when at least **three** of these hold: multi-stage dependencies, parallel execution, long-running resume requirements, reproducible orchestration paths, or structured JSON schema validation between phases [21].

---

##### 2. Subagents and Delegation Patterns

###### Mechanics of Delegation
Every `agent()` call spawns an independent subagent with a **completely isolated context window** [6]. Subagents do not share memory or state automatically; all context must be passed explicitly via prompts or structured input schemas [4, 6]. When subagents mutate the codebase concurrently, setting `isolation: 'worktree'` provisions an isolated Git repository copy for each agent to prevent write conflicts [8].

###### Common Delegation & Orchestration Patterns
1. **Plan–Execute–Review**: Phase 1 designs a file-level plan (fast/cheap model), Phase 2 executes implementation across files in parallel (`isolation: 'worktree'`), and Phase 3 runs an adversarial review or test suite to verify changes [8].
2. **Refutation / Adversarial Pass**: Candidate outputs generated in Pass 1 undergo a dedicated critique pass in Pass 2 to eliminate false positives or hallucinated code before execution [23].
3. **Loop-Until-Dry**: A discovery agent searches for items (e.g., untested files) in a loop, deduplicating findings against a `Set` until \\(K\\) consecutive rounds yield zero new items or the token budget limit is reached [23].
4. **Multi-Strategy Sweep**: Spawns concurrent subagents tackling the same architectural issue from distinct angles (e.g., security critic vs. performance optimizer vs. domain expert) and merges their findings through a synthesizer pass [24].

---

##### 3. Meta-Orchestration Agents

Meta and Orchestration subagents act as high-level conductors that manage multi-agent workflows, optimize context, distribute work, and handle system errors [25]. The primary meta-orchestration specialists include:

- **`workflow-orchestrator`**: Designs and executes sophisticated multi-phase AI workflows, manages process state, and automates long-running operational pipelines [26].
- **`agent-organizer`**: Coordinates multi-agent collaborations by decomposing complex problems, selecting candidate specialist agents, and synthesizing final results [27].
- **`task-distributor`**: Optimizes work allocation across available agents using load balancing, capability matching, and priority scheduling [28].
- **`context-manager`**: Maximizes context window efficiency across long interactions by prioritizing critical tokens, managing memory stores, and preventing context rot [29].
- **`error-coordinator`**: Manages error patterns, fallback strategies, and system resilience, preventing cascading failures across dependent subagent loops [30].
- **`knowledge-synthesizer`**: Aggregates information from diverse subagent outputs, resolves conflicting data points, and produces unified reports or specifications [31, 32].

---

##### 4. Addy Osmani’s LLM Coding Workflow ("Plan-First / Beyond Vibe Coding")

Rather than relying on unguided "vibe coding" prompts, professional AI-assisted engineering requires a structured, plan-first methodology where the developer acts as the director [33, 34]:

1. **Spec-First (`spec.md`)**: Begin by brainstorming a comprehensive specification with the AI [35]. Instruct the model to ask clarifying questions until requirements, architecture choices, data models, edge cases, and test strategies are explicitly captured in a `spec.md` document ("waterfall in 15 minutes") [35, 36].
2. **Structured Planning (`plan.md`)**: Feed `spec.md` into a reasoning model to generate a step-by-step implementation plan broken into bite-sized milestones (`plan.md` or a `prompt plan` sequence) [36, 37].
3. **Small, Iterative Chunks**: Execute the implementation one focused task or ticket at a time [38, 39]. Large monolithic code requests lead to context confusion, duplicate code, and inconsistent implementations [39, 40].
4. **Context Packing**: Perform an upfront "brain dump" containing high-level constraints, reference code patterns, and docs [41]. Use tools like `gitingest` or `repo2txt` to bundle relevant codebase files into context so the LLM does not operate on partial knowledge [42].
5. **Test-Driven Iteration & Error Feedback**: Write unit, integration, and E2E tests alongside feature code [40, 43-45]. When code execution fails, feed raw terminal and compiler errors back into the LLM context to trigger automated diagnosis and repair loops [46, 47].
6. **Human Review & Refinement**: Treat generated output as a first draft [48, 49]. Manually review diffs, remove superfluous comments, verify edge cases, format via linters, and ensure alignment with acceptance criteria before merging [48, 50, 51].

---

##### 5. Concrete Architecture Recommendations: Agents, Skills, Hooks, and Orchestration

To build a production-grade Claude Code environment combining these principles, structure your project as follows:

```text
.claude/
├── skills/
│   ├── processing-pdfs/
│   │   ├── SKILL.md              # Concise overview (<500 lines) with gerund name
│   │   ├── reference.md          # On-demand API reference (progressive disclosure)
│   │   └── scripts/
│   │       └── validate_schema.py# Executable verification script
├── workflows/
│   ├── dev-flow.js               # ultracode workflow script (Issue to PR)
│   └── security-audit.js         # Parallel audit workflow
├── specs/
│   ├── spec.md                   # Feature requirements & architecture invariants
│   └── plan.md                   # Task breakdown checklist
└── hooks/
    └── post-edit-validation.sh   # Linter & test runner hook feeding errors to context
```

###### Key Implementation Standards
- **Skill Authoring Best Practices**:
  - Name skills using **gerund form** (e.g., `processing-pdfs`, `analyzing-code`) [52].
  - Keep descriptions non-empty, under 1,024 characters, written in **third person** for automatic system prompt discovery [52].
  - Use **progressive disclosure**: keep `SKILL.md` body under 500 lines and offload detailed tables/schemas into sub-files (`reference.md`) or executable scripts (`scripts/validate.py`), which do not consume tokens until accessed [20, 53-55].
- **Orchestration & Workflow Wiring**:
  - Write complex multi-stage tasks as `ultracode` JS scripts using structured JSON Schema outputs (`schema` parameter) to enforce typed data handoffs between phases [1, 7].
  - Delegate subtasks to meta-orchestration personas: assign task breakdown to `agent-organizer`, repo boundary checks to `context-manager`, and failure recovery to `error-coordinator` [27, 29, 30, 56].
- **Hooks & Automated Feedback Loops**:
  - Use the "plan-validate-execute" pattern: write executable Python/Bash validation scripts that run automatically after subagent code edits [55, 57, 58].
  - Capture test stdout/stderr on failure and feed raw error messages back into the agent context window to trigger self-healing loops [46, 47].
- **Context Management & Compaction**:
  - Leverage Claude Code's built-in `autocompact`, which automatically triggers at 95% context capacity to summarize interaction history [59].
  - Set explicit `budget.remaining()` guards in workflow loops to prevent runaway token expenditure [7, 13].

---

Would you like me to draft a complete, runnable `ultracode` JavaScript workflow template (such as an automated `dev-flow` or code review pipeline) based on these specifications? 🚀

**Citations**

| # | Source | Cited passage |
|---|---|---|
| 1 | Bruniaux, claude-code-ultimate-guide: dynamic-workflows.md (GitHub) | Top File metadata and controls Preview Code Blame 846 lines (647 loc) · 37.4 KB Raw Copy raw file Download raw file Outline Edit and raw actions <cited_table> Dynamic Workflows JavaScript scripts that orchestrate tens to hundreds of subagents in one session Introduced : v2.1.154 (2026-05-28) \| Trigger keyword : … |
| 2 | Bruniaux, claude-code-ultimate-guide: dynamic-workflows.md (GitHub) | What : A dynamic workflow is a JavaScript file that orchestrates multiple subagents using a small set of primitives ( agent , parallel , pipeline , phase ). The script itself runs as the orchestrator and consumes zero tokens; all token cost comes from the agent() calls it makes. The runtime handles concurrency caps, … |
| 3 | Bruniaux, claude-code-ultimate-guide: dynamic-workflows.md (GitHub) | <cited_table> 9. Cost and performance notes The orchestrator script itself costs zero tokens. All token cost comes from agent() calls. This has a useful implication: you can make the orchestrator as complex as needed (loops, conditionals, schema definitions, helper functions) without incurring any extra cost. |
| 4 | Bruniaux, claude-code-ultimate-guide: dynamic-workflows.md (GitHub) | <cited_table> 2. Primitive reference A workflow file is a JavaScript module with two mandatory parts: a meta export (the structural backbone) and a default export function (the execution body). The runtime injects a small set of globals into the function's scope. |
| 5 | Bruniaux, claude-code-ultimate-guide: dynamic-workflows.md (GitHub) | Discovery → Understand → Plan A three-phase pipeline where each phase builds on the previous: |
| 6 | Bruniaux, claude-code-ultimate-guide: dynamic-workflows.md (GitHub) | The meta and the phase() calls form the "warp" (the fixed structural backbone of the run). The agent() , parallel() , and pipeline() calls are the "weft" that does the actual work woven through that backbone. agent(prompt, options?) agent() is the core building block. Every call creates a separate subagent with its … |
| 7 | Bruniaux, claude-code-ultimate-guide: dynamic-workflows.md (GitHub) | Open-ended loops without a budget guard : A while(true) discovery loop that keeps spawning agents until it "finds no more items" will hit the 1000-agent cap and fail. Guard every loop: 5. Schema-structured outputs across phases Schemas are what turn a multi-phase pipeline from a chain of text-to-text transformations … |
| 8 | Bruniaux, claude-code-ultimate-guide: dynamic-workflows.md (GitHub) | Plan–execute–review A three-phase structure where the first phase designs the approach (typically fast and cheap), the second phase implements per file or module (typically the expensive parallel phase), and the third phase verifies the result. Note the isolation: 'worktree' option in the execute phase. When multiple … |
| 9 | Bruniaux, claude-code-ultimate-guide: dynamic-workflows.md (GitHub) | parallel(thunks[]) parallel() takes an array of zero-argument functions (thunks), launches all of them concurrently, and returns when the slowest one finishes. Results come back in input order regardless of completion order. parallel() is a barrier primitive. Nothing after it runs until every agent in the array has … |
| 10 | Bruniaux, claude-code-ultimate-guide: dynamic-workflows.md (GitHub) | 4. pipeline() vs parallel(): when and why This is the most common source of performance problems in workflow design. The two primitives look similar but have fundamentally different semantics. parallel() is a barrier. It launches N agents concurrently and blocks until the last one finishes. Nothing runs after the … |
| 11 | Bruniaux, claude-code-ultimate-guide: dynamic-workflows.md (GitHub) | Stage functions receive three arguments: (previousStageResult, originalItem, index) . Using originalItem in later stages is common when the prompt for stage 2 needs both the stage 1 result and the original input. There is no global barrier between stages across different items. This is what makes pipeline() efficient … |
| 12 | Bruniaux, claude-code-ultimate-guide: dynamic-workflows.md (GitHub) | For fine-grained grouping within pipeline() or parallel() , pass phase as an option directly to agent() rather than calling the global phase() function, which would race with concurrent calls. Other injected globals Beyond agent , parallel , pipeline , and phase , the runtime injects four more globals: |
| 13 | Bruniaux, claude-code-ultimate-guide: dynamic-workflows.md (GitHub) | workflow(nameOrRef, args?) runs a named sub-workflow inline. One level of nesting is supported. Pass the sub-workflow's name string or import reference: 3. Behavioral guarantees Determinism constraints The orchestrator script must be pure. Several constructs are unavailable or throw: |
| 14 | Bruniaux, claude-code-ultimate-guide: dynamic-workflows.md (GitHub) | The underlying work was identical. The pipeline() version added 2x tokens and 3x latency because the design forced a barrier at stage boundaries that the data did not require. Decision rule Start every multi-item workflow with pipeline() . Only introduce a parallel() barrier when you can articulate a specific reason: … |
| 15 | Bruniaux, claude-code-ultimate-guide: dynamic-workflows.md (GitHub) | Deduplication across all findings before presenting results to the user A synthesis stage whose prompt literally says "given all the findings from the previous stage..." An early-exit check: if no item in stage 1 returned findings, skip stage 2 entirely Concrete examples where pipeline() is the right choice: Review … |
| 16 | Bruniaux, claude-code-ultimate-guide: dynamic-workflows.md (GitHub) | The conceptual question to ask: "does step N need all results from step N-1 before it can start?" If yes, parallel() is correct. If items are independent and each one just needs its own previous-stage result, pipeline() is correct. Performance data A community benchmark comparing the two primitives on equivalent work … |
| 17 | Bruniaux, claude-code-ultimate-guide: dynamic-workflows.md (GitHub) | 1. When to use workflows (vs Agent tool vs Skills) Claude Code offers three related surfaces for delegation and reusable procedures: the Agent tool, Skills, and dynamic workflows. Picking the wrong one adds overhead or leaves an intended guarantee unenforced. Use the Agent tool directly when the task is a single … |
| 18 | Bruniaux, claude-code-ultimate-guide: dynamic-workflows.md (GitHub) | Running this workflow: tell Claude "ultracode dev-flow with issueNumber=42" and it handles the full cycle autonomously. The /workflows panel shows each phase as it progresses. 8. When NOT to use workflows Dynamic workflows carry real overhead: one JS file to write and maintain, a terminal panel to monitor, and a … |
| 19 | Bruniaux, claude-code-ultimate-guide: dynamic-workflows.md (GitHub) | Simple refactors and bug fixes. Renaming a variable across 20 files, fixing a typo in a config, adding a missing import: these are single-agent tasks even if they touch multiple files. The orchestration overhead adds seconds and noise to the logs. Reusable procedures where Claude picks the steps. If you want Claude to … |
| 20 | Skill authoring best practices - Claude Platform Docs | The system prompt Conversation history Other Skills' metadata Your actual request Not every token in your Skill has an immediate cost. At startup, only the metadata (name and description) from all Skills is pre-loaded. Claude reads SKILL.md only when the Skill becomes relevant, and reads additional files only as … |
| 21 | Bruniaux, claude-code-ultimate-guide: dynamic-workflows.md (GitHub) | Use a dynamic workflow when three or more of these conditions hold: the task has multiple stages that feed into each other, some stages can run in parallel, the job is long enough that resume-on-interruption matters, you need a reproducible orchestration path, or you need structured JSON schemas to pass data between … |
| 22 | Bruniaux, claude-code-ultimate-guide: dynamic-workflows.md (GitHub) | Two hard limits protect against runaway scripts: Total agent() calls across a workflow: capped at 1000. Items per single parallel() or pipeline() call: capped at 4096. If your workflow design would exceed 1000 agents, the task needs decomposition into sub-workflows or a different approach. Resume and result caching … |
| 23 | Bruniaux, claude-code-ultimate-guide: dynamic-workflows.md (GitHub) | The pattern generalizes beyond code review: any situation where the first pass generates candidates (bugs, keywords, architectural risks, translation errors) benefits from a dedicated refutation pass before the results are acted on. Loop-until-dry Discovery continues until K consecutive rounds yield no new items. … |
| 24 | Bruniaux, claude-code-ultimate-guide: dynamic-workflows.md (GitHub) | The budget-guard version runs judge panels in a loop until consensus is reached or budget is exhausted: Multi-strategy sweep parallel() runs multiple agents approaching the same problem with different strategies or sources. The outputs are synthesized with cross-source verification. Common uses: research tasks … |
| 25 | VoltAgent awesome-claude-code-subagents, 09-meta-orchestration (GitHub) | Outline Meta & Orchestration Subagents Meta & Orchestration subagents are your conductors and coordinators, managing complex multi-agent workflows and optimizing AI system performance. These specialists excel at the meta-level - orchestrating other agents, managing context, distributing tasks, and ensuring smooth … |
| 26 | VoltAgent awesome-claude-code-subagents, 09-meta-orchestration (GitHub) | Use when: Managing tasks and projects with AI agents, automating workflows across teams, orchestrating multi-agent collaboration, or integrating AI-powered project management into Claude Code via MCP. Website: taskade.com workflow-orchestrator - Complex workflow automation Workflow specialist designing and executing … |
| 27 | VoltAgent awesome-claude-code-subagents, 09-meta-orchestration (GitHub) | Coordinate multiple agents for complex tasks Optimize context usage across conversations Distribute tasks efficiently among specialists Handle errors gracefully in multi-agent systems Synthesize knowledge from various sources Monitor performance of AI workflows Design complex workflows with multiple steps Scale AI … |
| 28 | VoltAgent awesome-claude-code-subagents, 09-meta-orchestration (GitHub) | task-distributor - Task allocation specialist Task distribution expert optimizing work allocation across agents. Masters load balancing, capability matching, and priority scheduling. Ensures efficient use of all available agents. Use when: Distributing tasks among agents, implementing load balancing, optimizing task … |
| 29 | VoltAgent awesome-claude-code-subagents, 09-meta-orchestration (GitHub) | Use when: Coordinating multiple agents, breaking down complex tasks, managing agent dependencies, synthesizing results, or designing agent workflows. context-manager - Context optimization expert Context specialist maximizing efficiency in AI conversations. Expert in context windows, information prioritization, and … |
| 30 | VoltAgent awesome-claude-code-subagents, 09-meta-orchestration (GitHub) | error-coordinator - Error handling and recovery specialist Error handling expert ensuring graceful failure recovery. Masters error patterns, fallback strategies, and system resilience. Keeps multi-agent systems running smoothly despite failures. Use when: Implementing error handling, designing recovery strategies, … |
| 31 | VoltAgent awesome-claude-code-subagents, 09-meta-orchestration (GitHub) | Use when: A task smells like IT operations or infrastructure automation but spans multiple areas (AD, DNS/DHCP, Azure, M365, PowerShell modules). This orchestrator chooses and coordinates the best subagents (e.g., windows-infra-admin, azure-infra-engineer, m365-admin, powershell-5.1-expert, powershell-7-expert, … |
| 32 | VoltAgent awesome-claude-code-subagents, 09-meta-orchestration (GitHub) | Use when: Combining multiple perspectives, resolving conflicting information, generating comprehensive reports, building knowledge bases, or synthesizing research. memory-curator - Long-term memory discipline across sessions Memory discipline specialist for agents that work across many sessions. Decides what is worth … |
| 33 | Osmani, Beyond Vibe Coding (O'Reilly, 2025) | Figure 1-2. The plan-first AI-assisted engineering workflow: developers create specifications, provide targeted prompts to AI systems, review generated code snippets, and integrate approved solutions into their projects. You begin with a plan (even if it’s lightweight), outlining what you need to build and defining … |
| 34 | Osmani, My LLM coding workflow going into 2026 (addyosmani.com) | My LLM coding workflow going into 2026 \| AddyOsmani.com Home GitHub Press Biography Built LinkedIn Twitter Newsletter Blog My LLM coding workflow going into 2026 January 4, 2026 AI coding assistants became game-changers in 2025, but harnessing them effectively takes skill and structure. These tools dramatically … |
| 35 | Osmani, My LLM coding workflow going into 2026 (addyosmani.com) | One common mistake is diving straight into code generation with a vague prompt. In my workflow, and in many others', the first step is brainstorming a detailed specification with the AI, then outlining a step-by-step plan, before writing any actual code. For a new project, I'll describe the idea and ask the LLM to … |
| 36 | Osmani, My LLM coding workflow going into 2026 (addyosmani.com) | Next, I feed the spec into a reasoning-capable model and prompt it to generate a project plan : break the implementation into logical, bite-sized tasks or milestones. The AI essentially helps me do a mini “design doc” or project plan. I often iterate on this plan - editing and asking the AI to critique or refine it - … |
| 37 | Osmani, My LLM coding workflow going into 2026 (addyosmani.com) | Several coding-agent tools now explicitly support this chunked workflow. For instance, I often generate a structured “prompt plan” file that contains a sequence of prompts for each task, so that tools like Cursor can execute them one by one. The key point is to avoid huge leaps . By iterating in small loops, we … |
| 38 | Osmani, My LLM coding workflow going into 2026 (addyosmani.com) | Having a clear spec and plan means when we unleash the codegen, both the human and the LLM know exactly what we're building and why. In short, planning first forces you and the AI onto the same page and prevents wasted cycles. It's a step many people are tempted to skip, but experienced LLM developers now treat a … |
| 39 | Osmani, My LLM coding workflow going into 2026 (addyosmani.com) | A crucial lesson I've learned is to avoid asking the AI for large, monolithic outputs. Instead, we break the project into iterative steps or tickets and tackle them one by one . This mirrors good software engineering practice, but it's even more important with AI in the loop. LLMs do best when given focused prompts: … |
| 40 | Osmani, My LLM coding workflow going into 2026 (addyosmani.com) | This approach guards against the model going off the rails. If you ask for too much in one go, it's likely to get confused or produce a “jumbled mess” that's hard to untangle. Developers report that when they tried to have an LLM generate huge swaths of an app, they ended up with inconsistency and duplication - “like … |
| 41 | Osmani, My LLM coding workflow going into 2026 (addyosmani.com) | Expert LLM users emphasize this “context packing” step. For example, doing a “brain dump” of everything the model should know before coding, including: high-level goals and invariants, examples of good solutions, and warnings about approaches to avoid. If I'm asking an AI to implement a tricky solution, I might tell … |
| 42 | Osmani, My LLM coding workflow going into 2026 (addyosmani.com) | There are now utilities to automate context packaging. I've experimented with tools like gitingest or repo2txt , which essentially “dump” the relevant parts of your codebase into a text file for the LLM to read . These can be a lifesaver when dealing with a large project - you generate an output.txt bundle of key … |
| 43 | Osmani, Beyond Vibe Coding (O'Reilly, 2025) | When you refactor, you need to verify you didn’t break anything. So let’s segue into testing. The Importance of Testing: Unit, Integration, and End to End Testing is always important, but it’s especially important for AI-generated code for two reasons. First, since you didn’t write it from scratch, you want assurance … |
| 44 | Osmani, Beyond Vibe Coding (O'Reilly, 2025) | Write tests for each function or module you got from the AI, particularly covering edge cases. For our prime example, you might test with a prime number, a nonprime, 1 (an edge case), 0 or negative (maybe defining the expected behavior), a large prime, and so on. If the code passes all those tests, it’s likely … |
| 45 | Osmani, Beyond Vibe Coding (O'Reilly, 2025) | If the AI code interacts with other parts of the codebase, like a function that uses a database, write a test that calls it in context. Does it actually store to the database what it should? If it produces output consumed by another function, chain them in a test. End-to-end tests If this code is part of a larger … |
| 46 | Bhagwat & Gienow, Patterns for Building AI Agents (2026) | Related patterns Share Context Between Subagents, Feed Errors into Context, Avoid Context Failure Modes 32 SAM BHAGWAT & MICHELLE GIENOW G 9 FEED ERRORS INTO CONTEXT ood agents don’t just take a bag of tools and loop until they hit the goal. Instead, like smart humans, they examine and correct errors when something … |
| 47 | Bhagwat & Gienow, Patterns for Building AI Agents (2026) | Most popular coding agents do this. In Cursor’s Auto Run mode,1 if code execution fails, the agent automatically captures the error message and integrates this raw error output into its context. Windsurf ’s Cascade2 sends console errors to context for agent correction. Replit Agent3 feeds errors back into context and … |
| 48 | Osmani, Beyond Vibe Coding (O'Reilly, 2025) | This isn’t magic; it’s an accelerated version of what a diligent engineer might do when starting a new project (setting up directories, choosing libraries, writing boilerplate code). The important thing is that the AI’s creativity is bounded by the constraints given in the spec. The result is a minimum viable product … |
| 49 | Osmani, Beyond Vibe Coding (O'Reilly, 2025) | After observing dozens of teams, here are three patterns I’ve seen work consistently in both solo and team workflows: AI as first drafter The AI model generates the initial code and developers then refine, refactor, and test it AI as pair programmer Developer and AI are in constant conversation, with tight feedback … |
| 50 | Osmani, Beyond Vibe Coding (O'Reilly, 2025) | Also make sure the edge cases are handled as you expect. If you intended it to handle empty input, does it? If the input could be None or negative, did the AI consider that? If something about your prompt was ambiguous and the AI had to choose an interpretation, identify where that happened. Perhaps you didn’t specify … |
| 51 | Osmani, Beyond Vibe Coding (O'Reilly, 2025) | Remove or refine comments. If it added a comment like # check if number is prime above a self-explanatory if statement, you could remove that. But if it has a comment explaining a complex bit of logic, that’s good—keep or improve it. Ensure consistent formatting by running the code through a linter or formatter (like … |
| 52 | Skill authoring best practices - Claude Platform Docs | Database migration Run exactly this script: Do not modify the command or add additional flags. |
| 53 | Skill authoring best practices - Claude Platform Docs | description: Helps with documents description: Processes data description: Does stuff with files |
| 54 | Skill authoring best practices - Claude Platform Docs | (no passage returned) |
| 55 | Skill authoring best practices - Claude Platform Docs | (no passage returned) |
| 56 | VoltAgent awesome-claude-code-subagents, 09-meta-orchestration (GitHub) | Quick Selection Guide If you need to... Use this subagent Coordinate multiple agents agent-organizer Govern safe repo refactors codebase-orchestrator Manage context efficiently context-manager Handle system errors error-coordinator Combine knowledge sources knowledge-synthesizer Keep long-term memory clean across … |
| 57 | Skill authoring best practices - Claude Platform Docs | Step 2: Create field mapping Edit fields.json to add values for each field. Step 3: Validate mapping Run: python scripts/validate_fields.py fields.json Fix any validation errors before continuing. Step 4: Fill the form Run: python scripts/fill_form.py input.pdf fields.json output.pdf Step 5: Verify output Run: python … |
| 58 | Skill authoring best practices - Claude Platform Docs | Document editing process Make your edits to word/document.xml Validate immediately : python ooxml/scripts/validate.py unpacked_dir/ If validation fails: Review the error message carefully Fix the issues in the XML Run validation again Only proceed when validation passes Rebuild: python ooxml/scripts/pack.py … |
| 59 | Bhagwat & Gienow, Patterns for Building AI Agents (2026) | Example: Claude Code The Claude Code agent runs autocompact when you reach 95% of context window capacity, and automatically summarizes the full trajectory of user-agent interactions. It also supports the ability to run compaction manually or add custom instructions to specify how to do compaction.2 Example: Mastra … |

---
