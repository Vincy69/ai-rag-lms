import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface LessonCompletionButtonProps {
  lessonId: string;
  chapterId: string;
  blockId: string;
  onComplete: () => void;
}

export function LessonCompletionButton({ 
  lessonId, 
  chapterId, 
  blockId,
  onComplete 
}: LessonCompletionButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleComplete = async () => {
    try {
      setIsLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get total lessons in chapter
      const { data: totalLessons } = await supabase
        .from("lessons")
        .select("id")
        .eq("chapter_id", chapterId);

      // Get completed lessons in chapter
      const { data: completedLessons } = await supabase
        .from("lesson_progress")
        .select("id")
        .eq("chapter_id", chapterId)
        .eq("user_id", user.id)
        .eq("is_completed", true);

      // Calculate new progress
      const totalCount = totalLessons?.length || 0;
      const completedCount = (completedLessons?.length || 0) + 1;
      const progress = (completedCount / totalCount) * 100;

      // Upsert lesson progress
      const { error: progressError } = await supabase
        .from("lesson_progress")
        .upsert({
          user_id: user.id,
          lesson_id: lessonId,
          chapter_id: chapterId,
          block_id: blockId,
          is_completed: true,
          completed_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,lesson_id'
        });

      if (progressError) throw progressError;

      // Update block progress
      const { error: blockError } = await supabase
        .from("block_enrollments")
        .update({ progress })
        .eq("user_id", user.id)
        .eq("block_id", blockId);

      if (blockError) throw blockError;

      toast({
        title: "Leçon terminée !",
        description: "Votre progression a été mise à jour.",
      });
      
      onComplete();
    } catch (error) {
      console.error('Error completing lesson:', error);
      toast({
        title: "Erreur",
        description: "Impossible de marquer la leçon comme terminée.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleComplete} 
      disabled={isLoading}
      className="w-full"
    >
      <Check className="w-4 h-4 mr-2" />
      Marquer comme terminé
    </Button>
  );
}