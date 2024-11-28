import { ChapterNavigator } from "./ChapterNavigator";

interface NavigationAreaProps {
  chapters: any[];
  blockQuizzes?: any[];
  selectedLessonId: string | null;
  selectedQuizId: string | null;
  onSelectLesson: (lessonId: string) => void;
  onSelectQuiz: (quizId: string) => void;
  completedLessonIds: Set<string>;
  condensed?: boolean;
}

export function NavigationArea({
  chapters,
  blockQuizzes,
  selectedLessonId,
  selectedQuizId,
  onSelectLesson,
  onSelectQuiz,
  completedLessonIds,
  condensed = false
}: NavigationAreaProps) {
  return (
    <ChapterNavigator
      chapters={chapters}
      blockQuizzes={blockQuizzes}
      selectedLessonId={selectedLessonId || undefined}
      selectedQuizId={selectedQuizId || undefined}
      onSelectLesson={onSelectLesson}
      onSelectQuiz={onSelectQuiz}
      completedLessonIds={completedLessonIds}
      condensed={condensed}
    />
  );
}