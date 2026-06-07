import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@placeai/db/client';
import { users, interviewSessions, featureUsage } from '@placeai/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import type { ApiResponse } from '@placeai/types';
import type { InterviewSession } from '@placeai/db';
import { checkFeatureAccess } from '@/lib/payments/gate';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL ?? 'http://localhost:8000';
const AI_SERVICE_SECRET = process.env.AI_SERVICE_SECRET ?? '';

const startSchema = z.object({
  sessionType: z.enum(['behavioral', 'technical', 'mixed', 'hr']),
  companyName: z.string().max(200).optional(),
  roleName: z.string().max(200).optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  questionCount: z.number().int().min(3).max(15).default(7),
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

  const access = await checkFeatureAccess(user.id, 'interview_question_gen');
  if (!access.allowed) {
    return NextResponse.json({ success: false, error: { code: 'LIMIT_REACHED', message: access.reason ?? 'Interview session limit reached' } } satisfies ApiResponse<never>, { status: 429 });
  }

  const body = await req.json();
  const parsed = startSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.message } } satisfies ApiResponse<never>, { status: 400 });
  }

  const aiRes = await fetch(`${AI_SERVICE_URL}/generate/interview-questions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Service-Secret': AI_SERVICE_SECRET },
    body: JSON.stringify({
      session_type: parsed.data.sessionType,
      company_name: parsed.data.companyName,
      role_name: parsed.data.roleName,
      difficulty: parsed.data.difficulty,
      question_count: parsed.data.questionCount,
      user_tier: user.subscriptionTier,
    }),
  });

  if (!aiRes.ok) {
    return NextResponse.json({ success: false, error: { code: 'AI_SERVICE_ERROR', message: 'Interview service unavailable' } } satisfies ApiResponse<never>, { status: 502 });
  }

  const generated = await aiRes.json() as { questions: InterviewSession['questions']; tokens_used?: number };

  const [session] = await Promise.all([
    db.insert(interviewSessions).values({
      userId: user.id,
      sessionType: parsed.data.sessionType,
      companyName: parsed.data.companyName ?? null,
      roleName: parsed.data.roleName ?? null,
      difficulty: parsed.data.difficulty,
      questions: generated.questions,
      totalQuestions: generated.questions.length,
      tokensUsed: generated.tokens_used ?? null,
    }).returning(),
    db.insert(featureUsage).values({
      userId: user.id,
      feature: 'interview_question_gen',
      tokensUsed: generated.tokens_used ?? 0,
    }),
  ]);

  const result = session[0];
  if (!result) {
    return NextResponse.json({ success: false, error: { code: 'CREATE_FAILED', message: 'Failed to create session' } } satisfies ApiResponse<never>, { status: 500 });
  }

  return NextResponse.json({ success: true, data: result } satisfies ApiResponse<InterviewSession>, { status: 201 });
}
