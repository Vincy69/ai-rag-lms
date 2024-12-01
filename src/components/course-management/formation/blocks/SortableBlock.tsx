import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BlockHeader } from "../block/BlockHeader";
import { BlockActions } from "./BlockActions";
import { ChapterDialog } from "../../dialogs/ChapterDialog";
import { QuizDialog } from "../../dialogs/QuizDialog";
import { SortableChapterList } from "../SortableChapterList";

interface Block {
  id: string;
  name: string;
  description: string | null;
  chapters: any[];
}

interface SortableBlockProps {
  block: Block;
}

export function SortableBlock({ block }: SortableBlockProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(block.name);
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

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from("skill_blocks")
        .delete()
        .eq("id", block.id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["formation-blocks"] });
      toast({
        title: "Bloc supprimé",
        description: "Le bloc a été supprimé avec succès",
      });
    } catch (error) {
      console.error("Error deleting block:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression du bloc",
        variant: "destructive",
      });
    }
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
        onDelete={handleDelete}
        dragHandleProps={{ ...attributes, ...listeners }}
      />

      <div className="space-y-4 px-4 pb-4">
        <BlockActions
          onAddChapter={() => setShowChapterDialog(true)}
          onAddQuiz={() => setShowQuizDialog(true)}
        />

        <SortableChapterList blockId={block.id} chapters={block.chapters} />
      </div>

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
    </div>
  );
}