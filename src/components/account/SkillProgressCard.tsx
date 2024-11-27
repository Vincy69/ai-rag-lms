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
          {skill.score !== null ? (
            <>Niveau {skill.level} • Score {Math.round(skill.score)}%</>
          ) : (
            'Non évalué'
          )}
        </span>
      </div>
      <Progress value={skill.score || 0} className="h-2" />
      <p className="text-sm text-muted-foreground">
        {skill.attempts ? (
          `${skill.attempts} tentative${skill.attempts !== 1 ? 's' : ''}`
        ) : (
          'Aucune tentative'
        )}
      </p>
    </div>
  );
}