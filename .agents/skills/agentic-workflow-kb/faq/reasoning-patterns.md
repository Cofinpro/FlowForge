# FAQ: reasoning-patterns

Notebook answers recorded verbatim with their citations. Distilled guidance lives
in the references; this file is the audit trail behind it.

---
## reasoning-patterns-1: Which reasoning patterns (CoT, ToT, ReAct, reflection) fit when?

- asked 2026-09-26 · notebook "Agentic Workflows" · conversation `c1e88934-00fd-46c9-ace2-bb239a5a55ba`
- Sources: Koenigstein, AI Agents: The Definitive Guide (O'Reilly, 2025); Osmani, Beyond Vibe Coding (O'Reilly, 2025); Bhagwat, Principles of Building AI Agents; Albada, Building Applications with AI Agents (O'Reilly, 2025); Bruniaux, claude-code-ultimate-guide: dynamic-workflows.md (GitHub); Grootendorst & Alammar, An Illustrated Guide to AI Agents (O'Reilly, 2025); VoltAgent awesome-claude-code-subagents, 09-meta-orchestration (GitHub)

**Question**

> Explain the reasoning and planning patterns for agents described in the sources: Chain of Thought, Tree of Thought, ReAct, reflection / self-critique, plan-and-execute, and memory-augmented reasoning. For each: how it works, when an agent should be instructed to use it, costs and failure modes, and how it shows up in an agent's instructions.

**Answer** (verbatim, citation markers resolve in the table below)

Agentic reasoning and planning patterns enable Large Language Models (LLMs) to transition from single-pass text generators into goal-oriented, dynamic decision-making systems [1, 2]. Below is a detailed breakdown of the six core patterns described in the sources.

---

##### 1. Chain of Thought (CoT)

* **How it works:**  
  Chain of Thought prompting forces the model to decompose a problem and write out intermediate logical steps before generating a final answer [3, 4]. Inspired by human step-by-step problem solving, CoT turns a single-pass token predictor into a transparent reasoning trace [3]. Newer variations, such as "chain of draft," streamline this process by forcing the model to focus only on essential reasoning steps without excessive fluff [5].

* **When an agent should be instructed to use it:**  
  Instruct agents to use CoT for complex math, logical deduction, decision-making scenarios, or detailed data analysis [3, 6, 7]. It is particularly effective for improving the reliability of smaller models on tasks that would otherwise require larger foundation models, keeping compute costs lower while maintaining auditability [3, 7].

* **Costs and failure modes:**  
  * **Costs:** Increases token consumption and response latency due to generating verbose intermediate text [7].  
  * **Failure modes:** Verbosity and redundancy [7]. If an early premise in the chain is flawed, the model suffers from **error propagation**—generating "coherent incorrectness" where subsequent steps logically follow a mistaken assumption [8, 9].

* **How it shows up in an agent's instructions:**  
  CoT is typically introduced through explicit step-by-step cues or structured system prompt guidelines [6, 10].  
  **Prompt Example [6, 10]:**
  > *"Let's think step-by-step [10]. Before providing the final recommendation, first describe the dataset features, highlight any underlying patterns or anomalies, evaluate pros and cons of each option, and explain your logical reasoning in sequential steps [6]."*

---

##### 2. Tree of Thought (ToT)

* **How it works:**  
  Tree of Thought extends linear CoT into a multi-path, branching search process [11, 12]. Instead of following a single line of reasoning, a generator LLM proposes multiple candidate options or "thoughts" [13, 14]. A secondary evaluator or reflector model then assesses and critiques those options, selecting or pruning branches before committing to the optimal execution path [11, 15].

* **When an agent should be instructed to use it:**  
  Use ToT for strategic, exploratory, or creative tasks where multiple viable paths exist and "first-answer bias" must be avoided [7, 11]—such as blog outline generation, architectural design, game-tree evaluation, or complex strategy planning [7, 11].

* **Costs and failure modes:**  
  * **Costs:** Higher compute and token costs from generating and evaluating multiple candidate branches, along with the engineering overhead of managing multi-agent orchestration (proposer, judge, executor) [7, 11].  
  * **Failure modes:** Combinatorial explosion of branches, getting stuck evaluating non-viable alternatives, or flawed pruning criteria from the evaluator model [11, 15].

* **How it shows up in an agent's instructions:**  
  ToT shows up across multiple node instructions in an orchestration pipeline [14, 15].  
  **Generator Prompt [14]:**
  > *"Generate exactly 3 distinct, creative approaches for [Topic]. For each option, provide: title, target audience, angle, a 5-bullet outline, and a concise rationale [14]."*  
  
  **Evaluator/Pruning Prompt [15]:**
  > *"Evaluate the 3 proposed options above against criteria of clarity, depth, and originality. Critique each option, prune weak paths, and output the single best option to pursue [15]."*

---

##### 3. ReAct (Reasoning and Acting)

* **How it works:**  
  ReAct combines **Reasoning** (language thoughts \\(L\\)) and **Action** (tool invocations \\(A\\)) in an iterative loop: **Thought \\(\rightarrow\\) Action \\(\rightarrow\\) Observation \\(\rightarrow\\) Thought** [12, 16, 17]. The agent generates a thought trace, invokes an external tool (e.g., search, database API, python interpreter), receives the tool's output observation, and folds that observation back into its context state (\\(c_{t+1} = (c_t, \hat{a}_t)\\)) to inform its next thought [16, 18, 19].

* **When an agent should be instructed to use it:**  
  Instruct agents to use ReAct when solving tasks that require real-world interaction, external data collection, or dynamic tool execution [7, 20, 21]—such as customer support automation, codebase investigations, multi-source data retrieval, or real-time troubleshooting [7, 22, 23].

* **Costs and failure modes:**  
  * **Costs:** High latency and compounding API token costs due to repeated LLM calls and accumulating message histories in state [23].  
  * **Failure modes:** Infinite loops if halting conditions fail [24], compounding errors along long tool chains [25], tool parameter misformation [26], and acting on incorrect assumptions from early tool observations [9].

* **How it shows up in an agent's instructions:**  
  ReAct instructions explicitly define the loop structure and bind specific tools to the LLM [22, 27, 28].  
  **System Prompt Example [22, 27]:**
  > *"Solve this problem iteratively with a Thought/Action/Observation loop [27]. You have access to tools: `[cancel_order, issue_refund]` [22].  
  > 1. **Thought:** Reason about what information is missing or what tool call is required [20, 22].  
  > 2. **Action:** Call the appropriate tool with precise JSON parameters [22].  
  > 3. **Observation:** Read the tool result, re-evaluate your state, and repeat until the goal is achieved [20, 22, 29]."*

---

##### 4. Reflection / Self-Critique (Reflexion)

* **How it works:**  
  Reflection adds a meta-reasoning and evaluation step to an agent's workflow [30, 31]. When an agent fails a task or produces a sub-optimal output, it generates a verbal critique analyzing its strategic errors [31, 32]. This critique is stored in a persistent memory buffer [31, 33]. On subsequent attempts or iterations, these stored reflections are injected directly into the prompt as a guide, enabling the model to act as its own coach without retraining weights [31, 33, 34].

* **When an agent should be instructed to use it:**  
  Use reflection in high-stakes workflows, automated code generation and debugging, or complex multi-step reasoning where early mistakes lead to cascading errors [33, 35]—such as financial transaction orchestration, medical diagnosis validation, or automated PR reviews [35, 36].

* **Costs and failure modes:**  
  * **Costs:** Added LLM calls for evaluation/critique, increasing token usage and latency [33, 35].  
  * **Failure modes:** Hallucinated or superficial self-critiques that fail to catch the root cause, falling into repetitive failure patterns despite reflection, or over-correcting valid choices.

* **How it shows up in an agent's instructions:**  
  Reflection appears either as an automated post-failure prompt or as an actor-critic node evaluation [37-40].  
  **Reflection Prompt Example [37, 38]:**
  > *"You were given a task and failed [37]. Do not summarize the environment; focus on the strategy and path you took [37]. Devise a concise, new plan of action that accounts for your mistake, referencing specific actions you should have taken [37]. Output your new plan after 'Plan:' [37, 38]."*

---

##### 5. Plan-and-Execute (Planner-Executor)

* **How it works:**  
  This pattern explicitly decouples task execution into separate phases [23, 36]:
  1. **Planner phase:** A high-level planning model analyzes the user request and generates an explicit, multi-step execution blueprint [23, 36].
  2. **Executor phase:** Specialized worker agents or tools execute each planned subtask individually (often in parallel where safe) [23, 36].
  3. **Review/Validation phase:** A final judge agent validates the execution against acceptance criteria [36, 41].

* **When an agent should be instructed to use it:**  
  Instruct agents to use Plan-and-Execute for long-horizon, multi-step software development, deep research reports, or complex business workflows where clear task decomposition, auditability, and parallel execution are necessary [23, 36, 42, 43].

* **Costs and failure modes:**  
  * **Costs:** Front-loaded token cost for initial plan creation; wasted execution compute if a plan is fundamentally flawed from the start [9, 44].  
  * **Failure modes:** Plan brittleness (inability to handle unexpected dynamic changes mid-execution) or "coherent incorrectness," where an initial misunderstanding in the planning phase causes every executor subagent to build on a flawed foundation [9].

* **How it shows up in an agent's instructions:**  
  System instructions are split by phase, enforcing structured schema handoffs between the planner and executors [36, 41, 45].  
  **Planner Instruction [41, 45]:**
  > *"Analyze the user issue and codebase context. Generate a structured JSON plan detailing file-level implementation steps, marking which steps can be run in parallel and which require sequential execution [41, 45]."*  
  
  **Executor Instruction [36, 41]:**
  > *"You are given step X of the plan: [Description]. Modify ONLY file Y. Do not touch any other files [36, 41]."*

---

##### 6. Memory-Augmented Reasoning

* **How it works:**  
  Memory-augmented reasoning pairs the LLM's short-term working memory (sliding chat history windows, scratchpads) with structured long-term memory systems (episodic history, semantic vector stores/RAG, procedural prompt rules, or structured memory banks like A-MEM) [46-50]. Advanced implementations (such as Agentic RAG or Search-o1) allow the model to dynamically trigger search tools *during* its reasoning traces, compressing retrieved facts directly into its thought chain [51-54].

* **When an agent should be instructed to use it:**  
  Use memory-augmented reasoning for long-running assistant interactions across multiple sessions, massive technical documentation or codebase analysis, personalized customer profiles, or knowledge-intensive deep research [51, 55-58].

* **Costs and failure modes:**  
  * **Costs:** Vector database infrastructure, embedding computation, and expanded prompt context costs [49, 59].  
  * **Failure modes:** **"Lost in the Middle" effect** (degradation in model accuracy when key retrieved facts reside in the middle of a large prompt context) [60], context rot/overflow [61], retrieving noisy or irrelevant text chunks that disrupt the reasoning flow [53], or stale/conflicting memory updates across sessions [62, 63].

* **How it shows up in an agent's instructions:**  
  Appears in system prompts as context configuration parameters, sliding window rules, or special search token delimiters [52, 64, 65].  
  **Configuration & Prompt Example [52, 64, 65]:**
  > *"Maintain `lastMessages: 6` for short-term chat history and run `semanticRecall topK: 3` across long-term memory [65].  
  > If external information is missing during your reasoning process, emit `<|begin_search_query|>` query `<|end_search_query|>` to retrieve grounded semantic context before continuing your thought trace [52]."*

---

Would you like me to create a structured comparison table or generate a tailored report summarizing how to implement these patterns in a specific framework like LangGraph or Claude Code? 🛠️

**Citations**

| # | Source | Cited passage |
|---|---|---|
| 1 | Koenigstein, AI Agents: The Definitive Guide (O'Reilly, 2025) | An LLM agent is a large language model embedded in a loop of reasoning, acting, and feedback, where it can call external tools and adapt its behavior based on results. Unlike a standalone LLM, which is limited to static text generation, an agent operates as a decision-making entity within a workflow. In this book, I … |
| 2 | Koenigstein, AI Agents: The Definitive Guide (O'Reilly, 2025) | Single-pass token generator Iterative reasoning–action–feedback system Confined to training data Can retrieve, verify, and update knowledge No memory, stateless Stateful with short- and long-term memory Linear prompt–response Iterative and adaptive workflow No tool use Tool-augmented (retrieval, code, APIs) Fixed … |
| 3 | Koenigstein, AI Agents: The Definitive Guide (O'Reilly, 2025) | Yet defining a role is only half the picture. To make agents more effective you might also need to shape how the agent thinks. This is where structured reasoning methods such as chain of thought, tree of thought and ReAct come into play. Letting Your AI Agents Think Out Loud Chain-of-thought prompting (CoT) 1 is … |
| 4 | Osmani, Beyond Vibe Coding (O'Reilly, 2025) | Cons: Few-shot prompting in particular makes the prompt longer (which uses up context window). For very large/complex examples, it might “eat” a lot of the model’s capacity. But usually a small example or two is fine. Tip: If you want the model to strictly adhere to a certain output structure, giving an example can … |
| 5 | Bhagwat, Principles of Building AI Agents | Reasoning models are getting a lot better and they’re doing it fast. Now, they’re able to break down complicated problems and actually “think” through them in steps, almost like a human would. What’s changed? New techniques like chain-of-thought prompting let these models show their work, step by step. Even better, … |
| 6 | Koenigstein, AI Agents: The Definitive Guide (O'Reilly, 2025) | Decision-making “List all available options. Consider pros and cons step by step. Choose the option that best fits the criteria and explain why.” To make this more explicit how you might want to implement this into your workflow, let’s look at an agent for data analysis. Since the core of a CoT agent is its ability to … |
| 7 | Koenigstein, AI Agents: The Definitive Guide (O'Reilly, 2025) | Chain of Thought (CoT) Step-by-step reasoning for math, planning, analysis Improves reliability and transparency; enables smaller models on harder tasks Slower, verbose outputs; sometimes redundant Tree of Thought (ToT) Exploratory tasks with multiple solution paths (creative writing, strategy search) Explores … |
| 8 | Osmani, Beyond Vibe Coding (O'Reilly, 2025) | Notice how the AI used the error message as a clue to focus on the loop bounds—a targeted prompt enabled the AI to engage in true problem solving, effectively simulating how a human debugger would think: “Where could undefined come from? Likely from the loop indexing.” This is a concrete demonstration of the benefit … |
| 9 | Osmani, Beyond Vibe Coding (O'Reilly, 2025) | Unlike interactive AI assistance where humans intervene at each step, autonomous agents make chains of decisions that can compound errors in unique ways. When an agent misinterprets the initial requirements, it doesn’t just generate one flawed function: it builds an entire implementation architecture on that … |
| 10 | Osmani, Beyond Vibe Coding (O'Reilly, 2025) | By mastering these techniques, you can handle an array of situations: instructing the AI in plain English, giving it examples, making it explain or structure its output, or setting it into different mindsets or roles. All of these help you guide the AI to produce exactly what you need. Prompting techniques are not … |
| 11 | Koenigstein, AI Agents: The Definitive Guide (O'Reilly, 2025) | Generating a Tree of Possibilities Now think of a scenario where you have a more complex task, but you don’t want to use a reasoning model or a full multi-agent architecture. Still, a more exploratory and strategic approach is needed. In such cases, you can use tree of thoughts prompting (ToT) 2. ToT expands CoT … |
| 12 | Koenigstein, AI Agents: The Definitive Guide (O'Reilly, 2025) | Figure 2-2. Control-flow diagram comparing CoT and ToT. Together, they show how structured reasoning can range from a linear chain of intermediate steps to a branching process of exploration and selection. Both highlight that when agents are guided to think in stages, whether as a single voice or as a coordinated … |
| 13 | Koenigstein, AI Agents: The Definitive Guide (O'Reilly, 2025) | ToT as an engineering shortcut A lightweight ToT setup where a smaller model proposes branches and a stronger model evaluates can sometimes replace the need for a full multi-agent architecture. This simplifies design and saves both money and time by avoiding repeated calls to large reasoning models when a smaller … |
| 14 | Koenigstein, AI Agents: The Definitive Guide (O'Reilly, 2025) | Example 2-3. Thought Generation def propose_options(state: BlogState) -> BlogState: """Generator (small): propose 3 creative approaches (ToT-style branching).""" proposer = gen_llm.with_structured_output(OptionsPayload) prompt = ( "Generate exactly 3 distinct approaches for a developer-focused blog on:\n" … |
| 15 | Koenigstein, AI Agents: The Definitive Guide (O'Reilly, 2025) | You can then introduce the agent to reflect and select (Example 2-4), which prunes the tree. Here, a more powerful LLM evaluates the three proposed options. The model can be instructed to critique each option based on criteria such as clarity and originality, and then select the best one. This step is crucial in ToT, … |
| 16 | Koenigstein, AI Agents: The Definitive Guide (O'Reilly, 2025) | Mathematically, you can think of this as mapping a context c t to an action a t within an action space A ^ = A ∪ L . Here A is the set of task-specific actions that impact the environment, while L is the set of language-based reasoning traces or thoughts. Each action step therefore produces not just a task action a t … |
| 17 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | ReAct Agents ReAct agents interleave Reasoning and Action in an iterative loop: the model generates a thought, selects and invokes a tool, observes the result, and repeats as needed. This pattern enables the agent to break complex tasks into manageable steps, updating its plan based on intermediate observations: … |
| 18 | Koenigstein, AI Agents: The Definitive Guide (O'Reilly, 2025) | Here, c t = ( o 1 , a 1 , ... , o t-1 , a t-1 , o t ) . In other words, the agent carries forward not only what it has done, but also why it chose that path. This recursive structure is what enables reflection: the agent’s future decisions are informed by both its history of actions and the reasoning it has … |
| 19 | Koenigstein, AI Agents: The Definitive Guide (O'Reilly, 2025) | Policy π ( c t ) → a ^ t is model.invoke on the current context. The reducer appends new messages, implementing c t+1 = ( c t , a ^ t ) . In Example 2-9 you translate intent into effect. Every requested tool call is executed deterministically, and its result is wrapped as a message. By pushing the observation into the … |
| 20 | Koenigstein, AI Agents: The Definitive Guide (O'Reilly, 2025) | The same applies to a single LLM agent. Given a task, the agent first reasons about what is missing or what step comes next, then takes actions by calling tools to retrieve data, run code, or check results. Like a developer’s feedback loop, the environment provides signals such as errors, gaps, or confirmations that … |
| 21 | Osmani, Beyond Vibe Coding (O'Reilly, 2025) | ReAct (Reason + Act) Prompting ReAct is a more advanced prompting technique that combines reasoning and acting. It gets the model not only to think, like CoT does, but also to take actions like making a calculation, calling an API, or using a tool. (See the ReAct Prompt Engineering Guide for more). In current … |
| 22 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | Our First Agent System Let’s start with the problem we’re solving. Every day, your customer-support team fields dozens or hundreds of emails asking to refund a broken mug, cancel an unshipped order, or change a delivery address. For each message, a human agent has to read free-form text, look up the order in your … |
| 23 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | ReAct agents excel in exploratory scenarios—dynamic data analysis, multisource aggregation, or troubleshooting—where the ability to adapt midstream outweighs the additional latency and computational overhead. Their looped structure also provides transparency (“chain of thought”) that aids debugging and auditability, … |
| 24 | Koenigstein, AI Agents: The Definitive Guide (O'Reilly, 2025) | If the model chose an action a t ∈ A , execute the tool. Tool output is the observation that informs the next step. The stopping rule in Example 2-10 is simple. If the model asked for a tool, it must complete that effect before asking it again. If it didn’t, you’d assume it produced a final answer. This keeps the loop … |
| 25 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | By switching to LCEL, you reduce boilerplate, gain advanced execution features, and keep your chains concise and maintainable. Figure 5-8 illustrates the general agentic chain pattern that underlies many LCEL workflows. Figure 5-8. Agentic chain execution pattern. The user prompt is passed to the model, which performs … |
| 26 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | Tool Refinement In modern agentic architectures, prompts alone rarely suffice. Agents increasingly rely on a suite of external tools—APIs, code functions, database queries, or custom skills—to retrieve information, perform transactions, or take concrete actions. Feedback pipelines frequently surface issues such as: … |
| 27 | Koenigstein, AI Agents: The Definitive Guide (O'Reilly, 2025) | 6 — If intermediate results are incomplete, repeat the loop until satisfied, then return final outputs While the table shows the difference step by step, Figure 2-1 illustrates the overall workflows side by side. The single-step agent follows a linear pipeline from prompt to result, whereas the multi-step agent embeds … |
| 28 | Koenigstein, AI Agents: The Definitive Guide (O'Reilly, 2025) | Example 2-6. Create ReAct state class AgentState(TypedDict): messages: Annotated[Sequence[BaseMessage], add_messages] The state of the agent. Context c t is the message stream. Now you give the model two powers in Example 2-7. It can produce language tokens that act as thoughts L , and it can request structured tool … |
| 29 | Koenigstein, AI Agents: The Definitive Guide (O'Reilly, 2025) | The process begins at __start__, this hands control to the agent, and then branches depending on the outcome: If the agent decides it has reached a conclusion, it produces an end signal and moves to __end__. If more reasoning or action is required, the agent issues a continue signal, possibly calling tools to gather … |
| 30 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | Example: SELF_ASK_WITH_SEARCH Ask: “Who lived longer, X or Y?” Self-ask: “What’s X’s lifespan?” → search tool Self-ask: “What’s Y’s lifespan?” → search tool Synthesize: “X lived 85 years, Y lived 90 years, so Y lived longer” This approach excels when external knowledge retrieval is needed, ensuring each fact is … |
| 31 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | Reflexion Reflexion equips an agent with a simple, language-based habit of self-critique: after each unsuccessful attempt, the agent writes a brief reflection on what went wrong and how to improve its next try. Over time, these reflections live in a “memory buffer” alongside the agent’s prior actions and observations. … |
| 32 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | Perform an action sequence. The agent interacts with the environment using its usual prompt-driven planning. Log the trial. Every step—actions taken, observations received, success or failure—is appended to a log in persistent storage (for example, a JSON file or database table). Generate a reflection. If the trial … |
| 33 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | Update memory. A helper function (update_memory) reads the trial logs, invokes the LLM on the reflection prompt, and then saves the new reflection back into the agent’s memory structure. Inject reflections on the next run. When the agent attempts the same (or a similar) task again, it prepends its most recent … |
| 34 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | The preceding example is built around a handful of core ideas woven together in under 20 lines of code. First, we isolate every call to the LLM behind a simple wrapper—call_model(state)—so that our graph nodes remain focused and reusable. Next, we craft one multiline “reflection prompt” that tells the model: “You … |
| 35 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | This pattern shines in high-stakes workflows where early errors can cascade into costly failures—such as financial transaction orchestration, medical diagnosis support, or critical incident response. By pairing each action with a reflection step, agents detect when tool outputs deviate from expectations and can replan … |
| 36 | Bruniaux, claude-code-ultimate-guide: dynamic-workflows.md (GitHub) | Plan–execute–review A three-phase structure where the first phase designs the approach (typically fast and cheap), the second phase implements per file or module (typically the expensive parallel phase), and the third phase verifies the result. Note the isolation: 'worktree' option in the execute phase. When multiple … |
| 37 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | Figure 7-2. Reflexion agent. Despite the significant improvement that Reflexion can add to agents, this approach can be implemented with just a few lines of code: from typing import Annotated, List, Dict from typing_extensions import TypedDict from langchain_openai import ChatOpenAI from langgraph.graph import … |
| 38 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | The prompt is built in three sections to turn the model into its own coach: first, a brief framing instruction tells the model “you failed your task—focus on strategic missteps rather than summarizing the environment and output your corrective plan after the word ‘Plan,’” which ensures a concise, parseable response. … |
| 39 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | Actor-Critic Approaches The actor-critic pattern in agentic systems is a lightweight form of evaluation-driven iteration. In this setup, the actor is responsible for generating candidate outputs—such as answers, plans, or actions—while the critic serves as a quality gate, accepting or rejecting outputs based on a … |
| 40 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | There’s a clear evaluation rubric or checklist (e.g., correctness, completeness, tone). The cost of generating additional outputs is acceptable relative to the benefit of higher quality. The task is fuzzy or generative in nature, where a single attempt often underperforms a reranked or filtered approach. In the supply … |
| 41 | Bruniaux, claude-code-ultimate-guide: dynamic-workflows.md (GitHub) | (no passage returned) |
| 42 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | Complex tasks break down into manageable subtasks. Debuggability Explicit plans reveal where and why errors occur. Cost efficiency Smaller models or fewer LLM calls handle execution, reserving large models for planning. Query-Decomposition Agents Query-decomposition agents tackle a complex question by iteratively … |
| 43 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | Deep Research Agents Deep research agents specialize in tackling open-ended, highly complex investigations that require extensive external knowledge gathering, hypothesis testing, and synthesis—think literature reviews, scientific discovery, or strategic market analysis. They combine multiple patterns: a … |
| 44 | Bruniaux, claude-code-ultimate-guide: dynamic-workflows.md (GitHub) | Practical cost model for a typical workflow: <cited_table> Rule of thumb from the Anthropic community: "If you can sketch a non-trivial flowchart with parallel branches, loops, and data handoffs between stages, dynamic workflows are likely appropriate." The flowchart test keeps you from reaching for workflows on tasks … |
| 45 | Bruniaux, claude-code-ultimate-guide: dynamic-workflows.md (GitHub) | Discovery → Understand → Plan A three-phase pipeline where each phase builds on the previous: |
| 46 | Koenigstein, AI Agents: The Definitive Guide (O'Reilly, 2025) | Figure 1-3. Baseline agent architecture: an LLM alone can only predict text, but with planning, memory, and tools it becomes a usable agentic system. Planning modules guide the agent’s reasoning, ranging from simple chain-of-thought 1 traces to more advanced approaches such as trees of thought 2 or self-critique. … |
| 47 | Grootendorst & Alammar, An Illustrated Guide to AI Agents (O'Reilly, 2025) | Throughout this chapter, we will explore many types of memory modules, ranging from short-term and long-term memory to external memory modules, through methods like (agentic) retrieval-augmented generation. Seen in Figure 4-3, it forms the foundation of the LLM. After all, how would an LLM be able to use tools or … |
| 48 | Grootendorst & Alammar, An Illustrated Guide to AI Agents (O'Reilly, 2025) | Working memory is a type of short-term memory that is typically defined as a system with limited capacity that temporarily holds information that we need for things like decision-making and reasoning. For LLMs, it is typically data that persists across LLM calls. More specifically, it is the chat history of the LLM … |
| 49 | Grootendorst & Alammar, An Illustrated Guide to AI Agents (O'Reilly, 2025) | Retrieval-Augmented Generation (RAG) Arguably, the most common method for giving your agent, or any LLM for that matter, long-term memory is Retrieval-Augmented Generation (RAG).4 RAG typically consists of two stages: ingestion and inference. In ingestion, your external data, typically unstructured text, is embedded … |
| 50 | Grootendorst & Alammar, An Illustrated Guide to AI Agents (O'Reilly, 2025) | A-MEM uses this idea of note-taking to agentic memory by creating these interconnected notes. In the context of agents, each note contains the following information and can be considered a piece of memory: The original interaction with the environment (i.e., one turn) The timestamp of the interaction LLM-generated … |
| 51 | Grootendorst & Alammar, An Illustrated Guide to AI Agents (O'Reilly, 2025) | In other words, instead of querying the vector database through a static step only once, by hooking it as a tool, the agent can dynamically decide how many times it needs to query the semantic memory until it has enough context to answer a given query. Note how we discussed LLMs in the context of RAG but agents in the … |
| 52 | Grootendorst & Alammar, An Illustrated Guide to AI Agents (O'Reilly, 2025) | We again see that these memory systems mirror aspects of human memory. Many insights from how we store and use knowledge often serve as inspiration for the design of agentic memory systems. Search-o1 A recent approach to agentic RAG is search-o1, a method that attempts to retrieve relevant context and put it … |
| 53 | Grootendorst & Alammar, An Illustrated Guide to AI Agents (O'Reilly, 2025) | By enabling RAG during reasoning, the model can iteratively refine its reasoning process until it is confident in the final result. This dynamic approach is different from regular agentic RAG because it can be done autonomously within a single call rather than iterating over calls. A downside to simply embedding … |
| 54 | Grootendorst & Alammar, An Illustrated Guide to AI Agents (O'Reilly, 2025) | With regular agentic RAG, information is just passed to the context without taking into account how the information needs to be processed. By enabling the same reasoning LLM to further process that information such that it fits within the reasoning traces, the flow of the traces can be kept intact. An overview of this … |
| 55 | Grootendorst & Alammar, An Illustrated Guide to AI Agents (O'Reilly, 2025) | Over the years, there has been significant attention to aspects of agents like tool usage, reasoning LLMs, and multi-agent collaboration. Each is quite important by itself, but don’t underestimate the importance of memory. Without memory, a personal assistant agent wouldn’t be able to remember past conversations. … |
| 56 | Grootendorst & Alammar, An Illustrated Guide to AI Agents (O'Reilly, 2025) | Long-Term Memory As the conversation history grows and the actions that an agent has taken, so does the need for long-term memory. Long-term memory typically involves maintaining one or more external databases that can be queried to extract additional information. This can contain information about previous traces or … |
| 57 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | Effective context retention requires agents to manage both short-term and long-term memory effectively. Short-term memory enables an agent to hold details within an ongoing session, such as remembering the specifics of a question or instructions given moments earlier. Long-term memory, on the other hand, enables … |
| 58 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | Semantic Experience Memory While incorporating an external knowledge base with a semantic store is an effective way to incorporate external knowledge into our agent, our agent will start every session from a blank slate, and the context of long-running or complex tasks will gradually drop out of the context window. … |
| 59 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | Figure 7-1. Fixed versus dynamic few-shot example selection. On the left, the model prompt uses a static set of few-shot examples embedded in the system prompt. On the right, dynamic few-shot selection retrieves the most relevant examples from a vector database at runtime, enabling more adaptive and contextually … |
| 60 | Grootendorst & Alammar, An Illustrated Guide to AI Agents (O'Reilly, 2025) | This tendency to focus on the beginning and end of prompts is similar to human behavior. The serial-position effect states that people generally recall the first (primacy effect) and last (recency effect) items in a series best, whereas the middle items are recalled worst. 19 It is interesting to see how much of LLMs’ … |
| 61 | VoltAgent awesome-claude-code-subagents, 09-meta-orchestration (GitHub) | Use when: Coordinating multiple agents, breaking down complex tasks, managing agent dependencies, synthesizing results, or designing agent workflows. context-manager - Context optimization expert Context specialist maximizing efficiency in AI conversations. Expert in context windows, information prioritization, and … |
| 62 | Grootendorst & Alammar, An Illustrated Guide to AI Agents (O'Reilly, 2025) | MemoryBank borrows from this theory and frequently updates the long-term memory of an LLM based on which pieces of knowledge are (not) accessed. Specifically, this means that when a memory item is retrieved and used during conversations, it will persist longer in the MemoryBank. However, if the memory item hasn’t been … |
| 63 | VoltAgent awesome-claude-code-subagents, 09-meta-orchestration (GitHub) | Use when: An agent keeps forgetting decisions between sessions, memory has grown noisy with duplicates and stale facts, corrections need to be recorded without losing history, or you are setting up a memory store and want save/recall discipline from day one. multi-agent-coordinator - Advanced multi-agent orchestration … |
| 64 | Grootendorst & Alammar, An Illustrated Guide to AI Agents (O'Reilly, 2025) | What is inside the context? We touched on it briefly before, but what exactly is inside the context? Let’s illustrate a full context with an example and make it as concrete as possible. Imagine you ask an agent to perform deep research on reasoning LLMs and provide you with an overview of common techniques that are … |
| 65 | Bhagwat, Principles of Building AI Agents | Roughly speaking, that’s what a good agent memory system looks like too. Let’s take a simple case, and say we have an array of messages, a user sends in a query, and we want to decide what to include. Here’s how we would do that in Mastra: The lastMessages setting maintains a sliding Principles of Building AI Agents … |

---
