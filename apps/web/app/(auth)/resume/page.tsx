import type { Metadata } from 'next';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { db } from '@placeai/db/client';
import { users, resumes } from '@placeai/db/schema';
import { eq, desc } from 'drizzle-orm';
import { ResumeDashboard } from '@/components/resume/resume-dashboard';

export const metadata: Metadata = {
  title: 'Resume — PlaceAI',
  robots: { index: false },
};

export default async function ResumePage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect('/sign-in');

  const user = await db.query.users.findFirst({ where: eq(users.clerkId, clerkId) });
  if (!user) redirect('/sign-in');

  const userResumes = await db.query.resumes.findMany({
    where: eq(resumes.userId, user.id),
    orderBy: [desc(resumes.updatedAt)],
  });

  return <ResumeDashboard initialResumes={userResumes} />;
}
