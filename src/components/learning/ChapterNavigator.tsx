import { cn } from "@/lib/utils";
import { LessonList } from "./LessonList";
import { QuizItem } from "./QuizItem";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Chapter {
  id: string;
  title: string;
  lessons: any[];
  quizzes: any[];
  completedLessons: number;
}

interface ChapterNavigatorProps {
  chapters: Chapter[];
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
      if (!user) return {};

      const { data: attempts } = await supabase
        .from("quiz_attempts")
        .select("quiz_id, score")
        .eq("user_id", user.id);

      return attempts?.reduce((acc: { [key: string]: number }, attempt) => {
        acc[attempt.quiz_id] = attempt.score;
        return acc;
      }, {}) || {};
    }
  });

  return (
    <div className="space-y-4">
      <Accordion type="single" collapsible className="w-full">
        {chapters.map((chapter) => {
          // Filtrer pour n'avoir qu'un seul quiz par chapitre (de type chapter_quiz)
          const chapterQuiz = chapter.quizzes.find(q => q.quiz_type === 'chapter_quiz');
          
          return (
            <AccordionItem
              key={chapter.id}
              value={chapter.id}
              className={cn(
                "border rounded-lg",
                condensed && "border-none rounded-none"
              )}
            >
              <AccordionTrigger
                className={cn(
                  "px-4 hover:no-underline",
                  condensed && "px-0"
                )}
              >
                <div className="flex items-center justify-between flex-1 gap-2">
                  <span className="text-sm font-medium text-left">
                    {chapter.title}
                  </span>
                  {!condensed && (
                    <span className="text-xs text-muted-foreground">
                      {chapter.completedLessons}/{chapter.lessons.length} leçons complétées
                    </span>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className={cn("px-4", condensed && "px-0")}>
                <div className="py-2 space-y-2">
                  <LessonList
                    lessons={chapter.lessons}
                    selectedLessonId={selectedLessonId}
                    onSelectLesson={onSelectLesson}
                    completedLessonIds={completedLessonIds}
                    condensed={condensed}
                  />
                  {chapterQuiz && (
                    <QuizItem
                      quiz={chapterQuiz}
                      isSelected={selectedQuizId === chapterQuiz.id}
                      score={quizScores?.[chapterQuiz.id]}
                      onSelect={onSelectQuiz}
                      condensed={condensed}
                    />
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      {blockQuizzes && blockQuizzes.length > 0 && (
        <div className="space-y-2">
          <div className="px-4">
            <h4 className="text-sm font-medium mb-2">Quiz du bloc</h4>
          </div>
          {blockQuizzes.map((quiz) => (
            <QuizItem
              key={quiz.id}
              quiz={quiz}
              isSelected={selectedQuizId === quiz.id}
              score={quizScores?.[quiz.id]}
              onSelect={onSelectQuiz}
              condensed={condensed}
            />
          ))}
        </div>
      )}
    </div>
  );
}