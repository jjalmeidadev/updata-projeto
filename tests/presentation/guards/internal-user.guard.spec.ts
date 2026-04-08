import { of } from 'rxjs';
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('internal-user.guard', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();

    if (!(globalThis as { sessionStorage?: Storage }).sessionStorage) {
      const store = new Map<string, string>();
      (globalThis as { sessionStorage?: Storage }).sessionStorage = {
        getItem: (key: string) => store.get(key) ?? null,
        setItem: (key: string, value: string) => {
          store.set(key, value);
        },
        removeItem: (key: string) => {
          store.delete(key);
        },
        clear: () => {
          store.clear();
        },
        key: (index: number) => Array.from(store.keys())[index] ?? null,
        get length() {
          return store.size;
        },
      } as Storage;
    }

    (globalThis as { sessionStorage?: Storage }).sessionStorage?.clear();
  });

  it('allows Equiem domain email', async () => {
    const createUrlTree = vi.fn(() => ({ redirected: true }));
    const routerMock = { createUrlTree };
    const authMock = { user$: of({ email: 'jaime.almeida@getequiem.com' }) };

    vi.doMock('@auth0/auth0-angular', () => ({
      AuthService: class AuthService {},
    }));

    vi.doMock('@angular/router', async () => {
      const actual = await vi.importActual<typeof import('@angular/router')>('@angular/router');
      return {
        ...actual,
        Router: class Router {},
      };
    });

    vi.doMock('@angular/core', async () => {
      const actual = await vi.importActual<typeof import('@angular/core')>('@angular/core');
      return {
        ...actual,
        inject: (token: unknown) => {
          if ((token as { name?: string })?.name === 'AuthService') return authMock;
          if ((token as { name?: string })?.name === 'Router') return routerMock;
          return null;
        },
      };
    });

    const { internalUserGuard } = await import('../../../src/presentation/web/src/app/guards/internal-user.guard');

    const value = await new Promise<unknown>((resolve) => {
      const result$ = internalUserGuard({} as any, { url: '/review' } as any) as any;
      result$.subscribe((v: unknown) => resolve(v));
    });

    expect(value).toBe(true);
    expect(createUrlTree).not.toHaveBeenCalled();
  });

  it('allows internal test email', async () => {
    const createUrlTree = vi.fn(() => ({ redirected: true }));
    const routerMock = { createUrlTree };
    const authMock = { user$: of({ email: 'yudi@equiem.com' }) };

    vi.doMock('@auth0/auth0-angular', () => ({
      AuthService: class AuthService {},
    }));

    vi.doMock('@angular/router', async () => {
      const actual = await vi.importActual<typeof import('@angular/router')>('@angular/router');
      return {
        ...actual,
        Router: class Router {},
      };
    });

    vi.doMock('@angular/core', async () => {
      const actual = await vi.importActual<typeof import('@angular/core')>('@angular/core');
      return {
        ...actual,
        inject: (token: unknown) => {
          if ((token as { name?: string })?.name === 'AuthService') return authMock;
          if ((token as { name?: string })?.name === 'Router') return routerMock;
          return null;
        },
      };
    });

    const { internalUserGuard } = await import('../../../src/presentation/web/src/app/guards/internal-user.guard');

    const value = await new Promise<unknown>((resolve) => {
      const result$ = internalUserGuard({} as any, { url: '/review' } as any) as any;
      result$.subscribe((v: unknown) => resolve(v));
    });

    expect(value).toBe(true);
    expect(createUrlTree).not.toHaveBeenCalled();
  });

  it('allows stored internal role', async () => {
    sessionStorage.setItem('resolved_auth_role', 'internal');

    const createUrlTree = vi.fn(() => ({ redirected: true }));
    const routerMock = { createUrlTree };
    const authMock = { user$: of({ email: 'external@gmail.com' }) };

    vi.doMock('@auth0/auth0-angular', () => ({
      AuthService: class AuthService {},
    }));

    vi.doMock('@angular/router', async () => {
      const actual = await vi.importActual<typeof import('@angular/router')>('@angular/router');
      return {
        ...actual,
        Router: class Router {},
      };
    });

    vi.doMock('@angular/core', async () => {
      const actual = await vi.importActual<typeof import('@angular/core')>('@angular/core');
      return {
        ...actual,
        inject: (token: unknown) => {
          if ((token as { name?: string })?.name === 'AuthService') return authMock;
          if ((token as { name?: string })?.name === 'Router') return routerMock;
          return null;
        },
      };
    });

    const { internalUserGuard } = await import('../../../src/presentation/web/src/app/guards/internal-user.guard');

    const value = await new Promise<unknown>((resolve) => {
      const result$ = internalUserGuard({} as any, { url: '/review' } as any) as any;
      result$.subscribe((v: unknown) => resolve(v));
    });

    expect(value).toBe(true);
    expect(createUrlTree).not.toHaveBeenCalled();
  });

  it('redirects external user to login', async () => {
    const redirectedTree = { redirected: true };
    const createUrlTree = vi.fn(() => redirectedTree);
    const routerMock = { createUrlTree };
    const authMock = { user$: of({ email: 'external@gmail.com' }) };

    vi.doMock('@auth0/auth0-angular', () => ({
      AuthService: class AuthService {},
    }));

    vi.doMock('@angular/router', async () => {
      const actual = await vi.importActual<typeof import('@angular/router')>('@angular/router');
      return {
        ...actual,
        Router: class Router {},
      };
    });

    vi.doMock('@angular/core', async () => {
      const actual = await vi.importActual<typeof import('@angular/core')>('@angular/core');
      return {
        ...actual,
        inject: (token: unknown) => {
          if ((token as { name?: string })?.name === 'AuthService') return authMock;
          if ((token as { name?: string })?.name === 'Router') return routerMock;
          return null;
        },
      };
    });

    const { internalUserGuard } = await import('../../../src/presentation/web/src/app/guards/internal-user.guard');

    const value = await new Promise<unknown>((resolve) => {
      const result$ = internalUserGuard({} as any, { url: '/review' } as any) as any;
      result$.subscribe((v: unknown) => resolve(v));
    });

    expect(value).toEqual(redirectedTree);
    expect(createUrlTree).toHaveBeenCalledWith(['/login']);
  });
});