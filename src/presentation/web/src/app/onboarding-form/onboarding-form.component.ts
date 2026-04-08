import { Component, OnInit, effect, inject, signal, computed } from '@angular/core';
import { animate, query, sequence, stagger, style, transition, trigger } from '@angular/animations';
import { HttpErrorResponse } from '@angular/common/http';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { QuestionService, SECTION_LABELS, SOURCE_OPTIONS } from '../services/question.service';
import { Question, QuestionType } from '../models/question.model';
import { DynamicFieldComponent } from '../components/dynamic-field/dynamic-field.component';
import { debounceTime } from 'rxjs';
import { OnboardingInstance } from '../models/onboarding-instance.model';
import { OnboardingInstanceService } from '../services/onboarding-instance.service';

type ReviewSource = 'manual' | 'template';

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
  source: ReviewSource;
  section?: string;
  row?: number;
}

interface ReviewState {
  source: ReviewSource;
  issues: ReviewIssue[];
}

const REVIEW_STATE_KEY = 'reviewState';
const REVIEW_CORRECTIONS_KEY = 'reviewCorrections';
const REVIEW_FORM_DRAFT_KEY = 'reviewFormDraft';
const REVIEW_SECTION_INDEX_KEY = 'reviewSectionIndex';
const UPLOADED_DATA_KEY = 'uploadedData';
const UPLOAD_SECTION_INDEX_KEY = 'uploadSectionIndex';

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
  private readonly auth = inject(AuthService);
  private readonly onboardingService = inject(OnboardingInstanceService);

  readonly questions = signal<Question[]>([]);
  readonly sections = signal<string[]>([]);
  readonly currentSectionIndex = signal(0);
  readonly form = signal(new FormGroup({}));
  readonly submitted = signal(false);
  readonly loading = signal(true);
  readonly fromUpload = signal(false);
  readonly formVersion = signal(0);
  readonly formValues = signal<Record<string, unknown>>({});
  readonly instance = signal<OnboardingInstance | null>(null);
  readonly pageMessage = signal('');
  readonly expandedAreas = signal<Record<string, boolean>>({});
  private autoSaveReady = false;
  private navAreaCompletionPrev: Record<string, boolean> = {};
  private accessDeniedPopupShown = false;

  readonly sectionLabels = SECTION_LABELS;
  readonly currentSection = computed(() => this.sections()[this.currentSectionIndex()] ?? '');
  readonly currentSectionLabel = computed(() => this.getSectionLabel(this.currentSection()));
  readonly currentQuestions = computed(() =>
    this.currentSection()
      ? this.questionService.getQuestionsBySection(this.questions(), this.currentSection())
      : []
  );
  readonly isFirstSection = computed(() => this.currentSectionIndex() === 0);
  readonly isLastSection = computed(() => this.currentSectionIndex() === this.sections().length - 1);
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
    const used = new Set<string>([...building, ...company, ...amenities].map((x) => x.sectionId));
    const permits = withIndex.filter((x) => !used.has(x.sectionId));

    const areas: NavAreaGroup[] = [
      { id: 'area-company', title: 'Your company', items: company },
      { id: 'area-building', title: 'Building', items: building },
      { id: 'area-amenities', title: 'Amenities', items: amenities },
      { id: 'area-permits', title: 'Permits', items: permits },
    ];

    return areas.filter((area) => area.items.length > 0);
  });

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

  constructor() {
    effect(() => {
      const areas = this.navAreas();
      const progress = this.areaModuleProgress();
      for (const area of areas) {
        const { completed, total } = progress[area.id] ?? { completed: 0, total: 0 };
        const nowComplete = total > 0 && completed === total;
        const wasComplete = this.navAreaCompletionPrev[area.id] ?? false;
        if (nowComplete && !wasComplete) {
          this.expandedAreas.update((items) => ({ ...items, [area.id]: false }));
        }
        this.navAreaCompletionPrev[area.id] = nowComplete;
      }
    });
  }

  ngOnInit(): void {
    this.cleanupStaleUploadState();
    const linkToken = this.route.snapshot.paramMap.get('linkToken');

    if (!linkToken) {
      this.initializeLegacyFlow();
      return;
    }

    this.onboardingService.getPublicInstance(linkToken).subscribe({
      next: (instance: OnboardingInstance) => {
        this.instance.set(instance);
        this.questionService.getQuestions().subscribe({
          next: (allQuestions: Question[]) => {
            const selected = instance.selectedSections;
            const questions = selected.length
              ? allQuestions.filter((q: Question) => selected.includes(q.sectionId))
              : allQuestions;
            this.setupForm(questions, instance.formData ?? {});
          },
          error: (err: unknown) => {
            console.error('Failed to load questions:', err);
            this.loading.set(false);
          },
        });
      },
      error: (error: unknown) => {
        const message = this.resolveApiErrorMessage(error, 'Failed to load onboarding link.');
        this.pageMessage.set(message);

        if (this.isAccessDeniedError(error)) {
          this.showAccessDeniedPopup(message);
          this.auth.logout({
            logoutParams: {
              returnTo: window.location.origin + '/login',
              federated: true,
            },
          });
        }

        this.loading.set(false);
      },
    });
  }

  control(questionId: string): FormControl {
    return this.form().get(questionId) as FormControl;
  }

  next(): void {
    if (!this.isLastSection()) {
      const nextSectionIndex = this.currentSectionIndex() + 1;
      if (this.fromUpload()) {
        sessionStorage.setItem(UPLOAD_SECTION_INDEX_KEY, nextSectionIndex.toString());
      }
      this.currentSectionIndex.set(nextSectionIndex);
      this.expandAreaContainingIndex(nextSectionIndex);
    }
    this.persistDraft();
  }

  previous(): void {
    if (!this.isFirstSection()) {
      this.currentSectionIndex.update((i: number) => i - 1);
      this.expandAreaContainingIndex(this.currentSectionIndex());
    }
    this.persistDraft();
  }

  goTo(index: number): void {
    this.currentSectionIndex.set(index);
    this.expandAreaContainingIndex(index);
    this.persistDraft();
  }

  toggleArea(areaId: string): void {
    this.expandedAreas.update((items: Record<string, boolean>) => ({
      ...items,
      [areaId]: !items[areaId],
    }));
  }

  isAreaExpanded(areaId: string): boolean {
    return !!this.expandedAreas()[areaId];
  }

  getAreaModuleProgress(areaId: string): { completed: number; total: number } {
    return this.areaModuleProgress()[areaId] ?? { completed: 0, total: 0 };
  }

  isAreaFullyComplete(areaId: string): boolean {
    const { completed, total } = this.getAreaModuleProgress(areaId);
    return total > 0 && completed === total;
  }

  getSectionLabel(sectionId: string): string {
    if (!sectionId) {
      return 'Onboarding';
    }

    const rawLabel = SECTION_LABELS[sectionId] ?? sectionId;
    if (sectionId.startsWith('amenity-')) {
      return rawLabel.replace(/^amenit(?:y|ies)\s+/i, '');
    }
    return rawLabel;
  }

  goToUpload(): void {
    const linkToken = this.route.snapshot.paramMap.get('linkToken');
    sessionStorage.setItem(UPLOAD_SECTION_INDEX_KEY, this.currentSectionIndex().toString());
    this.router.navigate(linkToken ? ['/onboarding', linkToken, 'upload'] : ['/upload']);
  }

  submit(): void {
    const reviewItems = this.collectReviewItems();
    const hasErrors = reviewItems.some((item: ReviewIssue) => Boolean(item.error));

    if (hasErrors) {
      const reviewSource: ReviewSource = this.fromUpload() ? 'template' : 'manual';
      const reviewState: ReviewState = { source: reviewSource, issues: reviewItems };
      sessionStorage.setItem(REVIEW_STATE_KEY, JSON.stringify(reviewState));
      sessionStorage.setItem(REVIEW_FORM_DRAFT_KEY, JSON.stringify(this.form().getRawValue()));
      sessionStorage.setItem(REVIEW_SECTION_INDEX_KEY, this.currentSectionIndex().toString());

      const linkToken = this.route.snapshot.paramMap.get('linkToken');
      if (!linkToken) {
        this.router.navigate(['/review'], {
          state: { reviewSource, reviewIssues: reviewItems },
        });
        return;
      }

      this.router.navigate(['/onboarding', linkToken, 'review'], {
        state: { reviewSource, reviewIssues: reviewItems },
      });
      return;
    }

    sessionStorage.removeItem(REVIEW_STATE_KEY);
    sessionStorage.removeItem(REVIEW_CORRECTIONS_KEY);
    sessionStorage.removeItem(REVIEW_FORM_DRAFT_KEY);
    sessionStorage.removeItem(REVIEW_SECTION_INDEX_KEY);
    this.completeSubmission();
  }

  private setupForm(questions: Question[], initialValues: Record<string, unknown>): void {
    this.questions.set(questions);
    this.sections.set(reorderSectionsLikeModuleSelector(this.questionService.getSections(questions)));

    const builtForm = this.buildForm(questions);
    this.form.set(builtForm);
    this.applyValuesToForm(builtForm, initialValues);
    this.formValues.set(builtForm.getRawValue() as Record<string, unknown>);

    builtForm.valueChanges.subscribe((values) => {
      this.formVersion.update((value: number) => value + 1);
      this.formValues.set((values ?? {}) as Record<string, unknown>);
    });

    builtForm.valueChanges.pipe(debounceTime(500)).subscribe(() => {
      if (this.autoSaveReady && !this.submitted()) {
        this.persistDraft();
      }
    });

    this.loading.set(false);
    this.initializeExpandedAreas();

    this.route.queryParams.subscribe((params: Params) => {
      this.fromUpload.set(params['fromUpload'] === 'true' || params['fromUpload'] === true);

      if (params['section']) {
        const sectionIndex = parseInt(params['section'], 10);
        if (!Number.isNaN(sectionIndex) && sectionIndex >= 0 && sectionIndex < this.sections().length) {
          this.currentSectionIndex.set(sectionIndex);
          this.expandAreaContainingIndex(sectionIndex);
        }
      } else {
        this.restoreReviewSectionIndex();
        this.expandAreaContainingIndex(this.currentSectionIndex());
      }

      const shouldAutoSubmit =
        params['autoSubmit'] === 'true' ||
        params['autoSubmit'] === true ||
        history.state?.['autoSubmit'] === true;

      this.handleUploadedData(builtForm);
      this.applyReviewCorrections(builtForm);
      this.formValues.set(builtForm.getRawValue() as Record<string, unknown>);
      this.autoSaveReady = true;

      if (shouldAutoSubmit) {
        setTimeout(() => this.completeSubmission());
      }

      setTimeout(() => {
        if (
          this.route.snapshot.queryParamMap.has('fromUpload') ||
          this.route.snapshot.queryParamMap.has('fromReview') ||
          this.route.snapshot.queryParamMap.has('section') ||
          this.route.snapshot.queryParamMap.has('autoSubmit')
        ) {
          this.router.navigate([], {
            relativeTo: this.route,
            queryParams: {},
            replaceUrl: true,
          });
        }
      });
    });
  }

  private initializeExpandedAreas(): void {
    const expanded: Record<string, boolean> = {};
    for (const area of this.navAreas()) {
      expanded[area.id] = true;
    }
    this.expandedAreas.set(expanded);
    this.expandAreaContainingIndex(this.currentSectionIndex());
  }

  private completeSubmission(): void {
    const linkToken = this.route.snapshot.paramMap.get('linkToken');
    if (!linkToken) {
      this.clearTransientFlowState();
      this.fromUpload.set(false);
      this.submitted.set(true);
      return;
    }

    this.onboardingService.submit(linkToken, {
      formData: this.form().getRawValue() as Record<string, unknown>,
    }).subscribe({
      next: (instance: OnboardingInstance) => {
        this.instance.set(instance);
        this.clearTransientFlowState();
        this.fromUpload.set(false);
        this.submitted.set(true);
      },
      error: (error: unknown) => {
        this.pageMessage.set(this.resolveApiErrorMessage(error, 'Failed to submit onboarding.'));
      },
    });
  }

  private resolveApiErrorMessage(error: unknown, fallback: string): string {
    if (!(error instanceof HttpErrorResponse)) {
      return fallback;
    }

    const body = error.error;

    if (body && typeof body === 'object' && 'error' in body && typeof body.error === 'string') {
      return body.error;
    }

    if (typeof body === 'string' && body.trim().length > 0) {
      return body;
    }

    return fallback;
  }

  private isAccessDeniedError(error: unknown): boolean {
    return error instanceof HttpErrorResponse && (error.status === 401 || error.status === 403);
  }

  private showAccessDeniedPopup(message: string): void {
    if (this.accessDeniedPopupShown) {
      return;
    }

    this.accessDeniedPopupShown = true;

    const alertFn = (globalThis as { alert?: (text: string) => void }).alert;
    if (typeof alertFn === 'function') {
      alertFn(`You do not have permission to access this onboarding.\n\n${message}`);
    }
  }

  private handleUploadedData(form: FormGroup): void {
    const fromUploadQuery = this.route.snapshot.queryParamMap.get('fromUpload') === 'true';
    if (!fromUploadQuery) {
      sessionStorage.removeItem(UPLOADED_DATA_KEY);
      sessionStorage.removeItem(UPLOAD_SECTION_INDEX_KEY);
      return;
    }

    const uploadedDataFromState = history.state?.['uploadedData'];
    let values: Record<string, unknown> = {};

    if (
      uploadedDataFromState &&
      typeof uploadedDataFromState === 'object' &&
      !Array.isArray(uploadedDataFromState)
    ) {
      values = uploadedDataFromState as Record<string, unknown>;
    } else {
      const uploadedDataFromStorage = sessionStorage.getItem(UPLOADED_DATA_KEY);
      if (uploadedDataFromStorage) {
        try {
          const parsed = JSON.parse(uploadedDataFromStorage) as
            | Record<string, unknown>
            | Record<string, unknown>[];
          values = Array.isArray(parsed) ? (parsed[0] ?? {}) : parsed;
        } catch (error) {
          console.error('Error processing uploaded data:', error);
        }
      }
    }

    this.applyValuesToForm(form, values);
    this.formValues.set(form.getRawValue() as Record<string, unknown>);
    sessionStorage.removeItem(UPLOADED_DATA_KEY);

    const uploadSectionIndex = sessionStorage.getItem(UPLOAD_SECTION_INDEX_KEY);
    if (uploadSectionIndex) {
      const sectionIndex = parseInt(uploadSectionIndex, 10);
      if (!Number.isNaN(sectionIndex) && sectionIndex >= 0 && sectionIndex < this.sections().length) {
        this.currentSectionIndex.set(sectionIndex);
        this.expandAreaContainingIndex(sectionIndex);
      }
      sessionStorage.removeItem(UPLOAD_SECTION_INDEX_KEY);
    }
  }

  private buildForm(questions: Question[]): FormGroup {
    const controls: Record<string, FormControl> = {};
    for (const q of questions) {
      const defaultValue =
        q.type === 'boolean' ? null :
        q.type === 'multi-select' ? [] :
        q.type === 'file' ? [] : '';
      controls[q.id] = new FormControl(defaultValue);
    }
    return new FormGroup(controls);
  }

  private applyReviewCorrections(form: FormGroup): void {
    const draftValues = this.parseObjectValues(sessionStorage.getItem(REVIEW_FORM_DRAFT_KEY));
    this.applyValuesToForm(form, draftValues);

    const fromState = history.state?.['correctedValues'];
    const stateValues = this.parseObjectValues(fromState);
    const storageValues = this.parseObjectValues(sessionStorage.getItem(REVIEW_CORRECTIONS_KEY));
    const correctedValues = Object.keys(stateValues).length > 0 ? stateValues : storageValues;
    this.applyValuesToForm(form, correctedValues);
    this.formValues.set(form.getRawValue() as Record<string, unknown>);

    if (Object.keys(correctedValues).length > 0) {
      sessionStorage.removeItem(REVIEW_CORRECTIONS_KEY);
      sessionStorage.removeItem(REVIEW_STATE_KEY);
      sessionStorage.removeItem(REVIEW_FORM_DRAFT_KEY);
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
      if (!control) continue;
      const question = this.questions().find((q: Question) => q.id === fieldId);
      control.setValue(this.normalizeValueForQuestion(question, value));
    }
  }

  private normalizeValueForQuestion(question: Question | undefined, value: unknown): unknown {
    if (!question) return value;

    if (question.type === 'boolean') {
      if (typeof value === 'boolean') return value;
      const normalized = String(value ?? '').trim().toLowerCase();
      if (['yes', 'true'].includes(normalized)) return true;
      if (['no', 'false'].includes(normalized)) return false;
      return null;
    }

    if (question.type === 'multi-select') {
      if (Array.isArray(value)) return value;
      const text = String(value ?? '').trim();
      if (!text) return [];
      return text.split(',').map((item: string) => item.trim()).filter(Boolean);
    }

    if (question.type === 'file') {
      if (Array.isArray(value)) return value;
      const text = String(value ?? '').trim();
      return text ? text : [];
    }

    return value ?? '';
  }

  private restoreReviewSectionIndex(): void {
    const rawIndex = sessionStorage.getItem(REVIEW_SECTION_INDEX_KEY);
    if (!rawIndex) return;

    const sectionIndex = parseInt(rawIndex, 10);
    if (!Number.isNaN(sectionIndex) && sectionIndex >= 0 && sectionIndex < this.sections().length) {
      this.currentSectionIndex.set(sectionIndex);
      this.expandAreaContainingIndex(sectionIndex);
    }

    sessionStorage.removeItem(REVIEW_SECTION_INDEX_KEY);
  }

  private clearTransientFlowState(): void {
    sessionStorage.removeItem(UPLOADED_DATA_KEY);
    sessionStorage.removeItem(REVIEW_STATE_KEY);
    sessionStorage.removeItem(REVIEW_CORRECTIONS_KEY);
    sessionStorage.removeItem(REVIEW_FORM_DRAFT_KEY);
    sessionStorage.removeItem(REVIEW_SECTION_INDEX_KEY);
    sessionStorage.removeItem(UPLOAD_SECTION_INDEX_KEY);
  }

  private cleanupStaleUploadState(): void {
    const hasUploadedDataInState = !!history.state?.['uploadedData'];
    const hasCorrectedValuesInState = !!history.state?.['correctedValues'];
    const hasStoredUploadedData = !!sessionStorage.getItem(UPLOADED_DATA_KEY);
    const hasStoredReviewState = !!sessionStorage.getItem(REVIEW_STATE_KEY);
    const hasStoredCorrections = !!sessionStorage.getItem(REVIEW_CORRECTIONS_KEY);
    const shouldKeepFlowState =
      hasUploadedDataInState ||
      hasCorrectedValuesInState ||
      hasStoredUploadedData ||
      hasStoredReviewState ||
      hasStoredCorrections;

    if (!shouldKeepFlowState) {
      this.clearTransientFlowState();
    }
  }

  private expandAreaContainingIndex(sectionIndex: number): void {
    const area = this.navAreas().find((item: NavAreaGroup) =>
      item.items.some((section: NavSectionItem) => section.index === sectionIndex)
    );
    if (area) {
      this.expandedAreas.update((items: Record<string, boolean>) => ({
        ...items,
        [area.id]: true,
      }));
    }
  }

  private isSectionModuleComplete(
    sectionId: string,
    questions: Question[],
    values: Record<string, unknown>
  ): boolean {
    const qs = questions.filter((q: Question) => q.sectionId === sectionId);
    if (qs.length === 0) return true;
    return qs.every((q: Question) => this.validateQuestionValue(q.type, values[q.id]) === '');
  }

  private collectReviewItems(): ReviewIssue[] {
    const values = this.form().value as Record<string, unknown>;
    const reviewSource: ReviewSource = this.fromUpload() ? 'template' : 'manual';
    return this.questions().map((question: Question) => {
      const value = values[question.id];
      const error = this.validateQuestionValue(question.type, value);
      return {
        id: question.id,
        label: question.question,
        value,
        type: question.type,
        options: this.resolveQuestionOptions(question),
        error,
        source: reviewSource,
        section: question.sectionId,
      };
    });
  }

  private validateQuestionValue(type: QuestionType, value: unknown): string {
    if (type === 'file') {
      if (this.fromUpload()) return '';
      if (Array.isArray(value)) {
        return value.length === 0 ? 'Please upload at least one file.' : '';
      }
      const textValue = value === null || value === undefined ? '' : String(value).trim();
      return !textValue ? 'Please upload at least one file.' : '';
    }

    if (type === 'multi-select') {
      return !Array.isArray(value) || value.length === 0 ? 'Please select at least one option.' : '';
    }

    if (type === 'boolean') {
      return typeof value !== 'boolean' ? 'Please choose Yes or No.' : '';
    }

    const textValue = value === null || value === undefined ? '' : String(value).trim();
    if (!textValue) return 'This field is required.';
    if (type === 'integer' && !/^-?\d+$/.test(textValue)) return 'Please use whole numbers only.';
    if (type === 'decimal' && !/^-?\d+([.,]\d+)?$/.test(textValue)) return 'Please enter a valid decimal number.';
    if (type === 'time' && !/^([01]\d|2[0-3]):([0-5]\d)$/.test(textValue)) return 'Please enter the time in HH:MM format.';
    if (type === 'date' && Number.isNaN(Date.parse(textValue))) return 'Please enter a valid date.';
    return '';
  }

  private resolveQuestionOptions(question: Question): string[] {
    if (question.options && question.options.length > 0) return question.options;
    if (question.source && SOURCE_OPTIONS[question.source]) return SOURCE_OPTIONS[question.source];
    return [];
  }

  private persistDraft(): void {
    const linkToken = this.route.snapshot.paramMap.get('linkToken');
    if (!linkToken || !this.autoSaveReady) return;

    this.onboardingService.saveProgress(linkToken, {
      formData: this.form().getRawValue() as Record<string, unknown>,
      progressPercent: this.progressPercent(),
    }).subscribe({
      next: (instance: OnboardingInstance) => {
        this.instance.set(instance);
      },
    });
  }

  private initializeLegacyFlow(): void {
    this.questionService.getQuestions().subscribe({
      next: (allQuestions: Question[]) => {
        const selected = this.getSelectedSections();
        const questions = selected.length
          ? allQuestions.filter((q: Question) => selected.includes(q.sectionId))
          : allQuestions;
        this.setupForm(questions, {});
      },
      error: (err: unknown) => {
        console.error('Failed to load questions:', err);
        this.loading.set(false);
      },
    });
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
