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
  
  const totalItems = totalLessons + chapterQuizzes;
  const completedItems = completedLessons + completedQuizzes;
  
  return Math.min(100, (completedItems / totalItems) * 100);
}

export function calculateBlockProgress(block: Block): number {
  if (block.chapters && block.chapters.length > 0) {
    let totalProgress = 0;
    let totalWeight = 0;

    block.chapters.forEach(chapter => {
      const chapterQuizzes = chapter.quizzes?.filter(q => 
        q.quiz_type === 'chapter_quiz' && q.chapter_id === chapter.id
      ) || [];
      
      const totalLessons = chapter.lessons.length;
      const totalQuizzes = chapterQuizzes.length;
      
      if (totalLessons > 0 || totalQuizzes > 0) {
        const chapterProgress = calculateChapterProgress(
          chapter.completedLessons,
          totalLessons,
          totalQuizzes,
          0 // TODO: Add completed quizzes count
        );
        
        // Chaque chapitre a un poids égal dans la progression totale
        totalProgress += chapterProgress;
        totalWeight++;
      }
    });

    return totalWeight > 0 ? Math.min(100, totalProgress / totalWeight) : 0;
  }

  // Fallback to skill-based progress if no chapters
  const skillsWithProgress = block.skills.filter(skill => 
    (skill.score !== null && skill.score > 0) || 
    (skill.attempts !== null && skill.attempts > 0)
  );

  if (skillsWithProgress.length === 0) return 0;

  const totalProgress = skillsWithProgress.reduce((acc, skill) => {
    if (skill.score !== null && skill.score > 0) {
      return acc + skill.score;
    }
    else if (skill.attempts !== null && skill.attempts > 0) {
      return acc + 25; // Consider starting a skill as 25% progress
    }
    return acc;
  }, 0);

  return Math.min(100, totalProgress / block.skills.length);
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