import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BaseList } from "../BaseList";
import { useToast } from "@/components/ui/use-toast";

interface FormationQuizzesProps {
  formationId: string;
}

export function FormationQuizzes({ formationId }: FormationQuizzesProps) {
  const { toast } = useToast();

  const { data: quizzes, isLoading } = useQuery({
    queryKey: ["quizzes", formationId],
    queryFn: async () => {
      const { data: blocks } = await supabase
        .from("skill_blocks")
        .select("id")
        .eq("formation_id", formationId);

      if (!blocks?.length) return [];

      const blockIds = blocks.map(b => b.id);
      
      const { data, error } = await supabase
        .from("quizzes")
        .select("*")
        .in("block_id", blockIds)
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

  const handleEdit = (quiz: any) => {
    toast({
      title: "Modification de quiz",
      description: "Cette fonctionnalité sera bientôt disponible",
    });
  };

  const handleDelete = async (quiz: any) => {
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