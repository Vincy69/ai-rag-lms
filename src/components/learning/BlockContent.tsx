import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { BlockHeader } from "./BlockHeader";
import { NavigationArea } from "./NavigationArea";
import { ContentArea } from "./ContentArea";

interface BlockContentProps {
  blockId: string;
}

export function BlockContent({ blockId }: BlockContentProps) {
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);

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
          .select("id, title, quiz_type, chapter_id")
          .eq("block_id", blockId)
      ]);

      const completedLessons = new Set(completedLessonsData.data?.map(p => p.lesson_id) || []);
      const blockQuizzes = quizzesData.data?.filter(q => q.quiz_type === 'block_quiz') || [];
      const chapterQuizzes = quizzesData.data?.filter(q => q.quiz_type === 'chapter_quiz') || [];

      return {
        chapters: chaptersData.data?.map(chapter => ({
          ...chapter,
          lessons: chapter.lessons.sort((a, b) => a.order_index - b.order_index),
          quizzes: chapterQuizzes.filter(q => q.chapter_id === chapter.id),
          completedLessons: chapter.lessons.reduce(
            (acc, lesson) => acc + (completedLessons.has(lesson.id) ? 1 : 0), 
            0
          )
        })) || [],
        blockQuizzes
      };
    },
  });

  const { data: selectedLesson } = useQuery({
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
    if (chapters?.chapters.length && !selectedLessonId && !selectedQuizId) {
      const firstChapter = chapters.chapters[0];
      if (firstChapter?.lessons?.length) {
        setSelectedLessonId(firstChapter.lessons[0].id);
      }
    }
  }, [chapters, selectedLessonId, selectedQuizId]);

  if (isLoadingChapters) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-16rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const completedLessonIds = new Set(
    chapters?.chapters.flatMap(chapter => 
      chapter.lessons
        .filter((_, index) => index < chapter.completedLessons)
        .map(lesson => lesson.id)
    ) || []
  );

  return (
    <div className="space-y-6">
      <BlockHeader 
        name={block?.name}
        formationName={block?.formations?.name}
        progress={block?.progress}
      />

      <div className="grid grid-cols-12 gap-6">
        {chapters && (
          <NavigationArea
            chapters={chapters.chapters}
            blockQuizzes={chapters.blockQuizzes}
            selectedLessonId={selectedLessonId}
            onSelectLesson={(lessonId) => {
              setSelectedLessonId(lessonId);
              setSelectedQuizId(null);
            }}
            onSelectQuiz={(quizId) => {
              setSelectedQuizId(quizId);
              setSelectedLessonId(null);
            }}
            completedLessonIds={completedLessonIds}
          />
        )}

        <ContentArea
          selectedQuizId={selectedQuizId}
          selectedLesson={selectedLesson}
          blockId={blockId}
        />
      </div>
    </div>
  );
}