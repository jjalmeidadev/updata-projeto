import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { QuestionService } from '../../services/question.service';
import { Question, QuestionType } from '../../models/question.model';
import ExcelJS from 'exceljs';

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

const REVIEW_STATE_KEY = 'reviewState';
const UPLOADED_DATA_KEY = 'uploadedData';

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
      },
    });
  }

  async onFileSelect(event: Event): Promise<void> {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];

    if (!file) {
      return;
    }

    const validExtensions = ['.xlsx', '.csv'];
    const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));

    if (!validExtensions.includes(fileExtension)) {
      this.errorMessage.set('Please upload a valid template file (.xlsx or .csv).');
      target.value = '';
      return;
    }

    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.fileName.set(file.name);
    this.uploading.set(true);

    try {
      const parsedValues =
        fileExtension === '.csv'
          ? await this.parseCsvFile(file)
          : await this.parseExcelTemplate(file);

      const reviewItems = this.collectTemplateReviewItems(parsedValues);

      sessionStorage.setItem(UPLOADED_DATA_KEY, JSON.stringify(parsedValues));
      sessionStorage.setItem(
        REVIEW_STATE_KEY,
        JSON.stringify({
          source: 'template',
          issues: reviewItems,
        })
      );

      this.router.navigate(['/review'], {
        state: {
          reviewSource: 'template',
          reviewIssues: reviewItems,
        },
      });
      return;
    } catch (error) {
      console.error('Upload error:', error);
      this.errorMessage.set(
        error instanceof Error ? error.message : 'Failed to process the uploaded file.'
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
        [section]: section.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
      }),
      {} as Record<string, string>
    );

    const sections = this.questionService.getSections(questions);

    for (const sectionId of sections) {
      const sectionQuestions = this.questionService
        .getQuestionsBySection(questions, sectionId)
        .sort((a: Question, b: Question) => a.order - b.order);

      const sectionLabel = sectionLabels[sectionId] ?? sectionId;
      const baseName = this.sheetName(sectionLabel);
      const uniqueName = this.uniqueSheetName(baseName, usedSheetNames);
      const ws = workbook.addWorksheet(uniqueName, { views: [{ state: 'frozen', ySplit: 3 }] });

      const colCount = Math.max(sectionQuestions.length, 1);

      ws.mergeCells(1, 1, 1, colCount);

      const title = ws.getCell(1, 1);
      title.value = sectionLabel.toUpperCase();
      title.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 14 };
      title.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2B2D42' } };
      title.alignment = { horizontal: 'center', vertical: 'middle' };
      ws.getRow(1).height = 28;

      sectionQuestions.forEach((q: Question, i: number) => {
        const c = i + 1;
        const isBoolean = q.type === 'boolean';

        ws.getCell(2, c).value = q.question;
        ws.getCell(3, c).value = q.description ?? '';

        ws.getColumn(c).width = Math.min(42, Math.max(20, Math.ceil((q.question?.length ?? 20) / 1.2)));

        if (isBoolean) {
          const cell = ws.getCell(4, c);
          cell.dataValidation = {
            type: 'list',
            allowBlank: true,
            formulae: ['"Yes,No"'],
            showErrorMessage: true,
            errorTitle: 'Invalid value',
            error: 'Please select Yes or No.',
          };
        }
      });

      [2, 3, 4].forEach((r: number) => {
        for (let col = 1; col <= colCount; col++) {
          const cell = ws.getCell(r, col);

          cell.alignment = {
            wrapText: true,
            vertical: 'top',
            horizontal: r === 2 ? 'center' : 'left',
          };

          cell.border = {
            top: { style: 'thin', color: { argb: 'FFBDBDBD' } },
            left: { style: 'thin', color: { argb: 'FFBDBDBD' } },
            bottom: { style: 'thin', color: { argb: 'FFBDBDBD' } },
            right: { style: 'thin', color: { argb: 'FFBDBDBD' } },
          };
        }
      });

      ws.getRow(2).font = { bold: true };
      ws.getRow(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFBFE7E2' } };

      ws.getRow(3).font = { italic: true, color: { argb: 'FF1F2937' } };
      ws.getRow(3).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } };

      ws.getRow(4).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };

      ws.autoFilter = { from: { row: 2, column: 1 }, to: { row: 2, column: colCount } };
    }

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `equiem-template-${new Date().toISOString().slice(0, 10)}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  }

  onSubmit(): void {
    this.router.navigate(['/form']);
  }

  private async parseExcelTemplate(file: File): Promise<Record<string, unknown>> {
    const workbook = new ExcelJS.Workbook();
    const arrayBuffer = await file.arrayBuffer();
    await workbook.xlsx.load(arrayBuffer);

    const values: Record<string, unknown> = {};

    workbook.worksheets.forEach((worksheet: ExcelJS.Worksheet) => {
      const sectionQuestions = this.getQuestionsForWorksheet(worksheet.name);

      if (sectionQuestions.length === 0) {
        return;
      }

      const headerRow = worksheet.getRow(2);
      const dataRow = worksheet.getRow(4);

      const maxColumns = Math.max(headerRow.cellCount, dataRow.cellCount);

      for (let col = 1; col <= maxColumns; col++) {
        const header = this.cellToString(headerRow.getCell(col).value).trim();
        if (!header) {
          continue;
        }

        const question = sectionQuestions.find((q: Question) => {
          const byQuestion = this.normalizeText(q.question) === this.normalizeText(header);
          const byId = this.normalizeText(q.id) === this.normalizeText(header);
          return byQuestion || byId;
        });

        if (!question) {
          continue;
        }

        const rawValue = this.cellToString(dataRow.getCell(col).value);
        values[question.id] = this.normalizeParsedValue(question.type, rawValue);
      }
    });

    return values;
  }

  private async parseCsvFile(file: File): Promise<Record<string, unknown>> {
    const text = await file.text();
    const lines = text
      .split(/\r?\n/)
      .map((line: string) => line.trim())
      .filter(Boolean);

    if (lines.length < 2) {
      return {};
    }

    const headers = lines[0].split(',').map((item: string) => item.trim());
    const firstDataRow = lines[1].split(',').map((item: string) => item.trim());

    const values: Record<string, unknown> = {};

    headers.forEach((header: string, index: number) => {
      const question = this.findQuestionByHeader(header);
      if (!question) {
        return;
      }

      values[question.id] = this.normalizeParsedValue(question.type, firstDataRow[index] ?? '');
    });

    return values;
  }

  private collectTemplateReviewItems(values: Record<string, unknown>): ReviewIssue[] {
    return this.questions().map((question: Question) => {
      const value = values[question.id];
      const error = this.validateQuestionValue(question.type, value);

      return {
        id: question.id,
        label: question.question,
        value,
        type: question.type,
        options: question.options ?? [],
        error,
        source: 'template',
        section: question.sectionId,
        row: 4,
      };
    });
  }

  private validateQuestionValue(type: QuestionType, value: unknown): string {
    if (type === 'file') {
      const textValue = value === null || value === undefined ? '' : String(value).trim();

      if (!textValue) {
        return 'Please provide at least one file reference.';
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

  private normalizeParsedValue(type: QuestionType, rawValue: string): unknown {
    const value = rawValue.trim();

    if (type === 'boolean') {
      const normalized = value.toLowerCase();
      if (['yes', 'true'].includes(normalized)) {
        return true;
      }
      if (['no', 'false'].includes(normalized)) {
        return false;
      }
      return value;
    }

    if (type === 'multi-select') {
      if (!value) {
        return [];
      }

      return value
        .split(',')
        .map((item: string) => item.trim())
        .filter(Boolean);
    }

    if (type === 'file') {
      return value;
    }

    return value;
  }

  private getQuestionsForWorksheet(sheetName: string): Question[] {
    const normalizedSheetName = this.normalizeText(sheetName);

    const questionsBySection = new Map<string, Question[]>();

    for (const question of this.questions()) {
      const current = questionsBySection.get(question.sectionId) ?? [];
      current.push(question);
      questionsBySection.set(question.sectionId, current);
    }

    for (const [sectionId, questions] of questionsBySection.entries()) {
      const sectionLabel = sectionId
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (letter: string) => letter.toUpperCase());

      const possibleNames = [
        this.normalizeText(sectionId),
        this.normalizeText(sectionLabel),
        this.normalizeText(this.sheetName(sectionLabel)),
      ];

      if (possibleNames.includes(normalizedSheetName)) {
        return questions;
      }
    }

    return [];
  }

  private findQuestionByHeader(header: string): Question | undefined {
    const normalizedHeader = this.normalizeText(header);

    return this.questions().find((q: Question) => {
      const byQuestion = this.normalizeText(q.question) === normalizedHeader;
      const byId = this.normalizeText(q.id) === normalizedHeader;
      return byQuestion || byId;
    });
  }

  private normalizeText(value: string): string {
    return value.toLowerCase().replace(/\s+/g, ' ').trim();
  }

  private cellToString(value: ExcelJS.CellValue | undefined | null): string {
    if (value === null || value === undefined) {
      return '';
    }

    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }

    if (value instanceof Date) {
      return value.toISOString().slice(0, 10);
    }

    if (typeof value === 'object' && 'text' in value) {
      return String(value.text ?? '');
    }

    if (typeof value === 'object' && 'result' in value) {
      return String(value.result ?? '');
    }

    return String(value);
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
}