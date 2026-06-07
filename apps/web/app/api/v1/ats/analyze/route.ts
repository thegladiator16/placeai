import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@placeai/db/client';
import { users, resumes, atsAnalyses, featureUsage } from '@placeai/db/schema';
import { eq, and, gte } from 'drizzle-orm';
import { z } from 'zod';
import type { ApiResponse } from '@placeai/types';
import type { ATSAnalysis, KeywordMatch, ATSSuggestion } from '@placeai/db';
import { checkFeatureAccess } from '@/lib/payments/gate';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL ?? 'http://localhost:8000';
const AI_SERVICE_SECRET = process.env.AI_SERVICE_SECRET ?? '';

const analyzeSchema = z.object({
  resumeId: z.string().uuid(),
  jobDescription: z.string().min(50).max(10000),
  jobTitle: z.string().max(200).optional(),
  companyName: z.string().max(200).optional(),
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
  const parsed = analyzeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.message } } satisfies ApiResponse<never>, { status: 400 });
  }

  const { resumeId, jobDescription, jobTitle, companyName } = parsed.data;

  // Check feature access
  const access = await checkFeatureAccess(user.id, 'ats_analysis');
  if (!access.allowed) {
    return NextResponse.json({ success: false, error: { code: 'LIMIT_REACHED', message: access.reason ?? 'ATS analysis limit reached. Upgrade to continue.' } } satisfies ApiResponse<never>, { status: 429 });
  }

  // Verify resume ownership
  const resume = await db.query.resumes.findFirst({
    where: and(eq(resumes.id, resumeId), eq(resumes.userId, user.id)),
  });
  if (!resume) {
    return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Resume not found' } } satisfies ApiResponse<never>, { status: 404 });
  }

  if (!resume.rawText) {
    return NextResponse.json({ success: false, error: { code: 'NO_CONTENT', message: 'Resume has no text content to analyze' } } satisfies ApiResponse<never>, { status: 400 });
  }

  // Check for recent cached result (same resume + similar jd in the last 7 days)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const cached = await db.query.atsAnalyses.findFirst({
    where: and(
      eq(atsAnalyses.resumeId, resumeId),
      eq(atsAnalyses.userId, user.id),
      gte(atsAnalyses.createdAt, sevenDaysAgo),
      eq(atsAnalyses.jobDescriptionRaw, jobDescription.slice(0, 5000)),
    ),
  });

  if (cached) {
    return NextResponse.json({ success: true, data: { ...cached, cacheHit: true } } satisfies ApiResponse<ATSAnalysis>);
  }

  // Call AI service
  const start = Date.now();
  const aiRes = await fetch(`${AI_SERVICE_URL}/ats/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Service-Secret': AI_SERVICE_SECRET,
    },
    body: JSON.stringify({
      resume_text: resume.rawText,
      job_description: jobDescription,
      job_title: jobTitle,
      company_name: companyName,
      user_tier: user.subscriptionTier,
    }),
  });

  if (!aiRes.ok) {
    return NextResponse.json({ success: false, error: { code: 'AI_SERVICE_ERROR', message: 'Analysis service unavailable' } } satisfies ApiResponse<never>, { status: 502 });
  }

  const analysis = await aiRes.json() as {
    overall_score: number;
    keyword_score: number;
    format_score: number;
    experience_score: number;
    skills_score: number;
    matched_keywords: KeywordMatch[];
    missing_keywords: KeywordMatch[];
    suggestions: ATSSuggestion[];
    detected_ats?: string;
    ats_compatibility_notes?: string;
    tokens_used?: number;
    model_used?: string;
  };

  const processingTimeMs = Date.now() - start;

  // Save result + track usage in parallel
  const [savedResult] = await Promise.all([
    db.insert(atsAnalyses).values({
      userId: user.id,
      resumeId,
      jobDescriptionRaw: jobDescription.slice(0, 5000),
      jobTitle: jobTitle ?? null,
      companyName: companyName ?? null,
      overallScore: analysis.overall_score,
      keywordScore: analysis.keyword_score,
      formatScore: analysis.format_score,
      experienceScore: analysis.experience_score,
      skillsScore: analysis.skills_score,
      matchedKeywords: analysis.matched_keywords,
      missingKeywords: analysis.missing_keywords,
      suggestions: analysis.suggestions,
      detectedAts: analysis.detected_ats ?? null,
      atsCompatibilityNotes: analysis.ats_compatibility_notes ?? null,
      tokensUsed: analysis.tokens_used ?? null,
      modelUsed: analysis.model_used ?? null,
      processingTimeMs,
      cacheHit: false,
    }).returning(),
    db.insert(featureUsage).values({
      userId: user.id,
      feature: 'ats_analysis',
      tokensUsed: analysis.tokens_used ?? 0,
    }),
  ]);

  const result = savedResult[0];
  if (!result) {
    return NextResponse.json({ success: false, error: { code: 'SAVE_FAILED', message: 'Failed to save analysis' } } satisfies ApiResponse<never>, { status: 500 });
  }

  return NextResponse.json({ success: true, data: result } satisfies ApiResponse<ATSAnalysis>, { status: 201 });
}
