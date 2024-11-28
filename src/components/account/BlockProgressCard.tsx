import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { calculateBlockProgress } from "@/lib/progress";

interface BlockProgressCardProps {
  block: {
    id: string;
    name: string | null;
    description: string | null;
    status: string;
    progress: number | null;
    skills: Array<{
      name: string | null;
      level: number | null;
      score: number | null;
      attempts: number | null;
    }>;
    chapters?: Array<{
      id: string;
      completedLessons: number;
      lessons: Array<any>;
    }>;
  };
  onClick?: () => void;
}

export function BlockProgressCard({ block, onClick }: BlockProgressCardProps) {
  const blockProgress = calculateBlockProgress(block);

  return (
    <Card 
      className="hover:shadow-md transition-all duration-300 cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="pt-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">{block.name}</h3>
            <span className="text-sm text-muted-foreground">
              {blockProgress > 0 ? `${Math.round(blockProgress)}%` : 'Non commencé'}
            </span>
          </div>
          <Progress value={blockProgress} className="h-2" />
          {block.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {block.description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}