import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BaseList } from "../BaseList";
import { useToast } from "@/components/ui/use-toast";

interface Block {
  id: string;
  name: string;
  description: string | null;
  formation_id: string;
  order_index: number;
  created_at: string;
}

export function BlocksList() {
  const { toast } = useToast();

  const { data: blocks, isLoading } = useQuery({
    queryKey: ["blocks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("skill_blocks")
        .select("*")
        .order("order_index");
      
      if (error) throw error;
      return data;
    },
  });

  const handleAdd = () => {
    toast({
      title: "Création de bloc",
      description: "Cette fonctionnalité sera bientôt disponible",
    });
  };

  const handleEdit = (block: Block) => {
    toast({
      title: "Modification de bloc",
      description: "Cette fonctionnalité sera bientôt disponible",
    });
  };

  const handleDelete = async (block: Block) => {
    try {
      const { error } = await supabase
        .from("skill_blocks")
        .delete()
        .eq("id", block.id);

      if (error) throw error;

      toast({
        title: "Bloc supprimé",
        description: "Le bloc a été supprimé avec succès",
      });
    } catch (error) {
      console.error("Error deleting block:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression",
        variant: "destructive",
      });
    }
  };

  return (
    <BaseList
      title="Blocs"
      items={blocks || []}
      isLoading={isLoading}
      columns={[
        { header: "Nom", accessor: "name" },
        { header: "Description", accessor: "description" },
        { header: "Ordre", accessor: "order_index" },
      ]}
      onAdd={handleAdd}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  );
}