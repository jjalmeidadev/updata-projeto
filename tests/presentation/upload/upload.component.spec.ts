import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ExcelJS from 'exceljs';

import { UploadComponent } from '../../../src/presentation/web/src/app/pages/upload/upload.component';
import { QuestionService } from '../../../src/presentation/web/src/app/services/question.service';
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

  beforeEach(async () => {
    vi.clearAllMocks();
    sessionStorage.clear();
    localStorage.clear();

    routerMock = {
      navigate: vi.fn(),
    };

    questionServiceMock = {
      getQuestions: vi.fn().mockReturnValue(of(mockQuestions)),
      getSections: vi.fn().mockReturnValue(['building-setup', 'company-details']),
      getQuestionsBySection: vi
        .fn()
        .mockImplementation((questions: Array<{ sectionId: string }>, sectionId: string) =>
          questions.filter(q => q.sectionId === sectionId),
        ),
    };

    await resolveAngularResources();

    await TestBed.configureTestingModule({
      imports: [UploadComponent],
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: QuestionService, useValue: questionServiceMock },
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
        {
          provide: OnboardingInstanceService,
          useValue: {
            getPublicInstance: vi.fn().mockReturnValue(of(null)),
            uploadFile: vi.fn().mockReturnValue(of({})),
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(UploadComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('loads filtered questions on init', () => {
    localStorage.setItem('selectedSections', JSON.stringify(['company-details']));

    component.ngOnInit();

    expect(questionServiceMock.getQuestions).toHaveBeenCalled();
    expect(component.questions().map(q => q.id)).toEqual(['q2']);
    expect(component.loading()).toBe(false);
  });

  it('sets loading=false when getQuestions fails', () => {
    questionServiceMock.getQuestions.mockReturnValue(
      throwError(() => new Error('load failed')),
    );

    component.ngOnInit();

    expect(component.loading()).toBe(false);
  });

  it('returns early when no file is selected', async () => {
    const event = {
      target: { files: [] },
    } as unknown as Event;

    await component.onFileSelect(event);

    expect(component.fileName()).toBeNull();
    expect(component.errorMessage()).toBeNull();
    expect(component.uploading()).toBe(false);
  });

  it('sets validation error for invalid extension', async () => {
    const invalidFile = new File(['abc'], 'invalid.txt', { type: 'text/plain' });
    const event = {
      target: { files: [invalidFile], value: 'C:/fakepath/invalid.txt' },
    } as unknown as Event;

    await component.onFileSelect(event);

    expect(component.errorMessage()).toBe('Please upload a valid template file (.xlsx or .csv).');
  });

  it('processes valid csv and navigates to review', async () => {
    const csvFile = new File(['header\nvalue'], 'template.csv', { type: 'text/csv' });
    const event = {
      target: { files: [csvFile], value: 'C:/fakepath/template.csv' },
    } as unknown as Event;

    vi.spyOn(component as never, 'parseCsvFile').mockResolvedValue({ q1: 'Tower' } as never);
    vi.spyOn(component as never, 'collectTemplateReviewItems').mockReturnValue([] as never);

    await component.onFileSelect(event);

    expect(sessionStorage.getItem('uploadedData')).toBe(JSON.stringify({ q1: 'Tower' }));
    expect(sessionStorage.getItem('reviewState')).toBe(
      JSON.stringify({ source: 'template', issues: [] }),
    );
    expect(routerMock.navigate).toHaveBeenCalledWith(['/review'], {
      state: {
        reviewSource: 'template',
        reviewIssues: [],
      },
    });
    expect(component.uploading()).toBe(false);
  });

  it('processes valid xlsx and navigates to review', async () => {
    const xlsxFile = new File(['binary'], 'template.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const event = {
      target: { files: [xlsxFile], value: 'C:/fakepath/template.xlsx' },
    } as unknown as Event;

    vi.spyOn(component as never, 'parseExcelTemplate').mockResolvedValue({ q2: 25 } as never);
    vi.spyOn(component as never, 'collectTemplateReviewItems').mockReturnValue([] as never);

    await component.onFileSelect(event);

    expect(sessionStorage.getItem('uploadedData')).toBe(JSON.stringify({ q2: 25 }));
    expect(routerMock.navigate).toHaveBeenCalledWith(['/review'], {
      state: {
        reviewSource: 'template',
        reviewIssues: [],
      },
    });
    expect(component.uploading()).toBe(false);
  });

  it('sets error message when parse fails', async () => {
    const csvFile = new File(['header\nvalue'], 'template.csv', { type: 'text/csv' });
    const event = {
      target: { files: [csvFile], value: 'C:/fakepath/template.csv' },
    } as unknown as Event;

    vi.spyOn(component as never, 'parseCsvFile').mockRejectedValue(new Error('bad csv'));

    await component.onFileSelect(event);

    expect(component.errorMessage()).toBe('bad csv');
    expect(component.uploading()).toBe(false);
  });

  it('uses default parse error message when thrown value is not Error', async () => {
    const csvFile = new File(['header\nvalue'], 'template.csv', { type: 'text/csv' });
    const event = {
      target: { files: [csvFile], value: 'C:/fakepath/template.csv' },
    } as unknown as Event;

    vi.spyOn(component as never, 'parseCsvFile').mockRejectedValue('boom' as never);

    await component.onFileSelect(event);

    expect(component.errorMessage()).toBe('Failed to process the uploaded file.');
    expect(component.uploading()).toBe(false);
  });

  it('navigates to form on goToManualForm()', () => {
    component.goToManualForm();

    expect(routerMock.navigate).toHaveBeenCalledWith(['/form']);
  });

  it('navigates to form on onSubmit()', () => {
    component.onSubmit();

    expect(routerMock.navigate).toHaveBeenCalledWith(['/form']);
  });

  it('sets error when downloadTemplate is called without questions', async () => {
    component.questions.set([]);

    await component.downloadTemplate();

    expect(component.errorMessage()).toBe('No sections available to generate template.');
  });

  it('clicks hidden input in triggerFileInput()', () => {
    const clickMock = vi.fn();
    const getElementByIdSpy = vi.spyOn(document, 'getElementById').mockReturnValue({
      click: clickMock,
    } as unknown as HTMLInputElement);

    component.triggerFileInput();

    expect(clickMock).toHaveBeenCalled();
    getElementByIdSpy.mockRestore();
  });

  it('normalizes parsed values for boolean, multiselect and file types', () => {
    const normalize = (component as any).normalizeParsedValue.bind(component);

    expect(normalize('boolean', 'Yes')).toBe(true);
    expect(normalize('boolean', 'No')).toBe(false);
    expect(normalize('boolean', 'maybe')).toBe('maybe');
    expect(normalize('multi-select', 'a, b , c')).toEqual(['a', 'b', 'c']);
    expect(normalize('multi-select', '')).toEqual([]);
    expect(normalize('file', 'doc.pdf')).toBe('doc.pdf');
  });

  it('validates question values across supported types', () => {
    const validate = (component as any).validateQuestionValue.bind(component);

    expect(validate('file', '')).toBe('Please provide at least one file reference.');
    expect(validate('file', 'doc.pdf')).toBe('');
    expect(validate('multi-select', [])).toBe('Please select at least one option.');
    expect(validate('multi-select', ['a'])).toBe('');
    expect(validate('boolean', 'yes')).toBe('Please choose Yes or No.');
    expect(validate('boolean', true)).toBe('');
    expect(validate('text', '')).toBe('This field is required.');
    expect(validate('integer', '1.2')).toBe('Please use whole numbers only.');
    expect(validate('decimal', 'abc')).toBe('Please enter a valid decimal number.');
    expect(validate('time', '30:90')).toBe('Please enter the time in HH:MM or HH:MM:SS format.');
    expect(validate('date', 'not-a-date')).toBe('Please enter a valid date.');
    expect(validate('text', 'ok')).toBe('');
  });

  it('builds template review items with row/source/options metadata', () => {
    component.questions.set([
      {
        id: 'q1',
        moduleId: 'onboarding',
        sectionId: 'building-setup',
        question: 'Building Name',
        type: 'text',
        options: ['A', 'B'],
        order: 1,
      },
    ] as any);

    const collect = (component as any).collectTemplateReviewItems.bind(component);
    const items = collect({ q1: 'Tower' });

    expect(items).toEqual([
      expect.objectContaining({
        id: 'q1',
        value: 'Tower',
        source: 'template',
        section: 'building-setup',
        row: 4,
        options: ['A', 'B'],
      }),
    ]);
  });

  it('maps worksheet names and headers to questions', () => {
    component.questions.set([
      {
        id: 'q-building',
        moduleId: 'onboarding',
        sectionId: 'building-setup',
        question: 'Building Name',
        type: 'text',
        order: 1,
      },
      {
        id: 'q-company',
        moduleId: 'onboarding',
        sectionId: 'company-details',
        question: 'Company Name',
        type: 'text',
        order: 2,
      },
    ]);

    const worksheetMatch = (component as any).getQuestionsForWorksheet('Building Setup');
    const worksheetMiss = (component as any).getQuestionsForWorksheet('Unknown Sheet');
    const byHeader = (component as any).findQuestionByHeader('building name');

    expect(worksheetMatch.length).toBe(1);
    expect(worksheetMiss).toEqual([]);
    expect(byHeader?.id).toBe('q-building');
  });

  it('covers helper branches for cellToString/sheetName/uniqueSheetName', () => {
    const asAny = component as any;

    expect(asAny.cellToString(null)).toBe('');
    expect(asAny.cellToString(10)).toBe('10');
    expect(asAny.cellToString(true)).toBe('true');
    expect(asAny.cellToString(new Date('2024-01-01T00:00:00.000Z'))).toBe('2024-01-01');
    expect(asAny.cellToString({ text: 'abc' })).toBe('abc');
    expect(asAny.cellToString({ text: undefined })).toBe('');
    expect(asAny.cellToString({ result: 7 })).toBe('7');
    expect(asAny.cellToString({ result: undefined })).toBe('');
    expect(asAny.cellToString({ foo: 'bar' })).toBe('[object Object]');

    expect(asAny.sheetName('A/B:C*D?E[F]G\\H').includes('/')).toBe(false);

    const used = new Set<string>();
    const n1 = asAny.uniqueSheetName('Sheet', used);
    const n2 = asAny.uniqueSheetName('Sheet', used);
    const n3 = asAny.uniqueSheetName('', used);
    expect(n1).toBe('Sheet');
    expect(n2).toBe('Sheet-1');
    expect(n3).toBe('-1');
  });

  it('uses empty fallback when csv header has no matching data column', async () => {
    component.questions.set([
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
        sectionId: 'building-setup',
        question: 'Active',
        type: 'boolean',
        order: 2,
      },
    ]);

    const file = new File(['Building Name,Active\nTower'], 't.csv', { type: 'text/csv' });
    const parseCsvFile = (component as any).parseCsvFile.bind(component);

    const result = await parseCsvFile(file);

    expect(result).toEqual({ q1: 'Tower', q2: '' });
  });

  it('uses empty options fallback in collected review items when options are missing', () => {
    component.questions.set([
      {
        id: 'q-no-options',
        moduleId: 'onboarding',
        sectionId: 'building-setup',
        question: 'No Options',
        type: 'dropdown',
        order: 1,
      },
    ] as any);

    const collect = (component as any).collectTemplateReviewItems.bind(component);
    const items = collect({ 'q-no-options': 'A' });

    expect(items[0]?.options).toEqual([]);
  });

  it('validates null and undefined values through text fallback branches', () => {
    const validate = (component as any).validateQuestionValue.bind(component);

    expect(validate('text', null)).toBe('This field is required.');
    expect(validate('integer', undefined)).toBe('This field is required.');
  });

  it('uses section id label fallback in template generation when section label map misses key', async () => {
    const clickMock = vi.fn();
    const originalCreateElement = document.createElement.bind(document);
    const previousCreateObjectURL = (URL as any).createObjectURL;
    const previousRevokeObjectURL = (URL as any).revokeObjectURL;

    (URL as any).createObjectURL = vi.fn(() => 'blob://file');
    (URL as any).revokeObjectURL = vi.fn(() => undefined);

    const createElementSpy = vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'a') {
        return {
          href: '',
          download: '',
          click: clickMock,
        } as unknown as HTMLAnchorElement;
      }

      return originalCreateElement(tag);
    });

    component.questions.set([
      {
        id: 'q1',
        moduleId: 'onboarding',
        sectionId: 'missing-section-label',
        question: undefined,
        type: 'text',
        order: 1,
      },
    ] as any);

    await component.downloadTemplate();

    expect(clickMock).toHaveBeenCalled();

    createElementSpy.mockRestore();
    (URL as any).createObjectURL = previousCreateObjectURL;
    (URL as any).revokeObjectURL = previousRevokeObjectURL;
  });

  it('returns empty result when section id fallback label does not match worksheet normalization', async () => {
    component.questions.set([
      {
        id: 'q1',
        moduleId: 'onboarding',
        sectionId: 'missing-section-label',
        question: 'Field 1',
        type: 'text',
        order: 1,
      },
    ] as any);

    const workbook = new ExcelJS.Workbook();
    const ws = workbook.addWorksheet('Missing Section Label');
    ws.getCell(2, 1).value = 'Field 1';
    ws.getCell(4, 1).value = 'Value';

    const buffer = await workbook.xlsx.writeBuffer();
    const file = new File([buffer as ArrayBuffer], 'template.xlsx');

    const parseExcelTemplate = (component as any).parseExcelTemplate.bind(component);
    const result = await parseExcelTemplate(file);

    expect(result).toEqual({});
  });

  it('generates template and triggers browser download when questions exist', async () => {
    const clickMock = vi.fn();
    const originalCreateElement = document.createElement.bind(document);
    const previousCreateObjectURL = (URL as any).createObjectURL;
    const previousRevokeObjectURL = (URL as any).revokeObjectURL;

    (URL as any).createObjectURL = vi.fn(() => 'blob://file');
    (URL as any).revokeObjectURL = vi.fn(() => undefined);
    const createElementSpy = vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'a') {
        return {
          href: '',
          download: '',
          click: clickMock,
        } as unknown as HTMLAnchorElement;
      }

      return originalCreateElement(tag);
    });

    component.questions.set([
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
        sectionId: 'building-setup',
        question: 'Is Active',
        type: 'boolean',
        order: 2,
      },
    ]);

    await component.downloadTemplate();

    expect((URL as any).createObjectURL).toHaveBeenCalled();
    expect(clickMock).toHaveBeenCalled();
    expect((URL as any).revokeObjectURL).toHaveBeenCalledWith('blob://file');

    createElementSpy.mockRestore();
    (URL as any).createObjectURL = previousCreateObjectURL;
    (URL as any).revokeObjectURL = previousRevokeObjectURL;
  });

  it('handles out-of-range worksheet callback columns during template styling', async () => {
    const originalAddWorksheet = ExcelJS.Workbook.prototype.addWorksheet;
    const addWorksheetSpy = vi
      .spyOn(ExcelJS.Workbook.prototype, 'addWorksheet')
      .mockImplementation(function (this: ExcelJS.Workbook, ...args: Parameters<ExcelJS.Workbook['addWorksheet']>) {
        const ws = originalAddWorksheet.apply(this, args as [string]);
        const originalGetRow = ws.getRow.bind(ws);

        ws.getRow = ((rowNumber: number) => {
          const row = originalGetRow(rowNumber);

          if (rowNumber === 2 || rowNumber === 3 || rowNumber === 4) {
            const originalEachCell = row.eachCell.bind(row);
            row.eachCell = ((...args: any[]) => {
              originalEachCell(...(args as [any]));
              const cb = args[args.length - 1] as ((cell: ExcelJS.Cell, colNumber: number) => void) | undefined;
              if (typeof cb === 'function') {
                cb({} as ExcelJS.Cell, 20000);
              }
            }) as typeof row.eachCell;
          }

          return row;
        }) as typeof ws.getRow;

        return ws;
      });

    const clickMock = vi.fn();
    const originalCreateElement = document.createElement.bind(document);
    const createElementSpy = vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'a') {
        return {
          href: '',
          download: '',
          click: clickMock,
        } as unknown as HTMLAnchorElement;
      }

      return originalCreateElement(tag);
    });

    const previousCreateObjectURL = (URL as any).createObjectURL;
    const previousRevokeObjectURL = (URL as any).revokeObjectURL;
    (URL as any).createObjectURL = vi.fn(() => 'blob://file');
    (URL as any).revokeObjectURL = vi.fn(() => undefined);

    component.questions.set([
      {
        id: 'q1',
        moduleId: 'onboarding',
        sectionId: 'building-setup',
        question: 'Building Name',
        type: 'text',
        order: 1,
      },
    ] as any);

    try {
      await component.downloadTemplate();
      expect(clickMock).toHaveBeenCalled();
    } finally {
      addWorksheetSpy.mockRestore();
      createElementSpy.mockRestore();
      (URL as any).createObjectURL = previousCreateObjectURL;
      (URL as any).revokeObjectURL = previousRevokeObjectURL;
    }
  });

  it('parses csv rows and maps known headers only', async () => {
    component.questions.set([
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
        sectionId: 'building-setup',
        question: 'Active',
        type: 'boolean',
        order: 2,
      },
    ]);

    const file = new File(['Building Name,Active,Ignored\nTower,Yes,x'], 't.csv', { type: 'text/csv' });
    const parseCsvFile = (component as any).parseCsvFile.bind(component);

    const result = await parseCsvFile(file);

    expect(result).toEqual({ q1: 'Tower', q2: true });
  });

  it('returns empty object for csv with insufficient lines', async () => {
    const file = new File(['OnlyHeaders'], 't.csv', { type: 'text/csv' });
    const parseCsvFile = (component as any).parseCsvFile.bind(component);

    const result = await parseCsvFile(file);

    expect(result).toEqual({});
  });

  it('parses excel template values by section and header/id match', async () => {
    component.questions.set([
      {
        id: 'building_name',
        moduleId: 'onboarding',
        sectionId: 'building-setup',
        question: 'Building Name',
        type: 'text',
        order: 1,
      },
      {
        id: 'is_active',
        moduleId: 'onboarding',
        sectionId: 'building-setup',
        question: 'Is Active',
        type: 'boolean',
        order: 2,
      },
      {
        id: 'tags',
        moduleId: 'onboarding',
        sectionId: 'building-setup',
        question: 'Tags',
        type: 'multi-select',
        order: 3,
      },
    ]);

    const workbook = new ExcelJS.Workbook();
    const ws = workbook.addWorksheet('Building Setup');
    ws.getCell(2, 1).value = 'Building Name';
    ws.getCell(2, 2).value = 'is_active';
    ws.getCell(2, 3).value = 'Tags';
    ws.getCell(4, 1).value = 'Tower';
    ws.getCell(4, 2).value = 'Yes';
    ws.getCell(4, 3).value = 'a, b';

    const buffer = await workbook.xlsx.writeBuffer();
    const file = new File([buffer as ArrayBuffer], 'template.xlsx');

    const parseExcelTemplate = (component as any).parseExcelTemplate.bind(component);
    const result = await parseExcelTemplate(file);

    expect(result).toEqual(
      expect.objectContaining({
        q1: 'Tower',
      }),
    );
  });

  it('returns empty object when excel worksheet does not map to selected sections', async () => {
    component.questions.set([
      {
        id: 'q1',
        moduleId: 'onboarding',
        sectionId: 'building-setup',
        question: 'Building Name',
        type: 'text',
        order: 1,
      },
    ]);

    const workbook = new ExcelJS.Workbook();
    const ws = workbook.addWorksheet('Unknown Section');
    ws.getCell(2, 1).value = 'Building Name';
    ws.getCell(4, 1).value = 'Tower';

    const buffer = await workbook.xlsx.writeBuffer();
    const file = new File([buffer as ArrayBuffer], 'template.xlsx');

    const parseExcelTemplate = (component as any).parseExcelTemplate.bind(component);
    const result = await parseExcelTemplate(file);

    expect(result).toEqual({});
  });

  it('skips blank headers while parsing excel template', async () => {
    component.questions.set([
      {
        id: 'q1',
        moduleId: 'onboarding',
        sectionId: 'building-setup',
        question: 'Building Name',
        type: 'text',
        order: 1,
      },
    ]);

    const workbook = new ExcelJS.Workbook();
    const ws = workbook.addWorksheet('Building Setup');
    ws.getCell(2, 1).value = '';
    ws.getCell(4, 1).value = 'IGNORED';
    ws.getCell(2, 2).value = 'Building Name';
    ws.getCell(4, 2).value = 'Tower';

    const buffer = await workbook.xlsx.writeBuffer();
    const file = new File([buffer as ArrayBuffer], 'template.xlsx');

    const parseExcelTemplate = (component as any).parseExcelTemplate.bind(component);
    const result = await parseExcelTemplate(file);

    expect(result).toEqual({ q1: 'Tower' });
  });

  it('handles invalid selectedSections JSON safely on init', () => {
    localStorage.setItem('selectedSections', '{bad-json');

    component.ngOnInit();

    expect(component.questions().length).toBe(mockQuestions.length);
  });

  it('covers validateQuestionValue undefined branch for file fields', () => {
    const validate = (component as any).validateQuestionValue.bind(component);

    expect(validate('file', undefined)).toBe('Please provide at least one file reference.');
  });

  it('covers section label and question length nullish fallback branches', async () => {
    const clickMock = vi.fn();
    const originalCreateElement = document.createElement.bind(document);
    const createElementSpy = vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'a') {
        return {
          href: '',
          download: '',
          click: clickMock,
        } as unknown as HTMLAnchorElement;
      }

      return originalCreateElement(tag);
    });

    const previousCreateObjectURL = (URL as any).createObjectURL;
    const previousRevokeObjectURL = (URL as any).revokeObjectURL;
    (URL as any).createObjectURL = vi.fn(() => 'blob://file');
    (URL as any).revokeObjectURL = vi.fn(() => undefined);

    component.questions.set([
      {
        id: 'q1',
        moduleId: 'onboarding',
        sectionId: 'known',
        question: 'Known',
        type: 'text',
        order: 1,
      },
    ] as any);

    questionServiceMock.getSections.mockReset();
    questionServiceMock.getSections.mockImplementation((questions: Array<{ sectionId: string }>) => {
      if (questions.some((q) => q.sectionId === 'missing-section-label')) {
        return ['missing-section-label'];
      }
      return ['known'];
    });
    questionServiceMock.getQuestionsBySection.mockImplementation(
      (_questions: unknown[], sectionId: string) => {
        if (sectionId === 'missing-section-label') {
          return [
            {
              id: 'q-missing',
              moduleId: 'onboarding',
              sectionId,
              question: undefined,
              type: 'text',
              order: 1,
            },
          ];
        }

        return [];
      },
    );

    try {
      await component.downloadTemplate();
      expect(clickMock).toHaveBeenCalled();
    } finally {
      questionServiceMock.getSections.mockReset();
      questionServiceMock.getSections.mockReturnValue(['building-setup', 'company-details']);
      questionServiceMock.getQuestionsBySection.mockReset();
      questionServiceMock.getQuestionsBySection.mockImplementation(
        (questions: Array<{ sectionId: string }>, sectionId: string) =>
          questions.filter((q) => q.sectionId === sectionId),
      );
      createElementSpy.mockRestore();
      (URL as any).createObjectURL = previousCreateObjectURL;
      (URL as any).revokeObjectURL = previousRevokeObjectURL;
    }
  });
});
