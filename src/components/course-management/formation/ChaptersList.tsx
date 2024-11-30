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
import { ChapterItem } from "./ChapterItem";

interface ChaptersListProps {
  blockId: string;
  chapters: any[];
}

export function ChaptersList({ blockId, chapters }: ChaptersListProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const updateChapterOrder = useMutation({
    mutationFn: async ({ id, order_index }: { id: string; order_index: number }) => {
      const { error } = await supabase
        .from("chapters")
        .update({ order_index })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["formation-blocks"] });
      toast({
        title: "Ordre mis à jour",
        description: "L'ordre des chapitres a été mis à jour avec succès",
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

    const oldIndex = chapters.findIndex((chapter) => chapter.id === active.id);
    const newIndex = chapters.findIndex((chapter) => chapter.id === over.id);

    const newChapters = arrayMove(chapters, oldIndex, newIndex);

    // Update order_index for all affected chapters
    await Promise.all(
      newChapters.map((chapter, index) =>
        updateChapterOrder.mutateAsync({
          id: chapter.id,
          order_index: index,
        })
      )
    );

    setActiveId(null);
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-2">
        <SortableContext
          items={chapters?.map((chapter) => chapter.id) || []}
          strategy={verticalListSortingStrategy}
        >
          {chapters?.map((chapter) => (
            <ChapterItem
              key={chapter.id}
              chapter={chapter}
              isBeingDragged={activeId === chapter.id}
            />
          ))}
        </SortableContext>
      </div>
    </DndContext>
  );
}