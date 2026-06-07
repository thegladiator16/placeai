import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@placeai/db/client';
import { users, jobs, resumes } from '@placeai/db/schema';
import { eq, and } from 'drizzle-orm';
import type { ApiResponse } from '@placeai/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type MatchResult = {
  overallScore: number;
  skillScore: number;
  experienceScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  experienceMatch: boolean;
  recommendation: string;
};

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } } satisfies ApiResponse<never>, { status: 401 });
  }

  const [user, job] = await Promise.all([
    db.query.users.findFirst({ where: eq(users.clerkId, clerkId) }),
    db.query.jobs.findFirst({ where: eq(jobs.id, params.id) }),
  ]);

  if (!user) return NextResponse.json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'User not found' } } satisfies ApiResponse<never>, { status: 404 });
  if (!job) return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Job not found' } } satisfies ApiResponse<never>, { status: 404 });

  const primaryResume = await db.query.resumes.findFirst({
    where: and(eq(resumes.userId, user.id), eq(resumes.isPrimary, true)),
  });

  const userSkills = primaryResume
    ? Object.values(primaryResume.skills as Record<string, string[]> | null ?? {}).flat().map((s) => s.toLowerCase())
    : [];

  const requiredSkills = (job.requiredSkills ?? []).map((s) => s.toLowerCase());
  const preferredSkills = (job.preferredSkills ?? []).map((s) => s.toLowerCase());
  const allJobSkills = [...requiredSkills, ...preferredSkills];

  const matchedSkills = allJobSkills.filter((js) =>
    userSkills.some((us) => us.includes(js) || js.includes(us)),
  );
  const missingSkills = requiredSkills.filter((js) =>
    !userSkills.some((us) => us.includes(js) || js.includes(us)),
  );

  const skillScore = allJobSkills.length > 0
    ? Math.round((matchedSkills.length / Math.min(allJobSkills.length, 10)) * 100)
    : 50;

  const userExp = user.yearsOfExperience ?? 0;
  const expMin = job.experienceMin ?? 0;
  const expMax = job.experienceMax ?? 10;
  const experienceMatch = userExp >= expMin && userExp <= expMax + 1;
  const experienceScore = experienceMatch ? 100 : userExp < expMin ? Math.max(0, 100 - (expMin - userExp) * 20) : 80;

  const overallScore = Math.round(skillScore * 0.7 + experienceScore * 0.3);

  const recommendation = overallScore >= 75 ? 'Strong match — apply now!'
    : overallScore >= 50 ? 'Good fit — worth applying with a tailored resume'
    : overallScore >= 30 ? 'Partial match — fill skill gaps before applying'
    : 'Stretch role — use it for inspiration and upskilling';

  return NextResponse.json({
    success: true,
    data: {
      overallScore,
      skillScore,
      experienceScore,
      matchedSkills: matchedSkills.slice(0, 10),
      missingSkills: missingSkills.slice(0, 10),
      experienceMatch,
      recommendation,
    } satisfies MatchResult,
  } satisfies ApiResponse<MatchResult>);
}
