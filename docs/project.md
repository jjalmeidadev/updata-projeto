# Project Documentation: Business Analysis and Requirements Specification

## Table of Contents

- [Project Documentation: Business Analysis and Requirements Specification](#project-documentation-business-analysis-and-requirements-specification)
  - [Table of Contents](#table-of-contents)
  - [1. Introduction](#1-introduction)
  - [2. Problem](#2-problem)
  - [3. Partner Industry Context](#3-partner-industry-context)
  - [4. SWOT Analysis](#4-swot-analysis)
    - [4.1. Strengths](#41-strengths)
    - [4.2. Weaknesses](#42-weaknesses)
    - [4.3. Opportunities](#43-opportunities)
    - [4.4. Threats](#44-threats)
  - [5. Porter's Five Forces](#5-porters-five-forces)
    - [5.1. Threat of New Entrants (Medium)](#51-threat-of-new-entrants-medium)
    - [5.2. Bargaining Power of Suppliers (Low–Medium)](#52-bargaining-power-of-suppliers-lowmedium)
    - [5.3. Bargaining Power of Buyers (High)](#53-bargaining-power-of-buyers-high)
    - [5.4. Threat of Substitute Products (Medium)](#54-threat-of-substitute-products-medium)
    - [5.5. Competitive Rivalry (Medium–High)](#55-competitive-rivalry-mediumhigh)
  - [6. Product Vision](#6-product-vision)
  - [7. What the Product Does / Does Not Do (Scope)](#7-what-the-product-does--does-not-do-scope)
    - [7.1 What the Product DOES](#71-what-the-product-does)
    - [7.2 What the Product DOES NOT](#72-what-the-product-does-not)
  - [8. Product Goal](#8-product-goal)
  - [9. Personas and User Journey](#9-personas-and-user-journey)
    - [9.1 Personas](#91-personas)
    - [9.2 User Journey](#92-user-journey)
  - [10. Business Flow](#10-business-flow)
  - [11. Feature Brainstorming](#11-feature-brainstorming)
  - [12. Delivery Sequencing and Prioritization](#12-delivery-sequencing-and-prioritization)
  - [Delivery Strategy and Prioritization](#delivery-strategy-and-prioritization)
    - [Prioritization Criteria](#prioritization-criteria)
  - [Sprint 2: Core Onboarding Foundation](#sprint-2-core-onboarding-foundation)
    - [Delivered in this sprint:](#delivered-in-this-sprint)
  - [Sprint 3: Submission and Data Reliability](#sprint-3-submission-and-data-reliability)
    - [Delivered in this sprint:](#delivered-in-this-sprint-1)
  - [Sprint 4: Parallel Work and Collaboration](#sprint-4-parallel-work-and-collaboration)
    - [Delivered in this sprint:](#delivered-in-this-sprint-2)
  - [Sprint 5: Large-Scale Processing](#sprint-5-large-scale-processing)
    - [Delivered in this sprint:](#delivered-in-this-sprint-3)
  - [Post-MVP Enhancements (Nice-to-Have)](#post-mvp-enhancements-nice-to-have)
  - [12.1 Feature Development Progress and Deviations](#121-feature-development-progress-and-deviations)
  - [12.2 Feature Development Sprint 4](#122-feature-development-sprint-4)
  - [13. MVP Canvas](#13-mvp-canvas)
    - [13.1. MVP Proposal](#131-mvp-proposal)
    - [13.2. Segmented Personas](#132-segmented-personas)
    - [13.3. Journeys](#133-journeys)
    - [13.4. Features](#134-features)
    - [13.5. Expected Results](#135-expected-results)
    - [13.6. Metrics to Validate](#136-metrics-to-validate)
    - [13.7. Cost & Schedule](#137-cost--schedule)
  - [14. Project Risk Matrix and Action Table](#14-project-risk-matrix-and-action-table)
    - [14.1. THREATS](#141-threats)
    - [14.2. OPPORTUNITIES](#142-opportunities)
  - [15. Definitions, Terms and Abbreviation](#15-definitions-terms-and-abbreviation)
  - [16. Functional Requirements (FRs)](#16-functional-requirements-frs)
    - [16.1. Functional Requirement Details](#161-functional-requirement-details)
      - [FR01 – Structured Onboarding Data Upload](#fr01--structured-onboarding-data-upload)
      - [FR02 – Data Standardization](#fr02--data-standardization)
      - [FR03 – Intermediate Data Persistence](#fr03--intermediate-data-persistence)
      - [FR04 – Data Validation and Conflict Detection](#fr04--data-validation-and-conflict-detection)
      - [FR05 – Safe Data Correction via Re-Submission](#fr05--safe-data-correction-via-re-submission)
      - [FR06 – Change Comparison Visualization](#fr06--change-comparison-visualization)
      - [FR07 – Automatic Progress Persistence](#fr07--automatic-progress-persistence)
      - [FR08 – Dynamic Onboarding Interface](#fr08--dynamic-onboarding-interface)
      - [FR09 – Section Dependency Enforcement](#fr09--section-dependency-enforcement)
      - [FR10 – Collaborative Section Assignment](#fr10--collaborative-section-assignment)
      - [FR11 – Onboarding Status and Feedback](#fr11--onboarding-status-and-feedback)
      - [FR12 – Data Consolidation and Secure Integration](#fr12--data-consolidation-and-secure-integration)
    - [16.2. Functional Requirements Validation Tests](#162-functional-requirements-validation-tests)
    - [16.3. Functional Negative Test Scenarios](#163-functional-negative-test-scenarios)
  - [17. Non-Functional Requirements (NFRs)](#17-non-functional-requirements-nfrs)
    - [17.1. Non-Functional Requirement Details](#171-non-functional-requirement-details)
      - [NFR01 – Data Integrity Compliance](#nfr01--data-integrity-compliance)
      - [NFR02 – Large File Handling and Responsiveness](#nfr02--large-file-handling-and-responsiveness)
      - [NFR03 – Processing Reliability](#nfr03--processing-reliability)
      - [NFR04 – Security](#nfr04--security)
      - [NFR05 – Concurrent Submission Handling](#nfr05--concurrent-submission-handling)
    - [17.2. Non-Functional Requirements Validation Tests](#172-non-functional-requirements-validation-tests)
    - [17.3. Non-Functional Negative Test Scenarios](#173-non-functional-negative-test-scenarios)
  - [18. Functional Test Execution Strategy](#18-functional-test-execution-strategy)
    - [Test Execution Instructions](#test-execution-instructions)
  - [19. Non-Functional Test Execution Strategy](#19-non-functional-test-execution-strategy)
    - [Execution Method](#execution-method)
  - [20. Testing Tools and Environment](#20-testing-tools-and-environment)
    - [Automated Test Frameworks](#automated-test-frameworks)
  - [21. Test Coverage Discussion](#21-test-coverage-discussion)
    - [21.1 Unit Tests (Backend): Strategy, Implementation, and Coverage](#211-unit-tests-backend-strategy-implementation-and-coverage)
    - [21.2 Usability Tests](#212-usability-tests)
    - [21.3 Sprint 4: Comprehensive Test Execution and Coverage Validation](#212-sprint-4-comprehensive-test-execution-and-coverage-validation)
      - [21.3.1 Sprint 4 Overview](#2121-sprint-4-overview)
      - [21.3.2 Functional Test Coverage by Implemented Topics](#2122-functional-test-coverage-by-implemented-topics)
      - [21.3.3 Non-Functional Test Execution and Results](#2123-non-functional-test-execution-and-results)
      - [21.3.4 Coverage Analysis by Architectural Layer](#2125-coverage-analysis-by-architectural-layer)
      - [21.3.5 Test Execution Evidence](#2126-test-execution-evidence)
      - [21.3.6 Proof of Execution (Images Template)](#2127-proof-of-execution-images-template)
      - [21.3.7 Improvement Backlog (Features)](#2128-improvement-backlog-features)
      - [21.3.8 Conclusion: Test Readiness in Sprint 4](#2129-conclusion-test-readiness-in-sprint-4)
  - [22. FR–NFR Correlation Matrix](#22-frnfr-correlation-matrix)
  - [23. User Stories and Traceability](#23-user-stories-and-traceability)
    - [User Stories](#user-stories)
    - [User Stories and FR Traceability](#user-stories-and-fr-traceability)
    - [24. Revision of the Proposed Solution](#24-Revision-of-the-Proposed-Solution)
  - [25. Deployment Architecture](#25-deployment-architecture)
    - [25.1. Overview](#251-overview)
    - [25.2. System Infrastructure](#252-system-infrastructure)
    - [25.3. Frontend Deployment](#253-frontend-deployment)
    - [25.4. Backend Deployment](#254-backend-deployment)
    - [25.5. Messaging Infrastructure](#255-messaging-infrastructure)
    - [25.6. Worker Processing Layer](#256-worker-processing-layer)
    - [25.7. Database Layer](#257-database-layer)
    - [25.8. Authentication Service](#258-authentication-service)
    - [25.9. Communication Protocols](#259-communication-protocols)
    - [25.10. Deployment Rationale](#2510-deployment-rationale)
    - [25.11. Performance Considerations](#2511-performance-considerations)
    - [25.12. Security Considerations](#2512-security-considerations)
    - [Appendix A: System Configuration and Optimization Report](#appendix-a-system-configuration-and-optimization-report)
  - [26. SDGs (Sustainable Development Goals) and Impact](#26-sdgs-sustainable-development-goals-and-impact)
    - [26.1. Operational Impact](#261-operational-impact)
    - [26.2. Sustainability and Alignment with the 2030 Agenda](#262-sustainability-and-alignment-with-the-2030-agenda)
    - [26.3. Priority Sustainable Development Goals](#263-priority-sustainable-development-goals)
    - [26.4. Relationship with the Smart Cities Concept](#264-relationship-with-the-smart-cities-concept)
    - [26.5. Evidence, Expected Impacts and Practical Implications](#265-evidence-expected-impacts-and-practical-implications)
  - [Appendix A: System Configuration and Optimization Report](#appendix-a-system-configuration-and-optimization-report)
  - [References](#references)
    
## 1. Introduction

This document presents the Business Analysis and Requirements Specification for the proposed onboarding intake solution. It consolidates the problem definition, industry context, product vision, scope boundaries, functional and non-functional requirements, delivery strategy, and risk considerations. The purpose of this document is to provide a clear and structured foundation for aligning business objectives with technical implementation, ensuring that the solution effectively addresses the identified operational challenges while remaining scalable, reliable, and aligned with the MVP strategy.

## 2. Problem

Equiem operates a SaaS platform that requires a large volume of customer-specific data to be collected, validated, and configured before a customer can successfully launch the platform. This onboarding data includes information about buildings, spaces, users, permissions, branding, and operational rules, and is often provided by multiple customer-side stakeholders. Currently, this data intake and validation process is highly manual, decentralized, and primarily managed through emails and spreadsheets, creating a critical operational bottleneck in Equiem’s onboarding workflow.

The absence of a structured and automated data intake layer means that onboarding analysts receive raw, inconsistent files in varying formats and levels of completeness. Without automated mechanisms or validation checkpoints at the point of entry, Equiem’s onboarding team must spend a disproportionate amount of time performing manual data hygiene tasks. This manual process slows down onboarding. Small data mistakes cause repeated back-and-forth with customers, often delayed by time zones and multiple people involved, which pushes back platform launch and increases early frustration.

In addition to inefficiency, the lack of automated validation at the data entry point introduces substantial risks to data integrity. Incomplete records, schema violations, and duplicated or inconsistent data may enter the system, requiring complex downstream corrections. These issues can cause functional failures in the live platform and compromise the reliability of operational and business intelligence reporting, undermining trust in the system.

Both internal and external users are negatively impacted by this problem. Internally, Equiem’s onboarding and customer experience teams are constrained by manual processes and operational friction. Externally, customer administrators and project managers lack a clear, structured, and collaborative way to understand onboarding requirements, track progress, and coordinate contributions. Together, these challenges result in a slower, less transparent, and more error-prone onboarding experience that weakens early perceptions of the platform’s value.

## 3. Partner Industry Context

Equiem is a global leader in property technology (PropTech) that helps commercial real estate owners and operators transform their buildings into connected, human-centric environments. It provides a unified digital platform designed to enhance tenant engagement, streamline building operations, and deliver actionable data insights, enabling property teams to manage communication, amenities, workspace services, and community experiences in one place. Equiem’s platform is deployed in hundreds of buildings across more than 25 countries and is used by hundreds of thousands of tenants and occupiers worldwide, demonstrating strong adoption and scalability.

The commercial real estate industry is increasingly driven by tenant expectations for seamless digital experiences, hybrid work dynamics, and demand for data-driven decision-making. As landlords seek to attract and retain tenants in competitive markets, there is growing pressure to modernize how property services are delivered and how tenant data is collected and utilized. Traditional manual methods of onboarding and engagement, often relying on email and spreadsheets, are becoming inefficient and error-prone in this context. Equiem’s platform addresses these demands by offering a comprehensive SaaS solution that consolidates engagement, operations, and analytics, helping owners increase tenant satisfaction and unlock additional asset value.

## 4. SWOT Analysis

The SWOT Analysis is a strategic planning tool used to evaluate an organization’s internal factors (strengths and weaknesses) and external factors (opportunities and threats) that influence its competitive position and long-term performance. In the context of this project, the SWOT Analysis provides a structured view of Equiem’s position within the global PropTech market and highlights how improving onboarding and data intake directly supports scalability, efficiency, and growth objectives.

<div align="center">
<sub>FIGURE 1 - SWOT Analysis</sub><br>
  <img src="assets/swotanalaysis.png" width="100%" alt="SWOT Analysis"><br>
  <sup>Source: Material produced by the authors, 2026.</sup>
</div>

### 4.1. Strengths

- **Pioneering and Specialization in Tenant Experience:** Equiem holds a competitive advantage as a category creator in tenant experience, offering a mature product that has been rigorously tested across diverse global markets.

- **Global Presence:** Operating across multiple continents demonstrates institutional solidity and the capacity to service large-scale international real estate portfolios.

- **Data and Analytics Foundation:** The platform transforms subjective occupant interactions into actionable data, enabling landlords to make evidence-based decisions regarding occupancy and asset value.

### 4.2. Weaknesses

- **Limited Operational Scalability:** The absence of a system architecture capable of simultaneous ingestion and processing of data streams from multiple new clients creates an operational bottleneck. This inability to concurrently collect and integrate large volumes of data from various sources delays the onboarding of new accounts and limits the company's agility during rapid market expansion phases.

- **Long Sales Cycle:** The corporate real estate sector is characterized by slow and conservative decision-making processes, requiring significant investments of time and capital before closing new contracts.

- **High Customization Costs:** The necessity to adapt interfaces and services to different building types and regional cultures increases operational expenses and reduces profit margins per unit.

### 4.3. Opportunities

- **Rise of Hybrid Work:** The new labor paradigm requires offices to become attractive destinations; Equiem’s technology provides the solution to manage this transition and entice employees back to physical workspaces.

- **Growth of the Smart Buildings Concept:** The increasing digitalization of urban infrastructure paves the way for Equiem to become the central operating system for intelligent and connected buildings.

- **Focus on the ESG Agenda:** The platform can serve as the official channel for collecting social well-being and energy efficiency data, assisting owners in meeting global sustainability targets.

### 4.4. Threats

- **Competition in the PropTech Sector:** The entry of new players with low-cost models or Big Tech companies offering integrated collaboration tools poses a significant risk to market share.

- **Information Security Risks:** As the platform manages physical access and personal data, digital vulnerabilities or cyberattacks could result in severe reputational and legal damage.

- **Dependence on Real Estate Innovation Investment:** In scenarios of economic crisis or high vacancy rates, property owners may cut budgets for non-essential technologies, directly impacting company revenue.

## 5. Porter's Five Forces

<div align="center">
<sub>FIGURE 2 - Porter´s Five Forces</sub><br>
  <img src="assets/portersfiveforces.jpeg" width="100%" alt="Porter´s Five Forces"><br>
  <sup>Source: Material produced by the authors, 2026.</sup>
</div>

### 5.1. Threat of New Entrants (Medium)

The threat of new entrants in the SaaS platforms for property management and tenant experience is moderate. While cloud technologies and modern development frameworks have reduced the initial cost of building SaaS products, creating a robust and scalable PropTech solution requires significant domain expertise, deep understanding of commercial real estate operations, and the ability to integrate with multiple enterprise systems.

In addition, onboarding at scale represents a critical operational challenge. The proposed project strengthens entry barriers by transforming onboarding into a core operational differentiator, increasing the complexity and cost required for new entrants to match Equiem’s efficiency, reliability, and speed of deployment. Less mature solutions may replicate surface-level features, but struggle to deliver the same level of onboarding scalability and data quality.

### 5.2. Bargaining Power of Suppliers (Low–Medium)

The bargaining power of suppliers for Equiem is low to moderate. The company primarily relies on cloud infrastructure providers, messaging systems, and integration tools that operate in highly competitive markets with multiple viable alternatives.

The distributed and decoupled architecture proposed in the project—combined with the use of mock integrations—reduces dependency on specific vendors and minimizes technology lock-in. This flexibility allows Equiem to negotiate costs, switch providers when necessary, and evolve its infrastructure without major disruption, thereby limiting supplier influence over pricing or strategic decisions.

### 5.3. Bargaining Power of Buyers (High)

Equiem’s customers, large building owners and operators, possess high bargaining power. These clients engage in high-value contracts, have multiple alternatives in the PropTech market, and carefully evaluate return on investment. The onboarding experience plays a critical role in shaping customers’ initial perception of value.

The proposed project directly mitigates this force by simplifying onboarding, reducing customer effort, and accelerating time-to-value. By offering a structured, self-service, and reliable onboarding experience, Equiem increases customer satisfaction, reduces friction during implementation, and lowers the likelihood of price renegotiation, dissatisfaction, or platform replacement.

### 5.4. Threat of Substitute Products (Medium)

The threat of substitutes is moderate, primarily represented by manual and semi-manual alternatives such as email-based processes, spreadsheets, generic form tools, or non-specialized workflow software. These substitutes benefit from low upfront cost and user familiarity, making them viable options in the short term.

However, they lack automated validation, domain-specific structure, system integration, and operational scalability. The onboarding project reduces the attractiveness of these substitutes by clearly exposing the hidden costs of manual work, such as errors, delays, and rework, and by delivering a specialized, integrated solution tailored to the commercial real estate domain.

### 5.5. Competitive Rivalry (Medium–High)

Competitive rivalry in the PropTech and tenant experience SaaS market is medium to high, with several established competitors (such as JLL Technology, HqO, and Spaceflow) and emerging startups offering overlapping core functionalities. Competition is driven less by price and more by differentiation, particularly in ease of implementation, customer experience, and speed of onboarding.

In this environment, the project serves as a strategic differentiator for Equiem. By enabling parallel onboardings, reducing errors, and accelerating go-live timelines, Equiem strengthens its positioning against competitors. Operational excellence in onboarding reduces the impact of direct rivalry and helps sustain competitive advantage in a crowded market.

## 6. Product Vision

The product’s vision is to transform Equiem’s customer onboarding from a manual, fragmented, and operationally heavy process into a streamlined, self-service, collaborative, and reliable digital experience. Rather than improving existing spreadsheet-based workflows, the product fundamentally re-engineers how customer data is collected, validated, and prepared, positioning onboarding as the first tangible demonstration of Equiem’s efficiency, scalability, and technological leadership.
Designed specifically around Equiem’s onboarding reality, the product serves as a centralized intake platform that guides customers in submitting all required configuration data in a structured and intuitive way. It adapts dynamically to each customer’s purchased modules, clearly communicates what information is needed, and reduces uncertainty through guided flows, visual cues, and real-time feedback. This client-centric approach minimizes administrative burden on non-technical users while enabling multiple contributors to collaborate in parallel.

At the same time, the product automatically structures, organizes, and qualifies the information received. By embedding validation and standardization at the point of entry, it improves data quality and consistency, significantly reducing the manual effort currently required from Equiem’s onboarding team to interpret, clean, and reconcile customer-provided files. Time previously spent managing emails, spreadsheets, and clarification cycles can instead be redirected to higher-value activities, such as solution design and customer success.
The product is intentionally positioned as a self-service intake layer and proof of concept, not a full onboarding automation or provisioning platform. Its role is to prepare clean, reliable, and onboarding-ready data, enabling faster project starts without replacing Equiem’s internal tools or expertise.

Ultimately, the product exists to accelerate time-to-launch, reduce rework, and enable scalable onboarding operations. By supporting asynchronous data submission, automated validation, and parallel onboarding flows, it allows Equiem to grow onboarding capacity without a proportional increase in manual workload. In doing so, it strengthens collaboration between Equiem and its customers and delivers a more transparent, predictable, and efficient onboarding experience, benefiting both operational performance and customer perception.

## 7. What the Product Does / Does Not Do (Scope)

### 7.1 What the Product DOES

- Provide authenticated access, ensuring that all submissions and reviews are tied to identifiable users

- Guide customers in submitting onboarding data through dynamic web forms and bulk uploads

- Dynamically adapt required forms and sections based on purchased modules

- Support multiple contributors, allowing users to complete assigned sections independently and in parallel

- Validate required fields, data types, and basic conflicts at the point of entry

- Organize submitted data into structured and standardized formats for review and export

- Handle large files and high-volume datasets without blocking the user interface

- Use asynchronous background processing for validation and data preparation

- Allow multiple onboarding projects to be processed simultaneously

- Make clean, onboarding-ready data available through exportable CSV/JSON outputs

### 7.2 What the Product DOES NOT

- Generate, infer, or enrich business data beyond what users explicitly submit

- Guarantee zero errors without user correction or onboarding review

- Perform real-time provisioning or configuration of Equiem’s production systems

- Replace onboarding specialists or customer support teams

- Include advanced analytics, dashboards, charts, or decision-support tools

- Perform complex cross-system data reconciliation or bidirectional synchronization

- Store or expose restricted customer Help Center content

## 8. Product Goal

The goal of the product is to reduce onboarding effort and time-to-launch by replacing Equiem’s manual, email-based data collection process with a structured, self-service, and validated onboarding intake system. The product enables customers to submit all required onboarding information through a clear and guided flow, ensuring that data is complete, consistent, and ready for use by Equiem’s onboarding teams.

By automating data collection and validation, the solution reduces manual work, minimizes back-and-forth communication, and shortens the overall onboarding cycle. At the same time, it allows multiple onboarding projects to run in parallel, increasing scalability without a proportional increase in operational resources.

From a business perspective, the product lowers operational costs, improves onboarding throughput, and creates a reusable foundation for future automation and data migration initiatives. From a user perspective, it provides customers with a transparent and intuitive understanding of what data is required and how to submit it, while freeing Equiem’s onboarding team to focus on higher-value activities such as customer support, configuration review, and relationship building.

## 9. Personas and User Journey

### 9.1 Personas

<div align="center">
<sub>FIGURE 3 – Persona 1: Mia King (Onboarding Specialist – Equiem)</sub><br>
  <img src="assets/persona1.jpeg" width="100%" alt="Persona 1: Mia King (Onboarding Specialist – Equiem)"><br>
  <sup>Source: Material produced by the authors, 2026.</sup>
</div>

<div align="center">
<sub>FIGURE 4 – Persona 2: Chloe Smith (Office Manager)</sub><br>
  <img src="assets/persona2.jpeg" width="100%" alt="Persona 2: Chloe Smith (Office Manager)"><br>
  <sup>Source: Material produced by the authors, 2026.</sup>
</div>

### 9.2 User Journey

<div align="center">
<sub>FIGURE 5 – User Journey 1: Mia King (Onboarding Specialist – Equiem)</sub><br>
  <img src="assets/journey1.jpeg" width="100%" alt="User Journey 2: Mia King (Onboarding Specialist – Equiem)">
  <sup>Source: Material produced by the authors, 2026.</sup>
</div>

<div align="center">
<sub>FIGURE 6 – User Journey 2: Chloe Smith (Office Manager)</sub><br>
  <img src="assets/journey2.jpeg" width="100%" alt="User Journey 2: Chloe Smith (Office Manager)">
  <sup>Source: Material produced by the authors, 2026.</sup>
</div>

## 10. Business Flow

This business flow illustrates the target process enabled by our proposed solution. It introduces a middleware component into the onboarding journey, positioned between customer data submission and platform provisioning. Its role is to centralize data intake, standardize validations, and structure information before it reaches internal systems, creating a more organized, scalable, and efficient onboarding experience.

<div align="center">
<sub>FIGURE 7 – Business Flow</sub><br>
  <img src="assets/businessFlow.jpeg" width="100%" alt="Business Flow"><br>
  <sup>Source: Material produced by the authors, 2026.</sup>
</div>

With the addition of the middleware layer, the onboarding process becomes more resilient, faster, and easier to manage. Automated validations, asynchronous processing, and structured data packaging reduce manual effort while improving data quality and operational efficiency for both customers and internal teams.

## 11. Feature Brainstorming

|     | Feature                                                    |
| --- | ---------------------------------------------------------- |
| 1   | Manual module selection fallback                           |
| 2   | Module-driven dynamic form rendering                       |
| 3   | Conditional section visibility                             |
| 4   | Section assignment to contributors                         |
| 5   | Multi-contributor parallel editing                         |
| 6   | Hierarchical section dependency locking                    |
| 7   | Section status management (Not Started → Completed/Failed) |
| 8   | Autosave and save-as-draft                                 |
| 9   | CSV file upload                                            |
| 10  | XLSX file upload                                           |
| 11  | Multi-file upload support                                  |
| 12  | Large file upload support                                  |
| 13  | Asynchronous file processing                               |
| 14  | Data standardization engine                                |
| 15  | Schema validation (100% compliance)                        |
| 16  | Required field validation                                  |
| 17  | Data type validation                                       |
| 18  | Business rule validation                                   |
| 19  | Duplicate detection                                        |
| 20  | Staging area persistence                                   |
| 21  | Reprocessing capability                                    |
| 22  | Safe overwrite (upsert) logic                              |
| 23  | Version comparison (diff visualization)                    |
| 24  | Reviewer approval/rejection workflow                       |
| 25  | Section resubmission handling                              |
| 26  | CSV export (per section or full project)                   |
| 27  | JSON export (per section or full project)                  |
| 28  | Secure API push (JWT authentication)                       |
| 29  | Automatic retry logic for API calls                        |
| 30  | Bulk database updates                                      |
| 31  | User authentication                                        |
| 32  | Role-based access control                                  |
| 33  | Log In–based user invitations                              |
| 34  | Section-level permission control                           |
| 35  | Processing notifications (success/failure)                 |

## 12. Delivery Sequencing and Prioritization

## Delivery Strategy and Prioritization

Considering that **Sprint 1** is dedicated to business analysis and problem understanding, feature delivery begins in **Sprint 2**.  
The sequencing of deliveries was defined based on clear prioritization criteria aligned with the MVP objective.

### Prioritization Criteria

- Impact on the core problem
- Technical dependencies
- Data integrity and operational reliability
- Operational scalability
- Processing and architectural complexity

## Sprint 2: Core Onboarding Foundation

Users can securely access the platform and follow a guided onboarding flow.  
The interface is structured so customers know what to submit, and templates help standardize data.

### Delivered in this sprint:

- Secure authentication
- Clear submission interface
- Standardized templates

## Sprint 3: Submission and Data Reliability

Users can upload files, preview them, and save progress.  
Validation ensures the data is complete and correct before submission.

### Delivered in this sprint:

- File uploads
- File preview before submission
- Save progress across sessions
- Real-time validation
- Mandatory field checks
- Duplicate detection
- Clear error messages

## Sprint 4: Parallel Work and Collaboration

Multiple onboarding processes can run simultaneously, and multiple stakeholders can collaborate within each onboarding.

### Delivered in this sprint:

- Parallel onboarding processes
- Collaborative onboarding completion

## Sprint 5: Large-Scale Processing

The final MVP sprint focuses on technical scalability.  
The system becomes capable of handling very large uploads and processing them asynchronously without blocking the interface.

### Delivered in this sprint:

- Support for very large uploads
- Scalable file processing

## Post-MVP Enhancements (Nice-to-Have)

If time allows, the team may implement additional enhancements such as:

- Role-based access
- Progress indicators
- Version history
- Tooltips
- Dark mode

## 12.1 Feature Development Progress and Deviations

This section documents the implementation status of each planned feature and any deviations from the original plan (Section 11 – Feature Brainstorming, Section 12 – Delivery Sequencing, and Section 16 – Functional Requirements). It is updated as development advances.

### Functional Requirement Coverage in This Artefact (50%)

For this artefact, the team scope was to cover **half of the functional requirements** defined in Section 16.

- Total FRs in the project: **12**
- FRs covered in this artefact scope: **6/12 (50%)**

Covered FR scope in this artefact:

- **FR01** – Structured Onboarding Data Upload (**implemented**)
- **FR02** – Data Standardization (**implemented**)
- **FR03** – Intermediate Data Persistence (**partially covered / deviated**)  
  Current implementation persists state only in client session storage.
- **FR07** – Automatic Progress Persistence (**partially covered / deviated**)  
  Current implementation is session-based only.
- **FR08** – Dynamic Onboarding Interface (**implemented**)  
- **FR11** – Onboarding Status and Feedback (**partially covered / limited**)  
  Basic flow/error feedback exists, but full state model is not yet implemented.

### Summary by Planned Delivery

| Planned item (Sprint / FR) | Status | Implementation notes | Deviations |
| -------------------------- | ------ | ------------------- | ---------- |
| **Sprint 2: Secure authentication** | Done | Auth0 (JWT) + `GET /api/users`; redirect by user/company. Guard on `/home`, `/form`, `/upload`. | Main app uses Auth0 redirect flow; mock page (`user-mock-auth.html` + `user-mock-listener.js`) is available for token-based testing. |
| **Sprint 2: Clear submission interface** | Done | Angular SPA: Login, Signup, Home, Upload, Form; routes and guards. | README and early docs referred to Next.js; implemented stack is **Angular**. |
| **Sprint 2: Standardized templates** | Partial | Onboarding sections and questions from static `questions.json`; section labels and dynamic fields. | No server-side template engine; scope is fixed by JSON. |
| **Sprint 3: File uploads** (FR01) | Done | `POST /api/upload`; Angular `UploadComponent` and standalone `upload-page.html` + `upload-listener.ts`. CSV, XLSX, XLS. | Plan mentioned CSV and XLSX only; **XLS** also supported. Two front-end entry points (Angular and standalone). |
| **Sprint 3: File preview before submission** | Partial | User selects file and uploads; backend returns normalized data; form is pre-filled. | No dedicated “preview table” step before sending to backend. |
| **Sprint 3: Save progress across sessions** (FR07) | Partial | Progress and upload result stored in **sessionStorage** (section index, completed sections, uploaded data). | **Deviation:** No server-side persistence; progress is lost when the session ends or on another device. |
| **Sprint 3: Real-time validation** | Partial | Backend validates payload shape and normalizes keys; frontend shows upload errors. | No mandatory-field, format, or duplicate checks in backend yet. |
| **Sprint 3: Mandatory field checks** (FR04) | Not implemented | — | — |
| **Sprint 3: Duplicate detection** (FR04) | Not implemented | — | — |
| **Sprint 3: Clear error messages** | Done | 400/500 with `error` and `traceId`; frontend displays upload and auth errors. | — |
| **FR02: Data standardization** | Done | Backend normalizes spreadsheet keys (e.g. snake_case) in `upload-entity` and `upload-service`; typed DTO. | — |
| **FR03: Intermediate data persistence** | Deviation | No server-side staging or versioning. | Upload result and form state only in **sessionStorage**; no multi-version storage or controlled consolidation. |
| **FR04: Data validation and conflict detection** | Not implemented | — | — |
| **FR05: Safe data correction via re-submission** | Not implemented | — | — |
| **FR06: Change comparison visualization** | Not implemented | — | — |
| **FR07: Automatic progress persistence** | Partial | sessionStorage only (see above). | Same as “Save progress across sessions”. |
| **FR08: Dynamic onboarding interface** | Partial | Sections and dynamic fields from `questions.json`; navigation by section. | **Deviation:** No module-driven visibility; all sections from JSON are shown (no “active modules” filter). |
| **FR09: Section dependency enforcement** | Not implemented | — | — |
| **FR10: Collaborative section assignment** (Sprint 4) | Not implemented | — | — |
| **FR11: Onboarding status and feedback** | Partial | Basic feedback exists for auth/upload outcomes and flow transitions. | Full per-section/per-file finite states (Not Started, In Progress, Processing, Completed, Failed) are not implemented yet. |
| **FR12: Data consolidation and secure integration** | Not implemented | — | No CSV/JSON export or JWT-authenticated push to external systems. |
| **Sprint 4: Parallel onboarding / collaboration** | Not implemented | — | — |
| **Sprint 5: Large uploads / scalable processing** | Not implemented | — | Processing is **synchronous** in the request path; no async queue or large-file strategy. |

### Architecture and Standards Deviations

- **Frontend stack:** Project README and some docs referred to **Next.js** (components, pages). The application is implemented in **Angular** (Angular 18+), with Auth0 Angular SDK and Angular Router. This is a deliberate stack choice; docs should be read with Angular in mind.
- **Backend API:** Coding standards mention **GraphQL (Apollo)** and **TypeORM**. The current backend uses **REST (Express)** and **PostgreSQL** via `pg` (node-postgres). User and upload flows are REST endpoints; no GraphQL or ORM in use.
- **Persistence:** Staging and onboarding progress are **client-only** (sessionStorage). There is no server-side staging layer, versioning, or progress persistence for the onboarding form.

### Feature-to-File Traceability (Existing Files)

Below are only files that currently exist in the repository.

- **Authentication and user routing (Sprint 2 / FR scope support)**
  - `src/presentation/web/src/app/pages/login/login.component.ts`
  - `src/presentation/web/src/app/pages/signup/signup.component.ts`
  - `src/presentation/web/src/app/app.routes.ts`
  - `src/presentation/web/src/app/app.config.ts`
  - `src/presentation/api/routes/user-routes.ts`
  - `src/presentation/api/controllers/user-controllers.ts`
  - `src/presentation/api/middleware/auth-middleware.ts`
  - `src/business/services/user-service.ts`
  - `src/data/repositories/user-repository.ts`

- **Upload and normalization (FR01, FR02)**
  - `src/presentation/web/src/app/pages/upload/upload.component.ts`
  - `src/presentation/web/src/app/pages/upload/upload.component.html`
  - `src/presentation/web/pages/upload-page.html`
  - `src/presentation/web/scripts/upload-listener.ts`
  - `src/presentation/api/routes/upload-routes.ts`
  - `src/presentation/api/controllers/upload-controller.ts`
  - `src/business/services/upload-service.ts`
  - `src/business/entities/upload-entity.ts`
  - `src/business/dto/upload-row-dto.ts`

- **Onboarding form and dynamic sections (FR08 partial)**
  - `src/presentation/web/src/app/onboarding-form/onboarding-form.component.ts`
  - `src/presentation/web/src/app/onboarding-form/onboarding-form.component.html`
  - `src/presentation/web/src/app/components/dynamic-field/dynamic-field.component.ts`
  - `src/presentation/web/src/app/services/question.service.ts`
  - `src/presentation/web/public/questions.json`

- **Progress persistence (FR03/FR07 partial, client-side only)**
  - `src/presentation/web/src/app/pages/upload/upload.component.ts`
  - `src/presentation/web/src/app/onboarding-form/onboarding-form.component.ts`

### How to Run the Project Locally

To run the application, use **two terminals**: one for backend and one for frontend.

1. **Backend terminal**
   - Directory:
     - `g05/`
   - Command:
     - `npm run dev`

2. **Frontend terminal**
   - Directory:
     - `g05/src/presentation/web/`
   - Command:
     - `npm start`

3. **Expected ports**
   - Frontend (Angular): `http://localhost:4200`
   - Backend (Express): `http://localhost:3000`

4. **Important note**
   - The frontend uses proxy configuration (`proxy.conf.json`) for `/api` requests.
   - If backend is not running, frontend requests like `/api/users` will fail with `ECONNREFUSED`.

### 12.1.1 Demo Video

The following video demonstrates the application execution as required, showing the system running and the IDE.

Demo (Sprint 3): [link](https://youtu.be/MNbhEwv95AE)

## 12.2 Feature Development Sprint 4

This section documents the main features implemented during the sprint 4, including improvements, new screens, and integrations, as well as any deviations from the original plan.

### Integration and Deployment

- **Database on Supabase**  
  The backend was migrated to use Supabase as the main database, providing greater scalability and easier management of onboarding data.

- **Automated Deployment on Render**  
  The application was deployed on Render using optimized Docker images (`Dockerfile.prod`), streamlining the CI/CD process and improving delivery times.

  Link do deploy: https://g05-frontend.onrender.com

Start of Equiem Flow: https://g05-frontend.onrender.com/login

Start of Builder Administrator Flow: https://g05-frontend.onrender.com/onboarding-intro

### User Interface and Experience Improvements

- **Onboarding Flow Choice Screen**  
  Added an explanatory screen where users can choose between uploading a complete CSV file or filling out the onboarding form manually, making the process clearer and more accessible.

<div align="center">
<sub>FIGURE X – New screen with onboarding intro</sub><br>
  <img src="assets/onboarding-intro.png" width="100%" alt="Screen for onboarding intro"><br>
  <sup>Source: Material produced by the authors, 2026.</sup>
</div>

<div align="center">
<sub>FIGURE X – Screen explaining the two available ways of sending the data</sub><br>
  <img src="assets/selection-fill-form.png" width="100%" alt="Screen for selection of how you will send the data"><br>
  <sup>Source: Material produced by the authors, 2026.</sup>
</div>

- **XLSX Template Download**  
  Introduced a button for downloading a XLSX template, guiding users on the correct data format and reducing input errors.

<div align="center">
<sub>FIGURE X – Button for dowloading the template of the XLSX file</sub><br>
  <img src="assets/download-template.png" width="100%" alt="Button for dowloading the template of the XLSX file"><br>
  <sup>Source: Material produced by the authors, 2026.</sup>
</div>

<div align="center">
<sub>FIGURE X – Template of the XLSX file containing different tabs for different sections</sub><br>
  <img src="assets/xlsx-template.png" width="100%" alt="Template of the XLSX file"><br>
  <sup>Source: Material produced by the authors, 2026.</sup>
</div>


- **Detailed Error Screen and Correction**  
  Implemented an error screen that shows exactly which fields are incorrect in the uploaded XLSX. Users can correct errors directly through this interface, making the adjustment process faster and more intuitive.

<div align="center">
<sub>FIGURE X – Review Data Screen</sub><br>
  <img src="assets/review.png" width="100%" alt="Review data screen"><br>
  <sup>Source: Material produced by the authors, 2026.</sup>
</div>

<div align="center">
<sub>FIGURE X – Errors in the forms</sub><br>
  <img src="assets/error-screen.png" width="100%" alt="Errors forms"><br>
  <sup>Source: Material produced by the authors, 2026.</sup>
</div>

- **General UI Enhancements**  
  Refined the user interface across several screens, improving navigation, responsiveness, and the display of feedback and status messages.

### New Functionalities

- **Create New Onboarding**  
  Previously, the system only listed existing onboardings for Equiem. Now, users can create a new onboarding directly from the interface.

<div align="center">
<sub>FIGURE X – Create new onboarding button</sub><br>
  <img src="assets/create-onboarding.png" width="100%" alt="Create new onboarding button"><br>
  <sup>Source: Material produced by the authors, 2026.</sup>
</div>

<div align="center">
<sub>FIGURE X – Configure new onboarding</sub><br>
  <img src="assets/create-onboarding.png" width="100%" alt="Configure new onboarding"><br>
  <sup>Source: Material produced by the authors, 2026.</sup>
</div>

### Feature-to-File Traceability (New Features)

- **Supabase Integration**  
  - src/data/database/index-table.ts  
  - src/data/repositories/onboarding-repository.ts  
  - src/data/repositories/user-repository.ts

- **Render Deploy & Docker**  
  - Dockerfile.prod (backend and frontend)
  - docker-compose.prod.yml

- **Onboarding Flow Choice Screen**  
  - src/presentation/web/src/app/pages/upload/upload.component.html  
  - src/presentation/web/src/app/pages/upload/upload.component.ts

- **CSV Template Download**  
  - src/presentation/web/src/app/pages/upload/upload.component.html  
  - src/presentation/web/public/template.csv (if applicable)

- **Detailed Error Screen**  
  - src/presentation/web/src/app/pages/upload/upload.component.ts  
  - src/presentation/web/src/app/pages/upload/upload.component.html

- **Create New Onboarding**  
  - src/presentation/web/src/app/pages/onboarding-create/onboarding-create.component.ts (new)  
  - src/presentation/web/src/app/pages/onboarding-create/onboarding-create.component.html (new)  
  - src/business/services/onboarding-instance-service.ts  
  - src/data/repositories/onboarding-instance-repository.ts

### 12.2.1 Demo Video

The following video demonstrates the application execution as required, showing the system running and the IDE.

Demo (Sprint 4): [link](https://drive.google.com/file/d/11NpnOOebpEBunGlq0J-5xIeZmRQvYbDP/view?usp=sharing)

## 13. MVP Canvas

<div align="center">
<sub>FIGURE 8 – MVP Canvas</sub><br>
  <img src="assets/mvpcanvas.jpeg" width="100%" alt="MVP Canvas"><br>
  <sup>Source: Material produced by the authors, 2026.</sup>
</div>

### 13.1. MVP Proposal

The core focus of this MVP is the automation of the data ingestion layer. Currently, EQUIEM’s primary bottleneck lies in the initial configuration phase. The proposal is to replace manual spreadsheet handling with an intelligent system that optimizes response times and ensures the platform is ready for use in a fraction of the current timeframe.

### 13.2. Segmented Personas

The immediate target audience for this MVP is EQUIEM’s internal Implementation and Operations team. These professionals currently face significant workloads due to the manual processing of new client data. By providing better tools for them and the client’s managers, the MVP addresses the pain points of those operating the system behind the scenes.

### 13.3. Journeys

The redesigned journey focuses on Self-Service. The workflow shifts from an endless exchange of emails with attached files to a process defined by these stages:

- The client uploads data through a dedicated portal.
- The system performs immediate processing.
- If inconsistencies are found, the system flags the error instantly for the client to correct, preventing rework for the EQUIEM team.

### 13.4. Features

- Automated Data Integrity & Validation: Algorithms that verify if the data adheres to the platform's specific business rules.

- Client Self-Service Interface: An intuitive platform that provides the client with a direct interface for data uploads.

- Scalable High-Performance Processing: A cloud architecture designed to process large volumes of data from multiple clients concurrently, resolving the previously identified scalability weakness.

### 13.5. Expected Results

A drastic reduction in manual effort and implementation "Lead Time" is expected. By decreasing human intervention, we significantly reduce error rates and allow EQUIEM to scale its client base without needing to hire new data specialists for every new building contract.

### 13.6. Metrics to Validate

- Onboarding Time: Percentage reduction in time spent from contract signing to the system going "Live."

- Error Rate: The volume of data errors that reach the final system (the goal is near-zero).

- User Satisfaction (Internal): Feedback from the operations team regarding the ease of the new process.

### 13.7. Cost & Schedule

The project will be executed in a 10 week cycle. The governance structure includes Sprint Reviews with Equiem stakeholders to ensure development remains aligned with real business needs and to allow for rapid course corrections.

## 14. Project Risk Matrix and Action Table

<div align="center">
<sub>FIGURE 9 – Risk Matriz</sub><br>
  <img src="assets/riskMatrix.jpeg" width="100%" alt="Risk Matrix"><br>
  <sup>Source: Material produced by the authors, 2026.</sup>
</div>

### 14.1. THREATS

| ID  | Risk                                                      | Explanation                                                                                                                            | P   | I   | Level (PxI) | Strategy          | Mitigation                                                                       | Contingency                                                              |
| --- | --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | --- | --- | ----------- | ----------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| T01 | Acceptance of invalid client data                         | Risk of accepting inconsistent, incomplete, or wrongly formatted data that may compromise processing integrity and system reliability. | 4   | 5   | 20          | Mitigate          | Implement automated schema validation and strict business rules before ingestion | Block processing and request corrected resubmission                      |
| T02 | Performance issues with large file uploads                | Risk of system slowdown or failure when handling large CSV/XLSX files with high data volume.                                           | 2   | 4   | 8           | Mitigate          | Perform load testing and use asynchronous queue processing                       | Temporarily scale infrastructure and split processing into batches       |
| T03 | Excessive dependence on manual client input               | High reliance on manual client actions, increasing chances of human error and delays.                                                  | 5   | 3   | 15          | Mitigate          | Provide standardized templates and validation rules                              | Create internal validation checkpoint before final ingestion             |
| T04 | Scope expansion during MVP development                    | Risk of adding new features during MVP phase, increasing complexity, cost, and delays.                                                 | 3   | 4   | 12          | Avoid             | Clearly define scope and implement formal change request process                 | Postpone additional features to next release cycle                       |
| T05 | Integration instability / unrealistic mock simulation     | Risk that mock simulations differ from real integration behavior, causing instability in production.                                   | 2   | 3   | 6           | Mitigate          | Develop test environment closer to real conditions and validate API contracts    | Quickly adjust integration adapters and prioritize hotfix                |
| T06 | Lack of traceability and poor asynchronous error feedback | Insufficient logging and unclear error feedback in asynchronous processing may reduce transparency and troubleshooting efficiency.     | 4   | 4   | 16          | Mitigate          | Implement structured logging and monitoring dashboards                           | Activate detailed logging mode and manually communicate issues to client |
| T07 | Requirement misunderstanding and communication failures   | Misinterpretation of requirements due to poor stakeholder alignment or unclear documentation.                                          | 2   | 5   | 10          | Mitigate          | Conduct refinement meetings and validate requirements frequently                 | Review backlog and replan sprint                                         |
| T08 | Task delays due to underestimation                        | Underestimating effort or complexity of tasks may cause sprint delays.                                                                 | 3   | 2   | 6           | Accept / Mitigate | Add buffer in sprint planning                                                    | Reprioritize backlog and redistribute tasks                              |
| T09 | Misalignment between exported data and Equiem needs       | Risk that exported standardized data does not fully match Equiem’s technical or business requirements.                                 | 1   | 4   | 4           | Avoid             | Validate technical requirements directly with Equiem                             | Develop temporary adaptation layer                                       |

### 14.2. OPPORTUNITIES

| ID  | Opportunity                                          | Explanation                                                                                                | P   | I   | Level (PxI) | Strategy | Exploitation Action                               | Benefit Realization Plan                             |
| --- | ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | --- | --- | ----------- | -------- | ------------------------------------------------- | ---------------------------------------------------- |
| O01 | Significant reduction in onboarding time             | Automation can significantly reduce the time required to onboard new clients compared to manual processes. | 5   | 5   | 25          | Exploit  | Automate as many onboarding steps as possible     | Use efficiency gain as a commercial differentiator   |
| O02 | Ability to onboard multiple clients simultaneously   | Scalable architecture enables parallel onboarding without proportional team increase.                      | 4   | 5   | 20          | Exploit  | Design scalable cloud-based infrastructure        | Expand sales strategy to target more clients         |
| O03 | Improved data quality and standardization            | Standardization improves consistency, integrity, and reliability of processed data.                        | 5   | 4   | 20          | Exploit  | Apply strict validation and normalization rules   | Create quality KPIs to showcase improvement          |
| O04 | Reduction of operational errors and internal rework  | Automation reduces manual mistakes and internal rework.                                                    | 3   | 4   | 12          | Enhance  | Implement automated validation and monitoring     | Reinvest saved time into optimization initiatives    |
| O05 | Freeing onboarding team for strategic activities     | Reduced manual workload allows team to focus on strategic and higher-value activities.                     | 4   | 3   | 12          | Enhance  | Redefine team responsibilities                    | Develop strategic roadmap using freed capacity       |
| O06 | Improved customer experience and transparency        | Providing status tracking and feedback increases customer trust and satisfaction.                          | 2   | 4   | 8           | Exploit  | Develop onboarding tracking dashboard             | Collect testimonials and feedback for marketing      |
| O07 | Increased revenue through higher onboarding capacity | Increased onboarding capacity may directly increase revenue generation.                                    | 3   | 5   | 15          | Exploit  | Expand commercial pipeline                        | Adjust pricing strategy aligned with higher capacity |
| O08 | Improved data processing efficiency                  | Optimization of asynchronous pipeline increases performance and reduces resource usage.                    | 3   | 3   | 9           | Enhance  | Optimize queue management and processing flow     | Publish efficiency KPIs internally                   |
| O09 | Competitive differentiation in the PropTech market   | Technological advantage may position the company as innovative within the PropTech sector.                 | 4   | 4   | 16          | Exploit  | Position solution as technological differentiator | Develop competitive comparison materials             |

## 15. Definitions, Terms and Abbreviation

| Term          | Definition                                                                                |
| ------------- | ----------------------------------------------------------------------------------------- |
| FR            | Functional Requirement                                                                    |
| NFR           | Non-Functional Requirement                                                                |
| MVP           | Minimum Viable Product                                                                    |
| BPMN          | Business Process Model and Notation                                                       |
| SaaS          | Software as a Service                                                                     |
| PropTech      | Property Technology                                                                       |
| SWOT          | Strengths, Weaknesses, Opportunities, and Threats                                         |
| API           | Application Programming Interface                                                         |
| JWT           | JSON Web Token                                                                            |
| CSV           | Comma-Separated Values                                                                    |
| XLSX          | Microsoft Excel Open XML Spreadsheet Format                                               |
| JSON          | JavaScript Object Notation                                                                |
| ISO/IEC 25010 | International standard for software product quality models                                |
| UI            | User Interface                                                                            |
| PDF           | Portable Document Format                                                                  |
| HubSpot       | Customer Relationship Management (CRM) platform used for module identification fallback   |
| CRM           | Customer Relationship Management                                                          |
| MB            | Megabyte                                                                                  |
| GB            | Gigabyte                                                                                  |
| Upsert        | Database operation that updates existing records or inserts new ones if they do not exist |
| Diff          | Difference comparison between two data versions                                           |

## 16. Functional Requirements (FRs)

| ID   | Title                                     | Functional Requirement Description                                                                                                                                                                                                                                                           |
| ---- | ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR01 | Structured Onboarding Data Upload         | The system must allow authenticated users to submit onboarding data files (CSV and XLSX formats only) associated with a specific onboarding process through the onboarding submission interface. File size limits and responsiveness requirements are defined in NFR02. |
| FR02 | Data Standardization                      | The system must transform all submitted onboarding data into predefined internal data models and standardized field structures before any validation or consolidation occurs.                                                                                                                |
| FR03 | Intermediate Data Persistence             | The system must persist submitted onboarding data in an intermediate storage layer to enable validation, correction cycles, and controlled consolidation without overwriting previous versions or the final dataset prematurely.                                                             |
| FR04 | Data Validation and Conflict Detection    | The system must validate submitted onboarding data by checking: (1) presence of mandatory fields defined per dataset schema, (2) field data types, (3) format rules (date format YYYY-MM-DD, valid email pattern), and (4) uniqueness constraints based on predefined natural identifiers. The system must identify duplicate or conflicting records based on these identifiers.                                                                                                    |
| FR05 | Safe Data Correction via Re-Submission    | The system must allow users to correct invalid onboarding data by re-submitting updated files that safely replace previous entries based on natural identifiers defined for each dataset.                                                                                                    |
| FR06 | Change Comparison Visualization           | The system must present a comparison view that highlights differences between the latest and previous submission for the same dataset or section, focusing on changed fields or records.                                                                                                     |
| FR07 | Automatic Progress Persistence            | The system must automatically preserve onboarding progress across sessions, ensuring users can resume completion without re-entering previously submitted information.                                                                                                                       |
| FR08 | Dynamic Onboarding Interface              | The system must dynamically present onboarding sections based on the client’s active modules, ensuring that users only access forms and fields relevant to the selected configuration scope.                                                                                                 |
| FR09 | Section Dependency Enforcement            | The system must enforce dependencies between onboarding sections, preventing submission of dependent sections before prerequisite sections reach a "Completed" state as defined in FR11.                                                                                                                          |
| FR10 | Collaborative Section Assignment          | The system must enable collaborative onboarding by allowing administrators to assign sections to multiple contributors and support parallel completion of independent sections.                                                                                                              |
| FR11 | Onboarding Status and Feedback            | The system must track and display the following onboarding and processing states per section and per file submission: "Not Started", "In Progress", "Processing", "Completed", and "Failed". These states are finite and exclusive. The system must inform users when processing transitions to either "Completed" or "Failed".                                                              |
| FR12 | Data Consolidation and Secure Integration | The system must generate consolidated onboarding datasets in CSV or JSON format and transmit approved data packages to external systems via authenticated REST API calls using JWT-based authentication with signature validation.                                                                                                        |

### 16.1. Functional Requirement Details

#### FR01 – Structured Onboarding Data Upload

- Applies only to onboarding submission interfaces
- Accepts CSV and XLSX formats only
- File size and responsiveness constraints defined in NFR02

#### FR02 – Data Standardization

- Normalizes field names and data types
- Converts inputs into canonical internal structures
- Ensures consistency before validation

#### FR03 – Intermediate Data Persistence

- Stores multiple submission versions
- Prevents premature consolidation
- Enables inspection and reprocessing

#### FR04 – Data Validation and Conflict Detection

- Verifies required fields defined per dataset schema
- Applies explicit format and type validation rules
- Enforces uniqueness based on natural identifiers
- Detects duplicates and inconsistencies deterministically

#### FR05 – Safe Data Correction via Re-Submission

- Uses natural identifiers for replacement
- Avoids silent data inconsistencies
- Supports iterative correction

#### FR06 – Change Comparison Visualization

- Highlights modified, added, and removed data
- Improves review efficiency

#### FR07 – Automatic Progress Persistence

- Saves partial completion
- Retains accepted uploads

#### FR08 – Dynamic Onboarding Interface

- Displays only relevant onboarding sections
- Adapts to active modules

#### FR09 – Section Dependency Enforcement

- Controls onboarding flow order
- Requires prerequisite sections to be in "Completed" state

#### FR10 – Collaborative Section Assignment

- Distributes responsibilities
- Enables parallel completion

#### FR11 – Onboarding Status and Feedback

- Uses fixed states: Not Started, In Progress, Processing, Completed, Failed
- States are mutually exclusive
- Notifies users on state transition to Completed or Failed

#### FR12 – Data Consolidation and Secure Integration

- Generates export datasets in CSV or JSON
- Sends approved data via authenticated REST API using JWT
- Requires successful authentication before transmission

  ### 16.2. Functional Requirements Validation Tests

  | ID   | Test                    | Pre-condition            | Procedure                | Positive Scenario | Expected Result                                                                 | Post-condition           |
  | ---- | ----------------------- | ------------------------ | ------------------------ | ------------------------------------------------------------------------------ | ------------------------ | -- |
  | FR01 | Upload onboarding files | User authenticated       | Upload CSV/XLSX files ≤ size defined in NFR02 | A user uploads a valid 50MB CSV file containing correctly structured onboarding data. | File stored in staging layer and submission record created                     | Files stored in staging  | 
  | FR02 | Standardize data        | Files uploaded           | Trigger transformation   | The system processes a dataset with raw headers and varying date formats, successfully mapping them to the correct internal structure. |Output matches predefined internal schema without structural deviations        | Ready for validation     |
  | FR03 | Persist staging data    | Standardized data exists | Save to staging          | The user saves a standardized dataset, and the system stores it without overwriting any other data. |New version record created without overwriting previous versions               | Available for correction |
  | FR04 | Validate data           | Data in staging          | Run validation           | The system scans a dataset where all mandatory fields are present, types match, and no duplicate identifiers exist. | Validation report generated listing schema, format, or uniqueness violations   | Report generated         |
  | FR05 | Re-submit data          | Errors exist             | Upload corrected version | The user uploads a corrected file fixing previous errors; the system matches the natural identifiers and safely updates those specific records. |Records replaced only where natural identifiers match                          | Updated dataset stored   |
  | FR06 | Compare submissions     | Multiple versions        | Open comparison          | The user selects Version 1 and Version 2 of a dataset to review recent corrections. |System displays field-level differences between selected versions               | Review complete          |
  | FR07 | Resume onboarding       | Progress saved           | Reopen system            | A user logs out halfway through section completion and logs back in to resume their work. | Previously saved state restored without data loss                              | Flow continues           |
  | FR08 | Dynamic sections        | Modules set              | Open onboarding          | A client with only the "Tenant Experience" module activated logs in to view their required onboarding tasks. |Only sections mapped to active modules are rendered                            | Correct scope            |
  | FR09 | Enforce dependencies    | Parent not "Completed"   | Attempt child submission | A user successfully submits the "Building Info" parent section and attempts to access the "Space Info" child section. | System blocks submission and returns dependency validation message             | Flow maintained          |
  | FR10 | Assign contributors     | Admin authenticated      | Assign sections          | An admin assigns the "User Roles" section to a specific contributor, who logs in to edit it simultaneously. |Section assignment persisted and visible to assigned users                     | Parallel work enabled    |
  | FR11 | Track status            | Upload triggered         | Monitor states           | A user uploads a file and watches the UI for processing feedback until validation finishes successfully. | Status transitions follow defined state set and invalid states are rejected    | User informed            |
  | FR12 | Export & integrate      | Sections approved        | Generate and send        | The admin approves the final dataset, and the system transmits the JSON payload via the API. |API request sent with valid JWT; external system returns HTTP 2xx confirmation | External system updated  |

### 16.3. Functional Negative Test Scenarios
| ID | Functional Requirement | Negative Scenario | Expected Result |
| --- | --- | --- | --- |
| **FR01** | Structured Data Upload | Attempt to upload a prohibited file type (e.g., `.pdf`, `.exe`). | System blocks the upload and displays an "Invalid Format" error. |
| **FR02** | Data Standardization | Upload a file where column names do not match the required template. | System fails normalization and identifies the incorrect columns. |
| **FR03** | Intermediate Persistence | Attempt to access a submission version that has been deleted or does not exist. | System returns a "Resource Not Found" error. |
| **FR04** | Data Validation | Submit a file with invalid email patterns or duplicate natural identifiers. | System lists all specific errors and prevents data consolidation. |
| **FR05** | Safe Data Correction | Re-submit data where the natural identifier has been altered. | System treats it as a new record or alerts the user of the inconsistency. |
| **FR06** | Change Visualization | Attempt to compare a version with a corrupted or empty dataset. | System informs the user that comparison is not possible due to data gaps. |
| **FR07** | Progress Persistence | Close the browser during a large upload before the "Saved" confirmation. | System restores the last stable state without corrupted partial data. |
| **FR08** | Dynamic Interface | Attempt to access an inactive module's section via direct URL. | System redirects to the home page or displays "Access Denied". |
| **FR09** | Dependency Enforcement | Attempt to submit a child section while the parent is "In Progress". | System blocks submission and displays a dependency error. |
| **FR10** | Section Assignment | An unassigned user attempts to edit a section restricted to another collaborator. | System prevents editing and shows the section is locked/assigned. |
| **FR11** | Status Tracking | Simulate a connection failure during processing to test hangs. | System triggers a timeout and moves the status to "Failed". |
| **FR12** | Secure Integration | Attempt to push data while the target external system is offline. | System logs the integration failure and allows for a later retry. |


## 17. Non-Functional Requirements (NFRs)

| ID    | Title                                  | Non-Functional Requirement Description                                                                                                                                                    |
| ----- | -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| NFR01 | Strict Data Integrity and Consistency | The system shall maintain 100% data consistency across all storage layers, ensuring that no orphaned or schema-violating records exist within the production environment at any time. |
| NFR02 | Large File Handling | The system shall support onboarding file uploads of up to 100 MB per file and process them without causing application crashes, request timeouts, or interruption of other active user sessions.           |
| NFR03 | Processing Reliability                 | The system shall ensure transactional consistency during ingestion, validation, staging, and consolidation processes, preventing partial writes and automatically rolling back incomplete operations in case of failure.                                                       |
| NFR04 | Security  | All stored onboarding data must be encrypted at rest (AES-256) and in transit (TLS 1.2+), with access restricted through AWS IAM role-based policies.                                                       |
| NFR05 | Concurrent Submission Handling         | The system shall support multiple concurrent onboarding submissions and ensure that each submission is processed independently without data mixing, corruption, or validation inconsistency.                                                      |

### 17.1. Non-Functional Requirement Details

#### NFR01 – Data Integrity Compliance

- The system must validate 100% of uploaded records against the predefined internal schema.
- The system must reject any record that fails schema validation before it reaches the staging area.
- The system must prevent any dataset from proceeding to consolidation or export unless it has been fully validated.

#### NFR02 – Large File Handling and Responsiveness

- The system must accept file uploads up to 100 MB per file.
- File processing must occur without application crashes or unhandled exceptions.
- Uploading a large file must not terminate or block other active user sessions.
- Files exceeding 100 MB must be rejected with a clear validation message.

#### NFR03 – Processing Reliability

- 100% of failed transactions must be rolled back automatically.
- All ingestion, validation, and consolidation operations must execute within transactional boundaries.
- Incomplete or failed operations must be automatically rolled back.
- No partial writes shall persist in the database after a failure.

#### NFR04 – Security

- All stored onboarding data must be encrypted at rest using AES-256 encryption.
- All data transmitted between client and server must use TLS 1.2 or higher.
- Access to stored data must be restricted using AWS IAM role-based access control.
- Unauthorized access attempts must be denied by default.

#### NFR05 – Concurrent Submission Handling

- The system must support at least 10 multiple concurrent onboarding submissions.
- Each submission must be processed independently.
- Concurrent processing must not cause data mixing between submissions.

### 17.2. Non-Functional Requirements Validation Tests

| ID    | Test                                            | Pre-condition                                            | Procedure                                                          | Positive Scenario |Expected Result                                                                                                        | Post-condition                               |
| ----- | ----------------------------------------------- | -------------------------------------------------------- | -----| ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| NFR01 | Strict Data Integrity and Consistency                   | System is active with a predefined schema; a dataset containing valid and invalid records. | Execute schema validation process                                  | A dataset with 500 valid records and 5 schema-violating records is ingested; the system successfully identifies and filters the corrupted data automatically. | 100% of invalid records are blocked                                            | System remains in a 100% consistent state with no corrupted data.              |
| NFR02 | Maximum file size handling                      | User authenticated                                       | Upload file ≤ 100 MB and upload file > 100 MB                      | A user uploads a dense, 98 MB .xlsx file containing thousands of rows, and the system processes it seamlessly. |Files ≤ 100 MB are processed successfully; files > 100 MB are rejected with validation message; no system crash occurs | Valid file ingested; oversized file rejected |
| NFR03 | Transaction rollback verification               | Processing operation active                              | Force system interruption during database write operation          | A database connection is intentionally interrupted mid-write, and the system successfully triggers its automated rollback protocol to protect the dataset. |  100% of interrupted transactions are rolled back; no partial writes persist in database                                | Database remains in consistent state         |
| NFR04 | Data encryption and access control verification | System deployed in production configuration              | Inspect storage configuration and attempt unauthorized data access | An authorized internal security tool audits the database and network layers to verify that all active encryption protocols are functioning correctly. | Data is encrypted at rest (AES-256); communication occurs via TLS 1.2+; unauthorized access attempt is denied          | Data remains protected                       |
| NFR05 | Concurrent submission handling                  | At least 10 users authenticated                          | Simulate 10 concurrent onboarding submissions                      | Ten independent customer administrators trigger massive dataset validations at the exact same second, and the system routes them safely into separate processing queues. | All 10 submissions are processed independently without data mixing or processing errors                                | All submissions completed correctly          |

### 17.3. Non-Functional Negative Test Scenarios
| ID | Non-Functional Requirement | Negative Scenario | Expected Result (Negative) |
| --- | --- | --- | --- |
| **NFR01** | Strict Data Integrity and Consistency | Manually insert a schema-violating record into the staging database and attempt a dataset export. | The export process detects the violation and rejects the dataset. |
| **NFR02** | Large File Handling | Attempt to upload a 105 MB file (exceeding the limit). | System instantly rejects the file and notifies the user of the 100 MB limit. |
| **NFR03** | Processing Reliability | Force a server shutdown during a database write operation. | Transaction is rolled back; no partial data persists in the database. |
| **NFR04** | Security | Attempt to access the endpoint without a token or with an expired JWT. | System returns HTTP 401 Unauthorized and blocks access. |
| **NFR05** | Concurrent Submissions | Two users attempt to save conflicting changes to the same section simultaneously. | System applies optimistic locking and alerts the second user. |

## 18. Functional Test Execution Strategy

The purpose of functional testing is to verify that the system behaves according to the defined Functional Requirements (FRs).  
Each test defined in section 16.2 validates a specific functional capability of the onboarding system.

Functional tests focus on verifying:

- correct onboarding data upload and processing
- proper transformation and standardization of datasets
- reliable staging and persistence mechanisms
- validation of data formats and schema compliance
- collaborative onboarding workflows
- correct enforcement of section dependencies
- accurate status tracking
- secure integration with external systems

### Test Execution Instructions

Functional tests are executed using integration testing in an isolated environment.

Test execution generally follows these steps:

1. Deploy the system in a controlled testing environment.
2. Initialize the database with the required schema.
3. Prepare test datasets (valid and invalid onboarding files).
4. Execute the system operation defined in the test procedure.
5. Observe the system output and behavior.
6. Compare the obtained results with the expected results defined in the test tables.

Integration tests are executed using **Testcontainers**, which allows the database and system dependencies to run inside isolated containers during testing. This ensures reproducibility and avoids the use of mocked components.

---

## 19. Non-Functional Test Execution Strategy

Non-functional tests verify system qualities that are critical for operational reliability and scalability.

The tests defined in section 17.2 validate the following aspects:

- data integrity
- performance and large file handling
- transactional reliability
- system security
- concurrent submission handling

### Execution Method

Non-functional tests are executed using controlled test environments where specific stress or failure conditions are simulated.

Examples include:

- uploading large datasets close to the 100 MB limit
- simulating concurrent onboarding submissions
- forcing transaction interruptions to validate rollback mechanisms
- verifying encryption and access control configurations

These tests confirm that the system maintains reliability, performance, and security under realistic operational conditions.

---

## 20. Testing Tools and Environment

The following tools are used to support test execution:

**Testcontainers**  
Used to create isolated containerized environments for integration testing.  
It allows the database and system dependencies to run inside containers, ensuring consistent test environments across development machines.

**PostgreSQL**  
Used as the primary database system during testing to validate persistence, transactions, and schema constraints.

**Automated Test Frameworks**

The system tests may be implemented using testing frameworks compatible with the project’s technology stack:

- **Jest / Vitest** for TypeScript components
- **Pytest** for Python services

These frameworks allow automated execution of integration and validation tests to verify system behavior against the defined requirements.

Mocks are not used for integration testing. Instead, real dependencies are executed inside containerized environments to ensure realistic behavior and accurate validation of system functionality.

---

## 21. Test Coverage Discussion

The defined test plan provides comprehensive coverage of the onboarding system’s functional and non-functional requirements.

Functional tests cover the entire onboarding workflow, including:

- onboarding data file upload
- dataset transformation and standardization
- intermediate staging persistence
- schema validation and conflict detection
- safe data correction and re-submission
- comparison between dataset versions
- dynamic onboarding interfaces
- enforcement of section dependencies
- collaborative onboarding workflows
- onboarding status tracking
- export and integration with external systems

Non-functional tests ensure that the system meets key operational requirements, including:

- strict schema compliance and data integrity
- large file handling capabilities
- transactional reliability during processing
- secure data storage and transmission
- concurrent submission handling

Together, these tests ensure that both business requirements and technical system constraints are validated. The combination of functional, non-functional, and usability tests provides strong verification of system correctness, reliability, and user experience.

### 21.1 Unit Tests (Backend): Strategy, Implementation, and Coverage

Unit tests for the backend and business layer are implemented with **Vitest** (Node environment) and documented below in a single place.

**Objective.** Ensure that the developed functionalities (backend and business layer) have automated unit tests, with mocks for external dependencies (database, HTTP), and that strategy, coverage, and results are documented.

**Scope.**

- **Included:** business layer (entities, DTOs, services), API controllers (upload, user), validations and data transformations.
- **Excluded (in this phase):** E2E tests, integration tests with a real database, frontend Angular tests (these already exist under `tests/presentation/` for upload, login, onboarding).

**Tools.**

- **Vitest** for execution and assertions (also used at project root for the backend).
- **Environment:** Node (services, mocked repositories, controllers).
- **Coverage:** `@vitest/coverage-v8` for coverage reports.

**Commands.**

| Command | Description |
|--------|-------------|
| `npm test` | Run all backend unit tests once |
| `npm run test:coverage` | Run tests and generate coverage (terminal + HTML in `coverage/`) |

**Test suites implemented.**

| Layer | File | Cases |
|-------|------|--------|
| Entities | `tests/business/entities/user-entity.spec.ts` | 4: `UserEntity.getEmailDomain()` (empty, no @, valid, multiple @) |
| Entities | `tests/business/entities/upload-entity.spec.ts` | 3: `UploadEntity.normalizeKeys()` (trim/lowercase/underscore, values, already normalized) |
| Services | `tests/business/services/upload-service.spec.ts` | 3: `mapRowsToEntities()` (null rows, empty array, valid rows) |
| Services | `tests/business/services/user-service.spec.ts` | 4: `checkUser()` (missing payload, existing user, new user with/without company; repository mocked) |
| Controllers | `tests/presentation/api/controllers/upload-controller.spec.ts` | 5: `handleUpload()` (400 missing/invalid rows, 200 with data/redirect, 500 on service error) |
| Controllers | `tests/presentation/api/controllers/user-controllers.spec.ts` | 5: `getPayload()` (401 no sub, 200 /monitoring and /company/:id, 403 company not registered, 500 on error) |

**Total:** 6 spec files, 24 tests, all passing.

**Directory layout.**

```
tests/
├── business/
│   ├── entities/
│   │   ├── user-entity.spec.ts
│   │   └── upload-entity.spec.ts
│   └── services/
│       ├── upload-service.spec.ts
│       └── user-service.spec.ts
└── presentation/
    └── api/
        └── controllers/
            ├── upload-controller.spec.ts
            └── user-controllers.spec.ts
```

**Conventions.** One `*.spec.ts` file per tested module, mirroring `src/`. Use `vi.mock()` for DB/HTTP modules. Descriptive test names; Arrange–Act–Assert where appropriate.

**Coverage (V8).** Scope: `src/business/**/*.ts` and `src/presentation/api/**/*.ts`. Example summary:

| Metric | Value |
|--------|--------|
| Statements | ~86% |
| Branches | ~80% |
| Functions | ~73% |
| Lines | ~86% |

- **business/entities:** 100%.
- **business/services:** 100% statements/lines.
- **presentation/api/controllers:** ~97% statements/lines.
- **Routes and middleware:** not covered by these unit tests (thin wiring); can be covered by integration or E2E.

To refresh coverage numbers, run `npm run test:coverage` and check the terminal output or `coverage/index.html`.

### 21.2 Usability Tests

The purpose of usability testing is to evaluate how effectively external users can interact with the onboarding system, focusing on the two primary interaction paths available in the current MVP:

1. **File Upload Flow (automated form completion)**
2. **Manual Form Filling Flow**

These tests validate whether users can:
- Understand the available interaction paths,
- Identify the most efficient workflow,
- Complete tasks without assistance,
- And correctly interpret system feedback.

---

### Test Responsibility 

#### Upload Flow Test Team

The following members were responsible for planning, executing, and documenting the **File Upload Flow usability tests**:

- **Facilitator:** Owen  
- **Presenter:** Jaime  
- **Recorders:** Matheus, Vitor  
- **Evaluators (external):** Karol Barbosa, Mariana, Tobias  

This team focused on evaluating the **automated onboarding path**, including file upload, system processing, and auto-filled form feedback.

---

#### Manual Form Flow Test Team

The following members were responsible for planning, executing, and documenting the **Manual Form Filling usability tests**:

- **Facilitator:** Débora  
- **Presenter:** Ana  
- **Recorder:** Yudi  
- **Evaluators (external):** Celso, Rui  

This team focused on evaluating the **manual data entry workflow**, including form navigation, field clarity, and submission process.

---

#### Notes on Test Organization

The division into two groups allowed the team to:
- evaluate **both primary and secondary user flows independently**,  
- ensure **focused observation and analysis per interaction type**,  
- and improve **documentation clarity and depth** for each usability path.

---

#### Testing Methodology

The evaluation was conducted using a **Cognitive Walkthrough** approach, focusing on **first-time user experience and learnability**.

Participants were **external to the development group**, ensuring unbiased interaction and realistic behavior.

The evaluation was based on the persona:

- **Chloe Smith (Office Manager)**  
  A moderately technical user responsible for organizing and submitting onboarding data, seeking efficiency and clarity.

---

#### Test Setup

- **Prototype fidelity:** High-fidelity  
- **Entry point:** Login page  
- **Environment:** Controlled observation session  
- **Test type:** Task-based usability evaluation  

Each participant performed tasks independently while evaluators recorded:

- Decision-making process,
- Interaction patterns,
- Misunderstandings,
- And completion success.

---

### Test 1 – File Upload Flow (Primary Path)

#### Objective

Evaluate whether users can identify and use the **file upload feature** to automatically populate the onboarding form.

#### Task Definition

- **Task:** Upload a CSV/XLSX file and complete the onboarding flow  
- **Expected outcome:** Form fields are auto-filled and user reaches the **pending review page**  
- **Success criteria:** Task completed without external assistance  

---

#### Results Summary

- **Success rate:** 100%  
- **Severity:** Low to Medium (initial interaction only)  
- **Critical failures:** None  

---

#### Individual User Experiences

##### **Karol Barbosa**

<div align="center">
<sub>FIGURE 10 – Karol Usability Test</sub><br>
  <img src="assets/karolusability.jpg" width="100%" alt="Karol Usability Test"><br>
  <sup>Source: Material produced by the authors, 2026.</sup>
</div>

- Initially considered manual form filling before noticing the upload option  
- Quickly adapted after identifying the upload button  
- Successfully completed the flow with no further issues  

**Insight:** Upload feature is functional and intuitive after discovery, but not immediately prioritized.

---

##### **Mariana**

<div align="center">
<sub>FIGURE 11 – Mariana Usability Test</sub><br>
  <img src="assets/marianausability.jpg" width="100%" alt="Mariana Usability Test"><br>
  <sup>Source: Material produced by the authors, 2026.</sup>
</div>

- Experienced initial confusion regarding:
  - form structure  
  - navigation between sections  
- Required a moment to understand that upload button was the intended starting point  
- Successfully completed the process after understanding workflow  

**Insight:** Lack of early guidance increases cognitive load for first-time users.

---

##### **Tobias**

<div align="center">
<sub>FIGURE 12 – Tobias Usability Test</sub><br>
  <img src="assets/tobiasusability.jpg" width="100%" alt="Tobias Usability Test"><br>
  <sup>Source: Material produced by the authors, 2026.</sup>
</div>

- Immediately identified the upload functionality  
- Completed the task smoothly without hesitation  
- Demonstrated clear understanding of system feedback  

**Insight:** When the correct mental model is triggered early, the system is highly efficient.

---

#### Key Findings – Upload Flow

- Users **eventually identify** the correct action, but not always immediately  
- The **upload feature lacks visual prioritization** as the main entry point  
- Once triggered, the system provides **clear and effective feedback**  
- Auto-fill behavior significantly improves user confidence  

---

### Test 2 – Manual Form Filling Flow (Secondary Path)

#### Objective

Evaluate how users interact with the **manual form filling option** when completing the *Company Details* section, and identify usability issues related to navigation, clarity, and workflow understanding.

#### Task Definition

- **Task:** Fill in the Company Details section manually and submit the information  
- **Expected outcome:** User completes the form and successfully submits the onboarding data  
- **Success criteria:** Form is filled and submitted without blocking errors  

---

#### Results Summary

- **Success rate:** 100%  
- **Severity:** Medium  
- **Critical issues:** Confusion in specific fields and unclear workflow prioritization  

---

#### Individual User Experiences

##### **Celso**

<div align="center">
<sub>FIGURE 13 – Celso Usability Test</sub><br>
  <img src="assets/celsousability.jpg" width="100%" alt="Celso Usability Test"><br>
  <sup>Source: Material produced by the authors, 2026.</sup>
</div>

- Initially attempted to **create an account instead of logging in**, indicating confusion in entry point  
- Successfully logged in using Google afterward  
- Selected onboarding sections, but not all of them  
- Attempted to **upload a CSV before proceeding manually**, suggesting unclear prioritization between flows  
- Completed manual form filling successfully  
- Reported confusion in the field: **“Build they are located in”**  
- Successfully submitted the form  

**Insight:**  
User behavior shows **uncertainty in the overall workflow**, especially in distinguishing between upload and manual paths, and highlights **unclear field labeling**.

---

##### **Henrique**

<div align="center">
<sub>FIGURE 14 – Henrique Usability Test</sub><br>
  <img src="assets/ruiusability.jpg" width="100%" alt="Rui Usability Test"><br>
  <sup>Source: Material produced by the authors, 2026.</sup>
</div>

- Logged in via Google without issues  
- Attempted to **create a new company**, indicating partial misunderstanding of flow sequence  
- Also attempted to **upload a CSV before using manual input**  
- Completed manual form filling without major difficulty  
- Expressed confusion in the field: **“Build they are located in”**  
- Successfully submitted the form  

**Insight:**  
Even with smoother progression, the user still demonstrated **ambiguity between available actions** and **unclear meaning of specific fields**.

---

#### Key Findings – Manual Flow

- Users frequently **deviate from the intended path** before completing the task:
  - Attempting account creation
  - Attempting CSV upload
  - Attempting unrelated actions (creating a company)

- There is **no clear distinction between interaction paths (upload vs manual)**

- The field **“Build they are located in”** caused consistent confusion:
  - Unclear wording
  - Unclear expected input

- Despite confusion, users are able to **recover and complete the task**, indicating:
  - Good system resilience
  - Suboptimal clarity

---  

### Cross-Test Analysis

#### Patterns Observed

- All users successfully completed tasks -> **strong baseline usability**
- Initial friction occurs in **understanding how to start**
- Upload flow becomes **highly efficient after discovery**
- Manual flow is:
  - Usable, but less efficient and less intuitive

---

#### Core Usability Issues Identified

1. **Unclear primary action (Upload vs Manual)**  
2. **Lack of onboarding guidance for first-time users**  
3. **Form structure not immediately scannable**  

---

### Actionable Improvements (Current Scope)

| Issue | Recommendation | Priority |
|------|--------------|----------|
| Upload not clearly prioritized | Highlight upload as primary CTA (visual hierarchy, placement) | High |
| Users default to manual input | Add instructional microcopy (“Start by uploading your file”) | High |
| Lack of first-time guidance | Introduce onboarding tooltip or hint | High |
| Form structure unclear | Improve section grouping and labeling | Medium |

---

### Future Improvements (Post-MVP)

| Opportunity | Description |
|------------|------------|
| Guided onboarding flow | Step-by-step interaction guiding users toward upload |
| Interactive tutorial | First-time walkthrough explaining system logic |
| Smart empty states | Contextual hints before user action |
| Advanced feedback states | More granular processing indicators |
| Behavioral analytics | Track user interaction patterns and drop-offs |

---

### Evaluation of Test Coverage

The usability tests covered the main user interaction flows related to:

- **FR01 – Structured Onboarding Data Upload**
- **FR08 – Dynamic Onboarding Interface**
- **FR11 – Onboarding Status and Feedback**

Additionally, the tests indirectly evaluated:
- User decision-making between alternative interaction paths.
- Clarity of system affordances.
- Effectiveness of UI feedback mechanisms.

#### Identified Gaps

The following areas were not covered and should be tested in future iterations:

- Collaborative workflows (FR10)  
- Error correction and re-submission (FR05)  
- Dependency enforcement (FR09)  
- Large-scale usability under high data volume (NFR02)  

---

### Conclusion

The usability evaluation demonstrates that the system is:

- **Effective:** All users completed both interaction paths  
- **Learnable:** Users adapt quickly after initial interaction  
- **Efficient (in upload flow):** Automation significantly improves performance  

However, the system currently presents **moderate friction in first-time use**, primarily due to:

- Unclear prioritization of the upload feature,  
- Lack of initial guidance,  
- Structure complexity.  

These issues are **non-critical and highly addressable**, requiring primarily UX and interface adjustments rather than structural changes.

Improving the initial interaction experience will significantly enhance:
- User efficiency,
- Onboarding speed,
- Overall product perception.

### 21.3 Sprint 4: Comprehensive Test Execution and Coverage Validation

This subsection consolidates the complete testing production delivered in Sprint 4, preserving the strategy and evidence discussed in this chapter.

#### 21.3.1 Sprint 4 Overview

Sprint 4 consolidates comprehensive functional and non-functional testing across the triple-layer architecture (Presentation, Business, Data), with execution evidence, coverage metrics, and quality analysis.

Sprint 4 objectives:

1. Execute and document comprehensive functional tests across all implemented topics.
2. Validate non-functional requirements with targeted test suites.
3. Consolidate usability test feedback and improvement actions.
4. Quantify coverage and identify improvement opportunities.
5. Deliver organized documentation with traceability and execution evidence.

Delivered artifacts:

- 41 test files with 323 passing tests.
- 100% code coverage in the in-scope measured code.
- Integration flow tests for critical business paths.
- Component test suite for key UI workflows.
- Test evidence organized by architecture and functional topic.

#### 21.3.2 Functional Test Coverage by Implemented Topics

Functional tests are organized by implemented topics and architectural layer.

| Implemented Topic | Unit Tests | Integration Tests | Component Tests | Coverage | Evidence |
|-------------------|------------|-------------------|-----------------|----------|----------|
| Structured onboarding data upload | `upload-service.spec.ts`, `upload-entity.spec.ts` | `upload-flow.spec.ts`, `upload-complete-flow.spec.ts` | `upload.component.spec.ts` | 100% | CSV/XLSX parsing, normalization, file handling |
| Data standardization | `upload-entity.spec.ts`, `upload-payload-mapper-service.spec.ts` | `upload-complete-flow.spec.ts` | `upload.component.spec.ts` | 100% | Key normalization, snake_case conversion, field mapping |
| Intermediate persistence and progress continuity (current implementation scope) | `onboarding-form.component.spec.ts` | SessionStorage-based flow coverage | `onboarding-form.component.spec.ts` | Partial coverage within current scope | Session storage, form state preservation, upload result storage |
| Dynamic onboarding interface (current implementation scope) | `app.routes.spec.ts` | Route and flow validation | `onboarding-form.component.spec.ts`, `module-selector.component.spec.ts` | High coverage within current scope | Section navigation, conditional rendering behavior, query parameter handling |
| Onboarding status and feedback (current implementation scope) | `upload-controller.spec.ts`, `user-controllers.spec.ts` | `auth-flow.spec.ts`, `upload-flow.spec.ts` | Multiple component specs | High coverage within current scope | Status codes, error messages, flow transitions, trace ID propagation |

Detailed test coverage by layer:

| Layer | Files | Tests | Main validated topics |
|-------|-------|-------|-----------------------|
| Presentation | 23 | 180 | Authentication, upload, onboarding form navigation, review workflow, route bootstrap |
| Business | 10 | 95 | Entity normalization, orchestration services, queueing, worker processing, external payload mapping |
| Data | 5 | 35 | Repository persistence operations, data access behavior, mock API contract behavior |
| Integration flows | 4 | 13 | Auth flow, upload flow, complete upload flow, service-repository flow |

#### 21.3.3 Non-Functional Test Execution and Results

| NFR Topic | Test Approach | Tools | Evidence | Result |
|-----------|---------------|-------|----------|--------|
| Data integrity and consistency | Validation and normalization tests plus repository behavior checks | Vitest, mocks, assertions | `upload-entity.spec.ts`, `upload-service.spec.ts`, `onboarding-repository.spec.ts` | Pass |
| Large file handling and responsiveness | Parser and component tests simulating realistic upload scenarios | Vitest, ExcelJS, synthetic files | `upload-file-parser-service.spec.ts`, `upload.component.spec.ts` | Pass (structural validation) |
| Processing reliability | Worker tests with failure scenarios and error propagation | Vitest, mocked SQS/S3, mocked persistence | `upload-worker.spec.ts`, `upload-complete-flow.spec.ts` | Pass |
| Security and protected access | Authentication and middleware tests validating token behavior | Vitest, Auth0 SDK mocks, middleware tests | `auth-flow.spec.ts`, `auth-complete-flow.spec.ts`, `auth-service-repo-flow.spec.ts` | Pass (scope-aligned validation) |
| Concurrent submission handling | Queue behavior tests with independent job handling scenarios | Vitest, mocked queue infrastructure | `upload-queue.spec.ts`, `upload-worker.spec.ts` | Pass (scope-aligned validation) |

#### 21.3.4 Coverage Analysis by Architectural Layer

Coverage summary (latest validated run):

| Scope | Statements | Branches | Functions | Lines |
|-------|------------|----------|-----------|-------|
| Total measured scope | 2,383/2,383 | 819/819 | 139/139 | 2,383/2,383 |

Coverage generation command:

```bash
npm run test:coverage
```

Coverage by test type:

| Test Type | Count | Contribution focus |
|-----------|-------|--------------------|
| Unit tests | 95 | Core business logic and transformations |
| Component tests | 180 | UI workflows and interaction behavior |
| Integration tests | 13 | End-to-end API and service-repository flow behavior |
| Worker and queue tests | 26 | Asynchronous processing behavior |
| Repository and DB tests | 9 | Data access behavior |

Notes on exclusions in measured scope:

- Type-only definitions and models.
- Framework bootstrap and generated artifacts.
- Test source files.
- Third-party dependencies.

These exclusions preserve meaningful coverage metrics for authored executable logic.

#### 21.3.5 Test Execution Evidence

Execution commands:

```bash
npm test
npm run test:coverage
```

Execution result summary:

- Test files: 41 passed.
- Test cases: 323 passed.
- Coverage: 100% in measured scope.

Critical scenarios validated:

| Scenario | Evidence File | Validation Result |
|----------|---------------|-------------------|
| CSV upload processing | `upload-file-parser-service.spec.ts` | Pass |
| XLSX upload processing | `upload-file-parser-service.spec.ts` | Pass |
| Invalid file rejection | `upload.component.spec.ts` | Pass |
| Key normalization behavior | `upload-entity.spec.ts` | Pass |
| Null/undefined payload behavior | `upload-service.spec.ts` | Pass |
| Missing authorization behavior | `auth-flow.spec.ts` | Pass |
| Invalid token behavior | `auth-complete-flow.spec.ts` | Pass |
| Queue and worker error flow behavior | `upload-complete-flow.spec.ts` | Pass |
| Section navigation and progress behavior | `onboarding-form.component.spec.ts` | Pass |
| Concurrent job handling behavior | `upload-queue.spec.ts` | Pass |

#### 21.3.6 Proof of Execution

This area is reserved for screenshots and visual evidence of execution.

Recommended evidence groups:

1. Full test run summary in terminal.
2. Coverage summary in terminal.
3. Coverage HTML report overview.
4. Representative passing suites by layer (Presentation, Business, Data).
5. Representative integration flow test output.

Template 1 - Full test execution evidence:

<div align="center">
<sub>FIGURE 15 - Full Test Execution (Sprint 4)</sub><br>
  <img src="assets/sprint4_full_test_execution.png" width="100%" alt="Full Test Execution Sprint 4"><br>
  <sup>Source: Material produced by the authors, 2026.</sup>
</div>

Template 2 - Coverage terminal evidence:

<div align="center">
<sub>FIGURE 16 - Coverage Summary Output (Sprint 4)</sub><br>
  <img src="assets/sprint4_coverage_terminal.png" width="100%" alt="Coverage Summary Sprint 4"><br>
  <sup>Source: Material produced by the authors, 2026.</sup>
</div>

Template 3 - Coverage HTML report evidence:

<div align="center">
<sub>FIGURE 17 - Coverage HTML Report (Sprint 4)</sub><br>
  <img src="assets/sprint4_coverage_html.png" width="100%" alt="Coverage HTML Report Sprint 4"><br>
  <sup>Source: Material produced by the authors, 2026.</sup>
</div>

Template 4 - Integration flow execution evidence:

<div align="center">
<sub>FIGURE 18 - Integration Flow Evidence (Sprint 4)</sub><br>
  <img src="assets/sprint4_integration_flows.png" width="100%" alt="Integration Flow Evidence Sprint 4"><br>
  <sup>Source: Material produced by the authors, 2026.</sup>
</div>

#### 21.3.7 Improvement Backlog (Features)

Immediate improvements:

1. Expand advanced validation and conflict detection behavior in upload and review workflows.
2. Strengthen continuity across sessions and devices.
3. Extend end-to-end browser-level automation for complete user journeys.

Medium-term improvements:

1. Add safer correction workflows and change comparison visualization.
2. Add dependency and collaboration controls in onboarding progression.
3. Expand performance and stress validation with higher data volume and concurrency.

Long-term improvements:

1. Expand export and secure external integration workflows.
2. Add real-time collaboration capabilities.
3. Add operational analytics for onboarding quality and throughput.

#### 21.3.8 Conclusion: 

Sprint 4 delivered comprehensive and documented testing across the triple-layer architecture with fully measured code coverage, broad topic coverage for implemented scope, and full measured code coverage.

Summary:

- 41 test files and 323 passing tests.
- 100% coverage in measured scope.
- Functional and non-functional testing aligned with implemented product scope.
- Usability feedback collected and translated into current and future improvements.
- Structured evidence area prepared for screenshot insertion and review.

This provides a coherent and auditable validation baseline for the current product implementation stage and supports the next sprints focused on feature expansion.

## 22. FR–NFR Correlation Matrix

| FR ID | Related NFRs | Justification                                                                  |
| ----- | ------------ | ------------------------------------------------------------------------------ |
| FR01  | NFR02, NFR05 | Large uploads and concurrent submissions require responsiveness and stability. |
| FR02  | NFR01        | Standardization depends on strict schema integrity.                            |
| FR03  | NFR01, NFR03 | Staging requires integrity and fault tolerance.                                |
| FR04  | NFR01, NFR03 | Validation relies on clean data and reliable processing.                       |
| FR05  | NFR01, NFR03 | Safe replacement demands consistency and reliability.                          |
| FR06  | NFR01        | Accurate comparisons depend on standardized data.                              |
| FR07  | NFR03        | Progress saving requires reliable persistence.                                 |
| FR08  | NFR03        | Dynamic flows require consistent state handling.                               |
| FR09  | NFR03        | Dependency enforcement relies on reliability.                                  |
| FR10  | NFR05        | Collaboration requires stable concurrency.                                     |
| FR11  | NFR03        | Status tracking depends on reliable processing.                                |
| FR12  | NFR01, NFR03 | Export requires integrity and fault tolerance.                                 |

## 23. User Stories and Traceability

### User Stories

| ID   | User Story                                                                                                                 |
| ---- | -------------------------------------------------------------------------------------------------------------------------- |
| US01 | As a client project manager, I want to upload onboarding data files so that I can submit required information efficiently. |
| US02 | As a user, I want my data standardized so that validation is consistent.                                                   |
| US03 | As an analyst, I want submitted data staged safely before production.                                                      |
| US04 | As a user, I want validation feedback to correct errors early.                                                             |
| US05 | As a user, I want to re-submit corrected data safely.                                                                      |
| US06 | As an analyst, I want to compare submissions easily.                                                                       |
| US07 | As a user, I want progress saved automatically.                                                                            |
| US08 | As a user, I want only relevant onboarding sections displayed.                                                             |
| US09 | As a user, I want onboarding steps enforced logically.                                                                     |
| US10 | As a project manager, I want to assign sections to collaborators.                                                          |
| US11 | As a user, I want to track onboarding status clearly.                                                                      |
| US12 | As an analyst, I want approved data exported and integrated securely.                                                      |

### User Stories and FR Traceability

| User Story | Related FRs |
| ---------- | ----------- |
| US01       | FR01        |
| US02       | FR02        |
| US03       | FR03        |
| US04       | FR04        |
| US05       | FR05        |
| US06       | FR06        |
| US07       | FR07        |
| US08       | FR08        |
| US09       | FR09        |
| US10       | FR10        |
| US11       | FR11        |
| US12       | FR12        |

## 24. Revision of the Proposed Solution

The proposed solution establishes a structured and scalable foundation for transforming Equiem’s onboarding process from a fragmented, manual workflow into a reliable and strategically differentiated intake system. Through comprehensive business analysis, clear requirement definition, and a focused MVP strategy, the project directly addresses operational bottlenecks that currently limit efficiency, data integrity, and speed of deployment. By embedding validation, standardization, and collaborative capabilities at the point of data entry, the platform significantly reduces manual effort, minimizes rework, and enables parallel onboarding at scale. Ultimately, the initiative accelerates time-to-launch, enhances customer experience, and strengthens operational resilience, positioning onboarding not as a constraint, but as a sustainable competitive advantage for Equiem’s continued growth.

## 25. Deployment Architecture

### 25.1. Overview

The deployment diagram represents the **target production architecture** of the onboarding automation platform developed in partnership with Equiem.

The diagram illustrates how the system components are distributed across cloud infrastructure resources and how different services interact within the production environment. It presents the servers, middleware, services, and databases required to operate the system, as well as the communication protocols used between them.

The architecture follows a **distributed cloud-based deployment model**, separating the system into distinct layers responsible for presentation, application logic, asynchronous processing, and data persistence.

The main components of the architecture include:

- Web browser interface used by onboarding specialists
- Frontend web application deployed on cloud infrastructure
- Backend API services responsible for business logic
- Messaging infrastructure supporting asynchronous processing
- Worker services responsible for data processing tasks
- Managed relational database infrastructure
- External authentication services

The deployment architecture was designed to satisfy the project's non-functional requirements, particularly those related to performance, scalability, availability, and security.

Figure 15 illustrates the deployment architecture of the onboarding automation platform.

For better visualization, please access the following [link](https://drive.google.com/file/d/1jHnyVEm3KI1-ERu1pNhjq-7KT3i-hlVW/view?usp=sharing).

<div align="center">
<sub>FIGURE 19 – Deployment Architecture Diagram</sub><br>
  <img src="assets/deployment_map.svg" width="100%" alt="Deployment Architecture Diagram"><br>
  <sup>Source: Material produced by the authors, 2026.</sup>
</div>

### 25.2. System Infrastructure

The system is deployed using cloud infrastructure services provided by **Amazon Web Services (AWS)**.

Different infrastructure nodes are used to host specific components of the system, allowing the architecture to remain modular and scalable.

The main infrastructure elements are:

| Infrastructure Component | Description |
|--|-|
| AWS EC2 (Frontend) | Hosts the web application frontend |
| AWS EC2 (Backend) | Hosts backend API services |
| AWS EC2 (Worker) | Hosts background worker services responsible for asynchronous processing |
| Amazon RDS | Managed relational database service used for persistent storage |
| Amazon SQS | Messaging middleware responsible for asynchronous job processing |
| Auth0 Cloud Service | External authentication and identity management provider |

All application services are deployed using **Docker containers**, ensuring consistent runtime environments and simplifying deployment and infrastructure management.

### 25.3. Frontend Deployment

The frontend application is deployed on an **AWS EC2 instance** within a Docker container environment.

The frontend is implemented using **Angular and TypeScript**, forming a single-page application responsible for presenting the onboarding interface used by administrators and onboarding specialists.

The frontend node contains the following components:

| Component | Description |
|-|-|
| Angular + TypeScript | Core frontend application responsible for rendering the onboarding UI |
| Static Assets | Compiled JavaScript files, stylesheets, and other UI resources |

Users interact with the system through a web browser. Requests are sent through the internet to the frontend server using **secure HTTPS connections**.

The frontend communicates with backend services through HTTPS API requests.

### 25.4. Backend Deployment

The backend application is deployed on a dedicated **AWS EC2 instance**, also running within a Docker container.

The backend follows a **layered architecture** that separates responsibilities into logical modules responsible for handling API requests, business logic, and database interaction.

The backend node includes the following components:

| Component | Responsibility |
|-|-|
| Controller Layer | Handles incoming HTTP requests and exposes REST API endpoints |
| Service Layer | Implements business logic and system workflows |
| Repository Layer | Handles database access and persistence operations |
| HubSpot Integration Module | Retrieves deal information and enabled modules |
| Equiem Integration Module | Prepares structured onboarding data for system integration |
| Queue Publisher | Sends asynchronous processing jobs to Amazon SQS |

This layered design improves maintainability, separation of concerns, and long-term system extensibility.

### 25.5. Messaging Infrastructure

The system incorporates **Amazon Simple Queue Service (SQS)** as a messaging middleware to support asynchronous processing.

When operations require heavy data processing, such as parsing uploaded onboarding files or validating large configuration datasets, the backend publishes job messages to the SQS queue.

The queue acts as a decoupling mechanism between the API layer and background processing services.

Using a messaging infrastructure provides several architectural benefits:

- decoupling between system components
- improved system scalability
- support for asynchronous workflows
- improved system reliability through retry mechanisms

This architecture prevents long-running operations from blocking API responses and improves overall system responsiveness.

### 25.6. Worker Processing Layer

The architecture includes a **worker processing layer** responsible for executing asynchronous data processing tasks.

Worker services are deployed on a separate AWS EC2 node within Docker containers.

These worker services consume messages from the SQS queue and execute the necessary processing tasks.

The worker node includes the following components:

| Component | Responsibility |
|-|-|
| Job Consumer | Retrieves job messages from the SQS queue |
| File Processor | Parses uploaded CSV or XLSX onboarding files |
| Data Standardizer | Transforms and standardizes onboarding data structures |

This architecture allows heavy processing operations to be handled independently from the main application services.

Separating the processing layer from the API layer improves system scalability and ensures that the main application remains responsive even when processing large onboarding datasets.

### 25.7. Database Layer

The system uses **Amazon Relational Database Service (RDS)** as the primary database infrastructure.

The database is responsible for storing all persistent system data, including:

- onboarding configuration data
- uploaded dataset information
- validation results
- processing states
- system metadata

The backend communicates with the database using **TCP/IP connections**, following standard relational database communication protocols.

Using a managed database service provides operational advantages such as:

- automated backups
- improved reliability
- built-in monitoring
- simplified infrastructure management

### 25.8. Authentication Service

User authentication and identity management are handled by **Auth0**, a cloud-based authentication platform.

Auth0 provides identity services using **OAuth 2.0 and OpenID Connect protocols**.

When a user attempts to access the onboarding platform, the frontend redirects the authentication request to Auth0. After successful authentication, Auth0 returns a secure token used by the frontend to authenticate API requests.

The backend validates authentication tokens using **JWT validation**, ensuring that only authorized users can access protected system endpoints. After token validation, the backend resolves user navigation through a protected endpoint that returns the appropriate next route according to the user context.

The implemented authentication flow applies role-based navigation with two operational outcomes:

- **Internal users** are routed to monitoring flows.
- **External users** are routed to company/onboarding flows.

Internal recognition is based on organizational email-domain rules and an explicit test allowlist used for controlled validation scenarios. This guarantees deterministic behavior for internal access during both production and test operations.

For external contributors, the platform enforces an **instance-link-first** onboarding flow. Users entering via onboarding instance links must remain in tokenized instance routes throughout method selection and completion steps. The login process preserves the intended route and restores it after authentication, preventing redirection to internal-only paths.

This architecture eliminates the need to implement custom authentication mechanisms while maintaining a high level of security, predictable role-based routing, and continuity for collaborative onboarding sessions.

### 25.9. Communication Protocols

System components communicate using secure and reliable communication protocols.

| Source | Destination | Protocol | Purpose |
|--------|-------------|----------|---------|
| User Browser | Internet / Frontend Server | HTTPS | Access to the onboarding web interface |
| Frontend Application | Backend API | HTTPS | Communication with backend services |
| Frontend Application | Auth0 | HTTPS (OAuth2 / OpenID Connect) | User authentication and login flow |
| Backend API | Auth0 | HTTPS (JWT Validation) | Verification of authentication tokens |
| Backend API | Amazon SQS | HTTPS (AWS SDK) | Publishing asynchronous processing jobs |
| Worker Service | Amazon SQS | HTTPS (AWS SDK Polling) | Consuming background processing jobs |
| Backend API | Amazon RDS | TCP/IP | Database communication |

All external communications use HTTPS to ensure encrypted data transmission.

### 25.10. Deployment Rationale

- The deployment architecture was designed to ensure scalability, modularity, and long-term maintainability of the onboarding automation platform.
- Separating frontend, backend, and worker services into independent infrastructure nodes allows the system to scale horizontally as demand increases.
- Containerization using Docker ensures consistent execution environments across development, testing, and production environments.
- The use of Amazon SQS enables asynchronous processing of heavy workloads, preventing computationally intensive operations from blocking the main application workflow.
- Amazon RDS provides a reliable and managed database environment that reduces operational overhead while maintaining high availability and durability.
- External authentication services such as Auth0 provide secure identity management while reducing development complexity.

### 25.11. Performance Considerations

- The deployment architecture addresses performance-related non-functional requirements by separating processing responsibilities across multiple components.
- The asynchronous processing model enabled by Amazon SQS allows the system to process large onboarding datasets without impacting API responsiveness.
- Worker services handle computationally intensive tasks independently, allowing the backend API to remain responsive to user interactions.
- Additionally, containerized services allow horizontal scaling of backend and worker nodes when processing demand increases.
- This architecture ensures efficient handling of onboarding workflows even when large datasets are uploaded.

### 25.12. Security Considerations

- Security is a fundamental aspect of the deployment architecture.
- All communication between system components occurs through **HTTPS**, ensuring encrypted data transmission across the network.
- Authentication and identity management are handled through Auth0 using OAuth 2.0 and OpenID Connect protocols.
- The backend validates JWT tokens to ensure that only authenticated users can access system functionality.
- Using managed AWS infrastructure also provides additional security mechanisms, including network isolation, access policies, and infrastructure-level protections.
--- 

## 26. SDGs (Sustainable Development Goals) and Impact

This section examines the expected impact of the proposed onboarding automation system from both an operational and sustainability perspective. It outlines how the solution improves Equiem’s onboarding process and analyses the project in relation to the Sustainable Development Goals (SDGs) of the United Nations 2030 Agenda (United Nations, 2015), considering its potential contributions across the dimensions of People, Planet, Prosperity, Peace, and Partnerships, and its connection to the broader Smart Cities paradigm supported by digital infrastructure and PropTech innovation.

Bibliographic references for sources cited in Section 26 are listed under **References** at the end of this document.

### 26.1. Operational Impact

Section 2 describes Equiem’s current onboarding process, in which customer-specific data are collected and reviewed through decentralized e-mail and spreadsheet-based workflows. As a result, this approach often leads to inconsistencies, rework, and delays across stakeholders and time zones. To address these limitations, the proposed solution introduces a single structured onboarding channel that combines guided data capture, automated validation at submission (FR01–FR04, FR08), progress persistence (FR07), and asynchronous processing through message queues and background workers (Section 25).  

In this context, data collection and validation are handled through upload and mapping pipelines, supported by schema validation and business-rule checks, which allow potential issues to be identified before the data is consumed in downstream configuration processes (Sections 16–17). Consequently, the process reduces reliance on iterative e-mail exchanges and helps improve data quality while minimizing human error.

Furthermore, the system enables parallel onboarding processes. Multiple customer-side contributors can collaborate through shared workflows and task assignments (FR10), while the backend infrastructure can process workloads from multiple clients simultaneously within infrastructure limits (NFR05; Sections 25.5–25.6). At the same time, scalability is supported through asynchronous processing with Amazon SQS and a distributed architecture involving containerized APIs, worker services, and a managed database (Section 25).

Overall, these mechanisms are expected to reduce onboarding cycle time and operational overhead, particularly by decreasing manual file handling and version reconciliation. As a result, onboarding specialists can focus more on exception handling and client coordination rather than manual data cleansing. In practical terms, the system should enable faster transitions from submission to configuration readiness, lower marginal effort per record, and clearer operational visibility through monitored queues, worker health, and system performance metrics.

### 26.2. Sustainability and Alignment with the 2030 Agenda

The **2030 Agenda** frames sustainable development through five dimensions: **People**, **Planet**, **Prosperity**, **Peace**, and **Partnerships** (United Nations, 2015). Each dimension below states the **type of contribution** (*direct*, *indirect*, or *limited relevance*) and justifies it using this project’s scope.

**People: *direct (moderate) and indirect.*** The solution **directly** improves **clarity and task structure** for customer administrators and internal analysts through guided data entry, visible progress status, and collaborative assignment mechanisms (Sections 9–10, FR10–FR11; usability discussion in Section 21). Furthermore, it facilitates inclusive collaboration by enabling distributed contributors to complete their assigned sections independently rather than relying on fragmented e-mail exchanges. The contribution is **moderate** because it targets a **specific workflow**, not broad labour-market policy.

**Planet: *indirect (limited).*** The solution does not directly address environmental indicators such as building energy consumption or emissions. Its environmental relevance is therefore **indirect**, mainly through the **streamlining of digital workflows**, which reduces fragmented data exchanges and repetitive correction cycles. By consolidating onboarding activities into a structured and validated process, the system improves operational efficiency and reduces unnecessary computational and coordination overhead.

**Prosperity: *direct.*** Faster, more reliable onboarding **accelerates time-to-value** for customers and improves **productivity** of Equiem teams, consistent with Section **8** (product goal) and **SDG-aligned** economic efficiency themes developed in §26.3.

**Peace: *indirect (institutional).*** In the sense of **stability and trust**, the architecture contributes **indirectly** through **HTTPS**, **JWT validation** (Section **25.8**), traceable batches/jobs, and security-related NFRs (Section **17**), reducing disputes rooted in **ambiguity or unauthorised access**. The project does **not** address geopolitical conflict.

**Partnerships: *direct.*** Multi-party onboarding and integrations with **identity and cloud providers** exemplify **collaborative delivery** (Sections **25.8–25.9**). Direct value lies in **aligned actors** operating on **shared artefacts** rather than disconnected e-mail chains.

### 26.3. Priority Sustainable Development Goals

The **primary SDGs** most relevant to this **PropTech onboarding** system are **SDG 8**, **SDG 9**, and **SDG 11** (United Nations Statistics Division, n.d.).

**SDG 9 (Industry, Innovation and Infrastructure)** is central because the MVP constitutes **resilient digital infrastructure**: APIs, queues, workers, validation services, and a managed database replace **fragmented manual workflows**, supporting **innovation in digital service delivery** (Sections **16–17**, **25**). **Automation** is the mechanism that operationalises this infrastructure at scale.

**SDG 11 (Sustainable Cities and Communities)** applies at the **building–urban interface**: Equiem operates in the context of **commercial real estate** and **tenant-facing digital experiences** (Section **3**). **Timely and validated onboarding data** supports the reliability of **building and workplace platforms**; without it, digital services such as access control, operations coordination, and tenant communications can degrade. This relationship between onboarding infrastructure and urban service readiness is discussed further in §26.4.

**SDG 8 (Decent Work and Economic Growth - primary among social–economic goals)** is supported through the **reduction of repetitive manual work**, clearer **task allocation**, and **higher throughput per specialist**, improving working conditions within the onboarding function and increasing operational efficiency for customers. This contribution relates to **work quality and productivity improvements**, without claiming macroeconomic measurement.

**SDG 12 (Responsible Consumption and Production - secondary)** is additionally relevant since the solution contributes to reducing **operational waste** generated by repeated data corrections and fragmented information exchanges.

Together, **digital infrastructure and automation** (SDG 9) within a **PropTech service context** connect improved **work processes** (SDG 8) with the **operational readiness of urban digital services** in the built environment (SDG 11).

### 26.4. Relationship with the Smart Cities Concept

The **Smart Cities** concept treats **data and digital infrastructure** as key enablers of **urban service quality** (Batty et al., 2012; UN-Habitat, 2022). Within this context, **PropTech platforms** operate between **buildings**, **operators**, and **occupants**, supporting the digital services that manage modern workplaces. For these services to function reliably, systems must begin with **trustworthy master data at the moment of system configuration (go-live)**.

In practice, **building management platforms depend on correct configuration data**. The **digital onboarding infrastructure** introduced in this project ensures that data entering operational systems is **validated and structured before use**, preventing errors from propagating into building operations. At the same time, **scalable data processing**, implemented through background workers and benchmarked workloads (Appendix A), allows the system to support **large urban property portfolios** without requiring proportional increases in staffing.

Together, these mechanisms contribute to **more reliable digital services in the built environment**, supporting the broader vision of **smarter urban systems**, while recognising that this module does **not** directly address city-scale infrastructures such as transport or utilities. This directly aligns with Smart Cities principles by enabling interoperable, data-driven urban infrastructure through reliable building-level digital systems.

### 26.5. Evidence, Expected Impacts and Practical Implications

**Objective evidence** available in this repository includes: **functional and non-functional requirements** (Sections **16–17**), **business flows** and **user stories** (Sections **10**, **23**), **test and usability analyses** (Sections **18–21**), **[TEST_EXECUTION_REPORT.md](../tests/TEST_EXECUTION_REPORT.md)**, **deployment architecture** (Section **25**), and **benchmark-derived throughput analysis** (**Appendix A**). Together, these artefacts substantiate the system’s **design rationale**, **specified behaviour**, and **engineering trade-offs**. However, they represent **design and testing evidence**, not post-production operational KPIs.

**Expected impacts**, aligned with the criteria defined in this section, include: **operational efficiency gains** through the separation of API and worker responsibilities and the adoption of asynchronous processing; **reduction of administrative workload**, as manual reconciliation of files and versions is replaced by structured workflows; **improved reliability of onboarding data** through validation before downstream system use; and **scalable digital infrastructure for real-estate platforms**, supported by horizontal scaling patterns described in Section **25** and throughput analysis in **Appendix A**. These improvements are also expected to enhance **service delivery and customer experience** through increased transparency, collaborative workflows, and early validation feedback (FR10–FR11; Section **21**).

More broadly, organisations adopting **PropTech** and **digital building management platforms** face implications consistent with wider **digital transformation** literature: platforms that standardise **data supply chains** can reduce friction between **assets**, **operators**, and **users**, but they also require **governance structures**, **appropriate technical skills**, and **performance measurement** to sustain long-term value (OECD, 2020; World Economic Forum, 2022). While this document provides **design-level and testing evidence**, **SDG-level impact attribution** ultimately depends on operational baselines from partner organisations. To support empirical evaluation, the following **operational KPIs are defined**:

1. **Onboarding cycle time** – time from initial data submission to configuration readiness.  
2. **Re-submission rate** – percentage of datasets requiring correction cycles.  
3. **Time-to-first-valid batch** – time required to achieve a fully validated dataset without errors.  

These metrics provide a measurable basis for validating the operational and sustainability impacts described in this section.

--- 

## Appendix A: System Configuration and Optimization Report

This appendix determines the optimal configuration for two critical parameters of the system:

- **Batch Size (B):** the number of rows processed in a single transaction (chunk).
- **Worker Count (W):** the number of parallel consumers running simultaneously.

Selecting appropriate values for these parameters requires balancing multiple performance trade-offs:

- If **B is too small**, network and transaction overhead dominate processing time.
- If **B is too large**, memory consumption increases and may degrade system stability.
- If **W is too low**, the processing queue drains slowly.
- If **W is too high**, database contention and locking may reduce throughput.

To identify an optimal configuration, a series of **controlled benchmarks** was executed and the results were analyzed using a regression-based performance model.

---

### 1. Benchmark Data Log

To generate the benchmark dataset, a script called [generate-data.py](../appendix-math/scripts/generate-data.py) was implemented. This script produces a CSV file containing **50,000 rows of synthetic data** using the Python Faker library. The generated dataset is stored in [onboarding_50000.csv](../appendix-math/csv/onboarding_50000.csv).

A second script, [benchmark-throughput.ts](../appendix-math/scripts/benchmark-throughput.ts), was developed to process the dataset and evaluate system throughput across multiple configurations.

The benchmark evaluates **12 combinations** of batch sizes and worker counts.  Each configuration is executed **three times** to reduce noise and allow the calculation of mean throughput values.

The benchmark was executed using the following command on the terminal:

```bash
$env:BENCHMARK_BATCH_SIZES="1,3,5,10";
$env:BENCHMARK_WORKER_COUNTS="1,2,4";
$env:BENCHMARK_RUNS_PER_COMBINATION="3";
$env:BENCHMARK_SKIP_EXTERNAL_SEND="true";
$env:BENCHMARK_RESUME_CSV="appendix-math/csv/throughput-2026-03-25T23-03-58-989Z.csv";
npm run benchmark:throughput
```
This command generated the following output file: [throughput-2026-03-25T23-03-58-989Z.csv](../appendix-math/csv/throughput-2026-03-25T23-03-58-989Z.csv). The file records the results of three benchmark runs for each configuration.

To compute the average throughput (T) in records per second, an additional script called [optimize-throughput.ts](../appendix-math/scripts/optimize-throughput.ts) was executed. This script processes the raw benchmark results and generates a new file called: [throughput-2026-03-25T23-03-58-989Z-combination-means.csv](../appendix-math/csv/throughput-2026-03-25T23-03-58-989Z-combination-means.csv) This file contains the mean throughput for each of the 12 (B, W) combinations, calculated from the three benchmark runs performed for every configuration. The averaged results are then used as the dataset for the regression model described in Section 2.

The table below summarizes the evaluated configurations and their corresponding average throughput values.

| Batch Size (B) | Worker Nodes (W) | Throughput (T) |
|:--------------:|:----------------:|:--------------:|
| 1              | 1                | 799.48         |
| 1              | 2                | 829.46         |
| 1              | 4                | 871.46         |
| 3              | 1                | 900.91         |
| 3              | 2                | 896.98         |
| 3              | 4                | 708.42         |
| 5              | 1                | 523.10         |
| 5              | 2                | 718.40         |
| 5              | 4                | 904.10         |
| 10             | 1                | 884.70         |
| 10             | 2                | 842.02         |
| 10             | 4                | 870.80         |

#### 1.1. Justification for Benchmark Parameters

The selected parameter ranges reflect the operational characteristics of the backend architecture and the expected workload of the onboarding system.

For **Batch Size (B)**, the system processes each uploaded file as a single batch, and the typical file size is moderate. A lower bound of **B = 1** represents the smallest possible transaction size, while **B = 10** was chosen as a practical upper limit to avoid excessive memory usage and long transaction times. Intermediate values (**B = 3** and **B = 5**) allow observation of how throughput changes as batch size increases.

For **Worker Count (W)**, the worker service supports horizontal scaling but is constrained by database concurrency limits. A single worker (**W = 1**) provides the sequential baseline, while **W = 4** was selected as the practical upper bound to avoid database contention observed in preliminary tests. The intermediate value (**W = 2**) captures the effect of moderate parallelism.

Testing all combinations of these parameters (**4 batch sizes × 3 worker counts**) produces **12 configurations**, each executed three times, providing sufficient data to estimate a reliable regression model for system throughput.

--- 

### 2. The Performance Model

To model the relationship between system configuration and throughput, a **quadratic surface regression** was fitted to the benchmark data.

The objective of this model is to approximate the system throughput **T(B, W)** as a function of:

- **B:** Batch Size
- **W:** Worker Count

A quadratic model was chosen because it allows the representation of **non-linear performance effects**, such as diminishing returns or performance degradation caused by excessive parallelism or batch sizes.

The regression produced the following function:

\[
T(B, W) = a + bB + cW + dB² + eBW + fW²
\]

Where the coefficients were estimated from the benchmark data as:

| Coefficient | Value |
|-------------|------|
| a | 814.403197 |
| b | -59.590438 |
| c | 75.334222 |
| d | 5.241891 |
| e | 1.159864 |
| f | -12.058743 |

Substituting these coefficients into the model results in the following performance function:

T(B,W) = 814.403197 - 59.590438B + 75.334222W + 5.241891B² + 1.159864BW - 12.058743W²

This equation estimates the **expected throughput (records per second)** for any combination of batch size and worker count within the tested range.

--- 

#### 2.1. Model Fit Quality

The regression model produced an **R² (coefficient of determination) of 0.244348**.

The R² value measures how well the regression explains the variance observed in the benchmark data.

- **R² = 1** indicates a perfect fit.
- **R² = 0** indicates that the model explains none of the variation.

In this case:

\[
R² = 0.244348
\]

This indicates that approximately **24.4% of the throughput variance** is explained by the quadratic model.

The relatively low value suggests that additional factors, such as I/O variability, database contention, or runtime scheduling, also influence system performance. However, the model still provides a **useful approximation of the performance landscape**, allowing analytical exploration of optimal configurations.

--- 

#### 2.2. Model Estimation Method

The coefficients of the performance model were estimated using the script [optimize-throughput.ts](../appendix-math/scripts/optimize-throughput.ts), which performs a **quadratic regression analysis** on the benchmark results.

The script reads the benchmark dataset generated in Section 1. Each record in the dataset contains:

- **Batch Size (B)**
- **Worker Count (W)**
- **Measured Throughput (T)**

Using this data, the script fits the following quadratic model:

T(B,W) = a + bB + cW + dB² + eBW + fW²

The objective of the regression is to determine the coefficients **(a, b, c, d, e, f)** that best approximate the relationship between the system parameters and the observed throughput.

--- 

#### 2.3. Regression Procedure

The script constructs a **design matrix** where each benchmark observation contributes one row containing the explanatory variables:

[1, B, W, B², BW, W²]

For a dataset containing **n benchmark observations**, this produces the matrix **X**:

| 1 | B₁ | W₁ | B₁² | B₁W₁ | W₁² |
|---|----|----|-----|------|-----|
| 1 | B₂ | W₂ | B₂² | B₂W₂ | W₂² |
| ... | ... | ... | ... | ... | ... |
| 1 | Bₙ | Wₙ | Bₙ² | BₙWₙ | Wₙ² |

The measured throughput values form the vector **Y**:

Y = [T₁, T₂, ..., Tₙ]

The regression problem can therefore be expressed as:

Y = Xβ

where the coefficient vector is:

β = [a, b, c, d, e, f]

These coefficients represent the unknown parameters of the quadratic model.

--- 

#### 2.4. Least Squares Solution

To estimate the coefficients, the script applies the **Ordinary Least Squares (OLS)** method, which finds the coefficient vector **β** that minimizes the squared error between the predicted throughput and the observed throughput.

The optimal coefficients are computed using the matrix equation:

β = (XᵀX)⁻¹ XᵀY

This computation is implemented programmatically in [optimize-throughput.ts](../appendix-math/scripts/optimize-throughput.ts). The script performs the following steps:

1. Load the benchmark CSV file.
2. Extract the values of **B**, **W**, and **T**.
3. Construct the regression features **B²**, **BW**, and **W²**.
4. Build the design matrix **X**.
5. Apply the least squares formula to compute the coefficient vector **β**.
6. Output the resulting performance model.

The resulting coefficients define the throughput function presented in Section 2.1.

--- 

#### 2.5. Surface Visualization

To visually analyze the relationship between the system parameters and the predicted throughput, a **3-dimensional performance surface** can be generated using the regression model obtained in Section 2.

In this visualization:

- The **X-axis** represents **Batch Size (B)**  
- The **Y-axis** represents **Worker Count (W)**  
- The **Z-axis** represents the predicted **Throughput (T)** in records per second  

The surface illustrates how throughput varies as both parameters change simultaneously and provides an intuitive interpretation of the **performance landscape** used in the optimization analysis.

To generate this visualization, a script called [plot-surface.py]() is used. The script evaluates the regression function **T(B,W)** across a grid of values for **B** and **W**, computes the predicted throughput for each point, and renders a 3D surface plot.

The resulting surface plot is included below to illustrate the predicted performance behavior of the system.

<div align="center">
<sub>FIGURE 1 – 3D surface plot of the T(B, W) function.</sub><br>
  <img src="../docs/assets/throughput-surface.png" width="100%" alt="3D surface plot"><br>
  <sup>Source: Material produced by the authors, 2026.</sup>
</div>

--- 

### 3. Optimization Derivation

Using the performance model obtained in Section 2, it is possible to analytically determine the configuration that maximizes system throughput.

The regression produced the following function:

T(B,W) = 814.403197 - 59.590438B + 75.334222W + 5.241891B² + 1.159864BW - 12.058743W²

To identify the optimal configuration, the **critical points of the function** must be determined.

---

#### 3.1. Gradient Vector

The gradient of a function represents the vector of its partial derivatives.

For the throughput function T(B,W), the gradient is:

∇T(B,W) = ( ∂T/∂B , ∂T/∂W )

Computing the partial derivatives:

∂T/∂B = -59.590438 + 2(5.241891)B + 1.159864W

∂T/∂B = -59.590438 + 10.483782B + 1.159864W

∂T/∂W = 75.334222 + 1.159864B - 2(12.058743)W

∂T/∂W = 75.334222 + 1.159864B - 24.117486W

Therefore the gradient vector becomes:

∇T(B,W) = ( -59.590438 + 10.483782B + 1.159864W , 75.334222 + 1.159864B - 24.117486W )

---

#### 3.2. Critical Point Calculation

The optimal point occurs where the gradient is equal to zero.

∂T/∂B = 0  
∂T/∂W = 0

This produces the system of equations:

-59.590438 + 10.483782B + 1.159864W = 0

75.334222 + 1.159864B - 24.117486W = 0

Rearranging:

10.483782B + 1.159864W = 59.590438

1.159864B - 24.117486W = -75.334222

Solving this linear system yields the critical point is:

B* ≈ 6.49  
W* ≈ 3.43

Since batch size and worker count must be integers in practice, the configuration can be approximated as:

B ≈ 6  
W ≈ 3

---

#### 3.3. Hessian Matrix and Point Classification

To determine whether the critical point corresponds to a maximum, minimum, or saddle point, the **Hessian matrix** is evaluated. The Hessian matrix is composed of the second-order partial derivatives:

H(T) =

| ∂²T/∂B² |  ∂²T/∂B∂W |
|-----------|----------|
| ∂²T/∂W∂B |  ∂²T/∂W² |

Computing the derivatives:

∂²T/∂B² = 10.483782

∂²T/∂W² = -24.117486

∂²T/∂B∂W = 1.159864

Thus the Hessian matrix is:

H = 
| 10.483782 | 1.159864 |
|-----------|----------|
| 1.159864  | -24.117486 |

The determinant of the Hessian is:

det(H) = (10.483782)(-24.117486) - (1.159864)²

det(H) ≈ -254.5

Because the determinant of the Hessian is negative, the critical point corresponds to a saddle point rather than a strict local maximum in the continuous domain. 

This result indicates that the regression surface does not contain a single continuous maximum. Instead, the critical point represents the center of a ridge-like region where throughput values are relatively high.

In practice, the system parameters Batch Size (B) and Worker Count (W) must take integer values, meaning the optimization problem is discrete rather than continuous.

Therefore, the analytical solution identifies the region of highest predicted performance, and the optimal configuration is obtained by selecting the nearest feasible integer values.

The closest operational configuration to the critical point is:

- Batch Size (B) = 6
- Worker Count (W) = 3

This configuration lies within the high-throughput region suggested by the regression surface and therefore represents the recommended operational configuration.

--- 

### 4. Strategic Recommendation

The analytical model developed in the previous sections provides a mathematical estimate of how system throughput changes as a function of **Batch Size (B)** and **Worker Count (W)**.

By solving the optimization problem in Section 3, the critical point of the throughput function was obtained at:

- B ≈ 6.49  
- W ≈ 3.43  

Since the system configuration parameters must be integers, the recommended operational configuration is obtained by rounding to the nearest practical values.

**Recommended configuration:**

- **Batch Size (B): 6**
- **Worker Count (W): 3**

This configuration lies in the region where the performance model predicts the highest throughput values and represents a balanced trade-off between parallelism and resource consumption.

---

#### 4.1. Sensitivity Analysis

The partial derivatives of the throughput function indicate how sensitive system performance is to changes in each parameter.

From the gradient expressions:

∂T/∂B = -59.590438 + 10.483782B + 1.159864W  
∂T/∂W = 75.334222 + 1.159864B - 24.117486W  

it can be observed that the coefficients associated with **W** are larger in magnitude than those associated with **B**, particularly in the quadratic term **−24.117486W²**.

This indicates that **worker count has a stronger impact on throughput variation than batch size**. Increasing the number of workers can significantly improve throughput up to a certain point, but excessive parallelism may lead to database contention and locking, reducing performance.

Batch size, on the other hand, influences throughput more gradually. Small adjustments to **B** tend to produce smaller performance changes compared to adjustments in **W**.

Therefore, tuning **worker count** should generally be prioritized when optimizing system throughput.

---

#### 4.2. Usage Scenarios

Although the recommended configuration (**B = 6, W = 3**) provides a balanced solution for the tested environment, practical system constraints may require adjustments depending on operational priorities.

**Memory-constrained environments**

If system memory is limited, smaller batch sizes may be preferable because they reduce the number of rows held in memory during processing. In this scenario, configurations such as **B = 3 or B = 5** may improve system stability while maintaining reasonable throughput.

**Latency-sensitive processing**

In situations where rapid response time is more important than maximum throughput, smaller batch sizes can reduce processing delay per request. Using **B = 1–3** may produce faster individual processing cycles even if overall throughput decreases slightly.

**High-throughput workloads**

For large onboarding operations or periods of high system load, maintaining a worker count close to **W = 3 or W = 4** can help maximize parallel processing capacity. However, increasing the worker count beyond this range may introduce database contention and reduce performance.

---

#### 4.3. Engineering Recommendation

Based on the benchmark results, regression analysis, and optimization derivation, the following configuration is recommended as the default operational setup:

- **Batch Size (B): 6**
- **Worker Count (W): 3**

This configuration provides a balanced level of parallelism while maintaining manageable memory usage and minimizing database contention.

Future deployments may refine this configuration as additional production data becomes available, but the analytical model provides a strong initial guideline for system tuning.

---


## References

Batty, M., Axhausen, K. W., Giannotti, F., Pozdnoukhov, A., Bazzani, A., Wachowicz, M., Ouzounis, G., & Portugali, Y. (2012). Smart cities of the future. *The European Physical Journal Special Topics*, *214*(1), 481–518. https://doi.org/10.1140/epjst/e2012-01703-3

Organisation for Economic Co-operation and Development. (2020). *Digital government in Chile: Improving public service design and user experience*. OECD Publishing. https://doi.org/10.1787/b94582e8-en

United Nations. (2015). *Transforming our world: The 2030 Agenda for Sustainable Development* (General Assembly Resolution A/RES/70/1). United Nations. https://sdgs.un.org/2030agenda

United Nations Human Settlements Programme. (2022). *World cities report 2022: Envisioning the future of cities*. UN-Habitat. https://unhabitat.org/wcr2022

United Nations Statistics Division. (n.d.). *Global SDG indicators database*. United Nations Department of Economic and Social Affairs. Retrieved March 30, 2026, from https://unstats.un.org/sdgs/dataportal

World Economic Forum. (2022). *Data for the city of tomorrow: Developing the capabilities and capacity to guide better urban futures*. World Economic Forum. https://www.weforum.org/publications/data-for-the-city-of-tomorrow-developing-the-capabilities-and-capacity-to-guide-better-urban-futures/
