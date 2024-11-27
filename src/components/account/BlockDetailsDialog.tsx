import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SkillProgressCard } from "./SkillProgressCard";

interface BlockDetailsDialogProps {
  block: {
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
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BlockDetailsDialog({
  block,
  open,
  onOpenChange,
}: BlockDetailsDialogProps) {
  if (!block) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{block.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {block.description && (
            <p className="text-sm text-muted-foreground">{block.description}</p>
          )}
          <div className="space-y-4">
            {block.skills.map((skill, index) => (
              <SkillProgressCard key={index} skill={skill} />
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}