import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

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

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={onClick}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">{block.name}</CardTitle>
          <span className="text-sm text-muted-foreground capitalize">
            {skillsWithProgress.length > 0 ? `${Math.round(averageProgress)}%` : 'Non commencé'}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={averageProgress} className="h-2" />
        {block.description && (
          <p className="text-sm text-muted-foreground">{block.description}</p>
        )}
      </CardContent>
    </Card>
  );
}