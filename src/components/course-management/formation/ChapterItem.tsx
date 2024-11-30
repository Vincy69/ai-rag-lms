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

  const handleSave = async () => {
    const { error } = await supabase
      .from("chapters")
      .update({ title })
      .eq("id", chapter.id);

    if (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la modification du chapitre",
        variant: "destructive",
      });
      return;
    }

    queryClient.invalidateQueries({ queryKey: ["formation-blocks"] });
    setIsEditing(false);
    toast({
      title: "Chapitre modifié",
      description: "Le chapitre a été modifié avec succès",
    });
  };

  const handleDelete = async () => {
    const { error } = await supabase
      .from("chapters")
      .delete()
      .eq("id", chapter.id);

    if (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression du chapitre",
        variant: "destructive",
      });
      return;
    }

    queryClient.invalidateQueries({ queryKey: ["formation-blocks"] });
    toast({
      title: "Chapitre supprimé",
      description: "Le chapitre a été supprimé avec succès",
    });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-lg border bg-accent/50",
        isDragging && "opacity-50",
        isBeingDragged && "shadow-lg"
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
                  <div className="flex items-center gap-2 flex-1">
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="h-8"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSave();
                      }}
                    >
                      Enregistrer
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
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

            <div className="flex items-center gap-2 ml-4">
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                }}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                }}
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