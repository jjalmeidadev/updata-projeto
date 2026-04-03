import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { OnboardingInstance } from '../../models/onboarding-instance.model';
import { OnboardingInstanceService } from '../../services/onboarding-instance.service';

@Component({
  selector: 'app-input-method',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './input-method.component.html',
  styleUrl: './input-method.component.css',
})
export class InputMethodComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly onboardingService = inject(OnboardingInstanceService);

  readonly instance = signal<OnboardingInstance | null>(null);
  readonly errorMessage = signal('');

  ngOnInit(): void {
    const linkToken = this.route.snapshot.paramMap.get('linkToken');
    if (!linkToken) {
      return;
    }

    this.onboardingService.getPublicInstance(linkToken).subscribe({
      next: (instance: OnboardingInstance) => {
        this.instance.set(instance);
        localStorage.setItem('selectedSections', JSON.stringify(instance.selectedSections));
      },
      error: () => this.errorMessage.set('Failed to load onboarding link.'),
    });
  }

  choose(method: 'upload' | 'manual'): void {
    const linkToken = this.route.snapshot.paramMap.get('linkToken');
    const nextSegment = method === 'upload' ? 'upload' : 'form';

    if (linkToken) {
      this.router.navigate(['/onboarding', linkToken, nextSegment]);
      return;
    }

    this.router.navigate([`/${nextSegment}`]);
  }
}
