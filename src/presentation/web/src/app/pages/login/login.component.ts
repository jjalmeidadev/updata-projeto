import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import type { User } from '@auth0/auth0-angular';
import { filter, map, take } from 'rxjs/operators';
import { AUTH_ROLE_EXTERNAL, AUTH_ROLE_INTERNAL, AUTH_ROLE_STORAGE_KEY, isInternalEmail } from '../../../shared/auth-constants';
import { ConfirmModalComponent } from '../../components/confirm-modal/confirm-modal.component';

type UserFlowResponse = { next: string };
const LINK_TARGET_KEY = 'post_login_link_target';
const LINK_FORCE_ACCOUNT_SELECTION_KEY = 'post_login_force_account_selection';
const ONBOARDING_ACCESS_DENIED_NOTICE_KEY = 'onboarding_access_denied_notice';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ConfirmModalComponent],
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

  accessDeniedModalOpen = false;
  accessDeniedModalMessage = '';
  loginLoading = false;

  ngOnInit(): void {
    this.openAccessDeniedNoticeIfPresent();

    // Resolve backend user flow whenever Auth0 session is available on the login route.
    // This avoids missing first-time user creation if callback params were already consumed.
    this.auth.isAuthenticated$
      .pipe(filter(Boolean), take(1))
      .subscribe(() => {
        const storedTarget = sessionStorage.getItem(LINK_TARGET_KEY) || '';
        const shouldForceAccountSelection =
          (sessionStorage.getItem(LINK_FORCE_ACCOUNT_SELECTION_KEY) || '').trim() === 'true';

        if (shouldForceAccountSelection) {
          this.loginLoading = true;
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

        if (this.isPostLoginDeepLinkRoute(storedTarget)) {
          this.syncUserProfileAndNavigateToLink(storedTarget);
          return;
        }

        let resolved = false;
        const fallback = setTimeout(() => {
          if (!resolved) {
            resolved = true;
            console.warn('[LOGIN] Fallback timeout: calling resolveUserFlow without profile data');
            this.resolveUserFlow();
          }
        }, 3000); // Increased from 1500ms to 3000ms to allow Auth0 to load user profile

        this.auth.user$
          .pipe(
            map((profile: User | null | undefined) => ({
              name: (profile?.name || '').trim(),
              email: (profile?.email || '').trim().toLowerCase(),
            })),
            filter(profile => {
              const hasData = profile.name.length > 0 || profile.email.length > 0;
              console.log(`[LOGIN] Auth0 user$ received: name="${profile.name}", email="${profile.email}", hasData=${hasData}`);
              return hasData;
            }),
            take(1),
          )
          .subscribe(profile => {
            if (resolved) {
              return;
            }

            resolved = true;
            clearTimeout(fallback);
            console.log(`[LOGIN] Resolving user flow with profile: name="${profile.name}", email="${profile.email}"`);
            this.resolveUserFlow(profile.name, profile.email);
          });
      });
  }

  closeAccessDeniedModal(): void {
    this.accessDeniedModalOpen = false;
  }

  private storeAccessDeniedNotice(message: string): void {
    sessionStorage.setItem(ONBOARDING_ACCESS_DENIED_NOTICE_KEY, message);
  }

  private openAccessDeniedNoticeIfPresent(): void {
    const raw = sessionStorage.getItem(ONBOARDING_ACCESS_DENIED_NOTICE_KEY) || '';
    sessionStorage.removeItem(ONBOARDING_ACCESS_DENIED_NOTICE_KEY);

    if (!raw.trim()) {
      return;
    }

    this.accessDeniedModalMessage =
      `You do not have permission to access this onboarding link.\n\n${raw.trim()}`;
    this.accessDeniedModalOpen = true;
  }

  private isPostLoginDeepLinkRoute(target: string): boolean {
    const t = (target || '').trim();
    if (/^\/onboarding\/[A-Za-z0-9_-]+(?:\/(?:form|upload|review))?$/.test(t)) {
      return true;
    }
    return /^\/equiem-review(?:\/[A-Za-z0-9_-]+)?$/.test(t);
  }

  login(): void {
    this.loginLoading = true;
    this.auth.loginWithRedirect({
      authorizationParams: {
        ...this.authRequestDefaults,
        prompt: 'select_account',
      },
    });
  }

  loginWithGoogle(): void {
    this.loginLoading = true;
    this.auth.loginWithRedirect({
      authorizationParams: {
        ...this.authRequestDefaults,
        connection: 'google-oauth2',
        prompt: 'select_account',
      },
    });
  }

  signup(): void {
    this.loginLoading = true;
    this.auth.loginWithRedirect({
      authorizationParams: {
        ...this.authRequestDefaults,
        screen_hint: 'signup',
        prompt: 'login',
      },
    });
  }

  private resolveUserFlow(profileName?: string, profileEmail?: string): void {
    this.loginLoading = true;
    const traceId = `web-${Date.now()}`;
    const headerValues: Record<string, string> = {
      'x-debug-trace-id': traceId,
    };

    const normalizedProfileName = (profileName || '').trim();
    const normalizedProfileEmail = (profileEmail || '').trim().toLowerCase();

    console.log(`[LOGIN] resolveUserFlow called: profileName="${profileName}", profileEmail="${profileEmail}"`);

    if (normalizedProfileName) {
      headerValues['x-profile-name'] = normalizedProfileName;
    }

    if (normalizedProfileEmail) {
      headerValues['x-profile-email'] = normalizedProfileEmail;
    }

    console.log(`[LOGIN] Request headers: x-profile-name="${headerValues['x-profile-name'] || 'NOT SET'}", x-profile-email="${headerValues['x-profile-email'] || 'NOT SET'}"`);

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
          this.storeAccessDeniedNotice('Access blocked. Your account does not have permission to access this area.');
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