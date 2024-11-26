export interface ChatHistory {
  id: string;
  question: string;
  answer: string;
  timestamp: Date;
  score: number;
  feedback: string | null;
}