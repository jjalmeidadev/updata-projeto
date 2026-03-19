import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { QuestionService, SECTION_LABELS, SOURCE_OPTIONS } from '../services/question.service';
import { Question, QuestionType } from '../models/question.model';
import { DynamicFieldComponent } from '../components/dynamic-field/dynamic-field.component';

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

  ngOnInit(): void {
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
  readonly currentSectionLabel = computed(() => this.sectionLabels[this.currentSection()] ?? this.currentSection());
  readonly currentQuestions = computed(() => this.questionService.getQuestionsBySection(this.questions(), this.currentSection()));
  readonly isFirstSection = computed(() => this.currentSectionIndex() === 0);
  readonly isLastSection = computed(() => this.currentSectionIndex() === this.sections().length - 1);
  readonly progressPercent = computed(() => {
    const questions = this.questions();
    const values = this.formValues();
    if (questions.length === 0) return 0;
    const filled = questions.filter((q: Question) => {
      const val = values[q.id];
      if (q.type === 'boolean') return typeof val === 'boolean';
      if (q.type === 'multi-select') return Array.isArray(val) && val.length > 0;
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
      
      // If coming from upload, go to upload screen of next section
      if (this.fromUpload()) {
        sessionStorage.setItem('uploadSectionIndex', nextSectionIndex.toString());
        this.router.navigate(['/upload']);
      } else {
        this.currentSectionIndex.update((i: number) => i + 1);
      }
    }
  }
  previous(): void { if (!this.isFirstSection()) this.currentSectionIndex.update((i: number) => i - 1); }
  goTo(index: number): void { this.currentSectionIndex.set(index); }

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