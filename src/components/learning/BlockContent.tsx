import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LoadingState } from "./LoadingState";
import { CondensedView } from "./CondensedView";
import { FullView } from "./FullView";

interface BlockContentProps {
  blockId: string;
  condensed?: boolean;
}

export function BlockContent({ blockId, condensed = false }: BlockContentProps) {
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
            ),
            quizzes (
              id,
              title,
              quiz_type,
              chapter_id
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
        blockQuizzes,
        completedLessons
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
    if (chapters?.chapters.length && !selectedLessonId && !selectedQuizId && !condensed) {
      const firstChapter = chapters.chapters[0];
      if (firstChapter?.lessons?.length) {
        setSelectedLessonId(firstChapter.lessons[0].id);
      }
    }
  }, [chapters, selectedLessonId, selectedQuizId, condensed]);

  if (isLoadingChapters) {
    return <LoadingState />;
  }

  const completedLessonIds = chapters?.completedLessons || new Set();

  if (condensed) {
    return (
      <CondensedView
        block={block}
        chapters={chapters?.chapters || []}
        blockQuizzes={chapters?.blockQuizzes || []}
        completedLessonIds={completedLessonIds}
      />
    );
  }

  return (
    <FullView
      block={block}
      chapters={chapters?.chapters || []}
      blockQuizzes={chapters?.blockQuizzes || []}
      selectedLessonId={selectedLessonId}
      selectedQuizId={selectedQuizId}
      selectedLesson={selectedLesson}
      blockId={blockId}
      completedLessonIds={completedLessonIds}
      onSelectLesson={(lessonId) => {
        setSelectedLessonId(lessonId);
        setSelectedQuizId(null);
      }}
      onSelectQuiz={(quizId) => {
        setSelectedQuizId(quizId);
        setSelectedLessonId(null);
      }}
    />
  );
}