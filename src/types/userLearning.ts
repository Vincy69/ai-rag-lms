import { Json } from "@/integrations/supabase/types";

export interface Formation {
  id: string;
  name: string;
  progress: number;
  status: string;
}

export interface Block {
  id: string;
  name: string;
  progress: number;
  status: string;
}

export interface UserLearningData {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  role: string | null;
  user_created_at: string | null;
  formations: Formation[] | null;
  blocks: Block[] | null;
  lessons: Json | null;
  quizzes: Json | null;
  skills: Json | null;
}