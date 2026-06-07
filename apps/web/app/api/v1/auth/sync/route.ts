import { type NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { db } from '@placeai/db/client';
import { users } from '@placeai/db/schema';
import { eq } from 'drizzle-orm';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type ClerkUserCreatedEvent = {
  type: 'user.created' | 'user.updated';
  data: {
    id: string;
    email_addresses: Array<{ email_address: string; id: string }>;
    first_name?: string;
    last_name?: string;
    image_url?: string;
    phone_numbers?: Array<{ phone_number: string }>;
  };
};

function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  const svixId = req.headers.get('svix-id');
  const svixTimestamp = req.headers.get('svix-timestamp');
  const svixSignature = req.headers.get('svix-signature');

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: 'Missing svix headers' }, { status: 400 });
  }

  const body = await req.text();
  const wh = new Webhook(webhookSecret);

  let event: ClerkUserCreatedEvent;
  try {
    event = wh.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as ClerkUserCreatedEvent;
  } catch {
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
  }

  const { type, data } = event;

  if (type === 'user.created') {
    const primaryEmail = data.email_addresses[0]?.email_address;
    if (!primaryEmail) {
      return NextResponse.json({ error: 'No email found' }, { status: 400 });
    }

    const fullName = [data.first_name, data.last_name].filter(Boolean).join(' ') || null;

    await db
      .insert(users)
      .values({
        clerkId: data.id,
        email: primaryEmail,
        fullName,
        avatarUrl: data.image_url ?? null,
        phone: data.phone_numbers?.[0]?.phone_number ?? null,
        referralCode: generateReferralCode(),
      })
      .onConflictDoNothing();
  } else if (type === 'user.updated') {
    const primaryEmail = data.email_addresses[0]?.email_address;
    if (!primaryEmail) return NextResponse.json({ ok: true });

    const fullName = [data.first_name, data.last_name].filter(Boolean).join(' ') || null;

    await db
      .update(users)
      .set({
        email: primaryEmail,
        fullName,
        avatarUrl: data.image_url ?? null,
        updatedAt: new Date(),
      })
      .where(eq(users.clerkId, data.id));
  }

  return NextResponse.json({ ok: true });
}
