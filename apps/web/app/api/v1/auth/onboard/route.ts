import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@placeai/db/client';
import { users } from '@placeai/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import type { ApiResponse } from '@placeai/types';
import type { User } from '@placeai/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const onboardSchema = z.object({
  fullName: z.string().min(1).max(200),
  phone: z.string().max(20).optional(),
  collegeName: z.string().max(300).optional(),
  degree: z.string().max(100).optional(),
  branch: z.string().max(100).optional(),
  graduationYear: z.number().int().min(2000).max(2030).optional(),
  yearsOfExperience: z.number().min(0).max(50).optional(),
  currentLocation: z.string().max(200).optional(),
  targetRoles: z.array(z.string()).max(10).optional(),
  targetCompanies: z.array(z.string()).max(20).optional(),
  preferredLocations: z.array(z.string()).max(10).optional(),
  jobSearchStatus: z.enum(['actively_looking', 'open', 'not_looking']).optional(),
});

export async function POST(req: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } } satisfies ApiResponse<never>, { status: 401 });
  }

  const body = await req.json();
  const parsed = onboardSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.message } } satisfies ApiResponse<never>, { status: 400 });
  }

  const result = await db.update(users)
    .set({
      fullName: parsed.data.fullName,
      phone: parsed.data.phone ?? null,
      collegeName: parsed.data.collegeName ?? null,
      degree: parsed.data.degree ?? null,
      branch: parsed.data.branch ?? null,
      graduationYear: parsed.data.graduationYear ?? null,
      yearsOfExperience: parsed.data.yearsOfExperience ?? null,
      currentLocation: parsed.data.currentLocation ?? null,
      targetRoles: parsed.data.targetRoles ?? null,
      targetCompanies: parsed.data.targetCompanies ?? null,
      preferredLocations: parsed.data.preferredLocations ?? null,
      jobSearchStatus: parsed.data.jobSearchStatus ?? null,
      onboardingCompleted: true,
      updatedAt: new Date(),
    })
    .where(eq(users.clerkId, clerkId))
    .returning();

  const updated = result[0];
  if (!updated) {
    return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } } satisfies ApiResponse<never>, { status: 404 });
  }

  return NextResponse.json({ success: true, data: updated } satisfies ApiResponse<User>);
}
