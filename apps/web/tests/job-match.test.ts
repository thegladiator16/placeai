import { describe, it, expect } from 'vitest';

// Mirror of the match score logic from /api/v1/jobs/recommended
function computeMatchScore(
  requiredSkills: string[],
  preferredSkills: string[],
  experienceMin: number,
  experienceMax: number,
  userSkills: string[],
  userExp: number,
): number {
  const jobSkills = [...requiredSkills, ...preferredSkills].map((s) => s.toLowerCase());
  const userSkillsLower = userSkills.map((s) => s.toLowerCase());
  const matched = userSkillsLower.filter((s) => jobSkills.some((js) => js.includes(s) || s.includes(js)));
  const skillScore = jobSkills.length > 0 ? (matched.length / Math.min(jobSkills.length, 8)) * 60 : 30;
  let expScore = 0;
  if (userExp >= experienceMin && userExp <= experienceMax) expScore = 30;
  else if (userExp >= experienceMin - 1 && userExp <= experienceMax + 1) expScore = 15;
  return Math.min(100, Math.round(skillScore + expScore));
}

describe('job match scoring', () => {
  it('gives high score for perfect skill + experience match', () => {
    const score = computeMatchScore(
      ['React', 'TypeScript', 'Node.js'],
      ['Next.js', 'PostgreSQL'],
      1, 3,
      ['React', 'TypeScript', 'Node.js', 'Next.js', 'PostgreSQL'],
      2,
    );
    expect(score).toBeGreaterThanOrEqual(80);
  });

  it('gives 0 experience score when exp is outside range', () => {
    const score = computeMatchScore(['Python'], [], 3, 5, ['Python'], 0);
    // skill match: 1/1 * 60 = 60, exp: 0 (0 < 3-1=2)
    expect(score).toBeLessThan(80);
  });

  it('gives partial experience score for adjacent range', () => {
    const scoreIn = computeMatchScore(['Go'], [], 2, 4, ['Go'], 3);
    const scoreAdj = computeMatchScore(['Go'], [], 2, 4, ['Go'], 5); // 5 = max+1
    expect(scoreIn).toBeGreaterThan(scoreAdj);
  });

  it('caps score at 100', () => {
    const score = computeMatchScore(
      ['React', 'Node', 'Go', 'Python', 'Rust', 'Java', 'C++', 'TypeScript'],
      ['Kubernetes', 'Redis'],
      0, 10,
      ['React', 'Node', 'Go', 'Python', 'Rust', 'Java', 'C++', 'TypeScript', 'Kubernetes', 'Redis'],
      5,
    );
    expect(score).toBeLessThanOrEqual(100);
  });

  it('handles empty skills gracefully', () => {
    const score = computeMatchScore([], [], 0, 5, [], 2);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it('case-insensitive skill matching', () => {
    const score = computeMatchScore(['react', 'typescript'], [], 0, 5, ['React', 'TypeScript'], 2);
    expect(score).toBeGreaterThan(60);
  });
});
