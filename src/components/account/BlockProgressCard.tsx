import { Progress } from "@/components/ui/progress";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

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
}

export function BlockProgressCard({ block }: BlockProgressProps) {
  const navigate = useNavigate();
  const skillsWithProgress = block.skills.filter(skill => skill.score !== null && skill.score > 0);
  const blockProgress = skillsWithProgress.length > 0
    ? skillsWithProgress.reduce((acc, skill) => acc + (skill.score || 0), 0) / skillsWithProgress.length
    : 0;

  return (
    <Card className="hover:bg-accent/50 transition-colors cursor-pointer" onClick={() => navigate(`/elearning?blockId=${block.id}`)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">{block.name}</h3>
          <span className="text-sm text-muted-foreground">
            {skillsWithProgress.length} / {block.skills.length} compétences
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