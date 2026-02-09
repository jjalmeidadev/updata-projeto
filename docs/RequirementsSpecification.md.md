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

---

## <a name="c3"></a>3. Non-Functional Requirements

_NFRs must align with ISO 25010 quality attributes._

| ID | Description | ISO 25010 Attribute | Related Tests |
|----|------------|--------------------|---------------|
| NFR01 | The system must ... | Performance Efficiency |
| NFR02 | The system must ... | Reliability |
| NFR03 | The system must ... | Security |

---

## <a name="c4"></a>4. FR–NFR Correlation Matrix

_Map which NFRs directly impact each Functional Requirement._

| FR ID | Related NFRs |
|------|-------------|
| FR01 | NFR01, NFR02 |
| FR02 | NFR03 |

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
