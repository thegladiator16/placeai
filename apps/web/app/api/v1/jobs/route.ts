import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@placeai/db/client';
import { jobs } from '@placeai/db/schema';
import { eq, and, ilike, gte, lte, or, desc, sql } from 'drizzle-orm';
import { z } from 'zod';
import type { ApiResponse } from '@placeai/types';
import type { Job } from '@placeai/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const querySchema = z.object({
  q: z.string().optional(),
  company: z.string().optional(),
  workMode: z.enum(['hybrid', 'onsite', 'remote']).optional(),
  experienceMin: z.coerce.number().int().min(0).max(20).optional(),
  experienceMax: z.coerce.number().int().min(0).max(20).optional(),
  department: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export async function GET(req: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } } satisfies ApiResponse<never>, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const parsed = querySchema.safeParse(Object.fromEntries(searchParams));
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.message } } satisfies ApiResponse<never>, { status: 400 });
  }

  const { q, company, workMode, experienceMin, experienceMax, department, page, limit } = parsed.data;
  const offset = (page - 1) * limit;

  const conditions = [eq(jobs.isActive, true)];

  if (q) {
    conditions.push(or(
      ilike(jobs.title, `%${q}%`),
      ilike(jobs.description, `%${q}%`),
      ilike(jobs.companyName, `%${q}%`),
    ) as ReturnType<typeof eq>);
  }
  if (company) conditions.push(ilike(jobs.companyName, `%${company}%`));
  if (workMode) conditions.push(eq(jobs.workMode, workMode));
  if (department) conditions.push(ilike(jobs.department, `%${department}%`));
  if (experienceMin !== undefined) conditions.push(gte(jobs.experienceMin, experienceMin));
  if (experienceMax !== undefined) conditions.push(lte(jobs.experienceMax, experienceMax));

  const [results, countResult] = await Promise.all([
    db.query.jobs.findMany({
      where: and(...conditions),
      orderBy: [desc(jobs.postedAt)],
      limit,
      offset,
    }),
    db.select({ count: sql<number>`count(*)::int` }).from(jobs).where(and(...conditions)),
  ]);

  const total = countResult[0]?.count ?? 0;

  return NextResponse.json({
    success: true,
    data: { jobs: results, total, page, limit, totalPages: Math.ceil(total / limit) },
  } satisfies ApiResponse<{ jobs: Job[]; total: number; page: number; limit: number; totalPages: number }>);
}
