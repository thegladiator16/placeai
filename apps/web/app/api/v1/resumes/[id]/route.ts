import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@placeai/db/client';
import { users, resumes } from '@placeai/db/schema';
import { eq, and } from 'drizzle-orm';
import type { ApiResponse } from '@placeai/types';
import type { Resume } from '@placeai/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function getDbUser(clerkId: string) {
  return db.query.users.findFirst({ where: eq(users.clerkId, clerkId) });
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } } satisfies ApiResponse<never>, { status: 401 });
  }

  const user = await getDbUser(clerkId);
  if (!user) {
    return NextResponse.json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'User not found' } } satisfies ApiResponse<never>, { status: 404 });
  }

  const resume = await db.query.resumes.findFirst({
    where: and(eq(resumes.id, id), eq(resumes.userId, user.id)),
  });

  if (!resume) {
    return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Resume not found' } } satisfies ApiResponse<never>, { status: 404 });
  }

  return NextResponse.json({ success: true, data: resume } satisfies ApiResponse<Resume>);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } } satisfies ApiResponse<never>, { status: 401 });
  }

  const user = await getDbUser(clerkId);
  if (!user) {
    return NextResponse.json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'User not found' } } satisfies ApiResponse<never>, { status: 404 });
  }

  const body = await req.json() as Partial<Resume>;
  const allowedFields = ['title', 'personalInfo', 'summary', 'education', 'experience', 'projects', 'skills', 'certifications', 'achievements', 'languages', 'isPrimary'] as const;

  const updateData: Partial<Resume> = {};
  for (const field of allowedFields) {
    if (field in body) {
      (updateData as Record<string, unknown>)[field] = body[field];
    }
  }

  const result = await db.update(resumes)
    .set({ ...updateData, updatedAt: new Date() })
    .where(and(eq(resumes.id, id), eq(resumes.userId, user.id)))
    .returning();

  const updated = result[0];
  if (!updated) {
    return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Resume not found' } } satisfies ApiResponse<never>, { status: 404 });
  }

  return NextResponse.json({ success: true, data: updated } satisfies ApiResponse<Resume>);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } } satisfies ApiResponse<never>, { status: 401 });
  }

  const user = await getDbUser(clerkId);
  if (!user) {
    return NextResponse.json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'User not found' } } satisfies ApiResponse<never>, { status: 404 });
  }

  await db.delete(resumes).where(and(eq(resumes.id, id), eq(resumes.userId, user.id)));

  return NextResponse.json({ success: true, data: null } satisfies ApiResponse<null>);
}
