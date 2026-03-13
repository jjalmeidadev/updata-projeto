import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { QuestionService, SECTION_LABELS } from '../../services/question.service';
import { Question } from '../../models/question.model';
import * as XLSX from 'xlsx';

type SheetRow = Record<string, unknown>;

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
    const questions = this.questions();
    if (questions.length === 0) return 0;
    const completed = Array.from(this.completedSections()).length;
    return Math.round((completed / this.sections().length) * 100);
  });

  readonly currentSectionQuestionsLength = computed(() => 
    this.currentSectionQuestions().length
  );

  ngOnInit(): void {
    this.questionService.getQuestions().subscribe({
      next: (questions: Question[]) => {
        this.questions.set(questions);
        this.sections.set(this.questionService.getSections(questions));
        this.loading.set(false);

        // Check if there's a section index in query params
        const storedIndex = sessionStorage.getItem('uploadSectionIndex');
        if (storedIndex) {
          this.currentSectionIndex.set(parseInt(storedIndex, 10));
          sessionStorage.removeItem('uploadSectionIndex');
        }

        // Load completed sections from session
        const completedStr = sessionStorage.getItem('completedSections');
        if (completedStr) {
          const completed = JSON.parse(completedStr);
          this.completedSections.set(new Set(completed));
        }
      },
      error: (err: unknown) => {
        console.error('Failed to load questions:', err);
        this.loading.set(false);
      }
    });
  }

  onFileSelect(event: Event): void {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];

    if (!file) {
      return;
    }

    // Validate file type
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
      'application/vnd.ms-excel', // xls
      'text/csv'
    ];
    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));

    if (!validExtensions.includes(fileExtension)) {
      this.errorMessage.set('Please upload a valid CSV or Excel file (.csv, .xlsx, .xls)');
      return;
    }

    this.errorMessage.set(null);
    this.fileName.set(file.name);
    this.uploading.set(true);

    const reader = new FileReader();

    reader.onload = async (e: ProgressEvent<FileReader>) => {
      const result = e.target?.result;

      if (!result) {
        this.errorMessage.set('Failed to read file');
        this.uploading.set(false);
        return;
      }

      try {
        const data = new Uint8Array(result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet) as SheetRow[];

        if (rows.length === 0) {
          this.errorMessage.set('The file appears to be empty');
          this.uploading.set(false);
          return;
        }

        // Mark this section as completed
        const completed = Array.from(this.completedSections());
        completed.push(this.currentSectionIndex());
        sessionStorage.setItem('completedSections', JSON.stringify(completed));
        this.completedSections.set(new Set(completed));

        // Store data and section info for the form
        sessionStorage.setItem('uploadedData', JSON.stringify(rows));
        sessionStorage.setItem('uploadedSection', this.currentSection());
        sessionStorage.setItem('uploadSectionIndex', this.currentSectionIndex().toString());

        // Navigate to form
        this.router.navigate(['/form'], {
          queryParams: { section: this.currentSectionIndex(), fromUpload: true }
        });

      } catch (error) {
        console.error('Parse error:', error);
        this.errorMessage.set('Failed to parse the file. Please check the format.');
        this.uploading.set(false);
      }
    };

    reader.onerror = () => {
      this.errorMessage.set('Error reading file');
      this.uploading.set(false);
    };

    reader.readAsArrayBuffer(file);
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
    this.uploading.set(false);
  }

  triggerFileInput(): void {
    const input = document.getElementById('fileInput') as HTMLInputElement;
    input?.click();
  }
}
