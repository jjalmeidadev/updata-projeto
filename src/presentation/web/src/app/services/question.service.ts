import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Question } from '../models/question.model';

export const SECTION_LABELS: Partial<Record<string, string>> = {
  'building-setup':          'Building Setup',
  'company-details':         'Company Details',
  'residential-details':     'Residential Details',
  'amenity-details':         'Amenity Details',
  'amenity-rates':           'Amenity Rates',
  'amenity-configurations':  'Amenity Configurations',
  'amenity-availability':    'Amenity Availability',
  'amenity-extras':          'Amenity Extras',
  'amenity-settings':        'Amenity Settings',
  'amenity-calendar':        'Amenity Calendar',
  'amenity-terms':           'Amenity Terms',
  'amenity-cancellation':    'Amenity Cancellation',
};

// Fallback options for source-based dropdowns
export const SOURCE_OPTIONS: Record<string, string[]> = {
  industry: [
    'Technology', 'Finance', 'Healthcare', 'Retail',
    'Education', 'Real Estate', 'Legal', 'Other',
  ],
};

@Injectable({ providedIn: 'root' })
export class QuestionService {
  private readonly http = inject(HttpClient);

  getQuestions(): Observable<Question[]> {
    return this.http.get<Question[]>('/questions.json').pipe(
      map((questions: Question[]) => {
        // Deduplicate by sectionId + id (the JSON has repeated q56/q57)
        const seen = new Set<string>();
        return questions
          .filter((q: Question) => {
            const key = `${q.sectionId}-${q.id}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          })
          .sort((a: Question, b: Question) => a.order - b.order);
      })
    );
  }

  getSections(questions: Question[]): string[] {
    return [...new Set(questions.map(q => q.sectionId))];
  }

  getQuestionsBySection(questions: Question[], sectionId: string): Question[] {
    return questions.filter(q => q.sectionId === sectionId);
  }
}