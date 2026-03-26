import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

type ReviewFieldType =
  | 'text'
  | 'integer'
  | 'number'
  | 'decimal'
  | 'textarea'
  | 'dropdown'
  | 'multi-select'
  | 'boolean'
  | 'time'
  | 'date'
  | 'file';

type ReviewSource = 'manual' | 'template';

interface ReviewIssueInput {
  id: string;
  label: string;
  value: unknown;
  type?: ReviewFieldType | string;
  options?: string[];
  error?: string;
  source?: ReviewSource;
  section?: string;
  row?: number;
}

interface ReviewIssue {
  id: string;
  label: string;
  value: string;
  type: ReviewFieldType;
  options: string[];
  error: string;
  source: ReviewSource;
  section: string;
  row?: number;
}

interface ReviewStatePayload {
  source?: ReviewSource;
  issues?: ReviewIssueInput[];
}

interface ReviewSectionGroup {
  key: string;
  label: string;
  items: ReviewIssue[];
  invalidCount: number;
}

const REVIEW_STATE_KEY = 'reviewState';
const REVIEW_CORRECTIONS_KEY = 'reviewCorrections';

@Component({
  selector: 'app-review-components',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './review-components.html',
  styleUrl: './review-components.css',
})
export class ReviewComponentsComponent implements OnInit {
  private readonly router = inject(Router);

  readonly issues = signal<ReviewIssue[]>([]);
  readonly pageMessage = signal<string | null>(null);
  readonly source = signal<ReviewSource>('manual');
  readonly currentSectionIndex = signal(0);

  readonly groupedSections = computed<ReviewSectionGroup[]>(() => {
    const map = new Map<string, ReviewIssue[]>();

    for (const issue of this.issues()) {
      const key = issue.section || 'general';
      const current = map.get(key) ?? [];
      current.push(issue);
      map.set(key, current);
    }

    return Array.from(map.entries()).map(([key, items]) => ({
      key,
      label: this.formatSectionLabel(key),
      items,
      invalidCount: items.filter((item: ReviewIssue) => Boolean(item.error)).length,
    }));
  });

  readonly sections = computed(() => this.groupedSections().map((group: ReviewSectionGroup) => group.key));

  readonly currentSection = computed(() => this.sections()[this.currentSectionIndex()] ?? '');

  readonly currentSectionGroup = computed<ReviewSectionGroup | null>(() => {
    const sectionKey = this.currentSection();
    return this.groupedSections().find((group: ReviewSectionGroup) => group.key === sectionKey) ?? null;
  });

  readonly currentItems = computed(() => this.currentSectionGroup()?.items ?? []);

  readonly invalidCount = computed(() =>
    this.issues().filter((issue: ReviewIssue) => Boolean(issue.error)).length
  );

  readonly hasIssues = computed(() => this.invalidCount() > 0);
  readonly hasAnyItems = computed(() => this.issues().length > 0);

  readonly isFirstSection = computed(() => this.currentSectionIndex() === 0);
  readonly isLastSection = computed(() => this.currentSectionIndex() === this.sections().length - 1);

  readonly progressPercent = computed(() => {
    const items = this.issues();

    if (items.length === 0) {
      return 0;
    }

    const validCount = items.filter((item: ReviewIssue) => !item.error).length;
    return Math.round((validCount / items.length) * 100);
  });

  readonly pageTitle = computed(() =>
    this.source() === 'template' ? 'Review Invalid Template Data' : 'Review Invalid Data'
  );

  readonly pageSubtitle = computed(() =>
    this.source() === 'template'
      ? 'We found issues in the uploaded template. Review each section and correct the highlighted fields.'
      : 'Review each section and correct the highlighted fields before continuing.'
  );

  ngOnInit(): void {
    const stateIssues = history.state?.['reviewIssues'];
    const stateSource = history.state?.['reviewSource'] as ReviewSource | undefined;
    const fromStorage = this.loadFromStorage();

    const loadedIssues = Array.isArray(stateIssues)
      ? this.normalizeIssues(stateIssues)
      : fromStorage.issues;

    const loadedSource = stateSource ?? fromStorage.source ?? 'manual';

    this.issues.set(loadedIssues);
    this.source.set(loadedSource);

    const firstInvalidSectionIndex = this.groupedSections().findIndex(
      (group: ReviewSectionGroup) => group.invalidCount > 0
    );

    if (firstInvalidSectionIndex >= 0) {
      this.currentSectionIndex.set(firstInvalidSectionIndex);
    }
  }

  formatSectionLabel(section: string): string {
    return section
      .split('-')
      .map((part: string) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  goTo(index: number): void {
    this.currentSectionIndex.set(index);
  }

  previous(): void {
    if (!this.isFirstSection()) {
      this.currentSectionIndex.update((index: number) => index - 1);
    }
  }

  next(): void {
    if (!this.isLastSection()) {
      this.currentSectionIndex.update((index: number) => index + 1);
    }
  }

  private normalizeFieldType(type: unknown): ReviewFieldType {
    const normalized = String(type ?? 'text').trim().toLowerCase();

    if (normalized === 'number') {
      return 'integer';
    }

    if (normalized === 'float' || normalized === 'double') {
      return 'decimal';
    }

    if (normalized === 'select') {
      return 'dropdown';
    }

    if (
      normalized === 'text' ||
      normalized === 'integer' ||
      normalized === 'decimal' ||
      normalized === 'textarea' ||
      normalized === 'dropdown' ||
      normalized === 'multi-select' ||
      normalized === 'boolean' ||
      normalized === 'time' ||
      normalized === 'date' ||
      normalized === 'file'
    ) {
      return normalized;
    }

    return 'text';
  }

  inputType(type: ReviewFieldType): 'text' | 'date' | 'time' {
    if (type === 'date') {
      return 'date';
    }

    if (type === 'time') {
      return 'time';
    }

    return 'text';
  }

  onValueChange(issueId: string, value: string): void {
    this.issues.update((current: ReviewIssue[]) =>
      current.map((issue: ReviewIssue) => {
        if (issue.id !== issueId) {
          return issue;
        }

        return {
          ...issue,
          value,
          error: this.validateValue(value, issue.type, issue.options),
        };
      })
    );

    this.pageMessage.set(null);
  }

  saveCorrections(): void {
    const validated = this.issues().map((issue: ReviewIssue) => ({
      ...issue,
      error: this.validateValue(issue.value, issue.type, issue.options),
    }));

    this.issues.set(validated);

    const firstInvalidSectionIndex = this.groupedSections().findIndex(
      (group: ReviewSectionGroup) => group.invalidCount > 0
    );

    if (validated.some((issue: ReviewIssue) => Boolean(issue.error))) {
      this.pageMessage.set('Some fields still have errors. Please fix them before saving.');

      if (firstInvalidSectionIndex >= 0) {
        this.currentSectionIndex.set(firstInvalidSectionIndex);
      }

      return;
    }

    const correctedValues = validated.reduce((acc: Record<string, unknown>, issue: ReviewIssue) => {
      acc[issue.id] = this.serializeValue(issue.value, issue.type);
      return acc;
    }, {});

    sessionStorage.setItem(REVIEW_CORRECTIONS_KEY, JSON.stringify(correctedValues));
    sessionStorage.removeItem(REVIEW_STATE_KEY);
    this.pageMessage.set(null);

    this.router.navigate(['/form'], {
      queryParams: {
        fromReview: true,
        fromUpload: this.source() === 'template',
        autoSubmit: this.source() === 'template',
      },
      state: {
        correctedValues,
        reviewSource: this.source(),
        autoSubmit: this.source() === 'template',
      },
    });
  }

  goBack(): void {
    if (this.source() === 'template') {
      this.router.navigate(['/upload']);
      return;
    }

    this.router.navigate(['/form']);
  }

  private loadFromStorage(): { source: ReviewSource; issues: ReviewIssue[] } {
    try {
      const raw = sessionStorage.getItem(REVIEW_STATE_KEY);

      if (!raw) {
        return {
          source: 'manual',
          issues: [],
        };
      }

      const parsed = JSON.parse(raw) as ReviewStatePayload;

      return {
        source: parsed.source ?? 'manual',
        issues: this.normalizeIssues(parsed.issues),
      };
    } catch {
      return {
        source: 'manual',
        issues: [],
      };
    }
  }

  private normalizeIssues(rawIssues: unknown): ReviewIssue[] {
    if (!Array.isArray(rawIssues)) {
      return [];
    }

    return rawIssues
      .filter((item: unknown): item is ReviewIssueInput => {
        return typeof item === 'object' && item !== null && 'id' in item && 'label' in item;
      })
      .map((item: ReviewIssueInput) => {
        const type = this.normalizeFieldType(item.type);
        const options = Array.isArray(item.options) ? item.options : [];
        const rawValue = item.value;

        let value = '';

        if (Array.isArray(rawValue)) {
          value = rawValue.join(', ');
        } else if (typeof rawValue === 'boolean') {
          value = rawValue ? 'Yes' : 'No';
        } else if (rawValue === null || rawValue === undefined) {
          value = '';
        } else {
          value = String(rawValue);
        }

        return {
          id: item.id,
          label: item.label,
          value,
          type,
          options,
          error: item.error ?? this.validateValue(value, type, options),
          source: item.source ?? 'manual',
          section: item.section ?? 'general',
          row: item.row,
        };
      });
  }

  private serializeValue(value: string, type: ReviewFieldType): unknown {
    const trimmed = value.trim();

    if (type === 'boolean') {
      const normalized = trimmed.toLowerCase();
      return normalized === 'yes' || normalized === 'true';
    }

    if (type === 'integer' || type === 'number') {
      return trimmed === '' ? '' : Number.parseInt(trimmed, 10);
    }

    if (type === 'decimal') {
      return trimmed === '' ? '' : Number.parseFloat(trimmed.replace(',', '.'));
    }

    if (type === 'multi-select') {
      return trimmed
        .split(',')
        .map((item: string) => item.trim())
        .filter(Boolean);
    }

    return trimmed;
  }

  private validateValue(value: string, type: ReviewFieldType, options: string[] = []): string {
    const trimmed = value.trim();

    if (type === 'file') {
      if (!trimmed) {
        return 'Please provide at least one file reference.';
      }
      return '';
    }

    if (type === 'multi-select') {
      const selectedValues = trimmed
        .split(',')
        .map((item: string) => item.trim())
        .filter(Boolean);

      if (selectedValues.length === 0) {
        return 'Please select at least one option.';
      }

      if (options.length > 0) {
        const normalizedOptions = options.map((option: string) => option.trim().toLowerCase());
        const invalidSelections = selectedValues.filter(
          (item: string) => !normalizedOptions.includes(item.toLowerCase())
        );

        if (invalidSelections.length > 0) {
          return `Invalid selection: ${invalidSelections.join(', ')}.`;
        }
      }

      return '';
    }

    if (!trimmed) {
      return 'This field is required.';
    }

    if (type === 'integer' || type === 'number') {
      if (!/^-?\d+$/.test(trimmed)) {
        return 'Please use whole numbers only.';
      }
      return '';
    }

    if (type === 'decimal') {
      if (!/^-?\d+([.,]\d+)?$/.test(trimmed)) {
        return 'Please enter a valid decimal number.';
      }
      return '';
    }

    if (type === 'date') {
      if (Number.isNaN(Date.parse(trimmed))) {
        return 'Please enter a valid date.';
      }
      return '';
    }

    if (type === 'time') {
      if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(trimmed)) {
        return 'Please enter the time in HH:MM format.';
      }
      return '';
    }

    if (type === 'boolean') {
      const normalized = trimmed.toLowerCase();
      if (!['true', 'false', 'yes', 'no'].includes(normalized)) {
        return 'Use Yes/No or True/False.';
      }
      return '';
    }

    if (type === 'dropdown') {
      if (options.length === 0) {
        return '';
      }

      const normalizedOptions = options.map((option: string) => option.trim().toLowerCase());
      if (!normalizedOptions.includes(trimmed.toLowerCase())) {
        return 'Please select a valid option from the list.';
      }

      return '';
    }

    return '';
  }
}