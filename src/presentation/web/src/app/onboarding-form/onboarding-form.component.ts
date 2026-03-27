import { Component, OnInit, effect, inject, signal, computed } from '@angular/core';
import { animate, query, sequence, stagger, style, transition, trigger } from '@angular/animations';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { QuestionService, SECTION_LABELS, SOURCE_OPTIONS } from '../services/question.service';
import { Question, QuestionType } from '../models/question.model';
import { DynamicFieldComponent } from '../components/dynamic-field/dynamic-field.component';

/** Same ordering as module-selector: company → building/residential → amenity-* → remaining */
function reorderSectionsLikeModuleSelector(sectionIds: string[]): string[] {
  const building = sectionIds.filter(
    (s) => s === 'building-setup' || s === 'residential-details'
  );
  const company = sectionIds.filter((s) => s === 'company-details');
  const amenities = sectionIds.filter((s) => s.startsWith('amenity-'));
  const used = new Set<string>([...building, ...company, ...amenities]);
  const permitsToRequestManagement = sectionIds.filter((s) => !used.has(s));
  return [...company, ...building, ...amenities, ...permitsToRequestManagement];
}

interface NavSectionItem {
  sectionId: string;
  index: number;
  label: string;
}

interface NavAreaGroup {
  id: string;
  title: string;
  items: NavSectionItem[];
}

interface ReviewIssue {
  id: string;
  label: string;
  value: unknown;
  type: QuestionType;
  options?: string[];
  error: string;
}

const REVIEW_ISSUES_KEY = 'reviewIssues';
const REVIEW_CORRECTIONS_KEY = 'reviewCorrections';
const REVIEW_FORM_DRAFT_KEY = 'reviewFormDraft';
const REVIEW_SECTION_INDEX_KEY = 'reviewSectionIndex';

@Component({
  selector: 'app-onboarding-form',
  standalone: true,
  imports: [ReactiveFormsModule, DynamicFieldComponent],
  templateUrl: './onboarding-form.component.html',
  styleUrl: './onboarding-form.component.css',
  animations: [
    trigger('navAccordionBody', [
      transition(':enter', [
        style({ height: 0, overflow: 'hidden' }),
        query('ul', [style({ opacity: 0 })], { optional: true }),
        query(
          'li',
          [style({ opacity: 0, transform: 'translateY(6px)' })],
          { optional: true },
        ),
        sequence([
          animate('250ms ease-out', style({ height: '*', overflow: 'hidden' })),
          query('ul', [style({ opacity: 1 })], { optional: true }),
          query(
            'li',
            [
              stagger(35, [
                animate('200ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
              ]),
            ],
            { optional: true },
          ),
        ]),
      ]),
      transition(':leave', [
        sequence([
          query(
            'li',
            [
              animate('150ms ease-out', style({ opacity: 0, transform: 'translateY(4px)' })),
            ],
            { optional: true },
          ),
          animate('180ms ease-out', style({ height: 0, overflow: 'hidden' })),
        ]),
      ]),
    ]),
  ],
})
export class OnboardingFormComponent implements OnInit {
  private readonly questionService = inject(QuestionService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly questions = signal<Question[]>([]);
  readonly sections = signal<string[]>([]);
  readonly currentSectionIndex = signal(0);
  readonly form = signal(new FormGroup({}));
  readonly submitted = signal(false);
  readonly loading = signal(true);
  readonly fromUpload = signal(false);

  readonly sectionLabels = SECTION_LABELS;

  readonly formValues = signal<Record<string, unknown>>({});

  /** Accordion open state per area id (same 4 groups as module-selector). */
  readonly expandedAreas = signal<Record<string, boolean>>({});

  ngOnInit(): void {
    this.questionService.getQuestions().subscribe({
      next: (allQuestions: Question[]) => {
        const selected = this.getSelectedSections();

        const questions = selected.length
          ? allQuestions.filter((q: Question) => selected.includes(q.sectionId))
          : allQuestions;

        this.questions.set(questions);
        const rawSections = this.questionService.getSections(questions);
        this.sections.set(reorderSectionsLikeModuleSelector(rawSections));
        const builtForm = this.buildForm(questions);
        this.form.set(builtForm);
        builtForm.valueChanges.subscribe((values: Record<string, unknown>) => this.formValues.set(values));
        this.loading.set(false);

        // Handle section navigation from query params
        this.route.queryParams.subscribe((params: Params) => {
          if (params['section']) {
            const sectionIndex = parseInt(params['section'], 10);
            if (!isNaN(sectionIndex) && sectionIndex >= 0 && sectionIndex < this.sections().length) {
              this.currentSectionIndex.set(sectionIndex);
            }
          } else {
            this.restoreReviewSectionIndex();
          }
          if (params['fromUpload']) {
            this.fromUpload.set(true);
          }
        });

        // Handle uploaded data
        this.handleUploadedData(builtForm);
        this.applyReviewCorrections(builtForm);
      },
      error: (err: unknown) => {
        console.error('Failed to load questions:', err);
        this.loading.set(false);
      }
    });
  }

  private handleUploadedData(form: FormGroup): void {
    const uploadedData = sessionStorage.getItem('uploadedData');
    if (!uploadedData) return;

    try {
      const rows = JSON.parse(uploadedData) as Record<string, unknown>[];
      if (rows.length === 0) return;

      // Take the first row and map it to form fields
      const firstRow = rows[0];
      const questions = this.questions();

      // Try to match uploaded columns to question IDs or question text
      for (const [key, value] of Object.entries(firstRow)) {
        const normalizedKey = key.toLowerCase().trim();
        
        // Find matching question by id or question text
        const matchingQuestion = questions.find((q: Question) => 
          q.id.toLowerCase() === normalizedKey ||
          q.question.toLowerCase().includes(normalizedKey) ||
          normalizedKey.includes(q.question.toLowerCase().split(' ')[0])
        );

        if (matchingQuestion && form.get(matchingQuestion.id)) {
          form.get(matchingQuestion.id)?.setValue(value);
        }
      }

      // Clear the uploaded data after processing
      sessionStorage.removeItem('uploadedData');
    } catch (error) {
      console.error('Error processing uploaded data:', error);
    }
  }

  private buildForm(questions: Question[]): FormGroup {
    const controls: Record<string, FormControl> = {};
    for (const q of questions) {
      const defaultValue = q.type === 'boolean' ? null
        : q.type === 'multi-select' ? []
        : '';
      controls[q.id] = new FormControl(defaultValue);
    }
    return new FormGroup(controls);
  }

  readonly currentSection = computed(() => this.sections()[this.currentSectionIndex()]);
  readonly currentSectionLabel = computed(() => this.getSectionLabel(this.currentSection()));
  readonly currentQuestions = computed(() => this.questionService.getQuestionsBySection(this.questions(), this.currentSection()));
  readonly isFirstSection = computed(() => this.currentSectionIndex() === 0);
  readonly isLastSection = computed(() => this.currentSectionIndex() === this.sections().length - 1);
  /** Progress by valid required fields completion across current onboarding flow. */
  readonly progressPercent = computed(() => {
    const questions = this.questions();
    const values = this.formValues();
    if (questions.length === 0) return 0;

    const completed = questions.filter((q: Question) => {
      const value = values[q.id];
      return this.validateQuestionValue(q.type, value) === '';
    }).length;

    return Math.round((completed / questions.length) * 100);
  });

  readonly navAreas = computed((): NavAreaGroup[] => {
    const secs = this.sections();
    const withIndex: NavSectionItem[] = secs.map((sectionId: string, index: number) => ({
      sectionId,
      index,
      label: this.getSectionLabel(sectionId),
    }));

    const building = withIndex.filter(
      (x) => x.sectionId === 'building-setup' || x.sectionId === 'residential-details'
    );
    const company = withIndex.filter((x) => x.sectionId === 'company-details');
    const amenities = withIndex.filter((x) => x.sectionId.startsWith('amenity-'));
    const used = new Set<string>(
      [...building, ...company, ...amenities].map((x) => x.sectionId)
    );
    const permits = withIndex.filter((x) => !used.has(x.sectionId));

    const areas: NavAreaGroup[] = [
      { id: 'area-company', title: 'Your company', items: company },
      { id: 'area-building', title: 'Building', items: building },
      { id: 'area-amenities', title: 'Amenities', items: amenities },
      { id: 'area-permits', title: 'Permits', items: permits },
    ];
    return areas.filter((a) => a.items.length > 0);
  });

  /**
   * Per navigation area: each sidebar section (sectionId) counts as one module.
   * A module is complete when every question in that section has a valid value.
   */
  readonly areaModuleProgress = computed((): Record<string, { completed: number; total: number }> => {
    const values = this.formValues();
    const questions = this.questions();
    const map: Record<string, { completed: number; total: number }> = {};

    for (const area of this.navAreas()) {
      let completed = 0;
      const total = area.items.length;
      for (const item of area.items) {
        if (this.isSectionModuleComplete(item.sectionId, questions, values)) {
          completed++;
        }
      }
      map[area.id] = { completed, total };
    }
    return map;
  });

  /** Tracks prior full-completion state per area (for transition → auto-collapse once). */
  private navAreaCompletionPrev: Record<string, boolean> = {};

  constructor() {
    effect(() => {
      const areas = this.navAreas();
      const progress = this.areaModuleProgress();
      for (const area of areas) {
        const { completed, total } = progress[area.id] ?? { completed: 0, total: 0 };
        const nowComplete = total > 0 && completed === total;
        const wasComplete = this.navAreaCompletionPrev[area.id] ?? false;
        if (nowComplete && !wasComplete) {
          this.expandedAreas.update((m) => ({ ...m, [area.id]: false }));
        }
        this.navAreaCompletionPrev[area.id] = nowComplete;
      }
    });
  }

  control(questionId: string): FormControl {
    return this.form().get(questionId) as FormControl;
  }

  next(): void { 
    if (!this.isLastSection()) {
      const nextSectionIndex = this.currentSectionIndex() + 1;
      
      // If coming from upload, go to upload screen of next section
      if (this.fromUpload()) {
        sessionStorage.setItem('uploadSectionIndex', nextSectionIndex.toString());
        this.router.navigate(['/upload']);
      } else {
        this.currentSectionIndex.update((i: number) => i + 1);
        this.expandAreaContainingIndex(nextSectionIndex);
      }
    }
  }
  previous(): void {
    if (!this.isFirstSection()) {
      this.currentSectionIndex.update((i: number) => i - 1);
      this.expandAreaContainingIndex(this.currentSectionIndex());
    }
  }

  goTo(index: number): void {
    this.currentSectionIndex.set(index);
    this.expandAreaContainingIndex(index);
  }

  toggleArea(areaId: string): void {
    this.expandedAreas.update((m: Record<string, boolean>) => ({
      ...m,
      [areaId]: !m[areaId],
    }));
  }

  isAreaExpanded(areaId: string): boolean {
    return !!this.expandedAreas()[areaId];
  }

  getAreaModuleProgress(areaId: string): { completed: number; total: number } {
    return this.areaModuleProgress()[areaId] ?? { completed: 0, total: 0 };
  }

  /** True when every module (section) in the area has all fields valid. */
  isAreaFullyComplete(areaId: string): boolean {
    const { completed, total } = this.getAreaModuleProgress(areaId);
    return total > 0 && completed === total;
  }

  getSectionLabel(sectionId: string): string {
    const rawLabel = SECTION_LABELS[sectionId] ?? sectionId;
    if (sectionId.startsWith('amenity-')) {
      return rawLabel.replace(/^amenit(?:y|ies)\s+/i, '');
    }
    return rawLabel;
  }

  private expandAreaContainingIndex(sectionIndex: number): void {
    const area = this.navAreas().find((a: NavAreaGroup) =>
      a.items.some((item: NavSectionItem) => item.index === sectionIndex)
    );
    if (area) {
      this.expandedAreas.update((m: Record<string, boolean>) => ({
        ...m,
        [area.id]: true,
      }));
    }
  }

  goToUpload(): void {
    sessionStorage.setItem('uploadSectionIndex', this.currentSectionIndex().toString());
    this.router.navigate(['/upload']);
  }

  submit(): void {
    const reviewIssues = this.collectReviewIssues();

    if (reviewIssues.length > 0) {
      sessionStorage.setItem(REVIEW_ISSUES_KEY, JSON.stringify(reviewIssues));
      sessionStorage.setItem(REVIEW_FORM_DRAFT_KEY, JSON.stringify(this.form().getRawValue()));
      sessionStorage.setItem(REVIEW_SECTION_INDEX_KEY, this.currentSectionIndex().toString());
      this.router.navigate(['/review'], { state: { reviewIssues } });
      return;
    }

    this.clearReviewStorage();

    this.submitted.set(true);
    console.log('Onboarding form submitted:', this.form().value);
  }

  private applyReviewCorrections(form: FormGroup): void {
    const draftValues = this.parseObjectValues(sessionStorage.getItem(REVIEW_FORM_DRAFT_KEY));
    this.applyValuesToForm(form, draftValues);

    const fromState = history.state?.['correctedValues'];
    const stateValues = this.parseObjectValues(fromState);
    const storageValues = this.parseObjectValues(sessionStorage.getItem(REVIEW_CORRECTIONS_KEY));
    const correctedValues = Object.keys(stateValues).length > 0 ? stateValues : storageValues;

    this.applyValuesToForm(form, correctedValues);

    if (Object.keys(correctedValues).length > 0) {
      sessionStorage.removeItem(REVIEW_CORRECTIONS_KEY);
      sessionStorage.removeItem(REVIEW_ISSUES_KEY);
    }
  }

  private parseObjectValues(source: unknown): Record<string, unknown> {
    try {
      const parsed = typeof source === 'string' ? JSON.parse(source) : source;
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        return {};
      }

      return parsed as Record<string, unknown>;
    } catch {
      return {};
    }
  }

  private applyValuesToForm(form: FormGroup, values: Record<string, unknown>): void {
    for (const [fieldId, value] of Object.entries(values)) {
      const control = form.get(fieldId);
      if (!control) {
        continue;
      }

      control.setValue(value);
    }
  }

  private restoreReviewSectionIndex(): void {
    const rawIndex = sessionStorage.getItem(REVIEW_SECTION_INDEX_KEY);
    if (!rawIndex) {
      return;
    }

    const sectionIndex = parseInt(rawIndex, 10);
    if (!Number.isNaN(sectionIndex) && sectionIndex >= 0 && sectionIndex < this.sections().length) {
      this.currentSectionIndex.set(sectionIndex);
    }

    sessionStorage.removeItem(REVIEW_SECTION_INDEX_KEY);
  }

  private clearReviewStorage(): void {
    sessionStorage.removeItem(REVIEW_ISSUES_KEY);
    sessionStorage.removeItem(REVIEW_CORRECTIONS_KEY);
    sessionStorage.removeItem(REVIEW_FORM_DRAFT_KEY);
    sessionStorage.removeItem(REVIEW_SECTION_INDEX_KEY);
  }

  private isSectionModuleComplete(
    sectionId: string,
    questions: Question[],
    values: Record<string, unknown>
  ): boolean {
    const qs = questions.filter((q: Question) => q.sectionId === sectionId);
    if (qs.length === 0) {
      return true;
    }
    return qs.every((q: Question) => this.validateQuestionValue(q.type, values[q.id]) === '');
  }

  private collectReviewIssues(): ReviewIssue[] {
    const values = this.form().value as Record<string, unknown>;

    return this.questions().reduce((issues: ReviewIssue[], question: Question) => {
      const value = values[question.id];
      const error = this.validateQuestionValue(question.type, value);

      if (!error) {
        return issues;
      }

      issues.push({
        id: question.id,
        label: question.question,
        value,
        type: question.type,
        options: this.resolveQuestionOptions(question),
        error,
      });

      return issues;
    }, []);
  }

  private validateQuestionValue(type: QuestionType, value: unknown): string {
    if (type === 'file') {
      if (!Array.isArray(value) || value.length === 0) {
        return 'Please upload at least one file.';
      }
      return '';
    }

    if (type === 'multi-select') {
      if (!Array.isArray(value) || value.length === 0) {
        return 'Please select at least one option.';
      }
      return '';
    }

    if (type === 'boolean') {
      if (typeof value !== 'boolean') {
        return 'Please choose Yes or No.';
      }
      return '';
    }

    const textValue = value === null || value === undefined ? '' : String(value).trim();
    if (!textValue) {
      return 'This field is required.';
    }

    if (type === 'integer' && !/^-?\d+$/.test(textValue)) {
      return 'Please use whole numbers only.';
    }

    if (type === 'decimal' && !/^-?\d+([.,]\d+)?$/.test(textValue)) {
      return 'Please enter a valid decimal number.';
    }

    if (type === 'time' && !/^([01]\d|2[0-3]):([0-5]\d)$/.test(textValue)) {
      return 'Please enter the time in HH:MM format.';
    }

    if (type === 'date' && Number.isNaN(Date.parse(textValue))) {
      return 'Please enter a valid date.';
    }

    return '';
  }

  private resolveQuestionOptions(question: Question): string[] {
    if (question.options && question.options.length > 0) {
      return question.options;
    }

    if (question.source && SOURCE_OPTIONS[question.source]) {
      return SOURCE_OPTIONS[question.source];
    }

    return [];
  }

  private getSelectedSections(): string[] {
    try {
      const raw = localStorage.getItem('selectedSections');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
}