import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CheckCircle2, XCircle } from "lucide-react";
import { QuizQuestion as QuizQuestionType } from "../types/quiz";

interface QuizQuestionProps {
  question: QuizQuestionType;
  selectedAnswerId: string | null;
  showExplanation: boolean;
  onSelectAnswer: (answerId: string) => void;
  onNext: () => void;
  isLastQuestion: boolean;
}

export function QuizQuestion({
  question,
  selectedAnswerId,
  showExplanation,
  onSelectAnswer,
  onNext,
  isLastQuestion
}: QuizQuestionProps) {
  const selectedAnswer = question.answers.find(a => a.id === selectedAnswerId);

  return (
    <div className="space-y-6">
      <p className="text-lg">{question.question}</p>

      <RadioGroup
        value={selectedAnswerId || ""}
        onValueChange={onSelectAnswer}
      >
        {question.answers.map((answer) => (
          <div key={answer.id} className="flex items-start space-x-3 p-4 rounded-lg hover:bg-accent">
            <RadioGroupItem value={answer.id} id={answer.id} />
            <Label htmlFor={answer.id} className="flex-1 cursor-pointer">
              {answer.answer}
            </Label>
          </div>
        ))}
      </RadioGroup>

      {showExplanation && selectedAnswer && (
        <Alert variant={selectedAnswer.is_correct ? "default" : "destructive"}>
          <div className="flex items-start gap-3">
            {selectedAnswer.is_correct ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-destructive" />
            )}
            <AlertDescription>
              {selectedAnswer.explanation || question.explanation || 
                (selectedAnswer.is_correct ? "Bonne réponse !" : "Ce n'est pas la bonne réponse.")}
            </AlertDescription>
          </div>
        </Alert>
      )}

      {showExplanation && (
        <Button onClick={onNext}>
          {isLastQuestion ? "Terminer le quiz" : "Question suivante"}
        </Button>
      )}
    </div>
  );
}