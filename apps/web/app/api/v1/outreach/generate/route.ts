import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@placeai/db/client';
import { users } from '@placeai/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import Anthropic from '@anthropic-ai/sdk';
import type { ApiResponse } from '@placeai/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const schema = z.object({
  recruiterName: z.string().max(200).optional(),
  recruiterTitle: z.string().max(200).optional(),
  companyName: z.string().min(1).max(200),
  jobTitle: z.string().min(1).max(200),
  channel: z.enum(['linkedin', 'email']).default('linkedin'),
});

type OutreachSequence = {
  step1: string;
  step2: string;
  step3: string;
};

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

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
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.message } } satisfies ApiResponse<never>, { status: 400 });
  }

  const { recruiterName, recruiterTitle, companyName, jobTitle, channel } = parsed.data;
  const senderName = user.fullName ?? 'the candidate';

  const prompt = `Generate a 3-step ${channel === 'linkedin' ? 'LinkedIn' : 'email'} outreach sequence for ${senderName} to reach out to ${recruiterName ? `${recruiterName} (${recruiterTitle ?? 'Recruiter'})` : 'a recruiter'} at ${companyName} about the ${jobTitle} role.

Return a JSON object with exactly these keys:
- "step1": First outreach message. ${channel === 'linkedin' ? 'LinkedIn connection note under 300 chars.' : 'Cold email with subject line, under 150 words.'} Warm, specific, not generic.
- "step2": Follow-up sent 4-5 days later if no response. Shorter, adds value or new angle. Under 100 words.
- "step3": Final follow-up, 7 days after step 2. Very brief, closes the loop gracefully. Under 60 words.

Make them sound human, not templated. Reference ${companyName} specifically.`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content[0]?.type === 'text' ? response.content[0].text : '';
    let sequence: OutreachSequence;
    try {
      const match = text.match(/\{[\s\S]*\}/);
      sequence = match ? JSON.parse(match[0]) as OutreachSequence : { step1: text.slice(0, 300), step2: text.slice(300, 500), step3: text.slice(500, 700) };
    } catch {
      sequence = { step1: text.slice(0, 300), step2: 'Following up on my previous message — still very interested in the role!', step3: 'Happy to connect when the timing is right. Thanks!' };
    }

    return NextResponse.json({ success: true, data: sequence } satisfies ApiResponse<OutreachSequence>);
  } catch (err) {
    return NextResponse.json({
      success: false,
      error: {
        code: 'AI_SERVICE_ERROR',
        message: err instanceof Error ? err.message : 'AI service unavailable',
      },
    }, { status: 502 });
  }
}
