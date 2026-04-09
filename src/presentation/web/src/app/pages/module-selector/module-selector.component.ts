import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { map } from 'rxjs/operators';
import { QuestionService, SECTION_LABELS } from '../../services/question.service';
import { Question } from '../../models/question.model';
import { CompanyOption } from '../../models/onboarding-instance.model';
import { OnboardingInstanceService } from '../../services/onboarding-instance.service';
import { ToastService } from '../../components/toast/toast.service';

@Component({
  selector: 'app-module-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './module-selector.component.html',
  styleUrl: './module-selector.component.css',
})
export class ModuleSelectorComponent implements OnInit {
  private readonly emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  private readonly questionService = inject(QuestionService);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly elRef = inject(ElementRef<HTMLElement>);
  private readonly onboardingService = inject(OnboardingInstanceService);
  private readonly toast = inject(ToastService);

  profileMenuOpen = false;

  readonly userEmail$ = this.auth.user$.pipe(map(user => user?.email ?? ''));

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

  readonly loading = signal(true);
  readonly sections = signal<string[]>([]);
  readonly selectedSections = signal<Set<string>>(new Set());
  readonly companies = signal<CompanyOption[]>([]);
  readonly companyName = signal('');
  readonly allowedEmailsText = signal('');
  readonly saving = signal(false);
  readonly createdLink = signal('');
  readonly sectionLabels = SECTION_LABELS;
  readonly parsedAllowedEmails = computed(() => this.parseAllowedEmails(this.allowedEmailsText()));
  readonly allowedEmails = computed(() => this.parsedAllowedEmails().emails);
  readonly allowedEmailsError = computed(() => this.parsedAllowedEmails().error);

  readonly canCreate = computed(
    () =>
      this.selectedSections().size > 0 &&
      this.companyName().trim().length > 0 &&
      this.allowedEmails().length > 0 &&
      !this.allowedEmailsError() &&
      !this.saving()
  );
  readonly canContinueLegacy = computed(() => this.selectedSections().size > 0);

  readonly groupedSections = computed(() => {
    const all = this.sections();

    const building = all.filter(
      (s) => s === 'building-setup' || s === 'residential-details'
    );
    const company = all.filter((s) => s === 'company-details');
    const amenities = all.filter((s) => s.startsWith('amenity-'));

    const used = new Set<string>([
      ...building,
      ...company,
      ...amenities,
    ]);

    const permitsToRequestManagement = all.filter((s) => !used.has(s));

    return {
      building,
      company,
      amenities,
      permitsToRequestManagement,
    };
  });

  getSectionLabel(sectionId: string): string {
    const rawLabel = this.sectionLabels[sectionId] ?? sectionId;

    if (sectionId.startsWith('amenity-')) {
      return rawLabel.replace(/^amenit(?:y|ies)\s+/i, '');
    }

    return rawLabel;
  }

  ngOnInit(): void {
    this.onboardingService.listCompanies().subscribe({
      next: (companies: CompanyOption[]) => {
        this.companies.set(companies);
      },
    });

    this.questionService.getQuestions().subscribe({
      next: (questions: Question[]) => {
        const sections = this.questionService.getSections(questions);
        this.sections.set(sections);

        const saved = this.readSavedSelection();
        if (saved.length > 0) {
          const validSaved = saved.filter(section => sections.includes(section));
          this.selectedSections.set(new Set(validSaved));
        } else {
          this.selectedSections.set(new Set(sections));
        }

        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  toggleSection(sectionId: string): void {
    const next = new Set(this.selectedSections());
    if (next.has(sectionId)) next.delete(sectionId);
    else next.add(sectionId);
    this.selectedSections.set(next);
  }

  isSelected(sectionId: string): boolean {
    return this.selectedSections().has(sectionId);
  }

  selectAll(): void {
    this.selectedSections.set(new Set(this.sections()));
  }

  clearAll(): void {
    this.selectedSections.set(new Set());
  }

  createLink(): void {
    if (!this.canCreate()) return;

    this.saveSelection();
    this.saving.set(true);

    this.onboardingService.createInstance({
      companyName: this.companyName().trim(),
      selectedSections: Array.from(this.selectedSections()),
      allowedEmails: this.allowedEmails(),
    }).subscribe({
      next: (response) => {
        this.createdLink.set(response.instance.linkUrl);
        this.toast.success(
          response.reusedExistingInstance
            ? 'Existing onboarding reused for this company and section set.'
            : 'Onboarding link created successfully.'
        );
        this.saving.set(false);
      },
      error: () => {
        this.toast.error('Failed to create the onboarding link.');
        this.saving.set(false);
      },
    });
  }

  copyLink(): void {
    if (!this.createdLink()) {
      this.toast.info('Create the onboarding link first.');
      return;
    }

    navigator.clipboard.writeText(this.createdLink()).then(() => {
      this.toast.success('Onboarding link copied to clipboard.');
    }).catch(() => {
      this.toast.error('Unable to copy the onboarding link.');
    });
  }

  goBackToMonitoring(): void {
    this.router.navigate(['/monitoring']);
  }

  continueLegacyFlow(): void {
    if (!this.canContinueLegacy()) return;

    this.saveSelection();
    this.router.navigate(['/input-method']);
  }

  goHome(): void {
    this.router.navigate(['/home']);
  }

  toggleProfileMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.profileMenuOpen = !this.profileMenuOpen;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as Node | null;
    if (target && !this.elRef.nativeElement.contains(target)) {
      this.profileMenuOpen = false;
    }
  }

  logout(): void {
    this.profileMenuOpen = false;
    this.auth.logout({
      logoutParams: {
        returnTo: window.location.origin + '/login',
      },
    });
  }

  private saveSelection(): void {
    localStorage.setItem(
      'selectedSections',
      JSON.stringify(Array.from(this.selectedSections()))
    );
  }

  private readSavedSelection(): string[] {
    try {
      const raw = localStorage.getItem('selectedSections');
      if (!raw) return [];
      const parsed = JSON.parse(raw) as unknown;
      return Array.isArray(parsed) ? parsed.filter(v => typeof v === 'string') : [];
    } catch {
      return [];
    }
  }

  private parseAllowedEmails(text: string): { emails: string[]; error: string } {
    const values = text
      .split(/[\n,]+/)
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean);

    const invalidEmails = values.filter((email) => !this.emailPattern.test(email));

    if (invalidEmails.length > 0) {
      return {
        emails: Array.from(new Set(values.filter((email) => this.emailPattern.test(email)))).sort(),
        error: `Invalid email format: ${Array.from(new Set(invalidEmails)).join(', ')}`,
      };
    }

    return {
      emails: Array.from(new Set(values)).sort(),
      error: '',
    };
  }
}
