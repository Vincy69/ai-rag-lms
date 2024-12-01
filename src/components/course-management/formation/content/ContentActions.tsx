import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface ContentActionsProps {
  onAddLesson: () => void;
}

export function ContentActions({ onAddLesson }: ContentActionsProps) {
  return (
    <div className="flex justify-end mb-4">
      <Button
        variant="outline"
        size="sm"
        onClick={onAddLesson}
      >
        <Plus className="h-4 w-4 mr-2" />
        Ajouter une leçon
      </Button>
    </div>
  );
}