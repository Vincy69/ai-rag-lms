import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { SkillProgressCard } from "./SkillProgressCard";

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
}

export function BlockProgressCard({ block }: BlockProgressProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">{block.name}</CardTitle>
          <span className="text-sm text-muted-foreground capitalize">{block.status}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={block.progress || 0} className="h-2" />
        {block.description && (
          <p className="text-sm text-muted-foreground">{block.description}</p>
        )}
        {block.skills.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-medium text-sm">Compétences</h4>
            <div className="space-y-4">
              {block.skills.map((skill, index) => (
                <SkillProgressCard key={index} skill={skill} />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}