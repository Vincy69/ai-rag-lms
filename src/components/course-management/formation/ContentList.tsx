import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useToast } from "@/components/ui/use-toast";
import { ContentItem } from "./ContentItem";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { LessonDialog } from "../dialogs/LessonDialog";

interface ContentListProps {
  chapterId: string;
  lessons: any[];
  quizzes: any[];
}

export function ContentList({ chapterId, lessons, quizzes }: ContentListProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showLessonDialog, setShowLessonDialog] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Combine lessons and quizzes into a single sorted array
  const content = [
    ...lessons.map(l => ({ ...l, type: 'lesson' })),
    ...quizzes.map(q => ({ ...q, type: 'quiz' }))
  ].sort((a, b) => a.order_index - b.order_index);

  const updateOrder = useMutation({
    mutationFn: async ({ id, type, order_index }: { id: string; type: 'lesson' | 'quiz'; order_index: number }) => {
      const table = type === 'lesson' ? 'lessons' : 'quizzes';
      const { error } = await supabase
        .from(table)
        .update({ order_index })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["formation-blocks"] });
      toast({
        title: "Ordre mis à jour",
        description: "L'ordre du contenu a été mis à jour avec succès",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour de l'ordre",
        variant: "destructive",
      });
    },
  });

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      setActiveId(null);
      return;
    }

    const oldIndex = content.findIndex((item) => item.id === active.id);
    const newIndex = content.findIndex((item) => item.id === over.id);

    const newContent = arrayMove(content, oldIndex, newIndex);

    // Update order_index for all affected items
    await Promise.all(
      newContent.map((item, index) =>
        updateOrder.mutateAsync({
          id: item.id,
          type: item.type,
          order_index: index,
        })
      )
    );

    setActiveId(null);
  };

  const handleEditLesson = (lesson: any) => {
    setSelectedLesson(lesson);
    setShowLessonDialog(true);
  };

  const handleAddLesson = () => {
    setSelectedLesson(null);
    setShowLessonDialog(true);
  };

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handleAddLesson}
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter une leçon
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="space-y-2">
          <SortableContext
            items={content.map((item) => item.id)}
            strategy={verticalListSortingStrategy}
          >
            {content.map((item) => (
              <ContentItem
                key={item.id}
                item={item}
                isBeingDragged={activeId === item.id}
                onEdit={item.type === 'lesson' ? handleEditLesson : undefined}
              />
            ))}
          </SortableContext>
        </div>
      </DndContext>

      <LessonDialog
        open={showLessonDialog}
        onOpenChange={setShowLessonDialog}
        chapterId={chapterId}
        lesson={selectedLesson}
      />
    </>
  );
}