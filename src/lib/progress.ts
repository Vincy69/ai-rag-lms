interface Skill {
  name: string | null;
  level: number | null;
  score: number | null;
  attempts: number | null;
}

interface Block {
  id: string;
  skills: Skill[];
  quizzes?: Array<{
    id: string;
    title: string;
  }>;
}

export function calculateBlockProgress(block: Block): number {
  // Get skills with either a score or attempts
  const skillsWithProgress = block.skills.filter(skill => 
    (skill.score !== null && skill.score > 0) || 
    (skill.attempts !== null && skill.attempts > 0)
  );

  if (skillsWithProgress.length === 0) return 0;

  const totalProgress = skillsWithProgress.reduce((acc, skill) => {
    // If there's a score, use it directly
    if (skill.score !== null && skill.score > 0) {
      return acc + skill.score;
    }
    // If there are attempts but no score, count it as partial progress
    else if (skill.attempts !== null && skill.attempts > 0) {
      return acc + 25; // Consider starting a skill as 25% progress
    }
    return acc;
  }, 0);

  // Calculate progress as an average
  return Math.min(100, totalProgress / block.skills.length);
}

export function isBlockStarted(block: Block): boolean {
  return block.skills.some(skill => 
    (skill.score !== null && skill.score > 0) || 
    (skill.attempts !== null && skill.attempts > 0)
  );
}