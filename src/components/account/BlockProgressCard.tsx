import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, Clock } from "lucide-react";

interface BlockProgressProps {
  block: {
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
  onClick: () => void;
}

export function BlockProgressCard({ block, onClick }: BlockProgressProps) {
  // Calculate block progress based on skills progress
  const skillsWithProgress = block.skills.filter(skill => skill.score !== null && skill.score > 0);
  const averageProgress = skillsWithProgress.length > 0
    ? skillsWithProgress.reduce((acc, skill) => acc + (skill.score || 0), 0) / skillsWithProgress.length
    : 0;

  const getStatusIcon = () => {
    if (averageProgress >= 100) return <CheckCircle2 className="w-5 h-5 text-green-500" />;
    if (averageProgress > 0) return <Clock className="w-5 h-5 text-amber-500" />;
    return <Circle className="w-5 h-5 text-gray-400" />;
  };

  return (
    <Card 
      className="hover:shadow-md transition-all duration-200 cursor-pointer group" 
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <CardTitle className="text-lg group-hover:text-primary transition-colors">
              {block.name}
            </CardTitle>
          </div>
          <span className="text-sm font-medium text-muted-foreground">
            {skillsWithProgress.length > 0 ? `${Math.round(averageProgress)}%` : 'Non commencé'}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress 
          value={averageProgress} 
          className="h-2 transition-all duration-300"
        />
        {block.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {block.description}
          </p>
        )}
        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <span>{block.skills.length} compétence{block.skills.length > 1 ? 's' : ''}</span>
          <span>
            {skillsWithProgress.length} / {block.skills.length} évalué{block.skills.length > 1 ? 's' : ''}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}