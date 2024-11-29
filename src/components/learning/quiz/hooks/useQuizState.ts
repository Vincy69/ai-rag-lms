import { useState } from 'react';
import { QuizAttemptState, QuizQuestion } from '../types/quiz';
import { useToast } from '@/components/ui/use-toast';

export function useQuizState(questions: QuizQuestion[] | undefined) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [attempts, setAttempts] = useState<QuizAttemptState>({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const { toast } = useToast();

  const handleAnswer = async (
    questionId: string, 
    selectedAnswerId: string, 
    isCorrect: boolean
  ) => {
    setAttempts(prev => ({
      ...prev,
      [questionId]: {
        selectedAnswerId,
        isCorrect
      }
    }));

    if (!isCorrect) {
      toast({
        variant: "destructive",
        title: "Réponse incorrecte",
        description: "Essayez de nouveau ou passez à la question suivante"
      });
    }
  };

  const calculateScore = () => {
    if (!questions) return 0;
    const correctAnswers = questions.filter(q => 
      attempts[q.id]?.isCorrect
    ).length;
    return Math.round((correctAnswers / questions.length) * 100);
  };

  return {
    currentQuestionIndex,
    setCurrentQuestionIndex,
    attempts,
    quizCompleted,
    setQuizCompleted,
    handleAnswer,
    calculateScore
  };
}