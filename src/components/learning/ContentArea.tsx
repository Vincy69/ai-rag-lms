import { Card } from "@/components/ui/card";
import { LessonContent } from "./LessonContent";
import { LessonCompletionButton } from "./LessonCompletionButton";
import { QuizContent } from "./quiz/QuizContent";
import { LessonNavigation } from "./LessonNavigation";

interface ContentAreaProps {
  selectedQuizId: string | null;
  selectedLesson: any | null;
  blockId: string;
  onNavigate?: (lessonId: string) => void;
  previousLessonId?: string | null;
  nextLessonId?: string | null;
  isLessonCompleted?: boolean;
}

export function ContentArea({ 
  selectedQuizId, 
  selectedLesson, 
  blockId,
  onNavigate,
  previousLessonId,
  nextLessonId,
  isLessonCompleted
}: ContentAreaProps) {
  if (selectedQuizId) {
    return (
      <Card className="border bg-card/50 p-6">
        <QuizContent quizId={selectedQuizId} />
      </Card>
    );
  }

  if (selectedLesson) {
    return (
      <Card className="border bg-card/50 p-6">
        <div className="space-y-6">
          <LessonContent lesson={selectedLesson} />
          
          <LessonNavigation
            onPrevious={previousLessonId ? () => onNavigate?.(previousLessonId) : undefined}
            onNext={nextLessonId ? () => onNavigate?.(nextLessonId) : undefined}
            onComplete={() => {
              const button = document.querySelector('[data-complete-button]') as HTMLButtonElement;
              if (button) button.click();
            }}
            hasPrevious={!!previousLessonId}
            hasNext={!!nextLessonId}
            isCompleted={isLessonCompleted}
          />
          
          <div className="hidden">
            <LessonCompletionButton
              lessonId={selectedLesson.id}
              chapterId={selectedLesson.chapter_id}
              blockId={blockId}
              onComplete={() => window.location.reload()}
              data-complete-button
            />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="border bg-card/50 p-6">
      <p className="text-muted-foreground text-sm text-center">
        Sélectionnez une leçon ou un quiz pour voir son contenu
      </p>
    </Card>
  );
}