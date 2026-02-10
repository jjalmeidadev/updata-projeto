# Functional and Non-Functional Requirements Specification  
## ESMD5 - Digital Distributed Processing System  

#### Team Members

- <a href="https://www.linkedin.com/in/ana-cristina-jardim/">Ana Cristina Alves Jardim</a>
- <a href="https://www.linkedin.com/in/debora-pereira-nogueira/">Débora Pereira Nogueira</a>
- <a href="https://www.linkedin.com/in/jaimeandradedealmeida/">Jaime Andrade de Almeida</a>
- <a href="https://www.linkedin.com/in/leonardoramosvieira/">Leonardo Ramos Vieira</a>
- <a href="https://www.linkedin.com/in/matheusferreirads-/">Matheus Ferreira da Silva</a>
- <a href="https://www.linkedin.com/in/owen-paimba-sail-5b7ba1327/">Owen Ahmed Robert Paimba-sail</a>
- <a href="https://www.linkedin.com/in/yudi-omaki/">Yudi Nakamura Trevisani Omaki</a>

---

## Table of Contents

[1. Introduction](#c1)  
[2. Functional Requirements](#c2)  
[3. Non-Functional Requirements](#c3)  
[4. FR–NFR Correlation Matrix](#c4)  
[5. Acceptance Tests](#c5)  
[6. Terms and Abbreviations](#c6)

---

## <a name="c1"></a>1. Introduction

_Describe the purpose of this document and its role in defining system behavior and quality attributes._

---

## <a name="c2"></a>2. Functional Requirements

The following table presents the functional requirements of the system, 
describing the expected behaviors and capabilities to be implemented in order to support data submission,
validation, and user interaction in a secure and efficient manner.

| ID   | Description                                                                 | Related Tests |
|------|-----------------------------------------------------------------------------|---------------|
| RF01 | The system must allow users to upload configuration files in CSV and XLSX formats. | Test-RF01    |
| RF02 | The system must process large volumes of data asynchronously without blocking the user interface. | Test-RF02    |
| RF03 | The system must require user authentication to access upload and configuration features. | Test-RF03    |
| RF04 | The system must provide standardized file templates to guide users during data submission. | Test-RF04    |
| RF05 | The system must detect and alert users about duplicate or conflicting data records. | Test-RF05    |
| RF06 | The system must validate submitted data and display detailed warnings for invalid values. | Test-RF06    |
| RF07 | The system must identify and list mandatory fields that were not filled in by the user. | Test-RF07    |
| RF08 | The system must automatically save user progress during the data submission process. | Test-RF08    |
| RF09 | The system must allow users to preview uploaded files before final validation. | Test-RF09    |
| RF10 | The system must offer a Dark Mode option to personalize the user interface. | Test-RF10    |

The requirements listed above establish the functional scope of the system and serve as the basis for development,
testing, and validation activities, ensuring alignment between stakeholder expectations and the delivered solution.
---

## <a name="c3"></a>3. Non-Functional Requirements

| ID | Description | Related Tests |
|----|------------|---------------|
| NFR01 | The system must process large data uploads and validation tasks asynchronously without blocking the user interface, even under multiple concurrent requests. | Test-NFR01 |
| NFR02 | The system must ensure data integrity by consistently detecting duplicates, missing mandatory fields, and invalid values before allowing data export. | Test-NFR02 |
| NFR03 | The system must provide immediate feedback to users after file uploads and during processing stages to maintain a responsive and predictable user experience. | Test-NFR03 |
| NFR04 | The system must be usable by non-technical users, allowing them to complete the onboarding process intuitively without external assistance. | Test-NFR04 |
| NFR05 | The system must restrict access to onboarding and configuration features through authenticated user access. | Test-NFR05 |
| NFR06 | The system must support multiple onboarding processes in parallel without degradation in performance or validation accuracy. | Test-NFR06 |
| NFR07 | The system must provide traceability of validation and processing stages, allowing internal users to understand the status and outcome of each onboarding submission. | Test-NFR07 |

---

## <a name="c4"></a>4. FR–NFR Correlation Matrix

| FR ID | Related NFRs |
|------|-------------|
| FR01 | NFR01, NFR03, NFR06 |
| FR02 | NFR01, NFR03, NFR06 |
| FR03 | NFR05 |
| FR04 | NFR04 |
| FR05 | NFR02, NFR07 |
| FR06 | NFR02, NFR07 |
| FR07 | NFR02, NFR07 |
| FR08 | NFR04 |
| FR09 | NFR03, NFR04 |
| FR10 | NFR04 |

---

## <a name="c5"></a>5. Acceptance Tests

### Test-FR01

**Pre-condition:**  
_State the system condition before execution._

**Test Procedure:**  
_List the steps to perform the test._

**Expected Result:**  
_Describe the expected system behavior._

**Post-condition:**  
_Describe the system state after execution._

---

### Test-NFR01

**Pre-condition:**  
_Initial system conditions._

**Test Procedure:**  
_Steps to validate the quality attribute._

**Expected Result:**  
_Measured performance/behavior._

**Post-condition:**  
_Final system state._

---

## <a name="c6"></a>6. Terms and Abbreviations

| Term | Definition |
|-----|-----------|
| FR | Functional Requirement |
| NFR | Non-Functional Requirement |
| MVP | Minimum Viable Product |
| ISO 25010 | Software Quality Model |
