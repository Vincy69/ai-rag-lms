import { ChapterNavigator } from "./ChapterNavigator";
import { Progress } from "@/components/ui/progress";

interface FullViewProps {
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

export function FullView({
  chapters,
  blockQuizzes,
  selectedLessonId,
  selectedQuizId,
  completedLessonIds,
  onSelectLesson,
  onSelectQuiz,
}: FullViewProps) {
  return (
    <div className="space-y-4">
      <ChapterNavigator
        chapters={chapters}
        blockQuizzes={blockQuizzes}
        selectedLessonId={selectedLessonId}
        selectedQuizId={selectedQuizId}
        onSelectLesson={onSelectLesson}
        onSelectQuiz={onSelectQuiz}
        completedLessonIds={completedLessonIds}
      />
    </div>
  );
}