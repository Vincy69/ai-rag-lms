import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { LessonItem } from "./LessonItem";
import { QuizItem } from "./QuizItem";
import { Progress } from "@/components/ui/progress";

interface ChapterNavigatorProps {
  chapters: any[];
  blockQuizzes?: any[];
  selectedLessonId?: string;
  selectedQuizId?: string;
  onSelectLesson: (lessonId: string) => void;
  onSelectQuiz: (quizId: string) => void;
  completedLessonIds: Set<string>;
  condensed?: boolean;
}

export function ChapterNavigator({
  chapters,
  blockQuizzes = [],
  selectedLessonId,
  selectedQuizId,
  onSelectLesson,
  onSelectQuiz,
  completedLessonIds,
  condensed = false
}: ChapterNavigatorProps) {
  return (
    <div className="space-y-4">
      <Accordion type="single" collapsible defaultValue={chapters[0]?.id}>
        {chapters.map((chapter) => {
          const totalItems = chapter.lessons.length + (chapter.quizzes?.length || 0);
          const completedItems = chapter.completedLessons + (chapter.quizzes?.filter((q: any) => q.completed)?.length || 0);
          const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

          return (
            <AccordionItem key={chapter.id} value={chapter.id} className="border-0">
              <AccordionTrigger className="hover:no-underline py-2 px-4 rounded-lg hover:bg-accent">
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{chapter.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {completedItems}/{totalItems}
                    </span>
                  </div>
                  <Progress value={progress} className="h-1" />
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-2 pb-0">
                <div className="space-y-1 pl-4">
                  {chapter.lessons.map((lesson: any) => (
                    <LessonItem
                      key={lesson.id}
                      lesson={lesson}
                      isSelected={selectedLessonId === lesson.id}
                      isCompleted={completedLessonIds.has(lesson.id)}
                      onSelect={onSelectLesson}
                    />
                  ))}
                  {chapter.quizzes?.map((quiz: any) => (
                    <QuizItem
                      key={quiz.id}
                      quiz={quiz}
                      isSelected={selectedQuizId === quiz.id}
                      onSelect={onSelectQuiz}
                    />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      {blockQuizzes.length > 0 && (
        <div className="space-y-2 pt-4">
          <h4 className="text-sm font-medium px-4">Quiz du bloc</h4>
          <div className="space-y-1">
            {blockQuizzes.map((quiz) => (
              <QuizItem
                key={quiz.id}
                quiz={quiz}
                isSelected={selectedQuizId === quiz.id}
                onSelect={onSelectQuiz}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}