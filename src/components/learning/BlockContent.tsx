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

      const { data: quizzesData } = await supabase
        .from("quizzes")
        .select("*")
        .eq("block_id", blockId);

      const { data: completedLessonsData } = await supabase
        .from("lesson_progress")
        .select("lesson_id")
        .eq("user_id", user.id)
        .eq("block_id", blockId)
        .eq("is_completed", true);

      const completedLessons = new Set(completedLessonsData?.map(p => p.lesson_id) || []);
      const quizzes = quizzesData || [];

      const chaptersWithQuizzes = chaptersData?.map(chapter => ({
        ...chapter,
        lessons: chapter.lessons.sort((a, b) => a.order_index - b.order_index),
        quizzes: quizzes.filter(q => q.chapter_id === chapter.id),
        completedLessons: chapter.lessons.reduce(
          (acc, lesson) => acc + (completedLessons.has(lesson.id) ? 1 : 0),
          0
        )
      })) || [];

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
      <div className="space-y-6">
        <CondensedView
          block={block}
          chapters={chapters?.chapters || []}
          blockQuizzes={chapters?.blockQuizzes || []}
          completedLessonIds={completedLessonIds}
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-4">
        <div className="sticky top-4 space-y-4">
          <h2 className="text-xl font-semibold">{block?.name}</h2>
          <div className="bg-card rounded-lg p-4">
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
          </div>
        </div>
      </div>
      <div className="col-span-8">
        {selectedLesson && (
          <div className="bg-card rounded-lg p-6">
            <h3 className="text-2xl font-semibold mb-4">{selectedLesson.title}</h3>
            <div className="prose prose-invert max-w-none">
              {selectedLesson.content}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}