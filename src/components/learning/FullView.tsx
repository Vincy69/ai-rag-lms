import { Card } from "@/components/ui/card";
import { NavigationArea } from "./NavigationArea";
import { ContentArea } from "./ContentArea";
import { BlockHeader } from "./BlockHeader";

interface FullViewProps {
  block: {
    name: string;
    formations?: { name: string };
    progress: number;
  };
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
  block,
  chapters,
  blockQuizzes,
  selectedLessonId,
  selectedQuizId,
  selectedLesson,
  blockId,
  completedLessonIds,
  onSelectLesson,
  onSelectQuiz
}: FullViewProps) {
  return (
    <div className="space-y-6">
      <BlockHeader 
        name={block?.name}
        formationName={block?.formations?.name}
        progress={block?.progress}
      />

      <div className="grid grid-cols-12 gap-6">
        <Card className="col-span-4 p-4">
          <NavigationArea
            chapters={chapters}
            blockQuizzes={blockQuizzes}
            selectedLessonId={selectedLessonId}
            selectedQuizId={selectedQuizId}
            onSelectLesson={onSelectLesson}
            onSelectQuiz={onSelectQuiz}
            completedLessonIds={completedLessonIds}
          />
        </Card>

        <Card className="col-span-8 p-6">
          <ContentArea
            selectedQuizId={selectedQuizId}
            selectedLesson={selectedLesson}
            blockId={blockId}
          />
        </Card>
      </div>
    </div>
  );
}