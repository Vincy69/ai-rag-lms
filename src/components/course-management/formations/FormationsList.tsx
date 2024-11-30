import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BaseList } from "../BaseList";
import { useToast } from "@/components/ui/use-toast";

interface Formation {
  id: string;
  name: string;
  description: string | null;
  category: string;
  created_at: string;
}

export function FormationsList() {
  const { toast } = useToast();

  const { data: formations, isLoading } = useQuery({
    queryKey: ["formations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("formations")
        .select("*")
        .order("name");
      
      if (error) throw error;
      return data;
    },
  });

  const handleAdd = () => {
    // TODO: Implement formation creation dialog
    toast({
      title: "Création de formation",
      description: "Cette fonctionnalité sera bientôt disponible",
    });
  };

  const handleEdit = (formation: Formation) => {
    // TODO: Implement formation edit dialog
    toast({
      title: "Modification de formation",
      description: "Cette fonctionnalité sera bientôt disponible",
    });
  };

  const handleDelete = async (formation: Formation) => {
    try {
      const { error } = await supabase
        .from("formations")
        .delete()
        .eq("id", formation.id);

      if (error) throw error;

      toast({
        title: "Formation supprimée",
        description: "La formation a été supprimée avec succès",
      });
    } catch (error) {
      console.error("Error deleting formation:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression",
        variant: "destructive",
      });
    }
  };

  return (
    <BaseList
      title="Formations"
      items={formations || []}
      isLoading={isLoading}
      columns={[
        { header: "Nom", accessor: "name" },
        { header: "Catégorie", accessor: "category" },
        { header: "Description", accessor: "description" },
      ]}
      onAdd={handleAdd}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  );
}