import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
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
import { FormationBlock } from "./FormationBlock";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface FormationContentProps {
  formationId: string;
}

export function FormationContent({ formationId }: FormationContentProps) {
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

  const { data: blocks, isLoading } = useQuery({
    queryKey: ["formation-blocks", formationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("skill_blocks")
        .select(`
          *,
          chapters (
            *,
            lessons (
              *,
              order_index
            ),
            quizzes (
              *
            ),
            order_index
          )
        `)
        .eq("formation_id", formationId)
        .order("order_index");

      if (error) throw error;
      return data;
    },
  });

  const updateBlockOrder = useMutation({
    mutationFn: async ({ id, order_index }: { id: string; order_index: number }) => {
      const { error } = await supabase
        .from("skill_blocks")
        .update({ order_index })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["formation-blocks", formationId] });
      toast({
        title: "Ordre mis à jour",
        description: "L'ordre des blocs a été mis à jour avec succès",
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

    const oldIndex = blocks!.findIndex((block) => block.id === active.id);
    const newIndex = blocks!.findIndex((block) => block.id === over.id);

    const newBlocks = arrayMove(blocks!, oldIndex, newIndex);

    // Update order_index for all affected blocks
    await Promise.all(
      newBlocks.map((block, index) =>
        updateBlockOrder.mutateAsync({
          id: block.id,
          order_index: index,
        })
      )
    );

    setActiveId(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-4">
        <SortableContext
          items={blocks?.map((block) => block.id) || []}
          strategy={verticalListSortingStrategy}
        >
          {blocks?.map((block) => (
            <FormationBlock
              key={block.id}
              block={block}
              isBeingDragged={activeId === block.id}
            />
          ))}
        </SortableContext>
      </div>

      <DragOverlay>
        {activeId && blocks ? (
          <FormationBlock
            block={blocks.find((b) => b.id === activeId)!}
            isBeingDragged
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}