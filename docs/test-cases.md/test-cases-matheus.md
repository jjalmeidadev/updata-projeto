# Test Cases In-Class Activity  
## ES-T17-2026: Matheus Ferreira

**Chosen functional requirement**:  
| FR08 | Dynamic Onboarding Interface | The system must dynamically present onboarding sections based on the client’s active modules, ensuring that users only access forms and fields relevant to the selected configuration scope. |

**Objective:**

To verify that the system correctly retrieves the modules purchased by a client and dynamically displays only the onboarding sections related to those modules.

This test protects the main business rule behind FR08:  
a client must only see forms and sections that belong to the modules included in its onboarding scope.

**Business Driver:**

The main business driver for this requirement is scope accuracy during onboarding.

If the system displays sections that do not belong to the client’s purchased modules, the onboarding process becomes confusing and inefficient
So, this test is meant to protect the rule that the onboarding interface must remain aligned with the client’s actual scope.

**Precondition:**

- The client deal exists in HubSpot.
- The HubSpot API is available and returns a valid JSON response for the selected deal.
- The JSON response contains the list of active modules purchased by the client.
- The onboarding interface is configured to render sections dynamically based on the returned modules.

**Procedure:**

1. Send an HTTPS GET request to the HubSpot API for a specific client deal.
2. Receive the JSON response containing the purchased modules.
3. Map the returned modules to the corresponding onboarding sections.
4. Load the onboarding page for that client.
5. Verify which sections are displayed in the interface.
6. Compare the visible sections with the expected sections for the returned modules.

**Expected Result:**

- The system successfully retrieves the client’s active modules from HubSpot.
- The onboarding interface displays only the sections related to those modules.
- No unrelated sections are shown.
- The user can only access forms and fields within the selected configuration scope.

**Test Case Type:**

Unit test focused on a business rule.

This test does not aim to validate the full integration flow, but rather to confirm that the mapping logic between active modules** and visible onboarding sections behaves correctly.

**AAA Structure:**

**1. Arrange**
- Define a mocked HubSpot response containing a known set of active modules.
- Define the expected onboarding sections for those modules.
- Prepare the function or service responsible for mapping modules to sections.

**2. Act**
- Execute the mapping logic using the mocked HubSpot data.

**3. Assert**
- Verify that only the expected onboarding sections are returned.
- Verify that no extra sections are included.
- Verify that sections unrelated to the active modules are excluded.