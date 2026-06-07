import type { Metadata } from 'next';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { db } from '@placeai/db/client';
import { users } from '@placeai/db/schema';
import { eq } from 'drizzle-orm';
import { JobBoard } from '@/components/jobs/job-board';

export const metadata: Metadata = { title: 'Job Board — PlaceAI', robots: { index: false } };

export default async function JobsPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect('/sign-in');

  const user = await db.query.users.findFirst({ where: eq(users.clerkId, clerkId) });
  if (!user) redirect('/sign-in');

  return <JobBoard userExp={user.yearsOfExperience ?? 0} />;
}
