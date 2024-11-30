export interface BaseContent {
  id: string;
  title: string;
  chapter_id: string;
  order_index: number;
}

export interface LessonContent extends BaseContent {
  type: 'lesson';
  content: string;
  duration: number | null;
}

export interface QuizContent extends BaseContent {
  type: 'quiz';
}

export type ContentItem = LessonContent | QuizContent;

export interface Chapter {
  id: string;
  title: string;
  description: string | null;
  lessons: Array<{
    id: string;
    title: string;
    content: string;
    duration: number | null;
    chapter_id: string;
    order_index: number;
  }>;
  quizzes: Array<{
    id: string;
    title: string;
    chapter_id: string;
    order_index: number;
  }>;
}