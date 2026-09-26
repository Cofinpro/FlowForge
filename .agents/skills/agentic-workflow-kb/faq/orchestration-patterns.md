# FAQ: orchestration-patterns

Notebook answers recorded verbatim with their citations. Distilled guidance lives
in the references; this file is the audit trail behind it.

---
## orchestration-patterns-1: Which orchestration patterns exist and when does each fit?

- asked 2026-09-26 · notebook "Agentic Workflows" · conversation `0b2de1d4-674d-43a4-9311-00014d0e1f0f`
- Sources: Albada, Building Applications with AI Agents (O'Reilly, 2025); Bhagwat, Principles of Building AI Agents; Bruniaux, claude-code-ultimate-guide: dynamic-workflows.md (GitHub); Bhagwat & Gienow, Patterns for Building AI Agents (2026); Koenigstein, AI Agents: The Definitive Guide (O'Reilly, 2025); Osmani, Beyond Vibe Coding (O'Reilly, 2025); VoltAgent awesome-claude-code-subagents, 09-meta-orchestration (GitHub); Grootendorst & Alammar, An Illustrated Guide to AI Agents (O'Reilly, 2025)

**Question**

> Give a catalogue of orchestration patterns for agentic workflows described in the sources (e.g. prompt chaining / sequential pipeline, routing, parallelization / fan-out-fan-in, orchestrator-workers / supervisor, hierarchical teams, evaluator-optimizer / reflection loops, handoff / swarm, blackboard / shared state). For each: what it is, when to use it, when not to, tradeoffs (cost, latency, reliability, debuggability). Also: how do the sources recommend deciding between a deterministic workflow and an autonomous agent, and when multi-agent is worth it over a single agent?

**Answer** (verbatim, citation markers resolve in the table below)

Based on the technical sources, multi-agent frameworks, and agentic design literature in your notebook, here is a comprehensive catalogue of orchestration patterns, decision frameworks for workflow autonomy, and criteria for choosing multi-agent architectures.

---

##### Part 1: Catalogue of Orchestration Patterns

Orchestration is the logic that composes, schedules, and supervises agent capabilities so that individual tool calls or reasoning steps flow into an end-to-end objective [1]. Below is the catalog of patterns derived from the sources.

```
       +-----------------------------------------------------------------------------------+
       |                            ORCHESTRATION PATTERNS                                 |
       +-----------------------------------------------------------------------------------+
       | 1. Sequential Pipeline  :  [Agent A] ---> [Agent B] ---> [Agent C]                |
       | 2. Router               :  [User Query] ---> (Router) ---> [Specialist Agent]     |
       | 3. Parallel / Fan-Out   :  [Task] ---> [Agent 1] | [Agent 2] ---> (Fan-In/Merge)   |
       | 4. Orchestrator-Worker  :  (Supervisor) <---> [Worker 1], [Worker 2]              |
       | 5. Hierarchical Teams   :  (Super-Supervisor) <---> [Sub-Team A], [Sub-Team B]    |
       | 6. Evaluator-Optimizer  :  [Actor] ---> Candidate ---> (Critic) --(Fail)--> [Actor] |
       | 7. Handoff / Swarm      :  [Agent A] --(Handoff Tool)--> [Agent B] (Peer-to-Peer) |
       | 8. Blackboard / State   :  [Agents] <---> { Shared State Bus / Thread Checkpoints }|
       +-----------------------------------------------------------------------------------+
```

---

###### 1. Prompt Chaining / Sequential Pipeline
* **What It Is:** A linear workflow where tasks are executed step-by-step [2, 3]. Each step waits for the previous step to complete and receives its output as context [2, 4, 5].
* **When to Use:** Strictly linear processes where step \\(N+1\\) depends directly on the result of step \\(N\\) (e.g., extract parameters \\(\rightarrow\\) query database \\(\rightarrow\\) format report) [2, 6-8].
* **When NOT to Use:** When tasks are independent and could run concurrently, or when complex non-linear branching and loops are required [6, 7, 9].
* **Tradeoffs:**
  * **Cost:** Moderate (proportional to chain length, zero fan-out token waste) [6, 10].
  * **Latency:** High/Sequential (wall-clock time is the cumulative sum of all steps) [10, 11].
  * **Reliability:** High for short pipelines, but errors can compound along long unvalidated chains [6, 12].
  * **Debuggability:** Excellent; each step produces a clear intermediate input/output payload for tracing [13, 14].

---

###### 2. Routing / Router
* **What It Is:** An LLM or classifier node that evaluates incoming user intent and routes the query to a specialized prompt, tool, or downstream agent [8, 15-18].
* **When to Use:** When inputs fall into distinct categories, user tiers, or functional domains requiring specialized context or tools (e.g., routing support vs. sales, or handling platform-specific posting) [18-21].
* **When NOT to Use:** For single-purpose agents where all requests follow the same domain logic (adds unnecessary latency and token overhead) [22].
* **Tradeoffs:**
  * **Cost:** Very low (router calls use lightweight models or structured enum outputs) [8, 23, 24].
  * **Latency:** Very low (+1 rapid classification hop) [23, 25].
  * **Reliability:** High, provided target agent responsibilities do not overlap ambiguously [19, 20].
  * **Debuggability:** Excellent; the routing decision (`goto` target) is explicit and easily logged [17, 19].

---

###### 3. Parallelization / Fan-Out Fan-In
* **What It Is:** Splitting a task into multiple subtasks executed simultaneously across independent subagents or tool calls, followed by a fan-in consolidation phase [3, 26-28].
  * **Parallel Barrier (`parallel()`):** Launches \\(N\\) agents concurrently and blocks until the last one finishes before moving to the next stage [28, 29].
  * **Streaming Pipeline (`pipeline()`):** Items stream through ordered stages independently without waiting for all items to finish earlier stages [5, 29].
* **When to Use:** When analyzing independent dimensions (e.g., security, performance, and accessibility checks on a pull request) or executing multi-strategy research [3, 27, 30-32].
* **When NOT to Use:** When parallel subagents lack shared context and risk creating mutually incompatible, uncombinable outputs (e.g., one subagent designing platforming controls while another designs a puzzle path system) [12, 33, 34].
* **Tradeoffs:**
  * **Cost:** High (multiplies token consumption across parallel calls) [35, 36].
  * **Latency:** Low wall-clock time (bounded by the single slowest subagent rather than the sum) [11, 28].
  * **Reliability:** Risk of "coherent incorrectness" or conflicting outputs if subagents operate without unified context [12, 33, 37].
  * **Debuggability:** Moderate; requires tracking asynchronous concurrent execution logs [38, 39].

---

###### 4. Orchestrator-Workers / Supervisor (Manager Coordination)
* **What It Is:** A central supervisor agent that analyzes user queries, dynamically selects specialized worker agents, delegates subtasks, and synthesizes worker responses back to the user [17, 19, 40-43].
* **When to Use:** Complex workflows with distinct domain boundaries (e.g., supply chain split into inventory, transportation, and supplier specialists) where central coordination avoids deadlocks [19, 41-44].
* **When NOT to Use:** Large-scale swarms or simple single-domain tasks (central supervisor becomes a processing bottleneck) [44, 45].
* **Tradeoffs:**
  * **Cost:** High (requires frequent token exchanges between supervisor and specialists) [35, 46].
  * **Latency:** Moderate to high (requires multi-turn dialogue between supervisor and workers) [45, 47].
  * **Reliability:** High control; central supervisor enforces policy and prevents runaway agent behavior [43, 44]. However, the supervisor is a single point of failure [44, 45].
  * **Debuggability:** Good; supervisor decision points form a structured, centralized audit trail [17, 43].

---

###### 5. Hierarchical Teams (Supervisors of Supervisors)
* **What It Is:** A multi-tiered structure where top-level supervisors delegate tasks to sub-team supervisors, who in turn coordinate specialized worker agents [41, 48-51].
* **When to Use:** Enterprise-scale applications requiring multi-departmental coordination (e.g., an executive orchestrator directing a Research Team graph and a Writing Team graph) [41, 44, 49-51].
* **When NOT to Use:** Standard small or medium projects (adds massive structural overhead and propagation latency) [44, 52].
* **Tradeoffs:**
  * **Cost:** Very high token consumption across multiple organizational layers [35, 46, 52].
  * **Latency:** High due to multi-level message propagation and waiting for sub-graph execution [52].
  * **Reliability:** Excellent organizational scalability and domain isolation [51, 53].
  * **Debuggability:** Complex; tracing state across nested subgraphs requires sophisticated telemetry [44, 52, 54].

---

###### 6. Evaluator-Optimizer / Reflection Loops (Actor-Critic)
* **What It Is:** An iterative loop where an Actor (Generator) produces candidate outputs, and an Evaluator (Critic) reviews the candidates against a strict rubric, passing feedback back to the Actor until criteria are met [55-58].
* **When to Use:** High-stakes tasks or fuzzy generative work where output is hard to produce perfectly in one pass, but easy to evaluate against a checklist or test suite (e.g., code generation, legal drafting) [55, 57, 59, 60].
* **When NOT to Use:** Real-time applications requiring minimal latency, or tasks lacking clear evaluation metrics [55, 58].
* **Tradeoffs:**
  * **Cost:** High (multiplies inference tokens per iteration) [55, 57].
  * **Latency:** High (requires test-time compute loops) [55, 57].
  * **Reliability:** Exceptionally high output accuracy and self-correction rate [55, 57, 59].
  * **Debuggability:** High; critique transcripts and execution logs explicitly reveal why candidate attempts failed [13, 61].

---

###### 7. Handoff / Swarm (Peer-to-Peer Handoffs)
* **What It Is:** A decentralized setup where active agents dynamically pass control and state to other specialist agents using specialized handoff tools, without routing through a central supervisor [62-66].
* **When to Use:** Flexible, dynamic collaborations between specialist peers where back-and-forth iteration is required (e.g., a research assistant gathering data, handing off to a writer, who hands back if evidence is thin) [44, 62, 66].
* **When NOT to Use:** Strictly regulated workflows requiring rigid, top-down auditability and predictable execution paths [44, 67].
* **Tradeoffs:**
  * **Cost:** Variable; efficient for direct handoffs, but can burn tokens if agents loop recursively [44, 62].
  * **Latency:** Low to moderate (bypasses supervisor routing steps between turns) [62, 66].
  * **Reliability:** Flexible and adaptive, but less predictable; emergent behaviors require robust handoff design and recursion limits [44, 66, 67].
  * **Debuggability:** Moderate to difficult; requires tracing dynamic peer-to-peer execution branches [63, 67].

---

###### 8. Blackboard / Shared State Architecture
* **What It Is:** An architecture where agents communicate asynchronously by reading from and writing to a centralized, structured state bus or checkpointed memory store (e.g., LangGraph `TypedDict`, Redis Streams, or Kafka topics) [15, 68-71].
* **When to Use:** Distributed multi-agent systems requiring decoupled communication, state persistence across system restarts, or thread isolation [15, 68, 69, 71].
* **When NOT to Use:** In-memory, single-turn interactions where passing variables directly in code is sufficient [72, 73].
* **Tradeoffs:**
  * **Cost:** Moderate; requires active context pruning/compression to prevent context window overflow [74, 75].
  * **Latency:** Low local access time; async message passing decouples execution from wait times [69, 76].
  * **Reliability:** Excellent durability, fault tolerance, and auditability; state snapshots allow execution to resume after interruptions [54, 77-79].
  * **Debuggability:** High; state snapshots can be inspected at any step in the workflow [54, 80, 81].

---

##### Pattern Comparison Matrix

| Pattern | Control Model | Token Cost | Latency Profile | Best Use Case |
| :--- | :--- | :--- | :--- | :--- |
| **Sequential Pipeline** | Linear Graph | Low–Moderate | Cumulative (High) | Step-by-step transformations [2, 6] |
| **Router** | Conditional Branch | Minimal | Fast (+1 quick hop) | Query classification & dispatch [18, 23] |
| **Parallel Fan-Out** | Barrier / Streaming | High | Fast (Parallel) | Independent multi-source evaluation [27, 28] |
| **Orchestrator-Worker** | Centralized Supervisor | High | Moderate–High | Dynamic multi-domain task management [41, 42] |
| **Hierarchical Teams** | Multi-Tier Supervisor | Very High | High | Enterprise multi-department systems [50, 51] |
| **Evaluator-Optimizer** | Iterative Feedback | Very High | High (Looping) | High-precision code/text generation [55, 57] |
| **Handoff / Swarm** | Decentralized Peer | Variable | Low–Moderate | Fluid back-and-forth collaboration [44, 62] |
| **Blackboard / State** | Shared Bus | Moderate | Fast / Async | Stateful, resilient distributed agents [68, 69] |

---

##### Part 2: Deciding Between Deterministic Workflows and Autonomous Agents

Choosing between fixed code, deterministic workflows, RAG/chatbots, and autonomous agents is a trade-off between **predictability and power** [82].

```
  +---------------------------------------------------------------------------------+
  |                            SPECTRUM OF AUTONOMY                                 |
  +---------------------------------------------------------------------------------+
  |  Deterministic Code  --->  Graph Workflows  --->  RAG/Chatbots  --->  Autonomous  |
  |  (Pure Scripts)            (FSM/HSM Bounds)       (Doc Q&A)           Agents        |
  +---------------------------------------------------------------------------------+
  |  Low Variability           Defined Decision       Search & Summary    High Input    |
  |  Zero Token Cost           Trees                  No External Actions Variability & |
  |  Ultra-Low Latency         Auditable Paths        Low Autonomy        Dynamic Plans |
  +---------------------------------------------------------------------------------+
```

###### Decision Framework (4 Core Factors) [83]

1. **Input Variability:**
   * **Deterministic Workflow:** Inputs follow predictable, structured schemas (e.g., CSV, JSON, fixed vendor invoice formats) [18, 84].
   * **Autonomous Agent:** Inputs are highly unstructured, open-ended, novel, or wildly variable (e.g., free-form user emails ranging from billing complaints to safety hazards) [84, 85].
2. **Reasoning Complexity:**
   * **Deterministic Workflow:** All decision branches, retry paths, and approval checkpoints can be pre-enumerated in advance [18, 84].
   * **Autonomous Agent:** Requires dynamic, multi-step planning, exploratory reasoning, or mid-stream replanning based on intermediate tool observations [84-86].
3. **Performance, Compliance & Auditability Constraints:**
   * **Deterministic Workflow:** Operations require ultra-low latency, strict audit trails, deterministic replay, or zero-token orchestrator overhead [18, 84, 87, 88].
   * **Autonomous Agent:** Tolerates higher model latency and cloud compute costs in exchange for contextual flexibility [84].
4. **Maintenance Burden:**
   * **Deterministic Workflow:** Low overhead; logic is maintained via explicit code, finite state machines (FSM/HSM), or DAG engines [18, 84, 89].
   * **Autonomous Agent:** High engineering burden; requires continuous evaluation sets, observability stacks, and guardrails to manage non-deterministic failure modes [84, 90, 91].

---

##### Part 3: When Multi-Agent Systems Are Worth It Over a Single Agent

###### Advantages of Starting with a Single Agent
Starting with a single-agent architecture is recommended whenever possible [47]. Single-agent systems offer:
* **Simplicity:** Easy implementation, lower resource requirements, and less engineering complexity [47, 92].
* **Lower Latency & Cost:** Avoids token bloat and multi-turn communication delays between agents [35, 47].

###### When Single-Agent Systems Break Down (The Monolithic "Michael Scott" Problem)
A single agent fails when overloaded with too many capabilities—resembling "Michael Scott" from *The Office* by performing poorly at everything [93].

1. **Tool Selection Degradation:** As the toolset expands beyond 10–16 tools, the unified prompt becomes overloaded, causing the agent's probability of picking the wrong tool or hallucinating arguments to rise significantly [93-96].
2. **Context Window Overflow & Rot:** Long-running workflows accumulate conversation history, tool outputs, and system instructions, causing performance to degrade as the context window reaches capacity [74, 75, 97].
3. **Role & Permission Boundaries:** Security requirements (RBAC), API rate limits, or distinct departmental access tiers force separation across distinct identities [98-101].

###### Principles for Expanding to Multi-Agent Architectures [102]
When transitioning to a multi-agent system, apply these software architecture principles:
* **Task Decomposition:** Break complex tasks into focused subtasks with minimal overlap [102].
* **Specialization:** Assign agents specialized roles and tailored system prompts, drastically narrowing the toolset per agent [20, 42, 103, 104].
* **Parsimony:** Add only the **minimal number of agents necessary** [105]. Every added agent introduces communication overhead and potential failure points [35, 46, 105].
* **Iterative Evolution:** Discover your multi-agent architecture iteratively rather than over-engineering upfront:
  \\[\text{Build 1 Specialist Agent} \longrightarrow \text{Notice Next Need} \longrightarrow \text{Split if Unwieldy} \longrightarrow \text{Add Router/Supervisor} [20]\\]

###### Multi-Agent Risks & Pitfalls
* **Higher Token Consumption:** Multi-agent systems consume significantly more tokens due to shared context handoffs and routing exchanges [35, 46].
* **Coordination Complexity & Latency:** Inter-agent communication introduces round-trip delays and potential message queues [46].
* **Incompatible Parallel Outputs:** Subagents operating in parallel without shared context can generate conflicting results (e.g., inconsistent code refactors), creating integration failures [12, 33, 37, 106].

---

💡 *Would you like to explore implementing one of these orchestration patterns using LangGraph or dynamic workflows, or set up evaluation sets for your agents?*

**Citations**

| # | Source | Cited passage |
|---|---|---|
| 1 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | An ecommerce recommendation agent must store user preferences and past purchase history to provide personalized recommendations. However, it must also prioritize recent data to ensure that recommendations remain relevant and accurate as user preferences change over time. Orchestration Orchestration is what turns … |
| 2 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | Chains The next increase in complexity brings us to chains. Chains refer to sequences of actions that are executed one after another, with each action depending on the successful completion of the previous one. Planning chains involves determining the order in which actions should be performed to achieve a specific … |
| 3 | Bhagwat, Principles of Building AI Agents | A workflow primitive is helpful for defining branching logic, parallel execution, checkpoints, and adding tracing. Let’s dive in. S 13 BRANCHING, CHAINING, MERGING, CONDITIONS o, what’s the best way to build workflow graphs? Let’s walk through the basic operations, and then we can get to best practices. Branching One … |
| 4 | Bhagwat, Principles of Building AI Agents | 54 SAM BHAGWAT Each step in the chain waits for the previous step to complete, and has access to previous step results via context. Merging After branching paths diverge to handle different aspects of a task, they often need to converge again to combine their results: Principles of Building AI Agents 55 Conditions … |
| 5 | Bruniaux, claude-code-ultimate-guide: dynamic-workflows.md (GitHub) | Use parallel() when all results must be available before the next step can begin: synthesizing across all findings, deduplicating across outputs, or making an early-exit decision based on the total count. pipeline(items, ...stages) pipeline() processes an array of items through a sequence of transformation stages. … |
| 6 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | By switching to LCEL, you reduce boilerplate, gain advanced execution features, and keep your chains concise and maintainable. Figure 5-8 illustrates the general agentic chain pattern that underlies many LCEL workflows. Figure 5-8. Agentic chain execution pattern. The user prompt is passed to the model, which performs … |
| 7 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | Graphs offer the ultimate flexibility for modeling complex, nonlinear workflows—enabling you to branch, merge, and consolidate multiple tool executions into a unified process. However, this expressiveness comes with added overhead: more LLM calls, deeper routing logic, and the potential for cycles or unreachable … |
| 8 | Bhagwat & Gienow, Patterns for Building AI Agents (2026) | 10 SAM BHAGWAT & MICHELLE GIENOW Iteration 5: So you add a content coordination step in front of the router agent. It extracts key messages/features from product briefs, then passes consistent talking points to the router, which passes them to specialist agents. Now you have sequential chaining: Coordinator → Router → … |
| 9 | Bruniaux, claude-code-ultimate-guide: dynamic-workflows.md (GitHub) | The underlying work was identical. The pipeline() version added 2x tokens and 3x latency because the design forced a barrier at stage boundaries that the data did not require. Decision rule Start every multi-item workflow with pipeline() . Only introduce a parallel() barrier when you can articulate a specific reason: … |
| 10 | Bruniaux, claude-code-ultimate-guide: dynamic-workflows.md (GitHub) | Practical cost model for a typical workflow: <cited_table> Rule of thumb from the Anthropic community: "If you can sketch a non-trivial flowchart with parallel branches, loops, and data handoffs between stages, dynamic workflows are likely appropriate." The flowchart test keeps you from reaching for workflows on tasks … |
| 11 | Bruniaux, claude-code-ultimate-guide: dynamic-workflows.md (GitHub) | Parallel fan-out reduces wall-clock time dramatically for independent subtasks. A verified example from the community cookbook: 6 parallel agents corrected 5 READMEs in 37 seconds, where sequential execution would have taken approximately 3 to 5 minutes for the same work. Sequential stages in pipeline() add necessary … |
| 12 | Bhagwat & Gienow, Patterns for Building AI Agents (2026) | Your challenge as a builder of agents: Doing context engineering well is highly nontrivial. A 5 PARALLELIZE CAREFULLY gents have to be reliable while running for long periods of time and maintaining coherent conversations. If you don’t contain the potential for compounding errors, things fall apart quickly. Problem: … |
| 13 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | ReAct agents excel in exploratory scenarios—dynamic data analysis, multisource aggregation, or troubleshooting—where the ability to adapt midstream outweighs the additional latency and computational overhead. Their looped structure also provides transparency (“chain of thought”) that aids debugging and auditability, … |
| 14 | Bhagwat, Principles of Building AI Agents | In this example, a processData step is executing, conditional on the fetchData step succeeding. 56 SAM BHAGWAT Best Practices and Notes It’s helpful to compose steps in such a way that the input/output at each step is meaningful in some way, since you’ll be able to see it in your tracing. (More soon in the Tracing … |
| 15 | Koenigstein, AI Agents: The Definitive Guide (O'Reilly, 2025) | Mapping FSM/HSM to Agent Frameworks LangGraph already speaks the language of state machines and hierarchy. You implement it with subgraphs and shared keys. The router or decision-making agent that selects the next action (such as calling the next agent or tool) is analogous to the event handler in a classic state … |
| 16 | Koenigstein, AI Agents: The Definitive Guide (O'Reilly, 2025) | Route between predefined paths (e.g., router node) Redesign or rewire their own control graph Select which tools or sub-agents to call Generate and validate new graph topologies dynamically Decide if more steps are needed before completion Continuously assess tool effectiveness or create new tools autonomously Revise … |
| 17 | Koenigstein, AI Agents: The Definitive Guide (O'Reilly, 2025) | The first thing you need is a helper (Example 2-21) to create your supervisor. This function acts as a router (see “Mapping FSM/HSM to Agent Frameworks”) that decides which worker should take the next step, or whether the process should finish. Example 2-21. Helper function for supervisor class State(MessagesState): … |
| 18 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | Next, consider deterministic or semiautomated workflows. Here, the logic can be expressed as a finite set of steps or branches, and you know ahead of time where you might need human intervention or extra error handling. Suppose you ingest invoices from a small set of vendors and each invoice arrives in one of three … |
| 19 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | The supervisor node acts as a central coordinator, analyzing queries and routing to specialists—exemplifying streamlined decision making without full consensus overhead. Specialist nodes then process independently, invoking tools and responding. This structure mitigates conflicts through clear role boundaries and … |
| 20 | Bhagwat & Gienow, Patterns for Building AI Agents (2026) | Solution: Group agent functionality together The best agent architectures are discovered by iterating:1 1. List the tasks you want your agent to perform. 2. Start with the one burning problem. 3. Build that agent really well. 4. Notice what users ask for next. 5. If it’s separate, build a new agent. 6. If your agent … |
| 21 | Bhagwat & Gienow, Patterns for Building AI Agents (2026) | which tools it uses, how much memory it keeps, and which model it invokes — all based on runtime signals like user roles, preferences, or system state. (Some agent frameworks offer tools to help with this.) This reduces redundancy, increases customization potential, and allows cost/behavior trade-offs, but introduces … |
| 22 | Bruniaux, claude-code-ultimate-guide: dynamic-workflows.md (GitHub) | 1. When to use workflows (vs Agent tool vs Skills) Claude Code offers three related surfaces for delegation and reusable procedures: the Agent tool, Skills, and dynamic workflows. Picking the wrong one adds overhead or leaves an intended guarantee unenforced. Use the Agent tool directly when the task is a single … |
| 23 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | That said, they aren’t always the most efficient choice. For many tasks—especially those that are well-defined, low-latency, or cost-sensitive—much smaller models can provide near-equivalent performance at a fraction of the cost. This has led to a growing trend: automated model selection. Some platforms now route … |
| 24 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | Cost and latency considerations often tip the scales in real-world deployments. Large models deliver high performance but are expensive to run and may introduce response delays. In cases where that is untenable, smaller models or compressed versions of larger models provide a better balance. Many developers adopt … |
| 25 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | Reflex Agents Reflex agents implement a direct mapping from input to action without any internal reasoning trace. Simple reflex agents follow “if-condition, then-action” rules, calling the appropriate tool immediately upon detecting predefined triggers. Because they bypass intermediate thought steps, reflex agents … |
| 26 | Koenigstein, AI Agents: The Definitive Guide (O'Reilly, 2025) | A concrete mode that lives inside a superstate. It has its own edges but inherits the superstate’s guards and actions. History A “remember where I was” marker. Shallow history resumes at the last active child; deep history resumes inside nested grandchildren. In agent terms, this is a checkpoint for a portion of the … |
| 27 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | While this single tool execution pattern is simple, it forms the foundation upon which more complex multistep planning and tool orchestration strategies are built in advanced agent systems. In the next section, we’ll look at how we can execute more tools without sacrificing latency. Parallel Tool Execution The first … |
| 28 | Bruniaux, claude-code-ultimate-guide: dynamic-workflows.md (GitHub) | parallel(thunks[]) parallel() takes an array of zero-argument functions (thunks), launches all of them concurrently, and returns when the slowest one finishes. Results come back in input order regardless of completion order. parallel() is a barrier primitive. Nothing after it runs until every agent in the array has … |
| 29 | Bruniaux, claude-code-ultimate-guide: dynamic-workflows.md (GitHub) | 4. pipeline() vs parallel(): when and why This is the most common source of performance problems in workflow design. The two primitives look similar but have fundamentally different semantics. parallel() is a barrier. It launches N agents concurrently and blocks until the last one finishes. Nothing runs after the … |
| 30 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | Agents also excel when many subtasks must run in parallel—such as a security operations agent that simultaneously queries threat intelligence APIs, scans network telemetry, and performs sandbox analysis on suspicious binaries. Because agents operate asynchronously and reprioritize based on real‐time data, they avoid … |
| 31 | Bruniaux, claude-code-ultimate-guide: dynamic-workflows.md (GitHub) | The audit-and-verify pattern Two chained schemas implement adversarial verification: a first wave generates findings, a second wave tries to refute each one: |
| 32 | Bruniaux, claude-code-ultimate-guide: dynamic-workflows.md (GitHub) | The budget-guard version runs judge panels in a loop until consensus is reached or budget is exhausted: Multi-strategy sweep parallel() runs multiple agents approaching the same problem with different strategies or sources. The outputs are synthesized with cross-source verification. Common uses: research tasks … |
| 33 | Bhagwat & Gienow, Patterns for Building AI Agents (2026) | Frequently, though, realworld tasks have nuance where Subagent 1 and Subagent 2, unaware of each others’ work, create responses that are in conflict — forcing the final agent to combine two incompatible, intermediate products. Solution: Use a single-threaded linear agent With incompatible parallelized tasks, simply … |
| 34 | Bhagwat & Gienow, Patterns for Building AI Agents (2026) | Now the final agent must somehow combine a runner fleeing lethal enemies with a path system that requires stopping and thinking! Important: Notice that different teams have different opinions on this point! For coding agents, Devin (Cognition) avoids parallelizing tasks. But Claude Code relies on parallelized tasks … |
| 35 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | While not always the case, multiagent systems often encounter reduced efficiency due to higher token consumption when completing tasks. Because agents must frequently communicate, share context, and coordinate actions, they consume more processing power and resources compared with single-agent systems. This increased … |
| 36 | Bruniaux, claude-code-ultimate-guide: dynamic-workflows.md (GitHub) | The conceptual question to ask: "does step N need all results from step N-1 before it can start?" If yes, parallel() is correct. If items are independent and each one just needs its own previous-stage result, pipeline() is correct. Performance data A community benchmark comparing the two primitives on equivalent work … |
| 37 | Osmani, Beyond Vibe Coding (O'Reilly, 2025) | Unlike interactive AI assistance where humans intervene at each step, autonomous agents make chains of decisions that can compound errors in unique ways. When an agent misinterprets the initial requirements, it doesn’t just generate one flawed function: it builds an entire implementation architecture on that … |
| 38 | Koenigstein, AI Agents: The Definitive Guide (O'Reilly, 2025) | Example 1-12. Branch a parallel thread for a different follow-up branch_answer = run_with_tracing( app, {"messages": [HumanMessage(content="Instead of squaring, convert it to Fahrenheit and report both.")]}, config=cfg_branch, title="BRANCH", ) print("\nBRANCH (final assistant):\n", branch_answer) Finally, you can … |
| 39 | Bhagwat, Principles of Building AI Agents | typically talk about how important it is to look at production data for every step, of every run, of each of their workflows. Agent frameworks like Mastra that let you write your code as structured workflow graphs will also emit telemetry that enables this. Observability Observability is a word that gets a lot of … |
| 40 | Koenigstein, AI Agents: The Definitive Guide (O'Reilly, 2025) | Just as individual skills eventually meet their limits, a single agent can only take a workflow so far before complexity demands coordination. If you think about it, in a small company, a single contributor might handle everything end-to-end: designing, coding, testing, and deploying. But as the project grows, the … |
| 41 | Koenigstein, AI Agents: The Definitive Guide (O'Reilly, 2025) | Advanced Agent Paradigms: Supervisor and Hierarchical Agents If your tasks start getting more complex than the ones you’ve seen so far, or if you notice your agent struggling, it can help to break the task into smaller subtasks. Think of it like building a team: each person brings a different skill to the table, and … |
| 42 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | Building on the single-agent supply chain example from the previous subsection, let’s evolve it into a multiagent system. Here, we decompose the 16 tools into three specialized agents: one for inventory and warehouse management, one for transportation and logistics, and one for supplier relations and compliance. A … |
| 43 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | Manager Coordination Manager coordination adopts a more centralized approach, where one or more agents are designated as managers that are responsible for overseeing and directing the actions of subordinate agents. In this model, managers take on a supervisory role, making decisions, distributing tasks, and resolving … |
| 44 | Koenigstein, AI Agents: The Definitive Guide (O'Reilly, 2025) | The supervisor, hierarchical, and swarm architectures from this section show how different coordination strategies affect MAS. Supervisors provide centralized control, hierarchies allow scalable organization into teams of teams, and swarms emphasize flexible peer-to-peer collaboration. Table 2-4 compares these … |
| 45 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | However, the reliance on managers introduces certain vulnerabilities. A single point of failure exists because if a manager agent fails or is compromised, the entire system may experience disruptions. Additionally, scalability becomes a concern as the system grows; managers can become bottlenecks if they cannot handle … |
| 46 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | Adaptability is another core advantage, as multiagent systems can respond dynamically to changing conditions. By coordinating their actions, agents can reallocate roles and responsibilities as needed, adapting to new information or environmental changes in real time. This adaptability enables the system to remain … |
| 47 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | How Many Agents Do I Need? Begin with a simple approach, and only add complexity as needed to improve performance. The appropriate number and organization of agents will vary enormously based on the difficulty of the tasks, the number of tools, and the complexity of the environment. Single-Agent Scenarios We’ll begin … |
| 48 | Koenigstein, AI Agents: The Definitive Guide (O'Reilly, 2025) | Hierarchical State Machines Hierarchical state machines let states contain other states. Superstates capture shared entry/exit behavior and shared guards. Substates inherit those rules and add their own. History nodes remember which substate you were in when you left, so you can resume exactly there later. These new … |
| 49 | Koenigstein, AI Agents: The Definitive Guide (O'Reilly, 2025) | This modular approach makes it easy to compose increasingly capable MAS step by step: first by wiring up specialized workers, then by combining entire teams into larger graphs. In practice, this means you can start small—say with search, scraping, and patent lookup in a research team, and then plug that into a writing … |
| 50 | Koenigstein, AI Agents: The Definitive Guide (O'Reilly, 2025) | Example 2-28. Build hierarchical architecture super_builder = StateGraph(State) super_builder.add_node("supervisor", teams_supervisor_node) super_builder.add_node("research_team", call_research_team) super_builder.add_node("writing_team", call_paper_writing_team) super_builder.add_edge(START, "supervisor") super_graph … |
| 51 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | Hierarchical Coordination Hierarchical coordination takes a multitiered approach to organization, combining elements of both centralized and decentralized control through a structured hierarchy. In this system, agents are organized into multiple levels, with higher-level agents overseeing and directing those below … |
| 52 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | Despite these advantages, hierarchical coordination presents its own challenges. The complexity of designing a hierarchical system can be substantial, as each level must be carefully structured to ensure smooth coordination between layers. Communication delays can arise due to the need for information to propagate … |
| 53 | Koenigstein, AI Agents: The Definitive Guide (O'Reilly, 2025) | The diagram in Figure 2-4 shows how a single-agent setup compares to these two multi-agent patterns. Figure 2-4. Comparison of single, supervisor, and hierarchical agent architectures. The primary benefits of using a MAS are its modularity, specialization, and control. By separating functionality across agents, you … |
| 54 | Koenigstein, AI Agents: The Definitive Guide (O'Reilly, 2025) | checkpointer = MemorySaver() app = parent.compile(checkpointer=checkpointer) cfg = {"configurable": {"thread_id": "session-1"}} app.invoke({"messages": [HumanMessage(content="start")], "working_last": None}, config=cfg) Substates set working_last on exit. Compile with checkpointing. Run in a thread. MemorySaver … |
| 55 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | This pattern shines in high-stakes workflows where early errors can cascade into costly failures—such as financial transaction orchestration, medical diagnosis support, or critical incident response. By pairing each action with a reflection step, agents detect when tool outputs deviate from expectations and can replan … |
| 56 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | Figure 7-2. Reflexion agent. Despite the significant improvement that Reflexion can add to agents, this approach can be implemented with just a few lines of code: from typing import Annotated, List, Dict from typing_extensions import TypedDict from langchain_openai import ChatOpenAI from langgraph.graph import … |
| 57 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | Actor-Critic Approaches The actor-critic pattern in agentic systems is a lightweight form of evaluation-driven iteration. In this setup, the actor is responsible for generating candidate outputs—such as answers, plans, or actions—while the critic serves as a quality gate, accepting or rejecting outputs based on a … |
| 58 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | There’s a clear evaluation rubric or checklist (e.g., correctness, completeness, tone). The cost of generating additional outputs is acceptable relative to the benefit of higher quality. The task is fuzzy or generative in nature, where a single attempt often underperforms a reranked or filtered approach. In the supply … |
| 59 | Osmani, Beyond Vibe Coding (O'Reilly, 2025) | This underscores why environment setup is so important for autonomous agents: if they can run everything a developer would (linters, tests, builds), they can self-correct many errors automatically. Agents like Devin emphasize this loop—Devin “writes code, finds bugs in the code, corrects the code, and runs its own … |
| 60 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | Actor-critic setups are particularly useful when evaluation is easier than generation. If you can reliably say “This is a good output,” but can’t easily produce it on the first try, then a simple actor-critic loop can be a powerful tool—no learning required. As an easy strategy to implement, it is often worth trying … |
| 61 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | The prompt is built in three sections to turn the model into its own coach: first, a brief framing instruction tells the model “you failed your task—focus on strategic missteps rather than summarizing the environment and output your corrective plan after the word ‘Plan,’” which ensures a concise, parseable response. … |
| 62 | Koenigstein, AI Agents: The Definitive Guide (O'Reilly, 2025) | Another important paradigm is the swarm architecture. Here, agents handoff control to one another dynamically based on their specializations. Unlike a strict hierarchy, swarms emphasize peer-to-peer collaboration. The system keeps track of which agent was last active so that subsequent interactions continue seamlessly … |
| 63 | Koenigstein, AI Agents: The Definitive Guide (O'Reilly, 2025) | Figure 2-8. Handoff flow between a swarm of agents. LangGraph provides an open-source library to fast track the development of swarms of agents. By default, the agents in the swarm use handoff tools created with the prebuilt create_handoff_tool. You can also create your own custom handoff tools to better fit your … |
| 64 | Koenigstein, AI Agents: The Definitive Guide (O'Reilly, 2025) | Control what data is passed to the next agent. By default, create_handoff_tool passes the full message history (all prior agent messages) and a tool message confirming the handoff, but you may choose to send only a filtered subset of context. Before wiring up a full swarm, you first need to define the handoff helpers … |
| 65 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | In sum, while multiagent systems offer powerful advantages in handling complex, multifaceted tasks, they also require careful planning to manage the additional complexity and coordination requirements they introduce. By assigning agents distinct roles, enabling parallel processing, and incorporating adaptability and … |
| 66 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | Unlike traditional multiagent systems, which often rely on explicit role assignment and centralized coordination, swarm systems emphasize decentralization and self-organization. Each agent follows its own set of local policies or behaviors, typically without a global view of the system. Yet, through repeated, local … |
| 67 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | Swarms are particularly effective in environments where centralized control is impractical or undesirable. For example, they are useful in large-scale data discovery, researching across multiple sources, or distributed decision making. In these scenarios, agents can operate semi-independently, contribute small … |
| 68 | Koenigstein, AI Agents: The Definitive Guide (O'Reilly, 2025) | The parent graph’s TypedDict defines the shared “bus”. Subgraphs declare which keys they read and write. Overlapping keys are the superstate’s interface. class State(TypedDict): messages: List[BaseMessage] working_last: str \| None Shared bus across parent and subgraphs. Optional shallow history marker. Nodes and … |
| 69 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | Still, A2A points to a future where agents don’t operate in isolation but as part of dynamic, loosely coupled ecosystems capable of tackling broader and more sophisticated problems. Much like HTTP enabled the composability of the web, A2A aspires to do the same for AI agents. It’s too early to say whether it will … |
| 70 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | To see the utility of this approach, consider integrating a message broker into a supply chain multiagent system from earlier in this chapter. In the original synchronous setup, the supervisor directly routes to a specialist via graph edges, creating tight coupling. By using a broker, the supervisor can publish tasks … |
| 71 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | Managing State and Persistence Communication alone is not enough—multiagent systems must also manage shared state, agent memory, and task metadata that often span multiple executions, workflows, or system restarts. This introduces significant complexity in terms of data durability, consistency, and access patterns, … |
| 72 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | Local Versus Distributed Communication At a small scale—such as a single-device or single-process setup—agents often communicate through direct function calls, shared memory, or in-memory message queues. While simple and efficient, these methods don’t scale well. As soon as agents are distributed across services, … |
| 73 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | Single-container deployment Monolithic agent/service in one container; synchronous calls, in-memory state/orchestration Simple setup, low latency, easy prototyping Single failure point, poor scalability, concurrency issues Basic supply chain queries in prototypes; quick experiments with limited agents/tools (e.g. a … |
| 74 | Bhagwat & Gienow, Patterns for Building AI Agents (2026) | 30 SAM BHAGWAT & MICHELLE GIENOW reaches an x% threshold of context window capacity. Prune the oldest context (hierarchical summarization). Recursive summarization (chunk a text, summarize, combine, summarize again…). At certain post-process tool calls (e.g., tokenheavy search tools). Summarization at agent-agent … |
| 75 | VoltAgent awesome-claude-code-subagents, 09-meta-orchestration (GitHub) | Use when: Coordinating multiple agents, breaking down complex tasks, managing agent dependencies, synthesizing results, or designing agent workflows. context-manager - Context optimization expert Context specialist maximizing efficiency in AI conversations. Expert in context windows, information prioritization, and … |
| 76 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | In general, it’s wise to run specialists in separate processes (e.g., via multiprocessing). This enables fast async coordination—e.g., the supplier agent can process compliance tasks without blocking others—while keeping setup simple for lower-scale systems. Message buses support loose coupling between agents, … |
| 77 | Koenigstein, AI Agents: The Definitive Guide (O'Reilly, 2025) | Example 1-6. Compile with in-memory checkpoints and configure a thread checkpointer = MemorySaver() app = graph.compile(checkpointer=checkpointer) cfg = {"configurable": {"thread_id": "nyc-weather-session"}} Lightweight, per-thread checkpointing that persists state across turns. Produces a runnable app that knows how … |
| 78 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | This is a high-throughput, distributed event streaming platform ideal for agent systems where agents need to publish and consume structured events. Kafka supports strong durability, topic partitioning for parallelism, and consumer groups for coordination. It is especially effective for building log-based communication … |
| 79 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | Flexible, queryable, cost-effective Manual management, potential inconsistency Custom, high-query systems Vector stores (e.g., Pinecone) Semantic search, scalable embeddings Higher cost, specialized setup Knowledge-intensive agents Object storage (e.g., S3) Cheap, durable for large data Slow access, no native indexing … |
| 80 | Koenigstein, AI Agents: The Definitive Guide (O'Reilly, 2025) | Example 1-13. View snapshots for both threads print_state_snapshot(app, cfg, title="MAIN THREAD memory view") print_state_snapshot(app, cfg_branch, title="BRANCH THREAD memory view") With this small implementation, you now see exactly what the graph remembers, how it routed, and what the latest assistant state is for … |
| 81 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | To maintain immutable audit trails in multiagent systems without relying on decentralized technologies, organizations can leverage cryptographic chaining techniques, such as Merkle trees, where each data entry is hashed and linked to the previous one, creating a tamper-evident structure that agents can traverse to … |
| 82 | Bhagwat, Principles of Building AI Agents | and an object/dictionary for a list of tools that they are provided. But that creates a challenge. What if you want to change these things at runtime? What are Dynamic Agents? Choosing between dynamic and static agents is ultimately a tradeoff between predictability and power. A dynamic agent is an agent whose … |
| 83 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | Now that we’ve looked at some example agents, in the next section, we’ll discuss some of the key considerations when designing our agentic systems. Workflows and Agents In many real‐world projects, choosing between a simple script, a deterministic workflow, a traditional chatbot, a retrieval‐augmented generation (RAG) … |
| 84 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | Input structure Fully predictable schemas Mostly predictable with finite branches Highly unstructured or novel inputs Explainability Full transparency; easily auditable Explicit branch-by-branch audit trail Black-box components requiring additional tooling Latency Ultra-low latency Moderate latency Higher latency … |
| 85 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | Finally, we reach autonomous agents—situations where neither simple code, nor rigid workflows, nor RAG suffice because inputs are unstructured, novel, or highly variable, and because you require dynamic, multistep planning or continuous learning from feedback. Consider a customer support center that receives free‐form … |
| 86 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | Because real-world conditions can change in an instant—new information arrives, priorities shift, or resources become unavailable—an orchestrator must continuously monitor both progress and environment, pausing or rerouting workflows as needed to stay on course. In many scenarios, agents build plans incrementally: … |
| 87 | Bruniaux, claude-code-ultimate-guide: dynamic-workflows.md (GitHub) | What : A dynamic workflow is a JavaScript file that orchestrates multiple subagents using a small set of primitives ( agent , parallel , pipeline , phase ). The script itself runs as the orchestrator and consumes zero tokens; all token cost comes from the agent() calls it makes. The runtime handles concurrency caps, … |
| 88 | Bruniaux, claude-code-ultimate-guide: dynamic-workflows.md (GitHub) | Use a dynamic workflow when three or more of these conditions hold: the task has multiple stages that feed into each other, some stages can run in parallel, the job is long enough that resume-on-interruption matters, you need a reproducible orchestration path, or you need structured JSON schemas to pass data between … |
| 89 | Bhagwat, Principles of Building AI Agents | There’s alpha in playing around with MCP, but you probably don’t want to roll your own, at least not right now. Look for a good framework or library in your language. PART IV GRAPH-BASED WORKFLOWS W 12 WORKFLOWS 101 e've seen how individual agents can work. At every step, agents have flexibility to call any tool … |
| 90 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | In our framework, this kind of evaluation is operationalized through an evaluate_single_instance function, which executes a complete test case and computes a set of metrics. The agent is given a structured input—including the order data and conversation history—and its outputs are compared against an expected final … |
| 91 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | By integrating Grafana deeply into your agent development lifecycle, you create a living interface to your deployed systems. It becomes the shared canvas where product teams, engineers, and reliability staff can observe, debug, iterate, and improve. In the world of agent-based systems—where bugs are probabilistic and … |
| 92 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | Easier implementation and management Lower resource requirements Less computational overhead Latency Quicker response for users Single-agent systems offer a strong starting point for building agentic applications. Their simplicity, lower cost, and reduced latency make them well suited for many practical … |
| 93 | Bhagwat & Gienow, Patterns for Building AI Agents (2026) | Patterns for Building AI Agents 7 C 2 EVOLVE YOUR AGENT ARCHITECTURE omplex AI workflows benefit from the same "divide and conquer" principles that work well in traditional software engineering. Problem: Monolithic mega-agents As you add more tasks to your agent, over time you can end up with a mega-agent that … |
| 94 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | To illustrate, consider a single-agent system for supply chain logistics management. This agent handles a broad set of tools for inventory, shipping, and supplier tasks in one unified prompt and graph. While effective for basic queries, performance can degrade with too many tools, as the agent must select from a large … |
| 95 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | However, as the toolset expands—here, to 16—the agent’s system prompt must describe all possibilities, potentially leading to confusion or suboptimal choices. This is where the single-agent model’s limitations begin to show, paving the way for multiagent decomposition. Now, let’s complete the agent setup with the … |
| 96 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | For most use cases, though, the key bottleneck arises when the number of tools and responsibilities increases. When an agent is expected to choose the correct tool from a set, performance degrades as the potential number of tools increases. Before jumping to multiagents, consider scaling within the single-agent … |
| 97 | Grootendorst & Alammar, An Illustrated Guide to AI Agents (O'Reilly, 2025) | To manage this complex network of contexts, smaller agents can be used to handle some of the context “burden”, as we illustrated in the deep research agent. By using a smaller agent with a smaller LLM for specific tasks, part of the context can be handled separately, leaving significant compute for the main agent … |
| 98 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | Single-agent setups work well in environments where the problem domain is well-defined, tasks are straightforward, and there is no significant need for scaling. This makes them a fit for customer service chatbots, general-purpose assistants, and code generation agents. We’ll discuss single-agent and multiagent … |
| 99 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | Multiagent Scenarios In multiagent systems, multiple agents collaborate to achieve shared goals, an approach that is especially advantageous when tasks are complex and require varied toolsets, parallel processing, or adaptability to dynamic environments. A key benefit of multiagent systems is specialization: each … |
| 100 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | At this level, role-based access control (RBAC) becomes crucial. Agents must differentiate between public, internal, and restricted knowledge. They should have different privileges when acting on behalf of a VP than when assisting an intern. Clear delegation frameworks and logging are essential to ensure … |
| 101 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | Enterprise systems, analytics High or restricted Company-wide analytics agent, AI help desk Each scope comes with different requirements for autonomy, oversight, data access, and trust calibration. For example, a personal agent can take small risks with limited scope, while an organizational agent must operate with … |
| 102 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | Principles for Adding Agents When expanding a system by adding more agents, a strategic approach is essential to ensure the system remains efficient, manageable, and effective. The following principles serve as guidelines for optimizing agent-based design and functionality: Task decomposition Task decomposition is a … |
| 103 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | With tools grouped, we bind them to separate language model instances for each specialist. This allows for tailored prompts and reduces context size per agent, enhancing focus and efficiency. Multiagent architectures like this enable parallel processing (e.g., one agent optimizing delivery while another evaluates … |
| 104 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | Specialization enables agents to be assigned roles that match their strengths, thereby maximizing the system’s collective capabilities. When each agent is tasked with activities that align with its specific functions, the system operates with greater precision and effectiveness. Specialized agents are more adept at … |
| 105 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | Parsimony is a guiding principle that encourages adding only the minimal number of agents necessary to achieve the desired functionality and performance. This principle emphasizes simplicity and efficiency, reminding developers that each agent added to the system introduces additional communication overhead, … |
| 106 | Bhagwat & Gienow, Patterns for Building AI Agents (2026) | rather than working in isolation with limited information. Problem: Agent miscommunication When your agent is delegating tasks to subagents — like when a human manager splits up a task and assigns parts to different people — they can create mutually incompatible outputs. Solution: Parallelize carefully Instead of just … |

---
