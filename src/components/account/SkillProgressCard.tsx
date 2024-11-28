import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Target, ArrowUp, ArrowDown } from "lucide-react";

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

  const getStatusIcon = () => {
    if (!hasProgress) return <Target className="w-4 h-4" />;
    if (skill.score >= 80) return <Trophy className="w-4 h-4 text-yellow-500" />;
    if (skill.score >= 40) return <ArrowUp className="w-4 h-4 text-blue-500" />;
    return <ArrowDown className="w-4 h-4 text-purple-500" />;
  };

  const getStatusText = () => {
    if (!hasProgress) return 'Non évalué';
    if (skill.score >= 80) return '🌟 Maîtrisé';
    if (skill.score >= 60) return '👍 En bonne voie';
    if (skill.score >= 40) return '🔄 En progression';
    return '🎯 À améliorer';
  };

  return (
    <Card className="transition-all duration-200 hover:shadow-sm animate-fade-in">
      <CardContent className="pt-6 space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <h4 className="font-medium">{skill.name}</h4>
          </div>
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
        
        <Progress 
          value={skill.score || 0} 
          className="h-2 transition-all duration-300"
        />
        
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">
            {skill.attempts ? (
              `${skill.attempts} tentative${skill.attempts !== 1 ? 's' : ''}`
            ) : (
              'Aucune tentative'
            )}
          </span>
          {hasProgress && (
            <span className="font-medium" style={{
              color: skill.score >= 80 ? 'rgb(234 179 8)' :
                     skill.score >= 60 ? 'rgb(34 197 94)' :
                     skill.score >= 40 ? 'rgb(59 130 246)' :
                     'rgb(168 85 247)'
            }}>
              {getStatusText()}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}