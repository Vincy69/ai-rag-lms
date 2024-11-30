import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2, Pencil, ChevronDown } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { SortableChapterList } from "./SortableChapterList";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface Block {
  id: string;
  name: string;
  description: string | null;
  chapters: any[];
}

interface SortableBlockProps {
  block: Block;
  onDelete: () => void;
}

export function SortableBlock({ block, onDelete }: SortableBlockProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(block.name);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleSave = async () => {
    const { error } = await supabase
      .from("skill_blocks")
      .update({ name })
      .eq("id", block.id);

    if (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la modification du bloc",
        variant: "destructive",
      });
      return;
    }

    queryClient.invalidateQueries({ queryKey: ["formation-blocks"] });
    setIsEditing(false);
    toast({
      title: "Bloc modifié",
      description: "Le bloc a été modifié avec succès",
    });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-lg border bg-card transition-colors hover:bg-accent/10",
        isDragging && "opacity-50"
      )}
    >
      <Accordion type="single" collapsible>
        <AccordionItem value={block.id} className="border-0">
          <div className="flex items-center px-4 py-2">
            <button
              {...attributes}
              {...listeners}
              className="p-2 hover:text-primary"
              aria-label="Réorganiser le bloc"
            >
              <GripVertical className="h-4 w-4" />
            </button>

            <AccordionTrigger className="flex-1 hover:no-underline">
              <div className="flex items-center gap-4 flex-1">
                {isEditing ? (
                  <div className="flex items-center gap-2 flex-1">
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
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
                        setName(block.name);
                      }}
                    >
                      Annuler
                    </Button>
                  </div>
                ) : (
                  <span className="font-medium">{block.name}</span>
                )}
              </div>
              <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground/50 transition-transform duration-200" />
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
                  onDelete();
                }}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
          <AccordionContent className="px-4 pb-4">
            <SortableChapterList blockId={block.id} chapters={block.chapters} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}