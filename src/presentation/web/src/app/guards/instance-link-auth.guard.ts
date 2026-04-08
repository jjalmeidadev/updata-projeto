import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '@auth0/auth0-angular';
import { of } from 'rxjs';
import { catchError, map, switchMap, take } from 'rxjs/operators';

const LINK_TARGET_KEY = 'post_login_link_target';
const LINK_FORCE_ACCOUNT_SELECTION_KEY = 'post_login_force_account_selection';

function setStoredLinkTarget(target: string): void {
  const storage = (globalThis as { sessionStorage?: Storage }).sessionStorage;
  if (!storage) {
    return;
  }

  storage.setItem(LINK_TARGET_KEY, target);
}

function setForceAccountSelection(value: boolean): void {
  const storage = (globalThis as { sessionStorage?: Storage }).sessionStorage;

  if (!storage) {
    return;
  }

  if (value) {
    storage.setItem(LINK_FORCE_ACCOUNT_SELECTION_KEY, 'true');
    return;
  }

  storage.removeItem(LINK_FORCE_ACCOUNT_SELECTION_KEY);
}

function extractLinkToken(route: { paramMap?: { get: (key: string) => string | null } }, url: string): string {
  const fromParams = route.paramMap?.get('linkToken');

  if (fromParams) {
    return fromParams;
  }

  const match = url.match(/^\/onboarding\/([A-Za-z0-9_-]+)/);
  return match?.[1] ?? '';
}

function readApiErrorMessage(error: unknown): string {
  const body =
    error instanceof HttpErrorResponse
      ? error.error
      : error && typeof error === 'object' && 'error' in error
        ? (error as { error?: unknown }).error
        : undefined;

  if (body && typeof body === 'object' && 'error' in body && typeof body.error === 'string') {
    return body.error;
  }

  if (typeof body === 'string' && body.trim().length > 0) {
    return body;
  }

  return 'Failed to validate onboarding link access.';
}

function readApiStatus(error: unknown): number | undefined {
  if (error instanceof HttpErrorResponse) {
    return error.status;
  }

  if (error && typeof error === 'object' && 'status' in error) {
    const status = (error as { status?: unknown }).status;
    return typeof status === 'number' ? status : undefined;
  }

  return undefined;
}

export const instanceLinkAuthGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const http = inject(HttpClient);

  return auth.isAuthenticated$.pipe(
    take(1),
    switchMap(isAuthenticated => {
      if (isAuthenticated) {
        const target = state.url || '/login';
        const linkToken = extractLinkToken(route as { paramMap?: { get: (key: string) => string | null } }, target);

        if (!linkToken) {
          return of(router.createUrlTree(['/onboarding-intro']));
        }

        return http.get(`/api/public/onboarding/${linkToken}`).pipe(
          map(() => true),
          catchError((error: unknown) => {
            const status = readApiStatus(error);

            if (status === 401 || status === 403) {
              setStoredLinkTarget(target);
              setForceAccountSelection(true);
              const alertFn = (globalThis as { alert?: (message: string) => void }).alert;

              if (typeof alertFn === 'function') {
                alertFn(`You do not have permission to access this onboarding.\n\n${readApiErrorMessage(error)}`);
              }

              auth.loginWithRedirect({
                appState: { target },
                authorizationParams: {
                  audience: 'https://api.updata.com',
                  scope: 'openid profile email',
                  prompt: 'select_account',
                },
              });

              return of(router.createUrlTree(['/login']));
            }

            return of(router.createUrlTree(['/onboarding-intro']));
          })
        );
      }

      const target = state.url || '/login';
      setStoredLinkTarget(target);

      auth.loginWithRedirect({
        appState: { target },
        authorizationParams: {
          audience: 'https://api.updata.com',
          scope: 'openid profile email',
        },
      });

      return of(router.createUrlTree(['/login']));
    }),
  );
};
