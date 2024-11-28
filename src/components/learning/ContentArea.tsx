import { Card } from "@/components/ui/card";
import { LessonContent } from "./LessonContent";
import { LessonCompletionButton } from "./LessonCompletionButton";
import { QuizContent } from "./quiz/QuizContent";

interface ContentAreaProps {
  selectedQuizId: string | null;
  selectedLesson: any | null;
  blockId: string;
}

export function ContentArea({ selectedQuizId, selectedLesson, blockId }: ContentAreaProps) {
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
          <LessonCompletionButton
            lessonId={selectedLesson.id}
            chapterId={selectedLesson.chapter_id}
            blockId={blockId}
            onComplete={() => {
              window.location.reload();
            }}
          />
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