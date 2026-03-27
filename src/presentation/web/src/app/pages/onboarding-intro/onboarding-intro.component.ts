import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-onboarding-intro',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './onboarding-intro.component.html',
  styleUrl: './onboarding-intro.component.scss',
})
export class OnboardingIntroComponent {
  private readonly router = inject(Router);

  start(): void {
    this.router.navigate(['/input-method']);
  }
}

