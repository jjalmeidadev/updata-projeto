import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { QuestionService, SECTION_LABELS } from '../services/question.service';
import { Question } from '../models/question.model';
import { DynamicFieldComponent } from '../components/dynamic-field/dynamic-field.component';

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
          }
          if (params['fromUpload']) {
            this.fromUpload.set(true);
          }
        });

        // Handle uploaded data
        this.handleUploadedData(builtForm);
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
    this.submitted.set(true);
    console.log('Onboarding form submitted:', this.form().value);
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