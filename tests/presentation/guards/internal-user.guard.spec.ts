import { describe, expect, it, vi } from 'vitest';
import { of } from 'rxjs';

describe('internal-user.guard', () => {
  it('allows @getequiem.com users', async () => {
    vi.resetModules();

    const createUrlTree = vi.fn(() => ({ redirected: true }));
    const routerMock = { createUrlTree };
    const authMock = { user$: of({ email: 'internal@getequiem.com' }) };

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

    const { internalUserGuard } = await import('../../../src/presentation/web/src/app/guards/internal-user.guard.ts');
    const value = await new Promise<unknown>((resolve) => {
      const result$ = internalUserGuard() as any;
      result$.subscribe((v: unknown) => resolve(v));
    });

    expect(value).toBe(true);
    expect(createUrlTree).not.toHaveBeenCalled();
  });

  it('allows test admin email yudi@equiem.com', async () => {
    vi.resetModules();

    const createUrlTree = vi.fn(() => ({ redirected: true }));
    const routerMock = { createUrlTree };
    const authMock = { user$: of({ email: 'yudi@equiem.com' }) };

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

    const { internalUserGuard } = await import('../../../src/presentation/web/src/app/guards/internal-user.guard.ts');
    const value = await new Promise<unknown>((resolve) => {
      const result$ = internalUserGuard() as any;
      result$.subscribe((v: unknown) => resolve(v));
    });

    expect(value).toBe(true);
    expect(createUrlTree).not.toHaveBeenCalled();
  });

  it('redirects other emails to onboarding-intro', async () => {
    vi.resetModules();

    const redirectedTree = { redirected: true };
    const createUrlTree = vi.fn(() => redirectedTree);
    const routerMock = { createUrlTree };
    const authMock = { user$: of({ email: 'external@client.com' }) };

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

    const { internalUserGuard } = await import('../../../src/presentation/web/src/app/guards/internal-user.guard.ts');
    const value = await new Promise<unknown>((resolve) => {
      const result$ = internalUserGuard() as any;
      result$.subscribe((v: unknown) => resolve(v));
    });

    expect(createUrlTree).toHaveBeenCalledWith(['/onboarding-intro']);
    expect(value).toBe(redirectedTree);
  });
});
