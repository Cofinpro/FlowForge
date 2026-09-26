# FAQ: control-flow-and-state

Notebook answers recorded verbatim with their citations. Distilled guidance lives
in the references; this file is the audit trail behind it.

---
## control-flow-and-state-1: How are loops, termination, retries, errors and resume modelled?

- asked 2026-09-26 · notebook "Agentic Workflows" · conversation `d8a39eb0-6b8c-46a8-8963-3e82f3fd60fc`
- Sources: Koenigstein, AI Agents: The Definitive Guide (O'Reilly, 2025); Bruniaux, claude-code-ultimate-guide: dynamic-workflows.md (GitHub); Albada, Building Applications with AI Agents (O'Reilly, 2025); Osmani, Beyond Vibe Coding (O'Reilly, 2025); Bhagwat & Gienow, Patterns for Building AI Agents (2026); Bhagwat, Principles of Building AI Agents

**Question**

> How do finite state machines and hierarchical state machines structure agent behaviour according to the sources? How should an agentic workflow model loops, termination conditions, maximum iterations, retries, timeouts, error handling, fallbacks and checkpointing/resume of state? And how could a business process model with tasks, decision gateways, loops and parallel branches (like BPMN) be mapped onto such agent control flow?

**Answer** (verbatim, citation markers resolve in the table below)

##### 1. Structuring Agent Behavior with State Machines (FSMs & HSMs)

State machines provide a conceptual and architectural blueprint for turning static LLM predictions into predictable, recoverable agentic workflows [1, 2].

###### Finite State Machines (FSMs)
A finite state machine models an agent as existing in one of a finite number of discrete modes or **States** at any given time [3, 4]. It transitions between states in response to **Events** (such as a tool invocation or result), guided by **Guards** (conditional checks), and executes **Actions** (e.g., invoking a tool, appending a message, or saving a checkpoint) [4, 5]. 

* **Decomposing Tasks into Stable Modes**: Instead of relying on a single, unstructured prompt, an FSM decomposes complex tasks into distinct, recoverable steps (e.g., *topic ideation → outline generation → drafting → editing → SEO optimization*) [6, 7]. The transitions between states explicitly define the rules for handing off control from one step to the next [7].
* **Recoverability**: Because an FSM operates across well-defined nodes, the system can save a **checkpoint** at every state node, allowing the workflow to resume after crashes or interruptions from the exact step where it failed [6].
* **FSM Limitations**: As workflow logic expands to include planning, reflection loops, human approvals, and retries, pure FSMs quickly lead to rule duplication or unmaintainable "spaghetti routing" across edges [7].

###### Hierarchical State Machines (HSMs)
Hierarchical state machines overcome FSM bloat by introducing nested state structures (**states within states**) [8, 9]:

* **Superstates and Substates**: A **Superstate** (e.g., a `WORKING` mode) groups child **Substates** (e.g., `PLAN`, `ACT`, `REFLECT`) [8, 10]. Global policies, safety filters, rate limits, or circuit breakers can be attached once to the superstate and are automatically inherited by all nested substates, eliminating policy duplication [8, 9].
* **History Markers**: HSMs utilize **History** nodes ("remember where I was" markers) [8, 10]. Shallow or deep history markers record the active substate so that if execution leaves and re-enters a superstate, the workflow resumes at the precise substate where it previously stopped [8, 10].
* **Parallel Regions**: HSMs support parallel child regions that fan out independent sub-tasks or specialized subagent roles simultaneously and join them upon completion [10].

###### Framework Mapping
In modern orchestration frameworks (such as **LangGraph** or **Claude Code dynamic workflows**), state machine concepts map directly into code primitives [11, 12]:
* **State Schema**: A strongly typed dictionary (`TypedDict` or Pydantic model) acts as the shared state memory/bus [13, 14].
* **Nodes & Subgraphs**: Individual functions act as substates, while nested **Subgraphs** function as HSM superstates [13, 15].
* **Guards & Router Edges**: Plain deterministic functions evaluate the current state to route execution down conditional edges [11, 15, 16].
* **Checkpointers**: Framework checkpointers (e.g., `MemorySaver`) manage history markers and thread persistence across turns [17, 18].

---

##### 2. Operational Control Flow in Agentic Workflows

Building robust, production-grade agentic workflows requires explicit control flow primitives to manage execution boundaries and failure modes [2, 19].

```
+-----------------------------------------------------------------------------------+
|                            AGENTIC CONTROL FLOW ENGINE                            |
|                                                                                   |
|  +-------------------+        +--------------------+        +------------------+  |
|  |       LOOPS       | -----> |    TERMINATION     | -----> |  RECURSION LIMIT |  |
|  | Think-Act-Observe |        | Goal Met / FINISH  |        | Step / Budget    |  |
|  +-------------------+        +--------------------+        +------------------+  |
|            |                           |                             |            |
|            v                           v                             v            |
|  +-------------------+        +--------------------+        +------------------+  |
|  |  ERROR-IN-CONTEXT | -----> |   SCHEMA RETRIES   | -----> | FALLBACKS & HITL |  |
|  | Traceback -> Prompt|       | Automatic Correction|       | Manual / Cache   |  |
|  +-------------------+        +--------------------+        +------------------+  |
|                                        |                                          |
|                                        v                                          |
|                       +----------------------------------+                        |
|                       |  CHECKPOINTING & RESUME (STATE)  |                        |
|                       +----------------------------------+                        |
+-----------------------------------------------------------------------------------+
```

###### Loops & Cycle Management
Agentic workflows embed reasoning within feedback loops (e.g., ReAct *think–act–observe* cycles, planner–executor loops, or actor–critic reflection) [20-23]. Control flow models these loops using **cyclic graph edges** (routing tool or critique outputs back to the primary agent node) or explicit `while` loops within orchestrator scripts [21, 24, 25].

###### Termination Conditions & Maximum Iterations
* **Halting Conditions**: The workflow evaluates stopping rules at the end of every cycle (e.g., checking if the model returned a final response without tool calls, or if a supervisor emitted a `FINISH` signal) [26, 27].
* **Maximum Iterations & Budget Guards**: To protect against runaway infinite loops (where LLMs cycle endlessly without making progress), workflows enforce hard step bounds (`max_steps`), recursion limits (`recursion_limit`), call ceilings (e.g., capped at 1,000 total agent calls), or remaining token budget guards (`budget.remaining()`) [28-32].

###### Retries, Timeouts, Error Handling & Fallbacks
* **Feed Errors into Context**: When tool calls or LLM-generated code fail, the raw error output or stack trace is fed directly into the next context turn so the agent can analyze the bug and self-correct [33-35].
* **Schema Validation Retries**: Responses are validated against JSON/Pydantic schemas [31, 36]. If validation fails, the orchestrator issues an automatic, hidden correction prompt to regenerate only the malformed output [31, 36]. Strategic tool/API retries utilize structured logic like exponential backoff [37].
* **Timeouts**: Long-running activity calls or network interactions use explicit timeout parameters (e.g., `start_to_close_timeout` in Temporal or async wait limits) to prevent process hangs [38, 39].
* **Graceful Fallbacks**: When retries fail or budgets are exhausted, workflows gracefully degrade by switching to backup models, using cached data, returning safe defaults, or escalating to human review [37, 40-42].

###### Checkpointing & State Resumption
* **State Persistence**: The entire application state (message history, metadata, output snapshots) is persisted to storage (such as in-memory checkpointers, Redis, or workflow databases) at key transition points [14, 17, 18, 43].
* **Deterministic Replay / Suspend & Resume**: Orchestrator logic enforces pure determinism (avoiding unseeded randomness or side-effects inside orchestrator execution) [44]. When a long-running process is interrupted or suspended for human approval, the engine replays cached step outputs and resumes execution seamlessly from the last valid checkpoint [17, 44-46].

---

##### 3. Mapping Business Process Models (BPMN) to Agent Control Flow

Traditional Business Process Model and Notation (BPMN) workflows use structured flow elements that map directly onto state-machine and graph-based agent topologies [16, 47, 48].

| BPMN Element | Agent Control Flow Construct | Operational Mapping & Implementation |
| :--- | :--- | :--- |
| **Service / Script Task** | **Graph Node / Tool Execution** | A discrete function, API invocation, or prompt step executed by the agent or subagent [12, 47, 49]. |
| **User Task / Manual Task** | **Human-in-the-Loop (HITL) Interrupt** | The workflow triggers a `suspend()` or `interrupt()`, persisting state and waiting for human approval, editing, or input before calling `resume()` [45, 50-52]. |
| **Exclusive Gateway (XOR)** | **Conditional Router Edge / Classifier** | An LLM-based router or deterministic guard function evaluates the state to select exactly one branch path [11, 15, 16, 27]. |
| **Parallel Gateway (Fork)** | **Parallel Region / Barrier Primitive** | Launches multiple independent agent tasks concurrently (e.g., `parallel()` or branching graph edges) [10, 53, 54]. |
| **Parallel Gateway (Join)** | **Consolidation Node** | A downstream graph node where divergent parallel paths reunite, merging outputs into a single unified context [47, 55]. |
| **Inclusive Gateway (OR)** | **Dynamic Multi-Branch Routing** | A supervisor or router returns a list of target specialist nodes to invoke dynamically based on query requirements [16, 56]. |
| **Looping Activity** | **Cyclic Graph Edge / Guarded Loop** | Cyclic node transitions (e.g., `tools → agent`) or programmatic `while` loops bounded by retry/iteration limits [21, 24, 25]. |

###### Hybrid Orchestration: BPMN vs. Agent Autonomy
* **Deterministic Workflows for Process Structure**: Deterministic workflow engines (such as Temporal, Airflow, or AWS Step Functions) handle known decision steps, rigid sequence constraints, transaction retries, and auditable control flows [19, 57, 58].
* **Agents as Dynamic Task Executors**: Autonomous agents operate within specific BPMN task nodes where unstructured data, semantic reasoning, or open-ended tool selection is required [39, 57, 59]. 

This hybrid pattern combines the strict operational guarantees and auditability of BPMN process models with the contextual reasoning and adaptability of LLM agents [19, 39, 48, 57].

---

💡 *Would you like to explore a code example implementing one of these patterns in LangGraph or Claude Code, or discuss strategies for designing Human-in-the-Loop approval gates?*

**Citations**

| # | Source | Cited passage |
|---|---|---|
| 1 | Koenigstein, AI Agents: The Definitive Guide (O'Reilly, 2025) | This section is meant to help you build a mental model of agents by showing how state machines form the foundation of modern AI agent frameworks. In simple terms, think of it as structured transitions, a pattern long used in compilers, GUIs, embedded systems, and networking protocols, now applied to reasoning and tool … |
| 2 | Koenigstein, AI Agents: The Definitive Guide (O'Reilly, 2025) | Foundations: From Static Models to Dynamic Agents As you saw in the previous section, adding states and control flows is essential for automation. The same principle applies to agents. To move from static LLM usage to agentic systems, you need explicit state and control flow. State turns one off tool calls into a … |
| 3 | Koenigstein, AI Agents: The Definitive Guide (O'Reilly, 2025) | This chapter explains how LLMs evolve from static prompts to dynamic agentic systems, why tool use is essential, and what being stateful and autonomous truly means in the design of modern AI agents. Finite and Hierarchical State Machines: The Base Paradigm of Agents LangGraph, CrewAI, and similar frameworks build on … |
| 4 | Koenigstein, AI Agents: The Definitive Guide (O'Reilly, 2025) | Finite State Machines A finite state machine has a small vocabulary in which it can act upon and modes your system can be in, and the allowed moves between them. Each move is triggered by an event, optionally guarded by a predicate, and may perform actions that update a state. Start and end are distinguished states … |
| 5 | Koenigstein, AI Agents: The Definitive Guide (O'Reilly, 2025) | Something that happens since the last decision, such as a tool being invoked or returning a result. Guard A check that decides which transition to take, based on the current state and latest event. Action Work performed during a transition, like invoking a tool, appending a message, saving a checkpoint, or requesting … |
| 6 | Koenigstein, AI Agents: The Definitive Guide (O'Reilly, 2025) | Figure 1-1. High level overview of a finite state machine for tool use. An FSM is ideal when behavior alternates among a few stable modes and when recoverability matters, since you can checkpoint on every node and resume after a crash from the last completed state. Thinking in terms of states lets you decompose a … |
| 7 | Koenigstein, AI Agents: The Definitive Guide (O'Reilly, 2025) | Transitions make you specify the conditions under which one task hands off to the next. For instance, what output from the outline generation state triggers the drafting state. This structure counters unstructured, one-shot prompts that often lead to inconsistent results with LLMs alone. As soon as you add more modes, … |
| 8 | Koenigstein, AI Agents: The Definitive Guide (O'Reilly, 2025) | Hierarchical State Machines Hierarchical state machines let states contain other states. Superstates capture shared entry/exit behavior and shared guards. Substates inherit those rules and add their own. History nodes remember which substate you were in when you left, so you can resume exactly there later. These new … |
| 9 | Koenigstein, AI Agents: The Definitive Guide (O'Reilly, 2025) | Figure 1-2. Overview of a hierarchical state machine with history marker hat records the last active substate. HSMs are particularly relevant to more advanced MAS. An HSM allows for “states within states”, which reduces duplication and makes policies obvious. For example, you can attach rate limits, safety filters, or … |
| 10 | Koenigstein, AI Agents: The Definitive Guide (O'Reilly, 2025) | A concrete mode that lives inside a superstate. It has its own edges but inherits the superstate’s guards and actions. History A “remember where I was” marker. Shallow history resumes at the last active child; deep history resumes inside nested grandchildren. In agent terms, this is a checkpoint for a portion of the … |
| 11 | Koenigstein, AI Agents: The Definitive Guide (O'Reilly, 2025) | Mapping FSM/HSM to Agent Frameworks LangGraph already speaks the language of state machines and hierarchy. You implement it with subgraphs and shared keys. The router or decision-making agent that selects the next action (such as calling the next agent or tool) is analogous to the event handler in a classic state … |
| 12 | Bruniaux, claude-code-ultimate-guide: dynamic-workflows.md (GitHub) | <cited_table> 2. Primitive reference A workflow file is a JavaScript module with two mandatory parts: a meta export (the structural backbone) and a default export function (the execution body). The runtime injects a small set of globals into the function's scope. |
| 13 | Koenigstein, AI Agents: The Definitive Guide (O'Reilly, 2025) | The parent graph’s TypedDict defines the shared “bus”. Subgraphs declare which keys they read and write. Overlapping keys are the superstate’s interface. class State(TypedDict): messages: List[BaseMessage] working_last: str \| None Shared bus across parent and subgraphs. Optional shallow history marker. Nodes and … |
| 14 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | This chapter will offer examples in LangGraph, a low-level orchestration framework for building stateful agentic workflows that was introduced in Chapter 1. LangGraph defines your application as a directed graph of nodes (pure functions such as foundation model calls, memory updates, or tool invocations) and edges … |
| 15 | Koenigstein, AI Agents: The Definitive Guide (O'Reilly, 2025) | def act_node(state: State) -> State: ai = AIMessage(content="Act on plan") return {"messages": [ai], "working_last": "act"} subgraph_builder = StateGraph(State) subgraph_builder.add_node("PLAN", plan_node) subgraph_builder.add_node("ACT", act_node) subgraph_builder.add_edge(START, "PLAN") subgraph = … |
| 16 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | This next section wires up the logical flow in each node into an actual execution graph. By creating a new StateGraph, we establish the starting point with START → categorize_issue, which ensures every request first passes through the classification step. Then, using add_conditional_edges, you encode the core business … |
| 17 | Koenigstein, AI Agents: The Definitive Guide (O'Reilly, 2025) | Add conditional edge inside subgraph. Parent graph with a global guard. Example policy: end if user said stop. History and checkpointing MemorySaver gives you shallow and deep history for free: resuming a thread recreates the subgraph at the last completed node. If you want explicit “return to where I was inside … |
| 18 | Koenigstein, AI Agents: The Definitive Guide (O'Reilly, 2025) | The state carries the conversation as a message list. add_messages handles safe merging across node updates. Core reasoning node. It takes the current state and returns a new assistant message. Prebuilt node to execute tool calls emitted by the assistant. Graph container for nodes and edges. Router. If the last … |
| 19 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | Orchestration and Workflow Engines Even with robust messaging and agent execution models, real-world systems need orchestration—the logic that sequences tasks, handles retries, tracks dependencies, and manages failure across agents. This is especially important for long-running or multistep interactions that span time … |
| 20 | Koenigstein, AI Agents: The Definitive Guide (O'Reilly, 2025) | Agency emerges when reasoning is coupled with action. Reasoning is the internal process of planning or deciding the next step. Action extends this by invoking tools, retrieving data, executing code, or calling external services. Together they form an iterative loop: reason, act, receive feedback, and adjust. This loop … |
| 21 | Koenigstein, AI Agents: The Definitive Guide (O'Reilly, 2025) | Here, c t = ( o 1 , a 1 , ... , o t-1 , a t-1 , o t ) . In other words, the agent carries forward not only what it has done, but also why it chose that path. This recursive structure is what enables reflection: the agent’s future decisions are informed by both its history of actions and the reasoning it has … |
| 22 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | ReAct agents excel in exploratory scenarios—dynamic data analysis, multisource aggregation, or troubleshooting—where the ability to adapt midstream outweighs the additional latency and computational overhead. Their looped structure also provides transparency (“chain of thought”) that aids debugging and auditability, … |
| 23 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | There’s a clear evaluation rubric or checklist (e.g., correctness, completeness, tone). The cost of generating additional outputs is acceptable relative to the benefit of higher quality. The task is fuzzy or generative in nature, where a single attempt often underperforms a reranked or filtered approach. In the supply … |
| 24 | Koenigstein, AI Agents: The Definitive Guide (O'Reilly, 2025) | Halting test reads the last AI message to decide continue or end. Now you connect the pieces into a small state machine, as shown in Example 2-11. The edges encode the control flow that mirrors the ReAct diagram. The policy node runs first. If it emits an action, we route to the tools node and then back to policy. If … |
| 25 | Bruniaux, claude-code-ultimate-guide: dynamic-workflows.md (GitHub) | The pattern generalizes beyond code review: any situation where the first pass generates candidates (bugs, keywords, architectural risks, translation errors) benefits from a dedicated refutation pass before the results are acted on. Loop-until-dry Discovery continues until K consecutive rounds yield no new items. … |
| 26 | Koenigstein, AI Agents: The Definitive Guide (O'Reilly, 2025) | If the model chose an action a t ∈ A , execute the tool. Tool output is the observation that informs the next step. The stopping rule in Example 2-10 is simple. If the model asked for a tool, it must complete that effect before asking it again. If it didn’t, you’d assume it produced a final answer. This keeps the loop … |
| 27 | Koenigstein, AI Agents: The Definitive Guide (O'Reilly, 2025) | The first thing you need is a helper (Example 2-21) to create your supervisor. This function acts as a router (see “Mapping FSM/HSM to Agent Frameworks”) that decides which worker should take the next step, or whether the process should finish. Example 2-21. Helper function for supervisor class State(MessagesState): … |
| 28 | Koenigstein, AI Agents: The Definitive Guide (O'Reilly, 2025) | With tools bound, you can run a minimal stateless tool loop. The code in Example 1-4 executes any tool calls the model requests, feeds observations back, and forces a short wrap up to ensure the final answer is returned even if the last step ended on a tool observation. Example 1-4. Stateless single run with tool loop … |
| 29 | Koenigstein, AI Agents: The Definitive Guide (O'Reilly, 2025) | Local short term memory for this run only. This makes the workflow stateless across runs. A simple step bound protects against runaway loops: LLMs cycling with no termination. One model step. The assistant may choose to call tools. Read structured tool calls. Attach the observation with the matching tool_call_id so … |
| 30 | Koenigstein, AI Agents: The Definitive Guide (O'Reilly, 2025) | turn1_answer = run_with_tracing( app, {"messages": [HumanMessage(content="Get the current air temperature in New York City in Celsius.")]}, config={**cfg, "recursion_limit": 20}, title="TURN 1", ) print("\nTURN 1 (final assistant):\n", turn1_answer) This results in this model output: TURN 1 (final assistant): The … |
| 31 | Bruniaux, claude-code-ultimate-guide: dynamic-workflows.md (GitHub) | Schema validation and retry When agent() is called with opts.schema , the runtime validates the returned text as JSON against that schema. If validation fails, the runtime retries the agent call with an automatic correction prompt. This retry loop is invisible to the orchestrator: agent() only resolves when the output … |
| 32 | Bruniaux, claude-code-ultimate-guide: dynamic-workflows.md (GitHub) | Open-ended loops without a budget guard : A while(true) discovery loop that keeps spawning agents until it "finds no more items" will hit the 1000-agent cap and fail. Guard every loop: 5. Schema-structured outputs across phases Schemas are what turn a multi-phase pipeline from a chain of text-to-text transformations … |
| 33 | Osmani, Beyond Vibe Coding (O'Reilly, 2025) | Cursor also excels at understanding errors and logs. If you run your code and get a traceback or error message, you can paste it into the Cursor chat, and often the AI will analyze it and suggest a fix. This turns debugging into a cooperative experience: rather than you manually searching Google or Stack Overflow, … |
| 34 | Bhagwat & Gienow, Patterns for Building AI Agents (2026) | Related patterns Share Context Between Subagents, Feed Errors into Context, Avoid Context Failure Modes 32 SAM BHAGWAT & MICHELLE GIENOW G 9 FEED ERRORS INTO CONTEXT ood agents don’t just take a bag of tools and loop until they hit the goal. Instead, like smart humans, they examine and correct errors when something … |
| 35 | Bhagwat & Gienow, Patterns for Building AI Agents (2026) | Given the error message, the code, and (potentially) any other relevant context, the agent generates fixes to the code. It then applies them and executes the code again to ensure that the changes have resolved the issue. This pattern helps you build resilient agent systems where, instead of simply crashing, the agent … |
| 36 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | Even the best agents can misstep—skipping necessary tool calls, outputting invalid JSON, or running tools that error out—so you need reliable fallback and postprocessing mechanisms in place. After every model response, inspect whether it invoked the right tools, produced valid JSON, and succeeded without runtime … |
| 37 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | Retry intelligently, using structured logic such as exponential backoff for transient failures, or regenerate only the problematic portion instead of restarting the whole exchange. Fall back gracefully when retries fail. Options include switching to a backup model or service, asking the user for clarification, using … |
| 38 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | We then set up similar consumer loops to run for transportation and supplier specialists. To wait for a response: import time def wait_for_response(task_id, timeout=60): r = redis.Redis(host='localhost', port=6379) last_id = '0' start = time.time() while time.time() - start < timeout: msgs = … |
| 39 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | Temporal provides durable, stateful workflows with long-running tasks, retries, and failure recovery. It’s ideal for managing multiagent systems where each agent may perform asynchronous, multistep actions. Temporal workflows offer a clean abstraction for encapsulating business logic that spans multiple services or … |
| 40 | Osmani, Beyond Vibe Coding (O'Reilly, 2025) | Think about fallback strategies in case of failures. For example, if an AI-coded component calls an external API and that API is down or returns unexpected data, do we have a fallback (like using cached data or a default response)? Implementing such resilience patterns (circuit breakers, retries with backoff, etc.) … |
| 41 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | Furthermore, audit trails and logging mechanisms play an essential role in maintaining accountability and traceability. Every significant decision, input, output, and operational event should be logged securely. These logs must be immutable, encrypted, and regularly reviewed to identify suspicious activity or … |
| 42 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | Error handling and exception management are critical safeguards against internal failures. Agents must be equipped to detect and handle unexpected conditions, such as invalid inputs, API failures, or data inconsistencies, without cascading these errors downstream. Well-defined fallback strategies ensure that agents … |
| 43 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | Managing State and Persistence Communication alone is not enough—multiagent systems must also manage shared state, agent memory, and task metadata that often span multiple executions, workflows, or system restarts. This introduces significant complexity in terms of data durability, consistency, and access patterns, … |
| 44 | Bruniaux, claude-code-ultimate-guide: dynamic-workflows.md (GitHub) | Date.now() , Math.random() , and new Date() without arguments are blocked. Pass timestamps and seeds through args instead. require , fs , process , and any network call are unavailable in the orchestrator scope. All interaction with the environment happens inside agent() prompts, where the agent has full tool access. … |
| 45 | Bhagwat, Principles of Building AI Agents | S 14 SUSPEND AND RESUME ometimes workflows need to pause execution while waiting for a third-party (like a human-in-the-loop) to provide input. Because the third party can take arbitrarily long to respond, you don’t want to keep a running process. Instead, you want to persist the state of the workflow, and have some … |
| 46 | Bruniaux, claude-code-ultimate-guide: dynamic-workflows.md (GitHub) | Two hard limits protect against runaway scripts: Total agent() calls across a workflow: capped at 1000. Items per single parallel() or pipeline() call: capped at 4096. If your workflow design would exceed 1000 agents, the task needs decomposition into sub-workflows or a different approach. Resume and result caching … |
| 47 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | Graphs For support scenarios with multiple decision points, a graph topology models complex, nonhierarchical flows far more expressively than chains or trees. Unlike linear chains or strictly branching trees, graph structures let you define both conditional edges and consolidation edges, so that parallel paths can … |
| 48 | Bruniaux, claude-code-ultimate-guide: dynamic-workflows.md (GitHub) | Use a dynamic workflow when three or more of these conditions hold: the task has multiple stages that feed into each other, some stages can run in parallel, the job is long enough that resume-on-interruption matters, you need a reproducible orchestration path, or you need structured JSON schemas to pass data between … |
| 49 | Koenigstein, AI Agents: The Definitive Guide (O'Reilly, 2025) | The first step in turning an LLM into an agent is to make it stateful. Give your LLM a state that records where it’s in the workflow. Based on input and logic, it transitions to the next state, and each state has an associated function or behavior. In LangGraph, this can be any Python type, but is typically a … |
| 50 | Koenigstein, AI Agents: The Definitive Guide (O'Reilly, 2025) | Pause the graph before a critical step, such as an API call, to review and approve the action. If the action is rejected, you can prevent the graph from executing the step, and potentially take an alternative action. This pattern often involve routing the graph based on the human’s input. Review and edit Pause the … |
| 51 | Koenigstein, AI Agents: The Definitive Guide (O'Reilly, 2025) | Pause execution and wait for human decision. Present the proposed request for inspection. Enforce structured approval/revision schema. On approval, route to the call step. On revision, loop back to the gate with updated request. On resume you pass Command(resume={"action": "approve"}) to continue, or {"action": … |
| 52 | Bhagwat & Gienow, Patterns for Building AI Agents (2026) | Allowing agents to “fall back” to humans can be especially important in processes where an agent’s desired action depends on broader organizational context. Or when there are legal, regulatory, or ethical considerations in domains like healthcare and law. Solution: Agents and humans taking turns HITL is a design … |
| 53 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | While this single tool execution pattern is simple, it forms the foundation upon which more complex multistep planning and tool orchestration strategies are built in advanced agent systems. In the next section, we’ll look at how we can execute more tools without sacrificing latency. Parallel Tool Execution The first … |
| 54 | Bruniaux, claude-code-ultimate-guide: dynamic-workflows.md (GitHub) | parallel(thunks[]) parallel() takes an array of zero-argument functions (thunks), launches all of them concurrently, and returns when the slowest one finishes. Results come back in input order regardless of completion order. parallel() is a barrier primitive. Nothing after it runs until every agent in the array has … |
| 55 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | This final wiring adds consolidation edges so that, no matter which subpath was taken—whether the user needed an invoice lookup, a refund, login troubleshooting, or performance checks—their result feeds into the single summarize_response node. By connecting each of the handler nodes (handle_refund, handle_performance, … |
| 56 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | Finally, the graph assembles the system with conditional edges for routing, enabling adaptability as the supervisor dynamically selects based on query content. In execution, this enables efficient handling of diverse tasks without a single point of overload. While coordination adds some latency, the benefits in … |
| 57 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | Next, consider deterministic or semiautomated workflows. Here, the logic can be expressed as a finite set of steps or branches, and you know ahead of time where you might need human intervention or extra error handling. Suppose you ingest invoices from a small set of vendors and each invoice arrives in one of three … |
| 58 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | This workflow durably sequences the agents. Each activity (agent step) runs with retries, and Temporal persists progress—e.g., if transportation fails, it retries without rerunning inventory. For long-running processes, add signals for user input or pauses, similar to the full example’s confirmation handling. Apache … |
| 59 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | The rapid evolution of autonomous agents is primarily driven by breakthroughs in foundation models and reinforcement learning. While traditional use cases with foundation models have focused on generating human-readable outputs, the latest advances enable these models to generate structured function signatures and … |

---
