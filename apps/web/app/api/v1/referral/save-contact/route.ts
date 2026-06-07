import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@placeai/db/client';
import { users, referralContacts } from '@placeai/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import type { ApiResponse } from '@placeai/types';
import type { ReferralContact } from '@placeai/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const saveSchema = z.object({
  contactName: z.string().min(1).max(255),
  contactRole: z.string().max(255).optional(),
  contactLinkedinUrl: z.string().url().max(2048).optional(),
  contactCompany: z.string().max(500).optional(),
  collegeMatch: z.boolean().default(false),
  outreachMessage: z.string().max(5000).optional(),
});

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
  const parsed = saveSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.message } } satisfies ApiResponse<never>, { status: 400 });
  }

  const result = await db.insert(referralContacts).values({
    userId: user.id,
    contactName: parsed.data.contactName,
    contactRole: parsed.data.contactRole ?? null,
    contactLinkedinUrl: parsed.data.contactLinkedinUrl ?? null,
    contactCompany: parsed.data.contactCompany ?? null,
    collegeMatch: parsed.data.collegeMatch,
    outreachMessage: parsed.data.outreachMessage ?? null,
    messageSentAt: new Date(),
  }).returning();

  const created = result[0];
  if (!created) {
    return NextResponse.json({ success: false, error: { code: 'CREATE_FAILED', message: 'Failed to save contact' } } satisfies ApiResponse<never>, { status: 500 });
  }

  return NextResponse.json({ success: true, data: created } satisfies ApiResponse<ReferralContact>, { status: 201 });
}
