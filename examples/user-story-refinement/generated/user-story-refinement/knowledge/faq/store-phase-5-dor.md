# FAQ: store-phase-5-dor

Notebook answers recorded verbatim with their citations. Distilled guidance lives
in the references; this file is the audit trail behind it.

---
## store-phase-5-dor-1: What is the remedy when a story fails a Definition of Ready criterion (INVEST, role, solution neutrality)?

- asked 2026-10-04 · notebook "The Product - Business Design" · conversation `2e9d829d-feab-4c5a-8145-163579f3fad6`
- Sources: Cohn, User Stories Applied (2004); Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014); Olsen, The Lean Product Playbook; Richter, The Product Manager's Playbook (2023); Klein, UX for Lean Startups
- Note: cited_text passages trimmed to about 600 characters by the logging worker; the FAQ table shortens them to 320 anyway.

**Question**

> According to the sources, what is the remedy when a user story fails one of the readiness criteria (not independent, not negotiable, not estimatable, too large, not testable, no concrete role, solution-prescribing)? Give one remedy per failed criterion, so that a Definition of Ready check can say what to do next. Please cite the sources.

**Answer** (verbatim, citation markers resolve in the table below)

When a user story fails a **Definition of Ready (DoR)** check, the sources recommend specific remedies to restore quality and clarity before development begins:

1. **Not Independent**: **Combine or re-split vertically.** If interdependencies exist because stories were split along technical layers (e.g., database vs. UI), combine small interdependent stories or re-split them as a vertical **"slice of the cake"** that delivers end-to-end functionality across all layers [1-4].
2. **Not Negotiable**: **Reframe as an invitation to converse.** Strip out rigid specifications or UI assumptions, treating the story card as a placeholder and promise for ongoing collaboration rather than a fixed contractual contract [5-9].
3. **Not Estimatable**: **Run a time-boxed spike.** When developers lack domain or technical knowledge, split the story into a time-limited research/investigative "learning" story (spike) to gather necessary context, followed by the functional "earning" story once estimated [10-13].
4. **Too Large**: **Disaggregate into smaller user stories.** Break compound or complex epics down into smaller, atomic constituent stories focused on smaller increments of user value [2, 14, 15].
5. **Not Testable**: **Define quantitative acceptance criteria.** Replace vague descriptions (e.g., "easy to use") with specific, measurable acceptance tests or convert nonfunctional system parameters into testable **constraint cards** [14, 16-19].
6. **No Concrete Role**: **Conduct user role modeling.** Replace generic placeholders like *"As a user"* with specific customer segments or personas (e.g., *"As a teacher"*) to clarify target needs and eliminate scope creep [20-23].
7. **Solution-Prescribing**: **Separate the goal from the implementation.** Rephrase the story to emphasize the user's business goal/need (e.g., the *"In order to..."* clause), keeping UI and technology assumptions out so the delivery team can propose multiple solution options [24-29].

---

📋 Would you like me to create a printable **Definition of Ready Checklist & Action Sheet** (PDF) based on these remedies for your team?

**Citations**

| # | Source | Cited passage |
|---|---|---|
| 1 | Cohn, User Stories Applied (2004) | Chapter 2. Writing Stories In this chapter we turn our attention to writing the stories. To create good stories we focus on six attributes. A good story is: Independent Negotiable Valuable to users or customers Estimatable Small Testable Bill Wake, author of Extreme Programming Explored and Refactoring Workbook, has … |
| 2 | Cohn, User Stories Applied (2004) | simply too large to fit in the current iteration and must be split. The developers may want to split it along technical boundaries, such as: A Job Seeker can fill out a resume form. Information on a resume form is written to the database. In this case, one story would be done in the current iteration while the other … |
| 3 | Cohn, User Stories Applied (2004) | application could conceivably be released for use with only partial functionality as long as the functionality that is included in the release slices all the way through the system. < Day Day Up > < Day Day Up > Write Closed Stories Soren Lauesen (2002) introduces the idea of closure for tasks in his compendium of … |
| 4 | Cohn, User Stories Applied (2004) | have been inappropriately split. If you suspect that stories are too small, the easy solution is to simply combine the interdependent stories into one. If, instead, the stories appear for all other purposes to be appropriately sized, then look at how the interdependent stories have been separated. Chapter 7, … |
| 5 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | User stories imply a completely different model: requirements by collaboration. Hand-overs are replaced by frequent involvement and discussions. When domain and technical knowledge is spread among different people, a discussion between business stakeholders and delivery teams often leads to good questions, options and … |
| 6 | Cohn, User Stories Applied (2004) | developed correctly. Story Card 1.2. A story card with a note. < Day Day Up > < Day Day Up > "How Long Does It Have to Be?" I was the kid in high school literature classes who always asked, "How long does it have to be?" whenever we were assigned to write a paper. The teachers never liked the question but I still … |
| 7 | Cohn, User Stories Applied (2004) | they become comfortable with the concept that story cards are reminders to talk later rather than formal commitments or descriptions of specific functionality. < Day Day Up > < Day Day Up > Estimatable It is important for developers to be able to estimate (or at least take a guess at) the size of a story or the amount … |
| 8 | Cohn, User Stories Applied (2004) | That is, have a conversation about the details at the point when the details become important. There's nothing wrong with making a few annotations on a story card based on a discussion, as shown in Story Card 1.2. However, the conversation is the key, not the note on the story card. Neither the developers nor the … |
| 9 | Cohn, User Stories Applied (2004) | of functionality, the details of which are to be negotiated in a conversation between the customer and the development team. Because story cards are reminders to have a conversation rather than fully detailed requirements themselves, they do not need to include all relevant details. However, if at the time the story … |
| 10 | Cohn, User Stories Applied (2004) | The story is too big.3. First, the developers may lack domain knowledge. If the developers do not understand a story as it is written, they should discuss it with the customer who wrote the story. Again, it's not necessary to understand all the details about a story, but the developers need to have a general … |
| 11 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | A good way to deal with such situations is to explicitly split the research tasks into a separate story with a goal of its own. A helpful way of thinking about this is that a story should be either about learning or earning. Learning stories help stakeholders plan better. Earning stories help to deliver value to … |
| 12 | Cohn, User Stories Applied (2004) | estimate the task. The solution in this case is to send one or more developers on what Extreme Programming calls a spike, which is a brief experiment to learn about an area of the application. During the spike the developers learn just enough that they can estimate the task. The spike itself is always given a defined … |
| 13 | Cohn, User Stories Applied (2004) | investigative and one developing the new feature. For example, suppose the developers are given the story "A company can pay for a job posting with a credit card" but none of the developers has ever done credit card processing before. They may choose to split the stories like this: Investigate credit card processing … |
| 14 | Olsen, The Lean Product Playbook | estimated. Small: Good stories tend to be small in scope. Larger stories will have greater uncertainty, so you should break them down. Testable: A good story provides enough information to make it clear how to test that the story is “done” (called acceptance criteria). Specify Your Minimum Viable Product (MVP) Feature … |
| 15 | Cohn, User Stories Applied (2004) | If they are too big, compound and complex stories may be split into multiple smaller stories. If they are too small, multiple tiny stories may be combined into one bigger story. Stories need to be testable. < Day Day Up > < Day Day Up > Developer Responsibilities You are responsible for helping the customer write … |
| 16 | Richter, The Product Manager's Playbook (2023) | Use concrete examples: Including concrete examples in the user story can help to clarify the goal and the benefit to the user. These examples should be specific and relevant to the user and their needs. Use acceptance criteria: This is a set of clear, specific, and achievable conditions that must be met in order for … |
| 17 | Cohn, User Stories Applied (2004) | A user must find the software easy to use. A user must never have to wait long for any screen to appear. As written, these stories are not testable. Whenever possible, tests should be automated. This means strive for 99% automation, not 10%. You can almost always automate more than you think you can. When a product is … |
| 18 | Cohn, User Stories Applied (2004) | complete common workflows without training" can be tested but cannot be automated. Testing this story will likely involve having a human factors expert design a test that involves observation of a random sample of representative novice users. That type of test can be both time-consuming and expensive, but the story is … |
| 19 | Cohn, User Stories Applied (2004) | The software must run on all versions of Windows. The system will achieve uptime of 99.999%. The software will be easy to use. Even though constraint cards do not get estimated and scheduled into iterations like normal cards, they are still useful. Minimally, constraint cards can be taped to the wall where they act as … |
| 20 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | Watch out for generic roles One of the biggest advantages of user stories is getting delivery teams to think from the perspectives of users. Instead of purely focusing on how to build something, delivery teams consider how their products will be used. This is central to the user story technique – hence the name. Yet … |
| 21 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | Using generic roles is often a get-out-of-jail-free card for people who want to push in pet features, or unjustified scope. For example, a team we recently worked with had a story ‘As a user I want to log in through social networks in order not to remember another username and password’. The story checklist originally … |
| 22 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | Key benefits Selecting a limited number of target segments for each milestone prevents stakeholders from constantly inventing new user roles. This makes people think twice when writing stories to justify pet features, and results in better, more focused stories. Forcing people to seriously consider which user segment … |
| 23 | Cohn, User Stories Applied (2004) | project—"Change the user interface as little as possible once it's started." Constantine and Lockwood (2002) propose agile usage-centered design as a solution. Agile usage-centered design is driven by essential use cases or task cases rather than user stories. However, we can replace essential use cases with stories, … |
| 24 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | Misleading stories describe a solution and not the real user need. One case we came across recently was ‘As a back-office operator, in order to run reports faster, I want the customer reporting database queries to be optimised’. At first glance, this seemed like a nice user story – it even included a potentially … |
| 25 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | The cause of this problem is a common misconception of the stakeholder role in agile delivery methods. The product owner or XP customer should be responsible for deciding what the team will work on. But deciding isn’t the same as defining, and this is where things go wrong! Getting business stakeholders to design … |
| 26 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | Get the delivery group (team) to propose several options for ‘I want…’ Both sides together evaluate the options and the business stakeholders decide which one will be implemented We’ve done this experiment with teams that misunderstand stories, where their business users fully specify everything in a task management … |
| 27 | Cohn, User Stories Applied (2004) | these stories are good ones but they should instead be written so that the benefits to the customers or the user are apparent. This will allow the customer to intelligently prioritize these stories into the development schedule. Better variations of these stories could be the following: Up to fifty users should be … |
| 28 | Cohn, User Stories Applied (2004) | assumptions out of stories. For example, the revised stories above have removed the implicit use of a connection pool and a set of error handling classes. The best way to ensure that each story is valuable to the customer or users is to have the customer write the stories. |
| 29 | Klein, UX for Lean Startups | Don’t forget to write admin stories, too! You might include something like, “Customer service reps can more quickly add new content to help users when new problems arise.” You’ll notice I didn’t suggest things like, “Customers can ask questions of other users and get immediate responses.” That may be a solution that … |

---
## store-phase-5-dor-2: How are fake, micro-, misleading and orphan stories told apart and what is done with them?

- asked 2026-10-04 · notebook "The Product - Business Design" · conversation `fd3783b2-dbac-426f-8435-1b7007a4e197`
- Sources: Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014)
- Note: cited_text passages trimmed (about 600 characters, one passage elided with [...]) by the logging worker; the FAQ table shortens them to 320 anyway.

**Question**

> According to the sources, what should be done with a story that is found to be a fake story (a technical task written as a user story) or a micro-story or misleading story, and with an orphan story (no link to an epic, goal or impact)? What are the concrete remedies and how do the sources tell these cases apart? Please cite the sources.

**Answer** (verbatim, citation markers resolve in the table below)

The sources—primarily Gojko Adzic et al. in *Fifty Quick Ideas to Improve Your User Stories*—distinguish these cases by analyzing **system boundaries** and **backlog hierarchies**, prescribing specific remedies for each [1, 2].

---

##### How the Sources Tell These Cases Apart

The sources evaluate user stories by placing their **user need** (`In order to...`) and **deliverable** (`I want...`) within three system boundaries: the **zone of control** (things the team can change directly), the **sphere of influence** (things the team can impact but not fully control), and the **external environment** [1, 3]. 

In a well-constructed story, the deliverable lies in the team's **zone of control**, while the user need lies in their **sphere of influence** [3]. When a story's **user need** falls directly inside the team's **zone of control**, it is effectively a task without risk, signaling one of three problematic scenarios [4]:

* **Fake Stories**: Stories that capture internal delivery team tasks or infrastructure needs rather than customer or business needs (e.g., *"As a QA, in order to test faster, I want database server restarts automated"* or *"As a developer, I want to understand how the new API works"*) [4-6].
* **Micro-Stories**: Extremely small, risk-free stepping stones created by breaking down a large business story into tiny pieces [4]. On their own, individual micro-stories do not carry independent business risk or value [4].
* **Misleading Stories**: Stories that specify a low-level technical solution instead of expressing the underlying user goal [7]. The requested change remains entirely within the team's technical control (e.g., optimizing report queries) while masking the real problem outside their control (e.g., helping operators resolve customer data discrepancies faster) [7].
* **Orphan Stories**: Unlinked stories identified when using **hierarchical backlogs** or **impact maps** (which connect business goals, actors, impacts, and deliverables) [2, 8]. An orphan story is a deliverable that cannot visually branch or link to a higher-level epic, target actor segment, or business impact [8-10]. They are frequently "pet features" or reverse-engineered deliverables where a solution was created first and retrofitted with a generic role like *"As a user..."* [9].

---

##### Concrete Remedies

###### 1. Remedies for Fake Stories
* **Remove technical tasks from story backlogs**: Throw out fake stories and stop forcing incidental tasks (such as server maintenance, library upgrades, or refactoring) into user story formats where they compete with customer-facing work [5, 11, 12].
* **Allocate a dedicated time budget**: Manage internal technical improvements through a separate, dedicated capacity budget or operational slack rather than backlog prioritization [11, 13].
* **Use explicit Learning Stories (Spikes)**: When technical research or investigation is required, reframe the task as a time-boxed **learning story** with specific information acceptance criteria that help stakeholders make planning decisions [14].

###### 2. Remedies for Micro-Stories
* **Consolidate for medium- and long-term planning**: While micro-stories are acceptable during short-term iteration execution, replace groups of micro-stories with a single, higher-level item when managing medium- or long-term backlogs [12].
* **Evaluate the full hierarchy**: Track micro-stories as part of their parent epic or goal hierarchy, measuring success based on whether the combined micro-stories achieve the overarching business impact [4].
* **Remove failed hierarchies**: If the combination of micro-stories fails to deliver the expected business outcome, discard or revisit the entire hierarchy [4].

###### 3. Remedies for Misleading Stories
* **Rephrase around true user needs**: Rewrite the story's value statement (`In order to...`) to focus on the desired behavior change or outcome that sits outside the team's direct zone of control [7, 12].
* **Investigate root causes**: Look beyond the requested technical fix to design a simpler, more direct solution that addresses the actual user workflow (e.g., building a data-comparison web page rather than optimizing database queries for manual file comparisons) [7].

###### 4. Remedies for Orphan Stories
* **Classify as "Not Now" or Discard**: In a hierarchical backlog or impact map, if a story does not align with the target user segments or goals pre-selected for the current milestone, move it to a *"not now"* bucket or remove it entirely as scope creep [8, 10, 15].
* **Pre-select user roles for milestones**: Limit each milestone to specific target user segments to make unlinked or generic stories obvious and easier to eliminate [10, 16].

---

💡 Would you like to map out a specific set of stories from your backlog into an impact map or hierarchical backlog to identify any fake or orphan items?

**Citations**

| # | Source | Cited passage |
|---|---|---|
| 1 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | An alternative approach is to group users by common behaviours. Market research is often a good start for defining customer groups, because they structure surveys by needs and behaviours. A great example of this is the Anatomy of a Live Music Fan survey published by BandsInTown. Evaluate zone of control and sphere of … |
| 2 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | One way to implement this idea is to use a visual board with several horizontal swim lanes to represent different tiers. If you use a physical planning board, colour-coding different levels or using different card sizes are good ways to visualise this. Alternatively, you can represent the same information on a … |
| 3 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | The sphere of influence includes activities that we can impact, but can’t exercise full control over. The external environment includes the elements over which we have no influence. These three system areas, and the boundaries between them, provide a very useful perspective on what a delivery team can hope to achieve … |
| 4 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | When the user need of a story is in the zone of control of the delivery group, the story is effectively a task without risk, which should raise alarm bells. There are three common scenarios: The story might be fake, micro-story or misleading. Fake stories are those about the needs of delivery team members. For … |
| 5 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | Managing Iterative Delivery Don’t push everything into stories There are plenty of things any software team needs to do which just don’t fit into user stories conceptually. Within one week, people in a team we recently worked with were involved in setting up new development machines, rebuilding test servers, upgrading … |
| 6 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | In iterative processes where teams commit at the start of an iteration to deliver stories, such vague stories can lead to nasty surprises towards the end. Some teams solve this by writing fake user stories, that mostly follow the pattern ‘As a developer, I want to understand how the new external API works’. They are … |
| 7 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | Misleading stories describe a solution and not the real user need. One case we came across recently was ‘As a back-office operator, in order to run reports faster, I want the customer reporting database queries to be optimised’. At first glance, this seemed like a nice user story – it even included a potentially … |
| 8 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | Because impact maps visually present the information held in the Connextra card format, scope creep is trivially easy to spot. User stories that shouldn’t be part of the current release cycle simply won’t fit visually into any branches of the impact map. Impact maps effectively visualise assumptions. When a … |
| 9 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | When business stakeholders aren’t experienced with iterative delivery, plans based on user stories often turn into streams of consciousness. Anything goes, stories even get reverse-engineered from feature ideas. A common result is that stakeholders feel that they constantly get small improvements, but the delivery … |
| 10 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | A team we recently worked with was restructuring the sign-up process for their product, allowing users to log on through social media accounts. The stakeholders identified Twitter and Facebook users as important segments for this milestone, and agreed that everything else could be postponed. During a discussion about … |
| 11 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | First, prioritisation of such tasks is pointless. Business stakeholders won’t be able to provide any sensible opinion on whether cleaning up a test server is more important than upgrading to the latest jQuery version. Writing such tasks as user stories makes them compete with externally valuable work, and they’ll … |
| 12 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | Key benefits The concepts of the zone of control and sphere of influence are crucial for systems thinking. By inspecting stories that fall outside the usual pattern, we can identify root causes of problems and work on them, instead of just dealing with the symptoms. How to make it work The system boundaries vary … |
| 13 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | If the team has a separate, dedicated time budget for incidental work, it can build up slack to deal with unexpected interruptions so that both short-term and long-term planning actually become more accurate. The team also becomes more productive. Instead of wasting time on writing, estimating and managing fake … |
| 14 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | A good way to deal with such situations is to explicitly split the research tasks into a separate story with a goal of its own. A helpful way of thinking about this is that a story should be either about learning or earning. Learning stories help stakeholders plan better. Earning stories help to deliver value to … |
| 15 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | With several named milestones in place, check again what stories are planned for each milestone. Does every story make a meaningful improvement to its milestone? If not, move it. The aim is to have as few stories in each milestone as possible, without creating artificial milestones. Make this an ongoing process. A … |
| 16 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | Key benefits Selecting a limited number of target segments for each milestone prevents stakeholders from constantly inventing new user roles. This makes people think twice when writing stories to justify pet features, and results in better, more focused stories. Forcing people to seriously consider which user segment … |

---
