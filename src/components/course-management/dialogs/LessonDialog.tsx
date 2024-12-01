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

interface LessonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chapterId: string;
  lesson?: {
    id: string;
    title: string;
    content: string;
    duration: number | null;
  };
}

export function LessonDialog({ open, onOpenChange, chapterId, lesson }: LessonDialogProps) {
  const [title, setTitle] = useState(lesson?.title || "");
  const [content, setContent] = useState(lesson?.content || "");
  const [duration, setDuration] = useState(lesson?.duration?.toString() || "");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (lesson) {
        // Update existing lesson
        const { error } = await supabase
          .from("lessons")
          .update({
            title,
            content,
            duration: duration ? parseInt(duration) : null,
          })
          .eq("id", lesson.id);

        if (error) throw error;

        toast({
          title: "Leçon modifiée",
          description: "La leçon a été modifiée avec succès",
        });
      } else {
        // Get the last order_index
        const { data: lessons, error: queryError } = await supabase
          .from("lessons")
          .select("order_index")
          .eq("chapter_id", chapterId)
          .order("order_index", { ascending: false })
          .limit(1);

        if (queryError) throw queryError;

        // If no lessons exist yet, start with order_index 0
        const lastOrderIndex = lessons && lessons.length > 0 ? lessons[0].order_index : -1;
        const newOrderIndex = lastOrderIndex + 1;

        // Create new lesson
        const { error } = await supabase
          .from("lessons")
          .insert({
            chapter_id: chapterId,
            title,
            content,
            duration: duration ? parseInt(duration) : null,
            order_index: newOrderIndex,
          });

        if (error) throw error;

        toast({
          title: "Leçon créée",
          description: "La leçon a été créée avec succès",
        });
      }

      await queryClient.invalidateQueries({ queryKey: ["formation-blocks"] });
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error saving lesson:", error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de l'enregistrement",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{lesson ? "Modifier la leçon" : "Créer une leçon"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              placeholder="Titre de la leçon"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <Input
              type="number"
              placeholder="Durée en minutes (optionnelle)"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </div>

          <div>
            <Textarea
              placeholder="Contenu de la leçon"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={10}
              required
            />
          </div>

          <DialogFooter>
            <Button type="submit">
              {lesson ? "Modifier" : "Créer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}