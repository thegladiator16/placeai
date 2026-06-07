import type { Metadata } from 'next';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { db } from '@placeai/db/client';
import { users, resumes, atsAnalyses, jobApplications, interviewSessions } from '@placeai/db/schema';
import { eq, count } from 'drizzle-orm';
import { DashboardHome } from '@/components/layout/dashboard-home';

export const metadata: Metadata = { title: 'Dashboard — PlaceAI', robots: { index: false } };

export default async function DashboardPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect('/sign-in');

  const user = await db.query.users.findFirst({ where: eq(users.clerkId, clerkId) });
  if (!user) redirect('/sign-in');
  if (!user.onboardingCompleted) redirect('/onboarding');

  const [resumeCount, analysisCount, applicationCount, interviewCount] = await Promise.all([
    db.select({ count: count() }).from(resumes).where(eq(resumes.userId, user.id)),
    db.select({ count: count() }).from(atsAnalyses).where(eq(atsAnalyses.userId, user.id)),
    db.select({ count: count() }).from(jobApplications).where(eq(jobApplications.userId, user.id)),
    db.select({ count: count() }).from(interviewSessions).where(eq(interviewSessions.userId, user.id)),
  ]);

  const stats = {
    resumes: resumeCount[0]?.count ?? 0,
    analyses: analysisCount[0]?.count ?? 0,
    applications: applicationCount[0]?.count ?? 0,
    interviews: interviewCount[0]?.count ?? 0,
  };

  return <DashboardHome user={user} stats={stats} />;
}
