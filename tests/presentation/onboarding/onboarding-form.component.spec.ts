import { TestBed } from '@angular/core/testing';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { OnboardingFormComponent } from '../../../src/presentation/web/src/app/onboarding-form/onboarding-form.component';
import { QuestionService } from '../../../src/presentation/web/src/app/services/question.service';
import { Question } from '../../../src/presentation/web/src/app/models/question.model';
import { OnboardingInstanceService } from '../../../src/presentation/web/src/app/services/onboarding-instance.service';

async function resolveAngularResources(): Promise<void> {
  const core = await import('@angular/core');
  const resolver = (core as Record<string, unknown>)['\u0275resolveComponentResources'] as
    | ((loader: (url: string) => Promise<string>) => Promise<void>)
    | undefined;

  if (typeof resolver === 'function') {
    await resolver(async () => '');
  }
}

describe('OnboardingFormComponent', () => {
  let component: OnboardingFormComponent;
  let queryParams$: BehaviorSubject<Params>;
  let routeParams: Params;

  let questionServiceMock: {
    getQuestions: ReturnType<typeof vi.fn>;
    getSections: ReturnType<typeof vi.fn>;
    getQuestionsBySection: ReturnType<typeof vi.fn>;
  };

  let routerMock: {
    navigate: ReturnType<typeof vi.fn>;
  };

  let onboardingServiceMock: {
    getPublicInstance: ReturnType<typeof vi.fn>;
    saveProgress: ReturnType<typeof vi.fn>;
    submit: ReturnType<typeof vi.fn>;
  };

  const questions: Question[] = [
    {
      id: 'q1',
      moduleId: 'onboarding',
      sectionId: 'building-setup',
      question: 'Building Name',
      type: 'text',
      order: 1,
    },
    {
      id: 'q2',
      moduleId: 'onboarding',
      sectionId: 'company-details',
      question: 'Has Parking',
      type: 'boolean',
      order: 2,
    },
    {
      id: 'q3',
      moduleId: 'onboarding',
      sectionId: 'company-details',
      question: 'Amenities',
      type: 'multi-select',
      options: ['Gym', 'Pool'],
      order: 3,
    },
  ];

  beforeEach(async () => {
    // Arrange
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();

    routeParams = {};
    queryParams$ = new BehaviorSubject<Params>(routeParams);

    questionServiceMock = {
      getQuestions: vi.fn().mockReturnValue(of(questions)),
      getSections: vi.fn().mockImplementation((qs: Question[]) => {
        return [...new Set(qs.map(q => q.sectionId))];
      }),
      getQuestionsBySection: vi.fn().mockImplementation((qs: Question[], sectionId: string) => {
        return qs.filter(q => q.sectionId === sectionId);
      }),
    };

    routerMock = {
      navigate: vi.fn(),
    };

    onboardingServiceMock = {
      getPublicInstance: vi.fn().mockReturnValue(of(null)),
      saveProgress: vi.fn().mockReturnValue(of(null)),
      submit: vi.fn().mockReturnValue(of(null)),
    };

    await resolveAngularResources();

    await TestBed.configureTestingModule({
      imports: [OnboardingFormComponent],
      providers: [
        { provide: QuestionService, useValue: questionServiceMock },
        { provide: Router, useValue: routerMock },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: queryParams$.asObservable(),
            snapshot: {
              queryParamMap: {
                get: (key: string) => {
                  const value = routeParams[key];
                  return value === undefined || value === null ? null : String(value);
                },
                has: (key: string) => routeParams[key] !== undefined,
              },
              paramMap: {
                get: () => null,
              },
            },
          },
        },
        { provide: OnboardingInstanceService, useValue: onboardingServiceMock },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(OnboardingFormComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('loads all questions and builds form on init', () => {
    // Arrange
    // (default setup)

    // Act
    component.ngOnInit();

    // Assert
    expect(questionServiceMock.getQuestions).toHaveBeenCalled();
    expect(component.questions().length).toBe(3);
    expect(component.sections()).toEqual(['company-details', 'building-setup']);
    expect(component.form().get('q1')).toBeTruthy();
    expect(component.form().get('q2')).toBeTruthy();
    expect(component.form().get('q3')).toBeTruthy();
    expect(component.loading()).toBe(false);
  });

  it('filters questions by selectedSections from localStorage', () => {
    // Arrange
    localStorage.setItem('selectedSections', JSON.stringify(['company-details']));

    // Act
    component.ngOnInit();

    // Assert
    expect(component.questions().map(q => q.id)).toEqual(['q2', 'q3']);
    expect(component.sections()).toEqual(['company-details']);
    expect(component.form().get('q1')).toBeFalsy();
    expect(component.form().get('q2')).toBeTruthy();
    expect(component.form().get('q3')).toBeTruthy();
  });

  it('applies section query param when valid', () => {
    // Arrange
    routeParams = { section: '1' };
    queryParams$.next(routeParams);

    // Act
    component.ngOnInit();

    // Assert
    expect(component.currentSectionIndex()).toBe(1);
  });

  it('ignores section query param when index is invalid', () => {
    routeParams = { section: '99' };
    queryParams$.next(routeParams);

    component.ngOnInit();

    expect(component.currentSectionIndex()).toBe(0);
  });

  it('sets fromUpload=true when query param fromUpload exists', () => {
    // Arrange
    routeParams = { fromUpload: 'true' };
    queryParams$.next(routeParams);

    // Act
    component.ngOnInit();

    // Assert
    expect(component.fromUpload()).toBe(true);
  });

  it('maps uploadedData into matching form controls and clears uploadedData', () => {
    // Arrange
    routeParams = { fromUpload: 'true' };
    queryParams$.next(routeParams);
    sessionStorage.setItem('uploadedData', JSON.stringify([{ q1: 'My Tower' }]));

    // Act
    component.ngOnInit();

    // Assert
    expect(component.form().get('q1')?.value).toBe('My Tower');
    expect(sessionStorage.getItem('uploadedData')).toBeNull();
  });

  it('ignores uploaded fields that do not exist in the form', () => {
    routeParams = { fromUpload: 'true' };
    queryParams$.next(routeParams);
    sessionStorage.setItem('uploadedData', JSON.stringify([{ q1: 'Known', missingField: 'Ignored' }]));

    component.ngOnInit();

    expect(component.form().get('q1')?.value).toBe('Known');
    expect(component.form().get('missingField')).toBeNull();
  });

  it('handles invalid uploadedData JSON without breaking form initialization', () => {
    routeParams = { fromUpload: 'true' };
    queryParams$.next(routeParams);
    sessionStorage.setItem('uploadedData', '{bad-json');

    component.ngOnInit();

    expect(component.form().get('q1')?.value).toBe('');
    expect(sessionStorage.getItem('uploadedData')).toBeNull();
  });

  it('calculates progressPercent correctly for filled fields', () => {
    // Arrange
    component.ngOnInit();

    // Act
    (component.form().get('q1') as any)?.setValue('Headquarters');
    (component.form().get('q2') as any)?.setValue(true);
    (component.form().get('q3') as any)?.setValue(['Gym']);

    // Assert
    expect(component.progressPercent()).toBe(100);
  });

  it('stores upload section and advances on next() when fromUpload is true', () => {
    // Arrange
    component.ngOnInit();
    component.fromUpload.set(true);
    component.currentSectionIndex.set(0);

    // Act
    component.next();

    // Assert
    expect(sessionStorage.getItem('uploadSectionIndex')).toBe('1');
    expect(component.currentSectionIndex()).toBe(1);
  });

  it('moves to next section on next() when fromUpload is false', () => {
    // Arrange
    component.ngOnInit();
    component.fromUpload.set(false);
    component.currentSectionIndex.set(0);

    // Act
    component.next();

    // Assert
    expect(component.currentSectionIndex()).toBe(1);
    expect(routerMock.navigate).not.toHaveBeenCalled();
  });

  it('moves to previous section on previous()', () => {
    // Arrange
    component.ngOnInit();
    component.currentSectionIndex.set(1);

    // Act
    component.previous();

    // Assert
    expect(component.currentSectionIndex()).toBe(0);
  });

  it('navigates to upload preserving current section on goToUpload()', () => {
    // Arrange
    component.ngOnInit();
    component.currentSectionIndex.set(1);

    // Act
    component.goToUpload();

    // Assert
    expect(sessionStorage.getItem('uploadSectionIndex')).toBe('1');
    expect(routerMock.navigate).toHaveBeenCalledWith(['/upload']);
  });

  it('navigates to review and stores review state when submit has invalid fields', () => {
    // Arrange
    component.ngOnInit();

    // Act
    component.submit();

    // Assert
    expect(routerMock.navigate).toHaveBeenCalledWith(['/review'], {
      state: expect.objectContaining({
        reviewIssues: expect.any(Array),
      }),
    });
    expect(sessionStorage.getItem('reviewState')).not.toBeNull();
    expect(sessionStorage.getItem('reviewFormDraft')).not.toBeNull();
  });

  it('sets submitted to true when submit() has valid fields', () => {
    // Arrange
    component.ngOnInit();
    component.form().get('q1')?.setValue('HQ');
    component.form().get('q2')?.setValue(true);
    component.form().get('q3')?.setValue(['Gym']);

    // Act
    component.submit();

    // Assert
    expect(component.submitted()).toBe(true);
  });

  it('sets loading=false when getQuestions fails', () => {
    // Arrange
    questionServiceMock.getQuestions.mockReturnValue(throwError(() => new Error('load failed')));

    // Act
    component.ngOnInit();

    // Assert
    expect(component.loading()).toBe(false);
  });

  it('collects review issues with expected metadata for invalid fields', () => {
    component.ngOnInit();

    const collectReviewItems = (component as any).collectReviewItems.bind(component);
    const issues = collectReviewItems() as Array<{
      id: string;
      label: string;
      type: string;
      options: string[];
      error: string;
    }>;

    expect(issues.map((issue) => issue.id)).toEqual(['q1', 'q2', 'q3']);
    expect(issues.find((issue) => issue.id === 'q1')?.error).toBe('This field is required.');
    expect(issues.find((issue) => issue.id === 'q2')?.error).toBe('Please choose Yes or No.');
    expect(issues.find((issue) => issue.id === 'q3')?.options).toEqual(['Gym', 'Pool']);
  });

  it('validates field values for required and typed errors', () => {
    const validate = (component as any).validateQuestionValue.bind(component);

    component.fromUpload.set(false);
    expect(validate('file', [])).toBe('Please upload at least one file.');
    expect(validate('file', ['doc.pdf'])).toBe('');
    expect(validate('file', '')).toBe('Please upload at least one file.');
    expect(validate('file', 'doc.pdf')).toBe('');
    expect(validate('multi-select', [])).toBe('Please select at least one option.');
    expect(validate('multi-select', ['Gym'])).toBe('');
    expect(validate('boolean', 'yes')).toBe('Please choose Yes or No.');
    expect(validate('boolean', true)).toBe('');
    expect(validate('integer', '1.5')).toBe('Please use whole numbers only.');
    expect(validate('integer', '10')).toBe('');
    expect(validate('decimal', 'abc')).toBe('Please enter a valid decimal number.');
    expect(validate('decimal', '10.5')).toBe('');
    expect(validate('time', '99:99')).toBe('Please enter the time in HH:MM format.');
    expect(validate('time', '08:30')).toBe('');
    expect(validate('date', 'bad')).toBe('Please enter a valid date.');
    expect(validate('date', '2026-03-26')).toBe('');
    expect(validate('text', '')).toBe('This field is required.');

    component.fromUpload.set(true);
    expect(validate('file', null)).toBe('');
  });

  it('initializes file controls with empty array defaults', () => {
    const questionsWithFile: Question[] = [
      ...questions,
      {
        id: 'q-file',
        moduleId: 'onboarding',
        sectionId: 'company-details',
        question: 'Upload lease',
        type: 'file',
        order: 4,
      },
    ];

    questionServiceMock.getQuestions.mockReturnValue(of(questionsWithFile));

    component.ngOnInit();

    expect(component.form().get('q-file')?.value).toEqual([]);
  });

  it('handles invalid selectedSections JSON by using all questions', () => {
    localStorage.setItem('selectedSections', '{bad-json');

    component.ngOnInit();

    expect(component.questions().length).toBe(questions.length);
  });

  it('parses object values safely and resolves source options fallback', () => {
    const parseObjectValues = (component as any).parseObjectValues.bind(component);
    const resolveQuestionOptions = (component as any).resolveQuestionOptions.bind(component);

    expect(parseObjectValues('{"a":1}')).toEqual({ a: 1 });
    expect(parseObjectValues('bad-json')).toEqual({});
    expect(parseObjectValues([])).toEqual({});

    expect(
      resolveQuestionOptions({ id: 'x', type: 'dropdown', options: ['A', 'B'] }),
    ).toEqual(['A', 'B']);

    expect(
      resolveQuestionOptions({ id: 'x', type: 'dropdown', source: 'industry' }),
    ).toEqual(expect.arrayContaining(['Technology']));
  });

  it('does not move beyond section bounds with next/previous and supports goTo', () => {
    component.ngOnInit();

    component.currentSectionIndex.set(component.sections().length - 1);
    component.next();
    expect(component.currentSectionIndex()).toBe(component.sections().length - 1);

    component.currentSectionIndex.set(0);
    component.previous();
    expect(component.currentSectionIndex()).toBe(0);

    component.goTo(1);
    expect(component.currentSectionIndex()).toBe(1);
  });

  it('applies uploaded data from history state and restores upload section index', () => {
    routeParams = { fromUpload: 'true' };
    queryParams$.next(routeParams);

    window.history.pushState({ uploadedData: { q1: 'FromState' } }, '', '/form?fromUpload=true');
    sessionStorage.setItem('uploadSectionIndex', '1');

    component.ngOnInit();

    expect(component.form().get('q1')?.value).toBe('FromState');
    expect(component.currentSectionIndex()).toBe(1);
    expect(sessionStorage.getItem('uploadSectionIndex')).toBeNull();
  });

  it('applies and clears review corrections from storage', () => {
    sessionStorage.setItem('reviewFormDraft', JSON.stringify({ q1: 'Draft' }));
    sessionStorage.setItem('reviewCorrections', JSON.stringify({ q1: 'Corrected' }));

    component.ngOnInit();

    expect(component.form().get('q1')?.value).toBe('Corrected');
    expect(sessionStorage.getItem('reviewCorrections')).toBeNull();
    expect(sessionStorage.getItem('reviewState')).toBeNull();
    expect(sessionStorage.getItem('reviewFormDraft')).toBeNull();
  });

  it('restores review section index when stored index is valid', () => {
    sessionStorage.setItem('reviewSectionIndex', '1');

    component.ngOnInit();

    expect(component.currentSectionIndex()).toBe(1);
    expect(sessionStorage.getItem('reviewSectionIndex')).toBeNull();
  });

  it('clears stored review section index when index is invalid', () => {
    sessionStorage.setItem('reviewSectionIndex', '99');

    component.ngOnInit();

    expect(component.currentSectionIndex()).toBe(0);
    expect(sessionStorage.getItem('reviewSectionIndex')).toBeNull();
  });

  it('returns 0 progress when there are no questions', () => {
    component.questions.set([]);
    component.form.set(new (component.form().constructor as typeof FormGroup)({}));

    expect(component.progressPercent()).toBe(0);
  });

  it('auto-submits in legacy flow when autoSubmit query param is present', async () => {
    routeParams = { autoSubmit: 'true' };
    queryParams$.next(routeParams);

    component.ngOnInit();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(component.submitted()).toBe(true);
  });

  it('performs query cleanup navigation during init when transient params exist', async () => {
    routeParams = { fromUpload: 'true', section: '0' };
    queryParams$.next(routeParams);

    component.ngOnInit();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(component.fromUpload()).toBe(true);
    expect(component.currentSectionIndex()).toBe(0);
    expect(routerMock.navigate).toHaveBeenCalledWith([], expect.objectContaining({ queryParams: {} }));
  });

  it('handles uploadedData as an empty array from storage', () => {
    routeParams = { fromUpload: 'true' };
    queryParams$.next(routeParams);
    window.history.pushState({}, '', '/form?fromUpload=true');
    sessionStorage.setItem('uploadedData', JSON.stringify([]));

    component.ngOnInit();

    expect(component.form().get('q1')?.value).toBe('');
  });

  it('prefers correctedValues from history state over storage values', () => {
    sessionStorage.setItem('reviewCorrections', JSON.stringify({ q1: 'FromStorage' }));
    window.history.pushState({ correctedValues: { q1: 'FromState' } }, '', '/form?fromReview=true');

    component.ngOnInit();

    expect(component.form().get('q1')?.value).toBe('FromState');
  });

  it('treats null text values as invalid and includes them in review issues', () => {
    component.ngOnInit();

    component.form().get('q1')?.setValue(null as unknown as string);
    component.form().get('q2')?.setValue(true);
    component.form().get('q3')?.setValue(['Gym']);

    const collectReviewItems = (component as any).collectReviewItems.bind(component);
    const issues = collectReviewItems() as Array<{ id: string; error: string }>;
    const invalidIssues = issues.filter((issue) => issue.error);

    expect(invalidIssues).toHaveLength(1);
    expect(invalidIssues[0]).toEqual(
      expect.objectContaining({
        id: 'q1',
        error: 'This field is required.',
      }),
    );
  });

  it('covers file question progress logic and submit reviewSource template branch', () => {
    const withFile: Question[] = [
      ...questions,
      {
        id: 'q-file',
        moduleId: 'onboarding',
        sectionId: 'company-details',
        question: 'Attachment',
        type: 'file',
        order: 4,
      },
    ];

    questionServiceMock.getQuestions.mockReturnValue(of(withFile));
    component.ngOnInit();

    component.fromUpload.set(true);
    component.form().get('q1')?.setValue('HQ');
    component.form().get('q2')?.setValue(true);
    component.form().get('q3')?.setValue(['Gym']);
    component.form().get('q-file')?.setValue([]);

    expect(component.progressPercent()).toBe(100);

    component.form().get('q1')?.setValue('');
    component.submit();

    const storedState = JSON.parse(sessionStorage.getItem('reviewState') || '{}') as {
      issues?: Array<{ id: string; error: string }>;
    };
    const stored = storedState.issues ?? [];
    expect(stored.length).toBeGreaterThan(0);
  });

  it('returns validation errors for undefined values across supported required types', () => {
    const validate = (component as any).validateQuestionValue.bind(component);

    expect(validate('boolean', undefined)).toBe('Please choose Yes or No.');
    expect(validate('multi-select', undefined)).toBe('Please select at least one option.');
    expect(validate('file', undefined)).toBe('Please upload at least one file.');
  });

  it('handles uploadedData storage array with undefined first element', () => {
    routeParams = { fromUpload: 'true' };
    queryParams$.next(routeParams);
    window.history.pushState({}, '', '/form?fromUpload=true');
    sessionStorage.setItem('uploadedData', JSON.stringify([undefined]));

    component.ngOnInit();

    expect(component.form().get('q1')?.value).toBe('');
  });

  it('covers control() helper and progress null/undefined paths', () => {
    const withFile: Question[] = [
      ...questions,
      {
        id: 'q-file',
        moduleId: 'onboarding',
        sectionId: 'company-details',
        question: 'Attachment',
        type: 'file',
        order: 4,
      },
    ];

    questionServiceMock.getQuestions.mockReturnValue(of(withFile));
    component.ngOnInit();

    expect(component.control('q1')).toBeTruthy();

    component.fromUpload.set(false);
    component.form().get('q1')?.setValue(null as unknown as string);
    component.form().get('q-file')?.setValue([]);
    expect(component.progressPercent()).toBeLessThan(100);

    component.fromUpload.set(true);
    component.form().get('q1')?.setValue('HQ');
    component.form().get('q2')?.setValue(true);
    component.form().get('q3')?.setValue(['Gym']);
    component.form().get('q-file')?.setValue([]);
    expect(component.currentQuestions().length).toBeGreaterThan(0);
    expect(component.progressPercent()).toBe(100);
  });

  it('covers uploadedData parsed[0] nullish fallback branch', () => {
    routeParams = { fromUpload: 'true' };
    queryParams$.next(routeParams);
    window.history.pushState({}, '', '/form?fromUpload=true');
    sessionStorage.setItem('uploadedData', '[null]');

    component.ngOnInit();

    expect(component.form().get('q1')?.value).toBe('');
  });

  it('covers uploadedData object path and non-array file progress branch', () => {
    const withFile: Question[] = [
      ...questions,
      {
        id: 'q-file',
        moduleId: 'onboarding',
        sectionId: 'company-details',
        question: 'Attachment',
        type: 'file',
        order: 4,
      },
    ];

    routeParams = { fromUpload: 'true' };
    queryParams$.next(routeParams);
    window.history.pushState({}, '', '/form?fromUpload=true');
    questionServiceMock.getQuestions.mockReturnValue(of(withFile));
    sessionStorage.setItem('uploadedData', JSON.stringify({ q1: 'HQ' }));

    component.ngOnInit();

    component.fromUpload.set(false);
    component.form().get('q-file')?.setValue('doc.pdf');
    expect(component.progressPercent()).toBe(50);
  });

  it('covers validateQuestionValue undefined branches for file and text', () => {
    component.ngOnInit();
    const validate = (component as any).validateQuestionValue.bind(component);

    component.fromUpload.set(false);
    expect(validate('file', undefined)).toBe('Please upload at least one file.');
    expect(validate('text', undefined)).toBe('This field is required.');
  });
});