import { useQuery } from "@tanstack/react-query";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Block {
  id: string;
  name: string;
  progress: number;
}

interface FormationTimelineProps {
  blocks: Block[];
  selectedBlockId?: string;
  onSelectBlock: (blockId: string) => void;
}

export function FormationTimeline({ blocks, selectedBlockId, onSelectBlock }: FormationTimelineProps) {
  const { data: blockQuizResults } = useQuery({
    queryKey: ["block-quiz-results", blocks.map(b => b.id)],
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

  if (!blocks || blocks.length === 0) {
    return (
      <div className="h-12 bg-secondary/30 rounded-lg">
        <div className="h-full w-full bg-secondary/20" />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="grid gap-2">
        {blocks.map((block, index) => {
          const quizScore = blockQuizResults?.[block.id];
          const isSelected = selectedBlockId === block.id;

          return (
            <Tooltip key={block.id}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onSelectBlock(block.id)}
                  className={cn(
                    "w-full group relative",
                    isSelected && "ring-2 ring-primary ring-offset-2 rounded-lg"
                  )}
                >
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-sm font-medium">
                      {index + 1}. {block.name}
                    </span>
                    {quizScore !== undefined && (
                      <div className={cn(
                        "flex items-center gap-1 text-xs",
                        quizScore >= 70 ? "text-primary" : "text-muted-foreground"
                      )}>
                        <Award className="h-4 w-4" />
                        <span>{quizScore}%</span>
                      </div>
                    )}
                  </div>
                  <Progress 
                    value={block.progress} 
                    className={cn(
                      "h-3 transition-all",
                      isSelected ? "bg-secondary" : "bg-secondary/50"
                    )}
                  />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="space-y-2">
                <p className="font-medium">{block.name}</p>
                <p className="text-sm text-muted-foreground">
                  Progression : {Math.round(block.progress)}%
                </p>
                {quizScore !== undefined && (
                  <p className="text-sm text-muted-foreground">
                    Test final : {quizScore}%
                  </p>
                )}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}