import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";

interface LessonNavigationProps {
  onPrevious?: () => void;
  onNext?: () => void;
  onComplete: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
  isCompleted?: boolean;
}

export function LessonNavigation({
  onPrevious,
  onNext,
  onComplete,
  hasPrevious,
  hasNext,
  isCompleted
}: LessonNavigationProps) {
  return (
    <div className="flex items-center justify-between border-t pt-4 mt-4 bg-background">
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={!hasPrevious}
        className="gap-2"
      >
        <ChevronLeft className="h-4 w-4" />
        Précédent
      </Button>

      <Button 
        onClick={onComplete}
        disabled={isCompleted}
        variant="default"
        className="gap-2"
      >
        <Check className="h-4 w-4" />
        {isCompleted ? "Leçon terminée" : "Marquer comme terminé"}
      </Button>

      <Button
        variant="outline"
        onClick={onNext}
        disabled={!hasNext}
        className="gap-2"
      >
        Suivant
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}