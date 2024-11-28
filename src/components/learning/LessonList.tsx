import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpenText } from "lucide-react";

interface Lesson {
  id: string;
  title: string;
  duration: number | null;
  order_index: number;
}

interface LessonListProps {
  lessons: Lesson[];
  onSelectLesson: (lessonId: string) => void;
  selectedLessonId?: string;
  completedLessonIds: Set<string>;
  condensed?: boolean;
}

export function LessonList({ lessons, onSelectLesson, selectedLessonId, completedLessonIds, condensed = false }: LessonListProps) {
  return (
    <ScrollArea className="h-[calc(100vh-16rem)] pr-4">
      <div className="space-y-2">
        {lessons.map((lesson) => (
          <button
            key={lesson.id}
            onClick={() => onSelectLesson(lesson.id)}
            className={`w-full p-3 rounded-lg transition-colors group hover:bg-accent flex items-center gap-3 ${
              selectedLessonId === lesson.id ? "bg-accent" : ""
            }`}
          >
            <BookOpenText className="w-4 h-4 text-primary" />
            <div className="flex-1 text-left">
              <p className="font-medium group-hover:text-primary transition-colors">
                {lesson.title}
              </p>
              {lesson.duration && (
                <p className="text-xs text-muted-foreground">
                  {lesson.duration} minutes
                </p>
              )}
            </div>
          </button>
        ))}
      </div>
    </ScrollArea>
  );
}