import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Award, BookOpen, GraduationCap } from "lucide-react";

interface BlockProgressHeaderProps {
  name?: string;
  formationName?: string;
  progress: number;
  totalLessons: number;
  totalQuizzes: number;
}

export function BlockProgressHeader({ 
  name, 
  formationName, 
  progress,
  totalLessons,
  totalQuizzes
}: BlockProgressHeaderProps) {
  return (
    <Card className="p-6 mb-6">
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold">{name}</h1>
            {formationName && (
              <p className="text-muted-foreground">
                Formation : {formationName}
              </p>
            )}
          </div>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              {totalLessons} leçons
            </span>
            <span className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4" />
              {totalQuizzes} quiz
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progression globale</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>
    </Card>
  );
}