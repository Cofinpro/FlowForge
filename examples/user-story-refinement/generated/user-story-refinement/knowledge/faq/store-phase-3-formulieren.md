# FAQ: store-phase-3-formulieren

Notebook answers recorded verbatim with their citations. Distilled guidance lives
in the references; this file is the audit trail behind it.

---
## store-phase-3-formulieren-1: How are story-to-epic/Fachkonzept/feedback links documented (fields, granularity, maintainability, mistakes)?

- asked 2026-10-04 · notebook "The Product - Business Design" · conversation `c585170b-702b-4fa9-9196-3d4b7d772266`
- Sources: Anforderungsverwaltung.pdf; Pohl & Rupp, Basiswissen Requirements Engineering (2015); Anforderungsdokumentation.pdf; Richter, The Product Manager's Playbook (2023); Cohn, User Stories Applied (2004); Evans, Domain-Driven Design (2003); Olsen, The Lean Product Playbook; Patton, User Story Mapping; Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014); Humble et al., Lean Enterprise

**Question**

> According to the sources, how should the link from a user story back to its epic, the business concept (Fachkonzept / requirements specification) and the originating feedback be documented in practice: which attributes or fields, what granularity, how to keep the links maintainable (traceability matrix, IDs), and what are common mistakes? Please cite the sources.

**Answer** (verbatim, citation markers resolve in the table below)

##### 1. Documenting the Links: Pre-RS Traceability and Hierarchy

In practice, linking a user story back to its origins involves two primary types of traceability relationships:

* **Pre-RS Traceability (Pre-Requirements Specification Traceability):** Connects the user story directly to its upstream origin, such as customer feedback, user research, interview protocols, or the initial business case [1-4].
* **Traceability Between Requirements:** Connects lower-level user stories to higher-level elements in the requirements specification or business concept (*Fachkonzept*), such as Epics, Themes/Features, or functional goal definitions [1, 2, 4-7].

###### Key Attributes and Fields on the User Story Ticket
To document these links maintainably in ticketing tools (e.g., Jira or VersionOne), teams rely on specific ticket attributes [8-10]:

* **Unique Identifier (ID):** An immutable, unique key (e.g., `REQ-10` or a ticket ID) assigned to every story, epic, and spec section to serve as the anchor for all linkages [8, 11-15].
* **Source / Quelle / Author:** A dedicated field recording the origin of the requirement (e.g., specific customer feedback ticket, user interview protocol, or originating business department) [8, 9, 14, 16].
* **Epic Link / Parent Reference:** A hierarchical field referencing the ID of the overarching Epic or Feature/Theme to which the story belongs [6, 7, 9].
* **Cross-References / Querbezüge / Working Documents:** Fields or hyperlinks pointing to relevant sections of the business concept (*Fachkonzept* / specification), one-pagers, or external research data [9, 17].
* **Description & Acceptance Criteria:** The core story template (*"As a... I want... So that..."*) and its testable acceptance criteria, capturing the target user role, functionality, and underlying business benefit [18-21].

---

##### 2. Granularity Levels in the Backlog

Documenting links effectively requires maintaining clear distinctions across different levels of abstraction [5, 6, 22]:

* **Themes / Features:** High-level strategic groupings used across programs or roadmaps to evaluate major initiatives [6, 7].
* **Epics:** Overarching macro-stories that group a set of smaller, related user stories to realize larger software components across the product life cycle [5, 7].
* **User Stories:** Discrete, functional slices of value described from the user or customer perspective, sized specifically for delivery within a single iteration/sprint [5, 22-25].
* **Tasks:** Technical implementation steps broken down during sprint planning (e.g., database setups or API routines) that represent technical tasks rather than standalone business value [22].

---

##### 3. Keeping Links Maintainable (IDs, Matrices, and Tooling)

To avoid excessive documentation overhead, teams choose representation techniques based on project complexity [26-30]:

* **Unique IDs & Hyperlinking:** The most practical approach in digital systems is embedding direct hyperlinks or textual references containing unique IDs between story tickets, specification sections, and feedback items [8-14, 27].
* **Traceability Matrices:** Tabular grids mapping source artifacts (rows) to target artifacts (columns) [27, 31].
  * *Maintainability Bottleneck:* Matrices become unviable at scale. For instance, tracking relationships across 2,000 requirements creates 4 million matrix cells, making manual updates unmanageable [32].
* **Traceability Graphs and Chains (*Verfolgbarkeitsgraphen / -ketten*):** Dedicated Requirements Management (RM) tools store artifacts as graph nodes and relationships (`derived from`, `realized by`, `is source`) as typed edges. These tools generate dependency chains automatically at configurable depths for impact analysis [28, 30, 33].
* **Purpose-Driven Traceability (*Verwendungszweckbezogene Traceability*):** To keep links maintainable, teams must define specific use cases for tracking (e.g., regulatory compliance or impact analysis) and document *only* necessary relationships. Indiscriminate tracing leads to incomplete, outdated, and corrupted datasets [26, 29].
* **Visual Mapping Techniques:** Tools like **User Story Mapping** (Jeff Patton) and **Impact Mapping** (Gojko Adzic) provide visual, maintainable backbones that naturally link individual user stories back to high-level user workflows, customer segments, and business goals [34-38].

---

##### 4. Common Mistakes and Pitfalls

* **Using Completed User Stories as Permanent Documentation:** Completed user stories explain how a software system changes over time, not how it currently works [39, 40]. Once a story is delivered, teams should transition acceptance criteria into functional specifications or test suites organized by feature area rather than maintaining a chronological history of old tickets [41, 42].
* **Traceability & "Risk Management Theater":** Forcing teams to maintain heavy, multi-tab spreadsheets or trace matrices for approval gates often results in "compliance theater," where fields are blindly updated to pass audits without adding real risk management value [43].
* **Replacing Conversations with Document Hand-overs:** Treating story links and ticket descriptions as static hand-over documents between business representatives and delivery teams destroys the core benefit of user stories, which are meant to serve as tokens for ongoing conversation [44-50].
* **Fake Stories and Micro-Stories:** Writing developer-internal tasks in a story template (*"As a QA, I want..."*) or splitting stories into tiny technical fragments obscures business value and makes backlog prioritization impossible [51-55].
* **ID Over-Engineering:** Getting bogged down in complex sub-numbering hierarchies (e.g., debating "Story 13.1.2") introduces unnecessary administrative overhead [56].

---

💡 Would you like me to create a structured template or table for a user story ticket schema that includes all necessary traceability and metadata fields?

**Citations**

| # | Source | Cited passage |
|---|---|---|
| 1 | Anforderungsverwaltung.pdf | 5.2 Traceability Traceability (Nachverfolgbarkeit) beschreibt die Fähigkeit, Anforderungen über ihren gesamten Lebenszyklus hinweg eindeutig zu verfolgen. Sie ermöglicht es, Abhängigkeiten zwischen Anforderungen sowie deren Beziehungen zu vorgelagerten und nachgelagerten Artefakten transparent zu machen. Versionierung … |
| 2 | Anforderungsverwaltung.pdf | 1. Pre-RS-Traceability: Bezieht sich auf vorgelagerte Artefakte im Projekt, die zu Anforderungen führen (z. B. Business-Case, Stakeholder-Bedarf). 2. Post-RS-Traceability: Verknüpft Anforderungen mit nachgelagerten Artefakten (z. B. Architektur, Testfälle, Code). 3. Traceability zwischen Anforderungen: Dient der … |
| 3 | Pohl & Rupp, Basiswissen Requirements Engineering (2015) | 8.4.3 Klassifikation von Verfolgbarkeitsbeziehungen Pre-RS-Traceability und Post-RS-Traceability In der einschlägigen Literatur zur Verfolgbarkeit (auch: Nachvollziehbarkeit) von Anforderungen werden verschiedene Arten der Verfolgbarkeit von Anforderungen vorgeschlagen. Eine gängige Differenzierung der Verfolgbarkeit … |
| 4 | Pohl & Rupp, Basiswissen Requirements Engineering (2015) | Pre-RS-Traceability: Unter der Pre-RS-Traceability werden Verfolgbarkeitsbeziehungen zu denjenigen Artefakten subsumiert, die der Anforderung im Projektverlauf vorgelagert sind, z.B. der Ursprung bzw. die Quelle einer Anforderung. Post-RS-Traceability: Post-RS-Traceability umfasst Verfolgbarkeitsinformationen von … |
| 5 | Anforderungsdokumentation.pdf | Aus der Entscheidungstabelle ist damit erkennbar, dass: Immer beim Öffnen der Maske der Datensatz gesperrt wird Beim Wechsel zwischen den Feldern geprüft wird, ob ein Feld leer ist Beim Speichern ebenso überprüft wird ob alle Felder befüllt sind und ein Änderungsbericht aufgerufen wird. Welche modellbasierte Methode … |
| 6 | Anforderungsdokumentation.pdf | 4.1.2 Features (Themes) Neben den Epics existieren noch weitere Granularitätsebenen zur Backlog-Verwaltung bspw. auf Programmebene. Bei der Nutzung von JIRA existiert neben den Epics darüber hinaus die Möglichkeit der Nutzung von „Features“ oder „Themes“ (bedingt ein entsprechendes Setup in JIRA). Grundsätzlich ist … |
| 7 | Anforderungsdokumentation.pdf | Eine mögliche Nutzung im Projekt, am Beispiel eines B2C/B2B-Robo-Advisors, könnte wie folgt aussehen: Theme: Einführung von Gemeinschaftsdepots Features (priorisiert in absteigender Reihenfolge): 1. Eröffnung und Verwaltung von Gemeinschafsdepots (ausschl. „Oder-Depots“) in der Filiale 2. Eröffnung und Verwaltung von … |
| 8 | Anforderungsverwaltung.pdf | Attribute als Basis für Traceability Damit Anforderungen eindeutig identifizierbar und nachverfolgbar sind, werden ihnen Attribute zugeordnet, wie z. B.: ID (eindeutige Kennung), Name der Anforderung, Beschreibung, Stabilität, Verantwortlicher, Quelle und Autor. Die Attribuierung unterstützt die Klassifikation, … |
| 9 | Richter, The Product Manager's Playbook (2023) | Each ticket should contain the following information: Problem to solve (and why) Desired outcome when the problem is solved Cross-functional input required (design, data, new server setup, etc.) Customer feedback and data around the problem Ideas on how to solve the problem Epics/User stories link to your delivery … |
| 10 | Cohn, User Stories Applied (2004) | upper management are distributed across multiple sites. With remote stakeholders they could not say "go look at the board" so they spent a lot of time updating senior management and other remote stakeholders. Also, when using note cards they had problems with cards occasionally getting lost and then found weeks later … |
| 11 | Anforderungsdokumentation.pdf | Eindeutige Identifizierung und strukturierte Dokumentation Jede Anforderung wird chronologisch nummeriert, was die Nachverfolgbarkeit im Projektverlauf erleichtert. Eine klare und präzise Beschreibung stellt sicher, dass alle Beteiligten die Anforderungen gleichermaßen verstehen. Die durchgängige Verwendung … |
| 12 | Evans, Domain-Driven Design (2003) | When there is no true unique key made up of the attributes of an object, another common solution is to attach to each instance a symbol (such as a number or a string) that is unique within the class. Once this ID symbol is created and stored as an attribute of the ENTITY, it is designated immutable. It must never … |
| 13 | Pohl & Rupp, Basiswissen Requirements Engineering (2015) | Verfolgbar [ISO/IEC/IEEE 29148:2011]: Eine Anforderung ist nachvollziehbar, wenn sowohl der Ursprung der Anforderung als auch deren Umsetzung und die Beziehung zu anderen Dokumenten nachvollziehbar ist. Sichergestellt wird dies über einen eindeutigen Anforderungsidentifikator. Über diese eindeutigen Identifikatoren … |
| 14 | Pohl & Rupp, Basiswissen Requirements Engineering (2015) | Abb. 8–1 Beispiel für eine Anforderungsattributbelegung Die in Abbildung 8–1 auf Basis einer einfachen Schablone strukturiert dokumentierte Anforderung trägt als Identifikator das Kürzel »Req-10«, den Namen »Dynamische Stauumfahrung«, eine Kurzbeschreibung, die den Gegenstand dieser Anforderung genauer dokumentiert. … |
| 15 | Pohl & Rupp, Basiswissen Requirements Engineering (2015) | 8.1.3 Attributtypen für Anforderungen Häufig verwendete Attributtypen Die verschiedenen Standards im Requirements Engineering und einschlägige Werkzeuge zur Dokumentation und Verwaltung von Anforderungen bieten häufig eine Reihe vordefinierter Attribute.Tabelle 8–1 listet Attributtypen auf, die in der Praxis häufig im … |
| 16 | Pohl & Rupp, Basiswissen Requirements Engineering (2015) | 8.1 Attributierung von Anforderungen Über den gesamten Lebenszyklus eines Systems hinweg müssen Informationen über Anforderungen festgehalten werden. Hierzu gehören beispielsweise der eindeutige Identifikator der Anforderung, der Name der Anforderung, Autor und Quelle der Anforderung sowie der Verantwortliche für die … |
| 17 | Pohl & Rupp, Basiswissen Requirements Engineering (2015) | Querbezüge Benennt die Beziehungen zu anderen Anforderungen. Zum Beispiel wenn bekannt ist, dass die Realisierung dieser Anforderung die vorherige Realisierung einer anderen Anforderung voraussetzt. Allgemeine Informationen In diesem Attribut können beliebige, für relevant erachtete Informationen zu dieser Anforderung … |
| 18 | Pohl & Rupp, Basiswissen Requirements Engineering (2015) | 17 Qualitäten Querbezüge zu Qualitätsanforderungen Zeilen der Use-Case-Schablone Die Schablone zur Spezifikation eines Use Case beinhaltet die folgenden Attribute: Attribute zur eindeutigen Identifikation eines Use Case (Zeilen 1/2) Managementattribute (Zeile 3 bis 7) Attribut für die Beschreibung des Use Case (Zeile … |
| 19 | Olsen, The Lean Product Playbook | 77 78 The Lean Product Playbook USER STORIES: FEATURES WITH BENEFITS User stories (used in Agile development) are a great way to write your feature ideas to make sure that the corresponding customer benefit remains clear. A user story is a brief description of the benefit that the particular functionality should … |
| 20 | Cohn, User Stories Applied (2004) | of three aspects: a written description of the story used for planning and as a reminder conversations about the story that serve to flesh out the details of the story tests that convey and document details and that can be used to determine when a story is complete Because user story descriptions are traditionally … |
| 21 | Patton, User Story Mapping | After using the template for a while, the folks at Connextra wanted to show off their cool new trick. They printed a bunch of example cards to show off at XPDay 2001, a small conference in London. That’s what Rachel is holding. It’s her last card, and might very well be the last card in existence, so that makes it a … |
| 22 | Anforderungsdokumentation.pdf | 4.1.4 Task Aus einer User Story lassen sich einzelne Tasks ausarbeiten. Tasks werden vom Team im Planning erstellt und beschreiben die Aufgaben, die die Entwickler abschließen müssen um eine User Story umzusetzen. Dabei sind User Stories aus fachlichen Sicht beschrieben, während Tasks die technische Umsetzung … |
| 23 | Richter, The Product Manager's Playbook (2023) | How do we maintain our backlog? How do we keep it small? Who is allowed to create tickets? How do we differentiate tickets for backend/frontend/business/QA? How are tickets labeled? How do teams commit to sprint goals and scopes? How are releases done? How often do we release? How do we handle urgent ad-hoc requests … |
| 24 | Cohn, User Stories Applied (2004) | we avoid obtuse written documents with statements like: The system must store an address and business phone number or mobile phone number. What does that mean? It could mean that the system must store one of these: (Address and business phone) or mobile phone Address and (business phone or mobile phone) Because user … |
| 25 | Cohn, User Stories Applied (2004) | User stories, which are typically smaller in scope than use cases and scenarios but larger than IEEE 830 statements, are the right size for planning. Planning, as well as programming and testing, can be completed with stories without further aggregation or disaggregation. User stories work well with iterative … |
| 26 | Pohl & Rupp, Basiswissen Requirements Engineering (2015) | Verwendungszweck von Verfolgbarkeitsinformationen Um eine effektive und effiziente Verfolgbarkeit von Anforderungen zu etablieren, sollten die aufzuzeichnenden Informationen auf Basis von klar definierten Verwendungszwecken definiert werden, d.h., es sollten nur solche Informationen aufgezeichnet werden, für die in … |
| 27 | Pohl & Rupp, Basiswissen Requirements Engineering (2015) | Textuelle Referenzen und Hyperlinks Eine einfache Form der Repräsentation von Verfolgbarkeitsinformationen einer Anforderung besteht darin, das Zielartefakt als textuelle Referenz an der betrachteten Anforderung (Ausgangsartefakt) zu annotieren oder zwischen dem Ausgangsartefakt und dem Zielartefakt einen Hyperlink zu … |
| 28 | Pohl & Rupp, Basiswissen Requirements Engineering (2015) | Verfolgbarkeitsgraphen Ein Verfolgbarkeitsgraph ist ein Graph, in dem die Knoten Artefakte und die Kanten Beziehungen zwischen diesen Artefakten darstellen. Die Unterscheidung verschiedener Artefakte und Typen von Verfolgbarkeitsbeziehungen kann durch entsprechende Attributierung der Knoten und Kanten des Graphen … |
| 29 | Pohl & Rupp, Basiswissen Requirements Engineering (2015) | 8.4 Verfolgbarkeit von Anforderungen Ein wichtiger Aspekt in der Verwaltung von Anforderung ist die Sicherstellung der Verfolgbarkeit von Anforderungen (Requirements Traceability). Die Verfolgbarkeit einer Anforderung ist die Fähigkeit, eine Anforderung über den gesamten Lebenszyklus des Systems hinweg nachvollziehen … |
| 30 | Pohl & Rupp, Basiswissen Requirements Engineering (2015) | Abb. 8–8 Repräsentation der Verfolgbarkeit mittels Graphen (Ausschnitt) Verfolgbarkeitsketten Werden auch Beziehungen zu vorgelagerten Artefakten (z.B. Stakeholder und Interviewprotokolle) und nachgelagerten Artefakten (z.B. Testfälle und Komponenten) verwaltet, so können Verfolgbarkeitsketten für die jeweilige … |
| 31 | Pohl & Rupp, Basiswissen Requirements Engineering (2015) | Interpretation von Verfolgbarkeitsmatrizen Abbildung 8–7 zeigt eine einfache Verfolgbarkeitsmatrix für die Verfolgbarkeitsbeziehung »abgeleitet«, die zwischen zwei Anforderungen existiert. Ein Eintrag in der Matrix drückt aus, dass eine Verfolgbarkeitsbeziehung vom Typ »abgeleitet« von einer Anforderung »Reqn« zu … |
| 32 | Pohl & Rupp, Basiswissen Requirements Engineering (2015) | Handhabbarkeit von Verfolgbarkeitsmatrizen In der Praxis hat sich gezeigt, dass Verfolgbarkeitsmatrizen mit einer steigenden Zahl von Anforderungen nur noch schwer gehandhabt werden können. So umfasst eine Verfolgbarkeitsmatrix, die z.B. Verfeinerungsbeziehungen zwischen 2000 Anforderungen dokumentiert, schon 4 … |
| 33 | Pohl & Rupp, Basiswissen Requirements Engineering (2015) | Charakteristische Eigenschaften von RM-Werkzeugen Verwaltung von Anforderungen und Attributen auf der Basis von Informationsmodellen Organisation von Anforderungen (mittels Hierarchieebenen) Konfigurations- und Versionsmanagement auf Anforderungsebene Definition von Anforderungsbasislinien (Baselining) … |
| 34 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | Impact maps nicely organise the information held in the popular Connextra user story card format (‘As a … in order to… I want…’). Visually, the second level of an impact map corresponds to the persona or role of a user story. The third level corresponds to the value statement, especially when teams use the idea about … |
| 35 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | Because impact maps visually present the information held in the Connextra card format, scope creep is trivially easy to spot. User stories that shouldn’t be part of the current release cycle simply won’t fit visually into any branches of the impact map. Impact maps effectively visualise assumptions. When a … |
| 36 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | When you get to the fourth level of the map, capture user stories, epics, tasks, product ideas – all the deliverables that could potentially cause a positive impact or prevent a negative one. Then treat them as options, not as commitments. For some detailed examples and more information on how to create impact maps, … |
| 37 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | A story map is a grid where the horizontal axis represents steps in a high-level user activity, and the vertical axis represents the software delivery schedule (releases or milestones). User stories are grouped in the grid based on the activity or workflow step they contribute to. Stories are spread vertically based … |
| 38 | Patton, User Story Mapping | Eric’s backlog is organized as a story map with the backbone in yellow stickies across the top. Those yellow stickies have short verb phrases on them that tell the big story of what his users will do in the product, but at a high level. Below it are all the details—the specific things they’ll do and need to really use … |
| 39 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | If you fear the consequences of removing features after they have appeared in the wild, a good solution is to do staged releases, where only a small percentage of users gets new capabilities. Then rolling back in case of failure is not such a big issue. Throw stories away after they are delivered Many teams get stuck … |
| 40 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | A user story can often change several functional aspects of a software system, and the same functionality can be impacted by many stories over a longer period of time. One story might put some feature in, another story might modify it later or take it out completely. In order to understand the current situation, … |
| 41 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | The reason why so many teams fall into this trap is that it isn’t immediately visible. Organising tests or specifications by stories makes perfect sense for work in progress, but not so much for documenting things done in the past. It takes a few months of work before this practice really starts to hurt. A story is a … |
| 42 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | Divide work in progress and work already done, and manage specifications, tests and design documents differently for those two groups. Throw user stories away after they are done, tear up the cards, close the tickets, delete the related wiki pages. This way you won’t fall into the trap of having to manage … |
| 43 | Humble et al., Lean Enterprise | 6 Segregation of duties is a concept that seeks to prevent errors and malicious activities by an individual by requiring at least two people to complete any end-to-end transaction. Another way to approach it is to ensure no one person can complete a transaction without it being detected or controlled by at least one … |
| 44 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | User stories are often misunderstood as lightweight requirements, given by the business stakeholders to the delivery team. This misunderstanding leads to stories being collected in a task management tool, with a ton of detail written down by business representatives. Except in the very rare case where the business … |
| 45 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | User stories imply a completely different model: requirements by collaboration. Hand-overs are replaced by frequent involvement and discussions. When domain and technical knowledge is spread among different people, a discussion between business stakeholders and delivery teams often leads to good questions, options and … |
| 46 | Cohn, User Stories Applied (2004) | User stories are comprehensible by both you and the developers. User stories are the right size for planning. User stories work for iterative development. User stories encourage deferring detail until you have the best understanding you are going to have about what you really need. Because user stories shift emphasis … |
| 47 | Cohn, User Stories Applied (2004) | A Warning Sign One warning sign of a project going astray with a requirements specification is a ping-ponging of the specification document between the software development group and another group like Marketing or Product Management. What typically happens is the Product Management (or similar) group writes a … |
| 48 | Cohn, User Stories Applied (2004) | to sections of the document and claim that missing features were implied. Or they will claim that expected functionality is clearly out of scope because of a sentence buried somewhere in the document. Most of the times when I see two groups writing separate versions of essentially the same document I already know they … |
| 49 | Patton, User Story Mapping | Stop Trying to Write Perfect Documents There are a great number of people who believe that there’s some ideal way to document—that, when people read documents and come away with different understandings, it’s either the reader’s fault or the document writer’s. In reality, it’s neither. The answer is just to stop it. … |
| 50 | Patton, User Story Mapping | Kent’s Disruptively Simple Idea The idea of stories originated with a very smart guy by the name of Kent Beck. Kent was working with other people on software development in the late ’90s, and he noticed that one of the biggest problems in software development sprang from the traditional process approach of using … |
| 51 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | When the user need of a story is in the zone of control of the delivery group, the story is effectively a task without risk, which should raise alarm bells. There are three common scenarios: The story might be fake, micro-story or misleading. Fake stories are those about the needs of delivery team members. For … |
| 52 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | In iterative processes where teams commit at the start of an iteration to deliver stories, such vague stories can lead to nasty surprises towards the end. Some teams solve this by writing fake user stories, that mostly follow the pattern ‘As a developer, I want to understand how the new external API works’. They are … |
| 53 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | Managing Iterative Delivery Don’t push everything into stories There are plenty of things any software team needs to do which just don’t fit into user stories conceptually. Within one week, people in a team we recently worked with were involved in setting up new development machines, rebuilding test servers, upgrading … |
| 54 | Cohn, User Stories Applied (2004) | users: Throughout the development process, the development team will produce documentation suitable for an ISO 9001 audit. The development team will produce the software in accordance with CMM Level 3. What you want to avoid are stories that are only valued by developers. For example, avoid stories like these: All … |
| 55 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | First, prioritisation of such tasks is pointless. Business stakeholders won’t be able to provide any sensible opinion on whether cleaning up a test server is more important than upgrading to the latest jQuery version. Writing such tasks as user stories makes them compete with externally valuable work, and they’ll … |
| 56 | Cohn, User Stories Applied (2004) | individual cards or add some level of traceability to stories. For example, when we discover that the story on card 13 is too large we rip up card 13 and replace it with cards 13.1, 13.2, and 13.3. However, numbering story cards adds pointless overhead to the process and leads us into abstract discussions about … |

---
## store-phase-3-formulieren-2: How is a story reformulated after a failed INVEST criterion, and how are INVEST conflicts handled?

- asked 2026-10-04 · notebook "The Product - Business Design" · conversation `b92a2da3-5149-4234-8aa8-9e52ead2252e`
- Sources: Olsen, The Lean Product Playbook; Cohn, User Stories Applied (2004); Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014); Patton, User Story Mapping; Bland, Testing Business Ideas (2019)

**Question**

> According to the sources, when a user story fails an INVEST check, how should it be reformulated for each criterion (Independent, Negotiable, Valuable, Estimable, Small, Testable): what concrete fix does each source suggest (e.g. combining or splitting stories, splitting by value, adding acceptance tests, a spike), and how should conflicts between the criteria (independent and valuable versus small) be handled? Please cite the sources.

**Answer** (verbatim, citation markers resolve in the table below)

When a user story fails an **INVEST** check (**I**ndependent, **N**egotiable, **V**aluable, **E**stimable, **S**mall, **T**estable), the sources outline specific, concrete reformulations and structural fixes for each criterion [1, 2]. 

---

##### 1. Independent (I)
* **The Failure:** Stories have tight inter-dependencies, making it hard to prioritize or estimate them individually (for example, supporting Visa, MasterCard, and AmEx where the first card takes 3 days to implement and subsequent cards take only 1 day each) [2-4].
* **Concrete Fixes:**
  1. **Combine dependent stories:** Merge small, overlapping, or interdependent stories into a single, larger independent story (e.g., *"A company can pay for a job posting with a credit card"*) if the combined effort remains within iteration limits [4-6].
  2. **Split along a different functional dimension:** Re-divide the capability by order of implementation (e.g., *"A customer can pay with one type of credit card"* and *"A customer can pay with two additional credit card types"*) [5].
  3. **Provide dual/conditional estimates:** If combining or splitting is impractical, annotate the card with two estimates: one if implemented first, and a lower estimate if implemented second [7].

---

##### 2. Negotiable (N)
* **The Failure:** The story card is written like an explicit, rigid contract or detailed specification (e.g., IEEE 830 style), containing excessive UI/technical instructions rather than acting as a placeholder for a conversation [7-11].
* **Concrete Fixes:**
  1. **Strip excessive front-card detail:** Keep only short summary phrases and high-level questions on the front of the card to remind the team to discuss details later [11-13].
  2. **Move specifics to acceptance tests:** Shift concrete rules and edge-case assumptions to the back of the card in the form of test cases/acceptance criteria [12-16].
  3. **Use flexible discussion formats:** Frame stories using flexible templates (such as the Connextra *"As a... I want... So that..."* template), phrase them as user questions, or add *"Whereas currently..."* clauses to focus on dialogue rather than fixed solutions [17-19].

---

##### 3. Valuable (V)
* **The Failure:** The story reflects developer-centric technical tasks or system internals (e.g., *"All connections to the database use a connection pool"* or *"Refactor Login class"*) that have no apparent value to end-users or purchasers, leaving business stakeholders unable to prioritize them [20-24].
* **Concrete Fixes:**
  1. **Rewrite in terms of user/purchaser outcomes:** Reframe technical needs to highlight observable benefits (e.g., rewrite connection pooling as *"A user can start the application without a noticeable lag while connecting to the database"* or *"Up to fifty users can use the application with a five-user license"*) [20, 25].
  2. **Have business stakeholders write the stories:** Shift writing responsibility to customers or product owners, and restrict target user segments/roles per milestone to eliminate generic (*"As a user..."*) or fake (*"As an LDAP server..."*) stories [26-28].
  3. **Slice by outputs rather than inputs/infrastructure:** Deliver valuable outputs (e.g., summary reports) first using hardcoded reference data or existing legacy components, deferring complex input integrations to subsequent stories [29, 30].
  4. **Split by examples of usefulness:** Use techniques like the *Good-Better-Best* framework or separate *learning stories* (proving assumptions) from *earning stories* (delivering user value) [31-33].

---

##### 4. Estimable / Estimatable (E)
* **The Failure:** Developers cannot estimate the story due to a lack of domain knowledge, a lack of technical knowledge, or extreme complexity/uncertainty [34, 35].
* **Concrete Fixes:**
  1. **Run a timeboxed Spike (Extreme Programming Spike):** Split the unestimatable story into two distinct stories: a timeboxed investigative spike (e.g., *"Investigate credit card processing over the web"*) and a functional implementation story [34, 36-39].
  2. **Schedule the spike in an earlier iteration:** Place the investigative spike in the current iteration to reduce "unknown unknowns," allowing the functional story to be estimated accurately in a subsequent iteration [40-43].
  3. **Disaggregate compound stories:** Break large, multi-part stories down until the constituent parts are clear enough to estimate [40].

---

##### 5. Small (S)
* **The Failure:** 
  * **Too Large (Compound or Complex):** High uncertainty and excessive story points that exceed sprint velocity [40, 44, 45].
  * **Too Small:** Tiny UI tweaks or bug fixes where writing and estimating the card takes longer than making the actual code change [46].
* **Concrete Fixes:**
  1. **Disaggregate compound stories:** Break large stories apart along functional/CRUD boundaries (e.g., split create, edit, and delete) or data boundaries (e.g., split education history vs. job history) [40]. You can also split basic search from advanced search, or slice across workflow steps using the *hamburger method* [47-49].
  2. **Split complex stories:** Separate technical research (spike) from functional implementation [38, 40].
  3. **Combine tiny stories:** Group multiple minor bugs or UI changes onto a single card (or staple them together) estimated collectively as a half-day to several days of work [6, 46].

---

##### 6. Testable (T)
* **The Failure:** Requirements are vague, subjective, or non-functional statements lacking clear completion criteria (e.g., *"A user must find the software easy to use"* or *"A user must never wait long for any screen"*) [50, 51].
* **Concrete Fixes:**
  1. **Define concrete acceptance criteria:** Rewrite vague goals into explicit, measurable test cases noted on the back of the card (including exact pass/fail inputs, performance thresholds, or step-by-step verification procedures) [1, 12, 15, 16, 51, 52].
  2. **Automate acceptance tests:** Establish automated tests covering the acceptance criteria to verify completion and catch regressions early [10, 51].
  3. **Convert to Constraint Cards:** For system-wide non-functional requirements (e.g., *"The software must run on all versions of Windows"*), capture them as **Constraint Cards** taped to the wall or verified via automated build tests rather than scheduling them as standard feature stories [53].

---

##### Handling Conflicts Between Criteria: Independent & Valuable vs. Small

A common structural tension in the INVEST model exists between **Independent & Valuable** on one side and **Small** on the other [54]. When delivery teams prioritize **Small** over **Valuable**, they often slice stories along technical layers (e.g., splitting a feature into *"build the UI form"* and *"write form data to database"*) [54, 55]. This creates **technical micro-stories** or fake stories that carry no independent user value and disconnect the development team from business goals [54, 56, 57].

The sources recommend managing this conflict through four principles:

1. **Prioritize Value Over Slicing Size:** Never sacrifice user value purely to make a story fit an arbitrary size threshold [54, 58]. A story must always represent a thin, end-to-end slice of functionality that delivers an observable outcome [55, 59].
2. **Treat Stories as "Survivable Experiments":** Instead of slicing a story until it becomes an empty technical task, frame large stories as small, survivable experiments designed to validate specific business assumptions [60, 61]. Quantify expected changes in behavior (e.g., *"speed up import by 20%"*) so that delivering a smaller subset (e.g., a 5% speedup) remains genuinely valuable [59].
3. **Slice Vertically by Output and User Segment:** To reduce size while preserving value and independence, slice vertically across all architectural layers by:
   * Slicing by **end outputs** (delivering a single summary report first) [29].
   * Slicing by **user roles or segments** (focusing on one target persona per milestone, such as social media users) [62, 63].
   * Using **hardcoded/dummy reference data** initially to deliver front-end value before connecting live databases [30].
4. **Combine Small Dependent Stories:** If splitting a story destroys its independence and creates tight inter-dependencies across sprint backlogs, combine those dependent pieces into a slightly larger, independent story [5, 6].

---

💡 *Would you like to explore a concrete example from your product backlog or create a quick reference guide on story splitting techniques?*

**Citations**

| # | Source | Cited passage |
|---|---|---|
| 1 | Olsen, The Lean Product Playbook | Here’s an example of a user story that follows this template: As a professional photographer, I want to easily upload pictures from my camera to my website, so that I can quickly show my clients their pictures. This template is a good start, but writing good user stories is an acquired skill. Agile thought leader Bill … |
| 2 | Cohn, User Stories Applied (2004) | Chapter 2. Writing Stories In this chapter we turn our attention to writing the stories. To create good stories we focus on six attributes. A good story is: Independent Negotiable Valuable to users or customers Estimatable Small Testable Bill Wake, author of Extreme Programming Explored and Refactoring Workbook, has … |
| 3 | Cohn, User Stories Applied (2004) | prioritization and planning problems. For example, suppose the customer has selected as high priority a story that is dependent on a story that is low priority. Dependencies between stories can also make estimation much harder than it needs to be. For example, suppose we are working on the BigMoneyJobs website and … |
| 4 | Cohn, User Stories Applied (2004) | A company can pay for a job posting with an American Express card.3. Suppose the developers estimate that it will take three days to support the first credit card type (regardless of which it is) and then one day each for the second and third. With highly dependent stories such as these you don't know what estimate to … |
| 5 | Cohn, User Stories Applied (2004) | Find a different way of splitting the stories Combining the stories about the different credit card types into a single large story ("A company can pay for a job posting with a credit card") works well in this case because the combined story is only five days long. If the combined story is much longer than that, a … |
| 6 | Cohn, User Stories Applied (2004) | assigned to a small story can change dramatically depending on the order in which the story is implemented. For example, consider these two small stories: Search results may be saved to an XML file. Search results may be saved to an HTML file. There is clearly a great deal of overlapping work between these two … |
| 7 | Cohn, User Stories Applied (2004) | A customer can pay with two additional types of credit cards.2. If you don't want to combine the stories and can't find a good way to split them, you can always take the simple approach of putting two estimates on the card: one estimate if the story is done before the other story, a lower estimate if it is done after. … |
| 8 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | User stories are often misunderstood as lightweight requirements, given by the business stakeholders to the delivery team. This misunderstanding leads to stories being collected in a task management tool, with a ton of detail written down by business representatives. Except in the very rare case where the business … |
| 9 | Cohn, User Stories Applied (2004) | everyone can support, and maintaining that balance for months or years are all difficult problems. The solution Mike Cohn explores in this book, User Stories Applied, is superficially the same as previous attempts to solve this problem—requirements, use cases, and scenarios. What's so complicated? You write down what … |
| 10 | Cohn, User Stories Applied (2004) | User stories are comprehensible by both you and the developers. User stories are the right size for planning. User stories work for iterative development. User stories encourage deferring detail until you have the best understanding you are going to have about what you really need. Because user stories shift emphasis … |
| 11 | Cohn, User Stories Applied (2004) | of functionality, the details of which are to be negotiated in a conversation between the customer and the development team. Because story cards are reminders to have a conversation rather than fully detailed requirements themselves, they do not need to include all relevant details. However, if at the time the story … |
| 12 | Cohn, User Stories Applied (2004) | prove whether or not it works as expected. Story Card 2.3. The revised front of a story card with only the story and questions to be discussed. < Day Day Up > < Day Day Up > Valuable to Purchasers or Users It is tempting to say something along the lines of "Each story must be valued by the users." But that would be … |
| 13 | Cohn, User Stories Applied (2004) | That is, have a conversation about the details at the point when the details become important. There's nothing wrong with making a few annotations on a story card based on a discussion, as shown in Story Card 1.2. However, the conversation is the key, not the note on the story card. Neither the developers nor the … |
| 14 | Cohn, User Stories Applied (2004) | of three aspects: a written description of the story used for planning and as a reminder conversations about the story that serve to flesh out the details of the story tests that convey and document details and that can be used to determine when a story is complete Because user story descriptions are traditionally … |
| 15 | Cohn, User Stories Applied (2004) | expectations are communicated earlier to the developers. For example, suppose you write the story "A user can pay for the items in her shopping cart with a credit card." You then write these simple tests on the back of that story card: Test with Visa, MasterCard and American Express (pass). Test with Diner's Club … |
| 16 | Cohn, User Stories Applied (2004) | may have the following written on the back of its card: Test with Visa, MasterCard and American Express (pass). Test with Diner's Club (fail). Test with good, bad and missing card ID numbers. Test with expired cards. Test with different purchase amounts (including one over the card's limit). These test notes capture … |
| 17 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | When we wrote this, Gojko was working on a product milestone that was mostly about helping users obtain information more easily. Most user stories for the milestone were captured as examples of questions people would be able to answer, such as: ‘How much potential cash is there in blocked projects?’ and ‘What is the … |
| 18 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | Clarifying the change is a valid and useful step in the refinement of the story. In some cases the process of identifying the extent of the change can help in splitting larger stories. How to make it work Start the discussion by adding another clause to the story template, starting with ‘Whereas currently…’ or … |
| 19 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | The Connextra card template (‘As a… I want … So that’) is a great structure for a discussion token. It proposes a deliverable and puts it in the context of a stakeholder benefit, which helps immensely with the discussion. But that’s not the only way to start a good conversation. As long as the story card stimulates a … |
| 20 | Cohn, User Stories Applied (2004) | these stories are good ones but they should instead be written so that the benefits to the customers or the user are apparent. This will allow the customer to intelligently prioritize these stories into the development schedule. Better variations of these stories could be the following: Up to fifty users should be … |
| 21 | Cohn, User Stories Applied (2004) | that she wants. Also, it may be difficult to prioritize stories if they have not been written to express business value. For example, suppose the customer is presented with these stories: A user connects to the database via a connection pool. A user can view detailed error information in a log file. Stories like these … |
| 22 | Cohn, User Stories Applied (2004) | For consistency, many of the examples throughout the rest of this book will be for the BigMoneyJobs website. Other sample stories for BigMoneyJobs might include: A user can search for jobs. A company can post new job openings. A user can limit who can see her resume. Because user stories represent functionality that … |
| 23 | Cohn, User Stories Applied (2004) | The first example is not a good user story for BigMoneyJobs because its users would not care which programming language was used. However, if this were an application programming interface, then the user of that system (herself a programmer) could very well have written that "the software will be written in C++." The … |
| 24 | Cohn, User Stories Applied (2004) | users: Throughout the development process, the development team will produce documentation suitable for an ISO 9001 audit. The development team will produce the software in accordance with CMM Level 3. What you want to avoid are stories that are only valued by developers. For example, avoid stories like these: All … |
| 25 | Cohn, User Stories Applied (2004) | knowledge, which is why the best recommendation is to have the customer write the stories herself. For example, consider these rewritten versions of the preceding stories: A user can start the application without a noticeable lag while connecting to the database. Whenever an error occurs, users are given enough … |
| 26 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | When business stakeholders aren’t experienced with iterative delivery, plans based on user stories often turn into streams of consciousness. Anything goes, stories even get reverse-engineered from feature ideas. A common result is that stakeholders feel that they constantly get small improvements, but the delivery … |
| 27 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | Key benefits Selecting a limited number of target segments for each milestone prevents stakeholders from constantly inventing new user roles. This makes people think twice when writing stories to justify pet features, and results in better, more focused stories. Forcing people to seriously consider which user segment … |
| 28 | Cohn, User Stories Applied (2004) | assumptions out of stories. For example, the revised stories above have removed the implicit use of a connection pool and a set of error handling classes. The best way to ensure that each story is valuable to the customer or users is to have the customer write the stories. Customers are often uncomfortable with this … |
| 29 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | Chris Matts popularised the idea that the value of an IT system is mostly in the outputs it produces, and that the inputs are just means to an end. Instead of thinking about workflows linearly, think about the outputs first. Instead of thinking about the log-in screen, think about the reports. Instead of slicing the … |
| 30 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | The real value of software is mostly in its outputs, not in its inputs. An interesting strategy for splitting stories while preserving most of the value is to avoid any work around preparing inputs at first. This particularly applies to reference data. Instead of loading such data from the official sources … |
| 31 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | A good way to deal with such situations is to explicitly split the research tasks into a separate story with a goal of its own. A helpful way of thinking about this is that a story should be either about learning or earning. Learning stories help stakeholders plan better. Earning stories help to deliver value to … |
| 32 | Patton, User Story Mapping | In a traditional software process, that “inspecting and removing” stuff would be called bad requirements. But, when you’ve got your Agile hat on, it’s just learning and iterative improvement. Play Good-Better-Best One of my favorite simple techniques for splitting stories more finally is the Good-Better-Best game. We … |
| 33 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | After that, we tackled collaboration, larger maps, mobile users, then more complex interaction such as image drag-and-drop. Each of these areas was driven by some nice examples of usefulness. Instead of building features up until all users could be switched over, we enabled a subgroup of our users to get part of the … |
| 34 | Cohn, User Stories Applied (2004) | estimate the task. The solution in this case is to send one or more developers on what Extreme Programming calls a spike, which is a brief experiment to learn about an area of the application. During the spike the developers learn just enough that they can estimate the task. The spike itself is always given a defined … |
| 35 | Cohn, User Stories Applied (2004) | they become comfortable with the concept that story cards are reminders to talk later rather than formal commitments or descriptions of specific functionality. < Day Day Up > < Day Day Up > Estimatable It is important for developers to be able to estimate (or at least take a guess at) the size of a story or the amount … |
| 36 | Bland, Testing Business Ideas (2019) | Split Test p. 270 Run a Split Test in your product to test out different methods of addressing the anchors. Sales Force Feedback p. 138 Use sales force feedback to inform areas of improvement for your product. Extreme Programming Spike p. 306 Conduct a spike to better understand how to address the gaps between your … |
| 37 | Bland, Testing Business Ideas (2019) | Evidence Acceptance criteria The acceptance criteria defined for the spike was sufficiently met. Did the code perform the task and generate the output required? Recommendation The people working on the spike provide their recommendation on how steep of a learning curve it is to use the software and if it is fit for … |
| 38 | Cohn, User Stories Applied (2004) | investigative and one developing the new feature. For example, suppose the developers are given the story "A company can pay for a job posting with a credit card" but none of the developers has ever done credit card processing before. They may choose to split the stories like this: Investigate credit card processing … |
| 39 | Bland, Testing Business Ideas (2019) | P O P -U P S T O R E S IM U LA T IO N 306 COST SETUP TIME CAPABILITIES Product / Technology / Data EVIDENCE STRENGTH RUN TIME DESIRABILITY · FEASIBILITY · VIABILITY The Extreme Programming Spike is ideal for quickly evaluating whether or not your solution is feasible, usually with software. The Extreme Programming … |
| 40 | Cohn, User Stories Applied (2004) | about how much can be accomplished in that iteration. The key benefit of breaking out a story that cannot be estimated is that it allows the customer to prioritize the research separately from the new functionality. If the customer has only the complex story to prioritize ("Add novel extensions to standard expectation … |
| 41 | Olsen, The Lean Product Playbook | There are known knowns. There are things we know we know. We also know there are known unknowns. That is to say, we know there are some things we do not know. But there are also unknown unknowns. The ones we don’t know we don’t know. When developers are asked to estimate the effort for a task, they take into account … |
| 42 | Olsen, The Lean Product Playbook | Let’s say I estimate that task A will take me five minutes and task B will take me five months. Both tasks could have unknown unknowns. But the uncertainty is nonlinear with increasing scope, as the top curve of the cone of uncertainty suggests. The chances that the five-minute task will spiral out of control are … |
| 43 | Cohn, User Stories Applied (2004) | product. In situations like this one it is difficult to estimate how long the research story will take. Consider Putting the Spike in a Different Iteration When possible, it works well to put the investigative story in one iteration and the other stories in one or more subsequent iterations. Normally, only the … |
| 44 | Olsen, The Lean Product Playbook | estimated. Small: Good stories tend to be small in scope. Larger stories will have greater uncertainty, so you should break them down. Testable: A good story provides enough information to make it clear how to test that the story is “done” (called acceptance criteria). Specify Your Minimum Viable Product (MVP) Feature … |
| 45 | Olsen, The Lean Product Playbook | A good operating principle is that stories that are estimated to require a large number of points—above some maximum threshold value—need to be broken down into a set of smaller stories that are below the threshold value. You can think of a feature chunk as corresponding to a user story that has an acceptably small … |
| 46 | Cohn, User Stories Applied (2004) | feasibility of extending expectation maximization") and a functional story ("extend expectation maximization"), she must choose between adding the investigative story that adds no new functionality this iteration and perhaps some other story that does. Combining Stories Sometimes stories are too small. A story that is … |
| 47 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | When stakeholders are aware of the plan upfront, such problems do not happen. For example, we’ve used this method with a large bank that had to solve a critical reporting problem, and the business stakeholders were amazed that the team could ship something in two days and get the regulators off their back, even though … |
| 48 | Cohn, User Stories Applied (2004) | story was split into three: one story for searching by author or title, another for searching by publication name or date, and a third allowing for the criteria to be combined. Story Card 9.2. Search criteria. < Day Day Up > < Day Day Up > Risky Stories Looking back over earlier approaches to software development, it … |
| 49 | Cohn, User Stories Applied (2004) | impact on the estimate, it's worth asking her. Naturally Lori says she wants both. She wants a basic search mode where the value in one field searches both author and title. She then wants an advanced search screen where any or all of these fields can be used in combination. Even with both search modes the story isn't … |
| 50 | Cohn, User Stories Applied (2004) | stapling them together with a cover card. < Day Day Up > < Day Day Up > Testable Stories must be written so as to be testable. Successfully passing its tests proves that a story has been successfully developed. If the story cannot be tested, how can the developers know when they have finished coding? Untestable … |
| 51 | Cohn, User Stories Applied (2004) | A user must find the software easy to use. A user must never have to wait long for any screen to appear. As written, these stories are not testable. Whenever possible, tests should be automated. This means strive for 99% automation, not 10%. You can almost always automate more than you think you can. When a product is … |
| 52 | Patton, User Story Mapping | Let me say this again, because it’s an important point: Story conversations are about working together to arrive at a best solution to a problem we both understand. 3. Confirmation All this talking is cool, but we’ve eventually got to build some software—right? So, when we feel like we’re converging on a good … |
| 53 | Cohn, User Stories Applied (2004) | The software must run on all versions of Windows. The system will achieve uptime of 99.999%. The software will be easy to use. Even though constraint cards do not get estimated and scheduled into iterations like normal cards, they are still useful. Minimally, constraint cards can be taped to the wall where they act as … |
| 54 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | Describe a behaviour change Bill Wake’s INVEST set of user story characteristics has two conflicting forces. Independent and valuable are often difficult to reconcile with small. The value of software is a vague and esoteric concept in the domain of business users, but task size is under the control of a delivery … |
| 55 | Cohn, User Stories Applied (2004) | simply too large to fit in the current iteration and must be split. The developers may want to split it along technical boundaries, such as: A Job Seeker can fill out a resume form. Information on a resume form is written to the database. In this case, one story would be done in the current iteration while the other … |
| 56 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | We recently worked with a team that was struggling to describe acceptance criteria for a user story that was mostly about splitting a background process into two. The story was perceived to be of value because the business stakeholders had asked for it. It was a strange situation, because the story was purely … |
| 57 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | When the user need of a story is in the zone of control of the delivery group, the story is effectively a task without risk, which should raise alarm bells. There are three common scenarios: The story might be fake, micro-story or misleading. Fake stories are those about the needs of delivery team members. For … |
| 58 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | In markets with a high degree of certainty, where business sponsors can perfectly predict the future, where there is no competition, where the entire ecosystem is under strict control and the end-users are a captive audience whose personal opinions have no influence on the outcome, iterative delivery simply doesn’t … |
| 59 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | A measurable behaviour change makes stories easier to split, because there is one more dimension to discuss. For example, if the behaviour change is ‘import contacts 20% faster’, offering a small subset of functionality that speeds up importing by 5% is still valuable. How to make it work Try to quantify expected … |
| 60 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | Key benefits Small user stories can help product managers discover what really needs to be built without rushing too far forward under unvalidated assumptions, and help business sponsors manage their investment in software and get the most out of it. That’s how we should sell them, not as small chunks of work. By … |
| 61 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | Looking at stories as survivable experiments also solves many problems around story splitting and sizing. If a story is too big, which effectively means the potential cost of the experiment is too high, we can look at alternative ways of learning about something instead of just trying to slice the story. Small, … |
| 62 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | A team we recently worked with was restructuring the sign-up process for their product, allowing users to log on through social media accounts. The stakeholders identified Twitter and Facebook users as important segments for this milestone, and agreed that everything else could be postponed. During a discussion about … |
| 63 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | Lastly, a fixed set of roles helps to reduce the scope of stories and earlier delivery of value. How to make it work Think small: instead of a larger milestone that addresses the needs of five target user groups, think about five smaller milestones aimed at a single target segment each. Is there a group that could … |

---
## store-phase-3-formulieren-3: What pitfalls and checks apply when placing a story under an epic in the story map (no fitting step, spanning steps, epic vs story)?

- asked 2026-10-04 · notebook "The Product - Business Design" · conversation `058b9f3e-3826-415b-97a5-eeab7273b431`
- Sources: Patton, User Story Mapping; Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014); Olsen, The Lean Product Playbook; Cohn, User Stories Applied (2004); Kalbach, Mapping Experiences (2020)
- Note: cited passages are excerpted (the harness result was inline; the FAQ table shortens them anyway)

**Question**

> According to the sources, what pitfalls and checks apply when placing a new user story under an existing epic or backbone activity in a user story map: what to do when the story fits no existing backbone step or spans several, how to tell an epic from a story, and what are the pitfalls (e.g. mapping by system component instead of user activity, confusing milestones with epics)? Please cite the sources and keep the answer focused.

**Answer** (verbatim, citation markers resolve in the table below)

When organizing a user story map or agile backlog, placing new stories beneath existing backbone activities or epics involves specific checks, structural adjustments, and safeguards against common mapping mistakes.

---

##### 1. Handling Edge Cases During Story Placement

* **When a story fits no existing backbone step:**
  * **Identify gaps in understanding:** If a new story does not align with any current step on the horizontal axis, it usually reveals a "hole in your story"—a missing interaction or step in the user journey [1]. Rather than treating this as unwanted scope creep, agile mapping principles hold that *scope doesn't creep; understanding grows* [2].
  * **Update the backbone:** Expand the map's horizontal axis by inserting a new high-level step or activity into the narrative flow to represent the newly discovered step in the customer experience [1, 3].
  * **Validate against target personas and goals:** Check whether the story represents a genuine user need or an unjustified "pet feature" [4, 5]. If the story relies on a generic role or does not serve the pre-selected target user segments for the upcoming milestone, challenge it and defer or discard it [4-6].

* **When a story spans several backbone steps or activities:**
  * **Recognize as a compound story / Epic:** A story that crosses multiple activities is too broad to sit under a single column—it is an **Epic** or compound story [7-10].
  * **Disaggregate and "slice the cake":** Deconstruct the large story into smaller, narrower user tasks/stories positioned vertically under their respective backbone steps [8, 9, 11]. Ensure each split story represents an end-to-end "slice of cake" (crossing necessary architectural layers to deliver standalone user value) rather than splitting by technical tier (e.g., UI separate from database) [12, 13].
  * **Handle global cross-cutting concerns separately:** If the story represents an overarching architectural or non-functional requirement (such as security, capacity, or performance), do not force it under a single user activity [14-16]. Instead, manage it across the backlog as acceptance criteria, explicit constraint cards, or dedicated learning/spike stories [14-17].

---

##### 2. Distinguishing an Epic from a User Story

| Dimension | Epic | User Story |
| :--- | :--- | :--- |
| **Size & Scope** | A large, high-level story (a "boulder" or "big rock") that contains significant uncertainty and **cannot fit into a single iteration/sprint** [7, 8, 10, 18]. | A "right-sized" functional item that can be estimated, coded, and tested **within a single sprint** [7, 8, 10, 19]. |
| **Lifecycle & Purpose** | Serves as a high-level **placeholder or summary** during early planning to defer detail [20-22]. When ready for delivery, it is broken down ("disaggregated") into constituent stories [8, 9, 20, 23]. | Serves as a **reminder for detailed conversation** between the team and stakeholders, driving immediate implementation [24-26]. |
| **Position on Map** | Positioned along the **top horizontal axis (backbone)** as high-level activities or major workflow steps [3, 27-29]. | Positioned in the **body of the map (vertical columns)** under its corresponding activity/epic, prioritized by release schedule [27, 28, 30]. |

---

##### 3. Key Pitfalls in Story Mapping & Backlog Management

* **Mapping by system component instead of user activity:**
  * *The Pitfall:* Structuring the map or writing stories around technical modules/architecture (e.g., "database", "API", "billing service") rather than user-centric journeys [31, 32].
  * *The Risk:* Leads to "fake stories" written from system viewpoints ("As an LDAP server...") [5, 33]. This creates technical silos and deliverables that do not provide independent value to end users [12, 13, 33].

* **Confusing milestones with epics:**
  * *The Pitfall:* Using "epic" as a label for an entire subject area or feature module (such as "reporting" or "dashboard") and assuming an epic must be 100% completed before moving on [34].
  * *The Risk:* Results in bloated, delayed releases. **Milestones** should reflect cohesive product increments defined by business outcomes, taking thin, high-priority "slices" across multiple epics rather than executing whole epics sequentially [34-36].

* **Relying on generic roles ("As a user..."):**
  * *The Pitfall:* Using unspecific user roles or inventing arbitrary user segments to justify pet features or unnecessary scope [4, 5].
  * *The Risk:* Dilutes product focus. Effective story mapping requires restricting each milestone to a small, pre-selected group of target personas [37, 38].

* **Falling into the "flat backlog" trap:**
  * *The Pitfall:* Managing requirements solely as a linear, one-dimensional prioritized list rather than a visual story map [24, 39, 40].
  * *The Risk:* Obscures the narrative flow of the customer journey, making it easy to miss critical intermediate steps or context needed for a complete user experience [1, 39, 40].

---

💡 *Would you like me to create a structured comparison table or cheat sheet summarizing these story mapping guidelines and story-splitting strategies for your team?*

**Citations**

| # | Source | Cited passage |
|---|---|---|
| 1 | Patton, User Story Mapping | For this big system, that narrative flow has to cut through many different users’ and systems’ stories. [...] Mapping Helps You Spot Holes in Your Story When I talk with people who have built story maps, they’ll tell me, “Every time we do this we find holes. We find things that we thought another team should be taking … |
| 2 | Patton, User Story Mapping | One of the criticisms people sometimes make about story mapping is that every time they sit down and create story maps, they end up with way too much. But it’s my belief that we’re just finding the stuff now that would have bitten us later on [...] I personally believe that scope doesn’t creep; understanding grows. |
| 3 | Patton, User Story Mapping | Activities aggregate tasks directed at a common goal. Here’s my growing map with activities added to give the map a backbone. [...] Activities and high-level tasks form the backbone of a story map. |
| 4 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | Using generic roles is often a get-out-of-jail-free card for people who want to push in pet features, or unjustified scope. For example, a team we recently worked with had a story ‘As a user I want to log in through social networks in order not to remember another username and password’. |
| 5 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | Such stories can be easily spotted because they specify a completely generic user segment (‘As a user…’) or even a system component (‘As an LDAP server…’). |
| 6 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | The stakeholders identified Twitter and Facebook users as important segments for this milestone, and agreed that everything else could be postponed. [...] Without a pre-selected set of roles, it would not have been easy to argue about postponing the work which at the end turned out to be unnecessary. |
| 7 | Olsen, The Lean Product Playbook | Stories that are too big to complete in one iteration are called epics, which must be broken down before they can be accepted into a sprint. |
| 8 | Cohn, User Stories Applied (2004) | When a story is too large it is sometimes referred to as an epic. Epics can be split into two or more stories of smaller size. |
| 9 | Cohn, User Stories Applied (2004) | The compound story A compound story is an epic that comprises multiple shorter stories. |
| 10 | Patton, User Story Mapping | Epics Are Big Rocks Sometimes Used to Hit People Epic is a common term [...] used to describe big user stories, sort of like boulder is a good term for a big rock. |
| 11 | Patton, User Story Mapping | Conversations are one of the best tools for breaking down big stories. |
| 12 | Cohn, User Stories Applied (2004) | The developers may want to split it along technical boundaries, such as: A Job Seeker can fill out a resume form. Information on a resume form is written to the database. [...] The problem with this is that neither story on its own is very useful to users. |
| 13 | Cohn, User Stories Applied (2004) | A far better approach is to write the replacement stories such that each provides some level of end–to–end functionality. Bill Wake (2003a) refers to this as "slicing the cake." Each story must have a little from each layer. |
| 14 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | User stories generally bring small iterative enhancements, so they are not particularly well suited for addressing global cross-cutting concerns such as capacity, performance and security. |
| 15 | Patton, User Story Mapping | Play “What-About” You’ve imagined the solution from a user’s perspective [...] Add stories into the map that name these parts. Or make sure you make notes on the stories you have. |
| 16 | Cohn, User Stories Applied (2004) | Create constraint cards and either tape them to a shared wall or write tests to ensure the constraints are not violated. |
| 17 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | A good way to deal with such situations is to explicitly split the research tasks into a separate story with a goal of its own. A helpful way of thinking about this is that a story should be either about learning or earning. |
| 18 | Cohn, User Stories Applied (2004) | For example, in a travel reservation system, "A user can plan a vacation" is an epic. [...] The epic should be split into smaller stories. |
| 19 | Cohn, User Stories Applied (2004) | User stories [...] are the right size for planning. Planning, as well as programming and testing, can be completed with stories without further aggregation or disaggregation. |
| 20 | Cohn, User Stories Applied (2004) | For a feature that you want eventually but that isn't important right now, you can first write a large story (an epic). When you're ready to add that story into the system you can refine it by ripping up the epic and replacing it with smaller stories that will be easier to work with. |
| 21 | Cohn, User Stories Applied (2004) | they serve as placeholders or reminders about big parts of a system that need to be discussed. If you are making a conscious decision to temporarily gloss over large parts of a system, then consider writing an epic or two that cover those parts. |
| 22 | Cohn, User Stories Applied (2004) | Areas of less importance, or that won't be developed initially, may easily be left as epics, while other stories are written with more detail. |
| 23 | Cohn, User Stories Applied (2004) | The key benefit of breaking out a story that cannot be estimated is that it allows the customer to prioritize the research separately from the new functionality. |
| 24 | Patton, User Story Mapping | The original idea of stories was a simple one. It turned our focus away from shared documents and toward shared understanding. A common way to use stories is to build a list of them, prioritize them, and begin talking about them [...] But it can create some big problems. |
| 25 | Cohn, User Stories Applied (2004) | User stories are written to facilitate release planning and to serve as reminders to fill in [details]. |
| 26 | Cohn, User Stories Applied (2004) | Story Card 2.3. The revised front of a story card with only the story and questions to be discussed. |
| 27 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | A story map is a grid where the horizontal axis represents steps in a high-level user activity, and the vertical axis represents the software delivery schedule (releases or milestones). User stories are grouped in the grid based on the activity or workflow step they contribute to. |
| 28 | Kalbach, Mapping Experiences (2020) | User types. A brief description of the different roles the system is designed for. Backbone. A sequence of user activities, listed across the top of the diagram. [...] User stories. The body of the map contains stories needed to achieve the desired outcomes. |
| 29 | Patton, User Story Mapping | If you use one of the available tools that help organize groups of Agile stories, it may support the concept of bundling stories up into a theme. [...] The terms epic and theme have found their way into Agile lifecycle management tools. |
| 30 | Patton, User Story Mapping | Building a map is dead simple. [...] writing each big step the users take in the story on sticky notes in a left-to-right flow. Then, we’ll go back and talk about the details of each step, and write those details down on sticky notes and place them vertically under each step. |
| 31 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | How to make it work Create story maps for key user activities – not for software solutions. For example, purchasing a book, booking a venue or attending a concert are good activities to map out. |
| 32 | Patton, User Story Mapping | Instead of a module-centric view that doesn’t lend itself to iterative development, we now had a usage-centric approach that could be sliced into cross-module releases. |
| 33 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | Fake stories are those about the needs of delivery team members. For example, ‘As a QA, in order to test faster, I want the database server restarts to be automated’. |
| 34 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | Don’t confuse milestones with epics. True epics are simply large stories that satisfy all the other INVEST criteria but are too large to be implemented in a single iteration. However the term is often used (or misused) to represent the whole of a subject area or topic, such as ‘reporting’ or ‘dashboard’ or … |
| 35 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | Like a story, a milestone represents an increment in business value, and clearly articulating the value that each milestone represents is essential for engaging stakeholders in practical discussions about the details of what belongs inside or outside the scope of each milestone. |
| 36 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | Milestones, therefore, should describe noteworthy points where a cohesive product increment could be delivered. [...] It can also mean including the juiciest slices of several epics, leaving the other slices for later milestones. |
| 37 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | If you find yourself in this situation, a good trick is to try to limit the number of user segments targeted in a particular milestone. At the start of each milestone, let stakeholders pick target segments first. |
| 38 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | Selecting a limited number of target segments for each milestone prevents stakeholders from constantly inventing new user roles. |
| 39 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | The user story map, invented by Jeff Patton, is a popular way of organising hierarchical backlogs. [...] User story maps connect software deliverables to customer journeys and business workflows. |
| 40 | Patton, User Story Mapping | it’s easy to lose the big picture of what a software system should do. You can end up with a jumble of pieces that don’t fit into a coherent whole. [...] Story mapping is a technique that provides the big picture that a pile of stories so often misses. |

---
## store-phase-3-formulieren-4: How is the Connextra 'so that' benefit made concrete and measurable, with good and bad example stories?

- asked 2026-10-04 · notebook "The Product - Business Design" · conversation `f48885a9-98ae-491f-9438-d3024c7a82fd`
- Sources: Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014); Olsen, The Lean Product Playbook; Product School, The Product Book (2017); Richter, The Product Manager's Playbook (2023); Cohn, User Stories Applied (2004)
- Note: cited passages are excerpted (the harness result was inline; the FAQ table shortens them anyway)

**Question**

> According to the sources, how do you write the 'so that' benefit of a Connextra user story so that it is concrete and measurable (behaviour change, measurable target), and what are good versus bad examples of the 'As a / I want / so that' clauses? Please give concrete example stories from the sources with citations.

**Answer** (verbatim, citation markers resolve in the table below)

In the classic Connextra template — **"As a [type of user], I want [capability/action], so that [benefit]"** (sometimes inverted as *"In order to [benefit], as a [role], I want [capability]"*) — the **'so that' / benefit clause** defines the core business value and context for discussion [1-3].

---

##### How to Write a Concrete & Measurable 'So That' Benefit

To make the benefit concrete and measurable, the sources highlight five key practices:

1. **Describe an Observable Behaviour Change**: Avoid generic value claims like *"in order to improve business"* or *"in order to sell more"* [4]. Ground the benefit in a real, observable change in how someone works or behaves — specifying what users will be able to do differently, speed up, or prevent [5, 6].
2. **Quantify the Target ("How Much?")**: Make the outcome measurable by asking **"How much?"** [7, 8]. Define discrete metrics or target ranges (e.g., *"monitor inventory 50% faster"* or *"import contacts 20% faster"*) rather than vague statements like *"faster"* or *"better"* [4, 8, 9].
3. **Write from the Customer Perspective using Active Verbs**: Frame benefits from the user's viewpoint (using *"I"* or *"my"*) starting with directional verbs like *reduce*, *increase*, *maximize*, *save*, or *avoid* [10]. Focus on increasing desired outcomes or decreasing unwanted friction, risk, or time [10].
4. **Keep Technical Solutions Out of the Benefit Clause**: The 'so that' section must state **why** the user needs something, not **how** the software implements it [6, 11]. Placing database optimizations, API details, or technical features into the benefit clause distorts the story's purpose [6, 12].
5. **Ensure Post-Delivery Testability**: Write the benefit so that the business outcome can be verified with real users post-launch, rather than just checking if the code passed functional unit tests [7, 13].

---

##### Good vs. Bad Patterns in Connextra Clauses

| Clause | Good Practice | Bad / Anti-Pattern Practice |
| :--- | :--- | :--- |
| **As a [role]** | Specifies a real, distinct user segment or persona (e.g., *Job Seeker*, *Frequent Traveler*, *Dropcam user*) [14-17]. | Generic roles like *"As a user"* [14], or fake roles representing internal delivery team members or systems (*"As a QA"*, *"As a remote API"*) [14, 18]. |
| **I want [action]** | Focuses on a user goal, capability, or problem statement while keeping the technical solution flexible [11, 16, 19]. | Specifies technical implementation details or UI code (*"use Log4J"*, *"connect via a connection pool"*) [20-23]. |
| **So that [benefit]** | Defines a concrete, quantifiable outcome or behavior change (*"resolve customer data discrepancies faster"*, *"find products within budget"*) [4, 12, 15]. | Vague business claims (*"improve business"*), technical outputs (*"run database query faster"*), or circular logic where the benefit repeats the action (*"so that I can log in"*) [4, 12, 24]. |

---

##### Concrete Examples from the Sources

###### **Good User Story Examples**

* **Measurable E-Commerce / Consumer Benefit**:
  > *"As a Dropcam user worried about the security of my business, I want to quickly view only the suspicious activity that took place without having to watch the whole video, so that I can know what’s going on in my store without spending too much time watching security videos."* [16]
  >
  > **Why it's good**: Identifies a specific persona, their emotional context/need, and a clear time-saving benefit tied to security peace of mind [16].

* **Specific User Needs & Travel Preferences**:
  > *"As a shopper, I want to be able to filter my search results by price range, so that I can easily find products that are within my budget."* [15]
  >
  > *"As a frequent traveler, I want to be able to save my preferred flights and hotels, so that I can easily access them when booking future trips."* [15]
  >
  > **Why they're good**: Roles are specific, actions represent user goals, and benefits clearly explain why the capability matters to the user [15].

* **Workflow & Productivity**:
  > *"As a professional photographer, I want to easily upload pictures from my camera to my website, so that I can quickly show my clients their pictures."* [3, 25]
  >
  > **Why it's good**: Directly connects a functional action to a meaningful client-facing benefit [3, 25].

---

###### **Bad User Story Examples & Their Corrections**

* **Technical / Developer-Centric Story**:
  > **Bad**: *"All connections to the database are through a connection pool."* [21] **OR** *"As a back-office operator, in order to run reports faster, I want the customer reporting database queries to be optimised."* [12]
  >
  > **Why it's bad**: Focuses on internal architecture or developer concerns rather than user value [12, 21].
  >
  > **Good Correction**: *"Up to fifty users should be able to use the application with a five-user database license."* [21] **OR** *"In order to resolve customer data discrepancies faster, As a back-office operator, I want..."* [12]

* **Implementation / Mechanism Constraint**:
  > **Bad**: *"The system will use Log4J to log all error messages to a file."* [22, 23] **OR** *"A user can view detailed error information in a log file."* [26]
  >
  > **Why it's bad**: Dictates the logging mechanism rather than expressing user/business value [22, 23, 26].
  >
  > **Good Correction**: *"Whenever an error occurs, users are given enough information to know how to correct the error."* [27]

* **Fake Role / Internal Task**:
  > **Bad**: *"As a QA, in order to test faster, I want the database server restarts to be automated."* [18]
  >
  > **Why it's bad**: This is a internal delivery team task, not a story reflecting customer value [18].

* **Circular / Zero-Value Story**:
  > **Bad**: *"As a user I want to register so that I can log in."* [24]
  >
  > **Why it's bad**: Registration and login are administrative friction, not genuine user goals or benefits [24].

💡 Would you like me to help draft or refine user stories for your current product features using these concrete benefit guidelines?

**Citations**

| # | Source | Cited passage |
|---|---|---|
| 1 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | The Connextra card template (‘As a… I want … So that’) is a great structure for a discussion token. It proposes a deliverable and puts it in the context of a stakeholder benefit, which helps immensely with the discussion. |
| 2 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | Impact maps nicely organise the information held in the popular Connextra user story card format (‘As a … in order to… I want…’). [...] The third level corresponds to the value statement, especially when teams use the idea about focusing on behaviour changes. |
| 3 | Olsen, The Lean Product Playbook | Well-written user stories usually follow the template: As a [type of user], I want to [do something], so that I can [desired benefit]. |
| 4 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | The stories move from a generic unspecified value (‘in order to improve business’, or ‘in order to sell more’) to something very specific (‘in order to monitor inventory 50% faster’). This helps everyone to understand the dimension of the problem, and how much is worth spending on solving it, before you commit to a … |
| 5 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | valuable initiatives produce an observable change in someone’s way of working. [...] translating Brinkerhoff’s idea to software means that it’s not enough to describe just someone’s behaviour, but we should aim to describe a change in that behaviour instead. |
| 6 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | Agree at the start that features are not allowed in the ‘In order to…’ part. The ‘In order to…’ part shouldn’t say anything about what the software or the product does, only what the users will be able to do differently. |
| 7 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | Capturing a behaviour change makes a story measurable from a business perspective, and this always opens up a good discussion. [...] how much larger, and how much faster? |
| 8 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | Try to quantify expected changes – a good change is one that is observable and measurable. Effectively, once you have identified a change, ask ‘How much?’ [...] If discrete values are difficult to set, aim for ranges. |
| 9 | Product School, The Product Book (2017) | When talking with customers about the gains they want, make things as concrete as possible. If the customer says, “It needs to be fast” find out what “fast” means. 1 second? 10 seconds? 10 minutes? |
| 10 | Olsen, The Lean Product Playbook | benefits should be written from the customer’s perspective (using “I” and “my”). You’ll also notice that each benefit begins with a verb: help, check, reduce, maximize. [...] This makes the benefit very clear and often enables you to objectively measure the performance improvement your product is providing. |
| 11 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | The one thing you really have to do to make this work is to avoid feature requests. [...] Focus on the problem statement, the user side of things, instead of on the software implementation. |
| 12 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | Misleading stories describe a solution and not the real user need. [...] ‘As a back-office operator, in order to run reports faster, I want the customer reporting database queries to be optimised’. [...] We rephrased the story to ‘In order to resolve customer data discrepancies faster…’ |
| 13 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | write user stories so that they are testable for outcome after delivery. And actually go and check with real users that the planned outcomes have materialised. |
| 14 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | Forcing people to seriously consider which user segment would benefit from the story, if any, helps to avoid generic stories such as ‘As a user’ and completely prevents fake stories such as ‘As a remote API’. |
| 15 | Richter, The Product Manager's Playbook (2023) | As a shopper, I want to be able to filter my search results by price range, so that I can easily find products that are within my budget. As a frequent traveler, I want to be able to save my preferred flights and hotels, so that I can easily access them when booking future trips. |
| 16 | Olsen, The Lean Product Playbook | “As a Dropcam user worried about the security of my business, I want to quickly view only the suspicious activity that took place without having to watch the whole video, so that I can know what’s going on in my store without spending too much time watching security videos.” Good user stories reflect customer needs. |
| 17 | Cohn, User Stories Applied (2004) | Connextra, one of the early adopters of Extreme Programming, incorporated roles into their stories by using a short template. Each story was written in the following format: I as a (role) want (function) so that (business value) |
| 18 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | Fake stories are those about the needs of delivery team members. For example, ‘As a QA, in order to test faster, I want the database server restarts to be automated’. |
| 19 | Cohn, User Stories Applied (2004) | Keep the UI Out as Long as Possible. One of the problems that has plagued every approach to software requirements has been mixing requirements with solution specification. |
| 20 | Cohn, User Stories Applied (2004) | The first example is not a good user story for BigMoneyJobs because its users would not care which programming language was used. [...] the users of this system do not care about the technical details of how the application connects to the database. |
| 21 | Cohn, User Stories Applied (2004) | these stories are good ones but they should instead be written so that the benefits to the customers or the user are apparent. Better variations of these stories could be the following: Up to fifty users should be able to use the application with a five-user database license. All errors are presented to the user and … |
| 22 | Cohn, User Stories Applied (2004) | 1.3 Which of the following are not good stories? [...] g. The system will use Log4J to log all error messages to a file. |
| 23 | Cohn, User Stories Applied (2004) | g. The system will use Log4J to log all error messages to a file. This is not a good story as written. It should not specify that Log4J be used as the logging mechanism. |
| 24 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | a reader of Gojko’s blog recently posted a question about defining the acceptance criteria for the story ‘As a user I want to register so that I can log in’. [...] A user of a website never wants to register. |
| 25 | Olsen, The Lean Product Playbook | As a professional photographer, I want to easily upload pictures from my camera to my website, so that I can quickly show my clients their pictures. This template is a good start, but writing good user stories is an acquired skill. |
| 26 | Cohn, User Stories Applied (2004) | A user connects to the database via a connection pool. A user can view detailed error information in a log file. Stories like these can be very difficult for the customer to prioritize because the business value of each is not clear. |
| 27 | Cohn, User Stories Applied (2004) | A user can start the application without a noticeable lag while connecting to the database. Whenever an error occurs, users are given enough information to know how to correct the error. |

---
