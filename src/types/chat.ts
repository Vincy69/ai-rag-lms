export interface ChatHistory {
  id: string;
  message: string;
  response: string;
  timestamp: Date;
  score: number;
  feedback: string | null;
}