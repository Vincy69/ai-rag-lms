import { useState } from "react";
import { Check, ChevronDown, ChevronUp, BookOpen, Award, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChapterProgress } from "./ChapterProgress";

interface Lesson {
  id: string;
  title: string;
  duration: number | null;
}

interface Quiz {
  id: string;
  title: string;
  quiz_type: string;
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
  blockQuizzes,
  selectedLessonId,
  selectedQuizId,
  onSelectLesson,
  onSelectQuiz,
  completedLessonIds,
  condensed = false
}: ChapterNavigatorProps) {
  const [expandedChapterId, setExpandedChapterId] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      {chapters.map((chapter) => (
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
              
              {chapter.quizzes && chapter.quizzes.length > 0 && chapter.quizzes.map(quiz => (
                <button
                  key={quiz.id}
                  onClick={() => onSelectQuiz(quiz.id)}
                  className={cn(
                    "w-full flex items-center gap-2 p-2 text-sm rounded-lg transition-colors",
                    selectedQuizId === quiz.id 
                      ? "bg-accent/50 text-primary" 
                      : "hover:bg-accent/50"
                  )}
                >
                  <div className="flex items-center gap-2 flex-1">
                    <GraduationCap className="h-4 w-4" />
                    <span>{quiz.title}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      ))}

      {blockQuizzes && blockQuizzes.length > 0 && (
        <div className="mt-4 space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground px-4">Quiz du bloc</h3>
          {blockQuizzes.map(quiz => (
            <button
              key={quiz.id}
              onClick={() => !condensed && onSelectQuiz(quiz.id)}
              className={cn(
                "w-full text-left p-4 rounded-lg bg-card hover:bg-accent transition-colors",
                condensed && "cursor-default hover:bg-card",
                selectedQuizId === quiz.id && "bg-accent/50"
              )}
            >
              <div className="flex items-center gap-3">
                <Award className="h-5 w-5 text-primary" />
                <span className="font-medium">{quiz.title}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}