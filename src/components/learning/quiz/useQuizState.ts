import { useState } from 'react';
import { QuizAttemptState, QuizQuestion } from './types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export function useQuizState(questions: QuizQuestion[] | undefined) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [attempts, setAttempts] = useState<QuizAttemptState>({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const { toast } = useToast();

  const handleAnswer = async (
    questionId: string, 
    selectedAnswerId: string, 
    isCorrect: boolean,
    skillId: string
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

    // If this is a wrong answer on first attempt, record it
    if (isFirstAttempt && !isCorrect) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Vous devez être connecté pour enregistrer vos réponses"
        });
        return;
      }

      const { error } = await supabase.from('wrong_answers').insert({
        user_id: user.id,
        question_id: questionId,
        skill_id: skillId
      });

      if (error) {
        console.error('Error recording wrong answer:', error);
      }
    }
  };

  const calculateScore = () => {
    if (!questions) return 0;
    const correctFirstAttempts = questions.filter(q => 
      attempts[q.id]?.isFirstAttempt && attempts[q.id]?.isCorrect
    ).length;
    return Math.round((correctFirstAttempts / questions.length) * 100);
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