import { Component, ElementRef, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { map } from 'rxjs/operators';

interface Company {
  name: string;
  progress: number;
  started: boolean;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  profileMenuOpen = false;

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

  companies: Company[] = [
    { name: 'Company 1', progress: 35, started: true },
    { name: 'Company 2', progress: 60, started: true },
    { name: 'Company 3', progress: 15, started: true },
    { name: 'Company 4', progress: 50, started: true },
    { name: 'Company 5', progress: 0, started: false },
  ];

  startOnboarding(company: Company) {
    company.started = true;
    company.progress = 10;

    localStorage.removeItem('selectedSections');
    sessionStorage.setItem('onboardingCompany', company.name);

    this.router.navigate(['/module-selector']);
  }

  viewDetails(company: Company) {
    sessionStorage.setItem('onboardingCompany', company.name);
    this.router.navigate(['/module-selector']);
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