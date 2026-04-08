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

4. [Sprint 4 Planning](#4-sprint-4-planning)

5. [Group Development Process Management](#5-group-development-process-management)
   - [Daily Meetings Policy](#51-daily-meetings-policy)
   - [Development and Collaboration Policies](#52-development-and-collaboration-policies)

6. [Cost Analysis and Effort Estimation](#6-cost-analysis-and-effort-estimation)
   - [Effort and Labor Scope](#61-effort-and-labor-scope)
   - [Infrastructure and Tools](#62-infrastructure-and-tools)
   - [Financial Summary](#63-financial-summary)

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

## 4. Sprint 4 Planning
### 4.1. Objectives 
- **Perform Analytic Optimization of System Throughput** using Multivariable Calculus to determine optimal Batch Size (B) and Worker Count (W).
- **Implement Asynchronous SQS Worker** to handle large file uploads without causing application crashes or request timeouts.
- **Automate Data Consolidation and Export** to generate consolidated onboarding datasets in CSV or JSON format.
- **Enhance Frontend Usability** by implementing progress feedback to prevent duplicate submissions.
- **Conduct Final NFR and Usability Tests** to validate concurrent submission handling and system responsiveness.
- **Finalize Project Documentation and Video Evidence** showing the application execution and VSCode console.

**Expected outcomes:**
- Analytically proven optimal system configuration documented in Appendix A.
- Scalable asynchronous processing system capable of handling files up to 100 MB.
- Fully functioning export module for validated onboarding data.
- Validated FR, NFR, and usability aspects with comprehensive test cases and execution evidence.
- Video evidence presenting the system execution as requested.

### 4.2. Backlog and Task Allocation
| Task ID | Task Name | Type | Size | Owner | DoR | DoD |
| ------- | --------- | ---- | ---- | ----- | --- | --- |
| S4-01 | Benchmark Environment Setup | Chore | M | Tech Lead | Test environment deployed | 12+ combinations of Batch (B) and Worker (W) tested; data logged. |
| S4-02 | Mathematical Modeling & Calculus | Feature | L | Backend Dev Team | Benchmark data collected (S4-01) | Quadratic function fitted; partial derivatives and Hessian matrix calculated. |
| S4-03 | Math Artifact Documentation | Docs | S | Tech Lead | Calculus calculations verified (S4-02) | Appendix A written with strategic recommendations and surface plot. |
| S4-04 | AWS SQS Provisioning | Chore | S | Tech Lead | Cloud architecture defined | Amazon SQS queue created; IAM roles configured. |
| S4-05 | Queue Publisher Implementation | Feature | M | Backend Dev Team | SQS provisioned (S4-04) | Node.js backend successfully publishes upload events to the queue. |
| S4-06 | SQS Worker Consumer Logic | Feature | L | Backend Dev Team | Publisher working (S4-05) | Worker processes files asynchronously using optimal B and W parameters. |
| S4-07 | JSON/CSV Data Export API | Feature | M | Backend Dev Team | Staging DB populated | REST endpoint generates and returns consolidated JSON/CSV files. |
| S4-08 | Angular Upload Progress UI | Feature | M | Frontend Dev Team | UX feedback analyzed | Dynamic loading states and progress bars implemented in Angular. |
| S4-09 | Toast Notifications & Error Handling | Feature | S | Frontend Dev Team | API error mapping defined | Success/Error toast notifications integrated into the UI. |
| S4-10 | Final NFR & Concurrent Load Tests | Test | M | QA Team | SQS Worker deployed (S4-06) | System tested with 10+ concurrent submissions and 100MB files without crashing. |
| S4-11 | Final Usability Testing | Test | S | UX Team | Progress UI completed (S4-08) | External users tested; feedback documented confirming reduction in duplicate uploads. |
| S4-12 | Video Evidence & Artifact Review | Chore | S | Review Team | All features integrated | Split-screen video recorded (Angular + VSCode); documentation finalized. |

**Allocation Logic**

- **Days 1–3:** S4-01 & S4-04 
  - The Tech Lead provisions the AWS SQS infrastructure, while the backend team sets up the environment to run the 12+ benchmarks required for the Math Artifact.

- **Days 3–5:** S4-02 & S4-05 
  - Backend developers implement the queue publisher logic. Concurrently, the math modeling (Quadratic Surface, partial derivatives, and Hessian Matrix) is calculated to find the optimal Batch and Worker limits.

- **Days 4–7:** S4-06, S4-08 & S4-09
  - **Parallel Execution:** Backend team develops the Worker consumer applying the calculated mathematical parameters. Frontend team implements loading states, progress bars, and toast notifications in Angular to solve usability bottlenecks.

- **Days 6–8:** S4-03 & S4-07
  - The Math Artifact is documented as Appendix A, and the backend concludes the Data Consolidation export feature (JSON/CSV).

- **Days 8–9:** S4-10 & S4-11
  - QA and UX teams run final Non-Functional Requirement (NFR) stress tests (handling 100MB limits and 10+ concurrent users) and validate the new UI enhancements with external users.

- **Day 10:** S4-12
  - Review team records the mandatory split-screen video demonstrating the application and the Node.js/VSCode console, ensuring all artifacts are ready for the Sprint Review.

## 4.3. Sprint 4 Analysis
This section evaluates the execution of Sprint 4, focusing on feature development, testing, and database evolution.

### 4.3.1. Strengths
- **Auth0 & Stack Compliance**
  - The team successfully integrated Auth0 for identity management and adhered strictly to the required technology stack (Node.js + TypeScript for the backend; Angular + TypeScript for the frontend).
- **Database Traceability**
    - The physical database model was effectively evolved, with versioned create_database.sql, initial_data.sql, and a functional rollback.sql script implementing transaction traceability.
- **Testing**
  - Unit, functional, and Non-Functional Requirement (NFR) tests were planned and executed, successfully identifying critical integration gaps before the sprint review.

### 4.3.2. Weaknesses
- **Task Estimation Inaccuracies**
    - The team underestimated the technical complexity and time required to fully integrate the backend. This led to minor sprint delays.
- **Merge requests Bottlenecks**
  - Despite clearly defined GitFlow policies, several Merge Requests remained in the "Waiting Review" stage significantly longer than anticipated.

### 4.3.3 Improvement Backlog for Sprint 5

| Action | Owner | Target Sprint | Metric | Evidence | Status | Observed Result |
|--------|-------|---------------|--------|----------|--------|-----------------|
| improve merge requests review time | Tech Lead | Sprint 5 | Average time MRs remain in "Waiting Review" status | GitLab MR logs | Planned | To be measured at Sprint 5 Retrospective |
| Optimize database | Backend Dev Team | Sprint 5 | Number of DB connection timeouts during load tests | NFR stress test reports | Planned | To be measured at Sprint 5 Review |

### 4.3.4 Risk Analysis and Tracking
#### Risk Register

| Risk | Description | Probability | Impact | Owner | Status | Trend | Mitigation |
|------|-------------|-------------|--------|-------|--------|-------|------------|
| **Performance Degradation** | Large file uploads (near 100MB) block the main thread and cause UI timeouts. | High | High | Tech Lead | Open | Increasing | Implement asynchronous background workers using Amazon SQS in Sprint 5. |
| **System Throughput Inefficiency** | Suboptimal batch sizes (B) and worker counts (W) cause network overhead or database locking. | High | Medium | Tech Lead | Open | Increasing | Run benchmarks and execute mathematical modeling (Calculus/Hessian Matrix) to derive optimal parameters. |
| **Testing & Integration Delays** | Late Merge Request approvals bottleneck the QA testing window before the sprint ends. | Medium | Medium | Scrum Master | Mitigating | Stable | Enforce a strict 24-hour SLA for all MR peer reviews. |

- **Risk Tracking:** Risks are continuously reviewed during Sprint Planning, Mid-Sprint Checkpoints, and Sprint Retrospectives.  
- **Status definitions:** Open, Mitigating, Closed.  
- **Trend:** Increasing, Stable, Decreasing.


--- 
## 5. Group Development Process Management

### 5.1 Daily Meetings Policy
- **Frequency:** Daily during sprint execution  
- **Objective:** Share progress, blockers, next actions  
- **Duration:** Short, time-boxed  
- **Participation:** Entire team  

### 5.2 Development and Collaboration Policies

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

## 6. Cost Analysis and Effort Estimation

This section presents the financial assessment for the development of the Equiem Onboarding MVP under an Australian market scenario. Rather than applying a direct BRL-to-AUD currency conversion, the estimate was adapted to reflect local labor and operational conditions in Australia, especially for entry-level technology professionals and cloud-based MVP deployment.

### 6.1. Effort and Labor Scope

The team is composed of entry-level professionals (Interns/Juniors). The effort estimation is based on a 10-week development cycle (structured into 5 sprints, with each sprint lasting exactly 2 weeks), with an average dedication of 16 hours per sprint per member.

For the Australian scenario, the Technical Hourly Rate was adjusted to **A$ 35.00/h**. This value is consistent with an entry-level/junior technology context in Australia, positioning the project above the national minimum wage and below the average market level of full software engineers, which makes it suitable for an MVP developed by interns/juniors.

| Role | Headcount | Hours/Sprint per Person | Total Hours (10 weeks) | Hourly Rate | Total Cost |
| :--- | :---: | :---: | :---: | :---: | :--- |
| Front-end Developer | 2 | 16 | 160 | A$ 35.00 | A$ 5,600.00 |
| Back-end Developer | 2 | 16 | 160 | A$ 35.00 | A$ 5,600.00 |
| Cloud/DevOps Architect | 1 | 16 | 80 | A$ 35.00 | A$ 2,800.00 |
| QA / Tester | 1 | 16 | 80 | A$ 35.00 | A$ 2,800.00 |
| Designer | 1 | 16 | 80 | A$ 35.00 | A$ 2,800.00 |
| **Total Labor** | **7** | **-** | **560** | **-** | **A$ 19,600.00** |

### 6.2. Infrastructure and Tools

The infrastructure costs reflect the environments required to support the proposed deployment architecture, using AWS services and Auth0 during the MVP development and testing phase (approximately 2.5 months). It also includes project management and design tools to represent the complete operational ecosystem.

For this Australian version, infrastructure was also adapted to a local operating scenario. EC2 hosting was estimated based on Sydney-region equivalent pricing, while Auth0 was converted to AUD. RDS and SQS were maintained as conservative MVP-level estimates suitable for a small-scale onboarding platform in development/testing.

| Resource / Tool | Component Responsibility | Estimated Monthly Cost | Total Cost (2.5 months) |
| :--- | :--- | :---: | :---: |
| **AWS EC2 (t3.small)** | Frontend hosting | A$ 27.88 | A$ 69.70 |
| **AWS EC2 (t3.small)** | Backend API hosting | A$ 27.88 | A$ 69.70 |
| **AWS EC2 (t3.small)** | Worker Processing Layer | A$ 27.88 | A$ 69.70 |
| **Amazon RDS (PostgreSQL)** | Managed Database | A$ 40.00 | A$ 100.00 |
| **Amazon SQS** | Messaging & Job Queues | A$ 1.00 | A$ 2.50 |
| **Auth0** | Authentication Service (B2C Essentials) | A$ 50.64 | A$ 126.60 |
| **GitHub / GitLab** | CI/CD, Version Control and Project Management | A$ 0.00 (Free) | A$ 0.00 |
| **Figma** | UI/UX Prototyping (Free Tier) | A$ 0.00 | A$ 0.00 |
| **Total Infrastructure** | - | **A$ 175.28** | **A$ 438.20** |

### 6.3. Financial Summary

The table below consolidates the total estimated production cost for the development of the Equiem onboarding MVP in the Australian scenario. It includes a 10% contingency margin to account for unforeseen technical events or cloud traffic spikes. Furthermore, a symbolic tax rate of 6% is applied as an inclusive tax to simulate a basic tax burden.

| Cost Category | Total Estimated Value |
| :--- | :--- |
| Total Labor Cost | A$ 19,600.00 |
| Total Infrastructure & Tools Cost | A$ 438.20 |
| **Base Production Cost** | **A$ 20,038.20** |
| Contingency Margin (10%) | A$ 2,003.82 |
| **Adjusted Subtotal** | **A$ 22,042.02** |
| Tax Burden (6% Inclusive Gross-up) | A$ 1,406.94 |
| **Total Project Cost (MVP)** | **A$ 23,448.96** |