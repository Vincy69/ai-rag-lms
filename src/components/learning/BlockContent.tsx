import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2, ChevronLeft } from "lucide-react";
import { LessonContent } from "./LessonContent";
import { LessonCompletionButton } from "./LessonCompletionButton";
import { ChapterNavigator } from "./ChapterNavigator";

interface BlockContentProps {
  blockId: string;
}

export function BlockContent({ blockId }: BlockContentProps) {
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);

  // Fetch block details and progress
  const { data: block } = useQuery({
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

      const [chaptersData, completedLessonsData, quizzesData] = await Promise.all([
        supabase
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
          .order("order_index"),
        
        supabase
          .from("lesson_progress")
          .select("lesson_id")
          .eq("user_id", user.id)
          .eq("block_id", blockId)
          .eq("is_completed", true),
          
        supabase
          .from("quizzes")
          .select("id, title, chapter_id")
          .eq("block_id", blockId)
      ]);

      const completedLessons = new Set(completedLessonsData.data?.map(p => p.lesson_id) || []);
      const quizzesByChapter = (quizzesData.data || []).reduce((acc, quiz) => {
        if (!acc[quiz.chapter_id]) acc[quiz.chapter_id] = [];
        acc[quiz.chapter_id].push(quiz);
        return acc;
      }, {} as Record<string, typeof quizzesData.data>);

      return chaptersData.data?.map(chapter => ({
        ...chapter,
        lessons: chapter.lessons.sort((a, b) => a.order_index - b.order_index),
        quizzes: quizzesByChapter[chapter.id] || [],
        completedLessons: chapter.lessons.reduce(
          (acc, lesson) => acc + (completedLessons.has(lesson.id) ? 1 : 0), 
          0
        )
      }));
    },
  });

  const { data: selectedLesson, isLoading: isLoadingLesson } = useQuery({
    queryKey: ["lesson", selectedLessonId],
    queryFn: async () => {
      if (!selectedLessonId) return null;
      const { data } = await supabase
        .from("lessons")
        .select("*")
        .eq("id", selectedLessonId)
        .single();
      return data;
    },
    enabled: !!selectedLessonId,
  });

  useEffect(() => {
    if (chapters?.length && !selectedLessonId) {
      const firstChapter = chapters[0];
      if (firstChapter?.lessons?.length) {
        setSelectedLessonId(firstChapter.lessons[0].id);
      }
    }
  }, [chapters, selectedLessonId]);

  if (isLoadingChapters) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-16rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const completedLessonIds = new Set(
    chapters?.flatMap(chapter => 
      chapter.lessons
        .filter((_, index) => index < chapter.completedLessons)
        .map(lesson => lesson.id)
    ) || []
  );

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
          {chapters && (
            <ChapterNavigator
              chapters={chapters}
              selectedLessonId={selectedLessonId || undefined}
              onSelectLesson={setSelectedLessonId}
              completedLessonIds={completedLessonIds}
            />
          )}
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
                chapterId={selectedLesson.chapter_id}
                blockId={blockId}
                onComplete={() => {
                  // Refetch chapters to update progress
                  window.location.reload();
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