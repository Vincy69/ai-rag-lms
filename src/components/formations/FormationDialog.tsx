import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { FormationContent } from "./FormationContent";

interface FormationDialogProps {
  formationId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FormationDialog({
  formationId,
  open,
  onOpenChange,
}: FormationDialogProps) {
  const { data: formation, isLoading } = useQuery({
    queryKey: ["formation", formationId],
    queryFn: async () => {
      if (!formationId) return null;

      const { data: formation, error: formationError } = await supabase
        .from("formations")
        .select("*")
        .eq("id", formationId)
        .single();

      if (formationError) throw formationError;

      const { data: blocks, error: blocksError } = await supabase
        .from("skill_blocks")
        .select(`
          id,
          name,
          description,
          order_index,
          skills (
            id,
            name,
            description,
            order_index
          ),
          quizzes (
            id,
            title,
            description,
            quiz_type,
            chapter_id
          )
        `)
        .eq("formation_id", formationId)
        .order("order_index");

      if (blocksError) throw blocksError;

      return {
        ...formation,
        blocks: blocks.map((block) => ({
          ...block,
          skills: block.skills.sort((a, b) => a.order_index - b.order_index),
          quizzes: block.quizzes || []
        })),
      };
    },
    enabled: !!formationId,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{formation?.name}</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : formation ? (
          <FormationContent formation={formation} />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}