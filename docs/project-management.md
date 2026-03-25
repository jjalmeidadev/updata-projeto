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
   - [Sprint 2 Analysis](#23-sprint-2-analysis)
      - [Strengths](#231-strengths)
      - [Weaknesses](#232-weaknesses)
      - [Improvement Backlog for Sprint 3](#233-improvement-backlog-for-sprint-3)

3. [Sprint 3 Planning](#3-sprint-3-planning)
   - [Sprint Objectives](#31-objectives)
   - [Sprint 3 Backlog and Task Allocation](#32-backlog-and-task-allocation)
   - [Sprint Capacity](#33-sprint-capacity)
   - [Execution Improvements](#34-execution-improvements)
   - [Sprint 3 Analysis](#35-sprint-3-analysis)
   - [Strengths](#351-strengths)
   - [Weaknesses](#352-weaknesses)
   - [Improvement Backlog for Sprint 4](#353-improvement-backlog-for-sprint-4)
   - [Risk Analysis and Tracking](#354-risk-analysis-and-tracking)

4. [Group Development Process Management](#4-group-development-process-management)
   - [Daily Meetings Policy](#41-daily-meetings-policy)
   - [Development and Collaboration Policies](#42-development-and-collaboration-policies)

---

## 1. Sprint 1 Analysis

This section presents an analysis of Sprint 1 execution based on observable effects on workflow and delivery.

### 1.1 Strengths
- **Shared understanding of the project context reduced rework**  
  - During Sprint 1, no backlog items required scope redefinition after stakeholder validation.  
  - **Impact:** Avoided rework in core artifacts such as personas and user journeys, allowing the team to complete all planned analysis deliverables within the sprint timeframe.

- **Structured documentation improved review efficiency**  
  - Problem statement, scope definition, personas, user journeys, and business flow were produced using a consistent structure.  
  - **Impact:** Reviews were completed in a single iteration, reducing feedback cycles and preventing delays in Sprint closure.

- **Early alignment on product vision minimized decision conflicts**  
  - Key product direction discussions were resolved collectively during Sprint activities.  
  - **Impact:** No decision reversals occurred after validation, maintaining planning continuity and avoiding downstream redesign.

- **Proactive risk identification supported stable execution**  
  - A project risk matrix was established during Sprint 1 planning.  
  - **Impact:** Communication and scope risks were discussed before becoming blockers, contributing to uninterrupted progress.

### 1.2 Weaknesses
- **High documentation workload created delivery bottlenecks**  
  - Approximately 70% of Sprint effort was concentrated on documentation tasks.  
  - **Effect:** Limited task parallelization and delayed progress on structural decisions.  
  - **Action for Sprint 2:** Improve task distribution and prioritization to balance workload.

- **Initial tool alignment caused task delays**  
  - Time was required to standardize repository usage and collaboration practices.  
  - **Effect:** One backlog item remained temporarily stalled until conventions were clarified.  
  - **Action for Sprint 2:** Define workflow standards at the start of the sprint.

- **Communication gaps increased clarification cycles**  
  - Some collaborative tasks required additional explanation due to language differences.  
  - **Effect:** Extended discussion time and slowed early decision-making.  
  - **Action for Sprint 2:** Implement more structured daily updates.

- **GitLab adaptation extended review time**  
  - Early use of merge request workflows required familiarization.  
  - **Effect:** Merge request reviews took longer than expected during initial execution.  
  - **Action for Sprint 2:** Improve team familiarity with GitLab interface and workflow.

### 1.3 Improvement Backlog
| Action | Owner | Target Sprint | Metric | Evidence | Status | Observed Result |
|--------|-------|--------------|--------|----------|--------|-----------------|
| Refine backlog descriptions and acceptance criteria | Scrum Master | Sprint 2 | % of tasks requiring clarification | Sprint board history | Planned | To be measured at Sprint 2 Review |
| Structure daily updates | Team | Sprint 2 | Reduction in repeated clarifications during tasks | Daily notes | Planned | To be measured mid-sprint |
| Reinforce GitLab conventions | Tech Lead | Sprint 2 | Number of workflow inconsistencies or MR reopens | GitLab MR logs | Planned | To be measured at Sprint 2 Retro |

### 1.4 Risk Analysis and Tracking
#### Risk Register
| Risk                         | Description                                       | Probability | Impact | Owner     | Status | Trend  | Mitigation                                 |
| ---------------------------- | ------------------------------------------------- | ----------- | ------ | --------- | ------ | ------ | ------------------------------------------ |
| Delayed Tasks                | Tasks may exceed deadlines due to underestimation | Medium      | Medium | SM        | Open   | Stable | Redistribute workload; reassess priorities |
| Requirement Misunderstanding | Misinterpretation of expectations                 | Medium      | High   | PO        | Open   | Stable | Validate assumptions with reviews          |
| Communication Gaps           | Misalignment due to language barrier              | Low         | Medium | Team      | Open   | Stable | Structured daily updates                   |
| Tool Misuse                  | Incorrect GitLab practices                        | Low         | Medium | Tech Lead | Open   | Stable | Reinforce GitLab workflow                  |

- **Risk Tracking:** Updated during Sprint Planning, Mid-Sprint Checkpoint, and Sprint Retrospective.  
- **Status definitions:** Open, Mitigating, Closed.  
- **Trend:** Increasing, Stable, Decreasing.

### 1.5 PMO Alignment
- **Traceability:** Backlog, task progress, and ownership tracked; artifacts versioned.  
- **Planning visibility:** Sprint scope, breakdown, sizing, allocation documented.  
- **Risk management:** Risks documented, reviewed, and assigned owners.  
- **Configuration control:** Repository structure, coding standards, and MR validation documented.

---

## 2. Sprint 2 Planning

### 2.1 Sprint Objectives
- **Establish a shared scope vision** through a collaboratively validated UML diagram.  
- **Derive logical data models** from that model.  
- **Produce UI/UX artifacts** only after architectural consensus.  
- **Implement repository structure and coding standards.**  
- **Prepare Sprint Review presentation** within 2 days.

**Expected outcomes:**
- Agreed source of scope definition.  
- Database design traceable to UML decisions.  
- Visual design consistent with architecture.  
- Standardized project environment.

### 2.2 Sprint 2 Backlog and Task Planning

**Roles:**
- **PO:** Validates architectural decisions, accepts/declines features.  
- **SM:** Monitors engineering practices, GitFlow, DoR/DoD.  
- **Modeling & Design Team (5 members):** UML → Data Models (3 members)/UI/UX (2 members).  
- **Review Team (2 members):** Sprint Review preparation.

**Sprint Capacity:**
- Duration: 7 working days  
- Availability per member: 2h/day → **14h per member**  
- Team capacity: 7 × 14h = **98h**  

**T-shirt sizing:**
- XS → 0.5h  
- S → 1h  
- M → 1.5h  
- L → 2h  

| Task ID | Task Name                   | Type    | Size | DoR                                                                       | DoD                                                                              |
| ------- | --------------------------- | ------- | ---- | ------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| S2-01   | Collective UML Modeling     | Feature | M    | Problem statement validated; domain scope defined; planning issue created | UML diagram uploaded; reviewed by 2 peers; PO approved                            |
| S2-02   | UML Documentation           | Docs    | S    | UML model finalized; documentation template available                     | documentation.md updated; linked in MR; peer-reviewed                             |
| S2-03   | Logical Data Model          | Feature | M    | Conceptual UML approved; entities identified                              | Logical schema committed; relationships validated; MR approved                   |
| S2-04   | UI Structure Discussion     | Chore   | S    | UML finalized; user flow available                                        | Navigation structure documented; decision log updated                             |
| S2-05   | Service Blueprint Mapping   | Feature | M    | User journey available; touchpoints identified                            | Blueprint draft uploaded; peer-reviewed                                          |
| S2-06   | Service Blueprint Detailing | Feature | L    | Blueprint draft validated                                                 | Frontstage/backstage/support documented; PO approval recorded                     |
| S2-07   | Directory Structure         | Chore   | S    | Stack defined; repo accessible                                            | Folder structure committed; README updated; MR merged                            |
| S2-08   | Coding Standards            | Docs    | S    | Team conventions discussed                                                | standards.md committed; referenced in README                                     |
| S2-09   | Sprint Review Prep          | Chore   | S    | Draft artifacts available                                                 | Slides prepared; narrative reviewed by 2 members                                  |

**Allocation logic:**  
- Day 1: S2-01 (all members)  
- Days 2–3: S2-02 + review checkpoint  
- Days 3–4: S2-03 + architectural validation  
- After validation: S2-04 → S2-05 → S2-06 (with peer review)  
- Day 4 onward: S2-09 (2 members)  
- Parallel Days 5–7: S2-07 & S2-08 (SM supervision)

---

### 2.3 Sprint 2 Analysis

This section presents an analysis of Sprint 2 execution based on workflow, task completion, and team dynamics.

### 2.3.1 Strengths

- **Improved backlog clarity reduced clarification cycles**
  - Tasks had refined descriptions and acceptance criteria, reducing back-and-forth during execution.
  - **Impact:** Enabled faster task start and reduced mid-sprint confusion.

- **Effective allocation logic supported parallel task execution**
  - Tasks were sequenced to leverage team capacity; e.g., documentation and modeling ran in parallel with UI/UX planning.
  - **Impact:** Enabled more efficient use of available hours and increased sprint throughput.

- **Repository and coding standards adoption stabilized development**
  - Directory structure and coding standards were established early.
  - **Impact:** Reduced workflow inconsistencies and MR rework.

- **Team collaboration improved through structured daily updates**
  - Daily updates captured progress and blockers effectively.
  - **Impact:** Reduced redundant clarifications and aligned team understanding.

### 2.3.2 Weaknesses

- **Sprint workload slightly underestimated**
  - Some tasks (e.g., Service Blueprint Detailing) required more time than initially sized.
  - **Effect:** Caused minor delays in follow-up tasks.
  - **Action for Sprint 3:** Refine task sizing for complex features using historical sprint data.

- **Dependency on PO validation created waiting periods**
  - Certain tasks (Logical Data Model, Service Blueprint) were blocked until stakeholder approval.
  - **Effect:** Introduced small idle periods for some team members.
  - **Action for Sprint 3:** Introduce early validation checkpoints with PO to reduce blocked time.

- **Limited test planning**
  - Testing was deferred until artifacts were fully implemented.
  - **Effect:** Reduced time available for early defect detection.
  - **Action for Sprint 3:** Plan parallel testing execution alongside development tasks.

### 2.3.3 Improvement Backlog for Sprint 3

| Action                                             | Owner        | Target Sprint | Metric                                    | Evidence              | Status  | Observed Result                          |
| -------------------------------------------------- | ------------ | ------------- | ----------------------------------------- | --------------------- | ------- | ---------------------------------------- |
| **Refine task sizing for complex features**        | Scrum Master | Sprint 3      | % of tasks completed on time vs estimated | Sprint board history  | Planned | To be measured at Sprint 3 Review        |
| **Introduce early validation checkpoints with PO** | PO & SM      | Sprint 3      | # of blocked hours reduced                | Daily notes & MR logs | Planned | To be measured mid-sprint                |
| **Plan parallel testing execution**                | QA Team      | Sprint 3      | % of features tested mid-sprint           | Test logs             | Planned | To be measured in Sprint 3 Retrospective |

## 3. Sprint 3 Planning

### 3.1 Objectives
- **Develop UML Deployment Diagram** for production cloud deployment (servers, devices, network, middleware, databases, protocols).  
- **Implement physical database model** from logical model.  
- **Progressively implement backend and frontend components** incrementally.  
- **Conduct usability tests**.  
- **Update coding architecture and directory structure**, including diagrams.

**Expected outcomes:**
- Clear production deployment infrastructure view.  
- Fully implemented database schema with scripts and documentation.  
- Incremental software delivery for backend and frontend.  
- Verified FR, NFR, and usability aspects.

### 3.2 Backlog and Task Allocation
| Task ID | Task Name                           | Type    | Size | Owner             | DoR                                                  | DoD                                                                                             |
| ------- | ----------------------------------- | ------- | ---- | ----------------- | ---------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| S3-01   | UML Deployment Diagram              | Feature | M    | Modeling Team     | Logical model completed                              | Diagram uploaded; reviewed by 2 peers; PO approved                                            |
| S3-02   | Physical Database Model             | Feature | L    | DB Team           | Logical model approved                               | SQL scripts 01_create_database.sql & 02_initial_data.sql committed; README updated; MR approved |
| S3-03   | Directory & Coding Architecture     | Chore   | S    | Tech Lead         | Stack defined                                        | Directory committed; architecture documented; diagram included                                 |
| S3-04   | Backend Incremental Development     | Feature | L    | Backend Dev Team  | Task scope defined                                   | Functional modules implemented; MRs approved; unit tests executed                               |
| S3-05   | Frontend Incremental Development    | Feature | L    | Frontend Dev Team | Task scope defined                                   | Interfaces developed; MRs approved; user flow validated                                         |
| S3-06   | Functional Requirements Testing     | Test    | M    | QA Team           | Functional specs available                           | Tests executed; results documented; coverage discussed                                          |
| S3-07   | Non-Functional Requirements Testing | Test    | M    | QA Team           | NFR specs available                                  | Tests executed; results documented; coverage discussed                                          |
| S3-08   | Usability Testing                   | Test    | L    | UX Team           | Test scenarios defined; ≥5 external users identified | Test script executed; feedback collected; summary documented                                    |
| S3-09   | Sprint Review Preparation           | Chore   | S    | Review Team       | All artifacts available                              | Presentation slides ready; narrative reviewed; PO validation completed                          |

**Allocation Logic**

- **Days 1–2:** S3-01 → UML Deployment Diagram (Modeling Team)  
  - All members involved in diagram validation to ensure shared understanding of deployment.  

- **Days 2–4:** S3-02 → Physical Database Model (DB Team)  
  - Backend devs support database structure validation; scripts versioned in GitLab.  

- **Days 3–5:** S3-03 → Directory & Coding Architecture (Tech Lead)  
  - Establish repo structure and coding standards in parallel with database work.  

- **Days 4–8:**  
  - S3-04 → Backend Incremental Development (Backend Dev Team)  
  - S3-05 → Frontend Incremental Development (Frontend Dev Team)  
  - **Parallel delivery:** Modules implemented incrementally to reduce rework and integration issues.  

- **Days 6–9:**  
  - S3-06 → Functional Requirements Testing (QA Team)  
  - S3-07 → Non-Functional Requirements Testing (QA Team)  
  - S3-08 → Usability Testing (UX Team)  
  - Testing begins once respective modules are ready; feedback loops integrated mid-sprint.  

- **Days 8–10:** S3-09 → Sprint Review Preparation (Review Team)  
  - All artifacts consolidated; slides prepared; narrative reviewed; PO approval recorded.  

### 3.3 Sprint Capacity
- Duration: 10 working days  
- Availability per member: 2h/day → 20h per member  
- Team capacity: 7 × 20h = 140h

### 3.4 Execution Improvements
- **Incremental delivery:** Implement backend/frontend modules progressively; avoid large batch integration.  
- **Traceable database evolution:** Versioned SQL scripts, README documentation, and data dictionary.  
- **Testing discipline:** FR, NFR, and usability tests aligned with previous artifacts.  
- **Deployment clarity:** UML Deployment Diagram communicates cloud infrastructure to all stakeholders.  
- **PMO alignment:** All artifacts versioned in GitLab; MR approvals required.  
- **Improved communication:** Daily structured updates; mid-sprint checkpoints for DB and architecture.

## 3.5 Sprint 3 Analysis

This section presents an analysis of Sprint 3 execution based on workflow, task completion, and team dynamics.

### 3.5.1 Strengths

- **Incremental backend and frontend development improved integration**  
  - Backend and frontend components were implemented progressively during the sprint.  
  - **Impact:** Reduced integration risks and allowed earlier validation of system functionality.

- **Clear coding architecture improved development organization**  
  - The project directory structure and coding architecture were defined and documented.  
  - **Impact:** Facilitated collaboration between developers and improved repository clarity.

- **Testing activities supported early issue identification**  
  - Functional, non-functional, and usability tests were conducted during the sprint.  
  - **Impact:** Enabled early identification of potential usability and performance issues.

- **Merge Request reviews improved code quality**  
  - Code changes were validated through peer-reviewed MRs before integration.  
  - **Impact:** Reduced the probability of defects entering the shared development branches.

---

### 3.5.2 Weaknesses

- **Some development tasks required more time than estimated**  
  - Backend and frontend tasks involved additional adjustments during implementation.  
  - **Effect:** Minor delays in completing certain development tasks.  
  - **Action for Sprint 4:** Refine estimation practices using previous sprint metrics.

- **Testing execution depended on development completion**  
  - Some tests could only start after certain modules were implemented.  
  - **Effect:** Reduced the available time window for iterative testing cycles.  
  - **Action for Sprint 4:** Introduce earlier testing checkpoints during development.

- **Integration checkpoints occurred late in the sprint**  
  - Some integration issues were only detected after multiple components were completed.  
  - **Effect:** Increased effort required to resolve integration inconsistencies.  
  - **Action for Sprint 4:** Increase integration validation during feature implementation.

---

### 3.5.3 Improvement Backlog for Sprint 4

| Action | Owner | Target Sprint | Metric | Evidence | Status | Observed Result |
|------|------|------|------|------|------|------|
| Improve task estimation for development tasks | Scrum Master | Sprint 4 | % tasks delivered within estimated time | Sprint board | Planned | To be measured at Sprint 4 Review |
| Start testing earlier during development | QA Team | Sprint 4 | Number of tests executed mid-sprint | Test logs | Planned | To be measured mid-sprint |
| Increase integration checkpoints between frontend and backend | Tech Lead | Sprint 4 | Number of late integration issues | MR logs | Planned | To be measured in Sprint 4 Retrospective |

---

### 3.5.4 Risk Analysis and Tracking

#### Risk Register

| Risk | Description | Probability | Impact | Owner | Status | Trend | Mitigation |
|-----|-----|-----|-----|-----|-----|-----|-----|
| Integration conflicts | Backend and frontend modules may introduce compatibility issues | Medium | Medium | Tech Lead | Open | Stable | Increase integration checkpoints |
| Estimation inaccuracies | Tasks may exceed planned time | Medium | Medium | Scrum Master | Open | Stable | Use historical sprint data to refine sizing |
| Testing delays | Testing depends on feature completion | Medium | Medium | QA Team | Open | Stable | Start testing earlier in development cycle |

- **Risk Tracking:** Risks are reviewed during Sprint Planning, Mid-Sprint Checkpoints, and Sprint Retrospective.  
- **Status definitions:** Open, Mitigating, Closed.  
- **Trend:** Increasing, Stable, Decreasing.


---
## 4. Group Development Process Management

### 4.1 Daily Meetings Policy
- **Frequency:** Daily during sprint execution  
- **Objective:** Share progress, blockers, next actions  
- **Duration:** Short, time-boxed  
- **Participation:** Entire team  

### 4.2 Development and Collaboration Policies

- **GitLab usage rules:** Version all code and documentation; follow GitFlow for branching.  
- **Commit conventions:** Conventional Commits for traceability.  
- **Merge and review practices:**  
  - All merges via Merge Requests (MRs)  
  - MRs include clear description of changes  
  - At least one team member review required  
  - Reviewers validate scope alignment, documentation, standards

- **Task lifecycle and workflow:**  
  - Standard workflow:  
    ```
    Open -> Backlog -> Doing -> Waiting Review -> Review -> Closed
    ```  
  - Tasks move to **Doing** only when DoR is met  
  - Tasks can be **Closed** only when DoD is satisfied

- **Configuration management documentation:** See [configuration-management.md](configuration-management.md) for branch naming, MR templates, and commit rules.

## 5. Cost Analysis and Effort Estimation

This section presents the financial assessment for the development of the Equiem Onboarding MVP. The calculation considers a 10-week development cycle and maps all costs related to human resources, cloud infrastructure, and third-party tools necessary to build and deploy the solution.

### 5.1. Effort and Labor Scope

The team is composed of entry-level professionals (Interns/Juniors). The effort estimation is based on a 10-week development cycle, with an average dedication of 16 hours per sprint per member. The "Technical Hourly Rate" is established at R$ 20,00/h, reflecting the current market average for tech interns/juniors in São Paulo.

| Role | Headcount | Hours/Sprint per Person | Total Hours (10 weeks) | Hourly Rate | Total Cost |
| :--- | :---: | :---: | :---: | :---: | :--- |
| Front-end Developer | 2 | 16 | 160 | R$ 20,00 | R$ 3.200,00 |
| Back-end Developer | 2 | 16 | 160 | R$ 20,00 | R$ 3.200,00 |
| Cloud/DevOps Architect | 1 | 16 | 80 | R$ 20,00 | R$ 1.600,00 |
| QA / Tester | 1 | 16 | 80 | R$ 20,00 | R$ 1.600,00 |
| Designer | 1 | 16 | 80 | R$ 20,00 | R$ 1.600,00 |
| **Total Labor** | **7** | **-** | **560** | **-** | **R$ 11.200,00** |

### 5.2. Infrastructure and Tools

The infrastructure costs reflect the required environments to support the proposed deployment architecture, which utilizes AWS services and Auth0. Costs are projected for the duration of the MVP development and testing phase (approx. 2.5 months).

| Resource / Tool | Component Responsibility | Estimated Monthly Cost | Total Cost (2.5 months) |
| :--- | :--- | :---: | :---: |
| **AWS EC2 (t3.small)** | Frontend hosting | R$ 90,00 | R$ 225,00 |
| **AWS EC2 (t3.small)** | Backend API hosting | R$ 90,00 | R$ 225,00 |
| **AWS EC2 (t3.small)** | Worker Processing Layer | R$ 90,00 | R$ 225,00 |
| **Amazon RDS (PostgreSQL)** | Managed Database | R$ 150,00 | R$ 375,00 |
| **Amazon SQS** | Messaging & Job Queues | R$ 5,00 | R$ 12,50 |
| **Auth0** | Authentication Service (B2C Essentials) | R$ 180,00 | R$ 450,00 |
| **GitHub / GitLab** | CI/CD and Version Control | R$ 0,00 (Free) | R$ 0,00 |
| **Total Infrastructure** | - | **R$ 605,00** | **R$ 1.512.50** |

### 5.3. Financial Summary

The table below consolidates the total estimated production cost for the development of the Equiem onboarding MVP, including a symbolic tax rate of 6% to simulate the basic tax burden.

| Cost Category | Total Estimated Value |
| :--- | :--- |
| Total Labor Cost | R$ 11.200,00 |
| Total Infrastructure & Tools Cost | R$ 1.512,50 |
| **Subtotal (Production Cost)** | **R$ 12.712,50** |
| Tax Burden (6%) | R$ 762,75 |
| **Total Project Cost (MVP)** | **R$ 13.475,25** |