import { Progress } from "@/components/ui/progress";

interface BlockHeaderProps {
  name?: string;
  formationName?: string;
  progress?: number;
}

export function BlockHeader({ name, formationName, progress = 0 }: BlockHeaderProps) {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{name}</h1>
      {formationName && (
        <p className="text-muted-foreground">
          Formation : {formationName}
        </p>
      )}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Progression globale</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
    </div>
  );
}