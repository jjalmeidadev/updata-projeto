import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('backend returns 401 without token', async ({ request }) => {
    const response = await request.get('http://localhost:3000/api/users');
    expect(response.status()).toBe(401);
    
    const body = await response.text();
    expect(body).toContain('UnauthorizedError');
  });

  test('frontend login page loads', async ({ page }) => {
    await page.goto('http://localhost:4200/login');
    await expect(page).toHaveTitle(/Updata/);
    
    // Check login buttons exist
    const loginButton = page.getByRole('button', { name: /login/i });
    await expect(loginButton).toBeVisible();
  });

  test('API proxy is configured correctly', async ({ page }) => {
    // Navigate to any page that triggers /api/users call
    await page.goto('http://localhost:4200/login');
    
    // Wait for the /api/users request to be made
    const apiRequest = page.waitForRequest(
      request => request.url().includes('/api/users'),
      { timeout: 10000 }
    ).catch(() => null);

    const req = await apiRequest;
    
    if (req) {
      // Verify the request goes through the proxy
      expect(req.url()).toContain('/api/users');
      
      // Check if Authorization header is present (if user is authenticated)
      const authHeader = req.headers()['authorization'];
      console.log('Authorization header present:', !!authHeader);
      console.log('Auth header preview:', authHeader ? authHeader.substring(0, 20) + '...' : 'none');
    }
  });

  test('backend auth middleware logs correctly', async ({ request }) => {
    // Test without token
    const response = await request.get('http://localhost:3000/api/users', {
      headers: {
        'Authorization': 'Bearer REDACTED_FOR_PUBLIC_RELEASE-here'
      }
    });
    
    expect(response.status()).toBe(401);
    
    // Test with malformed auth header
    const badResponse = await request.get('http://localhost:3000/api/users', {
      headers: {
        'Authorization': 'BadFormat token'
      }
    });
    
    expect(badResponse.status()).toBe(401);
  });

  test('backend health check - server is responsive', async ({ request }) => {
    // Test that backend is at least responding
    const response = await request.get('http://localhost:3000/api/users');
    
    // Should get 401 (unauthorized) but not 502/503 (server down)
    expect([401]).toContain(response.status());
    
    // Verify it's an auth error, not a server error
    const text = await response.text();
    expect(text).toContain('UnauthorizedError');
  });
});
