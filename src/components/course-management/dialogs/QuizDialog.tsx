import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Plus, Trash } from "lucide-react";

interface QuizDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  blockId: string;
  chapterId?: string;
  quiz?: {
    id: string;
    title: string;
    description: string | null;
    quiz_type: string;
  };
}

interface Question {
  question: string;
  explanation: string;
  answers: {
    answer: string;
    is_correct: boolean;
    explanation: string;
  }[];
}

export function QuizDialog({ open, onOpenChange, blockId, chapterId, quiz }: QuizDialogProps) {
  const [title, setTitle] = useState(quiz?.title || "");
  const [description, setDescription] = useState(quiz?.description || "");
  const [questions, setQuestions] = useState<Question[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question: "",
        explanation: "",
        answers: [
          { answer: "", is_correct: true, explanation: "" },
          { answer: "", is_correct: false, explanation: "" },
        ],
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, field: keyof Question, value: string) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setQuestions(newQuestions);
  };

  const addAnswer = (questionIndex: number) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].answers.push({
      answer: "",
      is_correct: false,
      explanation: "",
    });
    setQuestions(newQuestions);
  };

  const removeAnswer = (questionIndex: number, answerIndex: number) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].answers = newQuestions[questionIndex].answers.filter(
      (_, i) => i !== answerIndex
    );
    setQuestions(newQuestions);
  };

  const updateAnswer = (
    questionIndex: number,
    answerIndex: number,
    field: keyof Question["answers"][0],
    value: string | boolean
  ) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].answers[answerIndex] = {
      ...newQuestions[questionIndex].answers[answerIndex],
      [field]: value,
    };
    setQuestions(newQuestions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let quizId = quiz?.id;

      if (quiz) {
        // Update quiz
        const { error: quizError } = await supabase
          .from("quizzes")
          .update({
            title,
            description,
          })
          .eq("id", quiz.id);

        if (quizError) throw quizError;
      } else {
        // Create quiz
        const { data: quizData, error: quizError } = await supabase
          .from("quizzes")
          .insert({
            block_id: blockId,
            chapter_id: chapterId,
            title,
            description,
            quiz_type: chapterId ? "chapter_quiz" : "block_quiz",
          })
          .select()
          .single();

        if (quizError) throw quizError;
        quizId = quizData.id;
      }

      // Handle questions
      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];

        // Create question
        const { data: questionData, error: questionError } = await supabase
          .from("quiz_questions")
          .insert({
            quiz_id: quizId,
            question: question.question,
            explanation: question.explanation,
            order_index: i,
          })
          .select()
          .single();

        if (questionError) throw questionError;

        // Create answers
        for (let j = 0; j < question.answers.length; j++) {
          const answer = question.answers[j];
          const { error: answerError } = await supabase
            .from("quiz_answers")
            .insert({
              question_id: questionData.id,
              answer: answer.answer,
              is_correct: answer.is_correct,
              explanation: answer.explanation,
              order_index: j,
            });

          if (answerError) throw answerError;
        }
      }

      queryClient.invalidateQueries({ queryKey: ["formation-blocks"] });
      onOpenChange(false);
      toast({
        title: quiz ? "Quiz modifié" : "Quiz créé",
        description: quiz
          ? "Le quiz a été modifié avec succès"
          : "Le quiz a été créé avec succès",
      });
    } catch (error) {
      console.error("Error saving quiz:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'enregistrement",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{quiz ? "Modifier le quiz" : "Créer un quiz"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <Input
              placeholder="Titre du quiz"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <Textarea
              placeholder="Description (optionnelle)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          <div className="space-y-6">
            {questions.map((question, questionIndex) => (
              <div key={questionIndex} className="space-y-4 p-4 border rounded-lg">
                <div className="flex items-start gap-4">
                  <div className="flex-1 space-y-4">
                    <Input
                      placeholder="Question"
                      value={question.question}
                      onChange={(e) =>
                        updateQuestion(questionIndex, "question", e.target.value)
                      }
                      required
                    />

                    <Textarea
                      placeholder="Explication de la question"
                      value={question.explanation}
                      onChange={(e) =>
                        updateQuestion(questionIndex, "explanation", e.target.value)
                      }
                      rows={2}
                      required
                    />
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeQuestion(questionIndex)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-4 pl-4">
                  {question.answers.map((answer, answerIndex) => (
                    <div key={answerIndex} className="space-y-2">
                      <div className="flex items-start gap-4">
                        <RadioGroup
                          value={answer.is_correct ? "correct" : "incorrect"}
                          onValueChange={(value) =>
                            updateAnswer(
                              questionIndex,
                              answerIndex,
                              "is_correct",
                              value === "correct"
                            )
                          }
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="correct" id={`correct-${questionIndex}-${answerIndex}`} />
                            <Label htmlFor={`correct-${questionIndex}-${answerIndex}`}>Correcte</Label>
                          </div>
                        </RadioGroup>

                        <div className="flex-1 space-y-2">
                          <Input
                            placeholder="Réponse"
                            value={answer.answer}
                            onChange={(e) =>
                              updateAnswer(
                                questionIndex,
                                answerIndex,
                                "answer",
                                e.target.value
                              )
                            }
                            required
                          />

                          <Textarea
                            placeholder="Explication de la réponse"
                            value={answer.explanation}
                            onChange={(e) =>
                              updateAnswer(
                                questionIndex,
                                answerIndex,
                                "explanation",
                                e.target.value
                              )
                            }
                            rows={2}
                            required
                          />
                        </div>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeAnswer(questionIndex, answerIndex)}
                          disabled={question.answers.length <= 2}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addAnswer(questionIndex)}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter une réponse
                  </Button>
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={addQuestion}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une question
            </Button>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={questions.length === 0}>
              {quiz ? "Modifier" : "Créer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}