import { Card, CardContent } from "@/components/ui/card";
import { FormationProgressCard } from "./FormationProgressCard";

interface AccountFormationsProps {
  formations: Array<{
    id: string;
    name: string;
    description: string | null;
    status: string;
    progress: number | null;
    blocks: Array<{
      id: string;
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
      chapters?: Array<{
        id: string;
        completedLessons: number;
        lessons: Array<any>;
      }>;
    }>;
  }>;
}

export function AccountFormations({ formations }: AccountFormationsProps) {
  if (formations.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">
            Vous n'êtes inscrit à aucune formation pour le moment.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Mes formations</h2>
      <div className="space-y-6">
        {formations.map((formation) => (
          <FormationProgressCard key={formation.id} formation={formation} />
        ))}
      </div>
    </div>
  );
}