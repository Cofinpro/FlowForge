# FAQ: store-phase-6-plausibilitaet

Notebook answers recorded verbatim with their citations. Distilled guidance lives
in the references; this file is the audit trail behind it.

---
## store-phase-6-plausibilitaet-1: How does the PO check a new story for duplicates and overlaps?

- asked 2026-10-04 · notebook "The Product - Business Design" · conversation `f2bfc56d-710e-4a17-8332-47ccc28aa5f1`
- Sources: Anforderungsvalidierung.pdf; Kelly, The Art of Agile Product Ownership (2019); Anforderungsverwaltung.pdf; Anforderungsdokumentation.pdf; Pohl & Rupp, Basiswissen Requirements Engineering (2015); Evans, Domain-Driven Design (2003); Cohn, User Stories Applied (2004); Kalbach, Mapping Experiences (2020); Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014)

**Question**

> Context: a Product Owner checks a new, ready user story against the product backlog for duplicates and overlaps. Describe the step-by-step procedure the sources document for 'Auf Duplikate & Überschneidungen prüfen' — inputs, ordered steps, and outputs: how are duplicate or overlapping stories recognised (same goal, same concept under another name, overlapping acceptance criteria or scope), what is the difference between a full duplicate and a partial overlap, what should be compared, and what mistakes do the sources call out? Please cite the sources.

**Answer** (verbatim, citation markers resolve in the table below)

In agile product development and requirements engineering, checking a new user story against the product backlog (**"Auf Duplikate & Überschneidungen prüfen"**) is a key responsibility of the **Product Owner** during backlog refinement and validation [1-3]. This process ensures the backlog remains consistent, non-redundant, and manageable [4-6].

Below is the step-by-step procedure, comparison criteria, and common pitfalls documented across the sources.

---

##### 1. Inputs, Ordered Steps, and Outputs

###### **Inputs**
* **The New Candidate User Story**: Includes the target user role/persona, the intended goal ("I want..."), the business value ("So that..."), and its acceptance criteria [7, 8].
* **Central Product Backlog / Requirement Repository**: A single, central location containing all active stories, Epics, Features, and documented "Won't" (deferred/rejected) items [3, 9, 10].
* **Project Glossary / Domain Model**: Standardized definitions of terms, synonyms, and domain entities to ensure uniform language [11-13].

###### **Ordered Procedure Steps**
1. **Goal & Intent Verification**: Compare the underlying business goal and user need of the new story against existing backlog items [14-16].
2. **Terminology & Concept Alignment**: Cross-reference the story's terms against the project glossary and domain model to check whether the concept is already represented under a different name or if the story uses misleading terminology [11-13, 17, 18].
3. **Scope & Acceptance Criteria Comparison**: Evaluate the specific functional boundaries, acceptance criteria, and test scenarios against existing stories [7, 19, 20].
4. **Classification & Action Decision**:
   * **If a Full Duplicate**: Reject or archive the new story, or link it to the existing item if it originated as a deferred/rejected request [9].
   * **If a Partial Overlap**: Combine, merge, or re-slice the stories so that their functional boundaries remain distinct and non-overlapping [21, 22].

###### **Outputs**
* **Refined Product Backlog**: An updated backlog with duplicates removed, overlapping stories merged/re-sliced, or cross-references (**Querbezüge**) added between interdependent stories [9, 22, 23].
* **Validation Record**: Documented validation results or consolidated defect logs detailing why items were merged or rejected [24, 25].

---

##### 2. How Duplicate and Overlapping Stories are Recognised

Stories or requirements are identified as duplicates or overlapping through four primary indicators:

* **Same Goal / User Need**: Two stories may use completely different wording or propose different technical implementations, but address the exact same underlying user problem (e.g., attempting to speed up database queries versus providing a direct data discrepancy view) [14-16].
* **Same Concept Under Another Name (Synonyms)**: Identified when different stakeholders submit requirements using local terminology for the same underlying domain concept or entity [11-13, 17].
* **Overlapping Acceptance Criteria or Scope**: Occurs when two stories modify or interact with the same functional area or share common test cases (e.g., "Export search results to XML" and "Export search results to HTML") [20, 22].
* **Generic Roles Masking Redundancy**: Stories written with generic personas (e.g., "As a user...") often obscure duplicate requests or unjustified pet features [26, 27].

---

##### 3. Full Duplicate vs. Partial Overlap

| Aspect | Full Duplicate (**Duplikat**) | Partial Overlap (**Überschneidung / Interdependent Stories**) |
| :--- | :--- | :--- |
| **Definition** | Two stories or requirements represent the **exact same concept or functional intent** [17]. | Two stories address **different outputs or variations**, but share significant underlying work, logic, or scope [22]. |
| **Impact** | Creates redundant work and severe maintenance risks, as future changes must be updated in multiple places to avoid divergence [4, 17]. | Makes estimation and scheduling erratic because implementing one story drastically reduces the effort required for the other [22]. |
| **Resolution** | **Discard or archive** the candidate story, or link it to the existing backlog item [9]. | **Combine the stories** for backlog planning purposes, and re-split them only when they are ready to be slotted into an iteration [21, 22]. |

---

##### 4. What Should Be Compared

When evaluating a candidate story against the backlog, compare:
1. **User Persona / Role**: Verify whether the target user segment is concrete and unique rather than generic [26, 27].
2. **User Goal ("I want...") & Business Outcome ("So that...")**: Check if the core problem being solved is already addressed elsewhere [8, 14].
3. **Acceptance Criteria & Test Scenarios**: Compare the detailed conditions of satisfaction noted on the story cards [7, 19, 20].
4. **Domain Terminology**: Align terms against the central glossary to catch synonyms and homonyms [12, 13, 18].

---

##### 5. Mistakes Called Out by the Sources

* **Multiple Descriptions ("Mehrfache Beschreibung")**: Describing the same concept or entity in multiple backlog items or documents. Sources flag this as a major quality error that inevitably leads to inconsistencies when changes occur [4].
* **Falling for False Cognates**: Assuming two stories refer to the same thing because they use identical words, when stakeholders actually intend two distinct domain concepts (e.g., "Charge" for customer charge vs. supplier charge) [18].
* **Ignoring the "Won't" (Deferred) List**: Failing to document rejected/deferred items, causing teams to repeatedly re-analyze duplicate proposals that were already decided on [9].
* **Focusing on Solutions Instead of User Needs**: Evaluating feature descriptions rather than goals, which conceals duplicate user objectives [14, 16, 27, 28].
* **Comparing Against Historical Completed Stories**: Attempting to detect overlaps by trawling through past, completed story cards rather than consulting current functional specifications/tests [29].
* **Leaving Overlapping Stories Uncombined During Planning**: Allowing small, overlapping stories to sit separately in the backlog, resulting in misleading estimates that fluctuate depending on which story is built first [22].

---

💡 **Next Step**: Would you like to explore how to set up a **User Story Mapping** session or an **Impact Map** to visually cluster similar stories and prevent backlog redundancy?

**Citations**

| # | Source | Cited passage |
|---|---|---|
| 1 | Anforderungsvalidierung.pdf | Entscheidungstabellen s. Kapitel 3.5 in der Anforderungsdokumentation 5 Best Practices Frühzeitige und kontinuierliche Einbindung der Stakeholder Relevanten Stakeholder (Fachbereiche, Management, Anwender) aktiv in Reviews, Workshops und Prototyping einbeziehen, um Missverständnisse und spätere Änderungsaufwände zu … |
| 2 | Kelly, The Art of Agile Product Ownership (2019) | 2. Why Have a Product Owner? Allan Kelly1 (1) London, UK One person is responsible for managing and controlling the Product Backlog. That person is referred to as the Product Owner. ... The Product Owner is one person not a committee. |
| 3 | Anforderungsverwaltung.pdf | 5 Anforderungen strukturieren und planen 5.1 Product Backlog / Sprint Refinement Das Product Backlog ist eine Liste mit Items, die bewertet, eindeutig priorisiert und geschätzt werden. Das Backlog umfasst im Softwareprojekt User Stories, Bugs sowie Tasks. |
| 4 | Anforderungsdokumentation.pdf | Mehrfache Beschreibung vermeiden. Anforderungen und insb. detaillierte Spezifikationen sollten im Dokument immer nur einmal im Anforderungsdokument beschriebene werden. Zu vermeiden ist bspw. das Vorgehen der Identifizierung eines Wertpapiers/Kunden, etc. an mehreren Stellen (da sich im Falle von Änderungen schnell … |
| 5 | Pohl & Rupp, Basiswissen Requirements Engineering (2015) | Konsistent [ISO/IEC/IEEE 29148:2011]: Anforderungen müssen gegenüber allen anderen Anforderungen konsistent, sprich widerspruchsfrei sein – unabhängig vom Abstraktionsgrad oder der Dokumentationsform. |
| 6 | Evans, Domain-Driven Design (2003) | What did they do once they knew about the problem? They created separate Customer Charge and Supplier Charge classes and defined each according to the needs of the corresponding team. [...] The internal consistency of a model, such that each term is unambiguous and no rules contradict, is called unification. |
| 7 | Cohn, User Stories Applied (2004) | prove whether or not it works as expected. Story Card 2.3. The revised front of a story card with only the story and questions to be discussed. Valuable to Purchasers or Users It is tempting to say something along the lines of "Each story must be valued by the users." |
| 8 | Kalbach, Mapping Experiences (2020) | Agile development strives to break the product down into small chunks, called user stories. These are short descriptions of a feature told from the user's perspective. User stories typically have a common format: As a <type of user>, I want <some goal> so that <some reason>. |
| 9 | Anforderungsverwaltung.pdf | W - Won't (Nicht zu erfüllen) Alle Anforderungen, die nicht umgesetzt werden. Diese sollten dokumentiert werden, denn so lässt sich nachvollziehen, ob eine scheinbar neue Anforderung evtl. bereits erfasst wurde. |
| 10 | Anforderungsverwaltung.pdf | 7 Best Practices Alles an einem Ort sammeln Nutze ein zentrales Tool oder Repository, damit Anforderungen nicht in E-Mails oder Excel-Listen verstreut sind. So bleibt alles versioniert, nachvollziehbar und leicht auffindbar. |
| 11 | Anforderungsdokumentation.pdf | 4.2.7.1 Eindeutigkeit und Konsistenz Anforderungsdokumente müssen in sich und übergreifend widerspruchsfrei sein. Tipps zur Umsetzung: Nutzung eines Glossars. Beschreibung aller Definitionen und Abkürzungen, welche im Dokument genutzt werden. |
| 12 | Pohl & Rupp, Basiswissen Requirements Engineering (2015) | Wiederverwendung von Glossareinträgen Häufig treten in unterschiedlichen Projekten gleiche oder ähnliche Begriffe auf [...] Hier sollten bereits vorhandene Glossareinträge wiederverwendet werden. |
| 13 | Pohl & Rupp, Basiswissen Requirements Engineering (2015) | Abkürzungen und Akronyme Alltägliche Begriffe, die im gegebenen Kontext eine spezifische Bedeutung haben Synonyme (verschiedene Begriffe mit der gleichen Bedeutung) Homonyme (Begriff mit verschiedenen Bedeutungen) Einheitliche Definitionen [...] |
| 14 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | Misleading stories describe a solution and not the real user need. One case we came across recently was 'As a back-office operator, in order to run reports faster, I want the customer reporting database queries to be optimised'. [...] |
| 15 | Cohn, User Stories Applied (2004) | Start with Goal Stories On a large project, especially one with many user roles, it is sometimes difficult to even know where to begin in identifying stories. What I've found works best is to consider each user role and identify the goals that user has for interacting with our software. |
| 16 | Cohn, User Stories Applied (2004) | each story right up front. The customer knows the velocity of the team and the story point cost of each story. After writing enough stories to fill all the iterations, she knows she's done. Kent Beck explains this difference with an analogy of registering for a wedding. |
| 17 | Evans, Domain-Driven Design (2003) | Recognizing Splinters Within a BOUNDED CONTEXT Many symptoms may indicate unrecognized model differences. [...] Combining elements of distinct models causes two categories of problems: duplicate concepts and false cognates. Duplication of concepts means that there are two model elements that actually represent the … |
| 18 | Evans, Domain-Driven Design (2003) | False cognates [...] is the case when two people who are using the same term (or implemented object) think they are talking about the same thing, but really are not. The example in the beginning of this chapter (two different business activities both called Charge) is typical. |
| 19 | Cohn, User Stories Applied (2004) | Test with Diner's Club (fail). Test with good, bad and missing card ID numbers. Test with expired cards. [...] Looking at these acceptance tests we can see the correlation between them and the extensions of Figure 12.1. |
| 20 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | For established products undergoing steady evolution and maintenance, most stories are about making changes to existing features. [...] In each case, we need to be clear about the scope of all the changes required to consider the story done. |
| 21 | Cohn, User Stories Applied (2004) | Combining Stories Sometimes stories are too small. A story that is too small is typically one that the developer says she doesn't want to write down or estimate because doing that may take longer than making the change. |
| 22 | Cohn, User Stories Applied (2004) | consider these two small stories: Search results may be saved to an XML file. Search results may be saved to an HTML file. There is clearly a great deal of overlapping work between these two stories. Time spent on one of the stories will reduce the time spent on the other. Stories like these should be combined for … |
| 23 | Pohl & Rupp, Basiswissen Requirements Engineering (2015) | Querbezüge Benennt die Beziehungen zu anderen Anforderungen. Zum Beispiel wenn bekannt ist, dass die Realisierung dieser Anforderung die vorherige Realisierung einer anderen Anforderung voraussetzt. |
| 24 | Anforderungsvalidierung.pdf | Alle Validierungsschritte, Entscheidungen und offene Punkte festhalten. Dadurch bleibt die Historie transparent und die Rückverfolgbarkeit von Änderungen gewährleistet. |
| 25 | Pohl & Rupp, Basiswissen Requirements Engineering (2015) | Fehlersammlung und -konsolidierung In der Phase Fehlersammlung werden die identifizierten Fehler zusammengetragen, konsolidiert und dokumentiert. Im Rahmen der Konsolidierung können z.B. doppelte Fehler oder unechte Fehler identifiziert werden. |
| 26 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | Using generic roles is often a get-out-of-jail-free card for people who want to push in pet features, or unjustified scope. For example, a team we recently worked with had a story 'As a user I want to log in through social networks [...]' |
| 27 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | When business stakeholders aren't experienced with iterative delivery, plans based on user stories often turn into streams of consciousness. [...] Such stories can be easily spotted because they specify a completely generic user segment ('As a user...'). |
| 28 | Cohn, User Stories Applied (2004) | A Job Seeker can search job openings. A Recruiter can post job openings. [...] Keep the UI Out as Long as Possible One of the problems that has plagued every approach to software requirements has been mixing requirements with solution specification. |
| 29 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | A user story can often change several functional aspects of a software system, and the same functionality can be impacted by many stories over a longer period of time. [...] In order to understand the current situation, someone has to discover all relevant stories, put them in reverse chronological order [...]. It is … |

---
## store-phase-6-plausibilitaet-2: How are parallel plausibility findings merged into one report and verdict?

- asked 2026-10-04 · notebook "The Product - Business Design" · conversation `2129218e-9747-4b2f-b578-288b83ffa3d1`
- Sources: Pohl & Rupp, Basiswissen Requirements Engineering (2015); Anforderungserhebung.pdf; Einführung in die Business Analyse.pdf; Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014); Angrave, The Journey Mapping Playbook (2020); Cohn, User Stories Applied (2004); Patton, User Story Mapping; Lewrick et al., The Design Thinking Toolbox (2020); Anforderungsverwaltung.pdf

**Question**

> Context: four parallel reviews of a new user story against the backlog (duplicates/overlaps, consistency with existing interaction flows, dependencies and ordering, acceptance criteria against other stories) must be merged into one report. Describe what the sources say about consolidating several reviewers' findings into one review/inspection report: what the report should contain (findings list, classification, severity, decision/verdict, affected items), how conflicting or duplicate findings from different reviewers are reconciled, and how a verdict (accept, rework, reject) is derived from it. Please cite the sources.

**Answer** (verbatim, citation markers resolve in the table below)

Consolidating findings from multiple parallel reviews of a user story (covering duplicate/overlap analysis, interaction flows, dependencies/ordering, and acceptance criteria) requires a structured review and inspection process [1]. In software and requirements engineering, this is accomplished during the **defect collection and consolidation phase** (*Fehlersammlung und -konsolidierung*) and subsequent **conflict management** (*Konfliktmanagement*) [1, 2].

---

##### 1. What the Consolidated Inspection Report Should Contain

A consolidated review or inspection report translates individual reviewer feedback into a single, actionable reference document [1]. Based on requirements engineering standards, the report must include:

* **Affected Items & Unique Identifiers:** Clear identification of the reviewed user story (e.g., ID, title, version) and all linked backlog items, interaction flows, or acceptance criteria affected by the findings [1, 3, 4].
* **Consolidated Findings List (*Fehlerliste*):** A unified list of all identified defects, open questions, and discrepancies across the four review perspectives, cleaned of redundancies [1, 5].
* **Classification:** Categorization of each finding by issue type (e.g., duplicate/overlap, flow inconsistency, missing dependency, or acceptance criteria mismatch) and by overarching quality aspect:
  * **Content (*Inhalt*):** Correctness, completeness, and consistency [6, 7].
  * **Documentation (*Dokumentation*):** Formatting, clarity, and rule conformity [8, 9].
  * **Agreement (*Abgestimmtheit*):** Stakeholder alignment and unresolved conflicts [8, 10].
* **Severity & Criticality (*Schweregrad / Kritikalität*):** Evaluation of each finding's impact (e.g., critical/blocker, high, medium, low) to prioritize required corrections [3, 11].
* **Validation & Agreement Status (*Validierungs- & Abstimmungsstatus*):** Attribute tracking the review state (e.g., *"ungeprüft"*, *"in Korrektur"*, *"überprüft"*, *"abgestimmt"*, or *"konfliktär"*) [4].
* **Decision / Overall Verdict (*Prüfurteil*):** The final evaluation outcome regarding story approval and release [1, 12].

---

##### 2. How Conflicting or Duplicate Findings Are Reconciled

When four parallel reviews are merged, findings will inevitably overlap or contradict each other. The sources outline a clear protocol to reconcile these:

###### A. Deduplication & Filtering False Findings
During the consolidation meeting (*Fehlersammlung*), reviewers compile all individual findings and compare them [1]:
* **Duplicate Findings (*Doppelte Fehler*):** Merged into a single item referencing all reviewers who raised it [1].
* **False Findings (*Unechte Fehler*):** Filtered out when a reviewer raised an issue based on false assumptions, misinterpretations, or lack of context regarding existing backlog items or system flows [1].

###### B. Conflict Identification & Analysis
When reviewers disagree (e.g., one flags an interaction flow as contradictory while another sees no issue), the team analyzes the root cause of the conflict [2, 13]:
* **Factual Conflicts (*Sachkonflikt*):** Differing interpretations of existing system behavior or incomplete information [13].
* **Interest Conflicts (*Interessenkonflikt*):** Divergent priorities between reviewers (e.g., technical debt vs. rapid user value) [14].
* **Structural/Value Conflicts (*Struktur-/Wertekonflikt*):** Authority or methodology disagreements [15, 16].

###### C. Reconciliation Techniques (*Diverge & Merge*)
To align divergent mental models, teams execute a **"diverge and merge"** cycle—comparing independent subgroup results in a time-boxed discussion to resolve misunderstandings [17-19]. Specific resolution methods include [20-26]:
1. **Fact-Based Negotiation (*Einigung*):** Open dialogue relying on objective evidence (e.g., checking existing interaction specs or code) to establish consensus [20, 27].
2. **Compromise (*Kompromiss*):** Developing a creative alternative or combining partial solutions (e.g., splitting a story to isolate a dependent flow) [21, 28, 29].
3. **Structured Evaluation:** Applying **Consider-All-Facts (CAF)**, **Plus-Minus-Interesting (PMI)**, or a weighted **Decision Matrix (*Entscheidungsmatrix*)** to score options objectively [23-25].
4. **Voting (*Abstimmung* / Dot Voting):** Used for quick group alignment when consensus cannot be reached organically [21, 30].
5. **Hierarchical Escalation (*Ober-sticht-Unter*):** Escalating to the Product Owner or Change-Control Board (CCB) if reviewers remain at a stalemate [11, 22].

---

##### 3. How the Final Verdict Is Derived

The verdict (*accept*, *rework*, or *reject*) is derived by measuring the consolidated findings against **predefined quality and acceptance criteria** [12, 31-33]:

###### 1. Accept / Approved (*Freigegeben / Abgenommen*)
* **Condition:** The user story meets all quality criteria (complete, clear, consistent, testable, and feasible) [31-33].
* **Outcome:** No critical or high-severity defects remain across any of the four review dimensions, and all reviewers/stakeholders agree [10, 31]. The story is released for sprint planning or implementation [12].

###### 2. Rework / Revision Required (*Nachbesserung / In Korrektur*)
* **Condition:** Defects or ambiguities are identified (e.g., missing acceptance criteria, unresolved flow edge-cases, or story size being too large) [1, 28, 29].
* **Protocol:** Adheres to the principle of **separating defect detection from defect correction** (*Trennung von Fehlersuche und Fehlerkorrektur*) [34]. Reviewers only document the findings; the story is assigned the status *"in Korrektur"* and returned to the author/team to rewrite, refine criteria, or split into smaller buildable units [4, 28, 34].

###### 3. Reject / Drop (*Abgelehnt / Depriorisiert*)
* **Condition:** The user story represents an unresolvable duplicate, directly contradicts established architecture/business goals, provides insufficient business value relative to its complexity, or cannot be realized within constraints [32, 35-37].
* **Outcome:** The story is rejected or moved to the "Won't" (MoSCoW) category [38]. The reasons for rejection are transparently documented in the report or backlog repository to preserve historical traceability and prevent similar invalid requests in the future [37, 38].

---

💡 **Next Step:** Would you like me to generate a tailored report or template artifact (such as a structured Markdown review report template) based on these consolidation guidelines?

**Citations**

| # | Source | Cited passage |
|---|---|---|
| 1 | Pohl & Rupp, Basiswissen Requirements Engineering (2015) | Fehlersammlung und -konsolidierung In der Phase Fehlersammlung werden die identifizierten Fehler zusammengetragen, konsolidiert und dokumentiert. Im Rahmen der Konsolidierung können z.B. doppelte Fehler oder unechte Fehler identifiziert werden. Ein unechter Fehler kann z.B. dadurch entstehen, dass ein Inspektor … |
| 2 | Pohl & Rupp, Basiswissen Requirements Engineering (2015) | 7.6 Abstimmung von Anforderungen Zur Abstimmung der Anforderungen [...] ist es notwendig, Konflikte zu identifizieren und die auftretenden Konflikte aufzulösen. Das Konfliktmanagement umfasst die folgenden vier Aufgaben: Konfliktidentifikation, Konfliktanalyse, Konfliktauflösung, Dokumentation der Konfliktauflösung. |
| 3 | Anforderungserhebung.pdf | Zu jeder Anforderung soll eine Klassifikation zur Priorisierung vorgenommen werden [...]. Beispiele für Attribute einer Anforderungsliste: Eindeutiger Identifikator / ID, Kurzbezeichnung, Beschreibung, Abnahmekriterium, Autor / Quelle, Versionierung, Zustand / Status, Kritikalität, Priorität [...] Beziehungen zu … |
| 4 | Pohl & Rupp, Basiswissen Requirements Engineering (2015) | Status bzgl. der Überprüfung Benennt den aktuellen Status der Validierung, z.B. »ungeprüft«, »in Prüfung«, »überprüft«, »fehlerhaft«, »in Korrektur«. Status bzgl. der Einigung Benennt den aktuellen Status der Abstimmung, z.B. »nicht abgestimmt«, »abgestimmt«, »konfliktär«. |
| 5 | Einführung in die Business Analyse.pdf | 2. Unschärfen in den Anforderungen erst zu einem (zu) späten Zeitpunkt klären: Unklarheiten und Unschärfen gilt es frühzeitig zu identifizieren [...]. Sollte die Klärung nicht direkt möglich sein sollten die noch nicht geklärten Punkte in einer offenen Punkte Liste (OPL) gesammelt werden. |
| 6 | Pohl & Rupp, Basiswissen Requirements Engineering (2015) | Die Überprüfung von Anforderungen sollte [...] die folgenden drei Hauptziele betrachten: Inhalt: Wurden alle relevanten Anforderungen ermittelt und im erforderlichen Detaillierungsgrad erfasst? Dokumentation: [...] Abgestimmtheit: Stimmen alle Stakeholder mit den dokumentierten Anforderungen überein und sind alle … |
| 7 | Pohl & Rupp, Basiswissen Requirements Engineering (2015) | 7.3.1 Qualitätsaspekt »Inhalt« Der Qualitätsaspekt »Inhalt« bezieht sich auf die Überprüfung von Anforderungen auf inhaltliche Fehler. Inhaltliche Fehler in einer Anforderung führen dazu, dass nachfolgende Entwicklungsaktivitäten negativ beeinflusst werden [...]. |
| 8 | Pohl & Rupp, Basiswissen Requirements Engineering (2015) | Eindeutigkeit: Lässt die Dokumentation der Anforderungen eine eindeutige Interpretation zu [...]? Konformität mit Dokumentationsregeln: [...] 7.3.3 Qualitätsaspekt »Abgestimmtheit« Der Qualitätsaspekt »Abgestimmtheit« bezieht sich auf die Überprüfung von Anforderungen auf Mängel in der Abstimmung der Anforderungen … |
| 9 | Pohl & Rupp, Basiswissen Requirements Engineering (2015) | Notwendigkeit: Trägt jede Anforderung zur Erfüllung eines definierten Ziels bei? 7.3.2 Qualitätsaspekt »Dokumentation« Der Qualitätsaspekt »Dokumentation« betrifft die Überprüfung von Anforderungen auf Mängel in der Dokumentation bzw. auf Verstöße gegen geltende Dokumentationsvorschriften [...]. |
| 10 | Pohl & Rupp, Basiswissen Requirements Engineering (2015) | Drei Prüfkriterien für den Qualitätsaspekt »Abgestimmtheit«: Abstimmung: Wurde jede Anforderung mit allen relevanten Stakeholdern abgestimmt? Abstimmung nach Änderungen: [...] Konflikte aufgelöst: Wurden alle bekannten Konflikte bzgl. der Anforderungen aufgelöst? |
| 11 | Pohl & Rupp, Basiswissen Requirements Engineering (2015) | Hier wird die durch das Change-Control Board festgelegte Priorität des Änderungsantrags dokumentiert. Verantwortlicher: [...] 8.6.4 Klassifikation eingehender Änderungsanträge: Ein Änderungsantrag wird im ersten Bearbeitungsschritt durch den Änderungsmanager oder das Change-Control Board klassifiziert. [...] |
| 12 | Pohl & Rupp, Basiswissen Requirements Engineering (2015) | Freigabe von Anforderungen Im Rahmen der Überprüfung von Anforderungen wird die Entscheidung getroffen, ob eine Anforderung die nötige Qualität aufweist (siehe Kapitel 4) und ob die Anforderung für weitere Entwicklungsaktivitäten (Entwurf, Realisierung und Test) freigegeben werden kann. Diese Entscheidung sollte … |
| 13 | Pohl & Rupp, Basiswissen Requirements Engineering (2015) | 7.6.2 Konfliktanalyse [...] Sachkonflikt: Ein Sachkonflikt zwischen zwei oder mehr Stakeholdern ist durch einen Mangel an Informationen, durch Fehlinformation oder durch unterschiedliche Interpretation einer Information gekennzeichnet. |
| 14 | Pohl & Rupp, Basiswissen Requirements Engineering (2015) | Interessenkonflikt Ein Interessenkonflikt zwischen zwei oder mehr Stakeholdern ist durch subjektiv oder objektiv verschiedene Interessen oder Ziele der Stakeholder gekennzeichnet. [...] |
| 15 | Pohl & Rupp, Basiswissen Requirements Engineering (2015) | Wertekonflikt Ein Wertekonflikt ist durch verschiedene Kriterien (z.B. kulturelle Unterschiede, persönliche Ideale) von Stakeholdern zur Bewertung von Sachverhalten gekennzeichnet. Beziehungskonflikt [...] |
| 16 | Pohl & Rupp, Basiswissen Requirements Engineering (2015) | Strukturkonflikt Ein Strukturkonflikt ist durch ungleiche Macht- und Autoritätsverhältnisse zwischen Stakeholdern gekennzeichnet. [...] Es empfiehlt sich daher, einen identifizierten Konflikt auf alle genannten Konflikttypen hin zu untersuchen [...] |
| 17 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | To get the best results, communicate that the purpose of the diverge part is not to find all the answers, but to find good questions quickly. Time-box diverge cycles to about 10 to 15 minutes and bring the team together to discuss the results. In particular, focus on the differences among the groups [...] |
| 18 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | Differences in outcomes of similar examples clearly show potential misunderstandings, so they need to be discussed and ironed out. [...] It's often useful to choose a facilitator to keep track of time and lead the discussion during merging. |
| 19 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | The merging part makes it easy to identify potential sources of misunderstanding and differences in opinions by comparing the examples from different groups. The diverge and merge cycle is also a great example of set-based design [...] |
| 20 | Pohl & Rupp, Basiswissen Requirements Engineering (2015) | Einbeziehung aller relevanten Stakeholder Unabhängig von der gewählten Konfliktlösungstechnik ist die Einbeziehung aller am Konflikt beteiligten Stakeholder essenziell. [...] Einigung Bei der Konfliktlösungstechnik Einigung handeln die Konfliktparteien eine Lösung des Konflikts aus. |
| 21 | Pohl & Rupp, Basiswissen Requirements Engineering (2015) | Kompromiss Bei der Konfliktlösungstechnik Kompromiss versuchen die Konfliktparteien [...] einen Kompromiss zwischen den verfügbaren Lösungsalternativen zu finden. [...] Abstimmung Bei der Konfliktlösungstechnik Abstimmung wird die Lösung eines Konflikts durch eine Abstimmung erzielt. [...] |
| 22 | Pohl & Rupp, Basiswissen Requirements Engineering (2015) | Variantenbildung [...] Ober-sticht-Unter Bei der Konfliktlösungstechnik Ober-sticht-Unter wird ein Konflikt anhand der Hierarchie der Konfliktparteien entschieden [...]. Diese Konfliktlösungstechnik ist nur dann empfehlenswert, wenn andere Lösungstechniken zu keiner Lösung geführt haben [...] |
| 23 | Pohl & Rupp, Basiswissen Requirements Engineering (2015) | Consider-all-Facts Bei der Konfliktlösungstechnik Consider-all-Facts (CAF) werden möglichst alle Einflussfaktoren eines Konflikts untersucht [...]. Basierend auf den Ergebnissen [...] kann die Plus-Minus-Interesting-Konfliktlösungstechnik angewendet werden. |
| 24 | Pohl & Rupp, Basiswissen Requirements Engineering (2015) | Plus-Minus-Interesting Bei der Konfliktlösungstechnik Plus-Minus-Interesting (PMI) werden alle positiven und negativen Folgen der zur Wahl stehenden Lösungsalternativen untersucht [...] |
| 25 | Pohl & Rupp, Basiswissen Requirements Engineering (2015) | Entscheidungsmatrix Bei der Konfliktlösungstechnik Entscheidungsmatrix wird eine Tabelle erstellt. In den Spalten der Tabelle werden alle Lösungsalternativen eines Konflikts eingetragen. Die Zeilen der Tabelle enthalten alle relevanten Entscheidungskriterien. [...] |
| 26 | Pohl & Rupp, Basiswissen Requirements Engineering (2015) | Tab. 7–1 Entscheidungsmatrix [...] Zur Entscheidungsfindung werden die Spaltensummen der Bewertung gebildet [...] Die Lösungsalternative mit den meisten Punkten wird als Entscheidung festgehalten. 7.6.4 Dokumentation der Konfliktlösung Risiken einer fehlenden Konfliktdokumentation |
| 27 | Angrave, The Journey Mapping Playbook (2020) | want stakeholders to appreciate that you have flagged the issues in a constructive manner [...]. Two things help immensely here. First, a fact-based argument and secondly, the inclusion of a celebration of the good things too. [...] |
| 28 | Cohn, User Stories Applied (2004) | simply too large to fit in the current iteration and must be split. The developers may want to split it along technical boundaries, such as: A Job Seeker can fill out a resume form. Information on a resume form is written to the database. [...] |
| 29 | Patton, User Story Mapping | Break stories down progressively, and just in time. At each story discussion and splitting stage, you'll do so with a purpose in mind [...] |
| 30 | Lewrick et al., The Design Thinking Toolbox (2020) | in landscape layout underneath them. Then consolidate the problem definitions or select the most appropriate, for example, through dot voting (see page 159). [...] |
| 31 | Pohl & Rupp, Basiswissen Requirements Engineering (2015) | Eine dokumentierte Anforderung sollte die folgenden Qualitätskriterien erfüllen: Abgestimmt: Eine Anforderung ist dann abgestimmt, wenn sie für alle Stakeholder korrekt ist und alle Stakeholder sie als notwendige Anforderung akzeptieren. Eindeutig [...] |
| 32 | Pohl & Rupp, Basiswissen Requirements Engineering (2015) | Prüfbar: Eine Anforderung muss so beschrieben sein, dass sie prüfbar ist. [...] Realisierbar: Es muss möglich sein, jede Anforderung innerhalb der gegebenen organisatorischen, rechtlichen, technischen und finanziellen Randbedingungen umzusetzen. [...] |
| 33 | Pohl & Rupp, Basiswissen Requirements Engineering (2015) | Konsistenz: Sind alle definierten Anforderungen an das geplante System gemeinsam erfüllbar bzw. stehen die Anforderungen nicht miteinander in Widerspruch? Keine vorzeitigen Entwurfsentscheidungen: [...] Überprüfbarkeit: [...] |
| 34 | Pohl & Rupp, Basiswissen Requirements Engineering (2015) | 7.4.2 Prinzip 2: Trennung von Fehlersuche und Fehlerkorrektur [...] Bei der Überprüfung werden die Mängel in den Anforderungen lediglich dokumentiert. Im Anschluss an die Überprüfung wird für jeden identifizierten Mangel geprüft, ob es sich wirklich um einen Fehler handelt. |
| 35 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | Key benefits Categorising items according to purpose alignment helps organisations refocus efforts. Without using a model such as this one, most of the work is often devoted to creating complex versions of 'must have' items, even if they could in reality just be good enough. [...] |
| 36 | Einführung in die Business Analyse.pdf | 3. Konflikte mit Anforderern scheuen: Bei offensichtlich falsch oder missverständlich gestellten Anforderungen sollten wir aktiv die Diskussion mit den anfordernden Einheiten [...] suchen. 4. Eingehende Anforderungen nicht hinterfragen: [...] |
| 37 | Einführung in die Business Analyse.pdf | Einschätzung in die Diskussion mit den Anforderern gehen um die Hintergründe besser verstehen zu können. Können diese Anforderungen nicht vom Projekt-Scope abgedeckt werden, so sollten die Gründe dem Stakeholder transparent gemacht bzw. alternative Lösungsszenarien besprochen werden. |
| 38 | Anforderungsverwaltung.pdf | W - Won't (Nicht zu erfüllen) Alle Anforderungen, die nicht umgesetzt werden. Diese sollten dokumentiert werden, denn so lässt sich nachvollziehen, ob eine scheinbar neue Anforderung evtl. bereits erfasst wurde. [...] |

---
## store-phase-6-plausibilitaet-3: How are affected stories marked for adjustment after a new story is accepted?

- asked 2026-10-04 · notebook "The Product - Business Design" · conversation `9b97f0f5-c9a2-4bc5-874a-48e5db483948`
- Sources: Anforderungsverwaltung.pdf; Pohl & Rupp, Basiswissen Requirements Engineering (2015); Anforderungsdokumentation.pdf; Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014); Evans, Domain-Driven Design (2003); Cohn, User Stories Applied (2004)

**Question**

> Context: a new user story is accepted into a backlog and it touches existing stories. Describe the step-by-step procedure the sources document for 'Betroffene Stories zur Anpassung markieren' — how an impact analysis over traceability links finds affected stories, what a note on an affected story should record (what changed, why, who decides, version), how superseded or outdated stories are marked, and what pitfalls (stale stories, silent changes, over-marking) the sources call out. Please cite the sources.

**Answer** (verbatim, citation markers resolve in the table below)

When a new user story is accepted into a backlog and impacts existing stories, the sources outline a structured requirements engineering and change management procedure for **marking affected stories for adjustment** (*"Betroffene Stories zur Anpassung markieren"*) [1-3].

---

##### 1. Step-by-Step Impact Analysis via Traceability Links

1. **Trigger & Identification of the New Story**: The new or modified story is logged with a unique identifier [4-6].
2. **Executing Impact Analysis (*Auswirkungsanalyse*)**: The product owner, business analyst, or change manager uses established **traceability links** (*Verfolgbarkeitsbeziehungen*) to navigate the backlog and dependent artifacts [2, 3, 7, 8].
   - **Traceability Between Stories**: Evaluates specification relationships such as *refines*, *generalizes*, or *replaces* (*'ersetzt'*) to find sibling or parent user stories [1, 9, 10].
   - **Pre-RS & Post-RS Traceability**: Examines upstream sources (stakeholder goals, business rules) and downstream deliverables (architecture components, test cases, code) [1, 3, 9].
   - **Traceability Artifacts**: Utilizes trace matrices, graph representations, or automated tool chains (*Verfolgbarkeitsketten*) to trace all direct and indirect dependencies [7, 10, 11].
3. **Flagging Affected Items**: All identified stories are formally marked (e.g., status set to *"in Korrektur"* or tagged for adjustment) so team members recognize that their scope or acceptance criteria must be updated [3, 12].

---

##### 2. What a Note on an Affected Story Should Record

When a story is flagged for modification, the sources mandate recording key attributes and change details [4, 6, 13, 14]:

- **What Changed**: A clear summary contrasting the previous behavior with the required new behavior [13-15] (often using explicit clauses like *"Whereas currently..."* or *"Instead of..."* [15]).
- **Why It Changed**: The underlying reason, business justification, or triggering event (e.g., new regulation, stakeholder feedback, or context shift) [13, 16, 17].
- **Who Decides**: The responsible owner or decision authority (e.g., Product Owner, Change-Control Board / CCB, or primary stakeholder) [4, 8, 18, 19].
- **Version & Baseline**: An updated version identifier (e.g., incrementing from `v1.0` to `v1.1` for minor edits or `v2.0` for structural shifts) and reference to the affected system release/baseline [14, 19-22].

---

##### 3. Handling Superseded or Outdated Stories

- **Trace Semantics**: Replaced stories are connected via explicit relationship links (e.g., `Story-B replaces Story-A`) [1, 9].
- **Status Classification**: Superseded stories have their status changed to *superseded*, *archived*, or *Won't* (MoSCoW) rather than being silently deleted [12, 23].
- **Auditability**: Documenting obsolete stories in an explicit "not implemented / replaced" state ensures historical traceability, preventing stakeholders from re-submitting previously discarded requirements [14, 23, 24].

---

##### 4. Pitfalls Highlighted by the Sources

1. **Stale Stories**: Leaving outdated stories or obsolete specification documents active in the backlog causes confusion, wastes team effort, and risks developers building against outdated assumptions [25-27].
2. **Silent Changes**: Modifying system behavior or story scope without transparent notes, clear contrast statements, or stakeholder communication leads to undetected side effects, broken dependencies, and team friction [28-30].
3. **Over-Marking & Administrative Overhead**: Capturing traceability links without a clear purpose (*nicht verwendungszweckbezogene Traceability*) or over-annotating cards with rigid numbering (e.g., sub-numbering like `13.1.2`) creates administrative bloat that replaces real team conversations with unmaintainable documentation [31-34].

💡 *Would you like to explore how to set up a visual user story map or impact map to make these story dependencies easier to spot during backlog refinement?*

**Citations**

| # | Source | Cited passage |
|---|---|---|
| 1 | Anforderungsverwaltung.pdf | 1. Pre-RS-Traceability: Bezieht sich auf vorgelagerte Artefakte im Projekt, die zu Anforderungen führen. 2. Post-RS-Traceability: Verknüpft Anforderungen mit nachgelagerten Artefakten (z. B. Architektur, Testfälle, Code). 3. Traceability zwischen Anforderungen: Dient der Nachvollziehbarkeit, wenn Anforderungen andere … |
| 2 | Anforderungsverwaltung.pdf | Quellen. 3. Auswirkungsanalyse – Unterstützung im Change Management. 4. Wiederverwendung [...] 7. Wartung und Pflege – Ursachen und Auswirkungen von Fehlern können schneller identifiziert werden. 5.3 Umgang mit Änderungen In Projekten kann es aus unterschiedlichen Gründen zur Notwendigkeit für Änderungen kommen: |
| 3 | Pohl & Rupp, Basiswissen Requirements Engineering (2015) | Auswirkungsanalyse: Die Verfolgbarkeit von Anforderungen unterstützt die Auswirkungsanalyse im Änderungsmanagement, in dem beispielsweise bei der Änderung einer Anforderung durch die Verfolgbarkeit die Entwicklungsartefakte identifiziert werden können, die diese Anforderung realisieren und somit möglicherweise von der … |
| 4 | Anforderungsverwaltung.pdf | Attribute als Basis für Traceability Damit Anforderungen eindeutig identifizierbar und nachverfolgbar sind, werden ihnen Attribute zugeordnet, wie z. B.: ID (eindeutige Kennung), Name der Anforderung, Beschreibung, Stabilität, Verantwortlicher, Quelle und Autor. |
| 5 | Pohl & Rupp, Basiswissen Requirements Engineering (2015) | Verfolgbar: Eine Anforderung ist nachvollziehbar, wenn sowohl der Ursprung der Anforderung als auch deren Umsetzung und die Beziehung zu anderen Dokumenten nachvollziehbar ist. Sichergestellt wird dies über einen eindeutigen Anforderungsidentifikator. |
| 6 | Pohl & Rupp, Basiswissen Requirements Engineering (2015) | 8.6.3 Der Änderungsantrag [...] Ein Änderungsantrag (Change Request) dokumentiert die gewünschte Änderung und enthält zusätzliche Informationen zur Verwaltung des Änderungsantrags. Identifikator: [...] |
| 7 | Pohl & Rupp, Basiswissen Requirements Engineering (2015) | Der geschätzte Aufwand zur Umsetzung einer Änderung wird [...] wesentlich durch die notwendige Anpassung der nachgelagerten Entwicklungsartefakte verursacht. Die Identifikation der von einer Änderung ggf. betroffenen Anforderungen und nachgelagerten Entwicklungsartefakte kann mittels aufgezeichneter … |
| 8 | Pohl & Rupp, Basiswissen Requirements Engineering (2015) | Zuordnung der angenommenen Änderungsanträge zu Änderungsprojekten Vertreter im Change-Control Board [...] Änderungsentscheidungen sind mit dem Auftraggeber sowie mit allen betroffenen Stakeholdern im Entwicklungsprojekt abzustimmen. |
| 9 | Pohl & Rupp, Basiswissen Requirements Engineering (2015) | Pre-RS-Traceability [...] Post-RS-Traceability [...] Traceability zwischen Anforderungen: Die Verfolgbarkeit zwischen Anforderungen betrachtet Spezifikationsbeziehungen und Abhängigkeiten zwischen Anforderungen. Beispiele hierfür sind die Verfolgbarkeit, dass eine Anforderung eine andere Anforderung verfeinert, … |
| 10 | Pohl & Rupp, Basiswissen Requirements Engineering (2015) | Verfolgbarkeitsketten Werden auch Beziehungen zu vorgelagerten [...] und nachgelagerten Artefakten [...] verwaltet, so können Verfolgbarkeitsketten [...] erstellt werden. Die Verfolgbarkeitsketten bilden u.a. die Grundlage für eine umfassende Auswirkungsanalyse im Änderungsmanagement von Anforderungen. |
| 11 | Pohl & Rupp, Basiswissen Requirements Engineering (2015) | Textuelle Referenzen und Hyperlinks Eine einfache Form der Repräsentation von Verfolgbarkeitsinformationen [...] Verfolgbarkeitsmatrizen Eine verbreitete Technik [...] zwischen Anforderungen sowie zwischen Anforderungen und vor- bzw. nachgelagerten Artefakten [...] |
| 12 | Pohl & Rupp, Basiswissen Requirements Engineering (2015) | Status bzgl. der Überprüfung Benennt den aktuellen Status der Validierung, z.B. »ungeprüft«, »in Prüfung«, »überprüft«, »fehlerhaft«, »in Korrektur«. Status bzgl. der Einigung [...] »nicht abgestimmt«, »abgestimmt«, »konfliktär«. |
| 13 | Pohl & Rupp, Basiswissen Requirements Engineering (2015) | Titel: Der Titel fasst in einer kurzen Aussage den wesentlichen Inhalt des Änderungsantrags zusammen. Beschreibung: [...] möglichst präzise die Anforderungsänderung dokumentiert. Begründung: Hier werden die wichtigsten Gründe für die vorgeschlagene Änderung zusammengefasst. Datum [...] Antragsteller [...] |
| 14 | Anforderungsdokumentation.pdf | In einem eigenen Kapitel [...] ist jeweils die Versionsnummer, Datum und Autor festgehalten sowie welche Änderungen am Dokument vorgenommen wurden. [...] Freigegebene oder abgenommene Dokumente müssen »eingefroren« werden und für eine spätere Revision jederzeit nachvollziehbar sein. |
| 15 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | Clarifying the change is a valid and useful step in the refinement of the story. [...] Start the discussion by adding another clause to the story template, starting with 'Whereas currently…' or 'Instead of…'. The wording of this phrase should make as clear as possible the contrast between what we already have and what … |
| 16 | Anforderungsverwaltung.pdf | Korrektive Änderungen [...] Adaptive Änderungen – Eine Veränderung im Kontext, neue Technologien oder veränderte Systemgrenzen machen eine Änderung erforderlich. Ausnahmeänderungen [...] Änderungen durch Feedback - Rückmeldungen aus der Nutzung ergeben die Anpassung von Anforderungen. |
| 17 | Pohl & Rupp, Basiswissen Requirements Engineering (2015) | Name [...] Beschreibung [...] Version Aktueller Versionsstand der Anforderung. Autor [...] Quelle [...] Begründung Beschreibt, weshalb diese Anforderung für das geplante System von Bedeutung ist. Stabilität [...] »fest«, »gefestigt«, »volatil«. |
| 18 | Pohl & Rupp, Basiswissen Requirements Engineering (2015) | Abb. 8–1 Beispiel für eine Anforderungsattributbelegung [...] »P. Müller« ist der Verantwortliche für diese Anforderung, die Quelle dieser Anforderung ist das »Produktmanagement«, und »B. Wagner« ist der Autor der Anforderung. |
| 19 | Pohl & Rupp, Basiswissen Requirements Engineering (2015) | Verwaltungsinformationen für den Änderungsantrag [...] Prüfer der Änderung [...] Status Auswirkungsanalyse: Angabe, ob die Auswirkungen des Änderungsantrags schon analysiert wurde. Status Entscheidung CCB: Angabe, ob über den Änderungsantrag schon entschieden wurde. Priorität CCB: |
| 20 | Anforderungsverwaltung.pdf | 5.2 Traceability [...] Versionierung und Baseline [...] Kleinere Änderungen werden als Inkremente (z. B. v0.1, v0.2) abgebildet, während größere Anpassungen eine neue Hauptversion erzeugen (z. B. v1.0). Zusammengehörige Versionen werden in Anforderungskonfigurationen gebündelt. Aus diesen lässt sich eine Baseline … |
| 21 | Pohl & Rupp, Basiswissen Requirements Engineering (2015) | 8.5.1 Versionen von Anforderungen Bei der Versionierung von Anforderungen wird zwischen der Version und dem Inkrement einer Versionsnummer unterschieden. [...] bei kleineren inhaltlichen Veränderungen das Inkrement und bei größeren inhaltlichen Veränderungen die Version der Anforderung um eine Stufe erhöht. |
| 22 | Pohl & Rupp, Basiswissen Requirements Engineering (2015) | Hier wird die durch das Change-Control Board festgelegte Priorität des Änderungsantrags dokumentiert. Verantwortlicher: Angabe der Person, die für die Umsetzung des Änderungsantrags verantwortlich ist. Systemrelease: [...] |
| 23 | Anforderungsverwaltung.pdf | W - Won't (Nicht zu erfüllen) Alle Anforderungen, die nicht umgesetzt werden. Diese sollten dokumentiert werden, denn so lässt sich nachvollziehen, ob eine scheinbar neue Anforderung evtl. bereits erfasst wurde. [...] |
| 24 | Pohl & Rupp, Basiswissen Requirements Engineering (2015) | Nicht veränderbar: Eine Konfiguration definiert einen bestimmten unveränderlichen Stand der Anforderungsbasis. Werden Anforderungen in einer Konfiguration verändert, so führt dies zu einer neuen Version der Anforderung sowie ggf. zu neuen Konfigurationen. [...] |
| 25 | Evans, Domain-Driven Design (2003) | Conversely, you may hear the UBIQUITOUS LANGUAGE changing naturally while a document is being left behind. [...] It could safely be archived as history, but left active it could create confusion and hurt the project. And if a document isn't playing an important role, keeping it up to date through sheer will and … |
| 26 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | A user story can often change several functional aspects of a software system, and the same functionality can be impacted by many stories over a longer period of time. [...] Using previous stories as a reference is similar to looking at a history of credit card purchases instead of the current balance [...] |
| 27 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | The reason why so many teams fall into this trap is that it isn't immediately visible. Organising tests or specifications by stories makes perfect sense for work in progress, but not so much for documenting things done in the past. [...] After a story is done, it's better to restructure acceptance criteria by … |
| 28 | Anforderungsverwaltung.pdf | Webtracking als Reality-Check [...] Offen kommunizieren Dokumentiere Änderungen und Entscheidungen so, dass alle Beteiligten verstehen, warum etwas angepasst wurde. Das erhöht die Akzeptanz und verhindert Missverständnisse. |
| 29 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | If we are building a new product, it may be that most stories are about creating new features from scratch. But for established products undergoing steady evolution and maintenance, most stories are about making changes to existing features. [...] we need to be clear about the scope of all the changes required to … |
| 30 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | A typical story description includes a clause describing the 'what' of the story [...]. Even if the required system behaviour is accurately described, the amount of work required from the team to implement it depends on how much it differs from the current system behaviour, and this might not be clear to everyone. In … |
| 31 | Cohn, User Stories Applied (2004) | individual cards or add some level of traceability to stories. For example, when we discover that the story on card 13 is too large we rip up card 13 and replace it with cards 13.1, 13.2, and 13.3. However, numbering story cards adds pointless overhead to the process and leads us into abstract discussions about … |
| 32 | Pohl & Rupp, Basiswissen Requirements Engineering (2015) | Verwendungszweck von Verfolgbarkeitsinformationen Um eine effektive und effiziente Verfolgbarkeit [...] zu etablieren, sollten die aufzuzeichnenden Informationen auf Basis von klar definierten Verwendungszwecken definiert werden [...]. Die nicht zweckbezogene Aufzeichnung [...] hat oftmals zur Konsequenz, dass … |
| 33 | Cohn, User Stories Applied (2004) | [...] Finally, if the project has a QA organization they can also help identify goldplating [...] Too Many Details Symptom: Too much time is being spent gathering details well in advance of a story being implemented. Or, more time is spent writing about stories than talking about them. |
| 34 | Cohn, User Stories Applied (2004) | with it. Instead of the story above, write one such as "When viewing details about a job, a Job Seeker may view information about the hiring company." Thinking Too Far Ahead Symptom: Indicators of this smell may be that stories are hard to fit on note cards [...] |

---
## store-phase-6-plausibilitaet-4: How is a duplicate story merged into an existing story?

- asked 2026-10-04 · notebook "The Product - Business Design" · conversation `27495c4a-aec1-4f35-9317-59eac9178881`
- Sources: Patton, User Story Mapping; Cohn, User Stories Applied (2004); Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014)

**Question**

> Context: a new user story turns out to duplicate or overlap an existing backlog story and is merged into it ('Mit bestehender Story zusammenführen'). Describe the step-by-step procedure the sources document for combining stories: what is carried over into the surviving story (acceptance criteria, examples, estimate, source/feedback link, priority), how the estimate is revisited, when the combined story becomes too big and must be split again (INVEST, size), what happens to the absorbed card, and what mistakes the sources call out. Please cite the sources.

**Answer** (verbatim, citation markers resolve in the table below)

When a new user story duplicates or overlaps with an existing backlog story and needs to be merged into it, agile literature (such as Mike Cohn's *User Stories Applied*, Jeff Patton's *User Story Mapping*, and Gojko Adzic's *Fifty Quick Ideas to Improve Your User Stories*) documents a clear procedure for combining items, re-evaluating estimates, and maintaining backlog health [1-5].

---

##### Step-by-Step Procedure for Combining Stories

###### 1. Consolidate Content into the Surviving Story
When merging an overlapping or duplicate card into a surviving story, transfer all critical details rather than discarding context [1, 5, 6]:
* **Acceptance Criteria & Test Cases**: Merge any unique validation rules, edge cases, or test scenarios from the absorbed card onto the back of the surviving story card or into its acceptance criteria list [5-7].
* **Examples & Description**: Summarize specific examples or variations from the absorbed story into bullet points within the surviving story’s description [1, 4, 6]. Patton highlights that the new consolidated title serves as a high-level summary, while the original card details become itemized bullet points underneath [1].
* **Source & Feedback Links**: Story cards act as placeholders for conversations [7, 8]. Retain references or links back to the original customer feedback, stakeholder request, or bug report so the origin of the requirement remains traceable [9-11].
* **Priority Re-evaluation**: Present the consolidated story to the Product Owner / Customer [9, 10]. Because its scope and estimate may have changed, the Product Owner must re-evaluate its relative priority based on the combined business value versus the revised effort [9, 10, 12].

---

###### 2. Re-estimate the Combined Story
* **Avoid Naive Summation**: Do **not** simply add the two previous estimates together [13]. Overlapping stories often share common overhead, such as setting up data structures, UI scaffolding, or shared logic [3]. Because of these synergies, implementing both together usually takes less effort than doing them separately [3].
* **Team Re-estimation**: The development team re-estimates the combined story as a single, unified deliverable [5]. They use story points or ideal days and triangulate the new estimate against other benchmark stories in the backlog [13, 14].

---

###### 3. Sizing Check & Re-splitting (INVEST Criteria)
* **Check the "Small" (S) Criterion**: Under the **INVEST** guidelines (Independent, Negotiable, Valuable, Estimatable, Small, Testable), a story must remain small enough to fit comfortably within a single iteration—typically ranging from half a day to a few days of work [15-19].
* **When the Story Is Too Big**: If combining stories creates an **epic** or a **compound story** that exceeds iteration capacity or creates high estimation uncertainty, it must be split again [17, 18, 20-22].
* **How to Split Properly ("Slicing the Cake")**: If re-splitting is necessary, avoid dividing the story along technical boundaries (e.g., database vs. UI) [23, 24]. Instead, slice "vertically" through every architectural layer so that every split story delivers end-to-end user value [24, 25]. You can also split along functional dimensions, such as basic vs. advanced modes or distinct output formats [20, 26-28].

---

###### 4. Handling the Absorbed Card
* **Stapling (Physical Cards)**: For small related items or bug fixes, staple the absorbed cards behind a cover card that carries the summary title and combined estimate [5, 11].
* **Tearing Up ("Ripping Up")**: Once all unique criteria and examples have been transcribed to the surviving card, physical duplicate cards are typically torn up and discarded [29-31].
* **Archiving**: If the team or organization requires audit trails or historical documentation, the absorbed cards can be archived in a physical folder or marked as merged/closed in digital backlog management tools [32-34].

---

##### Common Mistakes Called Out by the Sources

* **Naively Adding Estimates**: Assuming \\(Estimate(A + B) = Estimate(A) + Estimate(B)\\) without re-estimating as a whole, ignoring shared effort [3, 13].
* **Accidental Epic Creation**: Merging so many items that the resulting story becomes an unestimatable, oversized epic that cannot be finished in a single iteration [16, 18, 20].
* **Horizontal / Technical Splitting**: When re-splitting an oversized combined story, splitting by technology layers (e.g., backend script vs. frontend screen) instead of user-valuable features [23, 24].
* **Over-Documenting the Card**: Treating the merged card as a heavy specification document filled with excessive upfront technical notes, rather than keeping it as a concise token for conversation [6, 7, 35].
* **Leaving Duplicate Cards Active**: Failing to close or destroy the absorbed card, leading to duplicate tracking, confused prioritization, and skewed velocity forecasts [3, 36].

💡 Would you like me to create a visual flowchart or PDF summary outlining this story-merging and splitting decision tree for your team?

**Citations**

| # | Source | Cited passage |
|---|---|---|
| 1 | Patton, User Story Mapping | After things settle into clusters, take a different color card or sticky and make a header for each cluster. On that card, write a better story name—one that distills why all these cards are similar. [...] The distillations become your new, bigger stories. The other cards become bullet points in its description. |
| 2 | Cohn, User Stories Applied (2004) | A company can pay for a job posting with an American Express card. Suppose the developers estimate that it will take three days to support the first credit card type and then one day each for the second and third. With highly dependent stories such as these you don't know what estimate to give each story [...] Combine … |
| 3 | Cohn, User Stories Applied (2004) | consider these two small stories: Search results may be saved to an XML file. Search results may be saved to an HTML file. There is clearly a great deal of overlapping work between these two stories. Time spent on one of the stories will reduce the time spent on the other. Stories like these should be combined for … |
| 4 | Patton, User Story Mapping | To avoid a backlog filled with lots of tiny stories, take a bundle of stories that go together, and write all their titles on a single card as a bulleted list. Summarize those titles with a single title on your new card. Voilà, you've got one big story. |
| 5 | Cohn, User Stories Applied (2004) | stories that are often too small. A good approach for tiny stories, common among Extreme Programming teams, is to combine them into larger stories that represent from about a half-day to several days of work. The combined story is given a name and is then scheduled and worked on just like any other story. [...] The … |
| 6 | Cohn, User Stories Applied (2004) | whether it is the same developer and customer who resume the conversation. Use this as a guideline when adding detail to stories. [...] consider a story that is annotated with too many notes, as shown in Story Card 2.2. This story has too much detail [...] and also combines what should probably be a separate story |
| 7 | Cohn, User Stories Applied (2004) | prove whether or not it works as expected. Story Card 2.3. The revised front of a story card with only the story and questions to be discussed. Valuable to Purchasers or Users [...] |
| 8 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | A story card is ideally just a token for a conversation. Assuming the information on the card is not false, any of the formats is good enough to start the discussion. If the information on the card is false, they are all equally bad. |
| 9 | Cohn, User Stories Applied (2004) | estimates, along with her own assessment of the value of each story, to sort the stories so that they maximize the value delivered to the organization. A particular story may be highly valuable to the organization but will take a month to develop. [...] Cost Changes Priority |
| 10 | Cohn, User Stories Applied (2004) | disagreement to the sequence, the customer wins. Every time. However, customers cannot prioritize without some information from the development team. Minimally, a customer needs to know approximately how long each story will take. Before the stories are prioritized, they have already been estimated [...] |
| 11 | Cohn, User Stories Applied (2004) | its own story. [...] for bugs that the team expects to be able to fix quickly, you should combine the bugs into one or more stories. With cards you can easily do this by stapling the story cards together along with a cover story card. Then, for planning purposes, the collection of bugs may be treated as a single story. |
| 12 | Cohn, User Stories Applied (2004) | Prioritizing the Stories Lori the customer prioritizes the stories. The main factor in determining the priority of a story is the value it will deliver to the business. However, Lori also needs to consider the estimate for the story. Occasionally, highly desired stories become less desirable when their cost (the … |
| 13 | Cohn, User Stories Applied (2004) | When a story (possibly an epic) is disaggregated into its constituent stories, the sum of the estimates for the individual stories does not need to equal the estimate of the initial story or epic. [...] Your team's story points are not equivalent to my team's story points. |
| 14 | Cohn, User Stories Applied (2004) | estimated, pin it in the appropriate location. Very quickly compare the newly-estimated story to others in the column to see if it is "about the same." Figure 8.1. Pin story cards to the wall to facilitate triangulation. [...] |
| 15 | Cohn, User Stories Applied (2004) | An alternative to temporarily skipping a large story and putting a smaller one in its place in an iteration is to split the large story into two stories. Suppose that the five-point Story I could have been split into Story Y (three points) and Story Z (two points). [...] |
| 16 | Cohn, User Stories Applied (2004) | [...] she must choose between adding the investigative story that adds no new functionality this iteration and perhaps some other story that does. Combining Stories Sometimes stories are too small. [...] Bug reports and user interface changes are common examples of |
| 17 | Cohn, User Stories Applied (2004) | starting point it's good to have stories that can be coded and tested between half a day and perhaps two weeks by one or a pair of programmers. [...] When a story is too large it is sometimes referred to as an epic. Epics can be split into two or more stories of smaller size. |
| 18 | Cohn, User Stories Applied (2004) | they serve as placeholders or reminders about big parts of a system that need to be discussed. [...] Small: Like Goldilocks in search of a comfortable bed, some stories can be too big, some can be too small, and some can be just right. Story size does matter because if stories are too large or too small you cannot use … |
| 19 | Cohn, User Stories Applied (2004) | If they are too big, compound and complex stories may be split into multiple smaller stories. If they are too small, multiple tiny stories may be combined into one bigger story. Stories need to be testable. [...] |
| 20 | Cohn, User Stories Applied (2004) | Find a different way of splitting the stories. Combining the stories about the different credit card types into a single large story works well in this case because the combined story is only five days long. If the combined story is much longer than that, a better approach is usually to find a different dimension … |
| 21 | Cohn, User Stories Applied (2004) | they frequently contain multiple stories. For example, in a travel reservation system, "A user can plan a vacation" is an epic. [...] The ultimate determination of whether a story is appropriately sized is based on the team, its capabilities, and the technologies in use. Splitting Stories [...] |
| 22 | Cohn, User Stories Applied (2004) | A user can add and edit education information. A user can add and edit job history information. [...] Unlike the compound story, the complex story is a user story that is inherently large and cannot easily be disaggregated into a set of constituent stories. [...] |
| 23 | Cohn, User Stories Applied (2004) | simply too large to fit in the current iteration and must be split. The developers may want to split it along technical boundaries, such as: A Job Seeker can fill out a resume form. Information on a resume form is written to the database. [...] The problem with this is that neither story on its own is very useful to … |
| 24 | Cohn, User Stories Applied (2004) | [...] A far better approach is to write the replacement stories such that each provides some level of end–to–end functionality. Bill Wake (2003a) refers to this as "slicing the cake." Each story must have a little from each layer. |
| 25 | Cohn, User Stories Applied (2004) | have been inappropriately split. If you suspect that stories are too small, the easy solution is to simply combine the interdependent stories into one. [...] stories be split so as to be a full "slice of cake," including functionality from all layers of the application. |
| 26 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | When dealing with complex output formats this way of splitting stories can provide manageable chunks [...]. An easy guideline is to choose one format instead of many formats if possible. For example, if a story involves exporting to PDF and Excel and tab-separated files, divide it into three stories for each output … |
| 27 | Cohn, User Stories Applied (2004) | A user can activate and inactivate resumes. There are normally many ways to disaggregate a compound story. The preceding disaggregation is along the lines of create, edit, and delete [...] An alternative is to disaggregate along the boundaries of the data. [...] |
| 28 | Cohn, User Stories Applied (2004) | story was split into three: one story for searching by author or title, another for searching by publication name or date, and a third allowing for the criteria to be combined. [...] Risky Stories [...] |
| 29 | Cohn, User Stories Applied (2004) | overlapping cards describe what they meant by those role names. After a brief discusson the group decides if the roles are equivalent. If equivalent, the roles can either be consolidated into a single role [...] or one of the initial role cards can be ripped up. [...] |
| 30 | Cohn, User Stories Applied (2004) | impact on the estimate, it's worth asking her. Naturally Lori says she wants both. [...] there's such an easy division between the modes that everyone agrees to tear up the story and replace it with 19.1 and 19.2. |
| 31 | Cohn, User Stories Applied (2004) | rip up 21.4 and replaces it with 21.5. Story Card 21.5. An important result of this discussion is that the system has been simplified. By deciding they do not need a separate story deleting an item from a shopping cart the team has both improved the usabilility of the system and avoided potential future work. [...] |
| 32 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | Divide work in progress and work already done [...]. Throw user stories away after they are done, tear up the cards, close the tickets, delete the related wiki pages. [...] Move the related tests and specifications over to a structure that captures the current behaviour organised from a functional perspective. |
| 33 | Cohn, User Stories Applied (2004) | feelings of closure from deleting an electronic story but it's probably not as great as the visceral pleasure of ripping a physical card in half. [...] However, when I'm working on a software project, rather than a book, I prefer to retain the cards, archiving them on a shelf with a rubber band. |
| 34 | Cohn, User Stories Applied (2004) | Considering the variety of occasions on which I've found it useful to have retained stories, my recommendation is that you do so as well. If you're using software, either keep the software installed or print a report from it and file the report somewhere. [...] |
| 35 | Cohn, User Stories Applied (2004) | can be expressed in later versions of a story. The team may need to remind itself what it was about their prior development process that led them to adopt stories. Splitting Too Many Stories Symptom: Frequently splitting stories during iteration planning [...] |
| 36 | Cohn, User Stories Applied (2004) | 14.3 What could cause the customer to have a difficult time prioritizing stories? Answer: The stories may be the wrong size (either too large or too small) or the stories may not clearly express value to users or customers. [...] |

---
