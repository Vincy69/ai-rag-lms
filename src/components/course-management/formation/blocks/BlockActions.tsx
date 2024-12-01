import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface BlockActionsProps {
  formationId: string;
}

export function BlockActions({ formationId }: BlockActionsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleAddBlock = async () => {
    try {
      const { data: lastBlock } = await supabase
        .from("skill_blocks")
        .select("order_index")
        .eq("formation_id", formationId)
        .order("order_index", { ascending: false })
        .limit(1)
        .single();

      const newOrderIndex = (lastBlock?.order_index ?? -1) + 1;

      const { error } = await supabase
        .from("skill_blocks")
        .insert({
          formation_id: formationId,
          name: "Nouveau bloc",
          order_index: newOrderIndex,
        });

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["formation-blocks"] });
      toast({
        title: "Bloc créé",
        description: "Le nouveau bloc a été créé avec succès",
      });
    } catch (error) {
      console.error("Error adding block:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création du bloc",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex justify-between items-center">
      <h2 className="text-lg font-semibold">Structure de la formation</h2>
      <Button onClick={handleAddBlock} size="sm">
        <Plus className="h-4 w-4 mr-2" />
        Ajouter un bloc
      </Button>
    </div>
  );
}