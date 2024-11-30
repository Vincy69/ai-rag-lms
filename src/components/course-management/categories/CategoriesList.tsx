import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BaseList } from "../BaseList";
import { useToast } from "@/components/ui/use-toast";

interface Category {
  id: string;
  name: string;
  color: string;
  created_at: string;
}

export function CategoriesList() {
  const { toast } = useToast();

  const { data: categories, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");
      
      if (error) throw error;
      return data;
    },
  });

  const handleAdd = () => {
    toast({
      title: "Création de catégorie",
      description: "Cette fonctionnalité sera bientôt disponible",
    });
  };

  const handleEdit = (category: Category) => {
    toast({
      title: "Modification de catégorie",
      description: "Cette fonctionnalité sera bientôt disponible",
    });
  };

  const handleDelete = async (category: Category) => {
    try {
      const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id", category.id);

      if (error) throw error;

      toast({
        title: "Catégorie supprimée",
        description: "La catégorie a été supprimée avec succès",
      });
    } catch (error) {
      console.error("Error deleting category:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression",
        variant: "destructive",
      });
    }
  };

  return (
    <BaseList
      title="Catégories"
      items={categories || []}
      isLoading={isLoading}
      columns={[
        { header: "Nom", accessor: "name" },
        { header: "Couleur", accessor: "color" },
      ]}
      onAdd={handleAdd}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  );
}