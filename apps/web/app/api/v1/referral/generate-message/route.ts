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

const messageSchema = z.object({
  contactName: z.string().max(200),
  contactRole: z.string().max(200),
  contactCompany: z.string().max(200),
  targetJobTitle: z.string().max(200).optional(),
  sameCollege: z.boolean().default(false),
  userCollege: z.string().max(300).optional(),
  graduationYear: z.number().int().optional(),
  channel: z.enum(['linkedin_dm', 'email']).default('linkedin_dm'),
});

type GeneratedMessages = {
  connectionRequest: string;
  followUp: string;
  emailVersion: string;
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
  const parsed = messageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.message } } satisfies ApiResponse<never>, { status: 400 });
  }

  const d = parsed.data;
  const senderName = user.fullName ?? 'A student';
  const senderCollege = user.collegeName ?? d.userCollege ?? 'college';
  const senderGradYear = user.graduationYear ?? d.graduationYear;

  const collegeContext = d.sameCollege
    ? `Both the sender and ${d.contactName} attended ${senderCollege}${senderGradYear ? ` (graduated ${senderGradYear})` : ''}.`
    : `The sender studied at ${senderCollege}.`;

  const prompt = `Generate referral outreach messages from ${senderName} to ${d.contactName}, who is a ${d.contactRole} at ${d.contactCompany}.
${collegeContext}
${d.targetJobTitle ? `The sender is interested in the ${d.targetJobTitle} role at ${d.contactCompany}.` : ''}
The sender is an Indian engineering student/professional actively job searching.

Return a JSON object with exactly these three keys:
- "connectionRequest": A LinkedIn connection request note under 300 characters. Warm, genuine, mentions the college connection if applicable.
- "followUp": A follow-up DM to send 3 days after connecting, under 500 characters. Specific ask for a referral or 15-minute chat.
- "emailVersion": A cold email version, 150-200 words. Professional subject line included at the top as "Subject: [subject here]\\n\\n[email body]".

Make messages sound natural and not templated. Reference specific details. Be respectful of their time.`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content[0]?.type === 'text' ? response.content[0].text : '';

    let messages: GeneratedMessages;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      messages = jsonMatch ? JSON.parse(jsonMatch[0]) as GeneratedMessages : {
        connectionRequest: `Hi ${d.contactName.split(' ')[0]}, ${d.sameCollege ? `fellow ${senderCollege} alum here!` : 'I came across your profile.'} I'm exploring opportunities at ${d.contactCompany} and would love to connect.`,
        followUp: `Thanks for connecting! I'm actively looking at ${d.contactCompany} for ${d.targetJobTitle ?? 'engineering roles'}. Would you be open to a quick 15-min chat? Your experience there would be super valuable.`,
        emailVersion: `Subject: ${senderCollege} Alum — Interested in ${d.contactCompany}\n\nHi ${d.contactName.split(' ')[0]},\n\nI hope this email finds you well. I'm ${senderName}${senderCollege ? `, a ${senderCollege} graduate` : ''}. I came across your profile and noticed your work at ${d.contactCompany}.\n\nI'm currently exploring ${d.targetJobTitle ?? 'software engineering'} opportunities and would love to learn about your experience there.\n\nWould you be open to a 15-minute call? I'd really appreciate any insights.\n\nBest regards,\n${senderName}`,
      };
    } catch {
      messages = {
        connectionRequest: text.slice(0, 300),
        followUp: text.slice(0, 500),
        emailVersion: text,
      };
    }

    return NextResponse.json({ success: true, data: messages } satisfies ApiResponse<GeneratedMessages>);
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
