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
    if (!questions || questions.length === 0) return 0;
    
    const correctAnswers = questions.filter(q => 
      attempts[q.id]?.isCorrect
    ).length;
    
    // Calculate percentage and ensure it's an integer between 0 and 100
    const percentage = Math.round((correctAnswers / questions.length) * 100);
    return Math.min(Math.max(percentage, 0), 100);
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