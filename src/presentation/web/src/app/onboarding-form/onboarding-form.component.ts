import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
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

  readonly questions = signal<Question[]>([]);
  readonly sections = signal<string[]>([]);
  readonly currentSectionIndex = signal(0);
  readonly form = signal(new FormGroup({}));
  readonly submitted = signal(false);
  readonly loading = signal(true);

  readonly sectionLabels = SECTION_LABELS;

  ngOnInit(): void {
    this.questionService.getQuestions().subscribe({
      next: questions => {
        this.questions.set(questions);
        this.sections.set(this.questionService.getSections(questions));
        this.form.set(this.buildForm(questions));
        this.loading.set(false);
      },
      error: err => {
        console.error('Failed to load questions:', err);
        this.loading.set(false);
      }
    });
  }

  private buildForm(questions: Question[]): FormGroup {
    const controls: Record<string, FormControl> = {};
    for (const q of questions) {
      const defaultValue = q.type === 'boolean' ? false
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
  readonly progressPercent = computed(() => Math.round(((this.currentSectionIndex() + 1) / this.sections().length) * 100));

  control(questionId: string): FormControl {
    return this.form().get(questionId) as FormControl;
  }

  next(): void { if (!this.isLastSection()) this.currentSectionIndex.update(i => i + 1); }
  previous(): void { if (!this.isFirstSection()) this.currentSectionIndex.update(i => i - 1); }
  goTo(index: number): void { this.currentSectionIndex.set(index); }

  submit(): void {
    this.submitted.set(true);
    console.log('Onboarding form submitted:', this.form().value);
  }
}