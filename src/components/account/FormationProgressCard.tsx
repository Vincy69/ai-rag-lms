import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BlockProgressCard } from "./BlockProgressCard";
import { useState } from "react";
import { BlockDetailsDialog } from "./BlockDetailsDialog";
import { GraduationCap, Trophy } from "lucide-react";

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
    <Card className="group hover:shadow-md transition-all duration-300">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              {formationProgress >= 80 ? (
                <Trophy className="w-5 h-5 text-primary" />
              ) : (
                <GraduationCap className="w-5 h-5 text-primary" />
              )}
            </div>
            <CardTitle>{formation.name}</CardTitle>
          </div>
          <span className="text-sm font-medium text-muted-foreground">
            {blocksWithProgress.length > 0 ? `${Math.round(formationProgress)}%` : 'Non commencé'}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Progress 
            value={formationProgress} 
            className="h-2 transition-all duration-300"
          />
          {formation.description && (
            <p className="text-sm text-muted-foreground">{formation.description}</p>
          )}
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">Blocs de compétences</h3>
            <span className="text-sm text-muted-foreground">
              {blocksWithProgress.length} / {formation.blocks.length} blocs commencés
            </span>
          </div>
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

        <BlockDetailsDialog
          block={selectedBlock}
          open={!!selectedBlock}
          onOpenChange={(open) => !open && setSelectedBlock(null)}
        />
      </CardContent>
    </Card>
  );
}