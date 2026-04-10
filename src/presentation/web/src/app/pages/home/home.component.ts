import { Component, ElementRef, HostListener, NgZone, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { map } from 'rxjs/operators';
import { OnboardingInstance } from '../../models/onboarding-instance.model';
import { OnboardingInstanceService } from '../../services/onboarding-instance.service';
import { ToastService } from '../../components/toast/toast.service';
import { ConfirmModalComponent } from '../../components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ConfirmModalComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly onboardingService = inject(OnboardingInstanceService);
  private readonly toast = inject(ToastService);
  private readonly ngZone = inject(NgZone);

  profileMenuOpen = false;
  loading = signal(true);
  errorMessage = '';
  instances = signal<OnboardingInstance[]>([]);
  reviewCompletionInFlight = new Set<string>();
  deleteModalOpen = false;
  deletingInstanceId: string | null = null;
  selectedInstanceForDelete: OnboardingInstance | null = null;

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

  editOnboarding(instance: OnboardingInstance): void {
    this.router.navigate(['/module-selector', instance.linkToken]);
  }

  goToEquiemReview(): void {
  this.router.navigate(['/equiem-review']);
}

  openDeleteModal(instance: OnboardingInstance): void {
    this.selectedInstanceForDelete = instance;
    this.deleteModalOpen = true;
  }

  cancelDeleteModal(): void {
    this.deleteModalOpen = false;
    this.selectedInstanceForDelete = null;
  }

  confirmDeleteOnboarding(): void {
    const instance = this.selectedInstanceForDelete;

    if (!instance || this.deletingInstanceId) {
      return;
    }

    this.deletingInstanceId = instance.id;
    this.onboardingService.deleteInstance(instance.linkToken).subscribe({
      next: () => {
        this.runNextTick(() => {
          this.instances.update((items) =>
            items.filter((item) => item.linkToken !== instance.linkToken)
          );
          this.deleteModalOpen = false;
          this.selectedInstanceForDelete = null;
          this.deletingInstanceId = null;
          this.toast.success(`Onboarding for ${instance.companyName} was deleted.`);
        });
      },
      error: () => {
        this.runNextTick(() => {
          this.deletingInstanceId = null;
          this.toast.error(`Failed to delete onboarding for ${instance.companyName}.`);
        });
      },
    });
  }

  viewDetails(instance: OnboardingInstance): void {
    if (instance.status !== 'completed') {
      return;
    }

    this.router.navigate(['/equiem-review', instance.linkToken]);
  }

  copyLink(instance: OnboardingInstance): void {
    navigator.clipboard.writeText(instance.linkUrl).then(() => {
      this.toast.success(`Link copied for ${instance.companyName}.`);
    }).catch(() => {
      this.toast.error(`Failed to copy link for ${instance.companyName}.`);
    });
  }

  completeReview(instance: OnboardingInstance): void {
    if (this.reviewCompletionInFlight.has(instance.linkToken)) {
      return;
    }

    this.reviewCompletionInFlight.add(instance.linkToken);
    this.onboardingService.completeEquiemReview(instance.linkToken).subscribe({
      next: (updatedInstance: OnboardingInstance) => {
        this.runNextTick(() => {
          this.instances.update((items) =>
            items.map((item) =>
              item.linkToken === instance.linkToken ? updatedInstance : item
            )
          );
          this.toast.success(`Equiem review completed for ${instance.companyName}.`);
          this.reviewCompletionInFlight.delete(instance.linkToken);
        });
      },
      error: () => {
        this.runNextTick(() => {
          this.reviewCompletionInFlight.delete(instance.linkToken);
          this.toast.error('Failed to complete the Equiem review.');
        });
      },
    });
  }

  statusLabel(instance: OnboardingInstance): string {
    if (instance.status === 'equiem_review') return 'Equiem review';
    if (instance.status === 'in_progress') return 'In progress';
    if (instance.status === 'completed') return 'Completed';
    return 'Not started';
  }

  statusClass(instance: OnboardingInstance): string {
    if (instance.status === 'completed') return 'status-completed';
    if (instance.status === 'equiem_review') return 'status-review';
    if (instance.status === 'in_progress') return 'status-started';
    return 'status-not-started';
  }

  showContinue(instance: OnboardingInstance): boolean {
    return instance.status === 'draft' || instance.status === 'in_progress';
  }

  isCompletingReview(instance: OnboardingInstance): boolean {
    return this.reviewCompletionInFlight.has(instance.linkToken);
  }

  private loadInstances(): void {
    this.loading.set(true);
    this.onboardingService.listInstances().subscribe({
      next: (items: OnboardingInstance[]) => {
        this.ngZone.run(() => {
          this.instances.set(items);
          this.loading.set(false);
        });
      },
      error: () => {
        this.ngZone.run(() => {
          this.errorMessage = 'Failed to load onboarding instances.';
          this.loading.set(false);
        });
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

  private runNextTick(updateFn: () => void): void {
    setTimeout(() => {
      this.ngZone.run(updateFn);
    }, 0);
  }
}
