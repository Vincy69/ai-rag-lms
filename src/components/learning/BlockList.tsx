import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BookOpen, ChevronRight, GraduationCap, Trophy } from "lucide-react";
import { Block } from "@/types/learning";
import { supabase } from "@/integrations/supabase/client";

interface BlockListProps {
  formationName: string;
  blocks: Block[];
  onSelectBlock: (blockId: string) => void;
}

export function BlockList({ formationName, blocks, onSelectBlock }: BlockListProps) {
  const { data: quizResults } = useQuery({
    queryKey: ["block-quiz-results"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const blockIds = blocks.map(block => block.id);
      
      const { data } = await supabase
        .from("quiz_attempts")
        .select(`
          quiz_id,
          score,
          quizzes (
            block_id,
            quiz_type
          )
        `)
        .eq("user_id", user.id)
        .in("quizzes.block_id", blockIds)
        .eq("quizzes.quiz_type", "block_quiz");

      return data?.reduce((acc: { [key: string]: number }, attempt) => {
        if (attempt.quizzes?.block_id) {
          acc[attempt.quizzes.block_id] = attempt.score;
        }
        return acc;
      }, {}) || {};
    },
  });

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">{formationName}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {blocks.map((block) => {
          const finalQuizScore = quizResults?.[block.id];
          
          return (
            <Card
              key={block.id}
              className="group hover:shadow-md transition-all duration-300"
            >
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <BookOpen className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold line-clamp-1">{block.name}</h3>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onSelectBlock(block.id)}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Progress */}
                  <div className="space-y-2">
                    <Progress value={block.progress} className="h-2" />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4" />
                          {block.totalLessons} leçons
                        </span>
                        <span className="flex items-center gap-2">
                          <GraduationCap className="w-4 h-4" />
                          {block.totalQuizzes} quiz
                        </span>
                      </div>
                      <span>{Math.round(block.progress)}%</span>
                    </div>
                  </div>

                  {/* Quiz Final Score */}
                  {finalQuizScore !== undefined && (
                    <div className="flex items-center gap-2 text-sm">
                      <Trophy className={cn(
                        "w-4 h-4",
                        finalQuizScore >= 70 ? "text-yellow-500" : "text-muted-foreground"
                      )} />
                      <span>Quiz final : {finalQuizScore}%</span>
                    </div>
                  )}

                  {block.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {block.description}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}