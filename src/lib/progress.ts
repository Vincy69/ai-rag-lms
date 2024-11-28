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
  if (totalLessons === 0) return 0;
  return Math.min(100, (completedLessons / totalLessons) * 100);
}

export function calculateBlockProgress(block: Block): number {
  if (block.chapters && block.chapters.length > 0) {
    const totalLessons = block.chapters.reduce((acc, chapter) => acc + chapter.lessons.length, 0);
    if (totalLessons === 0) return 0;

    const completedLessons = block.chapters.reduce((acc, chapter) => acc + chapter.completedLessons, 0);
    return Math.min(100, (completedLessons / totalLessons) * 100);
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