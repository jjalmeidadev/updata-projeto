import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { map, take } from 'rxjs/operators';
import { AUTH_ROLE_INTERNAL, AUTH_ROLE_STORAGE_KEY, isInternalEmail } from '../../../shared/auth-constants';
const LINK_TARGET_KEY = 'post_login_link_target';

@Component({
  selector: 'app-onboarding-intro',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './onboarding-intro.component.html',
  styleUrl: './onboarding-intro.component.scss',
})
export class OnboardingIntroComponent {
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  guidanceMessage = '';

  start(): void {
    this.auth.user$
      .pipe(
        take(1),
        map(user => (typeof user?.email === 'string' ? user.email : '').trim().toLowerCase()),
      )
      .subscribe(email => {
        const resolvedRole = (sessionStorage.getItem(AUTH_ROLE_STORAGE_KEY) || '').trim();

        if (isInternalEmail(email) || resolvedRole === AUTH_ROLE_INTERNAL) {
          this.router.navigate(['/input-method']);
          return;
        }

        const target = (sessionStorage.getItem(LINK_TARGET_KEY) || '').trim();
        if (/^\/onboarding\/[A-Za-z0-9_-]+(?:\/(?:form|upload|review))?$/.test(target)) {
          this.router.navigateByUrl(target);
          return;
        }

        this.guidanceMessage = 'Use your invitation link to continue onboarding.';
      });
  }
}

