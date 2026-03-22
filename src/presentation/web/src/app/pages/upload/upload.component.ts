import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { QuestionService } from '../../services/question.service';
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
  readonly loading = signal(true);
  readonly uploading = signal(false);
  readonly fileName = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  readonly totalQuestionsLength = computed(() => this.questions().length);
  readonly uploadProgress = computed(() => (this.uploading() ? 50 : 0));

  ngOnInit(): void {
    this.questionService.getQuestions().subscribe({
      next: (allQuestions: Question[]) => {
        const selected = this.getSelectedSections();
        const filteredQuestions = selected.length
          ? allQuestions.filter((q: Question) => selected.includes(q.sectionId))
          : allQuestions;
        this.questions.set(filteredQuestions);
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

      this.successMessage.set(`File sent successfully. Trace ID: ${payload.traceId || traceId}`);
      this.router.navigate(['/form']);
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

  triggerFileInput(): void {
    const input = document.getElementById('fileInput') as HTMLInputElement;
    input?.click();
  }

  goToManualForm(): void {
    this.router.navigate(['/form']);
  }

  async downloadTemplate(): Promise<void> {
    const questions = this.questions();

    if (questions.length === 0) {
      this.errorMessage.set('No sections available to generate template.');
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const usedSheetNames = new Set<string>();
    const sectionLabels = this.questionService.getSections(questions).reduce(
      (acc, section) => ({
        ...acc,
        [section]: section.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
      }),
      {} as Record<string, string>
    );

    const sections = this.questionService.getSections(questions);

    for (const sectionId of sections) {
      const sectionQuestions = this.questionService
        .getQuestionsBySection(questions, sectionId)
        .sort((a, b) => a.order - b.order);

      const sectionLabel = sectionLabels[sectionId] ?? sectionId;
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

        ws.getCell(2, c).value = q.question;
        ws.getCell(3, c).value = q.description ?? '';
        ws.getCell(4, c).value = isBoolean ? 'Answer with Yes or No' : '';

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
      ws.getRow(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFBFE7E2' } };
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

  private getSelectedSections(): string[] {
    try {
      const raw = localStorage.getItem('selectedSections');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  onSubmit(): void {
    // Navigate to form - file upload or manual form will have already directed here
    this.router.navigate(['/form']);
  }
}
