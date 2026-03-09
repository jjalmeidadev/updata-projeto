# Test Case - 01

Related to FR04 - Data Validation and Conflict Detection.

- **Objective:** verify if the system performs the correct data validation when a user types an incorrect data type on a field.

- **Precondition:** the user must be already logged in and filling a onboarding form using our interface. 

- **Test Procedure:** the user rights on the field “capacity of the amenity room”, that requires an int, a string like “cat”.

- **Expected Result:** the system must return a visual error to the user, explaining that the field requires an int, not an string. The expected error is: “Error: this field requires a number!”

- **Obtained Result:** the system returned a visual error below the field, saying: “Error: this field requires a number!”.

- **Post-Condition:** the system logged that the field was filled incorrectly by the user.