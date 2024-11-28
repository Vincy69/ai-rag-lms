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

      // Fetch chapters with lessons
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

      // Fetch all quizzes for this block
      const { data: quizzesData } = await supabase
        .from("quizzes")
        .select("*")
        .eq("block_id", blockId);

      // Fetch completed lessons
      const { data: completedLessonsData } = await supabase
        .from("lesson_progress")
        .select("lesson_id")
        .eq("user_id", user.id)
        .eq("block_id", blockId)
        .eq("is_completed", true);

      const completedLessons = new Set(completedLessonsData?.map(p => p.lesson_id) || []);
      const quizzes = quizzesData || [];

      // Organize chapters with their respective quizzes (only chapter quizzes)
      const chaptersWithQuizzes = chaptersData?.map(chapter => ({
        ...chapter,
        lessons: chapter.lessons.sort((a, b) => a.order_index - b.order_index),
        quizzes: quizzes.filter(q => q.chapter_id === chapter.id && q.quiz_type === 'chapter_quiz'),
        completedLessons: chapter.lessons.reduce(
          (acc, lesson) => acc + (completedLessons.has(lesson.id) ? 1 : 0),
          0
        )
      })) || [];

      // Get block-level quizzes (quizzes with quiz_type = 'block_quiz')
      const blockQuizzes = quizzes.filter(q => q.quiz_type === 'block_quiz');

      return {
        chapters: chaptersWithQuizzes,
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