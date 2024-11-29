import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BookOpen, GraduationCap, Trophy } from "lucide-react";
import { Block } from "@/types/learning";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

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
              className="group hover:shadow-md transition-all duration-300 bg-card/50 hover:bg-card cursor-pointer"
              onClick={() => onSelectBlock(block.id)}
            >
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Header */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-base leading-tight mb-1 line-clamp-3 group-hover:text-primary transition-colors">
                      {block.name}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{block.totalLessons} leçons</span>
                      <span>{block.totalQuizzes} quiz</span>
                    </div>
                  </div>

                  {/* Description if exists */}
                  {block.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 border-t border-border/50 pt-4">
                      {block.description}
                    </p>
                  )}

                  {/* Progress */}
                  <div className="space-y-2 pt-2">
                    <Progress value={block.progress} className="h-2" />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Progression</span>
                      <span>{Math.round(block.progress)}%</span>
                    </div>
                  </div>

                  {/* Quiz Final Score */}
                  {finalQuizScore !== undefined && (
                    <div className="flex items-center gap-2 text-sm border-t border-border/50 pt-4">
                      <Trophy className={cn(
                        "w-4 h-4",
                        finalQuizScore >= 70 ? "text-yellow-500" : "text-muted-foreground"
                      )} />
                      <span>Quiz final : {finalQuizScore}%</span>
                    </div>
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