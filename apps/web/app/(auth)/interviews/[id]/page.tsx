import type { Metadata } from 'next';
import { auth } from '@clerk/nextjs/server';
import { redirect, notFound } from 'next/navigation';
import { db } from '@placeai/db/client';
import { users, interviewSessions } from '@placeai/db/schema';
import { eq, and } from 'drizzle-orm';
import { InterviewSummary } from '@/components/interviews/interview-summary';

export const metadata: Metadata = { title: 'Interview Results — PlaceAI', robots: { index: false } };

export default async function InterviewSessionPage({ params }: { params: { id: string } }) {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect('/sign-in');

  const user = await db.query.users.findFirst({ where: eq(users.clerkId, clerkId) });
  if (!user) redirect('/sign-in');

  const session = await db.query.interviewSessions.findFirst({
    where: and(eq(interviewSessions.id, params.id), eq(interviewSessions.userId, user.id)),
  });

  if (!session) notFound();

  return <InterviewSummary session={session} />;
}