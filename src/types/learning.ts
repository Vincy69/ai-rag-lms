export interface Block {
  id: string;
  name: string;
  description: string | null;
  orderIndex: number;
  status: string;
  progress: number;
  formationName: string;
  totalLessons: number;
  totalQuizzes: number;
}

export interface BlocksByFormation {
  [key: string]: Block[];
}