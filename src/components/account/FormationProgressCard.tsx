import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BlockProgressCard } from "./BlockProgressCard";
import { useState } from "react";
import { BlockDetailsDialog } from "./BlockDetailsDialog";

interface FormationProgressProps {
  formation: {
    name: string | null;
    description: string | null;
    status: string;
    progress: number | null;
    blocks: Array<{
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
    }>;
  };
}

export function FormationProgressCard({ formation }: FormationProgressProps) {
  const [selectedBlock, setSelectedBlock] = useState<typeof formation.blocks[0] | null>(null);

  // Calculate formation progress based on blocks progress
  const blocksWithProgress = formation.blocks.filter(block => {
    const skillsWithProgress = block.skills.filter(skill => skill.score !== null && skill.score > 0);
    return skillsWithProgress.length > 0;
  });

  const formationProgress = blocksWithProgress.length > 0
    ? blocksWithProgress.reduce((acc, block) => {
        const skillsWithProgress = block.skills.filter(skill => skill.score !== null && skill.score > 0);
        const blockProgress = skillsWithProgress.length > 0
          ? skillsWithProgress.reduce((sum, skill) => sum + (skill.score || 0), 0) / skillsWithProgress.length
          : 0;
        return acc + blockProgress;
      }, 0) / blocksWithProgress.length
    : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{formation.name}</CardTitle>
          <span className="text-sm text-muted-foreground">
            {blocksWithProgress.length > 0 ? `${Math.round(formationProgress)}%` : 'Non commencé'}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Progress value={formationProgress} className="h-2" />
          {formation.description && (
            <p className="text-sm text-muted-foreground">{formation.description}</p>
          )}
        </div>
        {formation.blocks.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-medium">Blocs de compétences</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {formation.blocks.map((block, index) => (
                <BlockProgressCard
                  key={index}
                  block={block}
                  onClick={() => setSelectedBlock(block)}
                />
              ))}
            </div>
          </div>
        )}
      </CardContent>

      <BlockDetailsDialog
        block={selectedBlock}
        open={!!selectedBlock}
        onOpenChange={(open) => !open && setSelectedBlock(null)}
      />
    </Card>
  );
}