import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@placeai/db/client';
import { users, jobs, resumes } from '@placeai/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import type { ApiResponse } from '@placeai/types';
import type { Job } from '@placeai/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function computeMatchScore(job: Job, userSkills: string[], userExp: number): number {
  const jobSkills = [...(job.requiredSkills ?? []), ...(job.preferredSkills ?? [])].map((s) => s.toLowerCase());
  const userSkillsLower = userSkills.map((s) => s.toLowerCase());

  const matched = userSkillsLower.filter((s) => jobSkills.some((js) => js.includes(s) || s.includes(js)));
  const skillScore = jobSkills.length > 0 ? (matched.length / Math.min(jobSkills.length, 8)) * 60 : 30;

  const expMin = job.experienceMin ?? 0;
  const expMax = job.experienceMax ?? 10;
  let expScore = 0;
  if (userExp >= expMin && userExp <= expMax) expScore = 30;
  else if (userExp >= expMin - 1 && userExp <= expMax + 1) expScore = 15;

  const recencyScore = job.postedAt
    ? Math.max(0, 10 - Math.floor((Date.now() - new Date(job.postedAt).getTime()) / 86400000))
    : 0;

  return Math.min(100, Math.round(skillScore + expScore + recencyScore));
}

export async function GET() {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } } satisfies ApiResponse<never>, { status: 401 });
  }

  const user = await db.query.users.findFirst({ where: eq(users.clerkId, clerkId) });
  if (!user) {
    return NextResponse.json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'User not found' } } satisfies ApiResponse<never>, { status: 404 });
  }

  const primaryResume = await db.query.resumes.findFirst({
    where: and(eq(resumes.userId, user.id), eq(resumes.isPrimary, true)),
  });

  const skills: string[] = primaryResume
    ? [
        ...((primaryResume.skills as Record<string, string[]> | null)?.[Object.keys(primaryResume.skills as object)[0] ?? ''] ?? []),
        ...(Object.values(primaryResume.skills as Record<string, string[]> | null ?? {}).flat()),
      ]
    : [];

  const userExp = user.yearsOfExperience ?? 0;

  const allJobs = await db.query.jobs.findMany({
    where: eq(jobs.isActive, true),
    orderBy: [desc(jobs.postedAt)],
    limit: 100,
  });

  const scored = allJobs
    .map((j) => ({ ...j, matchScore: computeMatchScore(j, skills, userExp) }))
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 10);

  return NextResponse.json({ success: true, data: scored } satisfies ApiResponse<typeof scored>);
}
