import { auth } from '@clerk/nextjs/server';
import { redirect, notFound } from 'next/navigation';
import { db } from '@placeai/db/client';
import { users, resumes, atsAnalyses } from '@placeai/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import type { Metadata } from 'next';
import { AtsResultsPage } from '@/components/ats/ats-results-page';

export const metadata: Metadata = { title: 'ATS Analysis — PlaceAI', robots: { index: false } };

export default async function ResumeAtsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect('/sign-in');

  const user = await db.query.users.findFirst({ where: eq(users.clerkId, clerkId) });
  if (!user) redirect('/sign-in');

  const resume = await db.query.resumes.findFirst({
    where: and(eq(resumes.id, id), eq(resumes.userId, user.id)),
  });
  if (!resume) notFound();

  // Get the most recent analysis for this resume
  const latestAnalysis = await db.query.atsAnalyses.findFirst({
    where: and(eq(atsAnalyses.resumeId, id), eq(atsAnalyses.userId, user.id)),
    orderBy: [desc(atsAnalyses.createdAt)],
  });

  return <AtsResultsPage resume={resume} initialAnalysis={latestAnalysis ?? null} />;
}
