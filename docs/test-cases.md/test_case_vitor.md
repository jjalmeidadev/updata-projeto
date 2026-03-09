# Test Case – FR05: Re-submit Data

## Requirement Reference
FR05 – Re-submit data

## Objective
Verify that the system correctly replaces records when a user re-submits a corrected dataset and the natural identifiers match existing records.

## Precondition
- A dataset has already been uploaded to the system.
- The dataset contains records with validation errors.
- The user has permission to upload and re-submit datasets.

## Test Procedure
1. Upload an initial dataset containing records with validation errors.
2. Wait for the system to process the dataset and report the errors.
3. Correct the identified errors in the dataset file.
4. Re-submit the corrected dataset to the system.
5. Observe how the system processes the new upload and updates the records.

## Expected Result
The system replaces only the records whose natural identifiers match existing records from the previous dataset submission. The corrected information should overwrite the previous erroneous records, while all other records remain unchanged.

## Obtained Result
The system successfully replaced the records with matching natural identifiers and stored the corrected dataset in the database.

## Post-condition
The updated dataset is stored in the system, and the corrected records replace the previous erroneous records while maintaining the integrity of the remaining data.