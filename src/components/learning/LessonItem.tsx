import { BookOpen, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface LessonItemProps {
  lesson: {
    id: string;
    title: string;
    duration?: number | null;
  };
  isSelected: boolean;
  isCompleted: boolean;
  onSelect: (lessonId: string) => void;
}

export function LessonItem({ lesson, isSelected, isCompleted, onSelect }: LessonItemProps) {
  return (
    <button
      onClick={() => onSelect(lesson.id)}
      className={cn(
        "w-full flex items-center gap-2 p-2 text-sm rounded-lg transition-colors",
        isSelected ? "bg-accent/50 text-primary" : "hover:bg-accent/50"
      )}
    >
      <div className="flex items-center gap-2 flex-1">
        <BookOpen className="h-4 w-4" />
        <span>{lesson.title}</span>
      </div>
      <div className="flex items-center gap-2">
        {isCompleted && (
          <Check className="h-4 w-4 text-green-500" />
        )}
        {lesson.duration && (
          <span className="text-xs text-muted-foreground">
            {lesson.duration} min
          </span>
        )}
      </div>
    </button>
  );
}