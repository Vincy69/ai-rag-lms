import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChapterList } from "./ChapterList";
import { LessonList } from "./LessonList";
import { LessonContent } from "./LessonContent";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";

interface BlockContentProps {
  blockId: string;
}

export function BlockContent({ blockId }: BlockContentProps) {
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);

  const { data: chapters, isLoading: isLoadingChapters } = useQuery({
    queryKey: ["chapters", blockId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chapters")
        .select("*")
        .eq("block_id", blockId)
        .order("order_index");

      if (error) throw error;
      return data;
    },
  });

  const { data: lessons, isLoading: isLoadingLessons } = useQuery({
    queryKey: ["lessons", selectedChapterId],
    queryFn: async () => {
      if (!selectedChapterId) return null;

      const { data, error } = await supabase
        .from("lessons")
        .select("*")
        .eq("chapter_id", selectedChapterId)
        .order("order_index");

      if (error) throw error;
      return data;
    },
    enabled: !!selectedChapterId,
  });

  const { data: selectedLesson, isLoading: isLoadingLesson } = useQuery({
    queryKey: ["lesson", selectedLessonId],
    queryFn: async () => {
      if (!selectedLessonId) return null;

      const { data, error } = await supabase
        .from("lessons")
        .select("*")
        .eq("id", selectedLessonId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!selectedLessonId,
  });

  // Select first chapter and lesson by default
  useEffect(() => {
    if (chapters?.length && !selectedChapterId) {
      setSelectedChapterId(chapters[0].id);
    }
  }, [chapters, selectedChapterId]);

  useEffect(() => {
    if (lessons?.length && !selectedLessonId) {
      setSelectedLessonId(lessons[0].id);
    }
  }, [lessons, selectedLessonId]);

  if (isLoadingChapters) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-16rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-12 gap-6">
      <Card className="col-span-3 p-4">
        <h2 className="font-semibold mb-4">Chapitres</h2>
        {chapters && (
          <ChapterList
            chapters={chapters}
            onSelectChapter={(id) => {
              setSelectedChapterId(id);
              setSelectedLessonId(null);
            }}
            selectedChapterId={selectedChapterId || undefined}
          />
        )}
      </Card>

      <Card className="col-span-3 p-4">
        <h2 className="font-semibold mb-4">Leçons</h2>
        {isLoadingLessons ? (
          <div className="flex items-center justify-center h-[calc(100vh-20rem)]">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : lessons && lessons.length > 0 ? (
          <LessonList
            lessons={lessons}
            onSelectLesson={setSelectedLessonId}
            selectedLessonId={selectedLessonId || undefined}
          />
        ) : (
          <p className="text-muted-foreground text-sm">
            Sélectionnez un chapitre pour voir ses leçons
          </p>
        )}
      </Card>

      <Card className="col-span-6 p-6">
        {isLoadingLesson ? (
          <div className="flex items-center justify-center h-[calc(100vh-20rem)]">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : selectedLesson ? (
          <LessonContent lesson={selectedLesson} />
        ) : (
          <p className="text-muted-foreground text-sm">
            Sélectionnez une leçon pour voir son contenu
          </p>
        )}
      </Card>
    </div>
  );
}