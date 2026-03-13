import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { UploadComponent } from '../../../src/presentation/web/src/app/pages/upload/upload.component';
import { QuestionService } from '../../../src/presentation/web/src/app/services/question.service';

describe('UploadComponent', () => {
  let component: UploadComponent;

  let routerMock: {
    navigate: ReturnType<typeof vi.fn>;
  };

  let questionServiceMock: {
    getQuestions: ReturnType<typeof vi.fn>;
    getSections: ReturnType<typeof vi.fn>;
    getQuestionsBySection: ReturnType<typeof vi.fn>;
  };

  const mockQuestions = [
    {
      id: 'q1',
      moduleId: 'onboarding',
      sectionId: 'building-setup',
      question: 'Building name',
      type: 'text',
      order: 1,
    },
    {
      id: 'q2',
      moduleId: 'onboarding',
      sectionId: 'company-details',
      question: 'Company size',
      type: 'integer',
      order: 2,
    },
  ];

  const mockSections = ['building-setup', 'company-details'];

  beforeEach(async () => {
    // Arrange
    vi.clearAllMocks();
    sessionStorage.clear();
    localStorage.clear();

    routerMock = {
      navigate: vi.fn(),
    };

    questionServiceMock = {
      getQuestions: vi.fn().mockReturnValue(of(mockQuestions)),
      getSections: vi.fn().mockReturnValue(mockSections),
      getQuestionsBySection: vi
        .fn()
        .mockImplementation((questions: Array<{ sectionId: string }>, sectionId: string) =>
          questions.filter(q => q.sectionId === sectionId),
        ),
    };

    await TestBed.configureTestingModule({
      imports: [UploadComponent],
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: QuestionService, useValue: questionServiceMock },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(UploadComponent);
    component = fixture.componentInstance;
  });

  it('loads questions and sections on init', () => {
    // Arrange
    // (default mocks already set)

    // Act
    component.ngOnInit();

    // Assert
    expect(questionServiceMock.getQuestions).toHaveBeenCalled();
    expect(questionServiceMock.getSections).toHaveBeenCalledWith(mockQuestions);
    expect(component.questions()).toEqual(mockQuestions);
    expect(component.sections()).toEqual(mockSections);
    expect(component.loading()).toBe(false);
  });

  it('restores uploadSectionIndex and completedSections from sessionStorage on init', () => {
    // Arrange
    sessionStorage.setItem('uploadSectionIndex', '1');
    sessionStorage.setItem('completedSections', JSON.stringify([0, 1]));

    // Act
    component.ngOnInit();

    // Assert
    expect(component.currentSectionIndex()).toBe(1);
    expect(Array.from(component.completedSections())).toEqual([0, 1]);
    expect(sessionStorage.getItem('uploadSectionIndex')).toBeNull();
  });

  it('sets loading to false when getQuestions fails', () => {
    // Arrange
    questionServiceMock.getQuestions.mockReturnValue(
      throwError(() => new Error('load failed')),
    );

    // Act
    component.ngOnInit();

    // Assert
    expect(component.loading()).toBe(false);
  });

  it('sets error message for invalid file extension', () => {
    // Arrange
    const invalidFile = new File(['abc'], 'invalid.txt', { type: 'text/plain' });
    const event = {
      target: { files: [invalidFile] },
    } as unknown as Event;

    // Act
    component.onFileSelect(event);

    // Assert
    expect(component.errorMessage()).toBe(
      'Please upload a valid CSV or Excel file (.csv, .xlsx, .xls)',
    );
    expect(component.uploading()).toBe(false);
  });

  it('does nothing when no file is selected', () => {
    // Arrange
    const event = {
      target: { files: [] },
    } as unknown as Event;

    // Act
    component.onFileSelect(event);

    // Assert
    expect(component.fileName()).toBeNull();
    expect(component.errorMessage()).toBeNull();
    expect(component.uploading()).toBe(false);
  });

  it('navigates to form with manual mode on goToManualForm()', () => {
    // Arrange
    component.currentSectionIndex.set(1);

    // Act
    component.goToManualForm();

    // Assert
    expect(sessionStorage.getItem('uploadSectionIndex')).toBe('1');
    expect(routerMock.navigate).toHaveBeenCalledWith(['/form'], {
      queryParams: { section: 1, isManual: true },
    });
  });

  it('moves to next section and resets upload state', () => {
    // Arrange
    component.sections.set(mockSections);
    component.currentSectionIndex.set(0);
    component.fileName.set('file.csv');
    component.errorMessage.set('some error');
    component.uploading.set(true);

    // Act
    component.next();

    // Assert
    expect(component.currentSectionIndex()).toBe(1);
    expect(component.fileName()).toBeNull();
    expect(component.errorMessage()).toBeNull();
    expect(component.uploading()).toBe(false);
  });

  it('moves to previous section and resets upload state', () => {
    // Arrange
    component.sections.set(mockSections);
    component.currentSectionIndex.set(1);
    component.fileName.set('file.csv');
    component.errorMessage.set('some error');
    component.uploading.set(true);

    // Act
    component.previous();

    // Assert
    expect(component.currentSectionIndex()).toBe(0);
    expect(component.fileName()).toBeNull();
    expect(component.errorMessage()).toBeNull();
    expect(component.uploading()).toBe(false);
  });

  it('navigates to a specific valid section and resets upload state', () => {
    // Arrange
    component.sections.set(mockSections);
    component.fileName.set('file.csv');
    component.errorMessage.set('error');
    component.uploading.set(true);

    // Act
    component.goToSection(1);

    // Assert
    expect(component.currentSectionIndex()).toBe(1);
    expect(component.fileName()).toBeNull();
    expect(component.errorMessage()).toBeNull();
    expect(component.uploading()).toBe(false);
  });

  it('does not change section when index is invalid', () => {
    // Arrange
    component.sections.set(mockSections);
    component.currentSectionIndex.set(0);

    // Act
    component.goToSection(99);

    // Assert
    expect(component.currentSectionIndex()).toBe(0);
  });

  it('calls click on hidden file input in triggerFileInput()', () => {
    // Arrange
    const clickMock = vi.fn();
    vi.spyOn(document, 'getElementById').mockReturnValue({
      click: clickMock,
    } as unknown as HTMLInputElement);

    // Act
    component.triggerFileInput();

    // Assert
    expect(clickMock).toHaveBeenCalled();
  });
});