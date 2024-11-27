export interface ChatHistory {
  id: string;
  session_id: string;
  message: {
    input: string;
    output: string;
    score: number;
    feedback: string | null;
  };
  timestamp: Date;
}