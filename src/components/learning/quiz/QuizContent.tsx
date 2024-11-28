import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, XCircle, Trophy } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface QuizContentProps {
  quizId: string;
}

interface QuizQuestion {
  id: string;
  question: string;
  explanation: string | null;
  order_index: number;
  answers: {
    id: string;
    answer: string;
    is_correct: boolean;
    explanation: string | null;
    order_index: number;
  }[];
}

export function QuizContent({ quizId }: QuizContentProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const { toast } = useToast();

  const { data: questions } = useQuery({
    queryKey: ["quiz-questions", quizId],
    queryFn: async () => {
      const { data: questionsData } = await supabase
        .from("quiz_questions")
        .select(`
          id,
          question,
          explanation,
          order_index,
          quiz_answers (
            id,
            answer,
            is_correct,
            explanation,
            order_index
          )
        `)
        .eq("quiz_id", quizId)
        .order("order_index");

      return questionsData?.map(q => ({
        ...q,
        answers: q.quiz_answers.sort((a, b) => a.order_index - b.order_index)
      })) || [];
    },
  });

  if (!questions?.length) {
    return <div>No questions found for this quiz.</div>;
  }

  const currentQuestion = questions[currentQuestionIndex];
  const selectedAnswerId = selectedAnswers[currentQuestion.id];
  const selectedAnswer = currentQuestion.answers.find(a => a.id === selectedAnswerId);

  const calculateScore = () => {
    const correctAnswers = questions.filter(q => {
      const selectedAnswerId = selectedAnswers[q.id];
      const selectedAnswer = q.answers.find(a => a.id === selectedAnswerId);
      return selectedAnswer?.is_correct;
    }).length;
    return Math.round((correctAnswers / questions.length) * 100);
  };

  const handleNextQuestion = async () => {
    setShowExplanation(false);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      const score = calculateScore();
      setQuizCompleted(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Vous devez être connecté pour enregistrer votre score"
        });
        return;
      }

      const { error } = await supabase.from("quiz_attempts").insert({
        quiz_id: quizId,
        score: score,
        user_id: user.id
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible d'enregistrer votre score"
        });
      }
    }
  };

  const handlePreviousQuestion = () => {
    setShowExplanation(false);
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmitAnswer = () => {
    setShowExplanation(true);
  };

  if (quizCompleted) {
    const score = calculateScore();
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <Trophy className="w-16 h-16 text-primary" />
            <h2 className="text-2xl font-semibold">Quiz terminé !</h2>
            <p className="text-4xl font-bold text-primary">{score}%</p>
            <p className="text-muted-foreground">
              Vous avez répondu correctement à {questions.filter(q => {
                const selectedAnswerId = selectedAnswers[q.id];
                const selectedAnswer = q.answers.find(a => a.id === selectedAnswerId);
                return selectedAnswer?.is_correct;
              }).length} questions sur {questions.length}
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">
          Question {currentQuestionIndex + 1} / {questions.length}
        </h2>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          <p className="text-lg">{currentQuestion.question}</p>

          <RadioGroup
            value={selectedAnswers[currentQuestion.id]}
            onValueChange={(value) => {
              setSelectedAnswers(prev => ({
                ...prev,
                [currentQuestion.id]: value
              }));
              setShowExplanation(false);
            }}
          >
            {currentQuestion.answers.map((answer) => (
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
                  {selectedAnswer.explanation || currentQuestion.explanation || 
                    (selectedAnswer.is_correct ? "Bonne réponse !" : "Ce n'est pas la bonne réponse.")}
                </AlertDescription>
              </div>
            </Alert>
          )}
        </div>
      </Card>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePreviousQuestion}
          disabled={currentQuestionIndex === 0}
        >
          Question précédente
        </Button>

        <div className="space-x-3">
          {!showExplanation && (
            <Button
              onClick={handleSubmitAnswer}
              disabled={!selectedAnswers[currentQuestion.id]}
            >
              Vérifier
            </Button>
          )}
          
          {showExplanation && (
            <Button onClick={handleNextQuestion}>
              {currentQuestionIndex < questions.length - 1 ? "Question suivante" : "Terminer le quiz"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}