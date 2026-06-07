import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@placeai/db/client';
import { users, jobApplications } from '@placeai/db/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';
import type { ApiResponse } from '@placeai/types';
import type { JobApplication } from '@placeai/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const updateSchema = z.object({
  companyName: z.string().max(500).optional(),
  jobTitle: z.string().max(500).optional(),
  jobUrl: z.string().url().max(2048).optional().nullable(),
  status: z.enum(['saved', 'applied', 'screening', 'interview', 'offer', 'rejected', 'ghosted']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  notes: z.string().max(5000).optional().nullable(),
  salaryExpectation: z.number().int().positive().optional().nullable(),
  nextAction: z.string().max(500).optional().nullable(),
  followUpDate: z.string().optional().nullable(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } } satisfies ApiResponse<never>, { status: 401 });
  }

  const user = await db.query.users.findFirst({ where: eq(users.clerkId, clerkId) });
  if (!user) {
    return NextResponse.json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'User not found' } } satisfies ApiResponse<never>, { status: 404 });
  }

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.message } } satisfies ApiResponse<never>, { status: 400 });
  }

  const updateData: Record<string, unknown> = { ...parsed.data, updatedAt: new Date(), statusChangedAt: new Date() };
  if (parsed.data.status === 'applied') {
    updateData['appliedAt'] = new Date();
  }

  const result = await db.update(jobApplications)
    .set(updateData)
    .where(and(eq(jobApplications.id, id), eq(jobApplications.userId, user.id)))
    .returning();

  const updated = result[0];
  if (!updated) {
    return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Application not found' } } satisfies ApiResponse<never>, { status: 404 });
  }

  return NextResponse.json({ success: true, data: updated } satisfies ApiResponse<JobApplication>);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } } satisfies ApiResponse<never>, { status: 401 });
  }

  const user = await db.query.users.findFirst({ where: eq(users.clerkId, clerkId) });
  if (!user) {
    return NextResponse.json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'User not found' } } satisfies ApiResponse<never>, { status: 404 });
  }

  await db.delete(jobApplications)
    .where(and(eq(jobApplications.id, id), eq(jobApplications.userId, user.id)));

  return NextResponse.json({ success: true, data: null } satisfies ApiResponse<null>);
}
