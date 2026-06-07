import { type NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import { db } from '@placeai/db/client';
import { users, subscriptions } from '@placeai/db/schema';
import { eq } from 'drizzle-orm';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  const signature = req.headers.get('x-razorpay-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  const body = await req.text();
  const expected = createHmac('sha256', webhookSecret).update(body).digest('hex');

  if (expected !== signature) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const event = JSON.parse(body) as {
    event: string;
    payload: {
      payment?: { entity: { id: string; order_id: string; notes?: Record<string, string> } };
      subscription?: { entity: { id: string; status: string; notes?: Record<string, string> } };
    };
  };

  if (event.event === 'payment.failed') {
    const payment = event.payload.payment?.entity;
    const userId = payment?.notes?.['userId'];
    if (userId) {
      await db.update(subscriptions)
        .set({ status: 'past_due', updatedAt: new Date() })
        .where(eq(subscriptions.userId, userId));
    }
  }

  if (event.event === 'subscription.cancelled') {
    const sub = event.payload.subscription?.entity;
    const userId = sub?.notes?.['userId'];
    if (userId) {
      await Promise.all([
        db.update(subscriptions)
          .set({ status: 'cancelled', cancelledAt: new Date(), updatedAt: new Date() })
          .where(eq(subscriptions.userId, userId)),
        db.update(users)
          .set({ subscriptionTier: 'free', subscriptionStatus: 'cancelled', updatedAt: new Date() })
          .where(eq(users.id, userId)),
      ]);
    }
  }

  return NextResponse.json({ ok: true });
}
