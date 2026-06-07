import { describe, it, expect } from 'vitest';

// Mirror of discover route ranking logic
function normalizeCollege(c: string) {
  return c.toLowerCase().replace(/[^a-z0-9]/g, '_');
}

type Alumni = {
  id: string;
  collegeName: string;
  collegeNormalized: string;
  branch: string | null;
  graduationYear: number | null;
};

function rankAlumni(alumni: Alumni[], userCollege: string, userBranch: string, userGradYear: number) {
  const userCollegeNorm = normalizeCollege(userCollege);

  return alumni.map((a) => {
    const sameCollege = userCollegeNorm.length > 0 && a.collegeNormalized === userCollegeNorm;
    const sameBranch = sameCollege && userBranch.length > 0 && a.branch === userBranch;
    const yearProximity = Math.abs((a.graduationYear ?? 2020) - userGradYear);
    let connectionStrength: 'strong' | 'medium' | 'weak' = 'weak';
    if (sameCollege && sameBranch && yearProximity <= 2) connectionStrength = 'strong';
    else if (sameCollege) connectionStrength = 'medium';
    return { ...a, connectionStrength, sameCollege, sameBranch, yearProximity };
  }).sort((a, b) => {
    const order = { strong: 0, medium: 1, weak: 2 };
    const diff = order[a.connectionStrength] - order[b.connectionStrength];
    if (diff !== 0) return diff;
    return a.yearProximity - b.yearProximity;
  });
}

const ALUMNI: Alumni[] = [
  { id: '1', collegeName: 'IIT Bombay', collegeNormalized: 'iit_bombay', branch: 'Computer Science', graduationYear: 2023 },
  { id: '2', collegeName: 'IIT Bombay', collegeNormalized: 'iit_bombay', branch: 'Electrical', graduationYear: 2022 },
  { id: '3', collegeName: 'NIT Trichy', collegeNormalized: 'nit_trichy', branch: 'Computer Science', graduationYear: 2024 },
  { id: '4', collegeName: 'IIT Delhi', collegeNormalized: 'iit_delhi', branch: 'Computer Science', graduationYear: 2021 },
];

describe('alumni ranking', () => {
  it('puts strong matches (same college + branch + year) first', () => {
    const ranked = rankAlumni(ALUMNI, 'IIT Bombay', 'Computer Science', 2024);
    expect(ranked[0]?.connectionStrength).toBe('strong');
    expect(ranked[0]?.id).toBe('1'); // 2023 = yearProximity 1
  });

  it('puts medium matches (same college, different branch) after strong', () => {
    const ranked = rankAlumni(ALUMNI, 'IIT Bombay', 'Computer Science', 2024);
    const mediumEntry = ranked.find((r) => r.connectionStrength === 'medium');
    expect(mediumEntry).toBeDefined();
    expect(mediumEntry?.id).toBe('2'); // same college, different branch
  });

  it('puts weak matches last', () => {
    const ranked = rankAlumni(ALUMNI, 'IIT Bombay', 'Computer Science', 2024);
    const last = ranked[ranked.length - 1];
    expect(last?.connectionStrength).toBe('weak');
  });

  it('handles empty college gracefully (all weak)', () => {
    const ranked = rankAlumni(ALUMNI, '', 'Computer Science', 2024);
    expect(ranked.every((r) => r.connectionStrength === 'weak')).toBe(true);
  });

  it('college normalization is consistent', () => {
    expect(normalizeCollege('IIT Bombay')).toBe('iit_bombay');
    expect(normalizeCollege('NIT-Trichy')).toBe('nit_trichy');
    expect(normalizeCollege('IIIT Hyderabad')).toBe('iiit_hyderabad');
  });

  it('sorts same-strength by year proximity', () => {
    const ranked = rankAlumni(ALUMNI, 'IIT Bombay', 'Mechanical', 2023);
    // Both id:1 and id:2 are medium (same college, branch mismatch)
    const mediums = ranked.filter((r) => r.connectionStrength === 'medium');
    expect(mediums[0]?.yearProximity).toBeLessThanOrEqual(mediums[1]?.yearProximity ?? Infinity);
  });
});
