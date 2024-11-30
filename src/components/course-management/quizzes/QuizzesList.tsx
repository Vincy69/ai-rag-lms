import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BaseList } from "../BaseList";
import { useToast } from "@/components/ui/use-toast";

interface Quiz {
  id: string;
  title: string;
  description: string | null;
  block_id: string;
  chapter_id: string | null;
  quiz_type: string;
  created_at: string;
}

export function QuizzesList() {
  const { toast } = useToast();

  const { data: quizzes, isLoading } = useQuery({
    queryKey: ["quizzes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quizzes")
        .select("*")
        .order("created_at");
      
      if (error) throw error;
      return data;
    },
  });

  const handleAdd = () => {
    toast({
      title: "Création de quiz",
      description: "Cette fonctionnalité sera bientôt disponible",
    });
  };

  const handleEdit = (quiz: Quiz) => {
    toast({
      title: "Modification de quiz",
      description: "Cette fonctionnalité sera bientôt disponible",
    });
  };

  const handleDelete = async (quiz: Quiz) => {
    try {
      const { error } = await supabase
        .from("quizzes")
        .delete()
        .eq("id", quiz.id);

      if (error) throw error;

      toast({
        title: "Quiz supprimé",
        description: "Le quiz a été supprimé avec succès",
      });
    } catch (error) {
      console.error("Error deleting quiz:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression",
        variant: "destructive",
      });
    }
  };

  return (
    <BaseList
      title="Quiz"
      items={quizzes || []}
      isLoading={isLoading}
      columns={[
        { header: "Titre", accessor: "title" },
        { header: "Description", accessor: "description" },
        { header: "Type", accessor: "quiz_type" },
      ]}
      onAdd={handleAdd}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  );
}