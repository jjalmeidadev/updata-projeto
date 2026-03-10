import { Component, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

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
  profileMenuOpen = false;
  userEmail = 'cliente@email.com';

  constructor(
    private readonly router: Router,
    private readonly elRef: ElementRef<HTMLElement>,
  ) {}

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

    console.log('Starting onboarding for', company.name);
  }

  viewDetails(company: Company) {
    console.log('Viewing details for', company.name);
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
    this.router.navigate(['/login']);
  }
}