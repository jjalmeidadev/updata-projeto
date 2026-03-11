# FR 02 Test Case (Data Standardization)

### Objective
Verify if the system correctly standardizes submitted onboarding data into the predefined internal data type and format before validation or consolidation occurs.

### Precondition
The user must be already logged in and filling out the onboarding form using the system interface.

### Test Procedure
the user fills a date field in the onboarding form (for example, “amenity availability date”) using a non-standard format such as 03/11/2026. The user then submits it.

### Expected Result
The system must transform the submitted date into the predefined internal format following, for exemple, the ISO 8601 standard (YYYY-MM-DD), converting 03/11/2026 into 2026-03-11 before validation or consolidation occurs.

### Obtained Result
The system successfully converted the submitted value into the internal standardized format 2026-03-11 according to ISO 8601, and the onboarding process continued without validation errors.

### Post-Condition
The standardized value (2026-03-11) was stored in the database, and the transformation was recorded in the system logs.