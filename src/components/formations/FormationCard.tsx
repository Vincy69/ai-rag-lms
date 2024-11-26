import { Card } from "@/components/ui/card";
import { GraduationCap } from "lucide-react";

interface FormationCardProps {
  formation: {
    id: string;
    name: string;
    description: string | null;
    category: string;
  };
  onClick: () => void;
}

export function FormationCard({ formation, onClick }: FormationCardProps) {
  return (
    <Card
      className="p-6 space-y-4 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        <div className="p-2 rounded-lg bg-primary/10">
          <GraduationCap className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold">{formation.name}</h3>
          <p className="text-sm text-muted-foreground">{formation.category}</p>
        </div>
      </div>
      {formation.description && (
        <p className="text-sm text-muted-foreground line-clamp-3">
          {formation.description}
        </p>
      )}
    </Card>
  );
}