# FAQ: store-phase-4-refinement

Notebook answers recorded verbatim with their citations. Distilled guidance lives
in the references; this file is the audit trail behind it.

---
## store-phase-4-refinement-1: D2a: How does the PO explain value and business rules (the 'what') in a Three Amigos session?

- asked 2026-10-04 · notebook "The Product - Business Design" · conversation `4d028c51-a649-4a20-b475-985f8d5ff20d`
- Sources: Kelly, The Art of Agile Product Ownership (2019); Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014); Patton, User Story Mapping; Cohn, User Stories Applied (2004); Kalbach, Mapping Experiences (2020); Bland, Testing Business Ideas (2019)
- Note: Inline result re-entered by the extraction agent; cited passages shortened to their leading sentences, answer text unchanged.

**Question**

> In a Three Amigos refinement of a user story, how does the Product Owner / business analyst explain the value and the business rules of the story (the 'what') to developers and testers? Describe, as the sources document it, the step-by-step approach, what inputs are brought along, what the output is (e.g. clarified rules, scope, open questions), and which mistakes or pitfalls the sources name for this step.

**Answer** (verbatim, citation markers resolve in the table below)

In agile product development, a **Three Amigos** session (also referred to as "The Power of Three") is a focused, collaborative refinement workshop held immediately before a user story enters development [1-3]. It brings together three core perspectives: **Business/Analysis** (Product Owner or Business Analyst), **Development** (the programmers building the feature), and **Quality Assurance** (the testers) [1, 2, 4]. 

The primary objective is to transform a high-level intent into a shared understanding, establishing explicit business rules and clear acceptance criteria [1, 2, 5-7].

---

##### 1. How the Product Owner / BA Explains Value and Business Rules (The 'What')

* **Framing Value via Observable Behavior Change**: Rather than presenting pre-designed technical solutions, the PO/BA articulates the story’s purpose through the *Role* ("As a...") and *Benefit* ("In order to...") clauses [8]. Value is explained in terms of an observable change in user or business behavior (e.g., "In order to monitor inventory 50% faster") rather than generic business jargon [9-12].
* **Separating 'What' from 'How'**: The PO/BA defines the business outcome, constraints, and target users, deliberately leaving the solution design open so developers can propose implementation options [8, 11].
* **Explaining Rules Through Concrete Examples**: Rather than stating abstract rules, the PO/BA uses real-world scenarios and specific sample data to demonstrate how the system should behave under normal and exceptional conditions [7, 13].
* **Exploring Business Rules ("Playing What-About")**: The PO/BA guides the conversation through underlying business logic, complex data validations, edge cases, and backend integration requirements by walking through "what-about" scenarios [14].

---

##### 2. Step-by-Step Approach to the Session

1. **Introduction & Initial Scenarios**: The PO/BA presents the user story card and introduces a few initial scenarios illustrating how they imagine the feature working [1, 7].
2. **Developer Probing & Solution Options**: The developer evaluates the story against the existing system architecture, database models, and infrastructure, probing for functional gaps or inconsistencies [7]. To ensure optimal design, developers propose multiple implementation options (ideally at least three) to satisfy the business need [11, 12].
3. **Tester Probing & Edge-Case Identification**: The tester applies testing heuristics to uncover missing scenarios, boundary conditions, and unconsidered risks (e.g., handling expired credit cards, missing fields, or extreme values) [7, 15].
4. **Collaborative Slicing & Thinning**: If the discussion reveals that the story is too large, complex, or risky for a single iteration, the group collaboratively splits or "thins" the story (e.g., slicing by outputs or using temporary hard-coded reference data) [13, 16-18].
5. **Confirmation & Time-Boxed Closure**: The session continues until all participants are confident that all major risks are addressed, business rules are unambiguous, and clear test cases are established [6, 7, 19].

---

##### 3. Inputs Brought Along to the Session

* **Story Card / Placeholder**: A short summary card capturing the user role and business benefit ("As a... In order to...") [1, 8, 20].
* **Initial Scenarios & Example Data**: Sample inputs, questions, or preliminary business scenarios prepared by the PO/BA [7, 21].
* **Visual Artifacts**: Low-fidelity prototypes, story maps, wireframes, or user journey sketches when visual context is needed [4, 5, 22, 23].
* **Technical & System Context**: Architectural constraints, API limits, and existing data structure knowledge brought by developers [7].
* **Testing Heuristics**: Quality heuristics and test ideas brought by the tester [7].

---

##### 4. Outputs Produced by the Session

* **Clarified Business Rules & Scope**: Clear boundaries defining what functionality is included and what is explicitly out of scope [7, 14, 19].
* **Agreed Acceptance Criteria / Test Cases**: Explicit, testable criteria (often documented as test notes on the back of a story card, flipchart, or digital board) that define "Done" [1, 7, 15, 21, 24, 25].
* **Right-Sized / Split User Stories**: Smaller, well-defined user stories ready to be scheduled into an iteration [13, 17, 19, 26].
* **Open Questions & Parking Lot**: A recorded list of unresolved domain questions or external dependencies that require further investigation before or during development [19, 21, 27].
* **Shared Understanding**: A unified mental model shared across business, development, and testing roles [5, 7, 28, 29].

---

##### 5. Common Mistakes and Pitfalls Documented in the Sources

* **Unilateral Solution Design by Business Stakeholders**: Expecting business users or the PO to fully define the technical scope/solution ("client-vendor anti-pattern"). This places software design responsibility on non-technical stakeholders, leading to suboptimal architecture, technical debt, and delivery team disengagement [30, 31].
* **Delegating to Non-Implementers**: Involving whoever happens to be free rather than the specific developers and testers who will deliver the story. This breaks knowledge transfer and forces the team to repeat discussions during sprint planning or execution [32].
* **Monologues and Heavy Documentation**: Reading multi-page narrative requirements documents to a passive audience instead of holding a collaborative, lightweight conversation [13, 31].
* **Failing to Escalate Architectural Decisions**: Attempting to resolve major architectural or feature-wide impacts within the small 3-Amigos group instead of pausing to involve the entire engineering team [33].
* **Endless Debates Without Time-Boxing**: Spending excessive time on complex edge cases without time-boxing the discussion, splitting the story, or deferring unresolved questions to a parking lot [19, 27].
* **Abstract Discussions Without Examples**: Discussing business rules at a high level without using specific data examples, which masks misunderstandings until coding begins [7, 13].
* **Over-Specifying Too Early**: Treating story cards as binding contractual specifications rather than placeholders for ongoing conversation, or locking in UI details prematurely [1, 20, 34, 35].

---

🎯 Would you like to create a study guide, flashcard deck, or tailored report on user story refinement and agile requirements practices based on your sources?

**Citations**

| # | Source | Cited passage |
|---|---|---|
| 1 | Kelly, The Art of Agile Product Ownership (2019) | As I never tire of repeating: a story is a placeholder for a conversation. No matter how imperfect a story is, when it comes to be developed, a conversation needs to be had. Some teams formalize this as a “3-Amigos” meeting—alternatively this is sometimes called a “Power of Three.” 3-Amigos occurs immediately before a … |
| 2 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | A common mistake in this situation is to delegate the task of analysing a story to just one person. Instead, create small conversations that involve at least one person representing each of the development, testing and analysis roles. A common name for such conversations, which Gojko used also in Specification by … |
| 3 | Patton, User Story Mapping | The Three Amigos ¡Three Amigos! is the name of a mediocre 1986 western comedy starring Steve Martin, Chevy Chase, and Martin Short. There’s a more tactical triad of collaborators that’s valuable during story workshops. You might recall that story workshops is the term I give to that last best conversation where we … |
| 4 | Patton, User Story Mapping | And, of course, we’ll need someone who understands what we’re building, who it’s for, and why we’re building it, so we’ll need a member of that core product discovery team. That person is the second amigo. So often the person involved in this conversation is a user experience designer or business analyst who’s worked … |
| 5 | Patton, User Story Mapping | Story workshops are small, productive conversations where the right people work together to tell the stories one last time, and in the process make all the tough decisions about exactly what they’ll choose to build. You’ll need a small group that includes a developer, a tester, and people who understand users and how … |
| 6 | Patton, User Story Mapping | Story Workshop Recipe Use a story workshop to refine understanding and define specifically what the development team will build. The workshop is a product conversation—supported by lots of pictures and data—that helps the team make decisions and arrive at confirmation: the acceptance criteria for what we’ll choose to … |
| 7 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | The typical way to run a three-amigo meeting is to start with the analyst or business representative introducing a story and presenting a few initial scenarios of how they would see a story working. Then the developer considers the story in the context of the existing infrastructure and probes for potential functional … |
| 8 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | The product owner or XP customer should be responsible for deciding what the team will work on. But deciding isn’t the same as defining, and this is where things go wrong! Getting business stakeholders to design solutions wasn’t the original intention of user stories. Get business stakeholders (sponsors, XP customer, … |
| 9 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | Describe a behaviour change Bill Wake’s INVEST set of user story characteristics has two conflicting forces. Independent and valuable are often difficult to reconcile with small. The value of software is a vague and esoteric concept in the domain of business users, but task size is under the control of a delivery … |
| 10 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | Robert Brinkerhoff argues that valuable initiatives produce an observable change in someone’s way of working. This principle is a great way to start a conversation on the value of a story. It’s not enough to describe just someone’s behaviour, but we should aim to describe a change in that behaviour instead. This trick … |
| 11 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | The major benefit of this approach is that it forces both sides to have a conversation in order to decide on the actual solution. Because business stakeholders are constrained in specifying only the role and the business benefit of a user story, they typically think much harder about the impacts they want to cause … |
| 12 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | Agree at the start that features are not allowed in the ‘In order to…’ part. The ‘In order to…’ part shouldn’t say anything about what the software or the product does, only what the users will be able to do differently. Try to propose at least three options for how the software might provide the value business users … |
| 13 | Patton, User Story Mapping | Speak in examples. Wherever possible, use specific examples of what users do, exactly what data might be entered, exactly what users would see in response, or whatever examples best support your story. Split and thin. When discussing details and thinking about development time, you’ll often find stories are larger … |
| 14 | Patton, User Story Mapping | Play “What-About” You’ve imagined the solution from a user’s perspective, and visualized the user experience. Take some time to discuss what’s going on underneath the user interface. Talk about tough business rules, complex data validation, and nasty backend systems or services you’ll need to connect with. Add stories … |
| 15 | Cohn, User Stories Applied (2004) | For example, suppose you write the story "A user can pay for the items in her shopping cart with a credit card." You then write these simple tests on the back of that story card: Test with Visa, MasterCard and American Express (pass). Test with Diner's Club (fail). Test with a Visa debit card (pass). Test with expired … |
| 16 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | When stakeholders are aware of the plan upfront, such problems do not happen. When all else fails, slice the hamburger If none of the ideas in this part of the book helps you to break up a larger chunk of work into smaller pieces that would iteratively deliver value, then try the user story hamburger. |
| 17 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | Chris Matts popularised the idea that the value of an IT system is mostly in the outputs it produces, and that the inputs are just means to an end. Instead of slicing the future system by inputs, slice it by outputs, and then build up the capability to produce these outputs incrementally. |
| 18 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | The real value of software is mostly in its outputs, not in its inputs. An interesting strategy for splitting stories while preserving most of the value is to avoid any work around preparing inputs at first. This particularly applies to reference data. |
| 19 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | For example, a team we recently worked with created a policy to limit the total discussion to three hours, and within that time-box, limit each story to two diverge and merge cycles of 20 minutes each. If the delivery team members still think that the story is too vague after the second block, the product owner can … |
| 20 | Cohn, User Stories Applied (2004) | developed correctly. Story Card 1.2. A story card with a note. "How Long Does It Have to Be?" It is just as important to understand the expectations of a project's users. Those expectations are best captured in the form of the acceptance tests. |
| 21 | Cohn, User Stories Applied (2004) | prove whether or not it works as expected. Story Card 2.3. The revised front of a story card with only the story and questions to be discussed. Valuable to Purchasers or Users |
| 22 | Kalbach, Mapping Experiences (2020) | The process begins by first understanding the current experiences. Then, assess how well you support those experiences before finally finding opportunities to create unique value. To kick off the workshop, review the findings from your investigation together as a group. Make the diagram the focal point. |
| 23 | Cohn, User Stories Applied (2004) | A properly conducted story-writing workshop can be a very rapid way to write a great number of stories. A good story-writing workshop combines the best elements of brainstorming with low-fidelity prototyping. A low-fidelity prototype is done on paper, note cards, or a white board and maps very high level interactions … |
| 24 | Bland, Testing Business Ideas (2019) | Requirements Acceptance Criteria Before performing a spike, clearly define the acceptance criteria and time box so that everyone is clear on the goal before getting started. These can turn into never-ending research projects if left unchecked. |
| 25 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | Three-amigo conversations are best with a flipchart or a whiteboard, but they can also be very effective around a monitor, or even using screen-sharing remotely. If you organise conversations with a flipchart, one of the three amigos is responsible for writing up the results of the conversation and sharing them with … |
| 26 | Cohn, User Stories Applied (2004) | Velocity is the amount of work the developers can complete in an iteration. The sum of the estimates of the stories placed in an iteration cannot exceed the velocity the developers forecast for that iteration. If a story won't fit in an iteration, you can split the story into two or more smaller stories. |
| 27 | Cohn, User Stories Applied (2004) | What will the user most likely want to do next? What mistakes could the user make here? What could confuse the user at this point? What additional information could the user need? Maintain a parking lot of issues to come back to. |
| 28 | Patton, User Story Mapping | Because good stories are supposed to have acceptance criteria, we focus on getting acceptance criteria written, but there’s still not a common understanding of what needs to be built. As a consequence, teams don’t finish the work they plan on in the timeframe they planned to. |
| 29 | Patton, User Story Mapping | scaling user story mapping, The Map Is Just the Beginning scope creep, Mapping Helps You Spot Holes in Your Story , Build to Learn Scrum processbacklog grooming or backlog refinement, Dive into the Details of Each Story During Delivery |
| 30 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | One of the most common mistakes with user stories is to expect business stakeholders to fully define the scope. By doing this, delivery teams are effectively avoiding the responsibility (and the blame) for the ultimate business success of a solution. People who are inexperienced in designing software products – … |
| 31 | Patton, User Story Mapping | Requirements gathering with business stakeholders In-depth analysis of requirements and data Creating story narratives (one to five pages each) documenting requirements, solution design, and acceptance criteria Reading the narratives to the team using a projector and asking for any questions Unfortunately, the … |
| 32 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | How to make it work Make sure to involve people who will actually work on delivering the story. A common mistake teams make is to delegate the three-amigos analysis to whoever has time, so the people who actually end up delivering the software do not participate in the discussions. This creates problems for knowledge … |
| 33 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | It’s important to recognise when the entire team needs to know about some important decision or participate in a discussion. If the three amigos end up discussing a major impact on the current architecture or some globally significant feature change, then it might be worth pausing the smaller discussion and continuing … |
| 34 | Cohn, User Stories Applied (2004) | whole. Tom Poppendieck has reminded me that 100 perfect left shoes does not yield a single perfect pair of shoes. A far more valuable goal than perfect requirements is to augment adequate stories with frequent conversations. |
| 35 | Cohn, User Stories Applied (2004) | stories that are too small interdependent stories goldplating adding too many details to stories including user interface details too soon thinking too far ahead splitting too many stories trouble when prioritizing stories customer won't write and prioritize stories |

---
## store-phase-4-refinement-2: D3: How are Given-When-Then acceptance criteria written well, and what pitfalls exist?

- asked 2026-10-04 · notebook "The Product - Business Design" · conversation `44736858-c023-49c5-9d5d-8bd54fce64d4`
- Sources: Product School, The Product Book (2017); Cohn, User Stories Applied (2004); Maurya, Running Lean; Olsen, The Lean Product Playbook; Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014)
- Note: Inline result re-entered by the extraction agent; cited passages shortened to their leading sentences, answer text unchanged.

**Question**

> How should acceptance criteria be formulated as Given-When-Then scenarios for a user story? Give the sources' guidance on how to write a good scenario (structure, level of detail, one rule per scenario, declarative vs. imperative wording, number of scenarios), a checklist for a good acceptance criterion, and the pitfalls the sources name (e.g. too detailed, UI-bound, untestable, vague).

**Answer** (verbatim, citation markers resolve in the table below)

Formulating acceptance criteria as **Given-When-Then** scenarios aligns user story development with Behavior-Driven Development (BDD), establishing clear, shared expectations before implementation begins [1, 2]. 

---

##### Formulating Given-When-Then Scenarios

The **Given-When-Then** template structures acceptance criteria into three core components [44, 180, 217–219]:
* **Given `<some context>`**: Establishes the initial state, setting, or preconditions before any action takes place [1, 3].
* **When `<some action is done>`**: Specifies the specific action, event, or trigger initiated by the user or system [1, 4].
* **Then `<a set of observable behaviors happens>`**: Defines the expected, testable results or observable system behaviors [1, 4, 5].

---

##### Sources' Guidance on Writing Good Scenarios

###### 1. Level of Detail & Prescriptiveness
* **Focus on Goals over Prescriptions**: Scenarios should define *what* success looks like rather than mandating *how* to build it [1]. Avoid over-specifying or allowing the `When` and `Then` blocks to become prescriptive UI design scripts [1].
* **Enough to Define "Done"**: Provide sufficient detail to make it clear how to test that the story is completely implemented [6, 7], while avoiding "completism"—gathering exhaustive details well in advance of implementation [8, 9].

###### 2. One Behavior / Rule per Scenario
* **Focus on Specific Behavior Changes**: A scenario should test a single rule or behavior change [9–11, 41]. 
* **Contrast Current vs. New Behavior**: When helpful, clarify scope by contrasting the expected new action against current functionality (e.g., adding an *"instead of..."* or *"whereas currently..."* clause during refinement) [10–12, 124].
* **Falsifiable Hypotheses**: Frame scenarios so that a specific, repeatable action yields a clearly expected, measurable outcome [5].

###### 3. Declarative vs. Imperative Wording
* **Declarative Wording (Recommended)**: Use active, goal-oriented statements that focus on user intent, domain rules, and value [1, 10, 11]. 
* **Imperative Wording (Avoid)**: Avoid step-by-step procedural steps, click paths, or explicit user interface controls [10, 12, 13].

###### 4. Number of Scenarios
* **Focus on Intent, Not 100% Permutation Coverage**: Write scenarios as long as they add value and clarify the intent of the story for developers [14, 15]. Stop writing scenarios when additional cases no longer add new clarity [14, 15].
* **Avoid Redundancy**: You do not need to test every single boundary condition or data variation at the acceptance scenario level if the underlying rule is identical; low-level boundary checks belong in developer unit tests [14, 16]. For example, if all invalid credit cards are processed identically, testing one invalid card type in an acceptance test is sufficient [14, 16].

---

##### Checklist for Good Acceptance Criteria

- [ ] **Testable & Objective**: Defines clear, unambiguous criteria so anyone can objectively verify when the story is "done" [6, 7].
- [ ] **Grounded in User/Business Value**: Expresses expectations from the user's or purchaser's perspective rather than internal technical tasks [17, 18].
- [ ] **Established Before Coding**: Specified collaboratively between product owners/customers and developers prior to implementation [2, 15, 19].
- [ ] **UI & Technology Agnostic**: Free of unnecessary UI assumptions (e.g., specific buttons or layouts) and technical implementation details [10, 12, 13, 17].
- [ ] **Falsifiable Outcome**: Pairs a specific action with a measurable, verifiable result [5].
- [ ] **Concise & Non-Redundant**: Clarifies core assumptions without duplicating low-level unit test cases [14-16].

---

##### Pitfalls Named in the Sources

1. **Overly Prescriptive / Too Detailed ("Completism")**: Gathering excessive detail too early or writing scenarios that dictate UI steps rather than user goals [1, 8, 9].
2. **UI-Bound / Implementation-Bound**: Coupling criteria to specific interface elements or technology stacks (e.g., naming drop-down menus or database calls) [10, 12, 13, 17, 20].
3. **Untestable / Subjective Criteria**: Using subjective phrases like *"the system must be easy to use"* or *"never wait long for screens"* that cannot be objectively verified or automated [21, 22].
4. **Vague & Ambiguous Language**: Using words like *"should"* or *"prominently display"* that create confusion over whether a requirement is optional or how it is defined [23, 24].
5. **Technical / "Fake" User Stories**: Writing criteria for internal developer or QA tasks (e.g., *"understanding an API"* or *"automating server restarts"*) that offer no direct business value or observable outcome [25, 26].
6. **Excessive Test Coverage**: Attempting to document every edge case in acceptance criteria rather than using scenarios to guide conversation and intent [14, 16].

---

💡 *Would you like to take one of your current user stories and map out its Given-When-Then scenarios together?*

**Citations**

| # | Source | Cited passage |
|---|---|---|
| 1 | Product School, The Product Book (2017) | Just like the user scenarios, you’ll want to avoid being prescriptive and instead focus on goals and requirements. Some PMs prefer to use the Given-When-Then format: “Given <some context>, when <some action is done>, then <a set of observable behaviors happens>.” While Given-When-Then makes it easier than other ways … |
| 2 | Cohn, User Stories Applied (2004) | Tests are generally written at the following times: whenever the customer and developers talk about the story and want to capture explicit details as part of a dedicated effort at the start of an iteration but before programming begins whenever new tests are discovered during or after the programming of the story |
| 3 | Cohn, User Stories Applied (2004) | Carroll (2000) says that scenarios include the following characteristic elements: a setting actors goals or objectives actions and events The setting is the location where the story takes place. |
| 4 | Cohn, User Stories Applied (2004) | Carroll refers to the actions and events as the plot of a scenario. They are the steps an actor takes to achieve her goal or a system's response. Searching for a job in Idaho is an action Maria performs. The response to that action is the event of the system displaying a list of matching jobs. |
| 5 | Maurya, Running Lean | The second statement not only has a specific and measurable outcome, but it is also based on a specific and repeatable action that makes it testable. A formula for crafting a falsifiable hypothesis is: Falsifiable Hypothesis = [Specific Repeatable Action] will [Expected Measurable Outcome] |
| 6 | Olsen, The Lean Product Playbook | Testable: A good story provides enough information to make it clear how to test that the story is “done” (called acceptance criteria). |
| 7 | Cohn, User Stories Applied (2004) | Acceptance tests also provide basic criteria that can be used to determine if a story is fully implemented. Having criteria that tell us when something is done is the best way to avoid putting too much, or too little, time and effort into it. |
| 8 | Cohn, User Stories Applied (2004) | Too Many Details Symptom: Too much time is being spent gathering details well in advance of a story being implemented. Or, more time is spent writing about stories than talking about them. |
| 9 | Cohn, User Stories Applied (2004) | This becomes a problem when many people feel compelled to fill in each space on a form. Fowler (1997) refers to this as completism. |
| 10 | Cohn, User Stories Applied (2004) | Chapter 7. Guidelines for Good Stories Start with Goal Stories Slice the Cake Write Closed Stories Put Constraints on Cards Size the Story to the Horizon Keep the UI Out as Long as Possible Some Things Aren't Stories Include User Roles in the Stories Write for One User Write in Active Voice Customer Writes |
| 11 | Cohn, User Stories Applied (2004) | IEEE 830-style requirements have sent many projects astray because they focus attention on a checklist of requirements rather than on the user's goals. It is very difficult to read a list of requirements without automatically considering solutions in your head as you read. |
| 12 | Cohn, User Stories Applied (2004) | use cases are more prone to including details of the user interface, despite admonishments to avoid this. First, use cases often lead to a large volume of paper and without another suitable place to put user interface requirements they end up in the use cases. |
| 13 | Cohn, User Stories Applied (2004) | not the proper place to specify the user interface like this. Think about the user story that would replace Figure 12.2: "A user can compose and send email messages." No hidden user interface assumptions there. With stories, the user interface will come up during the conversation with the customer. |
| 14 | Cohn, User Stories Applied (2004) | programming team should have unit tests that correctly identify February 30 and June 31 as invalid dates. The customer is not responsible for identifying every possible test. The customer should focus her efforts on writing tests that clarify the intent of the story to the developers. |
| 15 | Cohn, User Stories Applied (2004) | Acceptance tests document assumptions about the story a customer has that may not have been discussed with a developer. Acceptance tests provide basic criteria that can be used to determine if a story is fully implemented. Acceptance tests are written before the programmer begins coding. Stop writing tests when … |
| 16 | Cohn, User Stories Applied (2004) | would also need to test other card types. But when the customer speaks with the developers, she learns that (in this example) all cards are processed identically and testing an invalid card of one type is sufficient. |
| 17 | Cohn, User Stories Applied (2004) | these stories are good ones but they should instead be written so that the benefits to the customers or the user are apparent. In exactly the same way it is worth attempting to keep user interface assumptions out of stories, it is also worth keeping technology |
| 18 | Cohn, User Stories Applied (2004) | describing the need in terms of its value to users or the customer. Customer Responsibilities You are responsible for writing stories that are promises to converse rather than detailed specifications, have value to users or to yourself, are independent, are testable, and are appropriately sized. |
| 19 | Cohn, User Stories Applied (2004) | Tests are specified before coding begins because they are a useful and effective method for communicating the customer's assumptions about the new functionality. |
| 20 | Cohn, User Stories Applied (2004) | The user can run the system on Windows XP and Linux. All graphing and charting will be done using a third-party library. The user can undo up to fifty commands. The software will be released by June 30. The software will be written in Java. The user can select her country from a drop-down list. |
| 21 | Cohn, User Stories Applied (2004) | A user must find the software easy to use. A user must never have to wait long for any screen to appear. As written, these stories are not testable. Whenever possible, tests should be automated. |
| 22 | Cohn, User Stories Applied (2004) | The story "a user never has to wait long for any screen to appear" is not testable because it says "never" and because it does not define |
| 23 | Cohn, User Stories Applied (2004) | At lunch the other day my menu read: Entrée comes with choice of soup or salad and bread. That should not have been a difficult sentence to understand but it was. We often act as though written words are precise, yet they aren't. |
| 24 | Cohn, User Stories Applied (2004) | The system should prominently display a warning message whenever the user enters invalid data. Does should mean the requirement can be ignored if we want? What does prominently display mean? What's prominent to whoever wrote this may not be prominent to whoever codes and tests it. |
| 25 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | When the user need of a story is in the zone of control of the delivery group, the story is effectively a task without risk, which should raise alarm bells. Fake stories are those about the needs of delivery team members. For example, ‘As a QA, in order to test faster, I want the database server restarts to be … |
| 26 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | Some teams solve this by writing fake user stories, that mostly follow the pattern ‘As a developer, I want to understand how the new external API works’. It’s almost impossible to define any kind of acceptance criteria for such stories. |

---
## store-phase-4-refinement-3: D4: How are example tables (Specification by Example) built and used?

- asked 2026-10-04 · notebook "The Product - Business Design" · conversation `87fb42a8-906f-438f-93f7-8aa1f2bfb9f6`
- Sources: Cohn, User Stories Applied (2004); Patton, User Story Mapping; Anforderungsdokumentation.pdf; Pohl & Rupp, Basiswissen Requirements Engineering (2015); Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014)
- Note: Inline result re-entered by the extraction agent; cited passages shortened to their leading sentences, answer text unchanged.

**Question**

> How are example tables built in Specification by Example? Describe the step-by-step procedure the sources give for turning a business rule or Given-When-Then scenario into a table of concrete examples (how to choose examples, boundary values, columns for inputs and expected outputs, how many rows), how the tables are used afterwards, and which pitfalls the sources name (e.g. too many examples, incidental details, examples that do not illustrate a rule).

**Answer** (verbatim, citation markers resolve in the table below)

Your sources do not contain Gojko Adzic’s book *Specification by Example* or a dedicated, step-by-step methodology titled "Specification by Example." However, the uploaded materials extensively cover closely related agile and requirements engineering frameworks for turning business rules and scenarios into concrete example tables—most notably **Mike Cohn's tabular acceptance testing (FIT/FitNesse)** in *User Stories Applied*, **Decision Tables (*Entscheidungstabellen*)** in German requirements engineering texts (*Anforderungsdokumentation* and Pohl & Rupp's *Basiswissen Requirements Engineering*), and **example-driven story mapping** (Jeff Patton, Gojko Adzic & David Evans, and Stefan Richter).

Below is the step-by-step procedure, post-creation usage, and key pitfalls described in your sources for building and using example tables.

---

##### Step-by-Step Procedure for Building Example Tables

1. **Define Columns for Inputs and Expected Outputs**
   - **Input Columns**: Create columns that represent the input variables, parameters, or conditions required for the business rule or scenario (e.g., `CardType`, `Expiration`, `Number`) [1, 2].
   - **Output Columns**: Create a final column (or columns) that specifies the expected result or evaluation method (e.g., `valid()`, pass/fail, or calculated output) [1, 2].

2. **Select Concrete Examples and Boundary Values (Rows)**
   - **Start Simple, Then Add Complexity**: Begin with simple or obvious happy-path scenarios, then introduce complex examples to establish the full range of constraints [3].
   - **Cover Distinct Data Sets & Boundaries**: Each row must represent one distinct set of data values [1]. Include representative examples for:
     - **Valid inputs** (e.g., active cards, standard transactions) [2, 4].
     - **Invalid/Failed inputs** (e.g., unaccepted card types, wrong card numbers) [2, 4].
     - **Expired or edge conditions** (e.g., past expiration dates) [4, 5].
     - **Boundary/Limit values** (e.g., purchase amounts exceeding a credit card's limit) [5].

3. **Determine Row Quantity and Stopping Criteria**
   - **Add Rows for Clarification**: Continue adding rows as long as they add business value and clarify the intent or rules of the story [6, 7].
   - **When to Stop**: Stop adding rows when additional examples no longer clarify the story's intent [6, 7]. Avoid adding rows for low-level edge cases (such as leap-year date validation) that belong in developer unit tests rather than acceptance criteria [6].

4. **Map Complex Rules with Decision Tables (*Entscheidungstabellen*)**
   - For complex business rules with multiple "if-then" conditions, structure them into decision tables to ensure that every combination of conditions—including what happens when a condition is *not* met—is explicitly documented without missing cases, overlaps, or contradictions [8, 9].

---

##### How Example Tables Are Used Afterwards

* **Automated Acceptance Testing**: Example tables are used as executable tests in frameworks like FIT (Framework for Integrated Test) or FitNesse [10, 11]. Developers write simple fixture/glue code that reads the table inputs, runs the application logic, and evaluates the output [2].
* **Visual Result Feedback**: When automated test suites run, the framework evaluates each row and dynamically colors the result cells **green** (for passed tests) or **red** (for failed tests) [10].
* **Clear Definition of "Done"**: The completed table serves as explicit criteria to determine when a user story or feature is fully implemented, preventing under-building or over-engineering [5, 7].
* **Shared Understanding**: Tables serve as a communication bridge between business stakeholders and development teams, ensuring everyone agrees on how the system should react to various inputs [1, 12].

---

##### Pitfalls Named in the Sources

* **Too Many Examples / Low-Level Duplication**: Writing redundant examples for low-level cases that are already covered by developer unit tests, which wastes effort without adding business clarity [6].
* **Premature UI and Technical Details**: Including explicit user interface steps, screen layouts, or technical implementation details inside the examples rather than focusing on the core business rule and user benefit [13-15].
* **Incomplete Condition Coverage**: Writing rules ("if...then") without specifying what happens when conditions are false. Decision tables are specifically recommended to catch these missing branches [9].
* **Solution-Oriented Instead of Behavior-Oriented Examples**: Framing stories and examples around a specific software implementation (e.g., "Cash Report") rather than the user's underlying goal or behavior change [13, 16].

---

Would you like me to conduct some web research on Gojko Adzic's formal *Specification by Example* book to pull out his specific SBE table patterns and Given-When-Then rules?

**Citations**

| # | Source | Cited passage |
|---|---|---|
| 1 | Cohn, User Stories Applied (2004) | a sample of the type of table that can be processed by these tools. Each row represents one set of data. In this case the first data row identifies a Visa card that expires in May of 2005 and has the number 4123456789011. The final column indicates whether this card should pass a validity check in the application. |
| 2 | Cohn, User Stories Applied (2004) | CardType Expiration Number valid() Visa 05/05 4123456789011 true Visa 05/23 4123456789012349 false MasterCard 12/04 5123456789012343 true MasterCard 12/98 5123456789012345 false MasterCard 12/05 42 false American Express 4/05 341234567890127 true In order to execute the tests in Table 6.1, a programmer on the team … |
| 3 | Patton, User Story Mapping | Create a varied list of examples. This is where many people lose control and accidentally stumble into complexity. Start with a simple or obvious example; the more concrete, the better. Then come up with a complex example, and don’t fear setting the bar high. You are creating a range of constraints, you are not … |
| 4 | Cohn, User Stories Applied (2004) | these stories are good ones but they should instead be written so that the benefits to the customers or the user are apparent. Better variations of these stories could be the following: Up to fifty users should be able to use the application with a five-user database license. |
| 5 | Cohn, User Stories Applied (2004) | Acceptance tests also provide basic criteria that can be used to determine if a story is fully implemented. Having criteria that tell us when something is done is the best way to avoid putting too much, or too little, time and effort into it. |
| 6 | Cohn, User Stories Applied (2004) | programming team should have unit tests that correctly identify February 30 and June 31 as invalid dates. The customer is not responsible for identifying every possible test. The customer should focus her efforts on writing tests that clarify the intent of the story to the developers. |
| 7 | Cohn, User Stories Applied (2004) | Acceptance tests document assumptions about the story a customer has that may not have been discussed with a developer. Acceptance tests are written before the programmer begins coding. Stop writing tests when additional tests will not help clarify the details or intent of the story. FIT and FitNesse are excellent … |
| 8 | Anforderungsdokumentation.pdf | 3.5 Entscheidungstabellen (Ebert (2012), S. 147) Neben der Dokumentation von Anforderungen über Diagramme ist die Darstellung anhand von Entscheidungstabellen eine sehr geeignete Form zur übersichtlichen Aufbereitung von Abhängigkeiten und Zusammenhängen. Über Entscheidungstabellen lassen sich komplexe Bedingungen … |
| 9 | Pohl & Rupp, Basiswissen Requirements Engineering (2015) | 5.1.4 Unvollständig spezifizierte Bedingungen Bedingungsstrukturen erkennen und klären Ein weiterer Indikator für einen möglichen Informationsverlust sind unvollständig spezifizierte Bedingungen. Anforderungen, die Bedingungen enthalten, geben das Verhalten bei Eintritt der Bedingung an, müssen aber auch beschreiben, … |
| 10 | Cohn, User Stories Applied (2004) | tests, the customer only needs to create a simple table like this one that shows data values and expected results. When the tests in Table 6.1 are run, the results are displayed by coloring the test columns (the last column in this example) either green (for a passed test) or red (for a failed test). |
| 11 | Cohn, User Stories Applied (2004) | Using FIT, tests are written in a familiar spreadsheet or tabular format. Bob and Micah Martin have led the development of FitNesse, an extension of FIT that makes test writing even easier. Because tests are expressed in spreadsheet-like tables within web pages, the effort for customers to identify and write tests is … |
| 12 | Anforderungsdokumentation.pdf | Qualitätssicherung durch Feedback und Validierung Warum ist die Anforderungsdokumentation relevant? Schaffung eines gemeinsamen Verständnisses aller Stakeholder zur Ausgestaltung der Anforderungen Transparente Abbildung des Scopes und der Vision Frühe Identifizierung von offenen Punkten und Konfliktpotenzialen |
| 13 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | The one thing you really have to do to make this work is to avoid feature requests. If you have only a short summary on a card, it must not be a solution without context. So, ‘How much potential cash is in blocked projects?’ is a valid summary, but a ‘Cash report’ isn’t. |
| 14 | Cohn, User Stories Applied (2004) | cram lots of detail onto a small card. Including too many details in a story is indicative of placing too much value on documentation and favoring it over conversation. Including User Interface Detail Too Soon Symptom: Stories written early in a project that include detail about the user interface. |
| 15 | Cohn, User Stories Applied (2004) | developed correctly. Story Card 1.2. A story card with a note. "How Long Does It Have to Be?" It is just as important to understand the expectations of a project's users. Those expectations are best captured in the form of the acceptance tests. |
| 16 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | Misleading stories describe a solution and not the real user need. One case we came across recently was ‘As a back-office operator, in order to run reports faster, I want the customer reporting database queries to be optimised’. At first glance, this seemed like a nice user story. |

---
## store-phase-4-refinement-4: D6: Vertical story splitting patterns, split checks, and pitfalls

- asked 2026-10-04 · notebook "The Product - Business Design" · conversation `5de68b48-5f72-46bd-ac1e-d1e2644b574f`
- Sources: Cohn, User Stories Applied (2004); Patton, User Story Mapping; Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014); Olsen, The Lean Product Playbook

**Question**

> When a user story is too big for one sprint, how do the sources say to split it vertically? For each splitting pattern the sources give, name the pattern with the sources' own concrete example, and list the checks for a good split (each part delivers user value, independently testable, estimable, smaller than the original), how to choose between patterns, what to do with the resulting part stories, and the pitfalls the sources name (e.g. horizontal/technical layer splits, splits that lose value).

**Answer** (verbatim, citation markers resolve in the table below)

When a user story is too large to fit into a single iteration or sprint, agile product management sources emphasize **vertical splitting** (often called **"slicing the cake"**) [1]. Rather than cutting a feature horizontally along technical architecture layers (e.g., UI, business logic, database), a vertical split cuts through **every layer of the application** [1, 2]. This ensures that every resulting part story remains functional end-to-end and delivers tangible value [1].

---

##### 1. Vertical Splitting Patterns & Concrete Examples

The sources detail several concrete patterns for vertically slicing large user stories:

*   **Disaggregating Compound Stories (Sub-Features / Capabilities)**: Breaking down a large "epic" that contains multiple distinct sub-actions into smaller, capability-focused user stories [3-5].
    *   *Source Example*: Mike Cohn illustrates splitting the epic *"A user can post her resume"* into sub-stories like *"A user can add and edit education information"*, *"A user can add and edit job history information"*, and *"A user can add and edit salary history information"* [4, 5]. Similarly, *"A user can edit her account information"* is split into *"A user can edit credit card information"* and *"A user can edit shipping and billing addresses"* [6].
*   **Complex Story / Spike Splitting (Learning vs. Earning)**: Slicing out technical uncertainty or research into a timeboxed "spike" (learning story) separate from the functional implementation (earning story) [7, 8].
    *   *Source Example*: Cohn provides the example of a team given the story *"A company can pay for a job posting with a credit card"* when developers lack credit card processing experience [8]. They split it into an investigative story—*"Investigate credit card processing over the web"* (timeboxed spike)—and the functional story—*"A user can pay with a credit card"* [8].
*   **Slicing by Business Rules, Data Types, or Channels**: Dividing multi-faceted rules, formats, or platforms into primary and secondary options [9-11].
    *   *Source Example (Cohn)*: Splitting credit card payments by single card types (*"A customer can pay with one type of credit card"*) [10], or splitting magazine search criteria into *"searching by author or title"*, *"searching by publication name or date"*, and *"combining search criteria"* [11].
    *   *Source Example (Dan Olsen)*: Slicing photo sharing in *The Lean Product Playbook* by individual distribution channels (Facebook, Twitter, Pinterest, email, text message), or allowing photo sharing first without optional text messages or user tagging [9].
*   **Start with Outputs / Simplify Outputs**: Slicing from the output side (reports, exports) rather than input workflows, or generating simplified intermediate outputs (like flat files) before connecting to complex legacy data warehouses [12-15].
    *   *Source Example*: Gojko Adzic describes a bank legacy rewrite where the team sliced a massive exception reporting epic down to a daily summary email report for a single high-volume activity type covering 7-day windows, bypassing authentication, custom date ranges, and on-demand execution [14]. In another case, accountants received tax data extracted to Excel files first rather than waiting for full legacy data warehouse integration [13, 15].
*   **Start with Dummy / Hardcoded Data (Move to Dynamic Later)**: Eliminating initial input or reference data integration by using hardcoded or text-file data [16].
    *   *Source Example*: Adzic describes a bank trade entry screen where the team used a editable local text file for supported currencies instead of waiting on slow central IT procedures to grant database access [16].
*   **Narrow Down Customer Segment / Target Persona**: Restricting functionality to a specific, narrow user role or subgroup rather than supporting all user roles at once [17-19].
    *   *Source Example*: Adzic cites a trade capture story split down from the entire department to just two operators handling UK trades, because UK trades had no complex tax calculation rules, enabling delivery in two weeks [19].
*   **Extract Basic Utility / Simplify User Interaction (Utility over Usability)**: Providing bare-minimum utility (semi-automated or raw UI) so users can execute a critical task immediately, deferring usability and polish [20, 21].
    *   *Source Example*: Adzic notes shipping a borderline-usable reporting tool in two days for a bank under severe regulatory pressure, satisfying regulators on time while leaving UI polish for later [21].
*   **Split by Examples of Usefulness (Slicing Value for Tech Refactoring)**: Slicing major technical overhauls or migrations by finding small, specific examples of real-world usefulness [22, 23].
    *   *Source Example*: Rebuilding *MindMup's* visualization engine away from HTML5 Canvas by first enabling non-interactive map embedding (reusing existing calculations), then tackling collaboration, large maps, and image drag-and-drop iteratively [22-24].
*   **Slice by Capacity / Performance Scale**: Slicing work across capacity boundaries (file size, session length, total users, concurrent volume) [25].
    *   *Source Example*: Running old and new systems in parallel during legacy migrations by progressively shifting usage based on session lengths or data volume [25].
*   **Slice the Hamburger**: A facilitation technique that maps technical workflow steps vertically and quality/capability options horizontally, then takes a vertical "bite" across the layers [26, 27].
    *   *Source Example*: Breaking down a newsletter emailer into high-level steps (assemble recipients, send emails, get status, handle bounces) and selecting low-fidelity/scripted options for each step to form the first working slice [27, 28].
*   **Functional Walking Skeleton**: Creating a thin, cross-cutting end-to-end slice through a story map to establish a working "steel thread" or "tracer bullet" before layering on enhancements [29].
    *   *Source Example*: Jeff Patton describes building a functional walking skeleton across the story map so the team can see real data flowing end-to-end and test technical risks prior to shipping [29, 30].

---

##### 2. Checks for a Good Split

Sources point to the **INVEST criteria** (Bill Wake / Mike Cohn / Dan Olsen) and vertical integrity checks to verify a split [1, 31, 32]:

1.  **Delivers User/Purchaser Value**: Each split part must provide observable benefit to an end-user or purchaser—not just to developers [33, 34].
2.  **Independently Testable**: Each story must have clear acceptance criteria to verify that it functions end-to-end [31, 35].
3.  **Estimable**: The team must understand the scope well enough to provide a reasonable estimate [32, 36].
4.  **Smaller Than Original**: The resulting story point estimate must fall below the team’s maximum iteration threshold [31, 37].
5.  **Vertical Integrity ("Slice of Cake")**: The story includes a little bit of UI, business logic, and data persistence rather than an isolated architecture layer [1].

---

##### 3. How to Choose Between Patterns

To choose the right pattern, identify the primary driver of the story's size or complexity [4, 7, 8, 16]:

*   **If driven by technical uncertainty or unknown APIs** \\(\rightarrow\\) Split a **timeboxed spike (learning story)** from implementation [7, 8].
*   **If driven by multiple user roles or platforms** \\(\rightarrow\\) Split by **customer segment / persona** or **channels** [9, 18, 19].
*   **If driven by complex data formats or legacy integrations** \\(\rightarrow\\) **Simplify outputs** (e.g., intermediate Excel files) or **start with hardcoded reference data** [15, 16].
*   **If driven by a tight regulatory/business deadline** \\(\rightarrow\\) **Extract basic utility** (utility over usability) [20, 21, 38].
*   **If the team is stuck in all-or-nothing technical thinking** \\(\rightarrow\\) Use **Slice the Hamburger** or **Functional Walking Skeleton** [26, 29].

---

##### 4. What to Do with the Resulting Part Stories

*   **Independent Prioritization**: The Product Owner/customer reviews the estimates and sorts the part stories independently [39-41]. Essential slices are prioritized for early sprints, while non-essential variations or extra formats are deferred [9, 11, 40].
*   **Timeboxing & Scheduling Spikes**: Investigative spike stories are placed in an earlier sprint with a strict timebox, allowing the functional story to be estimated and scheduled in subsequent sprints [8, 42, 43].
*   **Backlog & Release Placement**: Core slices go into upcoming sprint backlogs, while secondary slices remain in the release backlog or next milestone buckets [41, 44, 45].
*   **Hierarchy Tracking**: When large stories are split into micro-stories, track the hierarchy to ensure the combined micro-stories still fulfill the overarching business goal [46].
*   **Re-Combining if Too Small**: If resulting stories become too small (taking longer to write and estimate than to code), re-combine them for planning purposes [47-49].

---

##### 5. Pitfalls Named in the Sources

*   **Horizontal / Technical Layer Splits**: Splitting along architectural boundaries (e.g., "Build UI form" in Sprint 1 and "Save to database" in Sprint 2) [50]. *Why it fails*: Neither story works on its own, delivering zero end-to-end user value and wasting user time [1, 2, 50].
*   **Fake Stories & Technical Stories**: Writing stories centered around internal developer tasks (e.g., *"As a QA, I want database restarts automated"*) or internal job divisions that yield no user-visible outcome [46, 51-53].
*   **Splits That Lose Value (Intermediate Disconnect)**: Cutting outputs into obscure internal formats that end-users cannot access or use [13].
*   **Over-Splitting / Splitting Too Often**: Frequently splitting stories during sprint planning as a crutch rather than defining appropriately sized items during backlog refinement [54-56].
*   **Usability Backlash Without Stakeholder Alignment**: Extracting basic utility without upfront stakeholder communication can cause severe client outrage (e.g., Gojko Adzic’s slot machine game team almost had their contract cancelled when clients saw the raw UI) [57].
*   **Short-Term Wins Over Long-Term Risks**: Repeatedly splitting stories to avoid risky areas, causing technical debt to pile up ("children choosing chocolate over broccoli") [58].

---

💡 *Would you like to take one of your current product features or epics and work through an example vertical split together using one of these patterns?*

**Citations**

| # | Source | Cited passage |
|---|---|---|
| 1 | Cohn, User Stories Applied (2004) | that the data is not saved. Not only is this not useful, it would actually waste users' time. The second story says that the data collected on the form will be written to the database. Without a story to present the form to users, the second story is not useful. A far better approach is to write the replacement … |
| 2 | Patton, User Story Mapping | If the story describes a solution that’s affordable but big, break it into smaller parts that allow you to evaluate and see progress sooner. There’s a trick to breaking down large stories, and it helps me to keep the cake metaphor in my head. If you like cake, by now you might be getting hungry—especially if the cake … |
| 3 | Cohn, User Stories Applied (2004) | starting point it's good to have stories that can be coded and tested between half a day and perhaps two weeks by one or a pair of programmers. Liberally interpreted, the two stories above could easily cover the majority of the BigMoneyJobs site so each will likely take most programmers more than a week. When a story … |
| 4 | Cohn, User Stories Applied (2004) | The compound story The complex story A compound story is an epic that comprises multiple shorter stories. For example, the BigMoneyJobs system may include the story "A user can post her resume." During the initial planning of the system this story may be appropriate. But when the developers talk to the customer, they … |
| 5 | Cohn, User Stories Applied (2004) | A user can add and edit education information. A user can add and edit job history information. A user can add and edit salary history information. A user can add and edit publications. A user can add and edit presentations. A user can add and edit community service. A user can add and edit an objective. And so on. … |
| 6 | Cohn, User Stories Applied (2004) | two story points. < Day Day Up > < Day Day Up > Accounts The next story ("A user can establish an account that remembers shipping and billing information") seems straightforward and the developers estimate it at two story points. Next, the developers start to estimate "A user can edit her account information (credit … |
| 7 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | A good way to deal with such situations is to explicitly split the research tasks into a separate story with a goal of its own. A helpful way of thinking about this is that a story should be either about learning or earning. Learning stories help stakeholders plan better. Earning stories help to deliver value to … |
| 8 | Cohn, User Stories Applied (2004) | investigative and one developing the new feature. For example, suppose the developers are given the story "A company can pay for a job posting with a credit card" but none of the developers has ever done credit card processing before. They may choose to split the stories like this: Investigate credit card processing … |
| 9 | Olsen, The Lean Product Playbook | Let’s illustrate the idea of breaking a high-level user story down. Say you are working on a photo sharing application and start out with the user story: “As a user, I want to be able to easily share photos with my friends so that they can enjoy them.” One way to break this story down is by the various channels a … |
| 10 | Cohn, User Stories Applied (2004) | Find a different way of splitting the stories Combining the stories about the different credit card types into a single large story ("A company can pay for a job posting with a credit card") works well in this case because the combined story is only five days long. If the combined story is much longer than that, a … |
| 11 | Cohn, User Stories Applied (2004) | story was split into three: one story for searching by author or title, another for searching by publication name or date, and a third allowing for the criteria to be combined. Story Card 9.2. Search criteria. < Day Day Up > < Day Day Up > Risky Stories Looking back over earlier approaches to software development, it … |
| 12 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | When dealing with complex output formats this way of splitting stories can provide manageable chunks and help teams roll something out quickly instead of working for months on getting all the outputs right. How to make it work An easy guideline is to choose one format instead of many formats if possible. For example, … |
| 13 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | The fourth good strategy is to cut the outputs at a different boundary. For example, use files instead of connecting to the data warehouse. The information is still there, persistent, but just not pushed all the way. The trick with this technique is to create a simplified output that will still bring value. Dividing a … |
| 14 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | Chris Matts popularised the idea that the value of an IT system is mostly in the outputs it produces, and that the inputs are just means to an end. Instead of thinking about workflows linearly, think about the outputs first. Instead of thinking about the log-in screen, think about the reports. Instead of slicing the … |
| 15 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | Simplify outputs If you’ve tried to simplify input channels and split by capacity, but a story is still too big, it’s often possible to split the story further from the other end, by simplifying outputs. This approach is particularly applicable to internal enterprise development, where the final output often needs to … |
| 16 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | The real value of software is mostly in its outputs, not in its inputs. An interesting strategy for splitting stories while preserving most of the value is to avoid any work around preparing inputs at first. This particularly applies to reference data. Instead of loading such data from the official sources … |
| 17 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | Key benefits Selecting a limited number of target segments for each milestone prevents stakeholders from constantly inventing new user roles. This makes people think twice when writing stories to justify pet features, and results in better, more focused stories. Forcing people to seriously consider which user segment … |
| 18 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | Lastly, a fixed set of roles helps to reduce the scope of stories and earlier delivery of value. How to make it work Think small: instead of a larger milestone that addresses the needs of five target user groups, think about five smaller milestones aimed at a single target segment each. Is there a group that could … |
| 19 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | A good example of this is a back-office application at a bank we worked with. The initial story about capturing trade messages was too big, and a lot of the complexity was around different tax systems. We investigated narrowing down the customer segment as a potential way of slicing the story, and discovered that two … |
| 20 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | Finally, in Practices For Scaling Lean and Agile Development, Larman and Vodde warn against treating normal solution design as fake research work, especially if it leads to solution design documentation for other people to implement. They suggest that research tasks should be reserved for ‘study far outside the … |
| 21 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | When stakeholders are aware of the plan upfront, such problems do not happen. For example, we’ve used this method with a large bank that had to solve a critical reporting problem, and the business stakeholders were amazed that the team could ship something in two days and get the regulators off their back, even though … |
| 22 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | One useful way of doing this is to ask for a few examples of how the intended deliverable would be useful, and then select those that depend only on a small piece of the overall solution. Extract each of these examples into a separate user story. Here is a concrete example. We initially launched MindMup using HTML5 … |
| 23 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | Even more importantly, slicing stories by examples of usefulness provides value much sooner to a subgroup of users. People do not have to wait for months until the whole job is done to benefit from specific changes. How to make it work List a bunch of options for how the final technical change would be useful, and … |
| 24 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | After that, we tackled collaboration, larger maps, mobile users, then more complex interaction such as image drag-and-drop. Each of these areas was driven by some nice examples of usefulness. Instead of building features up until all users could be switched over, we enabled a subgroup of our users to get part of the … |
| 25 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | For legacy migrations, splitting releases by capacity allows teams to run both the new and the old system in parallel and migrate use cases progressively to the new system. This is a useful way of de-risking the migration by supporting frequent feedback. How to make it work There are many different types of capacity … |
| 26 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | The user story hamburger is a facilitation technique that can help teams start to think about value-oriented slices when they are stuck in thinking about technical workflows and all-or-nothing use cases. It is based on user story mapping, but instead of organising many stories into multiple releases, it organises … |
| 27 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | Remove unsatisfactory options Remove options that don’t produce useful technical slices Choose a slice First, get the team to list the technical components and the workflow involved in providing the service or the use case that you’re breaking down. For example, mailing out an electronic newsletter would involve … |
| 28 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | How to make it work Keep workflow steps at a high level. Avoid having more than ten steps, otherwise you won’t be able to have a decent discussion about options. When you are collecting ideas, it’s best to split the team into several smaller groups and have them work independently, coming together for a joint … |
| 29 | Patton, User Story Mapping | So Mike worked with his team to create a development plan. This is what they did: they sliced their map into three, crosscutting slices. The first slice cuts all the way through the functionality. Once they build all those pieces, they can see the functionality working from end to end. It wouldn’t work in all the … |
| 30 | Patton, User Story Mapping | Finally, they’ll layer on the third slice to refine the feature, to make it as polished as it can be. They’ll also add in some of those unpredictable things. Don’t Release Each Slice Each of these slices isn’t a release to customers and users: it’s a milestone the team members will use to stop and take stock of where … |
| 31 | Olsen, The Lean Product Playbook | estimated. Small: Good stories tend to be small in scope. Larger stories will have greater uncertainty, so you should break them down. Testable: A good story provides enough information to make it clear how to test that the story is “done” (called acceptance criteria). Specify Your Minimum Viable Product (MVP) Feature … |
| 32 | Cohn, User Stories Applied (2004) | Chapter 2. Writing Stories In this chapter we turn our attention to writing the stories. To create good stories we focus on six attributes. A good story is: Independent Negotiable Valuable to users or customers Estimatable Small Testable Bill Wake, author of Extreme Programming Explored and Refactoring Workbook, has … |
| 33 | Cohn, User Stories Applied (2004) | prove whether or not it works as expected. Story Card 2.3. The revised front of a story card with only the story and questions to be discussed. < Day Day Up > < Day Day Up > Valuable to Purchasers or Users It is tempting to say something along the lines of "Each story must be valued by the users." But that would be … |
| 34 | Cohn, User Stories Applied (2004) | these stories are good ones but they should instead be written so that the benefits to the customers or the user are apparent. This will allow the customer to intelligently prioritize these stories into the development schedule. Better variations of these stories could be the following: Up to fifty users should be … |
| 35 | Cohn, User Stories Applied (2004) | A user must find the software easy to use. A user must never have to wait long for any screen to appear. As written, these stories are not testable. Whenever possible, tests should be automated. This means strive for 99% automation, not 10%. You can almost always automate more than you think you can. When a product is … |
| 36 | Olsen, The Lean Product Playbook | Good product teams strive to come up with ideas like idea G in Figure 6.1—the ones that create high customer value for low effort. Great product teams are able to take ideas like that, break them down into chunks, trim off less valuable pieces, and identify creative ways to deliver the customer value with less effort … |
| 37 | Olsen, The Lean Product Playbook | A good operating principle is that stories that are estimated to require a large number of points—above some maximum threshold value—need to be broken down into a set of smaller stories that are below the threshold value. You can think of a feature chunk as corresponding to a user story that has an acceptably small … |
| 38 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | Key benefits This technique works particularly well for splitting a time-critical story into a smaller piece that remains time-critical and a larger section that can be managed without a deadline. Because of this, it is extremely valuable when there is a tight business deadline carrying a significant risk, such as an … |
| 39 | Cohn, User Stories Applied (2004) | estimates, along with her own assessment of the value of each story, to sort the stories so that they maximize the value delivered to the organization. A particular story may be highly valuable to the organization but will take a month to develop. A different story may only be half as valuable but can be developed in … |
| 40 | Cohn, User Stories Applied (2004) | flexibility during release planning and it allows the customer to prioritize work at a much finer level. In our case, for example, Lori may think it is critical for users to edit their credit cards but she may be willing to wait a few iterations for the ability for users to change addresses. The original story is … |
| 41 | Cohn, User Stories Applied (2004) | Iteration Stories Story Points Iteration 1 A, B, C 13 Iteration 2 D, E, F 12 Iteration 3 G, H, J 12 Iteration 4 I 5 An alternative to temporarily skipping a large story and putting a smaller one in its place in an iteration is to split the large story into two stories. Suppose that the five-point Story I could have … |
| 42 | Cohn, User Stories Applied (2004) | about how much can be accomplished in that iteration. The key benefit of breaking out a story that cannot be estimated is that it allows the customer to prioritize the research separately from the new functionality. If the customer has only the complex story to prioritize ("Add novel extensions to standard expectation … |
| 43 | Cohn, User Stories Applied (2004) | timebox around the investigative story, or spike. Even if the story cannot be estimated with any reasonable accuracy, it is still possible to define the maximum amount of time that will be spent learning. Complex stories are also common when developing new or extending known algorithms. One team in a biotech company … |
| 44 | Patton, User Story Mapping | One finer point of Eric’s story-mapped backlog, and one that proves he’s smart, is the thickness of that topmost slice. It’s twice as thick as the slices below it. When Eric and his team finish a slice and deliver it to their development partners—what they call their beta customers—they’ll move the sticky notes up … |
| 45 | Patton, User Story Mapping | Slice Out a Minimum Viable Product Release The teams grabbed a roll of blue painter’s tape and stretched lines across the map left to right to make horizontal slices. They then went to work moving cards up and down, above and below the blue lines to designate which things needed to be done in the first slice, and … |
| 46 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | When the user need of a story is in the zone of control of the delivery group, the story is effectively a task without risk, which should raise alarm bells. There are three common scenarios: The story might be fake, micro-story or misleading. Fake stories are those about the needs of delivery team members. For … |
| 47 | Cohn, User Stories Applied (2004) | feasibility of extending expectation maximization") and a functional story ("extend expectation maximization"), she must choose between adding the investigative story that adds no new functionality this iteration and perhaps some other story that does. Combining Stories Sometimes stories are too small. A story that is … |
| 48 | Cohn, User Stories Applied (2004) | split; but, until it is necessary, the stories should remain combined. < Day Day Up > < Day Day Up > Interdependent Stories Symptom: Difficulty planning iterations because of dependencies between stories. Discussion: When two or more stories are dependent upon one another, it becomes difficult to plan the individual … |
| 49 | Cohn, User Stories Applied (2004) | assigned to a small story can change dramatically depending on the order in which the story is implemented. For example, consider these two small stories: Search results may be saved to an XML file. Search results may be saved to an HTML file. There is clearly a great deal of overlapping work between these two … |
| 50 | Cohn, User Stories Applied (2004) | simply too large to fit in the current iteration and must be split. The developers may want to split it along technical boundaries, such as: A Job Seeker can fill out a resume form. Information on a resume form is written to the database. In this case, one story would be done in the current iteration while the other … |
| 51 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | Describe a behaviour change Bill Wake’s INVEST set of user story characteristics has two conflicting forces. Independent and valuable are often difficult to reconcile with small. The value of software is a vague and esoteric concept in the domain of business users, but task size is under the control of a delivery … |
| 52 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | Split by examples of usefulness A particularly challenging situation for story splitting is where there is a large technical job to do – for example replacing one database with another, or implementing a major internal redesign. Teams often divide the work technically and then look for chunks which still have value, … |
| 53 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | We recently worked with a team that was struggling to describe acceptance criteria for a user story that was mostly about splitting a background process into two. The story was perceived to be of value because the business stakeholders had asked for it. It was a strange situation, because the story was purely … |
| 54 | Cohn, User Stories Applied (2004) | The story is too large to fit into the iteration.1. The story contains both high and low sub-stories, and the customer only wants the high priority sub-stories done during the coming iteration. 2. Neither of these cases is representative of a problem. Many projects and teams will have occasions when it will be useful … |
| 55 | Cohn, User Stories Applied (2004) | 14.3 What could cause the customer to have a difficult time prioritizing stories? Answer: The stories may be the wrong size (either too large or too small) or the stories may not clearly express value to users or customers. 14.4 How do you know if you are splitting too many stories? Answer: You have to rely on your … |
| 56 | Cohn, User Stories Applied (2004) | splitting stories for other reasons, you may be doing it too often. < Day Day Up > < Day Day Up > Chapter 15, Using Stories with Scrum 15.1 Describe the differences between an incremental and an iterative process. Answer: An iterative process is one that makes progress through successive refinement. An incremental … |
| 57 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | Make sure to communicate upfront what you are doing and manage stakeholder expectations. Extracting basic utility is effectively the exact opposite of The Skeleton On Crutches, sacrificing usability for the sake of shipping something quickly. About ten years ago, Gojko led a development team that built a slot machine … |
| 58 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | Both examples illustrate how having to make frequent deliveries makes teams focus on short-term wins and neglect long-term risks, until the work becomes completely unsustainable. This is caused not only by the pressure to deliver but also by doing progress reports mostly by tracking activity. Prioritisation is a big … |

---
## store-phase-4-refinement-5: D5: How Planning Poker / relative estimation works (reference stories, scale, roles, convergence, too-big stories, recording, pitfalls)

- asked 2026-10-04 · notebook "The Product - Business Design" · conversation `0e899011-612e-4b69-8b7b-8e7911f70f4a`
- Sources: Olsen, The Lean Product Playbook; Cohn, User Stories Applied (2004); Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014); LeMay, Product Management in Practice (2022); Bland, Testing Business Ideas (2019); Patton, User Story Mapping

**Question**

> D5: How does Planning Poker / relative story point estimation work in the sources? Cover: the reference story or baseline stories used for comparison, the card scale and why it is non-linear, who estimates and who only answers questions, how the team handles disagreement and when estimates count as converged, what to do when a story is too big or too uncertain to estimate (spike, split), what is recorded afterwards, and which mistakes or pitfalls the sources name (e.g. converting points to hours, anchoring, false precision). Please cite the sources.

**Answer** (verbatim, citation markers resolve in the table below)

**Planning Poker** (and relative story point estimation in general) is designed to generate fast, realistic estimates as a team while avoiding common human biases in estimation [1-3]. Here is how the process works across the sources:

---

##### 1. Reference Stories and Baseline Stories
Relative estimation relies on comparing new work against existing, well-understood baseline stories rather than attempting to calculate absolute hours from scratch [1, 4-8]:
* **Reference Sets:** Teams establish a reference set of user stories of known sizes (e.g., a standard 1-point story or baseline examples for each point level/T-shirt size) to serve as benchmarks [1].
* **Triangulation:** As new stories are estimated, the team **triangulates** them by evaluating their relative size against existing stories [6, 8]. For instance, a 3-point story should be clearly larger than a 2-point story and smaller than a 4- or 5-point story [6, 9].
* **Visual Triangulation:** A common technique is pinning story cards under vertical columns on a wall labeled by point values, quickly checking whether a newly estimated story is "about the same" as others in that column [9, 10]. Teams using simpler heuristics can select representative stories for bucketing into categories like Small/Big/Unknown or Goldilocks (Too Big, Too Small, Just Right) [11].

---

##### 2. The Card Scale and Non-Linearity
Planning Poker uses specific, constrained card scales rather than continuous numbers [4, 12]:
* **Common Scales:** The most widespread scale is the **Fibonacci series** (\\(1, 2, 3, 5, 8, 13, \dots\\)) [1, 4] or a **modified sequence** (\\(½, 1, 2, 3, 5, 8, 13, 20, 40, 80\\)) [12]. Other teams use **powers of two** (\\(1, 2, 4, 8, 16\\)) or **T-shirt sizes** (\\(S, M, L, XL\\)) [11, 13, 14].
* **Why the Scale Is Non-Linear:**
  1. **Forces Distinct Choices:** Non-linear gaps force estimators to make clear, deliberate distinctions rather than agonizing over minor variations [4].
  2. **Reflects Uncertainty:** Precision decreases as story size increases—as scope grows, our knowledge about the work becomes much less precise [12, 15, 16].
  3. **Eliminates False Precision:** Debating whether a large feature is \\(7\\) or \\(8\\) points implies an accuracy the team does not possess [16]. Constraining options forces the team to decide between \\(5\\) or \\(8\\) (or \\(40\\) vs. \\(80\\) for epics) without getting bogged down in meaningless granular debates [12, 16].

---

##### 3. Roles: Who Estimates vs. Who Answers Questions
Planning Poker establishes strict boundaries between roles to protect estimate integrity [2, 3, 17]:
* **The Development Team (Who Estimates):** Only the developers, programmers, and technical delivery team members who will implement and test the software vote on estimates [1-4, 17]. Story estimates are owned **collectively by the team**, not by individual developers [2, 3, 8].
* **The Product Owner / Customer (Who Only Answers Questions):**
  * The Product Owner or customer presents the story, clarifies details, and answers domain questions as developers ask them [18-23].
  * The Product Owner is **strictly forbidden from estimating** because they are not writing the code [2, 3, 17].
  * The Product Owner must **not gasp, editorialize, or express shock** at high estimates [2, 3, 17]. If an estimate is higher than expected, the PO should offer clarification on a simpler intended scope (e.g., *"I see how that's 10 points as described, but all I really want is..."*) [17].

---

##### 4. Handling Disagreement and Convergence
* **Simultaneous Card Reveal:** After discussing a story, each participant privately selects a card and all estimators reveal their cards simultaneously [1, 21, 23]. This prevents groupthink and stops people from anchoring on the first number spoken [1, 21, 24].
* **Resolving Disagreements:** If estimates differ significantly, the **highest and lowest estimators explain their rationale** [1, 21]. The high estimator might point out hidden technical complexity or setup tasks, while the low estimator might share a simpler technical shortcut [25, 26].
* **Re-voting and Convergence:** The team briefly discusses the new perspectives for a few minutes, asks the Product Owner for any needed clarifications, and votes again [1, 26]. 
* **When Estimates Count as Converged:**
  * Convergence usually occurs within **2 to 3 rounds** [27].
  * Absolute identical consensus across every participant is **not required** [28]. If three developers vote \\(4\\) and one votes \\(3\\), the facilitator simply asks if the low estimator is comfortable agreeing to \\(4\\) [28]. The goal is **reasonableness**, not wasting time negotiating tiny differences [28].

---

##### 5. Overly Large or Uncertain Stories (Spikes & Splitting)
When a story cannot be estimated, teams apply two core remedies based on the root cause [13, 29-31]:
* **Story Too Big (Epics / Compound Stories):** If a story has too large a scope to fit into a single iteration, it must be **disaggregated / split** into smaller constituent user stories (e.g., separating basic search from advanced search, or card editing from address editing) [13, 20, 32, 33].
* **High Uncertainty / Technical Unknowns (Spikes):**
  * When developers lack domain or technical knowledge, they create a **spike**—an Extreme Programming (XP) technique defined as a brief, time-boxed research program or prototype to evaluate feasibility [29, 31, 34].
  * The unestimatable story is split into two separate stories: (1) a **time-boxed investigative spike** to explore the problem, and (2) a **feature story** to implement the actual functionality [29, 31].
  * **Iteration Separation:** Ideally, the investigative spike is scheduled in one iteration and the implementation story is deferred to a subsequent iteration [35, 36]. This allows the Product Owner to prioritize the research independently without introducing uncertainty into the current sprint [35, 36].
  * Teams can also time-box analysis discussions (e.g., two 20-minute blocks); if agreement remains out of reach, the PO either splits the story or removes it for offline analysis [37].

---

##### 6. What Is Recorded Afterwards
* **Story Points / Sizing:** The agreed point estimate is recorded directly on the story card or entered into the backlog management tracking tool [26, 38-40].
* **Context & Clarifications:** Key notes, assumptions, or specific acceptance criteria surfaced during the estimation conversation are jotted on the card to serve as reminders for implementation [26, 38, 41].

---

##### 7. Pitfalls and Mistakes Named in the Sources
The sources flag several major mistakes when using story points and Planning Poker:

1. **Converting Points Directly to Hours:** Story points are relative measures of effort, complexity, or ideal work—not clock hours [4, 14, 42]. Converting points directly to hours or attempting to track velocity in actual hours spent distorts the purpose of relative sizing [43-46].
2. **Anchoring & Groupthink:** Allowing senior stakeholders or vocal team members to speak their numbers first anchors the group [24, 47]. Planning Poker's simultaneous reveal explicitly guards against this bias [1, 21].
3. **False Precision:**
   * Arguing over small differences on large estimates (e.g., debating \\(7\\) vs. \\(8\\) or \\(79\\) vs. \\(80\\)) [12, 16].
   * Reporting team velocity with fractional decimals (e.g., \\(43.8\\) points) [48].
   * Treating story point totals as precise statistical forecasts without accounting for confidence intervals [43].
4. **Cross-Team Velocity Comparisons:** Comparing story point velocity between different teams is a major management trap [49, 50]. Story point definitions and scales are relative to each specific team [50].
5. **Post-Hoc Point Adjustments:** Changing the point value of a completed story after the sprint because it took more or fewer hours than expected [45, 51]. Velocity calculations must always use the original estimated points [45, 51].
6. **Gaming / Cheating Metrics:** Pressuring teams to artificially increase story point velocity leads to gaming (e.g., inflating point values, skipping testing, or rushing incomplete code into production, resulting in hundreds of defects) [52].
7. **Using Sizing as Rigid Commitments:** Summing story point estimates months in advance to lock in fixed delivery dates creates rigid anchors that destroy the adaptive benefits of Agile development [43, 44, 47].

---

🎯 Would you like to explore how to calculate and use team velocity for release planning, or examine specific patterns for splitting large user stories into smaller estimatable pieces?

**Citations**

| # | Source | Cited passage |
|---|---|---|
| 1 | Olsen, The Lean Product Playbook | Scrum teams use several techniques to reduce their story estimation error and achieve a more stable velocity. Teams will often discuss and estimate story points together, versus having only one team member size a given story. Some teams develop a reference set of user stories of different known sizes. Comparing … |
| 2 | Cohn, User Stories Applied (2004) | involved the better. The customer participates while the programmers estimate, but she isn't allowed to contribute her personal estimates or editorialize when she hears an estimate she disapproves of. < Day Day Up > < Day Day Up > Estimating My preferred estimation approach is derived from the Wideband Delphi approach … |
| 3 | Cohn, User Stories Applied (2004) | overall expected effort in a project, we will eventually need to convert estimates into time. Starting with ideal time makes that conversion a little simpler than starting with an entirely nebulous unit. < Day Day Up > < Day Day Up > Estimate as a Team Story estimates need to be owned collectively by the team. Later, … |
| 4 | Olsen, The Lean Product Playbook | See Figure 12.1 for a visual depiction of the flow of work, meetings, and deliverables in Scrum. At the start of each sprint, the team holds a sprint planning meeting where they decide which stories they plan to accomplish in the iteration and move those stories from the product backlog to the sprint backlog. Part of … |
| 5 | Cohn, User Stories Applied (2004) | story relative to other stories. So, a story estimated at four story points is expected to take twice as long as a story estimated at two story points. The release plan is built by assigning stories to the iterations in the release. The developers state their expected velocity, which is the number of story points they … |
| 6 | Cohn, User Stories Applied (2004) | it. < Day Day Up > < Day Day Up > Triangulate After the first few estimates have been made, it becomes possible (and necessary) to triangulate the estimates. Triangulating an estimate refers to estimating a story based on its relationship to one or more other stories. Suppose a story is estimated at four story points. … |
| 7 | Cohn, User Stories Applied (2004) | one that: allows us to change our mind whenever we have new information about a story works for both epics and smaller stories doesn't take a lot of time provides useful information about our progress and the work remaining is tolerant of imprecision in the estimates can be used to plan releases < Day Day Up > < Day … |
| 8 | Cohn, User Stories Applied (2004) | < Day Day Up > < Day Day Up > Summary Estimate stories in story points, which are relative estimates of the complexity, effort or duration of a story. Estimating stories needs to be done by the team, and the estimates are owned by the team rather than individuals. Triangulate an estimate by comparing it to other … |
| 9 | Cohn, User Stories Applied (2004) | that it is roughly larger than the two-point story yet smaller than the four-point story. None of this is exact, but triangulation is an effective means for a team to verify that they aren't gradually altering the meaning of a story point. A good way to triangulate is to pin story cards to the wall based on their … |
| 10 | Cohn, User Stories Applied (2004) | estimated, pin it in the appropriate location. Very quickly compare the newly-estimated story to others in the column to see if it is "about the same." Figure 8.1. Pin story cards to the wall to facilitate triangulation. < Day Day Up > < Day Day Up > Using Story Points At the end of an iteration the team counts the … |
| 11 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | How to make it work One good idea is to select several representative stories to serve as a reference, and compare any new stories to them. Again, avoid numerical labels. For example, group stories into small, big and unknown. Many teams use T-shirt sizes, which is also a good approach as long as the number of choices … |
| 12 | Cohn, User Stories Applied (2004) | values such as: ½, 1, 2, 3, 5, 8, 13, 20, 40, 80 This is appealing because it reflects the truth that as estimates get larger, we know less about them. If the team has an epic to consider they'll have to decide whether it's a 40 or an 80, but they won't have to think about whether it's a 79 or an 80. < Day Day Up > < … |
| 13 | Olsen, The Lean Product Playbook | Build Your Product Using Agile Development 207 FIGURE 12.1 Scrum Framework estimated values is the “powers of two” scale: 1, 2, 4, 8, 16, and so forth. T-shirt sizing, another popular technique, uses sizes such as small, medium, large, and extra large to estimate the scope of stories. Stories with points at the high … |
| 14 | Olsen, The Lean Product Playbook | If story points seem a bit abstract to you, it’s because they are—at least at first. The goal is to determine a team’s capacity for work by tracking how many story points they complete each iteration—which is called velocity. Once a team has calculated their average velocity, they can use that number of story points … |
| 15 | Cohn, User Stories Applied (2004) | pair days or ideal individual programmer days, and any differences will be reflected in the velocity. Precision Decreases as Story Size Increases A problem with estimating in story points is that differences between some numbers can be hard to justify. For example, suppose the developers are considering a story and … |
| 16 | Cohn, User Stories Applied (2004) | differences of that magnitude. However, now suppose the developers are arguing over whether a story should be seven or eight story points. In most cases a one point difference between numbers that large is too small to be discussed with any relevance. Arguing about whether a story is worth seven or eight story points … |
| 17 | Cohn, User Stories Applied (2004) | of line (either too high or too low) she may need to provide some guidance or clarification. For example, she may offer something along the lines of "I can see how that might be ten story points as you're describing it but I think I'm asking for something much, much simpler. All I really want is …" < Day Day Up > < … |
| 18 | Cohn, User Stories Applied (2004) | estimates. Here's how it works: First, gather together the customer and the developers who will participate in creating the estimates. Bring along the story cards and a stack of additional blank note cards. (Bring some blank cards even if you're maintaining the story descriptions electronically.) Distribute a handful … |
| 19 | Cohn, User Stories Applied (2004) | about the difficulty of programming a story, the customer may change her mind about the priority of a story. The iteration planning meeting is the perfect time for the customer to express these priority changes to the team. To start the meeting, the customer starts with her highest priority story and reads it to the … |
| 20 | Cohn, User Stories Applied (2004) | impact on the estimate, it's worth asking her. Naturally Lori says she wants both. She wants a basic search mode where the value in one field searches both author and title. She then wants an advanced search screen where any or all of these fields can be used in combination. Even with both search modes the story isn't … |
| 21 | Cohn, User Stories Applied (2004) | others. If the team has defined a story point as a day of ideal work, the developers think about how many ideal days the story will take to complete. If, instead, the team has defined a story point as, for example, the complexity of the story then the estimate is of the perceived complexity of the story. When everyone … |
| 22 | Cohn, User Stories Applied (2004) | be accurate at the end of each iteration. If there was any question about this the team could have asked the customer. Guidelines Because stories are already fairly small it is not necessary to set very precise guidelines around the desired size of a task. Use these guidelines when disaggregating stories into tasks: … |
| 23 | Cohn, User Stories Applied (2004) | story cards and a few dozen blank cards. The programmers talk about 19.1, clarify a few details on it by asking questions of Lori, and then each programmer writes his or her estimate on an index card. When everyone is done, each programmer holds his or her card up so everyone can see it. They've written: Rafe: 1 Jay: … |
| 24 | LeMay, Product Management in Practice (2022) | What are the goals of this particular Agile ceremony or ritual? On a scale of 1–10, to what extent do we think that this ceremony or ritual is achieving its goals? I’ve often deployed that second question “scrum poker” style, asking everybody on my team to privately write down their answer and then share their answer … |
| 25 | Cohn, User Stories Applied (2004) | estimators explain their estimates. It's important that this does not come across as attacking those estimators. Rather, you want to learn what it is they were thinking about. As an example, the high estimator may say, "Well, to test this story we're going to need to create a mock database object and that might take … |
| 26 | Cohn, User Stories Applied (2004) | database. Also, I didn't think about needing more data—maybe that will be a problem." At this point the group discusses it for up to a few minutes. Other estimators will undoubtedly have opinions on whatever reasons the high and low estimators were at the extremes. The customer clarifies issues as they come up. A note … |
| 27 | Cohn, User Stories Applied (2004) | estimate, the cards are again displayed. In many cases the estimates will already converge by the second round. But, if they have not, repeat the process of having the high and low estimators explain the thinking behind their estimates. In many cases the high and low estimators will not be the same as in the first … |
| 28 | Cohn, User Stories Applied (2004) | continue the process as long as estimates are moving closer together. It isn't necessary that everyone in the room turn over a card with exactly the same estimate written down. If I'm involved in an estimation meeting, and on the second round four estimators tell me 4, 4, 4, and 3 story points, I will ask the low … |
| 29 | Cohn, User Stories Applied (2004) | estimate the task. The solution in this case is to send one or more developers on what Extreme Programming calls a spike, which is a brief experiment to learn about an area of the application. During the spike the developers learn just enough that they can estimate the task. The spike itself is always given a defined … |
| 30 | Cohn, User Stories Applied (2004) | The story is too big.3. First, the developers may lack domain knowledge. If the developers do not understand a story as it is written, they should discuss it with the customer who wrote the story. Again, it's not necessary to understand all the details about a story, but the developers need to have a general … |
| 31 | Cohn, User Stories Applied (2004) | timebox around the investigative story, or spike. Even if the story cannot be estimated with any reasonable accuracy, it is still possible to define the maximum amount of time that will be spent learning. Complex stories are also common when developing new or extending known algorithms. One team in a biotech company … |
| 32 | Cohn, User Stories Applied (2004) | Finally, the developers may not be able to estimate a story if it is too big. For example, for the BigMoneyJobs website, the story "A Job Seeker can find a job" is too large. In order to estimate it the developers will need to disaggregate it into smaller, constituent stories. A Lack of Domain Knowledge As an example … |
| 33 | Cohn, User Stories Applied (2004) | flexibility during release planning and it allows the customer to prioritize work at a much finer level. In our case, for example, Lori may think it is critical for users to edit their credit cards but she may be willing to wait a few iterations for the ability for users to change addresses. The original story is … |
| 34 | Bland, Testing Business Ideas (2019) | P O P -U P S T O R E S IM U LA T IO N 306 COST SETUP TIME CAPABILITIES Product / Technology / Data EVIDENCE STRENGTH RUN TIME DESIRABILITY · FEASIBILITY · VIABILITY The Extreme Programming Spike is ideal for quickly evaluating whether or not your solution is feasible, usually with software. The Extreme Programming … |
| 35 | Cohn, User Stories Applied (2004) | product. In situations like this one it is difficult to estimate how long the research story will take. Consider Putting the Spike in a Different Iteration When possible, it works well to put the investigative story in one iteration and the other stories in one or more subsequent iterations. Normally, only the … |
| 36 | Cohn, User Stories Applied (2004) | about how much can be accomplished in that iteration. The key benefit of breaking out a story that cannot be estimated is that it allows the customer to prioritize the research separately from the new functionality. If the customer has only the complex story to prioritize ("Add novel extensions to standard expectation … |
| 37 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | For example, a team we recently worked with created a policy to limit the total discussion to three hours, and within that time-box, limit each story to two diverge and merge cycles of 20 minutes each. Allowing for a small break during the three hours, this effectively allows the team to discuss between three and six … |
| 38 | Patton, User Story Mapping | As you begin to discuss stories, you’ll add information that summarizes some of your discussions. That’ll include stuff like: Story number When you get a bunch of these or put them into a tracking system, this will help you find them—sort of like the Dewey Decimal System in a library. But, whatever you do, please … |
| 39 | Cohn, User Stories Applied (2004) | disagreement to the sequence, the customer wins. Every time. However, customers cannot prioritize without some information from the development team. Minimally, a customer needs to know approximately how long each story will take. Before the stories are prioritized, they have already been estimated and the estimates … |
| 40 | Cohn, User Stories Applied (2004) | already familiar with all likely searching options and is pretty confident about the direction they should go, which is why his estimate is so much lower. Everyone is asked to write down a new estimate. When they're down they again show their cards. This time the cards say: Rafe: 1 Jay: 1 Maria: 1 That was pretty … |
| 41 | Cohn, User Stories Applied (2004) | they become comfortable with the concept that story cards are reminders to talk later rather than formal commitments or descriptions of specific functionality. < Day Day Up > < Day Day Up > Estimatable It is important for developers to be able to estimate (or at least take a guess at) the size of a story or the amount … |
| 42 | Cohn, User Stories Applied (2004) | whatsoever—no meetings, no email, no phone calls, and so on). Another team may define a story point as an ideal week of work. Yet another team may define a story point as a measure of the complexity of the story. Because of the wide variety of meanings for story points, Joshua Kerievsky has suggested that story points … |
| 43 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | Calculating a long-term estimate based on stories assumes that all planned stories will be delivered and that nothing new will come up during delivery, which completely defeats the purpose of adaptive planning. Even where someone can correctly predict time-to-deliver for all stories, long-term estimates based on … |
| 44 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | Instead of using story points and velocity for capacity planning, try to manage capacity based on analysis time or number of stories. Estimate capacity based on rolling number of stories Teams who work in time-boxed iterations often use story points to calculate velocity, and then plan capacity based on velocity. … |
| 45 | Cohn, User Stories Applied (2004) | twelve-point story. Additionally, if you frequently find iterations finishing with many partially complete stories (even if they are all half-point stories), this may be a symptom of a lack of teamwork on the team. With an all–for–one approach the team will learn they are better off joining together to complete some … |
| 46 | Cohn, User Stories Applied (2004) | and those actually completed for each iteration. Don't try to predict trends in velocity after only one or two iterations. The number of actual hours spent completing a task or a story have no bearing on velocity. Post big, visible charts in common areas where everyone can see them. A cumulative story point chart (as … |
| 47 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | Avoid using numeric story sizes Story sizing is one of those universal causes of heated debates in online forums, and a stumbling block for many inexperienced teams. Story sizing is useful for one purpose: deciding whether a story is too big to implement or small enough to get fast feedback. Almost any story sizing … |
| 48 | Cohn, User Stories Applied (2004) | natural difficulty of figuring out what percentage of a story is complete. Second, we don't want to imply a false precision to velocity by reporting it with fractional values like 43.8. Third, incomplete stories do not typically represent anything of value to users or customers. So, even though they may have been … |
| 49 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | Another typical problem is using velocity for long-term trend management, or for cross-team comparisons. Use this number only for capacity planning, and calculate it based on the rolling average of the previous few iterations. This number will change over time as the product matures and business opportunities change, … |
| 50 | Cohn, User Stories Applied (2004) | Your team's story points are not equivalent to my team's story points. A story your team estimates as worth three story points may be worth five to my team. When a story (possibly an epic) is disaggregated into its constituent stories, the sum of the estimates for the individual stories does not need to equal the … |
| 51 | Cohn, User Stories Applied (2004) | the iteration is complete, do not change the points the team earns for any story in the iteration. For example, suppose a story was estimated to be four story points but was much larger. After the fact, the team acknowledges they should have estimated it at seven points. This story contrbutes four points to the … |
| 52 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | Measuring capacity with story points is dangerous because it stimulates the wrong behaviour: cheating to achieve some arbitrary numeric targets. One of our clients worked with a large consultancy that had committed to increasing team productivity – of course measured in story points. As the process changed, the team … |

---
## store-phase-4-refinement-6: D1: How a Three Amigos refinement is prepared and run (attendees, preparation, agenda and time-box, outputs, postponing)

- asked 2026-10-04 · notebook "The Product - Business Design" · conversation `0c6566da-3bc7-47f6-a2f4-e4241513a184`
- Sources: Kelly, The Art of Agile Product Ownership (2019); Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014); Patton, User Story Mapping
- Note: Inline result re-entered by the extraction agent; answer text unchanged, cited passages of some references shortened (…) or trimmed to the passage parts used.

**Question**

> D1: How is a Three Amigos refinement meeting for a user story prepared and run, as the sources document it? Cover: who attends and how many people; what must be ready beforehand (story card, initial scenarios or examples, wireframes, prior discovery work); how long it takes and the agenda or time-box (including how many discussion rounds); what the outputs are and who writes them up; and under which conditions the sources say the conversation should be postponed, escalated to the whole team, or the story sent back because it is not ready. Please cite the sources.

**Answer** (verbatim, citation markers resolve in the table below)

Based on the provided sources, a **Three Amigos refinement meeting** (also referred to as a "Power of Three" or story workshop) is a structured, tactical collaboration designed to refine user stories right before development begins [1-3].

---

##### 1. Attendance & Group Size
* **Core Roles**: The meeting brings together three primary perspectives [2, 3]:
  1. **Business / Product / Analysis**: A Product Owner, Business Analyst, or UX designer who understands user needs, business goals, and the *why/what* of the story [4, 5].
  2. **Development**: A programmer/developer who understands the codebase, technical feasibility, and *how* the feature will be built [6, 7].
  3. **Testing**: A QA tester who brings a critical eye, applies testing heuristics, and plays the "What-About" game to spot potential failure modes [6, 7].
* **Group Size**: Ideally **3 to 5 people** ("dinner conversation sized") to keep discussions productive and avoid "design by committee" or unproductive crowd dynamics [7-9].
* **4 or 5 Amigos**: If specific expertise is required—such as a Database Administrator (DBA) or a specialized business domain expert—expanding to 4 or 5 participants is completely acceptable as long as all key perspectives are represented [2].
* **Hands-on Participants**: The meeting **must include the actual developers and testers** who will build and test the story, rather than arbitrary stand-ins, to prevent knowledge transfer issues and repeated discussions during iteration planning [10]. Teams may also allow team members to opt in to sessions [11, 12].

---

##### 2. Preparation & Prerequisites
Before holding a Three Amigos session, the following assets and conditions should be ready:
* **Story Card**: A basic written story card or backlog item serving as a placeholder for the conversation [1, 13].
* **Initial Scenarios or Examples**: The business representative or analyst prepares a few initial working scenarios illustrating how they envision the story functioning [14].
* **Prior Discovery Work & UI Assets**: Context from earlier product discovery, user personas, journey maps, architectural sketches, wireframes, or low-fidelity UI mockups/prototypes [5, 15, 16].
* **Scheduling & Bottleneck Planning**: If key roles (such as a single business representative) are bottlenecks, sessions should be scheduled upfront around their availability (e.g., dedicated 1-hour slots per pair each week) [17] or planned approximately one iteration/cycle ahead [18].

---

##### 3. Duration, Agenda, & Time-Boxing
* **Timing & Cadence**: Sessions occur immediately before a story is developed or are scheduled one cycle ahead to perform first-pass analysis [1, 18].
* **Typical Agenda**:
  1. **Story & Scenario Introduction**: The analyst or business representative introduces the story card and presents initial success scenarios [14].
  2. **Technical Feasibility Probe**: The developer evaluates the story against the existing architecture, probing for technical risks, functional gaps, and inconsistencies [14].
  3. **Testing Heuristics & Boundary Checks**: The tester considers how to test the story, introducing edge cases and unconsidered scenarios [6, 14].
* **Discussion Rounds (Diverge & Merge Cycles)**:
  * Discussions are often run using **diverge and merge cycles** [19].
  * **Diverge phase**: Participants or sub-groups explore the story for **10 to 15 minutes** (or up to 20 minutes), capturing their understanding using 3 to 4 simple, concrete examples on whiteboards or flipcharts [20-22].
  * **Merge phase**: Groups reconvene to compare examples, highlighting formatting differences, mental model misalignments, and open question marks [19, 20].
* **Time-Box Rules**:
  * Individual story discussions are strict time-boxes (e.g., pausing after **30 minutes**) [23].
  * A story is typically limited to **two diverge and merge cycles** (e.g., two 20-minute blocks) [21].
  * Overall refinement sessions can be capped at **3 hours**, allowing a team to discuss between 3 and 6 stories for an upcoming two-week iteration [21].

---

##### 4. Outputs & Documentation
* **Primary Deliverables**:
  1. **Agreed Acceptance Criteria / Tests**: Clear, agreed-upon conditions and confirmation criteria defining when the story is complete [1, 4, 14, 24, 25].
  2. **Right-Sized User Stories**: Larger items split into small development stories that take **1 to 3 days** to build and test [24].
  3. **Concrete Examples & Models**: Whiteboard sketches, domain modeling notes, identified boundary conditions, and recorded open questions [14, 21, 26].
* **Who Writes Them Up**:
  * **Whiteboard / Flipchart Sessions**: One designated amigo is responsible for capturing the meeting notes and sharing the results with the wider team [26].
  * **Screen-Sharing / Monitor Sessions**: Participants enter meeting notes and acceptance criteria directly into digital boards or tracking tools in real time during the conversation [26].

---

##### 5. Conditions for Postponement, Escalation, or Rejection
* **Escalate to Whole Team**: If the three amigos discover that a story involves a **major impact on the current architecture** or a **globally significant feature change**, the smaller session should be paused and the discussion escalated to the entire delivery team [18].
* **Postpone / Send Back for Detailed Analysis**:
  * If after 30 minutes or two diverge-merge cycles (approx. 40 minutes) the story is **still too vague, complex, or uncertain** for the team to agree on scope or business risk [21, 23].
  * If the story requires extensive business clarification or coordination with external stakeholders/third-party teams that cannot be resolved in the session [18, 21].
* **Split the Story**:
  * If main scenarios are clear but exception cases require further business clarification, the story is **split** so the clear portion can proceed immediately while exceptions are sent back for clarification [21].
  * If the story is too large to complete in a single iteration, it is split into smaller, "right-sized" independent slices [21, 23, 24].

---

💡 *Would you like to draft a standardized "Three Amigos Refinement Checklist" or template based on these guidelines to share with your delivery teams?*

**Citations**

| # | Source | Cited passage |
|---|---|---|
| 1 | Kelly, The Art of Agile Product Ownership (2019) | As I never tire of repeating: a story is a placeholder for a conversation. No matter how imperfect a story is, when it comes to be developed, a conversation needs to be had. Some teams formalize this as a “3-Amigos” meeting—alternatively this is sometimes called a “Power of Three.” 3-Amigos occurs immediately before a … |
| 2 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | A common mistake in this situation is to delegate the task of analysing a story to just one person. Instead, create small conversations that involve at least one person representing each of the development, testing and analysis roles. A common name for such conversations, which Gojko used also in Specification by … |
| 3 | Patton, User Story Mapping | The Three Amigos ¡Three Amigos! is the name of a mediocre 1986 western comedy starring Steve Martin, Chevy Chase, and Martin Short. What does this film have to do with Agile software development and stories? There’s a more tactical triad of collaborators that’s valuable during story workshops. … |
| 4 | Kelly, The Art of Agile Product Ownership (2019) | A BA may work with Programmers and Testers too: Using the BA’s knowledge of the business to write acceptance criteria and tests; perhaps taking part in “3-Amigos” sessions or pairing with a developer as they practice BDD … |
| 5 | Patton, User Story Mapping | And, of course, we’ll need someone who understands what we’re building, who it’s for, and why we’re building it, so we’ll need a member of that core product discovery team. That person is the second amigo. At this stage we’re often not introducing a new feature idea. We likely already did that back in discovery. Now … |
| 6 | Patton, User Story Mapping | During this last best conversation, we really need to consider lots of details and alternatives for implementation, so we’ll need a developer from the team who’ll build the software—ideally, one of the developers who will actually work on it. For this small piece of software to be considered done, it’ll need to be … |
| 7 | Patton, User Story Mapping | Keep the workshop small to stay productive. Three to five people is a good size. Include the right people. For this conversation to be effective, include: Someone who understands users and how the user interface could or should work—often a product owner, user experience professional, or business analyst One or two … |
| 8 | Patton, User Story Mapping | There’s a nasty anti-pattern I often see here. Some think that since anyone in a team might pick up the story and do work on it, everyone on the team should be involved in every conversation. Perhaps you work at this company. You’ll know it because you’ll hear lots of people complaining that there are way too many … |
| 9 | Patton, User Story Mapping | As you might recall from Chapter 11, story workshops are small, productive conversations where the right people work together to tell the stories one last time, and in the process make all the tough decisions about exactly what they’ll choose to build. … That’s usually three to five people. |
| 10 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | How to make it work Make sure to involve people who will actually work on delivering the story. A common mistake teams make is to delegate the three-amigos analysis to whoever has time, so the people who actually end up delivering the software do not participate in the discussions. This creates problems for knowledge … |
| 11 | Patton, User Story Mapping | The problem isn’t that story conversations are hard. Well, actually they can be pretty hard at times. But all conversations are made tougher by trying to include too many people. If many of those people aren’t interested or motivated to participate, you’re doomed. … Allow team members to opt in to these conversations. … |
| 12 | Patton, User Story Mapping | Story Workshop Recipe Use a story workshop to refine understanding and define specifically what the development team will build. The workshop is a product conversation—supported by lots of pictures and data—that helps the team make decisions and arrive at confirmation: the acceptance criteria for what we’ll choose to … |
| 13 | Patton, User Story Mapping | If you’re not getting together to have rich discussions about your stories, then you’re not really using stories. Ron Jeffries and the 3 Cs … Card Write what you’d like to see in the software on a bunch of index cards. Conversation Get together and have a rich conversation about what software to build. Confirmation … |
| 14 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | The typical way to run a three-amigo meeting is to start with the analyst or business representative introducing a story and presenting a few initial scenarios of how they would see a story working. Then the developer considers the story in the context of the existing infrastructure and probes for potential functional … |
| 15 | Kelly, The Art of Agile Product Ownership (2019) | … George was glad for a Friday where he got to spend time with the team, hold some 3-Amigos sessions to flesh out acceptance criteria, review some screen changes, do some tests, update his product backlog and quarter plan … |
| 16 | Patton, User Story Mapping | UI prototypes Architectural and technical design sketches Architectural or technical prototypes Lots of collaboration with team members, users, customers, stakeholders, and subject matter experts Minimize and plan … Discovery Is for Building Shared Understanding |
| 17 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | For teams where one of the roles is a clear bottleneck (for example there is only one business representative), it’s useful to plan three-amigo conversations upfront around the availability of that role. For example, each pair of developers and testers gets a one-hour slot with the business representative each Monday. … |
| 18 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | It’s important to recognise when the entire team needs to know about some important decision or participate in a discussion. If the three amigos end up discussing a major impact on the current architecture or some globally significant feature change, then it might be worth pausing the smaller discussion and continuing … |
| 19 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | Our preferred way of facilitating story discussions for teams of 10 to 20 people is to split the team into several smaller groups, get groups to capture their understanding of a story using examples, then bring the groups together to compare results. … After several cycles of splitting and bringing groups together, … |
| 20 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | To get the best results, communicate that the purpose of the diverge part is not to find all the answers, but to find good questions quickly. Time-box diverge cycles to about 10 to 15 minutes and bring the team together to discuss the results. In particular, focus on the differences among the groups: differences in … |
| 21 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | For example, a team we recently worked with created a policy to limit the total discussion to three hours, and within that time-box, limit each story to two diverge and merge cycles of 20 minutes each. Allowing for a small break during the three hours, this effectively allows the team to discuss between three and six … |
| 22 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | Finally, diverge and merge cycles help to avoid reliance on a single source of all knowledge. … Get groups to use concrete examples to capture their understanding and write those examples down on a whiteboard or a flipchart. … We ask groups to start writing down three to four very simple examples as soon as possible. … |
| 23 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | How to make it work Time-box story discussions to avoid a single complex item taking too long. For example, pause a discussion after 30 minutes and see if it’s worth continuing with the analysis or not. If the story is too complex, perhaps the examples discussed in the first half hour are a good initial slice. If you … |
| 24 | Patton, User Story Mapping | This group will work through the details and agree on specific acceptance criteria for the story. It’s out of this conversation that we’ll have our best estimate of how long it will take to build and test the software. And it’s often in this conversation that we’ll make decisions to split the story into smaller, … |
| 25 | Patton, User Story Mapping | … So, when we feel like we’re converging on a good solution, we’ll need to start focusing on the answer to these questions: If we build what we agree to, what will we check to see that we’re done? The answer to this question is usually a short list of things to check. This list is often called acceptance criteria, or … |
| 26 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | Three-amigo conversations are best with a flipchart or a whiteboard, but they can also be very effective around a monitor, or even using screen-sharing remotely. If you organise conversations with a flipchart, one of the three amigos is responsible for writing up the results of the conversation and sharing them with … |

---
