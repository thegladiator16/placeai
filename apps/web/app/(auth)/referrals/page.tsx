import type { Metadata } from 'next';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { db } from '@placeai/db/client';
import { users, referralContacts } from '@placeai/db/schema';
import { eq, desc } from 'drizzle-orm';
import { ReferralDiscovery } from '@/components/referral/referral-discovery';

export const metadata: Metadata = { title: 'Referral Discovery — PlaceAI', robots: { index: false } };

export default async function ReferralsPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect('/sign-in');

  const user = await db.query.users.findFirst({ where: eq(users.clerkId, clerkId) });
  if (!user) redirect('/sign-in');

  const savedContacts = await db.query.referralContacts.findMany({
    where: eq(referralContacts.userId, user.id),
    orderBy: [desc(referralContacts.createdAt)],
    limit: 20,
  });

  return <ReferralDiscovery userCollege={user.collegeName ?? ''} userGradYear={user.graduationYear ?? null} savedContacts={savedContacts} />;
}
