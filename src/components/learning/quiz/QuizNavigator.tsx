import { GraduationCap } from "lucide-react";

interface Quiz {
  id: string;
  title: string;
}

interface QuizNavigatorProps {
  quizzes: Quiz[];
  onSelectQuiz: (quizId: string) => void;
}

export function QuizNavigator({ quizzes, onSelectQuiz }: QuizNavigatorProps) {
  return (
    <>
      {quizzes?.map((quiz) => (
        <button
          key={quiz.id}
          onClick={() => onSelectQuiz(quiz.id)}
          className="w-full flex items-center gap-2 p-2 text-sm rounded-lg transition-colors hover:bg-accent/50"
        >
          <GraduationCap className="h-4 w-4" />
          <span>{quiz.title}</span>
        </button>
      ))}
    </>
  );
}