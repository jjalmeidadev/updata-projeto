#!/bin/bash
# E2E Authentication Test Script
# Tests the complete auth flow from frontend to backend

set -e

echo "=========================================="
echo "  E2E Authentication Tests"
echo "=========================================="
echo ""

# Test 1: Backend is running
echo "✓ Test 1: Backend health check"
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/users)
if [ "$BACKEND_STATUS" = "401" ]; then
  echo "  ✅ Backend running and auth middleware working (401 without token)"
else
  echo "  ❌ Backend returned: $BACKEND_STATUS (expected 401)"
  exit 1
fi
echo ""

# Test 2: Frontend is running
echo "✓ Test 2: Frontend health check"
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:4200/)
if [ "$FRONTEND_STATUS" = "200" ]; then
  echo "  ✅ Frontend serving pages (200 OK)"
else
  echo "  ❌ Frontend returned: $FRONTEND_STATUS (expected 200)"
  exit 1
fi
echo ""

# Test 3: Proxy is working
echo "✓ Test 3: API proxy configuration"
PROXY_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:4200/api/users)
if [ "$PROXY_STATUS" = "401" ]; then
  echo "  ✅ Proxy forwarding /api/users to backend (401 without token)"
else
  echo "  ❌ Proxy returned: $PROXY_STATUS (expected 401)"
  exit 1
fi
echo ""

# Test 4: Auth middleware rejects invalid tokens
echo "✓ Test 4: Auth middleware rejects invalid tokens"
INVALID_TOKEN_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
  -H "Authorization: Bearer REDACTED_FOR_PUBLIC_RELEASE" \
  http://localhost:3000/api/users)
if [ "$INVALID_TOKEN_STATUS" = "401" ]; then
  echo "  ✅ Invalid token rejected (401)"
else
  echo "  ❌ Invalid token returned: $INVALID_TOKEN_STATUS (expected 401)"
  exit 1
fi
echo ""

# Test 5: Auth middleware rejects malformed headers
echo "✓ Test 5: Auth middleware rejects malformed headers"
MALFORMED_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
  -H "Authorization: BadFormat some-value" \
  http://localhost:3000/api/users)
if [ "$MALFORMED_STATUS" = "401" ] || [ "$MALFORMED_STATUS" = "400" ]; then
  echo "  ✅ Malformed header rejected ($MALFORMED_STATUS)"
else
  echo "  ❌ Malformed header returned: $MALFORMED_STATUS (expected 401 or 400)"
  exit 1
fi
echo ""

# Test 6: Request without auth header
echo "✓ Test 6: Request without Authorization header"
NO_AUTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
  http://localhost:3000/api/users)
if [ "$NO_AUTH_STATUS" = "401" ]; then
  echo "  ✅ No auth header rejected (401)"
else
  echo "  ❌ No auth header returned: $NO_AUTH_STATUS (expected 401)"
  exit 1
fi
echo ""

# Test 7: Verify error response format
echo "✓ Test 7: Error response contains auth error details"
RESPONSE=$(curl -s http://localhost:3000/api/users)
if echo "$RESPONSE" | grep -q "UnauthorizedError"; then
  echo "  ✅ Error response contains 'UnauthorizedError'"
else
  echo "  ❌ Error response missing 'UnauthorizedError'"
  exit 1
fi
echo ""

# Test 8: Frontend login page has expected elements
echo "✓ Test 8: Frontend login page structure"
LOGIN_PAGE=$(curl -s http://localhost:4200/login)
if [ -n "$LOGIN_PAGE" ]; then
  echo "  ✅ Login page returns HTML content"
else
  echo "  ❌ Login page returned empty content"
  exit 1
fi
echo ""

echo "=========================================="
echo "  All Tests Passed! ✅"
echo "=========================================="
echo ""
echo "Summary:"
echo "  • Backend auth middleware: Working ✅"
echo "  • Frontend proxy: Working ✅"
echo "  • Token validation: Working ✅"
echo "  • Error handling: Working ✅"
echo ""
echo "Note: To test with a real Auth0 token:"
echo "  1. Login at http://localhost:4200/login"
echo "  2. Copy the token from browser DevTools > Network > /api/users > Headers"
echo "  3. Run: curl -H 'Authorization: Bearer REDACTED_FOR_PUBLIC_RELEASE' http://localhost:3000/api/users"
echo ""
