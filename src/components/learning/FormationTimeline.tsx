import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

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
  const totalProgress = blocks.reduce((acc, block) => acc + block.progress, 0) / blocks.length;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Progression globale</span>
          <span>{Math.round(totalProgress)}%</span>
        </div>
        <Progress value={totalProgress} className="h-12" />
      </div>
      
      <div className="flex gap-1 mt-2">
        {blocks.map((block, index) => (
          <button
            key={block.id}
            onClick={() => onSelectBlock(block.id)}
            className={cn(
              "flex-1 group relative",
              index !== blocks.length - 1 && "after:content-[''] after:absolute after:top-1/2 after:right-0 after:w-2 after:h-px after:bg-border"
            )}
          >
            <div className="relative">
              <Progress 
                value={block.progress} 
                className={cn(
                  "h-12 cursor-pointer transition-all",
                  selectedBlockId === block.id ? "opacity-100" : "opacity-50 group-hover:opacity-75"
                )}
              />
              <div className={cn(
                "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-sm text-center transition-all whitespace-nowrap px-2",
                selectedBlockId === block.id ? "text-primary font-medium" : "text-foreground group-hover:text-primary"
              )}>
                {block.name}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}