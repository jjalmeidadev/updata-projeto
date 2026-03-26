import { Component, ElementRef, HostListener, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { map } from 'rxjs/operators';
import { OnboardingInstance } from '../../models/onboarding-instance.model';
import { OnboardingInstanceService } from '../../services/onboarding-instance.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly onboardingService = inject(OnboardingInstanceService);

  profileMenuOpen = false;
  loading = true;
  errorMessage = '';
  instances: OnboardingInstance[] = [];
  feedbackMessage = '';

  readonly userEmail$ = this.auth.user$.pipe(
    map(user => user?.email ?? '')
  );

  readonly userInitials$ = this.auth.user$.pipe(
    map(user => {
      const fullName = (user?.name ?? '').trim();

      if (fullName) {
        const parts = fullName.split(/\s+/).filter(Boolean);
        return parts.slice(0, 2).map(part => part[0]?.toUpperCase() ?? '').join('');
      }

      const email = (user?.email ?? '').trim();
      if (!email) return 'U';

      const emailName = email.split('@')[0];
      const chunks = emailName.split(/[._-]+/).filter(Boolean);

      if (chunks.length >= 2) {
        return (chunks[0][0] + chunks[1][0]).toUpperCase();
      }

      return emailName.slice(0, 2).toUpperCase();
    })
  );

  constructor(private readonly elRef: ElementRef<HTMLElement>) {}

  ngOnInit(): void {
    this.loadInstances();
  }

  createOnboarding(): void {
    this.router.navigate(['/module-selector']);
  }

  openOnboarding(instance: OnboardingInstance): void {
    this.router.navigate(['/onboarding', instance.linkToken]);
  }

  viewDetails(instance: OnboardingInstance): void {
    if (instance.status !== 'completed') {
      return;
    }

    this.router.navigate(['/onboarding', instance.linkToken]);
  }

  copyLink(instance: OnboardingInstance): void {
    navigator.clipboard.writeText(instance.linkUrl).then(() => {
      this.feedbackMessage = `Link copied for ${instance.companyName}.`;
    });
  }

  completeReview(instance: OnboardingInstance): void {
    this.onboardingService.completeEquiemReview(instance.linkToken).subscribe({
      next: () => {
        this.feedbackMessage = `Equiem review completed for ${instance.companyName}.`;
        this.loadInstances();
      },
      error: () => {
        this.feedbackMessage = 'Failed to complete the Equiem review.';
      },
    });
  }

  statusLabel(instance: OnboardingInstance): string {
    if (instance.status === 'equiem_review') return 'Equiem review';
    if (instance.status === 'in_progress') return 'In progress';
    if (instance.status === 'completed') return 'Completed';
    return 'Not started';
  }

  showContinue(instance: OnboardingInstance): boolean {
    return instance.status === 'draft' || instance.status === 'in_progress';
  }

  private loadInstances(): void {
    this.loading = true;
    this.onboardingService.listInstances().subscribe({
      next: (items: OnboardingInstance[]) => {
        this.instances = items;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load onboarding instances.';
        this.loading = false;
      },
    });
  }

  toggleProfileMenu(event: MouseEvent) {
    event.stopPropagation();
    this.profileMenuOpen = !this.profileMenuOpen;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as Node | null;
    if (target && !this.elRef.nativeElement.contains(target)) {
      this.profileMenuOpen = false;
    }
  }

  logout() {
    this.profileMenuOpen = false;
    this.auth.logout({
      logoutParams: {
        returnTo: window.location.origin + '/login',
      },
    });
  }
}
