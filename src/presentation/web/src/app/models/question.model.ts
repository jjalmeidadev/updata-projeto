export type QuestionType =
  | 'text' | 'integer' | 'decimal' | 'textarea'
  | 'dropdown' | 'multi-select' | 'boolean'
  | 'time' | 'date' | 'file';

export interface Question {
  id: string;
  moduleId: string;
  sectionId: string;
  question: string;
  description?: string;
  type: QuestionType;
  options?: string[];
  source?: string;
  order: number;
}