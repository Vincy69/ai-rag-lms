import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";

interface SkillProgressProps {
  skill: {
    name: string | null;
    level: number | null;
    score: number | null;
    attempts: number | null;
  };
}

export function SkillProgressCard({ skill }: SkillProgressProps) {
  const hasProgress = skill.score !== null && skill.score > 0;

  return (
    <Card>
      <CardContent className="pt-6 space-y-2">
        <div className="flex justify-between items-center">
          <h4 className="font-medium">{skill.name}</h4>
          <span className="text-sm text-muted-foreground">
            {hasProgress ? (
              <>
                Niveau {skill.level} • Score {Math.round(skill.score)}%
              </>
            ) : (
              'Non évalué'
            )}
          </span>
        </div>
        <Progress value={skill.score || 0} className="h-2" />
        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <span>
            {skill.attempts ? (
              `${skill.attempts} tentative${skill.attempts !== 1 ? 's' : ''}`
            ) : (
              'Aucune tentative'
            )}
          </span>
          {hasProgress && (
            <span>
              {skill.score >= 80 ? '🌟 Maîtrisé' : 
               skill.score >= 60 ? '👍 En bonne voie' : 
               skill.score >= 40 ? '🔄 En progression' : 
               '🎯 À améliorer'}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}