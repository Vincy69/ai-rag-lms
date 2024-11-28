import { Check, Trophy, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface QuizResultProps {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
}

export function QuizResult({ score, totalQuestions, correctAnswers }: QuizResultProps) {
  const isPassed = score >= 70;

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex flex-col items-center gap-4 text-center">
          {isPassed ? (
            <Check className="w-16 h-16 text-green-500" />
          ) : (
            <X className="w-16 h-16 text-red-500" />
          )}
          <h2 className="text-2xl font-semibold">Quiz terminé !</h2>
          <p className={cn(
            "text-4xl font-bold",
            isPassed ? "text-green-500" : "text-red-500"
          )}>
            {score}%
          </p>
          <p className="text-muted-foreground">
            Vous avez répondu correctement à {correctAnswers} questions sur {totalQuestions} au premier essai
          </p>
        </div>
      </Card>
    </div>
  );
}