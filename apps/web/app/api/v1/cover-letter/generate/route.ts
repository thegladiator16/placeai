import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@placeai/db/client';
import { users, resumes } from '@placeai/db/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';
import Anthropic from '@anthropic-ai/sdk';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const schema = z.object({
  jobTitle: z.string().min(1).max(200),
  companyName: z.string().min(1).max(200),
  jobDescription: z.string().max(5000).optional(),
  tone: z.enum(['professional', 'enthusiastic', 'concise']).default('professional'),
  resumeId: z.string().uuid().optional(),
});

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return new NextResponse('Unauthorized', { status: 401 });

  const user = await db.query.users.findFirst({ where: eq(users.clerkId, clerkId) });
  if (!user) return new NextResponse('User not found', { status: 404 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return new NextResponse(parsed.error.message, { status: 400 });

  const { jobTitle, companyName, jobDescription, tone, resumeId } = parsed.data;

  let resumeContext = '';
  if (resumeId) {
    const resume = await db.query.resumes.findFirst({
      where: and(eq(resumes.id, resumeId), eq(resumes.userId, user.id)),
    });
    if (resume) {
      const exp = (resume.experience as Array<{ company: string; role: string; bullets?: string[] }> | null) ?? [];
      const skills = Object.values(resume.skills as Record<string, string[]> | null ?? {}).flat();
      resumeContext = `\nCandidate experience: ${exp.map((e) => `${e.role} at ${e.company}`).join(', ')}\nKey skills: ${skills.slice(0, 10).join(', ')}`;
    }
  }

  const toneGuide = tone === 'enthusiastic' ? 'energetic, passionate, excited about the company'
    : tone === 'concise' ? 'brief, direct, punchy — under 200 words'
    : 'professional, warm, confident';

  const prompt = `Write a cover letter for ${user.fullName ?? 'the candidate'} applying to ${jobTitle} at ${companyName}.

Tone: ${toneGuide}
${resumeContext}
${jobDescription ? `Job description context: ${jobDescription.slice(0, 1000)}` : ''}

Guidelines:
- 3-4 paragraphs, no boilerplate opener like "I am writing to apply"
- Open with a compelling hook that mentions ${companyName} specifically
- Middle: connect candidate's experience to the role
- Close: confident call to action
- Do NOT include date, address headers, or signature lines — just the body paragraphs

Write the cover letter now:`;

  let stream;
  try {
    stream = anthropic.messages.stream({
      model: 'claude-haiku-4-5',
      max_tokens: 800,
      messages: [{ role: 'user', content: prompt }],
    });
  } catch (err) {
    return NextResponse.json({
      success: false,
      error: {
        code: 'AI_SERVICE_ERROR',
        message: err instanceof Error ? err.message : 'AI service unavailable',
      },
    }, { status: 502 });
  }

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
            controller.enqueue(encoder.encode(chunk.delta.text));
          }
        }
        controller.close();
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'AI stream failed';
        controller.enqueue(encoder.encode(`\n\n[ERROR] ${msg}`));
        controller.close();
      }
    },
  });

  return new NextResponse(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Transfer-Encoding': 'chunked' },
  });
}
