# Project and Business Understanding  
## ESMD5 - Digital Distributed Processing System  
### Partner: Equiem  

#### Team Members

---

## Table of Contents

[1. Problem Statement](#c1)  
[2. Partner Industry Context](#c2)  
[3. Product Vision](#c3)  
[4. Scope Definition](#c4)  
[5. Product Goal](#c5)  
[6. Personas and User Journey](#c6)  
[7. Business Flow](#c7)  
[8. Feature Brainstorming](#c8)  
[9. Delivery Sequencing and Prioritization](#c9)  
[10. MVP Canvas](#c10)  
[11. Project Risk Matrix](#c11)

---

## <a name="c1"></a>1. Problem Statement

_Describe the core problem addressed by the project, highlighting inefficiencies, operational pain points, and their impact on the partner’s business._

---

## <a name="c2"></a>2. Partner Industry Context

_Present background information on the partner’s industry, including:_

- _Market characteristics_  
- _Main challenges_  
- _Trends and opportunities_  
- _Operational context related to onboarding and data processing_

---

## <a name="c3"></a>3. Product Vision

_Define a high-level vision describing what the product aims to achieve and the value it delivers to users and the partner._

---

## <a name="c4"></a>4. Scope Definition

### 4.1 What the Product Does

_List the main capabilities included in the MVP, focusing on core onboarding, data processing, validation, and integrations._

### 4.2 What the Product Does Not Do

_Explicitly state excluded functionalities, such as production integrations, advanced security layers, and enterprise-scale features._

---

## <a name="c5"></a>5. Product Goal

_Define a clear and measurable objective aligned with business efficiency, scalability, and user experience improvement._

---

## <a name="c6"></a>6. Personas and User Journey

### 6.1 Personas

The following personas were developed to represent the stakeholders involved in the Equiem onboarding ecosystem. Their relevance as instruments for scope definition and requirements engineering is supported by the study “Who Uses Personas in Requirements Engineering: The Practitioners' Perspective (2024)”, which highlights how realistic user representations improve alignment between technical and real operational needs.

These personas translate the complexity of the onboarding process into two complementary perspectives:

- the internal operational view, represented by the Equiem Data Analyst responsible for validating and structuring customer data;

- and the external customer view, represented by a client Project Manager who must provide information through the platform.

Understanding their contexts allows the solution to be designed around clearer expectations of efficiency, usability, and reliability, rather than purely technical assumptions:

<div align="center">
<sub>FIGURE 1 – Persona 1 - Alex Morgan (Data Analyst – Equiem)</sub><br>
  <img src="assets/images/persona1.png" width="100%" alt="Persona 1 - Alex Morgan (Data Analyst – Equiem)">
  <sup>Source: Material produced by the authors, 2026.</sup>
</div>

<div align="center">
<sub>FIGURE 2 – Persona 2 - Sophie Bennett (Client's Project Manager)</sub><br>
  <img src="assets/images/persona2.png" width="100%" alt="Persona 2 - Sophie Bennett (Client's Project Manager)">
  <sup>Source: Material produced by the authors, 2026.</sup>
</div>

Alex Morgan (Data Analyst – Equiem) and Sophie Bennett (Client's Project Manager) represent the two sides of the onboarding workflow. Alex operates inside Equiem, focused on data quality, validation, and preparation for production. His main concerns are structure, automation, and auditability. Sophie, on the other hand, acts as the bridge between her organization and Equiem, seeking clarity, simplicity, and guidance while coordinating multiple internal contributors.

Their complementary needs reinforce the project's objective: a platform capable of reducing conflicts for customers while increasing scalability and agility for Equiem.

### 6.2 User Journey

The user journeys below illustrate the interaction flows that each persona will experience when using the onboarding system. They were designed to map actions, thoughts, and emotions across the main stages of the process from initial data submission to final provisioning.

By analyzing these journeys, it becomes possible to identify pain points, opportunities for automation, and moments where the platform delivers clear value to both Equiem and its customers:

<div align="center">
<sub>FIGURE 3 – User Journey 1 - Alex Morgan (Data Analyst – Equiem)</sub><br>
  <img src="assets/images/journey1.png" width="100%" alt="User Journey 1 - Alex Morgan (Data Analyst – Equiem)">
  <sup>Source: Material produced by the authors, 2026.</sup>
</div>

Alex’s journey centers on data and operational efficiency.
He begins receiving files through the portal and trusting the pipeline to handle large uploads without blocking his workflow.

The emotional peak occurs during the validation stage, when the system automatically detects duplicates and format issues that would previously require hours of manual Excel work. This represents the main value creation moment of the platform.

The journey ends positively with the generation of a clean CSV package after receiving the corrected informations from the client, giving Alex confidence in the coherence of the data.

<div align="center">
<sub>FIGURE 4 – User Journey 2 - Sophie Bennett (Client's Project Manager)</sub><br>
  <img src="assets/images/journey2.png" width="100%" alt="User Journey 2 - Sophie Bennett (Client's Project Manager)">
  <sup>Source: Material produced by the authors, 2026.</sup>
</div>

Sophie’s journey reflects the perspective of a non-technical customer responsible for coordination.
She starts with uncertainty, hoping the new platform will bring a faster exchange than previous long questionnaires. 

Then Sophie assigns correction sections to colleagues, which transforms onboarding from an individual activity into a collaborative task. Anxiety reappears during data upload, but immediate feedback reassures her before submission.

The journey concludes with confidence, as she submits the final package knowing that Equiem received structured and correct information given the platforms and analysts validation.
<br>
<br>
Alex and Sophie’s journeys represent the entirety of the Equiem onboarding process, from customer data entry to internal revision. Their interaction validates the needs for a distributed architecture and a collaborative space.

By addressing their distinct but connected expectations, the project establishes a user-centered approach capable of improving data integrity, insertion and customer experience.

---

## <a name="c7"></a>7. Business Flow

_Model the business process related to onboarding using BPMN or equivalent notation._

_Explain each step and its relationship to the system._

---

## <a name="c8"></a>8. Feature Brainstorming

_List all potential features identified during Lean Inception sessions._

_Group features by themes if necessary (intake, processing, validation, integrations, monitoring)._

---

## <a name="c9"></a>9. Delivery Sequencing and Prioritization

_Explain how features were prioritized and ordered for development._

_Describe prioritization criteria such as business value, technical dependency, and MVP relevance._

---

## <a name="c10"></a>10. MVP Canvas

_Present the MVP Canvas, including:_

- _Value proposition_  
- _Customer segments_  
- _Key activities_  
- _Success metrics_

---

## <a name="c11"></a>11. Project Risk Matrix

_Present the risk matrix with:_

- _Identified risks_  
- _Probability_  
- _Impact_  
- _Mitigation and conting_