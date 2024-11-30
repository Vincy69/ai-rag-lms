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

interface ChapterItemProps {
  chapter: {
    id: string;
    title: string;
    description: string | null;
    lessons: any[];
    quizzes: any[];
  };
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

      // Attendre que l'invalidation soit terminée avant de fermer l'édition
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

  const handleCancel = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsEditing(false);
    setTitle(chapter.title);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleInputClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    setTitle(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation();
    
    if (e.key === 'Enter') {
      handleSave(e as any);
    } else if (e.key === 'Escape') {
      handleCancel(e as any);
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
              <div className="flex items-center gap-4 flex-1" onClick={(e) => isEditing && e.stopPropagation()}>
                {isEditing ? (
                  <div 
                    className="flex items-center gap-2 flex-1"
                    onClick={handleInputClick}
                  >
                    <Input
                      value={title}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      className="h-8"
                      onClick={handleInputClick}
                      autoFocus
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
                      onClick={handleCancel}
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
                onClick={handleEdit}
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
              lessons={chapter.lessons}
              quizzes={chapter.quizzes}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}