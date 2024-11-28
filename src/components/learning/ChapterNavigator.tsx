import { useState } from "react";
import { Check, ChevronDown, ChevronUp, BookOpen, Award, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChapterProgress } from "./ChapterProgress";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Lesson {
  id: string;
  title: string;
  duration: number | null;
}

interface Quiz {
  id: string;
  title: string;
  quiz_type: string;
  chapter_id?: string | null;
}

interface Chapter {
  id: string;
  title: string;
  lessons: Lesson[];
  quizzes?: Quiz[];
  completedLessons: number;
}

interface ChapterNavigatorProps {
  chapters: Chapter[];
  blockQuizzes?: Quiz[];
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

      // Get the highest score for each quiz
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

  const isQuizCompleted = (quizId: string) => {
    const score = quizScores?.get(quizId) || 0;
    return score >= 70;
  };

  const getQuizScore = (quizId: string) => {
    return quizScores?.get(quizId);
  };

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
                  <button
                    key={lesson.id}
                    onClick={() => onSelectLesson(lesson.id)}
                    className={cn(
                      "w-full flex items-center gap-2 p-2 text-sm rounded-lg transition-colors",
                      selectedLessonId === lesson.id 
                        ? "bg-accent/50 text-primary" 
                        : "hover:bg-accent/50"
                    )}
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <BookOpen className="h-4 w-4" />
                      <span>{lesson.title}</span>
                    </div>
                    {completedLessonIds.has(lesson.id) && (
                      <Check className="h-4 w-4 text-green-500" />
                    )}
                    {lesson.duration && (
                      <span className="text-xs text-muted-foreground">
                        {lesson.duration} min
                      </span>
                    )}
                  </button>
                ))}
                
                {chapterQuizzes.map(quiz => (
                  <button
                    key={quiz.id}
                    onClick={() => onSelectQuiz(quiz.id)}
                    className={cn(
                      "w-full flex items-center gap-2 p-2 text-sm rounded-lg transition-colors",
                      selectedQuizId === quiz.id 
                        ? "bg-primary/10 text-primary" 
                        : "hover:bg-accent/50 bg-secondary/30"
                    )}
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <GraduationCap className="h-4 w-4" />
                      <span>{quiz.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getQuizScore(quiz.id) !== undefined && (
                        <span className="text-xs text-muted-foreground">
                          {getQuizScore(quiz.id)}%
                        </span>
                      )}
                      {isQuizCompleted(quiz.id) && (
                        <Check className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                  </button>
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
            <button
              key={quiz.id}
              onClick={() => !condensed && onSelectQuiz(quiz.id)}
              className={cn(
                "w-full flex items-center gap-2 p-4 rounded-lg transition-colors",
                !condensed && "hover:bg-accent",
                condensed && "cursor-default",
                selectedQuizId === quiz.id ? "bg-primary/10" : "bg-secondary/30"
              )}
            >
              <Award className="h-5 w-5 text-primary" />
              <span className="font-medium flex-1">{quiz.title}</span>
              <div className="flex items-center gap-2">
                {getQuizScore(quiz.id) !== undefined && (
                  <span className="text-sm text-muted-foreground">
                    {getQuizScore(quiz.id)}%
                  </span>
                )}
                {isQuizCompleted(quiz.id) && (
                  <Check className="h-4 w-4 text-green-500" />
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}