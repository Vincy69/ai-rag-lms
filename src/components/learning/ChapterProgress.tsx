import { Progress } from "@/components/ui/progress";

interface ChapterProgressProps {
  completedLessons: number;
  totalLessons: number;
}

export function ChapterProgress({ completedLessons, totalLessons }: ChapterProgressProps) {
  const progress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
  
  return (
    <div className="space-y-1">
      <Progress value={progress} className="h-1" />
      <p className="text-xs text-muted-foreground text-right">
        {completedLessons}/{totalLessons} leçons complétées
      </p>
    </div>
  );
}