import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OnboardingInstanceService } from '../../services/onboarding-instance.service';
import { OnboardingInstance } from '../../models/onboarding-instance.model';

@Component({
  selector: 'app-equiem-review-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './equiem-review-detail.component.html',
  styleUrls: ['./equiem-review-detail.component.css']
})
export class EquiemReviewDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
   readonly router = inject(Router);
  private readonly service = inject(OnboardingInstanceService);

  readonly instance = signal<OnboardingInstance | null>(null);
  readonly loading = signal(true);
  readonly feedback = signal('');

  ngOnInit(): void {
    const linkToken = this.route.snapshot.paramMap.get('linkToken');
    if (!linkToken) {
      this.loading.set(false);
      return;
    }

    this.service.listInstances().subscribe({
      next: (items) => {
        const found = items.find(item => item.linkToken === linkToken) ?? null;
        this.instance.set(found);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  approve(): void {
    const current = this.instance();
    if (!current) return;

    this.service.approveInstance(current.linkToken).subscribe({
      next: () => {
        this.feedback.set('Onboarding approved.');
        this.router.navigate(['/equiem-review']);
      }
    });
  }

  reject(): void {
    const current = this.instance();
    if (!current) return;

    const reason = window.prompt('Reason for rejection:');
    if (!reason?.trim()) return;

    this.service.rejectInstance(current.linkToken, reason.trim()).subscribe({
      next: () => {
        this.feedback.set('Onboarding rejected.');
        this.router.navigate(['/equiem-review']);
      }
    });
  }

  entries(data: Record<string, unknown> | undefined): [string, unknown][] {
    return Object.entries(data ?? {});
  }
}