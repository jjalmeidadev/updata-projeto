import { describe, expect, it, vi } from 'vitest';

describe('app.config', () => {
  it('builds providers including Auth0, router and http interceptors', async () => {
    vi.resetModules();

    Object.defineProperty(globalThis, 'window', {
      value: {
        location: { origin: 'http://localhost:4200' },
      },
      configurable: true,
    });

    const provideBrowserGlobalErrorListeners = vi.fn(() => 'errors');
    const provideRouter = vi.fn(() => 'router');
    const withInterceptors = vi.fn((list: unknown[]) => ({ list }));
    const provideHttpClient = vi.fn(() => 'http');
    const provideAuth0 = vi.fn(() => 'auth0');
    const authHttpInterceptorFn = vi.fn();

    vi.doMock('@angular/core', () => ({ provideBrowserGlobalErrorListeners }));
    vi.doMock('@angular/router', () => ({ provideRouter }));
    vi.doMock('@angular/common/http', () => ({ provideHttpClient, withInterceptors }));
    vi.doMock('@auth0/auth0-angular', () => ({ provideAuth0, authHttpInterceptorFn }));
    vi.doMock('../../../src/presentation/web/src/app/app.routes', () => ({ routes: [{ path: 'login' }] }));

    const { appConfig } = await import('../../../src/presentation/web/src/app/app.config.ts');

    expect(provideBrowserGlobalErrorListeners).toHaveBeenCalled();
    expect(provideRouter).toHaveBeenCalledWith([{ path: 'login' }]);
    expect(withInterceptors).toHaveBeenCalledWith([authHttpInterceptorFn]);
    expect(provideHttpClient).toHaveBeenCalled();
    expect(provideAuth0).toHaveBeenCalledWith(
      expect.objectContaining({
        domain: 'dev-6imaiajbfe843lz7.us.auth0.com',
        authorizationParams: expect.objectContaining({
          redirect_uri: 'http://localhost:4200/login',
        }),
      }),
    );
    expect(Array.isArray(appConfig.providers)).toBe(true);
  });
});
