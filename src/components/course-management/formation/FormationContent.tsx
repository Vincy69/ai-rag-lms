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
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  });

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id || !blocks) {
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

  const handleAddBlock = async () => {
    try {
      // Get the last order_index, defaulting to -1 if no blocks exist
      const { data: lastBlock, error: queryError } = await supabase
        .from("skill_blocks")
        .select("order_index")
        .eq("formation_id", formationId)
        .order("order_index", { ascending: false })
        .limit(1)
        .single();

      const newOrderIndex = (lastBlock?.order_index ?? -1) + 1;

      const { error: insertError } = await supabase
        .from("skill_blocks")
        .insert({
          formation_id: formationId,
          name: "Nouveau bloc",
          order_index: newOrderIndex,
        });

      if (insertError) throw insertError;

      queryClient.invalidateQueries({ queryKey: ["formation-blocks", formationId] });
      toast({
        title: "Bloc créé",
        description: "Le nouveau bloc a été créé avec succès",
      });
    } catch (error) {
      console.error("Error adding block:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création du bloc",
        variant: "destructive",
      });
    }
  };

  const handleDeleteBlock = async (blockId: string) => {
    const { error } = await supabase
      .from("skill_blocks")
      .delete()
      .eq("id", blockId);

    if (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression du bloc",
        variant: "destructive",
      });
      return;
    }

    queryClient.invalidateQueries({ queryKey: ["formation-blocks", formationId] });
    toast({
      title: "Bloc supprimé",
      description: "Le bloc a été supprimé avec succès",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Structure de la formation</h2>
        <Button onClick={handleAddBlock} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un bloc
        </Button>
      </div>

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
                onDelete={() => handleDeleteBlock(block.id)}
              />
            ))}
          </SortableContext>
        </div>
      </DndContext>

      {blocks?.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          Aucun bloc n'a été créé pour cette formation
        </div>
      )}
    </div>
  );
}