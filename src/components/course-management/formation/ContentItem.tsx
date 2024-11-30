import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, BookOpen, ClipboardList, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface ContentItemProps {
  item: {
    id: string;
    title: string;
    type: 'lesson' | 'quiz';
    duration?: number;
  };
  isBeingDragged?: boolean;
}

export function ContentItem({ item, isBeingDragged }: ContentItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(item.title);
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

  const handleSave = async () => {
    const table = item.type === 'lesson' ? 'lessons' : 'quizzes';
    const { error } = await supabase
      .from(table)
      .update({ title })
      .eq('id', item.id);

    if (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la modification",
        variant: "destructive",
      });
      return;
    }

    queryClient.invalidateQueries({ queryKey: ["formation-blocks"] });
    setIsEditing(false);
    toast({
      title: "Modification réussie",
      description: "Le titre a été modifié avec succès",
    });
  };

  const handleDelete = async () => {
    const table = item.type === 'lesson' ? 'lessons' : 'quizzes';
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', item.id);

    if (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression",
        variant: "destructive",
      });
      return;
    }

    queryClient.invalidateQueries({ queryKey: ["formation-blocks"] });
    toast({
      title: "Suppression réussie",
      description: "L'élément a été supprimé avec succès",
    });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-2 rounded-lg border bg-background p-3",
        isDragging && "opacity-50",
        isBeingDragged && "shadow-lg"
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
        {isEditing ? (
          <div className="flex items-center gap-2">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-9"
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
              onClick={() => {
                setIsEditing(false);
                setTitle(item.title);
              }}
            >
              Annuler
            </Button>
          </div>
        ) : (
          <span className="text-sm">{item.title}</span>
        )}
      </div>

      {!isEditing && (
        <div className="flex items-center gap-2">
          {item.type === 'lesson' && item.duration && (
            <span className="text-xs text-muted-foreground">
              {item.duration} min
            </span>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsEditing(true)}
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
      )}
    </div>
  );
}