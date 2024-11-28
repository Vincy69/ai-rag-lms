import { Award, Check, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuizItemProps {
  quiz: {
    id: string;
    title: string;
    quiz_type: string;
  };
  isSelected: boolean;
  score?: number;
  onSelect: (quizId: string) => void;
  condensed?: boolean;
}

export function QuizItem({ quiz, isSelected, score, onSelect, condensed = false }: QuizItemProps) {
  const isCompleted = score !== undefined && score >= 70;
  const icon = quiz.quiz_type === 'block_quiz' ? Award : GraduationCap;
  const Icon = icon;

  return (
    <button
      onClick={() => !condensed && onSelect(quiz.id)}
      className={cn(
        "w-full flex items-center gap-2 p-2 text-sm rounded-lg transition-colors",
        isSelected ? "bg-primary/10 text-primary" : "hover:bg-accent/50",
        quiz.quiz_type === 'block_quiz' ? "bg-primary/5" : "bg-secondary/30",
        condensed && "cursor-default"
      )}
    >
      <div className="flex items-center gap-2 flex-1">
        <Icon className="h-4 w-4" />
        <span>{quiz.title}</span>
      </div>
      <div className="flex items-center gap-2">
        {score !== undefined && (
          <span className="text-xs text-muted-foreground">
            {score}%
          </span>
        )}
        {isCompleted && (
          <Check className="h-4 w-4 text-green-500" />
        )}
      </div>
    </button>
  );
}