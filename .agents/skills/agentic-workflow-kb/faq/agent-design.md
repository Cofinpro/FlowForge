# FAQ: agent-design

Notebook answers recorded verbatim with their citations. Distilled guidance lives
in the references; this file is the audit trail behind it.

---
## agent-design-1: How should a single agent or subagent be defined?

- asked 2026-09-26 · notebook "Agentic Workflows" · conversation `0b2de1d4-674d-43a4-9311-00014d0e1f0f`
- Sources: Bhagwat & Gienow, Patterns for Building AI Agents (2026); Bhagwat, Principles of Building AI Agents; Albada, Building Applications with AI Agents (O'Reilly, 2025); Grootendorst & Alammar, An Illustrated Guide to AI Agents (O'Reilly, 2025); Koenigstein, AI Agents: The Definitive Guide (O'Reilly, 2025); Osmani, Beyond Vibe Coding (O'Reilly, 2025); Skill authoring best practices - Claude Platform Docs; Bruniaux, claude-code-ultimate-guide: dynamic-workflows.md (GitHub); VoltAgent awesome-claude-code-subagents, 09-meta-orchestration (GitHub)

**Question**

> How should a single specialized agent or subagent be defined according to the sources? Cover: scope and single responsibility, structure of the system prompt (role, goals, instructions, constraints, output format), tool selection and least privilege, model choice per role, the description used for delegation/routing, report/output format back to an orchestrator, when to split work into several agents versus keeping one agent, and what the meta-orchestration subagents (e.g. workflow-orchestrator, task-distributor, context-manager, multi-agent-coordinator) show about good agent definitions. Include anti-patterns and a concrete checklist.

**Answer** (verbatim, citation markers resolve in the table below)

Defining a specialized agent or subagent requires treating the agent as a focused, role-based "AI employee" rather than an all-in-one monolith [1, 2]. Grounded in engineering patterns and multi-agent system design, the following sections detail how to scope, prompt, configure, and orchestrate specialized agents.

---

##### 1. Scope and Single Responsibility

Designing a subagent starts with the **Single Responsibility Principle** and domain specialization [3-5]:
* **Job Description Mapping:** Group capabilities around what could plausibly fit into a single human job description, a distinct business department, or a specific API integration [4, 6, 7].
* **High Cohesion & Focused Domain:** A specialized agent should have a singular, cohesive domain (e.g., inventory management, legal contract extraction, or code review) [4, 5, 8].
* **Avoiding the Monolithic "Michael Scott" Agent:** Combining disparate capabilities (such as sales research, customer support, and order processing) into one agent degrades performance, as tool selection errors multiply rapidly with tool count [1].

---

##### 2. System Prompt Structure

A well-structured system prompt sets clear boundaries and guides reasoning [2, 9, 10]. Effective prompts organize instructions into explicit blocks using XML tags or clear section headers [2, 9]:

1. **Role & Identity:** Define the persona and professional expertise (e.g., `You are an experienced Security Operations Center (SOC) analyst...`) [10-12].
2. **Primary Goal:** State the core objective of the agent explicitly [9, 13].
3. **Step-by-Step Methodology:** Outline the mandatory operational sequence (e.g., 1. Analyze input, 2. Invoke appropriate tool, 3. Validate results, 4. Format final response) [10, 14, 15].
4. **Operational & System Constraints:** Explicitly state environmental constraints, system limits, allowed vs. prohibited actions, and runtime boundaries (e.g., sandboxed environment rules or memory limits) [2, 9, 16].
5. **Output Format Specifications:** Specify the required return schema (e.g., JSON structure, Markdown headers, or specific XML tags) [9, 15, 17, 18].

---

##### 3. Tool Selection & Least Privilege

Tools empower agents to act, but unconstrained toolsets introduce security and operational risks [19, 20]:
* **Principle of Least Privilege:** Provide the agent with only the tools strictly required for its narrow scope [20, 21]. Avoid assigning broad administrative API keys or multi-purpose utility suites to a single subagent [21, 22].
* **Tool Set Size:** Keep the toolset small (typically under 10 tools per subagent) to maintain selection accuracy [1, 23-25].
* **Description Engineering:** Give every tool a clear name (e.g., `lookup_threat_intel`), a concise single-sentence summary, explicit parameter type constraints, and concrete input/output examples [24, 26].
* **Tool Invocation Configuration:** Use API configuration flags (`auto`, `required`/`any`, or `none`) to enforce whether tool calling is flexible or mandatory [27].
* **Input Sanitization & Schema Validation:** Validate tool parameters against Pydantic or JSON Schemas before execution to prevent malformed calls or injection attacks [20, 28].

---

##### 4. Model Choice per Role

Model selection should match task complexity, balancing reasoning depth, latency, and operational cost [29, 30]:
* **High-Tier Reasoning Models (e.g., GPT-5, GPT-4, Claude Opus/Sonnet):** Best suited for complex orchestration, multi-step planning, supervisor routing, and high-stakes analytical tasks [10, 11, 31, 32].
* **Lightweight/Fast Models (e.g., GPT-3.5-turbo, GPT-4o-mini, Claude Haiku):** Ideal for narrow execution steps, such as text summarization, data extraction, format translation, or creative option generation [33-36].
* **Dynamic Model Allocation:** Adjust model selection at runtime based on context, such as upgrading to premium models for high-priority enterprise requests while using lighter models for standard tasks [36-38].

---

##### 5. Description Used for Delegation and Routing

Supervisors and orchestrator agents rely on subagent descriptions to route user queries correctly [15, 39, 40]:
* **Third-Person Perspective:** Write delegation descriptions strictly in the third person detailing **what** the subagent does, **when** it should be invoked, and **what inputs** it expects [15, 41].
* **Clear Capability Boundaries:** Explicitly list covered topics and trigger keywords (e.g., `- inventory: Handles inventory levels, demand forecasting, stock replenishment, and warehouse optimization`) [15].
* **Routing Prompt Guidance:** Keep supervisor routing prompts concise, instructing the orchestrator to output strictly the target agent's identifier or structured routing decision [15, 39, 40].

---

##### 6. Report/Output Format Back to an Orchestrator

When a subagent completes its task, its output must be structured for seamless consumption by the orchestrator or downstream agents [42, 43]:
* **Schema-Validated JSON:** Enforce JSON Schema or Pydantic outputs so the orchestrator can reliably extract typed fields (e.g., `status`, `verdict`, `findings`, `confidence_score`) without fragile text parsing [43-46].
* **Structured Hand-Off Summaries:** Return a clear summary of actions taken, data retrieved, and key insights [15, 42, 47, 48].
* **Direct Answer First:** Structure response payloads to give a straightforward result first, followed by supporting reasoning, evidence, or generated file paths [48, 49].

---

##### 7. When to Split Work vs. Keeping One Agent

Determining whether to introduce subagents involves key architectural trade-offs:

| Decision Factor | Split into Multiple Subagents | Keep as a Single Agent |
| :--- | :--- | :--- |
| **Tool Capacity** | Tool count exceeds 10–16 tools, causing tool selection errors or semantic overlap [1, 10, 25, 50]. | Limited toolset (< 10 tools) with clear separation [25, 51]. |
| **Domain Boundaries** | Tasks span distinct departments, systems, or skill sets (e.g., inventory vs. transportation vs. compliance) [6, 8, 52]. | Single, well-defined, end-to-end task domain [51, 53]. |
| **Context Window** | Long-running workflows cause context overflow, noise, or "context rot" [54, 55]. | Workflow fits easily within working context memory [51, 56]. |
| **Security & Access** | Operations require distinct permissions, RBAC levels, or data access tiers [21, 22, 57, 58]. | Uniform security and access requirements across all steps [51, 53]. |
| **Task Dependencies** | Tasks can be performed asynchronously or in parallel across specialists [52, 59, 60]. | **Incompatible parallel tasks:** Parallel execution would yield conflicting, un-combinable outputs (e.g., game control logic vs. level path design requiring a single-threaded linear thread) [54, 61, 62]. |
| **Latency & Cost** | Willing to accept inter-agent communication overhead for higher accuracy and modularity [56, 63, 64]. | Low latency is paramount, and extra exchanges add unnecessary overhead [51, 53, 56, 65]. |

---

##### 8. Meta-Orchestration Subagents: Lessons for Good Design

Dedicated meta-orchestration subagents demonstrate that system management duties should be separated from domain execution [41, 66]:
* **`agent-organizer` & `multi-agent-coordinator`:** Show that task decomposition, subagent selection, and result synthesis are specialized reasoning tasks requiring dedicated subagents rather than being overloaded onto worker agents [41, 67].
* **`workflow-orchestrator` & `task-distributor`:** Highlight the importance of explicit workflow state management, load balancing, and priority scheduling across parallel pipelines [68, 69].
* **`context-manager` & `memory-curator`:** Demonstrate that context optimization, token-window pruning, and long-term memory discipline are distinct operational roles [70, 71].
* **`error-coordinator`:** Proves that failure recovery, fallback strategy execution, and error pattern tracking are best managed by a dedicated resilience specialist [72].

---

##### 9. Common Anti-Patterns

1. **The Monolithic "Michael Scott" Agent:** Overloading a single agent with dozens of tools and responsibilities, leading to high failure rates and tool selection confusion [1].
2. **Choice Overload:** Providing multiple overlapping tools without clear distinctions, causing the agent to select incorrect tools or hallucinate arguments [23-25].
3. **Fragile Uncoordinated Parallelism:** Running parallel subagents on dependent tasks without shared context, producing mutually incompatible outputs [54, 61, 73].
4. **Open-Ended Unbudgeted Loops:** Allowing agents to run reasoning-action loops without recursion limits, step bounds, or token budget checks [74, 75].
5. **Over-Privileged Tool Access:** Granting subagents broad API keys or administrative access beyond their strict task scope [20-22].
6. **Unvalidated Text-Dump Handoffs:** Passing unstructured free-form text between pipeline stages instead of schema-validated JSON outputs [43, 75].

---

##### 10. Concrete Subagent Review Checklist

Use this checklist when defining or reviewing a subagent:

###### Scope & Identity
- [ ] Subagent has a singular, well-defined responsibility matching a clear role or job title [3, 4, 6].
- [ ] Name and description are written in third-person and clearly state capability, inputs, and triggers [15, 41].

###### System Prompt
- [ ] System prompt includes explicit sections for Role, Goal, Step-by-Step Instructions, Constraints, and Output Format [2, 9-11].
- [ ] System and environmental limitations (e.g., allowed libraries, sandbox restrictions) are explicitly stated [2, 9, 16].

###### Tools & Security
- [ ] Subagent possesses fewer than 10 specialized tools [23-25].
- [ ] Tools adhere to the principle of least privilege [20-22].
- [ ] Tool descriptions include clear names, single-sentence summaries, parameter types, and example usage [24, 26].
- [ ] Tool inputs are validated using schemas/Pydantic prior to execution [20, 28].

###### Model & Execution
- [ ] Model tier matches task complexity (heavy reasoning model for planning/routing; lightweight model for routine drafting/extraction) [29, 31, 35, 36, 38].
- [ ] Execution loops include explicit step bounds, recursion limits, or token budget checks [74, 75].

###### Handoffs & Orchestration
- [ ] Output returned to orchestrator uses schema-validated JSON or structured templates [43-46].
- [ ] Handoff payload includes straightforward results first, followed by supporting reasoning and evidence [48, 49].

**Citations**

| # | Source | Cited passage |
|---|---|---|
| 1 | Bhagwat & Gienow, Patterns for Building AI Agents (2026) | Patterns for Building AI Agents 7 C 2 EVOLVE YOUR AGENT ARCHITECTURE omplex AI workflows benefit from the same "divide and conquer" principles that work well in traditional software engineering. Problem: Monolithic mega-agents As you add more tasks to your agent, over time you can end up with a mega-agent that … |
| 2 | Bhagwat, Principles of Building AI Agents | Example: a great prompt If you think your prompts are detailed, go through and read some production prompts. They tend to be very detailed. Here’s an example of (about one-third of ) a live production code-generation prompt (used in a tool called bolt.new.) 12 SAM BHAGWAT PART II BUILDING AN AGENT Y 4 AGENTS 101 ou … |
| 3 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | Single-agent setups work well in environments where the problem domain is well-defined, tasks are straightforward, and there is no significant need for scaling. This makes them a fit for customer service chatbots, general-purpose assistants, and code generation agents. We’ll discuss single-agent and multiagent … |
| 4 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | Specialization enables agents to be assigned roles that match their strengths, thereby maximizing the system’s collective capabilities. When each agent is tasked with activities that align with its specific functions, the system operates with greater precision and effectiveness. Specialized agents are more adept at … |
| 5 | Bhagwat & Gienow, Patterns for Building AI Agents (2026) | Solution: Group agent functionality together The best agent architectures are discovered by iterating:1 1. List the tasks you want your agent to perform. 2. Start with the one burning problem. 3. Build that agent really well. 4. Notice what users ask for next. 5. If it’s separate, build a new agent. 6. If your agent … |
| 6 | Bhagwat & Gienow, Patterns for Building AI Agents (2026) | It turns out that designing an agent architecture works the same way! We’ve done over 50 of these exercises, and they go roughly like this:2 Write down everything you want your agent to do: Comprehensiveness is important. Keep asking, “What are we missing?” Group similar capabilities together: Pulling from the same … |
| 7 | Bhagwat, Principles of Building AI Agents | Each of these agents has different memories, 90 SAM BHAGWAT different system prompts, and access to different tools. We often joke that designing a multi-agent system involves a lot of skills used in organizational design. You try to group related tasks into a job description where you could plausibly recruit someone. … |
| 8 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | Building on the single-agent supply chain example from the previous subsection, let’s evolve it into a multiagent system. Here, we decompose the 16 tools into three specialized agents: one for inventory and warehouse management, one for transportation and logistics, and one for supplier relations and compliance. A … |
| 9 | Grootendorst & Alammar, An Illustrated Guide to AI Agents (O'Reilly, 2025) | What is inside the context? We touched on it briefly before, but what exactly is inside the context? Let’s illustrate a full context with an example and make it as concrete as possible. Imagine you ask an agent to perform deep research on reasoning LLMs and provide you with an overview of common techniques that are … |
| 10 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | However, as the toolset expands—here, to 16—the agent’s system prompt must describe all possibilities, potentially leading to confusion or suboptimal choices. This is where the single-agent model’s limitations begin to show, paving the way for multiagent decomposition. Now, let’s complete the agent setup with the … |
| 11 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | To illustrate the concepts in this section, we’ll use a running example of a Security Operations Center (SOC) analyst agent built with LangGraph. This agent handles cybersecurity tasks like investigating threats, analyzing logs, and triaging incidents. Its core components include a system prompt guiding the agent’s … |
| 12 | Bhagwat, Principles of Building AI Agents | We actually built a prompt CMS into Mastra’s local development environment for this reason. Use the system prompt When accessing models via API, they usually have the ability to set a system prompt, eg, give the model characteristics that you want it to have. This will be in addition to the specific “user prompt” that … |
| 13 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | To assess planning quality, we begin with canonical workflows: common, well-understood user intents paired with known-good agent responses. For each scenario, we encode the starting environment, a conversation history, and the expected outcome in terms of tool usage and user communication. In the case of our customer … |
| 14 | Koenigstein, AI Agents: The Definitive Guide (O'Reilly, 2025) | Example 2-1. CoT prompt SYSTEM_INSTRUCTIONS = """You are a careful data analysis assistant. Think step by step and be explicit. Begin by describing the dataset. Next highlight patterns or trends. Conclude with a clear summary of insights. When you need to compute metrics or create a chart, call the python_repl tool … |
| 15 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | The supervisor node acts as a central coordinator, analyzing queries and routing to specialists—exemplifying streamlined decision making without full consensus overhead. Specialist nodes then process independently, invoking tools and responding. This structure mitigates conflicts through clear role boundaries and … |
| 16 | Osmani, Beyond Vibe Coding (O'Reilly, 2025) | Do you want just a single function? A full file or module? Tests included? For example, “Provide only the function implementation” and “Provide a complete runnable script” can yield different responses. Include requirements and constraints In the login example, we specified password length and attempt limit. Think of … |
| 17 | Grootendorst & Alammar, An Illustrated Guide to AI Agents (O'Reilly, 2025) | These schemas are often passed as a separate parameter when using external APIs. OpenAI, for instance, uses the tools parameter where you can send over the JSON schemas of your tools.5 That allows the LLM or even the Agent to treat it as special metadata and process it beforehand if necessary. In practice, however, … |
| 18 | Skill authoring best practices - Claude Platform Docs | Bad - Inconsistent: Mix "API endpoint", "URL", "API route", "path" Mix "field", "box", "element", "control" Mix "extract", "pull", "get", "retrieve" Consistency helps Claude parse and follow instructions. Common patterns  Template pattern  Provide templates for output format. Match the level of strictness to your … |
| 19 | Grootendorst & Alammar, An Illustrated Guide to AI Agents (O'Reilly, 2025) | A key trait that defines an agent is its ability to autonomously search for, select, and utilize tools, allowing it to interact with and influence its environment. With enough capabilities, agents can even create their own set of tools to use. The benefit of tools is not contained to interaction with the environment. … |
| 20 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | Beyond sanitization, logging every tool invocation to detect anomalous behavior and support forensic analysis is highly recommended. Coupled with real-time alerts for suspicious patterns—such as unusually large deletions or schema-altering commands—you can intervene quickly before small errors cascade into major … |
| 21 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | Safeguards Safeguards are preemptive controls and protective measures designed to minimize risks associated with agent autonomy, interactions, and decision-making processes. While agents offer remarkable flexibility and scalability, their ability to operate independently also makes them vulnerable to exploitation, … |
| 22 | Bhagwat & Gienow, Patterns for Building AI Agents (2026) | Related patterns Prevent the Lethal Trifecta, Granular Agent Access, Agent Guardrails Patterns for Building AI Agents 69 W 20 GRANULAR AGENT ACCESS CONTROL ith agents, you must manage your agent’s identity *and* the human identities your agent assumes to complete tasks. You must also plan for an infinitely diligent … |
| 23 | Grootendorst & Alammar, An Illustrated Guide to AI Agents (O'Reilly, 2025) | This allows your agent to have a better understanding of what the tool is capable of. Minimize the number of tools Although having many tools expands the capabilities of your agent, it will become much more difficult to select and use the appropriate tool. Minimize the scope of a tool Complex tools with many … |
| 24 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | Effective tool selection often comes down to how you describe each capability. Start by giving every tool a concise, descriptive name (e.g., calculate_sum instead of process_numbers) and follow it with a one-sentence summary that highlights its unique purpose (e.g., “Returns the sum of two numbers”). Include an … |
| 25 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | For most use cases, though, the key bottleneck arises when the number of tools and responsibilities increases. When an agent is expected to choose the correct tool from a set, performance degrades as the potential number of tools increases. Before jumping to multiagents, consider scaling within the single-agent … |
| 26 | Grootendorst & Alammar, An Illustrated Guide to AI Agents (O'Reilly, 2025) | At this point, the user can finally ask their question. Since they have access to the multiply function, let’s keep the query simple: “What is 5.1 times 7.3?”. To illustrate how this is going to be processed, we make use of the messages structure that we explored in the previous chapter. This is visualized in Figure … |
| 27 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | Tool Use Configuration Foundation model APIs from OpenAI, Anthropic, Gemini, and more let you explicitly control the model’s use of tools via a tool-choice parameter—shifting from flexible foundation model–driven invocation to deterministic behavior. In “auto” mode, the model decides whether to call tools based on … |
| 28 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | Even the best agents can misstep—skipping necessary tool calls, outputting invalid JSON, or running tools that error out—so you need reliable fallback and postprocessing mechanisms in place. After every model response, inspect whether it invoked the right tools, produced valid JSON, and succeeded without runtime … |
| 29 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | Figure 2-1. Core components of an agent system. Model Selection At the heart of every agent-based system lies the model that drives the agent’s decision-making, interaction, and learning capabilities. Selecting the right model is foundational: it determines how the agent interprets inputs, generates outputs, and … |
| 30 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | Performance: Speed/Accuracy Trade-Offs A key trade-off in agent design is balancing speed and accuracy. High performance often enables an agent to quickly process information, make decisions, and execute tasks, but this can come at the expense of precision. Conversely, focusing on accuracy can slow the agent down, … |
| 31 | Koenigstein, AI Agents: The Definitive Guide (O'Reilly, 2025) | Small creative generator LLM. Stronger judge/reflector LLM. Tool-using researcher. Small writer model. When you run the code, you’ll see different topics proposed, including reference links. To optimize the results further, you could implement a human-in-the-loop (“Designing Human-in-the-Loop Workflows”) interaction … |
| 32 | Bruniaux, claude-code-ultimate-guide: dynamic-workflows.md (GitHub) | The meta and the phase() calls form the "warp" (the fixed structural backbone of the run). The agent() , parallel() , and pipeline() calls are the "weft" that does the actual work woven through that backbone. agent(prompt, options?) agent() is the core building block. Every call creates a separate subagent with its … |
| 33 | Koenigstein, AI Agents: The Definitive Guide (O'Reilly, 2025) | Example 2-3. Thought Generation def propose_options(state: BlogState) -> BlogState: """Generator (small): propose 3 creative approaches (ToT-style branching).""" proposer = gen_llm.with_structured_output(OptionsPayload) prompt = ( "Generate exactly 3 distinct approaches for a developer-focused blog on:\n" … |
| 34 | Koenigstein, AI Agents: The Definitive Guide (O'Reilly, 2025) | Example 2-6. Create ReAct state class AgentState(TypedDict): messages: Annotated[Sequence[BaseMessage], add_messages] The state of the agent. Context c t is the message stream. Now you give the model two powers in Example 2-7. It can produce language tokens that act as thoughts L , and it can request structured tool … |
| 35 | Grootendorst & Alammar, An Illustrated Guide to AI Agents (O'Reilly, 2025) | To manage this complex network of contexts, smaller agents can be used to handle some of the context “burden”, as we illustrated in the deep research agent. By using a smaller agent with a smaller LLM for specific tasks, part of the context can be handled separately, leaving significant compute for the main agent … |
| 36 | Bhagwat, Principles of Building AI Agents | Example: Creating a Dynamic Agent Here’s an example of a dynamic support agent that adjusts its behavior based on the user’s subscription tier and language preferences: Principles of Building AI Agents 33 Agent middleware O 9 AGENT MIDDLEWARE nce we see that it’s useful to specify the system prompt, model, and tool … |
| 37 | Bhagwat & Gienow, Patterns for Building AI Agents (2026) | which tools it uses, how much memory it keeps, and which model it invokes — all based on runtime signals like user roles, preferences, or system state. (Some agent frameworks offer tools to help with this.) This reduces redundancy, increases customization potential, and allows cost/behavior trade-offs, but introduces … |
| 38 | Bhagwat & Gienow, Patterns for Building AI Agents (2026) | Free tier users get basic support with documentation links. Pro users receive detailed technical support. Enterprise users get priority support escalated to humans with custom solutions. The same agent can dynamically prioritize tool selection and scale model access: Free tier and pro users get semanticRecall topK = … |
| 39 | Koenigstein, AI Agents: The Definitive Guide (O'Reilly, 2025) | Define each worker with its tools and role. Use the helper to instantiate all workers without repeating boilerplate. To complete the supervisor architecture, we need to set up a supervisor that can coordinate across all four research agents. This ensures the workflow doesn’t stall and that each agent contributes at … |
| 40 | Bhagwat & Gienow, Patterns for Building AI Agents (2026) | 10 SAM BHAGWAT & MICHELLE GIENOW Iteration 5: So you add a content coordination step in front of the router agent. It extracts key messages/features from product briefs, then passes consistent talking points to the router, which passes them to specialist agents. Now you have sequential chaining: Coordinator → Router → … |
| 41 | VoltAgent awesome-claude-code-subagents, 09-meta-orchestration (GitHub) | Coordinate multiple agents for complex tasks Optimize context usage across conversations Distribute tasks efficiently among specialists Handle errors gracefully in multi-agent systems Synthesize knowledge from various sources Monitor performance of AI workflows Design complex workflows with multiple steps Scale AI … |
| 42 | Grootendorst & Alammar, An Illustrated Guide to AI Agents (O'Reilly, 2025) | The summarization agent only needs to summarize the papers, so no other context is needed other than those papers to generate the summaries (SUMMARIES). As such, the messages of the summary agent that is created by run_summarization_agent could look like this: # 5a. Run the summarization agent messages_summary_agent = … |
| 43 | Bruniaux, claude-code-ultimate-guide: dynamic-workflows.md (GitHub) | agent() returns plain text by default. When opts.schema is provided (a JSON Schema object), the runtime validates the response and retries automatically until the output matches the schema. This is the mechanism that makes structured multi-phase pipelines reliable: downstream stages can depend on field names without … |
| 44 | Grootendorst & Alammar, An Illustrated Guide to AI Agents (O'Reilly, 2025) | With specification-based instruction, instructions are provided on the formatting of tasks in JSON. It is a description of what we expect the output should be rather than an example. A part of the full prompt is provided below that demonstrates this specification-based instruction: """ #1 Task Planning Stage The AI … |
| 45 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | To illustrate how MAS operationalizes these ideas, consider a generic Python implementation inspired by the open source ADAS. This framework uses a foundation model (e.g., GPT-5) as the meta-agent to generate and refine agent code. Key components include a foundation model agent base for prompting, a search loop for … |
| 46 | Bruniaux, claude-code-ultimate-guide: dynamic-workflows.md (GitHub) | Schema validation and retry When agent() is called with opts.schema , the runtime validates the returned text as JSON against that schema. If validation fails, the runtime retries the agent call with an automatic correction prompt. This retry loop is invisible to the orchestrator: agent() only resolves when the output … |
| 47 | Koenigstein, AI Agents: The Definitive Guide (O'Reilly, 2025) | user_request = { "messages": [ { "role": "user", "content": ( """Find the current Swiss fintech licensing options for small startups. Gather authoritative sources and produce a short summary with three bullet points and references.""" ), } ] } for chunk in swarm.stream(user_request): print(chunk) print() Defines a … |
| 48 | Grootendorst & Alammar, An Illustrated Guide to AI Agents (O'Reilly, 2025) | Task Execution Next, each selected model is executed with their relevant arguments. Models are run in parallel if possible. For example, if prompted to generate summaries of different PDFs, separate models can run in parallel to execute this task. This resource dependency is carefully tracked to decide which models … |
| 49 | Grootendorst & Alammar, An Illustrated Guide to AI Agents (O'Reilly, 2025) | You must first answer the user’s request in a straightforward manner. Then describe the task process and show your analysis and model inference results to the user in the first person. If inference results contain a file path, must tell the user the complete file path. If there is nothing in the results, please tell … |
| 50 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | To illustrate, consider a single-agent system for supply chain logistics management. This agent handles a broad set of tools for inventory, shipping, and supplier tasks in one unified prompt and graph. While effective for basic queries, performance can degrade with too many tools, as the agent must select from a large … |
| 51 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | How Many Agents Do I Need? Begin with a simple approach, and only add complexity as needed to improve performance. The appropriate number and organization of agents will vary enormously based on the difficulty of the tasks, the number of tools, and the complexity of the environment. Single-Agent Scenarios We’ll begin … |
| 52 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | Multiagent Scenarios In multiagent systems, multiple agents collaborate to achieve shared goals, an approach that is especially advantageous when tasks are complex and require varied toolsets, parallel processing, or adaptability to dynamic environments. A key benefit of multiagent systems is specialization: each … |
| 53 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | Single-Agent Architectures A single-agent architecture is among the simplest and most straightforward designs, where a single agent is responsible for managing and executing all tasks within a system. This agent interacts directly with its environment and independently handles decision making, planning, and execution … |
| 54 | Bhagwat & Gienow, Patterns for Building AI Agents (2026) | Your challenge as a builder of agents: Doing context engineering well is highly nontrivial. A 5 PARALLELIZE CAREFULLY gents have to be reliable while running for long periods of time and maintaining coherent conversations. If you don’t contain the potential for compounding errors, things fall apart quickly. Problem: … |
| 55 | Bhagwat & Gienow, Patterns for Building AI Agents (2026) | 28 SAM BHAGWAT & MICHELLE GIENOW A 8 COMPRESS CONTEXT s an agent proceeds through a task, in an ideal world its action would be informed by the context of all previous steps. In reality, this is not always possible: The context from previous outputs and tool calls may exceed context window limits. Problem: Context … |
| 56 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | Easier implementation and management Lower resource requirements Less computational overhead Latency Quicker response for users Single-agent systems offer a strong starting point for building agentic applications. Their simplicity, lower cost, and reduced latency make them well suited for many practical … |
| 57 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | Agent Scope and Organizational Roles Not all agents are created equal—or rather, not all are created to serve the same entity. As organizations scale their use of agentic systems, they naturally adopt agents that operate at different levels of abstraction and authority. Understanding and intentionally designing around … |
| 58 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | Enterprise systems, analytics High or restricted Company-wide analytics agent, AI help desk Each scope comes with different requirements for autonomy, oversight, data access, and trust calibration. For example, a personal agent can take small risks with limited scope, while an organizational agent must operate with … |
| 59 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | Each agent in a multiagent system can be designed to specialize in specific tasks or areas. For example, one agent may focus on data collection while another processes the data, and a third agent manages user interactions. This division of labor enables the system to handle complex tasks more efficiently than a single … |
| 60 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | While this single tool execution pattern is simple, it forms the foundation upon which more complex multistep planning and tool orchestration strategies are built in advanced agent systems. In the next section, we’ll look at how we can execute more tools without sacrificing latency. Parallel Tool Execution The first … |
| 61 | Bhagwat & Gienow, Patterns for Building AI Agents (2026) | Frequently, though, realworld tasks have nuance where Subagent 1 and Subagent 2, unaware of each others’ work, create responses that are in conflict — forcing the final agent to combine two incompatible, intermediate products. Solution: Use a single-threaded linear agent With incompatible parallelized tasks, simply … |
| 62 | Bhagwat & Gienow, Patterns for Building AI Agents (2026) | Now the final agent must somehow combine a runner fleeing lethal enemies with a path system that requires stopping and thinking! Important: Notice that different teams have different opinions on this point! For coding agents, Devin (Cognition) avoids parallelizing tasks. But Claude Code relies on parallelized tasks … |
| 63 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | While not always the case, multiagent systems often encounter reduced efficiency due to higher token consumption when completing tasks. Because agents must frequently communicate, share context, and coordinate actions, they consume more processing power and resources compared with single-agent systems. This increased … |
| 64 | Albada, Building Applications with AI Agents (O'Reilly, 2025) | Adaptability is another core advantage, as multiagent systems can respond dynamically to changing conditions. By coordinating their actions, agents can reallocate roles and responsibilities as needed, adapting to new information or environmental changes in real time. This adaptability enables the system to remain … |
| 65 | Bruniaux, claude-code-ultimate-guide: dynamic-workflows.md (GitHub) | Simple refactors and bug fixes. Renaming a variable across 20 files, fixing a typo in a config, adding a missing import: these are single-agent tasks even if they touch multiple files. The orchestration overhead adds seconds and noise to the logs. Reusable procedures where Claude picks the steps. If you want Claude to … |
| 66 | VoltAgent awesome-claude-code-subagents, 09-meta-orchestration (GitHub) | Outline Meta & Orchestration Subagents Meta & Orchestration subagents are your conductors and coordinators, managing complex multi-agent workflows and optimizing AI system performance. These specialists excel at the meta-level - orchestrating other agents, managing context, distributing tasks, and ensuring smooth … |
| 67 | VoltAgent awesome-claude-code-subagents, 09-meta-orchestration (GitHub) | Use when: An agent keeps forgetting decisions between sessions, memory has grown noisy with duplicates and stale facts, corrections need to be recorded without losing history, or you are setting up a memory store and want save/recall discipline from day one. multi-agent-coordinator - Advanced multi-agent orchestration … |
| 68 | VoltAgent awesome-claude-code-subagents, 09-meta-orchestration (GitHub) | task-distributor - Task allocation specialist Task distribution expert optimizing work allocation across agents. Masters load balancing, capability matching, and priority scheduling. Ensures efficient use of all available agents. Use when: Distributing tasks among agents, implementing load balancing, optimizing task … |
| 69 | VoltAgent awesome-claude-code-subagents, 09-meta-orchestration (GitHub) | Use when: Managing tasks and projects with AI agents, automating workflows across teams, orchestrating multi-agent collaboration, or integrating AI-powered project management into Claude Code via MCP. Website: taskade.com workflow-orchestrator - Complex workflow automation Workflow specialist designing and executing … |
| 70 | VoltAgent awesome-claude-code-subagents, 09-meta-orchestration (GitHub) | Use when: Coordinating multiple agents, breaking down complex tasks, managing agent dependencies, synthesizing results, or designing agent workflows. context-manager - Context optimization expert Context specialist maximizing efficiency in AI conversations. Expert in context windows, information prioritization, and … |
| 71 | VoltAgent awesome-claude-code-subagents, 09-meta-orchestration (GitHub) | Use when: Combining multiple perspectives, resolving conflicting information, generating comprehensive reports, building knowledge bases, or synthesizing research. memory-curator - Long-term memory discipline across sessions Memory discipline specialist for agents that work across many sessions. Decides what is worth … |
| 72 | VoltAgent awesome-claude-code-subagents, 09-meta-orchestration (GitHub) | error-coordinator - Error handling and recovery specialist Error handling expert ensuring graceful failure recovery. Masters error patterns, fallback strategies, and system resilience. Keeps multi-agent systems running smoothly despite failures. Use when: Implementing error handling, designing recovery strategies, … |
| 73 | Bhagwat & Gienow, Patterns for Building AI Agents (2026) | rather than working in isolation with limited information. Problem: Agent miscommunication When your agent is delegating tasks to subagents — like when a human manager splits up a task and assigns parts to different people — they can create mutually incompatible outputs. Solution: Parallelize carefully Instead of just … |
| 74 | Koenigstein, AI Agents: The Definitive Guide (O'Reilly, 2025) | Local short term memory for this run only. This makes the workflow stateless across runs. A simple step bound protects against runaway loops: LLMs cycling with no termination. One model step. The assistant may choose to call tools. Read structured tool calls. Attach the observation with the matching tool_call_id so … |
| 75 | Bruniaux, claude-code-ultimate-guide: dynamic-workflows.md (GitHub) | Open-ended loops without a budget guard : A while(true) discovery loop that keeps spawning agents until it "finds no more items" will hit the 1000-agent cap and fail. Guard every loop: 5. Schema-structured outputs across phases Schemas are what turn a multi-phase pipeline from a chain of text-to-text transformations … |

---
