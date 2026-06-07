import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@placeai/db/client';
import { users, alumniIndex } from '@placeai/db/schema';
import { eq, and, ilike, or } from 'drizzle-orm';
import { z } from 'zod';
import type { ApiResponse } from '@placeai/types';
import type { AlumniEntry } from '@placeai/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const discoverSchema = z.object({
  companyName: z.string().min(1).max(200),
});

type RankedAlumni = AlumniEntry & {
  connectionStrength: 'strong' | 'medium' | 'weak';
  sameCollege: boolean;
  sameBranch: boolean;
  yearProximity: number;
};

function normalizeCollege(c: string) {
  return c.toLowerCase().replace(/[^a-z0-9]/g, '_');
}

export async function POST(req: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } } satisfies ApiResponse<never>, { status: 401 });
  }

  const user = await db.query.users.findFirst({ where: eq(users.clerkId, clerkId) });
  if (!user) {
    return NextResponse.json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'User not found' } } satisfies ApiResponse<never>, { status: 404 });
  }

  const body = await req.json();
  const parsed = discoverSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.message } } satisfies ApiResponse<never>, { status: 400 });
  }

  const { companyName } = parsed.data;

  // Find all alumni at this company
  const alumni = await db.query.alumniIndex.findMany({
    where: ilike(alumniIndex.currentCompany, `%${companyName}%`),
    limit: 50,
  });

  const userCollege = user.collegeName ?? '';
  const userCollegeNorm = normalizeCollege(userCollege);
  const userBranch = user.branch ?? '';
  const userGradYear = user.graduationYear ?? new Date().getFullYear();

  // Rank results
  const ranked: RankedAlumni[] = alumni.map((a) => {
    const sameCollege = userCollegeNorm.length > 0 && a.collegeNormalized === userCollegeNorm;
    const sameBranch = sameCollege && userBranch.length > 0 && a.branch === userBranch;
    const yearProximity = Math.abs((a.graduationYear ?? 2020) - userGradYear);

    let connectionStrength: RankedAlumni['connectionStrength'] = 'weak';
    if (sameCollege && sameBranch && yearProximity <= 2) connectionStrength = 'strong';
    else if (sameCollege) connectionStrength = 'medium';

    return { ...a, connectionStrength, sameCollege, sameBranch, yearProximity };
  });

  // Sort: strong first, then medium, then weak; within each group by year proximity
  ranked.sort((a, b) => {
    const order = { strong: 0, medium: 1, weak: 2 };
    const diff = order[a.connectionStrength] - order[b.connectionStrength];
    if (diff !== 0) return diff;
    return a.yearProximity - b.yearProximity;
  });

  return NextResponse.json({ success: true, data: ranked } satisfies ApiResponse<RankedAlumni[]>);
}
