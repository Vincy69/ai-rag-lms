import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SkillProgressCard } from "./SkillProgressCard";
import { Progress } from "@/components/ui/progress";

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

  // Calculate block progress based on skills progress
  const skillsWithProgress = block.skills.filter(skill => skill.score !== null && skill.score > 0);
  const blockProgress = skillsWithProgress.length > 0
    ? skillsWithProgress.reduce((acc, skill) => acc + (skill.score || 0), 0) / skillsWithProgress.length
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{block.name}</span>
            <span className="text-base font-normal text-muted-foreground">
              {skillsWithProgress.length > 0 ? `${Math.round(blockProgress)}%` : 'Non commencé'}
            </span>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {block.description && (
            <p className="text-sm text-muted-foreground">{block.description}</p>
          )}
          <Progress value={blockProgress} className="h-2" />
          <div className="space-y-4">
            <h3 className="font-medium">Progression par compétence</h3>
            <div className="space-y-4">
              {block.skills.map((skill, index) => (
                <SkillProgressCard key={index} skill={skill} />
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}