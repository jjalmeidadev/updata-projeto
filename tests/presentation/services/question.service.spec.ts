import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { firstValueFrom } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { QuestionService } from '../../../src/presentation/web/src/app/services/question.service';

describe('QuestionService', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('deduplicates by section+id and sorts by order in getQuestions()', async () => {
    const httpMock = {
      get: vi.fn().mockReturnValue(
        of([
          { id: 'q2', sectionId: 'sec-a', order: 2 },
          { id: 'q1', sectionId: 'sec-a', order: 3 },
          { id: 'q1', sectionId: 'sec-a', order: 1 },
          { id: 'q3', sectionId: 'sec-b', order: 4 },
        ]),
      ),
    };

    TestBed.configureTestingModule({
      providers: [
        QuestionService,
        { provide: HttpClient, useValue: httpMock },
      ],
    });

    const service = TestBed.inject(QuestionService);
    const questions = await firstValueFrom(service.getQuestions());

    expect(httpMock.get).toHaveBeenCalledWith('/questions.json');
    expect(questions).toEqual([
      { id: 'q2', sectionId: 'sec-a', order: 2 },
      { id: 'q1', sectionId: 'sec-a', order: 3 },
      { id: 'q3', sectionId: 'sec-b', order: 4 },
    ]);
  });

  it('returns unique section ids in getSections()', () => {
    TestBed.configureTestingModule({
      providers: [
        QuestionService,
        { provide: HttpClient, useValue: { get: vi.fn() } },
      ],
    });

    const service = TestBed.inject(QuestionService);
    const sections = service.getSections([
      { id: 'q1', sectionId: 'sec-a', order: 1 } as any,
      { id: 'q2', sectionId: 'sec-b', order: 2 } as any,
      { id: 'q3', sectionId: 'sec-a', order: 3 } as any,
    ]);

    expect(sections).toEqual(['sec-a', 'sec-b']);
  });

  it('filters questions by section id in getQuestionsBySection()', () => {
    TestBed.configureTestingModule({
      providers: [
        QuestionService,
        { provide: HttpClient, useValue: { get: vi.fn() } },
      ],
    });

    const service = TestBed.inject(QuestionService);
    const filtered = service.getQuestionsBySection(
      [
        { id: 'q1', sectionId: 'sec-a', order: 1 } as any,
        { id: 'q2', sectionId: 'sec-b', order: 2 } as any,
      ],
      'sec-b',
    );

    expect(filtered).toEqual([{ id: 'q2', sectionId: 'sec-b', order: 2 }]);
  });
});
