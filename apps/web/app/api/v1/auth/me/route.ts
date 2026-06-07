import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@placeai/db/client';
import { users } from '@placeai/db/schema';
import { eq } from 'drizzle-orm';
import type { ApiResponse } from '@placeai/types';
import type { User } from '@placeai/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } } satisfies ApiResponse<never>, { status: 401 });
  }

  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, clerkId),
  });

  if (!user) {
    return NextResponse.json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'User not found' } } satisfies ApiResponse<never>, { status: 404 });
  }

  // Update last active
  void db.update(users).set({ lastActiveAt: new Date() }).where(eq(users.clerkId, clerkId));

  return NextResponse.json({ success: true, data: user } satisfies ApiResponse<User>);
}

export async function PUT(req: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } } satisfies ApiResponse<never>, { status: 401 });
  }

  const body = await req.json() as Partial<User>;
  const allowedFields = [
    'fullName', 'phone', 'collegeName', 'graduationYear', 'degree', 'branch',
    'yearsOfExperience', 'currentLocation', 'preferredLocations', 'jobSearchStatus',
    'targetRoles', 'targetCompanies', 'linkedinUrl', 'githubUrl', 'portfolioUrl',
    'onboardingCompleted',
  ] as const;

  const updateData: Partial<User> = {};
  for (const field of allowedFields) {
    if (field in body) {
      (updateData as Record<string, unknown>)[field] = body[field];
    }
  }

  const result = await db
    .update(users)
    .set({ ...updateData, updatedAt: new Date() })
    .where(eq(users.clerkId, clerkId))
    .returning();

  const updated = result[0];
  if (!updated) {
    return NextResponse.json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'User not found' } } satisfies ApiResponse<never>, { status: 404 });
  }

  return NextResponse.json({ success: true, data: updated } satisfies ApiResponse<User>);
}
