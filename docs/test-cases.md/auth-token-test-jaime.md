# Test case: Certify token's presence - Authentication FR

Objective:
Validate token.

Precondition:
Auth0 sent token through /api/users route within angular environment.

Procedure:
Send HTTP GET request (in the intention of checking if user exists or not within backend logic) without header.

Expected result:
API returns 401 status and decryption middleware isn't activated (given that the token wasn't sent).

Post Condition: 
Server rejected the request, protecting the endpoint from unauthenticated access.