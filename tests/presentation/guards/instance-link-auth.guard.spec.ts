import { describe, expect, it, vi } from 'vitest';
import { of } from 'rxjs';

describe('instance-link-auth.guard', () => {
  it('allows authenticated users', async () => {
    vi.resetModules();

    const loginWithRedirect = vi.fn();
    const createUrlTree = vi.fn(() => ({ redirected: true }));
    const authMock = {
      isAuthenticated$: of(true),
      loginWithRedirect,
    };
    const routerMock = { createUrlTree };

    vi.doMock('@angular/core', () => ({
      inject: (token: unknown) => {
        const key = String(token);
        if (key.includes('AuthService')) return authMock;
        if (key.includes('Router')) return routerMock;
        return undefined;
      },
    }));

    vi.doMock('@auth0/auth0-angular', () => ({ AuthService: class AuthService {} }));
    vi.doMock('@angular/router', () => ({ Router: class Router {} }));

    const { instanceLinkAuthGuard } = await import('../../../src/presentation/web/src/app/guards/instance-link-auth.guard.ts');

    const value = await new Promise<unknown>((resolve) => {
      const result$ = instanceLinkAuthGuard({} as any, { url: '/onboarding/token-x' } as any) as any;
      result$.subscribe((v: unknown) => resolve(v));
    });

    expect(value).toBe(true);
    expect(loginWithRedirect).not.toHaveBeenCalled();
  });

  it('stores link target and prompts login for unauthenticated users', async () => {
    vi.resetModules();

    const storage = new Map<string, string>();
    Object.defineProperty(globalThis, 'sessionStorage', {
      value: {
        setItem: (k: string, v: string) => storage.set(k, v),
        getItem: (k: string) => storage.get(k) ?? null,
      },
      configurable: true,
    });

    const redirectedTree = { redirected: true };
    const loginWithRedirect = vi.fn();
    const createUrlTree = vi.fn(() => redirectedTree);
    const authMock = {
      isAuthenticated$: of(false),
      loginWithRedirect,
    };
    const routerMock = { createUrlTree };

    vi.doMock('@angular/core', () => ({
      inject: (token: unknown) => {
        const key = String(token);
        if (key.includes('AuthService')) return authMock;
        if (key.includes('Router')) return routerMock;
        return undefined;
      },
    }));

    vi.doMock('@auth0/auth0-angular', () => ({ AuthService: class AuthService {} }));
    vi.doMock('@angular/router', () => ({ Router: class Router {} }));

    const { instanceLinkAuthGuard } = await import('../../../src/presentation/web/src/app/guards/instance-link-auth.guard.ts');

    const value = await new Promise<unknown>((resolve) => {
      const result$ = instanceLinkAuthGuard({} as any, { url: '/onboarding/token-y/upload' } as any) as any;
      result$.subscribe((v: unknown) => resolve(v));
    });

    expect(storage.get('post_login_link_target')).toBe('/onboarding/token-y/upload');
    expect(loginWithRedirect).toHaveBeenCalledWith({
      appState: { target: '/onboarding/token-y/upload' },
      authorizationParams: {
        audience: 'https://api.updata.com',
        scope: 'openid profile email',
      },
    });
    expect(createUrlTree).toHaveBeenCalledWith(['/login']);
    expect(value).toBe(redirectedTree);
  });
});
