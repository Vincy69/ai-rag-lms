import { useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  DndContext,
  DragEndEvent,
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
import { SortableChapter } from "./SortableChapter";

interface SortableChapterListProps {
  blockId: string;
  chapters: any[];
}

export function SortableChapterList({ blockId, chapters }: SortableChapterListProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
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
  });

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = chapters.findIndex((chapter) => chapter.id === active.id);
    const newIndex = chapters.findIndex((chapter) => chapter.id === over.id);

    const newChapters = arrayMove(chapters, oldIndex, newIndex);

    await Promise.all(
      newChapters.map((chapter, index) =>
        updateChapterOrder.mutateAsync({
          id: chapter.id,
          order_index: index,
        })
      )
    );
  };

  return (
    <DndContext
      sensors={sensors}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-2">
        <SortableContext
          items={chapters?.map((chapter) => chapter.id) || []}
          strategy={verticalListSortingStrategy}
        >
          {chapters?.map((chapter) => (
            <SortableChapter
              key={chapter.id}
              chapter={chapter}
            />
          ))}
        </SortableContext>
      </div>
    </DndContext>
  );
}