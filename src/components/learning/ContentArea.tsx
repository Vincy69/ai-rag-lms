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
      <Card className="h-full flex flex-col bg-card/50">
        <div className="flex-1 p-6 overflow-auto">
          <QuizContent quizId={selectedQuizId} />
        </div>
      </Card>
    );
  }

  if (selectedLesson) {
    return (
      <Card className="h-full flex flex-col bg-card/50">
        <div className="flex-1 p-6 overflow-auto">
          <LessonContent lesson={selectedLesson} />
        </div>
        
        <div className="border-t bg-card/50 p-4">
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
        </div>
        
        <div className="hidden">
          <LessonCompletionButton
            lessonId={selectedLesson.id}
            chapterId={selectedLesson.chapter_id}
            blockId={blockId}
            onComplete={() => {
              if (onNavigate && nextLessonId) {
                onNavigate(nextLessonId);
              } else {
                window.location.reload();
              }
            }}
            data-complete-button
          />
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-full flex items-center justify-center p-6 bg-card/50">
      <p className="text-muted-foreground text-sm text-center">
        Sélectionnez une leçon ou un quiz pour voir son contenu
      </p>
    </Card>
  );
}