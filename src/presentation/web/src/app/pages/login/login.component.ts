import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import type { User } from '@auth0/auth0-angular';
import { filter, map, take } from 'rxjs/operators';
import { AUTH_ROLE_EXTERNAL, AUTH_ROLE_INTERNAL, AUTH_ROLE_STORAGE_KEY, isInternalEmail } from '../../../shared/auth-constants';

type UserFlowResponse = { next: string };
const LINK_TARGET_KEY = 'post_login_link_target';
const LINK_FORCE_ACCOUNT_SELECTION_KEY = 'post_login_force_account_selection';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly authRequestDefaults = {
    audience: 'https://api.updata.com',
    scope: 'openid profile email',
  };

  ngOnInit(): void {
    // Resolve backend user flow whenever Auth0 session is available on the login route.
    // This avoids missing first-time user creation if callback params were already consumed.
    this.auth.isAuthenticated$
      .pipe(filter(Boolean), take(1))
      .subscribe(() => {
        const storedTarget = sessionStorage.getItem(LINK_TARGET_KEY) || '';
        const shouldForceAccountSelection =
          (sessionStorage.getItem(LINK_FORCE_ACCOUNT_SELECTION_KEY) || '').trim() === 'true';

        if (shouldForceAccountSelection) {
          sessionStorage.removeItem(LINK_FORCE_ACCOUNT_SELECTION_KEY);

          this.auth.loginWithRedirect({
            appState: { target: storedTarget || '/login' },
            authorizationParams: {
              ...this.authRequestDefaults,
              prompt: 'select_account',
            },
          });

          return;
        }

        if (this.isOnboardingLinkRoute(storedTarget)) {
          this.syncUserProfileAndNavigateToLink(storedTarget);
          return;
        }

        let resolved = false;
        const fallback = setTimeout(() => {
          if (!resolved) {
            resolved = true;
            this.resolveUserFlow();
          }
        }, 1500);

        this.auth.user$
          .pipe(
            map((profile: User | null | undefined) => ({
              name: (profile?.name || '').trim(),
              email: (profile?.email || '').trim().toLowerCase(),
            })),
            filter(profile => profile.name.length > 0 || profile.email.length > 0),
            take(1),
          )
          .subscribe(profile => {
            if (resolved) {
              return;
            }

            resolved = true;
            clearTimeout(fallback);
            this.resolveUserFlow(profile.name, profile.email);
          });
      });
  }

  private isOnboardingLinkRoute(target: string): boolean {
    return /^\/onboarding\/[A-Za-z0-9_-]+(?:\/(?:form|upload|review))?$/.test((target || '').trim());
  }

  login(): void {
    this.auth.loginWithRedirect({
      authorizationParams: {
        ...this.authRequestDefaults,
        prompt: 'select_account',
      },
    });
  }

  loginWithGoogle(): void {
    this.auth.loginWithRedirect({
      authorizationParams: {
        ...this.authRequestDefaults,
        connection: 'google-oauth2',
        prompt: 'select_account',
      },
    });
  }

  signup(): void {
    this.auth.loginWithRedirect({
      authorizationParams: {
        ...this.authRequestDefaults,
        screen_hint: 'signup',
        prompt: 'login',
      },
    });
  }

  private resolveUserFlow(profileName?: string, profileEmail?: string): void {
    const traceId = `web-${Date.now()}`;
    const headerValues: Record<string, string> = {
      'x-debug-trace-id': traceId,
    };

    const normalizedProfileName = (profileName || '').trim();
    const normalizedProfileEmail = (profileEmail || '').trim().toLowerCase();

    if (normalizedProfileName) {
      headerValues['x-profile-name'] = normalizedProfileName;
    }

    if (normalizedProfileEmail) {
      headerValues['x-profile-email'] = normalizedProfileEmail;
    }

    const headers = new HttpHeaders(headerValues);

    this.http.get<UserFlowResponse>('/api/users', { headers }).subscribe({
      next: ({ next }) => {
        const normalizedNext = (next || '/home').trim();
        const resolvedRole = normalizedNext.startsWith('/monitoring') ? AUTH_ROLE_INTERNAL : AUTH_ROLE_EXTERNAL;
        sessionStorage.setItem(AUTH_ROLE_STORAGE_KEY, resolvedRole);
        this.router.navigateByUrl(normalizedNext || '/home');
      },
      error: err => {
        const normalizedProfileEmail = (profileEmail || '').trim().toLowerCase();

        console.error(`[FLOW][${traceId}] resolveUserFlow failed`, {
          status: err?.status,
          error: err?.error,
        });

        if (err.status === 403 && isInternalEmail(normalizedProfileEmail)) {
          sessionStorage.setItem(AUTH_ROLE_STORAGE_KEY, AUTH_ROLE_INTERNAL);
          this.router.navigateByUrl('/monitoring');
          return;
        }

        if (err.status === 403) {
          const alertFn = (globalThis as { alert?: (message: string) => void }).alert;
          if (typeof alertFn === 'function') {
            try {
              alertFn('Access blocked. Your account does not have permission to access this area.');
            } catch {
              // Ignore alert failures in non-browser test environments.
            }
          }
        }

        sessionStorage.setItem(AUTH_ROLE_STORAGE_KEY, AUTH_ROLE_EXTERNAL);

        if (err.status === 401) this.router.navigateByUrl('/login');
        else if (err.status === 403) this.router.navigateByUrl('/login');
        else if (err.status === 404) this.router.navigateByUrl('/signup');
        else this.router.navigateByUrl('/home');
      },
    });
  }

  private syncUserProfileAndNavigateToLink(target: string): void {
    const normalizedTarget = target.trim();

    if (!normalizedTarget) {
      this.router.navigateByUrl('/login');
      return;
    }

    this.auth.user$
      .pipe(
        map((profile: User | null | undefined) => ({
          name: (profile?.name || '').trim(),
          email: (profile?.email || '').trim().toLowerCase(),
        })),
        take(1),
      )
      .subscribe((profile) => {
        const headerValues: Record<string, string> = {
          'x-debug-trace-id': `web-link-${Date.now()}`,
        };

        if (profile.name) {
          headerValues['x-profile-name'] = profile.name;
        }

        if (profile.email) {
          headerValues['x-profile-email'] = profile.email;
        }

        const headers = new HttpHeaders(headerValues);
        const finish = () => {
          sessionStorage.removeItem(LINK_TARGET_KEY);
          this.router.navigateByUrl(normalizedTarget);
        };

        this.http.get<UserFlowResponse>('/api/users', { headers }).subscribe({
          next: () => finish(),
          error: () => finish(),
        });
      });
  }
}