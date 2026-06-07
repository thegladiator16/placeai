import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@placeai/db/client';
import { users } from '@placeai/db/schema';
import { eq } from 'drizzle-orm';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL ?? 'http://localhost:8000';
const AI_SERVICE_SECRET = process.env.AI_SERVICE_SECRET ?? '';

export async function POST(req: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return new NextResponse('Unauthorized', { status: 401 });

  const user = await db.query.users.findFirst({ where: eq(users.clerkId, clerkId) });
  if (!user) return new NextResponse('Not found', { status: 404 });

  const body = await req.json() as { resumeId: string; personalInfo: unknown; experience: unknown };

  const aiRes = await fetch(`${AI_SERVICE_URL}/generate/summary`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Service-Secret': AI_SERVICE_SECRET },
    body: JSON.stringify({ ...body, user_tier: user.subscriptionTier }),
  });

  if (!aiRes.ok || !aiRes.body) {
    return new NextResponse('AI service error', { status: 502 });
  }

  return new NextResponse(aiRes.body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Transfer-Encoding': 'chunked' },
  });
}
