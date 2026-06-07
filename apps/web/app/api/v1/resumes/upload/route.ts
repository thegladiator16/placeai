import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@placeai/db/client';
import { users, resumes } from '@placeai/db/schema';
import { eq } from 'drizzle-orm';
import type { ApiResponse } from '@placeai/types';
import type { Resume, PersonalInfo, EducationEntry, ExperienceEntry, ProjectEntry } from '@placeai/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL ?? 'http://localhost:8000';
const AI_SERVICE_SECRET = process.env.AI_SERVICE_SECRET ?? '';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } } satisfies ApiResponse<never>, { status: 401 });
  }

  const user = await db.query.users.findFirst({ where: eq(users.clerkId, clerkId) });
  if (!user) {
    return NextResponse.json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'User not found' } } satisfies ApiResponse<never>, { status: 404 });
  }

  const formData = await req.formData();
  const file = formData.get('file');
  const title = (formData.get('title') as string | null) ?? 'Uploaded Resume';

  if (!(file instanceof File)) {
    return NextResponse.json({ success: false, error: { code: 'INVALID_FILE', message: 'No file provided' } } satisfies ApiResponse<never>, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ success: false, error: { code: 'FILE_TOO_LARGE', message: 'File must be under 5MB' } } satisfies ApiResponse<never>, { status: 400 });
  }

  const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ success: false, error: { code: 'INVALID_FILE_TYPE', message: 'Only PDF and DOCX files are supported' } } satisfies ApiResponse<never>, { status: 400 });
  }

  // Parse the resume via AI service
  const aiFormData = new FormData();
  aiFormData.append('file', file);

  const aiRes = await fetch(`${AI_SERVICE_URL}/resume/parse`, {
    method: 'POST',
    headers: { 'X-Service-Secret': AI_SERVICE_SECRET },
    body: aiFormData,
  });

  if (!aiRes.ok) {
    return NextResponse.json({ success: false, error: { code: 'PARSE_FAILED', message: 'Failed to parse resume' } } satisfies ApiResponse<never>, { status: 502 });
  }

  const parsed = await aiRes.json() as {
    raw_text: string;
    skills: string[];
    personal_info?: Record<string, unknown>;
    experience?: unknown[];
    education?: unknown[];
    projects?: unknown[];
  };

  const result = await db.insert(resumes).values({
    userId: user.id,
    title,
    rawText: parsed.raw_text,
    skills: { languages: parsed.skills },
    personalInfo: (parsed.personal_info ?? {}) as PersonalInfo,
    experience: (parsed.experience ?? []) as ExperienceEntry[],
    education: (parsed.education ?? []) as EducationEntry[],
    projects: (parsed.projects ?? []) as ProjectEntry[],
    isPrimary: false,
    version: 1,
  }).returning();

  const created = result[0];
  if (!created) {
    return NextResponse.json({ success: false, error: { code: 'CREATE_FAILED', message: 'Failed to save resume' } } satisfies ApiResponse<never>, { status: 500 });
  }

  return NextResponse.json({ success: true, data: created } satisfies ApiResponse<Resume>, { status: 201 });
}
