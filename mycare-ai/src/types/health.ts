export type QuestionType = 'multiple-choice' | 'yes-no' | 'slider' | 'text' | 'checkbox';

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
}

export interface HealthResponse {
  questions: Question[];
  finalDiagnosis?: string;
  recommendations?: string[];
}

export interface HealthState {
  currentQuestionIndex: number;
  answers: Record<string, any>;
  isComplete: boolean;
} 