# FAQ: definition-of-ready

Notebook answers recorded verbatim with their citations. Distilled guidance lives
in the references; this file is the audit trail behind it.

---
## definition-of-ready-1: What does a Definition of Ready check contain, and how are domain-model alignment and fake/orphan stories checked?

- asked 2026-09-26 · notebook "The Product - Business Design" · conversation `2abeae73-39c9-4aa8-b909-77662414ea84`
- Sources: Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014); Cohn, User Stories Applied (2004); Patton, User Story Mapping; Pohl & Rupp, Basiswissen Requirements Engineering (2015); Evans, Domain-Driven Design (2003); Humble et al., Lean Enterprise; Gothelf & Seiden, Lean UX; Kelly, The Art of Agile Product Ownership (2019); Bland, Testing Business Ideas (2019)

**Question**

> Context: a running IT delivery project with a Fachkonzept (business concept including a domain model / ubiquitous language). A refined user story with Given-When-Then acceptance criteria and a story point estimate now goes through a readiness phase: Definition of Ready check (business rule task) -> align terms with the domain model -> check for fake stories (a developer task in disguise) and orphan stories (no link to an epic or goal) -> gateway 'Definition of Ready met?' (criteria unclear -> back to refinement; technical risk -> spike, then back to refinement; no longer relevant -> discard; otherwise continue). Based on the sources: (a) Give a concrete Definition of Ready checklist the sources support, one pass/fail question per item. (b) How is a story aligned with the domain model and ubiquitous language — what exactly is checked and what counts as a deviation? (c) How do the sources define fake stories and orphan stories, and how are they detected? (d) Which pitfalls of a Definition of Ready do the sources warn about (e.g. becoming a stage gate)? (e) Which steps or checks do the sources describe for this phase that the process lacks? Please cite the sources.

**Answer** (verbatim, citation markers resolve in the table below)

Based on the provided sources, here is a detailed breakdown answering each part of your query regarding the readiness phase of a user story:

---

##### (a) Concrete Definition of Ready (DoR) Checklist

The sources (notably Bill Wake's **INVEST** criteria cited by Mike Cohn, Gojko Adzic, and Klaus Pohl/Chris Rupp) support a concrete Definition of Ready checklist where each item is evaluated using a clear pass/fail question [50, 303–306, 352]:

1. **Concrete Target Role (Specific Persona)**
   * **Pass/Fail Question:** *Does the story explicitly specify a concrete user segment or persona (e.g., "school teacher"), rather than a generic placeholder like "As a user" or a technical system component?* [1-3]
2. **End-to-End Value ("Earning" or "Learning")**
   * **Pass/Fail Question:** *Does the story deliver explicit business/user value or actionable insights to a stakeholder ("slicing the cake"), rather than being a technical task valued only by developers?* [4-9]
3. **Independence (Decoupled)**
   * **Pass/Fail Question:** *Can this story be prioritized, scheduled, and implemented independently without strict blocking dependencies on other uncompleted stories?* [8, 10]
4. **Negotiability (Invitation to Conversation)**
   * **Pass/Fail Question:** *Is the story written as a flexible placeholder for conversation that defers non-essential details, rather than an unchangeable specification?* [8, 11, 12]
5. **Estimatability & Feasibility**
   * **Pass/Fail Question:** *Do the developers understand the story and its constraints sufficiently to estimate the effort reliably within the current architecture?* [8, 13]
6. **Right-Sized / Small**
   * **Pass/Fail Question:** *Is the story small enough to be fully completed, tested, and potentially shippable within a single iteration/sprint?* [8, 11, 13, 14]
7. **Testable Acceptance Criteria**
   * **Pass/Fail Question:** *Are there explicit, objective acceptance criteria (e.g. Given-When-Then scenarios) that enable unambiguous pass/fail testing of the completed story?* [8, 11, 13, 15-17]
8. **Solution & UI Neutrality**
   * **Pass/Fail Question:** *Does the story state the underlying user need or goal without prematurely dictating screen layouts, database designs, or technical implementation choices?* [7, 18-20]

---

##### (b) Alignment with the Domain Model and Ubiquitous Language

In Domain-Driven Design (DDD) as defined by Eric Evans, aligning a story with the domain model and Ubiquitous Language involves specific checks and clear deviation criteria [17, 20–25, 204–213]:

* **What is Checked:**
  1. **Vocabulary & Terminology:** Verifying that class names, domain entities, attributes, and operations referenced in the story text and Given-When-Then criteria map 1:1 to terms in the Ubiquitous Language [21, 22].
  2. **Model Rules & Boundaries:** Checking that the behavior, actions, and business rules described in the story conform to the constraints, relationships, and Bounded Contexts established in the domain model [21, 23, 24].
  3. **Linguistic Unification:** Checking whether developers and domain experts are using the same shared concepts rather than translating between technical jargon and business slang [21, 205–207].

* **What Counts as a Deviation:**
  1. **Synonyms & Disconnected Jargon:** Using alternative terms for domain concepts (e.g., using "shipment" or "order table" instead of the model's explicit entity "Cargo") [25, 26].
  2. **Ambiguity & Contradiction:** Using terms that allow multiple interpretations or contradict explicit domain rules defined in the model [27, 28].
  3. **Uncaptured Domain Concepts:** When domain experts or developers introduce new business terms during story discussion that are nowhere in the current design. (Evans notes that a change in the Ubiquitous Language represents a change in the domain model, requiring the model and code to be refactored) [27, 29, 30].

---

##### (c) Definition and Detection of Fake Stories and Orphan Stories

Based on Gojko Adzic et al., fake stories and orphan stories are two major smells in agile backlog management [52, 61, 253, 255–257]:

###### 1. Fake Stories
* **Definition:** Stories that describe internal technical tasks, developer conveniences, or system maintenance as if they were user features (e.g., "As a QA, I want database restarts automated" or "All DB connections use a pool") [4, 6, 31].
* **How They Are Detected:**
  * **Zone of Control / Sphere of Influence Triage:** If the stated goal and benefit lie entirely within the delivery group's direct zone of control (e.g., query optimization, server cleanup), it is a technical task, not a user story [4, 18, 32].
  * **Role Inspection:** Spotted when the role uses a developer title ("As a QA", "As a developer"), a system component ("As an LDAP server"), or a generic placeholder ("As a user") [1, 2, 31].
  * **Acceptance Criteria Test:** Attempting to get business stakeholders to define acceptance criteria — if stakeholders cannot provide a meaningful business test or valuation, the story is fake [32, 33].

###### 2. Orphan Stories
* **Definition:** Stories that exist as isolated items in a flat backlog without a direct link to a higher-level epic, user activity, impact, or strategic business objective [56, 57, 255–257].
* **How They Are Detected:**
  * **Hierarchical Backlog / Impact Mapping Audit:** Mapping the backlog onto a 4-level hierarchy (Goal \\(\rightarrow\\) Actor \\(\rightarrow\\) Impact \\(\rightarrow\\) Deliverable) or User Story Map (Backbone Activity \\(\rightarrow\\) Steps \\(\rightarrow\\) Stories). Any story that cannot be visually attached to a parent impact or user activity is an orphan [34-38].
  * **Milestone & Persona Alignment Check:** Checking the story against the pre-selected target user segments/roles chosen for the current milestone. If the beneficiary falls outside the milestone's core scope, it is an orphan/unjustified story [39, 40].

---

##### (d) Pitfalls of a Definition of Ready

Sources such as Matt LeMay, Jeff Gothelf (Lean UX), Jez Humble (Lean Enterprise), and Allan Kelly explicitly warn against several dangers when applying a Definition of Ready [2, 77–80, 84, 85, 89]:

1. **Becoming a Stage Gate / Re-creating Waterfall ("Agile-fall"):**
   * Requiring 100% complete specifications, fixed designs, and approvals before development can start converts the DoR into a rigid stage gate (Big Design Up Front). This destroys cross-functional collaboration between design, business, and engineering [41-44].
2. **Analysis Paralysis & Zero-Value-Add Overhead:**
   * Spending excessive time grooming backlogs, writing voluminous documentation, and debating details far in advance creates waste and slows lead times [45-48].
3. **Creating Process Bottlenecks & Queues:**
   * Forcing stories to wait for formal sign-offs from busy stakeholders creates long queues, waiting times, and context switching [44, 46].
4. **Replacing Live Conversation with Paperwork:**
   * Treating a DoR checklist as a contract kills real-time communication. Written acceptance criteria are reminders for ongoing conversation (e.g., 3-Amigos sessions), not legal sign-off documents [12, 49-52].

---

##### (e) Missing Steps and Checks in the Described Process

Comparing your running process with the literature reveals five critical missing steps/checks [65, 67, 72–74, 76, 81, 112, 116, 273, 357]:

1. **Hypothesis & Measurable Outcome Definition ("Learning" vs. "Earning"):**
   * *Missing Check:* Explicitly checking whether the story is an "earning" story (delivering value) or a "learning" story (testing a business assumption) [5]. Each story should define a measurable success metric or target outcome, rather than evaluating features delivered as success [53-55].
2. **Time-Boxing and Goal Definition for Spikes:**
   * *Missing Check:* When technical risk triggers a spike, the process must enforce a strict **time box** and an **explicit learning goal** (the exact decision info needed) before sending it to refinement, preventing research spikes from becoming endless projects [5, 56-58].
3. **Routing Valid Technical Work to a Dedicated Capacity Budget:**
   * *Missing Check:* For legitimate technical work (e.g., server maintenance, refactoring) that fails the user-value test (fake story), the sources advise against discarding it completely. Instead, route it to a **dedicated time budget / slack** for auxiliary work rather than forcing it to compete with business stories [32, 33].
4. **Story Slicing & Thinning Check ("Slice the Cake"):**
   * *Missing Check:* Even if criteria are clear, a story might still be too large. The process lacks a check to slice compound stories vertically across all architectural layers ("slicing the cake") or thin the scope down to a minimal viable slice before committing to sprint planning [9, 59, 60].
5. **Collaborative "3-Amigos" Pre-Refinement Workshops:**
   * *Missing Check:* Conducting ad-hoc, short workshops (Product Owner, Developer, QA) a week or two ahead of development to co-create acceptance criteria and catch risks early, rather than treating readiness as an administrative checklist [11, 49, 51, 61].

---

💡 **Next Step / Suggestion:**
Would you like to build an interactive process flow diagram or a structured Markdown template for your team's refinement and 3-Amigos workshops incorporating these criteria?

**Citations**

| # | Source | Cited passage |
|---|---|---|
| 1 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | Watch out for generic roles One of the biggest advantages of user stories is getting delivery teams to think from the perspectives of users. Instead of purely focusing on how to build something, delivery teams consider how their products will be used. This is central to the user story technique – hence the name. Yet … |
| 2 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | When business stakeholders aren’t experienced with iterative delivery, plans based on user stories often turn into streams of consciousness. Anything goes, stories even get reverse-engineered from feature ideas. A common result is that stakeholders feel that they constantly get small improvements, but the delivery … |
| 3 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | Using generic roles is often a get-out-of-jail-free card for people who want to push in pet features, or unjustified scope. For example, a team we recently worked with had a story ‘As a user I want to log in through social networks in order not to remember another username and password’. The story checklist originally … |
| 4 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | When the user need of a story is in the zone of control of the delivery group, the story is effectively a task without risk, which should raise alarm bells. There are three common scenarios: The story might be fake, micro-story or misleading. Fake stories are those about the needs of delivery team members. For … |
| 5 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | A good way to deal with such situations is to explicitly split the research tasks into a separate story with a goal of its own. A helpful way of thinking about this is that a story should be either about learning or earning. Learning stories help stakeholders plan better. Earning stories help to deliver value to … |
| 6 | Cohn, User Stories Applied (2004) | users: Throughout the development process, the development team will produce documentation suitable for an ISO 9001 audit. The development team will produce the software in accordance with CMM Level 3. What you want to avoid are stories that are only valued by developers. For example, avoid stories like these: All … |
| 7 | Cohn, User Stories Applied (2004) | these stories are good ones but they should instead be written so that the benefits to the customers or the user are apparent. This will allow the customer to intelligently prioritize these stories into the development schedule. Better variations of these stories could be the following: Up to fifty users should be … |
| 8 | Cohn, User Stories Applied (2004) | Chapter 2. Writing Stories In this chapter we turn our attention to writing the stories. To create good stories we focus on six attributes. A good story is: Independent Negotiable Valuable to users or customers Estimatable Small Testable Bill Wake, author of Extreme Programming Explored and Refactoring Workbook, has … |
| 9 | Cohn, User Stories Applied (2004) | that the data is not saved. Not only is this not useful, it would actually waste users' time. The second story says that the data collected on the form will be written to the database. Without a story to present the form to users, the second story is not useful. A far better approach is to write the replacement … |
| 10 | Cohn, User Stories Applied (2004) | prioritization and planning problems. For example, suppose the customer has selected as high priority a story that is dependent on a story that is low priority. Dependencies between stories can also make estimation much harder than it needs to be. For example, suppose we are working on the BigMoneyJobs website and … |
| 11 | Patton, User Story Mapping | Let me say this again, because it’s an important point: Story conversations are about working together to arrive at a best solution to a problem we both understand. 3. Confirmation All this talking is cool, but we’ve eventually got to build some software—right? So, when we feel like we’re converging on a good … |
| 12 | Cohn, User Stories Applied (2004) | To the child, however, "make it warmer" meant "make it closer to the temperature I call warm." Words, especially when written, are a very thin medium through which to express requirements for something as complex as software. With their ability to be misinterpreted we need to replace written words with frequent … |
| 13 | Pohl & Rupp, Basiswissen Requirements Engineering (2015) | Prüfbar [ISO/IEC/IEEE 29148:2011]: Eine Anforderung muss so beschrieben sein, dass sie prüfbar ist. Das heißt, eine Funktionalität, die durch eine Anforderung gefordert wird, muss sich durch einen Test oder eine Messung nachweisen lassen. Realisierbar [ISO/IEC/IEEE 29148:2011]: Es muss möglich sein, jede Anforderung … |
| 14 | Cohn, User Stories Applied (2004) | And so on. Each of these closed stories is a part of the original story that was not closed. After completing one of these closed stories, a user is likely to feel a sense of accomplishment. The desire to write closed stories has to be tempered against competing needs. Remember that stories also need to be small … |
| 15 | Cohn, User Stories Applied (2004) | stapling them together with a cover card. < Day Day Up > < Day Day Up > Testable Stories must be written so as to be testable. Successfully passing its tests proves that a story has been successfully developed. If the story cannot be tested, how can the developers know when they have finished coding? Untestable … |
| 16 | Cohn, User Stories Applied (2004) | Acceptance tests document assumptions about the story a customer has that may not have been discussed with a developer. Acceptance tests provide basic criteria that can be used to determine if a story is fully implemented. Acceptance tests should be written by the customer rather than by a developer. Acceptance tests … |
| 17 | Pohl & Rupp, Basiswissen Requirements Engineering (2015) | Konsistenz: Sind alle definierten Anforderungen an das geplante System gemeinsam erfüllbar bzw. stehen die Anforderungen nicht miteinander in Widerspruch? Keine vorzeitigen Entwurfsentscheidungen: Wurden Entwurfsentscheidungen in den Anforderungen vorweggenommen, die nicht durch Randbedingungen induziert sind (z.B. … |
| 18 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | Misleading stories describe a solution and not the real user need. One case we came across recently was ‘As a back-office operator, in order to run reports faster, I want the customer reporting database queries to be optimised’. At first glance, this seemed like a nice user story – it even included a potentially … |
| 19 | Cohn, User Stories Applied (2004) | A Job Seeker can search job openings. A Recruiter can post job openings. A Recruiter can search resumes. In writing your stories, take advantage of the flexibility of stories to be useful at various levels. < Day Day Up > < Day Day Up > Keep the UI Out as Long as Possible One of the problems that has plagued every … |
| 20 | Cohn, User Stories Applied (2004) | complete, and stories shift away from being entirely new functionality to being modifications or extensions of existing functionality. For example, consider the story "A user can select dates from a date widget on the search screen." This story may represent three days of work regardless of whether it's done at the … |
| 21 | Evans, Domain-Driven Design (2003) | The vocabulary of that UBIQUITOUS LANGUAGE includes the names of classes and prominent operations. The LANGUAGE includes terms to discuss rules that have been made explicit in the model. It is supplemented with terms from high-level organizing principles imposed on the model (such as CONTEXT MAPS and large-scale … |
| 22 | Evans, Domain-Driven Design (2003) | Therefore: Use the model as the backbone of a language. Commit the team to exercising that language relentlessly in all communication within the team and in the code. Use the same language in diagrams, writing, and especially speech. Iron out difficulties by experimenting with alternative expressions, which reflect … |
| 23 | Evans, Domain-Driven Design (2003) | Therefore: Identify each model in play on the project and define its BOUNDED CONTEXT. This includes the implicit models of non-object-oriented subsystems. Name each BOUNDED CONTEXT, and make the names part of the UBIQUITOUS LANGUAGE. Describe the points of contact between the models, outlining explicit translation for … |
| 24 | Evans, Domain-Driven Design (2003) | Therefore: Explicitly define the context within which a model applies. Explicitly set boundaries in terms of team organization, usage within specific parts of the application, and physical manifestations such as code bases and database schemas. Keep the model strictly consistent within these bounds, but don't be … |
| 25 | Evans, Domain-Driven Design (2003) | Developer: Sorry to say, yes. I guess I'd better explain this notation a little more. They constantly corrected me, and as they did I started to learn. We ironed out collisions and ambiguities in their terminology and differences between their technical opinions, and they learned. They began to explain things more … |
| 26 | Evans, Domain-Driven Design (2003) | A project faces serious problems when its language is fractured. Domain experts use their jargon while technical team members have their own language tuned for discussing the domain in terms of design. The terminology of day-to-day discussions is disconnected from the terminology embedded in the code (ultimately the … |
| 27 | Evans, Domain-Driven Design (2003) | Recognize that a change in the UBIQUITOUS LANGUAGE is a change to the model. Domain experts should object to terms or structures that are awkward or inadequate to convey domain understanding; developers should watch for ambiguity or inconsistency that will trip up design. With a UBIQUITOUS LANGUAGE, the model is not … |
| 28 | Evans, Domain-Driven Design (2003) | What did they do once they knew about the problem? They created separate Customer Charge and Supplier Charge classes and defined each according to the needs of the corresponding team. The immediate problem having been solved, they went back to doing things just as before. Oh well. Although we seldom think about it … |
| 29 | Evans, Domain-Driven Design (2003) | But although the sequence seems circular, the knowledge crunching process that can produce a more useful kind of model depends on the team's commitment to model-based language. Persistent use of the UBIQUITOUS LANGUAGE will force the model's weaknesses into the open. The team will experiment and find alternatives to … |
| 30 | Evans, Domain-Driven Design (2003) | Listen to the language the domain experts use. Are there terms that succinctly state something complicated? Are they correcting your word choice (perhaps diplomatically)? Do the puzzled looks on their faces go away when you use a particular phrase? These are hints of a concept that might benefit the model. This is not … |
| 31 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | In iterative processes where teams commit at the start of an iteration to deliver stories, such vague stories can lead to nasty surprises towards the end. Some teams solve this by writing fake user stories, that mostly follow the pattern ‘As a developer, I want to understand how the new external API works’. They are … |
| 32 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | First, prioritisation of such tasks is pointless. Business stakeholders won’t be able to provide any sensible opinion on whether cleaning up a test server is more important than upgrading to the latest jQuery version. Writing such tasks as user stories makes them compete with externally valuable work, and they’ll … |
| 33 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | If the team has a separate, dedicated time budget for incidental work, it can build up slack to deal with unexpected interruptions so that both short-term and long-term planning actually become more accurate. The team also becomes more productive. Instead of wasting time on writing, estimating and managing fake … |
| 34 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | Key benefits The key advantage of this approach is reducing interruptions while avoiding political conflict. Saying ‘no’ might be politically inappropriate, but asking people to accept ‘not now’ is perfectly fine. Delivery team members will be able to focus on achieving big business impacts and not waste time on ideas … |
| 35 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | Use hierarchical backlogs One of the deepest pitfalls of fake iterative delivery is story card hell, nicely described by Jim Shore in 2005: Story card hell is when you have 300 story cards and you have to keep track of them all… When you have 300 cards, you lose the ability to understand what they mean. Unfortunately, … |
| 36 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | One way to implement this idea is to use a visual board with several horizontal swim lanes to represent different tiers. If you use a physical planning board, colour-coding different levels or using different card sizes are good ways to visualise this. Alternatively, you can represent the same information on a … |
| 37 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | Impact maps nicely organise the information held in the popular Connextra user story card format (‘As a … in order to… I want…’). Visually, the second level of an impact map corresponds to the persona or role of a user story. The third level corresponds to the value statement, especially when teams use the idea about … |
| 38 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | As the first step, identify the backbone of the story map – the horizontal axis. Break down activities into high-level steps. The steps should not imply a particular technology or a solution. For example, discovering an interesting book is a step in a purchasing activity that does not imply a solution. Getting book … |
| 39 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | A team we recently worked with was restructuring the sign-up process for their product, allowing users to log on through social media accounts. The stakeholders identified Twitter and Facebook users as important segments for this milestone, and agreed that everything else could be postponed. During a discussion about … |
| 40 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | Key benefits Selecting a limited number of target segments for each milestone prevents stakeholders from constantly inventing new user roles. This makes people think twice when writing stories to justify pet features, and results in better, more focused stories. Forcing people to seriously consider which user segment … |
| 41 | Humble et al., Lean Enterprise | In an enterprise context, planned work is usually prioritized through a centralized or departmental planning and budgeting process. Approved projects then go through the development process before going live or being released to manufacturing. Even in organizations which have adopted “agile” development methods, the … |
| 42 | Humble et al., Lean Enterprise | 2 http://homepages.cs.ncl.ac.uk/brian.randell/NATO Figure III-1, which we describe as “water-scrum-fall.”1 In cases where one or more of these phases are outsourced, we must also go through a procurement process before we can proceed to the design and development phases following approval. Because this process is so … |
| 43 | Gothelf & Seiden, Lean UX | Figure 8-1. Jeff’s “award” for inspiring undocumented creativity in engineers Even though most teams these days actively shun the concept of Big Design Up Front, we’ve seen a resurgence in this practice in supposedly Agile environ- ments. This new, sneaky version of BDUF is called Agile-fall. Agile-fall is the … |
| 44 | Gothelf & Seiden, Lean UX | The problem, of course, is that Agile-fall removes the collaboration between design and engineering that Lean UX requires to succeed. It ends up forcing teams to create big documentation to communicate design, followed by even lengthier negotiations between designers and developers. Sound familiar? It’s BDUF in a new … |
| 45 | Humble et al., Lean Enterprise | One of the most common challenges encountered in software development is the focus of teams, product managers, and organizations on managing cost rather than value. This typically manifests itself in undue effort spent on zero-value-add activities such as detailed upfront analysis, estimation, scope management, and … |
| 46 | Humble et al., Lean Enterprise | An even more tragic outcome of too many preventive controls is when teams just stop caring and assume an automaton mode of operation, abandoning all efforts to make things better. Preventive controls, when executed on the wrong level, often lead to unnecessarily high costs, forcing teams to: Wait for another team to … |
| 47 | Cohn, User Stories Applied (2004) | will be more aware of it for future iterations. Finally, if the project has a QA organization they can also help identify goldplating, especially if they were involved in the conversations between the programmer and the customer. < Day Day Up > < Day Day Up > Too Many Details Symptom: Too much time is being spent … |
| 48 | Cohn, User Stories Applied (2004) | that she wants. Also, it may be difficult to prioritize stories if they have not been written to express business value. For example, suppose the customer is presented with these stories: A user connects to the database via a connection pool. A user can view detailed error information in a log file. Stories like these … |
| 49 | Kelly, The Art of Agile Product Ownership (2019) | Some of that conversation will occur during the refinement and planning meeting, or in a “3-Amigos” sessions. At any point during development, a Developer—or a Tester—may have reason to reopen the conversation and ask questions. It is impossible to know in advance every detail that will be involved even on simple … |
| 50 | Patton, User Story Mapping | Requirements gathering with business stakeholders In-depth analysis of requirements and data Creating story narratives (one to five pages each) documenting requirements, solution design, and acceptance criteria Reading the narratives to the team using a projector and asking for any questions Unfortunately, the … |
| 51 | Patton, User Story Mapping | After an elaboration session, Sam, a subject matter expert standing in for the product owner, remarked, “If this is an Agile project, I don’t want to be involved!” This needed fixing! What Changed? Steve, the project manager, facilitated a team retrospective to focus on the problem. This retrospective resulted in a … |
| 52 | Cohn, User Stories Applied (2004) | meanings—go away if we shift the focus from writing requirements down to talking about them. Naturally, some of the problems of our language exist with verbal as well as with written communication; but when customers, developers and users talk there is the opportunity for a short feedback loop that leads to mutual … |
| 53 | Humble et al., Lean Enterprise | Our runway should be a list of hypotheses to test, not a list of requirements to build. When we reward our teams for their ability to deliver requirements, it’s easy to rapidly bloat our products with unnecessary features—leading to increased complexity, higher maintenance costs, and limited ability to change. … |
| 54 | Gothelf & Seiden, Lean UX | Using the Right Words Language, in this case, is important. Requirements present a seemingly immutable path forward. Assumptions explicitly admit that we might be wrong. We use our assumptions to create and test hypotheses. If you’re familiar with Test-Driven Development (TDD), hypotheses are very similar. They are, … |
| 55 | Humble et al., Lean Enterprise | As an approach to running agile software development at scale, this is different from most frameworks. There’s no program-level backlog; instead, teams create and manage their own backlogs and are responsible for collaborating to achieve business goals. These goals are defined in terms of target conditions at the … |
| 56 | Bland, Testing Business Ideas (2019) | Requirements Acceptance Criteria Before performing a spike, clearly define the acceptance criteria and time box so that everyone is clear on the goal before getting started. These can turn into never-ending research projects if left unchecked. DETAILS 309 Partner & Supplier Interviews p. 114 Interview partners and … |
| 57 | Cohn, User Stories Applied (2004) | investigative and one developing the new feature. For example, suppose the developers are given the story "A company can pay for a job posting with a credit card" but none of the developers has ever done credit card processing before. They may choose to split the stories like this: Investigate credit card processing … |
| 58 | Cohn, User Stories Applied (2004) | about how much can be accomplished in that iteration. The key benefit of breaking out a story that cannot be estimated is that it allows the customer to prioritize the research separately from the new functionality. If the customer has only the complex story to prioritize ("Add novel extensions to standard expectation … |
| 59 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | When stakeholders are aware of the plan upfront, such problems do not happen. For example, we’ve used this method with a large bank that had to solve a critical reporting problem, and the business stakeholders were amazed that the team could ship something in two days and get the regulators off their back, even though … |
| 60 | Patton, User Story Mapping | If you’re clever, and I know you are, your next conversations went deeper into what the software might look like, how it would behave, and how it might knit into your existing product and software architecture. You had these conversations with a close eye on the risky stuff. You sliced up the stories into the parts … |
| 61 | Patton, User Story Mapping | Here’s a simple recipe that should help you avoid the worst problems. Prepare Choose stories a cycle or two ahead. If you’re a product owner, meet routinely with your core product team to discuss the progress of the solutions under way. Choose the stories that you’d like to take on next to move those solutions closer … |

---
