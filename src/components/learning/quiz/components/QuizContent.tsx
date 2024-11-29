import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { useQuizState } from "../hooks/useQuizState";
import { QuizQuestion } from "./QuizQuestion";
import { QuizResult } from "./QuizResult";
import { QuizQuestion as QuizQuestionType } from "../types/quiz";
import { useEffect } from "react";

interface QuizContentProps {
  quizId: string;
}

export function QuizContent({ quizId }: QuizContentProps) {
  const { data: existingAttempt } = useQuery({
    queryKey: ["quiz-attempt", quizId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data } = await supabase
        .from("quiz_attempts")
        .select("*")
        .eq("quiz_id", quizId)
        .eq("user_id", user.id)
        .eq("is_completed", true)
        .single();

      return data;
    },
  });

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
        // Limit to 4 answers maximum and randomize their order
        answers: (q.quiz_answers || [])
          .sort(() => Math.random() - 0.5)
          .slice(0, 4)
          .sort((a, b) => a.order_index - b.order_index)
      })) as QuizQuestionType[] || [];
    },
  });

  const {
    currentQuestionIndex,
    setCurrentQuestionIndex,
    attempts,
    quizCompleted,
    setQuizCompleted,
    handleAnswer,
    calculateScore
  } = useQuizState(questions);

  // If quiz is already completed, show the result directly
  if (existingAttempt) {
    return (
      <QuizResult 
        score={existingAttempt.score}
        totalQuestions={questions?.length || 0}
        correctAnswers={Math.round((existingAttempt.score / 100) * (questions?.length || 0))}
      />
    );
  }

  if (!questions?.length) {
    return (
      <Card className="p-6">
        <p className="text-muted-foreground">
          Aucune question trouvée pour ce quiz.
        </p>
      </Card>
    );
  }

  if (quizCompleted) {
    const score = calculateScore();
    const correctAnswers = questions.filter(q => 
      attempts[q.id]?.isCorrect
    ).length;

    return (
      <QuizResult 
        score={score}
        totalQuestions={questions.length}
        correctAnswers={correctAnswers}
      />
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const currentAttempt = attempts[currentQuestion.id];

  const handleSelectAnswer = async (answerId: string) => {
    if (currentAttempt?.selectedAnswerId) return;
    
    const selectedAnswer = currentQuestion.answers.find(a => a.id === answerId);
    if (!selectedAnswer) return;

    await handleAnswer(
      currentQuestion.id,
      answerId,
      selectedAnswer.is_correct
    );
  };

  const handleNext = async () => {
    if (!currentAttempt?.selectedAnswerId) return;
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      const score = calculateScore();
      setQuizCompleted(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from("quiz_attempts").insert({
        quiz_id: quizId,
        score: score,
        user_id: user.id,
        is_completed: true
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">
          Question {currentQuestionIndex + 1} / {questions.length}
        </h2>
      </div>

      <Card className="p-6">
        <QuizQuestion
          question={currentQuestion}
          selectedAnswerId={currentAttempt?.selectedAnswerId || null}
          showExplanation={!!currentAttempt?.selectedAnswerId}
          onSelectAnswer={handleSelectAnswer}
          onNext={handleNext}
          isLastQuestion={currentQuestionIndex === questions.length - 1}
        />
      </Card>
    </div>
  );
}