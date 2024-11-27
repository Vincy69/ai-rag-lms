import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabaseAdmin } from "@/integrations/supabase/client";

export function useEnrollmentActions() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFormationEnrollment = async (formationId: string, userId: string, enroll: boolean) => {
    try {
      setIsLoading(true);

      if (enroll) {
        const { error } = await supabaseAdmin
          .from("formation_enrollments")
          .insert({
            formation_id: formationId,
            user_id: userId,
          });

        if (error) throw error;

        toast({
          title: "Succès",
          description: "L'utilisateur a été inscrit à la formation",
        });
      } else {
        const { error } = await supabaseAdmin
          .from("formation_enrollments")
          .delete()
          .eq("formation_id", formationId)
          .eq("user_id", userId);

        if (error) throw error;

        toast({
          title: "Succès",
          description: "L'utilisateur a été désinscrit de la formation",
        });
      }
    } catch (error) {
      console.error("Error managing formation enrollment:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBlockEnrollment = async (blockId: string, userId: string, enroll: boolean) => {
    try {
      setIsLoading(true);

      if (enroll) {
        const { error } = await supabaseAdmin
          .from("block_enrollments")
          .insert({
            block_id: blockId,
            user_id: userId,
          });

        if (error) throw error;

        toast({
          title: "Succès",
          description: "L'utilisateur a été inscrit au bloc",
        });
      } else {
        const { error } = await supabaseAdmin
          .from("block_enrollments")
          .delete()
          .eq("block_id", blockId)
          .eq("user_id", userId);

        if (error) throw error;

        toast({
          title: "Succès",
          description: "L'utilisateur a été désinscrit du bloc",
        });
      }
    } catch (error) {
      console.error("Error managing block enrollment:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    handleFormationEnrollment,
    handleBlockEnrollment,
  };
}