import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { ContentList } from "./ContentList";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Chapter } from "./types";
import { ChapterHeader } from "./chapter/ChapterHeader";

interface ChapterItemProps {
  chapter: Chapter;
  isBeingDragged?: boolean;
}

export function ChapterItem({ chapter, isBeingDragged }: ChapterItemProps) {
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

  const content = [
    ...(chapter.lessons || []).map(l => ({ ...l, type: 'lesson' as const })),
    ...(chapter.quizzes || []).map(q => ({ ...q, type: 'quiz' as const }))
  ].sort((a, b) => (a.order_index || 0) - (b.order_index || 0));

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-lg border bg-accent/50",
        isDragging && "opacity-50"
      )}
    >
      <Accordion type="single" collapsible>
        <AccordionItem value={chapter.id} className="border-0">
          <AccordionTrigger className="hover:no-underline">
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
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <ContentList 
              chapterId={chapter.id}
              content={content}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}