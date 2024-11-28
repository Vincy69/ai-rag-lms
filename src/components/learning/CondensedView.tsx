import { Card } from "@/components/ui/card";
import { NavigationArea } from "./NavigationArea";
import { BlockHeader } from "./BlockHeader";

interface CondensedViewProps {
  block: {
    name: string;
    formations?: { name: string };
    progress: number;
  };
  chapters: any[];
  blockQuizzes: any[];
  completedLessonIds: Set<string>;
}

export function CondensedView({ block, chapters, blockQuizzes, completedLessonIds }: CondensedViewProps) {
  return (
    <div className="space-y-4">
      <BlockHeader 
        name={block?.name}
        formationName={block?.formations?.name}
        progress={block?.progress}
      />
      <Card className="p-4">
        <NavigationArea
          chapters={chapters || []}
          blockQuizzes={blockQuizzes || []}
          selectedLessonId={null}
          onSelectLesson={() => {}}
          onSelectQuiz={() => {}}
          completedLessonIds={completedLessonIds}
          condensed
        />
      </Card>
    </div>
  );
}