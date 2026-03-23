import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-input-method',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './input-method.component.html',
  styleUrl: './input-method.component.css',
})
export class InputMethodComponent {
  private readonly router = inject(Router);

  choose(method: 'upload' | 'manual'): void {
    localStorage.setItem('onboardingInputMethod', method);
    this.router.navigate([method === 'upload' ? '/upload' : '/form']);
  }
}