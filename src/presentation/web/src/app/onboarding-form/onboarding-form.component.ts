import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { QuestionService, SECTION_LABELS, SOURCE_OPTIONS } from '../services/question.service';
import { Question, QuestionType } from '../models/question.model';
import { DynamicFieldComponent } from '../components/dynamic-field/dynamic-field.component';
import { debounceTime } from 'rxjs';
import { OnboardingInstance } from '../models/onboarding-instance.model';
import { OnboardingInstanceService } from '../services/onboarding-instance.service';

type ReviewSource = 'manual' | 'template';

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
})
export class OnboardingFormComponent implements OnInit {
  private readonly questionService = inject(QuestionService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly onboardingService = inject(OnboardingInstanceService);

  readonly questions = signal<Question[]>([]);
  readonly sections = signal<string[]>([]);
  readonly currentSectionIndex = signal(0);
  readonly form = signal(new FormGroup({}));
  readonly submitted = signal(false);
  readonly loading = signal(true);
  readonly fromUpload = signal(false);
  readonly formVersion = signal(0);
  readonly instance = signal<OnboardingInstance | null>(null);
  readonly pageMessage = signal('');
  private autoSaveReady = false;

  readonly sectionLabels = SECTION_LABELS;

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

            this.questions.set(questions);
            this.sections.set(this.questionService.getSections(questions));

            const builtForm = this.buildForm(questions);
            this.form.set(builtForm);
            this.applyValuesToForm(builtForm, instance.formData ?? {});

            builtForm.valueChanges.subscribe(() => {
              this.formVersion.update((value: number) => value + 1);
            });

            builtForm.valueChanges.pipe(debounceTime(500)).subscribe(() => {
              if (this.autoSaveReady && !this.submitted()) {
                this.persistDraft();
              }
            });

            this.loading.set(false);

            this.route.queryParams.subscribe((params: Params) => {
              this.fromUpload.set(params['fromUpload'] === 'true' || params['fromUpload'] === true);

              if (params['section']) {
                const sectionIndex = parseInt(params['section'], 10);
                if (!Number.isNaN(sectionIndex) && sectionIndex >= 0 && sectionIndex < this.sections().length) {
                  this.currentSectionIndex.set(sectionIndex);
                }
              } else {
                this.restoreReviewSectionIndex();
              }

              const shouldAutoSubmit =
                params['autoSubmit'] === 'true' ||
                params['autoSubmit'] === true ||
                history.state?.['autoSubmit'] === true;

              this.handleUploadedData(builtForm);
              this.applyReviewCorrections(builtForm);
              this.formVersion.update((value: number) => value + 1);
              this.autoSaveReady = true;

              if (shouldAutoSubmit) {
                setTimeout(() => {
                  this.completeSubmission();
                });
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
          },
          error: (err: unknown) => {
            console.error('Failed to load questions:', err);
            this.loading.set(false);
          },
        });
      },
      error: () => {
        this.pageMessage.set('Failed to load onboarding link.');
        this.loading.set(false);
      },
    });
  }

  readonly currentSection = computed(() => this.sections()[this.currentSectionIndex()]);

  readonly currentSectionLabel = computed(
    () => this.sectionLabels[this.currentSection()] ?? this.currentSection()
  );

  readonly currentQuestions = computed(() =>
    this.questionService.getQuestionsBySection(this.questions(), this.currentSection())
  );

  readonly isFirstSection = computed(() => this.currentSectionIndex() === 0);

  readonly isLastSection = computed(() => this.currentSectionIndex() === this.sections().length - 1);

  readonly progressPercent = computed(() => {
    this.formVersion();

    const questions = this.questions();
    const values = this.form().getRawValue() as Record<string, unknown>;

    if (questions.length === 0) {
      return 0;
    }

    const filled = questions.filter((q: Question) => {
      const val = values[q.id];

      if (q.type === 'boolean') {
        return typeof val === 'boolean';
      }

      if (q.type === 'multi-select') {
        return Array.isArray(val) && val.length > 0;
      }

      if (q.type === 'file') {
        if (this.fromUpload()) {
          return true;
        }

        if (Array.isArray(val)) {
          return val.length > 0;
        }

        return val !== '' && val !== null && val !== undefined;
      }

      return val !== '' && val !== null && val !== undefined;
    }).length;

    return Math.round((filled / questions.length) * 100);
  });

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
    }

    this.persistDraft();
  }

  previous(): void {
    if (!this.isFirstSection()) {
      this.currentSectionIndex.update((i: number) => i - 1);
    }

    this.persistDraft();
  }

  goTo(index: number): void {
    this.currentSectionIndex.set(index);
    this.persistDraft();
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

      const reviewState: ReviewState = {
        source: reviewSource,
        issues: reviewItems,
      };

      sessionStorage.setItem(REVIEW_STATE_KEY, JSON.stringify(reviewState));
      sessionStorage.setItem(REVIEW_FORM_DRAFT_KEY, JSON.stringify(this.form().getRawValue()));
      sessionStorage.setItem(REVIEW_SECTION_INDEX_KEY, this.currentSectionIndex().toString());

      const linkToken = this.route.snapshot.paramMap.get('linkToken');
      if (!linkToken) {
        this.router.navigate(['/review'], {
          state: {
            reviewSource,
            reviewIssues: reviewItems,
          },
        });
        return;
      }

      this.router.navigate(['/onboarding', linkToken, 'review'], {
        state: {
          reviewSource,
          reviewIssues: reviewItems,
        },
      });
      return;
    }

    this.completeSubmission();
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
      error: () => {
        this.pageMessage.set('Failed to submit onboarding.');
      },
    });
  }

  private handleUploadedData(form: FormGroup): void {
    const fromUploadQuery =
      this.route.snapshot.queryParamMap.get('fromUpload') === 'true';

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

    sessionStorage.removeItem(UPLOADED_DATA_KEY);

    const uploadSectionIndex = sessionStorage.getItem(UPLOAD_SECTION_INDEX_KEY);
    if (uploadSectionIndex) {
      const sectionIndex = parseInt(uploadSectionIndex, 10);
      if (!Number.isNaN(sectionIndex) && sectionIndex >= 0 && sectionIndex < this.sections().length) {
        this.currentSectionIndex.set(sectionIndex);
      }
      sessionStorage.removeItem(UPLOAD_SECTION_INDEX_KEY);
    }
  }

  private buildForm(questions: Question[]): FormGroup {
    const controls: Record<string, FormControl> = {};

    for (const q of questions) {
      const defaultValue =
        q.type === 'boolean'
          ? null
          : q.type === 'multi-select'
            ? []
            : q.type === 'file'
              ? []
              : '';

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
      if (!control) {
        continue;
      }

      const question = this.questions().find((q: Question) => q.id === fieldId);
      const normalizedValue = this.normalizeValueForQuestion(question, value);
      control.setValue(normalizedValue);
    }
  }

  private normalizeValueForQuestion(question: Question | undefined, value: unknown): unknown {
    if (!question) {
      return value;
    }

    if (question.type === 'boolean') {
      if (typeof value === 'boolean') {
        return value;
      }

      const normalized = String(value ?? '').trim().toLowerCase();

      if (['yes', 'true'].includes(normalized)) {
        return true;
      }

      if (['no', 'false'].includes(normalized)) {
        return false;
      }

      return null;
    }

    if (question.type === 'multi-select') {
      if (Array.isArray(value)) {
        return value;
      }

      const text = String(value ?? '').trim();
      if (!text) {
        return [];
      }

      return text
        .split(',')
        .map((item: string) => item.trim())
        .filter(Boolean);
    }

    if (question.type === 'file') {
      if (Array.isArray(value)) {
        return value;
      }

      const text = String(value ?? '').trim();
      return text ? text : [];
    }

    return value ?? '';
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
      if (this.fromUpload()) {
        return '';
      }

      if (Array.isArray(value)) {
        if (value.length === 0) {
          return 'Please upload at least one file.';
        }
        return '';
      }

      const textValue = value === null || value === undefined ? '' : String(value).trim();
      if (!textValue) {
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

  private persistDraft(): void {
    const linkToken = this.route.snapshot.paramMap.get('linkToken');
    if (!linkToken || !this.autoSaveReady) {
      return;
    }

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

        this.questions.set(questions);
        this.sections.set(this.questionService.getSections(questions));

        const builtForm = this.buildForm(questions);
        this.form.set(builtForm);

        builtForm.valueChanges.subscribe(() => {
          this.formVersion.update((value: number) => value + 1);
        });

        this.loading.set(false);

        this.route.queryParams.subscribe((params: Params) => {
          this.fromUpload.set(params['fromUpload'] === 'true' || params['fromUpload'] === true);

          if (params['section']) {
            const sectionIndex = parseInt(params['section'], 10);
            if (!Number.isNaN(sectionIndex) && sectionIndex >= 0 && sectionIndex < this.sections().length) {
              this.currentSectionIndex.set(sectionIndex);
            }
          } else {
            this.restoreReviewSectionIndex();
          }

          const shouldAutoSubmit =
            params['autoSubmit'] === 'true' ||
            params['autoSubmit'] === true ||
            history.state?.['autoSubmit'] === true;

          this.handleUploadedData(builtForm);
          this.applyReviewCorrections(builtForm);
          this.formVersion.update((value: number) => value + 1);
          this.autoSaveReady = true;

          if (shouldAutoSubmit) {
            setTimeout(() => {
              this.completeSubmission();
            });
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
