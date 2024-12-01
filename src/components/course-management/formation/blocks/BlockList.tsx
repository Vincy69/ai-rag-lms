import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SortableBlock } from "./SortableBlock";
import { BlockActions } from "./BlockActions";

interface BlockListProps {
  blocks: any[];
  formationId: string;
}

export function BlockList({ blocks, formationId }: BlockListProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const updateBlockOrder = useMutation({
    mutationFn: async ({ id, order_index }: { id: string; order_index: number }) => {
      const { error } = await supabase
        .from("skill_blocks")
        .update({ order_index })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["formation-blocks"] });
      toast({
        title: "Ordre mis à jour",
        description: "L'ordre des blocs a été mis à jour avec succès",
      });
    },
  });

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = blocks.findIndex((block) => block.id === active.id);
    const newIndex = blocks.findIndex((block) => block.id === over.id);

    const newBlocks = arrayMove(blocks, oldIndex, newIndex);

    await Promise.all(
      newBlocks.map((block, index) =>
        updateBlockOrder.mutateAsync({
          id: block.id,
          order_index: index,
        })
      )
    );
  };

  return (
    <div className="space-y-4">
      <BlockActions formationId={formationId} />
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="space-y-4">
          <SortableContext
            items={blocks?.map((block) => block.id) || []}
            strategy={verticalListSortingStrategy}
          >
            {blocks?.map((block) => (
              <SortableBlock key={block.id} block={block} />
            ))}
          </SortableContext>
        </div>
      </DndContext>
    </div>
  );
}