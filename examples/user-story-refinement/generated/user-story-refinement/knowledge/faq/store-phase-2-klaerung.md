# FAQ: store-phase-2-klaerung

Notebook answers recorded verbatim with their citations. Distilled guidance lives
in the references; this file is the audit trail behind it.

---
## store-phase-2-klaerung-1: How is a request checked against the epic goal and the Fachkonzept (procedure, decision rules, pitfalls)?

- asked 2026-10-04 · notebook "The Product - Business Design" · conversation `d6e483cc-3ae1-438f-929c-9067b4dc26de`
- Sources: Anforderungsdokumentation.pdf; Anforderungsvalidierung.pdf; Anforderungserhebung.pdf; Einführung in die Business Analyse.pdf; The Design Thinking Playbook; Humble et al., Lean Enterprise; Richter, The Product Manager's Playbook (2023); Product School, The Product Book (2017); Pohl & Rupp, Basiswissen Requirements Engineering (2015); Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014); Anforderungsverwaltung.pdf; Bland, Testing Business Ideas (2019); Cohn, User Stories Applied (2004); Gothelf & Seiden, Lean UX; Klein, UX for Lean Startups; Croll & Yoskovitz, Lean Analytics; LeMay, Product Management in Practice (2022); Lewrick et al., The Design Thinking Toolbox (2020)

**Question**

> Context: an existing product with a vision, epics with target outcomes/KPIs and a Fachkonzept. A new user story arises from user feedback. Describe the step-by-step procedure, as the sources document it, for the activity 'Gegen Epic-Ziel & Fachkonzept prüfen' (check the request against the epic's goal and the Fachkonzept): inputs, the ordered steps, the questions to ask, how to decide whether the request serves the epic's target outcome/KPI, and what the output of the check is. Also name the mistakes or failure modes the sources call out for this check. Please cite the sources.

**Answer** (verbatim, citation markers resolve in the table below)

When a new user story arises from user feedback, the activity **"Gegen Epic-Ziel & Fachkonzept prüfen"** (checking the request against the Epic's goal and the functional concept / *Fachkonzept*) serves as a quality gate [1, 2]. Its purpose is to ensure that the product team only commits resources to requirements that deliver genuine business value, align with overarching objectives, and maintain system consistency [3-5].

---

##### 1. Inputs Required for the Check

Before starting the validation, the following input artifacts must be assembled:

* **The New User Story / Feedback Request**: The raw or initial user request resulting from customer feedback, typically described as a feature or problem statement [6-8].
* **Epic Definition & Target Outcomes/KPIs**: The overarching Epic description, including its strategic intent, target outcomes, and quantitative Key Performance Indicators (e.g., OKRs, target metrics, or cost of delay) [2, 5, 9-11].
* **Existing *Fachkonzept* & Domain Specifications**: The documented functional architecture, business rules, domain models, interaction flows, and non-functional requirements (NFRs) [9, 12-15].
* **Product Vision & System Boundaries**: The strategic product vision, target persona definitions, and defined scope boundaries [8, 16-18].

---

##### 2. The Ordered Procedure (Step-by-Step)

The validation activity follows a structured 5-step procedure [8, 19-21]:

###### Step 1: Problem & Intent Extraction (Problem- & Nutzenanalyse)
* **Action**: Separate the underlying user need or desired behavior change from any solution pre-packaged in the feedback [4, 22, 23]. 
* **Details**: User feedback often presents a specific feature request ("add a button/report") rather than the true problem [22]. Reframe the request to focus on the user role and the expected benefit ("In order to... / So that...") [7, 22, 23].

###### Step 2: Alignment Check Against Epic Goals & Target KPIs
* **Action**: Map the extracted user need/behavior change against the Epic’s target outcome and KPIs [2, 5, 24, 25].
* **Details**: Verify if achieving this behavior change directly moves the metric specified in the Epic (e.g., using Impact Mapping: *Why -> Who -> How -> What*) [24, 26]. If the request does not serve the Epic's target outcome, it should not be part of this Epic [24].

###### Step 3: Consistency Check Against the Existing *Fachkonzept*
* **Action**: Evaluate the requirement against the domain rules, data models, and system behaviors in the current *Fachkonzept* [13, 27, 28].
* **Details**: Check whether the requirement conflicts with existing business logic, introduces redundancies, or violates non-functional constraints (e.g., security, performance, regulatory rules) [13, 15, 28, 29].

###### Step 4: Interdependency & Impact Analysis (Auswirkungsanalyse)
* **Action**: Analyze relationships with other user stories, active sprints, or parallel epics [13, 29, 30].
* **Details**: Identify affected components, upstream/downstream data flows, and potential side effects across system interfaces [13, 29, 30].

###### Step 5: Disposition, Prioritization & Backlog Categorization
* **Action**: Decide on the disposition of the story and record its status [31, 32].
* **Details**: Assign a priority (e.g., WSJF or MoSCoW classification) or mark it as deferred/rejected [33-35]. If the story requires further technical investigation before committing, split off an investigative spike [36-38].

---

##### 3. Key Questions to Ask During Validation

During review sessions, the team should address three categories of questions [39-42]:

* **Value & Outcome Questions**:
  * *"Wozu genau brauchen wir das?"* / *"What specifically improves as a result of this change?"* [4, 5]
  * Does this request address a real, verified user need, or is it a solution in search of a problem? [41, 43]
  * Does implementing this story produce a measurable change in user behavior that impacts our target KPI? [11, 44-46]
* **Scope & Alignment Questions**:
  * Does this feature fit the defined scope and vision of the current Epic, or is it scope creep? [16, 24, 47]
  * Is this requirement market-differentiating or mission-critical, or is it an unnecessary "gold-plated" addition (*Goldrandlösung*)? [4, 29, 48, 49]
* **Consistency & Feasibility Questions**:
  * Is this requirement consistent and contradiction-free with the existing *Fachkonzept*? [13, 27, 28]
  * Does existing functionality in the product already satisfy this need (redundancy)? [29, 33, 50]
  * Does it comply with system constraints, architectural guidelines, and non-functional requirements? [15, 18, 51]

---

##### 4. How to Decide Whether the Request Serves the Epic's Target Outcome/KPI

To determine whether the request serves the Epic's target KPI, apply the following evaluation criteria [2, 11, 52]:

1. **Outcome vs. Output Evaluation**: Distinguish between producing a deliverable (Output) and achieving a measurable impact or behavior change (Outcome) [11, 46, 53]. A feature that is delivered but fails to change user behavior does not serve the outcome [45, 46, 54].
2. **Impact Chain Mapping**: Verify that the story forms a clear logical link: **Feature \\(\rightarrow\\) User Action \\(\rightarrow\\) Epic KPI** [24, 26]. If the link is speculative or missing, the request fails the check [24].
3. **Empirical Measurability**: Ensure the expected effect on the KPI can be measured quantitatively post-delivery (e.g., reduction in support calls, increase in task completion speed) [45, 52, 55, 56].
4. **Value-to-Effort Ratio (WSJF / Purpose Alignment)**: Assess whether the expected contribution to the KPI justifies the implementation cost and risk [35, 48, 57].

**Decision Rules**:
* **Accept into Epic**: The story directly drives the behavior change required to achieve the Epic's target KPI and aligns with the *Fachkonzept* [11, 45, 58].
* **Re-frame / Split**: The core need is valid, but the proposed solution is bloated or over-engineered. Re-scope into a minimal viable story or learning spike [23, 36, 38, 59].
* **Reject or Defer**: The request does not move the target KPI, belongs to a different Epic topic, or creates an unmanageable contradiction with the *Fachkonzept* [17, 33, 47, 60].

---

##### 5. Outputs of the Validation Activity

The activity yields the following concrete outputs [2, 31, 32]:

* **Validated User Story Artifact**: A clearly formulated user story focused on user outcome, complete with measurable acceptance criteria and linked to the target Epic [22, 23, 32, 61].
* **Updated Backlog Attributes**: Documented metadata, including validation status (`status = "überprüft"` or `"abgestimmt"`), assigned priority (e.g., WSJF rating), target release, and risk classification [31, 32, 62, 63].
* **"Features Out" / Refusal Log**: Documented non-go decisions (`status = "Won't"`) recorded on a "Features Out" list with explicit justifications to provide transparency to stakeholders and avoid re-evaluating the same request later [33, 47, 64].
* **Changes / Open Points for the *Fachkonzept***: Documented updates to the domain model or entries on an Open Points List (*Offene-Punkte-Liste - OPL*) for unclarified business logic [13, 65, 66].

---

##### 6. Mistakes and Failure Modes Called Out by the Sources

The sources highlight several critical pitfalls during this check:

* **Uncritical Acceptance / "Order Taking"**: Accepting stakeholder or executive feature requests at face value without asking "Why?" or validating against epic goals [4, 67, 68].
* **The "Feature Trap" (Stream of Consciousness)**: Evaluating requirements based on feature output rather than measurable outcome, leading to product bloat and high maintenance overhead [11, 22, 60, 69].
* **Gold-Plating (*Goldrandlösungen*)**: Adding complex, low-value features that do not contribute to core business goals, consuming budget and increasing system complexity [4, 29, 49, 70].
* **Premature Design & *Fachkonzept* Contradictions**: Embedding specific UI or technical implementation details into requirements before verifying underlying business rules and architectural constraints [13, 15, 27, 28, 71].
* **Siloed Reviews ("Im stillen Kämmerlein")**: Conducting the check in isolation without involving all required perspectives (business analysis, architecture, testing, regulatory) [42, 72, 73].
* **Late Clarification of Ambiguities**: Deferring inconsistencies with the *Fachkonzept* until late in the development cycle, resulting in costly rework or defect propagation [65, 74, 75].
* **Epic Misconception**: Treating Epics as endless "bucket topics" (e.g., "Reporting") where any new idea can be dumped, rather than goal-oriented, bounded milestones [58, 76].

---

💡 *Would you like to turn this procedure into a structured checklist or template for your team's refinement sessions?*

**Citations**

| # | Source | Cited passage |
|---|---|---|
| 1 | Anforderungsdokumentation.pdf | Eindeutige Identifizierung und strukturierte Dokumentation Jede Anforderung wird chronologisch nummeriert, was die Nachverfolgbarkeit im Projektverlauf erleichtert. Eine klare und präzise Beschreibung stellt sicher, dass alle Beteiligten die Anforderungen gleichermaßen verstehen. Die durchgängige Verwendung … |
| 2 | Anforderungsvalidierung.pdf | Nutzung von Prototypen und Diagrammen zur Veranschaulichung Visuelle Hilfsmittel (z. B. Mockups, UML-Diagramme, Prozessmodelle) fördern das gemeinsame Verständnis und decken Unklarheiten schneller auf als rein textbasierte Dokumentationen. Priorisierung und Abgleich mit Geschäftszielen Validierung der Anforderungen … |
| 3 | Anforderungsvalidierung.pdf | Unterschiedliche Sichten validieren und Konflikte auflösen Anwenderfeedback einholen Warum ist die Anforderungsvalidierung relevant? Durch Validierungsmethoden wird überprüft, ob die Anforderungen korrekt, vollständig und verständlich sind. Sicherstellung, dass die Lösung den tatsächlichen Bedürfnissen und Zielen … |
| 4 | Anforderungserhebung.pdf | Nutzen in den Vordergrund stellen Bei der Anforderungsermittlung sollte stets der konkrete Nutzen im Mittelpunkt stehen – nicht die technische Machbarkeit oder der Wunsch nach möglichst vielen Funktionen. Es geht nicht darum, „goldene Wasserhähne“ zu bauen, sondern das umzusetzen, was für die Nutzer und das … |
| 5 | Einführung in die Business Analyse.pdf | 4 Best Practices im Anforderungsmanagement: Do's and Don'ts Do’s 1. Business Value in den Mittelpunkt stellen: Jede Anforderung sollte konsequent auf ihren Beitrag zu den Geschäfts- und Projektzielen geprüft werden. Ein klarer Bezug zum Nutzen verhindert, dass Ressourcen in Anforderungen fließen, die keinen Mehrwert … |
| 6 | Anforderungserhebung.pdf | Was ist unser Ziel in der Anforderungserhebung? und Geschäftskontext Generierung von Hypothesen, Frage und Ideen durch Analysen, Workshops und Beobachtungen Ableitung und Strukturierungen von Anforderungen aus den Bedürfnissen Warum ist die Anforderungserhebung relevant? Durch ein klares Verständnis der Bedürfnisse … |
| 7 | The Design Thinking Playbook | [User] needs to [need] because [surprising insight]. Or: [Who] wants [what] for [need fulfillment] because [motivation] . . . Example: The patient must have the data sovereignty for his health data because he wants to avoid abuse. Agile methods User stories As a [role/persona] (“who”) I would like to [action, … |
| 8 | Anforderungserhebung.pdf | 1. Kläre die relevanten Stakeholder und Interessengruppen Auftraggeber unbekannt Workshops Checklisten Szenarien, Fallbeispiele Rollen, Persona Benchmarks Protokollanalyse Marktstudien Technologieassessments Prototypen Experimente Fokusgruppen Missbrauchsszenarien Reverse Engineering Auftraggeber bekannt Brainstorming … |
| 9 | Anforderungsdokumentation.pdf | Aus der Entscheidungstabelle ist damit erkennbar, dass: Immer beim Öffnen der Maske der Datensatz gesperrt wird Beim Wechsel zwischen den Feldern geprüft wird, ob ein Feld leer ist Beim Speichern ebenso überprüft wird ob alle Felder befüllt sind und ein Änderungsbericht aufgerufen wird. Welche modellbasierte Methode … |
| 10 | Humble et al., Lean Enterprise | Once we have decided what problems to focus on, we need to define our target conditions. These target conditions should clearly communicate what success looks like; they must also include KPIs so we can measure our progress towards the goal. The traditional balanced scorecard approach to KPIs has four standard … |
| 11 | Richter, The Product Manager's Playbook (2023) | Figure 4.1 Outputs vs. Outcomes. Inspired by: Tom Lombardo6 Note that in the example above, the precise solution for achieving the result is not specified. Accordingly, it doesn’t matter which specific feature will help you achieve your goals because the responsible team can design it at a later point. By … |
| 12 | Einführung in die Business Analyse.pdf | Business Analyse in klassischen Projekten 2 Requirements Engineering Das Requirements Engineering (RE) stellt eine der wichtigsten Aufgaben in Projekten dar und ist Grundlage für die spätere Umsetzung. Dabei sind Anforderungsermittlung und die fachliche Konzeption separate Prozesse, auch wenn beide in der Praxis oft … |
| 13 | Anforderungsdokumentation.pdf | 4.2.5 Komplexität In Bezug auf die Komplexität auf (oftmals zusammenhängenden) Anforderungen kommen der Fachkonzeption unterschiedliche Aufgaben zu. Zum Ersten muss das FK die Komplexität erfassen, d.h. alle Anforderungen und seien sie noch so komplex und aufwändig sind kundenseitig abzustimmen und zu erfassen. In der … |
| 14 | Einführung in die Business Analyse.pdf | Fachkonzeption: Die Fachkonzeption ist die Dokumentation funktionaler und nicht funktionaler Anforderungen an ein (Software-) Produkt. Je nach Aufsatz des Projektes, kann die Business Analyse an unterschiedlichen Stellen verortet sein. In klassischen Projekten bildet die Business Analyse den ersten Schritt nach der … |
| 15 | Einführung in die Business Analyse.pdf | Nicht funktionale Anforderungen (NFR) – Qualitätsanforderung (IREB) Im Gegensatz zu funktionalen Anforderungen, die beschreiben, WAS ein System leisten soll, geben nicht funktionale Anforderungen an, WIE (gut) ein System etwas leisten soll (qualitativ). Die nichtfunktionalen Anforderungen an ein System können … |
| 16 | Anforderungsdokumentation.pdf | Qualitätssicherung durch Feedback und Validierung Warum ist die Anforderungsdokumentation relevant? Schaffung eines gemeinsamen Verständnisses aller Stakeholder zur Ausgestaltung der Anforderungen Transparente Abbildung des Scopes und der Vision Frühe Identifizierung von offenen Punkten und Konfliktpotenzialen 2 Arten … |
| 17 | Product School, The Product Book (2017) | Does it support the product’s vision and core function? Can we do it well with our capabilities (or is it feasible and desirable to expand our capabilities to meet the opportunity)? How does it contribute to our key metrics? Do we have any data, be it from analytics, surveys, or bug reports, to support this … |
| 18 | Pohl & Rupp, Basiswissen Requirements Engineering (2015) | Definition 1–6: Randbedingung Eine Randbedingung ist eine Anforderung, die den Lösungsraum jenseits dessen einschränkt, was notwendig ist, um die funktionalen Anforderungen und die Qualitätsanforderungen zu erfüllen. Neben der Unterscheidung in funktionale Anforderungen, Qualitätsanforderungen und Randbedingungen wird … |
| 19 | Einführung in die Business Analyse.pdf | Das Requirements Engineering lt. IREB (International Requirements Engineering Board, www.ireb.org/de) ist ein Business Analyse in agilen Projekten systematischer und strukturierter Ansatz zur Spezifikation und zum Management von Anforderungen mit den folgenden Zielen: Die relevanten Anforderungen zu kennen, Konsens … |
| 20 | Pohl & Rupp, Basiswissen Requirements Engineering (2015) | Prüfen und abstimmen: Dokumentierte Anforderungen müssen frühzeitig geprüft und abgestimmt werden, um zu gewährleisten, dass sie allen geforderten Qualitätskriterien genügen (siehe Kapitel 7). Verwalten: Die Anforderungsverwaltung (Requirements Management) geschieht flankierend zu allen anderen Aktivitäten und umfasst … |
| 21 | Einführung in die Business Analyse.pdf | Die vier Haupttätigkeiten im Anforderungsprozess lauten wie folgt: Schritte des Anforderungsprozesses Das Ziel des RE nach Pohl/Rupp (2011) ist es eine qualitativ gute Anforderung zu entwickeln und sie in der Umsetzung risiko- und qualitätsorientiert zu verwalten (Ebert (2012), S. 34). Eine Anforderung beschreibt laut … |
| 22 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | How to make it work The one thing you really have to do to make this work is to avoid feature requests. If you have only a short summary on a card, it must not be a solution without context. So, ‘How much potential cash is in blocked projects?’ is a valid summary, but a ‘Cash report’ isn’t. The potential cash question … |
| 23 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | Agree at the start that features are not allowed in the ‘In order to…’ part – this is an easy way to cheat the experiment. The ‘In order to…’ part shouldn’t say anything about what the software or the product does, only what the users will be able to do differently. An easy way to avoid the problem is to have a rule … |
| 24 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | Because impact maps visually present the information held in the Connextra card format, scope creep is trivially easy to spot. User stories that shouldn’t be part of the current release cycle simply won’t fit visually into any branches of the impact map. Impact maps effectively visualise assumptions. When a … |
| 25 | Pohl & Rupp, Basiswissen Requirements Engineering (2015) | Notwendigkeit: Trägt jede Anforderung zur Erfüllung eines definierten Ziels bei? 7.3.2 Qualitätsaspekt »Dokumentation« Der Qualitätsaspekt »Dokumentation« betrifft die Überprüfung von Anforderungen auf Mängel in der Dokumentation bzw. auf Verstöße gegen geltende Dokumentationsvorschriften, wie z.B. Verständlichkeit … |
| 26 | Humble et al., Lean Enterprise | If you have features and benefits and you want to get to target conditions, one simple approach is to ask why our customers care about a particular benefit. You may need to ask “why” several times to get to something that looks like a real tar- get condition.4 It’s also essential to ensure that target conditions have … |
| 27 | Pohl & Rupp, Basiswissen Requirements Engineering (2015) | Konsistenz: Sind alle definierten Anforderungen an das geplante System gemeinsam erfüllbar bzw. stehen die Anforderungen nicht miteinander in Widerspruch? Keine vorzeitigen Entwurfsentscheidungen: Wurden Entwurfsentscheidungen in den Anforderungen vorweggenommen, die nicht durch Randbedingungen induziert sind (z.B. … |
| 28 | Pohl & Rupp, Basiswissen Requirements Engineering (2015) | Notwendig [ISO/IEC/IEEE 29148:2011]: Eine Anforderung muss die Gegebenheiten im Systemkontext so widerspiegeln, dass die dokumentierte Anforderung hinsichtlich der aktuellen Gegebenheiten im Systemkontext gültig ist. Die aktuellen Gegebenheiten beziehen sich z.B. auf die Vorstellungen der verschiedenen Stakeholder, … |
| 29 | Anforderungsverwaltung.pdf | 1. Pre-RS-Traceability: Bezieht sich auf vorgelagerte Artefakte im Projekt, die zu Anforderungen führen (z. B. Business-Case, Stakeholder-Bedarf). 2. Post-RS-Traceability: Verknüpft Anforderungen mit nachgelagerten Artefakten (z. B. Architektur, Testfälle, Code). 3. Traceability zwischen Anforderungen: Dient der … |
| 30 | Pohl & Rupp, Basiswissen Requirements Engineering (2015) | Identifikation von Goldrandlösungen in den Anforderungen: Über die Verfolgbarkeit einer Anforderung zu deren Ursprung können Anforderungen erkannt werden, die beispielsweise zu keinem Systemziel beitragen oder keiner Quelle zuordenbar sind. In der Regel gibt es für die Existenz dieser Anforderungen keinen Grund, … |
| 31 | Pohl & Rupp, Basiswissen Requirements Engineering (2015) | Status bzgl. der Überprüfung Benennt den aktuellen Status der Validierung, z.B. »ungeprüft«, »in Prüfung«, »überprüft«, »fehlerhaft«, »in Korrektur«. Status bzgl. der Einigung Benennt den aktuellen Status der Abstimmung, z.B. »nicht abgestimmt«, »abgestimmt«, »konfliktär«. Aufwand Prognostizierter / tatsächlicher … |
| 32 | Anforderungserhebung.pdf | Als Business Analyst sollen auch unausgesprochene Wünsche der Stakeholder erkannt und in Einklang gebracht werden. Zu jeder Anforderung soll eine Klassifikation zur Priorisierung vorgenommen werden (Details siehe Priorisierungs-Methoden), Aussagen sind konkret zu formulieren und z.B. durch Zahlenwerte oder andere … |
| 33 | Anforderungsverwaltung.pdf | Bsp. Einführung einer neuen Anwendung - komplexe Reports, die eine deutliche Arbeitsersparnis für einzelne Mitarbeiter ermöglicht. W - Won’t (Nicht zu erfüllen) Alle Anforderungen, die nicht umgesetzt werden. Diese sollten dokumentiert werden, denn so lässt sich nachvollziehen, ob eine scheinbar neue Anforderung evtl. … |
| 34 | Anforderungsverwaltung.pdf | Soll-Anforderungen betreffen kritische Aktivitäten mit hoher Priorität, die wann immer möglich abgeschlossen werden sollten. Sind diese im aktuellen Projektkontext nicht zu erfüllen, kann das Projekt nur noch mit Einschränkungen als erfolgreich abgeschlossen eingeschätzt werden. S - Should (Sollte) Bsp. Einführung … |
| 35 | Anforderungsverwaltung.pdf | Sofern Kosten oder Aufwände für eine Anforderung vorliegen, werden diese für die Job Size genutzt. Dies setzt voraus, dass ALLE Anforderungen mit einem entsprechenden Wert beschätzt wurden. In agilen Umfeldern bieten sich hier die Story Points je Team als Grundlage an (als Ergebnisse aus Refinements). Alternativ, … |
| 36 | Bland, Testing Business Ideas (2019) | Requirements Acceptance Criteria Before performing a spike, clearly define the acceptance criteria and time box so that everyone is clear on the goal before getting started. These can turn into never-ending research projects if left unchecked. DETAILS 309 Partner & Supplier Interviews p. 114 Interview partners and … |
| 37 | Cohn, User Stories Applied (2004) | about how much can be accomplished in that iteration. The key benefit of breaking out a story that cannot be estimated is that it allows the customer to prioritize the research separately from the new functionality. If the customer has only the complex story to prioritize ("Add novel extensions to standard expectation … |
| 38 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | A good way to deal with such situations is to explicitly split the research tasks into a separate story with a goal of its own. A helpful way of thinking about this is that a story should be either about learning or earning. Learning stories help stakeholders plan better. Earning stories help to deliver value to … |
| 39 | Anforderungsvalidierung.pdf | Anforderungen oder der Lösung beitragen. Zwar entstehen durch den Validierungsprozess zunächst zusätzliche Aufwände, diese werden jedoch langfristig durch die gesteigerte Qualität und Akzeptanz mehr als kompensiert. Prinzipien und Prüfkriterien Eine wirksame Anforderungsvalidierung folgt bestimmten Grundsätzen: … |
| 40 | Anforderungserhebung.pdf | Weiterführende Medien und Methoden findest du in der Geschäftsprozessanalyse: Geschäftsprozessanalyse 2.2.3 Checklisten Die folgende Checkliste kann bei der Ermittlung von Anforderungen unterstützen, um ein gutes Verständnis der Anforderungen zu erlangen und den Gesamtkontext zu verstehen (vgl. Ebert (2012), S. 83). … |
| 41 | Anforderungsvalidierung.pdf | Ein nutzerzentrierter Ansatz stellt sicher, dass die Entwicklung konsequent an den Bedürfnissen der Anwender ausgerichtet wird. Dabei helfen gezielte Fragen, um die Relevanz und Richtigkeit der zugrunde liegenden Nutzerbedürfnisse zu überprüfen: Existiert das angenommene Nutzerbedürfnis tatsächlich und wird es von den … |
| 42 | Pohl & Rupp, Basiswissen Requirements Engineering (2015) | Perspektive Adressaten Perspektive Kunde/Nutzer: In der Perspektive eines Kunden bzw. eines Nutzers wird geprüft, ob die Anforderungen die gewünschte Funktionalität und Qualität beschreiben. Perspektive Softwarearchitekt: In der Perspektive eines Softwarearchitekten wird geprüft, ob in der Anforderung alle für den … |
| 43 | Anforderungsvalidierung.pdf | eine Systemanforderung muss immer auf einer Nutzeranforderung basieren – andernfalls fehlt die Rechtfertigung für ihre Existenz. Aus diesem Grund ist es notwendig, sowohl Nutzeranforderungen als auch Systemanforderungen zu validieren, um sicherzustellen, dass tatsächlich das „richtige“ System entwickelt wird. Die … |
| 44 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | Describe a behaviour change Bill Wake’s INVEST set of user story characteristics has two conflicting forces. Independent and valuable are often difficult to reconcile with small. The value of software is a vague and esoteric concept in the domain of business users, but task size is under the control of a delivery … |
| 45 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | Answering questions like these helps to determine whether the proposed solution is appropriate, inadequate or over the top. Describing the behaviour change sets the context which allows a delivery teams to propose better solutions. Describing expected changes allows teams to assess whether a story succeeds from a … |
| 46 | Gothelf & Seiden, Lean UX | Hypotheses have behavior change (outcomes) as their definition of success. Shipping a working feature is table stakes. It’s the beginning of the conversation. Our team’s success is not measured in how fast they can get features launched. Instead we measure success by how well our customers can achieve “some goal” … |
| 47 | Einführung in die Business Analyse.pdf | Einschätzung in die Diskussion mit den Anforderern gehen um die Hintergründe besser verstehen zu können. Können diese Anforderungen nicht vom Projekt-Scope abgedeckt werden, so sollten die Gründe dem Stakeholder transparent gemacht bzw. alternative Lösungsszenarien besprochen werden. |
| 48 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | The purpose alignment model, presented by Niel Nickolaisen in Stand Back And Deliver, is a good way to avoid that paradox. It is by far the most effective triaging system we’ve used on software projects. The model requires stakeholders to ask two questions for each item: Is it mission critical? (Can the business run … |
| 49 | Pohl & Rupp, Basiswissen Requirements Engineering (2015) | Nachweisbarkeit: Die Verfolgbarkeit von Anforderungen unterstützt den Nachweis, dass eine Anforderung im System umgesetzt, d.h. durch ein Systemmerkmal realisiert wurde. Identifikation von Goldrandlösungen im System: Die Verfolgbarkeit von Anforderungen unterstützt die Identifikation von sogenannten Goldrandlösungen … |
| 50 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | Is there already a warning in place, but triggered at a different point? Changing the warning threshold to 10% would be a very simple change. The point is that the description of the required feature alone, even if complete and accurate, is not enough to indicate how complex the story is to implement. We also need to … |
| 51 | Einführung in die Business Analyse.pdf | Operativer Betrieb Umsetzung und Test Systemleistung/-kapazität Stakeholder Treiber und Rahmenbedingungen Regulatorik Funktionsumfang Parallelprojekte 3.3 Dimensionen von Anforderungen Anforderungen werden in 5 Dimensionen betrachtet, um diese im Projektkontext erfolgreich zu erfassen und umzusetzen: Konsens Durch … |
| 52 | Humble et al., Lean Enterprise | Current condition and problem statement This is the problem the business stakeholder wants to address, in simple understandable terms and not as a lack-of-solution statement. For example, avoid statements like “Our problem is we need a Content Management System.” Goal statement How will we know that our efforts were … |
| 53 | Gothelf & Seiden, Lean UX | Outcome This is the change in the world we hope to see after we’ve created the output. As a measure of success, these are rare primarily because they are not binary and instead operate on a sliding scale. If a team is asked to improve retention by 50% but only manages to improve it by 42%, does that mean they’ve … |
| 54 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | Every book about user stories ever published talks about how good stories need to be testable, but they mostly focus on testing before delivery. Unit tests, acceptance tests, usability tests all prove that the software will deliver the capability for end-users to do something. But there is a huge difference between … |
| 55 | Klein, UX for Lean Startups | A better metric in this case might be something like the number of support calls you get from users who see the new feature or the number of questions you get about specific problems users were having. The trick is that all success metrics must be measurable and directly related to your business goals. Again, I’ll … |
| 56 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | This was a very painful lesson for us in the first few months of working on MindMup. We aimed to create a highly productive mind mapper with a frictionless interface. Most of our early stories were aimed at increasing productivity. But we never went back to check whether the implemented stories actually made a … |
| 57 | Anforderungsverwaltung.pdf | Time Criticality Existieren Deadlines, bis zu der die Anforderung umgesetzt sein muss (regulatorische Anforderungen bspw.)? Stiftet die Anforderung nur bis zu einem gewissen Zeitpunkt einen Nutzen (First Mover Advantage, Ausnutzen von Markttrends,…)? Risk Reduction und / oder Opportunity Enablement Werden mit der … |
| 58 | Humble et al., Lean Enterprise | Our product development target conditions describe customer or business goals we wish to achieve, which are driven by our product strategy. Examples include increasing revenue per user, targeting a new market segment, solving a given problem experienced by a particular persona, increasing the performance of our … |
| 59 | Croll & Yoskovitz, Lean Analytics | “And” is the enemy of success. When discussing a feature with your team, pay attention to how it’s being described. “The feature will allow you to do this, and it’d be great if it did this other thing, and this other thing, and this other thing too.” Warning bells should be going off at this point. If you’re trying to … |
| 60 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | When business stakeholders aren’t experienced with iterative delivery, plans based on user stories often turn into streams of consciousness. Anything goes, stories even get reverse-engineered from feature ideas. A common result is that stakeholders feel that they constantly get small improvements, but the delivery … |
| 61 | Pohl & Rupp, Basiswissen Requirements Engineering (2015) | Eine dokumentierte Anforderung sollte die folgenden Qualitätskriterien4 erfüllen: Abgestimmt: Eine Anforderung ist dann abgestimmt, wenn sie für alle Stakeholder korrekt ist und alle Stakeholder sie als notwendige Anforderung akzeptieren. Eindeutig [ISO/IEC/IEEE 29148:2011]: Eine eindeutig dokumentierte Anforderung … |
| 62 | Anforderungsverwaltung.pdf | Der Ansatz des WSFJ lässt sich anhand des nachfolgenden Beispiels in Form von drei Anforderungen am besten verdeutlichen: Anforderung Cost of Delay Job Size WSJF Anfo #1 34 3 11,33 Anfo #2 70 13 5,38 Anfo #3 50 34 1,47 In dem Beispiel ist zu sehen, dass die Anfo #1 einen geringeren Nutzen/ein geringeres Risiko mit … |
| 63 | Pohl & Rupp, Basiswissen Requirements Engineering (2015) | Kombination von Selektion und Verdichtung Eine Sicht auf eine Anforderungsbasis kann sowohl aus generierten bzw. verdichteten Daten als auch aus selektierten Daten bestehen, d.h., selektive und verdichtende Sichten können kombiniert werden. Abb. 8–3 Aus einer Anforderungsbasis generierte verdichtende Sichten Abbildung … |
| 64 | Product School, The Product Book (2017) | Regardless of what format you choose for your user stories, it should be clear what the feature will do and how to measure success/proper implementation of the feature. We’ve found it also useful to explicitly list “features out”—that is, what you’re not doing and why. For one, multiple readers might ask about adding … |
| 65 | Einführung in die Business Analyse.pdf | 2. Unschärfen in den Anforderungen erst zu einem (zu) späten Zeitpunkt klären: Unklarheiten und Unschärfen gilt es frühzeitig zu identifizieren und möglichst zeitnah zu beseitigen. Ein eindeutiger Indikator für ein verständlich formuliertes Anforderungsdokument ist, dass neben dem Business Analysten ein fachbezogener … |
| 66 | Anforderungsverwaltung.pdf | Quellen. 3. Auswirkungsanalyse – Unterstützung im Change Management. 4. Wiederverwendung – Nutzung bestehender Anforderungen und Artefakte für neue Projekte. 5. Nachweisbarkeit – Sicherstellung, dass Anforderungen tatsächlich umgesetzt wurden. 6. Zurechenbarkeit – Erleichtert die Zuordnung von Aufwänden und Ressourcen … |
| 67 | LeMay, Product Management in Practice (2022) | Patterns and traps to avoid Yes! Immediately agreeing to a request like this not only undermines the existing processes your team uses to prioritize work, it also sets up the executive for disappointment when the actual thing you deliver doesn’t live up to the abstract idea in her head. Unless you have taken the time … |
| 68 | Einführung in die Business Analyse.pdf | 3. Konflikte mit Anforderern scheuen: Bei offensichtlich falsch oder missverständlich gestellten Anforderungen sollten wir aktiv die Diskussion mit den anfordernden Einheiten (oftmals „Fachbereich“) suchen. 4. Eingehende Anforderungen nicht hinterfragen: In der Praxis kommt es vor, dass Stakeholder neue Anforderungen … |
| 69 | Humble et al., Lean Enterprise | Our runway should be a list of hypotheses to test, not a list of requirements to build. When we reward our teams for their ability to deliver requirements, it’s easy to rapidly bloat our products with unnecessary features—leading to increased complexity, higher maintenance costs, and limited ability to change. … |
| 70 | Lewrick et al., The Design Thinking Toolbox (2020) | Expert tips: • The reduction to the essence and the smart combination of individual elements and functionalities ensures elegance. • It has stood the test of time to take another look at the defined elements, for example, CFP/CEP (see page 188), and to examine whether the desired ultimate solution matches them and … |
| 71 | Cohn, User Stories Applied (2004) | these stories are good ones but they should instead be written so that the benefits to the customers or the user are apparent. This will allow the customer to intelligently prioritize these stories into the development schedule. Better variations of these stories could be the following: Up to fifty users should be … |
| 72 | Anforderungserhebung.pdf | Anforderungen. Alle relevanten Anforderungsquellen ermitteln Ein häufiger Fehler in Projekten ist, dass Anforderungen nur von den „üblichen Verdächtigen“ erhoben werden – also von den Stakeholdern, die am lautesten oder sichtbarsten sind. Dabei ist es entscheidend, systematisch alle relevanten Anforderungsquellen zu … |
| 73 | Einführung in die Business Analyse.pdf | 1. Sammeln von Anforderungen im „stillen Kämmerlein": Keiner kennt und durchdringt die Anforderungen beim Kunden besser als der Fachbereich. Wir als „Business Analysten“ bringen gute fachliche Vorkenntnisse mit, können aber in der Regel nie so tief in der fachlichen Materie eingearbeitet sein, wie die entsprechenden … |
| 74 | Pohl & Rupp, Basiswissen Requirements Engineering (2015) | 1.1.1 Zahlen und Fakten im Projektalltag Requirements Engineering als Fehlerquelle Studien belegen, dass etwa 60% der Fehler in Systementwicklungsprojekten bereits im Requirements Engineering entstehen [Boehm 1981]. Irrtümer aus dem Requirements Engineering werden jedoch oft erst in späteren Projektphasen oder im … |
| 75 | Pohl & Rupp, Basiswissen Requirements Engineering (2015) | Ziel der Überprüfung Das Ziel der Überprüfung von Anforderungen ist es somit, Fehler in den dokumentierten Anforderungen zu entdecken. Typische Beispiele für Fehler in Anforderungen sind Mehrdeutigkeit, Unvollständigkeit und Widersprüche. »Fehlerfortpflanzung« Anforderungsdokumente sind Referenzdokumente für alle … |
| 76 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | How to make it work Don’t confuse milestones with epics. True epics are simply large stories that satisfy all the other INVEST criteria but are too large to be implemented in a single iteration. However the term is often used (or misused) to represent the whole of a subject area or topic, such as ‘reporting’ or … |

---
## store-phase-2-klaerung-2: How is the as-is/to-be delta described and given a measurable target?

- asked 2026-10-04 · notebook "The Product - Business Design" · conversation `5e93a2b2-a076-464d-a3d0-94a040b01426`
- Sources: Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014); Anforderungsverwaltung.pdf; Humble et al., Lean Enterprise; Anforderungsvalidierung.pdf; Wallaert, Start at the End (2019); Anforderungserhebung.pdf; Cohn, User Stories Applied (2004); Pohl & Rupp, Basiswissen Requirements Engineering (2015); Gothelf & Seiden, Lean UX; Anforderungsdokumentation.pdf; Klein, UX for Lean Startups; Olsen, The Lean Product Playbook; Product School, The Product Book (2017); Einführung in die Business Analyse.pdf; The Design Thinking Playbook

**Question**

> Context: a Product Owner clarifies a feedback-driven user story in an existing product. Describe the step-by-step procedure, as the sources document it, for the activity 'Ist-/Soll-Delta beschreiben' (describe the as-is versus to-be/target delta of the system behaviour): inputs, the ordered steps, how the current behaviour and the desired behaviour change are written down, how a measurable target (metric, acceptance criterion, baseline) is set, and the output. Also name the mistakes or failure modes the sources call out and any terms a generic reader would not know. Please cite the sources.

**Answer** (verbatim, citation markers resolve in the table below)

In an established product undergoing continuous evolution, user stories rarely introduce entirely new concepts from scratch; instead, they alter, extend, or replace existing capabilities based on operational feedback and usage data [1-3]. The activity of **'Ist-/Soll-Delta beschreiben'** (describing the as-is versus to-be/target delta) explicitly clarifies the exact contrast between how the system currently operates (**Ist-Zustand**) and how it should operate in the future (**Soll-Zustand**) [1, 4, 5].

---

##### 1. Inputs
To perform this activity effectively, a Product Owner gathers four core inputs:
*   **Current Baseline ("Ist-Zustand" / Baseline)**: The documented, observable state of the current system behavior, including existing business rules, user interface flows, or system outputs [1, 4, 6].
*   **Usage Feedback & Incident Data**: Direct customer feedback, defect reports, or usage analytics indicating friction, unexpected workarounds, or failure modes in production [3, 7, 8].
*   **Core User Need / Business Goal**: The underlying business objective or user motivation that drives the change (e.g., the *"In order to..."* clause) [9-11].
*   **Target User Role / Persona**: The specific user segment or role affected by the change [12-14].

---

##### 2. Ordered Procedure (Step-by-Step)

1.  **Grasp the Current Operating Behavior (Ist-Zustand)**
    Analyze facts and operational data to establish how the system and user currently operate [4, 15]. This identifies the baseline behavior rather than relying on unverified assumptions [4, 5].
2.  **Define the Intended Behavior Change ("Why")**
    Clarify what users or stakeholders should do differently once the story is delivered [10, 16, 17]. Focusing on an observable change in user behavior ensures that the story delivers business value rather than just technical output [10, 16, 18].
3.  **Specify the System Behavior Contrast ("What / System Delta")**
    Define the precise difference in observable system outputs or business rules between the current system and the target system [1, 9].
4.  **Establish Baseline Metrics & Acceptance Criteria**
    Determine the baseline values, set quantitative target ranges for the expected behavior change, and formulate testable acceptance criteria [11, 12, 19-21].
5.  **Review for Missing Cases and Logical Gaps**
    Evaluate the requirement for unstated conditions (e.g., what happens when a condition is *not* met) or ambiguous process terms using decision tables or structured templates [22-24].

---

##### 3. How Current Behaviour & Desired Behaviour Change Are Written Down

*   **Explicit Contrast Clauses**: The contrast is documented by adding a clause to the user story template, such as **"Whereas currently..."** or **"Instead of..."** directly following the *"I want..."* statement [5, 9].
    *   *Example*: *"In order to avoid exceeding daily trading limits, As a trader, I want a warning when my volume reaches 90% of my limit, **instead of** having my trades blocked without prior notice."* [9]
*   **Action Verbs and Negative Testing**: Select specific action verbs that highlight the change (e.g., "use a native app" rather than "access reports") [5]. Validate the verb by asking negative questions: *"Is it true that the user cannot do X at all currently?"* If they can already perform the action via a workaround, adjust the verb to state the exact delta [5].
*   **Structured Requirement Templates (Satzschablonen)**: In formal specifications, system behavior is written using standardized sentence templates with modal verbs indicating obligation (**"DAS SYSTEM MUSS / SOLLTE..."**) paired with explicit conditional conjunctions—such as **"falls"** for logical conditions and **"sobald"** for temporal triggers [25-27].

---

##### 4. Setting Measurable Targets (Baseline, Metrics, Acceptance Criteria)

*   **Establishing the Baseline**: The **Baseline (Anforderungsbasislinie)** represents an accepted, stable reference state of system configuration or performance metrics [6, 28]. All deltas are measured relative to this starting point [6, 11].
*   **Quantified Target Ranges**: Instead of setting binary or vague goals, define measurable ranges or target deltas [11, 21]. For instance, set a minimum acceptable improvement alongside an upper target (e.g., *"reduce error rates by 15% to 25% compared to the baseline of 22 issues"*) [11, 21].
*   **Acceptance Criteria (Abnahmekriterien)**: Acceptance criteria are attached to the story (traditionally written on the back of a story card or as structured attributes) as verifiable conditions that prove whether the implementation succeeded [12, 20, 29].
*   **Outcome Validation**: In Lean UX, progress is measured by observing key metrics in production after shipping to verify if the hypothesized customer behavior change occurred [18, 30, 31].

---

##### 5. Output

The final output of this activity is a fully refined, unambiguous **User Story entry** comprising:
1.  A specific user role/persona [12-14].
2.  A clear behavior change statement (*"In order to..."*) [16, 17, 32].
3.  An explicit system delta statement (*"I want [new behavior] instead of [current behavior]"*) [1, 5, 9].
4.  Verifiable acceptance criteria backed by quantitative metrics and baselines [12, 20, 29].
5.  An explicit list of **out-of-scope boundaries** ("features out") to prevent scope creep [33].

---

##### 6. Failure Modes & Mistakes Called Out in the Sources

*   **Feature Requests Without Context (Solution-First)**: Proposing a feature idea ("I want a cash report") without describing the underlying problem or required behavior change [13, 34, 35].
*   **Hidden Current-State Assumptions**: Failing to document what the system currently does (*"Instead of..."*), leading teams to drastically misjudge implementation effort [9, 36].
*   **Vague / Unmeasurable Goals**: Using subjective terms such as "faster," "more flexible," or "user-friendly" without a baseline or measurable target [21, 37, 38].
*   **Incomplete Conditions**: Defining what the system should do when a condition is met while failing to specify what happens when the condition is *not* met [22].
*   **Linguistic Ambiguity (Nominalisierung & Substantive ohne Bezugsindex)**: Using process nouns (e.g., "during system restart") or unindexed nouns ("the data," "the user") that conceal complex steps or fail to identify specific actors [24, 39].
*   **Creating "Technical" or "Fake" Stories**: Framing stories around developer tasks (*"As a developer, I want to upgrade the database..."*) rather than observable value delivered to users or purchasers [16, 40, 41].

---

##### 7. Domain Glossary (Key Terms)

*   **Ist-Zustand vs. Soll-Zustand**: The current operational state/behavior of the system versus the targeted future state/behavior [4, 42].
*   **Baseline (Anforderungsbasislinie)**: A fixed, approved configuration state of requirements or metrics used as a reference point for measuring deltas or changes [6, 28].
*   **Abnahmekriterium (Acceptance Criterion)**: A testable, objective condition that a system or user story must satisfy to be accepted by stakeholders [12, 20].
*   **Satzschablone (Requirement Template)**: A standardized syntactic blueprint used to construct natural-language requirements without ambiguity [26, 43].
*   **Nominalisierung (Nominalization)**: The practice of turning verbs/processes into nouns (e.g., "authentication"), which hides procedural detail unless explicitly defined in a glossary [24, 44].
*   **Entscheidungstabelle (Decision Table)**: A matrix mapping combinations of conditions to system actions, used to uncover missing cases or logical contradictions [22, 23].

---

💡 Would you like me to draft an example user story template using these exact contrast clauses (*"Whereas currently / Instead of"*) for a scenario in your backlog?

**Citations**

| # | Source | Cited passage |
|---|---|---|
| 1 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | Describe the system change Just as every story should describe a behaviour change that represents the business value (the ‘why’) of the story, it should also be clear about the change a team needs to make to software (the ‘what’) in order to bring about or enable that change in user behaviour. When a story is first … |
| 2 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | If we are building a new product, it may be that most stories are about creating new features from scratch. But for established products undergoing steady evolution and maintenance, most stories are about making changes to existing features. Even if a story does add a whole new feature, there are inevitably changes to … |
| 3 | Anforderungsverwaltung.pdf | Korrektive Änderungen – Fehlverhalten des Systems im Betrieb werden korrigiert. Adaptive Änderungen – Eine Veränderung im Kontext, neue Technologien oder veränderte Systemgrenzen machen eine Änderung erforderlich Ausnahmeänderungen – Eine Änderung mit hoher Priorität ist unbedingt und unmittelbar umzusetzen Änderungen … |
| 4 | Humble et al., Lean Enterprise | As with all iterative product development methods, Improvement Kata iterations involve a planning part and an execution part. Here, planning involves grasping the current condition at the process level and setting a target condition that we aim to achieve by the end of the next iteration. Analyzing the current … |
| 5 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | Clarifying the change is a valid and useful step in the refinement of the story. In some cases the process of identifying the extent of the change can help in splitting larger stories. How to make it work Start the discussion by adding another clause to the story template, starting with ‘Whereas currently…’ or … |
| 6 | Anforderungsverwaltung.pdf | 5.2 Traceability Traceability (Nachverfolgbarkeit) beschreibt die Fähigkeit, Anforderungen über ihren gesamten Lebenszyklus hinweg eindeutig zu verfolgen. Sie ermöglicht es, Abhängigkeiten zwischen Anforderungen sowie deren Beziehungen zu vorgelagerten und nachgelagerten Artefakten transparent zu machen. Versionierung … |
| 7 | Anforderungsvalidierung.pdf | Bei der Validierung werden Anforderungen anhand spezifischer Kriterien bewertet: Inhalt: Sind alle relevanten Anforderungen im notwendigen Detail erfasst? Dokumentation: Entsprechen die Anforderungen den definierten Dokumentationsrichtlinien? Abgestimmtheit: Liegt die Zustimmung aller Stakeholder vor und wurden … |
| 8 | Wallaert, Start at the End (2019) | Motivation = the core motive for why people engage in a behavior Limitations = the binary preconditions necessary for the behavior to happen that are outside your control Behavior = the measurable activity you want people to always do when they have the motivation and limitations above Data = how you quantify that … |
| 9 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | A typical story description includes a clause describing the ‘what’ of the story, usually in the ‘I want…’ part of the story template. Even if the required system behaviour is accurately described, the amount of work required from the team to implement it depends on how much it differs from the current system … |
| 10 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | Many delivery teams also implicitly assume that something has value just because business users are asking for it, so they don’t question it. Robert Brinkerhoff, in Systems Thinking in Human Resource Development, argues that valuable initiatives produce an observable change in someone’s way of working. This principle … |
| 11 | Humble et al., Lean Enterprise | Current condition and problem statement This is the problem the business stakeholder wants to address, in simple understandable terms and not as a lack-of-solution statement. For example, avoid statements like “Our problem is we need a Content Management System.” Goal statement How will we know that our efforts were … |
| 12 | Anforderungserhebung.pdf | Als Business Analyst sollen auch unausgesprochene Wünsche der Stakeholder erkannt und in Einklang gebracht werden. Zu jeder Anforderung soll eine Klassifikation zur Priorisierung vorgenommen werden (Details siehe Priorisierungs-Methoden), Aussagen sind konkret zu formulieren und z.B. durch Zahlenwerte oder andere … |
| 13 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | When business stakeholders aren’t experienced with iterative delivery, plans based on user stories often turn into streams of consciousness. Anything goes, stories even get reverse-engineered from feature ideas. A common result is that stakeholders feel that they constantly get small improvements, but the delivery … |
| 14 | Cohn, User Stories Applied (2004) | If you find that some aspect of a system could benefit from expression in a different format, then use that format. < Day Day Up > < Day Day Up > Include User Roles in the Stories If the project team has identified user roles, they should make use of them in writing the stories. So instead of writing "A user can post … |
| 15 | Pohl & Rupp, Basiswissen Requirements Engineering (2015) | Wiederverwendung Wiederverwendung (Reuse): Einmal erarbeitete und auf einen entsprechenden qualitativen Stand gebrachte Anforderungen können wiederverwendet werden. Hierfür werden die Anforderungen z.B. in einer Datenbank gespeichert und nach benötigter Detailebene zur Wiederverwendung bereitgehalten. Durch … |
| 16 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | Describe a behaviour change Bill Wake’s INVEST set of user story characteristics has two conflicting forces. Independent and valuable are often difficult to reconcile with small. The value of software is a vague and esoteric concept in the domain of business users, but task size is under the control of a delivery … |
| 17 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | Agree at the start that features are not allowed in the ‘In order to…’ part – this is an easy way to cheat the experiment. The ‘In order to…’ part shouldn’t say anything about what the software or the product does, only what the users will be able to do differently. An easy way to avoid the problem is to have a rule … |
| 18 | Gothelf & Seiden, Lean UX | Hypotheses have behavior change (outcomes) as their definition of success. Shipping a working feature is table stakes. It’s the beginning of the conversation. Our team’s success is not measured in how fast they can get features launched. Instead we measure success by how well our customers can achieve “some goal” … |
| 19 | Humble et al., Lean Enterprise | The team grasps the current condition and establishes a target condition together. However, in the planning phase the team does not plan how to move to the target condition. In the Improvement Kata, people doing the work strive to achieve the target condition by performing a series of experiments, not by following a … |
| 20 | Pohl & Rupp, Basiswissen Requirements Engineering (2015) | Prüfbar [ISO/IEC/IEEE 29148:2011]: Eine Anforderung muss so beschrieben sein, dass sie prüfbar ist. Das heißt, eine Funktionalität, die durch eine Anforderung gefordert wird, muss sich durch einen Test oder eine Messung nachweisen lassen. Realisierbar [ISO/IEC/IEEE 29148:2011]: Es muss möglich sein, jede Anforderung … |
| 21 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | A measurable behaviour change makes stories easier to split, because there is one more dimension to discuss. For example, if the behaviour change is ‘import contacts 20% faster’, offering a small subset of functionality that speeds up importing by 5% is still valuable. How to make it work Try to quantify expected … |
| 22 | Pohl & Rupp, Basiswissen Requirements Engineering (2015) | 5.1.4 Unvollständig spezifizierte Bedingungen Bedingungsstrukturen erkennen und klären Ein weiterer Indikator für einen möglichen Informationsverlust sind unvollständig spezifizierte Bedingungen. Anforderungen, die Bedingungen enthalten, geben das Verhalten bei Eintritt der Bedingung an, müssen aber auch beschreiben, … |
| 23 | Anforderungsdokumentation.pdf | 3.5 Entscheidungstabellen (Ebert (2012), S. 147) Neben der Dokumentation von Anforderungen über Diagramme ist die Darstellung anhand von Entscheidungstabellen eine sehr geeignete Form zur übersichtlichen Aufbereitung von Abhängigkeiten und Zusammenhängen. Über Entscheidungstabellen lassen sich komplexe Bedingungen … |
| 24 | Pohl & Rupp, Basiswissen Requirements Engineering (2015) | Beispiel: »Bei einem Systemabsturz soll ein Neustart des Systems erfolgen.« Die Begriffe »Systemabsturz« und »Neustart« beschreiben jeweils einen Prozess, der genauer analysiert werden sollte. Prozesse vollständig definieren Per se spricht nichts gegen die Verwendung nominalisierter Begriffe zur Beschreibung eines … |
| 25 | Pohl & Rupp, Basiswissen Requirements Engineering (2015) | DAS SYSTEM MUSS/SOLLTE/WIRD/KANN <Prozesswort> <Prozesswort> bezeichnet das in Schritt 2 ausgewählte Prozesswort, z.B. »drucken« für eine Druckfunktionalität oder »berechnen« für eine Berechnung, die vom System durchgeführt wird. Typ 2: Benutzerinteraktion Stellt das System dem Nutzer eine Funktionalität zur Verfügung … |
| 26 | Pohl & Rupp, Basiswissen Requirements Engineering (2015) | Definition 5–1: Satzschablone Eine Satzschablone (Requirements Template) ist ein Bauplan für die syntaktische Struktur einer einzelnen Anforderung. Um auch lexikalische Eindeutigkeit der Dokumentation zu erreichen, empfiehlt sich in Verbindung mit der Satzschablone der Einsatz eines Projektglossars (siehe Abschnitt … |
| 27 | Pohl & Rupp, Basiswissen Requirements Engineering (2015) | Bedingungen ergänzen Für Anforderungen ist es typisch, dass die geforderte Funktionalität nicht fortwährend, sondern nur unter bestimmten zeitlichen oder logischen Bedingungen ausgeführt oder zur Verfügung gestellt wird. Um zeitliche von logischen Bedingungen klar unterscheiden zu können, wählen wir für zeitliche … |
| 28 | Pohl & Rupp, Basiswissen Requirements Engineering (2015) | 8.5.3 Anforderungsbasislinien Konfiguration vs. Basislinie Anforderungsbasislinien sind ausgezeichnete Konfigurationen von Anforderungen, die in der Regel stabile Versionen von Anforderungen umfassen und häufig auch Auslieferungsstufen des Systems definieren. Aufgrund des letztgenannten Merkmals sind … |
| 29 | Cohn, User Stories Applied (2004) | of three aspects: a written description of the story used for planning and as a reminder conversations about the story that serve to flesh out the details of the story tests that convey and document details and that can be used to determine when a story is complete Because user story descriptions are traditionally … |
| 30 | Gothelf & Seiden, Lean UX | Using the Right Words Language, in this case, is important. Requirements present a seemingly immutable path forward. Assumptions explicitly admit that we might be wrong. We use our assumptions to create and test hypotheses. If you’re familiar with Test-Driven Development (TDD), hypotheses are very similar. They are, … |
| 31 | Klein, UX for Lean Startups | Lean replaces traditional user stories that can be declared “done” by a product owner with User Hypotheses that can be validated or invalidated. In other words, a feature isn’t finished when it’s shipped to a user. A feature is often simply a method of validating whether allowing a new customer behavior is good or bad … |
| 32 | Olsen, The Lean Product Playbook | 77 78 The Lean Product Playbook USER STORIES: FEATURES WITH BENEFITS User stories (used in Agile development) are a great way to write your feature ideas to make sure that the corresponding customer benefit remains clear. A user story is a brief description of the benefit that the particular functionality should … |
| 33 | Product School, The Product Book (2017) | Regardless of what format you choose for your user stories, it should be clear what the feature will do and how to measure success/proper implementation of the feature. We’ve found it also useful to explicitly list “features out”—that is, what you’re not doing and why. For one, multiple readers might ask about adding … |
| 34 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | How to make it work The one thing you really have to do to make this work is to avoid feature requests. If you have only a short summary on a card, it must not be a solution without context. So, ‘How much potential cash is in blocked projects?’ is a valid summary, but a ‘Cash report’ isn’t. The potential cash question … |
| 35 | Wallaert, Start at the End (2019) | To do that, we write a behavioral statement: an articulation of the world we are trying to create, written from an explicitly behavioral perspective. This description of the counterfactual world, which we realize exists through our insights and insight validation, lays the foundation for our next steps on the IDP … |
| 36 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | However, unless we are very familiar with what the relevant part of the system does already, we can’t tell on the face of it whether this is a major change or not. Consider some of these possibilities: Is there already any concept of daily volume limits in place? If not, this story has to build a lot of new things, … |
| 37 | Einführung in die Business Analyse.pdf | 3. Iterativ & kollaborativ arbeiten: Anforderungen entstehen selten in Perfektion. Ein iteratives Vorgehen mit Zwischenergebnissen, Feedbackschleifen und gemeinsamer Verfeinerung fördert das Verständnis aller Beteiligten und reduziert das Risiko von Fehlentwicklungen. 4. Qualität in den Anforderungen sichern: Gute … |
| 38 | The Design Thinking Playbook | We must emphasize, though, that this method is less suitable for finding new product ideas. The reversed question, “What would something have to be like?” often results in a requirements list instead of ideas. We have nonetheless had good experience with the problem reversal technique; for example, for the revision … |
| 39 | Pohl & Rupp, Basiswissen Requirements Engineering (2015) | 5.1.2 Substantive ohne Bezugsindex Substantive mit fehlendem Bezug Substantive bergen ähnlich wie Prozesswörter die Gefahr der unvollständigen Spezifizierung. Linguisten sprechen hier von Substantiven ohne bzw. ohne ausreichende Bezugsindizes. Sprachliche Vertreter für unvollständig spezifizierte Substantive sind … |
| 40 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | In iterative processes where teams commit at the start of an iteration to deliver stories, such vague stories can lead to nasty surprises towards the end. Some teams solve this by writing fake user stories, that mostly follow the pattern ‘As a developer, I want to understand how the new external API works’. They are … |
| 41 | Cohn, User Stories Applied (2004) | these stories are good ones but they should instead be written so that the benefits to the customers or the user are apparent. This will allow the customer to intelligently prioritize these stories into the development schedule. Better variations of these stories could be the following: Up to fifty users should be … |
| 42 | Anforderungsdokumentation.pdf | Simon Doctor Manager Anforderungsdokumentation Inhaltsverzeichnis 1. Ziele der Anforderungsdokumentation 2. Arten der Anforderungsdokumentation 3. Dokumentation durch Prozessmodellierung 4. Dokumentation in der Fachkonzeption 5. Best Practice 1 Einführung in die Anforderungsdokumentation Anforderungserhebung: Klare … |
| 43 | Pohl & Rupp, Basiswissen Requirements Engineering (2015) | Eine im Aktiv formulierte Anforderung könnte lauten: Beispiel für Aktiv-Formulierung: Das System soll dem Benutzer ermöglichen, seinen User-Namen und sein Passwort über die Tastatur am Terminal einzugeben. 5.2 Konstruktion von Anforderungen mittels Satzschablone Qualität durch Satzschablone und Glossar Ein einfach … |
| 44 | Pohl & Rupp, Basiswissen Requirements Engineering (2015) | 4.5.4Vollständigkeit 4.5.5Verfolgbarkeit (Traceability) 4.6Qualitätskriterien für Anforderungen 4.7Glossar 4.8Zusammenfassung 5Anforderungen natürlichsprachig dokumentieren 5.1Sprachliche Effekte 5.1.1Nominalisierung 5.1.2Substantive ohne Bezugsindex 5.1.3Universalquantoren 5.1.4Unvollständig spezifizierte Bedingungen … |

---
## store-phase-2-klaerung-3: How is a rough technical impact estimate done (size, interfaces, risks, NFRs, spike trigger)?

- asked 2026-10-04 · notebook "The Product - Business Design" · conversation `603d324a-dadf-4870-8860-84e438a4a8a0`
- Sources: Anforderungsdokumentation.pdf; Anforderungsverwaltung.pdf; Cohn, User Stories Applied (2004); Pohl & Rupp, Basiswissen Requirements Engineering (2015); Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014); Anforderungserhebung.pdf; Einführung in die Business Analyse.pdf; Evans, Domain-Driven Design (2003); Product School, The Product Book (2017); Olsen, The Lean Product Playbook; Bland, Testing Business Ideas (2019); Patton, User Story Mapping; Humble et al., Lean Enterprise

**Question**

> Context: a tech lead / developer gives a rough technical impact estimate for a not-yet-refined user story during business clarification (before refinement and sprint planning). Describe the step-by-step procedure, as the sources document it, for the activity 'Technische Auswirkungen grob einschätzen': inputs, the ordered steps, what a rough estimate contains (rough size, affected interfaces/components, dependencies, open technical risks, non-functional impact such as performance, security, capacity), how rough sizing is done (e.g. relative estimates) and when the estimate should trigger a time-boxed spike. Also name the mistakes or failure modes the sources call out. Please cite the sources.

**Answer** (verbatim, citation markers resolve in the table below)

Die Aktivität **„Technische Auswirkungen grob einschätzen“** findet in der Phase der fachlichen Klärung statt – noch bevor eine User Story in das detaillierte Refinement oder die Sprint-Planung eingeht [1, 2]. Ziel des Tech Leads bzw. des Entwicklerteams ist es, frühzeitig die technische Machbarkeit, systemische Abhängigkeiten und den groben Umsetzungsaufwand zu bewerten, um dem Product Owner eine verlässliche Entscheidungsgrundlage für die Priorisierung zu liefern [3, 4].

---

##### 1. Eingaben (Inputs)
Für eine fundierte Grobschätzung werden folgende Informationen benötigt:
* **User Story / Anforderungsentwurf**: Beschreibung des fachlichen Nutzens und des gewünschten Verhaltens („Was“ entwickelt werden soll) auf Epic- oder High-Level-Ebene [1, 5, 6].
* **Fachlicher Kontext & Zielbild**: Das zugrunde liegende Problem, der erwartete Geschäftswert (*Business Value*) sowie der Wert für den Endanwender (*User Value*) [7, 8].
* **Systemkontext & Architekturvorgaben**: Kenntnis der aktuellen Systemgrenzen, der betroffenen Komponenten, Datenbanken, IT-Standards und bestehenden Nachbarsysteme [9-12].
* **Referenz-Stories**: Bereits umgesetzte oder geschätzte Backlog-Einträge, die als Vergleichsmaßstab dienen [13, 14].

---

##### 2. Geordnete Schritte der Prozedur
Die Quellen beschreiben das Vorgehen als iterativen Klärungs- und Analyseprozess zwischen Fachexperten/PO und dem Entwicklungsteam [1, 2, 15]:

1. **Fachliches Verständnis herstellen**: Der Tech Lead prüft die Anforderung gemeinsam mit dem PO/Fachexperten, um den Kern der Story und das beabsichtigte Ergebnis ohne vorzeitige Lösungsvorgaben zu durchdringen [1, 7, 16].
2. **System- und Kontextgrenzen analysieren**: Es wird identifiziert, welche Teile des Systems verändert werden müssen und an welchen Stellen Schnittstellen zu externen Systemen oder Modulen betroffen sind [11, 12, 17].
3. **Technische Abhängigkeiten identifizieren**: Ermittlung aller Koppelungen (z. B. notwendige Schnittstellenanpassungen, Datenbankerweiterungen, Vorbedingungen durch andere Stories oder Parallelprojekte) [18-21].
4. **Nicht-funktionale Auswirkungen (NFRs) bewerten**: Prüfung der Anforderung auf Relevanz bezüglich Performanz, Sicherheit, Skalierbarkeit, Kapazität und Systemstabilität [22-25].
5. **Technische Risiken & Unbekannte aufdecken**: Erfassung von Unsicherheiten bezüglich neuer Technologien, fehlenden Domänen- oder Schnittstellenwissens sowie komplexer Algorithmen [16, 26-28].
6. **Relative Grobschätzung durchführen (Rough Sizing)**: Bewertung der Komplexität und der *Job Size* im Entwicklerteam im Vergleich zu bekannten Referenzen [13, 29, 30].
7. **Folgemaßnahmen festlegen**: Entscheidung, ob die Story in kleiner geschätzte Einheiten aufgeteilt werden muss oder ob hohe Unsicherheiten die Auslösung eines **Time-boxed Spikes** erfordern [28, 31-33].

---

##### 3. Inhalt einer Grobschätzung
Eine vollständige Grobschätzung beinhaltet weit mehr als nur eine reine Zahl [18, 24]:
* **Grobe Größe / Komplexität (*Job Size*)**: Eine relative Indikation des Gesamtaufwands [29, 30].
* **Betroffene Komponenten & Schnittstellen**: Konkrete Angabe der zu modifizierenden Module, UI-/Backend-Bausteine sowie Hard- oder Softwareschnittstellen [12, 17, 19, 34].
* **Abhängigkeiten**: Vor- und Nachbedingungen zu anderen Stories, Systemdienstleistungen oder externen Teams [18, 20, 21].
* **Offene technische Risiken**: Identifizierte Unbekannte bezüglich Infrastruktur, Drittsystemen oder Fachlogik [16, 26, 28].
* **Nicht-funktionale Auswirkungen**:
  * *Performanz & Antwortzeiten* (z. B. maximale Latenzen) [22, 24].
  * *Sicherheit & Datenschutz* (z. B. Authentifizierung, BSI-Verschlüsselung) [24, 35].
  * *Kapazität & Skalierbarkeit* (z. B. Bewältigung höherer Nutzerzahlen/Datenmengen) [24, 25, 36].

---

##### 4. Durchführung der Grobschätzung (*Rough Sizing*)
* **Relativer Vergleich (*Magic Estimation* / Triangulation)**: Statt diffuser Stundenschätzungen wird die Story mit bereits geschätzten Anforderungsmustern verglichen [13, 30, 37].
* **Grobe Bewertungsskalen**: Verwendung relativer Skalen (wie der Fibonacci-Folge `1, 2, 3, 5, 8, 13...` oder Größeneinteilungen), um Scheingenauigkeit bei großen/unsicheren Anforderungen zu vermeiden [38-40].
* **Kollektive Schätzung im Team**: Das gesamte Entwicklerteam schätzt gemeinsam. Abweichende Schätzungen führen zu kurzen Diskussionen, um unterschiedliche technische Annahmen oder Missverständnisse aufzudecken [34, 37, 41, 42].

---

##### 5. Wann die Schätzung einen Time-boxed Spike auslösen sollte
Ein **Spike** ist ein gezieltes, kurzzeitiges Forschungsexperiment im Code, um technische oder konzeptionelle Unsicherheiten zu beseitigen [32, 43, 44].

* **Auslöser für einen Spike**:
  * **Fehlendes technisches Wissen**: Das Team besitzt keine Erfahrung mit der betroffenen Technologie, Bibliothek oder Drittanbieter-Schnittstelle [16, 28].
  * **Hohe technische Komplexität / Nicht-Schätzbarkeit**: Die Story ist zu komplex (*Complex Story*) und lässt sich nicht ohne praktisches Ausprobieren verlässlich bewerten [28, 32, 45].
  * **Machbarkeitsnachweis erforderlich (*Feasibility*)**: Vorab muss im Code nachgewiesen werden, ob eine gedachte Lösung leistungsmäßig und strukturell tragfähig ist [43, 46].
* **Eigenschaften des Spikes**:
  * **Strikte Timebox**: Ein Spike ist aggressiv zeitlich begrenzt (typischerweise von 1 Tag bis maximal 2 Wochen) [32, 46].
  * **Trennung von Lernen und Umsetzen (*Split Learning from Earning*)**: Der Spike wird als eigene Forschungs-Story in einer vorgelagerten Iteration eingeplant, um erst danach die eigentliche Funktionalität verlässlich schätzen zu können [28, 33].
  * **Ergebnis ist Erkenntnis**: Das primäre Artefakt ist eine Empfehlung/Erkenntnis; ersteller Code wird nach dem Experiment meist verworfen [43, 47].

---

##### 6. Fehlerbilder und Fallstricke (*Failure Modes*)
Die Quellen heben folgende typische Anti-Pattern hervor:

* **Scheingenauigkeit & Anker-Effekt (*False Accuracy*)**: Erste grobe Schätzungen werden von Stakeholdern als verbindlicher Liefertermin missverstanden. Das verhindert spätere Scope-Anpassungen und erzeugt enormen Termindruck [48, 49].
* **Client-Vendor Anti-Pattern**: Entwickler treten dem PO wie externe Dienstleister gegenüber („Auftraggeber verlangt Festpreis-Garantie“), statt partnerschaftlich Probleme zu lösen [50, 51].
* **Aufschieben großer technischer Risiken („Chocolate vs. Broccoli“)**: Teams priorisieren bevorzugt einfache Erfolge und schieben schwierige technische Risiken nach hinten auf. Dies führt kurz vor Projektende zu massiven Qualitätsmängeln oder Projektbrüchen [52, 53].
* **Implizite Annahmen als Selbstverständlichkeit auffassen**: Technische Rahmenbedingungen oder Qualitätsanforderungen werden nicht explizit thematisiert, was später zu aufwendigen Nacharbeiten führt [54, 55].
* **Exzessiver Schätzaufwand im Vorfeld (*Fuzzy Front End*)**: Monatelange Vorab-Analysen und detaillierte Mikroschätzungen im Vorfeld vernichten wertvolle Entwicklungszeit und verhindern flexible Richtungswechsel [56-58].
* **Unvollständiges Schneiden großer Stories**: Zu große Epics werden nicht bei Überschreiten von Schwellenwerten in kleinere, besser handhabbare Einheiten aufgeteilt [31, 59, 60].

💡 Möchtest du eine praxisnahe Checkliste oder Vorlage zur Dokumentation solcher technischen Grobschätzungen und Risikobewertungen ausarbeiten?

**Citations**

| # | Source | Cited passage |
|---|---|---|
| 1 | Anforderungsdokumentation.pdf | Die Praxis hat gezeigt, dass folgende Punkte besonders zu berücksichtigen sind: Erst wenn eine User Story vom Entwicklerteam verstanden ist, werden sie zur Bearbeitung verteilt. Dafür müssen Fachexperte und Entwickler während des Projektes eng zusammenarbeiten. Nur so kann ein gemeinsames Verständnis über die … |
| 2 | Anforderungsverwaltung.pdf | Im Refinement werden inhaltliche Details gemeinsam (Product Owner und Team) geklärt, Aufwände geschätzt und die Reihenfolge der User Stories im Product Backlog definiert. Das Refinement ist dabei ein kontinuierlicher Prozess, der User Stories im Laufe des Projekt-/Softwarelebenszyklus weiterentwickelt. Im Sprint … |
| 3 | Cohn, User Stories Applied (2004) | estimates, along with her own assessment of the value of each story, to sort the stories so that they maximize the value delivered to the organization. A particular story may be highly valuable to the organization but will take a month to develop. A different story may only be half as valuable but can be developed in … |
| 4 | Pohl & Rupp, Basiswissen Requirements Engineering (2015) | Prüfbar [ISO/IEC/IEEE 29148:2011]: Eine Anforderung muss so beschrieben sein, dass sie prüfbar ist. Das heißt, eine Funktionalität, die durch eine Anforderung gefordert wird, muss sich durch einen Test oder eine Messung nachweisen lassen. Realisierbar [ISO/IEC/IEEE 29148:2011]: Es muss möglich sein, jede Anforderung … |
| 5 | Anforderungsdokumentation.pdf | Aus der Entscheidungstabelle ist damit erkennbar, dass: Immer beim Öffnen der Maske der Datensatz gesperrt wird Beim Wechsel zwischen den Feldern geprüft wird, ob ein Feld leer ist Beim Speichern ebenso überprüft wird ob alle Felder befüllt sind und ein Änderungsbericht aufgerufen wird. Welche modellbasierte Methode … |
| 6 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | How to make it work The one thing you really have to do to make this work is to avoid feature requests. If you have only a short summary on a card, it must not be a solution without context. So, ‘How much potential cash is in blocked projects?’ is a valid summary, but a ‘Cash report’ isn’t. The potential cash question … |
| 7 | Anforderungserhebung.pdf | Nutzen in den Vordergrund stellen Bei der Anforderungsermittlung sollte stets der konkrete Nutzen im Mittelpunkt stehen – nicht die technische Machbarkeit oder der Wunsch nach möglichst vielen Funktionen. Es geht nicht darum, „goldene Wasserhähne“ zu bauen, sondern das umzusetzen, was für die Nutzer und das … |
| 8 | Anforderungsverwaltung.pdf | 3.3.2 Berechnung des WSJF Der WSJF errechnet sich über die Division des Nutzens (Cost of Delay) durch den dahinterstehenden Aufwand (Job Size). Cost of Delay Im Detail gehen die folgenden Faktoren/Dimensionen in die Formel ein: Cost of Delay (CoD): User-/Business Value: Welchen Nutzen stiftet die Anforderung für den … |
| 9 | Einführung in die Business Analyse.pdf | Dabei sind diese drei Sichten rekursiv d.h. sie hängen miteinander zusammen. 3 Anforderungsmanagement Untersuchungen der Standish Group zeigen, dass ungefähr nur 16 % aller untersuchten Projekte erfolgreich, d.h. „on-time“ und „on-budget“ durchgeführt wurden. 31 % der untersuchten Projekte wurden während dem … |
| 10 | Pohl & Rupp, Basiswissen Requirements Engineering (2015) | Eine Qualitätsanforderung ist eine Anforderung, die sich auf ein Qualitätsmerkmal bezieht, das nicht durch funktionale Anforderungen abgedeckt wird. Randbedingungen (auch: Rahmenbedingung) können von den Projektbeteiligten nicht beeinflusst werden. Randbedingungen können sich sowohl auf das betrachtete System beziehen … |
| 11 | Pohl & Rupp, Basiswissen Requirements Engineering (2015) | 2 System und Systemkontext abgrenzen Die Anforderungen an ein zu entwickelndes System existieren nicht per se, sondern müssen ermittelt werden. Aufgabe der System- und Kontextabgrenzung im Requirements Engineering ist es, das System von dessen Umgebung abzugrenzen und den Teil der Umgebung zu identifizieren, der die … |
| 12 | Pohl & Rupp, Basiswissen Requirements Engineering (2015) | Sämtliche Aspekte, die innerhalb der Systemgrenzen liegen, können somit im Systementwicklungsprozess verändert bzw. gestaltet werden. In den Systemgrenzen kann sich z.B. ein aus Hardware und Software bestehendes System befinden, das durch das geplante System ersetzt werden soll. Aspekte im Systemkontext können auch … |
| 13 | Anforderungsverwaltung.pdf | 3.3.4 Definition der relativen Bewertungsskala Die relative Schätzung orientiert sich am Vorgehen an der Magic Estimation (s. Link). Dabei werden alle Dimensionen einer Anforderung relativ zu einer anderen Anforderung betrachtet (bezogen auf die Job Size bspw.: Anfo X = 2, Anfo Y = 8 -> d.h. Anfo Y ist viermal so … |
| 14 | Anforderungsverwaltung.pdf | Hinsichtlich der relativen Bewertung der Job Size ist zu bedenken: Erfolgt die Einstufung der Aufwände je Anforderung im relativen Vergleich der Backlogeinträge zueinander (d.h. Ohne Referenzanforderung), kann die Job Size nicht als Grundlage für eine Magic Estimation oder erwartete Aufwände/Komplexität innerhalb … |
| 15 | Cohn, User Stories Applied (2004) | database. Also, I didn't think about needing more data—maybe that will be a problem." At this point the group discusses it for up to a few minutes. Other estimators will undoubtedly have opinions on whatever reasons the high and low estimators were at the extremes. The customer clarifies issues as they come up. A note … |
| 16 | Cohn, User Stories Applied (2004) | The story is too big.3. First, the developers may lack domain knowledge. If the developers do not understand a story as it is written, they should discuss it with the customer who wrote the story. Again, it's not necessary to understand all the details about a story, but the developers need to have a general … |
| 17 | Pohl & Rupp, Basiswissen Requirements Engineering (2015) | Schritt 3: Charakterisieren der Aktivität des Systems Für funktionale Anforderungen lässt sich die Systemtätigkeit in drei relevante Arten klassifizieren: Selbstständige Systemaktivität: Das System führt den Prozess selbstständig durch. Benutzerinteraktion: Das System stellt dem Nutzer die Prozessfunktionalität zur … |
| 18 | Anforderungserhebung.pdf | Als Business Analyst sollen auch unausgesprochene Wünsche der Stakeholder erkannt und in Einklang gebracht werden. Zu jeder Anforderung soll eine Klassifikation zur Priorisierung vorgenommen werden (Details siehe Priorisierungs-Methoden), Aussagen sind konkret zu formulieren und z.B. durch Zahlenwerte oder andere … |
| 19 | Evans, Domain-Driven Design (2003) | Low coupling and high cohesion are general design principles that apply as much to individual objects as to MODULES, but they are particularly important at this larger grain of modeling and design. These terms have been around for a long time; one patterns-style explanation can be found in Larman 1998. Whenever two … |
| 20 | Evans, Domain-Driven Design (2003) | Both MODULES and AGGREGATES are aimed at limiting the web of interdependencies. When a highly cohesive subdomain is carved out into a MODULE, a set of objects are decoupled from the rest of the system, so there are a finite number of interrelated concepts. But even a MODULE can be a lot to think about without an … |
| 21 | Cohn, User Stories Applied (2004) | prioritization and planning problems. For example, suppose the customer has selected as high priority a story that is dependent on a story that is low priority. Dependencies between stories can also make estimation much harder than it needs to be. For example, suppose we are working on the BigMoneyJobs website and … |
| 22 | Einführung in die Business Analyse.pdf | Nicht funktionale Anforderungen (NFR) – Qualitätsanforderung (IREB) Im Gegensatz zu funktionalen Anforderungen, die beschreiben, WAS ein System leisten soll, geben nicht funktionale Anforderungen an, WIE (gut) ein System etwas leisten soll (qualitativ). Die nichtfunktionalen Anforderungen an ein System können … |
| 23 | Pohl & Rupp, Basiswissen Requirements Engineering (2015) | Qualitätsanforderungen legen gewünschte Qualitäten des zu entwickelnden Systems fest und beeinflussen häufig, in größerem Umfang als die funktionalen Anforderungen, die Gestalt der Systemarchitektur. Typischerweise beziehen sich Qualitätsanforderungen auf die Performanz, die Verfügbarkeit, die Zuverlässigkeit, die … |
| 24 | Pohl & Rupp, Basiswissen Requirements Engineering (2015) | Anforderungen, die die Performanz des Systems definieren, insbesondere das Antwortzeitverhalten und der Ressourcenverbrauch. Anforderungen, die die Sicherheit des Systems definieren, insbesondere die Nachweisbarkeit, Authentizität, Vertraulichkeit und Integrität. Anforderungen, die die Zuverlässigkeit der … |
| 25 | Cohn, User Stories Applied (2004) | system's nonfunctional requirements. Nonfunctional requirements can address a variety of system needs. Some of the more common types of nonfunctional requirements are found in the following areas: performance accuracy portability reusability maintainability interoperabilty availability usability security capacity Many … |
| 26 | Anforderungserhebung.pdf | Umsetzung Sind die Anforderungen technisch machbar? Welche Risiken werden mit der geplanten Lösung auftreten? Stehen die Ressourcen bereit, um die Lösung pünktlich und mit der richtigen Qualität zu liefern? Wie viel Zeit steht für das Projekt zur Verfügung? Was passiert, wenn sich das Projekt verzögert? Wie ist der … |
| 27 | Pohl & Rupp, Basiswissen Requirements Engineering (2015) | die Unterscheidung nach bewussten, unbewussten und unterbewussten Anforderungen, die ermittelt werden sollen; die Termin- und Budgetvorgaben sowie die Verfügbarkeit relevanter Stakeholder; die Erfahrung des Requirements Engineer mit der entsprechenden Ermittlungstechnik; die Chancen und Risiken des Projekts. … |
| 28 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | Split learning from earning Software development often involves dealing with unknowns. Analysing third-party systems, investigating new standards and assessing the risks of migration to a new version of an infrastructure component are all common tasks. Yet each such task differs from others of the same type enough … |
| 29 | Anforderungsverwaltung.pdf | Cost of Delay=User Value+ Business Value + Time Criticality + Risk Reduction + Opportunity Enablement Die Job Size repräsentiert den Aufwand, welcher für die Bearbeitung der Anforderung einher geht. Dahinter steckt in einem Umsetzungsprojekt der Entwicklungsaufwand. Da der WSJF auch für Nicht-Softwareprojekte … |
| 30 | Product School, The Product Book (2017) | Also during the grooming meeting, the engineering team will assess the complexity of the new or updated stories, breaking them down into sub-tasks if necessary. It’s tough to know exactly how hard a task is or how many hours it will take, so you’ll often see complexity measured using relatively weighted story points. … |
| 31 | Olsen, The Lean Product Playbook | A good operating principle is that stories that are estimated to require a large number of points—above some maximum threshold value—need to be broken down into a set of smaller stories that are below the threshold value. You can think of a feature chunk as corresponding to a user story that has an acceptably small … |
| 32 | Cohn, User Stories Applied (2004) | estimate the task. The solution in this case is to send one or more developers on what Extreme Programming calls a spike, which is a brief experiment to learn about an area of the application. During the spike the developers learn just enough that they can estimate the task. The spike itself is always given a defined … |
| 33 | Cohn, User Stories Applied (2004) | product. In situations like this one it is difficult to estimate how long the research story will take. Consider Putting the Spike in a Different Iteration When possible, it works well to put the investigative story in one iteration and the other stories in one or more subsequent iterations. Normally, only the … |
| 34 | Cohn, User Stories Applied (2004) | estimators explain their estimates. It's important that this does not come across as attacking those estimators. Rather, you want to learn what it is they were thinking about. As an example, the high estimator may say, "Well, to test this story we're going to need to create a mock database object and that might take … |
| 35 | Einführung in die Business Analyse.pdf | Randbedingungen Diese beschreiben Anforderungen, welche Art und Weise wie das betrachtete System realisiert werden kann, einschränken. Somit stellen Sie eine nicht funktionale Anforderung und eine Ergänzung der funktionalen dar (Ebert (2012), S. 34). Beispiel: Die Verschlüsselung einer Transaktion muss den … |
| 36 | Einführung in die Business Analyse.pdf | Zuverlässigkeit (Systemreife, Wiederherstellbarkeit, Fehlertoleranz) Aussehen und Handhabung (Look and Feel) Benutzbarkeit (Verständlichkeit, Erlernbarkeit, Bedienbarkeit) Leistung und Effizienz (Antwortzeiten, Ressourcenbedarf, Effizienz) Betrieb und Umgebungsbedingungen Wartbarkeit und Änderbarkeit … |
| 37 | Cohn, User Stories Applied (2004) | < Day Day Up > < Day Day Up > Summary Estimate stories in story points, which are relative estimates of the complexity, effort or duration of a story. Estimating stories needs to be done by the team, and the estimates are owned by the team rather than individuals. Triangulate an estimate by comparing it to other … |
| 38 | Cohn, User Stories Applied (2004) | differences of that magnitude. However, now suppose the developers are arguing over whether a story should be seven or eight story points. In most cases a one point difference between numbers that large is too small to be discussed with any relevance. Arguing about whether a story is worth seven or eight story points … |
| 39 | Anforderungsverwaltung.pdf | Ausprägungen: Welche Werte dürfen vergeben werden? Varianten sind hier bspw. Die Nutzung der Fibonacci-Folge (1, 2, 3, 5, 8, 13, 21, 34…) Alternativ ein beliebiger ein Zahlenbereich von 1 – 10. Bei der Nutzung einer geraden Anzahl an Ausprägungen verhindert die „Tendenz zur Mitte“ Eindeutigkeit: Darf eine Ausprägung … |
| 40 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | When you are comparing stories, try to avoid using numerical sizes. Choose a different sizing mechanism that allows you to make the distinction between ‘too big’ and ‘just right’. Key benefits Numeric story sizes often result in tracking progress using the cumulative size of delivered stories, which in effect measures … |
| 41 | Cohn, User Stories Applied (2004) | others. If the team has defined a story point as a day of ideal work, the developers think about how many ideal days the story will take to complete. If, instead, the team has defined a story point as, for example, the complexity of the story then the estimate is of the perceived complexity of the story. When everyone … |
| 42 | Cohn, User Stories Applied (2004) | similar. < Day Day Up > < Day Day Up > Customer Responsibilities You are responsible for participating in estimation meetings, but your role is to answer questions and clarify stories. You are not allowed to estimate stories yourself. < Day Day Up > < Day Day Up > Questions 8.1 During an estimating meeting three … |
| 43 | Bland, Testing Business Ideas (2019) | P O P -U P S T O R E S IM U LA T IO N 306 COST SETUP TIME CAPABILITIES Product / Technology / Data EVIDENCE STRENGTH RUN TIME DESIRABILITY · FEASIBILITY · VIABILITY The Extreme Programming Spike is ideal for quickly evaluating whether or not your solution is feasible, usually with software. The Extreme Programming … |
| 44 | Patton, User Story Mapping | Spike is a term used for bits of development or research we do with the explicit goal of learning. It’s a term that came from the Extreme Programming community to describe work that may not yield software we choose to ship. Use stories to describe spikes that get your team building something to learn. After you’re … |
| 45 | Cohn, User Stories Applied (2004) | timebox around the investigative story, or spike. Even if the story cannot be estimated with any reasonable accuracy, it is still possible to define the maximum amount of time that will be spent learning. Complex stories are also common when developing new or extending known algorithms. One team in a biotech company … |
| 46 | Bland, Testing Business Ideas (2019) | E X T R E M E P R O G R A M M IN G S P IK E S IM U LA T IO N 308 Cost Cost is relatively cheap and much more inexpensive than building the entire solution — only to find out at the end if it is feasible. Setup Time Setup time for an Extreme Programming Spike is usually about one day. This is the time needed to … |
| 47 | Bland, Testing Business Ideas (2019) | Evidence Acceptance criteria The acceptance criteria defined for the spike was sufficiently met. Did the code perform the task and generate the output required? Recommendation The people working on the spike provide their recommendation on how steep of a learning curve it is to use the software and if it is fit for … |
| 48 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | Don’t create two separate backlogs for external and internal items. Every team we ever worked with had a list of things they wanted to do and people knew what these were intuitively. The delivery team can choose the top priority items for internal improvements without a formal tracking mechanism. It’s perfectly OK to … |
| 49 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | Avoid using numeric story sizes Story sizing is one of those universal causes of heated debates in online forums, and a stumbling block for many inexperienced teams. Story sizing is useful for one purpose: deciding whether a story is too big to implement or small enough to get fast feedback. Almost any story sizing … |
| 50 | Patton, User Story Mapping | The Client-Vendor Anti-Pattern There’s a nasty anti-pattern that gets in the way of using stories well. In fact, it can get in the way of people working together to do anything well. It’s the dreaded client-vendor anti-pattern. In this anti-pattern, one person in a conversation takes the client role, while the other … |
| 51 | Patton, User Story Mapping | The rest of the story is sadly predictable. Every once in a while, the estimate is deadly accurate, and the client gets what he wanted, and what he wanted actually turns out to be what he needs. But, most of the time, constructing a solution takes longer than the vendor predicted. The person in the vendor role can … |
| 52 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | Perhaps an even better example of delivering small increments while losing the big picture is the FBI Sentinel project, which cost 451 million USD and almost failed. In Why the FBI Can’t Build a Case Management System, Jerome Israel highlights one of the biggest risks of iterative delivery. After the first phase of … |
| 53 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | Both examples illustrate how having to make frequent deliveries makes teams focus on short-term wins and neglect long-term risks, until the work becomes completely unsustainable. This is caused not only by the pressure to deliver but also by doing progress reports mostly by tracking activity. Prioritisation is a big … |
| 54 | Pohl & Rupp, Basiswissen Requirements Engineering (2015) | Der häufigste Grund für fehlerhafte Anforderungen ist die falsche Annahme der Stakeholder, dass vieles selbstverständlich ist und nicht explizit genannt werden muss. Es entstehen Kommunikationsprobleme zwischen den Beteiligten, die oft aus unterschiedlichem Erfahrungs- bzw. Wissenstand resultieren. Erschwerend kommt … |
| 55 | Olsen, The Lean Product Playbook | However, in practice, I have not experienced estimation errors to be symmetric. In other words, I have not seen that developers are just as likely to finish tasks early as they are to finish them late. Most of the time, software development tasks take longer than estimated. And while it’s true that some tasks do get … |
| 56 | Humble et al., Lean Enterprise | Thus the business case essentially becomes a science fiction novel based in an universe that is poorly understood—or which may not even exist! Meanwhile significant time is wasted on detailed planning, analysis, and estimation, which 4 [reinertsen] 5 See http://www.howtomeasureanything.com for an example. For an … |
| 57 | Humble et al., Lean Enterprise | One of the most common challenges encountered in software development is the focus of teams, product managers, and organizations on managing cost rather than value. This typically manifests itself in undue effort spent on zero-value-add activities such as detailed upfront analysis, estimation, scope management, and … |
| 58 | Adzic et al., Fifty Quick Ideas to Improve Your User Stories (2014) | When you are choosing an interval, start with the worst-case scenario. People can often agree more easily on a failure condition than on success. For example, it’s much easier to get people to think about how many users a website has to support in order for it not to be a commercial failure, than to get everyone to … |
| 59 | Olsen, The Lean Product Playbook | Let’s say I estimate that task A will take me five minutes and task B will take me five months. Both tasks could have unknown unknowns. But the uncertainty is nonlinear with increasing scope, as the top curve of the cone of uncertainty suggests. The chances that the five-minute task will spiral out of control are … |
| 60 | Cohn, User Stories Applied (2004) | Finally, the developers may not be able to estimate a story if it is too big. For example, for the BigMoneyJobs website, the story "A Job Seeker can find a job" is too large. In order to estimate it the developers will need to disaggregate it into smaller, constituent stories. A Lack of Domain Knowledge As an example … |

---
