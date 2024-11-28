import { useQuery } from "@tanstack/react-query";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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

interface DetailedProgress {
  type: 'lesson' | 'chapter_quiz' | 'block_quiz';
  id: string;
  name: string;
  progress: number;
  parentName?: string;
}

export function FormationTimeline({ blocks, selectedBlockId, onSelectBlock }: FormationTimelineProps) {
  const { data: detailedProgress } = useQuery({
    queryKey: ["formation-detailed-progress", blocks.map(b => b.id)],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const blockIds = blocks.map(block => block.id);
      
      // Fetch all chapters, lessons, and quizzes for these blocks
      const [chaptersData, lessonsData, quizzesData, quizAttemptsData] = await Promise.all([
        supabase
          .from('chapters')
          .select('id, title, block_id, order_index')
          .in('block_id', blockIds)
          .order('order_index'),
        
        supabase
          .from('lessons')
          .select('id, title, chapter_id, order_index')
          .order('order_index'),
        
        supabase
          .from('quizzes')
          .select('id, title, block_id, chapter_id, quiz_type')
          .in('block_id', blockIds),
        
        supabase
          .from('quiz_attempts')
          .select('quiz_id, score')
          .eq('user_id', user.id)
      ]);

      const progressItems: DetailedProgress[] = [];
      let totalItems = 0;

      blocks.forEach(block => {
        const blockChapters = chaptersData.data?.filter(c => c.block_id === block.id) || [];
        const blockQuizzes = quizzesData.data?.filter(q => q.block_id === block.id && q.quiz_type === 'block_quiz') || [];
        
        blockChapters.forEach(chapter => {
          const chapterLessons = lessonsData.data?.filter(l => l.chapter_id === chapter.id) || [];
          const chapterQuizzes = quizzesData.data?.filter(q => q.chapter_id === chapter.id && q.quiz_type === 'chapter_quiz') || [];
          
          // Add lessons
          chapterLessons.forEach(lesson => {
            progressItems.push({
              type: 'lesson',
              id: lesson.id,
              name: lesson.title,
              progress: 0, // You can fetch actual lesson progress if needed
              parentName: chapter.title
            });
            totalItems++;
          });

          // Add chapter quizzes
          chapterQuizzes.forEach(quiz => {
            const attempt = quizAttemptsData.data?.find(a => a.quiz_id === quiz.id);
            progressItems.push({
              type: 'chapter_quiz',
              id: quiz.id,
              name: quiz.title,
              progress: attempt?.score || 0,
              parentName: chapter.title
            });
            totalItems++;
          });
        });

        // Add block quizzes
        blockQuizzes.forEach(quiz => {
          const attempt = quizAttemptsData.data?.find(a => a.quiz_id === quiz.id);
          progressItems.push({
            type: 'block_quiz',
            id: quiz.id,
            name: quiz.title,
            progress: attempt?.score || 0,
            parentName: block.name
          });
          totalItems++;
        });
      });

      // Calculate segment width percentage
      const segmentWidth = totalItems > 0 ? 100 / totalItems : 0;
      return progressItems.map(item => ({
        ...item,
        width: segmentWidth
      }));
    }
  });

  if (!detailedProgress || detailedProgress.length === 0) {
    return (
      <div className="h-3 bg-secondary/30 rounded-full">
        <div className="h-full w-full bg-secondary/20" />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-4">
        <div className="h-3 bg-secondary/30 rounded-full overflow-hidden">
          {detailedProgress.map((item, index) => (
            <Tooltip key={item.id}>
              <TooltipTrigger asChild>
                <div 
                  style={{ 
                    width: `${item.width}%`,
                  }}
                  className={cn(
                    "h-full inline-block transition-all duration-500 ease-in-out",
                    item.progress > 0 ? "bg-gradient-to-r from-primary/80 to-primary hover:brightness-110" : "bg-secondary/20 hover:bg-secondary/30",
                    "relative group cursor-pointer"
                  )}
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="w-full h-full bg-white/10" />
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-sm">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-muted-foreground text-xs">{item.parentName}</p>
                  <p className="text-xs mt-1">
                    {item.type === 'lesson' ? (
                      item.progress > 0 ? 'Complété' : 'Non complété'
                    ) : (
                      `Score: ${item.progress}%`
                    )}
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
}