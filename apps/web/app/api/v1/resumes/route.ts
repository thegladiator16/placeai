import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@placeai/db/client';
import { users, resumes } from '@placeai/db/schema';
import { eq, desc } from 'drizzle-orm';
import type { ApiResponse } from '@placeai/types';
import type { Resume } from '@placeai/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function getDbUser(clerkId: string) {
  return db.query.users.findFirst({ where: eq(users.clerkId, clerkId) });
}

export async function GET(_req: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } } satisfies ApiResponse<never>, { status: 401 });
  }

  const user = await getDbUser(clerkId);
  if (!user) {
    return NextResponse.json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'User not found' } } satisfies ApiResponse<never>, { status: 404 });
  }

  const userResumes = await db.query.resumes.findMany({
    where: eq(resumes.userId, user.id),
    orderBy: [desc(resumes.updatedAt)],
  });

  return NextResponse.json({ success: true, data: userResumes } satisfies ApiResponse<Resume[]>);
}

export async function POST(req: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } } satisfies ApiResponse<never>, { status: 401 });
  }

  const user = await getDbUser(clerkId);
  if (!user) {
    return NextResponse.json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'User not found' } } satisfies ApiResponse<never>, { status: 404 });
  }

  const body = await req.json() as { title?: string };
  const title = body.title ?? 'My Resume';

  const result = await db.insert(resumes).values({
    userId: user.id,
    title,
    isPrimary: false,
    version: 1,
  }).returning();

  const created = result[0];
  if (!created) {
    return NextResponse.json({ success: false, error: { code: 'CREATE_FAILED', message: 'Failed to create resume' } } satisfies ApiResponse<never>, { status: 500 });
  }

  return NextResponse.json({ success: true, data: created } satisfies ApiResponse<Resume>, { status: 201 });
}
