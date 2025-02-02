import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface BlockActionsProps {
  formationId: string;
  onAddChapter: () => void;
  onAddQuiz: () => void;
}

export function BlockActions({ formationId, onAddChapter, onAddQuiz }: BlockActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={onAddChapter}
      >
        <Plus className="h-4 w-4 mr-2" />
        Ajouter un chapitre
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onAddQuiz}
      >
        <Plus className="h-4 w-4 mr-2" />
        Ajouter un quiz
      </Button>
    </div>
  );
}