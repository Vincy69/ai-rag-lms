import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, Trash2 } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { ContentList } from "./ContentList";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Chapter } from "./types";

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
          <div className="flex items-center px-4">
            <button
              {...attributes}
              {...listeners}
              className="p-2 hover:text-primary"
              aria-label="Réorganiser le chapitre"
            >
              <GripVertical className="h-4 w-4" />
            </button>
            <AccordionTrigger className="flex-1 hover:no-underline">
              <div className="flex items-center gap-4 flex-1">
                {isEditing ? (
                  <div 
                    className="flex items-center gap-2 flex-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="h-8"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <Button
                      size="sm"
                      onClick={handleSave}
                    >
                      Enregistrer
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsEditing(false);
                        setTitle(chapter.title);
                      }}
                    >
                      Annuler
                    </Button>
                  </div>
                ) : (
                  <span className="font-medium">{chapter.title}</span>
                )}
              </div>
            </AccordionTrigger>

            <div 
              className="flex items-center gap-2 ml-4"
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsEditing(true);
                }}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
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