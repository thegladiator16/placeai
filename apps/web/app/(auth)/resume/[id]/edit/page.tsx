import { auth } from '@clerk/nextjs/server';
import { redirect, notFound } from 'next/navigation';
import { db } from '@placeai/db/client';
import { users, resumes } from '@placeai/db/schema';
import { eq, and } from 'drizzle-orm';
import { ResumeEditorShell } from '@/components/resume/editor/resume-editor-shell';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Resume Editor — PlaceAI', robots: { index: false } };

export default async function ResumeEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect('/sign-in');

  const user = await db.query.users.findFirst({ where: eq(users.clerkId, clerkId) });
  if (!user) redirect('/sign-in');

  const resume = await db.query.resumes.findFirst({
    where: and(eq(resumes.id, id), eq(resumes.userId, user.id)),
  });
  if (!resume) notFound();

  return <ResumeEditorShell resume={resume} />;
}
