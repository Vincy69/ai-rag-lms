interface Skill {
  name: string | null;
  level: number | null;
  score: number | null;
  attempts: number | null;
}

interface Block {
  id: string;
  skills: Skill[];
  chapters?: Array<{
    id: string;
    completedLessons: number;
    lessons: Array<any>;
    quizzes?: Array<{
      id: string;
      title: string;
      quiz_type: string;
      chapter_id: string | null;
    }>;
  }>;
}

export function calculateChapterProgress(
  completedLessons: number, 
  totalLessons: number, 
  chapterQuizzes: number = 0,
  completedQuizzes: number = 0
): number {
  if (totalLessons === 0 && chapterQuizzes === 0) return 0;
  
  // Si il y a un quiz de chapitre, il compte pour 25% de la progression
  const quizWeight = chapterQuizzes > 0 ? 0.25 : 0;
  const lessonWeight = 1 - quizWeight;
  
  const lessonProgress = totalLessons > 0 
    ? (completedLessons / totalLessons) * lessonWeight 
    : 0;
    
  const quizProgress = chapterQuizzes > 0 
    ? (completedQuizzes / chapterQuizzes) * quizWeight 
    : 0;
  
  return Math.min(100, (lessonProgress + quizProgress) * 100);
}

export function calculateBlockProgress(
  chapters: Array<{
    id: string;
    completedLessons: number;
    lessons: Array<any>;
    quizzes?: Array<{
      id: string;
      title: string;
      quiz_type: string;
      chapter_id: string | null;
    }>;
  }>,
  blockQuizzes: Array<any> = [],
  quizScores: { [key: string]: number } = {}
): number {
  if (!chapters || chapters.length === 0) return 0;

  // Calculate chapter weights
  const totalChapterWeight = 0.8; // Chapters count for 80% of total progress
  const blockQuizWeight = 0.2; // Block quiz counts for 20% of total progress

  // Calculate chapters progress
  let totalChapterProgress = 0;

  chapters.forEach(chapter => {
    const chapterQuizzes = chapter.quizzes?.filter(q => 
      q.quiz_type === 'chapter_quiz' && q.chapter_id === chapter.id
    ) || [];
    
    const completedQuizzes = chapterQuizzes.filter(quiz => 
      quizScores[quiz.id] >= 70
    ).length;

    const chapterProgress = calculateChapterProgress(
      chapter.completedLessons,
      chapter.lessons.length,
      chapterQuizzes.length,
      completedQuizzes
    );
    
    totalChapterProgress += chapterProgress;
  });

  // Average chapter progress
  const averageChapterProgress = totalChapterProgress / chapters.length;
  
  // Calculate block quiz progress
  let blockQuizProgress = 0;
  if (blockQuizzes.length > 0) {
    const completedBlockQuizzes = blockQuizzes.filter(quiz => 
      quizScores[quiz.id] >= 70
    ).length;
    blockQuizProgress = (completedBlockQuizzes / blockQuizzes.length) * 100;
  }

  // Calculate total progress
  const totalProgress = (averageChapterProgress * totalChapterWeight) + 
                       (blockQuizProgress * blockQuizWeight);

  return Math.min(100, Math.round(totalProgress));
}

export function isBlockStarted(block: Block): boolean {
  if (block.chapters && block.chapters.length > 0) {
    return block.chapters.some(chapter => chapter.completedLessons > 0);
  }

  return block.skills.some(skill => 
    (skill.score !== null && skill.score > 0) || 
    (skill.attempts !== null && skill.attempts > 0)
  );
}

export function calculateFormationProgress(blocks: Block[]): number {
  if (blocks.length === 0) return 0;
  
  const totalProgress = blocks.reduce((acc, block) => acc + calculateBlockProgress(block), 0);
  return Math.min(100, totalProgress / blocks.length);
}