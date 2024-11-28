import { Progress } from "@/components/ui/progress";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { calculateBlockProgress } from "@/lib/progress";

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
  };
  onClick?: () => void;
}

export function BlockProgressCard({ block, onClick }: BlockProgressProps) {
  const navigate = useNavigate();
  const blockProgress = calculateBlockProgress(block);
  const skillsStarted = block.skills.filter(skill => 
    (skill.score !== null && skill.score > 0) || 
    (skill.attempts !== null && skill.attempts > 0)
  );

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
            {skillsStarted.length} / {block.skills.length} compétences
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
            <span>{block.status === 'completed' ? 'Terminé' : 'En cours'}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}