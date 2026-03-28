import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ReviewComponentsComponent } from '../../../src/presentation/web/src/app/pages/review/review-components';

async function resolveAngularResources(): Promise<void> {
  const core = await import('@angular/core');
  const resolver = (core as Record<string, unknown>)['\u0275resolveComponentResources'] as
    | ((loader: (url: string) => Promise<string>) => Promise<void>)
    | undefined;

  if (typeof resolver === 'function') {
    await resolver(async () => '');
  }
}

describe('ReviewComponentsComponent', () => {
  let component: ReviewComponentsComponent;

  const routerMock = {
    navigate: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    sessionStorage.clear();
    window.history.pushState({}, '', '/review');

    await resolveAngularResources();

    await TestBed.configureTestingModule({
      imports: [ReviewComponentsComponent],
      providers: [
        { provide: Router, useValue: routerMock },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => null,
              },
            },
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(ReviewComponentsComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('loads issues from session storage when present', () => {
    sessionStorage.setItem(
      'reviewState',
      JSON.stringify({
        source: 'manual',
        issues: [
          { id: 'q1', label: 'Question 1', value: '', type: 'text', error: 'This field is required.' },
        ],
      }),
    );

    component.ngOnInit();

    expect(component.hasAnyItems()).toBe(true);
    expect(component.invalidCount()).toBe(1);
    expect(component.sections()).toEqual(['general']);
  });

  it('computes progressPercent for empty and partially valid issues', () => {
    expect(component.progressPercent()).toBe(0);

    sessionStorage.setItem(
      'reviewState',
      JSON.stringify({
        source: 'manual',
        issues: [
          { id: 'q1', label: 'Question 1', value: 'ok', type: 'text', error: '' },
          { id: 'q2', label: 'Question 2', value: '', type: 'text', error: 'This field is required.' },
        ],
      }),
    );

    component.ngOnInit();

    expect(component.progressPercent()).toBe(50);
  });

  it('does not navigate on saveCorrections when issues are still invalid', () => {
    sessionStorage.setItem(
      'reviewState',
      JSON.stringify({
        source: 'manual',
        issues: [
          { id: 'q1', label: 'Question 1', value: '', type: 'text', error: 'This field is required.' },
        ],
      }),
    );

    component.ngOnInit();
    component.saveCorrections();

    expect(component.pageMessage()).toBe('Some fields still have errors. Please fix them before saving.');
    expect(routerMock.navigate).not.toHaveBeenCalled();
  });

  it('stores corrections and navigates to form when all fields are valid', () => {
    sessionStorage.setItem(
      'reviewState',
      JSON.stringify({
        source: 'template',
        issues: [
          {
            id: 'q1',
            label: 'Question 1',
            value: '10',
            type: 'integer',
            error: '',
            source: 'template',
            section: 'building-setup',
          },
        ],
      }),
    );

    component.ngOnInit();
    component.saveCorrections();

    expect(sessionStorage.getItem('reviewCorrections')).toBe(JSON.stringify({ q1: 10 }));
    expect(routerMock.navigate).toHaveBeenCalledWith(['/form'], {
      queryParams: {
        fromReview: true,
        fromUpload: true,
        autoSubmit: true,
      },
      state: {
        correctedValues: { q1: 10 },
        reviewSource: 'template',
        autoSubmit: true,
      },
    });
  });

  it('navigates back according to source type', () => {
    sessionStorage.setItem(
      'reviewState',
      JSON.stringify({
        source: 'template',
        issues: [{ id: 'q1', label: 'Question 1', value: 'ok', type: 'text', error: '' }],
      }),
    );

    component.ngOnInit();
    component.goBack();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/upload']);

    routerMock.navigate.mockReset();

    sessionStorage.setItem(
      'reviewState',
      JSON.stringify({
        source: 'manual',
        issues: [{ id: 'q1', label: 'Question 1', value: 'ok', type: 'text', error: '' }],
      }),
    );

    component.ngOnInit();
    component.goBack();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/form']);
  });

  it('updates value and clears page message on onValueChange()', () => {
    sessionStorage.setItem(
      'reviewState',
      JSON.stringify({
        source: 'manual',
        issues: [
          { id: 'q1', label: 'Question 1', value: '', type: 'text', error: 'This field is required.' },
        ],
      }),
    );

    component.ngOnInit();
    component.pageMessage.set('old');
    component.onValueChange('q1', 'ok');

    expect(component.issues()[0]?.value).toBe('ok');
    expect(component.issues()[0]?.error).toBe('');
    expect(component.pageMessage()).toBeNull();
  });

  it('keeps non-target issues unchanged on onValueChange()', () => {
    sessionStorage.setItem(
      'reviewState',
      JSON.stringify({
        source: 'manual',
        issues: [
          { id: 'q1', label: 'Question 1', value: '', type: 'text', error: 'This field is required.' },
          { id: 'q2', label: 'Question 2', value: 'untouched', type: 'text', error: '' },
        ],
      }),
    );

    component.ngOnInit();
    component.onValueChange('q1', 'ok');

    expect(component.issues()[1]?.value).toBe('untouched');
    expect(component.issues()[1]?.error).toBe('');
  });

  it('moves section index with goTo/next/previous', () => {
    sessionStorage.setItem(
      'reviewState',
      JSON.stringify({
        source: 'manual',
        issues: [
          { id: 'q1', label: 'Q1', value: 'ok', type: 'text', error: '', section: 'sec-a' },
          { id: 'q2', label: 'Q2', value: '', type: 'text', error: 'This field is required.', section: 'sec-b' },
        ],
      }),
    );

    component.ngOnInit();
    component.goTo(0);
    component.next();
    expect(component.currentSectionIndex()).toBe(1);
    component.previous();
    expect(component.currentSectionIndex()).toBe(0);
  });

  it('returns null current section group when index is out of range', () => {
    sessionStorage.setItem(
      'reviewState',
      JSON.stringify({
        source: 'manual',
        issues: [
          { id: 'q1', label: 'Q1', value: 'ok', type: 'text', error: '', section: 'sec-a' },
        ],
      }),
    );

    component.ngOnInit();
    component.currentSectionIndex.set(99);

    expect(component.currentSection()).toBe('');
    expect(component.currentSectionGroup()).toBeNull();
    expect(component.currentItems()).toEqual([]);
  });

  it('validates and serializes all specialized field types', () => {
    const validate = (component as any).validateValue.bind(component);
    const serialize = (component as any).serializeValue.bind(component);
    const normalizeType = (component as any).normalizeFieldType.bind(component);
    const normalizeIssues = (component as any).normalizeIssues.bind(component);

    expect(validate('', 'file')).toBe('Please provide at least one file reference.');
    expect(validate('doc.pdf', 'file')).toBe('');
    expect(validate('x, y', 'multi-select', ['x', 'z'])).toBe('Invalid selection: y.');
    expect(validate('', 'multi-select')).toBe('Please select at least one option.');
    expect(validate('abc', 'integer')).toBe('Please use whole numbers only.');
    expect(validate('42', 'integer')).toBe('');
    expect(validate('abc', 'decimal')).toBe('Please enter a valid decimal number.');
    expect(validate('42.5', 'decimal')).toBe('');
    expect(validate('bad', 'date')).toBe('Please enter a valid date.');
    expect(validate('2026-03-26', 'date')).toBe('');
    expect(validate('27:72', 'time')).toBe('Please enter the time in HH:MM format.');
    expect(validate('23:59', 'time')).toBe('');
    expect(validate('maybe', 'boolean')).toBe('Use Yes/No or True/False.');
    expect(validate('Yes', 'boolean')).toBe('');
    expect(validate('ok', 'dropdown', [])).toBe('');
    expect(validate('ok', 'dropdown', ['ok', 'other'])).toBe('');
    expect(validate('bad', 'dropdown', ['ok'])).toBe('Please select a valid option from the list.');

    expect(serialize(' Yes ', 'boolean')).toBe(true);
    expect(serialize(' 10 ', 'integer')).toBe(10);
    expect(serialize(' 10,5 ', 'decimal')).toBe(10.5);
    expect(serialize('a, b', 'multi-select')).toEqual(['a', 'b']);
    expect(serialize('  keep  ', 'text')).toBe('keep');

    expect(normalizeIssues('not-array')).toEqual([]);

    expect(normalizeType('number')).toBe('integer');
    expect(normalizeType('float')).toBe('decimal');
    expect(normalizeType('select')).toBe('dropdown');
    expect(normalizeType('unknown-type')).toBe('text');
  });

  it('normalizes issues from history state when provided', () => {
    window.history.pushState(
      {
        reviewSource: 'template',
        reviewIssues: [
          { id: 'q1', label: 'Flag', value: true, type: 'boolean', section: 'sec-a' },
          { id: 'q2', label: 'List', value: ['a', 'b'], type: 'multi-select', section: 'sec-a' },
          { id: 'q3', label: 'N', value: null, type: 'text', section: 'sec-b' },
        ],
      },
      '',
      '/review',
    );

    component.ngOnInit();

    expect(component.source()).toBe('template');
    expect(component.issues()[0]?.value).toBe('Yes');
    expect(component.issues()[1]?.value).toBe('a, b');
    expect(component.issues()[2]?.value).toBe('');
    expect(component.inputType('date')).toBe('date');
    expect(component.inputType('time')).toBe('time');
    expect(component.inputType('text')).toBe('text');
  });

  it('uses template-specific subtitle when source is template', () => {
    window.history.pushState(
      {
        reviewSource: 'template',
        reviewIssues: [{ id: 'q1', label: 'Question 1', value: '', type: 'text', section: 'general' }],
      },
      '',
      '/review',
    );

    component.ngOnInit();

    expect(component.pageTitle()).toBe('Review Invalid Template Data');
    expect(component.pageSubtitle()).toBe(
      'We found issues in the uploaded template. Review each section and correct the highlighted fields.',
    );
  });

  it('uses manual title and subtitle when source is manual', () => {
    sessionStorage.setItem(
      'reviewState',
      JSON.stringify({
        source: 'manual',
        issues: [{ id: 'q1', label: 'Question 1', value: '', type: 'text', error: '' }],
      }),
    );

    component.ngOnInit();

    expect(component.pageTitle()).toBe('Review Invalid Data');
    expect(component.pageSubtitle()).toBe(
      'Review each section and correct the highlighted fields before continuing.',
    );
  });

  it('handles invalid reviewState JSON in storage gracefully', () => {
    sessionStorage.setItem('reviewState', '{invalid-json');

    component.ngOnInit();

    expect(component.hasAnyItems()).toBe(false);
    expect(component.invalidCount()).toBe(0);
    expect(component.formatSectionLabel('company-details')).toBe('Company Details');
  });

  it('falls back section key to general when issue section is empty', () => {
    component.issues.set([
      {
        id: 'q-empty-section',
        label: 'Question',
        value: '',
        type: 'text',
        options: [],
        error: '',
        source: 'manual',
        section: '',
      },
    ] as any);

    expect(component.groupedSections()[0]?.key).toBe('general');
  });

  it('covers normalize and serialize fallback branches for undefined and empty values', () => {
    const normalizeType = (component as any).normalizeFieldType.bind(component);
    const serialize = (component as any).serializeValue.bind(component);

    expect(normalizeType(undefined)).toBe('text');
    expect(serialize('No', 'boolean')).toBe(false);
    expect(serialize('', 'integer')).toBe('');
    expect(serialize('', 'decimal')).toBe('');
  });

  it('defaults source to manual when storage payload omits source', () => {
    window.history.pushState({}, '', '/review');
    sessionStorage.setItem(
      'reviewState',
      JSON.stringify({
        issues: [{ id: 'q1', label: 'Question 1', value: '', type: 'text', error: '' }],
      }),
    );

    component.ngOnInit();

    expect(component.source()).toBe('manual');
  });

  it('normalizes options fallback and boolean false to No when loading issues', () => {
    window.history.pushState(
      {
        reviewSource: 'manual',
        reviewIssues: [
          { id: 'q1', label: 'Flag', value: false, type: 'boolean', section: 'general' },
          { id: 'q2', label: 'No options', value: 'x', type: 'dropdown', section: 'general' },
        ],
      },
      '',
      '/review',
    );

    component.ngOnInit();

    expect(component.issues()[0]?.value).toBe('No');
    expect(component.issues()[1]?.options).toEqual([]);
  });

  it('returns empty currentItems when no section group is selected', () => {
    sessionStorage.setItem('reviewState', JSON.stringify({ source: 'manual', issues: [] }));

    component.ngOnInit();

    expect(component.currentItems()).toEqual([]);
  });

  it('loads source from storage when history state source is missing', () => {
    sessionStorage.setItem(
      'reviewState',
      JSON.stringify({
        source: 'template',
        issues: [{ id: 'q1', label: 'Question', value: 'A', type: 'text', error: '' }],
      }),
    );
    window.history.pushState({}, '', '/review');

    component.ngOnInit();

    expect(component.source()).toBe('template');
  });

  it('keeps array options when normalizing loaded state', () => {
    window.history.pushState(
      {
        reviewSource: 'template',
        reviewIssues: [
          {
            id: 'q1',
            label: 'Preferences',
            value: 'A',
            type: 'dropdown',
            section: 'company-details',
            options: ['A', 'B'],
          },
        ],
      },
      '',
      '/review',
    );

    component.ngOnInit();

    expect(component.currentItems()[0]?.options).toEqual(['A', 'B']);
  });

  it('falls through null reviewSource to storage source in loadedSource chain', () => {
    sessionStorage.setItem(
      'reviewState',
      JSON.stringify({
        source: 'template',
        issues: [{ id: 'q1', label: 'Question', value: 'A', type: 'text', error: '' }],
      }),
    );
    window.history.pushState({ reviewSource: null }, '', '/review');

    component.ngOnInit();

    expect(component.source()).toBe('template');
  });

  it('falls back to manual when both history and storage sources are nullish', () => {
    const loadSpy = vi
      .spyOn(component as any, 'loadFromStorage')
      .mockReturnValue({ source: undefined, issues: [] });
    window.history.pushState({ reviewSource: undefined }, '', '/review');

    component.ngOnInit();

    expect(component.source()).toBe('manual');
    loadSpy.mockRestore();
  });
});
