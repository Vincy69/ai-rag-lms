import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LoadingState } from "./LoadingState";
import { CondensedView } from "./CondensedView";
import { ContentArea } from "./ContentArea";
import { BlockSidebar } from "./BlockSidebar";
import { BlockProgressHeader } from "./BlockProgressHeader";
import { calculateBlockProgress } from "@/lib/progress";

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

      const { data: blockData } = await supabase
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
        .single();

      return blockData;
    },
  });

  const { data: chaptersData, isLoading: isLoadingChapters } = useQuery({
    queryKey: ["chapters-with-lessons", blockId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Modifié la requête pour inclure plus de détails sur les leçons
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
            content,
            duration,
            order_index
          ),
          quizzes (
            id,
            title,
            description,
            quiz_type
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

      const { data: quizAttemptsData } = await supabase
        .from("quiz_attempts")
        .select("quiz_id, score")
        .eq("user_id", user.id);

      const completedLessons = new Set(completedLessonsData?.map(p => p.lesson_id) || []);
      const quizzes = quizzesData || [];
      const quizScores = (quizAttemptsData || []).reduce((acc: { [key: string]: number }, attempt) => {
        acc[attempt.quiz_id] = attempt.score;
        return acc;
      }, {});

      const chaptersWithQuizzes = chaptersData?.map(chapter => ({
        ...chapter,
        lessons: (chapter.lessons || []).sort((a, b) => a.order_index - b.order_index),
        quizzes: quizzes.filter(q => q.chapter_id === chapter.id),
        completedLessons: (chapter.lessons || []).reduce(
          (acc, lesson) => acc + (completedLessons.has(lesson.id) ? 1 : 0),
          0
        )
      })) || [];

      const blockQuizzes = quizzes.filter(q => q.quiz_type === 'block_quiz');

      const progress = calculateBlockProgress(chaptersWithQuizzes, blockQuizzes, quizScores);

      await supabase
        .from("block_enrollments")
        .update({ progress })
        .eq("block_id", blockId)
        .eq("user_id", user.id);

      return {
        chapters: chaptersWithQuizzes,
        blockQuizzes,
        completedLessons,
        progress
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
    if (chaptersData?.chapters.length && !selectedLessonId && !selectedQuizId && !condensed) {
      const firstChapter = chaptersData.chapters[0];
      if (firstChapter?.lessons?.length) {
        setSelectedLessonId(firstChapter.lessons[0].id);
      }
    }
  }, [chaptersData, selectedLessonId, selectedQuizId, condensed]);

  // Get all lessons in order
  const orderedLessons = chaptersData?.chapters.flatMap(chapter => 
    chapter.lessons.map(lesson => ({
      ...lesson,
      chapter_id: chapter.id
    }))
  ).sort((a, b) => {
    const chapterA = chaptersData.chapters.find(c => c.id === a.chapter_id);
    const chapterB = chaptersData.chapters.find(c => c.id === b.chapter_id);
    if (chapterA?.order_index !== chapterB?.order_index) {
      return (chapterA?.order_index || 0) - (chapterB?.order_index || 0);
    }
    return a.order_index - b.order_index;
  }) || [];

  // Find current lesson index and adjacent lessons
  const currentLessonIndex = orderedLessons.findIndex(l => l.id === selectedLessonId);
  const previousLessonId = currentLessonIndex > 0 ? orderedLessons[currentLessonIndex - 1].id : null;
  const nextLessonId = currentLessonIndex < orderedLessons.length - 1 ? orderedLessons[currentLessonIndex + 1].id : null;

  // Check if lesson is completed
  const isLessonCompleted = selectedLesson ? 
    chaptersData?.completedLessons?.has(selectedLesson.id) : 
    false;

  if (isLoadingChapters) {
    return <LoadingState />;
  }

  // Calculate totals
  const totalLessons = chaptersData?.chapters.reduce(
    (sum, chapter) => sum + chapter.lessons.length, 
    0
  ) || 0;

  const totalQuizzes = chaptersData?.chapters.reduce(
    (sum, chapter) => sum + (chapter.quizzes?.length || 0), 
    0
  ) + (chaptersData?.blockQuizzes?.length || 0);

  if (condensed) {
    return (
      <div className="space-y-6">
        <CondensedView
          block={{
            ...block,
            progress: chaptersData?.progress || 0
          }}
          chapters={chaptersData?.chapters || []}
          blockQuizzes={chaptersData?.blockQuizzes || []}
          completedLessonIds={chaptersData?.completedLessons || new Set()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BlockProgressHeader
        name={block?.name}
        formationName={block?.formations?.name}
        progress={chaptersData?.progress || 0}
        totalLessons={totalLessons}
        totalQuizzes={totalQuizzes}
      />

      <div className="flex gap-6 h-[calc(100vh-16rem)]">
        <div className="w-1/3">
          <BlockSidebar
            block={block}
            chapters={chaptersData?.chapters || []}
            blockQuizzes={chaptersData?.blockQuizzes || []}
            selectedLessonId={selectedLessonId}
            selectedQuizId={selectedQuizId}
            selectedLesson={selectedLesson}
            blockId={blockId}
            completedLessonIds={chaptersData?.completedLessons || new Set()}
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
        <div className="w-2/3">
          <ContentArea 
            selectedQuizId={selectedQuizId}
            selectedLesson={selectedLesson}
            blockId={blockId}
            onNavigate={setSelectedLessonId}
            previousLessonId={previousLessonId}
            nextLessonId={nextLessonId}
            isLessonCompleted={isLessonCompleted}
          />
        </div>
      </div>
    </div>
  );
}