import { Card } from "@/components/ui/card";
import { FullView } from "./FullView";

interface BlockSidebarProps {
  block: any;
  chapters: any[];
  blockQuizzes: any[];
  selectedLessonId: string | null;
  selectedQuizId: string | null;
  selectedLesson: any;
  blockId: string;
  completedLessonIds: Set<string>;
  onSelectLesson: (lessonId: string) => void;
  onSelectQuiz: (quizId: string) => void;
}

export function BlockSidebar({
  block,
  chapters,
  blockQuizzes,
  selectedLessonId,
  selectedQuizId,
  selectedLesson,
  blockId,
  completedLessonIds,
  onSelectLesson,
  onSelectQuiz,
}: BlockSidebarProps) {
  return (
    <div className="sticky top-4 space-y-4">
      <h2 className="text-xl font-semibold text-left">{block?.name}</h2>
      <Card className="border bg-card/50 p-4">
        <FullView
          block={block}
          chapters={chapters}
          blockQuizzes={blockQuizzes}
          selectedLessonId={selectedLessonId}
          selectedQuizId={selectedQuizId}
          selectedLesson={selectedLesson}
          blockId={blockId}
          completedLessonIds={completedLessonIds}
          onSelectLesson={onSelectLesson}
          onSelectQuiz={onSelectQuiz}
        />
      </Card>
    </div>
  );
}