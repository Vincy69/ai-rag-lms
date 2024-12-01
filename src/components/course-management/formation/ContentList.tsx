import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { ContentItem } from "./ContentItem";
import { LessonDialog } from "../dialogs/LessonDialog";
import { ContentItem as ContentItemType } from "./types";
import { ContentActions } from "./content/ContentActions";

interface ContentListProps {
  chapterId: string;
  content: ContentItemType[];
}

export function ContentList({ chapterId, content }: ContentListProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showLessonDialog, setShowLessonDialog] = useState(false);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const updateContentOrder = useMutation({
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
  });

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = content.findIndex((item) => item.id === active.id);
    const newIndex = content.findIndex((item) => item.id === over.id);

    const newContent = arrayMove(content, oldIndex, newIndex);

    await Promise.all(
      newContent.map((item, index) =>
        updateContentOrder.mutateAsync({
          id: item.id,
          type: item.type,
          order_index: index,
        })
      )
    );
  };

  return (
    <>
      <ContentActions onAddLesson={() => setShowLessonDialog(true)} />

      <DndContext
        sensors={sensors}
        onDragEnd={handleDragEnd}
      >
        <div className="space-y-2">
          <SortableContext
            items={content?.map((item) => item.id) || []}
            strategy={verticalListSortingStrategy}
          >
            {content?.map((item) => (
              <ContentItem
                key={item.id}
                item={item}
              />
            ))}
          </SortableContext>
        </div>
      </DndContext>

      <LessonDialog
        open={showLessonDialog}
        onOpenChange={setShowLessonDialog}
        chapterId={chapterId}
      />
    </>
  );
}