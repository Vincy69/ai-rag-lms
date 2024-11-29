import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { FormationContent } from "./FormationContent";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

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
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch formation data
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
          quizzes: (block.quizzes || []).map(quiz => ({
            ...quiz,
            quiz_type: quiz.quiz_type as 'chapter_quiz' | 'block_quiz'
          }))
        })),
      };
    },
    enabled: !!formationId,
  });

  // Check if user is enrolled
  const { data: enrollment, isLoading: isLoadingEnrollment } = useQuery({
    queryKey: ["formation-enrollment", formationId],
    queryFn: async () => {
      if (!formationId) return null;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("formation_enrollments")
        .select("*")
        .eq("formation_id", formationId)
        .eq("user_id", user.id);

      // If there's an error that's not "no rows returned", throw it
      if (error && error.code !== 'PGRST116') throw error;
      
      // Return the first enrollment if it exists, null otherwise
      return data && data.length > 0 ? data[0] : null;
    },
    enabled: !!formationId,
  });

  // Mutation for enrolling/unenrolling
  const enrollMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !formationId) throw new Error("Not authenticated or no formation selected");

      if (enrollment) {
        // Unenroll
        const { error } = await supabase
          .from("formation_enrollments")
          .delete()
          .eq("formation_id", formationId)
          .eq("user_id", user.id);

        if (error) throw error;
      } else {
        // Enroll
        const { error } = await supabase
          .from("formation_enrollments")
          .insert({
            formation_id: formationId,
            user_id: user.id,
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["formation-enrollment", formationId] });
      toast({
        title: enrollment ? "Désinscription réussie" : "Inscription réussie",
        description: enrollment 
          ? "Vous avez été désinscrit de la formation" 
          : "Vous avez été inscrit à la formation",
      });
    },
    onError: (error) => {
      console.error("Error managing enrollment:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la gestion de l'inscription",
        variant: "destructive",
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>{formation?.name}</DialogTitle>
            <Button
              onClick={() => enrollMutation.mutate()}
              disabled={enrollMutation.isPending || isLoadingEnrollment}
              variant={enrollment ? "destructive" : "default"}
            >
              {enrollMutation.isPending || isLoadingEnrollment ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              {enrollment ? "Se désinscrire" : "S'inscrire"}
            </Button>
          </div>
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