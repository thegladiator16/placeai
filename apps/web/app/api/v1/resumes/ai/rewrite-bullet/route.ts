import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@placeai/db/client';
import { users } from '@placeai/db/schema';
import { eq } from 'drizzle-orm';
import type { ApiResponse } from '@placeai/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL ?? 'http://localhost:8000';
const AI_SERVICE_SECRET = process.env.AI_SERVICE_SECRET ?? '';

export async function POST(req: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } } satisfies ApiResponse<never>, { status: 401 });
  }

  const user = await db.query.users.findFirst({ where: eq(users.clerkId, clerkId) });
  if (!user) {
    return NextResponse.json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'User not found' } } satisfies ApiResponse<never>, { status: 404 });
  }

  const body = await req.json() as { bullet: string; jobTitle: string; company: string };

  const aiRes = await fetch(`${AI_SERVICE_URL}/generate/rewrite-bullet`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Service-Secret': AI_SERVICE_SECRET },
    body: JSON.stringify({ ...body, user_tier: user.subscriptionTier }),
  });

  if (!aiRes.ok) {
    return NextResponse.json({ success: false, error: { code: 'AI_SERVICE_ERROR', message: 'Rewrite failed' } } satisfies ApiResponse<never>, { status: 502 });
  }

  const result = await aiRes.json() as { rewritten: string };
  return NextResponse.json({ success: true, data: result } satisfies ApiResponse<{ rewritten: string }>);
}
