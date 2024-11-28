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
    }>;
  }>;
}

export function calculateChapterProgress(completedLessons: number, totalLessons: number, quizScore?: number | null): number {
  // Base progress from completed lessons
  const lessonProgress = (completedLessons / totalLessons) * 100;
  
  // If there's a quiz score, include it in the calculation
  if (quizScore !== undefined && quizScore !== null) {
    return (lessonProgress + quizScore) / 2;
  }
  
  return lessonProgress;
}

export function calculateBlockProgress(block: Block): number {
  if (block.chapters && block.chapters.length > 0) {
    const chapterProgressValues = block.chapters.map(chapter => {
      const quizScore = chapter.quizzes?.length ? 0 : null; // TODO: Get actual quiz score
      return calculateChapterProgress(chapter.completedLessons, chapter.lessons.length, quizScore);
    });
    
    return chapterProgressValues.reduce((acc, progress) => acc + progress, 0) / block.chapters.length;
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
    return block.chapters.some(chapter => 
      chapter.completedLessons > 0 || 
      (chapter.quizzes && chapter.quizzes.some(quiz => true)) // TODO: Check quiz attempts
    );
  }

  return block.skills.some(skill => 
    (skill.score !== null && skill.score > 0) || 
    (skill.attempts !== null && skill.attempts > 0)
  );
}

export function calculateFormationProgress(blocks: Block[]): number {
  const startedBlocks = blocks.filter(block => isBlockStarted(block));
  
  if (startedBlocks.length === 0) return 0;
  
  return startedBlocks.reduce((acc, block) => acc + calculateBlockProgress(block), 0) / blocks.length;
}