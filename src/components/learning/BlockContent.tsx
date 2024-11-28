import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChapterList } from "./ChapterList";
import { LessonContent } from "./LessonContent";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2, ChevronLeft } from "lucide-react";
import { LessonCompletionButton } from "./LessonCompletionButton";

interface BlockContentProps {
  blockId: string;
}

export function BlockContent({ blockId }: BlockContentProps) {
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);

  // Fetch block details and progress
  const { data: block, refetch: refetchBlock } = useQuery({
    queryKey: ["block", blockId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const [blockData, enrollmentData] = await Promise.all([
        supabase
          .from("skill_blocks")
          .select(`
            id,
            name,
            description,
            formations (
              name
            )
          `)
          .eq("id", blockId)
          .single(),
        supabase
          .from("block_enrollments")
          .select("progress")
          .eq("block_id", blockId)
          .eq("user_id", user.id)
          .single()
      ]);

      return {
        ...blockData.data,
        progress: enrollmentData.data?.progress || 0
      };
    },
  });

  // Fetch chapters with their lessons and progress
  const { data: chapters, isLoading: isLoadingChapters } = useQuery({
    queryKey: ["chapters-with-lessons", blockId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: chaptersData } = await supabase
        .from("chapters")
        .select(`
          id,
          title,
          description,
          order_index,
          lessons (
            id,
            title,
            duration,
            order_index
          )
        `)
        .eq("block_id", blockId)
        .order("order_index");

      // Fetch progress for all lessons
      const { data: progressData } = await supabase
        .from("lesson_progress")
        .select("lesson_id")
        .eq("user_id", user.id)
        .eq("block_id", blockId)
        .eq("is_completed", true);

      const completedLessons = new Set(progressData?.map(p => p.lesson_id) || []);

      return chaptersData?.map(chapter => ({
        ...chapter,
        lessons: chapter.lessons.sort((a, b) => a.order_index - b.order_index),
        progress: chapter.lessons.reduce((acc, lesson) => 
          acc + (completedLessons.has(lesson.id) ? 1 : 0), 0) / chapter.lessons.length * 100
      }));
    },
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

  useEffect(() => {
    if (chapters?.length && !selectedChapterId) {
      setSelectedChapterId(chapters[0].id);
    }
  }, [chapters, selectedChapterId]);

  if (isLoadingChapters) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-16rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Block header with global progress */}
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">{block?.name}</h1>
        {block?.formations?.name && (
          <p className="text-muted-foreground">
            Formation : {block.formations.name}
          </p>
        )}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progression globale</span>
            <span>{Math.round(block?.progress || 0)}%</span>
          </div>
          <Progress value={block?.progress || 0} className="h-2" />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Chapters and lessons navigation */}
        <Card className="col-span-4 p-4">
          <div className="space-y-4">
            {chapters?.map((chapter) => (
              <div key={chapter.id} className="space-y-2">
                {/* Chapter header */}
                <button
                  onClick={() => setSelectedChapterId(chapter.id)}
                  className={`w-full text-left p-2 rounded-lg transition-colors hover:bg-accent group ${
                    selectedChapterId === chapter.id ? "bg-accent" : ""
                  }`}
                >
                  <div className="font-medium group-hover:text-primary">
                    {chapter.title}
                  </div>
                  <Progress value={chapter.progress} className="h-1 mt-2" />
                </button>

                {/* Lessons list */}
                {selectedChapterId === chapter.id && (
                  <div className="ml-4 space-y-1">
                    {chapter.lessons.map((lesson) => (
                      <button
                        key={lesson.id}
                        onClick={() => setSelectedLessonId(lesson.id)}
                        className={`w-full text-left p-2 text-sm rounded-lg transition-colors hover:bg-accent/50 ${
                          selectedLessonId === lesson.id ? "bg-accent/50 text-primary" : ""
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span>{lesson.title}</span>
                          <span className="text-xs text-muted-foreground">
                            {lesson.duration} min
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Lesson content */}
        <Card className="col-span-8 p-6">
          {isLoadingLesson ? (
            <div className="flex items-center justify-center h-[calc(100vh-20rem)]">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : selectedLesson ? (
            <div className="space-y-6">
              <LessonContent lesson={selectedLesson} />
              <LessonCompletionButton
                lessonId={selectedLesson.id}
                chapterId={selectedChapterId || ""}
                blockId={blockId}
                onComplete={() => {
                  refetchBlock();
                }}
              />
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">
              Sélectionnez une leçon pour voir son contenu
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}