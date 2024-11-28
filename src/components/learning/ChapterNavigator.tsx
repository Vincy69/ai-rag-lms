import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { LessonItem } from "./LessonItem";
import { QuizItem } from "./QuizItem";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
  // Récupérer les scores des quiz
  const { data: quizScores } = useQuery({
    queryKey: ["quiz-scores"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data } = await supabase
        .from("quiz_attempts")
        .select("quiz_id, score")
        .eq("user_id", user.id);

      return data?.reduce((acc: { [key: string]: number }, attempt) => {
        acc[attempt.quiz_id] = attempt.score;
        return acc;
      }, {}) || {};
    },
  });

  return (
    <div className="h-[calc(100vh-8rem)] overflow-auto">
      <Accordion type="single" collapsible defaultValue={chapters[0]?.id}>
        {chapters.map((chapter) => {
          const totalItems = chapter.lessons.length + (chapter.quizzes?.length || 0);
          const completedItems = chapter.completedLessons + (chapter.quizzes?.filter((q: any) => quizScores?.[q.id] >= 70)?.length || 0);
          const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

          return (
            <AccordionItem key={chapter.id} value={chapter.id} className="border-0">
              <AccordionTrigger className="hover:no-underline py-2 px-4 rounded-lg hover:bg-accent">
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between items-start gap-4">
                    <span className="font-medium text-left">{chapter.title}</span>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
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
                      score={quizScores?.[quiz.id]}
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
                score={quizScores?.[quiz.id]}
                onSelect={onSelectQuiz}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}