import { useState } from 'react';
import { QuizAttemptState, QuizQuestion } from '../types';
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
    const isFirstAttempt = !attempts[questionId];
    
    setAttempts(prev => ({
      ...prev,
      [questionId]: {
        selectedAnswerId,
        isFirstAttempt,
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
    const correctFirstAttempts = questions.filter(q => 
      attempts[q.id]?.isFirstAttempt && attempts[q.id]?.isCorrect
    ).length;
    return correctFirstAttempts / questions.length;
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