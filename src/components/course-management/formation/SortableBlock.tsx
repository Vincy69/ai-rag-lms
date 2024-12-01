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
import { SortableChapterList } from "./SortableChapterList";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { BlockDialog } from "../dialogs/BlockDialog";
import { ChapterDialog } from "../dialogs/ChapterDialog";
import { QuizDialog } from "../dialogs/QuizDialog";
import { BlockHeader } from "./block/BlockHeader";
import { BlockActions } from "./block/BlockActions";

interface Block {
  id: string;
  name: string;
  description: string | null;
  chapters: any[];
  formation_id: string;
}

interface SortableBlockProps {
  block: Block;
  onDelete: () => void;
}

export function SortableBlock({ block, onDelete }: SortableBlockProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(block.name);
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [showChapterDialog, setShowChapterDialog] = useState(false);
  const [showQuizDialog, setShowQuizDialog] = useState(false);
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
    try {
      const { error } = await supabase
        .from("skill_blocks")
        .update({ name })
        .eq("id", block.id);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ["formation-blocks"] });
      
      setIsEditing(false);
      toast({
        title: "Bloc modifié",
        description: "Le bloc a été modifié avec succès",
      });
    } catch (error) {
      console.error("Error updating block:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la modification du bloc",
        variant: "destructive",
      });
    }
  };

  return (
    <>
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
            <AccordionTrigger>
              <BlockHeader
                name={block.name}
                isEditing={isEditing}
                editedName={name}
                onEditChange={setName}
                onSave={handleSave}
                onCancelEdit={() => {
                  setIsEditing(false);
                  setName(block.name);
                }}
                onStartEdit={() => setIsEditing(true)}
                onDelete={onDelete}
                dragHandleProps={{ ...attributes, ...listeners }}
              />
            </AccordionTrigger>
            <AccordionContent className="space-y-4 px-4 pb-4">
              <BlockActions
                formationId={block.formation_id}
                onAddChapter={() => setShowChapterDialog(true)}
                onAddQuiz={() => setShowQuizDialog(true)}
              />

              <SortableChapterList blockId={block.id} chapters={block.chapters} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <BlockDialog
        open={showBlockDialog}
        onOpenChange={setShowBlockDialog}
        formationId={block.formation_id}
        block={block}
      />

      <ChapterDialog
        open={showChapterDialog}
        onOpenChange={setShowChapterDialog}
        blockId={block.id}
      />

      <QuizDialog
        open={showQuizDialog}
        onOpenChange={setShowQuizDialog}
        blockId={block.id}
      />
    </>
  );
}