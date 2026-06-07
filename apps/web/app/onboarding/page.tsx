import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { db } from '@placeai/db/client';
import { users } from '@placeai/db/schema';
import { eq } from 'drizzle-orm';
import { OnboardingWizard } from '@/components/onboarding/onboarding-wizard';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Welcome to PlaceAI', robots: { index: false } };

export default async function OnboardingPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect('/sign-in');

  const user = await db.query.users.findFirst({ where: eq(users.clerkId, clerkId) });
  if (!user) redirect('/sign-in');
  if (user.onboardingCompleted) redirect('/dashboard');

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <OnboardingWizard initialName={user.fullName ?? ''} initialEmail={user.email} />
    </div>
  );
}
