import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BaseList } from "../BaseList";
import { useToast } from "@/components/ui/use-toast";

interface FormationLessonsProps {
  formationId: string;
}

export function FormationLessons({ formationId }: FormationLessonsProps) {
  const { toast } = useToast();

  const { data: lessons, isLoading } = useQuery({
    queryKey: ["lessons", formationId],
    queryFn: async () => {
      const { data: blocks } = await supabase
        .from("skill_blocks")
        .select("id")
        .eq("formation_id", formationId);

      if (!blocks?.length) return [];

      const blockIds = blocks.map(b => b.id);
      
      const { data, error } = await supabase
        .from("lessons")
        .select(`
          *,
          chapters:chapters(
            title,
            block_id
          )
        `)
        .in("chapters.block_id", blockIds)
        .order("order_index");
      
      if (error) throw error;
      return data;
    },
  });

  const handleAdd = () => {
    toast({
      title: "Création de leçon",
      description: "Cette fonctionnalité sera bientôt disponible",
    });
  };

  const handleEdit = (lesson: any) => {
    toast({
      title: "Modification de leçon",
      description: "Cette fonctionnalité sera bientôt disponible",
    });
  };

  const handleDelete = async (lesson: any) => {
    try {
      const { error } = await supabase
        .from("lessons")
        .delete()
        .eq("id", lesson.id);

      if (error) throw error;

      toast({
        title: "Leçon supprimée",
        description: "La leçon a été supprimée avec succès",
      });
    } catch (error) {
      console.error("Error deleting lesson:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression",
        variant: "destructive",
      });
    }
  };

  return (
    <BaseList
      title="Leçons"
      items={lessons || []}
      isLoading={isLoading}
      columns={[
        { header: "Titre", accessor: "title" },
        { header: "Durée (min)", accessor: "duration" },
        { header: "Ordre", accessor: "order_index" },
      ]}
      onAdd={handleAdd}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  );
}