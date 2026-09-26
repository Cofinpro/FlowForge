# FAQ: skill-authoring

Notebook answers recorded verbatim with their citations. Distilled guidance lives
in the references; this file is the audit trail behind it.

---
## skill-authoring-1: How do I write a good SKILL.md package?

- asked 2026-09-26 · notebook "Agentic Workflows" · conversation `0b2de1d4-674d-43a4-9311-00014d0e1f0f`
- Sources: Skill authoring best practices - Claude Platform Docs
- Note: references reconstructed from the inline tool result (quotes shortened)

**Question**

> What are the best practices for authoring agent skills (SKILL.md packages) according to the sources? Cover: naming, writing the description so the skill is discovered/triggered correctly, conciseness and what Claude already knows, degrees of freedom (high/medium/low), progressive disclosure and reference files (depth, table of contents), bundling scripts vs instructions, workflows and checklists inside skills, feedback/validation loops, templates and examples, terminology consistency, testing and evaluation (evaluation-driven development, testing with multiple models), and anti-patterns. End with a concrete review checklist.

**Answer** (verbatim, citation markers resolve in the table below)

According to the official platform documentation and expert agentic design guides, authoring **agent skills** (`SKILL.md` packages) is centered around context efficiency, predictable discovery, clear execution boundaries, and continuous evaluation [1-3]. 

---

##### 1. Naming Conventions

Skill names are restricted by system requirements and should follow predictable patterns to maintain a clean, referenceable skill library [4]:
* **YAML Frontmatter Constraints:** The `name` field must be **maximum 64 characters**, contain only **lowercase letters, numbers, and hyphens**, and must **not** contain XML tags or reserved keywords like `anthropic` or `claude` [4].
* **Grammatical Pattern:** The **gerund form** (`verb + -ing`) is the recommended best practice because it clearly describes the activity or capability provided [4].
  * *Good Examples:* `processing-pdfs`, `analyzing-spreadsheets`, `managing-databases`, `testing-code` [4].
  * *Acceptable Alternatives:* Noun phrases (`pdf-processing`) or action verbs (`process-pdfs`) [4].
  * *Avoid:* Vague names (`helper`, `tools`), overly generic terms (`data`, `files`), or reserved words (`claude-tools`) [4].

---

##### 2. Skill Discovery & Writing Effective Descriptions

Claude uses the `description` field in the frontmatter to select the appropriate skill from potentially over 100 available skills [2, 4]:
* **Pre-loaded Metadata:** At startup, only the `name` and `description` frontmatter from all installed skills are pre-loaded into system context [2, 5]. The `SKILL.md` body is loaded only when triggered, and reference files are read only on-demand [2, 5].
* **Third-Person Point of View:** Descriptions **must always be written in the third person** (e.g., *"Processes Excel files and generates reports"*) [4]. Inconsistent perspective (e.g., *"I can help you..."* or *"You can use this..."*) causes discovery failures when injected into system prompts [4].
* **Include Triggers and Contexts:** The description must state **what** the skill does and **when** to use it, including explicit keywords, file extensions (`.xlsx`, `.pdf`), and user phrasing [4, 6].
  * *Good Example:* `Extract text and tables from PDF files, fill forms, merge documents. Use when working with PDF files or when the user mentions PDFs, forms, or document extraction.` [6]
  * *Bad Example:* `Helps with documents.` [7]

---

##### 3. Conciseness & "What Claude Already Knows"

The context window is a shared resource [1]. Every token in a skill competes with conversation history and active task context [2]:
* **Assume Model Intelligence:** Claude is already pre-trained on standard programming patterns, API concepts, and formats [2, 8]. Challenge every sentence: *"Does Claude really need this explanation?"* or *"Does this paragraph justify its token cost?"* [2].
* **Omit Boilerplate:** Do not include introductory text explaining what a PDF is or how to install Python libraries in prose [8]. Jump straight to concise usage scripts [8].
* **Token Budget:** Keep the main `SKILL.md` body **under 500 lines** [7, 9].

---

##### 4. Setting Degrees of Freedom

Match the specificity of instructions to the task’s fragility and context dependency [10]:

| Degree of Freedom | Format | When to Use | Example |
| :--- | :--- | :--- | :--- |
| **High Freedom** | Text-based heuristics / guidelines | Multiple valid approaches; decisions depend heavily on context [10]. | Code structure review, UX evaluation [10]. |
| **Medium Freedom** | Parameterized scripts or pseudocode templates | A preferred pattern exists, but minor variations are acceptable [11]. | Customizable report generation [11]. |
| **Low Freedom** | Exact scripts with strict command flags | Operations are fragile, error-prone, or require exact sequence [4, 11]. | Database migrations (`python scripts/migrate.py --verify --backup`) [4]. |

*Analogy:* Use narrow guardrails when walking across a narrow bridge with cliffs (low freedom), and general directions when crossing an open field (high freedom) [4].

---

##### 5. Progressive Disclosure & Directory Architecture

Progressive disclosure keeps tokens low by serving content on a "need-to-know" basis [5, 7]:
1. **Directory Structure:** Bundle specialized details into separate files alongside `SKILL.md` [7]:
   ```text
   pdf-processing/
   ├── SKILL.md             (Main navigation & workflows; loaded when triggered)
   ├── FORMS.md             (Form-filling guide; loaded as needed)
   ├── reference.md         (API schemas; loaded as needed)
   └── scripts/
       └── fill_form.py     (Utility script; executed via bash, not loaded into context)
   ```
2. **Keep References One Level Deep:** **Do not deeply nest file links** (e.g., `SKILL.md` \\(\rightarrow\\) `advanced.md` \\(\rightarrow\\) `details.md`) [12, 13]. When encountering nested references, Claude may use partial inspection tools (`head -100`), leading to truncated or missed context [12]. Link all reference files directly from `SKILL.md` [12, 13].
3. **Table of Contents for Long References:** Any reference file longer than 100 lines **must include a Table of Contents at the top** [13]. This ensures Claude sees the full file structure even during partial file reads [13].

---

##### 6. Bundling Executable Scripts vs. Instructions

Pre-made utility scripts offer significant reliability and efficiency advantages over generating code on the fly [14]:
* **Token & Speed Efficiency:** Running a bundled script executes silently in the terminal environment; only its stdout/stderr output consumes context tokens [5, 14].
* **Explicit Execution Intent:** State clearly whether Claude should **execute** the script (`Run python scripts/validate.py`) or **read it as a reference** (`See analyze.py for the algorithm`) [5, 14].
* **"Solve, Don't Defer":** Scripts should handle errors internally and return actionable error messages instead of failing back to Claude [15].
* **Avoid "Voodoo Constants":** Document all magic numbers or configuration defaults in scripts so parameter choices are clear [16].
* **Plan-Validate-Execute Pattern:** For destructive or batch operations, force Claude to produce a plan file (`changes.json`), validate the plan with a script, execute, and verify [5].

---

##### 7. Workflows and Checklists Inside Skills

For complex or multi-step operations, define sequential steps and supply a **copyable markdown checklist** [17]:
```markdown
###### Research Synthesis Workflow
Copy this checklist and track progress:
- [ ] Step 1: Read all source documents in sources/
- [ ] Step 2: Identify key themes across sources
- [ ] Step 3: Cross-reference claims
- [ ] Step 4: Create structured summary
- [ ] Step 5: Verify citations against source material
```
This forces the model to maintain state, track progress, and avoid skipping critical validation steps during complex tasks [17, 18].

---

##### 8. Feedback & Validation Loops

Incorporate explicit verification loops (**Validator \\(\rightarrow\\) Fix Errors \\(\rightarrow\\) Repeat**) [18]:
* **Code/XML Workflows:** Make edits \\(\rightarrow\\) run validator script (`python validate.py`) \\(\rightarrow\\) if errors occur, inspect trace, fix, and re-validate \\(\rightarrow\\) build output only when validation passes [19].
* **Text/Document Workflows:** Draft content \\(\rightarrow\\) review against `STYLE_GUIDE.md` checklist \\(\rightarrow\\) revise if discrepancies exist \\(\rightarrow\\) finalize [20].

---

##### 9. Structural Patterns & Templates

* **Template Pattern:** Distinguish between **strict output requirements** (*"ALWAYS use this exact template"*) and **flexible guidance** (*"Here is a sensible default, adapt as needed"*) [21, 22].
* **Examples Pattern:** Provide concrete input/output demonstration pairs [22]. Input/output examples convey nuance, formatting, and depth better than lengthy explanations [23].
* **Conditional Workflow Pattern:** Guide branching choices explicitly using conditional prompts (e.g., *"Creating new content? Follow Creation Workflow. Editing existing content? Follow Editing Workflow"*) [3, 23].

---

##### 10. Terminology Consistency

Maintain strict terminology across instructions, reference guides, scripts, and error messages [21]:
* *Bad (Inconsistent):* Mixing `"API endpoint"`, `"URL"`, `"route"`, and `"path"`, or mixing `"extract"`, `"pull"`, and `"retrieve"` [21].
* *Good (Consistent):* Standardize on single terms throughout the entire skill package to simplify parsing [21].

---

##### 11. Testing & Evaluation

* **Evaluation-Driven Development (EDD):** Build evaluations **before** writing extensive instructions [3]:
  1. Run representative tasks *without* a skill to identify actual failure modes [3].
  2. Create test scenarios (eval JSON payloads) representing those gaps [3, 24].
  3. Write the minimal instruction set required to pass the evaluation [3].
* **Multi-Model Testing:** Test skill packages across model tiers [11]:
  * *Claude Haiku:* Requires clear, direct guidance [11].
  * *Claude Sonnet:* Requires efficiency and balanced detail [11].
  * *Claude Opus:* Requires higher-level reasoning without redundant over-explanation [11].
* **Co-Development Pattern (Claude A & Claude B):**
  * Work with **Claude A** (authoring partner) to structure rules, refine architecture, and trim unnecessary text [24].
  * Deploy the skill to **Claude B** (a fresh test agent) to execute real tasks [24]. Observe navigation paths, file access logs, and errors, then feed findings back to Claude A [24, 25].

---

##### 12. Common Anti-Patterns

1. **Windows-Style File Paths:** Never use backslashes (`scripts\helper.py`) [25]. **Always use Unix forward slashes** (`scripts/helper.py`), which work cross-platform [25].
2. **Choice Overload:** Avoid presenting excessive unranked choices (*"You can use pypdf, pdfplumber, PyMuPDF, or pdf2image..."*) [15, 25]. Provide a primary default tool and offer alternative tools only as secondary fallbacks [15].
3. **Deeply Nested File Trees:** Linking files through multiple hops hides context from the model [12, 13].
4. **Time-Sensitive Information:** Avoid hardcoding temporal references, version numbers, or fleeting API facts that will quickly age out [19].

---

##### 13. Concrete SKILL.md Review Checklist

Before releasing a skill package, review it against this checklist [9, 26]:

###### Metadata & Discovery
- [ ] `name` is \\(\le 64\\) characters, lowercase, hyphenated, gerund form, and free of reserved words [4].
- [ ] `description` is \\(\le 1024\\) characters, written strictly in third-person, and details **what** it does and **when** to use it [4, 6].

###### Context & Architecture
- [ ] `SKILL.md` body is **under 500 lines** [7, 9].
- [ ] Presumes model intelligence; excludes general background explanations [2, 8].
- [ ] All reference file links are **one level deep** from `SKILL.md` [12, 13].
- [ ] Any reference file over 100 lines includes a **Table of Contents** at the top [13].

###### Execution & Scripts
- [ ] All file paths use **forward slashes (`/`)** [25].
- [ ] Utility scripts handle errors gracefully and avoid undocumented "magic" parameters [15, 16].
- [ ] Clear distinction between executing scripts vs. reading scripts as reference [5, 14].
- [ ] Multistep workflows include a checklist and validation/feedback loops [17, 18].

###### Testing & Quality
- [ ] Created at least three benchmark evaluation scenarios [3, 26].
- [ ] Tested across target model tiers (Haiku, Sonnet, Opus) [11, 26].
- [ ] Terminology is standardized throughout [9, 21].

---

💡 *Would you like to draft a `SKILL.md` package or build an evaluation test suite for one of your workflows?*

**Citations**

| # | Source | Cited passage |
|---|---|---|
| 1 | Skill authoring best practices - Claude Platform Docs | Good Skills are concise, well-structured, and tested with real usage... Concise is key. The context window is a public good. Your Skill shares the context window with everything else Claude needs to know |
| 2 | Skill authoring best practices - Claude Platform Docs | At startup, only the metadata (name and description) from all Skills is pre-loaded. Claude reads SKILL.md only when the Skill becomes relevant, and reads additional files only as needed. ... Default assumption: Claude is already very smart |
| 3 | Skill authoring best practices - Claude Platform Docs | Creation workflow: Use docx-js library ... Editing workflow: Unpack existing document, Modify XML directly, Validate after each change ... { "skills": ["pdf-processing"], "query": "Extract all text from this PDF file and save it to output.txt", ... "expected_behavior": [...] } |
| 4 | Skill authoring best practices - Claude Platform Docs | Database migration: Run exactly this script: Do not modify the command or add additional flags. |
| 5 | Skill authoring best practices - Claude Platform Docs | (no passage returned) |
| 6 | Skill authoring best practices - Claude Platform Docs | description: Extract text and tables from PDF files, fill forms, merge documents. Use when working with PDF files or when the user mentions PDFs, forms, or document extraction. |
| 7 | Skill authoring best practices - Claude Platform Docs | description: Helps with documents / description: Processes data / description: Does stuff with files |
| 8 | Skill authoring best practices - Claude Platform Docs | Only add context Claude doesn't already have. Challenge each piece of information: "Does Claude really need this explanation?" "Can I assume Claude knows this?" "Does this paragraph justify its token cost?" |
| 9 | Skill authoring best practices - Claude Platform Docs | Keep SKILL.md body under 500 lines for optimal performance. If your content exceeds this, split it into separate files using the progressive disclosure patterns ... Checklist for effective Skills: Description is specific and includes key terms; includes both what the Skill does and when to use it; ... File references … |
| 10 | Skill authoring best practices - Claude Platform Docs | Code review process: Analyze the code structure and organization; Check for potential bugs or edge cases; Suggest improvements for readability and maintainability; Verify adherence to project conventions |
| 11 | Skill authoring best practices - Claude Platform Docs | Generate report: Use this template and customize as needed: |
| 12 | Skill authoring best practices - Claude Platform Docs | DOCX Processing. Creating documents: Use docx-js for new documents. See DOCX-JS.md. Editing documents ... For tracked changes: See REDLINING.md. For OOXML details: See OOXML.md |
| 13 | Skill authoring best practices - Claude Platform Docs | SKILL.md See advanced.md ... advanced.md See details.md ... details.md Here's the actual information... [good:] Basic usage: [instructions in SKILL.md] Advanced features: See advanced.md API reference: See reference.md |
| 14 | Skill authoring best practices - Claude Platform Docs | (no passage returned) |
| 15 | Skill authoring best practices - Claude Platform Docs | Bad example: Too many choices (confusing): "You can use pypdf, or pdfplumber, or PyMuPDF, or pdf2image, or..." Good example: Provide a default (with escape hatch) |
| 16 | Skill authoring best practices - Claude Platform Docs | REQUEST_TIMEOUT = 30 (HTTP requests typically complete within 30 seconds) ... TIMEOUT = 47 # Why 47? RETRIES = 5 # Why 5? |
| 17 | Skill authoring best practices - Claude Platform Docs | API Reference Contents: Authentication and setup; Core methods (create, read, update, delete); Advanced features (batch operations, webhooks); Error handling patterns; Code examples |
| 18 | Skill authoring best practices - Claude Platform Docs | Step 3: Validate mapping. Run: python scripts/validate_fields.py fields.json. Fix any validation errors before continuing. ... Step 5: Verify output ... If verification fails, return to Step 2. |
| 19 | Skill authoring best practices - Claude Platform Docs | Make your edits to word/document.xml. Validate immediately ... If validation fails: Review the error message carefully, Fix the issues in the XML, Run validation again. Only proceed when validation passes |
| 20 | Skill authoring best practices - Claude Platform Docs | Content review process: Draft your content following the guidelines in STYLE_GUIDE.md. Review against the checklist ... Only proceed when all requirements are met |
| 21 | Skill authoring best practices - Claude Platform Docs | Bad - Inconsistent: Mix "API endpoint", "URL", "API route", "path" ... Consistency helps Claude parse and follow instructions. Template pattern: Provide templates for output format. Match the level of strictness to your needs. |
| 22 | Skill authoring best practices - Claude Platform Docs | Report structure: Here is a sensible default format, but use your best judgment based on the analysis |
| 23 | Skill authoring best practices - Claude Platform Docs | Determine the modification type: Creating new content? -> Follow "Creation workflow" below. Editing existing content? -> Follow "Editing workflow" below |
| 24 | Skill authoring best practices - Claude Platform Docs | (no passage returned) |
| 25 | Skill authoring best practices - Claude Platform Docs | (no passage returned) |
| 26 | Skill authoring best practices - Claude Platform Docs | Scripts solve problems rather than defer to Claude; Error handling is explicit and helpful; No "voodoo constants"; ... No Windows-style paths ... Testing: At least three evaluations created; Tested with Haiku, Sonnet, and Opus; Tested with real usage scenarios |

---
