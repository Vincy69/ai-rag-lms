import { Trophy } from "lucide-react";
import { Card } from "@/components/ui/card";

interface QuizResultProps {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
}

export function QuizResult({ score, totalQuestions, correctAnswers }: QuizResultProps) {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <Trophy className="w-16 h-16 text-primary" />
          <h2 className="text-2xl font-semibold">Quiz terminé !</h2>
          <p className="text-4xl font-bold text-primary">{score}%</p>
          <p className="text-muted-foreground">
            Vous avez répondu correctement à {correctAnswers} questions sur {totalQuestions} au premier essai
          </p>
        </div>
      </Card>
    </div>
  );
}