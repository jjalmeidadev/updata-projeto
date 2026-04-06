import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { map, take } from 'rxjs/operators';
import { AUTH_ROLE_INTERNAL, AUTH_ROLE_STORAGE_KEY, isInternalEmail } from '../../shared/auth-constants';

export const internalUserGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const getStoredRole = (): string =>
    typeof sessionStorage !== 'undefined' ? (sessionStorage.getItem(AUTH_ROLE_STORAGE_KEY) || '').trim() : '';

  return auth.user$.pipe(
    take(1),
    map(user => {
      const email = (typeof user?.email === 'string' ? user.email : '').trim().toLowerCase();
      const resolvedRole = getStoredRole();

      if (isInternalEmail(email) || resolvedRole === AUTH_ROLE_INTERNAL) {
        return true;
      }

      return router.createUrlTree(['/onboarding-intro']);
    }),
  );
};
