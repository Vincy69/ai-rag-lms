import { Progress } from "@/components/ui/progress";

interface SkillProgressProps {
  skill: {
    name: string | null;
    level: number | null;
    score: number | null;
    attempts: number | null;
  };
}

export function SkillProgressCard({ skill }: SkillProgressProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <h4 className="font-medium">{skill.name}</h4>
        <span className="text-sm text-muted-foreground">
          Niveau {skill.level} • Score {skill.score}%
        </span>
      </div>
      <Progress value={skill.score || 0} className="h-2" />
      <p className="text-sm text-muted-foreground">
        {skill.attempts} tentative{skill.attempts !== 1 ? 's' : ''}
      </p>
    </div>
  );
}