import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { QuestionService, SECTION_LABELS } from '../../services/question.service';
import { Question } from '../../models/question.model';

interface UploadApiResponse {
  redirect?: string;
  s3Key?: string;
  fileName?: string;
  traceId?: string;
  error?: string;
}

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './upload.component.html',
  styleUrl: './upload.component.css',
})
export class UploadComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly questionService = inject(QuestionService);

  readonly questions = signal<Question[]>([]);
  readonly sections = signal<string[]>([]);
  readonly currentSectionIndex = signal(0);
  readonly loading = signal(true);
  readonly uploading = signal(false);
  readonly fileName = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly completedSections = signal<Set<number>>(new Set());

  readonly sectionLabels = SECTION_LABELS;

  readonly currentSection = computed(() => this.sections()[this.currentSectionIndex()]);
  readonly currentSectionLabel = computed(() => this.sectionLabels[this.currentSection()] ?? this.currentSection());
  readonly isFirstSection = computed(() => this.currentSectionIndex() === 0);
  readonly isLastSection = computed(() => this.currentSectionIndex() === this.sections().length - 1);

  readonly currentSectionQuestions = computed(() =>
    this.questionService.getQuestionsBySection(this.questions(), this.currentSection())
  );

  readonly progressPercent = computed(() => {
    const sections = this.sections();
    if (sections.length === 0) return 0;
    const completed = this.completedSections().size;
    return Math.round((completed / sections.length) * 100);
  });

  readonly currentSectionQuestionsLength = computed(() => this.currentSectionQuestions().length);

  ngOnInit(): void {
    this.questionService.getQuestions().subscribe({
      next: (allQuestions: Question[]) => {
        const selected = this.getSelectedSections();

        const filteredQuestions = selected.length
          ? allQuestions.filter((q: Question) => selected.includes(q.sectionId))
          : allQuestions;

        this.questions.set(filteredQuestions);

        const filteredSections = this.questionService.getSections(filteredQuestions);
        this.sections.set(filteredSections);

        if (filteredSections.length === 0) {
          this.loading.set(false);
          return;
        }

        const storedIndex = sessionStorage.getItem('uploadSectionIndex');
        if (storedIndex) {
          const parsed = parseInt(storedIndex, 10);
          if (!isNaN(parsed) && parsed >= 0 && parsed < filteredSections.length) {
            this.currentSectionIndex.set(parsed);
          } else {
            this.currentSectionIndex.set(0);
          }
          sessionStorage.removeItem('uploadSectionIndex');
        }

        const completedStr = sessionStorage.getItem('completedSections');
        if (completedStr) {
          try {
            const completed = JSON.parse(completedStr) as unknown;
            if (Array.isArray(completed)) {
              const valid = completed
                .filter((v: unknown) => typeof v === 'number')
                .filter((v: number) => v >= 0 && v < filteredSections.length);
              this.completedSections.set(new Set(valid));
            }
          } catch {
            this.completedSections.set(new Set());
          }
        }

        this.loading.set(false);
      },
      error: (err: unknown) => {
        console.error('Failed to load questions:', err);
        this.loading.set(false);
      }
    });
  }

  async onFileSelect(event: Event): Promise<void> {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];

    if (!file) {
      return;
    }

    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));

    if (!validExtensions.includes(fileExtension)) {
      this.errorMessage.set('Please upload a valid CSV or Excel file (.csv, .xlsx, .xls)');
      return;
    }

    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.fileName.set(file.name);
    this.uploading.set(true);

    try {
      const traceId = `front-${Date.now()}`;
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'x-debug-trace-id': traceId,
        },
        body: formData,
      });

      const payload = (await response.json()) as UploadApiResponse;

      if (!response.ok) {
        throw new Error(payload.error || 'Upload failed');
      }

      const completed = new Set(this.completedSections());
      completed.add(this.currentSectionIndex());
      this.completedSections.set(completed);
      sessionStorage.setItem('completedSections', JSON.stringify(Array.from(completed)));
      sessionStorage.setItem('uploadSectionIndex', this.currentSectionIndex().toString());

      this.successMessage.set(`File sent successfully. Trace ID: ${payload.traceId || traceId}`);

      this.router.navigate([payload.redirect || '/form'], {
        queryParams: { section: this.currentSectionIndex(), fromUpload: true }
      });
    } catch (error) {
      console.error('Upload error:', error);
      this.errorMessage.set(
        error instanceof Error ? error.message : 'Failed to upload file. Please try again.'
      );
    } finally {
      this.uploading.set(false);
      target.value = '';
    }
  }

  goToManualForm(): void {
    sessionStorage.setItem('uploadSectionIndex', this.currentSectionIndex().toString());
    this.router.navigate(['/form'], {
      queryParams: { section: this.currentSectionIndex(), isManual: true }
    });
  }

  goToSection(index: number): void {
    if (index >= 0 && index < this.sections().length) {
      this.currentSectionIndex.set(index);
      this.resetUploadState();
    }
  }

  next(): void {
    if (!this.isLastSection()) {
      this.currentSectionIndex.update((i: number) => i + 1);
      this.resetUploadState();
    }
  }

  previous(): void {
    if (!this.isFirstSection()) {
      this.currentSectionIndex.update((i: number) => i - 1);
      this.resetUploadState();
    }
  }

  private resetUploadState(): void {
    this.fileName.set(null);
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.uploading.set(false);
  }

  triggerFileInput(): void {
    const input = document.getElementById('fileInput') as HTMLInputElement;
    input?.click();
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
