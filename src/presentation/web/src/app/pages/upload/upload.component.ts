import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { QuestionService, SECTION_LABELS } from '../../services/question.service';
import { Question } from '../../models/question.model';
import ExcelJS from 'exceljs';

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

  async downloadTemplate(): Promise<void> {
    const sections = this.sections();
    const questions = this.questions();

    if (!sections.length || !questions.length) {
      this.errorMessage.set('No sections available to generate template.');
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const usedSheetNames = new Set<string>();

    for (const sectionId of sections) {
      const sectionQuestions = this.questionService
        .getQuestionsBySection(questions, sectionId)
        .sort((a, b) => a.order - b.order);

      const sectionLabel = this.sectionLabels[sectionId] ?? sectionId;
      const baseName = this.sheetName(sectionLabel);
      const uniqueName = this.uniqueSheetName(baseName, usedSheetNames);
      const ws = workbook.addWorksheet(uniqueName, { views: [{ state: 'frozen', ySplit: 4 }] });

      const colCount = Math.max(sectionQuestions.length, 1);

      ws.mergeCells(1, 1, 1, colCount);
      const title = ws.getCell(1, 1);
      title.value = sectionLabel.toUpperCase();
      title.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 14 };
      title.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2B2D42' } };
      title.alignment = { horizontal: 'center', vertical: 'middle' };
      ws.getRow(1).height = 28;

      sectionQuestions.forEach((q, i) => {
        const c = i + 1;
        const isBoolean = q.type === 'boolean';

        ws.getCell(2, c).value = q.question;                 // Header
        ws.getCell(3, c).value = q.description ?? '';        // Description
        ws.getCell(4, c).value = isBoolean ? 'Answer with Yes or No' : ''; // Instructions only when useful

        ws.getColumn(c).width = Math.min(42, Math.max(20, Math.ceil((q.question?.length ?? 20) / 1.2)));

        if (isBoolean) {
          for (let row = 5; row <= 200; row++) {
            const cell = ws.getCell(row, c);
            cell.dataValidation = {
              type: 'list',
              allowBlank: true,
              formulae: ['"Yes,No"'],
              showErrorMessage: true,
              errorTitle: 'Invalid value',
              error: 'Please select Yes or No.'
            };
          }
        }
      });

      [2, 3, 4].forEach((r) => {
        ws.getRow(r).eachCell({ includeEmpty: true }, (cell, col) => {
          if (col > colCount) return;
          cell.alignment = { wrapText: true, vertical: 'top', horizontal: r === 2 ? 'center' : 'left' };
          cell.border = {
            top: { style: 'thin', color: { argb: 'FFBDBDBD' } },
            left: { style: 'thin', color: { argb: 'FFBDBDBD' } },
            bottom: { style: 'thin', color: { argb: 'FFBDBDBD' } },
            right: { style: 'thin', color: { argb: 'FFBDBDBD' } },
          };
        });
      });

      ws.getRow(2).font = { bold: true };
      ws.getRow(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFBFE7E2' } }; // verde água
      ws.getRow(3).font = { italic: true, color: { argb: 'FF1F2937' } };
      ws.getRow(4).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } };

      for (let r = 5; r <= 12; r++) {
        for (let c = 1; c <= colCount; c++) {
          const cell = ws.getCell(r, c);
          cell.border = {
            top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
            left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
            bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
            right: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          };
        }
      }

      ws.autoFilter = { from: { row: 2, column: 1 }, to: { row: 2, column: colCount } };
    }

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `equiem-template-${new Date().toISOString().slice(0, 10)}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  }

  private sheetName(label: string): string {
    return label.replace(/[\\/?*[\]:]/g, '').slice(0, 31);
  }

  private uniqueSheetName(base: string, used: Set<string>): string {
    let name = base || 'Sheet';
    let index = 1;
    while (used.has(name.toLowerCase())) {
      const suffix = `-${index++}`;
      name = `${base.slice(0, 31 - suffix.length)}${suffix}`;
    }
    used.add(name.toLowerCase());
    return name;
  }

  private getExampleValue(type: string, question: string): string {
    if (type === 'integer' || type === 'decimal') return '0';
    if (type === 'boolean') return 'true/false';
    if (type === 'date') return 'YYYY-MM-DD';
    if (type === 'time') return 'HH:mm';
    if (question.toLowerCase().includes('email')) return 'example@company.com';
    return 'example';
  }
}
