import { Card } from "@/components/ui/card";
import { ChapterNavigator } from "./ChapterNavigator";

interface NavigationAreaProps {
  chapters: any[];
  blockQuizzes?: any[];
  selectedLessonId: string | null;
  onSelectLesson: (lessonId: string) => void;
  onSelectQuiz: (quizId: string) => void;
  completedLessonIds: Set<string>;
}

export function NavigationArea({
  chapters,
  blockQuizzes,
  selectedLessonId,
  onSelectLesson,
  onSelectQuiz,
  completedLessonIds
}: NavigationAreaProps) {
  return (
    <Card className="col-span-4 p-4">
      <ChapterNavigator
        chapters={chapters}
        blockQuizzes={blockQuizzes}
        selectedLessonId={selectedLessonId || undefined}
        onSelectLesson={onSelectLesson}
        onSelectQuiz={onSelectQuiz}
        completedLessonIds={completedLessonIds}
      />
    </Card>
  );
}