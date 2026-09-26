# FAQ: feedback-driven-stories

Notebook answers recorded verbatim with their citations. Distilled guidance lives
in the references; this file is the audit trail behind it.

---
## feedback-driven-stories-1: How is a feedback-driven story triaged, lightly validated and checked against the backlog?

- asked 2026-09-26 · notebook "The Product - Business Design" · conversation `e4ea3e14-5ee0-4717-8757-92f501d23cc8`
- Sources: Kelly, The Art of Agile Product Ownership (2019); Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014); Humble et al., Lean Enterprise; Maurya, Running Lean; Product School, The Product Book (2017); Cohn, User Stories Applied (2004); Patton, User Story Mapping; Olsen, The Lean Product Playbook; Evans, Domain-Driven Design (2003); Bland, Testing Business Ideas (2019); LeMay, Product Management in Practice (2022)

**Question**

> In a typical running IT delivery project, there is already a product vision, an epic and often a Fachkonzept (functional specification / business concept) or domain model. A new user story is then triggered by user feedback (support tickets, usability feedback, reviews) or by stakeholder feedback (sprint review, change request). Based on the sources: (1) How should such a feedback-driven story be triaged — how to decide whether the feedback belongs to an existing epic/story, is a bug, a change to an existing story, or a genuinely new story, and when to reject/park it? (2) How much lightweight validation is appropriate before writing the story (e.g. checking against the epic's goal and the Fachkonzept / business rules, clarifying with the stakeholder), versus full discovery? (3) When should the story be escalated to a deeper discovery/spike instead? (4) At the end of refinement, how should a new story be checked for consistency/plausibility against the other existing user stories in the backlog: duplicates or overlaps, contradicting acceptance criteria or business rules, dependencies, consistent terminology (ubiquitous language), impact on existing stories that must be adjusted, and traceability to the epic? Please give concrete steps, roles, artefacts and decision points, citing the sources.

**Answer** (verbatim, citation markers resolve in the table below)

In a running IT delivery project where a product vision, epics, and a *Fachkonzept* (domain model / business concept) are already established, incoming feedback must be processed efficiently without disrupting the existing backlog structure or introducing scope creep [1-3]. 

Below is the step-by-step process based on the source literature for triaging, validating, escalating, and cross-checking feedback-driven user stories.

---

##### 1. Triaging Feedback-Driven Stories

When user feedback (support tickets, usability observations, reviews) or stakeholder requests (sprint reviews, change requests) arrive, they enter an **Idea / Opportunity Pool** [4]. The Product Owner (PO) and Business Analyst (BA) triage incoming items using a structured decision taxonomy:

```
                                  INCOMING FEEDBACK / REQUEST
                                               │
                                               ▼
                              Is it a functional defect/bug?
                                ├── YES ──> [Bug Triage] (Quick fix vs. Major Story)
                                └── NO
                                       │
                                       ▼
                       Does it alter an in-progress Story/Epic?
                                ├── YES ──> [Update Acceptance Criteria / Refine Scope]
                                └── NO
                                       │
                                       ▼
                       Does it fit an existing Epic/Impact?
                                ├── YES ──> [Add Story under Existing Epic Branch]
                                └── NO
                                       │
                                       ▼
                       Does it provide clear User Value / Impact?
                                ├── YES ──> [New Epic / Opportunity Backlog]
                                └── NO ───> [Reject / Park / "Rotten Fruit"]
```

###### Decision Taxonomy & Rules
1. **Bug vs. Story**:
   * **Defect / Bug**: If the system behaves differently from the agreed acceptance criteria or domain rules, it is a bug [5]. Minor bugs are stapled together into a single story card for planning [6]. If a fix requires significant user workflow changes or new capabilities, it is elevated to a user story [6].
2. **Modification of an Existing Story**:
   * If the feedback refers to a feature currently in development or refinement, it is handled as a refinement tweak—updating or splitting acceptance criteria rather than creating a new ticket [7].
3. **Extension of an Existing Epic**:
   * If the feedback addresses an existing user activity or impact branch in the **User Story Map** or **Impact Map**, it is added as a new story under that specific epic [8, 9].
4. **Genuinely New Story / Epic**:
   * If the request introduces a new user role, new business impact, or new capability, it is placed in the **Opportunity Backlog** [4].
5. **Rejection or Parking ("Rotten Fruit" & "Fake Stories")**:
   * **Fake / Misleading Stories**: Reject requests framed as technical solutions without a user problem (e.g., "optimize database queries") [10, 11]. Reframe them around the underlying user behavior change or reject if they offer no value [11].
   * **Pet Features**: Reject requests with generic roles ("As a user...") that do not serve target personas [12].
   * **Expired Requests ("Rotten Fruit")**: Filter out feedback with expired time constraints ("best before date" passed) or unaligned stakeholder mandates [13, 14].

* **Roles Involved**: Product Owner (Triage Lead), Business Analyst, Customer Support / QA Representative.
* **Artifacts Produced**: Triaged Ticket (categorized as Bug, Story Tweak, New Story, or Rejected), Updated Opportunity Backlog [4, 5].
* **Decision Gate**: **Triage Gate** (*Categorize, Accept, Reframe, or Reject*) [1, 15].

---

##### 2. Lightweight Validation Before Story Writing

When a product vision, epics, and a *Fachkonzept* already exist, extensive discovery for every feedback item is wasteful [16]. Instead, perform **lightweight validation** in minutes or hours to establish context [2, 17].

###### Concrete Sub-Steps
1. **Goal & Impact Alignment Check**:
   * Verify that the feedback supports the parent Epic’s target outcome or KPI [8, 18].
2. **Domain Model & Business Rule Verification (*Fachkonzept*)**:
   * Cross-check the requested change against the **Bounded Context**, domain invariants, and **Ubiquitous Language** defined in the *Fachkonzept* [19, 20]. Ensure the request does not violate aggregate boundaries or core business policies [21, 22].
3. **Stakeholder / User Clarification**:
   * Reframe feature requests ("I need a custom Excel report") into user problem statements ("I need to spot data discrepancies faster") through a quick 5-minute clarification [11, 23].
4. **Scope Impact Analysis**:
   * Determine the delta: Describe how the system behavior currently works versus how it *should* work after this story [2, 24].

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        LIGHTWEIGHT VALIDATION CHECKLIST                                │
├────────────────────────────────────────────────────────────────────────────────────────┤
│  • Epic Alignment: Does it directly serve the parent Epic's target KPI?                │
│  • Domain Integrity: Does it respect Bounded Contexts & Ubiquitous Language?          │
│  • Problem Framing: Is it stated as a user outcome rather than a UI solution?          │
│  • Scope Delta: Is the change from current state to future state explicitly defined?   │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

* **Roles Involved**: Product Owner, Business Analyst, Domain Expert / Lead Architect [19, 25].
* **Artifacts Produced**: Reframed Problem Card, Scope Delta Note [23, 24].
* **Decision Gate**: **Problem Framing Pass** (*Proceed to Refinement vs. Escalate*) [26].

---

##### 3. Escalation to Deeper Discovery or Technical Spikes

Lightweight validation is insufficient when high uncertainty or architectural risk is present [27, 28]. The story must be escalated to a deeper discovery loop or a technical spike under the following conditions [29, 30]:

###### Escalation Triggers
1. **High Technical Uncertainty (Technical Spike)**:
   * *Trigger*: Unfamiliar external APIs, unknown performance limits, or unproven algorithms [30, 31].
   * *Action*: Extract an **Extreme Programming Spike**—a time-boxed research task (1 day to 2 weeks max) with explicit acceptance criteria to test feasibility [31-33].
2. **High Market / Behavioral Uncertainty (Discovery Experiment)**:
   * *Trigger*: Unclear whether users will actually adopt the proposed change or if the behavior change achieves the business outcome [18, 34].
   * *Action*: Run a rapid discovery experiment (e.g., paper/clickable prototype, landing page smoke test, or concierge workflow) before writing production code [27, 35].
3. **Architectural & Compliance Boundaries**:
   * *Trigger*: The story hits an architectural barrier (e.g., requiring load balancing, system rewrites, or breaching segregated compliance environments like PCI-DSS) [36, 37].

```
                                LIGHTWEIGHT VALIDATION
                                          │
                                          ▼
                      Is there high Technical or Market Uncertainty?
                                ├── YES ──> [ESCALATE]
                                │               ├── Technical Risk ──> Time-Boxed Spike (1-3 days)
                                │               └── Market Risk ────> Prototype / User Experiment
                                └── NO ───> Proceed to Three Amigos Refinement
```

* **Roles Involved**: Tech Lead / Software Engineer (for Spikes), UX Researcher / Designer (for Discovery Experiments), Product Owner [29, 32].
* **Artifacts Produced**: Time-boxed Spike Card (with explicit acceptance criteria and timebox), Spike Findings Report, Clickable Prototype [32, 33, 35].
* **Decision Gate**: **Feasibility & Fit Gate** (*Spike/Experiment Success*) [32].

---

##### 4. Backlog Consistency & Plausibility Check at End of Refinement

Before declaring a new story "Sprint-Ready" (Definition of Ready), it must be verified against the existing backlog to maintain model integrity and prevent fragmentation [38, 39].

###### Concrete Consistency Checks

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                   BACKLOG CONSISTENCY & PLAUSIBILITY CHECK (DoR)                       │
├────────────────────────────────────────────────────────────────────────────────────────┤
│  1. Duplicate & Overlap Check                                                          │
│     • Check against active backlog to prevent duplicate concepts or "splinters".        │
│                                                                                        │
│  2. Business Rule & Acceptance Criteria Reconciliation                                   │
│     • Ensure Given-When-Then scenarios do not contradict existing specifications.      │
│                                                                                        │
│  3. Ubiquitous Language Alignment                                                      │
│     • Verify entity names, user roles, and actions match the domain model glossary.     │
│                                                                                        │
│  4. Impact & Superseded Story Cleanup                                                  │
│     • Identify existing stories that are rendered obsolete or require scope adjustments.│
│                                                                                        │
│  5. Pre-RS Vertical Traceability                                                       │
│     • Ensure a unbroken link: Vision → Goal → Impact → Epic → Story → BDD Criteria.   │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

1. **Duplicate & Overlap Check**:
   * Scan active backlog items to prevent **concept duplication** or "splinters" where two stories implement the same concept under different names [40].
2. **Contradicting Acceptance Criteria & Business Rules**:
   * Compare new BDD scenarios (*Given-When-Then*) against existing specifications to catch contradicting business policies [38]. Note: After stories are delivered, acceptance criteria should be reorganized functionally into a **Living Documentation** structure rather than tracked by historical story tickets [41, 42].
3. **Ubiquitous Language Consistency**:
   * Ensure terms, entity names, and user roles match the project's **Ubiquitous Language** derived from the domain model (*Fachkonzept*) [19, 20, 43].
4. **Impact on Existing Stories & Cleanup**:
   * Identify existing backlog stories that must be modified, split, or discarded because the new story supersedes them [1, 26].
5. **Dependencies & Cross-Cutting Constraints**:
   * Verify that the story does not break global non-functional targets (security, performance, capacity) defined for the current milestone [16, 44].
6. **Pre-RS Vertical Traceability**:
   * Verify an explicit, unbroken chain linking the story upward: `Product Vision → Business Goal → Actor Impact → Epic → User Story → Acceptance Criteria` [8, 45].

* **Roles Involved**: The **Three Amigos** (Product Owner/BA, Developer/Architect, Tester/QA) during the Definition of Ready review [5, 7].
* **Artifacts Produced**: Definition of Ready (DoR) Certified User Story, Living Documentation Update, Updated Backlog Hierarchy [5, 42].
* **Decision Gate**: **Definition of Ready (DoR) Gate** (*Sprint Commitment*) [5].

---

💡 **Next Steps**: Would you like to draft a set of automated Reviewer Agent checks or configure a Definition of Ready (DoR) checklist for your delivery board?

**Citations**

| # | Source | Cited passage |
|---|---|---|
| 1 | Kelly, The Art of Agile Product Ownership (2019) | They need time to work the backlog, value stories, weed out expired or valueless stories, think about the product vision, talk to stakeholders and more senior people, and then ponder what happens next. Time to evaluate what has been delivered and see if it is delivering the expected value. Time to understand whether … |
| 2 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | If we are building a new product, it may be that most stories are about creating new features from scratch. But for established products undergoing steady evolution and maintenance, most stories are about making changes to existing features. Even if a story does add a whole new feature, there are inevitably changes to … |
| 3 | Humble et al., Lean Enterprise | As we execute the project, we discover new information—but since nobody wants their features cut, new information generally leads to more work, which is known as “scope creep.” Donald Reinertsen describes the vicious cycle of adding more scope as we run projects and discover more information as the “large batch death … |
| 4 | Maurya, Running Lean | Backlog All potential features start life in the Backlog bucket. They get in there in one of the following ways: Existing feature improvements (e.g., refined signup flow) Customer feature requests Your feature requests (e.g., the nice-to-haves you deferred earlier) Before going further, it is important to distinguish … |
| 5 | Product School, The Product Book (2017) | Grooming simply means you make sure the bugs and sugs are organized and have enough clarity to act on. For example, we’ve all seen—and maybe sent—poorly written software bugs that just say “it crashed.” That’s not helpful. In grooming, you’d do what you could to add steps to reproduce the crash and attach a crash log … |
| 6 | Cohn, User Stories Applied (2004) | its own story. If fixing a bug is likely to take as long as a typical story, that bug can be treated just like any other story. However, for bugs that the team expects to be able to fix quickly, you should combine the bugs into one or more stories. With cards you can easily do this by stapling the story cards together … |
| 7 | Kelly, The Art of Agile Product Ownership (2019) | Some of that conversation will occur during the refinement and planning meeting, or in a “3-Amigos” sessions. At any point during development, a Developer—or a Tester—may have reason to reopen the conversation and ask questions. It is impossible to know in advance every detail that will be involved even on simple … |
| 8 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | Because impact maps visually present the information held in the Connextra card format, scope creep is trivially easy to spot. User stories that shouldn’t be part of the current release cycle simply won’t fit visually into any branches of the impact map. Impact maps effectively visualise assumptions. When a … |
| 9 | Patton, User Story Mapping | After things settle into clusters, take a different color card or sticky and make a header for each cluster. On that card, write a better story name—one that distills why all these cards are similar. If you’ve written a distillation called “UI improvements,” that may be too vague. “Improve entering and editing … |
| 10 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | When the user need of a story is in the zone of control of the delivery group, the story is effectively a task without risk, which should raise alarm bells. There are three common scenarios: The story might be fake, micro-story or misleading. Fake stories are those about the needs of delivery team members. For … |
| 11 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | Misleading stories describe a solution and not the real user need. One case we came across recently was ‘As a back-office operator, in order to run reports faster, I want the customer reporting database queries to be optimised’. At first glance, this seemed like a nice user story – it even included a potentially … |
| 12 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | Using generic roles is often a get-out-of-jail-free card for people who want to push in pet features, or unjustified scope. For example, a team we recently worked with had a story ‘As a user I want to log in through social networks in order not to remember another username and password’. The story checklist originally … |
| 13 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | Instead of blindly accepting stories into the backlog and forgetting about them until a stakeholder screams, the team started to investigate timing constraints early on. When proposing a story, a stakeholder would have to specify the ‘best before’ date as well. This was effectively a signal that the work required by … |
| 14 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | A team we recently worked with was restructuring the sign-up process for their product, allowing users to log on through social media accounts. The stakeholders identified Twitter and Facebook users as important segments for this milestone, and agreed that everything else could be postponed. During a discussion about … |
| 15 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | Alternatively, a similar discussion might lead a team to understand that it’s not the end-user that wants to log in, but legal or compliance managers who want to protect a system against commercial or regulatory risk. Another possibility is that marketing managers want to force people to open accounts so they can … |
| 16 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | User stories generally bring small iterative enhancements, so they are not particularly well suited for addressing global cross-cutting concerns such as capacity, performance and security. Sure, we can write a user story about improving performance, but performance metrics are probably impacted implicitly by loads of … |
| 17 | Olsen, The Lean Product Playbook | Let’s say I estimate that task A will take me five minutes and task B will take me five months. Both tasks could have unknown unknowns. But the uncertainty is nonlinear with increasing scope, as the top curve of the cone of uncertainty suggests. The chances that the five-minute task will spiral out of control are … |
| 18 | Humble et al., Lean Enterprise | There are no “architectural epics” The people doing the work should have complete freedom to do whatever improvement work they like (including architectural changes, automation, and refactoring) to best achieve the target conditions. If we want to drive out particular goals which will require architectural work, such … |
| 19 | Evans, Domain-Driven Design (2003) | Committed to using this language in the context of implementation, the developers will point out imprecision or contradictions, engaging the domain experts in discovering workable alternatives. Of course, domain experts will speak outside the scope of the UBIQUITOUS LANGUAGE, to explain and give broader context. But … |
| 20 | Evans, Domain-Driven Design (2003) | Therefore: Identify each model in play on the project and define its BOUNDED CONTEXT. This includes the implicit models of non-object-oriented subsystems. Name each BOUNDED CONTEXT, and make the names part of the UBIQUITOUS LANGUAGE. Describe the points of contact between the models, outlining explicit translation for … |
| 21 | Evans, Domain-Driven Design (2003) | As written, it is unlikely that any business expert could read this code to verify the rule, even with the guidance of a developer. 1. It would be difficult for a technical, non-businessperson to connect the requirement text with the code. 2. If the rule were more complex, that much more would be at stake. We can … |
| 22 | Evans, Domain-Driven Design (2003) | It can be very helpful to have a technical framework that allows you to declare AGGREGATES and then automatically carries out the locking scheme and so forth. Without that assistance, the team must have the self-discipline to agree on the AGGREGATES and code consistently with them. Example Purchase Order Integrity … |
| 23 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | How to make it work The one thing you really have to do to make this work is to avoid feature requests. If you have only a short summary on a card, it must not be a solution without context. So, ‘How much potential cash is in blocked projects?’ is a valid summary, but a ‘Cash report’ isn’t. The potential cash question … |
| 24 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | In the trading volume example, applying these techniques might result in the story being amended as follows: ‘In order to notify traders they are nearing trading volume limits, the system will warn traders when the total volume reaches within 10% of the daily trading limit, whereas currently there is no warning … |
| 25 | Patton, User Story Mapping | Something had to be done to fix this, so we decided that rather than have one meeting with everybody to discuss everything, we would move to conversations with a tighter focus. Backlog grooming, for example, took place in week one of the iteration with a small group (project owner, project manager, business analyst, … |
| 26 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | Answering questions like these helps to determine whether the proposed solution is appropriate, inadequate or over the top. Describing the behaviour change sets the context which allows a delivery teams to propose better solutions. Describing expected changes allows teams to assess whether a story succeeds from a … |
| 27 | Bland, Testing Business Ideas (2019) | V Rules of thumb 1. Go cheap and fast early on in your journey. 2. Increase the strength of evidence with multiple experiments for the same hypothesis. 3. Always pick the experiment that produces the strongest evidence, given your constraints. 4. Reduce uncertainty as much as you can before you build anything. COST 98 … |
| 28 | Cohn, User Stories Applied (2004) | estimate the task. The solution in this case is to send one or more developers on what Extreme Programming calls a spike, which is a brief experiment to learn about an area of the application. During the spike the developers learn just enough that they can estimate the task. The spike itself is always given a defined … |
| 29 | LeMay, Product Management in Practice (2022) | Taking this approach, you might find yourself open to new ideas that you had not initially thought worthy of exploring. This constitutes yet another critical opportunity to involve your team not just in executing but also in learning, thinking, and experimenting. Unfortunately, these activities will often fall by the … |
| 30 | Cohn, User Stories Applied (2004) | investigative and one developing the new feature. For example, suppose the developers are given the story "A company can pay for a job posting with a credit card" but none of the developers has ever done credit card processing before. They may choose to split the stories like this: Investigate credit card processing … |
| 31 | Bland, Testing Business Ideas (2019) | E X T R E M E P R O G R A M M IN G S P IK E S IM U LA T IO N 308 Cost Cost is relatively cheap and much more inexpensive than building the entire solution — only to find out at the end if it is feasible. Setup Time Setup time for an Extreme Programming Spike is usually about one day. This is the time needed to … |
| 32 | Bland, Testing Business Ideas (2019) | Evidence Acceptance criteria The acceptance criteria defined for the spike was sufficiently met. Did the code perform the task and generate the output required? Recommendation The people working on the spike provide their recommendation on how steep of a learning curve it is to use the software and if it is fit for … |
| 33 | Bland, Testing Business Ideas (2019) | Requirements Acceptance Criteria Before performing a spike, clearly define the acceptance criteria and time box so that everyone is clear on the goal before getting started. These can turn into never-ending research projects if left unchecked. DETAILS 309 Partner & Supplier Interviews p. 114 Interview partners and … |
| 34 | Bland, Testing Business Ideas (2019) | Discovery Weak evidence is sufficient to discover if your general direction is right. You get first insights into your most important hypotheses. Validation Strong evidence is required to validate the direction you’ve taken. You aim to confirm the insights you’ve gotten for your most important hypotheses. Search & … |
| 35 | Bland, Testing Business Ideas (2019) | 4. Reduce uncertainty as much as you can before you build anything. 96 Validation Experiments Extr em e P ro gra m m in g S pik e p. 3 06 D · F · V Sim ple L andin g P age p. 2 60 D · F · V Clic kable P ro to ty pe p. 2 36 D · F · V Split T est p. 2 70 D · F · V Pop-U p S to re p. 3 00 D · F · V Lett er o f I nte nt … |
| 36 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | Differentiation is where an aspect of the product becomes a competitive advantage. Saturation is a point after which any improvements are an overkill, and make no real difference to users. Breakpoints are interesting because they do not depend on the actual solution, but on the market. They are determined by the … |
| 37 | Humble et al., Lean Enterprise | 8 http://bit.ly/1v732EU Furthermore, the CDE is built and operated by a cross-functional team that is solely responsible for the CDE. Again, this limits the scope of the PCI-DSS regulations to just this team. 2. Establish and limit the blast radius of frameworks and regulations. Always start by asking, “What’s the … |
| 38 | Evans, Domain-Driven Design (2003) | What did they do once they knew about the problem? They created separate Customer Charge and Supplier Charge classes and defined each according to the needs of the corresponding team. The immediate problem having been solved, they went back to doing things just as before. Oh well. Although we seldom think about it … |
| 39 | Evans, Domain-Driven Design (2003) | In a MODEL-DRIVEN DESIGN, the integration of concepts smooths the way for the integration of the implementation, while the integration of the implementation proves the validity and consistency of the model and exposes splinters. Therefore: Institute a process of merging all code and other implementation artifacts … |
| 40 | Evans, Domain-Driven Design (2003) | Recognizing Splinters Within a BOUNDED CONTEXT Many symptoms may indicate unrecognized model differences. Some of the most obvious are when coded interfaces don't match up. More subtly, unexpected behavior is a likely sign. The CONTINUOUS INTEGRATION process with automated tests can help catch these kinds of problems. … |
| 41 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | The reason why so many teams fall into this trap is that it isn’t immediately visible. Organising tests or specifications by stories makes perfect sense for work in progress, but not so much for documenting things done in the past. It takes a few months of work before this practice really starts to hurt. A story is a … |
| 42 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | Divide work in progress and work already done, and manage specifications, tests and design documents differently for those two groups. Throw user stories away after they are done, tear up the cards, close the tickets, delete the related wiki pages. This way you won’t fall into the trap of having to manage … |
| 43 | Evans, Domain-Driven Design (2003) | The domain experts can use the language of the model in writing use cases, and can work even more directly with the model by specifying acceptance tests. Objections are sometimes raised to the idea of using the language of the model to collect requirements. After all, shouldn't requirements be independent of the … |
| 44 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | The site runs cheaply, costing less than 50 GBP per month. We can baseline user activity to perform marketing tests in future releases (organisational goals). Key benefits Key decision-makers can probably participate in a separate discussion on global concerns once per milestone, even if they are too busy to attend … |
| 45 | Cohn, User Stories Applied (2004) | where we were doing subcontracted development to a much larger, ISO 9001-certified company, we were required to demonstrate traceability from requirements to tests. We achieved this in a very light manner: At the start of each iteration we produced a document that contained each story we planned to do in the … |

---
