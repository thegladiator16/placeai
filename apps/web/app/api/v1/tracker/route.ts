import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@placeai/db/client';
import { users, jobApplications } from '@placeai/db/schema';
import { eq, desc } from 'drizzle-orm';
import { z } from 'zod';
import type { ApiResponse } from '@placeai/types';
import type { JobApplication } from '@placeai/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const createSchema = z.object({
  companyName: z.string().max(500).optional(),
  jobTitle: z.string().max(500).optional(),
  jobUrl: z.string().url().max(2048).optional(),
  status: z.enum(['saved', 'applied', 'screening', 'interview', 'offer', 'rejected', 'ghosted']).default('saved'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  notes: z.string().max(5000).optional(),
  salaryExpectation: z.number().int().positive().optional(),
  jobId: z.string().uuid().optional(),
});

export async function GET(_req: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } } satisfies ApiResponse<never>, { status: 401 });
  }

  const user = await db.query.users.findFirst({ where: eq(users.clerkId, clerkId) });
  if (!user) {
    return NextResponse.json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'User not found' } } satisfies ApiResponse<never>, { status: 404 });
  }

  const applications = await db.query.jobApplications.findMany({
    where: eq(jobApplications.userId, user.id),
    orderBy: [desc(jobApplications.updatedAt)],
  });

  return NextResponse.json({ success: true, data: applications } satisfies ApiResponse<JobApplication[]>);
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
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.message } } satisfies ApiResponse<never>, { status: 400 });
  }

  const result = await db.insert(jobApplications).values({
    userId: user.id,
    status: parsed.data.status,
    priority: parsed.data.priority,
    companyName: parsed.data.companyName ?? null,
    jobTitle: parsed.data.jobTitle ?? null,
    jobUrl: parsed.data.jobUrl ?? null,
    notes: parsed.data.notes ?? null,
    salaryExpectation: parsed.data.salaryExpectation ?? null,
    jobId: parsed.data.jobId ?? null,
    appliedAt: parsed.data.status === 'applied' ? new Date() : null,
  }).returning();

  const created = result[0];
  if (!created) {
    return NextResponse.json({ success: false, error: { code: 'CREATE_FAILED', message: 'Failed to create application' } } satisfies ApiResponse<never>, { status: 500 });
  }

  return NextResponse.json({ success: true, data: created } satisfies ApiResponse<JobApplication>, { status: 201 });
}
