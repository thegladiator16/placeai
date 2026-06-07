import type { Metadata } from 'next';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { db } from '@placeai/db/client';
import { users, resumes } from '@placeai/db/schema';
import { eq } from 'drizzle-orm';
import { CoverLetterGenerator } from '@/components/cover-letter/cover-letter-generator';

export const metadata: Metadata = { title: 'Cover Letter — PlaceAI', robots: { index: false } };

export default async function CoverLetterPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect('/sign-in');

  const user = await db.query.users.findFirst({ where: eq(users.clerkId, clerkId) });
  if (!user) redirect('/sign-in');

  const userResumes = await db.query.resumes.findMany({
    where: eq(resumes.userId, user.id),
    columns: { id: true, title: true },
  });

  return <CoverLetterGenerator resumes={userResumes} />;
}
