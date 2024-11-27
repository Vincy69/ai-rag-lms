import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BlockProgressCard } from "./BlockProgressCard";

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
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{formation.name}</CardTitle>
          <span className="text-sm text-muted-foreground capitalize">{formation.status}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Progress value={formation.progress || 0} className="h-2" />
          {formation.description && (
            <p className="text-sm text-muted-foreground">{formation.description}</p>
          )}
        </div>
        {formation.blocks.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-medium">Blocs de compétences</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {formation.blocks.map((block, index) => (
                <BlockProgressCard key={index} block={block} />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}