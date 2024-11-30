import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface BlockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formationId: string;
  block?: {
    id: string;
    name: string;
    description: string | null;
  };
}

export function BlockDialog({ open, onOpenChange, formationId, block }: BlockDialogProps) {
  const [name, setName] = useState(block?.name || "");
  const [description, setDescription] = useState(block?.description || "");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Get the last order_index
      const { data: lastBlock } = await supabase
        .from("skill_blocks")
        .select("order_index")
        .eq("formation_id", formationId)
        .order("order_index", { ascending: false })
        .limit(1)
        .single();

      const newOrderIndex = (lastBlock?.order_index ?? -1) + 1;

      if (block) {
        // Update
        const { error } = await supabase
          .from("skill_blocks")
          .update({ name, description })
          .eq("id", block.id);

        if (error) throw error;

        toast({
          title: "Bloc modifié",
          description: "Le bloc a été modifié avec succès",
        });
      } else {
        // Create
        const { error } = await supabase
          .from("skill_blocks")
          .insert({
            formation_id: formationId,
            name,
            description,
            order_index: newOrderIndex,
          });

        if (error) throw error;

        toast({
          title: "Bloc créé",
          description: "Le bloc a été créé avec succès",
        });
      }

      queryClient.invalidateQueries({ queryKey: ["formation-blocks"] });
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving block:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'enregistrement",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{block ? "Modifier le bloc" : "Créer un bloc"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              placeholder="Nom du bloc"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <Textarea
              placeholder="Description (optionnelle)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button type="submit">
              {block ? "Modifier" : "Créer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}