import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BaseList } from "../BaseList";
import { useToast } from "@/components/ui/use-toast";

interface Lesson {
  id: string;
  title: string;
  content: string;
  chapter_id: string;
  duration: number | null;
  order_index: number;
  created_at: string;
}

export function LessonsList() {
  const { toast } = useToast();

  const { data: lessons, isLoading } = useQuery({
    queryKey: ["lessons"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lessons")
        .select("*")
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

  const handleEdit = (lesson: Lesson) => {
    toast({
      title: "Modification de leçon",
      description: "Cette fonctionnalité sera bientôt disponible",
    });
  };

  const handleDelete = async (lesson: Lesson) => {
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