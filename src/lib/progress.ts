interface Skill {
  name: string | null;
  level: number | null;
  score: number | null;
  attempts: number | null;
}

interface Block {
  skills: Skill[];
}

export function calculateBlockProgress(block: Block): number {
  const skillsWithProgress = block.skills.filter(skill => 
    (skill.score !== null && skill.score > 0) || 
    (skill.attempts !== null && skill.attempts > 0)
  );

  if (skillsWithProgress.length === 0) return 0;

  return skillsWithProgress.reduce((acc, skill) => {
    // If there's a score, use it directly
    if (skill.score !== null && skill.score > 0) {
      return acc + skill.score;
    }
    // If there are attempts but no score, count it as partial progress
    else if (skill.attempts !== null && skill.attempts > 0) {
      return acc + 25; // Consider starting a skill as 25% progress
    }
    return acc;
  }, 0) / skillsWithProgress.length;
}