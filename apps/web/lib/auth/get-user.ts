import { auth } from '@clerk/nextjs/server';
import { db } from '@placeai/db/client';
import { users } from '@placeai/db/schema';
import { eq } from 'drizzle-orm';
import type { User } from '@placeai/db';

type AuthUser = User;

export async function getAuthUser(): Promise<AuthUser | null> {
  const { userId: clerkId } = await auth();
  if (!clerkId) return null;

  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, clerkId),
  });

  return user ?? null;
}

export async function requireAuthUser(): Promise<AuthUser> {
  const user = await getAuthUser();
  if (!user) throw new Error('UNAUTHORIZED');
  return user;
}
