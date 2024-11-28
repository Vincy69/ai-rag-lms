import { Progress } from "@/components/ui/progress";

interface FormationProgressProps {
  progress: number;
}

export function FormationProgress({ progress }: FormationProgressProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">Progression globale</span>
        <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
      </div>
      <Progress 
        value={progress} 
        className="h-4 w-full" 
      />
    </div>
  );
}