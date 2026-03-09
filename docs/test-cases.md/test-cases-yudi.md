# Test Case: FR04 - Data Validation

## Introduction 
The objective of this activity is to demonstrate the practical application of Quality Assurance (QA).
A Test Case is a set of conditions or variables under which a tester determines whether a system satisfies requirements or functions correctly.

## Objective
To verify that the system correctly identifies missing mandatory fields and invalid data types within a submitted CSV file, specifically validating the requirements defined in **RF04 (Validate Data)**. This ensures that only clean, standardized data proceeds to consolidation and integration.

## Precondition
- The user must be authenticated as Office manager or Onboarding Specialist.
- An Onboarding process must be active to the user

## Procedure
1.  Log in to the onboarding platform.
2. Go to the "Data Upload" section.
3.  Select a CSV file for upload that:
* Has one row with a missing "Building Name".
* Has one row with a string value in the "Capacity" field (Data Type violation).
4.  Click the "Submit" button.
5.  Observe the processing status and the error feedback.

## Expected Result

* The system must change the section status to "Failed" or "Warning".
* A detailed error report must be generated, highlighting the specific rows and fields that failed validation.
* Invalid records must be blocked from moving to the final phase.