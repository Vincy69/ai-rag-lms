import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Loader2 } from "lucide-react";
import { SortableBlock } from "./SortableBlock";

interface FormationContentProps {
  formationId: string;
}

export function FormationContent({ formationId }: FormationContentProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
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
              *,
              order_index
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
  });

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id || !blocks) {
      return;
    }

    const oldIndex = blocks.findIndex((block) => block.id === active.id);
    const newIndex = blocks.findIndex((block) => block.id === over.id);

    const newBlocks = arrayMove(blocks, oldIndex, newIndex);

    // Mettre à jour l'ordre dans la base de données
    await Promise.all(
      newBlocks.map((block, index) =>
        updateBlockOrder.mutateAsync({
          id: block.id,
          order_index: index,
        })
      )
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-4">
        <SortableContext
          items={blocks?.map((block) => block.id) || []}
          strategy={verticalListSortingStrategy}
        >
          {blocks?.map((block) => (
            <SortableBlock
              key={block.id}
              block={block}
            />
          ))}
        </SortableContext>
      </div>
    </DndContext>
  );
}