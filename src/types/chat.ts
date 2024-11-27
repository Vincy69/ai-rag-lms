import { Json } from "@/integrations/supabase/types";

export interface ChatMessage {
  input: string;
  output: string;
  score: number;
  feedback: string | null;
}

export interface ChatHistory {
  id: string;
  session_id: string;
  message: ChatMessage;
  timestamp: Date;
  user_id?: string | null;
}