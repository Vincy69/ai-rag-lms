import { Progress } from "@/components/ui/progress";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { calculateBlockProgress, isBlockStarted } from "@/lib/progress";

interface BlockProgressProps {
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
      quizzes?: Array<{
        id: string;
        title: string;
      }>;
    }>;
  };
  onClick?: () => void;
}

export function BlockProgressCard({ block, onClick }: BlockProgressProps) {
  const navigate = useNavigate();
  const blockProgress = calculateBlockProgress(block);
  const isStarted = isBlockStarted(block);
  
  const totalLessons = block.chapters?.reduce((acc, chapter) => acc + chapter.lessons.length, 0) || 0;
  const completedLessons = block.chapters?.reduce((acc, chapter) => acc + chapter.completedLessons, 0) || 0;
  const totalQuizzes = block.chapters?.reduce((acc, chapter) => acc + (chapter.quizzes?.length || 0), 0) || 0;

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/elearning?blockId=${block.id}`);
    }
  };

  return (
    <Card className="hover:bg-accent/50 transition-colors cursor-pointer" onClick={handleClick}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">{block.name}</h3>
          <span className="text-sm text-muted-foreground">
            {completedLessons} / {totalLessons} leçons
            {totalQuizzes > 0 && ` • ${totalQuizzes} quiz`}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {block.description && (
            <p className="text-sm text-muted-foreground">{block.description}</p>
          )}
          <Progress value={blockProgress} className="h-2" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{Math.round(blockProgress)}%</span>
            <span>{isStarted ? 'Commencé' : 'Non commencé'}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}