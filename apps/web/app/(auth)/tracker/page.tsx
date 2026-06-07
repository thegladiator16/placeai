import type { Metadata } from 'next';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { db } from '@placeai/db/client';
import { users, jobApplications } from '@placeai/db/schema';
import { eq, desc } from 'drizzle-orm';
import { KanbanBoard } from '@/components/tracker/kanban-board';

export const metadata: Metadata = {
  title: 'Job Tracker — PlaceAI',
  robots: { index: false },
};

export default async function TrackerPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect('/sign-in');

  const user = await db.query.users.findFirst({ where: eq(users.clerkId, clerkId) });
  if (!user) redirect('/sign-in');

  const applications = await db.query.jobApplications.findMany({
    where: eq(jobApplications.userId, user.id),
    orderBy: [desc(jobApplications.updatedAt)],
  });

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-foreground">Job Tracker</h1>
        <p className="text-muted-foreground mt-1">Drag cards between columns to update status</p>
      </div>
      <KanbanBoard initialApplications={applications} />
    </div>
  );
}
