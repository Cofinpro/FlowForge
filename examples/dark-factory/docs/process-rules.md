# Prozessregeln („Gedächtnis“): Dark Factory „Von der Produktvision zu User Stories“

Status: lebendes Dokument, **normativ** · Stand 2026-09-25
Gehört zu: `factory/product-vision-to-user-stories.bpmn` (Ablauf)
Umsetzung: `implementation.md` · Stand: `status.md` · Entscheidungen: `decisions.md` · Geplant: `roadmap.md`

> Kurzname in allen generierten Dateien: **„Gedächtnis §n“**, gemeint ist dieses Dokument.

## 1. Zweck

Das BPMN beschreibt **Ablauf, Rollen, Artefakt-Flüsse und Gates**. Vieles, was die Fabrik zum
Arbeiten braucht, lässt sich in BPMN aber nicht (sinnvoll) ausdrücken, etwa Regeln, Schwellen,
Schemas, Evidenzlogik und Panel-Verhalten. Dieses Dokument hält genau das fest. Es ist die zweite
Hälfte der Single Source of Truth.

- Das BPMN verweist per `sdlc:`-Attribut auf die IDs in diesem Dokument: Rollen, Rubrics,
  Artefakt-Typen und Regeln.
- Ändert sich eine Regel, wird **hier** geändert. Das BPMN ändert sich nur, wenn sich Ablauf oder
  Vertrag eines Schritts ändern.
- Wie die Regeln umgesetzt sind, steht in `implementation.md`. Was noch gebaut werden muss, steht in
  `roadmap.md`, nicht hier.

## 2. Leitprinzipien

1. **Vollautonom.** Zwischen Idee und sprint-reifen Stories greift kein Mensch ein. Menschen lesen
   nur das Ergebnis (Run-Report).
2. **Kein Selbst-Abnicken.** Wer ein Artefakt produziert, beurteilt es nicht. Kritiker und Personas
   laufen möglichst auf einer anderen Modellfamilie als der Produzent.
3. **Ehrliche Evidenz.** Jede Aussage trägt ihre Evidenzstufe (§6). Synthetische Evidenz wird nie
   als echte ausgegeben.
4. **Ein Schritt, ein Artefakt.** Jedes Artefakt ist über `derivedFrom` bis zur Quelle
   rückverfolgbar (§10).
5. **Nachrechenbar statt behauptet.** Priorisierungen und Scorings legen ihre Eingangswerte und
   Formel offen, damit der Kritiker sie nachrechnen kann.
6. **Nichts blockiert ewig.** Loop-Cap, Pivot-Cap und Budget garantieren Termination (§9).

## 3. Erweiterung `sdlc:` (BPMN-Annotationen)

Namespace: `urn:dark-factory:sdlc:1.0` (Präfix `sdlc`). Alle Elemente stehen als Kinder von
`bpmn:extensionElements`.

### 3.1 `sdlc:step`: an jedem Task und jeder callActivity

| Attribut | Pflicht | Werte / Bedeutung |
|---|---|---|
| `key` | ja | Fachlicher Schlüssel, z. B. `1.1.2`. Entspricht der BPMN-ID ohne Präfix. |
| `agentRole` | ja | Rollen-ID aus §4. |
| `modelRole` | ja | `producer` \| `critic` \| `persona` \| `research` \| `none` (§5). |
| `kind` | ja | `llm` (LLM-Schritt) \| `deterministic` (Skript, kein LLM). |
| `skill` | nein | Vorgesehener Skill-Name für die spätere Generierung (kebab-case). |

### 3.2 `sdlc:input` / `sdlc:output`: 0..n bzw. genau 1 pro fachlichem Schritt

| Attribut | Bedeutung |
|---|---|
| `artifact` | Artefakt-Typ-ID aus §11. |
| `required` | Nur bei `input`: `true` \| `false`. |
| `itemPrefix` | Nur bei `output`: Präfix der Items, die das Artefakt erzeugt (§10). |
| `cardinality` | `one` (Default) \| `many`, z. B. ein Transkript je Persona. |

### 3.3 `sdlc:research`: 0..n

| Attribut | Bedeutung |
|---|---|
| `tool` | `deep-research` \| `websearch` \| `fetch` \| `ddg` (§8.0). |
| `purpose` | `corpus` (Korpusaufbau) \| `factcheck` \| `discovery` (Bulk-URLs) \| `gapfill` (§8.5). |
| `ref` | Bei `corpus`: Kennung des Deep-Research-Auftrags (`DR-01` … `DR-03`, §8). |

### 3.4 `sdlc:panel`: 0..1

| Attribut | Bedeutung |
|---|---|
| `mode` | `interview` \| `walkthrough` \| `rating` \| `vote` (§7.5). |
| `panelSet` | `proto` (3 Personas, Phase 1) \| `full` (6 Personas ab 2.1.3). |
| `optional` | `true`: Der Schritt darf ohne Panel laufen, wenn das Budget knapp wird. |

### 3.5 `sdlc:critic`: an callActivities auf K bzw. PG und an Schritten mit eigener Rubric

| Attribut | Bedeutung |
|---|---|
| `rubric` | Rubric-ID aus §13. |
| `threshold` | Score-Schwelle 0..1 für „bestanden“ (Default 0.8). |
| `maxLoops` | Loop-Cap (Default 3). |

### 3.6 `sdlc:gate`: an Gateways

| Attribut | Bedeutung |
|---|---|
| `kind` | `critic` (innere Gates) \| `phase-panel` (G-P1…G-P3) \| `deterministic` (G-Split, G-5.1). |
| `recordRequired` | Immer `true`: Jede Entscheidung erzeugt einen Gate-Record (§12). |

### 3.7 `sdlc:condition`: an Sequenzflüssen aus Gateways

| Attribut | Bedeutung |
|---|---|
| `expr` | Freitext-Ausdruck über Gate-Record-Felder, z. B. `verdict == 'pass'`, `verdict == 'fail' && iteration < maxLoops`, `pivotCount < 2`. Nur deklarativ, weil das Modell nicht ausführbar ist. |

### 3.8 Sonstige

- `sdlc:collection` (an MI-Aktivitäten), Attribut `ref`: Menge, über die iteriert wird, z. B.
  `EP[slice=1]`, `ST[status=needs-resplit]`.
- `sdlc:bundle` (an Top-Level-Data-Object-Referenzen), Attribut `artifacts`: kommagetrennte Liste
  der enthaltenen Artefakt-Typ-IDs (§11.1), z. B. `artifacts="vision-statement,lean-canvas,…"`.

## 4. Agentenrollen

| ID | Rolle | Verantwortung | Typische Schritte |
|---|---|---|---|
| `stratege` (STR) | Produktstratege | Vision, Geschäftsmodell, Ziele, Priorisierung, Release-Schnitt | 0, 1.1.x, 1.2.x, 2.2.4–5, 4.2.1/3–5 |
| `researcher` (RES) | Researcher | Recherche-Aufträge, Quellen, Panel-Grounding, Stakeholder-Matrix | Prozess R (R1–R3 Korpusaufbau), 1.1.4, 2.1.1, 2.1.3 |
| `interviewer` (INT) | Interviewer / Panel-Moderator | Leitfaden, Befragung, Transkripte, keine Suggestivfragen | 2.1.2, 2.1.4, Prozess P |
| `persona` (–) | Synthetische Persona | Antwortet in Rolle auf Basis ihres Profils, kennt nur das eigene Profil | Prozess P (Lane „Panel“) |
| `ux` (UX) | UX-/Journey-Designer | Personas, JTBD, Empathy, Journeys, Wireframes als Text | 1.1.5, 1.2.3, 2.1.5–6, 2.2.1–3, 3.1.1–3, 4.1.2, 5.2.3 |
| `architekt` (ARC) | Architekt | Service Blueprint, Walking Skeleton, Spikes, Größenklassen, technische Perspektive | 3.1.4, 4.1.5, 4.2.2–3, 5.1.4, 5.2.4, 6.1.4 |
| `backlog-autor` (BLA) | Backlog-Autor | Story Map, Story Cards, Splitting, Refinement, Confirmation | 4.1.1/3/4, 5.1.1/3, 5.2.1–2, 6.1.1 |
| `qa` (QA) | QA-Perspektive | Randfälle, SBE, Gherkin, Testbarkeit | 4.1.4, 5.2.1, 6.1.2–4 |
| `kritiker` (KRI) | Kritiker | Bewertung gegen Rubrics, Faktencheck, Verdikt, Gate-Records. Schreibt **nie** Artefakte um. | Prozesse K, PG; 6.2.3–4 |
| `traceability` (TRC) | Traceability-Prüfer | Deterministische Graph-Checks, Matrix, Export, Report | 6.2.1/2/5, 7 |

**Ersatz menschlicher Rollen (Q17):**

| Bisher | Neu |
|---|---|
| Three Amigos | **Debatte in drei Perspektiven** (BLA = Was, ARC = Wie, QA = Randfälle). Das Protokoll ist das Artefakt. |
| Story Points | **Größenklasse S/M/L** mit Begründung. INVEST-„Small“ bedeutet ≤ M. L erzwingt Splitting. |
| Tech Lead / Operations | **ARC**. Braucht die Ziel-Architektur/Plattform aus dem Idee-Brief (§14). |
| Wireframes | **Text-/Mermaid-Skizzen** (Regionen, Elemente, Zustände), keine Bilder. |
| Stakeholder-Priorisierung | **Panel-Rating plus offengelegtes Scoring** (Kano, Value vs. Effort, Importance vs. Satisfaction). |

## 5. Modellrollen und Unabhängigkeit

| Modellrolle | Aufgabe | Default-Zuordnung (Konfiguration, nicht BPMN) |
|---|---|---|
| `producer` | Artefakte erstellen, Interviews führen | Claude |
| `critic` | Rubric-Bewertung, Verdikte | Gemini (andere Familie als `producer`) |
| `persona` | Synthetische Nutzer spielen | Gemini (andere Familie als der Interviewer) |
| `research` | Deep Research / Korpusaufbau | Gemini Deep Research API (§8.0) |
| `none` | Deterministische Schritte | – |

Regel: `critic` und `persona` dürfen **nicht** dieselbe Modellfamilie wie `producer` verwenden,
solange eine Alternative konfiguriert ist. Ist keine konfiguriert, setzt jeder Gate-Record das
Risiko-Flag `same-model-review`.

## 6. Evidenzstufen

| Stufe | Symbol | Bedeutung | Wert (`evidence` im itemIndex) |
|---|---|---|---|
| Zitiert | 🔗 | Durch mindestens eine Quelle (`SRC-…`) belegt | `cited` |
| Abgeleitet | 🧠 | Logisch aus anderen Items gefolgert oder angenommen (z. B. Brief-Felder aus Schritt 0) | `inferred` |
| Synthetisch | 🤖 | Stammt aus Antworten des synthetischen Panels (`T-…`) | `synthetic` |
| Validiert | ✅ | Durch echte Menschen bestätigt. **Im Dark-Modus nicht erreichbar**, reserviert für einen späteren Human-Evidence-Slot. | `validated` |

Regeln:

- Jedes Item (§10) trägt genau eine Stufe. Bei Mischbelegen gilt die **stärkste** Stufe
  (🔗 > 🤖 > 🧠), und die Belege werden aufgelistet.
- Die Evidenz eines Artefakts ist der **Evidenzmix** (Anteile je Stufe). Er wird für den Run-Report
  aggregiert.
- Synthetische Evidenz 🤖 **zählt** im Dark-Modus für Gates (Q3). Sie wird aber immer als solche
  ausgewiesen.
- Ein Persona-Merkmal ohne 🔗-Beleg darf nicht in `panel-profiles` stehen (§7.2).

## 7. Synthetisches Panel

### 7.1 Zusammensetzung

- **Proto-Panel** (Schritt 1.1.4): 3 Personas, direkt aus dem Report DR-01 abgeleitet. Es dient nur
  für 1.1.5 und G-P1 und wird in 2.1.3 ersetzt.
- **Voll-Panel** (Schritt 2.1.3): 6 Personas:
  - 4 **Zielnutzer**: unterschiedliche Segmente, Kontexte und Reifegrade.
  - 1 **Contrarian**: skeptisch gegenüber der Kernannahme, sucht aktiv Schwächen.
  - 1 **Verweigerer**: gehört zur Zielgruppe, hat aber einen funktionierenden Workaround und keinen
    Wechselwillen.

### 7.2 Grounding-Pflicht

- Jedes Merkmal eines Panel-Profils braucht mindestens eine `SRC`-Referenz: Foren, Reviews,
  App-Store-Bewertungen, Reports, Social-Posts.
- Quellenmix: mindestens 3 unterschiedliche Quelltypen pro Panel. Keine Persona stützt sich auf
  nur eine Quelle.
- Zitate aus Quellen dürfen als „Stimme“ der Persona dienen und werden als 🔗 markiert.

### 7.3 Versteckte Attribute

Jedes Profil hat einen offenen Teil (für den Interviewer sichtbar) und einen versteckten Teil (nur
für das Persona-Modell). Der versteckte Teil enthält:

- Budget / Zahlungsbereitschaft
- Skepsis-Level (1–5)
- aktueller Workaround und dessen Zufriedenheit
- Wechselbarrieren
- ein „Geheimnis“, also eine Information, die nur bei guter Fragetechnik herauskommt

So prüft das Panel die Interviewqualität statt nur zuzustimmen.

### 7.4 Interview-Regeln (Rubric `interview-guide`, `transcript`)

- Fragen nach **vergangenem Verhalten** statt nach hypothetischen Wünschen (Mom-Test-Prinzip).
  Keine Suggestivfragen. Die Lösungsidee wird erst im letzten Drittel gezeigt.
- Pro Persona ein eigenes Transkript `T-<nn>_P-<nn>` mit Leitfaden-Version und Modellrolle.
- Die Persona darf „weiß nicht“ und „ist mir egal“ sagen. Der Interviewer darf das nicht umdeuten.

### 7.5 Modi

| Modus | Zweck | Output |
|---|---|---|
| `interview` | Tiefeninterview nach Leitfaden | Transkript je Persona |
| `walkthrough` | Persona geht eine Journey bzw. einen Ablauf durch und kommentiert Schritte | Kommentar je Schritt und Persona |
| `rating` | Items bewerten (z. B. Importance/Satisfaction 1–5, VPC-Fit) | Tabelle Item × Persona |
| `vote` | Gate-Votum (Desirability, „würdest du nutzen/zahlen?“) | Votum 1–5 plus Begründung je Persona |

### 7.6 Einsatzpunkte

1.1.5 (Proto) · G-P1 (Proto) · 2.1.4 · 2.2.1 (optional) · 2.2.5 · 3.1.1 · 3.1.3 · G-P2 · G-P3 ·
6.1.2 (optional).

## 8. Recherche

Prozess R (`Process_R`, Skill `product-recherche`) liefert alle Quellen der Fabrik. Er läuft
unbeaufsichtigt und muss deshalb ohne Cookie-Logins, inoffizielle APIs oder menschliche Sichtung
auskommen. Welcher konkrete Provider einen Kanal bedient, steht in der Konfiguration
(`research.yaml`), nicht hier.

### 8.0 Kanäle und Routing

| Kanal (`sdlc:research tool`) | Provider (Default) | Einsatz | Grenzen |
|---|---|---|---|
| **`deep-research`** | Gemini Deep Research API (Interactions API) | Korpusaufbau **DR-01** Markt & Wettbewerb (`Call_R1`), **DR-02** Zielgruppe / VoC (`Call_R2`), **DR-03** Domäne, Prozesse, Regulatorik (`Call_R3`); **genau ein** Aufruf je Korpus und Run | langsam (Minuten), kostenpflichtig; Hard-Cap 3 Aufrufe und Geld-Cap pro Run (§9.4) |
| **`websearch`** | Claude WebSearch | Faktenchecks (K.3), Gap-Fill (§8.5), leichte Recherche in Schritt 0 und 1.1.3 | Ergebnisliste; Seiteninhalt kommt über `fetch` |
| **`fetch`** | Rohtext per HTTP (Readability); Fallback Claude WebFetch | Seiteninhalt jeder Quelle, die zitiert werden soll | JavaScript-/Paywall-Seiten scheitern → Fallback |
| **`ddg`** | DuckDuckGo-HTML | optionale Bulk-Discovery, **Default aus** | keine offizielle API, rate-limitiert. **Nie einzige Quelle eines Claims.** |

Ausgeschlossen: **NotebookLM** (Cookie-Login verfällt) und **Google-Search-Grounding** als eigener
Kanal (Nutzungsbedingungen verbieten Speichern, Analysieren und Harvesting der Ergebnisse).

Routing in R.1: Korpustiefe → `deep-research` (nur beim ersten Aufruf eines Korpus, §8.5);
Faktencheck oder Lücke → `websearch`; Bulk-Discovery → URLs aus dem DR-Report plus `websearch`,
`ddg` nur wenn konfiguriert. Ein Faktencheck (K.3) nutzt nur `websearch`.

### 8.1 Korpusaufbau als eigener Researcher-Schritt

DR-01/02/03 laufen als eigene `callActivity`-Aufrufe auf `Process_R` (`Call_R1`/`Call_R2`/
`Call_R3`), ausgeführt vom `researcher`-Agenten. Jeder Call sitzt im BPMN unmittelbar **vor** der
Phase, die er versorgt, und damit **außerhalb** von deren innerer Kritiker-Schleife: ein K-Retry
(§9.1) löst **keinen** neuen Recherche-Aufruf aus. Der Rücksprung „Mehr Research“ (G-P2, §9.3)
durchläuft `Call_R2`/`Call_R3` erneut, dann im Gap-Fill-Modus (§8.5).

### 8.2 Pflicht-Scope je Korpus-Report

Ein DR-Report gilt nur als vollständig, wenn er diese Punkte
abdeckt; die Rubrics (§13) machen das prüfbar:

| Report | Muss abdecken |
|---|---|
| `research-markt-wettbewerb` (DR-01) | **Marktgröße/-wachstum** als Spanne mit genannter Methode (Top-down/Bottom-up) und Bezugsjahr, trianguliert; **≥ 3 direkte und ≥ 2 indirekte Wettbewerber** mit Positionierung, Zielgruppe, Preismodell und Preispunkten; **Feature-Matrix** der direkten Wettbewerber (≥ 5 Merkmale); **Preis-/Erlösmodell-Benchmarks**; **Markttrends** der letzten 2–3 Jahre mit Datum; **Markteintrittsbarrieren** |
| `research-zielgruppe-voc` (DR-02) | **≥ 2 Segmente** mit Abgrenzungsmerkmalen und grober Größe; je Segment **≥ 3 wörtliche VoC-Zitate** aus ≥ 2 Quelltypen (Foren, Reviews, Social); **Jobs und Pains aus Nutzeraussagen** (nicht nur Demografie), je Pain mit Zitat; **heutige Workarounds** und Wechselbarrieren; Zahlungsbereitschafts-Signale |
| `research-domaene-prozesse-regulatorik` (DR-03) | **Ist-Prozess** in Schritten mit Beteiligten; **geltende Regulatorik/Standards** mit Fundstelle (Gesetz/Norm und Paragraf bzw. Abschnitt, T1), falls branchenrelevant, sonst ausdrücklich „keine spezifische“; **≥ 1 Praxis- und ≥ 1 Negativfall**; **Fachbegriffe** als Glossar-Vorlage |

### 8.3 Quellen normalisieren und einstufen (R.3)

- Jede abgerufene Quelle wird ein `source`-Record `SRC-<nnnn>`. Felder: `url` (aufgelöst, keine
  Redirect-Links), `title`, `retrievedAt`, `tool`, `query`, `contentHash` (SHA-256 des bereinigten
  Rohtexts), `contentKind`, `sourceType`, `tier`, `publishedAt` (falls erkennbar) und eine Kurzfassung.
- `contentKind`: `raw` (Rohtext der Seite) \| `summary` (nur eine Modell-Zusammenfassung, z. B. per
  WebFetch oder Deep-Research-Zitat ohne Abruf) \| `none` (Abruf gescheitert).
- Duplikate (gleicher `contentHash` oder gleiche kanonische URL) werden zusammengeführt, die
  `query`-Historie wird angehängt. Eine `raw`-Fassung ersetzt eine `summary`-Fassung derselben URL.
- Rohantworten der Tools bleiben unverändert als JSON erhalten (`research/raw/<tool>/`).

**Quellen-Tiers** (`tier`):

| Tier | Quellen | Darf tragen |
|---|---|---|
| **T1** | amtlich, regulatorisch, Primärdaten (Gesetze, Behörden, Statistikämter, Geschäftsberichte, Standards) | alles |
| **T2** | etablierte Medien, Analysten, Marktstudien, Hersteller-Doku, Preisseiten | alles außer Regulatorik allein |
| **T3** | Foren, Reviews, App-Store, Social, Blogs | nur Voice-of-Customer, Pains, Zitate; **nie allein** Markt-, Zahlen- oder Regulatorik-Claims |

**Aktualität:** Markt-, Wettbewerbs- und Preisdaten höchstens 3 Jahre alt (`publishedAt`, sonst
`retrievedAt` mit Risiko-Flag `undated-source`). Regulatorik: die aktuell gültige Fassung.

### 8.4 Claims und Triangulation (R_3b)

Zwischen Normalisierung und Synthese extrahiert R_3b die Aussagen in ein **Claim-Ledger**
`research/claims/<callId>.json` (Record, JSON-first, §11.2). Je Claim:
`id` (`CLM-<nnn>`), `text`, `scopePoint` (Pflicht-Scope-Punkt §8.2), `key` (ja/nein), `sources`
(`SRC`-IDs), `tiers`, `dates`, `triangulated` (ja/nein), `evidence` (`cited` \| `inferred`).

- **Kern-Claim** (`key: true`): jede Zahl (Marktgröße, Preis, Anteil, Wachstum), jeder benannte
  Wettbewerber mit Positionierung/Preis, jede regulatorische Vorgabe und alles, worauf ein Gate
  oder eine Kill-Annahme später aufbaut.
- **Trianguliert** heißt: mindestens **2 unabhängige** Quellen (verschiedene Domains, nicht
  voneinander abgeschrieben), mindestens eine davon `contentKind: raw` und im erlaubten Tier.
- Ein Kern-Claim, der nicht trianguliert ist, geht in die Lückenliste (§8.5). Bleibt er nach dem
  Gap-Fill untrianguliert, wird er auf 🧠 `inferred` herabgestuft und bekommt das Risiko-Flag
  `untriangulated-key-claim`. Er wird nie gelöscht und der Run bricht nicht ab.
- Nicht-Kern-Claims brauchen eine Quelle im erlaubten Tier.
- **R.4 zitiert nur Claims aus dem Ledger** (mit ihren `SRC`-IDs). Eine Aussage ohne Ledger-Eintrag
  gehört nicht in den Report.

### 8.5 Abdeckung, Lücken und Gap-Fill

- R_3b prüft das Ledger gegen den Pflicht-Scope (§8.2) und schreibt die **Lückenliste**: fehlende
  Scope-Punkte und untriangulierte Kern-Claims.
- Gateway **„Lücken?“**: Gibt es Lücken und wurde noch nicht nachgesucht, geht es **einmal** zurück
  zu R_2b (WebSearch gezielt auf die Lücken), dann erneut R.3 und R_3b. Danach geht es immer weiter
  zu R.4. Offene Punkte stehen im Report ausdrücklich als nicht abgedeckt.
- **Zweiter Aufruf desselben Korpus** (G-P2 „Mehr Research“, Rücksprung nach Pivot): kein neuer
  Deep-Research-Aufruf. R läuft im Modus **Gap-Fill**: nur `websearch`, gezielt auf die Lücken und
  Änderungsaufträge aus dem Gate-Record; der bestehende Korpus bleibt erhalten und wird ergänzt.

## 9. Gate-Regeln und Grenzen

### 9.1 Innere Gates (Prozess K)

1. K.2 bewertet jedes Rubric-Kriterium mit `pass` \| `partial` \| `fail` und einer Begründung.
   Score = gewichteter Anteil `pass` (`partial` zählt 0,5).
2. K.3 faktencheckt alle Claims, die K.2 als „strittig“ markiert hat, per WebSearch.
   Ein widerlegter Claim wird zum `fail` des betroffenen Kriteriums.
3. K.4: `score ≥ threshold` ergibt `pass`. Sonst gilt: Bei `iteration < maxLoops` ist das Verdikt
   `fail` (Rücksprung). Bei `iteration ≥ maxLoops` ist es `pass-with-risk`, und die offenen
   Kriterien werden als Risiko-Flags ans Artefakt und an alle abgeleiteten Items vererbt.
4. Der Kritiker gibt bei `fail` **konkrete Änderungsaufträge** zurück. Selbst ändert er nichts.

### 9.2 Phasen-Gates (Prozess PG)

| Gate | Bestanden, wenn |
|---|---|
| **G-P1 Vision** | Kritiker `pass` (Rubric `gate-vision`) **und** Proto-Panel: mindestens 2 von 3 Personas mit Votum ≥ 3/5. |
| **G-P2 Validierung** | Kritiker `pass` (Rubric `gate-validierung`) **und** mindestens 3 von 4 Zielnutzer-Personas mit Desirability-Votum ≥ 4/5 **und** jeder Einwand von Contrarian und Verweigerer ist im Gate-Record adressiert (Antwort oder Risiko-Flag). |
| **G-P3 MVP** | Kritiker `pass` (Rubric `gate-mvp`) **und** mindestens 3 von 4 Zielnutzern „würde nutzen“ ≥ 4/5 **und** mindestens 2 von 4 mit Zahlungsbereitschaft passend zum Preismodell aus `lean-canvas`. |

Die Voten von Contrarian und Verweigerer zählen **nicht** zur Mehrheit. Ihre Einwände müssen aber
beantwortet werden.

### 9.3 No-Go, Pivot, Nachschärfen

- **No-Go (G-P1, G-P2):** mindestens eine Kill-Annahme (`assumptions-map`: Wichtigkeit hoch,
  Evidenz niedrig) ist durch 🔗-Evidenz aktiv **widerlegt**, oder der Pivot-Cap ist erreicht.
  Ergebnis: Begründungs-Record, dann „No-Go-Report erstellen“ (`S_NoGo`, D-39): `REPORT.md` mit
  Status `discarded` (greifende Regel, Kill-Annahmen mit Evidenz, Panel-Voten, Evidenzmix,
  Pivot-Historie, Change Requests zum Wiederaufnehmen, Kosten), kein Backlog-Export, keine
  Veröffentlichung; danach Ende „Idee verworfen“.
- **Pivot (G-P2):** Das Problem ist validiert, aber das Geschäftsmodell bzw. der Lösungsansatz
  trägt nicht (Desirability ok, Viability `fail`). Nur bei `pivotCount < 2`. Rücksprung zu SP1.1,
  bestehende Research-Korpora bleiben erhalten.
- **Mehr Research (G-P2):** Evidenzmix von `personas`/`jtbd` hat weniger als 50 % 🔗, oder das Panel
  ist uneinig (Streuung der Voten ≥ 2 Punkte). Rücksprung über `Call_R2`/`Call_R3` im Gap-Fill-Modus
  (§8.5, kein neuer Deep-Research-Aufruf) zu SP2.1. Der Gate-Record nennt die Lücken als
  `changeRequests`.
- **Nachschärfen (G-P1, G-P3):** Kritiker `fail` ohne Kill-Kriterium. Loop-Cap wie bei K.

### 9.4 Budget

- Hartes Budget pro Run, konfiguriert außerhalb des BPMN (`research.yaml`, Workflow-Args):
  - Token-Budget der Claude-Agenten (Workflow-Budget).
  - **Deep Research:** höchstens 3 Aufrufe pro Run (Hard-Cap) **und** ein Geld-Cap für externe
    Recherche-APIs (Default 15 USD). Jeder Adapter bucht die Kosten eines Aufrufs aus der
    `usage`-Antwort des Providers in `run.json` (`research.costUsd`, `research.deepResearchCalls`).
  - **Vor** jedem kostenpflichtigen Aufruf prüft der Adapter beide Caps und schätzt die Kosten
    konservativ; reicht der Rest nicht, ruft er nicht auf, sondern meldet `budget-cap-reached`, und
    R routet auf `websearch`. Der Hook `product-research-budget-guard` sperrt zusätzlich jeden
    Recherche-Aufruf, sobald `budget.status == exhausted`.
  - Kein kostenpflichtiger Aufruf ohne aktiven Run (`runs/.active`) — außerhalb eines Runs laufen
    die Adapter nur im Replay-Modus.
  - **Hängender Deep-Research-Aufruf (D-40):** Ein Aufruf, der `stallMinutes` (`research.yaml`,
    Default 60) nach dem Absenden noch kein Ergebnis hat, wird beim nächsten Timeout bei Google
    abgebrochen und in `run.json` entwertet: ohne gemeldete `usage` `released` (Hard-Cap und
    Reservierung zurück), sonst `cancelled` mit gebuchten Kosten. Entwertete Aufrufe werden nie
    wieder aufgenommen und verbrauchen den einen Aufruf des Korpus nicht; ein neuer `--live`-Lauf
    stellt den Auftrag frisch. Von Hand: `gemini-deep-research.mjs <runDir> --call DR-0n --cancel`.
- Bei Erschöpfung wird `Error_BudgetErschoepft` ausgelöst. Der Event-Sub-Prozess sichert den
  Zwischenstand und schreibt einen Run-Report mit `status: partial`.
- Budget-Vorrang: Schritte mit `sdlc:panel optional="true"` entfallen zuerst, bevor das Budget
  auslöst.

## 10. Traceability und Item-IDs

### 10.1 Präfixe

| Präfix | Item | Entsteht in |
|---|---|---|
| `VIS` | Vision Statement | 1.1.2 |
| `ASM` | Annahme | 1.1.6 |
| `GOAL` | Geschäftsziel / KPI | 1.2.1 |
| `ACT` | Akteur | 1.2.2 |
| `IMP` | Impact (Verhaltensänderung) | 1.2.3 |
| `DEL` | Deliverable-Option | 1.2.4 |
| `SRC` | Quelle | Prozess R |
| `CLM` | Recherche-Claim (Claim-Ledger, §8.4) | Prozess R, R_3b |
| `P` | Panel-Persona (synthetisch) | 1.1.4, 2.1.3 |
| `T` | Interview-Transkript | 2.1.4 |
| `PER` | Modellierte Persona / User Role | 2.1.5 |
| `JOB` | Job-to-be-Done | 2.1.6 |
| `PAIN` / `GAIN` | Pain / Gain | 2.2.2 |
| `HMW` | How-Might-We | 2.2.3 |
| `OPP` | Opportunity | 2.2.4 |
| `HS` | Hot Spot | 3.1.2 |
| `ACTV` | User Activity (= Epic-Kandidat) | 4.1.3 |
| `UT` | User Task | 4.1.3 |
| `EP` | Epic | 4.1.3 |
| `ST` | Story | 5.1.1 |
| `SPK` | Spike | 5.1.4 |
| `AC` | Akzeptanzkriterium | 6.1.3 |
| `TERM` | Glossar-Begriff (Ubiquitous Language) | 5.2.3, 6.2.3 |
| `G` | Gate-Record | Prozesse K, PG |

Format: `<PRÄFIX>-<nnn>` (bei `SRC`: `<nnnn>`). IDs sind pro Run stabil und werden nie
wiederverwendet, auch nicht nach dem Aussortieren.

### 10.2 Regeln

- Jedes Item hat `derivedFrom: [<Item-IDs>]` und mindestens eine Evidenzreferenz (`SRC`, `T` oder
  `inferred`).
- **Pflichtkette:** `AC → ST → UT → EP/ACTV → (OPP | JOB) → IMP → GOAL → VIS`. `HS`, `PAIN` und
  `ASM` sind zusätzliche, empfohlene Kanten.
- **Orphan:** ein Item ohne vollständigen Pfad zur Pflichtkette. Wird in 6.2.1/6.2.2 **deterministisch**
  per Graph-Traversal gefunden, ohne LLM.
- **Fake-Story:** Story ohne Nutzer-Nutzen (Rolle ist das eigene Team, z. B. „Als Entwickler …“),
  Duplikat (semantisch gleiche Story) oder Story mit rein technischem „damit“. Wird in 6.2.4 vom
  Kritiker bewertet.
- Jede Story listet die **unvalidierten Annahmen** (`ASM` mit niedriger Evidenz), auf denen ihr
  Pfad beruht.

## 11. Artefakt-Typen und Metadaten

### 11.1 Artefakt-Typen

Die Artefakt-Typ-IDs entsprechen den `sdlc:output`-Namen im BPMN, z. B.
`idea-brief`, `vision-statement`, `lean-canvas`, `proto-panel`, `value-proposition-canvas`,
`assumptions-map`, … `acceptance-criteria`, `glossary`, `trace-findings`, `backlog-cleaned`,
`traceability-matrix`, `backlog-export`, `run-report`. Dazu kommen die Querschnittstypen
`research-<thema>`, `source` und `gate-record`. Die Liste in `workflow-spec.yaml` ist die maßgebliche
Aufzählung.

### 11.2 Ablage: Markdown-Body + JSON-Sidecar

Jedes Artefakt im Run besteht aus zwei Dateien mit demselben Namen:

| Datei | Rolle | Wer schreibt |
|---|---|---|
| `<name>.md` | Fachlicher Inhalt für Menschen und Agenten. Oben steht ein **read-only** Frontmatter (id, type, version, status, gate, evidence, items, riskFlags, `meta:`-Verweis) | Body: der produzierende Agent. Frontmatter: aus dem Sidecar gerendert |
| `<name>.meta.json` | Die Metadaten. **Maßgeblich** für alle Skripte, Gates und Folgeschritte | nur Skripte (`commit-artifact.mjs`, `write-gate-record.mjs`, …) |

Grundregel: **Das Modell schreibt Inhalt und Bedeutung, Code schreibt die Hülle.** Was das Modell
nicht zuverlässig wissen kann (Version, Hash, Zeitstempel, Zählungen, Anteile, IDs der Eingänge),
setzt ein Skript. Der gerenderte Frontmatter wird nie zurückgelesen. Leser nutzen immer das Sidecar.

**Ablauf je Schritt:**
1. Der Agent schreibt den Body (Markdown ohne Frontmatter).
2. Er übergibt seinen **authored-Block** an
   `commit-artifact.mjs commit <runDir> <datei.md> --step <BPMN-Element>` (per stdin).
3. Das Skript prüft den Block und berechnet den Rest. Dann schreibt es das Sidecar, rendert den
   Frontmatter, legt einen Snapshot unter `history/<id>/v<n>.*` ab und loggt `artifact-committed`.
4. K.1 („Rubric laden“) bewertet nur committete Artefakte, also mit gültigem Sidecar und passendem
   Body-Hash.

**Sidecar (`df.artifact/v1`):**

```json
{
  "schema": "df.artifact/v1",
  "id": "1.1.2_vision-statement",
  "type": "vision-statement",
  "bpmnElement": "S1.1.2",
  "runId": "2026-09-25_meal-planner_a7f3",
  "version": 2,
  "status": "draft",
  "language": "de",
  "producedBy": { "agentRole": "stratege", "modelRole": "producer", "model": "session-default", "skill": "product-vision-statement-formulieren" },
  "createdAt": "…", "committedAt": "…",
  "body": { "path": "1.1.2_vision-statement.md", "sha256": "…" },
  "derivedFrom": [{ "artifact": "1.1.1_zielbild", "version": 1, "sha256": "…", "path": "artifacts/p1-strategie/1.1.1_zielbild.md" }],
  "authored": {
    "itemIndex": [{ "id": "VIS-001", "derivedFrom": ["ZB-002"], "evidence": "cited", "refs": ["SRC-0003"] }],
    "sources": ["SRC-0003", "SRC-0017"],
    "riskFlags": [],
    "attributes": {},
    "openQuestions": [],
    "notesForNext": "…"
  },
  "derived": { "items": ["VIS-001"], "evidence": { "cited": 1, "inferred": 0, "synthetic": 0, "validated": 0, "n": 1 } },
  "gate": { "record": "G-014", "verdict": "pass", "score": 0.86, "iteration": 2 },
  "riskFlags": [],
  "history": [{ "version": 1, "sha256": "…", "status": "draft", "gate": "G-011", "committedAt": "…" }]
}
```

| Feld | Quelle |
|---|---|
| `authored.*` | **Modell.** `itemIndex` ist Pflicht (darf leer sein). Unbekannte Schlüssel werden abgelehnt |
| `id`, `type`, `bpmnElement`, `runId`, `language`, `producedBy` | Skript, aus dem Schritt-Vertrag (`lib/contracts.mjs`, generiert aus den `sdlc:`-Annotationen) |
| `version`, `history`, `createdAt`, `committedAt`, `body` | Skript. Neue Version nur bei geändertem Body oder authored-Block (§15) |
| `derivedFrom` | Skript: jeweils neuester committeter Stand jedes deklarierten Inputs (bei Pro-Story-Schritten derselben Story), plus `--from`-Pfade |
| `derived.items`, `derived.evidence` | Skript, aus `authored.itemIndex` (Evidenzmix §6) |
| `status`, `gate`, `riskFlags` | Skript. `draft` bei jedem Commit. `passed` / `passed-with-risk` / `discarded` setzt nur `write-gate-record.mjs` (§2.2) |

**Prüfungen beim Commit (deterministisch):**
- `cited` braucht mindestens eine `SRC-`Referenz (§6).
- Jede genannte `SRC-`ID muss als normalisierte Quelle existieren.
- `validated` ist im Dark-Modus unerreichbar.
- Item-IDs haben das Format `PREFIX-nnn` und sind im Artefakt eindeutig.
- Ein neues Item mit einem Präfix, das der Schritt nicht deklariert, erzeugt eine Warnung.
- Fehlende Pflicht-Inputs werden als `missingInputs` vermerkt.

**Sonderfälle:**
- **Amend:** Ändert ein späterer Schritt eine Datei eines anderen Schritts (z. B. die Größe einer
  Story per `story.mjs patch`), bleiben id, type, Produzent und `derivedFrom` erhalten. Der Schritt wird in
  `amendedBy` vermerkt.
- **Typ-Attribute** (z. B. `slice` eines Epics) setzt ein Schritt ohne neuen Body mit
  `commit-artifact.mjs attrs`.
- **Records** sind JSON-first. Das Markdown wird vollständig aus dem Sidecar erzeugt:
  - Gate-Records `df.gate-record/v1` (§12)
  - Quellen `df.source/v1` (§8)
  - Transkripte, Trace-Findings und die Traceability-Matrix
- **Stories** sind ebenfalls Records, mit eigenem Schema (§11.3).
- **Reine Datendateien** haben kein Sidecar: `backlog/backlog.json` (von `export-backlog.mjs` aus
  den Story-Records erzeugt, §11.3), `panel/sessions/*.json`, `research/raw/**`. Das zugehörige `source`-Artefakt verweist per `raw:` auf die Rohdatei.
- **Run-Zustand** liegt in `run.json`, dem Event-Log `log/events.jsonl` und den Snapshots in
  `history/`. Beides schreiben nur Skripte, der Hook `product-artifact-contract-guard` sperrt es
  für Agenten.

### 11.3 Stories und Spikes sind Records (`df.story/v1`, `df.spike/v1`)

Die Story ist das eigentliche Produkt des Runs. Deshalb ist sie **JSON-first** wie ein Record:

- **Maßgeblich ist der Story-Record** im Sidecar der Story-Datei (`authored.attributes`, Schema
  `df.story/v1`). Daraus werden zwei Dateien erzeugt:
  - `backlog/stories/ST-<nnn>_<slug>.md`, vollständig gerendert. Kein Agent schreibt diese Datei
    (Hook-gesperrt).
  - `backlog/backlog.json`, erzeugt von `export-backlog.mjs`.
- **Anlegen** mit `story.mjs put` in 5.1.1 und 5.1.3 (Kinder). **Ändern** mit
  `story.mjs patch <ST-id>` in 5.1.3 (Eltern), 5.1.4, 5.2.2, 5.2.4, 6.1.3, 6.1.4 und 6.2.4. Beides
  läuft über denselben Commit wie jedes Artefakt (§11.2): Version, Historie und `amendedBy` setzt
  das Skript.
- **Pflichtfelder:**
  - `id` (ST-nnn, neue IDs über `story.mjs next-id`), `title`, `epic`, `userTask`
  - `connextra {role, want, soThat}`
  - `derivedFrom` (muss die `userTask` enthalten)
  - `evidence`
- **Optionale Felder:**
  - Status: `status` (`active` | `needs-resplit` | `superseded` | `discarded`)
  - Evidenz: `refs`, `assumptions [{id, evidence, why}]`
  - Inhalt: `conversation`, `context`, `businessRules`, `scope {in, out}`
  - Refinement: `size {class, reasoning}`, `spikes`, `implementationNotes`,
    `confirmationCandidates`, `blockers`
  - Split: `splitFrom`, `splitPattern`, `splitInto`
  - Akzeptanzkriterien: `acceptanceCriteria [{id, title, kind, given[], when[], then[], examples?}]`
  - Sonstiges: `discard {reason, duplicateOf?, justification}`, `notes`, `flags`
- **Regeln, die das Skript prüft:**
  - Unbekannte Felder werden abgelehnt, ebenso `cited` ohne `SRC` und eine doppelte ST-ID.
  - Größe L ist nur mit `needs-resplit` zulässig (§4).
  - `superseded` braucht `splitInto`. `discarded` braucht `discard` mit Grund `orphan`, `fake`
    oder `duplicate`; bei `duplicate` zusätzlich `duplicateOf`.
  - Jede AC-ID muss ein Item eines committeten `acceptance-criteria`-Artefakts sein. Die ACs der
    Story sind die kanonische Form; das Artefakt aus 6.1.3/6.1.4 bleibt das Arbeitsdokument
    mit den Items.
- **Item-Graph:**
  - Die Story-Datei trägt genau ein Item, das ST-Item. Es wird aus dem Record abgeleitet
    (`derivedFrom` plus `splitFrom`).
  - `superseded`- und `discarded`-Stories zählen für die Traceability nicht und werden nicht
    exportiert. In `backlog.json` stehen sie unter `excluded`.
- **Spikes sind ebenfalls Records** (`df.spike/v1`):
  - **Ablage und Befehle:** Die Datei ist `backlog/spikes/SPK-<nnn>_<slug>.md`, gerendert von
    `spike.mjs`. Angelegt werden Spikes mit `spike.mjs put` in 5.1.4. Geändert werden sie mit
    `spike.mjs patch`: in 5.1.3 (Umhängen auf ein Kind) und in 6.2.4 (Verwerfen).
  - **Pflichtfelder:**
    - `id`, `title`
    - `question`: genau eine Frage
    - `why`: warum die Story ohne die Antwort nicht schätzbar ist
    - `blocks`: die blockierten ST-IDs
    - `timebox {amount, unit}`: begrenzt auf höchstens 2 Tage bzw. 16 Stunden
    - `acceptanceCriteria`: vor der Durchführung festgelegt
    - `decisionEnabled`
    - `derivedFrom`: enthält alle blockierten Stories
    - `evidence`
  - **Optionale Felder:** `refs`, `architectureAssumptions [{id, why}]`, `status`
    (`open` | `done` | `discarded`), `outcome` (nur bei `done`, dort Pflicht), `notes`, `flags`.
  - **Verknüpfung in beide Richtungen:** Jede ST-ID in `blocks` muss ein Story-Record sein. Jede
    SPK-ID in `story.spikes` muss ein Spike-Record sein, der die Story in `blocks` führt; bei
    `superseded`- und `discarded`-Stories entfällt diese Prüfung.
  - **Reihenfolge in 5.1.4:** Erst den Spike anlegen, dann die Story mit `spikes` patchen.
  - Das SPK-Item hängt über `derivedFrom` an den blockierten Stories. Es liegt nicht auf der
    Pflichtkette.
- **Export (`df.backlog/v1`):**
  - Inhalt:
    - Epics mit `slice` und ihren Stories
    - Stories mit Trace-Kette bis VIS, Artefakt-Version, Gate und Risiko-Flags
    - Spikes mit Status
    - Kennzahlen, darunter die Summe der Spike-Timeboxen
  - Die Liste `problems` sammelt Konsistenzfehler:
    - unvollständige Kette, AC ohne Item, Story ohne AC, fehlendes Epic
    - Story ↔ Spike nur einseitig verknüpft
    - Spike, der nur noch ausgeschlossene Stories blockiert
  - Im Vollmodus ist eine nicht leere `problems`-Liste ein Fehler (Exit 1). Im Partial-Modus
    wird sie nur berichtet.

## 12. Gate-Record

Jede Entscheidung an einem Gateway erzeugt einen Gate-Record `G-<nnn>`. Er ist ein Record nach §11.2:
`gates/G-<nnn>_<gateway>_iter<k>.meta.json` (Schema `df.gate-record/v1`) ist maßgeblich, das `.md`
daneben wird daraus gerendert. Felder:

- `gateway` (BPMN-ID, z. B. `G-1.1`), `iteration`, `pivotCount` (nur G-P2)
- `artifacts`: geprüfte Artefakte mit Version
- `rubric` + Version, `threshold`, `score`
- `criteria[]`: je Kriterium Ergebnis und Begründung
- `factchecks[]`: Claim, Ergebnis und `SRC`
- `panelVotes[]` (nur PG): Persona, Votum, Begründung
- `objections[]` (nur PG): Einwände von Contrarian und Verweigerer mit Antwort oder Risiko-Flag
- `verdict`: `pass` | `fail` | `pass-with-risk` | `pivot` | `more-research` | `no-go`
- `pathTaken`: Ziel des gewählten Sequenzflusses
- `changeRequests[]` (bei `fail`): konkrete Aufträge an den Produzenten
- `riskFlags[]`, `model`, `timestamp`

## 13. Rubric-Katalog (Seeds aus dem Notebook)

Die vollständigen Rubrics werden später aus dem Notebook „The Product - Business Design“ extrahiert
(siehe `roadmap.md` §2). Hier stehen die IDs und die Kernkriterien als verbindlicher Kern.

| Rubric-ID | Kernkriterien (Quelle) |
|---|---|
| `idea-brief` | Pflichtfelder gefüllt; abgeleitete Felder als 🧠 markiert; Budget/Timebox und Zielarchitektur vorhanden (§14) |
| `vision-statement` | Moore-Template (For … who … the … is a … that … Unlike … our product …); keine Buzzwords; Zielkunde konkret (Moore, Olsen) |
| `lean-canvas` | Alle Bausteine gefüllt; jede Zelle hat eine Evidenzstufe; Preismodell explizit |
| `vpc` | Jobs/Pains/Gains ↔ Products/Pain Relievers/Gain Creators vollständig verknüpft; Fit-Rating des Panels vorhanden |
| `assumptions-map` | Jede Annahme bewertet nach Desirability/Feasibility/Viability und Wichtigkeit × Evidenz; Kill-Annahmen markiert |
| `impact-map` | Strikte Hierarchie Goal → Actor → Impact → Deliverable; Impacts als messbare Verhaltensänderung; Deliverables als Optionen (Adzic) |
| `scoring` | Formel und Eingangswerte offengelegt; nachrechenbar; Rangfolge konsistent mit den Werten |
| `roadmap` | Outcome- statt Feature-Formulierung; Bezug zu GOAL/IMP |
| `panel-grounding` | Jedes Merkmal mit `SRC`; mindestens 3 Quelltypen; Contrarian und Verweigerer vorhanden (nur Voll-Panel); versteckte Attribute gesetzt (§7) |
| `research-markt-wettbewerb` | Pflicht-Scope DR-01 vollständig oder Lücke ausdrücklich benannt (§8.2): Marktgröße als Spanne mit Methode und Bezugsjahr, ≥ 3 direkte + ≥ 2 indirekte Wettbewerber mit Preispunkten, Feature-Matrix, Preis-Benchmarks, datierte Trends, Eintrittsbarrieren; Evidenz-Regeln (§8.3/§8.4): jede Aussage stammt aus dem Claim-Ledger, jeder Kern-Claim trianguliert oder als 🧠 mit `untriangulated-key-claim` markiert, keine Markt-/Zahlen-Claims nur auf T3, Marktdaten ≤ 3 Jahre |
| `research-zielgruppe-voc` | Pflicht-Scope DR-02 (§8.2): ≥ 2 abgegrenzte Segmente mit grober Größe; je Segment ≥ 3 wörtliche VoC-Zitate aus ≥ 2 Quelltypen; Jobs/Pains aus Nutzeraussagen, je Pain mit Zitat; Workarounds und Wechselbarrieren; Zahlungsbereitschafts-Signale; Evidenz-Regeln wie oben |
| `research-domaene-prozesse-regulatorik` | Pflicht-Scope DR-03 (§8.2): Ist-Prozess in Schritten mit Beteiligten; Regulatorik mit Fundstelle aus T1 oder ausdrücklich „keine spezifische“; ≥ 1 Praxis- und ≥ 1 Negativfall; Fachbegriffe; Evidenz-Regeln wie oben |
| `research-synthese` | Faktencheck-Report (K.3): jeder geprüfte Claim mit Ergebnis (bestätigt / widerlegt / unklar) und ≥ 1 `SRC` im erlaubten Tier (§8.3); widerlegte Claims mit Gegenquelle |
| `interview-guide` | Fragen zu vergangenem Verhalten; keine Suggestivfragen; Lösung erst spät; deckt die Kill-Annahmen ab |
| `transcript` | Vollständig; Persona blieb in Rolle; keine Umdeutung von „weiß nicht“ |
| `persona` | Konkreter Rollentitel; 1–3 JTBD; Top-2 Pains und Top-2 Gains; Auslöser-Situation; Belege aus `T`/`SRC` |
| `jtbd` | Syntax „When …, I want to …, so I can …“; implementierungsneutral (kein UI/Tech) |
| `pov-hmw` | Lösungsneutral; fokussiert auf eine Persona bzw. ein Bedürfnis |
| `ost` | Outcome → Opportunities → Solutions → Experiments; Opportunities aus Nutzersicht formuliert (Torres) |
| `journey` | Phasen, Touchpoints, Emotionskurve; jeder Hot Spot adressiert oder begründet ausgelassen |
| `service-blueprint` | Frontstage / Line of Visibility / Backstage / Support-Systeme; Backstage-Komplexität bewertet |
| `story-map` | 2D-Struktur (Narrativ horizontal, Priorität vertikal); keine verwaisten Karten; Release-Linie explizit (Patton) |
| `walking-skeleton` | Steel Thread durch alle Schichten; minimal; Ende-zu-Ende nutzbar |
| `mvp` | Passt in Budget/Timebox aus dem Brief; jede Slice hat ein Lernziel; Bezug zu GOAL |
| `invest` | Connextra-Format; Independent, Negotiable, Valuable („damit“ = Nutzer-/Business-Outcome), Estimable, Small (≤ M), Testable (Wake, Cohn) |
| `spike` | Zeitbox, Frage, Akzeptanzkriterien des Spikes |
| `dor` | INVEST erfüllt; mindestens 1 AC; keine offenen Blocker; Terminologie gemäß Glossar (Scrum, IREB) |
| `gherkin` | Gültiges Given-When-Then; mindestens 1 Happy Path und mindestens 1 Negativ-/Ausnahmepfad; implementierungsneutral; SBE-Beispiele mit konkreten Werten (Adzic) |
| `ubiquitous-language` | Ein Begriff pro Konzept; keine widersprüchlichen Domänenregeln; alle Begriffe im Glossar (Evans) |
| `backlog-hygiene` | Keine Orphans, keine Fake-Stories, keine Duplikate (§10.2) |
| `traceability` | Pflichtkette für jede Story vollständig; Matrix vollständig |
| `run-report` | Evidenzmix, Risiko-Flags, erzwungene Loop-Exits, Top-5-Risiko-Annahmen, Kosten |
| `phase-1-1` … `phase-4-2` | Sammel-Rubric des Sub-Prozesses: alle Artefakt-Rubrics des Sub-Prozesses plus Gate-Frage des jeweiligen Gateways. Schließt die vorgelagerte Korpus-Recherche ein, die die Phase konsumiert (`research-markt-wettbewerb` für `phase-1-1`, `research-zielgruppe-voc` für `phase-2-1`, `research-domaene-prozesse-regulatorik` für `phase-3-1`), auch wenn deren `Call_Rn` formal außerhalb des Sub-Prozesses liegt (§8.1) |
| `gate-vision`, `gate-validierung`, `gate-mvp` | Phasen-Rubrics für PG (§9.2) |

## 14. Idee-Brief (Input-Vertrag, Schritt 0)

| Feld | Pflicht | Wenn fehlend |
|---|---|---|
| `idee` (1–3 Sätze) | ja | – (einziges echtes Pflichtfeld) |
| `markt` / `region` | ja | aus der Idee und WS ableiten → 🧠 |
| `ausgabesprache` | ja | aus `language` im Zielprojekt-Manifest → `given`; sonst Default `de` → 🧠 |
| `zielgruppe-hypothese` | nein | ableiten → 🧠 |
| `wettbewerber` | nein | leer lassen; DR-01 füllt |
| `strategische-richtung` | nein | ableiten → 🧠 |
| `budget` / `timebox` (für G-4.2) | ja | plausible Annahme treffen und begründen → 🧠 |
| `zielarchitektur` / `plattform` (für ARC) | ja | aus `platform` im Zielprojekt-Manifest `.dark-factory/project.json` → `given`; sonst plausible Annahme treffen und begründen → 🧠 |
| `constraints` (Regulatorik, No-Gos) | nein | ableiten → 🧠 |

Alle 🧠-Felder des Briefs werden automatisch als `ASM`-Items in die `assumptions-map` übernommen.

## 15. Iterationen und Versionen

- Jede Iteration eines Artefakts erhöht `version`. Das zählt `commit-artifact.mjs`, nie das Modell
  (§11.2). Der stabile Name zeigt immer den neuesten Stand, jede Version liegt als Snapshot unter
  `history/<id>/v<n>.md` + `.meta.json`.
- Gate-Records und `derivedFrom` referenzieren immer `artefakt@version`. `derivedFrom` trägt
  zusätzlich den SHA-256 des Bodys.
- Ändert sich ein Upstream-Artefakt, zum Beispiel durch einen Pivot, sind alle abgeleiteten
  Artefakte `stale` und werden beim nächsten Durchlauf neu erzeugt. Items behalten ihre ID, wenn
  sie fachlich gleich bleiben.

## 16. Änderungslog

| Datum | Änderung |
|---|---|
| 2026-09-25 | Erstfassung aus dem Grilling (Q1–Q25) |
| 2026-09-25 | BPMN-Umbau umgesetzt (BPMN-Plan, inzwischen umgesetzt). `sdlc:condition/@expr` und `sdlc:bundle/@artifacts` präzisiert (§3.7, §3.8) — im Bau bestätigte Attributnamen. |
| 2026-09-25 | DR-01/02/03 als eigene `Process_R`-Callactivities (`Call_R1`/`Call_R2`/`Call_R3`) unter `researcher` verdrahtet statt als Inline-Annotation auf Stratege/UX-Schritten; Pflicht-Scope je Korpus-Report und drei neue Rubrics ergänzt (§4, §8.1/§8.2, §13). |
| 2026-09-25 | §11.2 neu: Artefakte werden als Markdown-Body + JSON-Sidecar (`*.meta.json`) abgelegt, mit read-only gerendertem Frontmatter. Das Modell liefert nur den authored-Block, `commit-artifact.mjs` berechnet den Rest. Gate-Records und Quellen sind JSON-first (§12, §8). `run.yaml` → `run.json`. §15 angepasst. |
| 2026-09-25 | Datei umbenannt: `dark-factory-prozess-gedaechtnis.md` → `docs/dark-factory/process-rules.md`. Kurzname „Gedächtnis §n“ bleibt. Umsetzungsdetails stehen jetzt in `implementation.md`, Geplantes in `roadmap.md`. |
| 2026-09-25 | §8 neu gefasst (Recherche-Schicht, D-12 … D-26): Kanäle/Provider §8.0 (Gemini Deep Research API, WebSearch, Rohtext-`fetch`, DDG optional; NotebookLM und Search-Grounding ausgeschlossen), tieferer Pflicht-Scope §8.2, Normalisierung mit `contentKind`/Tiers/Aktualität §8.3, Claim-Ledger und Triangulation §8.4 (neues Präfix `CLM`), Lücken/Gap-Fill §8.5. §9.3 „Mehr Research“ als Gap-Fill, §9.4 Geld-Cap, §13 Research-Rubrics geschärft plus `research-synthese`, §3.3 `fetch`/`gapfill`. |
| 2026-09-25 | §11.3 neu: Stories und Spikes sind Records (`df.story/v1`, `df.spike/v1`), angelegt und geändert nur per `story.mjs`/`spike.mjs put/patch`. Story-Markdown und `backlog.json` (`df.backlog/v1`, `export-backlog.mjs`) werden daraus erzeugt (D-27). §11.2 um Stories ergänzt. |
| 2026-09-25 | §14: `zielarchitektur/plattform` und `ausgabesprache` kommen aus dem Zielprojekt-Manifest `.dark-factory/project.json` (Herkunft `given`), sonst wie bisher 🧠 (D-33). §11.3: Spikes liegen in `backlog/spikes/`. |
| 2026-09-26 | §9.3 No-Go endet mit `REPORT.md` (Status `discarded`) über den neuen Schritt `S_NoGo` (D-39). §9.4 hängende Deep-Research-Aufrufe werden abgebrochen und entwertet, nicht endlos wieder aufgenommen (D-40). |
