# Project Management
## ESMD5 – Digital Distributed Processing System  
### Partner: Equiem

---

## Table of Contents
1. [Sprint 1 Analysis](#1-sprint-1-analysis)
   - [Strengths](#11-strengths)
   - [Weaknesses](#12-weaknesses)
   - [Improvement Actions for Sprint 2](#13-improvement-actions-for-sprint-2)
   - [Risk Analysis and Tracking](#14-risk-analysis-and-tracking)
   - [PMO Alignment](#15-pmo-alignment)
2. [Sprint 2 Planning](#2-sprint-2-planning)
   - [Sprint Objectives](#21-sprint-objectives)
   - [Sprint 2 Backlog and Task Planning](#22-sprint-2-backlog-and-task-planning)
3. [Group Development Process Management](#3-group-development-process-management)

---

## 1. Sprint 1 Analysis

This section presents an analysis of Sprint 1 execution. It identifies strengths and weaknesses observed during the sprint, proposes improvement actions for Sprint 2, and reviews project risks to ensure continuous monitoring and alignment with Project Management Office (PMO) criteria.

---

### 1.1 Strengths

- **Clear understanding of the project context**  
  The team developed a strong comprehension of Equiem’s business environment, onboarding challenges, and operational constraints.

- **Well-structured analysis artifacts**  
  Key Sprint 1 deliverables (Problem Statement, Scope Definition, Personas, User Journeys, Business Flow) were documented in a clear and logical structure.

- **Strong alignment on product vision**  
  The team established a shared understanding of the product’s objectives, ensuring coherence across discussions and decisions.

- **Early identification of project risks**  
  A Project Risk Matrix was created, enabling anticipation of potential threats related to scope, communication, and planning.

---

### 1.2 Weaknesses

- **Heavy focus on documentation activities**  
  Sprint 1 required extensive writing, review, and validation work, increasing workload concentration.

- **Initial adjustment period**  
  The team needed time to align on tools, repository structure, and collaboration practices.

- **Minor communication frictions**  
  Some clarifications were necessary during collaborative tasks, particularly in early exchanges because of the language barrier.

- **Tool learning curve**  
  A short adaptation phase was observed when working with Git/GitLab workflows.

---

### 1.3 Improvement Actions for Sprint 2

| Improvement Area | Identified Issue | Proposed Action | Expected Outcome |
|------------------|------------------|-----------------|------------------|
| Sprint planning | Some backlog items lacked precision | Refine task descriptions and acceptance criteria | Reduced ambiguity during execution |
| Communication | Occasional misunderstandings | Structure updates during dailies and reviews | Improved team alignment |
| Tool usage | Early workflow inconsistencies | Reinforce Git/GitLab conventions | Improved traceability |

---

### 1.4 Risk Analysis and Tracking

This subsection reviews risks identified during planning and Sprint 1 execution.

#### Identified Risks

| Risk | Description | Probability | Impact | Mitigation / Contingency Action |
|------|-------------|-------------|--------|--------------------------------|
| Delayed Tasks | Tasks may exceed deadlines due to underestimation or technical complexity | Medium | Medium | Redistribute workload and reassess priorities |
| Requirement Misunderstanding | Misinterpretation of expectations or needs | Medium | High | Validate assumptions during reviews |
| Communication Gaps | Misalignment due to language barrier | Low | Medium | Reinforce structured updates |
| Tool Misuse | Incorrect Git/GitLab practices | Low | Medium | Apply workflow guidelines |

#### Risk Tracking Mechanism

Risks are reviewed at the end of each sprint. New risks are added when identified, and existing risks are reassessed based on probability and impact evolution. Ownership is shared collectively, with updates reflected in the Project Management documentation.

---

### 1.5 PMO Alignment

Sprint 1 analysis aligns with PMO principles by ensuring:

- **Traceability** through documented artifacts and structured analysis  
- **Continuous improvement** via Sprint 2 action planning  
- **Risk management** through identification and monitoring mechanisms  
- **Documentation quality** with clear and organized deliverables  

---

## 2. Sprint 2 Planning

_This section outlines the planning of Sprint 2, including task identification, prioritization, and workload estimation using T-shirt sizing._

---

### 2.1 Sprint Objectives

Objectives:

- Establish a shared scope vision through a collaboratively validated UML diagram.  
- Derive logical data models from that model.  
- Produce UI/UX artifacts only after architectural consensus.  
- Implement repository structure and coding standards.  
- Prepare Sprint Review presentation within 2 days.

Expected outcomes:

- Agreed source of scope definition.  
- Database design traceable to UML decisions.  
- Visual design consistent with architecture.
- Standardized project environment.

---

### 2.2 Sprint 2 Backlog and Task Planning

- **Product Owner (PO):** validates architectural decisions, accepts/declines features within artifacts.  
- **Scrum Master (SM):** monitors engineering practices, GitFlow, and DoR/DoD applications.  
- **Modeling & Design Team (5 members):** UML → Data Models (3 members)/UI/UX 2(members).  
- **Review Team (2 members):** Sprint Review preparation from Wednesday, ideally.

| Task ID | Task Name | Description | Type | Size | DoR | DoD |
|---|---|---|---|---|---|---|
| S2-01 | Collective UML Modeling | Meetings to define domain classes and relations | Design | M | Sprint 2 artifacts reviewed | UML approved by PO | 
| S2-02 | UML Documentation | Formal diagram + thought process | Docs | S | UML consensus reached | documentation.md updated |
| S2-03 | Logical Data Model | Tables and data relations | Design | M | Conceptual model validated | Logical schema complete |
| S2-04 | UI Structure Discussion | Collective alignment before graphics | Design | S | Final UML available | Navigation defined |
| S2-05 | Wireframes | Low fidelity screens | Design | M | UI structure approved | Wireframes complete |
| S2-06 | Mockups & Visual Guide | High fidelity + design system | Design | L | Wireframes approved | Projeto.md updated |
| S2-07 | Directory Structure | Repository organization | Config | S | Stack defined | Coherent structures to the READMEs |
| S2-08 | Coding Standards | Standards document | Docs | S | Conventions agreed | Conventions applied |
| S2-09 | Sprint Review Prep | Slides & narrative | Design | S | Draft artifacts | Ready presentation |

**Allocation logic**

- Day 1: S2-01 → collective session (all members)  
- Days 2-3: S2-02   
- Day 3–4: S2-03  
- After architectural approval: S2-04 → S2-05 → S2-06  
- From Wednesday: S2-09 by 2 members and S2-07 & S2-08 supervised by SM  

This flow prevents UI and DB work from diverging from the scope defined previously by the group.

---

### 2.3 Prioritization and Strategy

**Principles**

1. **Architecture first:** UML is the base for all later artifacts  
2. **Collective validation:** UI concepts discussed before any drawing  
3. **Coherence:** Logical model must derive from UML  
4. **Management:** PO as final decision maker, SM as process advisor

**Risk-oriented choices**

- Avoid early mockups without entity definition  
- Reduce rework between DB and UX  
- Centralize acceptance to prevent inconsistent visions

**Time management**

- Separation for modeling by mid-sprint  
- Review preparation begins Wednesday with final scope  
- Final two days reserved for integration

---

## 3. Group Development Process Management

This section defines collaboration and workflow policies.

---

### 3.1 Daily Meetings Policy

- **Frequency:** Daily during sprint execution  
- **Objective:** Share progress, blockers, and next actions  
- **Duration:** Short, time-boxed meetings  
- **Participation:** Entire team  

---

### 3.2 Development and Collaboration Policies

####  GitHub/GitLab usage rules  
All source code and documentation are versioned within the project repository. The team follows a structured branching workflow based on GitFlow, ensuring controlled feature development, isolated changes, and stable production management.

#### Commit Conventions

The team adopts Conventional Commits to standardize commit history and improve traceability.

#### Merge and review practices  
To ensure code quality and collaborative validation:

- All merges must occur via Pull Requests (PRs);

- PRs must include a clear description of implemented changes;

- At least one team member review is required before approval;

- Reviewers validate scope alignment, documentation updates, and adherence to standards;

#### Task lifecycle and workflow  
Project tasks follow a structured lifecycle to ensure visibility and progress tracking.

Standard workflow:

`
Open -> Backlog → Doing → Waiting Review → Review -> Closed
`

Notes:

- Tasks should only move to **Doing** when the Definition of Ready (DoR) is met.
- A task can be marked **Closed** only when the Definition of Done (DoD) is satisfied.

For more version control details (branch naming, PR template, and commit rules), see [ConfigurationManagement.md](ConfigurationManagement.md).
