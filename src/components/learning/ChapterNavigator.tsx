import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChapterProgress } from "./ChapterProgress";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LessonItem } from "./LessonItem";
import { QuizItem } from "./QuizItem";

interface Chapter {
  id: string;
  title: string;
  lessons: Array<{
    id: string;
    title: string;
    duration: number | null;
  }>;
  quizzes?: Array<{
    id: string;
    title: string;
    quiz_type: string;
    chapter_id: string | null;
  }>;
  completedLessons: number;
}

interface ChapterNavigatorProps {
  chapters: Chapter[];
  blockQuizzes?: Array<{
    id: string;
    title: string;
    quiz_type: string;
  }>;
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
  const [expandedChapterId, setExpandedChapterId] = useState<string | null>(
    chapters.length > 0 ? chapters[0].id : null
  );

  // Fetch completed quizzes and scores
  const { data: quizScores } = useQuery({
    queryKey: ["quiz-scores"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return new Map<string, number>();

      const { data: attempts } = await supabase
        .from("quiz_attempts")
        .select("quiz_id, score")
        .eq("user_id", user.id);

      const scoreMap = new Map<string, number>();
      attempts?.forEach(attempt => {
        const currentScore = scoreMap.get(attempt.quiz_id) || 0;
        if (attempt.score > currentScore) {
          scoreMap.set(attempt.quiz_id, attempt.score);
        }
      });

      return scoreMap;
    },
  });

  return (
    <div className="space-y-2">
      {chapters.map((chapter) => {
        // Ne garder que les quiz qui sont spécifiquement liés à ce chapitre
        const chapterQuizzes = chapter.quizzes?.filter(quiz => 
          quiz.chapter_id === chapter.id && quiz.quiz_type === 'chapter_quiz'
        ) || [];

        return (
          <div key={chapter.id} className="space-y-2">
            <button
              onClick={() => !condensed && setExpandedChapterId(
                expandedChapterId === chapter.id ? null : chapter.id
              )}
              className={cn(
                "w-full text-left p-4 rounded-lg bg-card hover:bg-accent transition-colors",
                condensed && "cursor-default hover:bg-card"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{chapter.title}</span>
                {!condensed && (
                  expandedChapterId === chapter.id ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )
                )}
              </div>
              
              <ChapterProgress 
                completedLessons={chapter.completedLessons} 
                totalLessons={chapter.lessons.length} 
              />
            </button>

            {!condensed && expandedChapterId === chapter.id && (
              <div className="ml-4 space-y-1">
                {chapter.lessons.map((lesson) => (
                  <LessonItem
                    key={lesson.id}
                    lesson={lesson}
                    isSelected={selectedLessonId === lesson.id}
                    isCompleted={completedLessonIds.has(lesson.id)}
                    onSelect={onSelectLesson}
                  />
                ))}
                
                {chapterQuizzes.map(quiz => (
                  <QuizItem
                    key={quiz.id}
                    quiz={quiz}
                    isSelected={selectedQuizId === quiz.id}
                    score={quizScores?.get(quiz.id)}
                    onSelect={onSelectQuiz}
                    condensed={condensed}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}

      {blockQuizzes && blockQuizzes.length > 0 && (
        <div className="mt-4 space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground px-4">Quiz du bloc</h3>
          {blockQuizzes.map(quiz => (
            <QuizItem
              key={quiz.id}
              quiz={quiz}
              isSelected={selectedQuizId === quiz.id}
              score={quizScores?.get(quiz.id)}
              onSelect={onSelectQuiz}
              condensed={condensed}
            />
          ))}
        </div>
      )}
    </div>
  );
}