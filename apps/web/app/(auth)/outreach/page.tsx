import type { Metadata } from 'next';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { db } from '@placeai/db/client';
import { users } from '@placeai/db/schema';
import { eq } from 'drizzle-orm';
import { OutreachBuilder } from '@/components/outreach/outreach-builder';

export const metadata: Metadata = { title: 'Recruiter Outreach — PlaceAI', robots: { index: false } };

export default async function OutreachPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect('/sign-in');

  const user = await db.query.users.findFirst({ where: eq(users.clerkId, clerkId) });
  if (!user) redirect('/sign-in');

  return <OutreachBuilder userName={user.fullName ?? ''} />;
}
