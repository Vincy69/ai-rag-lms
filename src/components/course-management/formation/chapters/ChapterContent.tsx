import { ContentList } from "../ContentList";
import { Chapter } from "../types";

interface ChapterContentProps {
  chapterId: string;
  content: Chapter;
}

export function ChapterContent({ chapterId, content }: ChapterContentProps) {
  const sortedContent = [
    ...(content.lessons || []).map(l => ({ 
      ...l, 
      type: 'lesson' as const,
      chapter_id: chapterId 
    })),
    ...(content.quizzes || []).map(q => ({ 
      ...q, 
      type: 'quiz' as const,
      chapter_id: chapterId 
    }))
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