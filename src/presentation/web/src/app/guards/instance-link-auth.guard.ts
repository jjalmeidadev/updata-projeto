import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { map, take } from 'rxjs/operators';

const LINK_TARGET_KEY = 'post_login_link_target';

function setStoredLinkTarget(target: string): void {
  const storage = (globalThis as { sessionStorage?: Storage }).sessionStorage;
  if (!storage) {
    return;
  }

  storage.setItem(LINK_TARGET_KEY, target);
}

export const instanceLinkAuthGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.isAuthenticated$.pipe(
    take(1),
    map(isAuthenticated => {
      if (isAuthenticated) {
        return true;
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

      return router.createUrlTree(['/login']);
    }),
  );
};
