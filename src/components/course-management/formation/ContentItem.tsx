import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, BookOpen, ClipboardList, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { LessonDialog } from "../dialogs/LessonDialog";
import { ContentItem as ContentItemType } from "./types";

interface ContentItemProps {
  item: ContentItemType;
  isBeingDragged?: boolean;
}

export function ContentItem({ item, isBeingDragged }: ContentItemProps) {
  const [showLessonDialog, setShowLessonDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const Icon = item.type === 'lesson' ? BookOpen : ClipboardList;

  const handleDelete = async () => {
    try {
      const table = item.type === 'lesson' ? 'lessons' : 'quizzes';
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', item.id);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ["formation-blocks"] });
      
      toast({
        title: "Suppression réussie",
        description: "L'élément a été supprimé avec succès",
      });
    } catch (error) {
      console.error("Error deleting item:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression",
        variant: "destructive",
      });
    }
  };

  const handleEdit = () => {
    if (item.type === 'lesson') {
      setShowLessonDialog(true);
    }
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          "flex items-center gap-2 rounded-lg border bg-background p-3",
          isDragging && "opacity-50",
          isBeingDragged && "shadow-lg",
          item.type === 'quiz' ? "bg-primary/5" : "bg-secondary/30"
        )}
      >
        <button
          {...attributes}
          {...listeners}
          className="p-1 hover:text-primary"
          aria-label="Réorganiser le contenu"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <Icon className="h-4 w-4 text-muted-foreground" />
        
        <div className="flex-1">
          <span className="text-sm">{item.title}</span>
        </div>

        <div className="flex items-center gap-2">
          {item.type === 'lesson' && item.duration && (
            <span className="text-xs text-muted-foreground">
              {item.duration} min
            </span>
          )}
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

      {item.type === 'lesson' && (
        <LessonDialog
          open={showLessonDialog}
          onOpenChange={setShowLessonDialog}
          chapterId={item.chapter_id}
          lesson={{
            id: item.id,
            title: item.title,
            content: item.content || '',
            duration: item.duration || null,
          }}
        />
      )}
    </>
  );
}
