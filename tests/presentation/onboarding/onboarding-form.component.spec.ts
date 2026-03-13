import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { OnboardingFormComponent } from '../../../src/presentation/web/src/app/onboarding-form/onboarding-form.component';
import { QuestionService } from '../../../src/presentation/web/src/app/services/question.service';
import { Question } from '../../../src/presentation/web/src/app/models/question.model';

describe('OnboardingFormComponent', () => {
  let component: OnboardingFormComponent;
  let queryParams$: BehaviorSubject<Params>;

  let questionServiceMock: {
    getQuestions: ReturnType<typeof vi.fn>;
    getSections: ReturnType<typeof vi.fn>;
    getQuestionsBySection: ReturnType<typeof vi.fn>;
  };

  let routerMock: {
    navigate: ReturnType<typeof vi.fn>;
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

    queryParams$ = new BehaviorSubject<Params>({});

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

    await TestBed.configureTestingModule({
      imports: [OnboardingFormComponent],
      providers: [
        { provide: QuestionService, useValue: questionServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: { queryParams: queryParams$.asObservable() } },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(OnboardingFormComponent);
    component = fixture.componentInstance;
  });

  it('loads all questions and builds form on init', () => {
    // Arrange
    // (default setup)

    // Act
    component.ngOnInit();

    // Assert
    expect(questionServiceMock.getQuestions).toHaveBeenCalled();
    expect(component.questions().length).toBe(3);
    expect(component.sections()).toEqual(['building-setup', 'company-details']);
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
    queryParams$.next({ section: '1' });

    // Act
    component.ngOnInit();

    // Assert
    expect(component.currentSectionIndex()).toBe(1);
  });

  it('sets fromUpload=true when query param fromUpload exists', () => {
    // Arrange
    queryParams$.next({ fromUpload: 'true' });

    // Act
    component.ngOnInit();

    // Assert
    expect(component.fromUpload()).toBe(true);
  });

  it('maps uploadedData into matching form controls and clears uploadedData', () => {
    // Arrange
    sessionStorage.setItem('uploadedData', JSON.stringify([{ q1: 'My Tower' }]));

    // Act
    component.ngOnInit();

    // Assert
    expect(component.form().get('q1')?.value).toBe('My Tower');
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

  it('navigates to upload on next() when fromUpload is true', () => {
    // Arrange
    component.ngOnInit();
    component.fromUpload.set(true);
    component.currentSectionIndex.set(0);

    // Act
    component.next();

    // Assert
    expect(sessionStorage.getItem('uploadSectionIndex')).toBe('1');
    expect(routerMock.navigate).toHaveBeenCalledWith(['/upload']);
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

  it('sets submitted to true on submit()', () => {
    // Arrange
    component.ngOnInit();

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
});