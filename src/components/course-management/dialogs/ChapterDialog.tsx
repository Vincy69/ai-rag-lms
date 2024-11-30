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

interface ChapterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  blockId: string;
  chapter?: {
    id: string;
    title: string;
    description: string | null;
  };
}

export function ChapterDialog({ open, onOpenChange, blockId, chapter }: ChapterDialogProps) {
  const [title, setTitle] = useState(chapter?.title || "");
  const [description, setDescription] = useState(chapter?.description || "");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Get the last order_index
      const { data: lastChapter } = await supabase
        .from("chapters")
        .select("order_index")
        .eq("block_id", blockId)
        .order("order_index", { ascending: false })
        .limit(1)
        .single();

      const newOrderIndex = (lastChapter?.order_index ?? -1) + 1;

      if (chapter) {
        // Update
        const { error } = await supabase
          .from("chapters")
          .update({ title, description })
          .eq("id", chapter.id);

        if (error) throw error;

        toast({
          title: "Chapitre modifié",
          description: "Le chapitre a été modifié avec succès",
        });
      } else {
        // Create
        const { error } = await supabase
          .from("chapters")
          .insert({
            block_id: blockId,
            title,
            description,
            order_index: newOrderIndex,
          });

        if (error) throw error;

        toast({
          title: "Chapitre créé",
          description: "Le chapitre a été créé avec succès",
        });
      }

      // Attendre que l'invalidation soit terminée avant de fermer
      await queryClient.invalidateQueries({ queryKey: ["formation-blocks"] });
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving chapter:", error);
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
          <DialogTitle>{chapter ? "Modifier le chapitre" : "Créer un chapitre"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              placeholder="Titre du chapitre"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
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
              {chapter ? "Modifier" : "Créer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}