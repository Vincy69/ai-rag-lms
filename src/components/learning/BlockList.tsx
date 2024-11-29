import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BookOpen, ChevronRight, GraduationCap, Trophy } from "lucide-react";
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
              className="group hover:shadow-md transition-all duration-300 bg-card/50 hover:bg-card"
            >
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors shrink-0">
                      <BookOpen className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base leading-tight mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                        {block.name}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <BookOpen className="w-4 h-4" />
                          {block.totalLessons}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <GraduationCap className="w-4 h-4" />
                          {block.totalQuizzes}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onSelectBlock(block.id)}
                      className="shrink-0"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Progress */}
                  <div className="space-y-2">
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

                  {block.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 border-t border-border/50 pt-4">
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