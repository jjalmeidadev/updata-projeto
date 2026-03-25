import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { QuestionService, SECTION_LABELS } from '../../services/question.service';
import { Question } from '../../models/question.model';

@Component({
  selector: 'app-module-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './module-selector.component.html',
  styleUrl: './module-selector.component.css',
})
export class ModuleSelectorComponent implements OnInit {
  private readonly questionService = inject(QuestionService);
  private readonly router = inject(Router);

  readonly loading = signal(true);
  readonly sections = signal<string[]>([]);
  readonly selectedSections = signal<Set<string>>(new Set());
  readonly sectionLabels = SECTION_LABELS;

  readonly canContinue = computed(() => this.selectedSections().size > 0);

  readonly groupedSections = computed(() => {
    const all = this.sections();

    const buildingSetup = all.filter((s) => s === 'building-setup');
    const companyResidential = all.filter(
      (s) => s === 'company-details' || s === 'residential-details'
    );
    const amenities = all.filter((s) => s.startsWith('amenity-'));

    const used = new Set<string>([
      ...buildingSetup,
      ...companyResidential,
      ...amenities,
    ]);

    const permitsToRequestManagement = all.filter((s) => !used.has(s));

    return {
      buildingSetup,
      companyResidential,
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

  continueToForm(): void {
    if (!this.canContinue()) return;

    localStorage.setItem(
      'selectedSections',
      JSON.stringify(Array.from(this.selectedSections()))
    );

    this.router.navigate(['/input-method']);
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
}