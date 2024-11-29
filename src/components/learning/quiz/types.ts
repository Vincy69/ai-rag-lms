export interface QuizQuestion {
  id: string;
  question: string;
  explanation: string | null;
  order_index: number;
  answers: {
    id: string;
    answer: string;
    is_correct: boolean;
    explanation: string | null;
    order_index: number;
  }[];
}

export interface QuizAttemptState {
  [questionId: string]: {
    selectedAnswerId: string | null;
    isCorrect: boolean;
  };
}