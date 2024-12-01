import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChapterHeader } from "./chapters/ChapterHeader";
import { ChapterContent } from "./chapters/ChapterContent";

interface Chapter {
  id: string;
  title: string;
  description: string | null;
  lessons?: any[];
  quizzes?: any[];
}

interface SortableChapterProps {
  chapter: Chapter;
}

export function SortableChapter({ chapter }: SortableChapterProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(chapter.title);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: chapter.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const { error } = await supabase
        .from("chapters")
        .update({ title })
        .eq("id", chapter.id);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ["formation-blocks"] });
      
      setIsEditing(false);
      toast({
        title: "Chapitre modifié",
        description: "Le chapitre a été modifié avec succès",
      });
    } catch (error) {
      console.error("Error updating chapter:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la modification du chapitre",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const { error } = await supabase
        .from("chapters")
        .delete()
        .eq("id", chapter.id);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ["formation-blocks"] });
      
      toast({
        title: "Chapitre supprimé",
        description: "Le chapitre a été supprimé avec succès",
      });
    } catch (error) {
      console.error("Error deleting chapter:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression du chapitre",
        variant: "destructive",
      });
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-lg border bg-accent/50",
        isDragging && "opacity-50"
      )}
    >
      <ChapterHeader
        title={chapter.title}
        isEditing={isEditing}
        editedTitle={title}
        onEditChange={setTitle}
        onSave={handleSave}
        onCancelEdit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsEditing(false);
          setTitle(chapter.title);
        }}
        onStartEdit={() => setIsEditing(true)}
        onDelete={handleDelete}
        dragHandleProps={{ ...attributes, ...listeners }}
      />

      <ChapterContent 
        chapterId={chapter.id}
        content={chapter}
      />
    </div>
  );
}