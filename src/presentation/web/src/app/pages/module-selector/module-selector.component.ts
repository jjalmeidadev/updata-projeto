import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { QuestionService, SECTION_LABELS } from '../../services/question.service';
import { Question } from '../../models/question.model';
import { CompanyOption } from '../../models/onboarding-instance.model';
import { OnboardingInstanceService } from '../../services/onboarding-instance.service';

@Component({
  selector: 'app-module-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './module-selector.component.html',
  styleUrl: './module-selector.component.css',
})
export class ModuleSelectorComponent implements OnInit {
  private readonly questionService = inject(QuestionService);
  private readonly router = inject(Router);
  private readonly onboardingService = inject(OnboardingInstanceService);

  readonly loading = signal(true);
  readonly sections = signal<string[]>([]);
  readonly selectedSections = signal<Set<string>>(new Set());
  readonly companies = signal<CompanyOption[]>([]);
  readonly companyName = signal('');
  readonly saving = signal(false);
  readonly createdLink = signal('');
  readonly successMessage = signal('');
  readonly errorMessage = signal('');
  readonly sectionLabels = SECTION_LABELS;

  readonly canCreate = computed(
    () => this.selectedSections().size > 0 && this.companyName().trim().length > 0 && !this.saving()
  );
  readonly canContinueLegacy = computed(() => this.selectedSections().size > 0);

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
        this.selectedSections.set(new Set(sections));

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
    this.successMessage.set('');
    this.errorMessage.set('');

    this.onboardingService.createInstance({
      companyName: this.companyName().trim(),
      selectedSections: Array.from(this.selectedSections()),
    }).subscribe({
      next: (response) => {
        this.createdLink.set(response.instance.linkUrl);
        this.successMessage.set(
          response.reusedExistingInstance
            ? 'Existing onboarding instance reused for this company and section set.'
            : 'Onboarding link created successfully.'
        );
        this.saving.set(false);
      },
      error: () => {
        this.errorMessage.set('Failed to create the onboarding link.');
        this.saving.set(false);
      },
    });
  }

  copyLink(): void {
    if (!this.createdLink()) return;

    navigator.clipboard.writeText(this.createdLink()).then(() => {
      this.successMessage.set('Onboarding link copied to clipboard.');
    });
  }

  openLink(): void {
    if (!this.createdLink()) return;
    const url = new URL(this.createdLink());
    this.router.navigateByUrl(url.pathname);
  }

  continueLegacyFlow(): void {
    if (!this.canContinueLegacy()) return;

    this.saveSelection();
    this.router.navigate(['/input-method']);
  }

  private saveSelection(): void {
    localStorage.setItem(
      'selectedSections',
      JSON.stringify(Array.from(this.selectedSections()))
    );
  }
}
