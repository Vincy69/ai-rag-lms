import { ContentList } from "../ContentList";

interface Chapter {
  lessons?: Array<{
    id: string;
    title: string;
    content: string;
    duration: number | null;
    order_index: number;
  }>;
  quizzes?: Array<{
    id: string;
    title: string;
    order_index: number;
  }>;
}

interface ChapterContentProps {
  chapterId: string;
  content: Chapter;
}

export function ChapterContent({ chapterId, content }: ChapterContentProps) {
  const sortedContent = [
    ...(content.lessons || []).map(l => ({ ...l, type: 'lesson' as const })),
    ...(content.quizzes || []).map(q => ({ ...q, type: 'quiz' as const }))
  ].sort((a, b) => a.order_index - b.order_index);

  return (
    <div className="px-4 pb-4">
      <ContentList 
        chapterId={chapterId}
        content={sortedContent}
      />
    </div>
  );
}