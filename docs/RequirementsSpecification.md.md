# Functional and Non-Functional Requirements Specification  
## ESMD5 - Digital Distributed Processing System  

#### Team Members

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

_Each requirement must follow the defined format and be uniquely identified._

| ID | Description | Related Tests |
|----|------------|---------------|
| FR01 | The system must ... | Test-FR01 |
| FR02 | The user must be able to ... | Test-FR02 |

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
